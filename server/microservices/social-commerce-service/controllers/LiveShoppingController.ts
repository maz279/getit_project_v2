/**
 * Live Shopping Controller - Amazon Live Shopping Integration
 * Real-time product showcase and instant purchase capabilities
 * 
 * @fileoverview Shopee Live/Amazon Live-level shopping integration during streams
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  liveStreams,
  liveStreamProducts,
  liveStreamPurchases,
  liveStreamAnalytics,
  products,
  orders,
  orderItems,
  users
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte, count, sum, avg, sql } from 'drizzle-orm';
import winston from 'winston';
import { validationResult } from 'express-validator';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'live-shopping-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/live-shopping.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class LiveShoppingController {

  /**
   * Add product to live stream
   * Real-time product showcase integration
   */
  async addProductToStream(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          errors: errors.array(),
          message: 'Validation failed for adding product to stream'
        });
        return;
      }

      const { streamId } = req.params;
      const { 
        productId, 
        hostId,
        displayOrder,
        specialPrice,
        limitedQuantity,
        flashSaleEndTime,
        highlightMessage,
        highlightMessageBn 
      } = req.body;

      // Verify stream ownership and status
      const stream = await db.select().from(liveStreams)
        .where(and(
          eq(liveStreams.id, streamId),
          eq(liveStreams.hostId, hostId),
          eq(liveStreams.status, 'live')
        )).limit(1);

      if (stream.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Live stream not found or unauthorized' 
        });
        return;
      }

      // Verify product exists
      const product = await db.select().from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (product.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
        return;
      }

      // Check if product already exists in stream
      const existingProduct = await db.select().from(liveStreamProducts)
        .where(and(
          eq(liveStreamProducts.streamId, streamId),
          eq(liveStreamProducts.productId, productId)
        )).limit(1);

      if (existingProduct.length > 0) {
        // Update existing product
        await db.update(liveStreamProducts)
          .set({
            isActive: true,
            displayOrder: displayOrder || existingProduct[0].displayOrder,
            specialPrice,
            limitedQuantity,
            flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
            highlightMessage,
            highlightMessageBn,
            updatedAt: new Date()
          })
          .where(eq(liveStreamProducts.id, existingProduct[0].id));

        res.status(200).json({
          success: true,
          message: 'Product updated in live stream',
          data: { productId, streamId, action: 'updated' }
        });
        return;
      }

      // Add new product to stream
      const streamProduct = await db.insert(liveStreamProducts).values({
        streamId,
        productId,
        displayOrder: displayOrder || 1,
        isActive: true,
        specialPrice,
        limitedQuantity,
        flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
        highlightMessage,
        highlightMessageBn,
        clickCount: 0,
        purchaseCount: 0,
        revenue: 0,
        addedAt: new Date(),
        updatedAt: new Date()
      }).returning();

      logger.info(`Product ${productId} added to live stream ${streamId}`);

      res.status(201).json({
        success: true,
        message: 'Product successfully added to live stream',
        data: {
          streamProduct: streamProduct[0],
          product: product[0]
        }
      });

    } catch (error) {
      logger.error('Error adding product to live stream:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error while adding product to stream',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get active products in live stream
   * Real-time product carousel display
   */
  async getStreamProducts(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { language = 'en' } = req.query;

      // Get stream products with details
      const streamProducts = await db.select({
        id: liveStreamProducts.id,
        productId: liveStreamProducts.productId,
        displayOrder: liveStreamProducts.displayOrder,
        specialPrice: liveStreamProducts.specialPrice,
        limitedQuantity: liveStreamProducts.limitedQuantity,
        remainingQuantity: liveStreamProducts.remainingQuantity,
        flashSaleEndTime: liveStreamProducts.flashSaleEndTime,
        highlightMessage: language === 'bn' ? liveStreamProducts.highlightMessageBn : liveStreamProducts.highlightMessage,
        clickCount: liveStreamProducts.clickCount,
        purchaseCount: liveStreamProducts.purchaseCount,
        revenue: liveStreamProducts.revenue,
        productName: language === 'bn' ? products.nameBn : products.name,
        productDescription: language === 'bn' ? products.descriptionBn : products.description,
        productImage: products.imageUrl,
        productImages: products.images,
        originalPrice: products.price,
        salePrice: products.salePrice,
        stockQuantity: products.inventory,
        rating: products.averageRating,
        reviewCount: products.reviewCount,
        category: products.category,
        vendorId: products.vendorId
      })
      .from(liveStreamProducts)
      .leftJoin(products, eq(liveStreamProducts.productId, products.id))
      .where(and(
        eq(liveStreamProducts.streamId, streamId),
        eq(liveStreamProducts.isActive, true)
      ))
      .orderBy(liveStreamProducts.displayOrder);

      // Calculate discounts and special offers
      const enhancedProducts = streamProducts.map(product => {
        const currentPrice = product.specialPrice || product.salePrice || product.originalPrice;
        const originalPrice = product.originalPrice;
        const discountPercentage = originalPrice > currentPrice ? 
          Math.round((originalPrice - currentPrice) / originalPrice * 100) : 0;
        
        const isFlashSale = product.flashSaleEndTime && new Date(product.flashSaleEndTime) > new Date();
        const isLimitedStock = product.limitedQuantity && product.remainingQuantity <= product.limitedQuantity * 0.2;
        
        return {
          ...product,
          currentPrice,
          discountPercentage,
          isFlashSale,
          isLimitedStock,
          flashSaleTimeLeft: isFlashSale ? 
            Math.max(0, new Date(product.flashSaleEndTime).getTime() - Date.now()) : null,
          urgencyLevel: isLimitedStock ? 'high' : isFlashSale ? 'medium' : 'low'
        };
      });

      res.status(200).json({
        success: true,
        data: {
          streamId,
          products: enhancedProducts,
          totalProducts: enhancedProducts.length,
          activeOffers: enhancedProducts.filter(p => p.isFlashSale || p.isLimitedStock).length
        }
      });

    } catch (error) {
      logger.error('Error fetching stream products:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching stream products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Track product click in live stream
   * Amazon Live-style engagement tracking
   */
  async trackProductClick(req: Request, res: Response): Promise<void> {
    try {
      const { streamId, productId } = req.params;
      const { userId, clickSource = 'product_card' } = req.body;

      // Update click count
      await db.update(liveStreamProducts)
        .set({
          clickCount: sql`${liveStreamProducts.clickCount} + 1`,
          updatedAt: new Date()
        })
        .where(and(
          eq(liveStreamProducts.streamId, streamId),
          eq(liveStreamProducts.productId, productId)
        ));

      // Update stream analytics
      await db.update(liveStreamAnalytics)
        .set({
          productClicks: sql`${liveStreamAnalytics.productClicks} + 1`,
          updatedAt: new Date()
        })
        .where(eq(liveStreamAnalytics.streamId, streamId));

      logger.info(`Product click tracked: ${productId} in stream ${streamId} by user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Product click tracked successfully',
        data: { streamId, productId, clickSource }
      });

    } catch (error) {
      logger.error('Error tracking product click:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error tracking product click',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Instant purchase during live stream
   * Shopee Live-style instant buying
   */
  async purchaseFromStream(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          errors: errors.array(),
          message: 'Validation failed for stream purchase'
        });
        return;
      }

      const { streamId, productId } = req.params;
      const { 
        userId, 
        quantity = 1,
        paymentMethod,
        shippingAddress,
        useSpecialPrice = true 
      } = req.body;

      // Get stream product details
      const streamProduct = await db.select({
        id: liveStreamProducts.id,
        specialPrice: liveStreamProducts.specialPrice,
        limitedQuantity: liveStreamProducts.limitedQuantity,
        remainingQuantity: liveStreamProducts.remainingQuantity,
        productName: products.name,
        salePrice: products.salePrice,
        originalPrice: products.price,
        stockQuantity: products.inventory,
        vendorId: products.vendorId
      })
      .from(liveStreamProducts)
      .leftJoin(products, eq(liveStreamProducts.productId, products.id))
      .where(and(
        eq(liveStreamProducts.streamId, streamId),
        eq(liveStreamProducts.productId, productId),
        eq(liveStreamProducts.isActive, true)
      ))
      .limit(1);

      if (streamProduct.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Product not available in this stream' 
        });
        return;
      }

      const product = streamProduct[0];
      
      // Check stock availability
      if (product.stockQuantity < quantity) {
        res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock for requested quantity' 
        });
        return;
      }

      // Check limited quantity constraints
      if (product.limitedQuantity && product.remainingQuantity < quantity) {
        res.status(400).json({ 
          success: false, 
          message: 'Limited quantity offer exceeded' 
        });
        return;
      }

      // Calculate price
      const unitPrice = useSpecialPrice && product.specialPrice ? 
        product.specialPrice : (product.salePrice || product.originalPrice);
      const totalAmount = unitPrice * quantity;

      // Create order
      const order = await db.insert(orders).values({
        userId,
        vendorId: product.vendorId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: 'pending_payment',
        orderSource: 'live_stream',
        sourceMetadata: {
          streamId,
          productId,
          specialPriceUsed: useSpecialPrice && !!product.specialPrice
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const orderId = order[0].id;

      // Create order item
      await db.insert(orderItems).values({
        orderId,
        productId,
        quantity,
        unitPrice,
        totalPrice: totalAmount,
        createdAt: new Date()
      });

      // Record live stream purchase
      await db.insert(liveStreamPurchases).values({
        streamId,
        productId,
        userId,
        orderId,
        quantity,
        unitPrice,
        totalAmount,
        purchaseSource: 'instant_buy',
        purchasedAt: new Date()
      });

      // Update stream product metrics
      await db.update(liveStreamProducts)
        .set({
          purchaseCount: sql`${liveStreamProducts.purchaseCount} + ${quantity}`,
          revenue: sql`${liveStreamProducts.revenue} + ${totalAmount}`,
          remainingQuantity: sql`GREATEST(0, ${liveStreamProducts.remainingQuantity} - ${quantity})`,
          updatedAt: new Date()
        })
        .where(eq(liveStreamProducts.id, product.id));

      // Update stream analytics
      await db.update(liveStreamAnalytics)
        .set({
          purchases: sql`${liveStreamAnalytics.purchases} + 1`,
          revenue: sql`${liveStreamAnalytics.revenue} + ${totalAmount}`,
          updatedAt: new Date()
        })
        .where(eq(liveStreamAnalytics.streamId, streamId));

      // Update product inventory
      await db.update(products)
        .set({
          inventory: sql`${products.inventory} - ${quantity}`,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      logger.info(`Live stream purchase completed: Order ${orderId} for product ${productId} in stream ${streamId}`);

      res.status(201).json({
        success: true,
        message: 'Purchase completed successfully',
        data: {
          orderId,
          totalAmount,
          streamId,
          productId,
          quantity,
          estimatedDelivery: '3-5 business days',
          specialOfferUsed: useSpecialPrice && !!product.specialPrice
        }
      });

    } catch (error) {
      logger.error('Error processing stream purchase:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error processing purchase',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get live stream shopping analytics
   * Real-time purchase performance metrics
   */
  async getStreamShoppingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { period = '24h' } = req.query;

      // Calculate time range
      const now = new Date();
      let startTime = new Date();
      
      switch (period) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        default:
          startTime.setDate(now.getDate() - 1);
      }

      // Get purchase analytics
      const purchaseStats = await db.select({
        totalPurchases: count(),
        totalRevenue: sum(liveStreamPurchases.totalAmount),
        averageOrderValue: avg(liveStreamPurchases.totalAmount),
        uniqueBuyers: sql`COUNT(DISTINCT ${liveStreamPurchases.userId})`
      })
      .from(liveStreamPurchases)
      .where(and(
        eq(liveStreamPurchases.streamId, streamId),
        gte(liveStreamPurchases.purchasedAt, startTime)
      ));

      // Get top selling products
      const topProducts = await db.select({
        productId: liveStreamPurchases.productId,
        productName: products.name,
        totalQuantity: sum(liveStreamPurchases.quantity),
        totalRevenue: sum(liveStreamPurchases.totalAmount),
        purchaseCount: count()
      })
      .from(liveStreamPurchases)
      .leftJoin(products, eq(liveStreamPurchases.productId, products.id))
      .where(and(
        eq(liveStreamPurchases.streamId, streamId),
        gte(liveStreamPurchases.purchasedAt, startTime)
      ))
      .groupBy(liveStreamPurchases.productId, products.name)
      .orderBy(desc(sum(liveStreamPurchases.totalAmount)))
      .limit(10);

      // Get purchase timeline (hourly breakdown)
      const purchaseTimeline = await db.select({
        hour: sql`EXTRACT(HOUR FROM ${liveStreamPurchases.purchasedAt})`,
        purchases: count(),
        revenue: sum(liveStreamPurchases.totalAmount)
      })
      .from(liveStreamPurchases)
      .where(and(
        eq(liveStreamPurchases.streamId, streamId),
        gte(liveStreamPurchases.purchasedAt, startTime)
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${liveStreamPurchases.purchasedAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${liveStreamPurchases.purchasedAt})`);

      // Get conversion rates
      const streamAnalytics = await db.select({
        totalViews: liveStreamAnalytics.totalViews,
        productClicks: liveStreamAnalytics.productClicks,
        purchases: liveStreamAnalytics.purchases
      })
      .from(liveStreamAnalytics)
      .where(eq(liveStreamAnalytics.streamId, streamId))
      .limit(1);

      const analytics = streamAnalytics[0];
      const conversionRate = analytics?.totalViews > 0 ? 
        (analytics.purchases / analytics.totalViews * 100).toFixed(2) : 0;
      const clickToConversion = analytics?.productClicks > 0 ? 
        (analytics.purchases / analytics.productClicks * 100).toFixed(2) : 0;

      res.status(200).json({
        success: true,
        data: {
          period,
          overview: {
            ...purchaseStats[0],
            conversionRate: `${conversionRate}%`,
            clickToConversion: `${clickToConversion}%`
          },
          topProducts,
          timeline: purchaseTimeline,
          performance: {
            totalViews: analytics?.totalViews || 0,
            productClicks: analytics?.productClicks || 0,
            purchases: analytics?.purchases || 0
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching stream shopping analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching shopping analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update product showcase order
   * Real-time product arrangement
   */
  async updateProductOrder(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { hostId, productOrders } = req.body; // [{ productId, displayOrder }]

      // Verify stream ownership
      const stream = await db.select().from(liveStreams)
        .where(and(
          eq(liveStreams.id, streamId),
          eq(liveStreams.hostId, hostId)
        )).limit(1);

      if (stream.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Stream not found or unauthorized' 
        });
        return;
      }

      // Update product orders
      for (const { productId, displayOrder } of productOrders) {
        await db.update(liveStreamProducts)
          .set({
            displayOrder,
            updatedAt: new Date()
          })
          .where(and(
            eq(liveStreamProducts.streamId, streamId),
            eq(liveStreamProducts.productId, productId)
          ));
      }

      logger.info(`Product order updated for stream ${streamId}`);

      res.status(200).json({
        success: true,
        message: 'Product showcase order updated successfully',
        data: { streamId, updatedProducts: productOrders.length }
      });

    } catch (error) {
      logger.error('Error updating product order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating product order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}