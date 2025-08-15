import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useWishlist - Advanced Wishlist Management Hook
 * Amazon.com/Shopee.sg-Level Wishlist Features with Bangladesh Integration
 */
export const useWishlist = () => {
  const { user, trackUserActivity } = useAuth();
  const [wishlistState, setWishlistState] = useState({
    loading: false,
    error: null,
    items: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    lists: [], // Multiple wishlist support (default, favorites, gift ideas, etc.)
    currentList: null,
    filters: {
      category: '',
      priceRange: [0, 100000],
      availability: 'all', // all, in_stock, out_of_stock
      vendor: '',
      sortBy: 'newest', // newest, oldest, price_asc, price_desc, popularity
      searchQuery: ''
    },
    shareSettings: {
      isPublic: false,
      shareCode: null,
      allowPurchase: false
    },
    recommendations: [],
    priceAlerts: [],
    lastUpdated: null,
    syncStatus: 'synced' // synced, syncing, error
  });

  // Load wishlist on component mount
  useEffect(() => {
    if (user) {
      loadWishlist();
      loadWishlistCollections();
    } else {
      loadLocalWishlist();
    }
  }, [user]);

  // Auto-sync wishlist changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (wishlistState.items.length > 0 && wishlistState.syncStatus !== 'syncing' && user) {
        syncWishlistToServer();
      }
    }, 2000); // Debounce auto-sync

    return () => clearTimeout(timeoutId);
  }, [wishlistState.items, user]);

  // Load wishlist items
  const loadWishlist = useCallback(async (page = 1, listId = null) => {
    try {
      setWishlistState(prev => ({ ...prev, loading: true, error: null }));

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        listId: listId || prev.currentList?.id || '',
        ...wishlistState.filters
      });

      const response = await fetch(`/api/v1/wishlist?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setWishlistState(prev => ({
          ...prev,
          loading: false,
          items: page === 1 ? data.items : [...prev.items, ...data.items],
          totalItems: data.total,
          currentPage: page,
          totalPages: data.totalPages,
          hasMore: page < data.totalPages,
          lastUpdated: new Date(),
          syncStatus: 'synced'
        }));

        return { success: true, data };
      } else {
        const error = await response.json();
        setWishlistState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load wishlist'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Wishlist loading error:', error);
      setWishlistState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load wishlist. Please try again.'
      }));
      return { success: false, error: 'Failed to load wishlist. Please try again.' };
    }
  }, [wishlistState.filters]);

  // Load local wishlist for guest users
  const loadLocalWishlist = useCallback(() => {
    try {
      const localWishlist = localStorage.getItem('user_wishlist');
      if (localWishlist) {
        const parsedWishlist = JSON.parse(localWishlist);
        setWishlistState(prev => ({
          ...prev,
          items: parsedWishlist.items || [],
          lastUpdated: new Date(parsedWishlist.lastUpdated || Date.now())
        }));
      }
    } catch (error) {
      console.error('Failed to load local wishlist:', error);
    }
  }, []);

  // Add item to wishlist
  const addItem = useCallback(async (product, listId = null) => {
    try {
      // Check if item already exists
      const existingItem = wishlistState.items.find(item => item.productId === product.id);
      if (existingItem) {
        return { success: false, error: 'Item already in wishlist' };
      }

      const wishlistItem = {
        id: `${product.id}_${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images?.[0] || product.image,
        category: product.category,
        vendor: product.vendor,
        vendorId: product.vendorId,
        availability: product.availability || 'in_stock',
        rating: product.rating || 0,
        listId: listId || wishlistState.currentList?.id,
        addedAt: new Date().toISOString(),
        priceAlert: false,
        notes: ''
      };

      if (user) {
        // Add to server
        const response = await fetch('/api/v1/wishlist/items', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(wishlistItem)
        });

        if (response.ok) {
          const savedItem = await response.json();
          
          setWishlistState(prev => ({
            ...prev,
            items: [savedItem, ...prev.items],
            totalItems: prev.totalItems + 1,
            lastUpdated: new Date(),
            syncStatus: 'synced'
          }));

          // Track add to wishlist activity
          await trackUserActivity('add_to_wishlist', user.id, {
            productId: product.id,
            productName: product.name
          });

          return { success: true, item: savedItem };
        } else {
          const error = await response.json();
          return { success: false, error: error.message };
        }
      } else {
        // Add to local storage for guest users
        setWishlistState(prev => {
          const updatedItems = [wishlistItem, ...prev.items];
          
          // Save to localStorage
          localStorage.setItem('user_wishlist', JSON.stringify({
            items: updatedItems,
            lastUpdated: new Date()
          }));

          return {
            ...prev,
            items: updatedItems,
            totalItems: updatedItems.length,
            lastUpdated: new Date()
          };
        });

        return { success: true, item: wishlistItem };
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return { success: false, error: 'Failed to add item to wishlist' };
    }
  }, [wishlistState.items, wishlistState.currentList, user, trackUserActivity]);

  // Remove item from wishlist
  const removeItem = useCallback(async (itemId) => {
    try {
      if (user) {
        const response = await fetch(`/api/v1/wishlist/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setWishlistState(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId),
            totalItems: prev.totalItems - 1,
            lastUpdated: new Date()
          }));

          return { success: true };
        } else {
          const error = await response.json();
          return { success: false, error: error.message };
        }
      } else {
        // Remove from local storage for guest users
        setWishlistState(prev => {
          const updatedItems = prev.items.filter(item => item.id !== itemId);
          
          localStorage.setItem('user_wishlist', JSON.stringify({
            items: updatedItems,
            lastUpdated: new Date()
          }));

          return {
            ...prev,
            items: updatedItems,
            totalItems: updatedItems.length,
            lastUpdated: new Date()
          };
        });

        return { success: true };
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return { success: false, error: 'Failed to remove item from wishlist' };
    }
  }, [user]);

  // Move item to cart
  const moveToCart = useCallback(async (itemId, quantity = 1) => {
    try {
      const response = await fetch(`/api/v1/wishlist/items/${itemId}/move-to-cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Remove from wishlist after successful move
        await removeItem(itemId);

        await trackUserActivity('move_to_cart_from_wishlist', user?.id, {
          itemId,
          quantity
        });

        return { success: true, result };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Move to cart error:', error);
      return { success: false, error: 'Failed to move item to cart' };
    }
  }, [user, removeItem, trackUserActivity]);

  // Clear entire wishlist
  const clearWishlist = useCallback(async (listId = null) => {
    try {
      if (user) {
        const response = await fetch('/api/v1/wishlist/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ listId: listId || wishlistState.currentList?.id })
        });

        if (response.ok) {
          setWishlistState(prev => ({
            ...prev,
            items: [],
            totalItems: 0,
            lastUpdated: new Date()
          }));

          return { success: true };
        } else {
          const error = await response.json();
          return { success: false, error: error.message };
        }
      } else {
        setWishlistState(prev => ({
          ...prev,
          items: [],
          totalItems: 0,
          lastUpdated: new Date()
        }));
        localStorage.removeItem('user_wishlist');
        return { success: true };
      }
    } catch (error) {
      console.error('Clear wishlist error:', error);
      return { success: false, error: 'Failed to clear wishlist' };
    }
  }, [user, wishlistState.currentList]);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistState.items.some(item => item.productId === productId);
  }, [wishlistState.items]);

  // Toggle item in wishlist
  const toggleItem = useCallback(async (product) => {
    if (isInWishlist(product.id)) {
      const item = wishlistState.items.find(item => item.productId === product.id);
      return await removeItem(item.id);
    } else {
      return await addItem(product);
    }
  }, [isInWishlist, wishlistState.items, removeItem, addItem]);

  // Set price alert for item
  const setPriceAlert = useCallback(async (itemId, targetPrice) => {
    try {
      const response = await fetch(`/api/v1/wishlist/items/${itemId}/price-alert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetPrice })
      });

      if (response.ok) {
        const alertData = await response.json();
        
        setWishlistState(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId 
              ? { ...item, priceAlert: true, targetPrice } 
              : item
          ),
          priceAlerts: [...prev.priceAlerts, alertData]
        }));

        return { success: true, alert: alertData };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Price alert error:', error);
      return { success: false, error: 'Failed to set price alert' };
    }
  }, []);

  // Load wishlist collections/lists
  const loadWishlistCollections = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/wishlist/collections', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const collections = await response.json();
        
        setWishlistState(prev => ({
          ...prev,
          lists: collections,
          currentList: collections.find(list => list.isDefault) || collections[0]
        }));

        return { success: true, collections };
      }
      return { success: false };
    } catch (error) {
      console.error('Collections loading error:', error);
      return { success: false };
    }
  }, []);

  // Create new wishlist collection
  const createCollection = useCallback(async (name, description = '', isPublic = false) => {
    try {
      const response = await fetch('/api/v1/wishlist/collections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, isPublic })
      });

      if (response.ok) {
        const collection = await response.json();
        
        setWishlistState(prev => ({
          ...prev,
          lists: [...prev.lists, collection]
        }));

        return { success: true, collection };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Create collection error:', error);
      return { success: false, error: 'Failed to create collection' };
    }
  }, []);

  // Share wishlist
  const shareWishlist = useCallback(async (listId, settings = {}) => {
    try {
      const response = await fetch(`/api/v1/wishlist/collections/${listId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const shareData = await response.json();
        
        setWishlistState(prev => ({
          ...prev,
          shareSettings: {
            ...prev.shareSettings,
            ...shareData
          }
        }));

        return { success: true, shareData };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Share wishlist error:', error);
      return { success: false, error: 'Failed to share wishlist' };
    }
  }, []);

  // Get recommendations based on wishlist
  const getRecommendations = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/wishlist/recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const recommendations = await response.json();
        
        setWishlistState(prev => ({
          ...prev,
          recommendations
        }));

        return { success: true, recommendations };
      }
      return { success: false, recommendations: [] };
    } catch (error) {
      console.error('Recommendations error:', error);
      return { success: false, recommendations: [] };
    }
  }, []);

  // Sync wishlist to server (for guest to user conversion)
  const syncWishlistToServer = useCallback(async () => {
    if (!user) return;

    try {
      setWishlistState(prev => ({ ...prev, syncStatus: 'syncing' }));

      const response = await fetch('/api/v1/wishlist/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: wishlistState.items,
          lastUpdated: wishlistState.lastUpdated
        })
      });

      if (response.ok) {
        setWishlistState(prev => ({ ...prev, syncStatus: 'synced' }));
        localStorage.removeItem('user_wishlist'); // Clear local storage after sync
      } else {
        setWishlistState(prev => ({ ...prev, syncStatus: 'error' }));
      }
    } catch (error) {
      console.error('Wishlist sync error:', error);
      setWishlistState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [user, wishlistState.items, wishlistState.lastUpdated]);

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setWishlistState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setWishlistState(prev => ({
      ...prev,
      filters: {
        category: '',
        priceRange: [0, 100000],
        availability: 'all',
        vendor: '',
        sortBy: 'newest',
        searchQuery: ''
      },
      currentPage: 1
    }));
  }, []);

  // Computed values
  const itemCount = useMemo(() => {
    return wishlistState.totalItems;
  }, [wishlistState.totalItems]);

  const hasItems = useMemo(() => {
    return wishlistState.items.length > 0;
  }, [wishlistState.items]);

  const categorizedItems = useMemo(() => {
    return wishlistState.items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [wishlistState.items]);

  const averagePrice = useMemo(() => {
    if (wishlistState.items.length === 0) return 0;
    const total = wishlistState.items.reduce((sum, item) => sum + item.price, 0);
    return total / wishlistState.items.length;
  }, [wishlistState.items]);

  const totalValue = useMemo(() => {
    return wishlistState.items.reduce((sum, item) => sum + item.price, 0);
  }, [wishlistState.items]);

  return {
    // State
    ...wishlistState,
    
    // Methods
    loadWishlist,
    addItem,
    removeItem,
    moveToCart,
    clearWishlist,
    isInWishlist,
    toggleItem,
    setPriceAlert,
    loadWishlistCollections,
    createCollection,
    shareWishlist,
    getRecommendations,
    syncWishlistToServer,
    applyFilters,
    clearFilters,

    // Computed values
    itemCount,
    hasItems,
    categorizedItems,
    averagePrice,
    totalValue,
    isEmpty: !wishlistState.loading && wishlistState.items.length === 0,
    canLoadMore: wishlistState.hasMore && !wishlistState.loading,
    isLoading: wishlistState.loading,
    needsSync: wishlistState.syncStatus !== 'synced',
    
    // Quick access
    inStockItems: wishlistState.items.filter(item => item.availability === 'in_stock'),
    outOfStockItems: wishlistState.items.filter(item => item.availability === 'out_of_stock'),
    itemsWithAlerts: wishlistState.items.filter(item => item.priceAlert),
    recentItems: wishlistState.items.slice(0, 5), // Last 5 added items
    
    // Bangladesh-specific features
    localVendorItems: wishlistState.items.filter(item => 
      item.vendor?.country === 'Bangladesh' || item.vendor?.local === true
    ),
    eligibleForCOD: wishlistState.items.filter(item => 
      item.vendor?.supportsCOD === true
    )
  };
};

export default useWishlist;