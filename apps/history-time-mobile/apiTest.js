/**
 * API Integration Test Script for History Time Mobile
 *
 * This script tests the sharedAdapter functionality for fetching cards,
 * historical events, and other API interactions to verify our fixes
 */

const { initSharedAdapter } = require('./app/services/sharedAdapter');

// Mock minimal environment for testing
global.fetch = require('node-fetch');
jest.mock('./app/utils/tokenStorage', () => ({
  getToken: () => Promise.resolve('mock-token'),
  storeToken: () => Promise.resolve(),
  getRefreshToken: () => Promise.resolve('mock-refresh-token'),
  storeRefreshToken: () => Promise.resolve(),
}));

// Create a test config service
const configService = {
  useMockHistoricalEvents: () => Promise.resolve(false),
};

// Main test function
async function runTests() {
  console.log('Starting API integration tests...');

  try {
    // Initialize the adapter
    const adapter = initSharedAdapter('http://localhost:3000/api', configService);

    // Test card fetching
    console.log('\n--- Testing getCards ---');
    const cards = await adapter.getCards();
    console.log(`Retrieved ${cards.length} cards`);

    // Test historical events
    console.log('\n--- Testing getHistoricalEvents ---');
    const events = await adapter.getHistoricalEvents();
    console.log(`Retrieved ${events.length} historical events`);

    // Test fetching cards by category
    console.log('\n--- Testing getCardsByCategory ---');
    const scienceCards = await adapter.getCardsByCategory('science');
    console.log(`Retrieved ${scienceCards.length} science cards`);

    // Test fetching historical events by time period
    console.log('\n--- Testing getHistoricalEventsByTimePeriod ---');
    const events1900to2000 = await adapter.getHistoricalEventsByTimePeriod(1900, 2000);
    console.log(`Retrieved ${events1900to2000.length} events from 1900-2000`);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests();
