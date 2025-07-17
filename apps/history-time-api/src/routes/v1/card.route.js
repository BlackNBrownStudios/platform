const express = require('express');

const cardController = require('../../controllers/card.controller');
const { auth } = require('@platform/auth-backend');
const { validate } = require('@platform/backend-core');
const cardValidation = require('../../validations/card.validation');

const router = express.Router();

// Define routes with specific paths before parametrized routes
// Categories endpoint
router.route('/categories').get(cardController.getAllCategories);

// Random cards endpoint
router.route('/random').get(validate(cardValidation.getRandomCards), cardController.getRandomCards);

// Cards by category endpoint
router.route('/category/:category').get(cardController.getCardsByCategory);

// General cards endpoints
router
  .route('/')
  .post(auth(), validate(cardValidation.createCard), cardController.createCard)
  .get(validate(cardValidation.getCards), cardController.getCards);

// Specific card endpoints
router
  .route('/:cardId')
  .get(validate(cardValidation.getCard), cardController.getCard)
  .patch(auth('manageGames'), validate(cardValidation.updateCard), cardController.updateCard)
  .delete(auth('manageGames'), validate(cardValidation.deleteCard), cardController.deleteCard);

router.route('/:cardId/verify').patch(auth('manageGames'), cardController.verifyCard);

// Image refresh endpoint removed - replaced by new image services architecture

module.exports = router;
