const express = require('express');
const validate = require('../../middlewares/validate');
const matchValidation = require('../../validations/match.validation');
const matchController = require('../../controllers/match.controller');
const auth = require('../../middlewares/auth');
const bypassAuth = require('../../middlewares/bypassAuth');
const config = require('../../config/config');

// Use the appropriate auth middleware based on configuration
const authMiddleware = config.bypassAuth ? bypassAuth : auth;

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management and retrieval
 */

/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Create a match
 *     description: Create a new match. Only GameMasters or admins can create matches.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - court
 *               - teams
 *             properties:
 *               court:
 *                 type: string
 *                 description: Court/location for the match
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of team IDs participating in the match
 *               gameMode:
 *                 type: string
 *                 enum: [standard, tournament, practice, custom]
 *                 default: standard
 *                 description: Game mode for the match
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Match'
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *
 *   get:
 *     summary: Get all matches
 *     description: Retrieve a list of matches.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: court
 *         schema:
 *           type: string
 *         description: Court/location name
 *       - in: query
 *         name: gameMode
 *         schema:
 *           type: string
 *         description: Game mode filter
 *       - in: query
 *         name: matchState
 *         schema:
 *           type: integer
 *         description: Match state (0=pending, 1=in progress, 2=completed, 3=cancelled)
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: Filter matches by team participation
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. createdAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of matches
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
 *                     $ref: '#/components/schemas/Match'
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
  .post(authMiddleware('manageGames'), validate(matchValidation.createMatch), matchController.createMatch)
  .get(authMiddleware(), validate(matchValidation.getMatches), matchController.getMatches);

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     summary: Get a match
 *     description: Get match details by ID.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *
 *   patch:
 *     summary: Update a match
 *     description: Update match details. Only GameMasters or admins can update matches.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               court:
 *                 type: string
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *               gameMode:
 *                 type: string
 *                 enum: [standard, tournament, practice, custom]
 *               scoreData:
 *                 type: object
 *                 description: Custom score data for the match
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
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
 *     summary: Delete a match
 *     description: Delete a match. Only GameMasters or admins can delete matches.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match id
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
  .route('/:matchId')
  .get(authMiddleware(), validate(matchValidation.getMatch), matchController.getMatch)
  .patch(authMiddleware('manageGames'), validate(matchValidation.updateMatch), matchController.updateMatch)
  .delete(authMiddleware('manageGames'), validate(matchValidation.deleteMatch), matchController.deleteMatch);

/**
 * @swagger
 * /matches/{id}/start:
 *   post:
 *     summary: Start a match
 *     description: Start a pending match. Users can start matches they participate in.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       "400":
 *         description: Bad request - match cannot be started
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:matchId/start')
  .post(authMiddleware('manageGames'), validate(matchValidation.startMatch), matchController.startMatch);

/**
 * @swagger
 * /matches/{id}/end:
 *   post:
 *     summary: End a match
 *     description: End an in-progress match and set the winner. Users can end matches they participate in.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - winningTeamId
 *             properties:
 *               winningTeamId:
 *                 type: string
 *                 description: ID of the winning team
 *               matchStatistics:
 *                 type: object
 *                 properties:
 *                   totalThrows:
 *                     type: integer
 *                   totalCatches:
 *                     type: integer
 *                   totalHits:
 *                     type: integer
 *                   totalDodges:
 *                     type: integer
 *                   mvpPlayerId:
 *                     type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       "400":
 *         description: Bad request - match cannot be ended
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
router
  .route('/:matchId/end')
  .post(authMiddleware('manageGames'), validate(matchValidation.endMatch), matchController.endMatch);

/**
 * @swagger
 * /matches/{id}/statistics:
 *   get:
 *     summary: Get match statistics
 *     description: Retrieve detailed statistics for a match.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalThrows:
 *                   type: integer
 *                 totalCatches:
 *                   type: integer
 *                 totalHits:
 *                   type: integer
 *                 totalDodges:
 *                   type: integer
 *                 matchDuration:
 *                   type: integer
 *                 mvpPlayerId:
 *                   type: string
 *                 teamStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       teamId:
 *                         type: string
 *                       teamName:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       playerStats:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             playerId:
 *                               type: string
 *                             playerName:
 *                               type: string
 *                             throws:
 *                               type: integer
 *                             catches:
 *                               type: integer
 *                             hits:
 *                               type: integer
 *                             dodges:
 *                               type: integer
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Not found
 */
router
  .route('/:matchId/statistics')
  .get(authMiddleware(), validate(matchValidation.getMatchStatistics), matchController.getMatchStatistics);

module.exports = router;
