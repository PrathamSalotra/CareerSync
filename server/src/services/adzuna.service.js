import config from '../config/index.js';
import { AppError } from '../utils/errors.js';

/**
 * Fetches up to 50 jobs from the Adzuna API.
 * 
 * @param {string} query - The search query (e.g. "Software Engineer").
 * @param {string} country - The ISO 3166-1 alpha-2 country code (e.g. "us", "gb").
 * @param {string} [cityOrState] - Optional location string (e.g. "San Francisco, CA").
 * @returns {Promise<Array>} - Resolves to an array of raw Adzuna job objects.
 */
export const fetchJobs = async (query, country, cityOrState) => {
  if (!config.ADZUNA_APP_ID || !config.ADZUNA_APP_KEY) {
    throw new AppError(500, 'SERVER_ERROR', 'Adzuna API credentials are not configured.');
  }

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.append('app_id', config.ADZUNA_APP_ID);
  url.searchParams.append('app_key', config.ADZUNA_APP_KEY);
  url.searchParams.append('results_per_page', '50');
  
  if (query) {
    url.searchParams.append('what', query);
  }
  
  if (cityOrState) {
    url.searchParams.append('where', cityOrState);
  }

  // Sort by date descending (optional, Adzuna defaults to relevance usually, but let's stick to default for better matching)
  // url.searchParams.append('sort_by', 'date');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Adzuna API Error [${response.status}]:`, errorText);
      throw new AppError(502, 'ADZUNA_API_ERROR', 'Failed to retrieve jobs from the external provider.');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Network error calling Adzuna API:', error);
    throw new AppError(502, 'ADZUNA_API_ERROR', 'Failed to connect to the jobs provider.');
  }
};

/**
 * Normalizes raw Adzuna jobs, deduplicates them, and extracts work arrangement.
 * 
 * @param {Array} rawJobs - The raw results array from Adzuna.
 * @param {string} [workArrangementFilter] - Optional filter ('remote', 'onsite', 'hybrid').
 * @returns {Array} - An array of normalized Job objects.
 */
export const normalizeAndFilterJobs = (rawJobs, workArrangementFilter) => {
  if (!Array.isArray(rawJobs) || rawJobs.length === 0) {
    return [];
  }

  const normalizedJobs = [];
  const seenJobIds = new Set();

  for (const raw of rawJobs) {
    // 1. Deduplicate by Adzuna ID
    const jobId = String(raw.id);
    if (seenJobIds.has(jobId)) {
      continue;
    }
    seenJobIds.add(jobId);

    // 2. Extract standard fields
    const title = raw.title || 'Unknown Title';
    const company = raw.company?.display_name || 'Unknown Company';
    const location = raw.location?.display_name || 'Unknown Location';
    const description = raw.description || '';
    const url = raw.redirect_url || '';
    const salaryMin = raw.salary_min || null;
    const salaryMax = raw.salary_max || null;
    const created = raw.created || new Date().toISOString();

    // 3. Detect Work Arrangement natively via Regex on Title + Description
    let workArrangement = 'not specified';
    const combinedText = `${title} ${description}`.toLowerCase();
    
    // Simple priority detection: hybrid > remote > onsite
    // Note: Adzuna does not have a native "remote" flag we can rely on globally across all countries, so text detection is required.
    if (/\b(hybrid)\b/i.test(combinedText)) {
      workArrangement = 'hybrid';
    } else if (/\b(remote|work from home|wfh|telecommute)\b/i.test(combinedText)) {
      workArrangement = 'remote';
    } else if (/\b(on-site|onsite|in-office|in office)\b/i.test(combinedText)) {
      workArrangement = 'onsite';
    }

    // 4. Apply optional user filter
    if (workArrangementFilter && workArrangementFilter !== workArrangement) {
      continue;
    }

    normalizedJobs.push({
      jobId,
      title,
      company,
      location,
      description,
      url,
      salaryMin,
      salaryMax,
      created,
      workArrangement,
    });
  }

  return normalizedJobs;
};

export default {
  fetchJobs,
  normalizeAndFilterJobs,
};
