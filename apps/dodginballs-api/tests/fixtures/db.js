// Utility to load fixtures into MongoDB for tests
const mongoose = require('mongoose');
const { User, Team, Match } = require('../../src/models');
const users = require('./users.json');
const teams = require('./teams.json');
const matches = require('./matches.json');

const setupDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/dodginballs-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await User.deleteMany();
  await Team.deleteMany();
  await Match.deleteMany();
  await User.insertMany(users);
  await Team.insertMany(teams);
  await Match.insertMany(matches);
};

const teardownDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

module.exports = {
  setupDatabase,
  teardownDatabase,
};
