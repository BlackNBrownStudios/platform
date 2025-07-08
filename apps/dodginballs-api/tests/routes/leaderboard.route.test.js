const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const { User } = require('../../src/models');
const { setupDatabase, teardownDatabase } = require('../fixtures/db');
const { getTestAuthHeader } = require('../fixtures/auth');

beforeAll(async () => {
  await setupDatabase();
});
afterAll(teardownDatabase);

describe('Leaderboard Routes', () => {
  describe('GET /api/v1/leaderboard/users/all', () => {
    it('should aggregate individual and team wins and losses for each user', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard/users/all')
        .set('Authorization', getTestAuthHeader())
        .expect(200);

      expect(res.body.results).toBeInstanceOf(Array);
      // Alice: 2 individual wins, 3 team wins, 1 individual loss, 2 team losses
      // Bob:   4 individual wins, 3 team wins, 0 individual loss, 2 team losses
      // Charlie: 0 individual wins, 1 team win, 2 individual losses, 4 team losses
      const alice = res.body.results.find(u => u.name === 'Alice');
      const bob = res.body.results.find(u => u.name === 'Bob');
      const charlie = res.body.results.find(u => u.name === 'Charlie');
      expect(alice).toMatchObject({
        individualWins: 2,
        teamWins: 3,
        totalWins: 5,
        individualLosses: 1,
        teamLosses: 2,
        totalLosses: 3,
      });
      expect(bob).toMatchObject({
        individualWins: 4,
        teamWins: 3,
        totalWins: 7,
        individualLosses: 0,
        teamLosses: 2,
        totalLosses: 2,
      });
      expect(charlie).toMatchObject({
        individualWins: 0,
        teamWins: 1,
        totalWins: 1,
        individualLosses: 2,
        teamLosses: 4,
        totalLosses: 6,
      });
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/leaderboard/users/all')
        .expect(401);
    });
  });

  // Add more tests for pagination, sorting, edge cases as needed
});
