import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateResumeFile } from './resumes.validation.js';
import { uploadResume } from './resumes.controller.js';

const router = Router();

// Setup Multer for memory storage with a 5 MiB size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MiB
  },
});

// Protect all resume routes with auth and CSRF (since all will be state-changing or protected data)
router.use(requireAuth);

// Endpoint: POST /api/resumes
router.post(
  '/',
  requireCsrf,
  upload.single('file'), // Multer middleware handling the 'file' field
  validateResumeFile,    // Our custom magic byte validator
  asyncHandler(uploadResume)
);

export default router;
