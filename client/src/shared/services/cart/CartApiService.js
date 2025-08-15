/**
 * Cart API Service - Amazon.com/Shopee.sg-level Cart Management
 * Complete frontend integration with cart-service microservice
 */

import { apiRequest } from '../api/ApiService';
import { localStorageService } from '../localStorage/LocalStorageService';

class CartApiService {
  constructor() {
    this.baseUrl = '/api/v1/carts';
    this.localCart = localStorageService.createCartStorage();
  }

  // ========================================================================================
  // CART MANAGEMENT
  // ========================================================================================

  /**
   * Get or create user's active cart
   */
  async getActiveCart(userId = null, guestId = null) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (guestId) params.append('guestId', guestId);
      
      const response = await apiRequest(`${this.baseUrl}/active?${params}`, {
        method: 'GET'
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      } else {
        // Fallback to local cart
        return this.localCart.getCart();
      }
    } catch (error) {
      console.error('Error getting active cart:', error);
      return this.localCart.getCart();
    }
  }

  /**
   * Create new cart
   */
  async createCart(cartData) {
    try {
      const response = await apiRequest(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(cartData)
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating cart:', error);
      return null;
    }
  }

  /**
   * Update cart information
   */
  async updateCart(cartId, updateData) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating cart:', error);
      return null;
    }
  }

  /**
   * Clear cart
   */
  async clearCart(cartId) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/clear`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        this.localCart.clearCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cart:', error);
      this.localCart.clearCart();
      return true;
    }
  }

  // ========================================================================================
  // CART ITEMS MANAGEMENT
  // ========================================================================================

  /**
   * Add item to cart
   */
  async addToCart(cartId, itemData) {
    try {
      // Add to local cart immediately for better UX
      this.localCart.addItem(itemData);
      
      const response = await apiRequest(`${this.baseUrl}/${cartId}/items`, {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      } else {
        // Revert local change if server fails
        this.localCart.removeItem(itemData.productId);
        return null;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Keep local change for offline capability
      return this.localCart.getCart();
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(cartId, itemId, quantity) {
    try {
      // Update local cart immediately
      this.localCart.updateItemQuantity(itemId, quantity);
      
      const response = await apiRequest(`${this.baseUrl}/${cartId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      }
      return this.localCart.getCart();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return this.localCart.getCart();
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartId, itemId) {
    try {
      // Remove from local cart immediately
      this.localCart.removeItem(itemId);
      
      const response = await apiRequest(`${this.baseUrl}/${cartId}/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      }
      return this.localCart.getCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      return this.localCart.getCart();
    }
  }

  /**
   * Get cart items
   */
  async getCartItems(cartId) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/items`, {
        method: 'GET'
      });
      
      if (response.success) {
        return response.data;
      }
      return this.localCart.getItems();
    } catch (error) {
      console.error('Error getting cart items:', error);
      return this.localCart.getItems();
    }
  }

  // ========================================================================================
  // CART CALCULATIONS
  // ========================================================================================

  /**
   * Calculate cart totals
   */
  async calculateTotals(cartId) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/calculate`, {
        method: 'POST'
      });
      
      if (response.success) {
        return response.data;
      }
      return this.localCart.calculateTotals();
    } catch (error) {
      console.error('Error calculating totals:', error);
      return this.localCart.calculateTotals();
    }
  }

  /**
   * Apply shipping calculation
   */
  async applyShippingCalculation(cartId, shippingData) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/shipping/calculate`, {
        method: 'POST',
        body: JSON.stringify(shippingData)
      });
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return null;
    }
  }

  /**
   * Apply tax calculation
   */
  async applyTaxCalculation(cartId, taxData) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/tax/calculate`, {
        method: 'POST',
        body: JSON.stringify(taxData)
      });
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error calculating tax:', error);
      return null;
    }
  }

  // ========================================================================================
  // PROMOTIONS & COUPONS
  // ========================================================================================

  /**
   * Get available promotions for cart
   */
  async getAvailablePromotions(cartId) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/promotions/available`, {
        method: 'GET'
      });
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting promotions:', error);
      return [];
    }
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(cartId, couponCode) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/promotions/apply`, {
        method: 'POST',
        body: JSON.stringify({ couponCode })
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data.cart);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return null;
    }
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(cartId, couponCode) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/promotions/remove`, {
        method: 'DELETE',
        body: JSON.stringify({ couponCode })
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data.cart);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error removing coupon:', error);
      return null;
    }
  }

  // ========================================================================================
  // CART SHARING
  // ========================================================================================

  /**
   * Share cart with others
   */
  async shareCart(cartId, sharingData) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/share`, {
        method: 'POST',
        body: JSON.stringify(sharingData)
      });
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error sharing cart:', error);
      return null;
    }
  }

  /**
   * Get shared cart
   */
  async getSharedCart(shareToken) {
    try {
      const response = await apiRequest(`${this.baseUrl}/shared/${shareToken}`, {
        method: 'GET'
      });
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting shared cart:', error);
      return null;
    }
  }

  // ========================================================================================
  // CART ANALYTICS
  // ========================================================================================

  /**
   * Get cart analytics
   */
  async getCartAnalytics(cartId) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/analytics`, {
        method: 'GET'
      });
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting cart analytics:', error);
      return null;
    }
  }

  // ========================================================================================
  // CART RECOVERY
  // ========================================================================================

  /**
   * Recover abandoned cart
   */
  async recoverCart(recoveryToken) {
    try {
      const response = await apiRequest(`${this.baseUrl}/recover/${recoveryToken}`, {
        method: 'POST'
      });
      
      if (response.success) {
        this.localCart.syncWithServer(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error recovering cart:', error);
      return null;
    }
  }

  // ========================================================================================
  // BANGLADESH-SPECIFIC FEATURES
  // ========================================================================================

  /**
   * Calculate Bangladesh-specific pricing (VAT, delivery fees, etc.)
   */
  async calculateBangladeshPricing(cartId, locationData) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/bangladesh/pricing`, {
        method: 'POST',
        body: JSON.stringify(locationData)
      });
      
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error calculating Bangladesh pricing:', error);
      return null;
    }
  }

  /**
   * Get Bangladesh payment methods for cart
   */
  async getBangladeshPaymentMethods(cartId) {
    try {
      const response = await apiRequest(`${this.baseUrl}/${cartId}/bangladesh/payments`, {
        method: 'GET'
      });
      
      if (response.success) {
        return response.data;
      }
      return [
        { id: 'bkash', name: 'bKash', icon: 'bkash-icon', fee: 0 },
        { id: 'nagad', name: 'Nagad', icon: 'nagad-icon', fee: 0 },
        { id: 'rocket', name: 'Rocket', icon: 'rocket-icon', fee: 0 },
        { id: 'cod', name: 'Cash on Delivery', icon: 'money-icon', fee: 50 }
      ];
    } catch (error) {
      console.error('Error getting Bangladesh payment methods:', error);
      return [];
    }
  }
}

export const cartApiService = new CartApiService();
export default cartApiService;