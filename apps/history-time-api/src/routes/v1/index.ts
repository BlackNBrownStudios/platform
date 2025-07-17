import express, { Router } from 'express';
import config from '../../config/config';

// Game-specific routes
// @ts-ignore - JS files without type definitions
import cardRoute from './card.route';
// @ts-ignore
import dailyChallengeRoute from './dailyChallenge.route';
// @ts-ignore
import docsRoute from './docs.route';
// @ts-ignore
import gameRoute from './game.route';
// @ts-ignore
import historicalEventRoute from './historicalEvent.route';
// @ts-ignore
import multiplayerGameRoute from './multiplayerGame.route';
// @ts-ignore
import storeRoute from './store.route';
// @ts-ignore
import userRoute from './user.route';

const router: Router = express.Router();

const defaultRoutes = [
  // Note: auth routes are handled by @platform/auth-backend
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
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;