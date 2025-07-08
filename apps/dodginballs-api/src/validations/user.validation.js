const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().valid('user', 'admin', 'dataAnalyst'),
    profilePicture: Joi.string(),
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
      profilePicture: Joi.string(),
      stats: Joi.object({
        gamesPlayed: Joi.number(),
        gamesWon: Joi.number(),
        totalScore: Joi.number(),
        highScore: Joi.number(),
      }),
    })
    .min(1),
};

const updateProfile = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      profilePicture: Joi.string(),
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

const updateUserStats = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      gamesPlayed: Joi.number(),
      gamesWon: Joi.number(),
      totalScore: Joi.number(),
      highScore: Joi.number(),
      throws: Joi.number(),
      catches: Joi.number(),
      hits: Joi.number(),
      dodges: Joi.number(),
    })
    .min(1),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateProfile,
  deleteUser,
  getUserStats,
  updateUserStats,
};
