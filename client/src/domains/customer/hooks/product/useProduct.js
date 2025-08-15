import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';

// useProduct - Product Management Hook for GetIt Bangladesh
// Amazon.com/Shopee.sg-Level Product Operations

export const useProduct = (productId = null) => {
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [wishlistStatus, setWishlistStatus] = useState(false);

  // Load product data
  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  // Load product details
  const loadProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/products/${id}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData);
        
        // Load additional data
        await Promise.all([
          loadProductReviews(id),
          loadProductRecommendations(id),
          loadProductVariants(id),
          checkWishlistStatus(id)
        ]);

        // Track product view
        trackProductView(id);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Load product reviews
  const loadProductReviews = async (id) => {
    try {
      const response = await fetch(`/api/v1/products/${id}/reviews`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  // Load product recommendations
  const loadProductRecommendations = async (id) => {
    try {
      const response = await fetch(`/api/v1/products/${id}/recommendations`);
      if (response.ok) {
        const recommendationsData = await response.json();
        setRecommendations(recommendationsData.products || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  // Load product variants
  const loadProductVariants = async (id) => {
    try {
      const response = await fetch(`/api/v1/products/${id}/variants`);
      if (response.ok) {
        const variantsData = await response.json();
        setVariants(variantsData.variants || []);
        if (variantsData.variants?.length > 0) {
          setSelectedVariant(variantsData.variants[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load variants:', err);
    }
  };

  // Check wishlist status
  const checkWishlistStatus = async (id) => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/wishlist/status/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistStatus(data.inWishlist);
      }
    } catch (err) {
      console.error('Failed to check wishlist status:', err);
    }
  };

  // Add/remove from wishlist
  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const method = wishlistStatus ? 'DELETE' : 'POST';
      const endpoint = wishlistStatus 
        ? `/api/v1/wishlist/items/${productId}`
        : '/api/v1/wishlist/items';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method === 'POST' ? JSON.stringify({ 
          productId, 
          variants: selectedVariant 
        }) : undefined
      });

      if (response.ok) {
        setWishlistStatus(!wishlistStatus);
        return { success: true, inWishlist: !wishlistStatus };
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
      return { success: false, error: err.message };
    }
  };

  // Submit product review
  const submitReview = async (reviewData) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to submit a review' };
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...reviewData,
          productId,
          userId: user.id
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews(prev => [newReview, ...prev]);
        return { success: true, review: newReview };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to submit review' };
      }
    } catch (err) {
      console.error('Review submission failed:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Report review
  const reportReview = async (reviewId, reason) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to report reviews' };
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        return { success: true, message: 'Review reported successfully' };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to report review' };
      }
    } catch (err) {
      console.error('Review report failed:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Mark review as helpful
  const markReviewHelpful = async (reviewId) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local reviews state
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
            : review
        ));
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
    }
  };

  // Get product price with variant
  const getCurrentPrice = () => {
    if (!product) return null;
    
    if (selectedVariant && selectedVariant.price) {
      return selectedVariant.price;
    }
    
    return product.price;
  };

  // Get product stock status
  const getStockStatus = () => {
    if (!product) return null;
    
    const stock = selectedVariant?.stock || product.stock || 0;
    
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  };

  // Check if product is available
  const isAvailable = () => {
    return getStockStatus() !== 'out-of-stock';
  };

  // Get shipping information
  const getShippingInfo = () => {
    if (!product) return null;
    
    return {
      freeShipping: product.price >= 2000,
      estimatedDays: product.vendor?.shippingDays || '3-5',
      cost: product.price >= 2000 ? 0 : 120,
      zones: product.shippingZones || ['dhaka', 'chittagong', 'sylhet']
    };
  };

  // Get discount percentage
  const getDiscountPercentage = () => {
    if (!product || !product.originalPrice) return 0;
    
    const current = getCurrentPrice();
    if (!current || current >= product.originalPrice) return 0;
    
    return Math.round(((product.originalPrice - current) / product.originalPrice) * 100);
  };

  // Track product view
  const trackProductView = async (id) => {
    try {
      await fetch('/api/v1/analytics/product-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: id,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          source: 'product-page',
          userAgent: navigator.userAgent
        })
      });
    } catch (err) {
      console.error('Failed to track product view:', err);
    }
  };

  // Share product
  const shareProduct = async (platform = 'native') => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: `Check out this amazing product: ${product.name}`,
      url: window.location.href
    };

    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share(shareData);
        trackProductShare('native');
      } else {
        // Fallback to copy URL
        await navigator.clipboard.writeText(shareData.url);
        trackProductShare('clipboard');
        return { success: true, message: 'Product URL copied to clipboard' };
      }
    } catch (err) {
      console.error('Share failed:', err);
      return { success: false, error: 'Failed to share product' };
    }
  };

  // Track product share
  const trackProductShare = async (platform) => {
    try {
      await fetch('/api/v1/analytics/product-shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          userId: user?.id,
          platform,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to track product share:', err);
    }
  };

  // Get similar products
  const getSimilarProducts = async (limit = 6) => {
    if (!product) return [];

    try {
      const response = await fetch(`/api/v1/products/${productId}/similar?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return data.products || [];
      }
    } catch (err) {
      console.error('Failed to get similar products:', err);
    }
    return [];
  };

  // Check product availability in area
  const checkDeliveryAvailability = async (postalCode) => {
    try {
      const response = await fetch(`/api/v1/shipping/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          vendorId: product?.vendorId,
          postalCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          available: data.available,
          estimatedDays: data.estimatedDays,
          shippingCost: data.shippingCost,
          courierServices: data.courierServices || []
        };
      }
    } catch (err) {
      console.error('Failed to check delivery availability:', err);
    }
    
    return {
      available: true,
      estimatedDays: '3-5',
      shippingCost: 120,
      courierServices: ['Pathao', 'Paperfly']
    };
  };

  // Calculate total savings
  const getTotalSavings = () => {
    if (!product || !product.originalPrice) return 0;
    
    const current = getCurrentPrice();
    if (!current) return 0;
    
    return Math.max(0, product.originalPrice - current);
  };

  // Get product rating summary
  const getRatingSummary = () => {
    if (!reviews.length) return null;
    
    const ratings = reviews.map(r => r.rating);
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratings.filter(r => r === star).length,
      percentage: (ratings.filter(r => r === star).length / ratings.length) * 100
    }));
    
    return {
      average: Math.round(average * 10) / 10,
      total: reviews.length,
      distribution
    };
  };

  return {
    // State
    product,
    loading,
    error,
    reviews,
    recommendations,
    variants,
    selectedVariant,
    wishlistStatus,

    // Actions
    loadProduct,
    toggleWishlist,
    submitReview,
    reportReview,
    markReviewHelpful,
    shareProduct,
    setSelectedVariant,

    // Computed values
    getCurrentPrice,
    getStockStatus,
    isAvailable,
    getShippingInfo,
    getDiscountPercentage,
    getTotalSavings,
    getRatingSummary,

    // Async methods
    getSimilarProducts,
    checkDeliveryAvailability
  };
};

// useProducts - Multiple products management
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('featured');

  // Load products with filters
  const loadProducts = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        sort: options.sortBy || sortBy,
        ...filters,
        ...options.filters
      });

      const response = await fetch(`/api/v1/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (options.append) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          hasMore: data.hasMore
        });
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = async (query, searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: query,
        page: 1,
        limit: pagination.limit,
        sort: sortBy,
        ...searchFilters
      });

      const response = await fetch(`/api/v1/products/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          hasMore: data.hasMore
        });
      } else {
        setError('Search failed');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Load more products
  const loadMore = async () => {
    if (!pagination.hasMore || loading) return;
    
    await loadProducts({
      page: pagination.page + 1,
      append: true
    });
  };

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Update sort
  const updateSort = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  return {
    // State
    products,
    loading,
    error,
    pagination,
    filters,
    sortBy,

    // Actions
    loadProducts,
    searchProducts,
    loadMore,
    updateFilters,
    clearFilters,
    updateSort,
    setProducts
  };
};

export default useProduct;