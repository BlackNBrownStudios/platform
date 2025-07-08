const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { HistoricalEvent } = require('../models');

/**
 * Seed diverse historical events from 3000 BCE to 2000 CE
 */
const seedDiverseHistoricalEvents = async () => {
  try {
    // Connect to the database
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Define diverse historical events from different time periods
    const diverseHistoricalEvents = [
      // Ancient Period (3000 BCE - 500 BCE)
      {
        title: 'Construction of the Great Pyramid of Giza begins',
        description:
          'The Great Pyramid of Giza, built for Pharaoh Khufu, was constructed. It remained the tallest man-made structure for over 3,800 years.',
        date: new Date('-2580-01-01'),
        year: -2580,
        category: 'Architecture',
        subcategory: 'Ancient Wonders',
        locationName: 'Giza, Egypt',
        locationCoordinates: {
          type: 'Point',
          coordinates: [31.1342, 29.9792],
        },
        difficulty: 'medium',
        region: 'Africa',
        tags: ['Ancient Egypt', 'Pyramids', 'Seven Wonders'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza',
        sources: [
          {
            name: 'Wikipedia - Great Pyramid of Giza',
            url: 'https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Code of Hammurabi established',
        description:
          'One of the oldest deciphered writings of significant length in the world, the Code of Hammurabi was a Babylonian legal text composed around 1750 BCE.',
        date: new Date('-1750-01-01'),
        year: -1750,
        category: 'Law',
        subcategory: 'Legal Systems',
        locationName: 'Babylon',
        locationCoordinates: {
          type: 'Point',
          coordinates: [44.4275, 32.5429],
        },
        difficulty: 'hard',
        region: 'Middle East',
        tags: ['Babylon', 'Ancient Law', 'Mesopotamia'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Code_of_Hammurabi',
        sources: [
          {
            name: 'Wikipedia - Code of Hammurabi',
            url: 'https://en.wikipedia.org/wiki/Code_of_Hammurabi',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Trojan War',
        description:
          "The legendary conflict between the Greeks and the city of Troy, immortalized in Homer's Iliad.",
        date: new Date('-1200-01-01'),
        year: -1200,
        category: 'Military',
        subcategory: 'Wars',
        locationName: 'Troy (modern-day Turkey)',
        locationCoordinates: {
          type: 'Point',
          coordinates: [26.2382, 39.9571],
        },
        difficulty: 'medium',
        region: 'Europe',
        tags: ['Ancient Greece', 'Troy', 'Homer'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Trojan_War',
        sources: [
          {
            name: 'Wikipedia - Trojan War',
            url: 'https://en.wikipedia.org/wiki/Trojan_War',
            retrievalDate: new Date(),
          },
        ],
      },

      // Classical Period (500 BCE - 500 CE)
      {
        title: 'Battle of Marathon',
        description:
          'The Athenians defeated the first Persian invasion of Greece, marking a turning point in the Greco-Persian Wars.',
        date: new Date('-490-09-12'),
        year: -490,
        category: 'Military',
        subcategory: 'Battles',
        locationName: 'Marathon, Greece',
        locationCoordinates: {
          type: 'Point',
          coordinates: [23.9485, 38.1621],
        },
        difficulty: 'medium',
        region: 'Europe',
        tags: ['Ancient Greece', 'Persian Empire', 'Wars'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Battle_of_Marathon',
        sources: [
          {
            name: 'Wikipedia - Battle of Marathon',
            url: 'https://en.wikipedia.org/wiki/Battle_of_Marathon',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'The founding of the Roman Republic',
        description:
          'After the overthrow of the monarchy, the Roman Republic was established, which would last until the rise of the Roman Empire.',
        date: new Date('-509-01-01'),
        year: -509,
        category: 'Politics',
        subcategory: 'Government',
        locationName: 'Rome, Italy',
        locationCoordinates: {
          type: 'Point',
          coordinates: [12.4964, 41.9028],
        },
        difficulty: 'easy',
        region: 'Europe',
        tags: ['Ancient Rome', 'Republic', 'Government'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Roman_Republic',
        sources: [
          {
            name: 'Wikipedia - Roman Republic',
            url: 'https://en.wikipedia.org/wiki/Roman_Republic',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Birth of Buddha',
        description:
          'Siddhartha Gautama, who would become the Buddha, was born in Lumbini, in what is now Nepal.',
        date: new Date('-480-01-01'),
        year: -480,
        category: 'Religion',
        subcategory: 'Buddhism',
        locationName: 'Lumbini, Nepal',
        locationCoordinates: {
          type: 'Point',
          coordinates: [83.2756, 27.4833],
        },
        difficulty: 'easy',
        region: 'Asia',
        tags: ['Buddha', 'Buddhism', 'Religion'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Gautama_Buddha',
        sources: [
          {
            name: 'Wikipedia - Gautama Buddha',
            url: 'https://en.wikipedia.org/wiki/Gautama_Buddha',
            retrievalDate: new Date(),
          },
        ],
      },

      // Middle Ages (500 CE - 1500 CE)
      {
        title: 'Muhammad receives first revelation',
        description:
          'According to Islamic belief, the prophet Muhammad received his first revelation from the angel Gabriel in the Cave of Hira, marking the beginning of Islam.',
        date: new Date('610-01-01'),
        year: 610,
        category: 'Religion',
        subcategory: 'Islam',
        locationName: 'Mecca, Saudi Arabia',
        locationCoordinates: {
          type: 'Point',
          coordinates: [39.8579, 21.4225],
        },
        difficulty: 'easy',
        region: 'Middle East',
        tags: ['Islam', 'Muhammad', 'Religion'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Muhammad',
        sources: [
          {
            name: 'Wikipedia - Muhammad',
            url: 'https://en.wikipedia.org/wiki/Muhammad',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Battle of Hastings',
        description:
          'William the Conqueror defeated King Harold II of England, leading to Norman control of England.',
        date: new Date('1066-10-14'),
        year: 1066,
        category: 'Military',
        subcategory: 'Battles',
        locationName: 'Hastings, England',
        locationCoordinates: {
          type: 'Point',
          coordinates: [0.5745, 50.8543],
        },
        difficulty: 'easy',
        region: 'Europe',
        tags: ['Norman Conquest', 'England', 'William the Conqueror'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Battle_of_Hastings',
        sources: [
          {
            name: 'Wikipedia - Battle of Hastings',
            url: 'https://en.wikipedia.org/wiki/Battle_of_Hastings',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Magna Carta signed',
        description:
          'King John of England signed the Magna Carta, limiting the power of the monarchy and establishing that everyone, including the king, was subject to the law.',
        date: new Date('1215-06-15'),
        year: 1215,
        category: 'Law',
        subcategory: 'Documents',
        locationName: 'Runnymede, England',
        locationCoordinates: {
          type: 'Point',
          coordinates: [-0.5652, 51.4418],
        },
        difficulty: 'easy',
        region: 'Europe',
        tags: ['England', 'Law', 'Rights'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Magna_Carta',
        sources: [
          {
            name: 'Wikipedia - Magna Carta',
            url: 'https://en.wikipedia.org/wiki/Magna_Carta',
            retrievalDate: new Date(),
          },
        ],
      },

      // Early Modern Period (1500 CE - 1800 CE)
      {
        title: 'Columbus reaches the Americas',
        description:
          'Christopher Columbus made landfall in the Caribbean, initiating European colonization of the Americas.',
        date: new Date('1492-10-12'),
        year: 1492,
        category: 'Exploration',
        subcategory: 'Voyages',
        locationName: 'San Salvador, Bahamas',
        locationCoordinates: {
          type: 'Point',
          coordinates: [-74.5, 24.0],
        },
        difficulty: 'easy',
        region: 'Americas',
        tags: ['Columbus', 'Exploration', 'Americas'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Voyages_of_Christopher_Columbus',
        sources: [
          {
            name: 'Wikipedia - Voyages of Christopher Columbus',
            url: 'https://en.wikipedia.org/wiki/Voyages_of_Christopher_Columbus',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'The Protestant Reformation begins',
        description:
          'Martin Luther posted his Ninety-five Theses, challenging the Catholic Church and initiating the Protestant Reformation.',
        date: new Date('1517-10-31'),
        year: 1517,
        category: 'Religion',
        subcategory: 'Christianity',
        locationName: 'Wittenberg, Germany',
        locationCoordinates: {
          type: 'Point',
          coordinates: [12.649, 51.8739],
        },
        difficulty: 'easy',
        region: 'Europe',
        tags: ['Martin Luther', 'Reformation', 'Christianity'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Reformation',
        sources: [
          {
            name: 'Wikipedia - Reformation',
            url: 'https://en.wikipedia.org/wiki/Reformation',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'The Boston Tea Party',
        description:
          'American colonists dumped tea into Boston Harbor to protest British taxation, a key event leading to the American Revolution.',
        date: new Date('1773-12-16'),
        year: 1773,
        category: 'Politics',
        subcategory: 'Protests',
        locationName: 'Boston, Massachusetts',
        locationCoordinates: {
          type: 'Point',
          coordinates: [-71.0589, 42.3601],
        },
        difficulty: 'easy',
        region: 'Americas',
        tags: ['American Revolution', 'Protest', 'Taxation'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Boston_Tea_Party',
        sources: [
          {
            name: 'Wikipedia - Boston Tea Party',
            url: 'https://en.wikipedia.org/wiki/Boston_Tea_Party',
            retrievalDate: new Date(),
          },
        ],
      },

      // Modern Period (1800 CE - 2000 CE)
      {
        title: 'Napoleon Bonaparte crowned Emperor',
        description:
          'Napoleon Bonaparte was crowned Emperor of the French, transforming the French Republic into the French Empire.',
        date: new Date('1804-12-02'),
        year: 1804,
        category: 'Politics',
        subcategory: 'Leaders',
        locationName: 'Paris, France',
        locationCoordinates: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
        },
        difficulty: 'easy',
        region: 'Europe',
        tags: ['Napoleon', 'France', 'Emperor'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Napoleon',
        sources: [
          {
            name: 'Wikipedia - Napoleon',
            url: 'https://en.wikipedia.org/wiki/Napoleon',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'First transcontinental railroad completed',
        description:
          'The first transcontinental railroad across the United States was completed, connecting the eastern and western halves of the country.',
        date: new Date('1869-05-10'),
        year: 1869,
        category: 'Technology',
        subcategory: 'Transportation',
        locationName: 'Promontory, Utah',
        locationCoordinates: {
          type: 'Point',
          coordinates: [-112.5462, 41.6172],
        },
        difficulty: 'medium',
        region: 'Americas',
        tags: ['Railroad', 'Transportation', 'United States'],
        sourceUrl: 'https://en.wikipedia.org/wiki/First_Transcontinental_Railroad',
        sources: [
          {
            name: 'Wikipedia - First Transcontinental Railroad',
            url: 'https://en.wikipedia.org/wiki/First_Transcontinental_Railroad',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: "Wright brothers' first flight",
        description:
          'Orville and Wilbur Wright conducted the first successful powered airplane flight at Kitty Hawk, North Carolina.',
        date: new Date('1903-12-17'),
        year: 1903,
        category: 'Technology',
        subcategory: 'Aviation',
        locationName: 'Kitty Hawk, North Carolina',
        locationCoordinates: {
          type: 'Point',
          coordinates: [-75.6718, 36.0177],
        },
        difficulty: 'easy',
        region: 'Americas',
        tags: ['Wright Brothers', 'Aviation', 'Invention'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Wright_brothers',
        sources: [
          {
            name: 'Wikipedia - Wright Brothers',
            url: 'https://en.wikipedia.org/wiki/Wright_brothers',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'End of World War II',
        description:
          'World War II ended with the surrender of Japan, concluding the deadliest conflict in human history.',
        date: new Date('1945-09-02'),
        year: 1945,
        category: 'Military',
        subcategory: 'Wars',
        locationName: 'Tokyo Bay, Japan',
        locationCoordinates: {
          type: 'Point',
          coordinates: [139.769, 35.4398],
        },
        difficulty: 'easy',
        region: 'Asia',
        tags: ['World War II', 'Japan', 'Surrender'],
        sourceUrl: 'https://en.wikipedia.org/wiki/End_of_World_War_II',
        sources: [
          {
            name: 'Wikipedia - End of World War II',
            url: 'https://en.wikipedia.org/wiki/End_of_World_War_II',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Moon Landing',
        description:
          'Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon during the Apollo 11 mission.',
        date: new Date('1969-07-20'),
        year: 1969,
        category: 'Science',
        subcategory: 'Space',
        locationName: 'Moon',
        locationCoordinates: {
          type: 'Point',
          coordinates: [0, 0], // Placeholder for Moon coordinates
        },
        difficulty: 'easy',
        region: 'Space',
        tags: ['NASA', 'Apollo 11', 'Space Exploration'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Apollo_11',
        sources: [
          {
            name: 'Wikipedia - Apollo 11',
            url: 'https://en.wikipedia.org/wiki/Apollo_11',
            retrievalDate: new Date(),
          },
        ],
      },
      {
        title: 'Fall of the Berlin Wall',
        description:
          'The Berlin Wall fell, symbolizing the end of the Cold War and leading to German reunification.',
        date: new Date('1989-11-09'),
        year: 1989,
        category: 'Politics',
        subcategory: 'Cold War',
        locationName: 'Berlin, Germany',
        locationCoordinates: {
          type: 'Point',
          coordinates: [13.3833, 52.5167],
        },
        difficulty: 'easy',
        region: 'Europe',
        tags: ['Berlin Wall', 'Cold War', 'Germany'],
        sourceUrl: 'https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall',
        sources: [
          {
            name: 'Wikipedia - Fall of the Berlin Wall',
            url: 'https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall',
            retrievalDate: new Date(),
          },
        ],
      },
    ];

    // Clear existing collection and insert new events
    await HistoricalEvent.deleteMany({});
    logger.info('Cleared existing historical events');

    await HistoricalEvent.insertMany(diverseHistoricalEvents);
    logger.info(`Added ${diverseHistoricalEvents.length} diverse historical events`);

    console.log('✅ Diverse historical events seeded successfully');
  } catch (error) {
    logger.error('Error seeding diverse historical events:', error);
    console.error('❌ Error seeding diverse historical events:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the seed function if this module is being executed directly
if (require.main === module) {
  seedDiverseHistoricalEvents();
}

module.exports = seedDiverseHistoricalEvents;
