const httpStatus = require('http-status');
const mongoose = require('mongoose');

const logger = require('../config/logger');
const { Game, User, Card } = require('../models');
const { ApiError } = require('@platform/backend-core');

const cardService = require('./card.service');
const userService = require('./user.service');
// tempImageCacheService removed - replaced by new image services architecture

/**
 * Create a new game for a user or anonymous player
 * @param {ObjectId} userId - Optional, if not provided creates an anonymous game
 * @param {Object} gameOptions
 * @param {Boolean} preloadImages - Whether to preload images for cards
 * @returns {Promise<Object>} - Game object and image mapping
 */
const createGame = async (userId, gameOptions, preloadImages = false) => {
  const {
    difficulty = 'medium',
    cardCount = 10,
    categories = [],
    isDailyChallenge = false,
    dailyChallengeId = null,
  } = gameOptions;

  // Only validate user if userId is provided
  if (userId) {
    // Validate user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  }

  // Get random cards based on difficulty and optional category
  const category = categories.length > 0 ? { $in: categories } : undefined;
  const cards = await cardService.getRandomCards(difficulty, cardCount, category);

  if (cards.length < cardCount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Not enough cards available for the requested difficulty and categories. Found ${cards.length}, needed ${cardCount}`
    );
  }

  // Prepare game cards array with placement order
  const gameCards = cards.map((card, index) => {
    // Calculate the middle position (for odd numbers it's straightforward, for even we pick the lower middle)
    const middleIndex = Math.floor((cardCount - 1) / 2);

    // If this is the middle card, automatically place it in the middle position
    if (index === middleIndex) {
      return {
        cardId: card._id,
        placementOrder: index + 1,
        placementPosition: Math.ceil(cardCount / 2), // Middle position on timeline
        isCorrect: true, // It's automatically placed correctly
        timeTaken: 0, // No time for automatic placement
      };
    }

    // Otherwise, return card without placement
    return {
      cardId: card._id,
      placementOrder: index + 1,
    };
  });

  // Calculate max possible score for this game
  const maxPossibleScore = Game.schema.statics.calculateScore(
    cardCount - 1, // All cards placed correctly (one is auto-placed)
    cardCount,
    30, // Assume 30 seconds per card as perfect time
    difficulty
  );

  // Create the game
  const game = await Game.create({
    userId, // Will be undefined for anonymous games
    cards: gameCards,
    difficulty,
    status: 'in_progress',
    categories: categories.length > 0 ? categories : undefined,
    timeStarted: new Date(),
    isDailyChallenge,
    dailyChallengeId,
    maxPossibleScore,
  });

  // Image preloading removed - replaced by new image services architecture that uses instant SVG fallbacks
  let imageMapping = null;

  return { game, imageMapping };
};

/**
 * Query for games
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryGames = async (filter, options) => {
  const games = await Game.paginate(filter, options);
  return games;
};

/**
 * Get game by id
 * @param {ObjectId} id
 * @returns {Promise<Game>}
 */
const getGameById = async (id) => {
  return Game.findById(id).populate({
    path: 'cards.cardId',
    select: 'title description date year imageUrl category difficulty',
  });
};

/**
 * Update game card placement
 * @param {ObjectId} gameId
 * @param {Object} placementData
 * @returns {Promise<Game>}
 */
const updateCardPlacement = async (gameId, placementData) => {
  const { cardId, placementPosition, timeTaken } = placementData;

  const game = await getGameById(gameId);
  if (!game) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }

  if (game.status !== 'in_progress') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a completed or abandoned game');
  }

  // Find the card in the game - handle both populated objects and string IDs
  const cardIndex = game.cards.findIndex((card) => {
    // If cardId is an object with an id property
    if (card.cardId && typeof card.cardId === 'object' && card.cardId.id) {
      return card.cardId.id === cardId;
    }
    // If cardId is a string or ObjectId
    return card.cardId.toString() === cardId;
  });

  if (cardIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Card not found in this game');
  }

  // Get all cards in chronological order to check placement correctness
  const cardIds = game.cards.map((card) => {
    // Handle both object and string cases
    return typeof card.cardId === 'object' && card.cardId.id
      ? card.cardId.id
      : card.cardId.toString();
  });

  const allCards = await Card.find({ _id: { $in: cardIds } }).sort({ year: 1 });

  // Find the correct position for this card
  const correctPosition = allCards.findIndex((card) => card.id === cardId) + 1;

  // Update the card placement
  game.cards[cardIndex].placementPosition = placementPosition;
  game.cards[cardIndex].timeTaken = timeTaken;
  game.cards[cardIndex].isCorrect = correctPosition === placementPosition;

  await game.save();
  return game;
};

/**
 * End the game and calculate final score
 * @param {ObjectId} gameId
 * @returns {Promise<Game>}
 */
const endGame = async (gameId) => {
  const game = await getGameById(gameId);

  if (!game) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }

  if (game.status === 'completed') {
    return game; // Game is already completed
  }

  // Calculate the final score
  const totalCards = game.cards.length;
  const correctPlacements = game.cards.filter((card) => card.isCorrect).length;
  const incorrectPlacements = game.cards.filter(
    (card) => card.placementPosition !== null && !card.isCorrect
  ).length;
  const unplacedCards = game.cards.filter((card) => card.placementPosition === null).length;

  // Calculate score as percentage of correct placements
  const scorePercentage = Math.round((correctPlacements / (totalCards - 1)) * 100); // -1 for the pre-placed card

  // Check if the game is a win (all cards placed correctly)
  const isWin = unplacedCards === 0 && incorrectPlacements === 0;

  // Update game with final statistics
  const updatedGame = await Game.findByIdAndUpdate(
    gameId,
    {
      status: 'completed',
      score: scorePercentage,
      correctPlacements,
      incorrectPlacements,
      timeEnded: new Date(),
      totalTimeTaken: Math.round((new Date() - new Date(game.timeStarted)) / 1000), // in seconds
      isWin,
    },
    { new: true }
  ).populate({
    path: 'cards.cardId',
    select: 'title description date year imageUrl category difficulty',
  });

  // Temporary image cleanup removed - replaced by new image services architecture

  return updatedGame;
};

/**
 * Abandon a game in progress
 * @param {ObjectId} gameId
 * @returns {Promise<Game>}
 */
const abandonGame = async (gameId) => {
  const game = await getGameById(gameId);

  if (!game) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }

  if (game.status !== 'in_progress') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only in-progress games can be abandoned');
  }

  // Update game as abandoned
  const updatedGame = await Game.findByIdAndUpdate(
    gameId,
    {
      status: 'abandoned',
      timeEnded: new Date(),
      totalTimeTaken: Math.round((new Date() - new Date(game.timeStarted)) / 1000), // in seconds
    },
    { new: true }
  ).populate({
    path: 'cards.cardId',
    select: 'title description date year imageUrl category difficulty',
  });

  // Temporary image cleanup removed - replaced by new image services architecture

  return updatedGame;
};

/**
 * Get leaderboard
 * @param {Object} options - Leaderboard options
 * @returns {Promise<Array>}
 */
const getLeaderboard = async (options) => {
  const { timeFrame = 'all_time', difficulty, limit = 10 } = options;

  // Build time filter if needed
  let timeFilter = {};
  if (timeFrame !== 'all_time') {
    const now = new Date();
    let startDate;

    switch (timeFrame) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      timeFilter = { timeEnded: { $gte: startDate } };
    }
  }

  // Build difficulty filter if needed
  const difficultyFilter = difficulty ? { difficulty } : {};

  // Combine all filters
  const filter = {
    status: 'completed',
    isWin: true,
    ...timeFilter,
    ...difficultyFilter,
  };

  // Get top scores
  const leaderboard = await Game.find(filter)
    .sort({ score: -1 })
    .limit(limit)
    .populate('userId', 'name')
    .lean();

  return leaderboard;
};

/**
 * Get user's game history
 * @param {ObjectId} userId
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getUserGameHistory = async (userId, options = {}) => {
  const filter = { userId };
  const games = await queryGames(filter, options);
  return games;
};

/**
 * Get counts of user's games by status
 * @param {ObjectId} userId
 * @returns {Promise<Object>} Object containing counts of total, completed, and abandoned games
 */
const getUserGameCounts = async (userId) => {
  const counts = await Game.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert the result to a more usable format
  const result = {
    totalGames: 0,
    completedGames: 0,
    abandonedGames: 0,
  };

  counts.forEach((item) => {
    result.totalGames += item.count;
    if (item._id === 'completed') {
      result.completedGames = item.count;
    } else if (item._id === 'abandoned') {
      result.abandonedGames = item.count;
    }
  });

  return result;
};

/**
 * Get user's best score
 * @param {ObjectId} userId
 * @returns {Promise<Number>} The highest score achieved by the user
 */
const getUserBestScore = async (userId) => {
  const result = await Game.findOne(
    { userId: userId, status: 'completed' },
    { score: 1 },
    { sort: { score: -1 } }
  );

  return result ? result.score : 0;
};

/**
 * Get user's average score
 * @param {ObjectId} userId
 * @returns {Promise<Number>} The average score of completed games
 */
const getUserAverageScore = async (userId) => {
  const result = await Game.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
      },
    },
  ]);

  return result.length > 0 ? Math.round(result[0].averageScore) : 0;
};

/**
 * Get user's total play time across all games
 * @param {ObjectId} userId
 * @returns {Promise<Number>} Total time in seconds
 */
const getUserTotalPlayTime = async (userId) => {
  const result = await Game.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTime: { $sum: '$totalTimeTaken' },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalTime : 0;
};

/**
 * Get user's favorite (most played) category
 * @param {ObjectId} userId
 * @returns {Promise<String>} The name of the most played category
 */
const getUserFavoriteCategory = async (userId) => {
  // First, find all categories from user's games
  const games = await Game.find({ userId: userId });

  // If no games, return null
  if (games.length === 0) {
    return null;
  }

  // Count category occurrences
  const categoryCount = {};
  games.forEach((game) => {
    if (game.categories && game.categories.length > 0) {
      game.categories.forEach((category) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    }
  });

  // Find the most common category
  let favoriteCategory = null;
  let maxCount = 0;

  for (const [category, count] of Object.entries(categoryCount)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = category;
    }
  }

  return favoriteCategory;
};

/**
 * Get user's recent games with details
 * @param {ObjectId} userId
 * @param {Number} limit - Number of games to return
 * @returns {Promise<Array>} Array of recent games with details
 */
const getUserRecentGames = async (userId, limit = 10) => {
  const games = await Game.find({ userId: userId })
    .sort({ timeStarted: -1 })
    .limit(limit)
    .populate({
      path: 'cards.cardId',
      select: 'title date year imageUrl category',
    });

  // Format the games for display
  return games.map((game) => ({
    id: game._id,
    date: game.timeStarted,
    status: game.status,
    score: game.score,
    timeTaken: game.totalTimeTaken,
    difficulty: game.difficulty,
    categories: game.categories,
    correctCards: game.cards.filter((card) => card.isCorrect).length,
    totalCards: game.cards.length,
  }));
};

module.exports = {
  createGame,
  queryGames,
  getGameById,
  updateCardPlacement,
  endGame,
  abandonGame,
  getLeaderboard,
  getUserGameHistory,
  getUserGameCounts,
  getUserBestScore,
  getUserAverageScore,
  getUserTotalPlayTime,
  getUserFavoriteCategory,
  getUserRecentGames,
};
