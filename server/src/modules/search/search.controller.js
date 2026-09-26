import { AppError } from '../../utils/errors.js';
import { searchQuerySchema } from './search.validation.js';
import { Resume, SearchReservation, LearningResource, SearchHistory } from '../../models/index.js';
import adzunaService from '../../services/adzuna.service.js';
import vectorService from '../../services/vector.service.js';
import scoringService from '../../services/scoring.service.js';
import analysisService from '../../services/analysis.service.js';

export const performSearch = async (req, res) => {
  const userId = req.userId;

  // 1. Validate Input
  const validationResult = searchQuerySchema.safeParse(req.body);
  if (!validationResult.success) {
    const isCountryError = validationResult.error.issues.some(
      (issue) => issue.message === 'COUNTRY_NOT_SUPPORTED'
    );
    
    if (isCountryError) {
      throw new AppError(400, 'COUNTRY_NOT_SUPPORTED', 'The requested country is not currently supported by Adzuna.');
    }
    throw new AppError(400, 'VALIDATION_ERROR', validationResult.error.issues[0]?.message || 'Invalid search parameters');
  }

  const { resumeId, query, country, cityOrState, workArrangement } = validationResult.data;

  // 2. Resume & Query Derivation
  let derivedQuery = query;
  let resume = null;

  if (resumeId) {
    resume = await Resume.findById(resumeId);

    if (!resume || resume.expiresAt < new Date()) {
      throw new AppError(404, 'NOT_FOUND', 'Resume not found or has expired');
    }

    if (resume.userId.toString() !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resume');
    }

    // Fallback to derivedTargetTitle if no explicit query is provided
    if (!derivedQuery) {
      derivedQuery = resume.parsed?.derivedTargetTitle;
    }

    if (!derivedQuery) {
      throw new AppError(400, 'VALIDATION_ERROR', 'No query provided and could not derive a job title from the resume');
    }
  }

  // 3. Quota System (Trailing 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [userSearchCount, globalSearchCount] = await Promise.all([
    SearchReservation.countDocuments({
      userId,
      createdAt: { $gte: oneDayAgo },
    }),
    SearchReservation.countDocuments({
      createdAt: { $gte: oneDayAgo },
    })
  ]);

  if (userSearchCount >= 10) {
    throw new AppError(429, 'USER_SEARCH_LIMIT_REACHED', 'You have reached your limit of 10 searches per 24 hours.');
  }

  if (globalSearchCount >= 100) {
    throw new AppError(429, 'APP_SEARCH_LIMIT_REACHED', 'The application has reached its daily search limit. Please try again tomorrow.');
  }

  // 4. Atomically reserve the search
  const reservation = await SearchReservation.create({
    userId,
    state: 'pending',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
  });

  // 5. Fetch and Normalize Jobs from Adzuna
  const rawJobs = await adzunaService.fetchJobs(derivedQuery, country, cityOrState);
  const normalizedJobs = adzunaService.normalizeAndFilterJobs(rawJobs, workArrangement);

  // 6. Job-Only Exit Path
  if (!resumeId) {
    // If no resume, we just return the top 10 jobs
    const topJobs = normalizedJobs.slice(0, 10).map(job => ({
      ...job,
      redirectUrl: job.redirectUrl || job.url || 'https://www.adzuna.com',
      postedAt: job.postedAt || (job.created ? new Date(job.created) : null),
      matchScore: null,
      fitExplanation: null,
      evidence: [],
      gaps: { skillGaps: [], experienceGaps: [] }
    }));
    
    // Persist Search History (Phase 15)
    await SearchHistory.create({
      userId,
      resumeId: null,
      searchMode: 'job-only',
      query: query || null,
      derivedQuery: derivedQuery || null,
      country,
      cityOrState: cityOrState || null,
      workArrangement: workArrangement || null,
      searchedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      results: topJobs
    });

    // Complete the reservation
    reservation.state = 'completed';
    await reservation.save();

    return res.status(200).json({
      message: 'Job-only search completed successfully.',
      reservationId: reservation._id,
      jobs: topJobs,
    });
  }

  // 7. Resume-Based Search (Phase 13)
  // At this point, resumeId is present
  const rankedJobs = await vectorService.rankJobs(
    resume.parsed, 
    derivedQuery, 
    normalizedJobs, 
    reservation._id
  );

  // Note: we need to pass whether the user explicitly supplied a query or not for scoring logic
  const queryParams = {
    query: query, // The exact user input, not the derived query
    workArrangement: workArrangement,
    cityOrState: cityOrState
  };

  const scoredJobs = rankedJobs.map(job => 
    scoringService.calculateDeterministicScore(
      resume.parsed, 
      job, 
      job.resumeCosine, 
      job.titleCosine, 
      queryParams
    )
  );

  // 8. AI Fit & Gap Analysis (Phase 14)
  const top10Jobs = scoredJobs.slice(0, 10);
  const remainingJobs = scoredJobs.slice(10);
  
  // Fetch permitted learning resources
  const activeResources = await LearningResource.find({ active: true }).lean();

  let validAnalyses = [];
  try {
    validAnalyses = await analysisService.generateAnalyses(resume.parsed, top10Jobs, activeResources);
  } catch (error) {
    if (error.code === 'AI_ANALYSIS_UNAVAILABLE') {
      await reservation.deleteOne(); // Release reservation
      // Throwing this will let the errorHandler return 503 to the client
      // The Pinecone namespace was already cleaned up in the `finally` block of vector.service.js
      throw error;
    }
    throw error;
  }

  // Merge the AI analysis directly into the top 10 jobs
  const analyzedTop10Jobs = top10Jobs.map(job => {
    const aiData = validAnalyses.find(a => a.jobId === job.jobId);
    const redirectUrl = job.redirectUrl || job.url || 'https://www.adzuna.com';
    const postedAt = job.postedAt || (job.created ? new Date(job.created) : null);
    if (aiData) {
      return {
        ...job,
        redirectUrl,
        postedAt,
        fitExplanation: aiData.fitExplanation,
        evidence: aiData.evidence,
        gaps: {
          skillGaps: (aiData.skillGaps || []).map(sg => ({
            ...sg,
            priority: ['high', 'medium', 'low'].includes(String(sg.priority).toLowerCase())
              ? String(sg.priority).toLowerCase()
              : 'medium'
          })),
          experienceGaps: aiData.experienceGaps || []
        }
      };
    }
    return {
      ...job,
      redirectUrl,
      postedAt,
      fitExplanation: null,
      evidence: [],
      gaps: { skillGaps: [], experienceGaps: [] }
    };
  });

  const formattedRemainingJobs = remainingJobs.map(job => ({
    ...job,
    redirectUrl: job.redirectUrl || job.url || 'https://www.adzuna.com',
    postedAt: job.postedAt || (job.created ? new Date(job.created) : null),
    fitExplanation: null,
    evidence: [],
    gaps: { skillGaps: [], experienceGaps: [] }
  }));

  const finalJobsList = [...analyzedTop10Jobs, ...formattedRemainingJobs];

  // 9. Persist Search History (Phase 15)
  const expiresAt = resume ? resume.expiresAt : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await SearchHistory.create({
    userId,
    resumeId: resume ? resume._id : null,
    searchMode: resume ? 'resume' : 'job-only',
    query: query || null,
    derivedQuery: derivedQuery || null,
    country,
    cityOrState: cityOrState || null,
    workArrangement: workArrangement || null,
    searchedAt: new Date(),
    expiresAt,
    results: finalJobsList
  });

  // Complete the reservation
  reservation.state = 'completed';
  await reservation.save();

  return res.status(200).json({
    message: 'Resume-based search completed successfully.',
    reservationId: reservation._id,
    jobs: finalJobsList,
  });
};

export const getSearchHistory = async (req, res) => {
  const userId = req.userId;
  
  const history = await SearchHistory.find({ userId })
    .sort({ searchedAt: -1 })
    .lean();
    
  const formattedHistory = history.map(h => {
    let topMatchScore = null;
    let maxSalary = null;
    let minSalary = null;
    let jobsAnalyzed = h.results?.length || 0;

    if (h.results && h.results.length > 0) {
      // Find top match score
      const matches = h.results.map(r => r.matchScore).filter(s => s != null);
      if (matches.length > 0) {
        topMatchScore = Math.max(...matches);
      }

      // Find salary range
      const mins = h.results.map(r => r.salaryMin).filter(s => s != null);
      const maxes = h.results.map(r => r.salaryMax).filter(s => s != null);
      
      if (mins.length > 0) minSalary = Math.min(...mins);
      if (maxes.length > 0) maxSalary = Math.max(...maxes);
    }

    const { results, ...rest } = h;
    return {
      ...rest,
      topMatchScore,
      minSalary,
      maxSalary,
      jobsAnalyzed
    };
  });
    
  return res.status(200).json(formattedHistory);
};

export const getSearchById = async (req, res) => {
  const userId = req.userId;
  const searchId = req.params.id;
  
  try {
    const search = await SearchHistory.findOne({ _id: searchId, userId }).lean();
    if (!search) {
      throw new AppError(404, 'NOT_FOUND', 'Saved search not found.');
    }
    return res.status(200).json(search);
  } catch (err) {
    if (err.name === 'CastError') {
      throw new AppError(404, 'NOT_FOUND', 'Saved search not found.');
    }
    throw err;
  }
};

export const deleteSearchById = async (req, res) => {
  const userId = req.userId;
  const searchId = req.params.id;
  
  try {
    const result = await SearchHistory.deleteOne({ _id: searchId, userId });
    if (result.deletedCount === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Saved search not found.');
    }
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'CastError') {
      throw new AppError(404, 'NOT_FOUND', 'Saved search not found.');
    }
    throw err;
  }
};

export default {
  performSearch,
  getSearchHistory,
  getSearchById,
  deleteSearchById,
};
