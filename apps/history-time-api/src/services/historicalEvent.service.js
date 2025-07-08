/**
 * Historical Event Service
 * Business logic for historical events
 */
const httpStatus = require('http-status');

const { HistoricalEvent } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a historical event
 * @param {Object} eventBody
 * @returns {Promise<HistoricalEvent>}
 */
const createHistoricalEvent = async (eventBody) => {
  return HistoricalEvent.create(eventBody);
};

/**
 * Query for historical events
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryHistoricalEvents = async (filter, options) => {
  const events = await HistoricalEvent.paginate(filter, options);
  return events;
};

/**
 * Get historical event by id
 * @param {ObjectId} id
 * @returns {Promise<HistoricalEvent>}
 */
const getHistoricalEventById = async (id) => {
  return HistoricalEvent.findById(id);
};

/**
 * Update historical event by id
 * @param {ObjectId} eventId
 * @param {Object} updateBody
 * @returns {Promise<HistoricalEvent>}
 */
const updateHistoricalEventById = async (eventId, updateBody) => {
  const event = await getHistoricalEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Historical event not found');
  }

  Object.assign(event, updateBody);
  await event.save();
  return event;
};

/**
 * Delete historical event by id
 * @param {ObjectId} eventId
 * @returns {Promise<HistoricalEvent>}
 */
const deleteHistoricalEventById = async (eventId) => {
  const event = await getHistoricalEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Historical event not found');
  }
  await HistoricalEvent.deleteOne({ _id: eventId });
  return event;
};

/**
 * Get events by category
 * @param {string} category
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getEventsByCategory = async (category, options) => {
  return queryHistoricalEvents({ category }, options);
};

/**
 * Get events by time period
 * @param {number} startYear
 * @param {number} endYear
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getEventsByTimePeriod = async (startYear, endYear, options) => {
  return queryHistoricalEvents(
    {
      year: {
        $gte: parseInt(startYear, 10),
        $lte: parseInt(endYear, 10),
      },
    },
    options
  );
};

/**
 * Search events by text
 * @param {string} searchTerm
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const searchHistoricalEvents = async (searchTerm, options) => {
  if (!searchTerm) {
    return queryHistoricalEvents({}, options);
  }

  return queryHistoricalEvents(
    { $text: { $search: searchTerm } },
    { ...options, score: { $meta: 'textScore' } }
  );
};

/**
 * Get all available categories
 * @returns {Promise<Array<string>>}
 */
const getCategories = async () => {
  return HistoricalEvent.distinct('category');
};

/**
 * Get year range (min and max years in the database)
 * @returns {Promise<Array<number>>}
 */
const getYearRange = async () => {
  const [minResult, maxResult] = await Promise.all([
    HistoricalEvent.find().sort({ year: 1 }).limit(1),
    HistoricalEvent.find().sort({ year: -1 }).limit(1),
  ]);

  const minYear = minResult.length > 0 ? minResult[0].year : -3000; // Default min
  const maxYear = maxResult.length > 0 ? maxResult[0].year : new Date().getFullYear(); // Default max

  return [minYear, maxYear];
};

/**
 * Get random events for game
 * @param {Object} options - Game options
 * @param {number} [options.count=10] - Number of events to return
 * @param {Array<string>} [options.categories] - Categories to include
 * @param {string} [options.difficulty] - Difficulty level
 * @returns {Promise<Array<HistoricalEvent>>}
 */
const getRandomEvents = async (options = {}) => {
  const { count = 10, categories = [], difficulty = 'medium' } = options;

  // Map difficulty to significance
  const significanceMap = {
    easy: ['high', 'pivotal'],
    medium: ['medium', 'high', 'pivotal'],
    hard: ['low', 'medium', 'high', 'pivotal'],
    expert: ['low', 'medium'],
  };

  const significance = significanceMap[difficulty] || ['medium', 'high'];

  // Build filter
  const filter = { significance: { $in: significance } };

  if (categories && categories.length > 0) {
    filter.category = { $in: categories };
  }

  // Ensure events have year values for proper game mechanics
  filter.year = { $ne: null };

  // Add verified filter for production use
  if (process.env.NODE_ENV === 'production') {
    filter.verified = true;
  }

  // Aggregation to get random events
  const randomEvents = await HistoricalEvent.aggregate([
    { $match: filter },
    { $sample: { size: parseInt(count, 10) } },
  ]);

  return randomEvents;
};

/**
 * Submit an event for verification
 * @param {Object} eventData - Event data
 * @param {Object} user - User submitting the event
 * @returns {Promise<HistoricalEvent>}
 */
const submitEventForVerification = async (eventData, user) => {
  const event = {
    ...eventData,
    verified: false,
    submittedBy: user._id,
  };

  return createHistoricalEvent(event);
};

module.exports = {
  createHistoricalEvent,
  queryHistoricalEvents,
  getHistoricalEventById,
  updateHistoricalEventById,
  deleteHistoricalEventById,
  getEventsByCategory,
  getEventsByTimePeriod,
  searchHistoricalEvents,
  getCategories,
  getYearRange,
  getRandomEvents,
  submitEventForVerification,
};
