import mongoose from 'mongoose';
import { Resume } from '../../models/index.js';
import { AppError } from '../../utils/errors.js';
import storageService from '../../services/storage.service.js';

export const uploadResume = async (req, res) => {
  const userId = req.userId; // From requireAuth middleware
  
  if (!req.file) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No resume file provided');
  }

  // Enforce quota: < 3 unexpired resumes
  const activeResumesCount = await Resume.countDocuments({
    userId,
    expiresAt: { $gt: new Date() },
  });

  if (activeResumesCount >= 3) {
    throw new AppError(
      403,
      'QUOTA_EXCEEDED',
      'You have reached the maximum limit of 3 active resumes. Please delete an older resume before uploading a new one.'
    );
  }

  // Generate a new Resume ID before upload
  const resumeId = new mongoose.Types.ObjectId();

  // Upload to R2
  const rawFileObjectKey = await storageService.uploadResumeToR2(
    userId,
    resumeId.toString(),
    req.file.originalname,
    req.file.buffer,
    req.file.mimetype
  );

  // Set expiration to 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Save to DB
  const resume = await Resume.create({
    _id: resumeId,
    userId,
    rawFileObjectKey,
    originalFilename: req.file.originalname,
    mimeType: req.file.mimetype,
    expiresAt,
  });

  return res.status(201).json({
    resume: {
      id: resume._id,
      originalFilename: resume.originalFilename,
      mimeType: resume.mimeType,
      uploadedAt: resume.uploadedAt,
      expiresAt: resume.expiresAt,
    },
  });
};

export default {
  uploadResume,
};
