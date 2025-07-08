const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Game = require('../src/models/Game');
const setupTestDB = require('./setupTestDB');

setupTestDB();

describe('Leaderboard Endpoints', () => {
  let users = [];
  let authTokens = [];

  beforeEach(async () => {
    // Create test users with scores
    const testUsers = [
      { username: 'player1', email: 'player1@test.com', totalScore: 1000, gamesPlayed: 10 },
      { username: 'player2', email: 'player2@test.com', totalScore: 1500, gamesPlayed: 15 },
      { username: 'player3', email: 'player3@test.com', totalScore: 800, gamesPlayed: 8 },
      { username: 'player4', email: 'player4@test.com', totalScore: 2000, gamesPlayed: 20 },
      { username: 'player5', email: 'player5@test.com', totalScore: 500, gamesPlayed: 5 },
    ];

    users = [];
    authTokens = [];

    for (const userData of testUsers) {
      const user = await User.create({
        ...userData,
        password: 'Password123!',
      });
      users.push(user);

      // Login to get auth token
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        username: userData.username,
        password: 'Password123!',
      });
      authTokens.push(loginRes.body.token);

      // Create some game records
      for (let i = 0; i < 3; i++) {
        await Game.create({
          user: user._id,
          score: Math.floor(userData.totalScore / 3),
          duration: 300 + i * 60,
          accuracy: 75 + i * 5,
          difficulty: ['easy', 'medium', 'hard'][i],
          completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        });
      }
    }
  });

  describe('GET /api/v1/leaderboard', () => {
    it('should get global leaderboard sorted by score', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
      expect(res.body.leaderboard.length).toBe(5);

      // Check sorting
      expect(res.body.leaderboard[0].username).toBe('player4');
      expect(res.body.leaderboard[0].totalScore).toBe(2000);
      expect(res.body.leaderboard[1].username).toBe('player2');
      expect(res.body.leaderboard[4].username).toBe('player5');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard?page=1&limit=2')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.leaderboard.length).toBe(2);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 3,
        totalItems: 5,
        itemsPerPage: 2,
      });
    });

    it('should filter by time period - weekly', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard?period=week')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body).toHaveProperty('period', 'week');
    });

    it('should filter by time period - monthly', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard?period=month')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body).toHaveProperty('period', 'month');
    });

    it('should filter by difficulty', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard?difficulty=hard')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body).toHaveProperty('difficulty', 'hard');
    });

    it('should include user rank in response', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard')
        .set('Authorization', `Bearer ${authTokens[1]}`); // player2

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('userRank');
      expect(res.body.userRank).toBe(2); // player2 is second
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/v1/leaderboard');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/leaderboard/friends', () => {
    beforeEach(async () => {
      // Add friend relationships
      users[0].friends = [users[1]._id, users[2]._id];
      await users[0].save();
    });

    it('should get friends leaderboard', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/friends')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body.leaderboard.length).toBe(3); // self + 2 friends

      const usernames = res.body.leaderboard.map((u) => u.username);
      expect(usernames).toContain('player1');
      expect(usernames).toContain('player2');
      expect(usernames).toContain('player3');
    });

    it('should return only self if no friends', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/friends')
        .set('Authorization', `Bearer ${authTokens[4]}`); // player5 has no friends

      expect(res.statusCode).toBe(200);
      expect(res.body.leaderboard.length).toBe(1);
      expect(res.body.leaderboard[0].username).toBe('player5');
    });
  });

  describe('GET /api/v1/leaderboard/nearby', () => {
    it('should get nearby players in ranking', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/nearby?range=2')
        .set('Authorization', `Bearer ${authTokens[2]}`); // player3 is ranked 4th

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body.leaderboard.length).toBeLessThanOrEqual(5); // ±2 players

      const usernames = res.body.leaderboard.map((u) => u.username);
      expect(usernames).toContain('player3');
    });

    it('should handle edge cases for top players', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/nearby?range=3')
        .set('Authorization', `Bearer ${authTokens[3]}`); // player4 is #1

      expect(res.statusCode).toBe(200);
      expect(res.body.leaderboard[0].username).toBe('player4');
    });
  });

  describe('GET /api/v1/leaderboard/stats', () => {
    it('should get leaderboard statistics', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/stats')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body.stats).toHaveProperty('totalPlayers', 5);
      expect(res.body.stats).toHaveProperty('averageScore');
      expect(res.body.stats).toHaveProperty('topScore', 2000);
      expect(res.body.stats).toHaveProperty('distribution');
    });
  });

  describe('POST /api/v1/leaderboard/reset', () => {
    it('should reset leaderboard (admin only)', async () => {
      // Make user[0] an admin
      users[0].role = 'admin';
      await users[0].save();

      const res = await request(app)
        .post('/api/v1/leaderboard/reset')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .send({ period: 'weekly' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail for non-admin users', async () => {
      const res = await request(app)
        .post('/api/v1/leaderboard/reset')
        .set('Authorization', `Bearer ${authTokens[1]}`)
        .send({ period: 'weekly' });

      expect(res.statusCode).toBe(403);
    });
  });
});
