/**
 * PHASE 2: DASHBOARD STATE SLICE
 * Admin dashboard state management with analytics and widgets
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Dashboard widget interfaces
export interface DashboardWidget {
  readonly id: string;
  readonly type: 'stats' | 'chart' | 'table' | 'alert' | 'activity' | 'performance';
  readonly title: string;
  readonly position: { x: number; y: number; w: number; h: number };
  readonly visible: boolean;
  readonly data?: any;
  readonly refreshInterval?: number; // seconds
  readonly lastUpdated?: number;
}

export interface DashboardStats {
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly totalCustomers: number;
  readonly totalVendors: number;
  readonly pendingProducts: number;
  readonly activeProducts: number;
  readonly averageOrderValue: number;
  readonly conversionRate: number;
  readonly customerSatisfaction: number;
  readonly systemHealth: number;
}

export interface DashboardChart {
  readonly id: string;
  readonly type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  readonly title: string;
  readonly data: Array<{
    readonly label: string;
    readonly value: number;
    readonly date?: string;
    readonly category?: string;
  }>;
  readonly period: '24h' | '7d' | '30d' | '90d' | '1y';
  readonly metrics: string[];
}

export interface RecentActivity {
  readonly id: string;
  readonly type: 'order' | 'user' | 'product' | 'vendor' | 'system';
  readonly action: string;
  readonly description: string;
  readonly user?: string;
  readonly timestamp: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly metadata?: Record<string, any>;
}

export interface SystemAlert {
  readonly id: string;
  readonly type: 'error' | 'warning' | 'info' | 'success';
  readonly title: string;
  readonly message: string;
  readonly timestamp: number;
  readonly resolved: boolean;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly source: string;
  readonly actionRequired: boolean;
}

export interface DashboardLayout {
  readonly name: string;
  readonly description: string;
  readonly widgets: DashboardWidget[];
  readonly isDefault: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}

interface DashboardState {
  // Dashboard configuration
  currentLayout: string;
  availableLayouts: DashboardLayout[];
  customLayouts: DashboardLayout[];
  
  // Dashboard data
  stats: DashboardStats | null;
  charts: DashboardChart[];
  recentActivity: RecentActivity[];
  systemAlerts: SystemAlert[];
  
  // Widget management
  widgets: DashboardWidget[];
  widgetData: Record<string, any>;
  
  // Time range and filters
  timeRange: '24h' | '7d' | '30d' | '90d' | '1y';
  dateRange: {
    start?: string;
    end?: string;
  };
  filters: {
    category: string[];
    vendor: string[];
    status: string[];
  };
  
  // Loading states
  loading: {
    stats: boolean;
    charts: boolean;
    activity: boolean;
    alerts: boolean;
    widgets: Record<string, boolean>;
  };
  
  // Error states
  errors: {
    stats: string | null;
    charts: string | null;
    activity: string | null;
    alerts: string | null;
    widgets: Record<string, string | null>;
  };
  
  // UI state
  sidebarCollapsed: boolean;
  fullScreenWidget: string | null;
  editMode: boolean;
  
  // Auto-refresh configuration
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  lastRefresh: number;
  
  // Performance metrics
  loadTimes: Record<string, number>;
  errorCounts: Record<string, number>;
}

// Initial state
const initialState: DashboardState = {
  currentLayout: 'default',
  availableLayouts: [],
  customLayouts: [],
  
  stats: null,
  charts: [],
  recentActivity: [],
  systemAlerts: [],
  
  widgets: [],
  widgetData: {},
  
  timeRange: '7d',
  dateRange: {},
  filters: {
    category: [],
    vendor: [],
    status: [],
  },
  
  loading: {
    stats: false,
    charts: false,
    activity: false,
    alerts: false,
    widgets: {},
  },
  
  errors: {
    stats: null,
    charts: null,
    activity: null,
    alerts: null,
    widgets: {},
  },
  
  sidebarCollapsed: false,
  fullScreenWidget: null,
  editMode: false,
  
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
  lastRefresh: 0,
  
  loadTimes: {},
  errorCounts: {},
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async ({ timeRange }: { timeRange: string }, { rejectWithValue }) => {
    try {
      const startTime = performance.now();
      
      const response = await fetch(`/api/admin/dashboard/stats?period=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Stats fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        stats: data,
        loadTime: performance.now() - startTime,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch stats');
    }
  }
);

export const fetchDashboardCharts = createAsyncThunk(
  'dashboard/fetchCharts',
  async ({ 
    timeRange, 
    metrics 
  }: { 
    timeRange: string; 
    metrics: string[];
  }, { rejectWithValue }) => {
    try {
      const startTime = performance.now();
      
      const params = new URLSearchParams({
        period: timeRange,
        metrics: metrics.join(','),
      });
      
      const response = await fetch(`/api/admin/dashboard/charts?${params}`);
      
      if (!response.ok) {
        throw new Error(`Charts fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        charts: data.charts || [],
        loadTime: performance.now() - startTime,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch charts');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchActivity',
  async ({ limit }: { limit: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/dashboard/activity?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Activity fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.activities || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch activity');
    }
  }
);

export const fetchSystemAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/dashboard/alerts');
      
      if (!response.ok) {
        throw new Error(`Alerts fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.alerts || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch alerts');
    }
  }
);

export const fetchWidgetData = createAsyncThunk(
  'dashboard/fetchWidgetData',
  async ({ 
    widgetId, 
    widgetType, 
    params 
  }: {
    widgetId: string;
    widgetType: string;
    params?: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const startTime = performance.now();
      
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`/api/admin/dashboard/widgets/${widgetType}?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Widget data fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        widgetId,
        data,
        loadTime: performance.now() - startTime,
      };
    } catch (error) {
      return rejectWithValue({
        widgetId,
        error: error instanceof Error ? error.message : 'Failed to fetch widget data',
      });
    }
  }
);

export const saveDashboardLayout = createAsyncThunk(
  'dashboard/saveLayout',
  async ({ 
    layout, 
    name 
  }: {
    layout: DashboardLayout;
    name: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/dashboard/layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout, name }),
      });
      
      if (!response.ok) {
        throw new Error(`Layout save failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save layout');
    }
  }
);

// Slice definition
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Layout management
    setCurrentLayout: (state, action: PayloadAction<string>) => {
      state.currentLayout = action.payload;
    },
    
    addCustomLayout: (state, action: PayloadAction<DashboardLayout>) => {
      state.customLayouts.push(action.payload);
    },
    
    updateCustomLayout: (state, action: PayloadAction<{ name: string; layout: DashboardLayout }>) => {
      const index = state.customLayouts.findIndex(layout => layout.name === action.payload.name);
      if (index !== -1) {
        state.customLayouts[index] = action.payload.layout;
      }
    },
    
    deleteCustomLayout: (state, action: PayloadAction<string>) => {
      state.customLayouts = state.customLayouts.filter(layout => layout.name !== action.payload);
    },
    
    // Widget management
    addWidget: (state, action: PayloadAction<DashboardWidget>) => {
      state.widgets.push(action.payload);
    },
    
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<DashboardWidget> }>) => {
      const index = state.widgets.findIndex(widget => widget.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = { ...state.widgets[index], ...action.payload.updates };
      }
    },
    
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
      delete state.widgetData[action.payload];
    },
    
    toggleWidgetVisibility: (state, action: PayloadAction<string>) => {
      const widget = state.widgets.find(w => w.id === action.payload);
      if (widget) {
        widget.visible = !widget.visible;
      }
    },
    
    // Time range and filters
    setTimeRange: (state, action: PayloadAction<DashboardState['timeRange']>) => {
      state.timeRange = action.payload;
    },
    
    setDateRange: (state, action: PayloadAction<{ start?: string; end?: string }>) => {
      state.dateRange = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<DashboardState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // UI state
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    setFullScreenWidget: (state, action: PayloadAction<string | null>) => {
      state.fullScreenWidget = action.payload;
    },
    
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },
    
    // Auto-refresh configuration
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    
    updateLastRefresh: (state) => {
      state.lastRefresh = Date.now();
    },
    
    // Alert management
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.systemAlerts.find(a => a.id === action.payload);
      if (alert) {
        alert.resolved = true;
      }
    },
    
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.systemAlerts = state.systemAlerts.filter(alert => alert.id !== action.payload);
    },
    
    clearResolvedAlerts: (state) => {
      state.systemAlerts = state.systemAlerts.filter(alert => !alert.resolved);
    },
    
    // Error handling
    clearError: (state, action: PayloadAction<keyof DashboardState['errors'] | { type: 'widget'; id: string }>) => {
      if (typeof action.payload === 'string') {
        state.errors[action.payload] = null;
      } else if (action.payload.type === 'widget') {
        delete state.errors.widgets[action.payload.id];
      }
    },
    
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        if (key === 'widgets') {
          state.errors.widgets = {};
        } else {
          state.errors[key as keyof Omit<DashboardState['errors'], 'widgets'>] = null;
        }
      });
    },
    
    // Performance tracking
    recordLoadTime: (state, action: PayloadAction<{ component: string; time: number }>) => {
      state.loadTimes[action.payload.component] = action.payload.time;
    },
    
    incrementErrorCount: (state, action: PayloadAction<string>) => {
      state.errorCounts[action.payload] = (state.errorCounts[action.payload] || 0) + 1;
    },
    
    // Reset dashboard state
    resetDashboard: (state) => {
      Object.assign(state, initialState);
    },
  },
  
  extraReducers: (builder) => {
    // Fetch dashboard stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload.stats;
        state.loadTimes.stats = action.payload.loadTime;
        state.lastRefresh = Date.now();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload as string;
        state.errorCounts.stats = (state.errorCounts.stats || 0) + 1;
      });
    
    // Fetch dashboard charts
    builder
      .addCase(fetchDashboardCharts.pending, (state) => {
        state.loading.charts = true;
        state.errors.charts = null;
      })
      .addCase(fetchDashboardCharts.fulfilled, (state, action) => {
        state.loading.charts = false;
        state.charts = action.payload.charts;
        state.loadTimes.charts = action.payload.loadTime;
      })
      .addCase(fetchDashboardCharts.rejected, (state, action) => {
        state.loading.charts = false;
        state.errors.charts = action.payload as string;
        state.errorCounts.charts = (state.errorCounts.charts || 0) + 1;
      });
    
    // Fetch recent activity
    builder
      .addCase(fetchRecentActivity.pending, (state) => {
        state.loading.activity = true;
        state.errors.activity = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.loading.activity = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.loading.activity = false;
        state.errors.activity = action.payload as string;
        state.errorCounts.activity = (state.errorCounts.activity || 0) + 1;
      });
    
    // Fetch system alerts
    builder
      .addCase(fetchSystemAlerts.pending, (state) => {
        state.loading.alerts = true;
        state.errors.alerts = null;
      })
      .addCase(fetchSystemAlerts.fulfilled, (state, action) => {
        state.loading.alerts = false;
        state.systemAlerts = action.payload;
      })
      .addCase(fetchSystemAlerts.rejected, (state, action) => {
        state.loading.alerts = false;
        state.errors.alerts = action.payload as string;
        state.errorCounts.alerts = (state.errorCounts.alerts || 0) + 1;
      });
    
    // Fetch widget data
    builder
      .addCase(fetchWidgetData.pending, (state, action) => {
        const { widgetId } = action.meta.arg;
        state.loading.widgets[widgetId] = true;
        delete state.errors.widgets[widgetId];
      })
      .addCase(fetchWidgetData.fulfilled, (state, action) => {
        const { widgetId, data, loadTime } = action.payload;
        state.loading.widgets[widgetId] = false;
        state.widgetData[widgetId] = data;
        state.loadTimes[`widget-${widgetId}`] = loadTime;
        
        // Update widget last updated timestamp
        const widget = state.widgets.find(w => w.id === widgetId);
        if (widget) {
          widget.lastUpdated = Date.now();
        }
      })
      .addCase(fetchWidgetData.rejected, (state, action) => {
        const { widgetId, error } = action.payload as { widgetId: string; error: string };
        state.loading.widgets[widgetId] = false;
        state.errors.widgets[widgetId] = error;
        state.errorCounts[`widget-${widgetId}`] = (state.errorCounts[`widget-${widgetId}`] || 0) + 1;
      });
    
    // Save dashboard layout
    builder
      .addCase(saveDashboardLayout.fulfilled, (state, action) => {
        const savedLayout = action.payload;
        
        // Add to custom layouts if not already present
        const existingIndex = state.customLayouts.findIndex(layout => layout.name === savedLayout.name);
        if (existingIndex !== -1) {
          state.customLayouts[existingIndex] = savedLayout;
        } else {
          state.customLayouts.push(savedLayout);
        }
      });
  },
});

// Export actions
export const {
  setCurrentLayout,
  addCustomLayout,
  updateCustomLayout,
  deleteCustomLayout,
  addWidget,
  updateWidget,
  removeWidget,
  toggleWidgetVisibility,
  setTimeRange,
  setDateRange,
  updateFilters,
  clearFilters,
  toggleSidebar,
  setSidebarCollapsed,
  setFullScreenWidget,
  setEditMode,
  setAutoRefresh,
  setRefreshInterval,
  updateLastRefresh,
  resolveAlert,
  dismissAlert,
  clearResolvedAlerts,
  clearError,
  clearAllErrors,
  recordLoadTime,
  incrementErrorCount,
  resetDashboard,
} = dashboardSlice.actions;

// Export slice reducer
export default dashboardSlice;