# @game-platform/auth-backend

Complete authentication backend service for the game platform, providing JWT authentication, OAuth integration, and user management.

## Features

- 🔐 JWT-based authentication with access/refresh tokens
- 🌐 OAuth support (Google, Facebook, Apple)
- 👤 User management with extensible game-specific data
- 📧 Email verification and password reset
- 🛡️ Role-based access control
- 🎮 Game-specific user data storage
- 🔒 Secure password hashing with bcrypt
- 📄 Comprehensive validation with Joi

## Installation

```bash
npm install @game-platform/auth-backend
```

## Quick Start

```typescript
import express from 'express';
import mongoose from 'mongoose';
import { setupAuth } from '@game-platform/auth-backend';

const app = express();

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/game-platform');

// Configure auth
const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpirationMinutes: 30,
    refreshExpirationDays: 30,
    resetPasswordExpirationMinutes: 10,
    verifyEmailExpirationMinutes: 10,
  },
  frontendUrl: 'http://localhost:3000',
  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: 'noreply@gameplatform.com',
  },
};

// Setup authentication
setupAuth({ app, config });
```

## API Routes

### Authentication Routes

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout (invalidate refresh token)
- `POST /auth/refresh-tokens` - Refresh access token
- `POST /auth/forgot-password` - Send password reset email
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/send-verification-email` - Resend verification email
- `POST /auth/change-password` - Change password (requires auth)

### OAuth Routes

- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback

### User Routes

- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update current user profile
- `GET /users` - Get all users (admin only)
- `POST /users` - Create user (admin only)
- `GET /users/:userId` - Get user by ID
- `PATCH /users/:userId` - Update user
- `DELETE /users/:userId` - Delete user (admin only)
- `GET /users/:userId/games/:gameId` - Get user's game data
- `PATCH /users/:userId/games/:gameId` - Update user's game data

## Using Services Directly

```typescript
import {
  AuthService,
  UserService,
  TokenService,
  EmailService,
} from '@game-platform/auth-backend';

// Initialize services
const authService = new AuthService(config);
const userService = new UserService();
const tokenService = new TokenService(config);
const emailService = new EmailService(config);

// Create a user
const user = await userService.createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe',
});

// Generate tokens
const tokens = await tokenService.generateAuthTokens(user);

// Update game-specific data
await userService.updateGameData(user.id, 'history-time', {
  level: 10,
  score: 1500,
  achievements: ['first_win', 'speed_demon'],
});
```

## Middleware

```typescript
import { auth, verifyOwnerOrAdmin } from '@game-platform/auth-backend';

// Require authentication
app.get('/protected', auth(), (req, res) => {
  res.json({ user: req.user });
});

// Require specific permissions
app.get('/admin', auth('manageUsers'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Verify user owns resource or is admin
app.patch(
  '/users/:userId',
  auth(),
  verifyOwnerOrAdmin,
  (req, res) => {
    // Update user
  }
);
```

## User Model

The user model is extensible with game-specific data:

```typescript
interface IUser {
  email: string;
  username?: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  gameSpecificData?: Record<string, any>;
  oauth?: {
    google?: { id: string; email?: string };
    facebook?: { id: string; email?: string };
    apple?: { id: string; email?: string };
  };
  preferences?: {
    notifications?: boolean;
    theme?: string;
    language?: string;
  };
  stats?: {
    lastLogin?: Date;
    loginCount?: number;
  };
}
```

## Environment Variables

```env
# JWT Secrets
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with separate secrets for access/refresh
- Token blacklisting for logout
- Rate limiting ready (use with express-rate-limit)
- Input validation with Joi
- SQL injection protection via Mongoose
- XSS protection via input sanitization

## License

MIT