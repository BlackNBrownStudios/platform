# BlackNBrownStudios Platform

A monorepo for BlackNBrownStudios full-stack game applications and shared infrastructure.

## Overview

This monorepo contains the web and backend infrastructure for our games, with shared packages and services that can be used across multiple game projects.

## Structure

```
platform/
├── apps/               # Individual applications
│   ├── history-time-*  # History Time game apps
│   └── dodginballs-*   # DodginBalls game apps
├── packages/           # Shared packages
│   ├── game-platform/  # Game-specific infrastructure
│   ├── shared/         # General shared utilities
│   └── ui/             # UI component library
├── services/           # Microservices
├── infrastructure/     # Deployment configs
├── tools/              # Development tools
└── docs/               # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/BlackNBrownStudios/platform.git
cd platform

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev --filter=history-time-web

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Apps

### History Time
- `history-time-api` - Backend API service
- `history-time-web` - Web application
- `history-time-mobile` - React Native mobile app

### DodginBalls
- `dodginballs-api` - Backend API service
- `dodginballs-web` - Web application

## Shared Packages

### Game Platform Packages
- `@platform/auth-backend` - Authentication service
- `@platform/backend-core` - Core backend utilities
- `@platform/matchmaking` - Matchmaking service
- `@platform/leaderboards` - Leaderboard service
- `@platform/teams` - Teams management

### Shared Utilities
- `@platform/types` - TypeScript type definitions
- `@platform/api-client` - Unified API client
- `@platform/config` - Configuration management
- `@platform/utils` - Common utilities
- `@platform/validation` - Validation schemas

### UI Components
- `@platform/ui-components` - React component library
- `@platform/ui-hooks` - React hooks
- `@platform/ui-themes` - Theme definitions

## Development Workflow

This monorepo uses:
- **pnpm** for package management
- **Turborepo** for build orchestration
- **Changesets** for version management
- **TypeScript** for type safety
- **ESLint** & **Prettier** for code quality

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a changeset: `pnpm changeset`
5. Submit a pull request

## License

MIT © BlackNBrownStudios