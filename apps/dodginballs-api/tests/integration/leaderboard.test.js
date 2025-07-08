const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../setup');
const { User, Team, Match } = require('../../src/models');
const { userOne, userTwo, userThree } = require('../fixtures/user.fixture');
const { teamOne, teamTwo } = require('../fixtures/team.fixture');
const { matchOne, matchTwo } = require('../fixtures/match.fixture');

// Set up the test database
setupTestDB();

describe('Leaderboard routes', () => {
  let userOneAccessToken;

  beforeEach(async () => {
    // Create test users with known passwords
    const testUserOne = {
      _id: userOne._id,
      name: userOne.name,
      email: userOne.email,
      password: 'Password123',
      role: 'admin', // Use admin role for permissions
      statistics: userOne.statistics
    };

    const testUserTwo = {
      _id: userTwo._id,
      name: userTwo.name,
      email: userTwo.email,
      password: 'Password123',
      role: 'admin', // Use admin role for permissions
      statistics: userTwo.statistics
    };

    const testUserThree = {
      _id: userThree._id,
      name: userThree.name,
      email: userThree.email,
      password: 'Password123',
      role: 'user',
      statistics: userThree.statistics
    };

    await User.create(testUserOne);
    await User.create(testUserTwo);
    await User.create(testUserThree);
    await Team.create(teamOne);
    await Team.create(teamTwo);
    await Match.create(matchOne);
    await Match.create(matchTwo);
    
    // Get JWT token for testing authenticated routes
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserOne.email, password: 'Password123' });
    
    userOneAccessToken = loginResponse.body.tokens.access.token;
  });

  describe('GET /api/v1/leaderboard/users', () => {
    test('should return 200 and user leaderboard data', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0]).toHaveProperty('name');
      expect(res.body.results[0]).toHaveProperty('statistics');
    });

    test('should return paginated results', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1, page: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBe(1);
      expect(res.body.limit).toBe(1);
      expect(res.body.page).toBe(1);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/leaderboard/users')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/leaderboard/teams', () => {
    test('should return 200 and team leaderboard data', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0]).toHaveProperty('name');
      expect(res.body.results[0]).toHaveProperty('wins');
      expect(res.body.results[0]).toHaveProperty('losses');
    });

    test('should return paginated results', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1, page: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBe(1);
      expect(res.body.limit).toBe(1);
      expect(res.body.page).toBe(1);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/leaderboard/teams')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/leaderboard/matches', () => {
    test('should return 200 and recent match data', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0]).toHaveProperty('date');
      expect(res.body.results[0]).toHaveProperty('teams');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/leaderboard/matches')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/leaderboard/global', () => {
    test('should return 200 and global statistics', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/global')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('totalMatches');
      expect(res.body).toHaveProperty('totalPlayers');
      expect(res.body).toHaveProperty('totalTeams');
      expect(res.body).toHaveProperty('topScorer');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/leaderboard/global')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
