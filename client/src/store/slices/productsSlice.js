// Products Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Product State Management
// Comprehensive product catalog state with advanced filtering, caching, and real-time updates

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, limit = 20, category, search, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await customerService.getProducts({
        page,
        limit,
        category,
        search,
        ...filters
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const product = await customerService.getProductById(productId);
      return product;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await customerService.getFeaturedProducts();
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ categoryId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await customerService.getProductsByCategory(categoryId, { page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async ({ query, filters = {}, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await customerService.searchProducts(query, { ...filters, page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Product lists
  items: [],
  featuredProducts: [],
  searchResults: [],
  categoryProducts: {},
  
  // Product details
  currentProduct: null,
  productCache: {},
  
  // Pagination & filtering
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  },
  
  // Loading states
  loading: false,
  fetchingProduct: false,
  searchLoading: false,
  
  // Error states
  error: null,
  productError: null,
  searchError: null,
  
  // UI states
  viewMode: 'grid', // 'grid' or 'list'
  sortBy: 'relevance', // 'relevance', 'price_low', 'price_high', 'rating', 'newest'
  filtersApplied: {},
  
  // Recently viewed products
  recentlyViewed: [],
  
  // Comparison feature
  compareList: [],
  
  // Quick view
  quickViewProduct: null,
  
  // Last updated timestamp
  lastUpdated: null
};

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // UI actions
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setFiltersApplied: (state, action) => {
      state.filtersApplied = action.payload;
    },
    
    clearFilters: (state) => {
      state.filtersApplied = {};
    },
    
    // Product actions
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
      
      // Cache the product
      if (action.payload && action.payload.id) {
        state.productCache[action.payload.id] = action.payload;
      }
    },
    
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    
    // Recently viewed products
    addToRecentlyViewed: (state, action) => {
      const product = action.payload;
      
      // Remove if already exists
      state.recentlyViewed = state.recentlyViewed.filter(p => p.id !== product.id);
      
      // Add to beginning
      state.recentlyViewed.unshift(product);
      
      // Keep only last 10 items
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    
    // Comparison feature
    addToCompare: (state, action) => {
      const product = action.payload;
      
      // Check if already in compare list
      const exists = state.compareList.find(p => p.id === product.id);
      
      if (!exists && state.compareList.length < 4) {
        state.compareList.push(product);
      }
    },
    
    removeFromCompare: (state, action) => {
      const productId = action.payload;
      state.compareList = state.compareList.filter(p => p.id !== productId);
    },
    
    clearCompareList: (state) => {
      state.compareList = [];
    },
    
    // Quick view
    setQuickViewProduct: (state, action) => {
      state.quickViewProduct = action.payload;
    },
    
    clearQuickViewProduct: (state) => {
      state.quickViewProduct = null;
    },
    
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.productError = null;
      state.searchError = null;
    },
    
    // Update product in cache and lists
    updateProduct: (state, action) => {
      const updatedProduct = action.payload;
      
      // Update in cache
      if (state.productCache[updatedProduct.id]) {
        state.productCache[updatedProduct.id] = updatedProduct;
      }
      
      // Update in current product
      if (state.currentProduct && state.currentProduct.id === updatedProduct.id) {
        state.currentProduct = updatedProduct;
      }
      
      // Update in main items list
      const itemIndex = state.items.findIndex(p => p.id === updatedProduct.id);
      if (itemIndex !== -1) {
        state.items[itemIndex] = updatedProduct;
      }
      
      // Update in featured products
      const featuredIndex = state.featuredProducts.findIndex(p => p.id === updatedProduct.id);
      if (featuredIndex !== -1) {
        state.featuredProducts[featuredIndex] = updatedProduct;
      }
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(p => p.id === updatedProduct.id);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = updatedProduct;
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || action.payload.data || action.payload;
        
        // Update pagination
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.fetchingProduct = true;
        state.productError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.fetchingProduct = false;
        state.currentProduct = action.payload;
        
        // Cache the product
        if (action.payload && action.payload.id) {
          state.productCache[action.payload.id] = action.payload;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.fetchingProduct = false;
        state.productError = action.payload;
      });
    
    // Fetch featured products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch products by category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        const categoryId = action.meta.arg.categoryId;
        state.categoryProducts[categoryId] = action.payload.products || action.payload.data || action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products || action.payload.data || action.payload;
        
        // Update pagination for search
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  }
});

// Export actions
export const {
  setViewMode,
  setSortBy,
  setFiltersApplied,
  clearFilters,
  setCurrentProduct,
  clearCurrentProduct,
  addToRecentlyViewed,
  clearRecentlyViewed,
  addToCompare,
  removeFromCompare,
  clearCompareList,
  setQuickViewProduct,
  clearQuickViewProduct,
  clearSearchResults,
  clearErrors,
  updateProduct
} = productsSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.items;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectRecentlyViewed = (state) => state.products.recentlyViewed;
export const selectCompareList = (state) => state.products.compareList;
export const selectProductById = (state, productId) => state.products.productCache[productId];
export const selectViewMode = (state) => state.products.viewMode;
export const selectSortBy = (state) => state.products.sortBy;
export const selectFiltersApplied = (state) => state.products.filtersApplied;
export const selectPagination = (state) => state.products.pagination;

export default productsSlice.reducer;