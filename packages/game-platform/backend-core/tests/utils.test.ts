import { describe, it, expect, jest } from '@jest/globals';
import { catchAsync } from '../src/utils/catchAsync';
import { pick } from '../src/utils/pick';
import { sendSuccess, sendError, sendPaginated } from '../src/utils/response';
import { logger } from '../src/utils/logger';
import { Request, Response, NextFunction } from 'express';

describe('Backend Core Utils', () => {
  describe('catchAsync', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        json: jest.fn().mockReturnThis() as any
      };
      mockNext = jest.fn();
    });

    it('should handle successful async operations', async () => {
      const asyncFn = async (req: Request, res: Response) => {
        res.json({ success: true });
      };

      const wrapped = catchAsync(asyncFn);
      await wrapped(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = async () => {
        throw error;
      };

      const wrapped = catchAsync(asyncFn);
      await wrapped(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('pick', () => {
    it('should pick specified keys from object', () => {
      const obj = {
        name: 'John',
        age: 25,
        email: 'john@example.com',
        password: 'secret'
      };

      const picked = pick(obj, ['name', 'email']);
      
      expect(picked).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
      expect(picked).not.toHaveProperty('age');
      expect(picked).not.toHaveProperty('password');
    });

    it('should handle non-existent keys', () => {
      const obj = { name: 'John' };
      const picked = pick(obj as any, ['name', 'age']);
      
      expect(picked).toEqual({ name: 'John' });
    });

    it('should return empty object when no keys match', () => {
      const obj = { name: 'John' };
      const picked = pick(obj as any, ['age', 'email']);
      
      expect(picked).toEqual({});
    });
  });

  describe('response utils', () => {
    let mockRes: Partial<Response>;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis() as any,
        json: jest.fn().mockReturnThis() as any
      };
    });

    it('should send success response with data', () => {
      sendSuccess(mockRes as Response, { user: 'John' }, 'Success', 200);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: { user: 'John' }
      });
    });

    it('should send error response', () => {
      sendError(mockRes as Response, 'Bad Request', 400, { field: 'Invalid' });

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Bad Request',
        errors: { field: 'Invalid' }
      });
    });

    it('should send paginated response', () => {
      const paginatedData = {
        results: [{ id: 1 }, { id: 2 }],
        page: 1,
        limit: 10,
        totalPages: 5,
        totalResults: 50
      };

      sendPaginated(mockRes as Response, paginatedData, 'Items retrieved');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Items retrieved',
        data: paginatedData.results,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 5,
          totalResults: 50
        }
      });
    });
  });

  describe('logger', () => {
    it('should have all log level methods', () => {
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should log messages', () => {
      // Winston logger doesn't directly use console.log
      // Just verify the logger can be called without errors
      expect(() => logger.info('Test info message')).not.toThrow();
      expect(() => logger.error('Test error message')).not.toThrow();
      expect(() => logger.warn('Test warning message')).not.toThrow();
      expect(() => logger.debug('Test debug message')).not.toThrow();
    });
  });
});