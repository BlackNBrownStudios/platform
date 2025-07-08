/**
 * Direct Repair and Convert Script
 * This script uses the MongoDB driver directly to repair malformed events and convert them to cards
 *
 * Usage: node direct-repair-and-convert.js
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Connect to the database
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create a card from event data
 */
function createCardFromEvent(event, adminUserId) {
  // Default fields for new card - skip all location related data
  const cardData = {
    title: event.title,
    description: event.description,
    date: event.date || new Date(0, 0, 1),
    year: event.year,
    imageUrl: event.imageUrl || '',
    category: event.category || 'History',
    subcategory: event.subcategory || '',
    difficulty: 'medium',
    region: event.region || '',
    tags: event.tags || [],
    isVerified: !!event.verified,
    createdBy: adminUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Handle source information
  if (event.source) {
    cardData.source =
      typeof event.source === 'string' ? event.source : JSON.stringify(event.source);
  } else if (event.sources && event.sources.length) {
    const source = event.sources[0];
    cardData.source =
      typeof source === 'string'
        ? source
        : source.name && source.url
          ? `${source.name}: ${source.url}`
          : JSON.stringify(source);
  } else {
    cardData.source = '';
  }

  return cardData;
}

/**
 * Convert historical events to game cards
 */
async function convertEventsToCards(db) {
  try {
    // Get collections directly
    const eventsCollection = db.collection('historicalevents');
    const cardsCollection = db.collection('cards');
    const usersCollection = db.collection('users');

    // Find an admin user to set as creator
    const adminUser = await usersCollection.findOne({ role: 'admin' });
    const adminUserId = adminUser
      ? adminUser._id
      : new mongoose.Types.ObjectId('000000000000000000000000');

    logger.info(`Using admin user ID: ${adminUserId}`);

    // Get existing card count
    const existingCardCount = await cardsCollection.countDocuments();
    logger.info(`Currently have ${existingCardCount} cards in the database`);

    // Get all events
    const events = await eventsCollection.find().limit(100).toArray();
    logger.info(`Found ${events.length} historical events to process`);

    // Track statistics
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Process each event
    for (const event of events) {
      try {
        // Check if a card already exists with the same title and year
        const existingCard = await cardsCollection.findOne({
          title: event.title,
          year: event.year,
        });

        if (existingCard) {
          logger.debug(`Card already exists for event: ${event.title}`);
          skipped++;
          continue;
        }

        // Create card data from event - without location data
        const cardData = createCardFromEvent(event, adminUserId);

        // Insert the new card
        await cardsCollection.insertOne(cardData);

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
    // Connect to database and get direct DB instance
    const db = await connectToDatabase();

    // Convert events to cards - without location data
    const createdCount = await convertEventsToCards(db);

    logger.info(`Process completed: created ${createdCount} cards without location data`);
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
