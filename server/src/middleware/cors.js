import config from '../config/index.js';

export const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Build permitted origins list
  const allowedOrigins = [config.APP_ORIGIN];
  if (config.NODE_ENV === 'development') {
    allowedOrigins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    );
  }

  // If no Origin header present (e.g. direct server-to-server or same-origin call), continue
  if (!origin) {
    return next();
  }

  // Check if Origin header is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Request-Id'
    );

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  }

  // Origin is not allowed
  if (req.method === 'OPTIONS') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'CORS origin not allowed',
      },
    });
  }

  return res.status(403).json({
    error: {
      code: 'FORBIDDEN',
      message: 'CORS origin not allowed',
    },
  });
};

export default corsMiddleware;
