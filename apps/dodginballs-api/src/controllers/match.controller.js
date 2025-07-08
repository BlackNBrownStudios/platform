const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { matchService } = require('../services');

/**
 * Create a match
 * @public
 */
const createMatch = catchAsync(async (req, res) => {
  const match = await matchService.createMatch(req.body);
  res.status(httpStatus.CREATED).send(match);
});

/**
 * Get all matches
 * @public
 */
const getMatches = catchAsync(async (req, res) => {
  const filter = {};
  
  // Apply filters based on query parameters
  if (req.query.gameMode) {
    filter.gameMode = req.query.gameMode;
  }
  
  if (req.query.matchState) {
    filter.matchState = req.query.matchState;
  }
  
  if (req.query.court) {
    filter.court = req.query.court;
  }
  
  if (req.query.playerIds) {
    const playerIds = Array.isArray(req.query.playerIds) 
      ? req.query.playerIds 
      : [req.query.playerIds];
    filter.players = { $in: playerIds };
  }
  
  if (req.query.teamIds) {
    const teamIds = Array.isArray(req.query.teamIds) 
      ? req.query.teamIds 
      : [req.query.teamIds];
    filter.teams = { $in: teamIds };
  }
  
  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: req.query.limit,
    page: req.query.page,
  };
  
  const result = await matchService.queryMatches(filter, options);
  res.send(result);
});

/**
 * Get match by id
 * @public
 */
const getMatch = catchAsync(async (req, res) => {
  const match = await matchService.getMatchById(req.params.matchId);
  if (!match) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Match not found');
  }
  res.send(match);
});

/**
 * Update match
 * @public
 */
const updateMatch = catchAsync(async (req, res) => {
  const match = await matchService.updateMatchById(req.params.matchId, req.body);
  res.send(match);
});

/**
 * Delete match
 * @public
 */
const deleteMatch = catchAsync(async (req, res) => {
  await matchService.deleteMatchById(req.params.matchId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Start a match
 * @public
 */
const startMatch = catchAsync(async (req, res) => {
  const match = await matchService.startMatch(req.params.matchId);
  res.send(match);
});

/**
 * End a match
 * @public
 */
const endMatch = catchAsync(async (req, res) => {
  const match = await matchService.endMatch(
    req.params.matchId,
    req.body.winningTeamId,
    req.body.matchStatistics
  );
  res.send(match);
});

/**
 * Get match statistics
 * @public
 */
const getMatchStatistics = catchAsync(async (req, res) => {
  const statistics = await matchService.getMatchStatistics(req.params.matchId);
  res.send(statistics);
});

module.exports = {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  endMatch,
  getMatchStatistics,
};
