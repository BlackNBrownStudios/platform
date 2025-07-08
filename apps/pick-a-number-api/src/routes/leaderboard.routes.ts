import { Router } from 'express';
import { catchAsync } from '@platform/backend-core';
import { GameService } from '../services/game.service';

const router: Router = Router();
const gameService = new GameService();

// Get leaderboard (public route)
router.get(
  '/',
  catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gameService.getLeaderboard(limit);
    
    res.json({
      success: true,
      leaderboard,
    });
  })
);

export { router as leaderboardRoutes };