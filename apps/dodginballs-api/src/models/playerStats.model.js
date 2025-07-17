const mongoose = require('mongoose');
const { toJSON, paginate } = require('@platform/backend-core');

const playerStatsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    highScore: {
      type: Number,
      default: 0,
    },
    throws: {
      type: Number,
      default: 0,
    },
    catches: {
      type: Number,
      default: 0,
    },
    hits: {
      type: Number,
      default: 0,
    },
    dodges: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
playerStatsSchema.plugin(toJSON);
playerStatsSchema.plugin(paginate);

// Add a method to update stats
playerStatsSchema.methods.updateStats = function (stats) {
  Object.keys(stats).forEach((key) => {
    if (key in this && typeof this[key] === 'number') {
      this[key] += stats[key];
    }
  });
  
  // Update high score if needed
  if (stats.score && stats.score > this.highScore) {
    this.highScore = stats.score;
  }
  
  return this;
};

// Static method to get or create stats for a user
playerStatsSchema.statics.getOrCreateForUser = async function (userId) {
  let stats = await this.findOne({ userId });
  if (!stats) {
    stats = await this.create({ userId });
  }
  return stats;
};

const PlayerStats = mongoose.model('PlayerStats', playerStatsSchema);

module.exports = PlayerStats;