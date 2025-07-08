const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../setup');
const { User } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');

// Set up the test database
setupTestDB();

describe('User routes', () => {
  let userOneAccessToken;
  let userTwoAccessToken;

  beforeEach(async () => {
    // Create fresh test users for each test - make both admin for permissions
    const testUserOne = {
      _id: userOne._id,
      name: userOne.name,
      email: userOne.email,
      password: 'Password123',
      role: 'admin', // Change to admin for permissions
      statistics: userOne.statistics
    };

    const testUserTwo = {
      _id: userTwo._id,
      name: userTwo.name,
      email: userTwo.email,
      password: 'Password123',
      role: 'admin', // Change to admin for permissions
      statistics: userTwo.statistics
    };

    await User.create(testUserOne);
    await User.create(testUserTwo);
    
    // Get JWT tokens for testing authenticated routes
    const loginResponse1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserOne.email, password: 'Password123' });
    userOneAccessToken = loginResponse1.body.tokens.access.token;
    
    const loginResponse2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserTwo.email, password: 'Password123' });
    userTwoAccessToken = loginResponse2.body.tokens.access.token;
  });

  describe('GET /api/v1/users', () => {
    test('should return 200 and apply the default query options', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.some(user => user.email === userOne.email)).toBe(true);
      expect(res.body.results.some(user => user.email === userTwo.email)).toBe(true);
    });

    test('should correctly apply filter on name field', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ name: userOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(user => user.name === userOne.name)).toBe(true);
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBe(1);
      expect(res.body.limit).toBe(1);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/users')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    test('should return 200 and the user object if data is valid', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body.id).toBe(userOne._id.toString());
      expect(res.body.email).toBe(userOne.email);
      expect(res.body.name).toBe(userOne.name);
      expect(res.body.role).toBe('admin');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/users/${userOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if userId is not a valid ObjectId', async () => {
      await request(app)
        .get('/api/v1/users/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await request(app)
        .get(`/api/v1/users/${userOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/v1/users/profile', () => {
    test('should return 200 and the user profile when accessing own profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body.id).toBe(userOne._id.toString());
      expect(res.body.email).toBe(userOne.email);
      expect(res.body.name).toBe(userOne.name);
      expect(res.body.role).toBe('admin');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get('/api/v1/users/profile')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/v1/users/profile', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      const updateBody = {
        name: 'Updated Name',
      };

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body.id).toBe(userOne._id.toString());
      expect(res.body.name).toBe(updateBody.name);
      expect(res.body.email).toBe(userOne.email);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.name).toEqual(updateBody.name);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .patch('/api/v1/users/profile')
        .send({ name: 'Updated Name' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/users/:userId/stats', () => {
    test('should return 200 and user statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userOne._id}/stats`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('statistics');
      expect(res.body.statistics).toHaveProperty('gamesPlayed');
      expect(res.body.statistics).toHaveProperty('gamesWon');
      expect(res.body.statistics).toHaveProperty('totalScore');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/users/${userOne._id}/stats`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
