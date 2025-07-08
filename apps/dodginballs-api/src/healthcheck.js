// Simple standalone health check server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Configure logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoints
app.get('/healthz', (req, res) => {
  console.log('Health check endpoint /healthz accessed');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    message: 'Lightweight health check endpoint'
  });
});

app.get('/api/health', (req, res) => {
  console.log('Health check endpoint /api/health accessed');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    message: 'Lightweight health check endpoint'
  });
});

app.get('/health', (req, res) => {
  console.log('Health check endpoint /health accessed');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    message: 'Lightweight health check endpoint'
  });
});

// Default route
app.get('/', (req, res) => {
  res.status(200).send('DodginBalls API Health Check Server');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Available at: 
  - http://localhost:${PORT}/healthz
  - http://localhost:${PORT}/api/health
  - http://localhost:${PORT}/health`);
});
