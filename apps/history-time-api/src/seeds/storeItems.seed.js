/**
 * Seed data for store items
 * Run with: node src/seeds/storeItems.seed.js
 */
const mongoose = require('mongoose');

const config = require('../config/config');
const logger = require('../config/logger');
const { StoreItem } = require('../models');

const storeItems = [
  // Borders
  {
    name: 'Golden Frame',
    description: 'A luxurious golden border for your profile',
    type: 'border',
    itemId: 'border_gold',
    previewImageUrl: '/store/borders/golden-frame.png',
    price: 1000,
    rarity: 'legendary',
    isAvailable: true,
    isNew: true,
    isFeatured: true,
  },
  {
    name: 'Ancient Scroll',
    description: 'A historic scroll border that reflects your knowledge of history',
    type: 'border',
    itemId: 'border_scroll',
    previewImageUrl: '/store/borders/ancient-scroll.png',
    price: 500,
    rarity: 'rare',
    isAvailable: true,
  },
  {
    name: 'Medieval Shield',
    description: 'A medieval shield border for the history warriors',
    type: 'border',
    itemId: 'border_shield',
    previewImageUrl: '/store/borders/medieval-shield.png',
    price: 300,
    rarity: 'common',
    isAvailable: true,
  },

  // Themes
  {
    name: 'Renaissance',
    description: 'Transform your game with the art and colors of the Renaissance',
    type: 'theme',
    itemId: 'theme_renaissance',
    previewImageUrl: '/store/themes/renaissance.png',
    price: 800,
    rarity: 'epic',
    isAvailable: true,
    isNew: true,
  },
  {
    name: 'Ancient Egypt',
    description: 'Experience the mystique of Ancient Egypt with this theme',
    type: 'theme',
    itemId: 'theme_egypt',
    previewImageUrl: '/store/themes/egypt.png',
    price: 600,
    rarity: 'rare',
    isAvailable: true,
  },
  {
    name: 'Industrial Revolution',
    description: 'A theme inspired by the age of invention and industry',
    type: 'theme',
    itemId: 'theme_industrial',
    previewImageUrl: '/store/themes/industrial.png',
    price: 400,
    rarity: 'common',
    isAvailable: true,
  },

  // Card Backs
  {
    name: 'Vintage Map',
    description: 'Classic vintage map design for your cards',
    type: 'cardBack',
    itemId: 'cardback_map',
    previewImageUrl: '/store/cardbacks/vintage-map.png',
    price: 750,
    rarity: 'epic',
    isAvailable: true,
    isNew: true,
    isFeatured: true,
  },
  {
    name: 'Parchment',
    description: 'Aged parchment paper design for your cards',
    type: 'cardBack',
    itemId: 'cardback_parchment',
    previewImageUrl: '/store/cardbacks/parchment.png',
    price: 350,
    rarity: 'common',
    isAvailable: true,
  },
  {
    name: 'Tech Circuit',
    description: 'Modern tech circuit design for a futuristic look',
    type: 'cardBack',
    itemId: 'cardback_tech',
    previewImageUrl: '/store/cardbacks/tech.png',
    price: 450,
    rarity: 'rare',
    isAvailable: true,
  },
];

// Connect to database
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(async () => {
    logger.info('Connected to MongoDB');

    // Delete existing items first
    await StoreItem.deleteMany({});
    logger.info('Cleared existing store items');

    // Insert new seed data
    await StoreItem.insertMany(storeItems);
    logger.info(`Inserted ${storeItems.length} store items`);

    // Close connection
    mongoose.connection.close();
    logger.info('Disconnected from MongoDB');
    logger.info('Seed completed successfully!');
  })
  .catch((error) => {
    logger.error(`Error seeding store items: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  });
