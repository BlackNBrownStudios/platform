const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');
const bypassAuth = require('../../middlewares/bypassAuth');
const config = require('../../config/config');

// Use the appropriate auth middleware based on configuration
const authMiddleware = config.bypassAuth ? bypassAuth : auth;

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email, password, and name
 *     tags: [Auth]
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
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         description: Bad request
 */
router.post('/register', validate(authValidation.register), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
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
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 */
router.post('/login', validate(authValidation.login), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     description: Logout by invalidating the refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Please authenticate
 */
router.post('/logout', validate(authValidation.logout), authController.logout);

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     description: Get new access and refresh tokens using a valid refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   $ref: '#/components/schemas/Token'
 *                 refresh:
 *                   $ref: '#/components/schemas/Token'
 *       "401":
 *         description: Please authenticate
 */
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify email
 *     description: Verify user email using the token sent to their email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

router.post('/send-verification-email', authMiddleware(), authController.sendVerificationEmail);

// OAuth routes - temporarily commented out
// router.get('/google', auth.oAuth('google'));
// router.get('/google/callback', auth.oAuth('google'), authController.oauthCallback);

// router.get('/facebook', auth.oAuth('facebook'));
// router.get('/facebook/callback', auth.oAuth('facebook'), authController.oauthCallback);

// router.get('/apple', auth.oAuth('apple'));
// router.get('/apple/callback', auth.oAuth('apple'), authController.oauthCallback);

/**
 * @swagger
 * /auth/oauth-bypass:
 *   get:
 *     summary: OAuth Bypass
 *     description: Temporarily bypasses OAuth authentication for testing
 *     tags: [Auth]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 */

// Placeholder routes for OAuth (bypassing auth)
router.get('/google', (req, res) => res.redirect('/api/v1/auth/oauth-bypass'));
router.get('/google/callback', (req, res) => res.redirect('/api/v1/auth/oauth-bypass'));
router.get('/facebook', (req, res) => res.redirect('/api/v1/auth/oauth-bypass'));
router.get('/facebook/callback', (req, res) => res.redirect('/api/v1/auth/oauth-bypass'));
router.get('/apple', (req, res) => res.redirect('/api/v1/auth/oauth-bypass'));
router.get('/apple/callback', (req, res) => res.redirect('/api/v1/auth/oauth-bypass'));
router.get('/oauth-bypass', (req, res) => res.status(200).json({ message: 'OAuth authentication bypassed', user: { id: 'dummy-user-id', email: 'test@example.com', role: 'user' } }));

module.exports = router;
