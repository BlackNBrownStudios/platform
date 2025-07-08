const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy, googleStrategy, facebookStrategy, appleStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const swagger = require('./config/swagger');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.set('trust proxy', 1);

// Logger
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

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

// Apply CORS with options
app.use(cors(corsOptions));

// Handle OPTIONS requests
app.options('*', cors(corsOptions));

// JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// OAuth strategies
if (googleStrategy) {
  passport.use('google', googleStrategy);
}
if (facebookStrategy) {
  passport.use('facebook', facebookStrategy);
}
if (appleStrategy) {
  passport.use('apple', appleStrategy);
}

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

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;
