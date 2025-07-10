import { describe, it, expect } from '@jest/globals';
import { createApp, setupErrorHandling } from '../src/app';
import express from 'express';

describe('Backend Core App', () => {
  describe('createApp', () => {
    it('should create an Express application', () => {
      const app = createApp();
      
      expect(app).toBeDefined();
      expect(app.listen).toBeDefined();
      expect(app.use).toBeDefined();
      expect(app.get).toBeDefined();
      expect(app.post).toBeDefined();
    });

    it('should have middleware configured', () => {
      const app = createApp();
      
      // Test that middleware is set up by checking the app's stack
      const stack = (app as any)._router.stack;
      
      // Should have multiple middleware layers
      expect(stack.length).toBeGreaterThan(0);
      
      // Check for specific middleware
      const middlewareNames = stack
        .filter((layer: any) => layer.name)
        .map((layer: any) => layer.name);
      
      expect(middlewareNames).toContain('jsonParser');
      expect(middlewareNames).toContain('urlencodedParser');
    });

    it('should have health endpoint', async () => {
      const app = createApp();
      const request = (await import('supertest')).default;
      
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String)
      });
    });

    it('should handle 404 for unknown routes', async () => {
      const app = createApp();
      setupErrorHandling(app);
      const request = (await import('supertest')).default;
      
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);
      
      expect(response.body).toEqual({
        status: 'error',
        message: 'Route not found'
      });
    });

    it('should handle errors with error middleware', async () => {
      const app = createApp();
      
      // Add a route that throws an error
      app.get('/error-test', () => {
        throw new Error('Test error');
      });
      
      setupErrorHandling(app);
      const request = (await import('supertest')).default;
      
      const response = await request(app)
        .get('/error-test')
        .expect(500);
      
      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Test error'
      });
    });
  });
});