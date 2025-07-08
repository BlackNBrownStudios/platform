/**
 * @game-platform/backend-core
 * Core backend utilities for game platform
 */

// App factory
export { createApp, setupErrorHandling } from './app';
export type { AppConfig } from './app';

// Middleware
export { errorHandler } from './middleware/error';
export { requestLogger } from './middleware/logging';
export { healthCheck } from './middleware/health';
export { validate } from './middleware/validate';
export { asyncHandler } from './middleware/async';

// Error classes
export { ApiError } from './errors/ApiError';
export { ValidationError } from './errors/ValidationError';

// Utils
export { logger } from './utils/logger';
export { catchAsync } from './utils/catchAsync';
export { pick } from './utils/pick';

// Response helpers
export { sendSuccess, sendError, sendPaginated } from './utils/response';

// Database plugins
export { toJSON } from './plugins/toJSON.plugin';
export { paginate } from './plugins/paginate.plugin';

// Types
export type { PaginateOptions, PaginateResult } from './types/pagination';
export type { ApiResponse, ErrorResponse } from './types/response';