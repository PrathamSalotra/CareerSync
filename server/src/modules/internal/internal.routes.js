import { Router } from 'express';
import { cleanup } from './internal.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/cleanup', asyncHandler(cleanup));

export default router;
