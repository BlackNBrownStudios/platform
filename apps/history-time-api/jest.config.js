/*
 * Custom Jest configuration for @history-time/api
 * Excludes unfinished or flaky test files suffixed with `.todo.test.js`.
 */

module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '\\.todo\\.test\\.js$', // ignore any file ending with .todo.test.js
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js', '!src/config/**'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: ['**/tests/**/*.test.js', '**/src/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
};
