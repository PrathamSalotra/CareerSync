import { Resume, SearchHistory } from '../../models/index.js';
import config from '../../config/index.js';
import storageService from '../../services/storage.service.js';
import { AppError } from '../../utils/errors.js';

export const cleanup = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${config.CLEANUP_SHARED_SECRET}`) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or missing shared secret');
  }

  const now = new Date();
  
  // 1. Cleanup expired Resumes
  const expiredResumes = await Resume.find({ expiresAt: { $lt: now } });
  
  const stats = {
    resumesDeleted: 0,
    resumesFailed: 0,
    searchHistoryDeleted: 0,
    searchHistoryFailed: 0,
  };

  for (const resume of expiredResumes) {
    try {
      if (resume.storageKey) {
        await storageService.deleteResumeFromR2(resume.storageKey);
      }
      
      const deletedHistory = await SearchHistory.deleteMany({ resumeId: resume._id });
      stats.searchHistoryDeleted += deletedHistory.deletedCount;
      
      await Resume.deleteOne({ _id: resume._id });
      stats.resumesDeleted++;
    } catch (error) {
      console.error(`Failed to cleanup resume ${resume._id}:`, error);
      stats.resumesFailed++;
    }
  }

  // 2. Cleanup remaining expired SearchHistory (job-only searches, or orphaned searches)
  try {
    const expiredHistory = await SearchHistory.deleteMany({ expiresAt: { $lt: now } });
    stats.searchHistoryDeleted += expiredHistory.deletedCount;
  } catch (error) {
    console.error('Failed to cleanup expired search history:', error);
    stats.searchHistoryFailed++;
  }

  return res.status(200).json({
    message: 'Cleanup completed successfully',
    stats
  });
};
