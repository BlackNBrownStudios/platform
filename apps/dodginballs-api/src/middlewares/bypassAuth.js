const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');

/**
 * Authentication middleware with bypass option
 * @param {Array<string>} requiredRights - Required rights for this route
 * @returns {Function} - Express middleware
 */
const bypassAuth = (...requiredRights) => async (req, res, next) => {
  // Check if auth bypass is enabled
  if (config.bypassAuth) {
    console.log('[AUTH BYPASS] Authentication bypassed for testing');
    // Set a default admin user for testing
    req.user = {
      id: 'bypass-user-id',
      name: 'Bypass User',
      email: 'bypass@example.com',
      role: 'admin', // Admin role to access all endpoints
    };
    return next();
  }
  
  // If bypass is not enabled, check for the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  
  try {
    // Implement regular JWT verification here
    // For now, since we're bypassing, we'll just throw an error if bypass is disabled
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  } catch (error) {
    return next(error);
  }
};

module.exports = bypassAuth;