/**
 * Database Status Check Script
 *
 * This script checks the status of cards and historical events in the database,
 * showing statistics to help diagnose issues with game cards.
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { Card, HistoricalEvent } = require('../models');

async function main() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Check historical events
    const totalEvents = await HistoricalEvent.countDocuments();
    logger.info(`HistoricalEvents in database: ${totalEvents}`);

    // Get event categories
    const eventCategories = await HistoricalEvent.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    logger.info('HistoricalEvent categories:');
    eventCategories.forEach((cat) => {
      logger.info(`  - ${cat._id || 'Uncategorized'}: ${cat.count}`);
    });

    // Check cards
    const totalCards = await Card.countDocuments();
    logger.info(`Cards in database: ${totalCards}`);

    // Get card verification status
    const verifiedCards = await Card.countDocuments({ isVerified: true });
    logger.info(`Verified cards: ${verifiedCards}`);
    logger.info(`Unverified cards: ${totalCards - verifiedCards}`);

    // Get card difficulty distribution
    const difficultyDistribution = await Card.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    logger.info('Cards by difficulty:');
    difficultyDistribution.forEach((diff) => {
      logger.info(`  - ${diff._id}: ${diff.count}`);
    });

    // Get card categories
    const cardCategories = await Card.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    logger.info('Card categories:');
    cardCategories.forEach((cat) => {
      logger.info(`  - ${cat._id || 'Uncategorized'}: ${cat.count}`);
    });

    // Check for sample cards
    const sampleCardTitles = await Card.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category difficulty');
    logger.info('Sample recent cards:');
    sampleCardTitles.forEach((card) => {
      logger.info(`  - "${card.title}" (${card.category}, ${card.difficulty})`);
    });

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
