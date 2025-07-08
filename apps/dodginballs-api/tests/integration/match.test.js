const request = require('supertest');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../setup');
const { User, Team, Match } = require('../../src/models');
const { userOne, userTwo, userThree } = require('../fixtures/user.fixture');
const { teamOne, teamTwo } = require('../fixtures/team.fixture');
const { matchOne, matchTwo, matchThree } = require('../fixtures/match.fixture');

// Set up the test database
setupTestDB();

describe('Match routes', () => {
  let userOneAccessToken;
  let userTwoAccessToken;
  let userThreeAccessToken;

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
    
    // Get JWT tokens for testing authenticated routes
    const loginResponse1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserOne.email, password: 'Password123' });
    userOneAccessToken = loginResponse1.body.tokens.access.token;
    
    const loginResponse2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserTwo.email, password: 'Password123' });
    userTwoAccessToken = loginResponse2.body.tokens.access.token;
    
    const loginResponse3 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUserThree.email, password: 'Password123' });
    userThreeAccessToken = loginResponse3.body.tokens.access.token;
  });

  describe('POST /api/v1/matches', () => {
    test('should return 201 and successfully create a new match if data is valid', async () => {
      const newMatch = {
        court: 'Test Court',
        teams: [teamOne._id.toString(), teamTwo._id.toString()],
        gameMode: 'standard'
      };

      const res = await request(app)
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newMatch)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.court).toBe(newMatch.court);
      expect(res.body.teams).toHaveLength(2);
      expect(res.body.teams).toContain(teamOne._id.toString());
      expect(res.body.teams).toContain(teamTwo._id.toString());
      expect(res.body.gameMode).toBe(newMatch.gameMode);
      expect(res.body.matchState).toBe(0); // Pending state
    });

    test('should return 400 error if required fields are missing', async () => {
      const newMatch = {
        court: 'Test Court',
        // Missing teams field
        gameMode: 'standard'
      };

      await request(app)
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newMatch)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      const newMatch = {
        court: 'Test Court',
        teams: [teamOne._id.toString(), teamTwo._id.toString()],
        gameMode: 'standard'
      };

      await request(app)
        .post('/api/v1/matches')
        .send(newMatch)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/matches', () => {
    test('should return 200 and apply the default query options', async () => {
      const res = await request(app)
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.some(match => match.court === matchOne.court)).toBe(true);
      expect(res.body.results.some(match => match.court === matchTwo.court)).toBe(true);
    });

    test('should correctly apply filter on court field', async () => {
      const res = await request(app)
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ court: matchOne.court })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(match => match.court === matchOne.court)).toBe(true);
    });

    test('should correctly apply filter on gameMode field', async () => {
      const res = await request(app)
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ gameMode: matchTwo.gameMode })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(match => match.gameMode === matchTwo.gameMode)).toBe(true);
    });

    test('should correctly apply filter on matchState field', async () => {
      const res = await request(app)
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ matchState: matchOne.matchState })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(match => match.matchState === matchOne.matchState)).toBe(true);
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBe(1);
      expect(res.body.limit).toBe(1);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/matches')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/matches/:matchId', () => {
    test('should return 200 and the match object if data is valid', async () => {
      const res = await request(app)
        .get(`/api/v1/matches/${matchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.id).toBe(matchOne._id.toString());
      expect(res.body.court).toBe(matchOne.court);
      expect(res.body.gameMode).toBe(matchOne.gameMode);
      expect(res.body.matchState).toBe(matchOne.matchState);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/matches/${matchOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if matchId is not a valid ObjectId', async () => {
      await request(app)
        .get('/api/v1/matches/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if match is not found', async () => {
      await request(app)
        .get(`/api/v1/matches/${matchOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/matches/:matchId', () => {
    test('should return 200 and successfully update match if data is ok', async () => {
      const updateBody = {
        court: 'Updated Court',
        gameMode: 'tournament'
      };

      const res = await request(app)
        .patch(`/api/v1/matches/${matchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.id).toBe(matchOne._id.toString());
      expect(res.body.court).toBe(updateBody.court);
      expect(res.body.gameMode).toBe(updateBody.gameMode);

      const dbMatch = await Match.findById(matchOne._id);
      expect(dbMatch).toBeDefined();
      expect(dbMatch.court).toBe(updateBody.court);
      expect(dbMatch.gameMode).toBe(updateBody.gameMode);
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = { court: 'Updated Court' };

      await request(app)
        .patch(`/api/v1/matches/${matchOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have required permissions', async () => {
      const updateBody = { court: 'Updated Court' };

      await request(app)
        .patch(`/api/v1/matches/${matchOne._id}`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is a regular user
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if match is not found', async () => {
      const updateBody = { court: 'Updated Court' };

      await request(app)
        .patch(`/api/v1/matches/${matchOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/matches/:matchId', () => {
    test('should return 200 and successfully delete match', async () => {
      await request(app)
        .delete(`/api/v1/matches/${matchOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const dbMatch = await Match.findById(matchOne._id);
      expect(dbMatch).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/api/v1/matches/${matchOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have required permissions', async () => {
      await request(app)
        .delete(`/api/v1/matches/${matchOne._id}`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is a regular user
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if match is not found', async () => {
      await request(app)
        .delete(`/api/v1/matches/${matchOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /api/v1/matches/:matchId/start', () => {
    test('should return 200 and successfully start a match', async () => {
      // Create a pending match for testing
      const pendingMatch = await Match.create({
        court: 'Start Test Court',
        teams: [teamOne._id, teamTwo._id],
        gameMode: 'standard',
        matchState: 0 // Pending
      });

      const res = await request(app)
        .post(`/api/v1/matches/${pendingMatch._id}/start`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.matchState).toBe(1); // In progress
      expect(res.body.startedAt).toBeDefined();

      const dbMatch = await Match.findById(pendingMatch._id);
      expect(dbMatch.matchState).toBe(1);
      expect(dbMatch.startedAt).toBeDefined();
    });

    test('should return 400 if match is not in pending state', async () => {
      await request(app)
        .post(`/api/v1/matches/${matchOne._id}/start`) // matchOne is already completed
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .post(`/api/v1/matches/${matchOne._id}/start`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if match is not found', async () => {
      await request(app)
        .post(`/api/v1/matches/${matchOne._id.toString().replace(/\w/g, '5')}/start`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /api/v1/matches/:matchId/end', () => {
    test('should return 200 and successfully end a match', async () => {
      // Create an in-progress match for testing
      const inProgressMatch = await Match.create({
        court: 'End Test Court',
        teams: [teamOne._id, teamTwo._id],
        gameMode: 'standard',
        matchState: 1, // In progress
        startedAt: new Date()
      });

      const endMatchData = {
        winningTeamId: teamOne._id.toString(),
        matchStatistics: {
          totalThrows: 50,
          totalCatches: 30,
          totalHits: 20,
          totalDodges: 15
        }
      };

      const res = await request(app)
        .post(`/api/v1/matches/${inProgressMatch._id}/end`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(endMatchData)
        .expect(httpStatus.OK);

      expect(res.body.matchState).toBe(2); // Completed
      expect(res.body.endedAt).toBeDefined();
      expect(res.body.winningTeamId).toBe(teamOne._id.toString());
      expect(res.body.losingTeamId).toBe(teamTwo._id.toString());
      expect(res.body.matchStatistics).toMatchObject(endMatchData.matchStatistics);

      const dbMatch = await Match.findById(inProgressMatch._id);
      expect(dbMatch.matchState).toBe(2);
      expect(dbMatch.endedAt).toBeDefined();
      expect(dbMatch.winningTeamId.toString()).toBe(teamOne._id.toString());
      expect(dbMatch.losingTeamId.toString()).toBe(teamTwo._id.toString());
    });

    test('should return 400 if match is not in progress', async () => {
      const endMatchData = {
        winningTeamId: teamOne._id.toString()
      };

      await request(app)
        .post(`/api/v1/matches/${matchOne._id}/end`) // matchOne is already completed
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(endMatchData)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if winningTeamId is not provided', async () => {
      // Create an in-progress match for testing
      const inProgressMatch = await Match.create({
        court: 'End Test Court 2',
        teams: [teamOne._id, teamTwo._id],
        gameMode: 'standard',
        matchState: 1, // In progress
        startedAt: new Date()
      });

      await request(app)
        .post(`/api/v1/matches/${inProgressMatch._id}/end`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({}) // Missing winningTeamId
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      const endMatchData = {
        winningTeamId: teamOne._id.toString()
      };

      await request(app)
        .post(`/api/v1/matches/${matchOne._id}/end`)
        .send(endMatchData)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if match is not found', async () => {
      const endMatchData = {
        winningTeamId: teamOne._id.toString()
      };

      await request(app)
        .post(`/api/v1/matches/${matchOne._id.toString().replace(/\w/g, '5')}/end`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(endMatchData)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/v1/matches/:matchId/statistics', () => {
    test('should return 200 and match statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/matches/${matchOne._id}/statistics`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('totalThrows');
      expect(res.body).toHaveProperty('totalCatches');
      expect(res.body).toHaveProperty('totalHits');
      expect(res.body).toHaveProperty('totalDodges');
      expect(res.body).toHaveProperty('matchDuration');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/matches/${matchOne._id}/statistics`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if match is not found', async () => {
      await request(app)
        .get(`/api/v1/matches/${matchOne._id.toString().replace(/\w/g, '5')}/statistics`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
