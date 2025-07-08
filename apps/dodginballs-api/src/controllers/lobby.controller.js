const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { lobbyService } = require('../services');

/**
 * Create a lobby
 * @public
 */
const createLobby = catchAsync(async (req, res) => {
  const lobby = await lobbyService.createLobby(req.body);
  res.status(httpStatus.CREATED).send(lobby);
});

/**
 * Get all lobbies
 * @public
 */
const getLobbies = catchAsync(async (req, res) => {
  const filter = {};
  
  // Apply filters based on query parameters
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.gameMode) {
    filter.gameMode = req.query.gameMode;
  }
  
  if (req.query.hostId) {
    // Assuming the host is the first player in the players array
    filter['players.0'] = req.query.hostId;
  }
  
  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: req.query.limit,
    page: req.query.page,
  };
  
  const result = await lobbyService.queryLobbies(filter, options);
  res.send(result);
});

/**
 * Get active lobbies
 * @public
 */
const getActiveLobbies = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const lobbies = await lobbyService.getActiveLobbies(limit);
  res.send(lobbies);
});

/**
 * Get lobby by id
 * @public
 */
const getLobby = catchAsync(async (req, res) => {
  const lobby = await lobbyService.getLobbyById(req.params.lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  res.send(lobby);
});

/**
 * Update lobby
 * @public
 */
const updateLobby = catchAsync(async (req, res) => {
  const lobby = await lobbyService.updateLobbyById(req.params.lobbyId, req.body);
  res.send(lobby);
});

/**
 * Delete lobby
 * @public
 */
const deleteLobby = catchAsync(async (req, res) => {
  await lobbyService.deleteLobbyById(req.params.lobbyId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Join a lobby
 * @public
 */
const joinLobby = catchAsync(async (req, res) => {
  const lobby = await lobbyService.joinLobby(req.params.lobbyId, req.user.id);
  res.send(lobby);
});

/**
 * Leave a lobby
 * @public
 */
const leaveLobby = catchAsync(async (req, res) => {
  const lobby = await lobbyService.leaveLobby(req.params.lobbyId, req.user.id);
  res.send(lobby);
});

/**
 * Start a match from a lobby
 * @public
 */
const startMatch = catchAsync(async (req, res) => {
  const match = await lobbyService.startMatchFromLobby(req.params.lobbyId, req.body);
  res.send(match);
});

/**
 * End a match in a lobby
 * @public
 */
const endMatch = catchAsync(async (req, res) => {
  const result = await lobbyService.endMatchInLobby(
    req.params.lobbyId,
    req.body.matchId,
    req.body.winningTeamId
  );
  res.send(result);
});

module.exports = {
  createLobby,
  getLobbies,
  getActiveLobbies,
  getLobby,
  updateLobby,
  deleteLobby,
  joinLobby,
  leaveLobby,
  startMatch,
  endMatch,
};
