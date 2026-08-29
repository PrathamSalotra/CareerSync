import { AppError } from '../utils/errors.js';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const requireCsrf = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.includes(req.method)) {
    return next();
  }

  const cookieCsrf = req.cookies?.cs_csrf;
  const headerCsrf = req.headers['x-csrf-token'];

  if (!cookieCsrf || !headerCsrf || cookieCsrf !== headerCsrf) {
    throw new AppError(403, 'FORBIDDEN', 'Invalid or missing CSRF token');
  }

  next();
};

export default requireCsrf;
