import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  const reqId = req.id || 'unknown';

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle express JSON syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON payload in request body',
      },
    });
  }

  // Log unhandled error with only safe metadata and request ID (never body or secrets)
  console.error(`[${reqId}] ${req.method} ${req.originalUrl} - Unhandled Error:`, err.message);

  // Return standard 500 INTERNAL_ERROR envelope without leaking stack trace
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
};

export default errorHandler;
