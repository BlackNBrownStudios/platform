import { createApp, setupErrorHandling } from '@platform/backend-core';
import { setupAuth } from '@platform/auth-backend';
import { gameRoutes } from './routes/game.routes';
import { leaderboardRoutes } from './routes/leaderboard.routes';

// Create app with platform core
const app = createApp({
  corsOrigins: ['http://localhost:3002'], // Pick-a-number web app
  apiPrefix: '/api/v1',
});

// Setup authentication with platform auth
const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'pick-a-number-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'pick-a-number-refresh-secret',
    accessExpirationMinutes: 30,
    refreshExpirationDays: 30,
    resetPasswordExpirationMinutes: 10,
    verifyEmailExpirationMinutes: 10,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3002',
};

// Setup authentication routes
setupAuth({ app, config: authConfig, routePrefix: '/api/v1' });

// Game-specific routes
app.use('/api/v1/game', gameRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    game: 'pick-a-number',
    timestamp: new Date().toISOString()
  });
});

// Setup error handling (must be last)
setupErrorHandling(app);

export default app;