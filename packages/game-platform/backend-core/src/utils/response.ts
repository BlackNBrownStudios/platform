import { Response } from 'express';
import { PaginateResult } from '../types/pagination';

/**
 * Send success response
 */
export const sendSuccess = (
  res: Response,
  data: any,
  message = 'Success',
  statusCode = 200
) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any
) => {
  const response: any = {
    status: 'error',
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  result: PaginateResult<T>,
  message = 'Success'
) => {
  res.status(200).json({
    status: 'success',
    message,
    data: result.results,
    pagination: {
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
    },
  });
};