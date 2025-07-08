const request = require('supertest');
const app = require('../../src/app');
const { setupDatabase, teardownDatabase } = require('../fixtures/db');
const { User } = require('../../src/models');
const { getTestAuthHeader } = require('../fixtures/auth');

// Set up test database
beforeAll(async () => {
  await setupDatabase();
});

// Clean up after tests
afterAll(teardownDatabase);

describe('Auth Routes', () => {
  // Test variables
  const testUser = {
    name: 'Test User',
    email: 'test.user@example.com',
    password: 'Pass123!'
  };
  let userId;
  let tokens;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      // Check response structure
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user).not.toHaveProperty('password');
      
      // Save for later tests
      userId = res.body.user.id;
      tokens = res.body.tokens;
    });

    it('should not register a user with existing email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should not register a user with invalid data', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Te', // too short
          email: 'invalid-email',
          password: 'short' // too short
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login registered user and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not login with incorrect password', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should not login with non-existent email', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${tokens.access.token}`)
        .send({ refreshToken: tokens.refresh.token })
        .expect(204);
      
      // Try to use the refresh token - should fail now
      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({ refreshToken: tokens.refresh.token })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh-tokens', () => {
    let newTokens;
    
    // First register a new user to get fresh tokens
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Refresh Test User',
          email: 'refresh.test@example.com',
          password: 'Pass123!'
        });
      
      newTokens = res.body.tokens;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({ refreshToken: newTokens.refresh.token })
        .expect(200);
      
      expect(res.body).toHaveProperty('access');
      expect(res.body).toHaveProperty('refresh');
      expect(res.body.access.token).not.toBe(newTokens.access.token);
      expect(res.body.refresh.token).not.toBe(newTokens.refresh.token);
    });

    it('should not refresh tokens with invalid refresh token', async () => {
      await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/oauth-bypass', () => {
    it('should return a dummy user for OAuth bypass', async () => {
      const res = await request(app)
        .get('/api/v1/auth/oauth-bypass')
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('role');
    });
  });

  // Clean up test user after all tests
  afterAll(async () => {
    if (userId) {
      await User.deleteOne({ _id: userId });
    }
    await User.deleteOne({ email: 'refresh.test@example.com' });
  });
});