/**
 * Import Timeline Events Script
 * Imports historical events from Wikipedia timeline pages
 */
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const WikipediaScraper = require('../services/scraper.service');

/**
 * Main function to run the script
 */
async function importTimelineEvents() {
  try {
    // Connect to MongoDB
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
      logger.info('Connected to MongoDB');
    });

    // List of Wikipedia timeline URLs to scrape
    const timelineUrls = [
      // World history overview
      'https://en.wikipedia.org/wiki/Timeline_of_world_history',

      // Ancient history
      'https://en.wikipedia.org/wiki/Timeline_of_ancient_history',

      // Regional ancient history
      'https://en.wikipedia.org/wiki/Timeline_of_ancient_Greece',
      'https://en.wikipedia.org/wiki/Timeline_of_ancient_Rome',
      'https://en.wikipedia.org/wiki/Timeline_of_ancient_Mesopotamia',
      'https://en.wikipedia.org/wiki/Timeline_of_ancient_Egypt',

      // Medieval history
      'https://en.wikipedia.org/wiki/Timeline_of_the_Middle_Ages',

      // Modern history
      'https://en.wikipedia.org/wiki/Timeline_of_modern_history',
      'https://en.wikipedia.org/wiki/Timeline_of_the_American_Revolution',
      'https://en.wikipedia.org/wiki/Timeline_of_the_French_Revolution',
      'https://en.wikipedia.org/wiki/Timeline_of_the_Industrial_Revolution',

      // Contemporary history
      'https://en.wikipedia.org/wiki/Timeline_of_the_20th_century',
      'https://en.wikipedia.org/wiki/Timeline_of_the_21st_century',

      // Scientific advancements
      'https://en.wikipedia.org/wiki/Timeline_of_scientific_discoveries',
      'https://en.wikipedia.org/wiki/Timeline_of_medicine_and_medical_technology',

      // Technology
      'https://en.wikipedia.org/wiki/Timeline_of_computing',
      'https://en.wikipedia.org/wiki/Timeline_of_transportation_technology',

      // Arts and culture
      'https://en.wikipedia.org/wiki/Timeline_of_art_history',
      'https://en.wikipedia.org/wiki/Timeline_of_musical_events',
    ];

    logger.info(`Starting to import events from ${timelineUrls.length} timeline pages`);

    // Process each URL
    const results = await WikipediaScraper.scrapeMultipleTimelines(timelineUrls);

    // Log results
    let totalSuccess = 0;
    let totalEvents = 0;

    results.forEach((result) => {
      if (result.success) {
        totalSuccess++;
        totalEvents += result.eventsExtracted;
        logger.info(`✓ Successfully imported ${result.eventsExtracted} events from ${result.url}`);
      } else {
        logger.error(`✗ Failed to import from ${result.url}: ${result.error}`);
      }
    });

    logger.info(
      `Import completed: ${totalSuccess}/${timelineUrls.length} sources processed, ${totalEvents} events imported`
    );

    // Delay before closing connection to ensure all logs are printed
    setTimeout(() => {
      mongoose.connection.close();
      logger.info('Database connection closed');
      process.exit(0);
    }, 1000);
  } catch (error) {
    logger.error(`Error in script execution: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
importTimelineEvents();
