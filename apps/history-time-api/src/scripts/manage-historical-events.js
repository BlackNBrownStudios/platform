/**
 * Historical Events Management Script
 *
 * This script provides a complete solution for managing historical events:
 * - Seed events from different sources
 * - Backup events to JSON files
 * - Restore events from backups
 * - Convert events to cards
 *
 * Usage:
 *   node manage-historical-events.js [command] [options]
 *
 * Commands:
 *   seed     - Seed historical events (uses diverse events by default)
 *   backup   - Backup historical events to a JSON file
 *   restore  - Restore historical events from a backup file
 *   convert  - Convert historical events to game cards
 *   verify   - Verify that events were properly converted to cards
 *   all      - Run the complete process (seed, backup, convert)
 *   fix-geojson - Fix GeoJSON format in all historical events
 *
 * Options:
 *   --file=<filename>  - Specify a backup file for backup/restore
 *   --count=<number>   - Limit operation to specified number of events
 *   --basic            - Use basic events set instead of diverse set
 *   --force            - Force operation without confirmation
 *   --help             - Show this help message
 *
 * Examples:
 *   node manage-historical-events.js seed
 *   node manage-historical-events.js backup --file=events-backup-2025-03-29.json
 *   node manage-historical-events.js restore --file=events-backup-2025-03-29.json
 *   node manage-historical-events.js convert --count=100
 *   node manage-historical-events.js all
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent, Card } = require('../models');

// Path to seed files
const SEED_DIVERSE_EVENTS_PATH = path.join(__dirname, '../seeds/seed-diverse-historical-events.js');
const SEED_BASIC_EVENTS_PATH = path.join(__dirname, '../seeds/seed-historical-events.js');

// Directory for backups
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  logger.info(`Created backup directory: ${BACKUP_DIR}`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options = {
    file: null,
    count: null,
    basic: false,
    force: false,
    help: command === 'help',
  };

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--basic') {
      options.basic = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help') {
      options.help = true;
    }
  }

  return { command, options };
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
Historical Events Management Script

This script provides a complete solution for managing historical events:
- Seed events from different sources
- Backup events to JSON files
- Restore events from backups
- Convert events to cards

Usage:
  node manage-historical-events.js [command] [options]

Commands:
  seed     - Seed historical events (uses diverse events by default)
  backup   - Backup historical events to a JSON file
  restore  - Restore historical events from a backup file
  convert  - Convert historical events to game cards
  verify   - Verify that events were properly converted to cards
  all      - Run the complete process (seed, backup, convert)
  fix-geojson - Fix GeoJSON format in all historical events

Options:
  --file=<filename>  - Specify a backup file for backup/restore
  --count=<number>   - Limit operation to specified number of events
  --basic            - Use basic events set instead of diverse set
  --force            - Force operation without confirmation
  --help             - Show this help message

Examples:
  node manage-historical-events.js seed
  node manage-historical-events.js backup --file=events-backup-2025-03-29.json
  node manage-historical-events.js restore --file=events-backup-2025-03-29.json
  node manage-historical-events.js convert --count=100
  node manage-historical-events.js all
  `);
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
 * Validate and fix GeoJSON coordinates if needed
 * @param {Object} event - Historical event object
 * @returns {Object} - Event with fixed coordinates
 */
function validateAndFixGeoJSON(event) {
  try {
    // Skip if no location data
    if (!event.locationCoordinates) return event;

    // Copy event to avoid modifying the original
    const fixedEvent = { ...event };

    // Fix type if missing or incorrect
    if (!fixedEvent.locationCoordinates.type || fixedEvent.locationCoordinates.type !== 'Point') {
      fixedEvent.locationCoordinates.type = 'Point';
    }

    // Check if coordinates exist and are in the correct format
    if (
      !fixedEvent.locationCoordinates.coordinates ||
      !Array.isArray(fixedEvent.locationCoordinates.coordinates) ||
      fixedEvent.locationCoordinates.coordinates.length !== 2
    ) {
      // Handle legacy location format with latitude/longitude properties
      if (event.location && event.location.coordinates) {
        const { latitude, longitude } = event.location.coordinates;
        if (latitude !== undefined && longitude !== undefined) {
          fixedEvent.locationName = event.location.name;
          fixedEvent.locationCoordinates = {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON format is [longitude, latitude]
          };
          // Remove legacy format
          delete fixedEvent.location;
        }
      } else if (fixedEvent.locationCoordinates.coordinates === undefined) {
        // If no coordinates, set empty array to avoid validation errors
        fixedEvent.locationCoordinates.coordinates = [0, 0];
      }
    }

    // Check if coordinates are numbers
    const coords = fixedEvent.locationCoordinates.coordinates;
    if (coords && (!isFinite(coords[0]) || !isFinite(coords[1]))) {
      // Replace with zeros if not numbers
      fixedEvent.locationCoordinates.coordinates = [0, 0];
    }

    return fixedEvent;
  } catch (error) {
    console.warn(`Warning: Error fixing GeoJSON for event "${event.title}": ${error.message}`);
    // Return the original event if an error occurs
    return event;
  }
}

/**
 * Seed historical events from the chosen source
 * @param {Object} options - Command options
 */
async function seedEvents(options) {
  try {
    // Require the appropriate seed file
    let seedModule;
    try {
      seedModule = options.basic
        ? require(SEED_BASIC_EVENTS_PATH)
        : require(SEED_DIVERSE_EVENTS_PATH);
    } catch (error) {
      logger.error(`Failed to load seed file: ${error.message}`);
      logger.info('Attempting direct seeding instead...');
      seedModule = null;
    }

    // Count existing events
    const existingCount = await HistoricalEvent.countDocuments();
    logger.info(`Current historical events count: ${existingCount}`);

    // Confirm if events already exist and force is not set
    if (existingCount > 0 && !options.force) {
      const confirmed = await confirm(
        `Database already contains ${existingCount} historical events. Proceed anyway?`
      );
      if (!confirmed) {
        logger.info('Seeding aborted by user');
        return;
      }

      // Clear existing events
      await HistoricalEvent.deleteMany({});
      logger.info('Cleared existing historical events');
    }

    // If we have a valid seed module with a function, use it
    if (seedModule && typeof seedModule.seedHistoricalEvents === 'function') {
      await seedModule.seedHistoricalEvents();
    } else if (seedModule && typeof seedModule.seedDiverseHistoricalEvents === 'function') {
      await seedModule.seedDiverseHistoricalEvents();
    } else {
      // Otherwise try to run the module directly
      logger.info('Running seed file directly...');

      try {
        // This will run the seed file directly which should contain its own function call
        require(options.basic ? SEED_BASIC_EVENTS_PATH : SEED_DIVERSE_EVENTS_PATH);
      } catch (error) {
        logger.error(`Failed to run seed file directly: ${error.message}`);
        throw new Error('Could not seed events: Invalid seed file format');
      }
    }

    // Verify seeding
    const newCount = await HistoricalEvent.countDocuments();
    const addedCount = Math.max(0, newCount - existingCount);

    if (newCount > 0) {
      logger.info(
        `Seeding complete! Historical events count: ${newCount} (Added ${addedCount} events)`
      );
    } else {
      logger.warn('No historical events were added. Check the seed file for errors.');
    }

    // Validate some events to ensure they're in the right format
    const sampleEvents = await HistoricalEvent.find().limit(3);
    if (sampleEvents.length > 0) {
      logger.info('Validating event format...');
      let allValid = true;

      for (const event of sampleEvents) {
        // Check for correct GeoJSON format
        if (
          event.locationCoordinates &&
          (!event.locationCoordinates.type ||
            !event.locationCoordinates.coordinates ||
            !Array.isArray(event.locationCoordinates.coordinates))
        ) {
          logger.warn(`Event "${event.title}" has invalid locationCoordinates format`);
          allValid = false;
        }
      }

      if (allValid) {
        logger.info('All sampled events have valid format');
      } else {
        logger.warn('Some events may have invalid format. Consider running a fix operation.');
      }
    }
  } catch (error) {
    logger.error(`Error seeding events: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Backup historical events to a JSON file
 * @param {Object} options - Command options
 */
async function backupEvents(options) {
  try {
    // Generate default filename if not provided
    let filename = options.file;
    if (!filename) {
      const date = new Date().toISOString().split('T')[0];
      filename = `historical-events-backup-${date}.json`;
    }

    // Ensure file has .json extension
    if (!filename.endsWith('.json')) {
      filename += '.json';
    }

    const filepath = path.join(BACKUP_DIR, filename);

    // Check if file already exists
    if (fs.existsSync(filepath) && !options.force) {
      const confirmed = await confirm(`Backup file ${filename} already exists. Overwrite?`);
      if (!confirmed) {
        logger.info('Backup aborted by user');
        return;
      }
    }

    // Query events from database
    const query = HistoricalEvent.find();
    if (options.count) {
      query.limit(options.count);
    }

    const events = await query.lean().exec();
    if (events.length === 0) {
      logger.warn('No historical events found in database to backup');
      return;
    }

    logger.info(`Backing up ${events.length} historical events...`);

    // Validate and fix GeoJSON format before writing to file
    const fixedEvents = events.map(validateAndFixGeoJSON);

    // Write events to file
    fs.writeFileSync(filepath, JSON.stringify(fixedEvents, null, 2), 'utf8');

    logger.info(`Successfully backed up ${fixedEvents.length} events to ${filepath}`);
  } catch (error) {
    logger.error(`Error backing up events: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Restore historical events from a backup file
 * @param {Object} options - Command options
 */
async function restoreEvents(options) {
  try {
    // Check if filename is provided
    if (!options.file) {
      logger.error('No backup file specified. Use --file=<filename>');
      return;
    }

    // Ensure file has .json extension
    let filename = options.file;
    if (!filename.endsWith('.json')) {
      filename += '.json';
    }

    const filepath = path.join(BACKUP_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      logger.error(`Backup file not found: ${filepath}`);
      return;
    }

    // Count existing events
    const existingCount = await HistoricalEvent.countDocuments();
    if (existingCount > 0 && !options.force) {
      const confirmed = await confirm(
        `Database already contains ${existingCount} historical events. Replace them?`
      );
      if (!confirmed) {
        logger.info('Restore aborted by user');
        return;
      }
      // Delete existing events
      await HistoricalEvent.deleteMany({});
      logger.info(`Deleted ${existingCount} existing events`);
    }

    // Read events from file
    let events;
    try {
      events = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (error) {
      logger.error(`Error reading backup file: ${error.message}`);
      return;
    }

    if (!Array.isArray(events) || events.length === 0) {
      logger.error('Backup file does not contain valid events data');
      return;
    }

    logger.info(`Restoring ${events.length} historical events from ${filepath}...`);

    // Fix GeoJSON format in all events
    const fixedEvents = events.map(validateAndFixGeoJSON);

    // Insert events in batches to avoid memory issues
    const batchSize = 50;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fixedEvents.length; i += batchSize) {
      const batch = fixedEvents.slice(i, i + batchSize);
      try {
        const result = await HistoricalEvent.insertMany(batch, {
          ordered: false,
          // Skip duplicate key errors
          rawResult: true,
        });

        insertedCount += result.insertedCount;
        logger.info(
          `Restored ${Math.min(i + batchSize, fixedEvents.length)} of ${fixedEvents.length} events`
        );
      } catch (error) {
        if (error.writeErrors) {
          // Count items that failed to insert
          errorCount += error.writeErrors.length;

          // Log some details about the errors
          const sampleErrors = error.writeErrors.slice(0, 3);
          sampleErrors.forEach((err) => {
            logger.warn(`Error inserting event: ${err.errmsg}`);
          });

          if (error.insertedCount) {
            insertedCount += error.insertedCount;
          }
        } else {
          logger.error(`Batch insert error: ${error.message}`);
          errorCount += batch.length;
        }
      }
    }

    // Verify restoration
    const newCount = await HistoricalEvent.countDocuments();
    logger.info(`Restore complete! Historical events count: ${newCount}`);

    if (errorCount > 0) {
      logger.warn(`Warning: ${errorCount} events failed to restore due to errors`);
    }
  } catch (error) {
    logger.error(`Error restoring events: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Convert historical events to game cards
 * @param {Object} options - Command options
 */
async function convertEvents(options) {
  try {
    // Count existing events
    const eventsCount = await HistoricalEvent.countDocuments();
    if (eventsCount === 0) {
      logger.error('No historical events found in database. Seed events first.');
      return;
    }

    // Count existing cards
    const cardsCount = await Card.countDocuments();
    logger.info(`Current historical events count: ${eventsCount}`);
    logger.info(`Current cards count: ${cardsCount}`);

    // Limit for conversion
    const limit = options.count || eventsCount;

    logger.info(`Converting up to ${limit} historical events to cards...`);

    try {
      // Import the conversion script
      const convertModule = require('./convert-events-to-cards');

      // Use the module's convertEventsToCards function
      if (typeof convertModule.convertEventsToCards === 'function') {
        // First ensure we're connected using the module's function
        if (typeof convertModule.connectToDatabase === 'function') {
          await convertModule.connectToDatabase();
        }

        // Get admin user ID for card creation
        // Default admin user ID will be used if not found
        const adminUserId = await findAdminUserId();
        logger.info(`Using admin user ID: ${adminUserId}`);

        // Call the convert function with limit and admin user ID
        await convertModule.convertEventsToCards(limit, adminUserId);
      } else {
        throw new Error('Expected convertEventsToCards function not found in module');
      }
    } catch (error) {
      logger.error(`Error in batch conversion: ${error.message}`);
      logger.error(error);
      throw new Error('Conversion script failed');
    }

    // Verify conversion
    const newCardsCount = await Card.countDocuments();
    const addedCardsCount = Math.max(0, newCardsCount - cardsCount);

    if (addedCardsCount > 0) {
      logger.info(
        `Conversion complete! New cards count: ${newCardsCount} (Added ${addedCardsCount} cards)`
      );
    } else {
      logger.warn('No new cards were added. Conversion may have failed or cards already existed.');
    }
  } catch (error) {
    logger.error(`Error converting events to cards: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Find an admin user ID for card creation
 * @returns {string} Admin user ID or default ID
 */
async function findAdminUserId() {
  try {
    // Assuming the User model has a 'role' field
    const adminUser = await mongoose.model('User').findOne({ role: 'admin' });
    if (adminUser) {
      return adminUser._id.toString();
    }

    // If no admin user found, return a default ID
    return '000000000000000000000000';
  } catch (error) {
    logger.warn(`Error finding admin user: ${error.message}`);
    return '000000000000000000000000';
  }
}

/**
 * Verify that events were properly converted to cards
 */
async function verifyConversion() {
  try {
    // Count events and cards
    const eventsCount = await HistoricalEvent.countDocuments();
    const cardsCount = await Card.countDocuments();

    logger.info(`Historical events in database: ${eventsCount}`);
    logger.info(`Cards in database: ${cardsCount}`);

    if (eventsCount === 0) {
      logger.warn('No historical events found in database. Nothing to verify.');
      return;
    }

    if (cardsCount === 0) {
      logger.error('No cards found in database. Conversion seems to have failed.');
      return;
    }

    // Get sample events and corresponding cards
    const sampleEvents = await HistoricalEvent.find().limit(5).lean();

    let matchCount = 0;
    for (const event of sampleEvents) {
      // Try to find a matching card by title and year
      const card = await Card.findOne({
        $or: [
          // Exact match
          { title: event.title, year: event.year },
          // Partial match (if title was modified)
          { title: { $regex: new RegExp(event.title.substring(0, 20), 'i') }, year: event.year },
        ],
      }).lean();

      if (card) {
        matchCount++;
        logger.info(`✓ Match found for "${event.title}" (${event.year})`);
      } else {
        logger.warn(`✗ No matching card found for "${event.title}" (${event.year})`);
      }
    }

    logger.info(
      `Verification result: ${matchCount} of ${sampleEvents.length} sampled events have corresponding cards`
    );

    if (cardsCount >= eventsCount * 0.8) {
      logger.info(
        `✓ Conversion appears successful (${cardsCount} cards from ${eventsCount} events)`
      );
    } else {
      logger.warn(
        `⚠ Some events may not have been converted (${cardsCount} cards from ${eventsCount} events)`
      );
    }
  } catch (error) {
    logger.error(`Error verifying conversion: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Fix GeoJSON format in all historical events
 */
async function fixGeoJSONFormat() {
  try {
    const events = await HistoricalEvent.find().lean();
    logger.info(`Checking GeoJSON format for ${events.length} events...`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const event of events) {
      try {
        const fixedEvent = validateAndFixGeoJSON(event);

        // Only update if fixes were made
        if (JSON.stringify(event) !== JSON.stringify(fixedEvent)) {
          await HistoricalEvent.updateOne({ _id: event._id }, fixedEvent);
          fixedCount++;
        }
      } catch (error) {
        errorCount++;
        logger.warn(`Error fixing event ${event._id}: ${error.message}`);
      }
    }

    logger.info(`Fixed GeoJSON format for ${fixedCount} events, encountered ${errorCount} errors`);
  } catch (error) {
    logger.error(`Error fixing GeoJSON format: ${error.message}`);
  }
}

/**
 * Run the complete process (seed, backup, convert)
 * @param {Object} options - Command options
 */
async function runAll(options) {
  // Seed events
  logger.info('Step 1: Seeding historical events...');
  await seedEvents(options);

  // Backup events
  logger.info('Step 2: Backing up historical events...');
  await backupEvents(options);

  // Convert events to cards
  logger.info('Step 3: Converting historical events to cards...');
  await convertEvents(options);

  // Verify conversion
  logger.info('Step 4: Verifying conversion...');
  await verifyConversion();

  logger.info('All operations completed!');
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const { command, options } = parseArgs();

  // Show help if requested
  if (options.help) {
    showHelp();
    return;
  }

  // Connect to database
  const connected = await connectToDatabase();
  if (!connected) {
    return;
  }

  try {
    // Execute the requested command
    switch (command) {
      case 'seed':
        await seedEvents(options);
        break;
      case 'backup':
        await backupEvents(options);
        break;
      case 'restore':
        await restoreEvents(options);
        break;
      case 'convert':
        await convertEvents(options);
        break;
      case 'verify':
        await verifyConversion();
        break;
      case 'fix-geojson':
        await fixGeoJSONFormat();
        break;
      case 'all':
        await runAll(options);
        break;
      default:
        logger.error(`Unknown command: ${command}`);
        showHelp();
    }
  } catch (error) {
    logger.error(`Error executing command: ${error.message}`);
    logger.error(error.stack);
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
  seedEvents,
  backupEvents,
  restoreEvents,
  convertEvents,
  verifyConversion,
  fixGeoJSONFormat,
  runAll,
};
