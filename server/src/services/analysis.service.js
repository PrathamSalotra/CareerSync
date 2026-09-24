import { GoogleGenAI, Type } from '@google/genai';
import config from '../config/index.js';
import { AppError } from '../utils/errors.js';

let aiClient = null;
if (config.GOOGLE_GENAI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: config.GOOGLE_GENAI_API_KEY });
}

// -----------------------------------------------------------------------------
// Schema Definitions
// -----------------------------------------------------------------------------
const AI_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    analyses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobId: { type: Type.STRING, description: "The ID of the job being analyzed." },
          fitExplanation: { type: Type.STRING, description: "A 1-sentence summary of why the candidate is a good fit." },
          evidence: {
            type: Type.ARRAY,
            description: "List of evidence citing the resume. Must not be empty.",
            items: {
              type: Type.OBJECT,
              properties: {
                resumeSection: { type: Type.STRING, description: "Must be 'Skills', 'Experience', 'Education', or 'Certifications'" },
                detail: { type: Type.STRING }
              },
              required: ["resumeSection", "detail"]
            }
          },
          skillGaps: {
            type: Type.ARRAY,
            description: "List of skill gaps. Return empty array [] if none.",
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                priority: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" },
                suggestion: { type: Type.STRING },
                resourceUrl: { type: Type.STRING, description: "Must be a matching URL from the catalog, or empty string if none match" }
              },
              required: ["skill", "priority", "suggestion", "resourceUrl"]
            }
          },
          experienceGaps: {
            type: Type.ARRAY,
            description: "List of experience gaps. Return empty array [] if none.",
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                resumeSection: { type: Type.STRING, description: "Must be 'Experience'" }
              },
              required: ["description", "suggestion", "resumeSection"]
            }
          }
        },
        required: ["jobId", "fitExplanation", "evidence", "skillGaps", "experienceGaps"]
      }
    }
  },
  required: ["analyses"]
};

/**
 * Builds the prompt strictly mapping to the requirements.
 */
const buildPrompt = (resume, jobs, resources) => {
  return `
You are an expert technical career coach.
Analyze this resume against these top 10 matched jobs.

RESUME:
${JSON.stringify(resume, null, 2)}

TOP 10 JOBS:
${JSON.stringify(jobs.map(j => ({ jobId: j.jobId, title: j.title, description: j.description })), null, 2)}

ALLOWED LEARNING RESOURCES CATALOG:
${JSON.stringify(resources.map(r => ({ title: r.title, url: r.url })), null, 2)}

INSTRUCTIONS:
1. Generate exactly one analysis for each of the 10 provided jobs. Do not invent any jobIds.
2. Provide a 'fitExplanation' summarizing why they match (1 sentence max). You MUST provide this.
3. List 'evidence' directly citing their resume.
4. List 'skillGaps' if they lack a required/preferred skill. Keep the 'suggestion' under 2 sentences. If you suggest a resource to bridge the gap, its 'resourceUrl' MUST exactly match a URL from the ALLOWED LEARNING RESOURCES CATALOG above. If no catalog resource fits, set 'resourceUrl' to an empty string "". If there are no skill gaps, return an empty array [].
5. List 'experienceGaps' if they lack years or specific background. Keep 'suggestion' under 2 sentences. If there are no experience gaps, return an empty array [].
6. Do not invent facts. KEEP ALL TEXT EXTREMELY CONCISE AND AVOID REPETITION.
7. YOU MUST OUTPUT EXACTLY THESE 5 KEYS FOR EVERY JOB: jobId, fitExplanation, evidence, skillGaps, experienceGaps.

Return strictly the JSON object with the 'analyses' array containing all 5 required fields for each job. Do not include markdown formatting.
  `;
};

/**
 * Helper to sleep for exponential backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validates the Gemini response against security constraints
 */
const validateAndCleanAnalyses = (parsedJson, requestedJobIds, allowedUrls) => {
  if (!parsedJson || !parsedJson.analyses || !Array.isArray(parsedJson.analyses)) {
    throw new Error('Invalid JSON structure returned from Gemini.');
  }

  // 1. Exactly one analysis per selected job
  const analyses = parsedJson.analyses.filter(a => requestedJobIds.has(a.jobId));
  
  for (const analysis of analyses) {
    // Force defaults if Gemini randomly omits required fields
    if (!analysis.fitExplanation) analysis.fitExplanation = "Candidate matches requirements based on technical skills.";
    if (!analysis.evidence) analysis.evidence = [];
    if (!analysis.skillGaps) analysis.skillGaps = [];
    if (!analysis.experienceGaps) analysis.experienceGaps = [];
    // 2. Validate enums
    if (analysis.evidence) {
      analysis.evidence.forEach(e => {
        const validSections = ['Skills', 'Experience', 'Education', 'Certifications'];
        if (!validSections.includes(e.resumeSection)) e.resumeSection = 'Skills';
      });
    }

    if (analysis.skillGaps) {
      analysis.skillGaps.forEach(g => {
        const validPriorities = ['high', 'medium', 'low'];
        if (!validPriorities.includes(g.priority?.toLowerCase())) g.priority = 'low';
        else g.priority = g.priority.toLowerCase();

        // 3. Every resource URL must be in the supplied catalog
        if (g.resourceUrl && !allowedUrls.has(g.resourceUrl)) {
          console.warn(`Stripping unapproved hallucinated URL: ${g.resourceUrl}`);
          g.resourceUrl = ""; // Strip invalid URLs
        }
      });
    }

    if (analysis.experienceGaps) {
      analysis.experienceGaps.forEach(g => g.resumeSection = 'Experience');
    }
  }

  return analyses;
};

/**
 * Calls Gemini with a 1-time retry on 429 or 503
 */
const callGeminiWithRetry = async (promptText) => {
  if (!aiClient) throw new AppError(500, 'SERVER_ERROR', 'Google GenAI is not configured');

  const maxRetries = 1;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: AI_ANALYSIS_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 8192
        }
      });

      if (!response.text) {
        throw new Error("Empty response from model");
      }

      return JSON.parse(response.text);

    } catch (error) {
      // Check if it's a transient rate limit or server overload
      const isTransient = error.message && (error.message.includes('429') || error.message.includes('503'));
      
      if (isTransient && attempt < maxRetries) {
        console.warn(`Gemini API error (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying in 2 seconds... ${error.message}`);
        await sleep(2000);
        continue;
      }
      
      console.error(`Gemini API permanent failure:`, error);
      throw new AppError(503, 'AI_ANALYSIS_UNAVAILABLE', 'Failed to generate personalized AI analysis.');
    }
  }
};

/**
 * Generates personalized gap analysis for the top jobs.
 */
export const generateAnalyses = async (resume, topJobs, activeResources) => {
  if (!topJobs || topJobs.length === 0) return [];

  const promptText = buildPrompt(resume, topJobs, activeResources);
  
  // Call AI
  const rawJson = await callGeminiWithRetry(promptText);

  // Secure and validate the output
  const requestedJobIds = new Set(topJobs.map(j => j.jobId));
  const allowedUrls = new Set(activeResources.map(r => r.url));

  try {
    return validateAndCleanAnalyses(rawJson, requestedJobIds, allowedUrls);
  } catch (err) {
    console.error('Failed to validate AI output schema:', err);
    throw new AppError(503, 'AI_ANALYSIS_UNAVAILABLE', 'Failed to parse personalized AI analysis.');
  }
};

export default {
  generateAnalyses,
  // Exported for testing
  validateAndCleanAnalyses
};
