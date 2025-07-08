const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { teamService } = require('../services');

/**
 * Create a team
 * @public
 */
const createTeam = catchAsync(async (req, res) => {
  const team = await teamService.createTeam(req.body);
  res.status(httpStatus.CREATED).send(team);
});

/**
 * Get all teams
 * @public
 */
const getTeams = catchAsync(async (req, res) => {
  const filter = req.query.name ? { name: { $regex: req.query.name, $options: 'i' } } : {};
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await teamService.queryTeams(filter, options);
  res.send(result);
});

/**
 * Get team by id
 * @public
 */
const getTeam = catchAsync(async (req, res) => {
  const team = await teamService.getTeamById(req.params.teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  res.send(team);
});

/**
 * Update team
 * @public
 */
const updateTeam = catchAsync(async (req, res) => {
  const team = await teamService.updateTeamById(req.params.teamId, req.body);
  res.send(team);
});

/**
 * Delete team
 * @public
 */
const deleteTeam = catchAsync(async (req, res) => {
  await teamService.deleteTeamById(req.params.teamId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Add member to team
 * @public
 */
const addTeamMember = catchAsync(async (req, res) => {
  const team = await teamService.addTeamMember(req.params.teamId, req.body.userId);
  res.send(team);
});

/**
 * Remove member from team
 * @public
 */
const removeTeamMember = catchAsync(async (req, res) => {
  const team = await teamService.removeTeamMember(req.params.teamId, req.params.userId);
  res.send(team);
});

/**
 * Get team statistics
 * @public
 */
const getTeamStats = catchAsync(async (req, res) => {
  const team = await teamService.getTeamById(req.params.teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  res.send(team.stats);
});

/**
 * Update team statistics
 * @public
 */
const updateTeamStats = catchAsync(async (req, res) => {
  const team = await teamService.updateTeamStats(
    req.params.teamId, 
    req.body.matchResult, 
    req.body.opponentTeamId, 
    req.body.score
  );
  res.send(team.stats);
});

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamStats,
  updateTeamStats,
};
