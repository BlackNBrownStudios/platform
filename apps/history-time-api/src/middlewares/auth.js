const httpStatus = require('http-status');
const passport = require('passport');

const { roleRights } = require('../config/roles');
const ApiError = require('../utils/ApiError');

const verifyCallback =
  (req, resolve, reject, requiredRights, optional = false) =>
  async (err, user, info) => {
    if (err || info || !user) {
      if (optional) {
        // If authentication is optional, continue without a user
        return resolve();
      }
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

const auth = (options = {}) => {
  // Extract options
  const { optional = false } = typeof options === 'object' ? options : { optional: false };

  // Handle the old-style variadic arguments for required rights
  const requiredRights = Array.isArray(options)
    ? options
    : // eslint-disable-next-line no-undef
      arguments.length > 0 && !Object.prototype.hasOwnProperty.call(options, 'optional')
      ? // eslint-disable-next-line no-undef
        Array.from(arguments)
      : [];

  return async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        'jwt',
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights, optional)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };
};

module.exports = auth;
