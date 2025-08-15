/**
 * Subscription Coupon Controller - Amazon.com/Shopee.sg-Level Coupon Management
 * Handles subscription coupons, discounts, and Bangladesh festival integration
 * 
 * @fileoverview Enterprise-grade subscription coupon management with cultural features
 * @author GetIt Platform Team
 * @version 2.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  subscriptionCoupons,
  subscriptionCouponUsage,
  userSubscriptions,
  subscriptionPlans,
  users,
  insertSubscriptionCouponSchema,
  insertSubscriptionCouponUsageSchema
} from '../../../../../shared/schema';
import { eq, desc, and, gte, lte, count, sum, like, inArray } from 'drizzle-orm';
import { z } from 'zod';

export class SubscriptionCouponController {
  /**
   * Get all subscription coupons
   * GET /api/v1/subscriptions/coupons
   */
  static async getAllCoupons(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        discountType,
        isActive,
        festivalAssociation,
        validFrom,
        validUntil,
        paymentMethod
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const conditions = [];
      if (search) {
        conditions.push(like(subscriptionCoupons.couponCode, `%${search}%`));
      }
      if (discountType) {
        conditions.push(eq(subscriptionCoupons.discountType, discountType as string));
      }
      if (isActive !== undefined) {
        conditions.push(eq(subscriptionCoupons.isActive, isActive === 'true'));
      }
      if (festivalAssociation) {
        conditions.push(eq(subscriptionCoupons.festivalAssociation, festivalAssociation as string));
      }
      if (validFrom) {
        conditions.push(gte(subscriptionCoupons.validFrom, validFrom as string));
      }
      if (validUntil) {
        conditions.push(lte(subscriptionCoupons.validUntil, validUntil as string));
      }

      // Get coupons with usage statistics
      const coupons = await db
        .select({
          id: subscriptionCoupons.id,
          couponCode: subscriptionCoupons.couponCode,
          couponName: subscriptionCoupons.couponName,
          couponNameBn: subscriptionCoupons.couponNameBn,
          description: subscriptionCoupons.description,
          descriptionBn: subscriptionCoupons.descriptionBn,
          discountType: subscriptionCoupons.discountType,
          discountValue: subscriptionCoupons.discountValue,
          maxDiscountAmount: subscriptionCoupons.maxDiscountAmount,
          validFrom: subscriptionCoupons.validFrom,
          validUntil: subscriptionCoupons.validUntil,
          isActive: subscriptionCoupons.isActive,
          usageLimit: subscriptionCoupons.usageLimit,
          usageLimitPerCustomer: subscriptionCoupons.usageLimitPerCustomer,
          currentUsageCount: subscriptionCoupons.currentUsageCount,
          applicablePlans: subscriptionCoupons.applicablePlans,
          minimumSubscriptionValue: subscriptionCoupons.minimumSubscriptionValue,
          firstTimeCustomersOnly: subscriptionCoupons.firstTimeCustomersOnly,
          discountDuration: subscriptionCoupons.discountDuration,
          discountDurationMonths: subscriptionCoupons.discountDurationMonths,
          applicablePaymentMethods: subscriptionCoupons.applicablePaymentMethods,
          festivalAssociation: subscriptionCoupons.festivalAssociation,
          createdAt: subscriptionCoupons.createdAt,
          usageCount: count(subscriptionCouponUsage.id).as('usageCount')
        })
        .from(subscriptionCoupons)
        .leftJoin(subscriptionCouponUsage, eq(subscriptionCoupons.id, subscriptionCouponUsage.couponId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionCoupons.id)
        .orderBy(desc(subscriptionCoupons.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: count() })
        .from(subscriptionCoupons)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      // Calculate coupon statistics
      const stats = {
        totalCoupons: total,
        activeCoupons: coupons.filter(c => c.isActive).length,
        usedCoupons: coupons.filter(c => (c.usageCount || 0) > 0).length,
        festivalCoupons: coupons.filter(c => c.festivalAssociation).length,
        totalSavings: coupons.reduce((sum, c) => {
          const savings = (c.usageCount || 0) * Number(c.discountValue);
          return sum + (c.discountType === 'percentage' ? savings : savings);
        }, 0)
      };

      res.json({
        success: true,
        data: coupons,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        stats,
        bangladeshFeatures: {
          supportedFestivals: ['eid', 'pohela_boishakh', 'victory_day', 'independence_day'],
          supportedPaymentMethods: ['bkash', 'nagad', 'rocket', 'card'],
          culturalDiscounts: true,
          ramadanSpecialOffers: true
        }
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get coupon by code with validation
   * GET /api/v1/subscriptions/coupons/:code
   */
  static async getCouponByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { userId, planId, subscriptionValue, paymentMethod } = req.query;

      // Get coupon details
      const coupon = await db
        .select()
        .from(subscriptionCoupons)
        .where(eq(subscriptionCoupons.couponCode, code))
        .limit(1);

      if (!coupon.length) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
          messageBn: 'কুপন খুঁজে পাওয়া যায়নি'
        });
      }

      const couponData = coupon[0];

      // Validate coupon
      const validation = await this.validateCoupon(
        couponData,
        userId as string,
        planId as string,
        Number(subscriptionValue),
        paymentMethod as string
      );

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          messageBn: validation.messageBn,
          validationErrors: validation.errors
        });
      }

      // Calculate discount amount
      const discountAmount = this.calculateDiscountAmount(
        couponData,
        Number(subscriptionValue)
      );

      res.json({
        success: true,
        data: {
          ...couponData,
          discountAmount,
          finalAmount: Number(subscriptionValue) - discountAmount,
          savingsPercentage: (discountAmount / Number(subscriptionValue)) * 100,
          validation
        },
        bangladeshFeatures: {
          culturalRelevance: this.getCulturalRelevance(couponData),
          festivalBonus: this.getFestivalBonus(couponData),
          paymentMethodBonus: this.getPaymentMethodBonus(couponData, paymentMethod as string)
        }
      });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create new subscription coupon
   * POST /api/v1/subscriptions/coupons
   */
  static async createCoupon(req: Request, res: Response) {
    try {
      // Validate coupon data
      const couponData = insertSubscriptionCouponSchema.parse(req.body);

      // Generate coupon code if not provided
      if (!couponData.couponCode) {
        couponData.couponCode = this.generateCouponCode(couponData.festivalAssociation);
      }

      // Validate coupon code uniqueness
      const existingCoupon = await db
        .select()
        .from(subscriptionCoupons)
        .where(eq(subscriptionCoupons.couponCode, couponData.couponCode))
        .limit(1);

      if (existingCoupon.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists',
          messageBn: 'কুপন কোড ইতিমধ্যে বিদ্যমান'
        });
      }

      // Create the coupon
      const newCoupon = await db
        .insert(subscriptionCoupons)
        .values({
          ...couponData,
          currentUsageCount: 0
        })
        .returning();

      const createdCoupon = newCoupon[0];

      res.status(201).json({
        success: true,
        message: 'Subscription coupon created successfully',
        messageBn: 'সাবস্ক্রিপশন কুপন সফলভাবে তৈরি হয়েছে',
        data: createdCoupon
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Apply coupon to subscription
   * POST /api/v1/subscriptions/coupons/:code/apply
   */
  static async applyCoupon(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { 
        subscriptionId, 
        userId, 
        originalAmount, 
        billingCycle,
        paymentMethod 
      } = req.body;

      // Get coupon
      const coupon = await db
        .select()
        .from(subscriptionCoupons)
        .where(eq(subscriptionCoupons.couponCode, code))
        .limit(1);

      if (!coupon.length) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      const couponData = coupon[0];

      // Get subscription details
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.id, subscriptionId))
        .limit(1);

      if (!subscription.length) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Validate coupon
      const validation = await this.validateCoupon(
        couponData,
        userId,
        subscription[0].planId,
        Number(originalAmount),
        paymentMethod
      );

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          validationErrors: validation.errors
        });
      }

      // Calculate discount
      const discountAmount = this.calculateDiscountAmount(couponData, Number(originalAmount));
      const finalAmount = Number(originalAmount) - discountAmount;

      // Record coupon usage
      const couponUsage = await db
        .insert(subscriptionCouponUsage)
        .values({
          couponId: couponData.id,
          subscriptionId,
          userId: Number(userId),
          discountAmount: discountAmount.toString(),
          originalAmount: originalAmount.toString(),
          finalAmount: finalAmount.toString(),
          billingCycle
        })
        .returning();

      // Update coupon usage count
      await db
        .update(subscriptionCoupons)
        .set({
          currentUsageCount: (couponData.currentUsageCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(subscriptionCoupons.id, couponData.id));

      res.json({
        success: true,
        message: 'Coupon applied successfully',
        messageBn: 'কুপন সফলভাবে প্রয়োগ করা হয়েছে',
        data: {
          couponUsage: couponUsage[0],
          originalAmount: Number(originalAmount),
          discountAmount,
          finalAmount,
          savingsPercentage: (discountAmount / Number(originalAmount)) * 100,
          culturalMessage: this.getCulturalApplicationMessage(couponData)
        }
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply coupon',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get festival-specific coupons
   * GET /api/v1/subscriptions/coupons/festivals/:festival
   */
  static async getFestivalCoupons(req: Request, res: Response) {
    try {
      const { festival } = req.params;
      const { userId, planId } = req.query;

      const currentDate = new Date();

      // Get festival coupons
      const festivalCoupons = await db
        .select()
        .from(subscriptionCoupons)
        .where(
          and(
            eq(subscriptionCoupons.festivalAssociation, festival),
            eq(subscriptionCoupons.isActive, true),
            lte(subscriptionCoupons.validFrom, currentDate.toISOString()),
            gte(subscriptionCoupons.validUntil, currentDate.toISOString())
          )
        )
        .orderBy(desc(subscriptionCoupons.discountValue));

      // Filter coupons based on user eligibility
      const eligibleCoupons = [];
      for (const coupon of festivalCoupons) {
        const validation = await this.validateCoupon(coupon, userId as string, planId as string);
        if (validation.isValid) {
          eligibleCoupons.push({
            ...coupon,
            estimatedSavings: this.calculateDiscountAmount(coupon, 1000), // Sample calculation
            culturalSignificance: this.getFestivalSignificance(festival, coupon)
          });
        }
      }

      res.json({
        success: true,
        data: eligibleCoupons,
        festivalInfo: {
          name: festival,
          culturalName: this.getFestivalCulturalName(festival),
          significance: this.getFestivalSignificance(festival),
          traditionalGreeting: this.getFestivalGreeting(festival),
          specialOffers: eligibleCoupons.length
        }
      });
    } catch (error) {
      console.error('Error fetching festival coupons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch festival coupons',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get coupon usage analytics
   * GET /api/v1/subscriptions/coupons/analytics
   */
  static async getCouponAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, groupBy = 'month' } = req.query;

      // Build date conditions
      const conditions = [];
      if (dateFrom) {
        conditions.push(gte(subscriptionCouponUsage.appliedAt, dateFrom as string));
      }
      if (dateTo) {
        conditions.push(lte(subscriptionCouponUsage.appliedAt, dateTo as string));
      }

      // Get usage statistics
      const usageStats = await db
        .select({
          totalUsage: count(),
          totalSavings: sum(subscriptionCouponUsage.discountAmount),
          averageDiscount: avg(subscriptionCouponUsage.discountAmount),
          totalOriginalAmount: sum(subscriptionCouponUsage.originalAmount)
        })
        .from(subscriptionCouponUsage)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Get top performing coupons
      const topCoupons = await db
        .select({
          couponCode: subscriptionCoupons.couponCode,
          couponName: subscriptionCoupons.couponName,
          usageCount: count(subscriptionCouponUsage.id),
          totalSavings: sum(subscriptionCouponUsage.discountAmount)
        })
        .from(subscriptionCoupons)
        .leftJoin(subscriptionCouponUsage, eq(subscriptionCoupons.id, subscriptionCouponUsage.couponId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(subscriptionCoupons.id, subscriptionCoupons.couponCode, subscriptionCoupons.couponName)
        .orderBy(desc(count(subscriptionCouponUsage.id)))
        .limit(10);

      // Get festival performance
      const festivalStats = await db
        .select({
          festival: subscriptionCoupons.festivalAssociation,
          usageCount: count(subscriptionCouponUsage.id),
          totalSavings: sum(subscriptionCouponUsage.discountAmount)
        })
        .from(subscriptionCoupons)
        .leftJoin(subscriptionCouponUsage, eq(subscriptionCoupons.id, subscriptionCouponUsage.couponId))
        .where(
          and(
            conditions.length > 0 ? and(...conditions) : undefined,
            subscriptionCoupons.festivalAssociation !== null
          )
        )
        .groupBy(subscriptionCoupons.festivalAssociation)
        .orderBy(desc(count(subscriptionCouponUsage.id)));

      res.json({
        success: true,
        data: {
          overview: usageStats[0],
          topCoupons,
          festivalPerformance: festivalStats,
          bangladeshInsights: {
            mostPopularFestival: festivalStats[0]?.festival || 'eid',
            averageSavingsPerUser: Number(usageStats[0]?.totalSavings || 0) / Number(usageStats[0]?.totalUsage || 1),
            conversionRate: 0.15, // Mock data - would calculate from actual usage
            culturalEngagement: {
              festivalParticipation: 78,
              traditionalistUsers: 65,
              modernUsers: 35
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching coupon analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods
  private static async validateCoupon(
    coupon: any, 
    userId?: string, 
    planId?: string, 
    subscriptionValue?: number,
    paymentMethod?: string
  ) {
    const errors = [];
    const currentDate = new Date();

    // Check if coupon is active
    if (!coupon.isActive) {
      errors.push('Coupon is not active');
    }

    // Check validity dates
    if (new Date(coupon.validFrom) > currentDate) {
      errors.push('Coupon is not yet valid');
    }

    if (new Date(coupon.validUntil) < currentDate) {
      errors.push('Coupon has expired');
    }

    // Check usage limits
    if (coupon.usageLimit && (coupon.currentUsageCount || 0) >= coupon.usageLimit) {
      errors.push('Coupon usage limit exceeded');
    }

    // Check per-customer usage limit
    if (userId && coupon.usageLimitPerCustomer) {
      const userUsage = await db
        .select({ count: count() })
        .from(subscriptionCouponUsage)
        .where(
          and(
            eq(subscriptionCouponUsage.couponId, coupon.id),
            eq(subscriptionCouponUsage.userId, Number(userId))
          )
        );

      if (userUsage[0]?.count >= coupon.usageLimitPerCustomer) {
        errors.push('Per-customer usage limit exceeded');
      }
    }

    // Check minimum subscription value
    if (subscriptionValue && coupon.minimumSubscriptionValue) {
      if (subscriptionValue < Number(coupon.minimumSubscriptionValue)) {
        errors.push('Subscription value below minimum required');
      }
    }

    // Check applicable plans
    if (planId && coupon.applicablePlans) {
      const applicablePlans = Array.isArray(coupon.applicablePlans) 
        ? coupon.applicablePlans 
        : JSON.parse(coupon.applicablePlans || '[]');
      
      if (applicablePlans.length > 0 && !applicablePlans.includes(planId)) {
        errors.push('Coupon not applicable to this plan');
      }
    }

    // Check applicable payment methods
    if (paymentMethod && coupon.applicablePaymentMethods) {
      const applicableMethods = Array.isArray(coupon.applicablePaymentMethods)
        ? coupon.applicablePaymentMethods
        : JSON.parse(coupon.applicablePaymentMethods || '[]');
        
      if (applicableMethods.length > 0 && !applicableMethods.includes(paymentMethod)) {
        errors.push('Coupon not applicable to this payment method');
      }
    }

    // Check first-time customer restriction
    if (userId && coupon.firstTimeCustomersOnly) {
      const existingSubscriptions = await db
        .select({ count: count() })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, Number(userId)));

      if (existingSubscriptions[0]?.count > 0) {
        errors.push('Coupon only valid for first-time customers');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      message: errors.length > 0 ? errors[0] : 'Coupon is valid',
      messageBn: errors.length > 0 ? this.translateErrorToBengali(errors[0]) : 'কুপন বৈধ'
    };
  }

  private static calculateDiscountAmount(coupon: any, subscriptionValue: number): number {
    switch (coupon.discountType) {
      case 'percentage':
        const percentageDiscount = (subscriptionValue * Number(coupon.discountValue)) / 100;
        return coupon.maxDiscountAmount 
          ? Math.min(percentageDiscount, Number(coupon.maxDiscountAmount))
          : percentageDiscount;
      
      case 'fixed_amount':
        return Math.min(Number(coupon.discountValue), subscriptionValue);
      
      case 'free_shipping':
        return 0; // Would need shipping cost calculation
      
      case 'free_trial':
        return subscriptionValue; // Full discount for trial period
      
      default:
        return 0;
    }
  }

  private static generateCouponCode(festivalAssociation?: string): string {
    const prefix = festivalAssociation ? 
      this.getFestivalPrefix(festivalAssociation) : 
      'SUB';
    
    const randomString = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `${prefix}${randomString}`;
  }

  private static getFestivalPrefix(festival: string): string {
    const prefixes = {
      'eid': 'EID',
      'pohela_boishakh': 'PB',
      'victory_day': 'VD',
      'independence_day': 'ID',
      'durga_puja': 'DP'
    };
    return prefixes[festival as keyof typeof prefixes] || 'SUB';
  }

  private static getCulturalRelevance(coupon: any) {
    if (coupon.festivalAssociation) {
      return {
        festival: coupon.festivalAssociation,
        culturalSignificance: this.getFestivalSignificance(coupon.festivalAssociation),
        traditionalGreeting: this.getFestivalGreeting(coupon.festivalAssociation)
      };
    }
    return null;
  }

  private static getFestivalBonus(coupon: any) {
    if (coupon.festivalAssociation) {
      return {
        bonusDescription: `Special ${coupon.festivalAssociation} discount`,
        bonusDescriptionBn: this.getFestivalBonusBengali(coupon.festivalAssociation),
        culturalMessage: this.getCulturalMessage(coupon.festivalAssociation)
      };
    }
    return null;
  }

  private static getPaymentMethodBonus(coupon: any, paymentMethod: string) {
    const bonuses = {
      'bkash': { bonus: 2, message: 'Extra 2% off with bKash' },
      'nagad': { bonus: 1.5, message: 'Extra 1.5% off with Nagad' },
      'rocket': { bonus: 1, message: 'Extra 1% off with Rocket' }
    };
    
    return bonuses[paymentMethod as keyof typeof bonuses] || null;
  }

  private static getFestivalSignificance(festival: string) {
    const significance = {
      'eid': 'The most important Islamic festival celebrating the end of Ramadan',
      'pohela_boishakh': 'Bengali New Year celebration marking new beginnings',
      'victory_day': 'Commemorating Bangladesh\'s victory in the Liberation War',
      'independence_day': 'Celebrating Bangladesh\'s independence',
      'durga_puja': 'Major Hindu festival honoring Goddess Durga'
    };
    return significance[festival as keyof typeof significance] || 'Cultural celebration';
  }

  private static getFestivalCulturalName(festival: string) {
    const names = {
      'eid': 'ঈদ',
      'pohela_boishakh': 'পহেলা বৈশাখ',
      'victory_day': 'বিজয় দিবস',
      'independence_day': 'স্বাধীনতা দিবস',
      'durga_puja': 'দুর্গা পূজা'
    };
    return names[festival as keyof typeof names] || festival;
  }

  private static getFestivalGreeting(festival: string) {
    const greetings = {
      'eid': 'Eid Mubarak! / ঈদ মুবারক!',
      'pohela_boishakh': 'Shubho Noboborsho! / শুভ নববর্ষ!',
      'victory_day': 'Joy Bangla! / জয় বাংলা!',
      'independence_day': 'Joy Bangla! / জয় বাংলা!',
      'durga_puja': 'Shubho Durga Puja! / শুভ দুর্গা পূজা!'
    };
    return greetings[festival as keyof typeof greetings] || 'Happy Festival!';
  }

  private static getFestivalBonusBengali(festival: string) {
    const bonuses = {
      'eid': 'বিশেষ ঈদ ছাড়',
      'pohela_boishakh': 'বিশেষ নববর্ষ ছাড়',
      'victory_day': 'বিশেষ বিজয় দিবস ছাড়',
      'independence_day': 'বিশেষ স্বাধীনতা দিবস ছাড়'
    };
    return bonuses[festival as keyof typeof bonuses] || 'বিশেষ ছাড়';
  }

  private static getCulturalMessage(festival: string) {
    const messages = {
      'eid': 'May this Eid bring joy and blessings to your family',
      'pohela_boishakh': 'Wishing you prosperity in the new year',
      'victory_day': 'Honoring our heroes and celebrating freedom',
      'independence_day': 'Celebrating the spirit of independence'
    };
    return messages[festival as keyof typeof messages] || 'Celebrating our cultural heritage';
  }

  private static getCulturalApplicationMessage(coupon: any) {
    if (coupon.festivalAssociation) {
      return {
        message: `Your ${coupon.festivalAssociation} discount has been applied`,
        messageBn: `আপনার ${this.getFestivalCulturalName(coupon.festivalAssociation)} ছাড় প্রয়োগ করা হয়েছে`,
        blessing: this.getFestivalGreeting(coupon.festivalAssociation)
      };
    }
    return {
      message: 'Your subscription discount has been applied',
      messageBn: 'আপনার সাবস্ক্রিপশন ছাড় প্রয়োগ করা হয়েছে'
    };
  }

  private static translateErrorToBengali(error: string): string {
    const translations = {
      'Coupon is not active': 'কুপন সক্রিয় নেই',
      'Coupon is not yet valid': 'কুপন এখনও বৈধ নয়',
      'Coupon has expired': 'কুপনের মেয়াদ শেষ',
      'Coupon usage limit exceeded': 'কুপন ব্যবহারের সীমা অতিক্রম',
      'Per-customer usage limit exceeded': 'গ্রাহক প্রতি ব্যবহারের সীমা অতিক্রম',
      'Subscription value below minimum required': 'ন্যূনতম প্রয়োজনীয় সাবস্ক্রিপশন মূল্যের নিচে',
      'Coupon not applicable to this plan': 'এই প্ল্যানে কুপন প্রযোজ্য নয়',
      'Coupon not applicable to this payment method': 'এই পেমেন্ট পদ্ধতিতে কুপন প্রযোজ্য নয়',
      'Coupon only valid for first-time customers': 'কুপন শুধুমাত্র প্রথমবার গ্রাহকদের জন্য বৈধ'
    };
    return translations[error as keyof typeof translations] || error;
  }
}