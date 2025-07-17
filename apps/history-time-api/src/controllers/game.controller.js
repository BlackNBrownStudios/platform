const httpStatus = require('http-status');

const { gameService, emailService, userService } = require('../services');
const { ApiError } = require('@platform/backend-core');
const { catchAsync } = require('@platform/backend-core');
const pick = require('../utils/pick');

const createGame = catchAsync(async (req, res) => {
  // Support both authenticated and anonymous users
  const userId = req.user ? req.user.id : undefined;

  // Check if client wants to preload images (added to request body or query parameter)
  const preloadImages = req.body.preloadImages || req.query.preloadImages === 'true';

  // Remove preloadImages from gameOptions before passing to service
  const gameOptions = { ...req.body };
  delete gameOptions.preloadImages;

  // Create game with image preloading if requested
  const { game, imageMapping } = await gameService.createGame(userId, gameOptions, preloadImages);

  // Return game with image mapping if available
  if (imageMapping) {
    res.status(httpStatus.CREATED).send({ game, imageMapping });
  } else {
    res.status(httpStatus.CREATED).send(game);
  }
});

const getGames = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userId', 'status', 'isWin']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await gameService.queryGames(filter, options);
  res.send(result);
});

const getGame = catchAsync(async (req, res) => {
  const game = await gameService.getGameById(req.params.gameId);
  if (!game) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }
  res.send(game);
});

const updateGame = catchAsync(async (req, res) => {
  if (req.body.cardPlacement) {
    const game = await gameService.updateCardPlacement(req.params.gameId, req.body.cardPlacement);
    res.send(game);
  } else if (req.body.status) {
    // Handle status updates
    if (req.body.status === 'abandoned') {
      const game = await gameService.abandonGame(req.params.gameId);
      res.send(game);
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status update');
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid update data');
  }
});

const endGame = catchAsync(async (req, res) => {
  const game = await gameService.endGame(req.params.gameId);
  res.send(game);

  // Send game summary email in background (if user has email)
  try {
    const user = await userService.getUserById(game.userId);
    if (user && user.email) {
      const gameData = {
        score: game.score,
        correctPlacements: game.correctPlacements,
        totalCards: game.cards.length,
        timeTaken: game.totalTimeTaken,
        isWin: game.isWin,
      };
      emailService.sendGameSummaryEmail(user.email, gameData).catch((error) => {
        console.error('Error sending game summary email:', error);
      });
    }
  } catch (error) {
    console.error('Error preparing game summary email:', error);
  }
});

const abandonGame = catchAsync(async (req, res) => {
  const game = await gameService.abandonGame(req.params.gameId);
  res.send(game);
});

const getLeaderboard = catchAsync(async (req, res) => {
  const options = pick(req.query, ['timeFrame', 'difficulty', 'limit']);
  const leaderboard = await gameService.getLeaderboard(options);
  res.send(leaderboard);
});

const getUserGameHistory = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const history = await gameService.getUserGameHistory(req.params.userId, options);
  res.send(history);
});

module.exports = {
  createGame,
  getGames,
  getGame,
  updateGame,
  endGame,
  abandonGame,
  getLeaderboard,
  getUserGameHistory,
};
