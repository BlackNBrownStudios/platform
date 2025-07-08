/**
 * Verify All Cards Script
 *
 * This script marks all cards in the database as verified
 * so they can be used in the game.
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { Card } = require('../models');

async function main() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Count unverified cards
    const unverifiedCount = await Card.countDocuments({ isVerified: { $ne: true } });
    logger.info(`Found ${unverifiedCount} unverified cards`);

    if (unverifiedCount === 0) {
      logger.info('No unverified cards found. All cards are already verified.');
      await mongoose.disconnect();
      return;
    }

    // Update all cards to be verified
    const result = await Card.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );

    logger.info(`Verified ${result.modifiedCount} cards successfully`);
    logger.info(`${result.matchedCount} cards matched the query`);

    // Disconnect from the database
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error(`Error: ${error.message}`);

    // Ensure we disconnect on error
    try {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    } catch (disconnectError) {
      logger.error(`Error disconnecting: ${disconnectError.message}`);
    }
  }
}

// Run the script if it's executed directly
if (require.main === module) {
  main();
}

module.exports = main;
