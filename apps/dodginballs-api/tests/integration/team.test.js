const request = require('supertest');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../setup');
const { User, Team } = require('../../src/models');
const { userOne, userTwo, userThree } = require('../fixtures/user.fixture');
const { teamOne, teamTwo } = require('../fixtures/team.fixture');

// Set up the test database
setupTestDB();

describe('Team routes', () => {
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

  describe('POST /api/v1/teams', () => {
    test('should return 201 and successfully create a new team if data is valid', async () => {
      const newTeam = {
        name: 'New Test Team',
        color: 'green',
        userIds: [userOne._id.toString()]
      };

      const res = await request(app)
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTeam)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newTeam.name);
      expect(res.body.color).toBe(newTeam.color);
      expect(res.body.captain).toBe(userOne._id.toString());
      expect(res.body.members).toContain(userOne._id.toString());
    });

    test('should return 400 error if required fields are missing', async () => {
      const newTeam = {
        // Missing name field
        color: 'green'
      };

      await request(app)
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTeam)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      const newTeam = {
        name: 'New Test Team',
        color: 'green'
      };

      await request(app)
        .post('/api/v1/teams')
        .send(newTeam)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/teams', () => {
    test('should return 200 and apply the default query options', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.some(team => team.name === teamOne.name)).toBe(true);
      expect(res.body.results.some(team => team.name === teamTwo.name)).toBe(true);
    });

    test('should correctly apply filter on name field', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ name: teamOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results.every(team => team.name === teamOne.name)).toBe(true);
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body.results.length).toBe(1);
      expect(res.body.limit).toBe(1);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get('/api/v1/teams')
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/teams/:teamId', () => {
    test('should return 200 and the team object if data is valid', async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${teamOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.id).toBe(teamOne._id.toString());
      expect(res.body.name).toBe(teamOne.name);
      expect(res.body.color).toBe(teamOne.color);
      expect(res.body.captain).toBe(teamOne.captain.toString());
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/teams/${teamOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if teamId is not a valid ObjectId', async () => {
      await request(app)
        .get('/api/v1/teams/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if team is not found', async () => {
      await request(app)
        .get(`/api/v1/teams/${teamOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/teams/:teamId', () => {
    test('should return 200 and successfully update team if data is ok', async () => {
      const updateBody = {
        name: 'Updated Team Name',
        color: 'purple'
      };

      const res = await request(app)
        .patch(`/api/v1/teams/${teamOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.id).toBe(teamOne._id.toString());
      expect(res.body.name).toBe(updateBody.name);
      expect(res.body.color).toBe(updateBody.color);

      const dbTeam = await Team.findById(teamOne._id);
      expect(dbTeam).toBeDefined();
      expect(dbTeam.name).toBe(updateBody.name);
      expect(dbTeam.color).toBe(updateBody.color);
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = { name: 'Updated Team Name' };

      await request(app)
        .patch(`/api/v1/teams/${teamOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have required permissions', async () => {
      const updateBody = { name: 'Updated Team Name' };

      await request(app)
        .patch(`/api/v1/teams/${teamOne._id}`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is not a team member or admin
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if team is not found', async () => {
      const updateBody = { name: 'Updated Team Name' };

      await request(app)
        .patch(`/api/v1/teams/${teamOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/teams/:teamId', () => {
    test('should return 200 and successfully delete team', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const dbTeam = await Team.findById(teamOne._id);
      expect(dbTeam).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user does not have required permissions', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id}`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is not a team captain or admin
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if team is not found', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id.toString().replace(/\w/g, '5')}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /api/v1/teams/:teamId/members', () => {
    test('should return 200 and successfully add a member to the team', async () => {
      // Create a new team for testing
      const newTeam = await Team.create({
        name: 'Member Test Team',
        color: 'yellow',
        captain: userOne._id,
        members: [userOne._id]
      });

      const addMemberBody = {
        userId: userThree._id.toString()
      };

      const res = await request(app)
        .post(`/api/v1/teams/${newTeam._id}/members`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(addMemberBody)
        .expect(httpStatus.OK);

      expect(res.body.members).toContain(userThree._id.toString());

      const dbTeam = await Team.findById(newTeam._id);
      expect(dbTeam.members).toContainEqual(userThree._id);
    });

    test('should return 400 if user is already a team member', async () => {
      const addMemberBody = {
        userId: userOne._id.toString() // userOne is already in teamOne
      };

      await request(app)
        .post(`/api/v1/teams/${teamOne._id}/members`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(addMemberBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      const addMemberBody = {
        userId: userThree._id.toString()
      };

      await request(app)
        .post(`/api/v1/teams/${teamOne._id}/members`)
        .send(addMemberBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user does not have required permissions', async () => {
      const addMemberBody = {
        userId: userThree._id.toString()
      };

      await request(app)
        .post(`/api/v1/teams/${teamOne._id}/members`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is not a team captain or admin
        .send(addMemberBody)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /api/v1/teams/:teamId/members/:userId', () => {
    test('should return 200 and successfully remove a member from the team', async () => {
      const res = await request(app)
        .delete(`/api/v1/teams/${teamOne._id}/members/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.members).not.toContain(userTwo._id.toString());

      const dbTeam = await Team.findById(teamOne._id);
      expect(dbTeam.members).not.toContainEqual(userTwo._id);
    });

    test('should return 400 if user is not a team member', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id}/members/${userThree._id}`) // userThree is not in teamOne
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id}/members/${userTwo._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user does not have required permissions', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamOne._id}/members/${userTwo._id}`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is not a team captain or admin
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /api/v1/teams/:teamId/stats', () => {
    test('should return 200 and team statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${teamOne._id}/stats`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('wins');
      expect(res.body).toHaveProperty('losses');
      expect(res.body).toHaveProperty('totalMatches');
      expect(res.body).toHaveProperty('totalScore');
      
      expect(res.body.wins).toBe(teamOne.statistics.wins);
      expect(res.body.losses).toBe(teamOne.statistics.losses);
      expect(res.body.totalMatches).toBe(teamOne.statistics.totalMatches);
      expect(res.body.totalScore).toBe(teamOne.statistics.totalScore);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app)
        .get(`/api/v1/teams/${teamOne._id}/stats`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if team is not found', async () => {
      await request(app)
        .get(`/api/v1/teams/${teamOne._id.toString().replace(/\w/g, '5')}/stats`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/teams/:teamId/stats', () => {
    test('should return 200 and successfully update team statistics', async () => {
      const updateStatsBody = {
        wins: 10,
        losses: 5,
        totalMatches: 15,
        totalScore: 500
      };

      const res = await request(app)
        .patch(`/api/v1/teams/${teamOne._id}/stats`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateStatsBody)
        .expect(httpStatus.OK);

      expect(res.body.statistics.wins).toBe(updateStatsBody.wins);
      expect(res.body.statistics.losses).toBe(updateStatsBody.losses);
      expect(res.body.statistics.totalMatches).toBe(updateStatsBody.totalMatches);
      expect(res.body.statistics.totalScore).toBe(updateStatsBody.totalScore);

      const dbTeam = await Team.findById(teamOne._id);
      expect(dbTeam.statistics.wins).toBe(updateStatsBody.wins);
      expect(dbTeam.statistics.losses).toBe(updateStatsBody.losses);
      expect(dbTeam.statistics.totalMatches).toBe(updateStatsBody.totalMatches);
      expect(dbTeam.statistics.totalScore).toBe(updateStatsBody.totalScore);
    });

    test('should return 401 if access token is missing', async () => {
      const updateStatsBody = {
        wins: 10,
        losses: 5
      };

      await request(app)
        .patch(`/api/v1/teams/${teamOne._id}/stats`)
        .send(updateStatsBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user does not have required permissions', async () => {
      const updateStatsBody = {
        wins: 10,
        losses: 5
      };

      await request(app)
        .patch(`/api/v1/teams/${teamOne._id}/stats`)
        .set('Authorization', `Bearer ${userThreeAccessToken}`) // userThree is not an admin
        .send(updateStatsBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if team is not found', async () => {
      const updateStatsBody = {
        wins: 10,
        losses: 5
      };

      await request(app)
        .patch(`/api/v1/teams/${teamOne._id.toString().replace(/\w/g, '5')}/stats`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateStatsBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
