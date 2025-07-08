const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const teamSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    logo: {
      type: String,
      default: '',
    },
    statistics: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      totalMatches: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      totalThrows: { type: Number, default: 0 },
      totalCatches: { type: Number, default: 0 },
      totalHits: { type: Number, default: 0 },
      totalDodges: { type: Number, default: 0 },
      highestStreak: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
    },
    matchHistory: [{
      matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      result: { type: String, enum: ['win', 'loss', 'draw'] },
      score: { type: Number },
      opponentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      date: { type: Date, default: Date.now }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    customizations: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => new Map()
    }
  },
  {
    timestamps: true,
  }
);

// Add plugins
teamSchema.plugin(toJSON);
teamSchema.plugin(paginate);

// Add method to check if user is in team
teamSchema.methods.hasMember = function(userId) {
  return this.members.some(memberId => memberId.toString() === userId.toString());
};

// Add method to add member to team
teamSchema.methods.addMember = async function(userId) {
  if (this.hasMember(userId)) {
    throw new Error('User is already a team member');
  }
  
  this.members.push(userId);
  
  // If there's no captain, make the new member captain
  if (!this.captain) {
    this.captain = userId;
  }
  
  return this.save();
};

// Add method to remove member from team
teamSchema.methods.removeMember = async function(userId) {
  if (!this.hasMember(userId)) {
    throw new Error('User is not a team member');
  }
  
  this.members = this.members.filter(memberId => memberId.toString() !== userId.toString());
  
  // If captain is removed, assign a new captain if there are still members
  if (this.captain && this.captain.toString() === userId.toString() && this.members.length > 0) {
    this.captain = this.members[0];
  }
  
  return this.save();
};

// Add method to update team stats after a match
teamSchema.methods.updateStats = async function(matchResult, opponentTeamId, score = 0) {
  // Update basic stats
  this.statistics.totalMatches += 1;
  this.statistics.totalScore += score;
  
  // Update match history
  this.matchHistory.push({
    matchId: matchResult.matchId,
    result: matchResult.result,
    score,
    opponentTeamId,
    date: new Date()
  });
  
  // Update win/loss record and streaks
  if (matchResult.result === 'win') {
    this.statistics.wins += 1;
    this.statistics.currentStreak += 1;
    
    // Update highest streak if current streak is higher
    if (this.statistics.currentStreak > this.statistics.highestStreak) {
      this.statistics.highestStreak = this.statistics.currentStreak;
    }
  } else if (matchResult.result === 'loss') {
    this.statistics.losses += 1;
    this.statistics.currentStreak = 0;
  }
  
  return this.save();
};

/**
 * @typedef Team
 */
const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
