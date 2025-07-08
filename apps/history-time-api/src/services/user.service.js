const httpStatus = require('http-status');

const { User, StoreItem } = require('../models');
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
 * Get user statistics
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getUserStats = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user.stats;
};

/**
 * Update user preferences
 * @param {ObjectId} userId
 * @param {Object} preferences
 * @returns {Promise<User>}
 */
const updateUserPreferences = async (userId, preferences) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.preferences) {
    user.preferences = {};
  }

  Object.assign(user.preferences, preferences);
  await user.save();
  return user;
};

/**
 * Check user daily streak
 * @param {ObjectId} userId
 * @returns {Promise<Object>} Streak information
 */
const checkUserDailyStreak = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user.checkDailyStreak();
};

/**
 * Claim daily reward for user
 * @param {ObjectId} userId
 * @returns {Promise<Object>} Reward information
 */
const claimDailyReward = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user.claimDailyReward();
};

/**
 * Get user rewards and inventory
 * @param {ObjectId} userId
 * @returns {Promise<Object>} Rewards and inventory information
 */
const getUserRewards = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    coins: user.rewards.coins,
    streakDays: user.rewards.streakDays,
    lastDailyReward: user.rewards.lastDailyReward,
    inventory: user.inventory,
  };
};

/**
 * Purchase a store item
 * @param {ObjectId} userId
 * @param {Object} item - Store item to purchase
 * @returns {Promise<Object>} Purchase result
 */
const purchaseStoreItem = async (userId, item) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // For store integration, convert 'border' to 'borders', etc.
  const itemType = item.type + 's';
  return user.purchaseItem(itemType, item.itemId, item.price);
};

/**
 * Set active inventory item
 * @param {ObjectId} userId
 * @param {String} type - Item type (border, theme, cardBack)
 * @param {String} itemId - Item ID to set as active
 * @returns {Promise<Object>} Updated active items
 */
const setActiveInventoryItem = async (userId, type, itemId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user has this item
  const itemTypeInInventory = type + 's'; // Convert 'border' to 'borders'
  if (!user.inventory[itemTypeInInventory].includes(itemId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `User does not own this ${type}`);
  }

  // Set the active item
  const activeField = 'active' + type.charAt(0).toUpperCase() + type.slice(1);
  user.inventory[activeField] = itemId;
  await user.save();

  return {
    success: true,
    message: `Active ${type} updated successfully`,
    activeItems: {
      border: user.inventory.activeBorder,
      theme: user.inventory.activeTheme,
      cardBack: user.inventory.activeCardBack,
    },
  };
};

/**
 * Award coins to user
 * @param {ObjectId} userId
 * @param {Number} amount - Amount of coins to award
 * @param {String} reason - Reason for awarding coins
 * @returns {Promise<Object>} Updated coins information
 */
const awardCoinsToUser = async (userId, amount, reason) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.rewards.coins += amount;
  await user.save();

  return {
    success: true,
    message: `Awarded ${amount} coins: ${reason}`,
    newBalance: user.rewards.coins,
  };
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getUserStats,
  updateUserPreferences,
  checkUserDailyStreak,
  claimDailyReward,
  getUserRewards,
  purchaseStoreItem,
  setActiveInventoryItem,
  awardCoinsToUser,
};
