/**
 * Fix Location Data Script
 * This script fixes malformed location data in historical events
 *
 * Usage: node fix-location-data.js
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');

/**
 * Connect to the database
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Fix events with malformed location data
 */
async function fixLocationData() {
  try {
    // Find events with invalid location coordinates
    const eventsToFix = await HistoricalEvent.find({
      'locationCoordinates.type': 'Point',
      'locationCoordinates.coordinates': { $exists: false },
    });

    logger.info(`Found ${eventsToFix.length} events with malformed location data`);

    let fixed = 0;
    let errors = 0;

    // Fix each event by removing the invalid locationCoordinates field
    for (const event of eventsToFix) {
      try {
        // Remove the locationCoordinates field completely
        event.locationCoordinates = undefined;

        // Save the updated event
        await event.save();
        fixed++;

        if (fixed % 10 === 0 || fixed === eventsToFix.length) {
          logger.info(`Fixed ${fixed} events so far`);
        }
      } catch (error) {
        logger.error(`Error fixing event "${event.title}": ${error.message}`);
        errors++;
      }
    }

    // Report results
    logger.info(`
Fix complete!
- ${fixed} events fixed
- ${errors} errors encountered
`);

    // Check for any remaining malformed events
    const remainingIssues = await HistoricalEvent.countDocuments({
      'locationCoordinates.type': 'Point',
      'locationCoordinates.coordinates': { $exists: false },
    });

    if (remainingIssues > 0) {
      logger.warn(`There are still ${remainingIssues} events with malformed location data`);
    } else {
      logger.info('All events with malformed location data have been fixed');
    }
  } catch (error) {
    logger.error(`Error in fixLocationData: ${error.message}`);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await connectToDatabase();
    await fixLocationData();

    logger.info('Fix process completed successfully');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  } finally {
    // Close database connection
    mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run the script
main();
