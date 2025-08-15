// Redux Store Configuration
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level State Management
// Enterprise-grade state management for multi-vendor e-commerce platform

import { configureStore } from '@reduxjs/toolkit';

// Import all slice reducers
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import vendorsReducer from './slices/vendorsSlice';
import ordersReducer from './slices/ordersSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import filtersReducer from './slices/filtersSlice';
import wishlistReducer from './slices/wishlistSlice';

// Store configuration with Redux Toolkit
export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    vendors: vendorsReducer,
    orders: ordersReducer,
    user: userReducer,
    ui: uiReducer,
    filters: filtersReducer,
    wishlist: wishlistReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export action creators for easy access
export * from './slices/productsSlice';
export * from './slices/categoriesSlice';
export * from './slices/vendorsSlice';
export * from './slices/ordersSlice';
export * from './slices/userSlice';
export * from './slices/uiSlice';
export * from './slices/filtersSlice';
export * from './slices/wishlistSlice';

export default store;