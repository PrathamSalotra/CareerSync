import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateResumeFile } from './resumes.validation.js';
import { uploadResume, getUserResumes, getResumeById, deleteResume } from './resumes.controller.js';

const router = Router();

// Setup Multer for memory storage with a 5 MiB size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MiB
  },
});

// Protect all resume routes with auth
router.use(requireAuth);

// Endpoint: GET /api/resumes
router.get('/', asyncHandler(getUserResumes));

// Endpoint: GET /api/resumes/:id
router.get('/:id', asyncHandler(getResumeById));

// Endpoint: POST /api/resumes
router.post(
  '/',
  requireCsrf,
  upload.single('file'), // Multer middleware handling the 'file' field
  validateResumeFile,    // Our custom magic byte validator
  asyncHandler(uploadResume)
);

// Endpoint: DELETE /api/resumes/:id
router.delete('/:id', requireCsrf, asyncHandler(deleteResume));

export default router;
