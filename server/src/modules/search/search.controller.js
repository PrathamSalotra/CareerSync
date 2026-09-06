import { AppError } from '../../utils/errors.js';
import { searchQuerySchema } from './search.validation.js';
import { Resume, SearchReservation } from '../../models/index.js';
import adzunaService from '../../services/adzuna.service.js';
import vectorService from '../../services/vector.service.js';
import scoringService from '../../services/scoring.service.js';

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
    const topJobs = normalizedJobs.slice(0, 10);
    
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

  // Complete the reservation
  reservation.state = 'completed';
  await reservation.save();

  return res.status(200).json({
    message: 'Resume-based search completed successfully.',
    reservationId: reservation._id,
    jobs: scoredJobs,
  });
};

export default {
  performSearch,
};
