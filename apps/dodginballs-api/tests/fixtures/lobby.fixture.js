const mongoose = require('mongoose');
const { Lobby } = require('../../src/models');
const { userOne, userTwo, userThree } = require('./user.fixture');
const { teamOne, teamTwo } = require('./team.fixture');

// Create test lobby objects
const lobbyOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Lobby 1',
  host: userOne._id,
  players: [userOne._id, userTwo._id],
  teams: [teamOne._id],
  maxPlayers: 4,
  status: 'waiting',
  gameSettings: {
    gameMode: 'standard',
    teamSize: 2,
    duration: 300,
    court: 'standard',
    customRules: new Map()
  },
  isPrivate: false,
  region: 'us-west'
};

const lobbyTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Lobby 2',
  host: userThree._id,
  players: [userThree._id],
  teams: [teamTwo._id],
  maxPlayers: 2,
  status: 'waiting',
  gameSettings: {
    gameMode: 'practice',
    teamSize: 1,
    duration: 180,
    court: 'small',
    customRules: new Map()
  },
  isPrivate: true,
  inviteCode: 'ABC123',
  region: 'us-east'
};

const lobbyThree = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Lobby 3',
  host: userTwo._id,
  players: [userTwo._id, userOne._id, userThree._id],
  teams: [teamOne._id, teamTwo._id],
  maxPlayers: 6,
  status: 'in_progress',
  gameSettings: {
    gameMode: 'tournament',
    teamSize: 3,
    duration: 600,
    court: 'large',
    customRules: new Map()
  },
  matchId: new mongoose.Types.ObjectId(), // This would be set to a real match ID in tests
  isPrivate: false,
  region: 'eu-west'
};

// Function to insert lobbies into the database
const insertLobbies = async (lobbies) => {
  const insertedLobbies = [];
  for (const lobby of lobbies) {
    const dbLobby = await Lobby.create(lobby);
    insertedLobbies.push(dbLobby);
  }
  return insertedLobbies;
};

module.exports = {
  lobbyOne,
  lobbyTwo,
  lobbyThree,
  insertLobbies,
};
