import path from 'path';
import express from 'express';
import { createApp, setupErrorHandling } from '@platform/backend-core';
import { setupAuth } from '@platform/auth-backend';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './docs/swagger';
import { authLimiter } from './middlewares/rateLimiter';
import { cardRoutes } from './routes/v1/card.routes';
import { eventRoutes } from './routes/v1/event.routes';
import { gameRoutes } from './routes/v1/game.routes';
import { analyticsRoutes } from './routes/v1/analytics.routes';
import { imageRoutes } from './routes/v1/image.routes';
import { docsRoute } from './routes/v1/docs.route';
import config from './config/config';

// Create app with platform core
const app = createApp({
  corsOrigins: [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://localhost:8081',
    'exp://localhost:8081',
    config.clientUrl,
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
const authConfig = {
  jwt: {
    secret: config.jwt.secret,
    refreshSecret: config.jwt.refreshSecret,
    accessExpirationMinutes: config.jwt.accessExpirationMinutes,
    refreshExpirationDays: config.jwt.refreshExpirationDays,
    resetPasswordExpirationMinutes: config.jwt.resetPasswordExpirationMinutes,
    verifyEmailExpirationMinutes: config.jwt.verifyEmailExpirationMinutes,
  },
  frontendUrl: config.clientUrl,
  oauth: {
    google: config.google ? {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    } : undefined,
    facebook: config.facebook ? {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
    } : undefined,
    apple: config.apple ? {
      clientID: config.apple.clientID,
      teamID: config.apple.teamID,
      keyID: config.apple.keyID,
      privateKey: config.apple.privateKey,
      callbackURL: config.apple.callbackURL,
    } : undefined,
  },
  email: config.email.smtp.host ? {
    smtp: config.email.smtp,
    from: config.email.from,
  } : undefined,
};

// Apply rate limiting to auth routes
app.use('/v1/auth', authLimiter);

// Setup authentication routes
setupAuth({ app, config: authConfig, routePrefix: '/v1' });

// History Time specific routes
app.use('/v1/cards', cardRoutes);
app.use('/v1/events', eventRoutes);
app.use('/v1/games', gameRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/images', imageRoutes);

// Documentation routes
if (config.env !== 'production') {
  app.use('/v1/docs', docsRoute);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
}

// Setup error handling (must be last)
setupErrorHandling(app);

export default app;