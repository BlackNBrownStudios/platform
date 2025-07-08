module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/index.js',
    '!src/config/**/*.js',
    '!src/routes/v1/docs.route.js',
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
