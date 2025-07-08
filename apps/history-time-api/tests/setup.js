const { MongoMemoryServer } = require('mongodb-memory-server');

// Increase timeout for test setup
jest.setTimeout(30000);

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URL = 'mongodb://localhost:27017/history-time-test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1d';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Suppress console logs during tests unless explicitly needed
if (process.env.DEBUG !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global test helpers
global.testHelpers = {
  // Generate test JWT token
  generateTestToken: (userId) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  },

  // Create authenticated request headers
  authHeaders: (token) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }),

  // Common test data
  testUser: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
};

// Clean up after all tests
afterAll(async () => {
  // Close database connections
  const mongoose = require('mongoose');
  await mongoose.disconnect();

  // Stop MongoDB Memory Server if running
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
});
