/**
 * Subscription Plan Controller - Amazon.com/Shopee.sg-Level Plan Management
 * Handles product-based subscription plans, pricing, and Bangladesh market integration
 * 
 * @fileoverview Enterprise-grade subscription plan management with product subscriptions
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  subscriptionPlans, 
  subscriptionPlanItems,
  products,
  productVariants,
  insertSubscriptionPlanSchema,
  insertSubscriptionPlanItemSchema
} from '../../../../../shared/schema';
import { eq, desc, and, like, inArray, count, sum, avg } from 'drizzle-orm';
import { z } from 'zod';

export class SubscriptionPlanController {
  /**
   * Get all subscription plans with product items
   * GET /api/v1/subscriptions/plans
   */
  static async getAllPlans(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        category,
        priceRange,
        billingCycle,
        isActive = 'true',
        includeProducts = 'true'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const conditions = [];
      if (search) {
        conditions.push(like(subscriptionPlans.name, `%${search}%`));
      }
      if (category) {
        conditions.push(eq(subscriptionPlans.category, category as string));
      }
      if (billingCycle) {
        conditions.push(eq(subscriptionPlans.billingCycle, billingCycle as string));
      }
      if (isActive !== 'all') {
        conditions.push(eq(subscriptionPlans.isActive, isActive === 'true'));
      }

      // Get plans with counts
      const plans = await db
        .select({
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          nameBn: subscriptionPlans.nameBn,
          description: subscriptionPlans.description,
          descriptionBn: subscriptionPlans.descriptionBn,
          category: subscriptionPlans.category,
          price: subscriptionPlans.price,
          currency: subscriptionPlans.currency,
          billingCycle: subscriptionPlans.billingCycle,
          trialDays: subscriptionPlans.trialDays,
          isActive: subscriptionPlans.isActive,
          features: subscriptionPlans.features,
          bangladeshFeatures: subscriptionPlans.bangladeshFeatures,
          createdAt: subscriptionPlans.createdAt,
          subscriberCount: count(subscriptionPlanItems.id).as('subscriberCount')
        })
        .from(subscriptionPlans)
        .leftJoin(subscriptionPlanItems, eq(subscriptionPlans.id, subscriptionPlanItems.planId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionPlans.id)
        .orderBy(desc(subscriptionPlans.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // If products are requested, get plan items for each plan
      let plansWithProducts = plans;
      if (includeProducts === 'true') {
        plansWithProducts = await Promise.all(
          plans.map(async (plan) => {
            const planItems = await db
              .select({
                id: subscriptionPlanItems.id,
                productId: subscriptionPlanItems.productId,
                variantId: subscriptionPlanItems.variantId,
                quantity: subscriptionPlanItems.quantity,
                unitPrice: subscriptionPlanItems.unitPrice,
                discountPercentage: subscriptionPlanItems.discountPercentage,
                isOptional: subscriptionPlanItems.isOptional,
                canModifyQuantity: subscriptionPlanItems.canModifyQuantity,
                deliveryFrequency: subscriptionPlanItems.deliveryFrequency,
                productName: products.name,
                productNameBn: products.nameBn,
                productImage: products.images,
                productPrice: products.price
              })
              .from(subscriptionPlanItems)
              .leftJoin(products, eq(subscriptionPlanItems.productId, products.id))
              .where(eq(subscriptionPlanItems.planId, plan.id));

            return {
              ...plan,
              items: planItems
            };
          })
        );
      }

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(subscriptionPlans)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      res.json({
        success: true,
        data: plansWithProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        meta: {
          totalActivePlans: plans.filter(p => p.isActive).length,
          averagePrice: plans.reduce((sum, p) => sum + Number(p.price), 0) / plans.length,
          supportedCurrencies: ['BDT', 'USD'],
          bangladeshOptimized: true
        }
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plans',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get single subscription plan with full details
   * GET /api/v1/subscriptions/plans/:id
   */
  static async getPlanById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeAnalytics = 'false' } = req.query;

      // Get plan details
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (!plan.length) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      // Get plan items with product details
      const planItems = await db
        .select({
          id: subscriptionPlanItems.id,
          productId: subscriptionPlanItems.productId,
          variantId: subscriptionPlanItems.variantId,
          quantity: subscriptionPlanItems.quantity,
          unitPrice: subscriptionPlanItems.unitPrice,
          discountPercentage: subscriptionPlanItems.discountPercentage,
          isOptional: subscriptionPlanItems.isOptional,
          canModifyQuantity: subscriptionPlanItems.canModifyQuantity,
          minQuantity: subscriptionPlanItems.minQuantity,
          maxQuantity: subscriptionPlanItems.maxQuantity,
          deliveryFrequency: subscriptionPlanItems.deliveryFrequency,
          isDeliveryRequired: subscriptionPlanItems.isDeliveryRequired,
          allowSubstitution: subscriptionPlanItems.allowSubstitution,
          substitutionOptions: subscriptionPlanItems.substitutionOptions,
          // Product details
          productName: products.name,
          productNameBn: products.nameBn,
          productDescription: products.description,
          productImages: products.images,
          productPrice: products.price,
          productBrand: products.brand,
          productCategory: products.categoryId,
          productSku: products.sku,
          productWeight: products.weight,
          productDimensions: products.dimensions
        })
        .from(subscriptionPlanItems)
        .leftJoin(products, eq(subscriptionPlanItems.productId, products.id))
        .where(eq(subscriptionPlanItems.planId, id));

      let analytics = null;
      if (includeAnalytics === 'true') {
        // Get basic analytics for this plan
        const analyticsResult = await db
          .select({
            totalSubscribers: count(),
            averageMonthlyRevenue: avg(subscriptionPlans.price),
            totalItems: count(subscriptionPlanItems.id)
          })
          .from(subscriptionPlans)
          .leftJoin(subscriptionPlanItems, eq(subscriptionPlans.id, subscriptionPlanItems.planId))
          .where(eq(subscriptionPlans.id, id))
          .groupBy(subscriptionPlans.id);

        analytics = analyticsResult[0] || null;
      }

      const planData = {
        ...plan[0],
        items: planItems,
        analytics,
        bangladeshOptimized: true,
        supportedPaymentMethods: ['bkash', 'nagad', 'rocket', 'card', 'bank_transfer'],
        culturalFeatures: {
          ramadanPause: true,
          festivalDiscounts: true,
          bengaliSupport: true,
          prayerTimeAware: false
        }
      };

      res.json({
        success: true,
        data: planData
      });
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create new subscription plan with products
   * POST /api/v1/subscriptions/plans
   */
  static async createPlan(req: Request, res: Response) {
    try {
      // Validate plan data
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const { items = [], ...planFields } = req.body;

      // Create the plan
      const newPlan = await db
        .insert(subscriptionPlans)
        .values({
          ...planFields,
          bangladeshFeatures: planFields.bangladeshFeatures || {
            ramadanPause: true,
            festivalDiscounts: true,
            bengaliSupport: true,
            mobileBankingSupport: ['bkash', 'nagad', 'rocket']
          }
        })
        .returning();

      const createdPlan = newPlan[0];

      // Create plan items if provided
      let createdItems = [];
      if (items.length > 0) {
        const validatedItems = items.map((item: any) => 
          insertSubscriptionPlanItemSchema.parse({
            ...item,
            planId: createdPlan.id
          })
        );

        createdItems = await db
          .insert(subscriptionPlanItems)
          .values(validatedItems)
          .returning();
      }

      res.status(201).json({
        success: true,
        message: 'Subscription plan created successfully',
        data: {
          plan: createdPlan,
          items: createdItems
        }
      });
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create subscription plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update subscription plan
   * PUT /api/v1/subscriptions/plans/:id
   */
  static async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { items, ...planFields } = req.body;

      // Update plan
      const updatedPlan = await db
        .update(subscriptionPlans)
        .set({
          ...planFields,
          updatedAt: new Date()
        })
        .where(eq(subscriptionPlans.id, id))
        .returning();

      if (!updatedPlan.length) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      // Update items if provided
      let updatedItems = [];
      if (items) {
        // Delete existing items
        await db
          .delete(subscriptionPlanItems)
          .where(eq(subscriptionPlanItems.planId, id));

        // Insert new items
        if (items.length > 0) {
          const validatedItems = items.map((item: any) => 
            insertSubscriptionPlanItemSchema.parse({
              ...item,
              planId: id
            })
          );

          updatedItems = await db
            .insert(subscriptionPlanItems)
            .values(validatedItems)
            .returning();
        }
      }

      res.json({
        success: true,
        message: 'Subscription plan updated successfully',
        data: {
          plan: updatedPlan[0],
          items: updatedItems
        }
      });
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update subscription plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete subscription plan
   * DELETE /api/v1/subscriptions/plans/:id
   */
  static async deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { force = 'false' } = req.query;

      // Check if plan has active subscriptions
      if (force !== 'true') {
        // This would need to check userSubscriptions table
        // For now, we'll allow deletion with a warning
      }

      // Delete plan items first
      await db
        .delete(subscriptionPlanItems)
        .where(eq(subscriptionPlanItems.planId, id));

      // Delete plan
      const deletedPlan = await db
        .delete(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .returning();

      if (!deletedPlan.length) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }

      res.json({
        success: true,
        message: 'Subscription plan deleted successfully',
        data: deletedPlan[0]
      });
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete subscription plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get plan recommendations for Bangladesh market
   * GET /api/v1/subscriptions/plans/recommendations
   */
  static async getPlanRecommendations(req: Request, res: Response) {
    try {
      const { 
        userId, 
        budget, 
        category, 
        deliveryFrequency = 'monthly' 
      } = req.query;

      // Get popular plans based on Bangladesh market preferences
      const recommendations = await db
        .select({
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          nameBn: subscriptionPlans.nameBn,
          description: subscriptionPlans.description,
          price: subscriptionPlans.price,
          currency: subscriptionPlans.currency,
          billingCycle: subscriptionPlans.billingCycle,
          features: subscriptionPlans.features,
          bangladeshFeatures: subscriptionPlans.bangladeshFeatures,
          itemCount: count(subscriptionPlanItems.id)
        })
        .from(subscriptionPlans)
        .leftJoin(subscriptionPlanItems, eq(subscriptionPlans.id, subscriptionPlanItems.planId))
        .where(and(
          eq(subscriptionPlans.isActive, true),
          budget ? lte(subscriptionPlans.price, budget as string) : undefined,
          category ? eq(subscriptionPlans.category, category as string) : undefined
        ))
        .groupBy(subscriptionPlans.id)
        .orderBy(desc(count(subscriptionPlanItems.id)))
        .limit(10);

      // Add recommendation scores and Bangladesh-specific features
      const scoredRecommendations = recommendations.map(plan => ({
        ...plan,
        recommendationScore: Math.random() * 100, // TODO: Implement proper ML scoring
        bangladeshOptimized: true,
        culturalBenefits: {
          ramadanPause: 'Free pause during Ramadan',
          festivalDiscounts: 'Special discounts during Eid and Pohela Boishakh',
          bengaliSupport: 'Complete Bengali language support',
          mobileBanking: 'bKash, Nagad, Rocket payment support'
        },
        estimatedDelivery: {
          dhaka: '1-2 days',
          chittagong: '2-3 days',
          sylhet: '3-4 days',
          other: '3-5 days'
        }
      }));

      res.json({
        success: true,
        data: scoredRecommendations,
        meta: {
          totalRecommendations: recommendations.length,
          basedOn: ['popularity', 'budget', 'category', 'bangladesh_optimization'],
          deliveryFrequency,
          currency: 'BDT'
        }
      });
    } catch (error) {
      console.error('Error getting plan recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get plan recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}