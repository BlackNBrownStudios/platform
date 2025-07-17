import path from 'path';
import express from 'express';
import { createApp, setupErrorHandling } from '@platform/backend-core';
import { setupAuth } from '@platform/auth-backend';
import swaggerUi from 'swagger-ui-express';
import v1Routes from './routes/v1';
import config from './config/config';

// Create app with platform core
const app = createApp({
  corsOrigins: [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://localhost:8081',
    'exp://localhost:8081',
    ...(config.frontendUrl ? [config.frontendUrl] : []),
  ],
  trustProxy: true,
  apiPrefix: '/v1',
});

// Serve static files with CORS headers
app.use(
  '/images',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '../public/images'))
);

// Serve other static files
app.use(express.static(path.join(__dirname, '../public')));

// Setup authentication with platform auth
const authConfig: any = {
  jwt: {
    secret: config.jwt.secret,
    refreshSecret: config.jwt.refreshSecret || config.jwt.secret,
    accessExpirationMinutes: config.jwt.accessExpirationMinutes,
    refreshExpirationDays: config.jwt.refreshExpirationDays,
    resetPasswordExpirationMinutes: config.jwt.resetPasswordExpirationMinutes,
    verifyEmailExpirationMinutes: config.jwt.verifyEmailExpirationMinutes,
  },
  frontendUrl: config.frontendUrl || 'http://localhost:3000',
  email: config.email.smtp.host ? {
    smtp: config.email.smtp,
    from: config.email.from,
  } : undefined,
};

// Only add oauth if any provider is configured with credentials
const googleOAuthConfigured = config.google?.oauth?.clientId && config.google?.oauth?.clientSecret;
const facebookOAuthConfigured = config.facebook?.appId && config.facebook?.appSecret;
const appleOAuthConfigured = config.apple?.clientId && config.apple?.teamId && config.apple?.keyId;

const hasOAuth = googleOAuthConfigured || facebookOAuthConfigured || appleOAuthConfigured;
if (hasOAuth) {
  authConfig.oauth = {};
  if (googleOAuthConfigured) {
    authConfig.oauth.google = {
      clientId: config.google.oauth.clientId,
      clientSecret: config.google.oauth.clientSecret,
      callbackURL: config.google.oauth.callbackUrl,
    };
  }
  if (facebookOAuthConfigured) {
    authConfig.oauth.facebook = {
      clientId: config.facebook.appId,
      clientSecret: config.facebook.appSecret,
      callbackURL: config.facebook.callbackUrl,
    };
  }
  if (appleOAuthConfigured) {
    authConfig.oauth.apple = {
      clientId: config.apple.clientId,
      teamId: config.apple.teamId,
      keyId: config.apple.keyId,
      privateKey: config.apple.privateKey || '',
      callbackURL: config.apple.callbackUrl || '',
    };
  }
}

// Setup authentication routes
try {
  setupAuth({ app, config: authConfig, routePrefix: '/v1' });
} catch (error) {
  console.error('Failed to setup auth:', error);
  // Continue without auth for now
}

// Apply game-specific routes
app.use('/v1', v1Routes);

// Documentation routes
if (config.env !== 'production') {
  // TODO: Add swagger documentation
}

// Setup error handling (must be last)
setupErrorHandling(app);

export default app;