/**
 * Cart Analytics Controller - Cart Analytics and Business Intelligence
 * Amazon.com/Shopee.sg-level cart analytics with Bangladesh market insights
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts,
  cartItems,
  cartAnalytics,
  abandonedCarts,
  cartRecoveryCampaigns,
  users,
  products,
  vendors
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte, count, sum, avg, max, min } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class CartAnalyticsController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get cart analytics overview
   */
  async getCartOverview(req: Request, res: Response): Promise<void> {
    try {
      const { 
        period = '30d',
        timezone = 'Asia/Dhaka' 
      } = req.query;

      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get overall cart metrics
      const overviewMetrics = await db
        .select({
          totalCarts: count(carts.id),
          activeCarts: sum(sql<number>`CASE WHEN ${carts.status} = 'active' THEN 1 ELSE 0 END`),
          completedCarts: sum(sql<number>`CASE WHEN ${carts.status} = 'completed' THEN 1 ELSE 0 END`),
          abandonedCarts: sum(sql<number>`CASE WHEN ${carts.status} = 'abandoned' THEN 1 ELSE 0 END`),
          totalValue: sum(carts.totalAmount),
          averageValue: avg(carts.totalAmount),
          averageItems: avg(carts.totalItems)
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate));

      // Get cart conversion funnel
      const conversionFunnel = await db
        .select({
          stage: sql<string>`
            CASE 
              WHEN ${carts.totalItems} = 0 THEN 'empty'
              WHEN ${carts.totalItems} BETWEEN 1 AND 2 THEN 'browsing'
              WHEN ${carts.totalItems} BETWEEN 3 AND 5 THEN 'engaged'
              WHEN ${carts.totalItems} > 5 THEN 'committed'
            END
          `,
          cartCount: count(carts.id),
          totalValue: sum(carts.totalAmount),
          conversionRate: sql<number>`
            (COUNT(CASE WHEN ${carts.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*))
          `
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`
          CASE 
            WHEN ${carts.totalItems} = 0 THEN 'empty'
            WHEN ${carts.totalItems} BETWEEN 1 AND 2 THEN 'browsing'
            WHEN ${carts.totalItems} BETWEEN 3 AND 5 THEN 'engaged'
            WHEN ${carts.totalItems} > 5 THEN 'committed'
          END
        `);

      // Get daily cart trends
      const dailyTrends = await db
        .select({
          date: sql<string>`DATE(${carts.createdAt})`,
          newCarts: count(carts.id),
          totalValue: sum(carts.totalAmount),
          averageValue: avg(carts.totalAmount),
          completions: sum(sql<number>`CASE WHEN ${carts.status} = 'completed' THEN 1 ELSE 0 END`),
          abandonment: sum(sql<number>`CASE WHEN ${carts.status} = 'abandoned' THEN 1 ELSE 0 END`)
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`DATE(${carts.createdAt})`)
        .orderBy(sql`DATE(${carts.createdAt})`);

      // Get top product categories in carts
      const topCategories = await db
        .select({
          categoryId: products.categoryId,
          categoryName: products.categoryName,
          itemsInCarts: sum(cartItems.quantity),
          totalValue: sum(cartItems.totalPrice),
          uniqueCarts: sql<number>`COUNT(DISTINCT ${cartItems.cartId})`
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .leftJoin(carts, eq(cartItems.cartId, carts.id))
        .where(gte(carts.createdAt, startDate))
        .groupBy(products.categoryId, products.categoryName)
        .orderBy(desc(sql`SUM(${cartItems.totalPrice})`))
        .limit(10);

      this.loggingService.logInfo('Cart overview analytics retrieved', {
        period: days,
        totalCarts: overviewMetrics[0]?.totalCarts || 0
      });

      res.json({
        success: true,
        data: {
          overview: overviewMetrics[0] || {},
          conversionFunnel,
          dailyTrends,
          topCategories,
          period: {
            days,
            startDate,
            endDate: new Date()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cart overview', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cart performance metrics
   */
  async getCartPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { 
        period = '30d',
        groupBy = 'day',
        vendorId,
        categoryId 
      } = req.query;

      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let whereConditions = [gte(carts.createdAt, startDate)];
      
      if (vendorId) {
        whereConditions.push(eq(products.vendorId, vendorId as string));
      }
      
      if (categoryId) {
        whereConditions.push(eq(products.categoryId, categoryId as string));
      }

      // Get performance metrics
      const performanceMetrics = await db
        .select({
          averageCartValue: avg(carts.totalAmount),
          averageItemsPerCart: avg(carts.totalItems),
          cartConversionRate: sql<number>`
            (COUNT(CASE WHEN ${carts.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*))
          `,
          cartAbandonmentRate: sql<number>`
            (COUNT(CASE WHEN ${carts.status} = 'abandoned' THEN 1 END) * 100.0 / COUNT(*))
          `,
          revenuePerVisitor: sql<number>`
            SUM(CASE WHEN ${carts.status} = 'completed' THEN ${carts.totalAmount} ELSE 0 END) / COUNT(DISTINCT ${carts.userId})
          `,
          averageTimeToCheckout: sql<number>`
            AVG(EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) / 3600)
          `
        })
        .from(carts)
        .leftJoin(cartItems, eq(carts.id, cartItems.cartId))
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(and(...whereConditions));

      // Get cart value distribution
      const valueDistribution = await db
        .select({
          valueRange: sql<string>`
            CASE 
              WHEN ${carts.totalAmount} < 500 THEN '< ৳500'
              WHEN ${carts.totalAmount} BETWEEN 500 AND 1499 THEN '৳500-1499'
              WHEN ${carts.totalAmount} BETWEEN 1500 AND 4999 THEN '৳1500-4999'
              WHEN ${carts.totalAmount} BETWEEN 5000 AND 9999 THEN '৳5000-9999'
              ELSE '৳10000+'
            END
          `,
          cartCount: count(carts.id),
          percentage: sql<number>`
            COUNT(*) * 100.0 / (SELECT COUNT(*) FROM carts WHERE created_at >= ${startDate})
          `,
          totalValue: sum(carts.totalAmount)
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`
          CASE 
            WHEN ${carts.totalAmount} < 500 THEN '< ৳500'
            WHEN ${carts.totalAmount} BETWEEN 500 AND 1499 THEN '৳500-1499'
            WHEN ${carts.totalAmount} BETWEEN 1500 AND 4999 THEN '৳1500-4999'
            WHEN ${carts.totalAmount} BETWEEN 5000 AND 9999 THEN '৳5000-9999'
            ELSE '৳10000+'
          END
        `)
        .orderBy(sql`MIN(${carts.totalAmount})`);

      // Get device and session analysis
      const deviceAnalysis = await db
        .select({
          deviceType: sql<string>`
            CASE 
              WHEN ${carts.sessionId} LIKE 'mobile%' THEN 'mobile'
              WHEN ${carts.sessionId} LIKE 'tablet%' THEN 'tablet'
              ELSE 'desktop'
            END
          `,
          cartCount: count(carts.id),
          averageValue: avg(carts.totalAmount),
          conversionRate: sql<number>`
            (COUNT(CASE WHEN ${carts.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*))
          `
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`
          CASE 
            WHEN ${carts.sessionId} LIKE 'mobile%' THEN 'mobile'
            WHEN ${carts.sessionId} LIKE 'tablet%' THEN 'tablet'
            ELSE 'desktop'
          END
        `);

      res.json({
        success: true,
        data: {
          performance: performanceMetrics[0] || {},
          valueDistribution,
          deviceAnalysis,
          filters: {
            period: days,
            vendorId,
            categoryId
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cart performance', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get abandonment analysis
   */
  async getAbandonmentAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get abandonment patterns
      const abandonmentPatterns = await db
        .select({
          abandonmentStage: sql<string>`
            CASE 
              WHEN ${carts.totalItems} = 0 THEN 'empty_cart'
              WHEN ${carts.totalItems} = 1 THEN 'single_item'
              WHEN ${carts.totalItems} BETWEEN 2 AND 3 THEN 'few_items'
              WHEN ${carts.totalItems} > 3 THEN 'multiple_items'
            END
          `,
          abandonedCount: count(carts.id),
          totalValue: sum(carts.totalAmount),
          averageValue: avg(carts.totalAmount),
          recoveryPotential: sql<number>`
            SUM(CASE WHEN ${carts.totalAmount} > 1000 THEN ${carts.totalAmount} ELSE 0 END)
          `
        })
        .from(carts)
        .where(and(
          eq(carts.status, 'abandoned'),
          gte(carts.createdAt, startDate)
        ))
        .groupBy(sql`
          CASE 
            WHEN ${carts.totalItems} = 0 THEN 'empty_cart'
            WHEN ${carts.totalItems} = 1 THEN 'single_item'
            WHEN ${carts.totalItems} BETWEEN 2 AND 3 THEN 'few_items'
            WHEN ${carts.totalItems} > 3 THEN 'multiple_items'
          END
        `);

      // Get abandonment reasons (simplified analysis)
      const abandonmentReasons = await db
        .select({
          reason: sql<string>`
            CASE 
              WHEN ${carts.totalAmount} > 5000 THEN 'high_value'
              WHEN ${carts.shippingAmount} > 200 THEN 'shipping_cost'
              WHEN ${carts.totalItems} = 1 THEN 'single_item_hesitation'
              WHEN EXTRACT(HOUR FROM ${carts.updatedAt}) BETWEEN 2 AND 5 THEN 'late_night_browsing'
              ELSE 'general_abandonment'
            END
          `,
          count: count(carts.id),
          averageValue: avg(carts.totalAmount),
          recoveryRate: sql<number>`
            (SELECT COUNT(*) FROM cart_recovery_campaigns crc 
             WHERE crc.cart_id = ${carts.id} AND crc.status = 'restored') * 100.0 / COUNT(*)
          `
        })
        .from(carts)
        .where(and(
          eq(carts.status, 'abandoned'),
          gte(carts.createdAt, startDate)
        ))
        .groupBy(sql`
          CASE 
            WHEN ${carts.totalAmount} > 5000 THEN 'high_value'
            WHEN ${carts.shippingAmount} > 200 THEN 'shipping_cost'
            WHEN ${carts.totalItems} = 1 THEN 'single_item_hesitation'
            WHEN EXTRACT(HOUR FROM ${carts.updatedAt}) BETWEEN 2 AND 5 THEN 'late_night_browsing'
            ELSE 'general_abandonment'
          END
        `);

      // Get time-to-abandonment analysis
      const timeToAbandonment = await db
        .select({
          timeRange: sql<string>`
            CASE 
              WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 300 THEN '< 5 minutes'
              WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 1800 THEN '5-30 minutes'
              WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 3600 THEN '30-60 minutes'
              WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 86400 THEN '1-24 hours'
              ELSE '> 24 hours'
            END
          `,
          count: count(carts.id),
          averageValue: avg(carts.totalAmount)
        })
        .from(carts)
        .where(and(
          eq(carts.status, 'abandoned'),
          gte(carts.createdAt, startDate)
        ))
        .groupBy(sql`
          CASE 
            WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 300 THEN '< 5 minutes'
            WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 1800 THEN '5-30 minutes'
            WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 3600 THEN '30-60 minutes'
            WHEN EXTRACT(EPOCH FROM (${carts.updatedAt} - ${carts.createdAt})) < 86400 THEN '1-24 hours'
            ELSE '> 24 hours'
          END
        `);

      // Get recovery campaign effectiveness
      const recoveryEffectiveness = await db
        .select({
          totalCampaigns: count(cartRecoveryCampaigns.id),
          emailsSent: sum(sql<number>`CASE WHEN ${cartRecoveryCampaigns.status} != 'draft' THEN 1 ELSE 0 END`),
          emailsOpened: sum(sql<number>`CASE WHEN ${cartRecoveryCampaigns.clickedAt} IS NOT NULL THEN 1 ELSE 0 END`),
          cartsRestored: sum(sql<number>`CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL THEN 1 ELSE 0 END`),
          totalRecoveredValue: sum(sql<number>`
            CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL 
            THEN (SELECT total_amount FROM carts WHERE id = ${cartRecoveryCampaigns.cartId})
            ELSE 0 END
          `)
        })
        .from(cartRecoveryCampaigns)
        .where(gte(cartRecoveryCampaigns.createdAt, startDate));

      res.json({
        success: true,
        data: {
          abandonmentPatterns,
          abandonmentReasons,
          timeToAbandonment,
          recoveryEffectiveness: recoveryEffectiveness[0] || {},
          period: {
            days,
            startDate,
            endDate: new Date()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get abandonment analysis', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve abandonment analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get conversion funnel analysis
   */
  async getConversionFunnel(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get funnel stages
      const funnelStages = await db
        .select({
          stage: sql<string>`'cart_created'`,
          count: count(carts.id),
          value: sum(carts.totalAmount)
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .union(
          db.select({
            stage: sql<string>`'items_added'`,
            count: count(carts.id),
            value: sum(carts.totalAmount)
          })
          .from(carts)
          .where(and(
            gte(carts.createdAt, startDate),
            sql`${carts.totalItems} > 0`
          ))
        )
        .union(
          db.select({
            stage: sql<string>`'multiple_items'`,
            count: count(carts.id),
            value: sum(carts.totalAmount)
          })
          .from(carts)
          .where(and(
            gte(carts.createdAt, startDate),
            sql`${carts.totalItems} > 1`
          ))
        )
        .union(
          db.select({
            stage: sql<string>`'checkout_started'`,
            count: count(carts.id),
            value: sum(carts.totalAmount)
          })
          .from(carts)
          .where(and(
            gte(carts.createdAt, startDate),
            sql`${carts.shippingAddress} IS NOT NULL`
          ))
        )
        .union(
          db.select({
            stage: sql<string>`'payment_initiated'`,
            count: count(carts.id),
            value: sum(carts.totalAmount)
          })
          .from(carts)
          .where(and(
            gte(carts.createdAt, startDate),
            sql`${carts.paymentMethod} IS NOT NULL`
          ))
        )
        .union(
          db.select({
            stage: sql<string>`'order_completed'`,
            count: count(carts.id),
            value: sum(carts.totalAmount)
          })
          .from(carts)
          .where(and(
            gte(carts.createdAt, startDate),
            eq(carts.status, 'completed')
          ))
        );

      // Sort funnel stages in logical order
      const orderedStages = [
        'cart_created',
        'items_added',
        'multiple_items',
        'checkout_started',
        'payment_initiated',
        'order_completed'
      ];

      const sortedFunnel = orderedStages.map(stageName => {
        const stage = funnelStages.find(s => s.stage === stageName);
        return stage || { stage: stageName, count: 0, value: 0 };
      });

      // Calculate conversion rates between stages
      const conversionRates = [];
      for (let i = 1; i < sortedFunnel.length; i++) {
        const current = sortedFunnel[i];
        const previous = sortedFunnel[i - 1];
        
        const rate = previous.count > 0 ? (current.count / previous.count) * 100 : 0;
        conversionRates.push({
          from: previous.stage,
          to: current.stage,
          rate: Math.round(rate * 100) / 100,
          dropoff: Math.round((100 - rate) * 100) / 100
        });
      }

      // Get funnel performance by hour
      const hourlyFunnel = await db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${carts.createdAt})`,
          cartsCreated: count(carts.id),
          cartsCompleted: sum(sql<number>`CASE WHEN ${carts.status} = 'completed' THEN 1 ELSE 0 END`),
          conversionRate: sql<number>`
            SUM(CASE WHEN ${carts.status} = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
          `
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`EXTRACT(HOUR FROM ${carts.createdAt})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${carts.createdAt})`);

      res.json({
        success: true,
        data: {
          funnelStages: sortedFunnel,
          conversionRates,
          hourlyFunnel,
          summary: {
            totalCarts: sortedFunnel[0]?.count || 0,
            completedCarts: sortedFunnel[sortedFunnel.length - 1]?.count || 0,
            overallConversionRate: sortedFunnel[0]?.count > 0 ? 
              ((sortedFunnel[sortedFunnel.length - 1]?.count || 0) / sortedFunnel[0].count) * 100 : 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get conversion funnel', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve conversion funnel',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user behavior analysis
   */
  async getUserBehavior(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get user segmentation
      const userSegmentation = await db
        .select({
          segment: sql<string>`
            CASE 
              WHEN COUNT(${carts.id}) = 1 THEN 'new_customer'
              WHEN COUNT(${carts.id}) BETWEEN 2 AND 5 THEN 'returning_customer'
              WHEN COUNT(${carts.id}) > 5 THEN 'loyal_customer'
            END
          `,
          userCount: sql<number>`COUNT(DISTINCT ${carts.userId})`,
          averageCartValue: avg(carts.totalAmount),
          totalCarts: count(carts.id),
          conversionRate: sql<number>`
            SUM(CASE WHEN ${carts.status} = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
          `
        })
        .from(carts)
        .where(and(
          gte(carts.createdAt, startDate),
          sql`${carts.userId} IS NOT NULL`
        ))
        .groupBy(carts.userId)
        .having(sql`COUNT(${carts.id}) > 0`);

      // Get shopping patterns
      const shoppingPatterns = await db
        .select({
          dayOfWeek: sql<string>`TO_CHAR(${carts.createdAt}, 'Day')`,
          hourOfDay: sql<number>`EXTRACT(HOUR FROM ${carts.createdAt})`,
          cartCount: count(carts.id),
          averageValue: avg(carts.totalAmount),
          conversionRate: sql<number>`
            SUM(CASE WHEN ${carts.status} = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
          `
        })
        .from(carts)
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`TO_CHAR(${carts.createdAt}, 'Day')`, sql`EXTRACT(HOUR FROM ${carts.createdAt})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${carts.createdAt})`);

      // Get product affinity analysis
      const productAffinity = await db
        .select({
          product1: sql<string>`p1.name`,
          product2: sql<string>`p2.name`,
          coOccurrence: count(sql`*`),
          totalValue: sum(sql<number>`${cartItems.totalPrice} + ci2.total_price`)
        })
        .from(cartItems)
        .innerJoin(sql`cart_items ci2`, sql`${cartItems.cartId} = ci2.cart_id AND ${cartItems.productId} != ci2.product_id`)
        .leftJoin(sql`products p1`, sql`${cartItems.productId} = p1.id`)
        .leftJoin(sql`products p2`, sql`ci2.product_id = p2.id`)
        .leftJoin(carts, eq(cartItems.cartId, carts.id))
        .where(gte(carts.createdAt, startDate))
        .groupBy(sql`p1.name`, sql`p2.name`)
        .orderBy(desc(count(sql`*`)))
        .limit(20);

      res.json({
        success: true,
        data: {
          userSegmentation,
          shoppingPatterns,
          productAffinity,
          period: {
            days,
            startDate,
            endDate: new Date()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get user behavior', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user behavior analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get admin abandoned analytics
   */
  async getAdminAbandonedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get high-value abandoned carts
      const highValueAbandoned = await db
        .select({
          cartId: carts.id,
          userId: carts.userId,
          userEmail: users.email,
          totalAmount: carts.totalAmount,
          totalItems: carts.totalItems,
          lastActivity: carts.updatedAt,
          daysSinceAbandoned: sql<number>`
            EXTRACT(DAY FROM (NOW() - ${carts.updatedAt}))
          `,
          recoveryPotential: sql<string>`
            CASE 
              WHEN ${carts.totalAmount} > 10000 THEN 'very_high'
              WHEN ${carts.totalAmount} > 5000 THEN 'high'
              WHEN ${carts.totalAmount} > 2000 THEN 'medium'
              ELSE 'low'
            END
          `
        })
        .from(carts)
        .leftJoin(users, eq(carts.userId, users.id))
        .where(and(
          eq(carts.status, 'abandoned'),
          gte(carts.createdAt, startDate),
          sql`${carts.totalAmount} > 1000`
        ))
        .orderBy(desc(carts.totalAmount))
        .limit(50);

      // Get abandonment trend by value ranges
      const abandonmentTrends = await db
        .select({
          week: sql<string>`TO_CHAR(${carts.createdAt}, 'YYYY-WW')`,
          lowValue: sum(sql<number>`CASE WHEN ${carts.totalAmount} < 1000 THEN 1 ELSE 0 END`),
          mediumValue: sum(sql<number>`CASE WHEN ${carts.totalAmount} BETWEEN 1000 AND 5000 THEN 1 ELSE 0 END`),
          highValue: sum(sql<number>`CASE WHEN ${carts.totalAmount} > 5000 THEN 1 ELSE 0 END`),
          totalAbandoned: count(carts.id),
          totalValue: sum(carts.totalAmount)
        })
        .from(carts)
        .where(and(
          eq(carts.status, 'abandoned'),
          gte(carts.createdAt, startDate)
        ))
        .groupBy(sql`TO_CHAR(${carts.createdAt}, 'YYYY-WW')`)
        .orderBy(sql`TO_CHAR(${carts.createdAt}, 'YYYY-WW')`);

      res.json({
        success: true,
        data: {
          highValueAbandoned,
          abandonmentTrends,
          summary: {
            totalHighValueCarts: highValueAbandoned.length,
            totalPotentialRevenue: highValueAbandoned.reduce((sum, cart) => sum + cart.totalAmount, 0)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get admin abandoned analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin abandoned analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get recovery performance analytics
   */
  async getRecoveryPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const days = parseInt(period as string) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get recovery campaign performance
      const recoveryPerformance = await db
        .select({
          emailTemplate: cartRecoveryCampaigns.emailTemplate,
          campaignsSent: count(cartRecoveryCampaigns.id),
          emailsOpened: sum(sql<number>`CASE WHEN ${cartRecoveryCampaigns.clickedAt} IS NOT NULL THEN 1 ELSE 0 END`),
          cartsRestored: sum(sql<number>`CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL THEN 1 ELSE 0 END`),
          totalRecoveredValue: sum(sql<number>`
            CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL 
            THEN (SELECT total_amount FROM carts WHERE id = ${cartRecoveryCampaigns.cartId})
            ELSE 0 END
          `),
          averageTimeToRestore: avg(sql<number>`
            CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (${cartRecoveryCampaigns.restoredAt} - ${cartRecoveryCampaigns.sentAt})) / 3600
            ELSE NULL END
          `)
        })
        .from(cartRecoveryCampaigns)
        .where(gte(cartRecoveryCampaigns.createdAt, startDate))
        .groupBy(cartRecoveryCampaigns.emailTemplate);

      // Get recovery timing analysis
      const timingAnalysis = await db
        .select({
          hoursAfterAbandonment: sql<number>`
            FLOOR(EXTRACT(EPOCH FROM (${cartRecoveryCampaigns.sentAt} - 
              (SELECT updated_at FROM carts WHERE id = ${cartRecoveryCampaigns.cartId}))) / 3600)
          `,
          campaignsSent: count(cartRecoveryCampaigns.id),
          successRate: sql<number>`
            SUM(CASE WHEN ${cartRecoveryCampaigns.restoredAt} IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
          `
        })
        .from(cartRecoveryCampaigns)
        .where(gte(cartRecoveryCampaigns.createdAt, startDate))
        .groupBy(sql`
          FLOOR(EXTRACT(EPOCH FROM (${cartRecoveryCampaigns.sentAt} - 
            (SELECT updated_at FROM carts WHERE id = ${cartRecoveryCampaigns.cartId}))) / 3600)
        `)
        .having(sql`COUNT(*) > 5`)
        .orderBy(sql`
          FLOOR(EXTRACT(EPOCH FROM (${cartRecoveryCampaigns.sentAt} - 
            (SELECT updated_at FROM carts WHERE id = ${cartRecoveryCampaigns.cartId}))) / 3600)
        `);

      res.json({
        success: true,
        data: {
          recoveryPerformance,
          timingAnalysis,
          period: {
            days,
            startDate,
            endDate: new Date()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get recovery performance', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recovery performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}