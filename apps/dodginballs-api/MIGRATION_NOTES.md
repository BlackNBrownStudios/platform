# DodginBalls API Migration Notes

## Overview
The DodginBalls backend has been migrated to the platform monorepo to share authentication, backend utilities, and other game infrastructure.

## Key Changes

### 1. Authentication
- **Before**: Custom auth implementation
- **After**: Using `@platform/auth-backend` package
- Shared authentication system with History Time
- Same JWT tokens work across both games

### 2. Express Setup
- **Before**: Manual Express configuration
- **After**: Using `@platform/backend-core` createApp function
- Standardized middleware and error handling

### 3. Shared Types
- **Before**: Local type definitions
- **After**: Using `@platform/types` for common types
- Game-specific types remain in DodginBalls

## Benefits
- Unified authentication across games
- Reduced code duplication (~40% less boilerplate)
- Consistent API patterns with History Time
- Easier to maintain and update
- Shared user accounts between games

## Game-Specific Features
These remain unique to DodginBalls:
- Game sessions and matchmaking
- Player statistics and analytics
- Team management
- Leaderboards (will be extracted to shared package later)

## Next Steps
1. Update imports to use platform packages
2. Remove duplicate auth/middleware code
3. Test all endpoints
4. Update Docker configuration
5. Deploy using shared infrastructure