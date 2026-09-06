/**
 * Deterministic Scoring Engine
 * Spec references: technical-specification.md §8
 */

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/**
 * Calculates the union of all dated employment intervals to find total relevant years.
 * Internships, apprenticeships, freelance work count.
 * Roles without valid dates add zero years.
 */
export const calculateTotalRelevantYears = (experienceArray) => {
  if (!experienceArray || experienceArray.length === 0) return 0;

  const intervals = [];
  
  for (const exp of experienceArray) {
    if (exp.startDate) {
      const start = new Date(exp.startDate).getTime();
      const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
      
      if (!isNaN(start) && !isNaN(end) && start < end) {
        intervals.push([start, end]);
      }
    }
  }

  if (intervals.length === 0) return 0;

  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  // Merge overlapping intervals
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const current = intervals[i];
    
    if (current[0] <= last[1]) {
      // Overlapping, extend the end time if needed
      last[1] = Math.max(last[1], current[1]);
    } else {
      // Not overlapping, add as new interval
      merged.push(current);
    }
  }

  // Sum up total duration
  let totalMs = 0;
  for (const [start, end] of merged) {
    totalMs += (end - start);
  }

  const msInYear = 1000 * 60 * 60 * 24 * 365.25;
  return totalMs / msInYear;
};

/**
 * Extracts required years of experience from job description.
 */
export const extractRequiredYears = (description) => {
  if (!description) return null;
  // Look for patterns like "3+ years of experience", "5 yrs experience", "minimum 2 years"
  // Captures the digit
  const match = description.match(/(\d+)\+?\s*(?:years?|yrs?).*?(?:experience|exp)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
};

/**
 * Extracts highest required education from job description.
 */
export const extractRequiredEducation = (description) => {
  if (!description) return null;
  const descLower = description.toLowerCase();
  
  if (/\b(phd|doctorate|ph\.d)\b/.test(descLower)) return 'phd';
  if (/\b(master|masters|msc|ms|mba)\b/.test(descLower)) return 'master';
  if (/\b(bachelor|bachelors|bsc|bs|ba)\b/.test(descLower)) return 'bachelor';
  
  return null;
};

/**
 * Checks if user education matches required education.
 */
export const checkEducationMatch = (userEducationArray, requiredLevel) => {
  if (!requiredLevel) return true; // No requirement stated = match
  if (!userEducationArray || userEducationArray.length === 0) return false; // Requirement stated but no education = no match

  const levels = {
    'bachelor': 1,
    'master': 2,
    'phd': 3
  };
  
  const reqValue = levels[requiredLevel] || 0;

  // Find user's highest degree
  let userMax = 0;
  for (const edu of userEducationArray) {
    const degreeLower = (edu.degree || '').toLowerCase();
    let val = 0;
    if (/\b(phd|doctorate|ph\.d)\b/.test(degreeLower)) val = 3;
    else if (/\b(master|masters|msc|ms|mba)\b/.test(degreeLower)) val = 2;
    else if (/\b(bachelor|bachelors|bsc|bs|ba|b\.tech|btech|b\.e|be)\b/.test(degreeLower)) val = 1;
    
    if (val > userMax) userMax = val;
  }

  return userMax >= reqValue;
};

/**
 * Calculates the deterministic score for a job based on the resume and Pinecone score.
 */
export const calculateDeterministicScore = (resumeParsed, job, pineconeScore, titleCosine, queryParams) => {
  // 1. Skills
  const skills = clamp(pineconeScore * 100, 0, 100);

  // 2. Title
  const title = clamp(titleCosine * 100, 0, 100);

  // 3. Experience
  const relevantYears = calculateTotalRelevantYears(resumeParsed.experience);
  const requiredYears = extractRequiredYears(job.description);
  const experience = requiredYears ? Math.min(relevantYears / requiredYears, 1) * 100 : 100;

  // 4. Education
  const reqEdu = extractRequiredEducation(job.description);
  const credentialMatchesRequirement = checkEducationMatch(resumeParsed.education, reqEdu);
  const education = reqEdu ? (credentialMatchesRequirement ? 100 : 0) : 100;

  // 5. Location
  let location = 100;
  if (queryParams) {
    if (queryParams.workArrangement && queryParams.workArrangement !== job.workArrangement) {
      location = 0;
    }
    // Very naive city/state check since Adzuna normalizes it heavily
    // If the user specified a cityOrState, check if it's in the job location string
    if (queryParams.cityOrState && job.location) {
      const qLoc = queryParams.cityOrState.toLowerCase();
      const jLoc = job.location.toLowerCase();
      if (!jLoc.includes(qLoc)) {
        // We do a loose include check. E.g. user says "New York", job says "New York, NY".
        location = 0;
      }
    }
  }

  // 6. Final Score Calculation
  let score;
  const userSuppliedExplicitQuery = queryParams && !!queryParams.query;

  if (userSuppliedExplicitQuery) {
    // Standard spec formula
    score = Math.round(0.45 * skills + 0.25 * experience + 0.10 * education + 0.10 * location + 0.10 * title);
  } else {
    // Fallback formula when no query was entered (don't include title)
    score = Math.round(0.55 * skills + 0.25 * experience + 0.10 * education + 0.10 * location);
  }

  // Return mutated job with scores injected
  return {
    ...job,
    matchScore: score,
    _debugScores: { skills, title, experience, education, location } // Keep for debugging/tests
  };
};

export default {
  calculateTotalRelevantYears,
  extractRequiredYears,
  extractRequiredEducation,
  checkEducationMatch,
  calculateDeterministicScore
};
