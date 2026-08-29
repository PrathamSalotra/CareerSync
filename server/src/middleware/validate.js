import { AppError } from '../utils/errors.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const issue = result.error.errors[0];
      const errorMessage = issue ? issue.message : 'Invalid request payload';
      throw new AppError(400, 'VALIDATION_ERROR', errorMessage);
    }

    req.body = result.data;
    next();
  };
};

export default validate;
