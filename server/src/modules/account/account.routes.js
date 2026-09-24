import { Router } from 'express';
import { deleteAccount } from './account.controller.js';
import { deleteAccountSchema } from './account.validation.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.delete('/', requireAuth, requireCsrf, validate(deleteAccountSchema), asyncHandler(deleteAccount));

export default router;
