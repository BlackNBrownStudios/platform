const express = require('express');

const userController = require('../../controllers/user.controller');
const { auth } = require('@platform/auth-backend');
const { validate } = require('@platform/backend-core');
const userValidation = require('../../validations/user.validation');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/stats')
  .get(
    auth('getUsers', 'getStats'),
    validate(userValidation.getUserStats),
    userController.getUserStats
  );

router.route('/:userId/preferences').patch(auth(), userController.updateUserPreferences);

module.exports = router;
