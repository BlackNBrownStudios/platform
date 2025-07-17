import express, { Router } from 'express';
import { validate } from '@platform/backend-core';
import leaderboardValidation from '../validations/leaderboard.validation';
import leaderboardController from '../controllers/leaderboard.controller';

const router: Router = express.Router();

// Leaderboard management routes
router
  .route('/')
  .post(validate(leaderboardValidation.createLeaderboard), leaderboardController.createLeaderboard)
  .get(validate(leaderboardValidation.getLeaderboards), leaderboardController.getLeaderboards);

router
  .route('/:leaderboardId')
  .get(leaderboardController.getLeaderboard)
  .delete(validate(leaderboardValidation.deleteLeaderboard), leaderboardController.deleteLeaderboard);

// Score and ranking routes
router
  .route('/:leaderboardId/scores')
  .post(validate(leaderboardValidation.updateScore), leaderboardController.updateScore);

router
  .route('/:leaderboardId/rankings')
  .get(validate(leaderboardValidation.getRankings), leaderboardController.getRankings);

router
  .route('/:leaderboardId/users/:userId/rank')
  .get(validate(leaderboardValidation.getUserRank), leaderboardController.getUserRank);

// Admin routes
router
  .route('/:leaderboardId/reset')
  .post(validate(leaderboardValidation.resetLeaderboard), leaderboardController.resetLeaderboard);

export default router;