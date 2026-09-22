/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // Redirects every "../models/X" import (as used by controllers/middleware,
  // one directory below the project root) to the in-memory test double, so
  // the real Express app can be exercised end-to-end over HTTP without a
  // live MongoDB instance. See tests/mocks/models/_store.ts for details.
  moduleNameMapper: {
    '^\\.\\./models/(.*)$': '<rootDir>/tests/mocks/models/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  clearMocks: true,
  verbose: true,
};
