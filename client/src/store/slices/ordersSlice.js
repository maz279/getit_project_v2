// Orders Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Order State Management
// Comprehensive order lifecycle, tracking, and payment management

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks for order operations
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 10, status, dateRange }, { rejectWithValue }) => {
    try {
      const response = await customerService.getOrders({ page, limit, status, dateRange });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const order = await customerService.getOrderById(orderId);
      return order;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const order = await customerService.createOrder(orderData);
      return order;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await customerService.cancelOrder(orderId, reason);
      return { orderId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const tracking = await customerService.trackOrder(orderId);
      return { orderId, tracking };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Order lists
  items: [],
  recentOrders: [],
  
  // Current order details
  currentOrder: null,
  orderCache: {},
  
  // Order tracking
  trackingData: {},
  
  // Order statistics
  statistics: {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0
  },
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  
  // Loading states
  loading: false,
  creating: false,
  cancelling: false,
  tracking: false,
  
  // Error states
  error: null,
  createError: null,
  cancelError: null,
  trackingError: null,
  
  // Filters
  filters: {
    status: 'all',
    dateRange: 'all',
    paymentStatus: 'all',
    shippingMethod: 'all'
  },
  
  // Last updated
  lastUpdated: null
};

// Orders slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Order management
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
      
      // Cache the order
      if (action.payload && action.payload.id) {
        state.orderCache[action.payload.id] = action.payload;
      }
    },
    
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    
    // Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status, trackingInfo } = action.payload;
      
      // Update in current order
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = status;
        if (trackingInfo) {
          state.currentOrder.trackingInfo = trackingInfo;
        }
      }
      
      // Update in cache
      if (state.orderCache[orderId]) {
        state.orderCache[orderId].status = status;
        if (trackingInfo) {
          state.orderCache[orderId].trackingInfo = trackingInfo;
        }
      }
      
      // Update in orders list
      const orderIndex = state.items.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.items[orderIndex].status = status;
        if (trackingInfo) {
          state.items[orderIndex].trackingInfo = trackingInfo;
        }
      }
      
      // Update statistics
      state.statistics = calculateOrderStatistics(state.items);
    },
    
    // Add new order to list
    addOrder: (state, action) => {
      const newOrder = action.payload;
      state.items.unshift(newOrder);
      state.orderCache[newOrder.id] = newOrder;
      
      // Update recent orders
      state.recentOrders.unshift(newOrder);
      if (state.recentOrders.length > 5) {
        state.recentOrders = state.recentOrders.slice(0, 5);
      }
      
      // Update statistics
      state.statistics = calculateOrderStatistics(state.items);
    },
    
    // Update tracking data
    updateTrackingData: (state, action) => {
      const { orderId, tracking } = action.payload;
      state.trackingData[orderId] = tracking;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        dateRange: 'all',
        paymentStatus: 'all',
        shippingMethod: 'all'
      };
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.cancelError = null;
      state.trackingError = null;
    },
    
    // Reset orders state
    resetOrdersState: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.orders || action.payload.data || action.payload;
        
        // Update pagination
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        // Update statistics
        state.statistics = calculateOrderStatistics(state.items);
        
        // Update recent orders (first 5)
        state.recentOrders = state.items.slice(0, 5);
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        
        // Cache the order
        if (action.payload && action.payload.id) {
          state.orderCache[action.payload.id] = action.payload;
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        const newOrder = action.payload;
        
        // Add to orders list
        state.items.unshift(newOrder);
        state.orderCache[newOrder.id] = newOrder;
        
        // Update recent orders
        state.recentOrders.unshift(newOrder);
        if (state.recentOrders.length > 5) {
          state.recentOrders = state.recentOrders.slice(0, 5);
        }
        
        // Update statistics
        state.statistics = calculateOrderStatistics(state.items);
        
        // Set as current order
        state.currentOrder = newOrder;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      });
    
    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.cancelling = true;
        state.cancelError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelling = false;
        const { orderId } = action.payload;
        
        // Update order status
        const orderIndex = state.items.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.items[orderIndex].status = 'cancelled';
        }
        
        // Update in cache
        if (state.orderCache[orderId]) {
          state.orderCache[orderId].status = 'cancelled';
        }
        
        // Update current order if it's the cancelled one
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = 'cancelled';
        }
        
        // Update statistics
        state.statistics = calculateOrderStatistics(state.items);
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelling = false;
        state.cancelError = action.payload;
      });
    
    // Track order
    builder
      .addCase(trackOrder.pending, (state) => {
        state.tracking = true;
        state.trackingError = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.tracking = false;
        const { orderId, tracking } = action.payload;
        state.trackingData[orderId] = tracking;
        
        // Update order tracking info in cache and current order
        if (state.orderCache[orderId]) {
          state.orderCache[orderId].trackingInfo = tracking;
        }
        
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.trackingInfo = tracking;
        }
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.tracking = false;
        state.trackingError = action.payload;
      });
  }
});

// Helper function to calculate order statistics
function calculateOrderStatistics(orders) {
  const stats = {
    total: orders.length,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0
  };
  
  orders.forEach(order => {
    switch (order.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'processing':
        stats.processing++;
        break;
      case 'shipped':
        stats.shipped++;
        break;
      case 'delivered':
        stats.delivered++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
    }
    
    if (order.status !== 'cancelled' && order.total) {
      stats.totalSpent += parseFloat(order.total);
    }
  });
  
  return stats;
}

// Export actions
export const {
  setCurrentOrder,
  clearCurrentOrder,
  updateOrderStatus,
  addOrder,
  updateTrackingData,
  setFilters,
  clearFilters,
  clearErrors,
  resetOrdersState
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.items;
export const selectRecentOrders = (state) => state.orders.recentOrders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderById = (state, orderId) => state.orders.orderCache[orderId];
export const selectOrderStatistics = (state) => state.orders.statistics;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrderFilters = (state) => state.orders.filters;
export const selectTrackingData = (state, orderId) => state.orders.trackingData[orderId];
export const selectOrdersPagination = (state) => state.orders.pagination;

export default ordersSlice.reducer;