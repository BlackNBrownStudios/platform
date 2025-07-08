const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

// Define lobby status constants
const LOBBY_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
};

const lobbySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    teams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }],
    maxPlayers: {
      type: Number,
      default: 4,
      min: 2,
      max: 8
    },
    status: {
      type: String,
      enum: Object.values(LOBBY_STATUS),
      default: LOBBY_STATUS.WAITING
    },
    gameSettings: {
      gameMode: {
        type: String,
        enum: ['standard', 'tournament', 'practice', 'custom'],
        default: 'standard'
      },
      teamSize: {
        type: Number,
        default: 2,
        min: 1,
        max: 4
      },
      duration: {
        type: Number,
        default: 300,  // 5 minutes in seconds
        min: 60,
        max: 1800
      },
      court: {
        type: String,
        default: 'standard'
      },
      customRules: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => new Map()
      }
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    region: {
      type: String,
      default: 'us-west'
    },
    chatHistory: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Add plugins
lobbySchema.plugin(toJSON);
lobbySchema.plugin(paginate);

// Add status constants
lobbySchema.statics.status = LOBBY_STATUS;

// Add method to check if lobby is full
lobbySchema.methods.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

// Add method to check if player is in lobby
lobbySchema.methods.hasPlayer = function(userId) {
  return this.players.some(playerId => playerId.toString() === userId.toString());
};

// Add method to add player to lobby
lobbySchema.methods.addPlayer = async function(userId) {
  if (this.isFull()) {
    throw new Error('Lobby is full');
  }
  
  if (this.hasPlayer(userId)) {
    throw new Error('Player is already in lobby');
  }
  
  this.players.push(userId);
  return this.save();
};

// Add method to remove player from lobby
lobbySchema.methods.removePlayer = async function(userId) {
  if (!this.hasPlayer(userId)) {
    throw new Error('Player is not in lobby');
  }
  
  this.players = this.players.filter(playerId => playerId.toString() !== userId.toString());
  
  // If host leaves, assign a new host if there are still players
  if (this.host.toString() === userId.toString() && this.players.length > 0) {
    this.host = this.players[0];
  }
  
  return this.save();
};

// Add method to start game
lobbySchema.methods.startGame = async function(matchId) {
  this.status = LOBBY_STATUS.IN_PROGRESS;
  this.matchId = matchId;
  return this.save();
};

// Add method to end game
lobbySchema.methods.endGame = async function() {
  this.status = LOBBY_STATUS.FINISHED;
  return this.save();
};

// Generate a random invite code (pre-save hook)
lobbySchema.pre('save', function(next) {
  if (this.isPrivate && !this.inviteCode) {
    // Generate a 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.inviteCode = code;
  }
  next();
});

/**
 * @typedef Lobby
 */
const Lobby = mongoose.model('Lobby', lobbySchema);

module.exports = Lobby;
