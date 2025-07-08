const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'History Time API Documentation',
    version,
    description: 'API documentation for the History Time application',
    license: {
      name: 'MIT',
      url: 'https://github.com/kblack0610/history-time/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development Server',
    },
  ],
};

module.exports = swaggerDef;
