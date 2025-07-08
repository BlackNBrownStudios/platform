const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const setupTestDB = require('./setupTestDB');

setupTestDB();

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('username', 'newuser');
      expect(res.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'unique@example.com',
        password: 'Password123!',
      };

      await request(app).post('/api/v1/auth/register').send(userData);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...userData,
          email: 'different@example.com',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        username: 'uniqueuser',
        email: 'duplicate@example.com',
        password: 'Password123!',
      };

      await request(app).post('/api/v1/auth/register').send(userData);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...userData,
          username: 'differentuser',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate password requirements', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate email format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'logintest',
        email: 'login@example.com',
        password: 'Password123!',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        username: 'logintest',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('username', 'logintest');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should login with email instead of username', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        username: 'login@example.com',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        username: 'logintest',
        password: 'WrongPassword123!',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with non-existent user', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        username: 'nonexistent',
        password: 'Password123!',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle missing credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let authToken;
    let refreshToken;

    beforeEach(async () => {
      const user = await User.create({
        username: 'logouttest',
        email: 'logout@example.com',
        password: 'Password123!',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        username: 'logouttest',
        password: 'Password123!',
      });

      authToken = loginRes.body.token;
      refreshToken = loginRes.body.refreshToken;
    });

    it('should logout successfully with valid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post('/api/v1/auth/logout').send({ refreshToken });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .send({ refreshToken });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken;
    let expiredToken;

    beforeEach(async () => {
      const user = await User.create({
        username: 'refreshtest',
        email: 'refresh@example.com',
        password: 'Password123!',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        username: 'refreshtest',
        password: 'Password123!',
      });

      refreshToken = loginRes.body.refreshToken;

      // Create an expired token for testing
      const jwt = require('jsonwebtoken');
      expiredToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '-1h' });
    });

    it('should refresh token successfully', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token').send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.token).not.toBe(expiredToken);
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-refresh-token' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail without refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        username: 'protectedtest',
        email: 'protected@example.com',
        password: 'Password123!',
      });
      userId = user._id;

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        username: 'protectedtest',
        password: 'Password123!',
      });

      authToken = loginRes.body.token;
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('username', 'protectedtest');
    });

    it('should fail to access protected route without token', async () => {
      const res = await request(app).get(`/api/v1/users/${userId}`);

      expect(res.statusCode).toBe(401);
    });

    it('should fail with malformed token', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', 'Bearer malformed.token.here');

      expect(res.statusCode).toBe(401);
    });

    it('should fail with expired token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '-1h' });

      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
