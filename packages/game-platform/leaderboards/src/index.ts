// Models
export { default as Leaderboard, ILeaderboard, ILeaderboardModel } from './models/leaderboard.model';
export { default as LeaderboardEntry, ILeaderboardEntry, ILeaderboardEntryModel } from './models/leaderboardEntry.model';

// Service
export { default as leaderboardService } from './services/leaderboard.service';

// Controller
export { default as leaderboardController } from './controllers/leaderboard.controller';

// Validation
export { default as leaderboardValidation } from './validations/leaderboard.validation';

// Routes
export { default as leaderboardRoutes } from './routes/leaderboard.route';

// Utility function to set up leaderboard routes
export const setupLeaderboardRoutes = (app: any, basePath: string = '/v1/leaderboards') => {
  const leaderboardRoutes = require('./routes/leaderboard.route').default;
  app.use(basePath, leaderboardRoutes);
};