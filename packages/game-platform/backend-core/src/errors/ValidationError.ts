import { ApiError } from './ApiError';
import httpStatus from 'http-status';

export class ValidationError extends ApiError {
  public errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    const message = 'Validation failed';
    super(httpStatus.BAD_REQUEST, message);
    this.errors = errors;
  }

  static fromJoiError(joiError: any): ValidationError {
    const errors: Record<string, string[]> = {};
    
    if (joiError.details) {
      joiError.details.forEach((detail: any) => {
        const key = detail.path.join('.');
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(detail.message);
      });
    }
    
    return new ValidationError(errors);
  }
}