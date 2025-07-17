const httpStatus = require('http-status');
const mongoose = require('mongoose');

const { multiplayerGameService } = require('../services');
const { ApiError } = require('@platform/backend-core');
const { catchAsync } = require('@platform/backend-core');

/**
 * Create a multiplayer game
 */
const createGame = catchAsync(async (req, res) => {
  // For authenticated users, get user ID from auth payload
  let userId = null;

  // First, try to use the user from the authentication token
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
      console.log(`Using authenticated user ID: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
      userId = null;
    }
  }

  // For testing: allow explicit user ID in headers
  if (!userId && req.headers['x-user-id']) {
    try {
      userId = mongoose.Types.ObjectId(req.headers['x-user-id']);
      console.log(`Using X-User-ID header: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format in header: ${req.headers['x-user-id']}`, error);
    }
  }

  // For guest users, only use their username
  const guestUsername = req.headers['x-guest-username'];

  // If we have a guest username but no hostNickname in the body, use the guest username
  const gameData = { ...req.body };
  if (!gameData.hostNickname && guestUsername) {
    gameData.hostNickname = guestUsername;
  }

  // Log for debugging
  console.log(
    `Creating game. Auth user: ${userId ? userId.toString() : 'none'}, Guest username: ${
      guestUsername || 'none'
    }`
  );
  console.log('Game data:', JSON.stringify(gameData));

  const game = await multiplayerGameService.createGame(userId, gameData);
  res.status(httpStatus.CREATED).send({
    id: game.id,
    roomCode: game.roomCode,
    difficulty: game.difficulty,
    status: game.status,
    players: game.players.map((p) => ({
      userId: p.userId ? p.userId.toString() : null,
      username: p.username,
      isActive: p.isActive,
    })),
  });
});

/**
 * Join a multiplayer game
 */
const joinGame = catchAsync(async (req, res) => {
  const { roomCode } = req.params;

  // For authenticated users, get user ID from auth payload
  let userId = null;

  // First, try to use the user from the authentication token
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
      console.log(`Using authenticated user ID: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
      userId = null;
    }
  }

  // For testing: allow explicit user ID in headers
  if (!userId && req.headers['x-user-id']) {
    try {
      userId = mongoose.Types.ObjectId(req.headers['x-user-id']);
      console.log(`Using X-User-ID header: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format in header: ${req.headers['x-user-id']}`, error);
    }
  }

  // For guest users, use the username from headers or body
  let username = req.headers['x-guest-username'] || req.body.username;

  console.log(
    `Join game request. Room code: ${roomCode}, User ID: ${
      userId ? userId.toString() : 'none'
    }, Username: ${username || 'none'}`
  );

  const game = await multiplayerGameService.joinGame(roomCode, userId, username);
  res.send(game);
});

/**
 * Get game by ID
 */
const getGame = catchAsync(async (req, res) => {
  const { gameId } = req.params;

  // For authenticated users, get user ID from auth payload
  let userId = null;
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
      console.log(`Using authenticated user ID: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
    }
  }

  // For guest users, get identification from headers
  const guestUserId = req.headers['x-guest-user-id'];
  const guestUsername = req.headers['x-guest-username'];

  console.log(
    `Get game request. Game ID: ${gameId}, User ID: ${
      userId ? userId.toString() : 'none'
    }, Guest user ID: ${guestUserId || 'none'}, Guest username: ${guestUsername || 'none'}`
  );

  const game = await multiplayerGameService.getGameById(gameId);

  // Find the player in the game to check permissions
  // We'll also pass the guestUserId for more robust player identification
  const { playerIndex } = multiplayerGameService.findPlayerInGame(
    game,
    userId,
    guestUsername,
    guestUserId
  );

  if (playerIndex === -1) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You must be in the game to view it');
  }

  res.send(game);
});

/**
 * Get game by room code
 */
const getGameByRoomCode = catchAsync(async (req, res) => {
  const game = await multiplayerGameService.getGameByRoomCode(req.params.roomCode);
  if (!game) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }
  res.send(game);
});

/**
 * Start a multiplayer game
 */
const startGame = catchAsync(async (req, res) => {
  const { gameId } = req.params;

  // For authenticated users, get user ID from auth payload
  let userId = null;
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
    }
  }

  // For guest users, get identification from headers
  const guestUserId = req.headers['x-guest-user-id'];
  const guestUsername = req.headers['x-guest-username'];

  console.log(
    `Starting game: ${gameId}, User ID: ${userId ? userId.toString() : 'none'}, Guest user ID: ${
      guestUserId || 'none'
    }, Guest username: ${guestUsername || 'none'}`
  );

  // Start the game
  const game = await multiplayerGameService.startGame(gameId, userId, guestUsername, guestUserId);

  res.send(game);
});

/**
 * Place a card
 */
const placeCard = catchAsync(async (req, res) => {
  const { gameId } = req.params;
  const { cardId, position } = req.body;

  // For authenticated users, get user ID from auth payload
  let userId = null;
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
    }
  }

  // For guest users, get identification from headers
  const guestUserId = req.headers['x-guest-user-id'];
  const guestUsername = req.headers['x-guest-username'];

  console.log(
    `Placing card in game: ${gameId}, Card ID: ${cardId}, Position: ${position}, User ID: ${
      userId ? userId.toString() : 'none'
    }, Guest user ID: ${guestUserId || 'none'}, Guest username: ${guestUsername || 'none'}`
  );

  // Place the card
  const result = await multiplayerGameService.placeCard(
    gameId,
    userId,
    cardId,
    position,
    guestUsername,
    guestUserId
  );

  res.send(result);
});

/**
 * Leave a game
 */
const leaveGame = catchAsync(async (req, res) => {
  // For authenticated users, get user ID from auth payload
  let userId = null;
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
      console.log(`Using authenticated user ID: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
    }
  }

  // For guest users, we need to handle them by their username
  const guestUsername = req.headers['x-guest-username'];

  if (!userId && !guestUsername) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'You must be logged in or provide guest credentials'
    );
  }

  const game = await multiplayerGameService.leaveGame(
    req.params.gameId,
    userId,
    guestUsername // Pass the guest username for guest users
  );
  res.send(game);
});

/**
 * Get user games
 */
const getUserGames = catchAsync(async (req, res) => {
  let userId = null;
  if (req.user && req.user._id) {
    try {
      userId = mongoose.Types.ObjectId(req.user._id);
      console.log(`Using authenticated user ID: ${userId.toString()}`);
    } catch (error) {
      console.error(`Invalid user ID format: ${req.user._id}`, error);
    }
  }
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required to view games');
  }

  const games = await multiplayerGameService.getUserGames(userId);
  res.send(games);
});

module.exports = {
  createGame,
  getGame,
  getGameByRoomCode,
  joinGame,
  startGame,
  placeCard,
  leaveGame,
  getUserGames,
};
