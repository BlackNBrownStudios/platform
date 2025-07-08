const mongoose = require('mongoose');
const { Match } = require('../../src/models');
const { teamOne, teamTwo } = require('./team.fixture');

// Create test match objects
const matchOne = {
  _id: new mongoose.Types.ObjectId(),
  court: 'Court A',
  gameMode: 'standard',  // Changed to lowercase to match enum values
  teams: [teamOne._id, teamTwo._id],
  winningTeamId: teamOne._id,
  losingTeamId: teamTwo._id,
  matchState: 2, // Completed
  startedAt: new Date('2025-01-01T10:00:00Z'),
  endedAt: new Date('2025-01-01T10:30:00Z'),
  matchStatistics: {
    totalThrows: 50,
    totalCatches: 30,
    totalHits: 20,
    totalDodges: 15,
    matchDuration: 1800 // 30 minutes in seconds
  }
};

const matchTwo = {
  _id: new mongoose.Types.ObjectId(),
  court: 'Court B',
  gameMode: 'custom',  // Changed to an allowed enum value
  teams: [teamOne._id, teamTwo._id],
  winningTeamId: teamTwo._id,
  losingTeamId: teamOne._id,
  matchState: 2, // Completed
  startedAt: new Date('2025-01-02T14:00:00Z'),
  endedAt: new Date('2025-01-02T14:45:00Z'),
  matchStatistics: {
    totalThrows: 75,
    totalCatches: 45,
    totalHits: 30,
    totalDodges: 25,
    matchDuration: 2700 // 45 minutes in seconds
  }
};

const matchThree = {
  _id: new mongoose.Types.ObjectId(),
  court: 'Court C',
  gameMode: 'standard',  // Changed to lowercase to match enum values
  teams: [teamOne._id, teamTwo._id],
  matchState: 1, // In Progress
  startedAt: new Date('2025-01-03T09:00:00Z'),
  matchStatistics: {
    totalThrows: 25,
    totalCatches: 15,
    totalHits: 10,
    totalDodges: 8,
    matchDuration: 900 // 15 minutes so far
  }
};

// Function to insert matches into the database
const insertMatches = async (matches) => {
  const insertedMatches = [];
  for (const match of matches) {
    const dbMatch = await Match.create(match);
    insertedMatches.push(dbMatch);
  }
  return insertedMatches;
};

module.exports = {
  matchOne,
  matchTwo,
  matchThree,
  insertMatches,
};
