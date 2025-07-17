const express = require('express');
const path = require('path');
const { createApp, ApiError } = require('@platform/backend-core');
const { setupAuth } = require('@platform/auth-backend');
const httpStatus = require('http-status');
const config = require('./config/config');
const routes = require('./routes/v1');
const swagger = require('./config/swagger');
const { authLimiter } = require('./middlewares/rateLimiter');

// Create app with platform defaults
const app = createApp({
  trustProxy: true,
  enableLogging: config.env !== 'test',
});

// Auth configuration
const authConfig = {
  jwt: {
    secret: config.jwt.secret,
    accessExpirationMinutes: config.jwt.accessExpirationMinutes,
    refreshExpirationDays: config.jwt.refreshExpirationDays,
    resetPasswordExpirationMinutes: config.jwt.resetPasswordExpirationMinutes,
    verifyEmailExpirationMinutes: config.jwt.verifyEmailExpirationMinutes,
  },
  frontendUrl: config.clientUrl || 'http://localhost:3000',
  email: config.email.smtp.host ? {
    smtp: config.email.smtp,
    from: config.email.from,
  } : undefined,
};

// Only add oauth if any provider is configured with credentials
const googleOAuthConfigured = config.google?.clientId && config.google?.clientSecret;
const facebookOAuthConfigured = config.facebook?.appId && config.facebook?.appSecret;
const appleOAuthConfigured = config.apple?.clientId && config.apple?.teamId && config.apple?.keyId;

const hasOAuth = googleOAuthConfigured || facebookOAuthConfigured || appleOAuthConfigured;
if (hasOAuth) {
  authConfig.oauth = {};
  if (googleOAuthConfigured) {
    authConfig.oauth.google = {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl || `${config.clientUrl}/auth/google/callback`,
    };
  }
  if (facebookOAuthConfigured) {
    authConfig.oauth.facebook = {
      clientId: config.facebook.appId,
      clientSecret: config.facebook.appSecret,
      callbackURL: config.facebook.callbackUrl || `${config.clientUrl}/auth/facebook/callback`,
    };
  }
  if (appleOAuthConfigured) {
    authConfig.oauth.apple = {
      clientId: config.apple.clientId,
      teamId: config.apple.teamId,
      keyId: config.apple.keyId,
      privateKey: config.apple.privateKey,
      callbackURL: config.apple.callbackUrl || `${config.clientUrl}/auth/apple/callback`,
    };
  }
}

// Setup authentication
setupAuth(app, authConfig);

// Serve static files with proper CORS headers
app.use('/images', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../public/images')));

// Serve other static files
app.use(express.static(path.join(__dirname, '../public')));

// Enhanced CORS configuration
const corsOptions = {
  // Allow requests from these origins
  origin: function (origin, callback) {
    // In development mode, allow all origins
    if (config.env === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins - add your frontend URLs as needed
    const allowedOrigins = [
      'http://localhost:3000',         // Web development
      'http://localhost:3001',         // Frontend development
      config.clientUrl,                // From environment config
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  // Allow all HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // Allow these headers in requests
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Access-Control-Allow-Headers',
  ],
  // Allow credentials
  credentials: true,
  // Cache preflight request results for 2 hours (in seconds)
  maxAge: 7200,
  // Expose these headers to the browser
  exposedHeaders: ['Content-Length', 'Content-Type']
};

// Apply custom CORS configuration (platform already sets up basic CORS)
app.use(require('cors')(corsOptions));

// Handle OPTIONS requests
app.options('*', require('cors')(corsOptions));

// Limit repeated failed requests to auth endpoints in production
if (config.env === 'production') {
  app.use('/api/v1/auth', authLimiter);
}

// API health routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Additional health check endpoints to match ALB configuration
app.get('/healthz', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Match the exact path being used by the standalone health check service
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Swagger API Documentation
app.use('/api/docs', swagger.serve, swagger.setup);

// API routes
app.use('/api/v1', routes);

// Send 404 for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Error handling is already set up by createApp

module.exports = app;