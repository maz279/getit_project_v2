/**
 * Customer API Service - Complete Frontend-Backend Synchronization
 * 
 * This service provides 100% integration with all 15 microservices
 * ensuring complete utilization of our Amazon.com/Shopee.sg-level backend
 */

class CustomerApiService {
  constructor() {
    this.baseURL = '/api/v1';
    this.token = null;
  }

  // ============================================================================
  // AUTHENTICATION & SESSION (user-service integration)
  // ============================================================================
  
  async login(credentials) {
    return this.request('/users/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  async register(userData) {
    return this.request('/users/auth/register', {
      method: 'POST', 
      body: userData
    });
  }

  async logout() {
    return this.request('/users/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  // ============================================================================
  // PRODUCT CATALOG (product-service integration)
  // ============================================================================

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async searchProducts(query, filters = {}) {
    return this.request('/products/search', {
      method: 'POST',
      body: { query, filters }
    });
  }

  async getProductReviews(productId, page = 1) {
    return this.request(`/products/${productId}/reviews?page=${page}`);
  }

  async addProductReview(productId, review) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: review
    });
  }

  async getRelatedProducts(productId) {
    return this.request(`/products/${productId}/related`);
  }

  async getProductVariants(productId) {
    return this.request(`/products/${productId}/variants`);
  }

  // ============================================================================ 
  // CATEGORY MANAGEMENT (product-service integration)
  // ============================================================================

  async getCategories() {
    return this.request('/products/categories');
  }

  async getCategory(id) {
    return this.request(`/products/categories/${id}`);
  }

  async getCategoryProducts(categoryId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products/categories/${categoryId}/products?${queryString}`);
  }

  // ============================================================================
  // SHOPPING CART (order-service integration) 
  // ============================================================================

  async getCart() {
    return this.request('/orders/cart');
  }

  async addToCart(productId, quantity = 1, variantId = null) {
    return this.request('/orders/cart/items', {
      method: 'POST',
      body: { productId, quantity, variantId }
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/orders/cart/items/${itemId}`, {
      method: 'PUT',
      body: { quantity }
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/orders/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  async clearCart() {
    return this.request('/orders/cart', {
      method: 'DELETE'
    });
  }

  async applyCoupon(couponCode) {
    return this.request('/orders/cart/coupon', {
      method: 'POST',
      body: { couponCode }
    });
  }

  // ============================================================================
  // ORDER MANAGEMENT (order-service integration)
  // ============================================================================

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: orderData
    });
  }

  async getOrders(page = 1, status = null) {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    return this.request(`/orders?${params}`);
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async cancelOrder(orderId, reason) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: { reason }
    });
  }

  async trackOrder(orderId) {
    return this.request(`/orders/${orderId}/tracking`);
  }

  async requestReturn(orderId, items, reason) {
    return this.request(`/orders/${orderId}/return`, {
      method: 'POST',
      body: { items, reason }
    });
  }

  // ============================================================================
  // PAYMENT PROCESSING (payment-service integration)
  // ============================================================================

  async initiateBkashPayment(amount, orderId) {
    return this.request('/payments/bkash/initiate', {
      method: 'POST',
      body: { amount, orderId }
    });
  }

  async initiateNagadPayment(amount, orderId) {
    return this.request('/payments/nagad/initiate', {
      method: 'POST',
      body: { amount, orderId }
    });
  }

  async initiateRocketPayment(amount, orderId) {
    return this.request('/payments/rocket/initiate', {
      method: 'POST',
      body: { amount, orderId }
    });
  }

  async verifyPayment(paymentId, pin) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: { paymentId, pin }
    });
  }

  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  async addPaymentMethod(method) {
    return this.request('/payments/methods', {
      method: 'POST',
      body: method
    });
  }

  // ============================================================================
  // SHIPPING & LOGISTICS (shipping-service integration)
  // ============================================================================

  async getShippingZones() {
    return this.request('/shipping/zones');
  }

  async calculateShipping(address, items) {
    return this.request('/shipping/calculate', {
      method: 'POST',
      body: { address, items }
    });
  }

  async getShippingMethods(zoneId) {
    return this.request(`/shipping/methods?zoneId=${zoneId}`);
  }

  async trackShipment(trackingNumber) {
    return this.request(`/shipping/track/${trackingNumber}`);
  }

  // ============================================================================
  // VENDOR SERVICES (vendor-service integration)
  // ============================================================================

  async getVendors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vendors?${queryString}`);
  }

  async getVendor(vendorId) {
    return this.request(`/vendors/${vendorId}`);
  }

  async getVendorProducts(vendorId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/vendors/${vendorId}/products?${queryString}`);
  }

  async getVendorReviews(vendorId) {
    return this.request(`/vendors/${vendorId}/reviews`);
  }

  async addVendorReview(vendorId, review) {
    return this.request(`/vendors/${vendorId}/reviews`, {
      method: 'POST',
      body: review
    });
  }

  async followVendor(vendorId) {
    return this.request(`/vendors/${vendorId}/follow`, {
      method: 'POST'
    });
  }

  async unfollowVendor(vendorId) {
    return this.request(`/vendors/${vendorId}/follow`, {
      method: 'DELETE'
    });
  }

  // ============================================================================
  // WISHLIST MANAGEMENT (user-service integration)
  // ============================================================================

  async getWishlist() {
    return this.request('/users/wishlist');
  }

  async addToWishlist(productId) {
    return this.request('/users/wishlist', {
      method: 'POST',
      body: { productId }
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/users/wishlist/${productId}`, {
      method: 'DELETE'
    });
  }

  async moveWishlistToCart(productIds) {
    return this.request('/users/wishlist/move-to-cart', {
      method: 'POST',
      body: { productIds }
    });
  }

  // ============================================================================
  // ADVANCED SEARCH (search-service integration)
  // ============================================================================

  async aiSearch(query, context = {}) {
    return this.request('/search/ai', {
      method: 'POST',
      body: { query, context }
    });
  }

  async visualSearch(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.request('/search/visual', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  }

  async getSearchSuggestions(query) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async getPopularSearches() {
    return this.request('/search/popular');
  }

  // ============================================================================
  // RECOMMENDATIONS (ml-service integration)
  // ============================================================================

  async getRecommendations(type = 'general', context = {}) {
    return this.request('/ml/recommendations', {
      method: 'POST',
      body: { type, context }
    });
  }

  async getPersonalizedProducts() {
    return this.request('/ml/personalized');
  }

  async getTrendingProducts() {
    return this.request('/ml/trending');
  }

  async getSimilarProducts(productId) {
    return this.request(`/ml/similar/${productId}`);
  }

  // ============================================================================
  // NOTIFICATIONS (notification-service integration)
  // ============================================================================

  async getNotifications(page = 1, unreadOnly = false) {
    const params = new URLSearchParams({ page });
    if (unreadOnly) params.append('unread', 'true');
    return this.request(`/notifications?${params}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  async updateNotificationSettings(settings) {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: settings
    });
  }

  // ============================================================================
  // ANALYTICS TRACKING (analytics-service integration)
  // ============================================================================

  async trackEvent(eventName, properties = {}) {
    return this.request('/analytics/track', {
      method: 'POST',
      body: { event: eventName, properties }
    });
  }

  async trackPageView(page, properties = {}) {
    return this.request('/analytics/pageview', {
      method: 'POST',
      body: { page, properties }
    });
  }

  async trackPurchase(orderId, items) {
    return this.request('/analytics/purchase', {
      method: 'POST',
      body: { orderId, items }
    });
  }

  // ============================================================================
  // KYC VERIFICATION (kyc-service integration)
  // ============================================================================

  async submitKycDocuments(documents) {
    const formData = new FormData();
    Object.keys(documents).forEach(key => {
      formData.append(key, documents[key]);
    });

    return this.request('/kyc/documents', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  }

  async getKycStatus() {
    return this.request('/kyc/status');
  }

  // ============================================================================
  // MARKETING & PROMOTIONS (marketing-service integration)
  // ============================================================================

  async getPromotions() {
    return this.request('/marketing/promotions');
  }

  async getCoupons() {
    return this.request('/marketing/coupons');
  }

  async validateCoupon(couponCode) {
    return this.request(`/marketing/coupons/${couponCode}/validate`);
  }

  async getFlashSales() {
    return this.request('/marketing/flash-sales');
  }

  async joinFlashSale(saleId) {
    return this.request(`/marketing/flash-sales/${saleId}/join`, {
      method: 'POST'
    });
  }

  // ============================================================================
  // INVENTORY TRACKING (inventory-service integration)
  // ============================================================================

  async checkProductAvailability(productId, quantity = 1) {
    return this.request(`/inventory/check/${productId}?quantity=${quantity}`);
  }

  async getStockAlerts() {
    return this.request('/inventory/alerts');
  }

  async subscribeToStockAlert(productId) {
    return this.request('/inventory/alerts/subscribe', {
      method: 'POST',
      body: { productId }
    });
  }

  // ============================================================================
  // FINANCE & LOYALTY (finance-service integration)
  // ============================================================================

  async getLoyaltyPoints() {
    return this.request('/finance/loyalty/points');
  }

  async getLoyaltyHistory() {
    return this.request('/finance/loyalty/history');
  }

  async redeemLoyaltyPoints(points, orderId) {
    return this.request('/finance/loyalty/redeem', {
      method: 'POST',
      body: { points, orderId }
    });
  }

  async getWalletBalance() {
    return this.request('/finance/wallet/balance');
  }

  async addFundsToWallet(amount, paymentMethod) {
    return this.request('/finance/wallet/add-funds', {
      method: 'POST',
      body: { amount, paymentMethod }
    });
  }

  // ============================================================================
  // LOCALIZATION (localization-service integration)
  // ============================================================================

  async getTranslations(language = 'en') {
    return this.request(`/localization/translations/${language}`);
  }

  async getCurrencyRates() {
    return this.request('/localization/currency');
  }

  async getShippingZonesByLocation(location) {
    return this.request('/localization/shipping-zones', {
      method: 'POST',
      body: { location }
    });
  }

  // ============================================================================
  // CORE REQUEST HANDLER
  // ============================================================================

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      isFormData = false
    } = options;

    const config = {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    // Add authentication token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // Handle body data
    if (body && !isFormData) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    } else if (body && isFormData) {
      config.body = body;
      // Don't set Content-Type for FormData, let browser set it
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

// Export singleton instance
export default new CustomerApiService();

// Export class for testing
export { CustomerApiService };