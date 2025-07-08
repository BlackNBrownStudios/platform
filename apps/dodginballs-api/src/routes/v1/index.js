const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const teamRoute = require('./team.route');
const matchRoute = require('./match.route');
const lobbyRoute = require('./lobby.route');
const leaderboardRoute = require('./leaderboard.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const bypassAuth = require('../../middlewares/bypassAuth');

// Log whether auth bypass is enabled
if (config.bypassAuth) {
  console.log('🚧 AUTH BYPASS IS ENABLED - All authentication checks will be bypassed 🚧');
}

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
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
