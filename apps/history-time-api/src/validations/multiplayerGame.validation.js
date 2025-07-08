const Joi = require('joi');

const { objectId } = require('./custom.validation');

const createGame = {
  body: Joi.object().keys({
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
    categories: Joi.array().items(Joi.string()),
    maxPlayers: Joi.number().integer().min(2).max(8),
    hostNickname: Joi.string().max(50),
    gameMode: Joi.string().valid('timeline'),
  }),
};

const getGame = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId),
  }),
};

const getGameByRoomCode = {
  params: Joi.object().keys({
    roomCode: Joi.string().length(6).required(),
  }),
};

const joinGame = {
  params: Joi.object().keys({
    roomCode: Joi.string().length(6).required(),
  }),
  body: Joi.object().keys({
    username: Joi.string().max(50),
  }),
};

const startGame = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId),
  }),
};

const placeCard = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    cardId: Joi.string().custom(objectId).required(),
    position: Joi.number().integer().min(0).required(),
  }),
};

const leaveGame = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createGame,
  getGame,
  getGameByRoomCode,
  joinGame,
  startGame,
  placeCard,
  leaveGame,
};
