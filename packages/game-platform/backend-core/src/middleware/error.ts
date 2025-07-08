import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../errors/ApiError';
import { ValidationError } from '../errors/ValidationError';
import { logger } from '../utils/logger';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Convert non-ApiError to ApiError
 */
const convertError = (err: any): ApiError => {
  if (err instanceof ApiError) {
    return err;
  }
  
  if (err instanceof ValidationError) {
    return err;
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors: Record<string, string[]> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = [err.errors[key].message];
    });
    return new ValidationError(errors);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new ApiError(
      httpStatus.CONFLICT,
      `${field} already exists`
    );
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return new ApiError(httpStatus.UNAUTHORIZED, 'Token expired');
  }
  
  // Default to internal server error
  return new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    err.message || 'Internal server error',
    false
  );
};

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = convertError(err);
  
  // Log error
  if (!error.isOperational) {
    logger.error('Unhandled error:', {
      error: err,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
    });
  }
  
  // Prepare response
  const response: any = {
    status: 'error',
    message: error.message,
  };
  
  // Add validation errors if present
  if (error instanceof ValidationError) {
    response.errors = error.errors;
  }
  
  // Add stack trace in development
  if (isDevelopment && !isTest) {
    response.stack = error.stack;
  }
  
  res.status(error.statusCode).json(response);
};