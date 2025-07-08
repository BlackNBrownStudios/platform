/**
 * Historical Event Validation
 * Validates request data for historical event endpoints
 */
const Joi = require('joi');

const { objectId } = require('./custom.validation');

/**
 * Validation for creating a historical event
 */
const createHistoricalEvent = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    year: Joi.number().required(),
    month: Joi.number().min(1).max(12),
    day: Joi.number().min(1).max(31),
    category: Joi.string().required(),
    subcategory: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    significance: Joi.string().valid('low', 'medium', 'high', 'pivotal').default('medium'),
    imageUrl: Joi.string().uri(),
    sources: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          retrievalDate: Joi.date(),
        })
      )
      .min(1)
      .required(),
    verified: Joi.boolean().default(false),
    region: Joi.string(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }),
    relatedEvents: Joi.array().items(Joi.string().custom(objectId)),
  }),
};

/**
 * Validation for getting historical events
 */
const getHistoricalEvents = {
  query: Joi.object().keys({
    category: Joi.string(),
    year: Joi.number(),
    startYear: Joi.number(),
    endYear: Joi.number(),
    significance: Joi.string().valid('low', 'medium', 'high', 'pivotal'),
    verified: Joi.boolean(),
    tags: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    searchTerm: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/**
 * Validation for getting a single historical event
 */
const getHistoricalEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Validation for updating a historical event
 */
const updateHistoricalEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      year: Joi.number(),
      month: Joi.number().min(1).max(12),
      day: Joi.number().min(1).max(31),
      category: Joi.string(),
      subcategory: Joi.string(),
      tags: Joi.array().items(Joi.string()),
      significance: Joi.string().valid('low', 'medium', 'high', 'pivotal'),
      imageUrl: Joi.string().uri(),
      sources: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            retrievalDate: Joi.date(),
          })
        )
        .min(1),
      verified: Joi.boolean(),
      verifiedBy: Joi.string().custom(objectId),
      region: Joi.string(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
      }),
      relatedEvents: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

/**
 * Validation for deleting a historical event
 */
const deleteHistoricalEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Validation for getting events by category
 */
const getEventsByCategory = {
  params: Joi.object().keys({
    category: Joi.string().required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/**
 * Validation for getting events by time period
 */
const getEventsByTimePeriod = {
  params: Joi.object().keys({
    startYear: Joi.number().required(),
    endYear: Joi.number().required(),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/**
 * Validation for getting random events
 */
const getRandomEvents = {
  query: Joi.object().keys({
    count: Joi.number().integer().min(1).max(50).default(10),
    categories: Joi.string(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').default('medium'),
  }),
};

/**
 * Validation for submitting an event
 */
const submitEvent = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    year: Joi.number().required(),
    month: Joi.number().min(1).max(12),
    day: Joi.number().min(1).max(31),
    category: Joi.string().required(),
    subcategory: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    significance: Joi.string().valid('low', 'medium', 'high', 'pivotal').default('medium'),
    imageUrl: Joi.string().uri(),
    sources: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          retrievalDate: Joi.date(),
        })
      )
      .min(1)
      .required(),
    region: Joi.string(),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }),
  }),
};

module.exports = {
  createHistoricalEvent,
  getHistoricalEvents,
  getHistoricalEvent,
  updateHistoricalEvent,
  deleteHistoricalEvent,
  getEventsByCategory,
  getEventsByTimePeriod,
  getRandomEvents,
  submitEvent,
};
