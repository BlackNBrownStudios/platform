// Generates a JWT for test users (valid for 1 day)
const jwt = require('jsonwebtoken');

const TEST_USER_ID = '507f191e810c19729de860ea'; // Alice
const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

function getTestAuthHeader() {
  const token = jwt.sign(
    { sub: TEST_USER_ID, type: 'access' },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return `Bearer ${token}`;
}

module.exports = { getTestAuthHeader };
