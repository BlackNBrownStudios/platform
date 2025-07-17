# @platform/leaderboards

Shared leaderboard system for the game platform. Provides flexible leaderboard functionality with support for different types, scoring methods, and time-based resets.

## Features

- **Multiple Leaderboard Types**: Global, daily, weekly, monthly, and all-time leaderboards
- **Flexible Scoring**: Support for highest score, lowest score, and cumulative scoring
- **Automatic Ranking**: Rankings are automatically calculated and updated
- **User-Centric Queries**: Get rankings near a specific user
- **Metadata Support**: Store additional data with leaderboards and entries
- **Reset Functionality**: Clear leaderboards programmatically or on schedule

## Installation

```bash
pnpm add @platform/leaderboards
```

## Usage

### Basic Setup

```typescript
import { setupLeaderboardRoutes } from '@platform/leaderboards';
import express from 'express';

const app = express();

// Add leaderboard routes to your app
setupLeaderboardRoutes(app, '/api/v1/leaderboards');
```

### Using the Service Directly

```typescript
import { leaderboardService } from '@platform/leaderboards';

// Create a leaderboard
const leaderboard = await leaderboardService.createLeaderboard({
  gameId: 'history-time',
  name: 'High Scores',
  type: 'alltime',
  scoreType: 'highest',
  description: 'All-time high scores'
});

// Update a user's score
const entry = await leaderboardService.updateScore({
  leaderboardId: leaderboard._id,
  userId: 'user123',
  score: 1500,
  metadata: { level: 10, timeSpent: 300 }
});

// Get top 10 rankings
const rankings = await leaderboardService.getRankings({
  leaderboardId: leaderboard._id,
  limit: 10
});

// Get rankings near a specific user
const nearbyRankings = await leaderboardService.getRankings({
  leaderboardId: leaderboard._id,
  limit: 10,
  nearUserId: 'user123'
});
```

### API Endpoints

- `POST /leaderboards` - Create a new leaderboard
- `GET /leaderboards` - Get leaderboards (with filtering)
- `GET /leaderboards/:id` - Get a specific leaderboard
- `DELETE /leaderboards/:id` - Delete a leaderboard
- `POST /leaderboards/:id/scores` - Update user score
- `GET /leaderboards/:id/rankings` - Get rankings
- `GET /leaderboards/:id/users/:userId/rank` - Get user's rank
- `POST /leaderboards/:id/reset` - Reset leaderboard (admin)

### Leaderboard Types

- **global**: Single leaderboard for all players
- **daily**: Resets every day
- **weekly**: Resets every week
- **monthly**: Resets every month
- **alltime**: Never resets

### Score Types

- **highest**: Keep the highest score achieved
- **lowest**: Keep the lowest score achieved (e.g., fastest time)
- **cumulative**: Add scores together

## Models

### Leaderboard Model

```typescript
{
  gameId: string;
  name: string;
  description?: string;
  type: 'global' | 'daily' | 'weekly' | 'monthly' | 'alltime';
  scoreType: 'highest' | 'lowest' | 'cumulative';
  resetSchedule?: string; // cron expression
  isActive: boolean;
  metadata?: Record<string, any>;
}
```

### LeaderboardEntry Model

```typescript
{
  leaderboardId: ObjectId;
  userId: ObjectId;
  score: number;
  rank?: number;
  metadata?: Record<string, any>;
  achievedAt: Date;
}
```

## Example Integration

```typescript
// In your game API
import { leaderboardService } from '@platform/leaderboards';
import { auth } from '@platform/auth-backend';

// When a game ends
app.post('/games/:gameId/end', auth(), async (req, res) => {
  const { score, timeSpent } = req.body;
  
  // Update multiple leaderboards
  await Promise.all([
    // All-time high score
    leaderboardService.updateScore({
      leaderboardId: 'alltime-leaderboard-id',
      userId: req.user.id,
      score,
      metadata: { timeSpent }
    }),
    
    // Daily leaderboard
    leaderboardService.updateScore({
      leaderboardId: 'daily-leaderboard-id',
      userId: req.user.id,
      score,
      metadata: { timeSpent }
    })
  ]);
  
  res.send({ message: 'Score updated' });
});
```

## Notes

- Rankings are 1-indexed (first place is rank 1)
- Ranks are automatically recalculated when scores change
- The package uses MongoDB for storage
- Integrates with @platform/auth-backend for user references