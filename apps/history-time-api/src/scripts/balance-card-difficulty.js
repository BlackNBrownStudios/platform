/**
 * Balance Card Difficulty Script
 *
 * This script redistributes card difficulty levels to make the game more balanced,
 * ensuring there are cards available at all difficulty levels.
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

    // Count cards by current difficulty
    const difficultyCounts = await Card.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    logger.info('Current difficulty distribution:');
    difficultyCounts.forEach((d) => logger.info(`  - ${d._id}: ${d.count}`));

    // Get total count of cards
    const totalCards = await Card.countDocuments();

    // Target percentages for each difficulty level
    const targetDistribution = {
      easy: 0.25, // 25% of cards
      medium: 0.35, // 35% of cards
      hard: 0.3, // 30% of cards
      expert: 0.1, // 10% of cards
    };

    // Calculate target counts
    const targetCounts = {
      easy: Math.floor(totalCards * targetDistribution.easy),
      medium: Math.floor(totalCards * targetDistribution.medium),
      hard: Math.floor(totalCards * targetDistribution.hard),
      expert: Math.floor(totalCards * targetDistribution.expert),
    };

    logger.info('Target difficulty distribution:');
    Object.entries(targetCounts).forEach(([diff, count]) => {
      logger.info(`  - ${diff}: ${count}`);
    });

    // Start with a clean slate - get all cards
    const cards = await Card.find().select('_id difficulty');
    let remainingCards = [...cards];

    // Track how many cards we've already processed for each difficulty
    const processed = { easy: 0, medium: 0, hard: 0, expert: 0 };

    // For each difficulty level, find cards to assign
    for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
      const targetCount = targetCounts[difficulty];
      const currentCount = remainingCards.filter((c) => c.difficulty === difficulty).length;

      // Skip if we already have enough cards at this difficulty
      if (currentCount >= targetCount) {
        logger.info(
          `Already have ${currentCount} cards with ${difficulty} difficulty (target: ${targetCount})`
        );
        // Mark these cards as processed
        processed[difficulty] = currentCount;
        remainingCards = remainingCards.filter((c) => c.difficulty !== difficulty);
        continue;
      }

      // We need to convert some cards to this difficulty
      const neededCount = targetCount - currentCount;
      logger.info(`Need to convert ${neededCount} cards to ${difficulty} difficulty`);

      // Take cards from remainingCards
      const cardsToUpdate = remainingCards.slice(0, neededCount);

      // Update these cards to the new difficulty
      const cardIds = cardsToUpdate.map((c) => c._id);
      const updateResult = await Card.updateMany(
        { _id: { $in: cardIds } },
        { $set: { difficulty } }
      );

      logger.info(`Updated ${updateResult.modifiedCount} cards to ${difficulty} difficulty`);

      // Remove these cards from remainingCards
      remainingCards = remainingCards.slice(neededCount);
    }

    // Count cards by new difficulty
    const newDifficultyCounts = await Card.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    logger.info('New difficulty distribution:');
    newDifficultyCounts.forEach((d) => logger.info(`  - ${d._id}: ${d.count}`));

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
