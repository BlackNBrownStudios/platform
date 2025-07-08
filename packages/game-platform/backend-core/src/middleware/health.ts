import { Request, Response } from 'express';

export interface HealthCheckOptions {
  checks?: Array<{
    name: string;
    check: () => Promise<boolean>;
  }>;
}

/**
 * Health check endpoint handler
 */
export const healthCheck = async (req: Request, res: Response) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Add memory usage in development
  if (process.env.NODE_ENV !== 'production') {
    const memUsage = process.memoryUsage();
    health.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    };
  }

  res.status(200).json(health);
};

/**
 * Create a health check with custom checks
 */
export const createHealthCheck = (options: HealthCheckOptions) => {
  return async (req: Request, res: Response) => {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {},
    };

    // Run custom checks
    if (options.checks) {
      for (const check of options.checks) {
        try {
          health.checks[check.name] = await check.check() ? 'ok' : 'fail';
        } catch (error) {
          health.checks[check.name] = 'error';
          health.status = 'degraded';
        }
      }
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  };
};