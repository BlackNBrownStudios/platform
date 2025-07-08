import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore - xss-clean doesn't have types
import xss from 'xss-clean';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/logging';
import { healthCheck } from './middleware/health';

export interface AppConfig {
  corsOrigins?: string[];
  rateLimitWindow?: number;
  rateLimitMax?: number;
  trustProxy?: boolean;
  mongoSanitize?: boolean;
  apiPrefix?: string;
}

/**
 * Create an Express app with standard middleware
 */
export function createApp(config: AppConfig = {}): Express {
  const app = express();

  // Trust proxy (for deployment behind load balancers)
  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  // Security middleware
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: config.corsOrigins || ['http://localhost:3000'],
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Compression
  app.use(compression());

  // Data sanitization against NoSQL query injection
  if (config.mongoSanitize !== false) {
    app.use(mongoSanitize());
  }

  // Data sanitization against XSS
  app.use(xss());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindow || 15 * 60 * 1000, // 15 minutes
    max: config.rateLimitMax || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply rate limiting to API routes
  const apiPrefix = config.apiPrefix || '/api';
  app.use(apiPrefix, limiter);

  // Request logging
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', healthCheck);
  app.get('/healthz', healthCheck); // Kubernetes style
  app.get(`${apiPrefix}/health`, healthCheck);

  return app;
}

/**
 * Setup error handling middleware (call after all routes)
 */
export function setupErrorHandling(app: Express): void {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
    });
  });

  // Error handler
  app.use(errorHandler);
}