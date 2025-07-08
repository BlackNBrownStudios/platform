import { Router } from 'express';
import passport from 'passport';
import { validate } from '@platform/backend-core';
import { authValidation } from '../validations';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';
import { AuthConfig } from '../types/config';

export const createAuthRoutes = (config: AuthConfig): Router => {
  const router = Router();
  const authController = new AuthController(config);

  // Public routes
  router.post('/register', validate(authValidation.register), authController.register);
  router.post('/login', validate(authValidation.login), authController.login);
  router.post('/logout', validate(authValidation.logout), authController.logout);
  router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
  router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
  router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
  router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

  // Protected routes
  router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
  router.post('/change-password', auth(), validate(authValidation.changePassword), authController.changePassword);

  // OAuth routes
  if (config.oauth?.google) {
    router.get(
      '/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );
    
    router.get(
      '/google/callback',
      passport.authenticate('google', { session: false }),
      authController.googleCallback
    );
  }

  // Add similar OAuth routes for Facebook and Apple when implemented

  return router;
};