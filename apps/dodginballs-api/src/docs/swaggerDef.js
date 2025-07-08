const { version } = require('../config/config');
const pkg = require('../../package.json');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'DodginBalls API Documentation',
    version,
    description: 'API documentation for the DodginBalls backend',
    license: {
      name: 'MIT',
      url: 'https://github.com/kblack0610/DodginBalls-k8s/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:3000/v1`,
      description: 'Development Server',
    },
    {
      url: `https://api.dodginballs.com/v1`,
      description: 'Production Server',
    },
  ],
};

module.exports = swaggerDef;
