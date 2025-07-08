import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { pick } from '../utils/pick';
import { ApiError } from '../errors/ApiError';

export interface ValidationSchema {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
}

/**
 * Validation middleware
 */
export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema as any, ['params', 'query', 'body'] as any);
    const object = pick(req as any, Object.keys(validSchema) as any);
    
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(', ');
      return next(ApiError.badRequest(errorMessage));
    }
    
    // Assign validated values back to request
    Object.assign(req, value);
    return next();
  };
};