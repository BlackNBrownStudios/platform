const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// MongoDB in-memory server for testing
let mongoServer;

// Increase default Jest timeout (5s) to 30s to accommodate in-memory MongoDB start-up
test.setTimeout ? test.setTimeout(30000) : jest.setTimeout(30000);

/**
 * Connect to the in-memory database before running tests
 */
const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  /**
   * Clear all test data after every test
   */
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  /**
   * Remove and close the db and server.
   */
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
};

module.exports = setupTestDB;
