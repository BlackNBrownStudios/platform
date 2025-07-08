/**
 * Cleanup Card Titles and Formatting
 * This script removes cards with date-like titles and date-like descriptions
 */

const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { Card, HistoricalEvent } = require('../models');

// Connect to the database
async function connectToDatabase() {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

// Check if a string looks like a date/year
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

// Check if a description is date-like (mostly years or dates)
function isDescriptionDate(description) {
  if (!description) return false;

  // If description is very short and contains mostly numbers, it's likely a date
  if (description.length < 20) {
    const numbers = description.replace(/[^0-9]/g, '').length;
    if (numbers > description.length * 0.5) return true;
  }

  // Check for descriptions that are mostly just year ranges
  const yearRangePattern = /^(\d{1,4})(-|–|—| to )(\d{1,4})( (BC|BCE|AD|CE))?$/;
  if (yearRangePattern.test(description.trim())) return true;

  // Check if description is very short and starts with common date prepositions
  if (
    description.length < 30 &&
    /^(in|on|around|circa|c\.|ca\.|approximately) \d{1,4}/i.test(description)
  ) {
    return true;
  }

  return false;
}

// Remove cards with date-like titles and descriptions
async function removeProblematicCards() {
  try {
    // Count total cards
    const totalCards = await Card.countDocuments();
    logger.info(`Found ${totalCards} cards in database`);

    // Find all cards
    const cards = await Card.find();

    // Identify cards to remove
    const cardsToRemove = cards.filter(
      (card) => isTitleDate(card.title) || isDescriptionDate(card.description)
    );

    logger.info(
      `Found ${cardsToRemove.length} cards with date-like titles or descriptions to remove`
    );

    // Preview cards that will be removed
    cardsToRemove.forEach((card) => {
      logger.debug(`Card to remove: ${card._id}
        Title: ${card.title}
        Description: ${
          card.description ? card.description.substring(0, 50) + '...' : 'No description'
        }
        Year: ${card.year}
        Category: ${card.category}`);
    });

    // Remove the problematic cards
    const removeIds = cardsToRemove.map((card) => card._id);
    const result = await Card.deleteMany({ _id: { $in: removeIds } });

    logger.info(`
Cleanup complete!
- ${totalCards} total cards before cleanup
- ${cardsToRemove.length} problematic cards identified
- ${result.deletedCount} cards successfully removed
- ${totalCards - result.deletedCount} cards remaining in database
`);
  } catch (error) {
    logger.error(`Error removing problematic cards: ${error.message}`);
  }
}

// Main execution function
async function main() {
  try {
    await connectToDatabase();
    await removeProblematicCards();
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error(`Script execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
