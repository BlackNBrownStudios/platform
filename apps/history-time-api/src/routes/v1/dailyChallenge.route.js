const express = require('express');

const dailyChallengeController = require('../../controllers/dailyChallenge.controller');
const { auth } = require('@platform/auth-backend');
const { validate } = require('@platform/backend-core');
const dailyChallengeValidation = require('../../validations/dailyChallenge.validation');

const router = express.Router();

// Public routes
router.route('/today').get(dailyChallengeController.getTodayChallenge);

// Authenticated routes
router
  .route('/start')
  .post(
    auth(),
    validate(dailyChallengeValidation.startDailyChallenge),
    dailyChallengeController.startDailyChallenge
  );

router
  .route('/:gameId/complete')
  .post(
    auth(),
    validate(dailyChallengeValidation.completeDailyChallenge),
    dailyChallengeController.completeDailyChallenge
  );

// Admin routes
router
  .route('/')
  .post(
    auth('manageGames'),
    validate(dailyChallengeValidation.createChallenge),
    dailyChallengeController.createChallenge
  )
  .get(
    auth('manageGames'),
    validate(dailyChallengeValidation.getChallenges),
    dailyChallengeController.getChallenges
  );

router
  .route('/:challengeId')
  .get(
    auth('manageGames'),
    validate(dailyChallengeValidation.getChallenge),
    dailyChallengeController.getChallenge
  )
  .patch(
    auth('manageGames'),
    validate(dailyChallengeValidation.updateChallenge),
    dailyChallengeController.updateChallenge
  )
  .delete(
    auth('manageGames'),
    validate(dailyChallengeValidation.deleteChallenge),
    dailyChallengeController.deleteChallenge
  );

module.exports = router;
