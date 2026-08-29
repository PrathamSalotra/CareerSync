import { randomUUID } from 'node:crypto';

export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

export default requestIdMiddleware;
