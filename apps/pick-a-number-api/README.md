# Pick-a-Number Game

A simple number guessing game built to demonstrate the platform's shared packages.

## Overview

This game demonstrates:
- ✅ Using `@platform/backend-core` for Express setup
- ✅ Using `@platform/auth-backend` for authentication
- ✅ Using `@platform/types` for shared types
- ✅ Integration with the platform's auth system
- ✅ Shared user accounts across games

## Game Rules

1. The game generates a random number between 1 and 100
2. Players try to guess the number
3. After each guess, they're told if it's too high or too low
4. Score is based on number of attempts (fewer = better)
5. Players can give up to see the answer

## API Endpoints

### Game Endpoints (Requires Authentication)
- `POST /api/v1/game/start` - Start a new game
- `POST /api/v1/game/:gameId/guess` - Make a guess
- `GET /api/v1/game/active` - Get current active game
- `GET /api/v1/game/history` - Get game history
- `POST /api/v1/game/:gameId/giveup` - Give up on current game

### Public Endpoints
- `GET /api/v1/leaderboard` - Get top players
- `GET /api/v1/health` - Health check

### Auth Endpoints (From @platform/auth-backend)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh-tokens` - Refresh access token

## Running the Game

### Backend API
```bash
cd apps/pick-a-number-api
pnpm dev
# API runs on http://localhost:5003
```

### Frontend Web
```bash
cd apps/pick-a-number-web
pnpm dev
# Web app runs on http://localhost:3002
```

## Environment Variables

Create `.env` in pick-a-number-api:
```env
PORT=5003
MONGODB_URL=mongodb://localhost:27017/pick-a-number
JWT_SECRET=pick-a-number-secret
JWT_REFRESH_SECRET=pick-a-number-refresh-secret
```

## Testing Platform Integration

This game proves that:
1. **Shared Auth Works**: Users can register/login using platform auth
2. **Shared Backend Utils Work**: Express setup, error handling, middleware
3. **Cross-Game Accounts**: Same user account works across all platform games
4. **Consistent API Patterns**: Same auth flow as History Time and DodginBalls

## Score Calculation
- Start with 100 points
- Lose 10 points per attempt
- Minimum score is 10 points
- Only successful games count toward leaderboard