// Re-export plugins from platform backend-core package
const { toJSON, paginate } = require('@platform/backend-core');

module.exports = {
  toJSON,
  paginate,
};