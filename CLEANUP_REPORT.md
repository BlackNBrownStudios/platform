# Platform Cleanup Report

Generated: 2025-07-17

## Summary

After analyzing the platform codebase following the refactoring to use shared platform packages (`@platform/auth-backend` and `@platform/backend-core`), I've identified numerous files that can be safely removed and several unused dependencies.

## dodginballs-api Cleanup

### Files to Remove (Replaced by Platform Packages)

#### 1. Re-export Files (Just wrapping platform imports)
- **src/utils/ApiError.js** - Just re-exports from @platform/backend-core
- **src/utils/catchAsync.js** - Just re-exports from @platform/backend-core
- **src/utils/pick.js** - Just re-exports from @platform/backend-core
- **src/middlewares/error.js** - Just re-exports from @platform/backend-core
- **src/middlewares/auth.js** - Just re-exports from @platform/auth-backend
- **src/middlewares/validate.js** - Just re-exports from @platform/backend-core
- **src/controllers/auth.controller.js** - Just re-exports from @platform/auth-backend
- **src/services/auth.service.js** - Just re-exports from @platform/auth-backend
- **src/services/token.service.js** - Just re-exports from @platform/auth-backend
- **src/services/user.service.js** - Just re-exports from @platform/auth-backend
- **src/models/token.model.js** - Just re-exports from @platform/auth-backend
- **src/models/user.model.js** - Just re-exports from @platform/auth-backend
- **src/models/plugins/index.js** - Just re-exports from @platform/backend-core
- **src/config/tokens.js** - Just re-exports from @platform/auth-backend
- **src/config/logger.js** - Just re-exports from @platform/backend-core

#### 2. Duplicate Implementation Files (Functionality now in platform packages)
- **src/config/passport.js** - Authentication strategies now handled by @platform/auth-backend
- **src/config/morgan.js** - Logging middleware now handled by @platform/backend-core
- **src/models/plugins/paginate.plugin.js** - Pagination now provided by @platform/backend-core
- **src/models/plugins/toJSON.plugin.js** - JSON transformation now provided by @platform/backend-core

#### 3. Backup/Temporary Files
- **src/config/swagger.js.bak** - Backup file, no longer needed

### Potentially Unused Dependencies in package.json
Based on code analysis, these dependencies appear to be unused:
- **axios** - No imports found in the codebase
- **compression** - Not imported directly (might be used by platform packages)
- **express-mongo-sanitize** - Not imported directly
- **helmet** - Not imported directly (might be used by platform packages)
- **validator** - Not imported directly
- **xss-clean** - Not imported directly

### Files That Should Be Kept
- **src/routes/v1/auth.route.js** - Contains custom OAuth bypass logic specific to dodginballs

## history-time-api Cleanup

### Files to Remove

#### 1. Duplicate Implementation Files
- **src/config/morgan.js** - Logging middleware (if using platform's logging)
- **src/config/logger.js** - Logger configuration (if using platform's logger)
- **src/models/plugins/paginate.plugin.js** - Pagination plugin (duplicate of platform)
- **src/models/plugins/toJSON.plugin.js** - JSON transformation (duplicate of platform)
- **src/utils/pick.js** - Utility function (duplicate of platform)

#### 2. Files to Review
- **src/utils/pagination.js** - Check if this adds value beyond platform's pagination

### Dependencies Analysis
History-time-api appears to use most of its dependencies appropriately.

## Recommended Actions

### Immediate Cleanup (Safe to Remove)

1. **dodginballs-api** - Remove all re-export files listed above
2. **Both APIs** - Remove duplicate plugin implementations
3. **dodginballs-api** - Remove swagger.js.bak

### Requires Review Before Removal

1. **Dependencies** - Review unused dependencies to confirm they're not used by platform packages
2. **Auth Routes** - Verify OAuth bypass logic in dodginballs is still needed
3. **Config Files** - Ensure no custom configurations are lost

### Migration Verification Steps

Before removing files:
1. Run tests to ensure nothing breaks
2. Check that all imports resolve correctly
3. Verify the applications still start and function properly

## Benefits of Cleanup

1. **Reduced Maintenance** - Fewer files to maintain
2. **Clearer Architecture** - Obvious what's app-specific vs platform-provided
3. **Smaller Bundle Size** - Removing unused dependencies
4. **Better Developer Experience** - Less confusion about which files to modify

## Next Steps

1. Create a branch for cleanup
2. Remove files in small batches
3. Test after each batch
4. Update any remaining imports
5. Remove unused dependencies
6. Run full test suite
7. Deploy to staging for verification