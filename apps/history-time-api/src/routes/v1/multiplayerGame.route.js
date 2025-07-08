const express = require('express');

const multiplayerGameController = require('../../controllers/multiplayerGame.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const multiplayerGameValidation = require('../../validations/multiplayerGame.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(multiplayerGameValidation.createGame), multiplayerGameController.createGame)
  .get(auth(), multiplayerGameController.getUserGames);

router
  .route('/:gameId')
  .get(validate(multiplayerGameValidation.getGame), multiplayerGameController.getGame);

router
  .route('/code/:roomCode')
  .get(
    validate(multiplayerGameValidation.getGameByRoomCode),
    multiplayerGameController.getGameByRoomCode
  );

router
  .route('/join/:roomCode')
  .post(validate(multiplayerGameValidation.joinGame), multiplayerGameController.joinGame);

router
  .route('/:gameId/start')
  .post(
    auth({ optional: true }),
    validate(multiplayerGameValidation.startGame),
    multiplayerGameController.startGame
  );

router
  .route('/:gameId/place-card')
  .post(
    auth({ optional: true }),
    validate(multiplayerGameValidation.placeCard),
    multiplayerGameController.placeCard
  );

router
  .route('/:gameId/leave')
  .patch(
    auth({ optional: true }),
    validate(multiplayerGameValidation.leaveGame),
    multiplayerGameController.leaveGame
  );

module.exports = router;
