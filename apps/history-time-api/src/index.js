const mongoose = require('mongoose');

const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  // Force port 5001 for consistency with frontend expectations
  const PORT = 5001;
  server = app.listen(PORT, () => {
    logger.info(`Listening to port ${PORT}`);
  });
});

// Handle unhandled promise rejections
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

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// SIGTERM signal handler for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
