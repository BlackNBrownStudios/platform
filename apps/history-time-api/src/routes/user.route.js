const express = require('express');

const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const userValidation = require('../validations/user.validation');

const router = express.Router();

// User profile routes
router
  .route('/profile')
  .get(auth(), userController.getUserProfile)
  .put(auth(), validate(userValidation.updateUserProfile), userController.updateUserProfile);

// Profile picture upload route
router.route('/profile-picture').post(auth(), userController.uploadProfilePicture);

// User game statistics
router
  .route('/:userId/stats')
  .get(validate(userValidation.getUserStats), userController.getUserGameStats);

// User recent games
router
  .route('/:userId/games')
  .get(validate(userValidation.getUserGames), userController.getUserRecentGames);

module.exports = router;
