import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { performSearch, getSearchHistory, getSearchById, deleteSearchById } from './search.controller.js';

const router = Router();

// Endpoint: GET /api/search/history
// Get list of saved searches for the authenticated user
router.get('/history', requireAuth, asyncHandler(getSearchHistory));

// Endpoint: GET /api/search/:id
// Get a specific saved search
router.get('/:id', requireAuth, asyncHandler(getSearchById));

// Endpoint: DELETE /api/search/:id
// Delete a specific saved search
router.delete('/:id', requireAuth, requireCsrf, asyncHandler(deleteSearchById));

// Endpoint: POST /api/search
// Protect with auth and CSRF since this consumes user quotas and costs money
router.post('/', requireAuth, requireCsrf, asyncHandler(performSearch));

export default router;
