const httpStatus = require('http-status');

const { cardService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const createCard = catchAsync(async (req, res) => {
  const card = await cardService.createCard(req.body, req.user.id);
  res.status(httpStatus.CREATED).send(card);
});

const getCards = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'category', 'difficulty', 'year', 'isVerified']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await cardService.queryCards(filter, options);
  res.send(result);
});

const getCard = catchAsync(async (req, res) => {
  const card = await cardService.getCardById(req.params.cardId);
  if (!card) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
  }
  res.send(card);
});

const updateCard = catchAsync(async (req, res) => {
  const card = await cardService.updateCardById(req.params.cardId, req.body);
  res.send(card);
});

const deleteCard = catchAsync(async (req, res) => {
  await cardService.deleteCardById(req.params.cardId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getRandomCards = catchAsync(async (req, res) => {
  const { difficulty = 'medium', count = 10, category } = req.query;
  const cards = await cardService.getRandomCards(difficulty, parseInt(count, 10), category);
  res.send(cards);
});

const getCardsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await cardService.getCardsByCategory(category, options);
  res.send(result);
});

const verifyCard = catchAsync(async (req, res) => {
  const card = await cardService.verifyCard(req.params.cardId);
  res.send(card);
});

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await cardService.getAllCategories();
  res.send(categories);
});

// refreshCardImage removed - replaced by new image services architecture

module.exports = {
  createCard,
  getCards,
  getCard,
  updateCard,
  deleteCard,
  getRandomCards,
  getCardsByCategory,
  verifyCard,
  getAllCategories,
};
