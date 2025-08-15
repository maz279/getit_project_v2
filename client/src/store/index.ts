/**
 * PHASE 2: REDUX TOOLKIT STORE CONFIGURATION
 * Centralized state management for enterprise-grade architecture
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Slice imports
import moderationSlice from './slices/moderationSlice';
import dashboardSlice from './slices/dashboardSlice';
import performanceSlice from './slices/performanceSlice';
import uiSlice from './slices/uiSlice';
import searchSlice from './slices/searchSlice';
import phase3AISlice from './slices/phase3AISlice';
import phase4MobileSlice from './slices/phase4MobileSlice';

// Middleware imports
import { performanceMiddleware } from './middleware/performanceMiddleware';
import { loggingMiddleware } from './middleware/loggingMiddleware';

// Root reducer configuration
const rootReducer = combineReducers({
  moderation: moderationSlice.reducer,
  dashboard: dashboardSlice.reducer,
  performance: performanceSlice.reducer,
  ui: uiSlice.reducer,
  search: searchSlice.reducer,
  phase3AI: phase3AISlice,
  phase4Mobile: phase4MobileSlice,
});

// Persistence configuration
const persistConfig = {
  key: 'getit-bangladesh-v1',
  storage,
  whitelist: ['ui', 'search'], // Only persist UI and search state
  blacklist: ['moderation', 'dashboard', 'performance', 'phase3AI', 'phase4Mobile'], // Don't persist sensitive data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration with performance optimization
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['performance.metrics'], // Ignore performance metrics for serialization
      },
      immutableCheck: {
        warnAfter: 128, // Warn after 128ms
      },
    })
    .concat(performanceMiddleware)
    .concat(loggingMiddleware),
  devTools: process.env.NODE_ENV !== 'production' && {
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      type: action.type,
    }),
    stateSanitizer: (state) => ({
      ...state,
      // Don't log sensitive moderation data in development
      moderation: state.moderation ? { ...state.moderation, products: '[HIDDEN]' } : undefined,
    }),
  },
});

// Persistor for state persistence
export const persistor = persistStore(store);

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Selector type helpers
export type AppSelector<T> = (state: RootState) => T;

// Performance monitoring integration
if (process.env.NODE_ENV === 'development') {
  // Monitor store performance in development
  let lastUpdateTime = performance.now();
  
  store.subscribe(() => {
    const currentTime = performance.now();
    const updateTime = currentTime - lastUpdateTime;
    
    if (updateTime > 16) { // If update takes longer than 1 frame (16ms)
      console.warn(`Store update took ${updateTime.toFixed(2)}ms - consider optimization`);
    }
    
    lastUpdateTime = currentTime;
  });
}

// Store cleanup on unmount (for testing)
export const cleanupStore = () => {
  if (persistor) {
    persistor.purge();
  }
};

// Export store instance as default
export default store;