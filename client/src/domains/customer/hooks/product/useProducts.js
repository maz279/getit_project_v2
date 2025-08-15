import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useProducts - Advanced Product Management Hook
 * Amazon.com/Shopee.sg-Level Product Features with Bangladesh Integration
 */
export const useProducts = (initialFilters = {}) => {
  const { user, trackUserActivity } = useAuth();
  const [productState, setProductState] = useState({
    loading: false,
    error: null,
    products: [],
    totalProducts: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    filters: {
      category: '',
      subcategory: '',
      brand: '',
      vendor: '',
      priceRange: [0, 100000],
      rating: 0,
      availability: 'all', // all, in_stock, out_of_stock
      location: '', // Bangladesh division/district
      sortBy: 'relevance', // relevance, price_asc, price_desc, rating, newest, popularity
      searchQuery: '',
      ...initialFilters
    },
    categories: [],
    brands: [],
    vendors: [],
    searchSuggestions: [],
    recentlyViewed: [],
    comparisons: [],
    wishlist: [],
    cart: []
  });

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
    loadRecentlyViewed();
  }, []);

  // Load products with filters and pagination
  const loadProducts = useCallback(async (page = 1, append = false) => {
    try {
      setProductState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...productState.filters,
        priceMin: productState.filters.priceRange[0].toString(),
        priceMax: productState.filters.priceRange[1].toString()
      });

      const response = await fetch(`/api/v1/products/search?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        
        setProductState(prev => ({
          ...prev,
          loading: false,
          products: append ? [...prev.products, ...data.products] : data.products,
          totalProducts: data.total,
          currentPage: page,
          totalPages: data.totalPages,
          hasMore: page < data.totalPages,
          searchSuggestions: data.suggestions || []
        }));

        // Track search activity
        if (productState.filters.searchQuery) {
          await trackUserActivity('product_search', user?.id, {
            query: productState.filters.searchQuery,
            resultsCount: data.total
          });
        }

        return { success: true, data };
      } else {
        const error = await response.json();
        setProductState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load products'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Product loading error:', error);
      setProductState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load products. Please try again.'
      }));
      return { success: false, error: 'Failed to load products. Please try again.' };
    }
  }, [productState.filters, user, trackUserActivity]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(async () => {
    if (productState.hasMore && !productState.loading) {
      return await loadProducts(productState.currentPage + 1, true);
    }
  }, [productState.hasMore, productState.loading, productState.currentPage, loadProducts]);

  // Get single product details
  const getProduct = useCallback(async (productId) => {
    try {
      const response = await fetch(`/api/v1/products/${productId}`);

      if (response.ok) {
        const product = await response.json();
        
        // Track product view
        await trackUserActivity('product_viewed', user?.id, {
          productId,
          productName: product.name,
          category: product.category,
          vendor: product.vendor
        });

        // Add to recently viewed
        addToRecentlyViewed(product);

        return { success: true, product };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Product fetch error:', error);
      return { success: false, error: 'Failed to fetch product details' };
    }
  }, [user, trackUserActivity]);

  // Search products with advanced features
  const searchProducts = useCallback(async (query, options = {}) => {
    try {
      setProductState(prev => ({
        ...prev,
        filters: { ...prev.filters, searchQuery: query },
        loading: true,
        error: null
      }));

      const searchParams = {
        q: query,
        fuzzy: options.fuzzy !== false,
        synonyms: options.synonyms !== false,
        autocorrect: options.autocorrect !== false,
        bengali: options.bengali !== false,
        ...options
      };

      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`/api/v1/products/search?${queryString}`);

      if (response.ok) {
        const data = await response.json();
        
        setProductState(prev => ({
          ...prev,
          loading: false,
          products: data.products,
          totalProducts: data.total,
          currentPage: 1,
          totalPages: data.totalPages,
          hasMore: data.totalPages > 1,
          searchSuggestions: data.suggestions || [],
          filters: { ...prev.filters, searchQuery: query }
        }));

        return { success: true, data };
      } else {
        const error = await response.json();
        setProductState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Search error:', error);
      setProductState(prev => ({
        ...prev,
        loading: false,
        error: 'Search failed. Please try again.'
      }));
      return { success: false, error: 'Search failed. Please try again.' };
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(async (newFilters) => {
    setProductState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1
    }));
    
    return await loadProducts(1, false);
  }, [loadProducts]);

  // Clear filters
  const clearFilters = useCallback(async () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      brand: '',
      vendor: '',
      priceRange: [0, 100000],
      rating: 0,
      availability: 'all',
      location: '',
      sortBy: 'relevance',
      searchQuery: ''
    };

    setProductState(prev => ({
      ...prev,
      filters: clearedFilters,
      currentPage: 1
    }));

    return await loadProducts(1, false);
  }, [loadProducts]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/products/categories');
      if (response.ok) {
        const categories = await response.json();
        setProductState(prev => ({
          ...prev,
          categories
        }));
      }
    } catch (error) {
      console.error('Categories loading error:', error);
    }
  }, []);

  // Load brands
  const loadBrands = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/products/brands');
      if (response.ok) {
        const brands = await response.json();
        setProductState(prev => ({
          ...prev,
          brands
        }));
      }
    } catch (error) {
      console.error('Brands loading error:', error);
    }
  }, []);

  // Add to recently viewed
  const addToRecentlyViewed = useCallback((product) => {
    setProductState(prev => {
      const filtered = prev.recentlyViewed.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10); // Keep last 10
      
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      
      return {
        ...prev,
        recentlyViewed: updated
      };
    });
  }, []);

  // Load recently viewed from localStorage
  const loadRecentlyViewed = useCallback(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const recentlyViewed = JSON.parse(stored);
        setProductState(prev => ({
          ...prev,
          recentlyViewed
        }));
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    }
  }, []);

  // Add to comparison
  const addToComparison = useCallback(async (product) => {
    try {
      setProductState(prev => {
        const exists = prev.comparisons.find(p => p.id === product.id);
        if (exists) {
          return prev; // Already in comparison
        }

        if (prev.comparisons.length >= 4) {
          return {
            ...prev,
            error: 'You can compare up to 4 products only'
          };
        }

        const updated = [...prev.comparisons, product];
        
        // Save to localStorage
        localStorage.setItem('productComparisons', JSON.stringify(updated));
        
        return {
          ...prev,
          comparisons: updated,
          error: null
        };
      });

      // Track comparison activity
      await trackUserActivity('product_added_to_comparison', user?.id, {
        productId: product.id,
        productName: product.name
      });

      return { success: true };
    } catch (error) {
      console.error('Add to comparison error:', error);
      return { success: false, error: 'Failed to add to comparison' };
    }
  }, [user, trackUserActivity]);

  // Remove from comparison
  const removeFromComparison = useCallback((productId) => {
    setProductState(prev => {
      const updated = prev.comparisons.filter(p => p.id !== productId);
      
      // Save to localStorage
      localStorage.setItem('productComparisons', JSON.stringify(updated));
      
      return {
        ...prev,
        comparisons: updated
      };
    });
  }, []);

  // Clear comparison
  const clearComparison = useCallback(() => {
    setProductState(prev => ({
      ...prev,
      comparisons: []
    }));
    localStorage.removeItem('productComparisons');
  }, []);

  // Get product recommendations
  const getRecommendations = useCallback(async (productId, type = 'similar') => {
    try {
      const response = await fetch(`/api/v1/products/${productId}/recommendations?type=${type}`);
      
      if (response.ok) {
        const recommendations = await response.json();
        return { success: true, recommendations };
      } else {
        return { success: false, recommendations: [] };
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      return { success: false, recommendations: [] };
    }
  }, []);

  // Get trending products
  const getTrendingProducts = useCallback(async (category = null, location = null) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (location) params.append('location', location);

      const response = await fetch(`/api/v1/products/trending?${params}`);
      
      if (response.ok) {
        const trending = await response.json();
        return { success: true, trending };
      } else {
        return { success: false, trending: [] };
      }
    } catch (error) {
      console.error('Trending products error:', error);
      return { success: false, trending: [] };
    }
  }, []);

  // Bangladesh-specific features
  const getBangladeshProducts = useCallback(async (division = null, district = null) => {
    try {
      const params = new URLSearchParams();
      if (division) params.append('division', division);
      if (district) params.append('district', district);
      params.append('local', 'true');

      const response = await fetch(`/api/v1/products/bangladesh?${params}`);
      
      if (response.ok) {
        const localProducts = await response.json();
        return { success: true, products: localProducts };
      } else {
        return { success: false, products: [] };
      }
    } catch (error) {
      console.error('Bangladesh products error:', error);
      return { success: false, products: [] };
    }
  }, []);

  // Computed values
  const filteredProductCount = useMemo(() => {
    return productState.totalProducts;
  }, [productState.totalProducts]);

  const hasActiveFilters = useMemo(() => {
    const { filters } = productState;
    return filters.category || filters.brand || filters.vendor || 
           filters.rating > 0 || filters.availability !== 'all' ||
           filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ||
           filters.searchQuery;
  }, [productState.filters]);

  const sortOptions = useMemo(() => [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'bestseller', label: 'Best Sellers' }
  ], []);

  return {
    // State
    ...productState,
    
    // Methods
    loadProducts,
    loadMore,
    getProduct,
    searchProducts,
    applyFilters,
    clearFilters,
    addToRecentlyViewed,
    addToComparison,
    removeFromComparison,
    clearComparison,
    getRecommendations,
    getTrendingProducts,
    getBangladeshProducts,

    // Computed values
    filteredProductCount,
    hasActiveFilters,
    sortOptions,
    isLoading: productState.loading,
    isEmpty: !productState.loading && productState.products.length === 0,
    canLoadMore: productState.hasMore && !productState.loading,
    comparisonCount: productState.comparisons.length,
    maxComparison: productState.comparisons.length >= 4
  };
};

export default useProducts;