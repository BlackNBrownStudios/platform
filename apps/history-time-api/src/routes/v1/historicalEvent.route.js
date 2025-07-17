/**
 * Historical Event Routes
 * API endpoints for historical events
 */
const express = require('express');

const historicalEventController = require('../../controllers/historicalEvent.controller');
const { auth } = require('@platform/auth-backend');
const { validate } = require('@platform/backend-core');
const historicalEventValidation = require('../../validations/historicalEvent.validation');

const router = express.Router();

// Get all categories
router.route('/categories').get(historicalEventController.getCategories);

// Get year range
router.route('/year-range').get(historicalEventController.getYearRange);

// Get count of events
router.route('/count').get(historicalEventController.getEventsCount);

// Get random events for game
router
  .route('/random')
  .get(
    validate(historicalEventValidation.getRandomEvents),
    historicalEventController.getRandomEvents
  );

// Submit an event for verification (requires authentication)
router
  .route('/submit')
  .post(
    auth(),
    validate(historicalEventValidation.submitEvent),
    historicalEventController.submitEvent
  );

// Get events by category
router
  .route('/category/:category')
  .get(
    validate(historicalEventValidation.getEventsByCategory),
    historicalEventController.getEventsByCategory
  );

// Get events by time period
router
  .route('/period/:startYear/:endYear')
  .get(
    validate(historicalEventValidation.getEventsByTimePeriod),
    historicalEventController.getEventsByTimePeriod
  );

// CRUD operations on historical events
router
  .route('/')
  .post(
    auth('manageHistoricalEvents'),
    validate(historicalEventValidation.createHistoricalEvent),
    historicalEventController.createHistoricalEvent
  )
  .get(
    validate(historicalEventValidation.getHistoricalEvents),
    historicalEventController.getHistoricalEvents
  );

router
  .route('/:eventId')
  .get(
    validate(historicalEventValidation.getHistoricalEvent),
    historicalEventController.getHistoricalEvent
  )
  .patch(
    auth('manageHistoricalEvents'),
    validate(historicalEventValidation.updateHistoricalEvent),
    historicalEventController.updateHistoricalEvent
  )
  .delete(
    auth('manageHistoricalEvents'),
    validate(historicalEventValidation.deleteHistoricalEvent),
    historicalEventController.deleteHistoricalEvent
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: HistoricalEvents
 *   description: Historical events management and retrieval
 */

/**
 * @swagger
 * /historical-events:
 *   post:
 *     summary: Create a historical event
 *     description: Only admins can create historical events.
 *     tags: [HistoricalEvents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - year
 *               - category
 *               - sources
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               year:
 *                 type: number
 *               month:
 *                 type: number
 *               day:
 *                 type: number
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               significance:
 *                 type: string
 *                 enum: [low, medium, high, pivotal]
 *               imageUrl:
 *                 type: string
 *               sources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *               verified:
 *                 type: boolean
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricalEvent'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all historical events
 *     description: Everyone can retrieve historical events.
 *     tags: [HistoricalEvents]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Event category
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: number
 *         description: Start year for filtering
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: number
 *         description: End year for filtering
 *       - in: query
 *         name: significance
 *         schema:
 *           type: string
 *         description: Event significance level
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Text search term
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field:direction (e.g., year:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of results per page
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
 *                     $ref: '#/components/schemas/HistoricalEvent'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */

// Additional swagger documentation for other routes goes here
