import Joi from 'joi';

const createLeaderboard = {
  body: Joi.object().keys({
    gameId: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().optional(),
    type: Joi.string().valid('global', 'daily', 'weekly', 'monthly', 'alltime').default('global'),
    scoreType: Joi.string().valid('highest', 'lowest', 'cumulative').default('highest'),
    resetSchedule: Joi.string().optional(),
    metadata: Joi.object().optional(),
  }),
};

const getLeaderboards = {
  query: Joi.object().keys({
    gameId: Joi.string(),
    type: Joi.string().valid('global', 'daily', 'weekly', 'monthly', 'alltime'),
    isActive: Joi.boolean(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
    sortBy: Joi.string(),
  }),
};

const updateScore = {
  body: Joi.object().keys({
    score: Joi.number().required(),
    metadata: Joi.object().optional(),
  }),
  params: Joi.object().keys({
    leaderboardId: Joi.string().required(),
  }),
};

const getRankings = {
  params: Joi.object().keys({
    leaderboardId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100).default(100),
    page: Joi.number().integer().min(1).default(1),
    nearUserId: Joi.string().optional(),
  }),
};

const getUserRank = {
  params: Joi.object().keys({
    leaderboardId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};

const resetLeaderboard = {
  params: Joi.object().keys({
    leaderboardId: Joi.string().required(),
  }),
};

const deleteLeaderboard = {
  params: Joi.object().keys({
    leaderboardId: Joi.string().required(),
  }),
};

export default {
  createLeaderboard,
  getLeaderboards,
  updateScore,
  getRankings,
  getUserRank,
  resetLeaderboard,
  deleteLeaderboard,
};