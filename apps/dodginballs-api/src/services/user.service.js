const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Update user statistics
 * @param {ObjectId} userId
 * @param {Object} statsUpdate
 * @returns {Promise<User>}
 */
const updateUserStats = async (userId, statsUpdate) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Initialize statistics if it doesn't exist
  if (!user.statistics) {
    user.statistics = {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      highScore: 0,
      throws: 0,
      catches: 0,
      hits: 0,
      dodges: 0
    };
  }
  
  // Update each stat field if provided
  if (statsUpdate.gamesPlayed !== undefined) {
    user.statistics.gamesPlayed += statsUpdate.gamesPlayed;
  }
  
  if (statsUpdate.gamesWon !== undefined) {
    user.statistics.gamesWon += statsUpdate.gamesWon;
  }
  
  if (statsUpdate.totalScore !== undefined) {
    user.statistics.totalScore += statsUpdate.totalScore;
  }
  
  if (statsUpdate.score !== undefined && statsUpdate.score > user.statistics.highScore) {
    user.statistics.highScore = statsUpdate.score;
  }
  
  if (statsUpdate.throws !== undefined) {
    user.statistics.throws += statsUpdate.throws;
  }
  
  if (statsUpdate.catches !== undefined) {
    user.statistics.catches += statsUpdate.catches;
  }
  
  if (statsUpdate.hits !== undefined) {
    user.statistics.hits += statsUpdate.hits;
  }
  
  if (statsUpdate.dodges !== undefined) {
    user.statistics.dodges += statsUpdate.dodges;
  }
  
  await user.save();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updateUserStats,
};
