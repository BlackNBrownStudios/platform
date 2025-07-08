const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const auth = require('../../middlewares/auth');
const bypassAuth = require('../../middlewares/bypassAuth');
const config = require('../../config/config');

// Use the appropriate auth middleware based on configuration
const authMiddleware = config.bypassAuth ? bypassAuth : auth;

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [user, admin, gamemaster]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 */
router
  .route('/')
  .post(authMiddleware('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(authMiddleware('getUsers'), validate(userValidation.getUsers), userController.getUsers);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Get the logged in user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "401":
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update user profile
 *     description: Updates the logged in user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 */
router
  .route('/profile')
  .get(auth(), userController.getProfile)
  .patch(auth(), validate(userValidation.updateProfile), userController.updateProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Get user information by ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *
 *   patch:
 *     summary: Update a user
 *     description: Admins can update any user, regular users can only update themselves.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [user, admin, gamemaster]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *
 *   delete:
 *     summary: Delete a user
 *     description: Only admins can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:userId')
  .get(authMiddleware('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(authMiddleware('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(authMiddleware('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

/**
 * @swagger
 * /users/{id}/teams:
 *   get:
 *     summary: Get user teams
 *     description: Retrieve teams for a specific user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Not found
 */
router
  .route('/:userId/teams')
  .get(auth(), validate(userValidation.getUserById), userController.getUserTeams);

/**
 * @swagger
 * /users/{id}/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve game statistics for a specific user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gamesPlayed:
 *                   type: integer
 *                 gamesWon:
 *                   type: integer
 *                 totalScore:
 *                   type: integer
 *                 highScore:
 *                   type: integer
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Not found
 *
 *   patch:
 *     summary: Update user statistics
 *     description: Update game statistics for a specific user. Only admins can do this.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gamesPlayed:
 *                 type: integer
 *               gamesWon:
 *                 type: integer
 *               totalScore:
 *                 type: integer
 *               highScore:
 *                 type: integer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:userId/stats')
  .get(authMiddleware(), validate(userValidation.getUserStats), userController.getUserStats)
  .patch(authMiddleware('manageUsers'), validate(userValidation.updateUserStats), userController.updateUserStats);

module.exports = router;
