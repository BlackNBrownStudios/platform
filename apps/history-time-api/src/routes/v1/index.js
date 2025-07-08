const express = require('express');

const config = require('../../config/config');

const authRoute = require('./auth.route');
const cardRoute = require('./card.route');
const dailyChallengeRoute = require('./dailyChallenge.route');
const docsRoute = require('./docs.route');
const gameRoute = require('./game.route');
// imageRoute removed - replaced by new image services architecture
// enhancedImageRoute removed - replaced by new image services architecture
const historicalEventRoute = require('./historicalEvent.route');
const multiplayerGameRoute = require('./multiplayerGame.route');
const storeRoute = require('./store.route');
const userRoute = require('./user.route');

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
    path: '/cards',
    route: cardRoute,
  },
  {
    path: '/games',
    route: gameRoute,
  },
  {
    path: '/multiplayer-games',
    route: multiplayerGameRoute,
  },
  // images route removed - replaced by new image services architecture
  // enhanced-image route removed - replaced by new image services architecture
  {
    path: '/historical-events',
    route: historicalEventRoute,
  },
  {
    path: '/daily-challenges',
    route: dailyChallengeRoute,
  },
  {
    path: '/store',
    route: storeRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
