import { Router } from 'express';
import { auth, catchAsync, validate } from '@platform/backend-core';
import { GameService } from '../services/game.service';
import { gameValidation } from '../validations/game.validation';

const router = Router();
const gameService = new GameService();

// All routes require authentication
router.use(auth());

// Start a new game
router.post(
  '/start',
  catchAsync(async (req: any, res) => {
    const game = await gameService.startNewGame(req.user.id);
    res.status(201).json({
      success: true,
      game: {
        id: game._id,
        attempts: game.attempts,
        isActive: game.isActive,
        startedAt: game.startedAt,
      },
    });
  })
);

// Make a guess
router.post(
  '/:gameId/guess',
  validate(gameValidation.makeGuess),
  catchAsync(async (req: any, res) => {
    const { game, result, message } = await gameService.makeGuess(
      req.params.gameId,
      req.user.id,
      req.body.guess
    );

    res.json({
      success: true,
      result,
      message,
      game: {
        id: game._id,
        attempts: game.attempts,
        isActive: game.isActive,
        isWon: game.isWon,
        score: game.score,
        targetNumber: game.isActive ? undefined : game.targetNumber,
      },
    });
  })
);

// Get active game
router.get(
  '/active',
  catchAsync(async (req: any, res) => {
    const game = await gameService.getActiveGame(req.user.id);
    
    if (!game) {
      res.json({
        success: true,
        game: null,
      });
      return;
    }

    res.json({
      success: true,
      game: {
        id: game._id,
        attempts: game.attempts,
        isActive: game.isActive,
        startedAt: game.startedAt,
      },
    });
  })
);

// Get game history
router.get(
  '/history',
  catchAsync(async (req: any, res) => {
    const games = await gameService.getGameHistory(req.user.id);
    
    res.json({
      success: true,
      games: games.map(game => ({
        id: game._id,
        attempts: game.attempts,
        targetNumber: game.targetNumber,
        isWon: game.isWon,
        score: game.score,
        completedAt: game.completedAt,
      })),
    });
  })
);

// Give up on current game
router.post(
  '/:gameId/giveup',
  catchAsync(async (req: any, res) => {
    const game = await gameService.giveUp(req.params.gameId, req.user.id);
    
    res.json({
      success: true,
      message: `The number was ${game.targetNumber}. Better luck next time!`,
      game: {
        id: game._id,
        targetNumber: game.targetNumber,
        attempts: game.attempts,
        isActive: game.isActive,
      },
    });
  })
);

export { router as gameRoutes };