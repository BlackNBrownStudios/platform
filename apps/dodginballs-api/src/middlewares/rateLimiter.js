const rateLimit = require('express-rate-limit');

// Create a limiter for auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  skipSuccessfulRequests: false,
  message: {
    code: 429,
    message: 'Too many requests, please try again later.',
  },
});

module.exports = {
  authLimiter,
};
