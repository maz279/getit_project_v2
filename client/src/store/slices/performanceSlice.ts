/**
 * PHASE 2: PERFORMANCE MONITORING SLICE
 * Component performance tracking and optimization metrics
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Performance metric interfaces
export interface ComponentMetrics {
  readonly componentName: string;
  readonly renderTime: number;
  readonly mountTime: number;
  readonly updateCount: number;
  readonly lastRenderTime: number;
  readonly averageRenderTime: number;
  readonly memoryUsage?: number;
  readonly timestamp: number;
}

export interface BundleMetrics {
  readonly totalSize: number;
  readonly loadTime: number;
  readonly cacheHitRate: number;
  readonly lazyLoadedComponents: string[];
  readonly criticalComponents: string[];
  readonly timestamp: number;
}

export interface PerformanceAlert {
  readonly id: string;
  readonly type: 'slow-render' | 'memory-leak' | 'large-bundle' | 'cache-miss';
  readonly componentName: string;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly timestamp: number;
  readonly resolved: boolean;
}

export interface SystemMetrics {
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly networkRequests: number;
  readonly cacheSize: number;
  readonly timestamp: number;
}

interface PerformanceState {
  // Component performance data
  componentMetrics: Record<string, ComponentMetrics>;
  
  // Bundle and loading metrics
  bundleMetrics: BundleMetrics | null;
  
  // Performance alerts
  alerts: PerformanceAlert[];
  
  // System performance
  systemMetrics: SystemMetrics | null;
  
  // Performance thresholds
  thresholds: {
    renderTime: number; // ms
    memoryUsage: number; // MB
    bundleSize: number; // KB
    cacheHitRate: number; // percentage
  };
  
  // Monitoring configuration
  isMonitoring: boolean;
  samplingRate: number; // percentage (0-100)
  
  // Statistics
  totalComponents: number;
  slowComponents: string[];
  optimizedComponents: string[];
  
  // Performance scores
  overallScore: number;
  lastCalculated: number;
}

// Initial state
const initialState: PerformanceState = {
  componentMetrics: {},
  bundleMetrics: null,
  alerts: [],
  systemMetrics: null,
  thresholds: {
    renderTime: 16, // 60fps = 16ms per frame
    memoryUsage: 100, // 100MB
    bundleSize: 500, // 500KB
    cacheHitRate: 80, // 80%
  },
  isMonitoring: process.env.NODE_ENV === 'development',
  samplingRate: 10, // 10% sampling in production
  totalComponents: 0,
  slowComponents: [],
  optimizedComponents: [],
  overallScore: 100,
  lastCalculated: 0,
};

// Async thunks
export const calculatePerformanceScore = createAsyncThunk(
  'performance/calculateScore',
  async (_, { getState }) => {
    const state = getState() as { performance: PerformanceState };
    const { componentMetrics, bundleMetrics, alerts } = state.performance;
    
    let score = 100;
    
    // Penalize slow components
    Object.values(componentMetrics).forEach(metric => {
      if (metric.averageRenderTime > 16) {
        score -= Math.min(20, (metric.averageRenderTime - 16) / 2);
      }
    });
    
    // Penalize large bundle size
    if (bundleMetrics && bundleMetrics.totalSize > 500000) { // 500KB
      score -= Math.min(20, (bundleMetrics.totalSize - 500000) / 50000);
    }
    
    // Penalize low cache hit rate
    if (bundleMetrics && bundleMetrics.cacheHitRate < 80) {
      score -= (80 - bundleMetrics.cacheHitRate) / 4;
    }
    
    // Penalize unresolved critical alerts
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved);
    score -= criticalAlerts.length * 10;
    
    return Math.max(0, Math.round(score));
  }
);

export const optimizeComponent = createAsyncThunk(
  'performance/optimizeComponent',
  async (componentName: string, { getState }) => {
    // Simulate component optimization
    const state = getState() as { performance: PerformanceState };
    const metric = state.performance.componentMetrics[componentName];
    
    if (metric) {
      // Simulate optimization improvements
      const optimizedMetric: ComponentMetrics = {
        ...metric,
        averageRenderTime: metric.averageRenderTime * 0.7, // 30% improvement
        lastRenderTime: metric.lastRenderTime * 0.7,
        timestamp: Date.now(),
      };
      
      return { componentName, optimizedMetric };
    }
    
    throw new Error(`Component ${componentName} not found`);
  }
);

// Slice definition
const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    // Component metrics tracking
    updateComponentMetrics: (state, action: PayloadAction<ComponentMetrics>) => {
      const { componentName } = action.payload;
      const existing = state.componentMetrics[componentName];
      
      if (existing) {
        // Update existing metrics with running averages
        const totalRenders = existing.updateCount + 1;
        const newAverageRenderTime = (existing.averageRenderTime * existing.updateCount + action.payload.renderTime) / totalRenders;
        
        state.componentMetrics[componentName] = {
          ...action.payload,
          updateCount: totalRenders,
          averageRenderTime: newAverageRenderTime,
        };
      } else {
        // New component metrics
        state.componentMetrics[componentName] = {
          ...action.payload,
          updateCount: 1,
          averageRenderTime: action.payload.renderTime,
        };
        state.totalComponents += 1;
      }
      
      // Check for performance issues
      if (action.payload.renderTime > state.thresholds.renderTime) {
        if (!state.slowComponents.includes(componentName)) {
          state.slowComponents.push(componentName);
        }
        
        // Create performance alert
        const alert: PerformanceAlert = {
          id: `slow-render-${componentName}-${Date.now()}`,
          type: 'slow-render',
          componentName,
          message: `Component ${componentName} rendered in ${action.payload.renderTime.toFixed(2)}ms (threshold: ${state.thresholds.renderTime}ms)`,
          severity: action.payload.renderTime > 50 ? 'critical' : 'high',
          timestamp: Date.now(),
          resolved: false,
        };
        
        state.alerts.push(alert);
      }
    },
    
    // Bundle metrics tracking
    updateBundleMetrics: (state, action: PayloadAction<BundleMetrics>) => {
      state.bundleMetrics = action.payload;
      
      // Check bundle size threshold
      if (action.payload.totalSize > state.thresholds.bundleSize * 1000) {
        const alert: PerformanceAlert = {
          id: `large-bundle-${Date.now()}`,
          type: 'large-bundle',
          componentName: 'bundle',
          message: `Bundle size ${(action.payload.totalSize / 1000).toFixed(0)}KB exceeds threshold ${state.thresholds.bundleSize}KB`,
          severity: 'medium',
          timestamp: Date.now(),
          resolved: false,
        };
        
        state.alerts.push(alert);
      }
    },
    
    // System metrics tracking
    updateSystemMetrics: (state, action: PayloadAction<SystemMetrics>) => {
      state.systemMetrics = action.payload;
      
      // Check memory usage threshold
      if (action.payload.memoryUsage > state.thresholds.memoryUsage) {
        const alert: PerformanceAlert = {
          id: `memory-leak-${Date.now()}`,
          type: 'memory-leak',
          componentName: 'system',
          message: `Memory usage ${action.payload.memoryUsage.toFixed(0)}MB exceeds threshold ${state.thresholds.memoryUsage}MB`,
          severity: action.payload.memoryUsage > state.thresholds.memoryUsage * 1.5 ? 'critical' : 'high',
          timestamp: Date.now(),
          resolved: false,
        };
        
        state.alerts.push(alert);
      }
    },
    
    // Alert management
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.resolved = true;
      }
    },
    
    clearResolvedAlerts: (state) => {
      state.alerts = state.alerts.filter(alert => !alert.resolved);
    },
    
    clearAllAlerts: (state) => {
      state.alerts = [];
    },
    
    // Performance thresholds configuration
    updateThresholds: (state, action: PayloadAction<Partial<PerformanceState['thresholds']>>) => {
      state.thresholds = { ...state.thresholds, ...action.payload };
    },
    
    // Monitoring configuration
    setMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isMonitoring = action.payload;
    },
    
    setSamplingRate: (state, action: PayloadAction<number>) => {
      state.samplingRate = Math.max(0, Math.min(100, action.payload));
    },
    
    // Component optimization tracking
    markComponentOptimized: (state, action: PayloadAction<string>) => {
      const componentName = action.payload;
      
      if (!state.optimizedComponents.includes(componentName)) {
        state.optimizedComponents.push(componentName);
      }
      
      // Remove from slow components if present
      state.slowComponents = state.slowComponents.filter(name => name !== componentName);
    },
    
    // Reset performance data
    resetMetrics: (state) => {
      state.componentMetrics = {};
      state.alerts = [];
      state.slowComponents = [];
      state.optimizedComponents = [];
      state.totalComponents = 0;
      state.overallScore = 100;
    },
    
    // Sampling control
    shouldSample: (state) => {
      // Determine if this interaction should be sampled
      return Math.random() * 100 < state.samplingRate;
    },
  },
  
  extraReducers: (builder) => {
    // Calculate performance score
    builder
      .addCase(calculatePerformanceScore.fulfilled, (state, action) => {
        state.overallScore = action.payload;
        state.lastCalculated = Date.now();
      });
    
    // Component optimization
    builder
      .addCase(optimizeComponent.fulfilled, (state, action) => {
        const { componentName, optimizedMetric } = action.payload;
        state.componentMetrics[componentName] = optimizedMetric;
        
        if (!state.optimizedComponents.includes(componentName)) {
          state.optimizedComponents.push(componentName);
        }
        
        // Remove from slow components
        state.slowComponents = state.slowComponents.filter(name => name !== componentName);
      });
  },
});

// Export actions
export const {
  updateComponentMetrics,
  updateBundleMetrics,
  updateSystemMetrics,
  resolveAlert,
  clearResolvedAlerts,
  clearAllAlerts,
  updateThresholds,
  setMonitoring,
  setSamplingRate,
  markComponentOptimized,
  resetMetrics,
  shouldSample,
} = performanceSlice.actions;

// Export slice reducer
export default performanceSlice;