const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const config = require('../src/config/config');

let mongoServer;

/**
 * Connect to a new in-memory database before running any tests.
 */
const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Override the MongoDB URI in config with our in-memory test database
    config.mongoose.url = mongoUri;
    
    await mongoose.connect(mongoUri, config.mongoose.options);
  });

  // Clean up database between tests
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  // Disconnect and clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Suppress console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
};

module.exports = setupTestDB;
