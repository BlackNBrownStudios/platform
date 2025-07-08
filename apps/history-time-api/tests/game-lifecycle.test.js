const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Game = require('../src/models/Game');
const Card = require('../src/models/Card');
const setupTestDB = require('./setupTestDB');

setupTestDB();

describe('Game Lifecycle Endpoints', () => {
  let authToken;
  let userId;
  let testCards;

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      username: 'gametestuser',
      email: 'gametest@example.com',
      password: 'Password123!',
    });
    userId = user._id;

    // Login to get token
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      username: 'gametestuser',
      password: 'Password123!',
    });
    authToken = loginRes.body.token;

    // Create test cards
    testCards = await Card.insertMany([
      {
        event: 'World War II Begins',
        date: new Date('1939-09-01'),
        category: 'war',
        difficulty: 'easy',
        description: 'Germany invades Poland',
        image: 'ww2.jpg',
      },
      {
        event: 'Moon Landing',
        date: new Date('1969-07-20'),
        category: 'science',
        difficulty: 'easy',
        description: 'First humans land on the moon',
        image: 'moon.jpg',
      },
      {
        event: 'Fall of Berlin Wall',
        date: new Date('1989-11-09'),
        category: 'politics',
        difficulty: 'medium',
        description: 'Berlin Wall comes down',
        image: 'berlin.jpg',
      },
      {
        event: 'Renaissance Begins',
        date: new Date('1350-01-01'),
        category: 'culture',
        difficulty: 'hard',
        description: 'Cultural rebirth in Europe',
        image: 'renaissance.jpg',
      },
    ]);
  });

  describe('POST /api/v1/games/start', () => {
    it('should start a new game successfully', async () => {
      const res = await request(app)
        .post('/api/v1/games/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          difficulty: 'easy',
          categories: ['war', 'science'],
          timeLimit: 600,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('game');
      expect(res.body.game).toHaveProperty('_id');
      expect(res.body.game).toHaveProperty('status', 'active');
      expect(res.body.game).toHaveProperty('cards');
      expect(Array.isArray(res.body.game.cards)).toBe(true);
      expect(res.body.game.cards.length).toBeGreaterThan(0);
    });

    it('should filter cards by category', async () => {
      const res = await request(app)
        .post('/api/v1/games/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categories: ['science'],
        });

      expect(res.statusCode).toBe(201);
      const cardCategories = res.body.game.cards.map((c) => c.category);
      expect(cardCategories.every((cat) => cat === 'science')).toBe(true);
    });

    it('should filter cards by difficulty', async () => {
      const res = await request(app)
        .post('/api/v1/games/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          difficulty: 'easy',
        });

      expect(res.statusCode).toBe(201);
      const cardDifficulties = res.body.game.cards.map((c) => c.difficulty);
      expect(cardDifficulties.every((diff) => diff === 'easy')).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post('/api/v1/games/start').send({
        difficulty: 'easy',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should validate input parameters', async () => {
      const res = await request(app)
        .post('/api/v1/games/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          difficulty: 'invalid-difficulty',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/games/:gameId', () => {
    let gameId;

    beforeEach(async () => {
      const game = await Game.create({
        user: userId,
        cards: testCards.map((c) => c._id),
        difficulty: 'easy',
        status: 'active',
      });
      gameId = game._id;
    });

    it('should get game details', async () => {
      const res = await request(app)
        .get(`/api/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', gameId.toString());
      expect(res.body).toHaveProperty('status', 'active');
      expect(res.body).toHaveProperty('cards');
    });

    it('should not allow access to other users games', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Password123!',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        username: 'otheruser',
        password: 'Password123!',
      });

      const res = await request(app)
        .get(`/api/v1/games/${gameId}`)
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/v1/games/:gameId/submit', () => {
    let gameId;

    beforeEach(async () => {
      const game = await Game.create({
        user: userId,
        cards: testCards.slice(0, 2).map((c) => c._id),
        difficulty: 'easy',
        status: 'active',
        startTime: new Date(),
      });
      gameId = game._id;
    });

    it('should submit game answers successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { cardId: testCards[0]._id, placedDate: '1939-09-01' },
            { cardId: testCards[1]._id, placedDate: '1969-07-20' },
          ],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('game');
      expect(res.body.game).toHaveProperty('status', 'completed');
      expect(res.body.game).toHaveProperty('score');
      expect(res.body.game).toHaveProperty('accuracy');
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    it('should calculate score correctly', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { cardId: testCards[0]._id, placedDate: '1939-09-01' }, // Correct
            { cardId: testCards[1]._id, placedDate: '1970-07-20' }, // Wrong year
          ],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.game.accuracy).toBe(50); // 1 out of 2 correct
      expect(res.body.results[0].correct).toBe(true);
      expect(res.body.results[1].correct).toBe(false);
    });

    it('should not allow resubmission', async () => {
      // First submission
      await request(app)
        .post(`/api/v1/games/${gameId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { cardId: testCards[0]._id, placedDate: '1939-09-01' },
            { cardId: testCards[1]._id, placedDate: '1969-07-20' },
          ],
        });

      // Second submission
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { cardId: testCards[0]._id, placedDate: '1940-09-01' },
            { cardId: testCards[1]._id, placedDate: '1969-07-20' },
          ],
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate answer format', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { cardId: testCards[0]._id }, // Missing placedDate
          ],
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/games/:gameId/quit', () => {
    let gameId;

    beforeEach(async () => {
      const game = await Game.create({
        user: userId,
        cards: testCards.map((c) => c._id),
        difficulty: 'easy',
        status: 'active',
      });
      gameId = game._id;
    });

    it('should quit game successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/games/${gameId}/quit`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('game');
      expect(res.body.game.status).toBe('quit');
    });

    it('should not affect user stats when quitting', async () => {
      const beforeStats = await User.findById(userId);
      const gamesPlayedBefore = beforeStats.gamesPlayed;

      await request(app)
        .post(`/api/v1/games/${gameId}/quit`)
        .set('Authorization', `Bearer ${authToken}`);

      const afterStats = await User.findById(userId);
      expect(afterStats.gamesPlayed).toBe(gamesPlayedBefore);
    });
  });

  describe('GET /api/v1/games/history', () => {
    beforeEach(async () => {
      // Create multiple completed games
      const games = [];
      for (let i = 0; i < 5; i++) {
        games.push({
          user: userId,
          cards: testCards.map((c) => c._id),
          difficulty: ['easy', 'medium', 'hard'][i % 3],
          status: 'completed',
          score: 100 + i * 10,
          accuracy: 70 + i * 5,
          completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        });
      }
      await Game.insertMany(games);
    });

    it('should get user game history', async () => {
      const res = await request(app)
        .get('/api/v1/games/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('games');
      expect(Array.isArray(res.body.games)).toBe(true);
      expect(res.body.games.length).toBe(5);
      expect(res.body).toHaveProperty('stats');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/games/history?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.games.length).toBe(2);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should filter by difficulty', async () => {
      const res = await request(app)
        .get('/api/v1/games/history?difficulty=easy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      const difficulties = res.body.games.map((g) => g.difficulty);
      expect(difficulties.every((d) => d === 'easy')).toBe(true);
    });

    it('should sort by date by default', async () => {
      const res = await request(app)
        .get('/api/v1/games/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      const dates = res.body.games.map((g) => new Date(g.completedAt));
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    });
  });

  describe('GET /api/v1/games/stats', () => {
    beforeEach(async () => {
      // Create games with various stats
      await Game.insertMany([
        {
          user: userId,
          cards: testCards.map((c) => c._id),
          difficulty: 'easy',
          status: 'completed',
          score: 100,
          accuracy: 80,
          duration: 300,
        },
        {
          user: userId,
          cards: testCards.map((c) => c._id),
          difficulty: 'medium',
          status: 'completed',
          score: 150,
          accuracy: 90,
          duration: 400,
        },
        {
          user: userId,
          cards: testCards.map((c) => c._id),
          difficulty: 'hard',
          status: 'completed',
          score: 200,
          accuracy: 70,
          duration: 600,
        },
      ]);
    });

    it('should get comprehensive user stats', async () => {
      const res = await request(app)
        .get('/api/v1/games/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalGames', 3);
      expect(res.body).toHaveProperty('averageScore');
      expect(res.body).toHaveProperty('averageAccuracy');
      expect(res.body).toHaveProperty('totalPlayTime');
      expect(res.body).toHaveProperty('difficultyBreakdown');
      expect(res.body).toHaveProperty('categoryBreakdown');
      expect(res.body).toHaveProperty('recentPerformance');
    });
  });
});
