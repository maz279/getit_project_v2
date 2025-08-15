/**
 * Test Utilities
 * Phase 1 Week 5-6: Testing Infrastructure
 * Reusable testing utilities and helpers
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import store slices
import authSlice from '../../store/slices/authSlice';
import cartSlice from '../../store/slices/cartSlice';
import userSlice from '../../store/slices/userSlice';
import themeSlice from '../../store/slices/themeSlice';
import notificationSlice from '../../store/slices/notificationSlice';
import { apiSlice } from '../../store/api/apiSlice';

// Create a custom render function with providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: any;
  store?: any;
  route?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authSlice,
        cart: cartSlice,
        user: userSlice,
        theme: themeSlice,
        notification: notificationSlice,
        api: apiSlice.reducer,
      },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
          },
        }).concat(apiSlice.middleware),
    }),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    // Set initial route
    window.history.pushState({}, 'Test page', route);
    
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data generators
export const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer' as const,
};

export const mockProduct = {
  id: 'product-123',
  name: 'Test Product',
  price: 99.99,
  image: '/test-image.jpg',
  description: 'Test product description',
  category: 'electronics',
  inStock: true,
  vendor: {
    id: 'vendor-123',
    name: 'Test Vendor',
  },
};

export const mockCartItem = {
  id: 'cart-item-123',
  productId: 'product-123',
  name: 'Test Product',
  price: 99.99,
  quantity: 2,
  image: '/test-image.jpg',
  vendorId: 'vendor-123',
  vendorName: 'Test Vendor',
  maxQuantity: 10,
};

export const mockOrder = {
  id: 'order-123',
  userId: 'user-123',
  items: [mockCartItem],
  total: 199.98,
  status: 'pending' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test helpers
export const waitForLoadingToFinish = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cart: cartSlice,
      user: userSlice,
      theme: themeSlice,
      notification: notificationSlice,
      api: apiSlice.reducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }).concat(apiSlice.middleware),
  });
};

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

// Performance testing utilities
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('axe-core');
  const results = await axe(container);
  return results.violations.length === 0;
};

// Form testing utilities
export const fillForm = (container: HTMLElement, data: Record<string, string>) => {
  Object.entries(data).forEach(([name, value]) => {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
};

// Mobile testing utilities
export const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667,
  });
  window.dispatchEvent(new Event('resize'));
};

export const setDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1920,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1080,
  });
  window.dispatchEvent(new Event('resize'));
};

// Bangladesh-specific test utilities
export const setBangladeshLocale = () => {
  Object.defineProperty(navigator, 'language', {
    writable: true,
    configurable: true,
    value: 'bn-BD',
  });
  Object.defineProperty(navigator, 'languages', {
    writable: true,
    configurable: true,
    value: ['bn-BD', 'en-US'],
  });
};

export const setTakasCurrency = () => {
  Object.defineProperty(Intl, 'NumberFormat', {
    writable: true,
    configurable: true,
    value: jest.fn(() => ({
      format: (value: number) => `৳${value.toLocaleString()}`,
    })),
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';