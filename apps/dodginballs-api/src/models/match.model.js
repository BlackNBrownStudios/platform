const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

// Define match state constants
const MATCH_STATES = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  CANCELLED: 3
};

const matchSchema = mongoose.Schema(
  {
    court: {
      type: String,
      required: true,
      trim: true,
    },
    matchState: {
      type: Number,
      enum: Object.values(MATCH_STATES),
      default: MATCH_STATES.PENDING,
    },
    winningTeamId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Team',
      required: false,
    },
    losingTeamId: {
      type: mongoose.SchemaTypes.ObjectId, 
      ref: 'Team',
      required: false,
    },
    teams: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Team',
    }],
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    gameMode: {
      type: String,
      enum: ['standard', 'tournament', 'practice', 'custom'],
      default: 'standard',
    },
    scoreData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    matchStatistics: {
      totalThrows: { type: Number, default: 0 },
      totalCatches: { type: Number, default: 0 },
      totalHits: { type: Number, default: 0 },
      totalDodges: { type: Number, default: 0 },
      matchDuration: { type: Number }, // in seconds
      mvpPlayerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    }
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to json
matchSchema.plugin(toJSON);
matchSchema.plugin(paginate);

// Add static method to get match states
matchSchema.statics.states = MATCH_STATES;

// Virtual for checking if match is active
matchSchema.virtual('isActive').get(function() {
  return this.matchState === MATCH_STATES.IN_PROGRESS;
});

// Virtual for checking if match is completed
matchSchema.virtual('isCompleted').get(function() {
  return this.matchState === MATCH_STATES.COMPLETED;
});

// Method to end the match and set winner/loser
matchSchema.methods.endMatch = async function(winningTeamId) {
  // Find the losing team (all teams that aren't the winning team)
  const losingTeamIds = this.teams.filter(teamId => 
    teamId.toString() !== winningTeamId.toString()
  );

  this.matchState = MATCH_STATES.COMPLETED;
  this.winningTeamId = winningTeamId;
  this.losingTeamId = losingTeamIds.length === 1 ? losingTeamIds[0] : null;
  this.endedAt = new Date();
  
  if (this.startedAt) {
    // Calculate match duration in seconds
    const duration = Math.floor((this.endedAt - this.startedAt) / 1000);
    this.matchStatistics.matchDuration = duration;
  }
  
  return this.save();
};

// Start the match
matchSchema.methods.startMatch = async function() {
  this.matchState = MATCH_STATES.IN_PROGRESS;
  this.startedAt = new Date();
  return this.save();
};

/**
 * @typedef Match
 */
const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
