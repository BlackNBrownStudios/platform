const express = require('express');
const { createAuthRoutes } = require('@platform/auth-backend');
const userRoute = require('./user.route');
const teamRoute = require('./team.route');
const matchRoute = require('./match.route');
const lobbyRoute = require('./lobby.route');
const leaderboardRoute = require('./leaderboard.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

// Log whether auth bypass is enabled
if (config.bypassAuth) {
  console.log('🚧 AUTH BYPASS IS ENABLED - All authentication checks will be bypassed 🚧');
}

const router = express.Router();

// Platform auth routes - create the auth config to pass
const authConfig = {
  jwt: {
    secret: config.jwt.secret,
    accessExpirationMinutes: config.jwt.accessExpirationMinutes,
    refreshExpirationDays: config.jwt.refreshExpirationDays,
    resetPasswordExpirationMinutes: config.jwt.resetPasswordExpirationMinutes,
    verifyEmailExpirationMinutes: config.jwt.verifyEmailExpirationMinutes,
  },
  frontendUrl: config.clientUrl || 'http://localhost:3000',
  email: config.email.smtp.host ? {
    smtp: config.email.smtp,
    from: config.email.from,
  } : undefined,
};

router.use('/auth', createAuthRoutes(authConfig));

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/teams',
    route: teamRoute,
  },
  {
    path: '/matches',
    route: matchRoute,
  },
  {
    path: '/lobbies',
    route: lobbyRoute,
  },
  {
    path: '/leaderboard',
    route: leaderboardRoute,
  },
  {
    path: '/docs',
    route: docsRoute,
  },
];

const devRoutes = [
  // routes that would be available only in development mode
  // Currently empty as docs have been moved to defaultRoutes
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development' && devRoutes.length > 0) {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;