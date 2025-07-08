const httpStatus = require('http-status');

const { tokenTypes } = require('../config/tokens');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');

const tokenService = require('./token.service');
const userService = require('./user.service');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Login or create user with OAuth provider
 * @param {string} provider - OAuth provider ('google', 'facebook', 'apple')
 * @param {Object} profile - OAuth profile data
 * @returns {Promise<User>}
 */
const loginWithOAuthProvider = async (user) => {
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed');
  }

  // Update user last login time or any other metrics here if needed

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Link OAuth provider to existing account
 * @param {ObjectId} userId
 * @param {string} provider
 * @param {Object} providerData
 * @returns {Promise<User>}
 */
const linkOAuthProvider = async (userId, provider, providerData) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.oauth) {
    user.oauth = {};
  }

  user.oauth[provider] = providerData;
  await user.save();

  return user;
};

/**
 * Unlink OAuth provider from account
 * @param {ObjectId} userId
 * @param {string} provider
 * @returns {Promise<User>}
 */
const unlinkOAuthProvider = async (userId, provider) => {
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.authType === provider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot unlink primary authentication method');
  }

  if (user.oauth && user.oauth[provider]) {
    user.oauth[provider] = undefined;
    await user.save();
  }

  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  loginWithOAuthProvider,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  linkOAuthProvider,
  unlinkOAuthProvider,
};
