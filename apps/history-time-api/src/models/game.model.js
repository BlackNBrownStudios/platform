const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const gameSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },
    cards: [
      {
        cardId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Card',
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        placementOrder: {
          type: Number,
          required: true,
        },
        placementPosition: {
          type: Number,
          default: null,
        },
        timeTaken: {
          type: Number, // in seconds
          default: 0,
        },
      },
    ],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    score: {
      type: Number,
      default: 0,
    },
    correctPlacements: {
      type: Number,
      default: 0,
    },
    incorrectPlacements: {
      type: Number,
      default: 0,
    },
    timeStarted: {
      type: Date,
      default: Date.now,
    },
    timeEnded: {
      type: Date,
    },
    totalTimeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    categories: [String],
    isWin: {
      type: Boolean,
      default: false,
    },
    // Daily challenge fields
    isDailyChallenge: {
      type: Boolean,
      default: false,
    },
    dailyChallengeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'DailyChallenge',
    },
    maxPossibleScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
gameSchema.plugin(toJSON);
gameSchema.plugin(paginate);

/**
 * Calculate game score based on correct placements and time taken
 * @param {number} correctPlacements - Number of correct card placements
 * @param {number} totalCards - Total number of cards in the game
 * @param {number} timeTaken - Time taken to complete the game in seconds
 * @param {string} difficulty - Game difficulty level
 * @returns {number} - Calculated score
 */
gameSchema.statics.calculateScore = function (
  correctPlacements,
  totalCards,
  timeTaken,
  difficulty
) {
  // Base points per correct card
  const basePoints = 100;

  // Difficulty multipliers
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3,
  };

  // Time factor - rewards faster placements
  // For a 10-card game at medium difficulty, aim for 30 seconds per card placement
  const targetTimePerCard = 30; // seconds
  const targetTotalTime = totalCards * targetTimePerCard;
  const timeBonus = Math.max(0, 1 - timeTaken / targetTotalTime);

  // Accuracy bonus - rewards high percentage of correct placements
  const accuracyRate = correctPlacements / totalCards;

  // Calculate final score
  let score = Math.round(
    basePoints *
      correctPlacements *
      difficultyMultiplier[difficulty] *
      (1 + timeBonus) *
      (1 + accuracyRate / 2) // Additional bonus for high accuracy
  );

  return score;
};

/**
 * End the game and calculate final score
 */
gameSchema.methods.endGame = async function () {
  const game = this;

  // Set end time and calculate total time taken
  game.timeEnded = new Date();
  game.totalTimeTaken = Math.round((game.timeEnded - game.timeStarted) / 1000);

  // Count correct and incorrect placements
  game.correctPlacements = game.cards.filter((card) => card.isCorrect).length;
  game.incorrectPlacements = game.cards.length - game.correctPlacements;

  // Determine if game is won (at least 70% correct placements)
  game.isWin = game.correctPlacements / game.cards.length >= 0.7;

  // Calculate final score
  game.score = this.constructor.calculateScore(
    game.correctPlacements,
    game.cards.length,
    game.totalTimeTaken,
    game.difficulty
  );

  // Update game status
  game.status = 'completed';

  await game.save();

  return game;
};

/**
 * @typedef Game
 */
const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
