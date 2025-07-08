const Joi = require('joi');

const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().valid('user', 'admin'),
    preferences: Joi.object().keys({
      historicalPeriodPreferences: Joi.array().items(Joi.string()),
      difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
      theme: Joi.string(),
    }),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      preferences: Joi.object().keys({
        historicalPeriodPreferences: Joi.array().items(Joi.string()),
        difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
        theme: Joi.string(),
      }),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getUserStats = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

/**
 * Profile validation schemas
 * Used for consistent validation across web and mobile platforms
 */

const updateUserProfile = {
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(100),
      email: Joi.string().email(),
      bio: Joi.string().max(500),
      preferredCategory: Joi.string().max(50),
    })
    .min(1),
};

const getUserGames = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50),
    page: Joi.number().integer().min(1),
    status: Joi.string().valid('in_progress', 'completed', 'abandoned'),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserProfile,
  getUserGames,
};
