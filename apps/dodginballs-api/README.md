# DodginBalls API

## Overview

DodginBalls API is a **backend-only service** that provides the server infrastructure for multiplayer dodgeball games. This API is designed to be consumed by game clients (Unity, Unreal Engine, web-based games, etc.) and does **NOT** include any frontend components.

## Key Features

- **Multiplayer Support**: Real-time game lobbies and match management
- **Team Management**: Create and manage teams with multiple players
- **Matchmaking**: Join games via lobby codes or matchmaking
- **Leaderboards**: Track player statistics and rankings
- **Player Stats**: Comprehensive tracking of throws, catches, hits, and dodges

## API Architecture

This is a RESTful API built with:
- Node.js & Express
- MongoDB for data persistence
- JWT authentication via `@platform/auth-backend`
- Shared platform utilities via `@platform/backend-core`

## Game-Specific Models

- **Team**: Groups of players competing together
- **Lobby**: Game rooms where players gather before matches
- **Match**: Active game sessions with real-time state
- **PlayerStats**: Individual player performance metrics

## Usage

This API is intended to be integrated with game clients such as:
- Unity game clients
- Unreal Engine games
- Web-based multiplayer games
- Mobile game applications

Game clients should implement:
- Real-time WebSocket connections for live game updates
- Client-side game physics and rendering
- Network prediction and lag compensation
- UI/UX for game interactions

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## API Documentation

When running in development, API documentation is available at:
```
http://localhost:3000/api/docs
```

## Environment Variables

Create a `.env` file with:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/dodginballs
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
CLIENT_URL=http://localhost:3001
```

## Authentication

All game endpoints require JWT authentication. Players must register/login first:

```bash
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-tokens
POST /api/v1/auth/logout
```

## Game Flow

1. **Create/Join Lobby**: Players create or join a lobby using a room code
2. **Team Formation**: Players are assigned to teams
3. **Start Match**: When ready, the lobby transitions to an active match
4. **Game Loop**: Clients send player actions, server validates and broadcasts state
5. **End Match**: Stats are recorded and players return to lobby

## Integration Notes

- This API provides game state management only
- Game physics and rendering must be handled by the client
- Use WebSockets for real-time game updates during matches
- Implement client-side prediction for smooth gameplay
- Handle network latency and disconnections gracefully