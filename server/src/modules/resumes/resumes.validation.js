import { AppError } from '../../utils/errors.js';

/**
 * Validates the magic bytes (file signature) of a buffer to ensure it is actually a PDF or DOCX.
 * PDF: 25 50 44 46 (%PDF)
 * DOCX (ZIP): 50 4B 03 04 (PK\x03\x04)
 */
export const validateResumeFile = (req, res, next) => {
  if (!req.file) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'No file uploaded'));
  }

  const { buffer, mimetype, originalname } = req.file;

  // 1. Basic MIME Type Check (from multer/client)
  const validMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!validMimeTypes.includes(mimetype)) {
    return next(new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'Only PDF and DOCX files are allowed'));
  }

  // 2. Magic Bytes Check (True File Type)
  if (buffer.length < 4) {
    return next(new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'File is too small or corrupt'));
  }

  // Convert first 4 bytes to Hex
  const hexSignature = buffer.toString('hex', 0, 4).toUpperCase();

  // PDF signature: 25504446
  // DOCX signature (ZIP archive): 504B0304
  const isPdf = hexSignature === '25504446';
  const isDocx = hexSignature === '504B0304';

  if (!isPdf && !isDocx) {
    return next(
      new AppError(
        415,
        'UNSUPPORTED_FILE_TYPE',
        'File signature does not match PDF or DOCX format. The file might be corrupted or renamed maliciously.'
      )
    );
  }

  // File is safe to proceed
  next();
};

import { z } from 'zod';

export const parsedResumeZodSchema = z.object({
  contact: z.object({
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
  }).optional(),
  derivedTargetTitle: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.object({
    title: z.string().nullable().optional(),
    company: z.string().nullable().optional(),
    employmentType: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string().nullable().optional(),
    degree: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
  })).optional(),
  certifications: z.array(z.string()).optional(),
}).refine(data => {
  // Validate: must have some contact info (name, email, or phone)
  const hasContact = data.contact?.name || data.contact?.email || data.contact?.phone;
  // Validate: must have at least one valid array field with data
  const hasContent = 
    (data.skills && data.skills.length > 0) ||
    (data.experience && data.experience.length > 0) ||
    (data.education && data.education.length > 0) ||
    (data.certifications && data.certifications.length > 0);
  
  return hasContact && hasContent;
}, {
  message: 'Parsed resume is empty or missing required minimum sections (contact + some experience/education/skills).',
});
