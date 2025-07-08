const express = require('express');
const v1Routes = require('./v1');
const config = require('../config/config');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(httpStatus.OK).send({
    status: 'ok',
    version: config.version,
    environment: config.env,
  });
});

router.use('/v1', v1Routes);

// catch 404 and forward to error handler
router.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

module.exports = router;
