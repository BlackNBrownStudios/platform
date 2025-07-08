const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../setup');
const { User } = require('../../src/models');
const { userOne, insertUsers, password } = require('../fixtures/user.fixture');

// Set up the test database
setupTestDB();

describe('Auth routes', () => {
  describe('POST /api/v1/auth/register', () => {
    let newUser;
    
    beforeEach(() => {
      newUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123',
      };
    });

    test('should return 201 and successfully register user if request data is valid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.CREATED);

      // Check basic user info - don't test all fields as some may change
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user.name).toBe(newUser.name);
      expect(res.body.user.email).toBe(newUser.email);
      expect(res.body.user.role).toBe('user');

      // Check that tokens are generated correctly
      expect(res.body.tokens).toEqual({
        access: {
          token: expect.anything(),
          expires: expect.anything(),
        },
        refresh: {
          token: expect.anything(),
          expires: expect.anything(),
        },
      });
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password is less than 8 characters', async () => {
      newUser.password = 'passwo';

      await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      // Create a new user with a known password directly in the test
      const testPassword = 'Password123';
      const testUser = {
        name: 'Auth Test User',
        email: 'auth-test@example.com',
        password: testPassword,
        role: 'user',
      };
      await User.create(testUser);

      const loginCredentials = {
        email: testUser.email,
        password: testPassword,
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.OK);

      // Check basic user info
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe(testUser.role);

      // Check tokens
      expect(res.body.tokens).toEqual({
        access: {
          token: expect.anything(),
          expires: expect.anything(),
        },
        refresh: {
          token: expect.anything(),
          expires: expect.anything(),
        },
      });
    });

    test('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: 'nonexistent@example.com',
        password: password,
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.code).toBe(httpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Incorrect email or password');
    });

    test('should return 401 error if password is wrong', async () => {
      // Create a new user with a known password directly in the test
      const testUser = {
        name: 'Wrong Password Test User',
        email: 'wrong-password@example.com',
        password: 'Password123',
        role: 'user',
      };
      await User.create(testUser);

      const loginCredentials = {
        email: testUser.email,
        password: 'wrongPassword',
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.code).toBe(httpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Incorrect email or password');
    });
  });
});
