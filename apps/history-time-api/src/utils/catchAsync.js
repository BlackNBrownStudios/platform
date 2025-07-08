/**
 * Utility function to wrap async route handlers to catch and forward errors to error middleware
 * This eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
