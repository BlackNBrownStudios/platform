const mongoose = require('mongoose');

const config = require('../config/config');
const { Card } = require('../models');

// Function to convert year strings like "2580 BCE" or "1492 CE" to numbers
// BCE years are negative, CE years are positive
const convertYearToNumber = (yearString) => {
  const parts = yearString.split(' ');
  const year = parseInt(parts[0], 10);
  const era = parts[1];

  if (era === 'BCE') {
    return -year; // BCE years are represented as negative
  }
  return year; // CE years are positive
};

// Function to create a date object from a year
// For BCE years, we use January 1st of the absolute year
// For CE years, we use January 1st of the year
const createDateFromYear = (yearString) => {
  const yearNum = convertYearToNumber(yearString);

  if (yearNum < 0) {
    return new Date(Math.abs(yearNum), 0, 1); // January 1st of the absolute year
  }
  return new Date(yearNum, 0, 1); // January 1st of the year
};

const historicalEvents = [
  {
    title: 'Construction of the Great Pyramid of Giza',
    description:
      'The Great Pyramid of Giza was constructed as a tomb for the Fourth Dynasty Egyptian pharaoh Khufu.',
    year: -2580, // 2580 BCE
    date: new Date(Math.abs(2580), 0, 1), // January 1st, 2580 BCE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Ancient',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(), // Random ObjectId for now
    region: 'Egypt',
    tags: ['Architecture', 'Ancient Egypt', 'Pyramids'],
  },
  {
    title: 'Alexander the Great Conquers Persia',
    description:
      'Alexander the Great defeats Darius III of Persia in the Battle of Gaugamela, effectively conquering the Persian Empire.',
    year: -331, // 331 BCE
    date: new Date(Math.abs(331), 9, 1), // October 1st, 331 BCE (approximate date of the Battle of Gaugamela)
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Military',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Persia',
    tags: ['Military', 'Ancient Greece', 'Empire'],
  },
  {
    title: 'Qin Shi Huang Unifies China',
    description:
      'Qin Shi Huang completes his conquest of the Warring States and becomes the first emperor of a unified China.',
    year: -221, // 221 BCE
    date: new Date(Math.abs(221), 0, 1),
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'China',
    tags: ['Ancient China', 'Unification', 'Empire'],
  },
  {
    title: 'Rise of the Roman Empire',
    description:
      'Octavian (later known as Augustus) becomes the first Roman Emperor, transforming the Roman Republic into the Roman Empire.',
    year: -27, // 27 BCE
    date: new Date(Math.abs(27), 0, 16), // January 16, 27 BCE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Rome',
    tags: ['Ancient Rome', 'Empire', 'Augustus'],
  },
  {
    title: 'Fall of the Roman Empire',
    description:
      'The Western Roman Empire falls when Romulus Augustus is forced to abdicate by Odoacer, who becomes the first King of Italy.',
    year: 476, // 476 CE
    date: new Date(476, 8, 4), // September 4, 476 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Rome',
    tags: ['Ancient Rome', 'Fall of Empire', 'Medieval'],
  },
  {
    title: 'The Crusades Begin',
    description:
      'Pope Urban II calls for the First Crusade at the Council of Clermont, beginning two centuries of religious wars.',
    year: 1095, // 1095 CE
    date: new Date(1095, 10, 27), // November 27, 1095 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Military',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Europe',
    tags: ['Medieval', 'Religion', 'War'],
  },
  {
    title: 'Black Death Spreads Across Europe',
    description:
      "The Black Death (bubonic plague) reaches Europe and begins to devastate the continent's population.",
    year: 1346, // 1346 CE
    date: new Date(1346, 9, 1), // October 1, 1346 CE (approximate)
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Health',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Europe',
    tags: ['Plague', 'Medieval', 'Disease'],
  },
  {
    title: 'Columbus Sails to the Americas',
    description:
      'Christopher Columbus completes his voyage across the Atlantic and reaches the Americas, beginning the Columbian Exchange.',
    year: 1492, // 1492 CE
    date: new Date(1492, 9, 12), // October 12, 1492 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Exploration',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Americas',
    tags: ['Exploration', 'Discovery', 'Renaissance'],
  },
  {
    title: 'Martin Luther Starts the Reformation',
    description:
      'Martin Luther publishes his Ninety-Five Theses, challenging Catholic Church practices and starting the Protestant Reformation.',
    year: 1517, // 1517 CE
    date: new Date(1517, 9, 31), // October 31, 1517 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Religious',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Germany',
    tags: ['Religion', 'Reformation', 'Christianity'],
  },
  {
    title: 'English Settlement at Jamestown',
    description:
      'The Virginia Company establishes the first permanent English settlement in North America at Jamestown, Virginia.',
    year: 1607, // 1607 CE
    date: new Date(1607, 4, 14), // May 14, 1607 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Exploration',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'North America',
    tags: ['Colonization', 'Settlement', 'America'],
  },
  {
    title: 'French Revolution Begins',
    description:
      'The French Revolution begins with the Storming of the Bastille, marking the start of radical social and political change in France.',
    year: 1789, // 1789 CE
    date: new Date(1789, 6, 14), // July 14, 1789 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'France',
    tags: ['Revolution', 'Politics', 'Modern History'],
  },
  {
    title: 'Napoleon Conquers Europe',
    description:
      'Napoleon Bonaparte defeats the combined armies of Austria and Russia at the Battle of Austerlitz, solidifying his control over much of Europe.',
    year: 1805, // 1805 CE
    date: new Date(1805, 11, 2), // December 2, 1805 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Military',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Europe',
    tags: ['War', 'Empire', 'Napoleon'],
  },
  {
    title: 'American Civil War',
    description:
      'The American Civil War begins with the Confederate attack on Fort Sumter, eventually leading to the abolition of slavery in the United States.',
    year: 1861, // 1861 CE
    date: new Date(1861, 3, 12), // April 12, 1861 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Military',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'United States',
    tags: ['Civil War', 'Slavery', 'America'],
  },
  {
    title: 'World War I Begins',
    description:
      "World War I begins with Austria-Hungary's declaration of war on Serbia following the assassination of Archduke Franz Ferdinand.",
    year: 1914, // 1914 CE
    date: new Date(1914, 6, 28), // July 28, 1914 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Military',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Europe',
    tags: ['War', 'Global Conflict', 'Modern History'],
  },
  {
    title: 'Russian Revolution',
    description:
      'The Russian Revolution overthrows the Tsarist autocracy and leads to the rise of the Soviet Union.',
    year: 1917, // 1917 CE
    date: new Date(1917, 10, 7), // November 7, 1917 CE (October 25 in the Julian calendar)
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Russia',
    tags: ['Revolution', 'Communism', 'Soviet Union'],
  },
  {
    title: 'World War II Begins',
    description:
      "World War II begins with Nazi Germany's invasion of Poland, eventually becoming the deadliest conflict in human history.",
    year: 1939, // 1939 CE
    date: new Date(1939, 8, 1), // September 1, 1939 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Military',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Europe',
    tags: ['War', 'Nazi Germany', 'Global Conflict'],
  },
  {
    title: 'United Nations Founded',
    description:
      'The United Nations is established after World War II to prevent future conflicts and facilitate international cooperation.',
    year: 1945, // 1945 CE
    date: new Date(1945, 9, 24), // October 24, 1945 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Global',
    tags: ['International Relations', 'Peace', 'Modern History'],
  },
  {
    title: 'Berlin Wall Falls',
    description:
      'The Berlin Wall falls, symbolizing the end of the Cold War and leading to the reunification of Germany.',
    year: 1989, // 1989 CE
    date: new Date(1989, 10, 9), // November 9, 1989 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Political',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'Germany',
    tags: ['Cold War', 'Communism', 'Modern History'],
  },
  {
    title: '9/11 Terrorist Attacks',
    description:
      'Terrorist attacks on the World Trade Center and Pentagon kill nearly 3,000 people and lead to the War on Terror.',
    year: 2001, // 2001 CE
    date: new Date(2001, 8, 11), // September 11, 2001 CE
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Terrorism',
    difficulty: 'medium',
    isVerified: true,
    createdBy: new mongoose.Types.ObjectId(),
    region: 'United States',
    tags: ['Terrorism', 'War on Terror', 'Contemporary History'],
  },
];

/**
 * Seed the database with historical events
 */
const seedHistoricalEvents = async () => {
  console.log('Seeding historical events...');

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoose.url, config.mongoose.options);
    }

    // Clear out existing cards first
    await Card.deleteMany({});

    // Insert all the historical events
    await Card.insertMany(historicalEvents);

    console.log(`Successfully seeded ${historicalEvents.length} historical events`);
  } catch (error) {
    console.error('Error seeding historical events:', error);
  }
};

// Export the function and data
module.exports = {
  seedHistoricalEvents,
  historicalEvents,
};

// If this script is run directly (not imported), execute the seeding
if (require.main === module) {
  seedHistoricalEvents()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
