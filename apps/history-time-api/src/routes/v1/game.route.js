const express = require('express');

const gameController = require('../../controllers/game.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const gameValidation = require('../../validations/game.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(gameValidation.createGame), gameController.createGame)
  .get(auth('getGames'), validate(gameValidation.getGames), gameController.getGames);

// Place specific routes before parameterized routes
router
  .route('/leaderboard')
  .get(validate(gameValidation.getLeaderboard), gameController.getLeaderboard);

router
  .route('/users/:userId/history')
  .get(auth('getGames'), validate(gameValidation.getUserStats), gameController.getUserGameHistory);

// Parameterized routes
router
  .route('/:gameId')
  .get(validate(gameValidation.getGame), gameController.getGame)
  .patch(validate(gameValidation.updateGame), gameController.updateGame);

router.route('/:gameId/end').post(validate(gameValidation.endGame), gameController.endGame);

router.route('/:gameId/abandon').post(validate(gameValidation.endGame), gameController.abandonGame);

module.exports = router;
