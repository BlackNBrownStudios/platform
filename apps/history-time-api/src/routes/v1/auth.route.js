const express = require('express');
const passport = require('passport');

const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');

const router = express.Router();

// Regular authentication routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post(
  '/refresh-tokens',
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);
router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
  authController.resetPassword
);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

// OAuth routes - Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.googleCallback
);

// OAuth routes - Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  authController.facebookCallback
);

// OAuth routes - Apple
router.get('/apple', passport.authenticate('apple', { scope: ['email', 'name'], session: false }));

router.get(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login', session: false }),
  authController.appleCallback
);

// OAuth account linking/unlinking (requires authentication)
router.post(
  '/link-provider',
  auth(),
  validate(authValidation.linkOAuthProvider),
  authController.linkOAuthProvider
);

router.delete(
  '/unlink-provider/:provider',
  auth(),
  validate(authValidation.unlinkOAuthProvider),
  authController.unlinkOAuthProvider
);

module.exports = router;
