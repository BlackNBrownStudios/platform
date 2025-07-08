const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../../src/models');

// Create test user objects - do NOT hash here (will be hashed in insertUsers)
const password = 'password123';
const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password,
  role: 'user',
  isEmailVerified: false,
  profilePicture: '',
  oauth: {
    provider: null,
    id: null,
    data: null,
  },
  statistics: {
    gamesPlayed: 10,
    gamesWon: 5,
    totalScore: 500,
    highScore: 150,
    throws: 30,
    catches: 20,
    hits: 15,
    dodges: 10
  }
};

const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Admin User',
  email: 'admin@example.com',
  password,
  role: 'admin',
  isEmailVerified: false,
  profilePicture: '',
  oauth: {
    provider: null,
    id: null,
    data: null,
  },
  statistics: {
    gamesPlayed: 5,
    gamesWon: 3,
    totalScore: 300,
    highScore: 100,
    throws: 15,
    catches: 10,
    hits: 8,
    dodges: 5
  }
};

const userThree = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Player One',
  email: 'player1@example.com',
  password,
  role: 'user',
  isEmailVerified: false,
  profilePicture: '',
  oauth: {
    provider: null,
    id: null,
    data: null,
  },
  statistics: {
    gamesPlayed: 15,
    gamesWon: 8,
    totalScore: 750,
    highScore: 200,
    throws: 45,
    catches: 30,
    hits: 20,
    dodges: 15
  }
};

// Function to insert users into the database
const insertUsers = async (users) => {
  const insertedUsers = [];
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 8);
    const dbUser = await User.create({
      ...user,
      password: hashedPassword,
    });
    insertedUsers.push(dbUser);
  }
  return insertedUsers;
};

module.exports = {
  userOne,
  userTwo,
  userThree,
  insertUsers,
  password,
};
