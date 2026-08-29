import config from '../config/index.js';

export const getCookieOptions = (customOptions = {}) => {
  return {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    ...customOptions,
  };
};

export const setAuthCookies = (res, { accessToken, refreshToken, csrfToken }) => {
  const isSecure = config.COOKIE_SECURE;

  if (accessToken) {
    res.cookie('cs_access', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  if (refreshToken) {
    res.cookie('cs_refresh', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  if (csrfToken) {
    res.cookie('cs_csrf', csrfToken, {
      httpOnly: false, // Client JavaScript reads cs_csrf to send X-CSRF-Token header
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

export const clearAuthCookies = (res) => {
  const options = {
    path: '/',
  };
  res.clearCookie('cs_access', options);
  res.clearCookie('cs_refresh', options);
  res.clearCookie('cs_csrf', options);
};

export default {
  getCookieOptions,
  setAuthCookies,
  clearAuthCookies,
};
