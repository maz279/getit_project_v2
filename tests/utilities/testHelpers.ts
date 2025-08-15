/**
 * GetIt Bangladesh - Test Utilities and Helpers
 * Common test utilities following software engineering principles
 */

import React from 'react';
import '@testing-library/jest-dom';

// Mock data generators
export const createMockProduct = (overrides = {}) => ({
  id: 'product-1',
  name: 'Test Product',
  price: 1000,
  currency: '৳',
  category: 'Electronics',
  vendor: 'Test Vendor',
  rating: 4.5,
  reviews: 100,
  inStock: true,
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
  location: 'Dhaka',
  ...overrides
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  userId: 'user-1',
  products: [createMockProduct()],
  total: 1000,
  status: 'pending',
  createdAt: new Date().toISOString(),
  ...overrides
});

// API mock helpers
export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
  timestamp: new Date().toISOString()
});

export const mockApiError = (message = 'Test error', code = 400) => ({
  success: false,
  error: {
    message,
    code,
    timestamp: new Date().toISOString()
  }
});

// Component testing utilities
export const renderWithProviders = (
  ui: React.ReactElement,
  options = {}
) => {
  // Mock providers for testing
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement('div', { 'data-testid': 'test-providers' }, children);
  };

  const { render } = require('@testing-library/react');
  return render(ui, {
    wrapper: AllTheProviders,
    ...options
  });
};

// Event simulation helpers
export const simulateUserTyping = async (input: HTMLElement, text: string) => {
  const { userEvent } = await import('@testing-library/user-event');
  await userEvent.type(input, text);
};

export const simulateClick = async (element: HTMLElement) => {
  const { userEvent } = await import('@testing-library/user-event');
  await userEvent.click(element);
};

// Wait utilities
export const waitForElement = async (selector: string, timeout = 5000) => {
  const { waitFor, screen } = await import('@testing-library/react');
  return waitFor(() => screen.getByTestId(selector), { timeout });
};

// Performance testing helpers
export const measureRenderTime = (component: React.ComponentType) => {
  const start = performance.now();
  const { render } = require('@testing-library/react');
  render(React.createElement(component));
  const end = performance.now();
  return end - start;
};

// Mock localStorage and sessionStorage
export const mockStorage = () => {
  const storage: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    })
  };
};

// Test assertion helpers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectApiCallToHaveBeenMade = (mockFn: jest.Mock, url: string, method = 'GET') => {
  expect(mockFn).toHaveBeenCalledWith(
    expect.stringContaining(url),
    expect.objectContaining({ method })
  );
};

// Bangladesh-specific test data
export const bangladeshTestData = {
  locations: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'],
  currencies: ['৳', 'BDT'],
  paymentMethods: ['bKash', 'Nagad', 'Rocket', 'DBBL', 'Credit Card'],
  languages: ['bn', 'en'],
  popular_products: [
    'Samsung Galaxy Phone',
    'MacBook Air',
    'iPhone 15',
    'Xiaomi Redmi',
    'Dell Laptop'
  ]
};

export default {
  createMockProduct,
  createMockUser,
  createMockOrder,
  mockApiResponse,
  mockApiError,
  renderWithProviders,
  simulateUserTyping,
  simulateClick,
  waitForElement,
  measureRenderTime,
  mockStorage,
  expectElementToBeVisible,
  expectApiCallToHaveBeenMade,
  bangladeshTestData
};