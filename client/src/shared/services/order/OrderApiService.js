/**
 * Order API Service - Complete Amazon.com/Shopee.sg-Level Order Management
 * Frontend-Backend Integration for Order Service Microservice
 */

const API_BASE = '/api/v1/orders';

class OrderApiService {
  constructor() {
    this.servicePath = API_BASE;
  }

  // ============================================================================
  // CART MANAGEMENT API
  // ============================================================================

  async addToCart(cartData) {
    try {
      const { userId, productId, quantity, vendorId } = cartData;
      const response = await fetch(`${this.servicePath}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ userId, productId, quantity, vendorId }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  async updateCartItem(itemId, quantity, userId) {
    try {
      const response = await fetch(`${this.servicePath}/cart/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ quantity, userId }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  }

  async removeFromCart(itemId, userId) {
    try {
      const response = await fetch(`${this.servicePath}/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
  }

  async getCartItems(userId) {
    try {
      const response = await fetch(`${this.servicePath}/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get cart items: ${error.message}`);
    }
  }

  async clearCart(userId) {
    try {
      const response = await fetch(`${this.servicePath}/cart/${userId}/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  }

  async getCartSummary(userId) {
    try {
      const response = await fetch(`${this.servicePath}/cart/${userId}/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get cart summary: ${error.message}`);
    }
  }

  async applyCoupon(userId, couponCode) {
    try {
      const response = await fetch(`${this.servicePath}/cart/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ userId, couponCode }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to apply coupon: ${error.message}`);
    }
  }

  // ============================================================================
  // CHECKOUT MANAGEMENT API
  // ============================================================================

  async initializeCheckout(userId) {
    try {
      const response = await fetch(`${this.servicePath}/checkout/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to initialize checkout: ${error.message}`);
    }
  }

  async updateShippingAddress(sessionId, addressData) {
    try {
      const response = await fetch(`${this.servicePath}/checkout/${sessionId}/shipping`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(addressData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update shipping address: ${error.message}`);
    }
  }

  async selectPaymentMethod(sessionId, paymentData) {
    try {
      const response = await fetch(`${this.servicePath}/checkout/${sessionId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(paymentData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to select payment method: ${error.message}`);
    }
  }

  async reviewOrder(sessionId, reviewData = {}) {
    try {
      const response = await fetch(`${this.servicePath}/checkout/${sessionId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to review order: ${error.message}`);
    }
  }

  async confirmOrder(sessionId, agreesToTerms = true) {
    try {
      const response = await fetch(`${this.servicePath}/checkout/${sessionId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ agreesToTerms }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to confirm order: ${error.message}`);
    }
  }

  async getCheckoutStatus(sessionId) {
    try {
      const response = await fetch(`${this.servicePath}/checkout/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get checkout status: ${error.message}`);
    }
  }

  // ============================================================================
  // ORDER MANAGEMENT API
  // ============================================================================

  async createOrder(orderData) {
    try {
      const response = await fetch(`${this.servicePath}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async getOrders(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams({ userId, ...filters });
      const response = await fetch(`${this.servicePath}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async getOrder(orderId) {
    try {
      const response = await fetch(`${this.servicePath}/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const response = await fetch(`${this.servicePath}/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  async cancelOrder(orderId, reason = '') {
    try {
      const response = await fetch(`${this.servicePath}/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  // ============================================================================
  // VENDOR ORDER MANAGEMENT API
  // ============================================================================

  async getVendorOrders(vendorId, filters = {}) {
    try {
      const queryParams = new URLSearchParams({ vendorId, ...filters });
      const response = await fetch(`${this.servicePath}/vendor?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get vendor orders: ${error.message}`);
    }
  }

  async updateVendorOrderStatus(vendorOrderId, status, notes = '') {
    try {
      const response = await fetch(`${this.servicePath}/vendor/${vendorOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update vendor order status: ${error.message}`);
    }
  }

  async getVendorOrderSummary(vendorId, period = 'month') {
    try {
      const response = await fetch(`${this.servicePath}/vendor/${vendorId}/summary?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get vendor order summary: ${error.message}`);
    }
  }

  // ============================================================================
  // COD MANAGEMENT API (BANGLADESH SPECIFIC)
  // ============================================================================

  async validateCODEligibility(orderData) {
    try {
      const response = await fetch(`${this.servicePath}/cod/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to validate COD eligibility: ${error.message}`);
    }
  }

  async calculateCODFee(amount, region = 'dhaka') {
    try {
      const response = await fetch(`${this.servicePath}/cod/fee?amount=${amount}&region=${region}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to calculate COD fee: ${error.message}`);
    }
  }

  async getCODOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.servicePath}/cod?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get COD orders: ${error.message}`);
    }
  }

  async updateCODCollection(codOrderId, collectionData) {
    try {
      const response = await fetch(`${this.servicePath}/cod/${codOrderId}/collection`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(collectionData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update COD collection: ${error.message}`);
    }
  }

  // ============================================================================
  // ORDER TRACKING API
  // ============================================================================

  async trackOrder(orderNumber) {
    try {
      const response = await fetch(`${this.servicePath}/track/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to track order: ${error.message}`);
    }
  }

  async getOrderHistory(orderId) {
    try {
      const response = await fetch(`${this.servicePath}/${orderId}/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get order history: ${error.message}`);
    }
  }

  async getShippingUpdates(orderId) {
    try {
      const response = await fetch(`${this.servicePath}/${orderId}/shipping`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get shipping updates: ${error.message}`);
    }
  }

  // ============================================================================
  // BANGLADESH-SPECIFIC FEATURES
  // ============================================================================

  async calculateBangladeshTax(orderData) {
    try {
      const response = await fetch(`${this.servicePath}/tax/bangladesh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to calculate Bangladesh tax: ${error.message}`);
    }
  }

  async getLocalShippingOptions(address) {
    try {
      const response = await fetch(`${this.servicePath}/shipping/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ address }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get local shipping options: ${error.message}`);
    }
  }

  async validateBangladeshAddress(address) {
    try {
      const response = await fetch(`${this.servicePath}/address/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ address }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to validate Bangladesh address: ${error.message}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async getServiceHealth() {
    try {
      const response = await fetch(`${this.servicePath}/health`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get service health: ${error.message}`);
    }
  }
}

export default new OrderApiService();