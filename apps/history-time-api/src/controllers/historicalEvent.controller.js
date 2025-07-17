/**
 * Historical Event Controller
 * Handles HTTP requests related to historical events
 */
const httpStatus = require('http-status');

const { historicalEventService } = require('../services');
const { ApiError } = require('@platform/backend-core');
const { catchAsync } = require('@platform/backend-core');
const pick = require('../utils/pick');

/**
 * Create a historical event
 * @POST /api/historical-events
 */
const createHistoricalEvent = catchAsync(async (req, res) => {
  const event = await historicalEventService.createHistoricalEvent(req.body);
  res.status(httpStatus.CREATED).send(event);
});

/**
 * Get all historical events
 * @GET /api/historical-events
 */
const getHistoricalEvents = catchAsync(async (req, res) => {
  // Parse query parameters
  const filter = pick(req.query, ['category', 'year', 'tags', 'significance', 'verified']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Handle year range filtering
  if (req.query.startYear || req.query.endYear) {
    filter.year = {};
    if (req.query.startYear) {
      filter.year.$gte = parseInt(req.query.startYear, 10);
    }
    if (req.query.endYear) {
      filter.year.$lte = parseInt(req.query.endYear, 10);
    }
  }

  // Handle text search
  if (req.query.searchTerm) {
    const events = await historicalEventService.searchHistoricalEvents(
      req.query.searchTerm,
      options
    );
    return res.send(events);
  }

  const events = await historicalEventService.queryHistoricalEvents(filter, options);
  res.send(events);
});

/**
 * Get a historical event by ID
 * @GET /api/historical-events/:eventId
 */
const getHistoricalEvent = catchAsync(async (req, res) => {
  const event = await historicalEventService.getHistoricalEventById(req.params.eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Historical event not found');
  }
  res.send(event);
});

/**
 * Update a historical event
 * @PATCH /api/historical-events/:eventId
 */
const updateHistoricalEvent = catchAsync(async (req, res) => {
  const event = await historicalEventService.updateHistoricalEventById(
    req.params.eventId,
    req.body
  );
  res.send(event);
});

/**
 * Delete a historical event
 * @DELETE /api/historical-events/:eventId
 */
const deleteHistoricalEvent = catchAsync(async (req, res) => {
  await historicalEventService.deleteHistoricalEventById(req.params.eventId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get events by category
 * @GET /api/historical-events/category/:category
 */
const getEventsByCategory = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const events = await historicalEventService.getEventsByCategory(req.params.category, options);
  res.send(events);
});

/**
 * Get events by time period
 * @GET /api/historical-events/period/:startYear/:endYear
 */
const getEventsByTimePeriod = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const events = await historicalEventService.getEventsByTimePeriod(
    req.params.startYear,
    req.params.endYear,
    options
  );
  res.send(events);
});

/**
 * Get all available categories
 * @GET /api/historical-events/categories
 */
const getCategories = catchAsync(async (req, res) => {
  const categories = await historicalEventService.getCategories();
  res.send({ categories });
});

/**
 * Get year range
 * @GET /api/historical-events/year-range
 */
const getYearRange = catchAsync(async (req, res) => {
  const range = await historicalEventService.getYearRange();
  res.send({ range });
});

/**
 * Get random events for game
 * @GET /api/historical-events/random
 */
const getRandomEvents = catchAsync(async (req, res) => {
  const options = {
    count: req.query.count || 10,
    categories: req.query.categories ? req.query.categories.split(',') : [],
    difficulty: req.query.difficulty || 'medium',
  };

  const events = await historicalEventService.getRandomEvents(options);
  res.send({ events });
});

/**
 * Submit an event for verification
 * @POST /api/historical-events/submit
 */
const submitEvent = catchAsync(async (req, res) => {
  // Only allow authenticated users to submit events
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const event = await historicalEventService.submitEventForVerification(req.body, req.user);
  res.status(httpStatus.CREATED).send({
    event,
    message: 'Event submitted for verification',
  });
});

/**
 * Get events count
 * @GET /api/historical-events/count
 */
const getEventsCount = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'significance', 'verified']);

  // Handle year range filtering
  if (req.query.startYear || req.query.endYear) {
    filter.year = {};
    if (req.query.startYear) {
      filter.year.$gte = parseInt(req.query.startYear, 10);
    }
    if (req.query.endYear) {
      filter.year.$lte = parseInt(req.query.endYear, 10);
    }
  }

  const count = await historicalEventService.queryHistoricalEvents(filter, { limit: 1 });
  res.send({ count: count.totalResults });
});

module.exports = {
  createHistoricalEvent,
  getHistoricalEvents,
  getHistoricalEvent,
  updateHistoricalEvent,
  deleteHistoricalEvent,
  getEventsByCategory,
  getEventsByTimePeriod,
  getCategories,
  getYearRange,
  getRandomEvents,
  submitEvent,
  getEventsCount,
};
