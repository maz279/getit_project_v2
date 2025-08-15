// Vendors Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Vendor State Management
// Multi-vendor marketplace vendor management

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks for vendor operations
export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async ({ page = 1, limit = 20, category, location, rating } = {}, { rejectWithValue }) => {
    try {
      const response = await customerService.getVendors({ page, limit, category, location, rating });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVendorById = createAsyncThunk(
  'vendors/fetchVendorById',
  async (vendorId, { rejectWithValue }) => {
    try {
      const vendor = await customerService.getVendorById(vendorId);
      return vendor;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedVendors = createAsyncThunk(
  'vendors/fetchFeaturedVendors',
  async (_, { rejectWithValue }) => {
    try {
      const vendors = await customerService.getFeaturedVendors();
      return vendors;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Vendor listings
  items: [],
  featuredVendors: [],
  topRatedVendors: [],
  
  // Current vendor
  currentVendor: null,
  vendorCache: {},
  
  // Vendor categories
  categories: [
    'electronics',
    'fashion',
    'home-garden',
    'beauty-health',
    'sports-outdoors',
    'books-media',
    'food-beverages',
    'automotive',
    'toys-games',
    'business-industrial'
  ],
  
  // Filters and sorting
  filters: {
    category: 'all',
    location: 'all',
    rating: 'all',
    businessType: 'all', // 'individual', 'business', 'verified'
    deliveryOptions: 'all'
  },
  
  sortBy: 'rating', // 'rating', 'name', 'location', 'joined_date'
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  },
  
  // Statistics
  statistics: {
    totalVendors: 0,
    averageRating: 0,
    topCategories: [],
    verifiedVendors: 0
  },
  
  // Bangladesh-specific data
  bangladeshData: {
    divisionCounts: {},
    popularCities: [],
    localVendors: [],
    internationalVendors: []
  },
  
  // Loading states
  loading: false,
  featuredLoading: false,
  
  // Error states
  error: null,
  
  // Last updated
  lastUpdated: null
};

// Vendors slice
const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    // Set current vendor
    setCurrentVendor: (state, action) => {
      state.currentVendor = action.payload;
      
      // Cache the vendor
      if (action.payload && action.payload.id) {
        state.vendorCache[action.payload.id] = action.payload;
      }
    },
    
    clearCurrentVendor: (state) => {
      state.currentVendor = null;
    },
    
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        category: 'all',
        location: 'all',
        rating: 'all',
        businessType: 'all',
        deliveryOptions: 'all'
      };
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    // Add vendor to favorites (local state)
    addToFavorites: (state, action) => {
      const vendorId = action.payload;
      const vendor = state.items.find(v => v.id === vendorId) || 
                    state.vendorCache[vendorId];
      
      if (vendor && !vendor.isFavorite) {
        vendor.isFavorite = true;
      }
    },
    
    removeFromFavorites: (state, action) => {
      const vendorId = action.payload;
      const vendor = state.items.find(v => v.id === vendorId) || 
                    state.vendorCache[vendorId];
      
      if (vendor && vendor.isFavorite) {
        vendor.isFavorite = false;
      }
    },
    
    // Update vendor rating (optimistic)
    updateVendorRating: (state, action) => {
      const { vendorId, rating } = action.payload;
      
      // Update in items
      const itemIndex = state.items.findIndex(v => v.id === vendorId);
      if (itemIndex !== -1) {
        state.items[itemIndex].userRating = rating;
      }
      
      // Update in cache
      if (state.vendorCache[vendorId]) {
        state.vendorCache[vendorId].userRating = rating;
      }
      
      // Update current vendor
      if (state.currentVendor && state.currentVendor.id === vendorId) {
        state.currentVendor.userRating = rating;
      }
    },
    
    // Follow/unfollow vendor
    followVendor: (state, action) => {
      const vendorId = action.payload;
      const vendor = state.items.find(v => v.id === vendorId) || 
                    state.vendorCache[vendorId];
      
      if (vendor) {
        vendor.isFollowing = true;
        vendor.followersCount = (vendor.followersCount || 0) + 1;
      }
    },
    
    unfollowVendor: (state, action) => {
      const vendorId = action.payload;
      const vendor = state.items.find(v => v.id === vendorId) || 
                    state.vendorCache[vendorId];
      
      if (vendor) {
        vendor.isFollowing = false;
        vendor.followersCount = Math.max(0, (vendor.followersCount || 0) - 1);
      }
    },
    
    // Update Bangladesh-specific data
    updateBangladeshData: (state, action) => {
      state.bangladeshData = { ...state.bangladeshData, ...action.payload };
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
    },
    
    // Reset vendors state
    resetVendorsState: (state) => {
      return initialState;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch vendors
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        state.items = response.vendors || response.data || response;
        
        // Update pagination
        if (response.pagination) {
          state.pagination = response.pagination;
        }
        
        // Update statistics
        if (response.statistics) {
          state.statistics = response.statistics;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch vendor by ID
    builder
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
        
        // Cache the vendor
        if (action.payload && action.payload.id) {
          state.vendorCache[action.payload.id] = action.payload;
        }
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch featured vendors
    builder
      .addCase(fetchFeaturedVendors.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedVendors.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredVendors = action.payload;
        
        // Also update top rated vendors (subset of featured)
        state.topRatedVendors = action.payload
          .filter(vendor => vendor.rating >= 4.5)
          .slice(0, 10);
      })
      .addCase(fetchFeaturedVendors.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setCurrentVendor,
  clearCurrentVendor,
  setFilters,
  clearFilters,
  setSortBy,
  addToFavorites,
  removeFromFavorites,
  updateVendorRating,
  followVendor,
  unfollowVendor,
  updateBangladeshData,
  clearErrors,
  resetVendorsState
} = vendorsSlice.actions;

// Selectors
export const selectVendors = (state) => state.vendors.items;
export const selectFeaturedVendors = (state) => state.vendors.featuredVendors;
export const selectTopRatedVendors = (state) => state.vendors.topRatedVendors;
export const selectCurrentVendor = (state) => state.vendors.currentVendor;
export const selectVendorById = (state, vendorId) => state.vendors.vendorCache[vendorId];
export const selectVendorFilters = (state) => state.vendors.filters;
export const selectVendorSortBy = (state) => state.vendors.sortBy;
export const selectVendorPagination = (state) => state.vendors.pagination;
export const selectVendorStatistics = (state) => state.vendors.statistics;
export const selectVendorBangladeshData = (state) => state.vendors.bangladeshData;
export const selectVendorsLoading = (state) => state.vendors.loading;
export const selectFeaturedVendorsLoading = (state) => state.vendors.featuredLoading;
export const selectVendorsError = (state) => state.vendors.error;

// Complex selectors
export const selectFilteredVendors = (state) => {
  const { items, filters, sortBy } = state.vendors;
  let filtered = items;
  
  // Apply filters
  if (filters.category !== 'all') {
    filtered = filtered.filter(vendor => 
      vendor.categories && vendor.categories.includes(filters.category)
    );
  }
  
  if (filters.location !== 'all') {
    filtered = filtered.filter(vendor => 
      vendor.location && vendor.location.division === filters.location
    );
  }
  
  if (filters.rating !== 'all') {
    const minRating = parseFloat(filters.rating);
    filtered = filtered.filter(vendor => vendor.rating >= minRating);
  }
  
  if (filters.businessType !== 'all') {
    filtered = filtered.filter(vendor => vendor.businessType === filters.businessType);
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'location':
      filtered.sort((a, b) => {
        const aLocation = a.location ? a.location.city : '';
        const bLocation = b.location ? b.location.city : '';
        return aLocation.localeCompare(bLocation);
      });
      break;
    case 'joined_date':
      filtered.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
      break;
    default:
      break;
  }
  
  return filtered;
};

export const selectVendorsByCategory = (state, category) => {
  return state.vendors.items.filter(vendor => 
    vendor.categories && vendor.categories.includes(category)
  );
};

export const selectLocalVendors = (state) => {
  return state.vendors.items.filter(vendor => 
    vendor.location && vendor.location.country === 'Bangladesh'
  );
};

export default vendorsSlice.reducer;