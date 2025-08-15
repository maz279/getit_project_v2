/**
 * Product WebSocket Handler - Real-time Product Events
 * Amazon.com/Shopee.sg-Level product real-time updates
 */

import { Socket } from 'socket.io';
import { createClient } from 'redis';

export interface ProductEvent {
  type: 'price_change' | 'stock_update' | 'new_product' | 'product_removed' | 'promotion_start' | 'promotion_end';
  productId: string;
  vendorId: string;
  data: any;
  timestamp: Date;
}

export class ProductEventHandler {
  private redis = createClient();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Product handler');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Product handler:', error.message);
    }
  }

  public async handleProductPriceChange(socket: Socket, data: any) {
    try {
      const { productId, oldPrice, newPrice, vendorId } = data;
      
      // Calculate discount percentage
      const discountPercentage = ((oldPrice - newPrice) / oldPrice) * 100;
      
      const event: ProductEvent = {
        type: 'price_change',
        productId,
        vendorId,
        data: {
          oldPrice,
          newPrice,
          discountPercentage,
          currency: 'BDT',
          effective_immediately: true,
          message_bn: discountPercentage > 0 ? `দাম কমেছে ${discountPercentage.toFixed(1)}%!` : 'দাম বেড়েছে',
          message_en: discountPercentage > 0 ? `Price dropped ${discountPercentage.toFixed(1)}%!` : 'Price increased'
        },
        timestamp: new Date()
      };

      // Broadcast to product watchers
      socket.broadcast.to(`product:${productId}`).emit('product_price_changed', event);
      
      // Special broadcast for significant price drops (>10%)
      if (discountPercentage > 10) {
        socket.broadcast.to('price_alert_subscribers').emit('significant_price_drop', {
          ...event,
          urgency: 'high',
          deal_quality: discountPercentage > 30 ? 'excellent' : 'good'
        });
      }

      // Store event for analytics
      await this.storeProductEvent(event);
      
      console.log(`💰 Product price changed: ${productId} by ${discountPercentage.toFixed(1)}%`);
    } catch (error) {
      console.error('❌ Error handling product price change:', error);
    }
  }

  public async handleStockUpdate(socket: Socket, data: any) {
    try {
      const { productId, oldStock, newStock, vendorId, lowStockThreshold = 5 } = data;
      
      const event: ProductEvent = {
        type: 'stock_update',
        productId,
        vendorId,
        data: {
          oldStock,
          newStock,
          stockChange: newStock - oldStock,
          lowStockAlert: newStock <= lowStockThreshold,
          outOfStock: newStock === 0,
          backInStock: oldStock === 0 && newStock > 0,
          message_bn: newStock === 0 ? 'স্টক শেষ' : newStock <= lowStockThreshold ? 'স্টক কম' : 'স্টক আছে',
          message_en: newStock === 0 ? 'Out of stock' : newStock <= lowStockThreshold ? 'Low stock' : 'In stock'
        },
        timestamp: new Date()
      };

      // Broadcast to product watchers
      socket.broadcast.to(`product:${productId}`).emit('product_stock_updated', event);
      
      // Alert vendor for low stock
      if (newStock <= lowStockThreshold && newStock > 0) {
        socket.broadcast.to(`vendor:${vendorId}`).emit('low_stock_alert', {
          productId,
          currentStock: newStock,
          threshold: lowStockThreshold,
          urgency: newStock <= 2 ? 'critical' : 'high'
        });
      }
      
      // Notify wishlist users when back in stock
      if (oldStock === 0 && newStock > 0) {
        const wishlistUsers = await this.getProductWishlistUsers(productId);
        for (const userId of wishlistUsers) {
          socket.broadcast.to(`user:${userId}`).emit('wishlist_product_available', {
            productId,
            stock: newStock,
            message_bn: 'আপনার পছন্দের পণ্য আবার স্টকে এসেছে!',
            message_en: 'Your wishlist item is back in stock!'
          });
        }
      }

      await this.storeProductEvent(event);
      console.log(`📦 Product stock updated: ${productId} (${oldStock} → ${newStock})`);
    } catch (error) {
      console.error('❌ Error handling stock update:', error);
    }
  }

  public async handleNewProduct(socket: Socket, data: any) {
    try {
      const { productId, vendorId, category, featured, price, title } = data;
      
      const event: ProductEvent = {
        type: 'new_product',
        productId,
        vendorId,
        data: {
          category,
          featured,
          price,
          title,
          title_bn: data.title_bn,
          launch_offer: data.launch_offer,
          message_bn: 'নতুন পণ্য এসেছে!',
          message_en: 'New product available!'
        },
        timestamp: new Date()
      };

      // Broadcast to category followers
      socket.broadcast.to(`category:${category}`).emit('new_product_added', event);
      
      // Broadcast to vendor followers
      socket.broadcast.to(`vendor:${vendorId}`).emit('vendor_new_product', event);
      
      // Special broadcast if featured
      if (featured) {
        socket.broadcast.to('featured_products_subscribers').emit('new_featured_product', {
          ...event,
          priority: 'high'
        });
      }

      await this.storeProductEvent(event);
      console.log(`🆕 New product added: ${productId} in ${category}`);
    } catch (error) {
      console.error('❌ Error handling new product:', error);
    }
  }

  public async handlePromotionStart(socket: Socket, data: any) {
    try {
      const { productId, vendorId, promotionType, discountPercentage, startTime, endTime } = data;
      
      const event: ProductEvent = {
        type: 'promotion_start',
        productId,
        vendorId,
        data: {
          promotionType, // flash_sale, limited_time, bulk_discount
          discountPercentage,
          startTime,
          endTime,
          duration: Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000),
          urgency: promotionType === 'flash_sale' ? 'critical' : 'high',
          message_bn: `বিশেষ ছাড় ${discountPercentage}%! সীমিত সময়ের জন্য`,
          message_en: `Special discount ${discountPercentage}%! Limited time offer`
        },
        timestamp: new Date()
      };

      // Broadcast to product watchers
      socket.broadcast.to(`product:${productId}`).emit('promotion_started', event);
      
      // Broadcast to promotion subscribers
      socket.broadcast.to('promotion_alerts').emit('new_promotion', {
        ...event,
        countdown: Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)
      });

      // Flash sale special handling
      if (promotionType === 'flash_sale') {
        socket.broadcast.emit('flash_sale_alert', {
          ...event,
          flashSale: true,
          limitedQuantity: true
        });
      }

      await this.storeProductEvent(event);
      console.log(`🎉 Promotion started: ${productId} (${discountPercentage}% off)`);
    } catch (error) {
      console.error('❌ Error handling promotion start:', error);
    }
  }

  public async handleProductRemoved(socket: Socket, data: any) {
    try {
      const { productId, vendorId, reason } = data;
      
      const event: ProductEvent = {
        type: 'product_removed',
        productId,
        vendorId,
        data: {
          reason, // discontinued, out_of_stock, policy_violation
          removedAt: new Date(),
          message_bn: 'পণ্যটি আর পাওয়া যাচ্ছে না',
          message_en: 'Product no longer available'
        },
        timestamp: new Date()
      };

      // Notify users watching this product
      socket.broadcast.to(`product:${productId}`).emit('product_removed', event);
      
      // Notify users with this item in cart
      const cartUsers = await this.getProductCartUsers(productId);
      for (const userId of cartUsers) {
        socket.broadcast.to(`user:${userId}`).emit('cart_product_unavailable', {
          productId,
          reason,
          message_bn: 'আপনার কার্টের একটি পণ্য আর পাওয়া যাচ্ছে না',
          message_en: 'A product in your cart is no longer available'
        });
      }

      await this.storeProductEvent(event);
      console.log(`🗑️ Product removed: ${productId} (${reason})`);
    } catch (error) {
      console.error('❌ Error handling product removal:', error);
    }
  }

  // Bangladesh-specific product events

  public async handleBangladeshFestivalOffer(socket: Socket, data: any) {
    try {
      const { productIds, festival, discountPercentage, festivalMessage } = data;
      
      for (const productId of productIds) {
        socket.broadcast.to(`product:${productId}`).emit('bangladesh_festival_offer', {
          productId,
          festival, // eid, pohela_boishakh, victory_day, independence_day
          discountPercentage,
          festivalMessage,
          message_bn: `${festival} উপলক্ষে বিশেষ ছাড় ${discountPercentage}%!`,
          message_en: `Special ${festival} discount ${discountPercentage}%!`,
          culturalContext: true,
          validUntil: data.validUntil
        });
      }

      console.log(`🎊 Bangladesh festival offer: ${festival} (${discountPercentage}% off ${productIds.length} products)`);
    } catch (error) {
      console.error('❌ Error handling Bangladesh festival offer:', error);
    }
  }

  public async handleLocalVendorPromotion(socket: Socket, data: any) {
    try {
      const { vendorId, location, promotionType, products } = data;
      
      socket.broadcast.to(`location:${location}`).emit('local_vendor_promotion', {
        vendorId,
        location,
        promotionType,
        products,
        localDelivery: true,
        fastDelivery: data.fastDelivery || false,
        message_bn: 'আপনার এলাকার দোকানের বিশেষ অফার!',
        message_en: 'Special offer from local vendor!',
        deliveryTime: data.deliveryTime || '2-4 hours'
      });

      console.log(`🏪 Local vendor promotion: ${vendorId} in ${location}`);
    } catch (error) {
      console.error('❌ Error handling local vendor promotion:', error);
    }
  }

  // Helper methods

  private async storeProductEvent(event: ProductEvent) {
    try {
      await this.redis.lPush(`product_events:${event.productId}`, JSON.stringify(event));
      await this.redis.lTrim(`product_events:${event.productId}`, 0, 99); // Keep last 100 events
      
      // Store in global product events for analytics
      await this.redis.lPush('global_product_events', JSON.stringify(event));
      await this.redis.lTrim('global_product_events', 0, 999); // Keep last 1000 events
      
      // Update product event counters
      await this.redis.hIncrBy('product_event_counters', event.type, 1);
    } catch (error) {
      console.warn('⚠️ Failed to store product event:', error.message);
    }
  }

  private async getProductWishlistUsers(productId: string): Promise<string[]> {
    try {
      return await this.redis.sMembers(`wishlist:${productId}`) || [];
    } catch (error) {
      return [];
    }
  }

  private async getProductCartUsers(productId: string): Promise<string[]> {
    try {
      return await this.redis.sMembers(`cart_product:${productId}`) || [];
    } catch (error) {
      return [];
    }
  }

  public async getProductEventHistory(productId: string, limit: number = 20): Promise<ProductEvent[]> {
    try {
      const events = await this.redis.lRange(`product_events:${productId}`, 0, limit - 1);
      return events.map(event => JSON.parse(event));
    } catch (error) {
      return [];
    }
  }

  public async getProductEventStats(): Promise<Record<string, number>> {
    try {
      return await this.redis.hGetAll('product_event_counters') || {};
    } catch (error) {
      return {};
    }
  }

  // Product subscription management

  public async subscribeToProduct(socket: Socket, productId: string, userId?: string) {
    try {
      await socket.join(`product:${productId}`);
      
      if (userId) {
        await this.redis.sAdd(`product_subscribers:${productId}`, userId);
        console.log(`👀 User ${userId} subscribed to product ${productId}`);
      }
    } catch (error) {
      console.error('❌ Error subscribing to product:', error);
    }
  }

  public async unsubscribeFromProduct(socket: Socket, productId: string, userId?: string) {
    try {
      await socket.leave(`product:${productId}`);
      
      if (userId) {
        await this.redis.sRem(`product_subscribers:${productId}`, userId);
        console.log(`👋 User ${userId} unsubscribed from product ${productId}`);
      }
    } catch (error) {
      console.error('❌ Error unsubscribing from product:', error);
    }
  }

  public async getProductSubscribers(productId: string): Promise<string[]> {
    try {
      return await this.redis.sMembers(`product_subscribers:${productId}`) || [];
    } catch (error) {
      return [];
    }
  }
}