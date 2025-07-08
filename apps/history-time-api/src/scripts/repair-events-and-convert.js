/**
 * Repair Historical Events and Convert to Cards
 * This script repairs malformed events and converts them to cards
 *
 * Usage: node repair-events-and-convert.js [limit] [adminUserId]
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent, Card, User } = require('../models');

// Default admin user ID if not provided
const DEFAULT_ADMIN_ID = '000000000000000000000000';

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
 * Repair malformed events directly in the database
 */
async function repairMalformedEvents() {
  try {
    // Use MongoDB's updateMany to fix all documents directly in the database
    // This bypasses Mongoose schema validation
    const result = await mongoose.connection.db.collection('historicalevents').updateMany(
      // Find documents with malformed locationCoordinates
      {
        'locationCoordinates.type': 'Point',
        'locationCoordinates.coordinates': { $exists: false },
      },
      // Remove the locationCoordinates field
      {
        $unset: { locationCoordinates: '' },
      }
    );

    logger.info(`Repaired ${result.modifiedCount} historical events with malformed location data`);
    return result.modifiedCount;
  } catch (error) {
    logger.error(`Error repairing events: ${error.message}`);
    throw error;
  }
}

/**
 * Determine card difficulty based on historical event data
 */
function determineDifficulty(event) {
  // Default to medium
  let difficulty = 'medium';

  // Adjust based on significance
  if (event.significance === 'pivotal') {
    difficulty = 'easy';
  } else if (event.significance === 'high') {
    difficulty = 'medium';
  } else if (event.significance === 'medium') {
    difficulty = 'hard';
  } else if (event.significance === 'low') {
    difficulty = 'expert';
  }

  return difficulty;
}

/**
 * Extract source information from event
 */
function extractSource(event) {
  // Handle different source formats
  if (!event.sources || !event.sources.length) {
    return event.source || '';
  }

  if (typeof event.sources === 'string') {
    return event.sources;
  }

  const source = event.sources[0];
  if (typeof source === 'string') return source;

  return source.name && source.url
    ? `${source.name}: ${source.url}`
    : source.name || source.url || '';
}

/**
 * Create a JavaScript Date object from historical event year
 */
function createDateFromEvent(event) {
  const year = event.year;
  const month = event.month || 1; // Default to January
  const day = event.day || 1; // Default to 1st day

  if (year < 0) {
    // BCE dates
    return new Date(0, 0, 1); // Placeholder for BCE dates
  }

  return new Date(year, month - 1, day);
}

/**
 * Check if an event has valid location coordinates
 */
function hasValidCoordinates(event) {
  return !!(
    event.locationCoordinates &&
    event.locationCoordinates.coordinates &&
    Array.isArray(event.locationCoordinates.coordinates) &&
    event.locationCoordinates.coordinates.length === 2
  );
}

/**
 * Find admin user or create a placeholder
 */
async function findOrCreateAdminUser() {
  // Try to find an admin user
  const adminUser = await User.findOne({ role: 'admin' });

  if (adminUser) {
    return adminUser._id;
  }

  return mongoose.Types.ObjectId(DEFAULT_ADMIN_ID);
}

/**
 * Convert events to cards
 */
async function convertEventsToCards(limit = 100, adminUserId) {
  try {
    // Get admin user ID if not provided
    if (!adminUserId) {
      adminUserId = await findOrCreateAdminUser();
      logger.info(`Using admin user ID: ${adminUserId}`);
    }

    // Check existing cards
    const existingCardCount = await Card.countDocuments();
    logger.info(`Currently have ${existingCardCount} cards in the database`);

    // Get events that don't have corresponding cards yet
    const events = await HistoricalEvent.find()
      .sort({ year: 1 }) // Sort by year ascending
      .limit(parseInt(limit, 10));

    logger.info(`Found ${events.length} historical events to process`);

    // Track statistics
    let created = 0;
    let skipped = 0;
    let withLocation = 0;
    let withoutLocation = 0;
    let errors = 0;

    // Process each event
    for (const event of events) {
      try {
        // Check for existing card with same title and year
        const existingCard = await Card.findOne({
          title: event.title,
          year: event.year,
        });

        if (existingCard) {
          logger.debug(`Card already exists for event: ${event.title}`);
          skipped++;
          continue;
        }

        // Create basic card data
        const cardData = {
          title: event.title,
          description: event.description,
          date: createDateFromEvent(event),
          year: event.year,
          imageUrl: event.imageUrl || '',
          category: event.category || 'History',
          subcategory: event.subcategory || '',
          difficulty: determineDifficulty(event),
          region: event.region || '',
          tags: event.tags || [],
          source: extractSource(event),
          isVerified: !!event.verified,
          createdBy: adminUserId,
        };

        // Add location data only if it's valid
        if (event.locationName && hasValidCoordinates(event)) {
          cardData.locationName = event.locationName;
          cardData.locationCoordinates = {
            type: 'Point',
            coordinates: event.locationCoordinates.coordinates,
          };

          if (event.locationMetadata) {
            cardData.locationMetadata = event.locationMetadata;
          }

          withLocation++;
        } else {
          withoutLocation++;
        }

        // Create and save new card
        const newCard = new Card(cardData);
        await newCard.save();

        created++;
        if (created % 10 === 0 || created === 1) {
          logger.info(`Created ${created} cards so far`);
        }
      } catch (error) {
        logger.error(`Error converting event "${event.title}": ${error.message}`);
        errors++;
      }
    }

    // Report results
    logger.info(`
Conversion complete!
- ${created} new cards created
  - ${withLocation} cards with location data
  - ${withoutLocation} cards without location data
- ${skipped} events skipped (cards already exist)
- ${errors} errors encountered
- Total cards in database: ${existingCardCount + created}
`);

    return created;
  } catch (error) {
    logger.error(`Error in batch conversion: ${error.message}`);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Parse command line arguments
    const limit = process.argv[2] || 100;
    const adminUserId = process.argv[3];

    await connectToDatabase();

    // First repair any malformed events
    const repairedCount = await repairMalformedEvents();

    // Then convert events to cards
    if (repairedCount > 0) {
      logger.info(`Waiting 2 seconds for database to process repairs...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const createdCount = await convertEventsToCards(limit, adminUserId);

    logger.info(
      `Process completed: repaired ${repairedCount} events and created ${createdCount} cards`
    );
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
