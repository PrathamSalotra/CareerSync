import { AppError } from '../../utils/errors.js';
import { searchQuerySchema } from './search.validation.js';
import { Resume, SearchReservation } from '../../models/index.js';

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

  if (resumeId) {
    const resume = await Resume.findById(resumeId);

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

  // 5. Scaffold Response
  return res.status(200).json({
    message: 'Search reservation created successfully. Adzuna integration pending.',
    reservationId: reservation._id,
    searchParams: {
      derivedQuery,
      country,
      cityOrState,
      workArrangement
    }
  });
};

export default {
  performSearch,
};
