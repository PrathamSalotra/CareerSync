/**
 * Central API client wrapper for CareerSync
 */

// Helper to extract cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Formats error from the standard { error: { code, message } } envelope
class ApiError extends Error {
  constructor(status, errorData) {
    super(errorData?.message || 'An unexpected error occurred');
    this.status = status;
    this.code = errorData?.code || 'UNKNOWN_ERROR';
    this.details = errorData;
  }
}

// Global flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (success) => {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
};

/**
 * Base fetch client with CSRF, timeouts, error mapping, and 401 retries
 */
export const apiClient = async (endpoint, options = {}) => {
  const { method = 'GET', headers = {}, body, ...customOptions } = options;

  // 1. Enforce timeout logic: 90s for search/upload, 20s for others
  const isLongRequest = endpoint.startsWith('/api/search') || endpoint.startsWith('/api/resumes');
  const timeoutMs = isLongRequest ? 90000 : 20000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions = {
    method,
    headers: {
      ...headers,
    },
    signal: controller.signal,
    ...customOptions,
  };

  // 2. Attach X-CSRF-Token on mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    const csrfToken = getCookie('cs_csrf');
    if (csrfToken) {
      fetchOptions.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Auto stringify JSON bodies if not FormData
  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }
  }

  try {
    let response = await fetch(endpoint, fetchOptions);

    // 3. Catch 401s and attempt silent refresh once
    if (response.status === 401 && endpoint !== '/api/auth/refresh') {
      // If a refresh is already in progress, wait for it
      if (isRefreshing) {
        const refreshResult = await new Promise((resolve) => {
          subscribeTokenRefresh(resolve);
        });
        
        if (refreshResult) {
          // Retry original request if refresh succeeded
          response = await fetch(endpoint, fetchOptions);
        }
      } else {
        isRefreshing = true;
        try {
          // Attempt silent refresh
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCookie('cs_csrf') || '', // Need CSRF for POST
            }
          });

          if (refreshRes.ok) {
            isRefreshing = false;
            onRefreshed(true);
            
            // Re-fetch original request (re-read CSRF in case it updated)
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
               fetchOptions.headers['X-CSRF-Token'] = getCookie('cs_csrf');
            }
            response = await fetch(endpoint, fetchOptions);
          } else {
            isRefreshing = false;
            onRefreshed(false);
          }
        } catch (refreshErr) {
          isRefreshing = false;
          onRefreshed(false);
        }
      }
    }

    // 4. Map errors from standard error envelope
    if (!response.ok) {
      let errorData = null;
      try {
        const json = await response.json();
        errorData = json.error;
      } catch (e) {
        errorData = { code: 'HTTP_ERROR', message: `HTTP Error ${response.status}` };
      }
      throw new ApiError(response.status, errorData);
    }

    // Return 204 No Content as null
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError(408, { code: 'TIMEOUT', message: 'Request timed out' });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
