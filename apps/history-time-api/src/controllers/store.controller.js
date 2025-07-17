const httpStatus = require('http-status');

const { storeService, userService } = require('../services');
const { ApiError } = require('@platform/backend-core');
const { catchAsync } = require('@platform/backend-core');

const getStoreItems = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.rarity) {
    filter.rarity = req.query.rarity;
  }
  if (req.query.available !== undefined) {
    filter.isAvailable = req.query.available === 'true';
  }
  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await storeService.queryStoreItems(filter, options);
  res.send(result);
});

const getStoreItem = catchAsync(async (req, res) => {
  const item = await storeService.getStoreItemById(req.params.itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Store item not found');
  }
  res.send(item);
});

const createStoreItem = catchAsync(async (req, res) => {
  const item = await storeService.createStoreItem(req.body, req.userId);
  res.status(httpStatus.CREATED).send(item);
});

const updateStoreItem = catchAsync(async (req, res) => {
  const item = await storeService.updateStoreItemById(req.params.itemId, req.body);
  res.send(item);
});

const deleteStoreItem = catchAsync(async (req, res) => {
  await storeService.deleteStoreItemById(req.params.itemId);
  res.status(httpStatus.NO_CONTENT).send();
});

const purchaseItem = catchAsync(async (req, res) => {
  const { userId } = req;
  const { itemId } = req.params;

  // Get the item
  const item = await storeService.getStoreItemById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Store item not found');
  }

  if (!item.isAvailable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This item is not currently available for purchase');
  }

  // Get the user
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if user can afford it
  if (user.rewards.coins < item.price) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough coins to purchase this item');
  }

  // Check if user already owns this item
  if (user.inventory[item.type + 's'].includes(item.itemId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You already own this item');
  }

  // Process purchase
  const result = await userService.purchaseStoreItem(userId, item);

  res.send(result);
});

const getUserInventory = catchAsync(async (req, res) => {
  const { userId } = req;

  // Get the user
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get detailed inventory with full item details
  const inventory = await storeService.getUserInventoryDetails(user);

  res.send({
    inventory,
    coins: user.rewards.coins,
    active: {
      border: user.inventory.activeBorder,
      theme: user.inventory.activeTheme,
      cardBack: user.inventory.activeCardBack,
    },
  });
});

const setActiveInventoryItem = catchAsync(async (req, res) => {
  const { userId } = req;
  const { type, itemId } = req.body;

  if (!['border', 'theme', 'cardBack'].includes(type)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid item type');
  }

  // Update the active item
  const result = await userService.setActiveInventoryItem(userId, type, itemId);

  res.send(result);
});

module.exports = {
  getStoreItems,
  getStoreItem,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
  purchaseItem,
  getUserInventory,
  setActiveInventoryItem,
};
