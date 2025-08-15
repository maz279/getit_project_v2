/**
 * Cart Redis Service - Amazon.com/Shopee.sg Level Session Management
 * Critical missing component for real-time cart experience
 */
import { Redis } from 'ioredis';

interface CartSession {
  cartId: string;
  userId?: string;
  guestId?: string;
  items: CartItem[];
  totals: CartTotals;
  metadata: CartMetadata;
  timestamps: CartTimestamps;
  deviceInfo?: DeviceInfo;
}

interface CartItem {
  productId: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
  updatedAt: Date;
  variantId?: string;
  customizations?: any;
}

interface CartTotals {
  subtotal: number;
  taxes: number;
  shipping: number;
  discounts: number;
  total: number;
  currency: string;
  calculatedAt: Date;
}

interface CartMetadata {
  source: string; // 'web' | 'mobile' | 'app'
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    district?: string; // Bangladesh-specific
  };
  preferences: {
    currency: string;
    language: string;
    paymentMethod?: string;
  };
}

interface CartTimestamps {
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  fingerprint: string;
}

export class CartRedisService {
  private redis: Redis | null = null;
  private readonly CART_PREFIX = 'cart:';
  private readonly GUEST_TTL = 24 * 60 * 60; // 24 hours
  private readonly USER_TTL = 30 * 24 * 60 * 60; // 30 days
  private inMemoryCache: Map<string, any> = new Map();
  private isConnected = false;

  constructor() {
    // Always use in-memory fallback - no Redis connection attempts
    console.log('🔄 CartRedisService: Using in-memory fallback for cart sessions');
    this.isConnected = false;
    this.redis = null;
    
    // Start cleanup interval for in-memory cache
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Clean every minute
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    for (const [key, value] of this.inMemoryCache.entries()) {
      if (value && value.timestamps && new Date(value.timestamps.expiresAt).getTime() < now) {
        this.inMemoryCache.delete(key);
      }
    }
  }

  /**
   * Create new cart session
   */
  async createCart(userId?: string, guestId?: string, metadata?: Partial<CartMetadata>): Promise<string> {
    const cartId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const cartSession: CartSession = {
      cartId,
      userId,
      guestId,
      items: [],
      totals: {
        subtotal: 0,
        taxes: 0,
        shipping: 0,
        discounts: 0,
        total: 0,
        currency: 'BDT', // Bangladesh default
        calculatedAt: now
      },
      metadata: {
        source: metadata?.source || 'web',
        sessionId: metadata?.sessionId || '',
        ipAddress: metadata?.ipAddress || '',
        userAgent: metadata?.userAgent || '',
        location: metadata?.location,
        preferences: {
          currency: 'BDT',
          language: 'bn', // Bengali default for Bangladesh
          ...metadata?.preferences
        }
      },
      timestamps: {
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        expiresAt: new Date(now.getTime() + (userId ? this.USER_TTL : this.GUEST_TTL) * 1000)
      }
    };

    const key = this.getCartKey(cartId);
    const ttl = userId ? this.USER_TTL : this.GUEST_TTL;

    if (this.isRedisAvailable) {
      await this.redis.setex(key, ttl, JSON.stringify(cartSession));

      // Create user/guest mapping for quick lookup
      if (userId) {
        await this.redis.setex(`${this.CART_PREFIX}user:${userId}`, ttl, cartId);
      } else if (guestId) {
        await this.redis.setex(`${this.CART_PREFIX}guest:${guestId}`, ttl, cartId);
      }
    } else {
      // Fallback to memory store
      this.memoryStore.set(key, JSON.stringify(cartSession));
      if (userId) {
        this.memoryStore.set(`${this.CART_PREFIX}user:${userId}`, cartId);
      } else if (guestId) {
        this.memoryStore.set(`${this.CART_PREFIX}guest:${guestId}`, cartId);
      }
    }

    return cartId;
  }

  /**
   * Get cart session by ID
   */
  async getCart(cartId: string): Promise<CartSession | null> {
    try {
      const key = this.getCartKey(cartId);
      let cartData: string | null;
      
      if (this.isRedisAvailable) {
        cartData = await this.redis.get(key);
      } else {
        cartData = this.memoryStore.get(key) || null;
      }
      
      if (!cartData) {
        return null;
      }

      const cart = JSON.parse(cartData) as CartSession;
      
      // Update last activity
      cart.timestamps.lastActivityAt = new Date();
      await this.updateCart(cart);
      
      return cart;
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  }

  /**
   * Get cart by user ID
   */
  async getCartByUserId(userId: string): Promise<CartSession | null> {
    try {
      const cartId = await this.redis.get(`${this.CART_PREFIX}user:${userId}`);
      if (!cartId) {
        return null;
      }
      return this.getCart(cartId);
    } catch (error) {
      console.error('Error getting cart by user ID:', error);
      return null;
    }
  }

  /**
   * Get cart by guest ID
   */
  async getCartByGuestId(guestId: string): Promise<CartSession | null> {
    try {
      const cartId = await this.redis.get(`${this.CART_PREFIX}guest:${guestId}`);
      if (!cartId) {
        return null;
      }
      return this.getCart(cartId);
    } catch (error) {
      console.error('Error getting cart by guest ID:', error);
      return null;
    }
  }

  /**
   * Update cart session
   */
  async updateCart(cart: CartSession): Promise<void> {
    try {
      cart.timestamps.updatedAt = new Date();
      cart.timestamps.lastActivityAt = new Date();
      
      const key = this.getCartKey(cart.cartId);
      const ttl = cart.userId ? this.USER_TTL : this.GUEST_TTL;
      
      if (this.isRedisAvailable) {
        await this.redis.setex(key, ttl, JSON.stringify(cart));
      } else {
        this.memoryStore.set(key, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, item: Omit<CartItem, 'addedAt' | 'updatedAt'>): Promise<CartSession | null> {
    try {
      const cart = await this.getCart(cartId);
      if (!cart) {
        return null;
      }

      const now = new Date();
      
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        i => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        cart.items[existingItemIndex].quantity += item.quantity;
        cart.items[existingItemIndex].totalPrice = 
          cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
        cart.items[existingItemIndex].updatedAt = now;
      } else {
        // Add new item
        cart.items.push({
          ...item,
          totalPrice: item.quantity * item.unitPrice,
          addedAt: now,
          updatedAt: now
        });
      }

      // Recalculate totals
      await this.recalculateTotals(cart);
      await this.updateCart(cart);

      return cart;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return null;
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(cartId: string, productId: string, quantity: number, variantId?: string): Promise<CartSession | null> {
    try {
      const cart = await this.getCart(cartId);
      if (!cart) {
        return null;
      }

      const itemIndex = cart.items.findIndex(
        i => i.productId === productId && i.variantId === variantId
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item
          cart.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          cart.items[itemIndex].quantity = quantity;
          cart.items[itemIndex].totalPrice = quantity * cart.items[itemIndex].unitPrice;
          cart.items[itemIndex].updatedAt = new Date();
        }

        await this.recalculateTotals(cart);
        await this.updateCart(cart);
      }

      return cart;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return null;
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, productId: string, variantId?: string): Promise<CartSession | null> {
    return this.updateItemQuantity(cartId, productId, 0, variantId);
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<void> {
    try {
      const cart = await this.getCart(cartId);
      if (cart) {
        cart.items = [];
        await this.recalculateTotals(cart);
        await this.updateCart(cart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  /**
   * Convert guest cart to user cart
   */
  async convertGuestToUserCart(guestId: string, userId: string): Promise<CartSession | null> {
    try {
      const guestCart = await this.getCartByGuestId(guestId);
      if (!guestCart) {
        return null;
      }

      // Check if user already has a cart
      const existingUserCart = await this.getCartByUserId(userId);
      
      if (existingUserCart) {
        // Merge carts
        for (const item of guestCart.items) {
          await this.addItem(existingUserCart.cartId, item);
        }
        
        // Clean up guest cart
        await this.deleteCart(guestCart.cartId);
        await this.redis.del(`${this.CART_PREFIX}guest:${guestId}`);
        
        return existingUserCart;
      } else {
        // Convert guest cart to user cart
        guestCart.userId = userId;
        guestCart.guestId = undefined;
        guestCart.timestamps.expiresAt = new Date(Date.now() + this.USER_TTL * 1000);
        
        await this.updateCart(guestCart);
        
        // Update mappings
        await this.redis.setex(`${this.CART_PREFIX}user:${userId}`, this.USER_TTL, guestCart.cartId);
        await this.redis.del(`${this.CART_PREFIX}guest:${guestId}`);
        
        return guestCart;
      }
    } catch (error) {
      console.error('Error converting guest cart:', error);
      return null;
    }
  }

  /**
   * Sync cart across devices for a user
   */
  async syncCartAcrossDevices(userId: string, deviceInfo: DeviceInfo): Promise<CartSession | null> {
    try {
      const cart = await this.getCartByUserId(userId);
      if (cart) {
        cart.deviceInfo = deviceInfo;
        cart.timestamps.lastActivityAt = new Date();
        await this.updateCart(cart);
      }
      return cart;
    } catch (error) {
      console.error('Error syncing cart across devices:', error);
      return null;
    }
  }

  /**
   * Get abandoned carts (for recovery campaigns)
   */
  async getAbandonedCarts(hours = 2): Promise<CartSession[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const keys = await this.redis.keys(`${this.CART_PREFIX}*`);
      const abandonedCarts: CartSession[] = [];

      for (const key of keys) {
        if (key.includes(':user:') || key.includes(':guest:')) continue;
        
        const cartData = await this.redis.get(key);
        if (cartData) {
          const cart = JSON.parse(cartData) as CartSession;
          if (cart.items.length > 0 && 
              new Date(cart.timestamps.lastActivityAt) < cutoffTime) {
            abandonedCarts.push(cart);
          }
        }
      }

      return abandonedCarts;
    } catch (error) {
      console.error('Error getting abandoned carts:', error);
      return [];
    }
  }

  /**
   * Delete cart
   */
  async deleteCart(cartId: string): Promise<void> {
    try {
      const key = this.getCartKey(cartId);
      await this.redis.del(key);
    } catch (error) {
      console.error('Error deleting cart:', error);
    }
  }

  /**
   * Extend cart session
   */
  async extendSession(cartId: string, hours = 24): Promise<void> {
    try {
      const key = this.getCartKey(cartId);
      await this.redis.expire(key, hours * 60 * 60);
    } catch (error) {
      console.error('Error extending cart session:', error);
    }
  }

  /**
   * Get cart statistics
   */
  async getCartStatistics(): Promise<any> {
    try {
      const keys = await this.redis.keys(`${this.CART_PREFIX}*`);
      const userCarts = keys.filter(k => !k.includes(':user:') && !k.includes(':guest:')).length;
      
      return {
        totalActiveCarts: userCarts,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting cart statistics:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private getCartKey(cartId: string): string {
    return `${this.CART_PREFIX}${cartId}`;
  }

  private async recalculateTotals(cart: CartSession): Promise<void> {
    cart.totals.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Bangladesh VAT calculation (15%)
    cart.totals.taxes = cart.totals.subtotal * 0.15;
    
    // Simple shipping calculation (can be enhanced)
    cart.totals.shipping = cart.totals.subtotal > 1000 ? 0 : 60; // Free shipping over 1000 BDT
    
    cart.totals.total = cart.totals.subtotal + cart.totals.taxes + cart.totals.shipping - cart.totals.discounts;
    cart.totals.calculatedAt = new Date();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; latency?: string; error?: string; fallback?: boolean }> {
    try {
      if (this.isRedisAvailable) {
        const start = Date.now();
        await this.redis.ping();
        const latency = Date.now() - start;
        
        return {
          status: 'connected',
          latency: `${latency}ms`
        };
      } else {
        return {
          status: 'fallback',
          fallback: true,
          error: 'Redis not available, using memory store'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        fallback: true,
        error: (error as Error).message
      };
    }
  }
}

export const cartRedisService = new CartRedisService();