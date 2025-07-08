const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { User } = require('../../src/models');
const { setupDatabase, teardownDatabase } = require('../fixtures/db');
const { getTestAuthHeader } = require('../fixtures/auth');

// Set up test database
beforeAll(async () => {
  await setupDatabase();
});

// Clean up after tests
afterAll(teardownDatabase);

describe('User Routes', () => {
  let userId;
  const newUser = {
    name: 'New Test User',
    email: 'new.test.user@example.com',
    password: 'Pass123!',
    role: 'user'
  };

  describe('POST /api/v1/users', () => {
    it('should create a new user when authenticated as admin', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', getTestAuthHeader())
        .send(newUser)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newUser.name);
      expect(res.body.email).toBe(newUser.email);
      expect(res.body).not.toHaveProperty('password');
      
      userId = res.body.id;
    });
    
    it('should not create a user with an existing email', async () => {
      await request(app)
        .post('/api/v1/users')
        .set('Authorization', getTestAuthHeader())
        .send(newUser)
        .expect(400);
    });
    
    it('should not create a user with invalid data', async () => {
      await request(app)
        .post('/api/v1/users')
        .set('Authorization', getTestAuthHeader())
        .send({
          name: 'Te', // too short
          email: 'invalid-email',
          password: 'short' // too short
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return a list of users with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalResults');
    });
    
    it('should filter users by name', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .query({ name: 'New Test' })
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0].name).toContain('New Test');
    });
    
    it('should sort users by name', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .query({ sortBy: 'name:asc' })
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      // Check that results are sorted alphabetically
      const names = res.body.results.map(user => user.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
    
    it('should limit users and paginate correctly', async () => {
      // Get first page with limit of 2
      const res1 = await request(app)
        .get('/api/v1/users')
        .query({ limit: 2, page: 1 })
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res1.body.results.length).toBeLessThanOrEqual(2);
      expect(res1.body.page).toBe(1);
      
      // Get second page
      const res2 = await request(app)
        .get('/api/v1/users')
        .query({ limit: 2, page: 2 })
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      // Different results on different pages
      if (res2.body.results.length > 0) {
        expect(res2.body.results[0].id).not.toBe(res1.body.results[0].id);
      }
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body.id).toBe(userId);
      expect(res.body.name).toBe(newUser.name);
      expect(res.body.email).toBe(newUser.email);
    });
    
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(404);
    });
    
    it('should return 400 for invalid user id', async () => {
      await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', getTestAuthHeader())
        .expect(400);
    });
  });

  describe('PATCH /api/v1/users/:userId', () => {
    it('should update user', async () => {
      const updateData = {
        name: 'Updated User Name'
      };
      
      const res = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', getTestAuthHeader())
        .send(updateData)
        .expect(200);
      
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.email).toBe(newUser.email); // Email should remain unchanged
    });
    
    it('should not update to an existing email', async () => {
      // First, create another user to have an existing email
      const anotherUser = {
        name: 'Another User',
        email: 'another.user@example.com',
        password: 'Pass123!'
      };
      
      const createRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', getTestAuthHeader())
        .send(anotherUser);
      
      // Try to update our test user with the email of another user
      await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', getTestAuthHeader())
        .send({ email: anotherUser.email })
        .expect(400);
    });
  });

  describe('GET /api/v1/users/:userId/stats', () => {
    it('should get user statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}/stats`)
        .set('Authorization', getTestAuthHeader())
        .expect(200);
      
      // Check stats structure
      expect(res.body).toHaveProperty('gamesPlayed');
      expect(res.body).toHaveProperty('gamesWon');
      expect(res.body).toHaveProperty('totalScore');
      expect(res.body).toHaveProperty('highScore');
      
      // For a new user, these should be zero or null
      expect(res.body.gamesPlayed).toBe(0);
      expect(res.body.gamesWon).toBe(0);
    });
  });

  describe('PATCH /api/v1/users/:userId/stats', () => {
    it('should update user statistics', async () => {
      const statUpdate = {
        gamesPlayed: 5,
        gamesWon: 2,
        totalScore: 1000,
        highScore: 300
      };
      
      const res = await request(app)
        .patch(`/api/v1/users/${userId}/stats`)
        .set('Authorization', getTestAuthHeader())
        .send(statUpdate)
        .expect(200);
      
      expect(res.body.stats.gamesPlayed).toBe(statUpdate.gamesPlayed);
      expect(res.body.stats.gamesWon).toBe(statUpdate.gamesWon);
      expect(res.body.stats.totalScore).toBe(statUpdate.totalScore);
      expect(res.body.stats.highScore).toBe(statUpdate.highScore);
    });
  });

  describe('DELETE /api/v1/users/:userId', () => {
    it('should delete user', async () => {
      await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(204);
      
      // Verify user is deleted
      await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', getTestAuthHeader())
        .expect(404);
    });
  });
});