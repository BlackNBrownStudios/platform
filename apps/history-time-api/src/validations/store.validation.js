const Joi = require('joi');

const { objectId } = require('./custom.validation');

const getStoreItems = {
  query: Joi.object().keys({
    type: Joi.string().valid('borders', 'themes', 'cardBacks'),
    rarity: Joi.string().valid('common', 'rare', 'epic', 'legendary'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getStoreItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const createStoreItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('border', 'theme', 'cardBack').required(),
    itemId: Joi.string().required(),
    previewImageUrl: Joi.string().uri(),
    price: Joi.number().integer().min(1).required(),
    rarity: Joi.string().valid('common', 'rare', 'epic', 'legendary').default('common'),
    isAvailable: Joi.boolean().default(true),
    isNew: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),
    isSpecial: Joi.boolean().default(false),
  }),
};

const updateStoreItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      previewImageUrl: Joi.string().uri(),
      price: Joi.number().integer().min(1),
      rarity: Joi.string().valid('common', 'rare', 'epic', 'legendary'),
      isAvailable: Joi.boolean(),
      isNew: Joi.boolean(),
      isFeatured: Joi.boolean(),
      isSpecial: Joi.boolean(),
    })
    .min(1),
};

const deleteStoreItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const purchaseItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const setActiveInventoryItem = {
  body: Joi.object().keys({
    type: Joi.string().valid('border', 'theme', 'cardBack').required(),
    itemId: Joi.string().required(),
  }),
};

module.exports = {
  getStoreItems,
  getStoreItem,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
  purchaseItem,
  setActiveInventoryItem,
};
