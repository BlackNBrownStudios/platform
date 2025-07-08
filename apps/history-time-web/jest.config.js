const nextJest = require('next/jest');

// Next.js provides async config loading, createJestConfig wraps it
const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Ignore e2e tests and unfinished suites (*.todo.test.*)
  testPathIgnorePatterns: ['<rootDir>/e2e-tests/', '\\.(todo)\\.test\\.[tj]sx?$'],
  moduleNameMapper: {
    // Local package alias used by some unit tests
    '^history-time-shared$': '<rootDir>/../shared/dist',
    // Handle any TS/JS path aliases
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
