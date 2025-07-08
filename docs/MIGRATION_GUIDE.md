# Migration Guide

This guide helps you migrate existing applications to the platform monorepo.

## Migrating History Time

### 1. Backend API Migration

```bash
# From the platform root
mkdir -p apps/history-time-api

# Copy backend code
cp -r /path/to/history-time/apps/api/* apps/history-time-api/

# Update package.json
# - Change name to "@platform/history-time-api"
# - Update dependencies to use @platform packages
# - Remove duplicate dependencies that exist in shared packages
```

Update imports:
- `@history-time/shared` → `@platform/types`
- Local auth code → `@platform/auth-backend`
- Express setup → `@platform/backend-core`

### 2. Web App Migration

```bash
mkdir -p apps/history-time-web
cp -r /path/to/history-time/apps/web/* apps/history-time-web/
```

Update:
- Package name to `@platform/history-time-web`
- API client imports to use `@platform/api-client`
- Shared types to `@platform/types`

### 3. Mobile App Migration

```bash
mkdir -p apps/history-time-mobile
cp -r /path/to/history-time/apps/mobile/* apps/history-time-mobile/
```

## Migrating DodginBalls Backend

### 1. From K8s Repository

```bash
mkdir -p apps/dodginballs-api

# Copy from DodginBalls-k8s
cp -r /path/to/DodginBalls-k8s/backend/* apps/dodginballs-api/
```

### 2. Refactor to Use Shared Packages

Replace custom implementations with platform packages:

```typescript
// Before
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errors';

// After
import { auth, ApiError } from '@platform/backend-core';
import { setupAuth } from '@platform/auth-backend';
```

### 3. Update Docker Configuration

Move Dockerfile to `apps/dodginballs-api/Dockerfile` and update paths.

## Common Migration Steps

### 1. Update Dependencies

Remove from individual app package.json if provided by platform:
- Express, helmet, cors (from @platform/backend-core)
- JWT, passport, bcrypt (from @platform/auth-backend)
- Common types (from @platform/types)

### 2. Environment Variables

Create `.env` files in each app:
```env
# apps/history-time-api/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=mongodb://localhost:27017/history-time
JWT_SECRET=your-secret
```

### 3. Update Scripts

In each app's package.json:
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 4. Test the Migration

```bash
# From platform root
pnpm install
pnpm build
pnpm dev --filter=history-time-api
```

## Shared Code Extraction

When you find duplicate code between apps:

1. Create a new shared package:
```bash
mkdir -p packages/shared/new-feature
```

2. Move the common code there
3. Publish internally: `pnpm build`
4. Import in apps: `import { feature } from '@platform/new-feature'`

## Kubernetes Migration

1. Move K8s configs to `infrastructure/k8s/`
2. Update image names to match new structure
3. Create Kustomization overlays for different environments

## Benefits After Migration

- ✅ Shared authentication across all games
- ✅ Consistent API patterns
- ✅ Centralized type definitions
- ✅ Unified build and deployment
- ✅ Easier to add new games
- ✅ Code reuse between projects