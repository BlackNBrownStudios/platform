const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMatch = {
  body: Joi.object().keys({
    court: Joi.string().required(),
    teams: Joi.array().items(Joi.string().custom(objectId)).min(2).required(),
    gameMode: Joi.string().valid('standard', 'tournament', 'practice', 'custom'),
    scoreData: Joi.object(),
    matchStatistics: Joi.object(),
  }),
};

const getMatches = {
  query: Joi.object().keys({
    court: Joi.string(),
    matchState: Joi.number().integer().min(0).max(3),
    teamId: Joi.string().custom(objectId),
    winningTeamId: Joi.string().custom(objectId),
    gameMode: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMatch = {
  params: Joi.object().keys({
    matchId: Joi.string().custom(objectId),
  }),
};

const updateMatch = {
  params: Joi.object().keys({
    matchId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      court: Joi.string(),
      matchState: Joi.number().integer().min(0).max(3),
      winningTeamId: Joi.string().custom(objectId),
      losingTeamId: Joi.string().custom(objectId),
      teams: Joi.array().items(Joi.string().custom(objectId)),
      startedAt: Joi.date(),
      endedAt: Joi.date(),
      gameMode: Joi.string().valid('standard', 'tournament', 'practice', 'custom'),
      scoreData: Joi.object(),
      matchStatistics: Joi.object(),
    })
    .min(1),
};

const deleteMatch = {
  params: Joi.object().keys({
    matchId: Joi.string().custom(objectId),
  }),
};

const startMatch = {
  params: Joi.object().keys({
    matchId: Joi.string().custom(objectId),
  }),
};

const endMatch = {
  params: Joi.object().keys({
    matchId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    winningTeamId: Joi.string().custom(objectId).required(),
    matchStatistics: Joi.object(),
  }),
};

module.exports = {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  endMatch,
};
