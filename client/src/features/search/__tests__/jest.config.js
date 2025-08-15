/**
 * Jest Configuration for Search Module Tests
 * Phase 6: Comprehensive Testing - Test Runner Configuration
 */

module.exports = {
  displayName: 'Search Module Tests',
  testMatch: [
    '<rootDir>/src/features/search/__tests__/**/*.test.{ts,tsx}',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/features/search/__tests__/setup.ts'
  ],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }],
  },
  collectCoverageFrom: [
    'src/features/search/**/*.{ts,tsx}',
    '!src/features/search/**/*.d.ts',
    '!src/features/search/__tests__/**',
    '!src/features/search/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage/search',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  maxWorkers: '50%',
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};