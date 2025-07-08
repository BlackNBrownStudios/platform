const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

/**
 * Register a new user
 * @public
 */
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

/**
 * Login with username and password
 * @public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

/**
 * Login with OAuth provider
 * @public
 */
const oauthCallback = catchAsync(async (req, res) => {
  // The provider and profile should be attached to the request by passport strategy
  const { provider, profile } = req;
  const { user, tokens } = await authService.handleOAuthAuthentication(provider, profile);
  
  // Redirect to app with tokens as query parameters
  // In a real app, you'd use a better approach than query params for security
  res.redirect(`${process.env.FRONTEND_URL}/auth-callback?access_token=${tokens.access.token}&refresh_token=${tokens.refresh.token}`);
});

/**
 * Logout
 * @public
 */
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Refresh auth tokens
 * @public
 */
const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

/**
 * Verify email
 * @public
 */
const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  oauthCallback,
  logout,
  refreshTokens,
  verifyEmail,
};
