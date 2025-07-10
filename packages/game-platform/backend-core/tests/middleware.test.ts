import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../src/middleware/async';
import { errorHandler } from '../src/middleware/error';
import { healthCheck } from '../src/middleware/health';
import { requestLogger } from '../src/middleware/logging';
import { validate } from '../src/middleware/validate';
import { ApiError } from '../src/errors/ApiError';
import { ValidationError } from '../src/errors/ValidationError';
import Joi from 'joi';

describe('Backend Core Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/test',
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      send: jest.fn().mockReturnThis() as any
    };
    mockNext = jest.fn();
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const handler = asyncHandler(async (req: any, res: any) => {
        res.json({ success: true });
      });

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch and forward errors to next', async () => {
      const error = new Error('Async error');
      const handler = asyncHandler(async () => {
        throw error;
      });

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('errorHandler', () => {
    it('should handle ApiError instances', () => {
      const apiError = new ApiError(400, 'Bad Request');
      
      errorHandler(apiError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Bad Request'
        })
      );
    });

    it('should handle ValidationError instances', () => {
      const validationError = new ValidationError({
        email: ['Invalid email format']
      });
      
      errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed',
          errors: {
            email: ['Invalid email format']
          }
        })
      );
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Something went wrong'
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      await healthCheck(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        memory: expect.objectContaining({
          rss: expect.stringMatching(/\d+MB/),
          heapTotal: expect.stringMatching(/\d+MB/),
          heapUsed: expect.stringMatching(/\d+MB/)
        })
      });
    });
  });

  describe('requestLogger', () => {
    it('should be a morgan middleware', () => {
      // requestLogger is a morgan middleware, not a simple function
      expect(requestLogger).toBeDefined();
      expect(typeof requestLogger).toBe('function');
      // Morgan middleware has 3 parameters
      expect(requestLogger.length).toBe(3);
    });
  });

  describe('validate', () => {
    it('should validate request body successfully', () => {
      const schema = Joi.object({
        body: Joi.object({
          name: Joi.string().required(),
          age: Joi.number().min(0).required()
        })
      });

      mockReq.body = { name: 'John', age: 25 };

      const validator = validate(schema as any);
      validator(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid request body', () => {
      const schema = Joi.object({
        body: Joi.object({
          name: Joi.string().required(),
          age: Joi.number().min(0).required()
        })
      });

      mockReq.body = { name: 'John' }; // Missing age

      const validator = validate(schema as any);
      validator(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const schema = Joi.object({
        query: Joi.object({
          page: Joi.number().min(1).default(1),
          limit: Joi.number().min(1).max(100).default(10)
        })
      });

      mockReq.query = { page: '2', limit: '20' };

      const validator = validate(schema as any);
      validator(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});