const mongoose = require('mongoose');
const { Team } = require('../../src/models');
const { userOne, userTwo, userThree } = require('./user.fixture');

// Create test team objects
const teamOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Red Team',
  color: 'red',
  captain: userOne._id,
  members: [userOne._id, userTwo._id],
  statistics: {
    wins: 5,
    losses: 2,
    totalMatches: 7,
    totalScore: 350
  }
};

const teamTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Blue Team',
  color: 'blue',
  captain: userThree._id,
  members: [userThree._id],
  statistics: {
    wins: 3,
    losses: 4,
    totalMatches: 7,
    totalScore: 280
  }
};

// Function to insert teams into the database
const insertTeams = async (teams) => {
  const insertedTeams = [];
  for (const team of teams) {
    const dbTeam = await Team.create(team);
    insertedTeams.push(dbTeam);
  }
  return insertedTeams;
};

module.exports = {
  teamOne,
  teamTwo,
  insertTeams,
};
