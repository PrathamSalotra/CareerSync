import mongoose from 'mongoose';
import { Resume } from '../../models/index.js';
import { AppError } from '../../utils/errors.js';
import storageService from '../../services/storage.service.js';
import parserService from '../../services/parser.service.js';
import { parsedResumeZodSchema } from './resumes.validation.js';

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

  // Set expiration to 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Extract and Parse Resume
  let extractedText = '';
  try {
    extractedText = await parserService.extractText(req.file.buffer, req.file.mimetype);
  } catch (err) {
    console.error('Text extraction failed:', err);
    // Continue even if local extraction fails, Gemini OCR fallback will kick in if text < 50 chars
  }

  let parsedData = null;
  try {
    parsedData = await parserService.parseResumeToJSON(extractedText, req.file.buffer, req.file.mimetype);
    console.log('Gemini Parsed Output:', JSON.stringify(parsedData, null, 2));
  } catch (err) {
    console.error('Gemini parsing failed:', err);
    throw new AppError(422, 'RESUME_PARSE_FAILED', 'Failed to parse the resume using AI');
  }

  // Validate Gemini Output
  const validationResult = parsedResumeZodSchema.safeParse(parsedData);
  if (!validationResult.success) {
    throw new AppError(422, 'RESUME_PARSE_FAILED', validationResult.error.issues[0]?.message || 'Parsed resume is missing required minimum sections');
  }

  const validParsedResume = validationResult.data;

  // Save to DB (including parsed data)
  const resume = await Resume.create({
    _id: resumeId,
    userId,
    rawFileObjectKey,
    originalFilename: req.file.originalname,
    mimeType: req.file.mimetype,
    expiresAt,
    parsed: validParsedResume
  });

  return res.status(201).json({
    resume: {
      id: resume._id,
      originalFilename: resume.originalFilename,
      mimeType: resume.mimeType,
      uploadedAt: resume.uploadedAt,
      expiresAt: resume.expiresAt,
      parsed: resume.parsed
    }
  });
};

export const getUserResumes = async (req, res) => {
  const userId = req.userId;
  
  const resumes = await Resume.find({ 
    userId,
    expiresAt: { $gt: new Date() }
  }).sort({ uploadedAt: -1 });

  return res.status(200).json({ resumes });
};

export const getResumeById = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid resume ID format');
  }

  const resume = await Resume.findById(id);

  if (!resume || resume.expiresAt < new Date()) {
    throw new AppError(404, 'NOT_FOUND', 'Resume not found or has expired');
  }

  if (resume.userId.toString() !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resume');
  }

  return res.status(200).json({ resume });
};

export const deleteResume = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid resume ID format');
  }

  const resume = await Resume.findById(id);

  if (!resume) {
    throw new AppError(404, 'NOT_FOUND', 'Resume not found');
  }

  if (resume.userId.toString() !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this resume');
  }

  // Order matters: Delete the raw file from R2 first
  try {
    await storageService.deleteResumeFromR2(resume.rawFileObjectKey);
  } catch (error) {
    console.error(`Failed to delete R2 object for resume ${id}:`, error);
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'Failed to delete resume file from storage. Please try again later.');
  }

  // If R2 deletion succeeds, delete the Mongo Resume document
  await Resume.findByIdAndDelete(id);

  // TODO: Phase 17 - Cascade delete associated SearchHistory

  return res.status(204).send();
};

export default {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
};
