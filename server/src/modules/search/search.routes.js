import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { performSearch } from './search.controller.js';

const router = Router();

// Endpoint: POST /api/search
// Protect with auth and CSRF since this consumes user quotas and costs money
router.post('/', requireAuth, requireCsrf, asyncHandler(performSearch));

export default router;
