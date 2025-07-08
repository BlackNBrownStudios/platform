import mongoose from 'mongoose';
import { logger } from '@platform/backend-core';
import app from './app';
import config from './config/config';

let server: any;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  // Force port 5001 for consistency with frontend expectations
  const PORT = 5001;
  server = app.listen(PORT, () => {
    logger.info(`History Time API listening on port ${PORT}`);
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

const unexpectedErrorHandler = (error: Error) => {
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