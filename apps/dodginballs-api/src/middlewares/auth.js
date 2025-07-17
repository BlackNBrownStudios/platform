// Re-export auth middleware from platform auth-backend package
const { auth } = require('@platform/auth-backend');

module.exports = auth;