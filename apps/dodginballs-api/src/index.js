const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { getDocumentDBOptions } = require('./config/docdb-setup');

let server;
// Use the port from config instead of hardcoding it
const PORT = config.port;

// Enhanced MongoDB connection with DocumentDB support
async function startServer() {
  try {
    let options = config.mongoose.options;
    
    // Only use DocumentDB options if we're not connecting to localhost
    if (!config.mongoose.url.includes('localhost') && !config.mongoose.url.includes('127.0.0.1')) {
      const connectionOptions = await getDocumentDBOptions();
      options = { ...options, ...connectionOptions };
    }
    
    // Connect to MongoDB/DocumentDB
    await mongoose.connect(config.mongoose.url, options);
    logger.info('Connected to MongoDB/DocumentDB');
    
    // Start Express server after successful DB connection
    server = app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle unexpected errors
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

// Listen for unhandled rejections and exceptions
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Listen for SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
