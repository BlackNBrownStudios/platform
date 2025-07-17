// Re-export error middleware from platform backend-core package
const { errorConverter, errorHandler } = require('@platform/backend-core');

module.exports = {
  errorConverter,
  errorHandler,
};