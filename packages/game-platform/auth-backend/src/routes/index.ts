import { Router } from 'express';
import { AuthConfig } from '../types/config';
import { createAuthRoutes } from './auth.routes';
import { createUserRoutes } from './user.routes';

export interface RouteOptions {
  authPrefix?: string;
  userPrefix?: string;
}

export const createRoutes = (
  config: AuthConfig,
  options: RouteOptions = {}
): Router => {
  const router = Router();
  const { authPrefix = '/auth', userPrefix = '/users' } = options;

  // Mount auth routes
  router.use(authPrefix, createAuthRoutes(config));

  // Mount user routes
  router.use(userPrefix, createUserRoutes());

  return router;
};