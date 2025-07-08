import { Router } from 'express';
import { validate } from '@platform/backend-core';
import { userValidation } from '../validations';
import { UserController } from '../controllers/user.controller';
import { auth, verifyOwnerOrAdmin } from '../middleware/auth.middleware';

export const createUserRoutes = (): Router => {
  const router = Router();
  const userController = new UserController();

  // Profile routes (current user)
  router
    .route('/profile')
    .get(auth(), userController.getProfile)
    .patch(auth(), validate(userValidation.updateUser), userController.updateProfile);

  // Admin routes
  router
    .route('/')
    .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
    .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

  router
    .route('/:userId')
    .get(auth(), verifyOwnerOrAdmin, validate(userValidation.getUser), userController.getUser)
    .patch(auth(), verifyOwnerOrAdmin, validate(userValidation.updateUser), userController.updateUser)
    .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

  // Game-specific data routes
  router
    .route('/:userId/games/:gameId')
    .get(auth(), verifyOwnerOrAdmin, userController.getGameData)
    .patch(auth(), verifyOwnerOrAdmin, validate(userValidation.updateGameData), userController.updateGameData);

  return router;
};