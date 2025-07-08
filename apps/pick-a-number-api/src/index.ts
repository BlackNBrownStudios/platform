import mongoose from 'mongoose';
import { logger } from '@platform/backend-core';
import app from './app';

const PORT = process.env.PORT || 5003;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/pick-a-number';

// Connect to MongoDB
mongoose.connect(MONGODB_URL).then(() => {
  logger.info('Connected to MongoDB');
  
  app.listen(PORT, () => {
    logger.info(`Pick-a-Number API listening on port ${PORT}`);
  });
}).catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});