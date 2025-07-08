/**
 * Check Location Data Script
 * This script checks the status of location data in the historical events collection
 *
 * Usage: node check-location-data.js
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');

/**
 * Connect to the MongoDB database
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
 * Check location data status
 */
async function checkLocationData() {
  try {
    // Get total count of events
    const totalEvents = await HistoricalEvent.countDocuments();
    logger.info(`Total historical events in database: ${totalEvents}`);

    // Check for events with valid location data using the new schema
    const eventsWithLocationData = await HistoricalEvent.countDocuments({
      'locationCoordinates.coordinates': { $exists: true, $type: 'array' },
    });

    // Calculate percentage with safety check for division by zero
    const percentage =
      totalEvents > 0 ? ((eventsWithLocationData / totalEvents) * 100).toFixed(2) : 0;

    logger.info(`Events with location data: ${eventsWithLocationData} (${percentage}%)`);

    // Sample some events with location data
    if (eventsWithLocationData > 0) {
      const samplesWithLocation = await HistoricalEvent.find({
        'locationCoordinates.coordinates': { $exists: true, $type: 'array' },
      })
        .limit(5)
        .lean();

      logger.info('Sample events with location data:');
      samplesWithLocation.forEach((event) => {
        logger.info(
          `- "${event.title}" at ${event.locationName}: [${event.locationCoordinates?.coordinates[0]}, ${event.locationCoordinates?.coordinates[1]}]`
        );
      });
    }

    // Sample some events without location data
    const samplesWithoutLocation = await HistoricalEvent.find({
      $or: [
        { locationCoordinates: { $exists: false } },
        { 'locationCoordinates.coordinates': { $exists: false } },
      ],
    })
      .limit(5)
      .lean();

    logger.info('Sample events without location data:');
    samplesWithoutLocation.forEach((event) => {
      logger.info(`- "${event.title}" (${event.year})`);
    });

    return {
      totalEvents,
      eventsWithLocationData,
      percentage,
    };
  } catch (error) {
    logger.error(`Error checking location data: ${error.message}`);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await connectToDatabase();
    await checkLocationData();
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
