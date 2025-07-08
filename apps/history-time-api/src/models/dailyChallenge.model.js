const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const dailyChallengeSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    cardCount: {
      type: Number,
      required: true,
      default: 5,
      min: 3,
      max: 10,
    },
    categories: {
      type: [String],
      default: [],
    },
    rewardCoins: {
      type: Number,
      required: true,
      default: 25,
      min: 10,
    },
    specialReward: {
      type: {
        itemType: {
          type: String,
          enum: ['borders', 'themes', 'cardBacks', 'none'],
          default: 'none',
        },
        itemId: {
          type: String,
          default: '',
        },
      },
      _id: false,
      default: { itemType: 'none', itemId: '' },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
dailyChallengeSchema.plugin(toJSON);
dailyChallengeSchema.plugin(paginate);

/**
 * Get today's challenge
 * @returns {Promise<DailyChallenge>}
 */
dailyChallengeSchema.statics.getTodayChallenge = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return this.findOne({
    date: {
      $gte: today,
      $lt: tomorrow,
    },
    active: true,
  });
};

/**
 * Generate new daily challenge for today if it doesn't exist
 * @param {Object} options - Challenge options
 * @returns {Promise<DailyChallenge>}
 */
dailyChallengeSchema.statics.generateTodayChallenge = async function (options = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if challenge already exists for today
  const existingChallenge = await this.getTodayChallenge();
  if (existingChallenge) {
    return existingChallenge;
  }

  // Generate new challenge
  const { Card } = mongoose.models;

  // Get a random category with enough cards
  const categories = await Card.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $match: { count: { $gte: 10 } } }, // Ensure at least 10 cards in category
    { $sample: { size: 1 } },
  ]);

  const category = categories.length > 0 ? categories[0]._id : null;
  const difficulty =
    options.difficulty || ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
  const cardCount = options.cardCount || Math.floor(Math.random() * 4) + 5; // 5-8 cards

  // Create title based on category and difficulty
  const titles = [
    `${category || 'History'} Time Challenge`,
    `Daily ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenge`,
    `${category || 'Historical'} Explorer Challenge`,
    `Timeline Master: ${category || 'Mixed'} Edition`,
  ];

  const title = options.title || titles[Math.floor(Math.random() * titles.length)];
  const description =
    options.description ||
    `Place ${cardCount} ${category || 'historical'} events in chronological order.`;

  // Create the challenge
  const challenge = await this.create({
    date: today,
    title,
    description,
    difficulty,
    cardCount,
    categories: category ? [category] : [],
    rewardCoins:
      options.rewardCoins ||
      cardCount * 5 + (difficulty === 'easy' ? 5 : difficulty === 'medium' ? 15 : 25),
    specialReward: options.specialReward || { itemType: 'none', itemId: '' },
    active: true,
  });

  return challenge;
};

/**
 * @typedef DailyChallenge
 */
const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

module.exports = DailyChallenge;
