const httpStatus = require('http-status');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const { Card } = require('../src/models');

const setupTestDB = require('./setupTestDB');

// Setup in-memory MongoDB for testing
setupTestDB();

beforeEach(async () => {
  await Card.deleteMany({});
});

describe('Card API endpoints', () => {
  describe('GET /api/v1/cards/categories', () => {
    test('should return an array of categories', async () => {
      // First, insert some test cards with different categories
      await Card.insertMany([
        {
          title: 'Card 1',
          description: 'Test Card 1',
          date: '1945-08-06',
          year: 1945,
          category: 'Military',
          difficulty: 'medium',
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        },
        {
          title: 'Card 2',
          description: 'Test Card 2',
          date: '1969-07-20',
          year: 1969,
          category: 'Scientific',
          difficulty: 'easy',
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        },
        {
          title: 'Card 3',
          description: 'Test Card 3',
          date: '1776-07-04',
          year: 1776,
          category: 'Political',
          difficulty: 'medium',
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        },
      ]);

      // Test the categories endpoint
      const res = await request(app).get('/api/v1/cards/categories');

      // Assertions
      expect(res.status).toBe(httpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);
      expect(res.body).toContain('Military');
      expect(res.body).toContain('Scientific');
      expect(res.body).toContain('Political');
    });

    test('should return an empty array if no cards exist', async () => {
      const res = await request(app).get('/api/v1/cards/categories');

      expect(res.status).toBe(httpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/v1/cards/random', () => {
    beforeEach(async () => {
      // Insert 20 sample cards with different difficulties and categories
      const cards = [];
      const difficulties = ['easy', 'medium', 'hard', 'expert'];
      const categories = ['Military', 'Political', 'Scientific', 'Cultural', 'Technological'];

      for (let i = 0; i < 20; i++) {
        const difficulty = difficulties[i % 4];
        const category = categories[i % 5];
        const year = 1900 + i * 5;

        cards.push({
          title: `Card ${i}`,
          description: `Description ${i}`,
          date: `${year}-01-01`,
          year,
          category,
          difficulty,
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        });
      }

      await Card.insertMany(cards);
    });

    test('should return random cards with the specified difficulty', async () => {
      const res = await request(app).get('/api/v1/cards/random').query({
        difficulty: 'medium',
        count: 5,
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(5);
      expect(res.body[0].difficulty).toBe('medium');
    });

    test('should return random cards with the specified category', async () => {
      // First, let's ensure we have enough Military cards for the test
      await Card.deleteMany({ category: 'Military' });

      // Insert 5 Military cards that we can be sure will be returned
      const militaryCards = [];
      for (let i = 0; i < 5; i++) {
        militaryCards.push({
          title: `Military Card ${i}`,
          description: `Military Description ${i}`,
          date: `${1950 + i}-01-01`,
          year: 1950 + i,
          category: 'Military',
          difficulty: 'medium',
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        });
      }
      await Card.insertMany(militaryCards);

      const res = await request(app).get('/api/v1/cards/random').query({
        category: 'Military',
        count: 3,
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.length).toBeLessThanOrEqual(3);
      res.body.forEach((card) => {
        expect(card.category).toBe('Military');
      });
    });

    test('should return the requested number of cards', async () => {
      const res = await request(app).get('/api/v1/cards/random').query({
        count: 7,
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(7);
    });
  });

  describe('GET /api/v1/cards', () => {
    beforeEach(async () => {
      // Insert 10 sample cards
      const cards = [];
      for (let i = 0; i < 10; i++) {
        const year = 1900 + i * 10;
        cards.push({
          title: `Card ${i}`,
          description: `Description ${i}`,
          date: `${year}-01-01`,
          year,
          category: i % 2 === 0 ? 'Scientific' : 'Political',
          difficulty: i % 3 === 0 ? 'easy' : 'medium',
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        });
      }

      await Card.insertMany(cards);
    });

    test('should return paginated results', async () => {
      const res = await request(app).get('/api/v1/cards').query({
        limit: 5,
        page: 1,
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.results).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.totalResults).toBe(10);
    });

    test('should filter by category', async () => {
      // First, let's ensure we have enough Military cards for the test
      await Card.deleteMany({ category: 'Scientific' });

      // Insert 5 Military cards that we can be sure will be returned
      const militaryCards = [];
      for (let i = 0; i < 5; i++) {
        militaryCards.push({
          title: `Military Card ${i}`,
          description: `Military Description ${i}`,
          date: `${1950 + i}-01-01`,
          year: 1950 + i,
          category: 'Military',
          difficulty: 'medium',
          isVerified: true,
          createdBy: new mongoose.Types.ObjectId(),
        });
      }
      await Card.insertMany(militaryCards);

      const res = await request(app).get('/api/v1/cards').query({
        category: 'Military',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.results).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBeGreaterThan(0);
      res.body.results.forEach((card) => {
        expect(card.category).toBe('Military');
      });
    });

    test('should filter by difficulty', async () => {
      const res = await request(app).get('/api/v1/cards').query({
        difficulty: 'easy',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.results).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBeGreaterThan(0);
      res.body.results.forEach((card) => {
        expect(card.difficulty).toBe('easy');
      });
    });
  });
});
