const httpStatus = require('http-status');
const { Match, Team } = require('../models');
const ApiError = require('../utils/ApiError');
const teamService = require('./team.service');

/**
 * Create a match
 * @param {Object} matchBody
 * @returns {Promise<Match>}
 */
const createMatch = async (matchBody) => {
  return Match.create(matchBody);
};

/**
 * Query for matches
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMatches = async (filter, options) => {
  const matches = await Match.paginate(filter, options);
  return matches;
};

/**
 * Get match by id
 * @param {ObjectId} id
 * @returns {Promise<Match>}
 */
const getMatchById = async (id) => {
  return Match.findById(id);
};

/**
 * Update match by id
 * @param {ObjectId} matchId
 * @param {Object} updateBody
 * @returns {Promise<Match>}
 */
const updateMatchById = async (matchId, updateBody) => {
  const match = await getMatchById(matchId);
  if (!match) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Match not found');
  }
  Object.assign(match, updateBody);
  await match.save();
  return match;
};

/**
 * Delete match by id
 * @param {ObjectId} matchId
 * @returns {Promise<Match>}
 */
const deleteMatchById = async (matchId) => {
  const match = await getMatchById(matchId);
  if (!match) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Match not found');
  }
  await match.remove();
  return match;
};

/**
 * Start a match
 * @param {ObjectId} matchId
 * @returns {Promise<Match>}
 */
const startMatch = async (matchId) => {
  const match = await getMatchById(matchId);
  if (!match) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Match not found');
  }
  if (match.matchState === Match.states.IN_PROGRESS) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Match already in progress');
  }
  if (match.matchState === Match.states.COMPLETED) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Match already completed');
  }
  return match.startMatch();
};

/**
 * End a match and update team stats
 * @param {ObjectId} matchId
 * @param {ObjectId} winningTeamId
 * @param {Object} matchStatistics
 * @returns {Promise<Match>}
 */
const endMatch = async (matchId, winningTeamId, matchStatistics = {}) => {
  const match = await getMatchById(matchId);
  if (!match) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Match not found');
  }
  
  if (match.matchState !== Match.states.IN_PROGRESS) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Match is not in progress');
  }
  
  // Verify the winning team is part of the match
  const isTeamInMatch = match.teams.some(teamId => teamId.toString() === winningTeamId.toString());
  if (!isTeamInMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Winning team not found in match');
  }
  
  // Update match statistics if provided
  if (matchStatistics && Object.keys(matchStatistics).length > 0) {
    Object.assign(match.matchStatistics, matchStatistics);
  }
  
  // End the match
  const updatedMatch = await match.endMatch(winningTeamId);
  
  // Update team stats for all teams in the match
  for (const teamId of match.teams) {
    const isWinner = teamId.toString() === winningTeamId.toString();
    const result = isWinner ? 'win' : 'loss';
    const opponentTeamIds = match.teams.filter(id => id.toString() !== teamId.toString());
    
    // Update team stats - we'll just use the first opponent for simplicity
    try {
      await teamService.updateTeamStats(
        teamId,
        { matchId: match.id, result },
        opponentTeamIds[0],
        match.scoreData[teamId] || 0
      );
    } catch (error) {
      console.error(`Failed to update stats for team ${teamId}:`, error);
      // Continue with other teams even if this one fails
    }
  }
  
  return updatedMatch;
};

/**
 * Get match statistics
 * @param {ObjectId} matchId
 * @returns {Promise<Object>}
 */
const getMatchStatistics = async (matchId) => {
  const match = await getMatchById(matchId);
  if (!match) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Match not found');
  }
  
  // Gather detailed statistics from the match
  const detailedStats = {
    matchId: match.id,
    court: match.court,
    gameMode: match.gameMode,
    duration: match.matchStatistics.matchDuration || 0,
    startedAt: match.startedAt,
    endedAt: match.endedAt,
    status: match.matchState,
    teams: [],
    totalThrows: match.matchStatistics.totalThrows || 0,
    totalCatches: match.matchStatistics.totalCatches || 0,
    totalHits: match.matchStatistics.totalHits || 0,
    totalDodges: match.matchStatistics.totalDodges || 0,
    mvpPlayerId: match.matchStatistics.mvpPlayerId,
  };
  
  // Add team details
  if (match.teams && match.teams.length > 0) {
    for (const teamId of match.teams) {
      const team = await Team.findById(teamId);
      if (team) {
        detailedStats.teams.push({
          teamId: team.id,
          name: team.name,
          color: team.color,
          score: match.scoreData[teamId] || 0,
          isWinner: match.winningTeamId && match.winningTeamId.toString() === teamId.toString(),
          members: team.members,
        });
      }
    }
  }
  
  return detailedStats;
};

module.exports = {
  createMatch,
  queryMatches,
  getMatchById,
  updateMatchById,
  deleteMatchById,
  startMatch,
  endMatch,
  getMatchStatistics,
};
