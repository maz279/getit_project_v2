/**
 * PHASE 2: MODERATION STATE SLICE
 * Product moderation workflow state management
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types for moderation system
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly vendor: string;
  readonly category: string;
  readonly price: string;
  readonly submittedAt: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly flags: string[];
  readonly score: number;
  readonly status: 'pending-review' | 'content-review' | 'quality-check' | 'approved' | 'rejected' | 'flagged';
  readonly images?: string[];
  readonly description?: string;
  readonly moderatorNotes?: string;
}

export interface ModerationStats {
  readonly pending: number;
  readonly approved: number;
  readonly rejected: number;
  readonly flagged: number;
  readonly reviewTime: number;
  readonly accuracy: number;
  readonly escalated: number;
  readonly dailyQuota: number;
  readonly completedToday: number;
}

export interface ModerationAction {
  readonly id: string;
  readonly action: 'approved' | 'rejected' | 'flagged' | 'escalated';
  readonly product: string;
  readonly productId: string;
  readonly moderator: string;
  readonly time: string;
  readonly reason?: string;
  readonly notes?: string;
  readonly type: 'approval' | 'rejection' | 'flag' | 'escalation';
}

export interface ModerationFilter {
  readonly status: string[];
  readonly priority: string[];
  readonly category: string[];
  readonly vendor: string[];
  readonly dateRange: {
    start?: string;
    end?: string;
  };
  readonly searchQuery: string;
  readonly sortBy: 'submittedAt' | 'priority' | 'score' | 'name';
  readonly sortOrder: 'asc' | 'desc';
}

interface ModerationState {
  // Data
  products: Product[];
  stats: ModerationStats | null;
  recentActions: ModerationAction[];
  
  // UI State
  selectedProducts: string[];
  filters: ModerationFilter;
  currentPage: number;
  itemsPerPage: number;
  
  // Loading states
  loading: {
    products: boolean;
    stats: boolean;
    actions: boolean;
    bulkOperation: boolean;
  };
  
  // Error states
  errors: {
    products: string | null;
    stats: string | null;
    actions: string | null;
    bulkOperation: string | null;
  };
  
  // Performance metrics
  lastUpdated: number;
  operationCount: number;
}

// Initial state
const initialState: ModerationState = {
  products: [],
  stats: null,
  recentActions: [],
  selectedProducts: [],
  filters: {
    status: ['pending-review', 'content-review', 'quality-check'],
    priority: [],
    category: [],
    vendor: [],
    dateRange: {},
    searchQuery: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc',
  },
  currentPage: 1,
  itemsPerPage: 25,
  loading: {
    products: false,
    stats: false,
    actions: false,
    bulkOperation: false,
  },
  errors: {
    products: null,
    stats: null,
    actions: null,
    bulkOperation: null,
  },
  lastUpdated: 0,
  operationCount: 0,
};

// Async thunks
export const fetchModerationStats = createAsyncThunk(
  'moderation/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/moderation/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch stats');
    }
  }
);

export const fetchPendingProducts = createAsyncThunk(
  'moderation/fetchProducts',
  async ({ page, filters }: { page: number; filters: ModerationFilter }, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        ...filters,
        status: filters.status.join(','),
        priority: filters.priority.join(','),
        category: filters.category.join(','),
        vendor: filters.vendor.join(','),
      });
      
      const response = await fetch(`/api/admin/moderation/products?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

export const fetchRecentActions = createAsyncThunk(
  'moderation/fetchActions',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/moderation/actions?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch recent actions');
    }
  }
);

export const moderateProduct = createAsyncThunk(
  'moderation/moderateProduct',
  async ({ 
    productId, 
    action, 
    reason, 
    notes 
  }: {
    productId: string;
    action: 'approve' | 'reject' | 'flag' | 'escalate';
    reason?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/moderation/products/${productId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to moderate product');
    }
  }
);

export const bulkModerateProducts = createAsyncThunk(
  'moderation/bulkModerate',
  async ({
    productIds,
    action,
    reason,
    notes
  }: {
    productIds: string[];
    action: 'approve' | 'reject' | 'flag';
    reason?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/moderation/bulk-moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds, action, reason, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk moderate products');
    }
  }
);

// Slice definition
const moderationSlice = createSlice({
  name: 'moderation',
  initialState,
  reducers: {
    // Product selection
    selectProduct: (state, action: PayloadAction<string>) => {
      if (!state.selectedProducts.includes(action.payload)) {
        state.selectedProducts.push(action.payload);
      }
    },
    
    deselectProduct: (state, action: PayloadAction<string>) => {
      state.selectedProducts = state.selectedProducts.filter(id => id !== action.payload);
    },
    
    selectAllProducts: (state) => {
      state.selectedProducts = state.products.map(product => product.id);
    },
    
    clearSelection: (state) => {
      state.selectedProducts = [];
    },
    
    // Filters
    updateFilters: (state, action: PayloadAction<Partial<ModerationFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    
    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when page size changes
    },
    
    // Clear errors
    clearError: (state, action: PayloadAction<keyof ModerationState['errors']>) => {
      state.errors[action.payload] = null;
    },
    
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key as keyof ModerationState['errors']] = null;
      });
    },
    
    // Performance tracking
    incrementOperationCount: (state) => {
      state.operationCount += 1;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch moderation stats
    builder
      .addCase(fetchModerationStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(fetchModerationStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchModerationStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload as string;
      });
    
    // Fetch pending products
    builder
      .addCase(fetchPendingProducts.pending, (state) => {
        state.loading.products = true;
        state.errors.products = null;
      })
      .addCase(fetchPendingProducts.fulfilled, (state, action) => {
        state.loading.products = false;
        state.products = action.payload.products || [];
        state.lastUpdated = Date.now();
      })
      .addCase(fetchPendingProducts.rejected, (state, action) => {
        state.loading.products = false;
        state.errors.products = action.payload as string;
      });
    
    // Fetch recent actions
    builder
      .addCase(fetchRecentActions.pending, (state) => {
        state.loading.actions = true;
        state.errors.actions = null;
      })
      .addCase(fetchRecentActions.fulfilled, (state, action) => {
        state.loading.actions = false;
        state.recentActions = action.payload.actions || [];
        state.lastUpdated = Date.now();
      })
      .addCase(fetchRecentActions.rejected, (state, action) => {
        state.loading.actions = false;
        state.errors.actions = action.payload as string;
      });
    
    // Moderate product
    builder
      .addCase(moderateProduct.fulfilled, (state, action) => {
        const { productId, newStatus } = action.payload;
        const productIndex = state.products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
          state.products[productIndex] = {
            ...state.products[productIndex],
            status: newStatus,
          };
        }
        
        // Remove from selection after moderation
        state.selectedProducts = state.selectedProducts.filter(id => id !== productId);
        state.operationCount += 1;
      });
    
    // Bulk moderate products
    builder
      .addCase(bulkModerateProducts.pending, (state) => {
        state.loading.bulkOperation = true;
        state.errors.bulkOperation = null;
      })
      .addCase(bulkModerateProducts.fulfilled, (state, action) => {
        state.loading.bulkOperation = false;
        const { productIds, newStatus } = action.payload;
        
        // Update product statuses
        state.products = state.products.map(product => 
          productIds.includes(product.id) 
            ? { ...product, status: newStatus }
            : product
        );
        
        // Clear selection after bulk operation
        state.selectedProducts = [];
        state.operationCount += productIds.length;
      })
      .addCase(bulkModerateProducts.rejected, (state, action) => {
        state.loading.bulkOperation = false;
        state.errors.bulkOperation = action.payload as string;
      });
  },
});

// Export actions
export const {
  selectProduct,
  deselectProduct,
  selectAllProducts,
  clearSelection,
  updateFilters,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  clearError,
  clearAllErrors,
  incrementOperationCount,
} = moderationSlice.actions;

// Export slice reducer
export default moderationSlice;