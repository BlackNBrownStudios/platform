const Joi = require('joi');

const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const linkOAuthProvider = {
  body: Joi.object().keys({
    provider: Joi.string().required().valid('google', 'facebook', 'apple'),
    providerData: Joi.object().required().keys({
      id: Joi.string().required(),
      token: Joi.string().required(),
      profile: Joi.object().optional(),
    }),
  }),
};

const unlinkOAuthProvider = {
  params: Joi.object().keys({
    provider: Joi.string().required().valid('google', 'facebook', 'apple'),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  linkOAuthProvider,
  unlinkOAuthProvider,
};
