const Joi = require('joi');

const { objectId, dateFormat } = require('./custom.validation');

const createCard = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    year: Joi.number().integer().required(),
    imageUrl: Joi.string().uri().allow(''),
    category: Joi.string().required(),
    subcategory: Joi.string().allow(''),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').required(),
    region: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()),
    source: Joi.string().allow(''),
    isVerified: Joi.boolean().default(false),
  }),
};

const getCards = {
  query: Joi.object().keys({
    title: Joi.string(),
    category: Joi.string(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    year: Joi.number().integer(),
    isVerified: Joi.boolean(),
  }),
};

const getCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId),
  }),
};

const updateCard = {
  params: Joi.object().keys({
    cardId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      date: Joi.date(),
      year: Joi.number().integer(),
      imageUrl: Joi.string().uri().allow(''),
      category: Joi.string(),
      subcategory: Joi.string().allow(''),
      difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert'),
      region: Joi.string().allow(''),
      tags: Joi.array().items(Joi.string()),
      source: Joi.string().allow(''),
      isVerified: Joi.boolean(),
    })
    .min(1),
};

const deleteCard = {
  params: Joi.object().keys({
    cardId: Joi.string().custom(objectId),
  }),
};

const getRandomCards = {
  query: Joi.object().keys({
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').default('medium'),
    count: Joi.number().integer().min(1).max(50).default(10),
    category: Joi.string(),
  }),
};

module.exports = {
  createCard,
  getCards,
  getCard,
  updateCard,
  deleteCard,
  getRandomCards,
};
