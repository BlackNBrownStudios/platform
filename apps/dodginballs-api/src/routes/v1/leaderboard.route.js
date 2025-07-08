const express = require('express');
const auth = require('../../middlewares/auth');
const bypassAuth = require('../../middlewares/bypassAuth');
const config = require('../../config/config');
const { leaderboardController } = require('../../controllers');

// Use the appropriate auth middleware based on configuration
const authMiddleware = config.bypassAuth ? bypassAuth : auth;

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Leaderboard and statistics management
 */

/**
 * @swagger
 * /leaderboard/users:
 *   get:
 *     summary: Get user leaderboard
 *     description: Get a paginated list of top users sorted by games won.
 *     tags: [Leaderboard]
 *     parameters:
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
 *                     $ref: '#/components/schemas/UserLeaderboard'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */
router.get('/users', authMiddleware('getGames'), leaderboardController.getUserLeaderboard);

/**
 * @swagger
 * /leaderboard/users/all:
 *   get:
 *     summary: Get leaderboard for all users
 *     description: Get a paginated list of top users sorted by all wins.
 *     tags: [Leaderboard]
 *     parameters:
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
 *                     $ref: '#/components/schemas/UserLeaderboard'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */
router.get('/users/all', authMiddleware('getGames'), leaderboardController.getUserAllWinsLeaderboard);

/**
 * @swagger
 * /leaderboard/teams:
 *   get:
 *     summary: Get team leaderboard
 *     description: Get a paginated list of top teams sorted by wins.
 *     tags: [Leaderboard]
 *     parameters:
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
 *                     $ref: '#/components/schemas/TeamLeaderboard'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */
router.get('/teams', authMiddleware('getGames'), leaderboardController.getTeamLeaderboard);

/**
 * @swagger
 * /leaderboard/matches:
 *   get:
 *     summary: Get recent matches
 *     description: Get a paginated list of recent matches.
 *     tags: [Leaderboard]
 *     parameters:
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
 *                     $ref: '#/components/schemas/MatchStatistics'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */
router.get('/matches', authMiddleware('getGames'), leaderboardController.getRecentMatches);

/**
 * @swagger
 * /leaderboard/global:
 *   get:
 *     summary: Get global statistics
 *     description: Get global game statistics.
 *     tags: [Leaderboard]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GlobalStatistics'
 */
router.get('/global', authMiddleware('getGames'), leaderboardController.getGlobalStatistics);

// Add a root path handler that redirects to user leaderboard for backward compatibility with client
router.route('/').get(authMiddleware('getGames'), leaderboardController.getUserLeaderboard);

module.exports = router;
