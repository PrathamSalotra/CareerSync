import express from 'express';
import cookieParser from 'cookie-parser';
import { requestIdMiddleware } from './middleware/requestId.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Deployment plumbing (§2): Trust exactly one proxy hop on Render
app.set('trust proxy', 1);

// Global middleware
app.use(requestIdMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import authRoutes from './modules/auth/auth.routes.js';
import resumesRoutes from './modules/resumes/resumes.routes.js';
import searchRoutes from './modules/search/search.routes.js';

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/search', searchRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
