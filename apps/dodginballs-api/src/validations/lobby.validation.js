const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createLobby = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(30),
    host: Joi.string().custom(objectId).required(),
    maxPlayers: Joi.number().integer().min(2).max(8),
    isPrivate: Joi.boolean(),
    region: Joi.string(),
    gameSettings: Joi.object().keys({
      gameMode: Joi.string().valid('standard', 'tournament', 'practice', 'custom'),
      teamSize: Joi.number().integer().min(1).max(4),
      duration: Joi.number().integer().min(60).max(1800),
      court: Joi.string(),
      customRules: Joi.object()
    }),
  }),
};

const getLobbies = {
  query: Joi.object().keys({
    name: Joi.string(),
    host: Joi.string().custom(objectId),
    status: Joi.string().valid('waiting', 'in_progress', 'finished', 'cancelled'),
    isPrivate: Joi.boolean(),
    region: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLobby = {
  params: Joi.object().keys({
    lobbyId: Joi.string().custom(objectId),
  }),
};

const updateLobby = {
  params: Joi.object().keys({
    lobbyId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(30),
      host: Joi.string().custom(objectId),
      status: Joi.string().valid('waiting', 'in_progress', 'finished', 'cancelled'),
      maxPlayers: Joi.number().integer().min(2).max(8),
      isPrivate: Joi.boolean(),
      region: Joi.string(),
      gameSettings: Joi.object().keys({
        gameMode: Joi.string().valid('standard', 'tournament', 'practice', 'custom'),
        teamSize: Joi.number().integer().min(1).max(4),
        duration: Joi.number().integer().min(60).max(1800),
        court: Joi.string(),
        customRules: Joi.object()
      }),
    })
    .min(1),
};

const deleteLobby = {
  params: Joi.object().keys({
    lobbyId: Joi.string().custom(objectId),
  }),
};

const joinLobby = {
  params: Joi.object().keys({
    lobbyId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    inviteCode: Joi.string().when('isPrivate', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

const leaveLobby = {
  params: Joi.object().keys({
    lobbyId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

const startGame = {
  params: Joi.object().keys({
    lobbyId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    matchId: Joi.string().custom(objectId).required(),
  }),
};

const sendChatMessage = {
  params: Joi.object().keys({
    lobbyId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    message: Joi.string().required().max(200),
  }),
};

module.exports = {
  createLobby,
  getLobbies,
  getLobby,
  updateLobby,
  deleteLobby,
  joinLobby,
  leaveLobby,
  startGame,
  sendChatMessage,
};
