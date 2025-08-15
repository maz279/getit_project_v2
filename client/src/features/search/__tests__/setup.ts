/**
 * Test Setup Configuration for Search Module
 * Phase 6: Comprehensive Testing Infrastructure
 */

import '@testing-library/jest-dom';

// Mock performance.now for consistent testing
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    },
  },
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  writable: true,
  value: {
    randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: createStorageMock(),
});

// Mock fetch for API calls
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock AbortController
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: {},
  abort: jest.fn(),
}));

// Mock URL for navigation tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    pathname: '/',
    search: '',
    href: 'http://localhost:3000/',
  },
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  
  // Reset localStorage and sessionStorage
  window.localStorage.clear();
  window.sessionStorage.clear();
  
  // Reset performance.now mock
  (performance.now as jest.Mock).mockClear();
});

// Global test utilities
export const createMockSearchSuggestion = (overrides = {}) => ({
  id: 'test-suggestion-1',
  text: 'test query',
  type: 'product' as const,
  frequency: 10,
  ...overrides,
});

export const createMockSearchResult = (overrides = {}) => ({
  id: 'test-result-1',
  title: 'Test Product',
  description: 'Test description',
  price: '৳1000',
  category: 'Electronics',
  rating: 4.5,
  reviews: 100,
  ...overrides,
});

export const createMockAPIResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : 'Test error',
});

// Mock timers setup
export const setupMockTimers = () => {
  jest.useFakeTimers();
  return () => jest.useRealTimers();
};

// Test constants
export const TEST_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 5000,
  CACHE_TTL: 300000,
  MIN_QUERY_LENGTH: 2,
};