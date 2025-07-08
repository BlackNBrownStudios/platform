const express = require('express');
const validate = require('../../middlewares/validate');
const lobbyValidation = require('../../validations/lobby.validation');
const lobbyController = require('../../controllers/lobby.controller');
const auth = require('../../middlewares/auth');
const bypassAuth = require('../../middlewares/bypassAuth');
const config = require('../../config/config');

// Use the appropriate auth middleware based on configuration
const authMiddleware = config.bypassAuth ? bypassAuth : auth;

const router = express.Router();

router
  .route('/')
  .post(authMiddleware(), validate(lobbyValidation.createLobby), lobbyController.createLobby)
  .get(authMiddleware(), validate(lobbyValidation.getLobbies), lobbyController.getLobbies);

router
  .route('/active')
  .get(authMiddleware(), validate(lobbyValidation.getActiveLobbies), lobbyController.getActiveLobbies);

router
  .route('/:lobbyId')
  .get(authMiddleware(), validate(lobbyValidation.getLobby), lobbyController.getLobby)
  .patch(authMiddleware('manageLobbies'), validate(lobbyValidation.updateLobby), lobbyController.updateLobby)
  .delete(authMiddleware('manageLobbies'), validate(lobbyValidation.deleteLobby), lobbyController.deleteLobby);

router
  .route('/:lobbyId/join')
  .post(authMiddleware(), validate(lobbyValidation.joinLobby), lobbyController.joinLobby);

router
  .route('/:lobbyId/leave')
  .post(authMiddleware(), validate(lobbyValidation.leaveLobby), lobbyController.leaveLobby);

router
  .route('/:lobbyId/start-match')
  .post(authMiddleware('manageLobbies'), validate(lobbyValidation.startMatch), lobbyController.startMatch);

router
  .route('/:lobbyId/end-match')
  .post(authMiddleware('manageLobbies'), validate(lobbyValidation.endMatch), lobbyController.endMatch);

module.exports = router;
