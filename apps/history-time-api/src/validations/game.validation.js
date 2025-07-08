const Joi = require('joi');

const { objectId } = require('./custom.validation');

const createGame = {
  body: Joi.object().keys({
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').default('medium'),
    cardCount: Joi.number().integer().min(3).max(30).default(10),
    categories: Joi.array().items(Joi.string()),
    preloadImages: Joi.boolean().default(false),
  }),
};

const getGames = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    status: Joi.string().valid('in_progress', 'completed', 'abandoned'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    isWin: Joi.boolean(),
  }),
};

const getGame = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId),
  }),
};

const updateGame = {
  params: Joi.object().keys({
    gameId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('in_progress', 'completed', 'abandoned'),
    cardPlacement: Joi.object().keys({
      cardId: Joi.string().custom(objectId).required(),
      placementPosition: Joi.number().integer().required(),
      timeTaken: Joi.number().required(),
    }),
  }),
};

const endGame = {
  params: Joi.object().keys({
    gameId: Joi.required().custom(objectId),
  }),
};

const getLeaderboard = {
  query: Joi.object().keys({
    timeFrame: Joi.string().valid('all_time', 'monthly', 'weekly', 'daily').default('all_time'),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

const getUserStats = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createGame,
  getGames,
  getGame,
  updateGame,
  endGame,
  getLeaderboard,
  getUserStats,
};
