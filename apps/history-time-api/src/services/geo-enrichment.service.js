/**
 * Geographical Enrichment Service
 * Adds geographic coordinates and location information to historical events
 */
const axios = require('axios');

const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');

// Delay between API calls to avoid rate limiting
const API_DELAY_MS = 1000;

// Location cache to avoid duplicate API calls
const locationCache = new Map();

/**
 * Sleep for a specified number of milliseconds
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GeoEnrichment class
 * Provides methods for enhancing historical events with geographic data
 */
class GeoEnrichment {
  /**
   * Look up coordinates for a location using OpenStreetMap Nominatim API
   *
   * @param {string} locationName - Name of the location to look up
   * @returns {Promise<Object|null>} - Location object with coordinates or null if not found
   */
  static async lookupCoordinates(locationName) {
    // Check cache first
    if (locationCache.has(locationName)) {
      return locationCache.get(locationName);
    }

    try {
      // API endpoint
      const apiUrl = `https://nominatim.openstreetmap.org/search`;

      // Make request
      const response = await axios.get(apiUrl, {
        params: {
          q: locationName,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'HistoryTime-App/1.0',
        },
      });

      // Process response
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        // Create location data in proper format for our model
        const locationData = {
          locationName: locationName,
          locationCoordinates: {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON format is [longitude, latitude]
          },
          locationMetadata: {
            countryCode: result.address?.country_code,
            country: result.address?.country,
            state: result.address?.state,
            city: result.address?.city,
          },
        };

        // Cache the result
        locationCache.set(locationName, locationData);

        return locationData;
      }

      // No results found
      locationCache.set(locationName, null);
      return null;
    } catch (error) {
      logger.error(`Error looking up coordinates for "${locationName}": ${error.message}`);
      return null;
    }
  }

  /**
   * Extract locations from event title and description using heuristics
   *
   * @param {Object} event - Historical event object
   * @returns {Array<string>} - Array of potential location names
   */
  static extractPotentialLocations(event) {
    const locations = [];
    const combinedText = `${event.title} ${event.description}`;

    // Common location prefixes
    const locationPrefixes = [
      'in ',
      'at ',
      'near ',
      'from ',
      'to ',
      'capital of ',
      'city of ',
      'town of ',
      'kingdom of ',
      'empire of ',
      'republic of ',
    ];

    // Add category-based locations
    if (event.category === 'Ancient Greece') {
      locations.push('Greece', 'Athens', 'Sparta', 'Corinth');
    } else if (event.category === 'Ancient Rome') {
      locations.push('Rome', 'Roman Empire', 'Italy');
    } else if (event.category === 'Ancient Egypt') {
      locations.push('Egypt', 'Cairo', 'Alexandria');
    }

    // Common major historical locations
    const commonLocations = [
      'Rome',
      'Athens',
      'Jerusalem',
      'Alexandria',
      'Constantinople',
      'London',
      'Paris',
      'Berlin',
      'Vienna',
      'Moscow',
      'Beijing',
      'New York',
      'Washington',
      'Philadelphia',
      'Boston',
      'Chicago',
      'Tokyo',
      'Kyoto',
      'Delhi',
      'Cairo',
      'Baghdad',
    ];

    // Check for common locations
    for (const location of commonLocations) {
      if (combinedText.includes(` ${location} `)) {
        locations.push(location);
      }
    }

    // Look for capitalized words that might be locations
    const words = combinedText.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[.,;:()]/g, '');

      // Skip short words and lowercase words (likely not locations)
      if (word.length < 4 || word[0] !== word[0].toUpperCase()) {
        continue;
      }

      // Check if the word is part of a location phrase
      for (const prefix of locationPrefixes) {
        const prevText = i >= 1 ? words[i - 1] : '';
        if (prevText.toLowerCase() === prefix.trim()) {
          // Might be part of a multi-word location
          let locationPhrase = word;
          let j = i + 1;
          while (
            j < words.length &&
            words[j][0] === words[j][0].toUpperCase() &&
            words[j].length > 1
          ) {
            locationPhrase += ' ' + words[j].replace(/[.,;:()]/g, '');
            j++;
            if (j < words.length && ['of', 'the', 'and'].includes(words[j].toLowerCase())) {
              locationPhrase += ' ' + words[j];
              j++;
            } else {
              break;
            }
          }
          locations.push(locationPhrase);
          break;
        }
      }
    }

    // Remove duplicates and return
    return [...new Set(locations)];
  }

  /**
   * Enrich a single event with geographical information
   *
   * @param {Object} event - Historical event object
   * @returns {Promise<Object>} - Enriched event object
   */
  static async enrichEvent(event) {
    // Skip if event already has valid coordinates
    if (
      event.locationCoordinates &&
      event.locationCoordinates.type === 'Point' &&
      Array.isArray(event.locationCoordinates.coordinates) &&
      event.locationCoordinates.coordinates.length === 2
    ) {
      return event;
    }

    // Extract potential location names
    const potentialLocations = this.extractPotentialLocations(event);

    // Try each location until we find valid coordinates
    for (const locationName of potentialLocations) {
      const locationData = await this.lookupCoordinates(locationName);

      if (locationData) {
        // Update event with location data
        Object.assign(event, locationData);
        return event;
      }

      // Delay to avoid API rate limiting
      await sleep(API_DELAY_MS);
    }

    return event;
  }

  /**
   * Enrich multiple events with geographical information
   *
   * @param {Array<Object>} events - Array of historical event objects
   * @param {boolean} saveToDatabase - Whether to save enriched events to database
   * @returns {Promise<Array<Object>>} - Array of enriched event objects
   */
  static async enrichEvents(events, saveToDatabase = true) {
    const enrichedEvents = [];
    let successCount = 0;

    for (let i = 0; i < events.length; i++) {
      try {
        const event = events[i];
        const enrichedEvent = await this.enrichEvent(event);

        const hasValidLocation =
          enrichedEvent.locationCoordinates &&
          enrichedEvent.locationCoordinates.type === 'Point' &&
          Array.isArray(enrichedEvent.locationCoordinates.coordinates) &&
          enrichedEvent.locationCoordinates.coordinates.length === 2;

        if (saveToDatabase && hasValidLocation) {
          // Only save if location was actually updated with valid coordinates
          if (event._id) {
            // Update existing document
            await HistoricalEvent.findByIdAndUpdate(
              event._id,
              {
                $set: {
                  locationName: enrichedEvent.locationName,
                  locationCoordinates: enrichedEvent.locationCoordinates,
                  locationMetadata: enrichedEvent.locationMetadata,
                },
              },
              { new: true }
            );
            successCount++;
          }
        }

        enrichedEvents.push(enrichedEvent);

        // Log progress
        if ((i + 1) % 10 === 0 || i === events.length - 1) {
          logger.info(`Enriched ${i + 1}/${events.length} events with geographic data`);
        }
      } catch (error) {
        logger.error(`Error enriching event: ${error.message}`);
        enrichedEvents.push(events[i]);
      }

      // Delay to avoid API rate limiting
      await sleep(API_DELAY_MS);
    }

    logger.info(
      `Successfully updated ${successCount} events in the database with valid coordinates`
    );
    return enrichedEvents;
  }

  /**
   * Process all events in the database without location data
   *
   * @param {number} limit - Maximum number of events to process (optional)
   * @returns {Promise<number>} - Number of events enriched
   */
  static async batchEnrichDatabaseEvents(limit = 0) {
    try {
      // Find events without valid location coordinates
      const query = {
        $or: [
          { locationCoordinates: { $exists: false } },
          { 'locationCoordinates.coordinates': { $exists: false } },
        ],
      };

      const total = await HistoricalEvent.countDocuments(query);

      logger.info(`Found ${total} events without location data`);

      if (total === 0) {
        return 0;
      }

      // Determine how many to process
      const limitToUse = limit > 0 ? Math.min(limit, total) : total;
      logger.info(`Processing ${limitToUse} events for geographic enrichment`);

      // Get events to process
      const events = await HistoricalEvent.find(query).limit(limitToUse);

      // Enrich events
      const enrichedEvents = await this.enrichEvents(events);

      // Count successful enrichments
      const successCount = enrichedEvents.filter(
        (event) =>
          event.locationCoordinates &&
          event.locationCoordinates.type === 'Point' &&
          Array.isArray(event.locationCoordinates.coordinates) &&
          event.locationCoordinates.coordinates.length === 2
      ).length;

      logger.info(`Successfully added geographic data to ${successCount}/${limitToUse} events`);

      // Get updated database status
      const eventsWithLocation = await HistoricalEvent.countDocuments({
        'locationCoordinates.coordinates': { $exists: true },
      });
      const totalEvents = await HistoricalEvent.countDocuments();
      const percentage = totalEvents > 0 ? Math.round((eventsWithLocation / totalEvents) * 100) : 0;
      logger.info(
        `New database status: ${eventsWithLocation}/${totalEvents} events have location data (${percentage}%)`
      );

      return successCount;
    } catch (error) {
      logger.error(`Error in batch enrichment: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GeoEnrichment;
