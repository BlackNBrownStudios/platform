/**
 * Convert Historical Events to Game Cards (Basic Version)
 * This script converts historical events into game cards without location data
 *
 * Usage: node convert-events-to-cards-basic.js [limit] [adminUserId]
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent, Card, User } = require('../models');

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
 * Determine card difficulty based on historical event data
 */
function determineDifficulty(event) {
  // Default to medium
  let difficulty = 'medium';

  // Adjust based on significance if available
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
  if (!event.sources || !event.sources.length) {
    return event.source || '';
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
 * Find admin user or create a placeholder
 */
async function findOrCreateAdminUser() {
  const adminUser = await User.findOne({ role: 'admin' });
  if (adminUser) return adminUser._id;

  // Default ID if no admin exists
  return mongoose.Types.ObjectId('000000000000000000000000');
}

/**
 * Convert a batch of historical events to cards
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

        // Create basic card data without location
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
- ${skipped} events skipped (cards already exist)
- ${errors} errors encountered
- Total cards in database: ${existingCardCount + created}
`);
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
    await convertEventsToCards(limit, adminUserId);

    logger.info('Conversion process completed successfully');
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
