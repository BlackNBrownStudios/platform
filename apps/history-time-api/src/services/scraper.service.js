/**
 * Wikipedia History Scraper Service
 * Extracts historical events from Wikipedia timeline pages
 */
const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');

/**
 * WikipediaScraper class
 * Provides methods for fetching and parsing historical events from Wikipedia
 */
class WikipediaScraper {
  /**
   * Extract year from text that might be in various formats
   * Examples: "1500 BC", "250 CE", "42 AD", "356", etc.
   *
   * @param {string} yearText - Text containing year information
   * @returns {number} - Year as a number (negative for BC/BCE)
   */
  static parseYear(yearText) {
    yearText = yearText.trim();

    // Handle common year formats
    let year = null;
    let multiplier = 1;

    if (yearText.match(/^\d+$/)) {
      // Simple numeric year - assume CE/AD
      return parseInt(yearText, 10);
    }

    // For BC/BCE years
    if (yearText.match(/BC|BCE/i)) {
      multiplier = -1;
      yearText = yearText.replace(/BC|BCE/i, '').trim();
    }

    // For CE/AD years
    if (yearText.match(/CE|AD/i)) {
      yearText = yearText.replace(/CE|AD/i, '').trim();
    }

    // Extract the numeric part
    const numericMatch = yearText.match(/\d+/);
    if (numericMatch) {
      year = parseInt(numericMatch[0], 10) * multiplier;
    }

    return year;
  }

  /**
   * Clean HTML from the description text and normalize whitespace
   *
   * @param {string} text - Raw text possibly containing HTML
   * @returns {string} - Cleaned text
   */
  static cleanText(text) {
    if (!text) return '';

    // Convert HTML entities and remove tags
    const dom = new JSDOM(`<!DOCTYPE html><div>${text}</div>`);
    let cleanText = dom.window.document.querySelector('div').textContent;

    // Normalize whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    return cleanText;
  }

  /**
   * Fetch a Wikipedia page by its URL
   *
   * @param {string} url - Full URL of the Wikipedia page
   * @returns {Promise<string>} - HTML content of the page
   */
  static async fetchPage(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching Wikipedia page: ${error.message}`);
      throw new Error(`Failed to fetch Wikipedia page: ${error.message}`);
    }
  }

  /**
   * Extract events from a timeline page using generic methods
   * Handles both timelines with tables and those with list items
   *
   * @param {string} html - HTML content of the page
   * @param {string} category - Category to assign to extracted events
   * @param {string} sourceUrl - URL of the source page to include as a source
   * @returns {Array} - Array of event objects
   */
  static async extractEvents(html, category = 'General', sourceUrl) {
    const $ = cheerio.load(html);
    const events = [];

    // Create a source object for all events from this URL
    const pageSource = {
      name:
        sourceUrl.split('/').pop().replace(/_/g, ' ').replace('Timeline_of_', '') + ' (Wikipedia)',
      url: sourceUrl,
      retrievalDate: new Date(),
    };

    // Try different timeline formats

    // 1. Table format (most common)
    $('table.wikitable tr').each((i, row) => {
      // Skip header rows
      if ($(row).find('th').length > 0) return;

      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const yearCell = $(cells[0]);
        const descriptionCell = $(cells[1]);

        const yearText = yearCell.text().trim();
        const description = this.cleanText(descriptionCell.html());

        // Generate a title from the description (first ~50 chars or first sentence)
        let title = description.split('.')[0];
        if (title.length > 60) {
          title = title.substring(0, 57) + '...';
        }

        // Parse the year
        const year = this.parseYear(yearText);

        if (year && description) {
          events.push({
            title,
            description,
            year,
            category,
            significance: 'medium', // Default significance
            verified: true,
            sources: [pageSource], // Add source
            tags: [category.toLowerCase(), 'wikipedia'],
            locationName: '',
            locationCoordinates: {
              type: 'Point',
              coordinates: [0, 0], // Default to [0,0] (null island) when coordinates not known
            },
          });
        }
      }
    });

    // 2. List format (common in some timeline pages)
    $('ul li, ol li').each((i, item) => {
      const text = $(item).text().trim();

      // Try to find year pattern
      const yearMatch = text.match(/^(\d+(?:\s*(?:BC|BCE|CE|AD))?)\s*[-:–]\s*(.+)$/i);
      if (yearMatch) {
        const yearText = yearMatch[1];
        const description = this.cleanText(yearMatch[2]);

        // Generate title from description
        let title = description.split('.')[0];
        if (title.length > 60) {
          title = title.substring(0, 57) + '...';
        }

        // Parse the year
        const year = this.parseYear(yearText);

        if (year && description) {
          events.push({
            title,
            description,
            year,
            category,
            significance: 'medium',
            verified: true,
            sources: [pageSource], // Add source
            tags: [category.toLowerCase(), 'wikipedia'],
            locationName: '',
            locationCoordinates: {
              type: 'Point',
              coordinates: [0, 0], // Default to [0,0] (null island) when coordinates not known
            },
          });
        }
      }
    });

    // 3. DL/DT/DD format (used in some pages)
    $('dl').each((i, list) => {
      let currentYear = null;

      $(list)
        .children()
        .each((j, element) => {
          const tagName = element.tagName.toLowerCase();

          if (tagName === 'dt') {
            const yearText = $(element).text().trim();
            currentYear = this.parseYear(yearText);
          } else if (tagName === 'dd' && currentYear) {
            const description = this.cleanText($(element).html());

            // Generate title from description
            let title = description.split('.')[0];
            if (title.length > 60) {
              title = title.substring(0, 57) + '...';
            }

            if (description) {
              events.push({
                title,
                description,
                year: currentYear,
                category,
                significance: 'medium',
                verified: true,
                sources: [pageSource], // Add source
                tags: [category.toLowerCase(), 'wikipedia'],
                locationName: '',
                locationCoordinates: {
                  type: 'Point',
                  coordinates: [0, 0], // Default to [0,0] (null island) when coordinates not known
                },
              });
            }
          }
        });
    });

    return events;
  }

  /**
   * Determine the category for a given timeline URL based on its content
   *
   * @param {string} url - URL of the timeline
   * @returns {string} - Category name
   */
  static getCategoryFromUrl(url) {
    const urlLower = url.toLowerCase();

    // Extract from URL path
    if (urlLower.includes('ancient')) return 'Ancient History';
    if (urlLower.includes('medieval')) return 'Medieval History';
    if (urlLower.includes('modern')) return 'Modern History';
    if (urlLower.includes('science')) return 'Science';
    if (urlLower.includes('technology')) return 'Technology';
    if (urlLower.includes('war')) return 'War';
    if (urlLower.includes('politics')) return 'Politics';
    if (urlLower.includes('art')) return 'Art';
    if (urlLower.includes('music')) return 'Music';
    if (urlLower.includes('literature')) return 'Literature';
    if (urlLower.includes('religion')) return 'Religion';
    if (urlLower.includes('philosophy')) return 'Philosophy';

    // Default
    return 'World History';
  }

  /**
   * Scrape a single timeline and save events to database
   *
   * @param {string} url - URL of the timeline to scrape
   * @param {string} category - Optional category override
   * @returns {Promise<Array>} - Array of saved event objects
   */
  static async scrapeTimelineAndSave(url, category = null) {
    try {
      const html = await this.fetchPage(url);

      // Determine category from URL if not provided
      const eventCategory = category || this.getCategoryFromUrl(url);

      // Extract events
      const events = await this.extractEvents(html, eventCategory, url);
      logger.info(`Extracted ${events.length} events from ${url}`);

      // Save to database
      const savedEvents = [];
      for (const event of events) {
        try {
          // Check if event already exists (by title and year)
          const existingEvent = await HistoricalEvent.findOne({
            title: event.title,
            year: event.year,
          });

          if (!existingEvent) {
            const newEvent = new HistoricalEvent(event);
            await newEvent.save();
            savedEvents.push(newEvent);
          }
        } catch (error) {
          logger.error(`Error saving event: ${error.message}`);
        }
      }

      logger.info(`Saved ${savedEvents.length} new events to database`);
      return savedEvents;
    } catch (error) {
      logger.error(`Error in scrapeTimelineAndSave: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape multiple timelines from a list of URLs
   *
   * @param {Array<string>} urls - Array of timeline URLs to scrape
   * @returns {Promise<Array>} - Array of saved event counts by URL
   */
  static async scrapeMultipleTimelines(urls) {
    const results = [];

    for (const url of urls) {
      try {
        const events = await this.scrapeTimelineAndSave(url);
        results.push({
          url,
          success: true,
          eventsExtracted: events.length,
        });
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = WikipediaScraper;
