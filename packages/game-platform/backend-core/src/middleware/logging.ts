import morgan from 'morgan';
import { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';

// Extend Express types for morgan
declare module 'express' {
  interface Request {
    _startAt?: [number, number];
  }
  interface Response {
    _startAt?: [number, number];
  }
}

// Custom token for response time
morgan.token('response-time-ms', (req: Request, res: Response) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }
  
  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
    (res._startAt[1] - req._startAt[1]) / 1000000;
  
  return ms.toFixed(3);
});

// Development format
const devFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

// Production format (more detailed)
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time-ms ms ":referrer" ":user-agent"';

// Create morgan middleware with winston stream
export const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  {
    stream: {
      write: (message: string) => {
        // Remove trailing newline
        const trimmedMessage = message.trim();
        
        // Log based on status code
        if (message.includes(' 5')) {
          logger.error(trimmedMessage);
        } else if (message.includes(' 4')) {
          logger.warn(trimmedMessage);
        } else {
          logger.info(trimmedMessage);
        }
      },
    },
    skip: (req: Request, res: Response) => {
      // Skip logging for health checks
      return req.url === '/health' || req.url === '/healthz';
    },
  }
) as RequestHandler;