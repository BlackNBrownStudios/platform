const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

/**
 * Create a user
 * @public
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

/**
 * Get all users
 * @public
 */
const getUsers = catchAsync(async (req, res) => {
  const filter = req.query.name ? { name: { $regex: req.query.name, $options: 'i' } } : {};
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await userService.queryUsers(filter, options);
  // Enhance each user's statistics to include teamWins, totalWins, losses, totalLosses, rank
  const { Team } = require('../models');
  const enhancedResults = await Promise.all(result.results.map(async (user) => {
    let teamWins = 0;
    let totalWins = 0;
    let losses = 0;
    let totalLosses = 0;
    let rank = 1; // Placeholder
    if (user && user._id) {
      const team = await Team.findOne({ members: user._id });
      if (team && team.statistics) {
        teamWins = team.statistics.wins || 0;
        losses = team.statistics.losses || 0;
      }
      totalWins = (user.statistics?.gamesWon || 0) + teamWins;
      totalLosses = (user.statistics?.losses || 0) + losses;
    }
    return {
      ...user.toObject(),
      statistics: {
        ...(user.statistics || { gamesPlayed: 0, gamesWon: 0, totalScore: 0, highScore: 0, losses: 0 }),
        teamWins,
        totalWins,
        losses,
        totalLosses,
        rank
      }
    };
  }));
  res.send({ ...result, results: enhancedResults });
});

/**
 * Get user by id
 * @public
 */
const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // Compose enhanced statistics for compatibility
  const { Team } = require('../models');
  // Find the first team the user is a member of (every user should have a team)
  let teamWins = 0;
  let totalWins = 0;
  let losses = 0;
  let totalLosses = 0;
  let rank = 1; // Placeholder, implement real logic as needed
  if (user && user._id) {
    const team = await Team.findOne({ members: user._id });
    if (team && team.statistics) {
      teamWins = team.statistics.wins || 0;
      losses = team.statistics.losses || 0;
    }
    totalWins = (user.statistics?.gamesWon || 0) + teamWins;
    totalLosses = (user.statistics?.losses || 0) + losses;
  }
  const statistics = {
    ...(user.statistics || { gamesPlayed: 0, gamesWon: 0, totalScore: 0, highScore: 0, losses: 0 }),
    teamWins,
    totalWins,
    losses,
    totalLosses,
    rank
  };
  
  // Convert to object and explicitly remove password
  const userObj = user.toObject();
  delete userObj.password;
  
  res.send({
    ...userObj,
    statistics
  });
});

/**
 * Update user
 * @public
 */
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

/**
 * Delete user
 * @public
 */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get current user's profile
 * @public
 */
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

/**
 * Update current user's profile
 * @public
 */
const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
});

/**
 * Get user stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>}
 */
const getUserStats = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // Find the user's team and get their team wins
  const { Team } = require('../models');
  // Find all teams the user is a member of
  const teams = await Team.find({ members: req.params.userId });
  let teamWins = 0;
  let teamLosses = 0;
  teams.forEach(team => {
    if (team && team.statistics) {
      teamWins += team.statistics.wins || 0;
      // Support both 'losses' and 'gamesLost' for compatibility
      teamLosses += (team.statistics.losses || 0) + (team.statistics.gamesLost || 0);
    }
  });

  // Compute individual and team stats using the same logic as /users/all
  const individualWins = user.statistics?.gamesWon || 0;
  const individualLosses = user.statistics?.losses || 0;
  // Support both 'losses' and 'gamesLost' for compatibility
  let tWins = 0;
  let tLosses = 0;
  teams.forEach(team => {
    if (team && team.statistics) {
      tWins += team.statistics.wins || 0;
      tLosses += (team.statistics.losses || 0) + (team.statistics.gamesLost || 0);
    }
  });
  const totalWins = individualWins + tWins;
  const totalLosses = individualLosses + tLosses;
  
  res.send({
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    statistics: user.statistics || {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      highScore: 0,
      throws: 0,
      catches: 0,
      hits: 0,
      dodges: 0
    },
    individualWins,
    teamWins: tWins,
    totalWins,
    individualLosses,
    teamLosses: tLosses,
    totalLosses
  });
});

/**
 * Update user stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>}
 */
const updateUserStats = catchAsync(async (req, res) => {
  const user = await userService.updateUserStats(req.params.userId, req.body);
  res.send({
    statistics: user.statistics || {
      gamesPlayed: 0,
      gamesWon: 0,
      losses: 0,
      totalScore: 0,
      highScore: 0,
      throws: 0,
      catches: 0,
      hits: 0,
      dodges: 0
    }
  });
});

/**
 * Get user teams
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>}
 */
const getUserTeams = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  const { Team } = require('../models');
  const teams = await Team.find({ members: req.params.userId });
  
  if (teams.length === 0) {
    // If no teams found, return the first team (easier for client)
    const firstTeam = await Team.findOne({ members: req.params.userId }).sort({ createdAt: 1 });
    if (firstTeam) {
      return res.send(firstTeam);
    }
  }
  
  res.send(teams.length > 0 ? teams[0] : {});
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  getUserStats,
  updateUserStats,
  getUserTeams,
};
