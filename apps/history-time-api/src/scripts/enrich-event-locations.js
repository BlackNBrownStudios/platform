/**
 * Geographical Enrichment Script
 * Enhances historical events with location data
 */
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');
const GeoEnrichment = require('../services/geo-enrichment.service');

/**
 * Main function to run the script
 */
async function enrichEventLocations() {
  try {
    // Connect to MongoDB
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
      logger.info('Connected to MongoDB');
    });

    // Parse command line arguments
    const args = process.argv.slice(2);
    const limit = args.length > 0 ? parseInt(args[0], 10) : 0;

    if (isNaN(limit)) {
      console.log(`
Usage: node enrich-event-locations.js [limit]

  limit: Maximum number of events to process (optional, default: all)

Example:
  node enrich-event-locations.js 100    # Process up to 100 events
  node enrich-event-locations.js        # Process all events
      `);
      mongoose.connection.close();
      return;
    }

    // Get current stats before enrichment
    const totalEvents = await HistoricalEvent.countDocuments();
    const eventsWithLocation = await HistoricalEvent.countDocuments({
      'location.coordinates': { $exists: true },
    });

    logger.info(
      `Current database status: ${eventsWithLocation}/${totalEvents} events have location data (${Math.round(
        (eventsWithLocation / totalEvents) * 100
      )}%)`
    );

    // Run the batch enrichment
    logger.info(
      `Starting geographical enrichment process${limit > 0 ? ` for up to ${limit} events` : ''}`
    );
    const enrichedCount = await GeoEnrichment.batchEnrichDatabaseEvents(limit);

    // Get updated stats
    const newEventsWithLocation = await HistoricalEvent.countDocuments({
      'location.coordinates': { $exists: true },
    });

    logger.info(`
Enrichment complete!
- ${enrichedCount} events were successfully enriched with location data
- New database status: ${newEventsWithLocation}/${totalEvents} events have location data (${Math.round(
      (newEventsWithLocation / totalEvents) * 100
    )}%)
    `);

    // Close the database connection
    mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error(`Error in script execution: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  enrichEventLocations();
}

module.exports = enrichEventLocations;
