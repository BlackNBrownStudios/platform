/**
 * Seed Historical Events
 * Creates initial historical events in the database
 */
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');

const seedHistoricalEvents = async () => {
  // Connect to the database
  mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info('Connected to MongoDB');
  });

  // Sample historical events
  const events = [
    {
      title: 'Moon Landing',
      description: 'Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon.',
      year: 1969,
      month: 7,
      day: 20,
      category: 'Space Exploration',
      subcategory: 'NASA',
      tags: ['space', 'NASA', 'Apollo 11', 'Cold War'],
      significance: 'pivotal',
      imageUrl: 'https://example.com/moon-landing.jpg',
      sources: [
        {
          name: 'NASA',
          url: 'https://www.nasa.gov/mission_pages/apollo/apollo11.html',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'Moon, Sea of Tranquility',
      locationCoordinates: {
        type: 'Point',
        coordinates: [23.47314, 0.67416], // [longitude, latitude]
      },
    },
    {
      title: 'World War II Begins',
      description: 'Germany invaded Poland, marking the beginning of World War II in Europe.',
      year: 1939,
      month: 9,
      day: 1,
      category: 'War',
      subcategory: 'World War II',
      tags: ['WWII', 'Germany', 'Poland', 'Europe'],
      significance: 'pivotal',
      imageUrl: 'https://example.com/ww2-begins.jpg',
      sources: [
        {
          name: 'History.com',
          url: 'https://www.history.com/topics/world-war-ii/world-war-ii-history',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'Poland',
      locationCoordinates: {
        type: 'Point',
        coordinates: [21.017532, 52.237049], // [longitude, latitude]
      },
    },
    {
      title: 'First iPhone Released',
      description: 'Apple released the first iPhone, revolutionizing the smartphone industry.',
      year: 2007,
      month: 6,
      day: 29,
      category: 'Technology',
      subcategory: 'Mobile Devices',
      tags: ['Apple', 'iPhone', 'smartphone', 'Steve Jobs'],
      significance: 'high',
      imageUrl: 'https://example.com/first-iphone.jpg',
      sources: [
        {
          name: 'Apple',
          url: 'https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'Cupertino, California, USA',
      locationCoordinates: {
        type: 'Point',
        coordinates: [-122.0321823, 37.3229978], // [longitude, latitude]
      },
    },
    {
      title: 'Declaration of Independence',
      description:
        'The Continental Congress adopts the Declaration of Independence, declaring the United States independent from Great Britain.',
      year: 1776,
      month: 7,
      day: 4,
      category: 'Politics',
      subcategory: 'American Revolution',
      tags: ['America', 'independence', 'revolution', 'Thomas Jefferson'],
      significance: 'pivotal',
      imageUrl: 'https://example.com/declaration.jpg',
      sources: [
        {
          name: 'National Archives',
          url: 'https://www.archives.gov/founding-docs/declaration',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'Philadelphia, Pennsylvania',
      locationCoordinates: {
        type: 'Point',
        coordinates: [-75.1652215, 39.9525839], // [longitude, latitude]
      },
    },
    {
      title: 'World Wide Web Invented',
      description: 'Tim Berners-Lee invented the World Wide Web while working at CERN.',
      year: 1989,
      month: 3,
      day: 12,
      category: 'Technology',
      subcategory: 'Internet',
      tags: ['web', 'internet', 'CERN', 'Tim Berners-Lee'],
      significance: 'pivotal',
      imageUrl: 'https://example.com/www.jpg',
      sources: [
        {
          name: 'CERN',
          url: 'https://home.cern/science/computing/birth-web',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'CERN, Switzerland',
      locationCoordinates: {
        type: 'Point',
        coordinates: [6.0559408, 46.2322338], // [longitude, latitude]
      },
    },
    {
      title: 'First Olympic Games of Modern Era',
      description: 'The first Olympic Games of the modern era were held in Athens, Greece.',
      year: 1896,
      month: 4,
      day: 6,
      category: 'Sports',
      subcategory: 'Olympics',
      tags: ['Olympics', 'Athens', 'sports', 'competition'],
      significance: 'high',
      imageUrl: 'https://example.com/first-olympics.jpg',
      sources: [
        {
          name: 'Olympic.org',
          url: 'https://www.olympic.org/athens-1896',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'Athens, Greece',
      locationCoordinates: {
        type: 'Point',
        coordinates: [23.7275388, 37.9838096], // [longitude, latitude]
      },
    },
    {
      title: 'First Successful Powered Flight',
      description:
        'The Wright Brothers achieved the first powered, sustained, and controlled airplane flight.',
      year: 1903,
      month: 12,
      day: 17,
      category: 'Transportation',
      subcategory: 'Aviation',
      tags: ['Wright Brothers', 'aviation', 'flight', 'airplane'],
      significance: 'pivotal',
      imageUrl: 'https://example.com/wright-brothers.jpg',
      sources: [
        {
          name: 'Smithsonian',
          url: 'https://airandspace.si.edu/exhibitions/wright-brothers/online/',
          retrievalDate: new Date('2023-01-15'),
        },
      ],
      verified: true,
      locationName: 'Kitty Hawk, North Carolina',
      locationCoordinates: {
        type: 'Point',
        coordinates: [-75.6698767, 36.0228675], // [longitude, latitude]
      },
    },
  ];

  try {
    // Empty the collection first to prevent duplicates
    await HistoricalEvent.deleteMany({});
    logger.info('Cleared existing historical events');

    // Insert the sample events
    await HistoricalEvent.insertMany(events);
    logger.info(`Added ${events.length} historical events`);
  } catch (error) {
    logger.error(`Error seeding historical events: ${error.message}`);
    // Log more detailed error if needed
    console.error(error);
  } finally {
    // Disconnect from the database
    mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the seed function
seedHistoricalEvents();

// Export the function for use in other scripts
module.exports = { seedHistoricalEvents };
