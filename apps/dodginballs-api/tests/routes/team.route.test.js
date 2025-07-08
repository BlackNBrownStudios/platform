const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { Team, User } = require('../../src/models');
const { setupDatabase, teardownDatabase } = require('../fixtures/db');
const { getTestAuthHeader } = require('../fixtures/auth');

// Set up test database
beforeAll(async () => {
  await setupDatabase();
});

// Clean up after tests
afterAll(teardownDatabase);

describe('Team Routes', () => {
  let teamId;
  const newTeam = {
    name: 'Test Dream Team',
    color: '#FF5733',
    userIds: []
  };

  // Create a test user to add to the team
  let testUserId;
  beforeAll(async () => {
    const user = await User.create({
      name: 'Team Test User',
      email: 'team.test.user@example.com',
      password: 'Pass123!'
    });
    testUserId = user._id.toString();
    newTeam.userIds.push(testUserId);
  });

  describe('POST /api/v1/teams', () => {
    it('should create a new team', async () => {
      const res = await request(app)
        .post('/api/v1/teams')
        .set('Authorization', getTestAuthHeader())
        .send(newTeam)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newTeam.name);
      expect(res.body.color).toBe(newTeam.color);
      expect(res.body.members).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: testUserId })
      ]));
      
      teamId = res.body.id;
    });
    
    it('should not create a team without required fields', async () => {
      await request(app)
        .post('/api/v1/teams')
        .set('Authorization', getTestAuthHeader())
        .send({
          // Missing name and color
          userIds: [testUserId]
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/teams', () => {
    it('should return a list of teams with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
      
      // Our newly created team should be in the results
      expect(res.body.results.some(team => team.id === teamId)).toBe(true);
    });
    
    it('should filter teams by name', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
        .query({ name: 'Dream' })
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0].name).toContain('Dream');
    });
    
    it('should sort teams by name', async () => {
      const res = await request(app)
        .get('/api/v1/teams')
        .query({ sortBy: 'name:asc' })
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      // Check that results are sorted alphabetically
      const names = res.body.results.map(team => team.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('GET /api/v1/teams/:teamId', () => {
    it('should get team by id', async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${teamId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body.id).toBe(teamId);
      expect(res.body.name).toBe(newTeam.name);
      expect(res.body.color).toBe(newTeam.color);
    });
    
    it('should return 404 for non-existent team', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/teams/${nonExistentId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(404);
    });
    
    it('should return 400 for invalid team id', async () => {
      await request(app)
        .get('/api/v1/teams/invalid-id')
        .set('Authorization', getTestAuthHeader())
        .expect(400);
    });
  });

  describe('PATCH /api/v1/teams/:teamId', () => {
    it('should update team', async () => {
      const updateData = {
        name: 'Updated Team Name',
        color: '#00FF00'
      };
      
      const res = await request(app)
        .patch(`/api/v1/teams/${teamId}`)
        .set('Authorization', getTestAuthHeader())
        .send(updateData)
        .expect(200);
      
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.color).toBe(updateData.color);
    });
  });

  describe('POST /api/v1/teams/:teamId/members', () => {
    let newMemberId;
    
    beforeAll(async () => {
      // Create another user to add to the team
      const user = await User.create({
        name: 'Team Member Test',
        email: 'team.member@example.com',
        password: 'Pass123!'
      });
      newMemberId = user._id.toString();
    });
    
    it('should add a member to the team', async () => {
      const res = await request(app)
        .post(`/api/v1/teams/${teamId}/members`)
        .set('Authorization', getTestAuthHeader())
        .send({ userId: newMemberId })
        .expect(200);
      
      // Check that the member was added
      expect(res.body.members.some(member => member.id === newMemberId)).toBe(true);
    });
    
    it('should not add a member that is already in the team', async () => {
      await request(app)
        .post(`/api/v1/teams/${teamId}/members`)
        .set('Authorization', getTestAuthHeader())
        .send({ userId: newMemberId })
        .expect(400);
    });
    
    it('should not add a non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/api/v1/teams/${teamId}/members`)
        .set('Authorization', getTestAuthHeader())
        .send({ userId: nonExistentId })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/teams/:teamId/members', () => {
    it('should remove a member from the team', async () => {
      const res = await request(app)
        .delete(`/api/v1/teams/${teamId}/members`)
        .set('Authorization', getTestAuthHeader())
        .send({ userId: testUserId })
        .expect(200);
      
      // Check that the member was removed
      expect(res.body.members.some(member => member.id === testUserId)).toBe(false);
    });
    
    it('should not remove a member that is not in the team', async () => {
      // Create another user that's not in the team
      const user = await User.create({
        name: 'Not Team Member',
        email: 'not.team.member@example.com',
        password: 'Pass123!'
      });
      
      await request(app)
        .delete(`/api/v1/teams/${teamId}/members`)
        .set('Authorization', getTestAuthHeader())
        .send({ userId: user._id.toString() })
        .expect(400);
    });
  });

  describe('GET /api/v1/teams/:teamId/stats', () => {
    it('should get team statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/teams/${teamId}/stats`)
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      // Check stats structure
      expect(res.body).toHaveProperty('wins');
      expect(res.body).toHaveProperty('losses');
      expect(res.body).toHaveProperty('totalMatches');
      expect(res.body).toHaveProperty('totalScore');
    });
  });

  describe('PATCH /api/v1/teams/:teamId/stats', () => {
    it('should update team statistics', async () => {
      const statUpdate = {
        wins: 5,
        losses: 2,
        totalMatches: 7,
        totalScore: 1500
      };
      
      const res = await request(app)
        .patch(`/api/v1/teams/${teamId}/stats`)
        .set('Authorization', getTestAuthHeader())
        .send(statUpdate)
        .expect(200);
      
      expect(res.body.stats.wins).toBe(statUpdate.wins);
      expect(res.body.stats.losses).toBe(statUpdate.losses);
      expect(res.body.stats.totalMatches).toBe(statUpdate.totalMatches);
      expect(res.body.stats.totalScore).toBe(statUpdate.totalScore);
    });
  });

  describe('DELETE /api/v1/teams/:teamId', () => {
    it('should delete team', async () => {
      await request(app)
        .delete(`/api/v1/teams/${teamId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(204);
      
      // Verify team is deleted
      await request(app)
        .get(`/api/v1/teams/${teamId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(404);
    });
  });
});