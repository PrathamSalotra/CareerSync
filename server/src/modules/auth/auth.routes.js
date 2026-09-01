import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { signup, login, refresh, logout, forgotPassword, resetPassword } from './auth.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/signup', validate(signupSchema), asyncHandler(signup));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', requireCsrf, asyncHandler(logout));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword));

export default router;
