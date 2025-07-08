/**
 * Wikipedia Historical Events Scraper
 *
 * This script provides a command-line interface for scraping historical events from Wikipedia
 * and storing them in the database. It leverages the WikipediaScraper service to extract
 * events from various Wikipedia timeline pages.
 *
 * Usage:
 *   node scrape-historical-events.js [command] [options]
 *
 * Commands:
 *   scrape-url <url>              - Scrape events from a specific Wikipedia URL
 *   scrape-batch <batchname>      - Scrape predefined batch of Wikipedia timeline pages
 *   list-batches                  - List available predefined batches
 *   search <keywords>             - Search Wikipedia for relevant timeline pages
 *   convert                       - Convert scraped events to game cards
 *   backup [filename]             - Backup scraped events to a file
 *   stats                         - Show statistics about scraped events
 *
 * Options:
 *   --category=<category>         - Override the auto-detected category
 *   --limit=<number>              - Limit the number of events to scrape
 *   --force                       - Skip confirmation prompts
 *   --locale=<language>           - Use Wikipedia in a specific language (default: en)
 *   --exclude-existing            - Skip events that already exist in the database
 *   --help                        - Show this help message
 *
 * Examples:
 *   node scrape-historical-events.js scrape-url https://en.wikipedia.org/wiki/Timeline_of_ancient_history
 *   node scrape-historical-events.js scrape-batch science
 *   node scrape-historical-events.js list-batches
 *   node scrape-historical-events.js search "ancient rome timeline"
 *   node scrape-historical-events.js convert
 *   node scrape-historical-events.js backup events-backup-2023.json
 *   node scrape-historical-events.js stats
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const axios = require('axios');
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent, Card } = require('../models');
const WikipediaScraper = require('../services/scraper.service');

const convertEvents = require('./convert-events-to-cards');

// Directory for backups
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  logger.info(`Created backup directory: ${BACKUP_DIR}`);
}

// Predefined batches of Wikipedia timelines
const PREDEFINED_BATCHES = {
  general: [
    'https://en.wikipedia.org/wiki/Timeline_of_world_history',
    'https://en.wikipedia.org/wiki/Timeline_of_human_prehistory',
  ],
  ancient: [
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_history',
    'https://en.wikipedia.org/wiki/Timeline_of_Ancient_Greece',
    'https://en.wikipedia.org/wiki/Timeline_of_Ancient_Rome',
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_Mesopotamia',
    'https://en.wikipedia.org/wiki/Timeline_of_ancient_Egypt',
  ],
  medieval: [
    'https://en.wikipedia.org/wiki/Timeline_of_the_Middle_Ages',
    'https://en.wikipedia.org/wiki/Timeline_of_the_Byzantine_Empire',
  ],
  modern: [
    'https://en.wikipedia.org/wiki/Timeline_of_the_Renaissance',
    'https://en.wikipedia.org/wiki/Timeline_of_the_Industrial_Revolution',
    'https://en.wikipedia.org/wiki/Timeline_of_the_20th_century',
    'https://en.wikipedia.org/wiki/Timeline_of_the_21st_century',
  ],
  science: [
    'https://en.wikipedia.org/wiki/Timeline_of_scientific_discoveries',
    'https://en.wikipedia.org/wiki/Timeline_of_mathematics',
    'https://en.wikipedia.org/wiki/Timeline_of_astronomy',
    'https://en.wikipedia.org/wiki/Timeline_of_chemistry',
    'https://en.wikipedia.org/wiki/Timeline_of_biology_and_organic_chemistry',
  ],
  technology: [
    'https://en.wikipedia.org/wiki/Timeline_of_historic_inventions',
    'https://en.wikipedia.org/wiki/Timeline_of_electrical_and_electronic_engineering',
    'https://en.wikipedia.org/wiki/Timeline_of_computing',
    'https://en.wikipedia.org/wiki/Timeline_of_communication_technology',
  ],
  war: [
    'https://en.wikipedia.org/wiki/Timeline_of_World_War_I',
    'https://en.wikipedia.org/wiki/Timeline_of_World_War_II',
    'https://en.wikipedia.org/wiki/Timeline_of_the_Cold_War',
    'https://en.wikipedia.org/wiki/Timeline_of_United_States_military_operations',
  ],
  arts: [
    'https://en.wikipedia.org/wiki/Timeline_of_art_history',
    'https://en.wikipedia.org/wiki/Timeline_of_music',
    'https://en.wikipedia.org/wiki/Timeline_of_architecture',
  ],
  politics: [
    'https://en.wikipedia.org/wiki/Timeline_of_United_States_history',
    'https://en.wikipedia.org/wiki/Timeline_of_European_Union_history',
    'https://en.wikipedia.org/wiki/Timeline_of_Russian_history',
  ],
  comprehensive: [
    // This includes all above timelines
    // Will be populated in the initialization code
  ],
};

// Populate the comprehensive batch
PREDEFINED_BATCHES.comprehensive = Object.keys(PREDEFINED_BATCHES)
  .filter((key) => key !== 'comprehensive')
  .flatMap((key) => PREDEFINED_BATCHES[key]);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  let options = {
    category: null,
    limit: null,
    force: false,
    locale: 'en',
    excludeExisting: false,
    help: command === 'help',
  };

  // Handle commands with direct arguments
  let commandArgs = [];
  if (command === 'scrape-url' && args.length > 1) {
    commandArgs.push(args[1]);
  } else if (command === 'scrape-batch' && args.length > 1) {
    commandArgs.push(args[1]);
  } else if (command === 'search' && args.length > 1) {
    commandArgs = args.slice(1).filter((arg) => !arg.startsWith('--'));
  } else if (command === 'backup' && args.length > 1 && !args[1].startsWith('--')) {
    commandArgs.push(args[1]);
  }

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg.startsWith('--locale=')) {
      options.locale = arg.split('=')[1];
    } else if (arg === '--exclude-existing') {
      options.excludeExisting = true;
    } else if (arg === '--help') {
      options.help = true;
    }
  }

  return { command, commandArgs, options };
}

/**
 * Display help message
 */
function showHelp() {
  const helpText = `
Wikipedia Historical Events Scraper

This script provides a command-line interface for scraping historical events from Wikipedia
and storing them in the database. It leverages the WikipediaScraper service to extract
events from various Wikipedia timeline pages.

Usage:
  node scrape-historical-events.js [command] [options]

Commands:
  scrape-url <url>              - Scrape events from a specific Wikipedia URL
  scrape-batch <batchname>      - Scrape predefined batch of Wikipedia timeline pages
  list-batches                  - List available predefined batches
  search <keywords>             - Search Wikipedia for relevant timeline pages
  convert                       - Convert scraped events to game cards
  backup [filename]             - Backup scraped events to a file
  stats                         - Show statistics about scraped events

Options:
  --category=<category>         - Override the auto-detected category
  --limit=<number>              - Limit the number of events to scrape
  --force                       - Skip confirmation prompts
  --locale=<language>           - Use Wikipedia in a specific language (default: en)
  --exclude-existing            - Skip events that already exist in the database
  --help                        - Show this help message

Examples:
  node scrape-historical-events.js scrape-url https://en.wikipedia.org/wiki/Timeline_of_ancient_history
  node scrape-historical-events.js scrape-batch science
  node scrape-historical-events.js list-batches
  node scrape-historical-events.js search "ancient rome timeline"
  node scrape-historical-events.js convert
  node scrape-historical-events.js backup events-backup-2023.json
  node scrape-historical-events.js stats
  `;

  console.log(helpText);
}

/**
 * Connect to the MongoDB database
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
    return true;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    return false;
  }
}

/**
 * Disconnect from the MongoDB database
 */
async function disconnectFromDatabase() {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}

/**
 * Confirm action with user
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} - User confirmation (true/false)
 */
async function confirm(message) {
  if (process.env.NODE_ENV === 'test') return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Scrape events from a single Wikipedia URL
 * @param {string} url - Wikipedia URL to scrape
 * @param {Object} options - Scraping options
 * @returns {Promise<Array>} - Array of scraped and saved events
 */
async function scrapeUrl(url, options) {
  try {
    // Validate URL
    if (!url.includes('wikipedia.org')) {
      throw new Error('Only Wikipedia URLs are supported');
    }

    logger.info(`Scraping events from: ${url}`);

    // Attempt to scrape and save
    const category = options.category || null;
    const events = await WikipediaScraper.scrapeTimelineAndSave(url, category);

    logger.info(`Successfully scraped ${events.length} events from ${url}`);
    return events;
  } catch (error) {
    logger.error(`Error scraping URL ${url}: ${error.message}`);
    return [];
  }
}

/**
 * Scrape events from a batch of Wikipedia URLs
 * @param {string} batchName - Name of the predefined batch
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} - Results of the batch scraping
 */
async function scrapeBatch(batchName, options) {
  try {
    // Validate batch name
    if (!PREDEFINED_BATCHES[batchName]) {
      throw new Error(`Unknown batch: ${batchName}. Use list-batches to see available options.`);
    }

    const urls = PREDEFINED_BATCHES[batchName];
    logger.info(`Scraping batch "${batchName}" with ${urls.length} URLs`);

    // Confirm if not forced
    if (!options.force) {
      const confirmed = await confirm(`This will scrape ${urls.length} Wikipedia pages. Continue?`);
      if (!confirmed) {
        logger.info('Operation cancelled by user');
        return { success: false, message: 'Operation cancelled by user' };
      }
    }

    // Start scraping
    const results = await WikipediaScraper.scrapeMultipleTimelines(urls);

    // Compile statistics
    const totalExtracted = results.reduce((sum, r) => sum + (r.eventsExtracted || 0), 0);
    const successfulUrls = results.filter((r) => r.success).length;

    logger.info(
      `Batch scraping complete. Extracted ${totalExtracted} events from ${successfulUrls}/${urls.length} URLs`
    );

    return {
      success: true,
      batchName,
      totalUrls: urls.length,
      successfulUrls,
      failedUrls: urls.length - successfulUrls,
      totalExtracted,
      results,
    };
  } catch (error) {
    logger.error(`Error scraping batch ${batchName}: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * List available predefined batches
 */
function listBatches() {
  logger.info('Available predefined batches:');

  console.log('\nAvailable Wikipedia Timeline Batches:\n');

  Object.keys(PREDEFINED_BATCHES).forEach((batch) => {
    const count = PREDEFINED_BATCHES[batch].length;
    console.log(`  - ${batch} (${count} URLs)`);
  });

  console.log('\nUse with: node scrape-historical-events.js scrape-batch <batchname>\n');
}

/**
 * Search Wikipedia for relevant timeline pages
 * @param {Array<string>} keywords - Search keywords
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of search results
 */
async function searchWikipedia(keywords, options) {
  try {
    const searchQuery = keywords.join(' ') + ' timeline site:wikipedia.org';
    logger.info(`Searching Wikipedia for: ${searchQuery}`);

    // Use Google Search API (or similar) to search Wikipedia
    // For demonstration, we'll use a simplified approach with axios

    const locale = options.locale || 'en';
    const searchUrl = `https://${locale}.wikipedia.org/w/api.php`;

    const params = {
      action: 'query',
      list: 'search',
      srsearch: keywords.join(' ') + ' timeline',
      format: 'json',
    };

    const response = await axios.get(searchUrl, { params });

    if (!response.data || !response.data.query || !response.data.query.search) {
      throw new Error('Invalid search response from Wikipedia API');
    }

    const results = response.data.query.search.map((result) => ({
      title: result.title,
      snippet: result.snippet.replace(/<[^>]*>/g, ''),
      url: `https://${locale}.wikipedia.org/wiki/${encodeURIComponent(
        result.title.replace(/ /g, '_')
      )}`,
    }));

    console.log('\nSearch Results:\n');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   ${result.snippet}...`);
      console.log(`   URL: ${result.url}`);
      console.log();
    });

    console.log('\nTo scrape events from one of these pages, use:');
    console.log('node scrape-historical-events.js scrape-url <url>\n');

    return results;
  } catch (error) {
    logger.error(`Error searching Wikipedia: ${error.message}`);
    return [];
  }
}

/**
 * Convert historical events to game cards
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} - Results of the conversion
 */
async function convertHistoricalEvents(options) {
  try {
    // Count existing events
    const eventsCount = await HistoricalEvent.countDocuments();
    if (eventsCount === 0) {
      logger.error('No historical events found in database. Scrape events first.');
      return { success: false, message: 'No events to convert' };
    }

    // Count existing cards
    const initialCardsCount = await Card.countDocuments();
    logger.info(`Current historical events count: ${eventsCount}`);
    logger.info(`Current cards count: ${initialCardsCount}`);

    // Confirm if not forced
    if (!options.force) {
      const confirmed = await confirm(
        `This will convert ${eventsCount} historical events to game cards. Continue?`
      );
      if (!confirmed) {
        logger.info('Operation cancelled by user');
        return { success: false, message: 'Operation cancelled by user' };
      }
    }

    // Run the conversion
    const convertModule = require('./convert-events-to-cards');

    // Use the module's convertEventsToCards function
    if (typeof convertModule.convertEventsToCards === 'function') {
      // First ensure we're connected using the module's function
      if (typeof convertModule.connectToDatabase === 'function') {
        await convertModule.connectToDatabase();
      }

      // Get admin user ID for card creation
      // Default admin user ID will be used if not found
      const adminUser = await mongoose.model('User').findOne({ role: 'admin' });
      const adminUserId = adminUser ? adminUser._id.toString() : '000000000000000000000000';
      logger.info(`Using admin user ID: ${adminUserId}`);

      // Call the convert function
      await convertModule.convertEventsToCards(options.limit || eventsCount, adminUserId);
    } else {
      throw new Error('Expected convertEventsToCards function not found in module');
    }

    // Check results
    const finalCardsCount = await Card.countDocuments();
    const addedCardsCount = Math.max(0, finalCardsCount - initialCardsCount);

    if (addedCardsCount > 0) {
      logger.info(
        `Conversion complete! New cards count: ${finalCardsCount} (Added ${addedCardsCount} cards)`
      );
      return {
        success: true,
        initialCount: initialCardsCount,
        finalCount: finalCardsCount,
        addedCount: addedCardsCount,
      };
    } else {
      logger.warn('No new cards were added. Conversion may have failed or cards already existed.');
      return {
        success: false,
        message: 'No new cards were added',
        initialCount: initialCardsCount,
        finalCount: finalCardsCount,
      };
    }
  } catch (error) {
    logger.error(`Error converting events to cards: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * Backup scraped historical events to a JSON file
 * @param {string} filename - Optional filename for the backup
 * @param {Object} options - Backup options
 * @returns {Promise<Object>} - Results of the backup
 */
async function backupHistoricalEvents(filename, options) {
  try {
    // Generate default filename if not provided
    if (!filename) {
      const date = new Date().toISOString().split('T')[0];
      filename = `historical-events-${date}.json`;
    }

    // Ensure filename has .json extension
    if (!filename.endsWith('.json')) {
      filename += '.json';
    }

    // Create full path
    const backupPath = path.join(BACKUP_DIR, filename);

    // Check if file already exists
    if (fs.existsSync(backupPath) && !options.force) {
      const confirmed = await confirm(`File ${filename} already exists. Overwrite?`);
      if (!confirmed) {
        logger.info('Backup cancelled by user');
        return { success: false, message: 'Backup cancelled by user' };
      }
    }

    // Fetch all historical events
    const events = await HistoricalEvent.find({});

    if (events.length === 0) {
      logger.warn('No historical events found to backup');
      return { success: false, message: 'No events to backup' };
    }

    // Convert to plain objects (remove mongoose-specific properties)
    const plainEvents = events.map((event) => event.toObject());

    // Write to file
    fs.writeFileSync(backupPath, JSON.stringify(plainEvents, null, 2));

    logger.info(`Backed up ${events.length} historical events to ${backupPath}`);

    return {
      success: true,
      path: backupPath,
      count: events.length,
      filename,
    };
  } catch (error) {
    logger.error(`Error backing up events: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * Show statistics about scraped events
 * @returns {Promise<Object>} - Statistics about historical events
 */
async function showStats() {
  try {
    // Count total events
    const totalEvents = await HistoricalEvent.countDocuments();

    if (totalEvents === 0) {
      logger.info('No historical events found in the database.');
      return { success: false, message: 'No events found' };
    }

    // Count events by category
    const categoryCounts = await HistoricalEvent.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Count events by century
    const centuryCounts = await HistoricalEvent.aggregate([
      {
        $addFields: {
          century: {
            $concat: [
              {
                $toString: {
                  $subtract: [
                    { $floor: { $divide: [{ $abs: '$year' }, 100] } },
                    { $cond: [{ $lt: ['$year', 0] }, 0, 0] },
                  ],
                },
              },
              { $cond: [{ $lt: ['$year', 0] }, ' BCE', ' CE'] },
            ],
          },
        },
      },
      { $group: { _id: '$century', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Count events by verification status
    const verifiedCount = await HistoricalEvent.countDocuments({ verified: true });
    const unverifiedCount = totalEvents - verifiedCount;

    // Count events with proper location data
    const withLocationCount = await HistoricalEvent.countDocuments({
      'locationCoordinates.coordinates.0': { $ne: 0 },
      'locationCoordinates.coordinates.1': { $ne: 0 },
    });

    // Output statistics
    console.log('\nHistorical Events Statistics:\n');
    console.log(`Total Events: ${totalEvents}`);
    console.log(
      `Verified Events: ${verifiedCount} (${((verifiedCount / totalEvents) * 100).toFixed(1)}%)`
    );
    console.log(
      `Events with Location Data: ${withLocationCount} (${(
        (withLocationCount / totalEvents) *
        100
      ).toFixed(1)}%)\n`
    );

    console.log('Events by Category:');
    categoryCounts.forEach((cat) => {
      console.log(
        `  - ${cat._id || 'Uncategorized'}: ${cat.count} (${(
          (cat.count / totalEvents) *
          100
        ).toFixed(1)}%)`
      );
    });

    console.log('\nEvents by Century:');
    centuryCounts.forEach((cent) => {
      console.log(
        `  - ${cent._id}: ${cent.count} (${((cent.count / totalEvents) * 100).toFixed(1)}%)`
      );
    });

    console.log('\nTo convert these events to game cards, use:');
    console.log('node scrape-historical-events.js convert\n');

    return {
      success: true,
      totalEvents,
      verifiedCount,
      withLocationCount,
      categoryCounts,
      centuryCounts,
    };
  } catch (error) {
    logger.error(`Error fetching event statistics: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * Main execution function
 */
async function main() {
  const { command, commandArgs, options } = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Commands that don't require database connection
  if (command === 'list-batches') {
    listBatches();
    process.exit(0);
  }

  // Connect to database for other commands
  const connected = await connectToDatabase();
  if (!connected) {
    logger.error('Database connection failed. Exiting.');
    process.exit(1);
  }

  try {
    // Execute the appropriate command
    switch (command) {
      case 'scrape-url':
        if (!commandArgs[0]) {
          logger.error('URL is required. Usage: node scrape-historical-events.js scrape-url <url>');
          process.exit(1);
        }
        await scrapeUrl(commandArgs[0], options);
        break;

      case 'scrape-batch':
        if (!commandArgs[0]) {
          logger.error('Batch name is required. Use list-batches to see available options.');
          process.exit(1);
        }
        await scrapeBatch(commandArgs[0], options);
        break;

      case 'search':
        if (commandArgs.length === 0) {
          logger.error('Search keywords are required.');
          process.exit(1);
        }
        await searchWikipedia(commandArgs, options);
        break;

      case 'convert':
        await convertHistoricalEvents(options);
        break;

      case 'backup':
        await backupHistoricalEvents(commandArgs[0], options);
        break;

      case 'stats':
        await showStats();
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    logger.error(`Error executing command ${command}: ${error.message}`);
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
  }
}

// Run the script if it's executed directly
if (require.main === module) {
  main();
}

module.exports = {
  scrapeUrl,
  scrapeBatch,
  searchWikipedia,
  convertHistoricalEvents,
  backupHistoricalEvents,
  showStats,
  PREDEFINED_BATCHES,
};
