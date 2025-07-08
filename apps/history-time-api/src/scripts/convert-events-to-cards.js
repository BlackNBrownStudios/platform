/**
 * Convert Historical Events to Game Cards
 * This script converts historical events into game cards for use in the History Time game
 *
 * Usage: node convert-events-to-cards.js [limit] [adminUserId]
 * Example: node convert-events-to-cards.js 100 64f7e3f1a0b9b3a3e4f5e6d7
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent, Card, User } = require('../models');

// Default admin user ID if not provided
const DEFAULT_ADMIN_ID = '000000000000000000000000';

// Track if this module established the connection
let establishedConnection = false;

/**
 * Connect to the database
 */
async function connectToDatabase() {
  try {
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      logger.info('Using existing MongoDB connection');
      return;
    }

    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
    establishedConnection = true;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Check if a string looks like a date/year
 * Filters out titles that are just dates or contain month names
 *
 * @param {string} title - The title to check
 * @returns {boolean} - True if the title looks like a date
 */
function isTitleDate(title) {
  if (!title) return false;

  // List of all month names and abbreviations
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
    'jan',
    'feb',
    'mar',
    'apr',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  // Convert title to lowercase for case-insensitive matching
  const lowerTitle = title.toLowerCase();

  // Check if title contains any month name
  if (months.some((month) => lowerTitle.includes(month))) {
    return true;
  }

  // Check for year formats (e.g., "1492", "300 BCE")
  const yearPattern = /^[0-9]{1,4}( (BC|BCE|AD|CE))?$/;

  // Check for date formats with numbers (e.g., "01/01/2000")
  const datePattern = /\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/;

  // Check for ordinal dates (e.g., "28th of October")
  const ordinalPattern = /\d{1,2}(st|nd|rd|th)/i;

  return (
    yearPattern.test(title.trim()) ||
    datePattern.test(title.trim()) ||
    ordinalPattern.test(title.trim())
  );
}

/**
 * Determine card difficulty based on historical event data
 *
 * @param {Object} event - The historical event
 * @returns {string} - Difficulty level (easy, medium, hard, expert)
 */
function determineDifficulty(event) {
  // Default to medium
  let difficulty = 'medium';

  // Adjust based on significance
  if (event.significance === 'pivotal') {
    difficulty = 'easy'; // Pivotal events are well-known, easier to place
  } else if (event.significance === 'high') {
    difficulty = 'medium';
  } else if (event.significance === 'medium') {
    difficulty = 'hard';
  } else if (event.significance === 'low') {
    difficulty = 'expert'; // Obscure events are harder to place
  }

  return difficulty;
}

/**
 * Extract the primary source from historical event sources array
 *
 * @param {Array} sources - Array of event sources
 * @returns {string} - Primary source citation
 */
function extractPrimarySource(sources) {
  if (!sources || !sources.length) return '';

  // Just use the first source for simplicity
  // Handle both string and object formats
  if (typeof sources === 'string') return sources;

  const primarySource = sources[0];
  if (typeof primarySource === 'string') return primarySource;

  return primarySource.name && primarySource.url
    ? `${primarySource.name}: ${primarySource.url}`
    : primarySource.name || primarySource.url || 'Unknown source';
}

/**
 * Create a JavaScript Date object from historical event year, month, day
 *
 * @param {Object} event - The historical event
 * @returns {Date} - JavaScript Date object
 */
function createDateFromEvent(event) {
  const year = event.year;
  const month = event.month || 1; // Default to January
  const day = event.day || 1; // Default to 1st day

  if (year < 0) {
    // BCE dates require special handling
    return new Date(0, 0, 1); // Use Jan 1, 1970 as a placeholder for BCE dates
  }

  // Note: Month in JavaScript is 0-indexed (0=January)
  return new Date(year, month - 1, day);
}

/**
 * Generate a better title for a card based on its description and year
 * Used when the original title is a date or needs improvement
 *
 * @param {Object} event - The historical event
 * @returns {string} - A better title
 */
function generateBetterTitle(event) {
  if (!event.description) {
    return `Historical Event (${event.year})`;
  }

  // Extract the first sentence from the description
  const firstSentence = event.description.split(/[.!?](?:\s|$)/)[0];

  // If the first sentence is too long, trim it
  let betterTitle =
    firstSentence.length > 60 ? firstSentence.substring(0, 60).trim() + '...' : firstSentence;

  // Add the year for context if not already in the title
  if (!betterTitle.includes(event.year.toString())) {
    betterTitle += ` (${event.year})`;
  }

  return betterTitle;
}

/**
 * Fix event data to ensure it can be safely converted to a card
 *
 * @param {Object} event - The original event
 * @returns {Object} - Fixed event with proper data structure
 */
function sanitizeEventData(event) {
  // Create a copy of the event to avoid modifying the original
  const sanitized = { ...event.toObject() };

  // Remove location data completely to avoid MongoDB validation errors
  delete sanitized.locationCoordinates;
  delete sanitized.locationName;
  delete sanitized.locationMetadata;

  return sanitized;
}

/**
 * Convert a historical event to a game card
 *
 * @param {Object} event - The historical event
 * @param {string} adminUserId - ID of admin user to set as creator
 * @returns {Object} - Card object ready to be saved
 */
function convertEventToCard(event, adminUserId) {
  // Source can be an array of objects, a string, or an empty value
  let sourceText = '';
  if (event.sources) {
    sourceText = extractPrimarySource(event.sources);
  } else if (event.source) {
    sourceText =
      typeof event.source === 'string' ? event.source : extractPrimarySource(event.source);
  }

  // Check if the title looks like a date and generate a better one if needed
  let title = event.title;
  if (isTitleDate(title)) {
    title = generateBetterTitle(event);
  }

  const cardData = {
    title: title,
    description: event.description,
    date: createDateFromEvent(event),
    year: event.year,
    imageUrl: event.imageUrl || '',
    category: event.category || 'History',
    subcategory: event.subcategory || '',
    difficulty: determineDifficulty(event),
    region: event.region || '',
    tags: event.tags || [],
    source: sourceText,
    isVerified: event.verified || false,
    createdBy: adminUserId,
    // Add a valid but minimal GeoJSON Point to satisfy schema requirements
    locationCoordinates: {
      type: 'Point',
      coordinates: [0, 0],
    },
  };

  return cardData;
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

  // If no admin exists, use the default ID
  return mongoose.Types.ObjectId(DEFAULT_ADMIN_ID);
}

/**
 * Main function to convert events to cards
 *
 * @param {number} limit - Maximum number of events to convert
 * @param {string} adminUserId - User ID to set as creator of the cards
 */
async function convertEventsToCards(limit = 100, adminUserId) {
  try {
    // Get the admin user ID if not provided
    if (!adminUserId) {
      adminUserId = await findOrCreateAdminUser();
      logger.info(`Using admin user ID: ${adminUserId}`);
    }

    // First, check how many cards already exist
    const existingCardCount = await Card.countDocuments();
    logger.info(`Currently have ${existingCardCount} cards in the database`);

    // Get all events, up to the limit
    const allEvents = await HistoricalEvent.find().limit(parseInt(limit, 10));
    logger.info(`Found ${allEvents.length} historical events to process`);

    // Track conversion statistics
    let created = 0;
    let skipped = 0;
    let errors = 0;
    let dateTitlesFixed = 0;

    // Create batch of cards for faster insertion
    const batch = [];

    // Process each event
    for (const event of allEvents) {
      try {
        // Check if a card already exists for this event
        const existingCard = await Card.findOne({
          title: event.title,
          year: event.year,
        });

        if (existingCard) {
          logger.debug(`Card already exists for event: ${event.title}`);
          skipped++;
          continue;
        }

        // Skip events with date-like descriptions
        if (
          event.description &&
          event.description.length < 30 &&
          /^\d{1,4}/.test(event.description.trim())
        ) {
          logger.debug(`Skipping event with date-like description: ${event.title}`);
          skipped++;
          continue;
        }

        // Sanitize the event data to fix any issues
        const sanitizedEvent = sanitizeEventData(event);

        // Track if we had to fix a date-like title
        if (isTitleDate(sanitizedEvent.title)) {
          dateTitlesFixed++;
        }

        // Convert the event to a card
        const cardData = convertEventToCard(sanitizedEvent, adminUserId);

        // Add to batch instead of individually saving
        batch.push(cardData);

        if (
          batch.length >= 50 ||
          (allEvents.indexOf(event) === allEvents.length - 1 && batch.length > 0)
        ) {
          try {
            // Insert batch of cards
            await Card.insertMany(batch, { ordered: false });
            created += batch.length;
            logger.info(`Created ${created} cards so far`);

            // Clear batch after insertion
            batch.length = 0;
          } catch (batchError) {
            // Some cards may have failed, but others succeeded
            if (batchError.writeErrors) {
              logger.warn(
                `Batch insert had ${batchError.writeErrors.length} errors out of ${batch.length} cards`
              );
              errors += batchError.writeErrors.length;
              created += batch.length - batchError.writeErrors.length;
            } else {
              logger.error(`Error in batch insert: ${batchError.message}`);
              errors += batch.length;
            }
            // Clear batch after partial insertion
            batch.length = 0;
          }
        }
      } catch (error) {
        logger.error(`Error converting event "${event.title}": ${error.message}`);
        errors++;
      }
    }

    // Insert any remaining cards in the batch
    if (batch.length > 0) {
      try {
        await Card.insertMany(batch, { ordered: false });
        created += batch.length;
      } catch (batchError) {
        if (batchError.writeErrors) {
          logger.warn(
            `Final batch insert had ${batchError.writeErrors.length} errors out of ${batch.length} cards`
          );
          errors += batchError.writeErrors.length;
          created += batch.length - batchError.writeErrors.length;
        } else {
          logger.error(`Error in final batch insert: ${batchError.message}`);
          errors += batch.length;
        }
      }
    }

    // Report final results
    logger.info(`
Conversion complete!
- ${created} new cards created
- ${skipped} events skipped (cards already exist or had date-like descriptions)
- ${dateTitlesFixed} date-like titles fixed during conversion
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
    const adminUserId = process.argv[3] || null;

    await connectToDatabase();
    await convertEventsToCards(limit, adminUserId);

    logger.info('Conversion process completed successfully');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  } finally {
    // Only disconnect if this module established the connection
    if (establishedConnection) {
      // Close database connection
      mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  }
}

// Run the script if it's executed directly
if (require.main === module) {
  main();
}

module.exports = {
  connectToDatabase,
  convertEventsToCards,
  main,
};
