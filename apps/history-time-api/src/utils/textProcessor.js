/**
 * Text processing utilities for card titles and descriptions
 */

/**
 * Clean a card title by removing unnecessary characters and formatting
 * @param {string} title - The original title
 * @returns {string} - The cleaned title
 */
const cleanTitle = (title) => {
  if (!title) return '';

  // Remove dates, brackets, and parentheses
  let cleaned = title
    // Remove year patterns like (1942) or [1500-1600]
    .replace(/\s*\(\d{4}(?:-\d{4})?\)\s*/g, ' ')
    .replace(/\s*\[\d{4}(?:-\d{4})?\]\s*/g, ' ')
    // Remove any other parenthetical content
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*\[[^\]]*\]\s*/g, ' ')
    // Remove special characters but keep basic punctuation
    .replace(/[^\w\s.,;:!?-]/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure the title starts with a capital letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Prevent titles from becoming too short
  if (cleaned.length < 10 && title.length > 10) {
    // If cleaning made the title too short, revert to original but still clean a bit
    cleaned = title.replace(/\s+/g, ' ').trim();
  }

  return cleaned;
};

/**
 * Clean a card description by focusing on key events and people
 * @param {string} description - The original description
 * @param {boolean} preserveLength - Whether to preserve the full length
 * @returns {string} - The cleaned description
 */
const cleanDescription = (description, preserveLength = false) => {
  if (!description) return '';

  // Remove dates, brackets, and parentheses
  let cleaned = description
    // Remove any parenthetical content
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*\[[^\]]*\]\s*/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure the description starts with a capital letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Truncate long descriptions if not preserving length
  if (!preserveLength && cleaned.length > 250) {
    cleaned = cleaned.substring(0, 247) + '...';
  }

  return cleaned;
};

/**
 * Get CSS class for font size based on text length
 * @param {string} text - The text to measure
 * @param {string} type - The type of text (title or description)
 * @returns {string} - The CSS class name
 */
const getFontSizeClass = (text, type = 'title') => {
  if (!text) return '';

  const length = text.length;

  if (type === 'title') {
    if (length > 40) return 'text-sm';
    if (length > 30) return 'text-base';
    return 'text-lg';
  } else {
    // Description
    if (length > 200) return 'text-xs';
    if (length > 100) return 'text-sm';
    return 'text-base';
  }
};

module.exports = {
  cleanTitle,
  cleanDescription,
  getFontSizeClass,
};
