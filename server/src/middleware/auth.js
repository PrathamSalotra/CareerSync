import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

export const requireAuth = (req, res, next) => {
  let token = req.cookies?.cs_access;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid access token payload');
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired access token');
  }
};

export default requireAuth;
