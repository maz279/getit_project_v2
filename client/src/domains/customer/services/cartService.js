/**
 * Customer Cart Service
 * Provides customer-facing cart functionality integrating with order-service microservice
 */

const API_BASE = '/api/v1';

class CustomerCartService {
  constructor() {
    this.cartStorageKey = 'getit_cart';
    this.wishlistStorageKey = 'getit_wishlist';
  }

  // Get cart items for user
  async getCartItems(userId) {
    try {
      if (userId) {
        // Get cart from server for authenticated users
        const response = await fetch(`${API_BASE}/cart/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cartData = await response.json();
        return cartData.items?.map(this.transformCartItem) || [];
      } else {
        // Get cart from localStorage for guest users
        return this.getLocalCart();
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      // Fallback to localStorage
      return this.getLocalCart();
    }
  }

  // Add item to cart
  async addToCart(userId, productId, quantity = 1, variantId = null) {
    try {
      const cartItem = {
        productId,
        quantity,
        variantId,
        addedAt: new Date().toISOString()
      };

      if (userId) {
        // Add to server cart for authenticated users
        const response = await fetch(`${API_BASE}/cart/${userId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartItem)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } else {
        // Add to localStorage for guest users
        return this.addToLocalCart(cartItem);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage
      return this.addToLocalCart({ productId, quantity, variantId });
    }
  }

  // Update cart item quantity
  async updateCartItem(userId, itemId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(userId, itemId);
      }

      if (userId) {
        // Update server cart for authenticated users
        const response = await fetch(`${API_BASE}/cart/${userId}/items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } else {
        // Update localStorage for guest users
        return this.updateLocalCartItem(itemId, quantity);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      // Fallback to localStorage
      return this.updateLocalCartItem(itemId, quantity);
    }
  }

  // Remove item from cart
  async removeFromCart(userId, itemId) {
    try {
      if (userId) {
        // Remove from server cart for authenticated users
        const response = await fetch(`${API_BASE}/cart/${userId}/items/${itemId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true };
      } else {
        // Remove from localStorage for guest users
        return this.removeFromLocalCart(itemId);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to localStorage
      return this.removeFromLocalCart(itemId);
    }
  }

  // Clear entire cart
  async clearCart(userId) {
    try {
      if (userId) {
        // Clear server cart for authenticated users
        const response = await fetch(`${API_BASE}/cart/${userId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true };
      } else {
        // Clear localStorage for guest users
        return this.clearLocalCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to localStorage
      return this.clearLocalCart();
    }
  }

  // Get cart summary (totals, counts, etc.)
  async getCartSummary(userId) {
    try {
      const cartItems = await this.getCartItems(userId);
      
      const summary = {
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        items: cartItems
      };

      // Calculate shipping
      summary.shipping = summary.subtotal > 1000 ? 0 : 60; // Free shipping over ৳1000
      
      // Calculate tax (15% VAT)
      summary.tax = summary.subtotal * 0.15;
      
      // Calculate total
      summary.total = summary.subtotal + summary.shipping + summary.tax;

      return summary;
    } catch (error) {
      console.error('Error calculating cart summary:', error);
      return {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        items: []
      };
    }
  }

  // Sync guest cart to user account after login
  async syncGuestCart(userId) {
    try {
      const localCart = this.getLocalCart();
      if (localCart.length === 0) return;

      // Send local cart items to server
      const response = await fetch(`${API_BASE}/cart/${userId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: localCart })
      });

      if (response.ok) {
        // Clear local cart after successful sync
        this.clearLocalCart();
        return await response.json();
      }
    } catch (error) {
      console.error('Error syncing guest cart:', error);
    }
  }

  // Apply coupon code
  async applyCoupon(userId, couponCode) {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid coupon code');
      }

      return await response.json();
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  // Remove coupon
  async removeCoupon(userId) {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}/coupon`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  }

  // Wishlist functions
  async getWishlist(userId) {
    try {
      if (userId) {
        const response = await fetch(`${API_BASE}/wishlist/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const wishlistData = await response.json();
        return wishlistData.items || [];
      } else {
        return this.getLocalWishlist();
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return this.getLocalWishlist();
    }
  }

  async addToWishlist(userId, productId) {
    try {
      if (userId) {
        const response = await fetch(`${API_BASE}/wishlist/${userId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } else {
        return this.addToLocalWishlist(productId);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return this.addToLocalWishlist(productId);
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      if (userId) {
        const response = await fetch(`${API_BASE}/wishlist/${userId}/items/${productId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true };
      } else {
        return this.removeFromLocalWishlist(productId);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return this.removeFromLocalWishlist(productId);
    }
  }

  // localStorage helper functions for guest users
  getLocalCart() {
    try {
      const cart = localStorage.getItem(this.cartStorageKey);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error reading local cart:', error);
      return [];
    }
  }

  addToLocalCart(cartItem) {
    try {
      const cart = this.getLocalCart();
      const existingItemIndex = cart.findIndex(
        item => item.productId === cartItem.productId && item.variantId === cartItem.variantId
      );

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += cartItem.quantity;
      } else {
        cart.push({ ...cartItem, id: Date.now().toString() });
      }

      localStorage.setItem(this.cartStorageKey, JSON.stringify(cart));
      return cart;
    } catch (error) {
      console.error('Error adding to local cart:', error);
      return [];
    }
  }

  updateLocalCartItem(itemId, quantity) {
    try {
      const cart = this.getLocalCart();
      const itemIndex = cart.findIndex(item => item.id === itemId);
      
      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.splice(itemIndex, 1);
        } else {
          cart[itemIndex].quantity = quantity;
        }
        localStorage.setItem(this.cartStorageKey, JSON.stringify(cart));
      }
      
      return cart;
    } catch (error) {
      console.error('Error updating local cart item:', error);
      return [];
    }
  }

  removeFromLocalCart(itemId) {
    try {
      const cart = this.getLocalCart();
      const updatedCart = cart.filter(item => item.id !== itemId);
      localStorage.setItem(this.cartStorageKey, JSON.stringify(updatedCart));
      return { success: true };
    } catch (error) {
      console.error('Error removing from local cart:', error);
      return { success: false };
    }
  }

  clearLocalCart() {
    try {
      localStorage.removeItem(this.cartStorageKey);
      return { success: true };
    } catch (error) {
      console.error('Error clearing local cart:', error);
      return { success: false };
    }
  }

  getLocalWishlist() {
    try {
      const wishlist = localStorage.getItem(this.wishlistStorageKey);
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
      console.error('Error reading local wishlist:', error);
      return [];
    }
  }

  addToLocalWishlist(productId) {
    try {
      const wishlist = this.getLocalWishlist();
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem(this.wishlistStorageKey, JSON.stringify(wishlist));
      }
      return { success: true };
    } catch (error) {
      console.error('Error adding to local wishlist:', error);
      return { success: false };
    }
  }

  removeFromLocalWishlist(productId) {
    try {
      const wishlist = this.getLocalWishlist();
      const updatedWishlist = wishlist.filter(id => id !== productId);
      localStorage.setItem(this.wishlistStorageKey, JSON.stringify(updatedWishlist));
      return { success: true };
    } catch (error) {
      console.error('Error removing from local wishlist:', error);
      return { success: false };
    }
  }

  // Transform cart item data for frontend
  transformCartItem(item) {
    return {
      id: item.id,
      productId: item.productId,
      name: item.productName || item.name,
      imageUrl: item.productImage || item.imageUrl,
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      variantId: item.variantId,
      variant: item.variant,
      vendorName: item.vendorName,
      vendorId: item.vendorId,
      isInStock: item.isInStock !== false,
      addedAt: item.addedAt || item.createdAt
    };
  }
}

export const customerCartService = new CustomerCartService();
export default customerCartService;