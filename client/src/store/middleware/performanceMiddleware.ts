/**
 * PHASE 2: PERFORMANCE MONITORING MIDDLEWARE
 * Redux middleware for tracking component performance metrics
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { Middleware } from '@reduxjs/toolkit';
import { updateComponentMetrics, updateSystemMetrics } from '../slices/performanceSlice';

// Performance monitoring configuration
interface PerformanceConfig {
  enabled: boolean;
  samplingRate: number;
  slowActionThreshold: number; // ms
  memoryTrackingInterval: number; // ms
}

const defaultConfig: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'development',
  samplingRate: 10, // 10% sampling in production
  slowActionThreshold: 100, // 100ms
  memoryTrackingInterval: 30000, // 30 seconds
};

// Memory tracking variables
let memoryTrackingInterval: NodeJS.Timeout | null = null;
let lastMemoryCheck = 0;

// Action performance tracking
const actionPerformanceMap = new Map<string, { startTime: number; count: number; totalTime: number }>();

// Sample decision function
const shouldSample = (samplingRate: number): boolean => {
  return Math.random() * 100 < samplingRate;
};

// Get memory usage (if available)
const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    // Chrome/Edge specific
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return 0;
};

// System metrics collection
const collectSystemMetrics = () => {
  const now = performance.now();
  const memoryUsage = getMemoryUsage();
  
  return {
    memoryUsage,
    cpuUsage: 0, // CPU usage not available in browser
    networkRequests: 0, // Would need to be tracked separately
    cacheSize: 0, // Would need to be tracked separately
    timestamp: now,
  };
};

// Start memory tracking
const startMemoryTracking = (dispatch: any, config: PerformanceConfig) => {
  if (memoryTrackingInterval) {
    clearInterval(memoryTrackingInterval);
  }
  
  memoryTrackingInterval = setInterval(() => {
    const metrics = collectSystemMetrics();
    dispatch(updateSystemMetrics(metrics));
  }, config.memoryTrackingInterval);
};

// Stop memory tracking
const stopMemoryTracking = () => {
  if (memoryTrackingInterval) {
    clearInterval(memoryTrackingInterval);
    memoryTrackingInterval = null;
  }
};

// Performance middleware
export const performanceMiddleware: Middleware = (store) => (next) => (action) => {
  const config = defaultConfig;
  
  // Skip if performance monitoring is disabled
  if (!config.enabled) {
    return next(action);
  }
  
  // Sample based on configuration
  if (!shouldSample(config.samplingRate)) {
    return next(action);
  }
  
  const actionType = action.type;
  const startTime = performance.now();
  
  // Track action start
  const existing = actionPerformanceMap.get(actionType);
  if (existing) {
    existing.count += 1;
  } else {
    actionPerformanceMap.set(actionType, { startTime, count: 1, totalTime: 0 });
  }
  
  // Execute the action
  const result = next(action);
  
  // Measure action duration
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Update performance tracking
  const actionData = actionPerformanceMap.get(actionType);
  if (actionData) {
    actionData.totalTime += duration;
    
    // Warn about slow actions
    if (duration > config.slowActionThreshold) {
      console.warn(`Slow Redux action detected: ${actionType} took ${duration.toFixed(2)}ms`);
      
      // Dispatch performance metrics update for slow actions
      store.dispatch(updateComponentMetrics({
        componentName: `Redux:${actionType}`,
        renderTime: duration,
        mountTime: 0,
        updateCount: actionData.count,
        lastRenderTime: duration,
        averageRenderTime: actionData.totalTime / actionData.count,
        timestamp: endTime,
      }));
    }
  }
  
  // Start memory tracking on first action
  if (!memoryTrackingInterval) {
    startMemoryTracking(store.dispatch, config);
  }
  
  // Periodic system metrics collection
  const now = Date.now();
  if (now - lastMemoryCheck > config.memoryTrackingInterval) {
    const systemMetrics = collectSystemMetrics();
    store.dispatch(updateSystemMetrics(systemMetrics));
    lastMemoryCheck = now;
  }
  
  return result;
};

// Performance monitoring utilities
export const performanceUtils = {
  // Enable/disable performance monitoring
  configure: (newConfig: Partial<PerformanceConfig>) => {
    Object.assign(defaultConfig, newConfig);
  },
  
  // Get action performance statistics
  getActionStats: () => {
    const stats: Array<{
      actionType: string;
      count: number;
      totalTime: number;
      averageTime: number;
    }> = [];
    
    actionPerformanceMap.forEach((data, actionType) => {
      stats.push({
        actionType,
        count: data.count,
        totalTime: data.totalTime,
        averageTime: data.totalTime / data.count,
      });
    });
    
    return stats.sort((a, b) => b.averageTime - a.averageTime);
  },
  
  // Clear performance statistics
  clearStats: () => {
    actionPerformanceMap.clear();
  },
  
  // Start/stop memory tracking manually
  startMemoryTracking: (dispatch: any) => startMemoryTracking(dispatch, defaultConfig),
  stopMemoryTracking,
  
  // Performance report
  generateReport: () => {
    const actionStats = performanceUtils.getActionStats();
    const memoryUsage = getMemoryUsage();
    
    return {
      timestamp: new Date().toISOString(),
      memoryUsage: `${memoryUsage.toFixed(2)} MB`,
      totalActions: actionStats.reduce((sum, stat) => sum + stat.count, 0),
      slowestActions: actionStats.slice(0, 5),
      averageActionTime: actionStats.length > 0 
        ? actionStats.reduce((sum, stat) => sum + stat.averageTime, 0) / actionStats.length 
        : 0,
    };
  },
};

// Export configuration for external access
export { defaultConfig as performanceConfig };

// Cleanup function for testing
export const cleanupPerformanceMiddleware = () => {
  stopMemoryTracking();
  actionPerformanceMap.clear();
  lastMemoryCheck = 0;
};