/**
 * Timeline Management Script
 * A utility for managing historical timeline data imports
 */
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');
const WikipediaScraper = require('../services/scraper.service');

// Available timeline categories with their associated URLs
const TIMELINE_SOURCES = {
  ancient: [
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_history',
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_Greece',
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_Rome',
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_Mesopotamia',
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_Egypt',
  ],
  medieval: ['https://en.wikipedia.org/wiki/Timeline_of_the_Middle_Ages'],
  modern: [
    'https://en.wikipedia.org/wiki/Timeline_of_modern_history',
    'https://en.wikipedia.org/wiki/Timeline_of_the_American_Revolution',
    'https://en.wikipedia.org/wiki/Timeline_of_the_French_Revolution',
  ],
  contemporary: [
    'https://en.wikipedia.org/wiki/Timeline_of_the_20th_century',
    'https://en.wikipedia.org/wiki/Timeline_of_the_21st_century',
  ],
  science: [
    'https://en.wikipedia.org/wiki/Timeline_of_scientific_discoveries',
    'https://en.wikipedia.org/wiki/Timeline_of_medicine_and_medical_technology',
  ],
  technology: [
    'https://en.wikipedia.org/wiki/Timeline_of_computing',
    'https://en.wikipedia.org/wiki/Timeline_of_transportation_technology',
  ],
  arts: [
    'https://en.wikipedia.org/wiki/Timeline_of_art_history',
    'https://en.wikipedia.org/wiki/Timeline_of_musical_events',
  ],
  // Add more categories and sources as needed
};

/**
 * Import timelines for specific categories
 *
 * @param {Array<string>} categories - Categories to import
 * @returns {Promise<Object>} - Results of the import
 */
async function importTimelineCategories(categories) {
  // Use all categories if none specified
  const categoriesToImport =
    categories && categories.length > 0 ? categories : Object.keys(TIMELINE_SOURCES);

  let urls = [];

  // Collect URLs for selected categories
  categoriesToImport.forEach((category) => {
    if (TIMELINE_SOURCES[category]) {
      urls = urls.concat(TIMELINE_SOURCES[category]);
    } else {
      logger.warn(`Category "${category}" not found in available timeline sources`);
    }
  });

  // Import the selected timelines
  return await WikipediaScraper.scrapeMultipleTimelines(urls);
}

/**
 * Get stats about imported events
 *
 * @returns {Promise<Object>} - Statistics about imported events
 */
async function getTimelineStats() {
  const totalCount = await HistoricalEvent.countDocuments({});

  // Count by category
  const categoryCounts = await HistoricalEvent.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Count by century
  const centuryCounts = await HistoricalEvent.aggregate([
    {
      $addFields: {
        century: {
          $concat: [
            {
              $toString: {
                $cond: [
                  { $lt: ['$year', 0] },
                  { $subtract: [{ $multiply: [{ $divide: [{ $abs: '$year' }, 100] }, -1] }, 1] },
                  { $floor: { $divide: ['$year', 100] } },
                ],
              },
            },
            {
              $cond: [{ $lt: ['$year', 0] }, ' BCE', ''],
            },
          ],
        },
      },
    },
    { $group: { _id: '$century', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalEvents: totalCount,
    byCategory: categoryCounts,
    byCentury: centuryCounts,
  };
}

/**
 * Delete events by category
 *
 * @param {string} category - Category of events to delete
 * @returns {Promise<number>} - Number of deleted events
 */
async function deleteEventsByCategory(category) {
  const result = await HistoricalEvent.deleteMany({ category });
  return result.deletedCount;
}

/**
 * Delete events by time period
 *
 * @param {number} startYear - Start year (inclusive)
 * @param {number} endYear - End year (inclusive)
 * @returns {Promise<number>} - Number of deleted events
 */
async function deleteEventsByTimePeriod(startYear, endYear) {
  const result = await HistoricalEvent.deleteMany({
    year: { $gte: startYear, $lte: endYear },
  });
  return result.deletedCount;
}

/**
 * Parse command-line arguments and run the appropriate command
 */
async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
      // No command provided, show usage
      showUsage();
      return;
    }

    switch (command) {
      case 'import': {
        // Import timeline data
        const categories = args.slice(1);
        logger.info(
          `Importing timeline data for categories: ${
            categories.length > 0 ? categories.join(', ') : 'all'
          }`
        );

        const results = await importTimelineCategories(categories);

        // Log results
        let totalSuccess = 0;
        let totalEvents = 0;

        results.forEach((result) => {
          if (result.success) {
            totalSuccess++;
            totalEvents += result.eventsExtracted;
            logger.info(
              `✓ Successfully imported ${result.eventsExtracted} events from ${result.url}`
            );
          } else {
            logger.error(`✗ Failed to import from ${result.url}: ${result.error}`);
          }
        });

        logger.info(
          `Import completed: ${totalSuccess}/${results.length} sources processed, ${totalEvents} events imported`
        );
        break;
      }

      case 'stats': {
        // Show statistics about imported events
        const stats = await getTimelineStats();

        logger.info(`Total historical events: ${stats.totalEvents}`);

        logger.info('\nEvents by category:');
        stats.byCategory.forEach((cat) => {
          logger.info(`${cat._id}: ${cat.count} events`);
        });

        logger.info('\nEvents by century:');
        stats.byCentury.forEach((cent) => {
          // Format century for display (add ordinal suffix, handle BCE/CE)
          let centuryDisplay = cent._id;
          if (!centuryDisplay.includes('BCE')) {
            const num = parseInt(centuryDisplay, 10) + 1;
            const suffix = ['th', 'st', 'nd', 'rd'][
              num % 10 > 3 ? 0 : (num % 100) - (num % 10) != 10 ? num % 10 : 0
            ];
            centuryDisplay = `${num}${suffix} century CE`;
          } else {
            const num = Math.abs(parseInt(centuryDisplay, 10));
            const suffix = ['th', 'st', 'nd', 'rd'][
              num % 10 > 3 ? 0 : (num % 100) - (num % 10) != 10 ? num % 10 : 0
            ];
            centuryDisplay = `${num}${suffix} century BCE`;
          }
          logger.info(`${centuryDisplay}: ${cent.count} events`);
        });
        break;
      }

      case 'delete-category': {
        // Delete events by category
        const categoryToDelete = args[1];
        if (!categoryToDelete) {
          logger.error('No category specified for deletion');
          showUsage();
          break;
        }

        const deletedCount = await deleteEventsByCategory(categoryToDelete);
        logger.info(`Deleted ${deletedCount} events from category "${categoryToDelete}"`);
        break;
      }

      case 'delete-period': {
        // Delete events by time period
        const startYear = parseInt(args[1], 10);
        const endYear = parseInt(args[2], 10);

        if (isNaN(startYear) || isNaN(endYear)) {
          logger.error('Invalid time period specified for deletion');
          showUsage();
          break;
        }

        const deletedPeriodCount = await deleteEventsByTimePeriod(startYear, endYear);
        logger.info(`Deleted ${deletedPeriodCount} events from period ${startYear} to ${endYear}`);
        break;
      }

      case 'help':
      default: {
        showUsage();
        break;
      }
    }

    // Close database connection
    mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error(`Error in script execution: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
Timeline Management Script
Usage: node manage-timelines.js [command] [options]

Commands:
  import [categories...]     Import timeline data for specified categories (or all if none specified)
  stats                      Show statistics about imported events
  delete-category [category] Delete events by category
  delete-period [start] [end] Delete events by time period (years)
  help                       Show this help message

Available categories:
${Object.keys(TIMELINE_SOURCES)
  .map((cat) => `  - ${cat}`)
  .join('\n')}

Examples:
  node manage-timelines.js import ancient medieval    # Import ancient and medieval timeline data
  node manage-timelines.js stats                      # Show statistics about imported events
  node manage-timelines.js delete-category "Science"  # Delete all Science events
  node manage-timelines.js delete-period -800 -700    # Delete events from 800 BCE to 700 BCE
  `);
}

// Run the script if executed directly
if (require.main === module) {
  run();
}

module.exports = {
  importTimelineCategories,
  getTimelineStats,
  deleteEventsByCategory,
  deleteEventsByTimePeriod,
};
