const httpStatus = require('http-status');

const { StoreItem, User } = require('../models');
const { ApiError } = require('@platform/backend-core');

/**
 * Create a store item
 * @param {Object} itemBody
 * @param {ObjectId} createdBy - ID of admin user creating the item
 * @returns {Promise<StoreItem>}
 */
const createStoreItem = async (itemBody, createdBy) => {
  return StoreItem.create({ ...itemBody, createdBy });
};

/**
 * Query for store items
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryStoreItems = async (filter, options) => {
  const items = await StoreItem.paginate(filter, options);
  return items;
};

/**
 * Get store item by id
 * @param {ObjectId} id
 * @returns {Promise<StoreItem>}
 */
const getStoreItemById = async (id) => {
  return StoreItem.findById(id);
};

/**
 * Get store item by itemId
 * @param {string} itemId
 * @returns {Promise<StoreItem>}
 */
const getStoreItemByItemId = async (itemId) => {
  return StoreItem.findOne({ itemId });
};

/**
 * Update store item by id
 * @param {ObjectId} itemId
 * @param {Object} updateBody
 * @returns {Promise<StoreItem>}
 */
const updateStoreItemById = async (itemId, updateBody) => {
  const item = await getStoreItemById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Store item not found');
  }
  Object.assign(item, updateBody);
  await item.save();
  return item;
};

/**
 * Delete store item by id
 * @param {ObjectId} itemId
 * @returns {Promise<StoreItem>}
 */
const deleteStoreItemById = async (itemId) => {
  const item = await getStoreItemById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Store item not found');
  }
  await item.remove();
  return item;
};

/**
 * Get promoted items for store display
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>}
 */
const getPromotedItems = async (limit = 5) => {
  return StoreItem.find({ isPromoted: true, isAvailable: true }).sort({ price: -1 }).limit(limit);
};

/**
 * Get user's inventory with detailed item information
 * @param {Object} user - User object with inventory
 * @returns {Promise<Object>}
 */
const getUserInventoryDetails = async (user) => {
  // Get all item IDs from user inventory
  const itemIds = [
    ...user.inventory.borders,
    ...user.inventory.themes,
    ...user.inventory.cardBacks,
  ];

  // Remove default items as they might not be in the store
  const uniqueItemIds = [...new Set(itemIds.filter((id) => id !== 'default'))];

  // Fetch all items from store
  const items = await StoreItem.find({ itemId: { $in: uniqueItemIds } });

  // Create a lookup map
  const itemMap = {};
  items.forEach((item) => {
    itemMap[item.itemId] = item;
  });

  // Create default items
  const defaultBorder = {
    _id: 'default',
    name: 'Default Border',
    description: 'The standard border for all players',
    type: 'border',
    itemId: 'default',
    previewImageUrl: '/assets/borders/default.png',
    rarity: 'common',
    cssProperties: {},
  };

  const defaultTheme = {
    _id: 'default',
    name: 'Default Theme',
    description: 'The standard theme for all players',
    type: 'theme',
    itemId: 'default',
    previewImageUrl: '/assets/themes/default.png',
    rarity: 'common',
    cssProperties: {},
  };

  const defaultCardBack = {
    _id: 'default',
    name: 'Default Card Back',
    description: 'The standard card back for all players',
    type: 'cardBack',
    itemId: 'default',
    previewImageUrl: '/assets/cardbacks/default.png',
    rarity: 'common',
    cssProperties: {},
  };

  // Build the structured inventory
  const inventory = {
    borders: user.inventory.borders.map((itemId) => {
      return itemId === 'default'
        ? defaultBorder
        : itemMap[itemId] || { itemId, name: 'Unknown Item', missing: true };
    }),
    themes: user.inventory.themes.map((itemId) => {
      return itemId === 'default'
        ? defaultTheme
        : itemMap[itemId] || { itemId, name: 'Unknown Item', missing: true };
    }),
    cardBacks: user.inventory.cardBacks.map((itemId) => {
      return itemId === 'default'
        ? defaultCardBack
        : itemMap[itemId] || { itemId, name: 'Unknown Item', missing: true };
    }),
  };

  return inventory;
};

/**
 * Get all available item categories
 * @returns {Promise<Array>}
 */
const getItemCategories = async () => {
  return [
    { id: 'border', name: 'Borders', description: 'Customize your profile border' },
    { id: 'theme', name: 'Themes', description: 'Change the look and feel of the game' },
    { id: 'cardBack', name: 'Card Backs', description: 'Unique card back designs' },
  ];
};

/**
 * Get all available item rarities
 * @returns {Promise<Array>}
 */
const getItemRarities = async () => {
  return [
    { id: 'common', name: 'Common', description: 'Basic items available to everyone' },
    { id: 'uncommon', name: 'Uncommon', description: 'Slightly more exclusive items' },
    { id: 'rare', name: 'Rare', description: 'Hard to find items' },
    { id: 'epic', name: 'Epic', description: 'Very exclusive items' },
    { id: 'legendary', name: 'Legendary', description: 'The most exclusive items' },
  ];
};

module.exports = {
  createStoreItem,
  queryStoreItems,
  getStoreItemById,
  getStoreItemByItemId,
  updateStoreItemById,
  deleteStoreItemById,
  getPromotedItems,
  getUserInventoryDetails,
  getItemCategories,
  getItemRarities,
};
