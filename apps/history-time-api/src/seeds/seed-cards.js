const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { Card, User } = require('../models');

/**
 * Sample historical event cards for game testing
 */
const sampleCards = [
  {
    title: 'Declaration of Independence',
    description:
      'The United States Declaration of Independence was adopted by the Continental Congress',
    date: new Date('1776-07-04'),
    year: 1776,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/8f/United_States_Declaration_of_Independence.jpg',
    category: 'Political',
    subcategory: 'American History',
    difficulty: 'medium',
    region: 'North America',
    tags: ['American Revolution', 'founding documents'],
    source: 'https://en.wikipedia.org/wiki/United_States_Declaration_of_Independence',
    isVerified: true,
  },
  {
    title: 'Moon Landing',
    description: 'Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon',
    date: new Date('1969-07-20'),
    year: 1969,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Apollo_11_Crew.jpg',
    category: 'Scientific',
    subcategory: 'Space Exploration',
    difficulty: 'easy',
    region: 'Global',
    tags: ['NASA', 'Apollo 11', 'space race'],
    source: 'https://en.wikipedia.org/wiki/Apollo_11',
    isVerified: true,
  },
  {
    title: 'Fall of the Berlin Wall',
    description: 'The Berlin Wall fell, symbolizing the end of the Cold War',
    date: new Date('1989-11-09'),
    year: 1989,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Thefalloftheberlinwall1989.JPG',
    category: 'Political',
    subcategory: 'European History',
    difficulty: 'medium',
    region: 'Europe',
    tags: ['Cold War', 'Germany', 'communism'],
    source: 'https://en.wikipedia.org/wiki/Berlin_Wall',
    isVerified: true,
  },
  {
    title: 'World War II Begins',
    description: 'Germany invaded Poland, beginning World War II in Europe',
    date: new Date('1939-09-01'),
    year: 1939,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1f/Polish_infantry_marching_-_1939.jpg',
    category: 'Military',
    subcategory: 'World War II',
    difficulty: 'medium',
    region: 'Europe',
    tags: ['Nazi Germany', 'Poland', 'war'],
    source: 'https://en.wikipedia.org/wiki/Invasion_of_Poland',
    isVerified: true,
  },
  {
    title: 'Invention of the Printing Press',
    description: 'Johannes Gutenberg introduced the printing press with movable type in Europe',
    date: new Date('1450-01-01'),
    year: 1450,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/42/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg',
    category: 'Technological',
    subcategory: 'Inventions',
    difficulty: 'hard',
    region: 'Europe',
    tags: ['printing', 'books', 'Renaissance'],
    source: 'https://en.wikipedia.org/wiki/Printing_press',
    isVerified: true,
  },
  {
    title: 'First Atomic Bomb Test',
    description:
      'The first nuclear weapon was detonated in the Trinity test as part of the Manhattan Project',
    date: new Date('1945-07-16'),
    year: 1945,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Trinity_explosion.jpg',
    category: 'Scientific',
    subcategory: 'Nuclear Physics',
    difficulty: 'medium',
    region: 'North America',
    tags: ['Manhattan Project', 'nuclear weapons', 'World War II'],
    source: 'https://en.wikipedia.org/wiki/Trinity_(nuclear_test)',
    isVerified: true,
  },
  {
    title: 'Discovery of Penicillin',
    description: 'Alexander Fleming discovered penicillin, the first antibiotic medication',
    date: new Date('1928-09-28'),
    year: 1928,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Penicillium_notatum.jpg',
    category: 'Scientific',
    subcategory: 'Medicine',
    difficulty: 'medium',
    region: 'Europe',
    tags: ['antibiotics', 'medicine', 'biology'],
    source: 'https://en.wikipedia.org/wiki/Penicillin',
    isVerified: true,
  },
  {
    title: 'French Revolution Begins',
    description: 'The storming of the Bastille marked the beginning of the French Revolution',
    date: new Date('1789-07-14'),
    year: 1789,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Anonymous_-_Prise_de_la_Bastille.jpg',
    category: 'Political',
    subcategory: 'European History',
    difficulty: 'medium',
    region: 'Europe',
    tags: ['France', 'revolution', 'monarchy'],
    source: 'https://en.wikipedia.org/wiki/Storming_of_the_Bastille',
    isVerified: true,
  },
  {
    title: 'Magna Carta Signed',
    description: 'King John of England signed the Magna Carta, limiting the power of the monarchy',
    date: new Date('1215-06-15'),
    year: 1215,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/e1/Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg',
    category: 'Political',
    subcategory: 'Medieval History',
    difficulty: 'hard',
    region: 'Europe',
    tags: ['England', 'monarchy', 'law'],
    source: 'https://en.wikipedia.org/wiki/Magna_Carta',
    isVerified: true,
  },
  {
    title: 'First Human Genome Sequenced',
    description: 'The Human Genome Project completed the first full human genome sequence',
    date: new Date('2003-04-14'),
    year: 2003,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/e7/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png',
    category: 'Scientific',
    subcategory: 'Genetics',
    difficulty: 'easy',
    region: 'Global',
    tags: ['genetics', 'DNA', 'biology'],
    source: 'https://en.wikipedia.org/wiki/Human_Genome_Project',
    isVerified: true,
  },
  {
    title: "Wright Brothers' First Flight",
    description:
      'Orville and Wilbur Wright made the first controlled, sustained flight of a powered aircraft',
    date: new Date('1903-12-17'),
    year: 1903,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/First_flight2.jpg',
    category: 'Technological',
    subcategory: 'Aviation',
    difficulty: 'easy',
    region: 'North America',
    tags: ['aviation', 'invention', 'transportation'],
    source: 'https://en.wikipedia.org/wiki/Wright_brothers',
    isVerified: true,
  },
  {
    title: 'Invention of the World Wide Web',
    description: 'Tim Berners-Lee invented the World Wide Web at CERN',
    date: new Date('1989-03-12'),
    year: 1989,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Tim_Berners-Lee.jpg',
    category: 'Technological',
    subcategory: 'Computing',
    difficulty: 'easy',
    region: 'Europe',
    tags: ['internet', 'computing', 'communication'],
    source: 'https://en.wikipedia.org/wiki/World_Wide_Web',
    isVerified: true,
  },
  {
    title: 'Cuban Missile Crisis',
    description:
      'A 13-day confrontation between the United States and Soviet Union over Soviet ballistic missiles in Cuba',
    date: new Date('1962-10-16'),
    year: 1962,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/ed/Cuban_Missile_Crisis_U-2_photo.jpg',
    category: 'Political',
    subcategory: 'Cold War',
    difficulty: 'medium',
    region: 'North America',
    tags: ['Cold War', 'nuclear', 'USSR', 'USA'],
    source: 'https://en.wikipedia.org/wiki/Cuban_Missile_Crisis',
    isVerified: true,
  },
  {
    title: 'Fall of Constantinople',
    description:
      'The Byzantine capital of Constantinople fell to the Ottoman Empire, ending the Byzantine Empire',
    date: new Date('1453-05-29'),
    year: 1453,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Zonaro_GatesofConst.jpg',
    category: 'Military',
    subcategory: 'Medieval History',
    difficulty: 'hard',
    region: 'Europe',
    tags: ['Ottoman Empire', 'Byzantine Empire', 'conquest'],
    source: 'https://en.wikipedia.org/wiki/Fall_of_Constantinople',
    isVerified: true,
  },
  {
    title: 'American Civil War Begins',
    description: 'The American Civil War began with the Confederate attack on Fort Sumter',
    date: new Date('1861-04-12'),
    year: 1861,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Ft_Sumter_bombardement.jpg',
    category: 'Military',
    subcategory: 'American History',
    difficulty: 'medium',
    region: 'North America',
    tags: ['United States', 'civil war', 'slavery'],
    source: 'https://en.wikipedia.org/wiki/American_Civil_War',
    isVerified: true,
  },
];

/**
 * Seed the database with sample cards
 */
const seedCards = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Find an admin user to use as creator, or create one if none exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@historyapp.com',
        password: 'password123',
        role: 'admin',
        isEmailVerified: true,
      });
      logger.info('Created admin user for seeding');
    }

    // Clear existing cards
    await Card.deleteMany({});
    logger.info('Cleared existing cards');

    // Add creator ID to each card and ensure valid GeoJSON if locationCoordinates exist
    const cardsWithCreator = sampleCards.map((card) => {
      const processedCard = {
        ...card,
        createdBy: adminUser._id,
      };

      // Add explicit locationCoordinates based on region if not present
      if (!processedCard.locationCoordinates) {
        if (processedCard.region === 'North America') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [-98.5795, 39.8283] }; // Center of USA
        } else if (processedCard.region === 'Europe') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [10.4515, 51.1657] }; // Center of Europe
        } else if (processedCard.region === 'Asia') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [103.8198, 36.5617] }; // Center of Asia
        } else if (processedCard.region === 'Africa') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [19.4902, 8.7832] }; // Center of Africa
        } else if (processedCard.region === 'South America') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [-58.93, -13.533] }; // Center of South America
        } else if (processedCard.region === 'Australia') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [134.4927, -25.735] }; // Center of Australia
        } else if (processedCard.region === 'Global') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [0, 0] }; // Global placeholder
        }
      } else if (
        processedCard.locationCoordinates.type === 'Point' &&
        (!processedCard.locationCoordinates.coordinates ||
          !Array.isArray(processedCard.locationCoordinates.coordinates))
      ) {
        // Handle malformed locationCoordinates by setting proper coordinates
        if (processedCard.region === 'North America') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [-98.5795, 39.8283] };
        } else if (processedCard.region === 'Europe') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [10.4515, 51.1657] };
        } else if (processedCard.region === 'Asia') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [103.8198, 36.5617] };
        } else if (processedCard.region === 'Africa') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [19.4902, 8.7832] };
        } else if (processedCard.region === 'South America') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [-58.93, -13.533] };
        } else if (processedCard.region === 'Australia') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [134.4927, -25.735] };
        } else if (processedCard.region === 'Global') {
          processedCard.locationCoordinates = { type: 'Point', coordinates: [0, 0] };
        } else {
          // If no valid region matches or coordinates can't be determined, remove the field
          delete processedCard.locationCoordinates;
        }
      }

      return processedCard;
    });

    // Debug - log the first card to verify structure
    logger.info('Sample card structure:', JSON.stringify(cardsWithCreator[0], null, 2));

    // Insert sample cards
    await Card.insertMany(cardsWithCreator);
    logger.info(`Inserted ${sampleCards.length} sample cards`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    logger.info('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);

    if (error.errors) {
      for (const field in error.errors) {
        logger.error(`Field error [${field}]: ${error.errors[field].message}`);
      }
    }

    process.exit(1);
  }
};

// Run the seeding function
seedCards();
