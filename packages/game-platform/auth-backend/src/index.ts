// Export all auth-related functionality
export * from './types';
export * from './models';
export * from './services';
export * from './middleware';
export * from './strategies';
export * from './controllers';
export * from './validations';
export * from './routes';

// Main setup function
import { Express } from 'express';
import { initializePassport } from './strategies';
import { createRoutes } from './routes';
import { AuthConfig } from './types/config';

export interface SetupAuthOptions {
  app: Express;
  config: AuthConfig;
  routePrefix?: string;
}

export const setupAuth = ({ app, config, routePrefix = '/api' }: SetupAuthOptions) => {
  // Initialize Passport strategies
  const passport = initializePassport(config);
  app.use(passport.initialize());

  // Mount routes
  const routes = createRoutes(config);
  app.use(routePrefix, routes);

  return {
    passport,
    routes,
  };
};