const express = require('express');
const validate = require('../../middlewares/validate');
const teamValidation = require('../../validations/team.validation');
const teamController = require('../../controllers/team.controller');
const auth = require('../../middlewares/auth');
const bypassAuth = require('../../middlewares/bypassAuth');
const config = require('../../config/config');

// Use the appropriate auth middleware based on configuration
const authMiddleware = config.bypassAuth ? bypassAuth : auth;

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management and retrieval
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a team
 *     description: Create a new team. Users can create their own teams.
 *     tags: [Teams]
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
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: Team name
 *               color:
 *                 type: string
 *                 description: Team color (hex format)
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the team
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all teams
 *     description: Retrieve a list of teams.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Team name
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
 *         description: Maximum number of teams
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
 *                     $ref: '#/components/schemas/Team'
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
 */
router
  .route('/')
  .post(authMiddleware(), validate(teamValidation.createTeam), teamController.createTeam)
  .get(authMiddleware(), validate(teamValidation.getTeams), teamController.getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team
 *     description: Get team details by ID.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *
 *   patch:
 *     summary: Update a team
 *     description: Update team details. Only team members or admins can update a team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               logo:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
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
 *     summary: Delete a team
 *     description: Delete a team. Only team captain or admins can delete a team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
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
  .route('/:teamId')
  .get(authMiddleware(), validate(teamValidation.getTeam), teamController.getTeam)
  .patch(authMiddleware('manageTeams'), validate(teamValidation.updateTeam), teamController.updateTeam)
  .delete(authMiddleware('manageTeams'), validate(teamValidation.deleteTeam), teamController.deleteTeam);

/**
 * @swagger
 * /teams/{id}/members:
 *   post:
 *     summary: Add team member
 *     description: Add a user to a team. Only team captain or admins can add members.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:teamId/members')
  .post(auth('manageTeams'), validate(teamValidation.addTeamMember), teamController.addTeamMember);

/**
 * @swagger
 * /teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove team member
 *     description: Remove a user from a team. Only team captain or admins can remove members.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User id to remove
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:teamId/members/:userId')
  .delete(auth('manageTeams'), validate(teamValidation.removeTeamMember), teamController.removeTeamMember);

/**
 * @swagger
 * /teams/{id}/stats:
 *   get:
 *     summary: Get team statistics
 *     description: Retrieve game statistics for a specific team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wins:
 *                   type: integer
 *                 losses:
 *                   type: integer
 *                 totalMatches:
 *                   type: integer
 *                 totalScore:
 *                   type: integer
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Not found
 *
 *   patch:
 *     summary: Update team statistics
 *     description: Update game statistics for a specific team. Only admins can do this.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wins:
 *                 type: integer
 *               losses:
 *                 type: integer
 *               totalMatches:
 *                 type: integer
 *               totalScore:
 *                 type: integer
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:teamId/stats')
  .get(authMiddleware(), validate(teamValidation.getTeamStats), teamController.getTeamStats)
  .patch(authMiddleware('manageTeams'), validate(teamValidation.updateTeamStats), teamController.updateTeamStats);

module.exports = router;
