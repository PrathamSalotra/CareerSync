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
