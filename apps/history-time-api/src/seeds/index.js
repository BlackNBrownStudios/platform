const mongoose = require('mongoose');

const config = require('../config/config');

const { seedHistoricalEvents } = require('./historical-events');

/**
 * Main seed function to run all seed operations
 */
const runSeeds = async () => {
  try {
    console.log('Starting database seeding process...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log(`Connecting to MongoDB at ${config.mongoose.url}...`);
      await mongoose.connect(config.mongoose.url, config.mongoose.options);
      console.log('MongoDB connected successfully');
    }

    // Run historical events seeding
    await seedHistoricalEvents();

    // Add other seed functions here as needed

    console.log('All seed operations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  }
};

// If this script is run directly, execute all seeds
if (require.main === module) {
  runSeeds();
}

module.exports = {
  runSeeds,
};
