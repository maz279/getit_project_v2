// Filters Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Filter State Management
// Advanced filtering system for products, vendors, and search

import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Product filters
  productFilters: {
    // Basic filters
    category: '',
    subcategory: '',
    brand: '',
    vendor: '',
    
    // Price filters
    priceRange: {
      min: 0,
      max: 100000,
      currency: 'BDT'
    },
    
    // Rating filter
    rating: {
      min: 0,
      includeUnrated: true
    },
    
    // Availability filters
    availability: {
      inStock: true,
      outOfStock: false,
      preOrder: false,
      limited: false
    },
    
    // Shipping filters
    shipping: {
      freeShipping: false,
      sameDayDelivery: false,
      nextDayDelivery: false,
      internationalShipping: false
    },
    
    // Discount filters
    discounts: {
      onSale: false,
      clearance: false,
      newArrivals: false,
      bestSellers: false
    },
    
    // Bangladesh-specific filters
    bangladesh: {
      division: '',
      district: '',
      localVendor: false,
      codAvailable: true,
      mobileBankingSupported: false
    },
    
    // Product attributes
    attributes: {
      color: [],
      size: [],
      material: [],
      weight: { min: 0, max: 10000 }, // grams
      dimensions: { width: 0, height: 0, depth: 0 }
    }
  },
  
  // Search filters
  searchFilters: {
    query: '',
    searchIn: 'all', // 'title', 'description', 'tags', 'all'
    sortBy: 'relevance', // 'relevance', 'price_low', 'price_high', 'rating', 'newest', 'popular'
    timeFrame: 'all', // 'today', 'week', 'month', 'year', 'all'
    language: 'all' // 'bengali', 'english', 'all'
  },
  
  // Vendor filters
  vendorFilters: {
    location: {
      division: '',
      district: '',
      international: false
    },
    rating: { min: 0 },
    businessType: '', // 'individual', 'business', 'verified'
    joinedDate: { from: null, to: null },
    categories: [],
    verified: false,
    featured: false
  },
  
  // Order filters
  orderFilters: {
    status: '', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    dateRange: { from: null, to: null },
    paymentMethod: '', // 'bkash', 'nagad', 'rocket', 'cod', 'card'
    shippingMethod: '',
    priceRange: { min: 0, max: 100000 }
  },
  
  // Active filter sets
  activeFilters: {
    product: [],
    search: [],
    vendor: [],
    order: []
  },
  
  // Quick filters
  quickFilters: [
    { id: 'free_shipping', label: 'Free Shipping', type: 'product', filter: { shipping: { freeShipping: true } } },
    { id: 'on_sale', label: 'On Sale', type: 'product', filter: { discounts: { onSale: true } } },
    { id: 'high_rated', label: '4+ Stars', type: 'product', filter: { rating: { min: 4 } } },
    { id: 'local_vendor', label: 'Local Vendor', type: 'product', filter: { bangladesh: { localVendor: true } } },
    { id: 'cod_available', label: 'COD Available', type: 'product', filter: { bangladesh: { codAvailable: true } } },
    { id: 'same_day', label: 'Same Day Delivery', type: 'product', filter: { shipping: { sameDayDelivery: true } } }
  ],
  
  // Saved filter presets
  savedPresets: [
    {
      id: 'electronics_budget',
      name: 'Budget Electronics',
      type: 'product',
      filters: {
        category: 'electronics',
        priceRange: { min: 0, max: 5000 },
        rating: { min: 3 },
        shipping: { freeShipping: true }
      }
    },
    {
      id: 'fashion_new',
      name: 'New Fashion',
      type: 'product',
      filters: {
        category: 'fashion',
        discounts: { newArrivals: true },
        availability: { inStock: true }
      }
    }
  ],
  
  // Filter statistics
  statistics: {
    appliedFiltersCount: 0,
    resultsCount: 0,
    estimatedResultsCount: 0,
    filterUsageFrequency: {},
    popularCombinations: []
  },
  
  // UI state
  ui: {
    filtersVisible: false,
    activeSection: 'category', // 'category', 'price', 'rating', etc.
    collapsedSections: [],
    mobileFiltersOpen: false
  },
  
  // Filter history for undo/redo
  history: {
    past: [],
    present: null,
    future: []
  }
};

// Filters slice
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Product filter actions
    setProductFilter: (state, action) => {
      const { filterType, value } = action.payload;
      
      // Handle nested filter updates
      if (filterType.includes('.')) {
        const keys = filterType.split('.');
        let current = state.productFilters;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      } else {
        state.productFilters[filterType] = value;
      }
      
      // Update active filters
      updateActiveFilters(state, 'product');
    },
    
    setPriceRange: (state, action) => {
      const { min, max, currency = 'BDT' } = action.payload;
      state.productFilters.priceRange = { min, max, currency };
      updateActiveFilters(state, 'product');
    },
    
    setRatingFilter: (state, action) => {
      const { min, includeUnrated = true } = action.payload;
      state.productFilters.rating = { min, includeUnrated };
      updateActiveFilters(state, 'product');
    },
    
    toggleAvailabilityFilter: (state, action) => {
      const filterType = action.payload;
      state.productFilters.availability[filterType] = !state.productFilters.availability[filterType];
      updateActiveFilters(state, 'product');
    },
    
    toggleShippingFilter: (state, action) => {
      const filterType = action.payload;
      state.productFilters.shipping[filterType] = !state.productFilters.shipping[filterType];
      updateActiveFilters(state, 'product');
    },
    
    toggleDiscountFilter: (state, action) => {
      const filterType = action.payload;
      state.productFilters.discounts[filterType] = !state.productFilters.discounts[filterType];
      updateActiveFilters(state, 'product');
    },
    
    setBangladeshFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.productFilters.bangladesh[filterType] = value;
      updateActiveFilters(state, 'product');
    },
    
    addAttributeFilter: (state, action) => {
      const { attribute, value } = action.payload;
      
      if (Array.isArray(state.productFilters.attributes[attribute])) {
        if (!state.productFilters.attributes[attribute].includes(value)) {
          state.productFilters.attributes[attribute].push(value);
        }
      } else {
        state.productFilters.attributes[attribute] = value;
      }
      
      updateActiveFilters(state, 'product');
    },
    
    removeAttributeFilter: (state, action) => {
      const { attribute, value } = action.payload;
      
      if (Array.isArray(state.productFilters.attributes[attribute])) {
        state.productFilters.attributes[attribute] = state.productFilters.attributes[attribute].filter(v => v !== value);
      } else {
        state.productFilters.attributes[attribute] = null;
      }
      
      updateActiveFilters(state, 'product');
    },
    
    // Search filter actions
    setSearchFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.searchFilters[filterType] = value;
      updateActiveFilters(state, 'search');
    },
    
    setSearchQuery: (state, action) => {
      state.searchFilters.query = action.payload;
      updateActiveFilters(state, 'search');
    },
    
    setSortBy: (state, action) => {
      state.searchFilters.sortBy = action.payload;
      updateActiveFilters(state, 'search');
    },
    
    // Vendor filter actions
    setVendorFilter: (state, action) => {
      const { filterType, value } = action.payload;
      
      if (filterType.includes('.')) {
        const keys = filterType.split('.');
        let current = state.vendorFilters;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      } else {
        state.vendorFilters[filterType] = value;
      }
      
      updateActiveFilters(state, 'vendor');
    },
    
    // Order filter actions
    setOrderFilter: (state, action) => {
      const { filterType, value } = action.payload;
      
      if (filterType.includes('.')) {
        const keys = filterType.split('.');
        let current = state.orderFilters;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      } else {
        state.orderFilters[filterType] = value;
      }
      
      updateActiveFilters(state, 'order');
    },
    
    // Quick filter actions
    applyQuickFilter: (state, action) => {
      const quickFilterId = action.payload;
      const quickFilter = state.quickFilters.find(qf => qf.id === quickFilterId);
      
      if (quickFilter) {
        // Apply the quick filter to the appropriate filter set
        if (quickFilter.type === 'product') {
          Object.assign(state.productFilters, quickFilter.filter);
          updateActiveFilters(state, 'product');
        }
      }
    },
    
    // Preset actions
    saveFilterPreset: (state, action) => {
      const { name, type, filters } = action.payload;
      const preset = {
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        filters,
        createdAt: new Date().toISOString()
      };
      
      state.savedPresets.push(preset);
    },
    
    loadFilterPreset: (state, action) => {
      const presetId = action.payload;
      const preset = state.savedPresets.find(p => p.id === presetId);
      
      if (preset) {
        if (preset.type === 'product') {
          Object.assign(state.productFilters, preset.filters);
          updateActiveFilters(state, 'product');
        } else if (preset.type === 'vendor') {
          Object.assign(state.vendorFilters, preset.filters);
          updateActiveFilters(state, 'vendor');
        } else if (preset.type === 'order') {
          Object.assign(state.orderFilters, preset.filters);
          updateActiveFilters(state, 'order');
        }
      }
    },
    
    deleteFilterPreset: (state, action) => {
      const presetId = action.payload;
      state.savedPresets = state.savedPresets.filter(p => p.id !== presetId);
    },
    
    // Clear actions
    clearProductFilters: (state) => {
      state.productFilters = initialState.productFilters;
      state.activeFilters.product = [];
    },
    
    clearSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
      state.activeFilters.search = [];
    },
    
    clearVendorFilters: (state) => {
      state.vendorFilters = initialState.vendorFilters;
      state.activeFilters.vendor = [];
    },
    
    clearOrderFilters: (state) => {
      state.orderFilters = initialState.orderFilters;
      state.activeFilters.order = [];
    },
    
    clearAllFilters: (state) => {
      state.productFilters = initialState.productFilters;
      state.searchFilters = initialState.searchFilters;
      state.vendorFilters = initialState.vendorFilters;
      state.orderFilters = initialState.orderFilters;
      state.activeFilters = {
        product: [],
        search: [],
        vendor: [],
        order: []
      };
    },
    
    // UI actions
    toggleFiltersVisibility: (state) => {
      state.ui.filtersVisible = !state.ui.filtersVisible;
    },
    
    setFiltersVisible: (state, action) => {
      state.ui.filtersVisible = action.payload;
    },
    
    setActiveSection: (state, action) => {
      state.ui.activeSection = action.payload;
    },
    
    toggleSection: (state, action) => {
      const section = action.payload;
      
      if (state.ui.collapsedSections.includes(section)) {
        state.ui.collapsedSections = state.ui.collapsedSections.filter(s => s !== section);
      } else {
        state.ui.collapsedSections.push(section);
      }
    },
    
    toggleMobileFilters: (state) => {
      state.ui.mobileFiltersOpen = !state.ui.mobileFiltersOpen;
    },
    
    // Statistics actions
    updateFilterStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    
    // Reset all filters state
    resetFiltersState: (state) => {
      return initialState;
    }
  }
});

// Helper function to update active filters
function updateActiveFilters(state, filterType) {
  const activeFilters = [];
  
  if (filterType === 'product') {
    const filters = state.productFilters;
    
    // Check each filter category
    if (filters.category) activeFilters.push({ type: 'category', value: filters.category });
    if (filters.brand) activeFilters.push({ type: 'brand', value: filters.brand });
    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
      activeFilters.push({ type: 'price', value: `${filters.priceRange.min}-${filters.priceRange.max}` });
    }
    if (filters.rating.min > 0) activeFilters.push({ type: 'rating', value: `${filters.rating.min}+ stars` });
    
    // Add shipping filters
    Object.entries(filters.shipping).forEach(([key, value]) => {
      if (value) activeFilters.push({ type: 'shipping', value: key });
    });
    
    // Add discount filters
    Object.entries(filters.discounts).forEach(([key, value]) => {
      if (value) activeFilters.push({ type: 'discount', value: key });
    });
    
    // Add Bangladesh filters
    Object.entries(filters.bangladesh).forEach(([key, value]) => {
      if (value && value !== true) activeFilters.push({ type: 'bangladesh', value: `${key}: ${value}` });
      else if (value === true && key !== 'codAvailable') activeFilters.push({ type: 'bangladesh', value: key });
    });
  }
  
  state.activeFilters[filterType] = activeFilters;
  state.statistics.appliedFiltersCount = activeFilters.length;
}

// Export actions
export const {
  setProductFilter,
  setPriceRange,
  setRatingFilter,
  toggleAvailabilityFilter,
  toggleShippingFilter,
  toggleDiscountFilter,
  setBangladeshFilter,
  addAttributeFilter,
  removeAttributeFilter,
  setSearchFilter,
  setSearchQuery,
  setSortBy,
  setVendorFilter,
  setOrderFilter,
  applyQuickFilter,
  saveFilterPreset,
  loadFilterPreset,
  deleteFilterPreset,
  clearProductFilters,
  clearSearchFilters,
  clearVendorFilters,
  clearOrderFilters,
  clearAllFilters,
  toggleFiltersVisibility,
  setFiltersVisible,
  setActiveSection,
  toggleSection,
  toggleMobileFilters,
  updateFilterStatistics,
  resetFiltersState
} = filtersSlice.actions;

// Selectors
export const selectProductFilters = (state) => state.filters.productFilters;
export const selectSearchFilters = (state) => state.filters.searchFilters;
export const selectVendorFilters = (state) => state.filters.vendorFilters;
export const selectOrderFilters = (state) => state.filters.orderFilters;
export const selectActiveFilters = (state) => state.filters.activeFilters;
export const selectQuickFilters = (state) => state.filters.quickFilters;
export const selectSavedPresets = (state) => state.filters.savedPresets;
export const selectFilterStatistics = (state) => state.filters.statistics;
export const selectFiltersUI = (state) => state.filters.ui;
export const selectFiltersVisible = (state) => state.filters.ui.filtersVisible;
export const selectActiveFiltersCount = (state) => state.filters.statistics.appliedFiltersCount;

// Complex selectors
export const selectHasActiveFilters = (state) => {
  return Object.values(state.filters.activeFilters).some(filters => filters.length > 0);
};

export const selectFiltersByType = (state, filterType) => {
  return state.filters.activeFilters[filterType] || [];
};

export default filtersSlice.reducer;