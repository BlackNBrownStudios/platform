import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import { ApiError } from '@platform/backend-core';
import { IUser } from '../models/user.model';
import { TokenTypes } from '../models/token.model';
import { AuthRequest } from '../types/auth';

const verifyCallback = (
  req: AuthRequest,
  resolve: any,
  reject: any,
  requiredRights: string[] = []
) => async (err: any, user: IUser | false, info: any) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  
  req.user = user;

  if (requiredRights.length) {
    const userRights = getRoleRights(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) =>
      userRights.includes(requiredRight)
    );
    
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

/**
 * Auth middleware
 */
export const auth = (...requiredRights: string[]) => async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallback(req, resolve, reject, requiredRights)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

/**
 * Optional auth middleware - doesn't fail if no auth provided
 */
export const optionalAuth = () => async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  return new Promise((resolve) => {
    passport.authenticate(
      'jwt',
      { session: false },
      (err: any, user: IUser | false) => {
        if (user) {
          req.user = user;
        }
        resolve(undefined);
      }
    )(req, res, next);
  }).then(() => next());
};

/**
 * Get role rights
 */
const getRoleRights = (role: string): string[] => {
  const roleRights = new Map([
    ['user', []],
    ['admin', ['getUsers', 'manageUsers']],
  ]);

  return roleRights.get(role) || [];
};

/**
 * Check if user has specific right
 */
export const hasRight = (user: IUser, right: string): boolean => {
  const userRights = getRoleRights(user.role);
  return userRights.includes(right);
};

/**
 * Rate limit key generator for auth endpoints
 */
export const authLimiterKeyGenerator = (req: Request): string => {
  return req.ip || 'unknown';
};

/**
 * Verify user is owner or admin
 */
export const verifyOwnerOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
  
  next();
};