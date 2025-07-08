const Joi = require('joi');

const { objectId } = require('./custom.validation');

const createChallenge = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').default('medium'),
    cardCount: Joi.number().integer().min(3).max(20).default(5),
    categories: Joi.array().items(Joi.string()),
    rewardCoins: Joi.number().integer().min(1).default(25),
    specialReward: Joi.object().keys({
      itemType: Joi.string().valid('borders', 'themes', 'cardBacks', 'none').default('none'),
      itemId: Joi.string().allow(''),
    }),
    date: Joi.date(),
    setAsToday: Joi.boolean().default(false),
    active: Joi.boolean().default(true),
  }),
};

const getChallenges = {
  query: Joi.object().keys({
    active: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getChallenge = {
  params: Joi.object().keys({
    challengeId: Joi.string().custom(objectId),
  }),
};

const updateChallenge = {
  params: Joi.object().keys({
    challengeId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
      cardCount: Joi.number().integer().min(3).max(20),
      categories: Joi.array().items(Joi.string()),
      rewardCoins: Joi.number().integer().min(1),
      specialReward: Joi.object().keys({
        itemType: Joi.string().valid('borders', 'themes', 'cardBacks', 'none'),
        itemId: Joi.string().allow(''),
      }),
      date: Joi.date(),
      setAsToday: Joi.boolean(),
      active: Joi.boolean(),
    })
    .min(1),
};

const deleteChallenge = {
  params: Joi.object().keys({
    challengeId: Joi.string().custom(objectId),
  }),
};

const startDailyChallenge = {
  body: Joi.object().keys({
    preloadImages: Joi.boolean().default(false),
  }),
};

const completeDailyChallenge = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createChallenge,
  getChallenges,
  getChallenge,
  updateChallenge,
  deleteChallenge,
  startDailyChallenge,
  completeDailyChallenge,
};
