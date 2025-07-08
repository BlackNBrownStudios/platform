const rateLimit = require('express-rate-limit');

/**
 * Auth routes rate limiter to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  skipSuccessfulRequests: true, // count only failed requests
  message: 'Too many authentication attempts, please try again after 15 minutes',
});

module.exports = {
  authLimiter,
};
