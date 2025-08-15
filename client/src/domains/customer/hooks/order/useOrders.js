import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useOrders - Advanced Order Management Hook
 * Amazon.com/Shopee.sg-Level Order Features with Bangladesh Integration
 */
export const useOrders = (initialFilters = {}) => {
  const { user, trackUserActivity } = useAuth();
  const [orderState, setOrderState] = useState({
    loading: false,
    error: null,
    orders: [],
    currentOrder: null,
    totalOrders: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    filters: {
      status: '', // pending, confirmed, processing, shipped, delivered, cancelled, returned
      dateRange: 'all', // today, week, month, year, custom, all
      startDate: null,
      endDate: null,
      vendor: '',
      paymentMethod: '',
      shippingMethod: '',
      orderType: '', // regular, bulk, group, gift
      sortBy: 'newest', // newest, oldest, amount_high, amount_low, status
      searchQuery: '',
      ...initialFilters
    },
    orderStatistics: {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    },
    recentOrders: [],
    favoriteOrders: [], // For reordering
    trackingInfo: {},
    returns: [],
    refunds: []
  });

  // Load orders on component mount and filter changes
  useEffect(() => {
    loadOrders();
  }, [orderState.filters]);

  // Load orders with pagination and filters
  const loadOrders = useCallback(async (page = 1, append = false) => {
    try {
      setOrderState(prev => ({ ...prev, loading: true, error: null }));

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...orderState.filters,
        startDate: orderState.filters.startDate?.toISOString() || '',
        endDate: orderState.filters.endDate?.toISOString() || ''
      });

      const response = await fetch(`/api/v1/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          loading: false,
          orders: append ? [...prev.orders, ...data.orders] : data.orders,
          totalOrders: data.total,
          currentPage: page,
          totalPages: data.totalPages,
          hasMore: page < data.totalPages,
          orderStatistics: data.statistics || prev.orderStatistics
        }));

        return { success: true, data };
      } else {
        const error = await response.json();
        setOrderState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load orders'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Orders loading error:', error);
      setOrderState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load orders. Please try again.'
      }));
      return { success: false, error: 'Failed to load orders. Please try again.' };
    }
  }, [orderState.filters]);

  // Load more orders (infinite scroll)
  const loadMore = useCallback(async () => {
    if (orderState.hasMore && !orderState.loading) {
      return await loadOrders(orderState.currentPage + 1, true);
    }
  }, [orderState.hasMore, orderState.loading, orderState.currentPage, loadOrders]);

  // Get single order details
  const getOrder = useCallback(async (orderId) => {
    try {
      setOrderState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const order = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          loading: false,
          currentOrder: order
        }));

        // Track order view
        await trackUserActivity('order_viewed', user?.id, {
          orderId,
          orderNumber: order.orderNumber
        });

        return { success: true, order };
      } else {
        const error = await response.json();
        setOrderState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load order'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Order fetch error:', error);
      setOrderState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch order details'
      }));
      return { success: false, error: 'Failed to fetch order details' };
    }
  }, [user, trackUserActivity]);

  // Track order real-time
  const trackOrder = useCallback(async (orderNumber) => {
    try {
      const response = await fetch(`/api/v1/orders/track/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const trackingData = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          trackingInfo: {
            ...prev.trackingInfo,
            [orderNumber]: trackingData
          }
        }));

        return { success: true, tracking: trackingData };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Order tracking error:', error);
      return { success: false, error: 'Failed to track order' };
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      setOrderState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          loading: false,
          orders: prev.orders.map(order => 
            order.id === orderId ? updatedOrder : order
          ),
          currentOrder: prev.currentOrder?.id === orderId ? updatedOrder : prev.currentOrder
        }));

        // Track order cancellation
        await trackUserActivity('order_cancelled', user?.id, {
          orderId,
          reason
        });

        return { success: true, order: updatedOrder };
      } else {
        const error = await response.json();
        setOrderState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to cancel order'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Order cancellation error:', error);
      setOrderState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to cancel order'
      }));
      return { success: false, error: 'Failed to cancel order' };
    }
  }, [user, trackUserActivity]);

  // Return order
  const returnOrder = useCallback(async (orderId, returnData) => {
    try {
      setOrderState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/orders/${orderId}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        const returnInfo = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          loading: false,
          returns: [...prev.returns, returnInfo]
        }));

        // Track order return
        await trackUserActivity('order_returned', user?.id, {
          orderId,
          returnReason: returnData.reason
        });

        return { success: true, return: returnInfo };
      } else {
        const error = await response.json();
        setOrderState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to process return'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Order return error:', error);
      setOrderState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to process return'
      }));
      return { success: false, error: 'Failed to process return' };
    }
  }, [user, trackUserActivity]);

  // Reorder items
  const reorder = useCallback(async (orderId) => {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // Track reorder activity
        await trackUserActivity('order_reordered', user?.id, {
          originalOrderId: orderId,
          itemsAdded: result.addedItems?.length || 0
        });

        return { 
          success: true, 
          message: 'Items added to cart',
          addedItems: result.addedItems,
          unavailableItems: result.unavailableItems
        };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Reorder error:', error);
      return { success: false, error: 'Failed to reorder items' };
    }
  }, [user, trackUserActivity]);

  // Rate and review order
  const rateOrder = useCallback(async (orderId, rating, review = '') => {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, review })
      });

      if (response.ok) {
        const reviewData = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          orders: prev.orders.map(order => 
            order.id === orderId ? { ...order, hasReview: true, rating } : order
          )
        }));

        // Track review submission
        await trackUserActivity('order_reviewed', user?.id, {
          orderId,
          rating
        });

        return { success: true, review: reviewData };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Order review error:', error);
      return { success: false, error: 'Failed to submit review' };
    }
  }, [user, trackUserActivity]);

  // Request refund
  const requestRefund = useCallback(async (orderId, refundData) => {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      });

      if (response.ok) {
        const refund = await response.json();
        
        setOrderState(prev => ({
          ...prev,
          refunds: [...prev.refunds, refund]
        }));

        return { success: true, refund };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Refund request error:', error);
      return { success: false, error: 'Failed to request refund' };
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setOrderState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setOrderState(prev => ({
      ...prev,
      filters: {
        status: '',
        dateRange: 'all',
        startDate: null,
        endDate: null,
        vendor: '',
        paymentMethod: '',
        shippingMethod: '',
        orderType: '',
        sortBy: 'newest',
        searchQuery: ''
      },
      currentPage: 1
    }));
  }, []);

  // Search orders
  const searchOrders = useCallback(async (query) => {
    applyFilters({ searchQuery: query });
  }, [applyFilters]);

  // Get order statistics
  const getOrderStatistics = useCallback(async (period = 'month') => {
    try {
      const response = await fetch(`/api/v1/orders/statistics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const statistics = await response.json();
        setOrderState(prev => ({
          ...prev,
          orderStatistics: statistics
        }));
        return { success: true, statistics };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Statistics fetch error:', error);
      return { success: false };
    }
  }, []);

  // Save order as favorite (for easy reordering)
  const saveFavoriteOrder = useCallback((order) => {
    setOrderState(prev => {
      const exists = prev.favoriteOrders.find(fav => fav.id === order.id);
      if (exists) return prev;

      const updated = [...prev.favoriteOrders, order].slice(0, 10); // Keep last 10
      
      // Save to localStorage
      localStorage.setItem('favoriteOrders', JSON.stringify(updated));
      
      return {
        ...prev,
        favoriteOrders: updated
      };
    });
  }, []);

  // Load recent orders for dashboard
  const loadRecentOrders = useCallback(async (limit = 5) => {
    try {
      const response = await fetch(`/api/v1/orders/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const recentOrders = await response.json();
        setOrderState(prev => ({
          ...prev,
          recentOrders
        }));
        return { success: true, orders: recentOrders };
      }
      return { success: false };
    } catch (error) {
      console.error('Recent orders fetch error:', error);
      return { success: false };
    }
  }, []);

  // Computed values
  const filteredOrderCount = useMemo(() => {
    return orderState.totalOrders;
  }, [orderState.totalOrders]);

  const hasActiveFilters = useMemo(() => {
    const { filters } = orderState;
    return filters.status || filters.vendor || filters.paymentMethod || 
           filters.shippingMethod || filters.orderType || filters.searchQuery ||
           filters.dateRange !== 'all';
  }, [orderState.filters]);

  const orderStatusCounts = useMemo(() => {
    return orderState.orderStatistics;
  }, [orderState.orderStatistics]);

  const canCancelOrder = useCallback((order) => {
    const cancelableStatuses = ['pending', 'confirmed', 'processing'];
    return cancelableStatuses.includes(order.status);
  }, []);

  const canReturnOrder = useCallback((order) => {
    const returnableStatuses = ['delivered'];
    const deliveryDate = new Date(order.deliveredAt);
    const daysSinceDelivery = (new Date() - deliveryDate) / (1000 * 60 * 60 * 24);
    
    return returnableStatuses.includes(order.status) && daysSinceDelivery <= 7; // 7 days return policy
  }, []);

  const canTrackOrder = useCallback((order) => {
    const trackableStatuses = ['confirmed', 'processing', 'shipped'];
    return trackableStatuses.includes(order.status) && order.trackingNumber;
  }, []);

  return {
    // State
    ...orderState,
    
    // Methods
    loadOrders,
    loadMore,
    getOrder,
    trackOrder,
    cancelOrder,
    returnOrder,
    reorder,
    rateOrder,
    requestRefund,
    applyFilters,
    clearFilters,
    searchOrders,
    getOrderStatistics,
    saveFavoriteOrder,
    loadRecentOrders,

    // Computed values
    filteredOrderCount,
    hasActiveFilters,
    orderStatusCounts,
    canCancelOrder,
    canReturnOrder,
    canTrackOrder,
    isEmpty: !orderState.loading && orderState.orders.length === 0,
    hasOrders: orderState.orders.length > 0,
    canLoadMore: orderState.hasMore && !orderState.loading,
    isLoading: orderState.loading,

    // Bangladesh-specific features
    supportsCOD: true, // Bangladesh supports COD
    supportsLocalReturn: true, // Local return centers available
    hasLocalSupport: true, // Bengali customer support available
    
    // Quick status filters
    pendingOrders: orderState.orders.filter(order => order.status === 'pending'),
    processingOrders: orderState.orders.filter(order => order.status === 'processing'),
    shippedOrders: orderState.orders.filter(order => order.status === 'shipped'),
    deliveredOrders: orderState.orders.filter(order => order.status === 'delivered')
  };
};

export default useOrders;