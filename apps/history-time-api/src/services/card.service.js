const httpStatus = require('http-status');

const { Card } = require('../models');
const { ApiError } = require('@platform/backend-core');

/**
 * Create a historical card
 * @param {Object} cardBody
 * @param {ObjectId} createdBy - User ID of card creator
 * @returns {Promise<Card>}
 */
const createCard = async (cardBody, createdBy) => {
  return Card.create({ ...cardBody, createdBy });
};

/**
 * Query for cards
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCards = async (filter, options) => {
  const cards = await Card.paginate(filter, options);
  return cards;
};

/**
 * Get card by id
 * @param {ObjectId} id
 * @returns {Promise<Card>}
 */
const getCardById = async (id) => {
  return Card.findById(id);
};

/**
 * Update card by id
 * @param {ObjectId} cardId
 * @param {Object} updateBody
 * @returns {Promise<Card>}
 */
const updateCardById = async (cardId, updateBody) => {
  const card = await getCardById(cardId);
  if (!card) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
  }
  Object.assign(card, updateBody);
  await card.save();
  return card;
};

/**
 * Delete card by id
 * @param {ObjectId} cardId
 * @returns {Promise<Card>}
 */
const deleteCardById = async (cardId) => {
  const card = await getCardById(cardId);
  if (!card) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
  }
  await card.remove();
  return card;
};

/**
 * Get random cards for a game
 * @param {string} difficulty - Difficulty level
 * @param {number} count - Number of cards to return
 * @param {string|Object} [category] - Optional category filter
 * @returns {Promise<Array>}
 */
const getRandomCards = async (difficulty, count, category) => {
  // Start with the most restrictive filter
  const filter = { difficulty, isVerified: true };
  if (category) {
    filter.category = category;
  }

  // Try to get cards with the exact filter
  let cards = await Card.aggregate([{ $match: filter }, { $sample: { size: count } }]);

  // If we don't have enough cards, try without category restriction
  if (cards.length < count && category) {
    const fallbackFilter = { difficulty, isVerified: true };
    cards = await Card.aggregate([{ $match: fallbackFilter }, { $sample: { size: count } }]);
  }

  // If still not enough, try any difficulty but keep verified status
  if (cards.length < count) {
    const fallbackFilter = { isVerified: true };
    cards = await Card.aggregate([{ $match: fallbackFilter }, { $sample: { size: count } }]);
  }

  // Finally, if we still don't have enough, return all we can find
  if (cards.length < count) {
    // Get all available verified cards or fall back to any cards as a last resort
    cards = await Card.aggregate([{ $match: {} }, { $sample: { size: count } }]);
  }

  return cards;
};

/**
 * Get cards by category
 * @param {string} category - Category to filter by
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getCardsByCategory = async (category, options) => {
  return queryCards({ category }, options);
};

/**
 * Get cards by time period
 * @param {number} startYear - Start year (can be negative for BCE)
 * @param {number} endYear - End year (can be negative for BCE)
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getCardsByTimePeriod = async (startYear, endYear, options) => {
  return queryCards(
    {
      year: { $gte: startYear, $lte: endYear },
    },
    options
  );
};

/**
 * Get cards by tags
 * @param {Array<string>} tags - Array of tags to match
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getCardsByTags = async (tags, options) => {
  return queryCards(
    {
      tags: { $in: tags },
    },
    options
  );
};

/**
 * Update image URL for a card
 * @param {ObjectId} cardId - Card ID
 * @param {string} imageUrl - New image URL
 * @returns {Promise<Card>}
 */
const updateCardImage = async (cardId, imageUrl) => {
  return updateCardById(cardId, { imageUrl });
};

/**
 * Batch update image URLs for multiple cards
 * @param {Array<{cardId: ObjectId, imageUrl: string}>} updates - Array of updates
 * @returns {Promise<number>} - Number of cards updated
 */
const batchUpdateCardImages = async (updates) => {
  const operations = updates.map((update) => ({
    updateOne: {
      filter: { _id: update.cardId },
      update: { $set: { imageUrl: update.imageUrl, updatedAt: new Date() } },
    },
  }));

  if (operations.length === 0) {
    return 0;
  }

  const result = await Card.bulkWrite(operations);
  return result.modifiedCount;
};

/**
 * Verify a card (mark it as approved for use in games)
 * @param {ObjectId} cardId
 * @returns {Promise<Card>}
 */
const verifyCard = async (cardId) => {
  const card = await getCardById(cardId);
  if (!card) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
  }
  card.isVerified = true;
  await card.save();
  return card;
};

/**
 * Get all unique categories
 * @returns {Promise<Array>}
 */
const getAllCategories = async () => {
  return Card.distinct('category');
};

/**
 * Get all unique tags
 * @returns {Promise<Array>}
 */
const getAllTags = async () => {
  return Card.distinct('tags');
};

/**
 * Get cards without images
 * @param {number} limit - Maximum number of cards to return
 * @returns {Promise<Array>}
 */
const getCardsWithoutImages = async (limit = 50) => {
  return Card.find({
    $or: [{ imageUrl: { $exists: false } }, { imageUrl: '' }, { imageUrl: null }],
  }).limit(limit);
};

module.exports = {
  createCard,
  queryCards,
  getCardById,
  updateCardById,
  deleteCardById,
  getRandomCards,
  getCardsByCategory,
  getCardsByTimePeriod,
  getCardsByTags,
  updateCardImage,
  batchUpdateCardImages,
  verifyCard,
  getAllCategories,
  getAllTags,
  getCardsWithoutImages,
};
