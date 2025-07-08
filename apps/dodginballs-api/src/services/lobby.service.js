const httpStatus = require('http-status');
const { Lobby, User } = require('../models');
const ApiError = require('../utils/ApiError');
const matchService = require('./match.service');

/**
 * Create a lobby
 * @param {Object} lobbyBody
 * @returns {Promise<Lobby>}
 */
const createLobby = async (lobbyBody) => {
  return Lobby.create(lobbyBody);
};

/**
 * Query for lobbies
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryLobbies = async (filter, options) => {
  const lobbies = await Lobby.paginate(filter, options);
  return lobbies;
};

/**
 * Get lobby by id
 * @param {ObjectId} id
 * @returns {Promise<Lobby>}
 */
const getLobbyById = async (id) => {
  return Lobby.findById(id);
};

/**
 * Get active lobbies
 * @param {number} limit - Max number of lobbies to return
 * @returns {Promise<Array<Lobby>>}
 */
const getActiveLobbies = async (limit = 10) => {
  return Lobby.find({ status: Lobby.status.WAITING })
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Update lobby by id
 * @param {ObjectId} lobbyId
 * @param {Object} updateBody
 * @returns {Promise<Lobby>}
 */
const updateLobbyById = async (lobbyId, updateBody) => {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  Object.assign(lobby, updateBody);
  await lobby.save();
  return lobby;
};

/**
 * Delete lobby by id
 * @param {ObjectId} lobbyId
 * @returns {Promise<Lobby>}
 */
const deleteLobbyById = async (lobbyId) => {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  await lobby.remove();
  return lobby;
};

/**
 * Join a lobby
 * @param {ObjectId} lobbyId
 * @param {ObjectId} userId
 * @returns {Promise<Lobby>}
 */
const joinLobby = async (lobbyId, userId) => {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  
  if (lobby.status !== Lobby.status.WAITING) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Lobby is not open for joining');
  }
  
  // Check if player already in lobby
  if (lobby.players.some(playerId => playerId.toString() === userId.toString())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Player already in lobby');
  }
  
  // Check if lobby is full
  if (lobby.players.length >= lobby.maxPlayers) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Lobby is full');
  }
  
  // Add player to lobby
  lobby.players.push(userId);
  
  // Check if lobby is now full and update status if needed
  if (lobby.players.length === lobby.maxPlayers) {
    lobby.status = Lobby.status.FULL;
  }
  
  await lobby.save();
  return lobby;
};

/**
 * Leave a lobby
 * @param {ObjectId} lobbyId
 * @param {ObjectId} userId
 * @returns {Promise<Lobby>}
 */
const leaveLobby = async (lobbyId, userId) => {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  
  // Check if player in lobby
  if (!lobby.players.some(playerId => playerId.toString() === userId.toString())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Player not in lobby');
  }
  
  // Check if user is the host (first player)
  const isHost = lobby.players[0].toString() === userId.toString();
  
  if (isHost && lobby.players.length > 1) {
    // If host leaves and there are other players, transfer host to next player
    lobby.players = lobby.players.filter(playerId => playerId.toString() !== userId.toString());
  } else if (isHost) {
    // If host leaves and is the only player, close the lobby
    return deleteLobbyById(lobbyId);
  } else {
    // Remove player from lobby
    lobby.players = lobby.players.filter(playerId => playerId.toString() !== userId.toString());
  }
  
  // Update lobby status if it was full
  if (lobby.status === Lobby.status.FULL) {
    lobby.status = Lobby.status.WAITING;
  }
  
  await lobby.save();
  return lobby;
};

/**
 * Start a match from a lobby
 * @param {ObjectId} lobbyId
 * @param {Object} matchSettings - Additional match settings
 * @returns {Promise<Match>}
 */
const startMatchFromLobby = async (lobbyId, matchSettings = {}) => {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  
  // Check if lobby has enough players
  if (lobby.players.length < lobby.minPlayers) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough players to start match');
  }
  
  // Create match based on lobby settings
  const matchBody = {
    gameMode: lobby.gameMode,
    players: lobby.players,
    teams: lobby.teams || [],
    settings: {
      ...lobby.settings,
      ...matchSettings,
    },
    lobbyId: lobby.id,
  };
  
  const match = await matchService.createMatch(matchBody);
  
  // Update lobby status
  lobby.status = Lobby.status.IN_GAME;
  lobby.currentMatchId = match.id;
  await lobby.save();
  
  // Start the match
  await matchService.startMatch(match.id);
  
  return match;
};

/**
 * End a match and update lobby
 * @param {ObjectId} lobbyId
 * @param {ObjectId} matchId
 * @param {ObjectId} winningTeamId
 * @returns {Promise<Object>}
 */
const endMatchInLobby = async (lobbyId, matchId, winningTeamId) => {
  const lobby = await getLobbyById(lobbyId);
  if (!lobby) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lobby not found');
  }
  
  if (lobby.currentMatchId.toString() !== matchId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Match ID does not match current lobby match');
  }
  
  // End the match
  const match = await matchService.endMatch(matchId, winningTeamId);
  
  // Update lobby status
  lobby.status = Lobby.status.WAITING;
  lobby.previousMatchId = matchId;
  lobby.currentMatchId = null;
  await lobby.save();
  
  return { lobby, match };
};

module.exports = {
  createLobby,
  queryLobbies,
  getLobbyById,
  getActiveLobbies,
  updateLobbyById,
  deleteLobbyById,
  joinLobby,
  leaveLobby,
  startMatchFromLobby,
  endMatchInLobby,
};
