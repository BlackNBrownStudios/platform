# History Time API - Platform Migration Plan

## Overview
This document outlines the step-by-step process to fully migrate history-time-api to use @platform packages.

## Current State
- Partial migration: app.ts already uses platform packages
- Dual implementation: Both old JS and new TS files exist
- Many redundant auth/utility files that can be removed

## Migration Steps

### Phase 1: Clean Up Redundant Auth Files
Remove files replaced by @platform/auth-backend:
- [ ] /src/controllers/auth.controller.js
- [ ] /src/services/auth.service.js  
- [ ] /src/services/token.service.js
- [ ] /src/services/email.service.js
- [ ] /src/middlewares/auth.js
- [ ] /src/validations/auth.validation.js
- [ ] /src/config/passport.js
- [ ] /src/models/token.model.js
- [ ] /src/routes/v1/auth.route.js

### Phase 2: Replace Utilities
Replace with @platform/backend-core exports:
- [ ] /src/utils/ApiError.js → Use ApiError from platform
- [ ] /src/utils/catchAsync.js → Use catchAsync from platform  
- [ ] /src/middlewares/validate.js → Use validate from platform
- [ ] /src/middlewares/error.js → Already handled by setupErrorHandling

### Phase 3: Update User Model
- [ ] Evaluate if custom user fields are needed
- [ ] If yes, extend platform User model
- [ ] If no, remove /src/models/user.model.js

### Phase 4: Update Imports
In all remaining game-specific files:
- [ ] Replace ApiError imports
- [ ] Replace catchAsync imports
- [ ] Update auth middleware imports
- [ ] Update validation middleware imports

### Phase 5: Clean Up Routes
- [ ] Remove auth routes from /src/routes/v1/index.js
- [ ] Update route files to use platform middleware

### Phase 6: Remove Old Entry Files
- [ ] Remove app.js (replaced by app.ts)
- [ ] Remove index.js (replaced by index.ts)

### Phase 7: Update Dependencies
- [ ] Remove packages now provided by platform
- [ ] Update package.json scripts if needed

## Files to Keep (Game-Specific)
- All card-related files (models, services, controllers)
- Game logic (models, services, controllers)
- Daily challenges
- Historical events
- Multiplayer games
- Store functionality
- Scripts for data management

## Testing Plan
1. Test authentication flow works with platform auth
2. Verify all game endpoints still function
3. Check error handling works correctly
4. Validate user data migration if needed

## Benefits
- Reduced code duplication
- Consistent auth across platform
- Easier maintenance
- Better tested foundation
- Smaller codebase to manage