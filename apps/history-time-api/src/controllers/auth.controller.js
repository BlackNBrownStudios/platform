const httpStatus = require('http-status');

const config = require('../config/config');
const { authService, userService, tokenService, emailService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
  // Send welcome email in background
  emailService.sendWelcomeEmail(user.email, user.name).catch((error) => {
    console.error('Error sending welcome email:', error);
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

// OAuth callback handlers
const oauthCallback = (provider) =>
  catchAsync(async (req, res) => {
    const user = await authService.loginWithOAuthProvider(req.user);
    const tokens = await tokenService.generateAuthTokens(user);

    // Redirect to frontend with tokens
    res.redirect(
      `${config.clientUrl}/auth/oauth-callback?token=${tokens.access.token}&refreshToken=${tokens.refresh.token}&userId=${user.id}`
    );
  });

// Google OAuth handlers
const googleCallback = oauthCallback('google');

// Facebook OAuth handlers
const facebookCallback = oauthCallback('facebook');

// Apple OAuth handlers
const appleCallback = oauthCallback('apple');

// Link OAuth provider to account
const linkOAuthProvider = catchAsync(async (req, res) => {
  const { provider, providerData } = req.body;
  const user = await authService.linkOAuthProvider(req.user.id, provider, providerData);
  res.send(user);
});

// Unlink OAuth provider from account
const unlinkOAuthProvider = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const user = await authService.unlinkOAuthProvider(req.user.id, provider);
  res.send(user);
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleCallback,
  facebookCallback,
  appleCallback,
  linkOAuthProvider,
  unlinkOAuthProvider,
};
