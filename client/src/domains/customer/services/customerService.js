/**
 * Enhanced Customer Service Layer
 * Complete integration with backend microservices for Amazon.com/Shopee.sg-level functionality
 */

import { apiRequest } from '../../../lib/queryClient';

// API Base URLs
const API_BASE = '/api/v1';

class CustomerService {
  // ==========================================
  // AUTHENTICATION SERVICES
  // ==========================================

  /**
   * User login with multiple methods (email, phone, social)
   */
  async login(credentials) {
    try {
      const response = await apiRequest(`${API_BASE}/users/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * User registration with OTP verification
   */
  async register(userData) {
    try {
      const response = await apiRequest(`${API_BASE}/users/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Verify OTP for phone/email verification
   */
  async verifyOTP(verificationData) {
    try {
      const response = await apiRequest(`${API_BASE}/users/verify-otp`, {
        method: 'POST',
        body: JSON.stringify(verificationData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }

  /**
   * Social login (Google, Facebook, Apple)
   */
  async socialLogin(provider, token) {
    try {
      const response = await apiRequest(`${API_BASE}/users/social-login`, {
        method: 'POST',
        body: JSON.stringify({ provider, token }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Social login failed');
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiRequest(`${API_BASE}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  // ==========================================
  // PRODUCT SERVICES
  // ==========================================

  /**
   * Get products with advanced filtering and pagination
   */
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiRequest(`${API_BASE}/products?${queryParams}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  /**
   * Get single product with full details
   */
  async getProduct(productId) {
    try {
      const response = await apiRequest(`${API_BASE}/products/${productId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product details');
    }
  }

  /**
   * Search products with advanced filters
   */
  async searchProducts(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        ...filters
      };
      const queryParams = new URLSearchParams(searchParams).toString();
      const response = await apiRequest(`${API_BASE}/products/search?${queryParams}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Search failed');
    }
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(productId, userId = null) {
    try {
      const params = { productId, userId };
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiRequest(`${API_BASE}/ml/recommendations?${queryParams}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch recommendations');
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(category = null) {
    try {
      const params = category ? { category } : {};
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiRequest(`${API_BASE}/products/featured?${queryParams}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch featured products');
    }
  }

  // ==========================================
  // CART SERVICES
  // ==========================================

  /**
   * Get user's cart items
   */
  async getCart(userId) {
    try {
      const response = await apiRequest(`${API_BASE}/orders/cart/${userId}`);
      return response;
    } catch (error) {
      // Fallback to local storage for guest users
      const localCart = localStorage.getItem('guest_cart');
      return localCart ? JSON.parse(localCart) : { items: [] };
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(cartItem) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Authenticated user - save to backend
        const response = await apiRequest(`${API_BASE}/orders/cart/add`, {
          method: 'POST',
          body: JSON.stringify(cartItem),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return response;
      } else {
        // Guest user - save to local storage
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items":[]}');
        const existingItemIndex = localCart.items.findIndex(
          item => item.productId === cartItem.productId && item.variantId === cartItem.variantId
        );
        
        if (existingItemIndex >= 0) {
          localCart.items[existingItemIndex].quantity += cartItem.quantity;
        } else {
          localCart.items.push({ ...cartItem, id: Date.now().toString() });
        }
        
        localStorage.setItem('guest_cart', JSON.stringify(localCart));
        return localCart;
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to add item to cart');
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId, quantity) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const response = await apiRequest(`${API_BASE}/orders/cart/update/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return response;
      } else {
        // Guest user - update local storage
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items":[]}');
        const itemIndex = localCart.items.findIndex(item => item.id === itemId);
        
        if (itemIndex >= 0) {
          if (quantity > 0) {
            localCart.items[itemIndex].quantity = quantity;
          } else {
            localCart.items.splice(itemIndex, 1);
          }
        }
        
        localStorage.setItem('guest_cart', JSON.stringify(localCart));
        return localCart;
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to update cart item');
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const response = await apiRequest(`${API_BASE}/orders/cart/remove/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        return response;
      } else {
        // Guest user - remove from local storage
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items":[]}');
        localCart.items = localCart.items.filter(item => item.id !== itemId);
        localStorage.setItem('guest_cart', JSON.stringify(localCart));
        return localCart;
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to remove item from cart');
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId = null) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token && userId) {
        const response = await apiRequest(`${API_BASE}/orders/cart/clear/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        return response;
      } else {
        localStorage.removeItem('guest_cart');
        return { items: [] };
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to clear cart');
    }
  }

  // ==========================================
  // WISHLIST SERVICES
  // ==========================================

  /**
   * Get user's wishlist
   */
  async getWishlist(userId) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest(`${API_BASE}/users/wishlist/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      // Fallback to local storage for guest users
      const localWishlist = localStorage.getItem('guest_wishlist');
      return localWishlist ? JSON.parse(localWishlist) : { items: [] };
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(productId, userId = null) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token && userId) {
        const response = await apiRequest(`${API_BASE}/users/wishlist/add`, {
          method: 'POST',
          body: JSON.stringify({ productId, userId }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return response;
      } else {
        // Guest user - save to local storage
        const localWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '{"items":[]}');
        if (!localWishlist.items.includes(productId)) {
          localWishlist.items.push(productId);
          localStorage.setItem('guest_wishlist', JSON.stringify(localWishlist));
        }
        return localWishlist;
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to add to wishlist');
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(productId, userId = null) {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token && userId) {
        const response = await apiRequest(`${API_BASE}/users/wishlist/remove`, {
          method: 'DELETE',
          body: JSON.stringify({ productId, userId }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return response;
      } else {
        // Guest user - remove from local storage
        const localWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '{"items":[]}');
        localWishlist.items = localWishlist.items.filter(item => item !== productId);
        localStorage.setItem('guest_wishlist', JSON.stringify(localWishlist));
        return localWishlist;
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to remove from wishlist');
    }
  }

  // ==========================================
  // ORDER SERVICES
  // ==========================================

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest(`${API_BASE}/orders/create`, {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Clear cart after successful order
      if (response.success) {
        if (orderData.userId) {
          await this.clearCart(orderData.userId);
        } else {
          localStorage.removeItem('guest_cart');
        }
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Get user's order history
   */
  async getOrders(userId, filters = {}) {
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams({ userId, ...filters }).toString();
      const response = await apiRequest(`${API_BASE}/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get single order details
   */
  async getOrder(orderId) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest(`${API_BASE}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order details');
    }
  }

  /**
   * Track order status
   */
  async trackOrder(orderId) {
    try {
      const response = await apiRequest(`${API_BASE}/shipping/track/${orderId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to track order');
    }
  }

  // ==========================================
  // PAYMENT SERVICES
  // ==========================================

  /**
   * Process payment with Bangladesh payment gateways
   */
  async processPayment(paymentData) {
    try {
      const { method, ...data } = paymentData;
      let endpoint;
      
      switch (method) {
        case 'bkash':
          endpoint = `${API_BASE}/payments/bkash/process`;
          break;
        case 'nagad':
          endpoint = `${API_BASE}/payments/nagad/process`;
          break;
        case 'rocket':
          endpoint = `${API_BASE}/payments/rocket/process`;
          break;
        case 'card':
          endpoint = `${API_BASE}/payments/ssl-commerz/process`;
          break;
        default:
          throw new Error('Invalid payment method');
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId, method) {
    try {
      const response = await apiRequest(`${API_BASE}/payments/${method}/verify/${transactionId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Payment verification failed');
    }
  }

  // ==========================================
  // SHIPPING SERVICES
  // ==========================================

  /**
   * Calculate shipping costs
   */
  async calculateShipping(shippingData) {
    try {
      const response = await apiRequest(`${API_BASE}/shipping/calculate`, {
        method: 'POST',
        body: JSON.stringify(shippingData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to calculate shipping');
    }
  }

  /**
   * Get shipping options for address
   */
  async getShippingOptions(address) {
    try {
      const response = await apiRequest(`${API_BASE}/shipping/options`, {
        method: 'POST',
        body: JSON.stringify(address),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch shipping options');
    }
  }

  // ==========================================
  // USER PROFILE SERVICES
  // ==========================================

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest(`${API_BASE}/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await apiRequest(`${API_BASE}/users/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  /**
   * Sync guest data with user account after login
   */
  async syncGuestData(userId) {
    try {
      const guestCart = localStorage.getItem('guest_cart');
      const guestWishlist = localStorage.getItem('guest_wishlist');
      
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        for (const item of cartData.items) {
          await this.addToCart({ ...item, userId });
        }
        localStorage.removeItem('guest_cart');
      }
      
      if (guestWishlist) {
        const wishlistData = JSON.parse(guestWishlist);
        for (const productId of wishlistData.items) {
          await this.addToWishlist(productId, userId);
        }
        localStorage.removeItem('guest_wishlist');
      }
    } catch (error) {
      console.error('Failed to sync guest data:', error);
    }
  }
}

// Create and export singleton instance
const customerService = new CustomerService();
export default customerService;
export { customerService };