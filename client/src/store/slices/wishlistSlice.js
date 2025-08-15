// Wishlist Redux Slice
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Wishlist State Management
// Comprehensive wishlist management with sharing and collections

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks for wishlist operations
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const wishlist = await customerService.getWishlist();
      return wishlist;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlistAsync',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await customerService.addToWishlist(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlistAsync',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await customerService.removeFromWishlist(productId);
      return { productId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Wishlist items
  items: [],
  itemIds: new Set(),
  
  // Collections/categories
  collections: [
    { id: 'default', name: 'My Wishlist', items: [] },
    { id: 'favorites', name: 'Favorites', items: [] },
    { id: 'gifts', name: 'Gift Ideas', items: [] }
  ],
  activeCollection: 'default',
  
  // Statistics
  statistics: {
    totalItems: 0,
    totalValue: 0,
    avgPrice: 0,
    mostExpensive: null,
    cheapest: null
  },
  
  // Sharing
  shareableLinks: {},
  publicWishlists: [],
  
  // Loading states
  loading: false,
  adding: false,
  removing: false,
  
  // Error states
  error: null,
  addError: null,
  removeError: null,
  
  // UI states
  viewMode: 'grid', // 'grid' or 'list'
  sortBy: 'date_added', // 'date_added', 'price_low', 'price_high', 'name'
  
  // Last updated
  lastUpdated: null
};

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Add item to wishlist (optimistic update)
    addToWishlist: (state, action) => {
      const product = action.payload;
      
      // Check if already in wishlist
      if (!state.itemIds.has(product.id)) {
        const wishlistItem = {
          ...product,
          dateAdded: new Date().toISOString(),
          collection: state.activeCollection
        };
        
        state.items.push(wishlistItem);
        state.itemIds.add(product.id);
        
        // Add to active collection
        const collection = state.collections.find(c => c.id === state.activeCollection);
        if (collection) {
          collection.items.push(product.id);
        }
        
        // Update statistics
        state.statistics = calculateWishlistStatistics(state.items);
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    // Remove item from wishlist
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      
      // Remove from items
      state.items = state.items.filter(item => item.id !== productId);
      state.itemIds.delete(productId);
      
      // Remove from all collections
      state.collections.forEach(collection => {
        collection.items = collection.items.filter(id => id !== productId);
      });
      
      // Update statistics
      state.statistics = calculateWishlistStatistics(state.items);
      state.lastUpdated = new Date().toISOString();
    },
    
    // Move item to different collection
    moveToCollection: (state, action) => {
      const { productId, collectionId } = action.payload;
      
      // Update item collection
      const itemIndex = state.items.findIndex(item => item.id === productId);
      if (itemIndex !== -1) {
        state.items[itemIndex].collection = collectionId;
      }
      
      // Remove from all collections
      state.collections.forEach(collection => {
        collection.items = collection.items.filter(id => id !== productId);
      });
      
      // Add to target collection
      const targetCollection = state.collections.find(c => c.id === collectionId);
      if (targetCollection && !targetCollection.items.includes(productId)) {
        targetCollection.items.push(productId);
      }
      
      state.lastUpdated = new Date().toISOString();
    },
    
    // Collection management
    createCollection: (state, action) => {
      const { id, name } = action.payload;
      
      if (!state.collections.find(c => c.id === id)) {
        state.collections.push({
          id,
          name,
          items: [],
          createdAt: new Date().toISOString()
        });
      }
    },
    
    deleteCollection: (state, action) => {
      const collectionId = action.payload;
      
      // Don't delete default collection
      if (collectionId === 'default') return;
      
      // Move items to default collection
      const collectionToDelete = state.collections.find(c => c.id === collectionId);
      if (collectionToDelete) {
        const defaultCollection = state.collections.find(c => c.id === 'default');
        if (defaultCollection) {
          defaultCollection.items.push(...collectionToDelete.items);
        }
      }
      
      // Remove collection
      state.collections = state.collections.filter(c => c.id !== collectionId);
      
      // Update active collection if needed
      if (state.activeCollection === collectionId) {
        state.activeCollection = 'default';
      }
    },
    
    renameCollection: (state, action) => {
      const { id, name } = action.payload;
      
      const collection = state.collections.find(c => c.id === id);
      if (collection) {
        collection.name = name;
      }
    },
    
    setActiveCollection: (state, action) => {
      state.activeCollection = action.payload;
    },
    
    // UI actions
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      
      // Sort items based on criteria
      switch (action.payload) {
        case 'price_low':
          state.items.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price_high':
          state.items.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'name':
          state.items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'date_added':
        default:
          state.items.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
          break;
      }
    },
    
    // Sharing actions
    generateShareableLink: (state, action) => {
      const { collectionId, settings } = action.payload;
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      state.shareableLinks[collectionId] = {
        shareId,
        url: `/wishlist/shared/${shareId}`,
        settings: settings || { public: true, allowComments: false },
        createdAt: new Date().toISOString()
      };
    },
    
    removeShareableLink: (state, action) => {
      const collectionId = action.payload;
      delete state.shareableLinks[collectionId];
    },
    
    // Bulk actions
    bulkRemove: (state, action) => {
      const productIds = action.payload;
      
      productIds.forEach(productId => {
        // Remove from items
        state.items = state.items.filter(item => item.id !== productId);
        state.itemIds.delete(productId);
        
        // Remove from all collections
        state.collections.forEach(collection => {
          collection.items = collection.items.filter(id => id !== productId);
        });
      });
      
      // Update statistics
      state.statistics = calculateWishlistStatistics(state.items);
      state.lastUpdated = new Date().toISOString();
    },
    
    bulkMoveToCollection: (state, action) => {
      const { productIds, collectionId } = action.payload;
      
      productIds.forEach(productId => {
        // Update item collection
        const itemIndex = state.items.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
          state.items[itemIndex].collection = collectionId;
        }
        
        // Remove from all collections
        state.collections.forEach(collection => {
          collection.items = collection.items.filter(id => id !== productId);
        });
        
        // Add to target collection
        const targetCollection = state.collections.find(c => c.id === collectionId);
        if (targetCollection && !targetCollection.items.includes(productId)) {
          targetCollection.items.push(productId);
        }
      });
      
      state.lastUpdated = new Date().toISOString();
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.addError = null;
      state.removeError = null;
    },
    
    // Clear wishlist
    clearWishlist: (state) => {
      state.items = [];
      state.itemIds = new Set();
      state.collections.forEach(collection => {
        collection.items = [];
      });
      state.statistics = calculateWishlistStatistics([]);
      state.lastUpdated = new Date().toISOString();
    }
  },
  
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const wishlistData = action.payload;
        
        state.items = wishlistData.items || [];
        state.itemIds = new Set(state.items.map(item => item.id));
        
        if (wishlistData.collections) {
          state.collections = wishlistData.collections;
        }
        
        state.statistics = calculateWishlistStatistics(state.items);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Add to wishlist async
    builder
      .addCase(addToWishlistAsync.pending, (state) => {
        state.adding = true;
        state.addError = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.adding = false;
        // Item should already be added via optimistic update
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload;
        
        // Revert optimistic update on error
        // This would require more sophisticated error handling
      });
    
    // Remove from wishlist async
    builder
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.removing = true;
        state.removeError = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.removing = false;
        // Item should already be removed via optimistic update
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.removing = false;
        state.removeError = action.payload;
        
        // Revert optimistic update on error
        // This would require more sophisticated error handling
      });
  }
});

// Helper function to calculate wishlist statistics
function calculateWishlistStatistics(items) {
  if (items.length === 0) {
    return {
      totalItems: 0,
      totalValue: 0,
      avgPrice: 0,
      mostExpensive: null,
      cheapest: null
    };
  }
  
  const prices = items.map(item => item.price || 0).filter(price => price > 0);
  const totalValue = prices.reduce((sum, price) => sum + price, 0);
  
  return {
    totalItems: items.length,
    totalValue,
    avgPrice: prices.length > 0 ? totalValue / prices.length : 0,
    mostExpensive: prices.length > 0 ? Math.max(...prices) : null,
    cheapest: prices.length > 0 ? Math.min(...prices) : null
  };
}

// Export actions
export const {
  addToWishlist,
  removeFromWishlist,
  moveToCollection,
  createCollection,
  deleteCollection,
  renameCollection,
  setActiveCollection,
  setViewMode,
  setSortBy,
  generateShareableLink,
  removeShareableLink,
  bulkRemove,
  bulkMoveToCollection,
  clearErrors,
  clearWishlist
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCollections = (state) => state.wishlist.collections;
export const selectActiveCollection = (state) => state.wishlist.activeCollection;
export const selectWishlistStatistics = (state) => state.wishlist.statistics;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectIsInWishlist = (state, productId) => state.wishlist.itemIds.has(productId);
export const selectWishlistItemsByCollection = (state, collectionId) => {
  const collection = state.wishlist.collections.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return state.wishlist.items.filter(item => 
    collection.items.includes(item.id) || item.collection === collectionId
  );
};

export default wishlistSlice.reducer;