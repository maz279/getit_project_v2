/**
 * Bundle Controller - Amazon.com/Shopee.sg Level
 * Product bundling and combo offers management
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  products, categories, vendors, orderItems
} from '@shared/schema';
import { eq, desc, asc, and, or, inArray, sql, count, sum } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

export class BundleController {
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get all product bundles
   * GET /api/v1/products/bundles
   */
  async getAllBundles(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        vendor,
        isActive = true,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build query conditions
      let whereConditions = [];
      
      if (isActive !== undefined) {
        whereConditions.push(eq(productBundles.isActive, isActive === 'true'));
      }
      
      if (category) {
        whereConditions.push(eq(productBundles.categoryId, category as string));
      }
      
      if (vendor) {
        whereConditions.push(eq(productBundles.vendorId, vendor as string));
      }

      const bundles = await db
        .select({
          bundle: productBundles,
          vendor: vendors,
          category: categories,
          pricing: productBundlePricing
        })
        .from(productBundles)
        .leftJoin(vendors, eq(productBundles.vendorId, vendors.id))
        .leftJoin(categories, eq(productBundles.categoryId, categories.id))
        .leftJoin(productBundlePricing, eq(productBundles.id, productBundlePricing.bundleId))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(sortOrder === 'desc' ? desc(productBundles[sortBy as keyof typeof productBundles]) : asc(productBundles[sortBy as keyof typeof productBundles]))
        .limit(Number(limit))
        .offset(offset);

      // Get bundle items for each bundle
      const bundleIds = bundles.map(b => b.bundle.id);
      const bundleItems = bundleIds.length > 0 ? await db
        .select({
          bundleItem: productBundleItems,
          product: products
        })
        .from(productBundleItems)
        .leftJoin(products, eq(productBundleItems.productId, products.id))
        .where(inArray(productBundleItems.bundleId, bundleIds))
        .orderBy(asc(productBundleItems.sortOrder)) : [];

      // Group items by bundle
      const bundleItemsMap = bundleItems.reduce((acc: any, item) => {
        const bundleId = item.bundleItem.bundleId;
        if (!acc[bundleId]) acc[bundleId] = [];
        acc[bundleId].push({
          ...item.bundleItem,
          product: item.product
        });
        return acc;
      }, {});

      // Combine bundles with their items
      const completeBundles = bundles.map(bundleData => ({
        ...bundleData.bundle,
        vendor: bundleData.vendor,
        category: bundleData.category,
        pricing: bundleData.pricing,
        items: bundleItemsMap[bundleData.bundle.id] || [],
        itemCount: bundleItemsMap[bundleData.bundle.id]?.length || 0
      }));

      // Get total count for pagination
      const totalCount = await db
        .select({ count: count() })
        .from(productBundles)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      res.json({
        success: true,
        bundles: completeBundles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting bundles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product bundles'
      });
    }
  }

  /**
   * Get bundle by ID with full details
   * GET /api/v1/products/bundles/:bundleId
   */
  async getBundleById(req: Request, res: Response) {
    try {
      const { bundleId } = req.params;

      // Get bundle details
      const bundle = await db
        .select({
          bundle: productBundles,
          vendor: vendors,
          category: categories,
          pricing: productBundlePricing
        })
        .from(productBundles)
        .leftJoin(vendors, eq(productBundles.vendorId, vendors.id))
        .leftJoin(categories, eq(productBundles.categoryId, categories.id))
        .leftJoin(productBundlePricing, eq(productBundles.id, productBundlePricing.bundleId))
        .where(eq(productBundles.id, bundleId))
        .limit(1);

      if (!bundle.length) {
        return res.status(404).json({
          success: false,
          error: 'Bundle not found'
        });
      }

      // Get bundle items
      const bundleItems = await db
        .select({
          bundleItem: productBundleItems,
          product: products
        })
        .from(productBundleItems)
        .leftJoin(products, eq(productBundleItems.productId, products.id))
        .where(eq(productBundleItems.bundleId, bundleId))
        .orderBy(asc(productBundleItems.sortOrder));

      // Calculate savings and pricing
      const individualTotal = bundleItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product?.price || '0') * item.bundleItem.quantity);
      }, 0);

      const bundlePrice = parseFloat(bundle[0].pricing?.bundlePrice || '0');
      const savings = individualTotal - bundlePrice;
      const savingsPercentage = individualTotal > 0 ? (savings / individualTotal) * 100 : 0;

      const completeBundleData = {
        ...bundle[0].bundle,
        vendor: bundle[0].vendor,
        category: bundle[0].category,
        pricing: {
          ...bundle[0].pricing,
          individualTotal,
          savings: Math.max(0, savings),
          savingsPercentage: Math.max(0, savingsPercentage)
        },
        items: bundleItems.map(item => ({
          ...item.bundleItem,
          product: item.product
        })),
        itemCount: bundleItems.length
      };

      res.json({
        success: true,
        bundle: completeBundleData
      });
    } catch (error) {
      console.error('Error getting bundle:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get bundle details'
      });
    }
  }

  /**
   * Create new product bundle
   * POST /api/v1/products/bundles
   */
  async createBundle(req: Request, res: Response) {
    try {
      const {
        name,
        nameEn,
        nameBn,
        description,
        descriptionEn,
        descriptionBn,
        vendorId,
        categoryId,
        bundleType = 'fixed', // 'fixed', 'dynamic', 'build_your_own'
        items, // Array of { productId, quantity, isRequired, discountPercentage }
        pricing,
        images = [],
        tags = [],
        isActive = true,
        validFrom,
        validTo,
        maxQuantity,
        minQuantity = 1
      } = req.body;

      // Validate vendor exists
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid vendor ID'
        });
      }

      // Validate all products exist and belong to vendor
      if (!items || items.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Bundle must contain at least 2 products'
        });
      }

      const productIds = items.map((item: any) => item.productId);
      const bundleProducts = await db
        .select()
        .from(products)
        .where(and(
          inArray(products.id, productIds),
          eq(products.vendorId, vendorId),
          eq(products.isActive, true)
        ));

      if (bundleProducts.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Some products not found or not accessible'
        });
      }

      // Create bundle
      const bundleId = crypto.randomUUID();
      const newBundle = {
        id: bundleId,
        name,
        nameEn,
        nameBn,
        description,
        descriptionEn,
        descriptionBn,
        vendorId,
        categoryId,
        bundleType,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
        isActive,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        maxQuantity,
        minQuantity,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(productBundles).values(newBundle);

      // Create bundle items
      const bundleItems = items.map((item: any, index: number) => ({
        id: crypto.randomUUID(),
        bundleId,
        productId: item.productId,
        quantity: item.quantity || 1,
        isRequired: item.isRequired !== false,
        discountPercentage: item.discountPercentage || 0,
        sortOrder: item.sortOrder || index,
        createdAt: new Date()
      }));

      await db.insert(productBundleItems).values(bundleItems);

      // Create bundle pricing
      if (pricing) {
        const bundlePricing = {
          id: crypto.randomUUID(),
          bundleId,
          bundlePrice: pricing.bundlePrice,
          comparePrice: pricing.comparePrice || null,
          currency: pricing.currency || 'BDT',
          discountType: pricing.discountType || 'fixed', // 'fixed', 'percentage'
          discountValue: pricing.discountValue || 0,
          isActive: true,
          effectiveFrom: new Date(),
          effectiveTo: pricing.effectiveTo ? new Date(pricing.effectiveTo) : null,
          createdAt: new Date()
        };

        await db.insert(productBundlePricing).values(bundlePricing);
      }

      // Clear relevant caches
      await this.clearBundleCaches(vendorId, categoryId);

      res.status(201).json({
        success: true,
        bundle: { id: bundleId, ...newBundle },
        message: 'Product bundle created successfully'
      });
    } catch (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product bundle'
      });
    }
  }

  /**
   * Update product bundle
   * PUT /api/v1/products/bundles/:bundleId
   */
  async updateBundle(req: Request, res: Response) {
    try {
      const { bundleId } = req.params;
      const {
        name,
        nameEn,
        nameBn,
        description,
        descriptionEn,
        descriptionBn,
        categoryId,
        bundleType,
        items,
        pricing,
        images,
        tags,
        isActive,
        validFrom,
        validTo,
        maxQuantity,
        minQuantity
      } = req.body;

      // Update bundle
      const [updatedBundle] = await db
        .update(productBundles)
        .set({
          ...(name && { name }),
          ...(nameEn && { nameEn }),
          ...(nameBn && { nameBn }),
          ...(description && { description }),
          ...(descriptionEn && { descriptionEn }),
          ...(descriptionBn && { descriptionBn }),
          ...(categoryId && { categoryId }),
          ...(bundleType && { bundleType }),
          ...(images && { images: JSON.stringify(images) }),
          ...(tags && { tags: JSON.stringify(tags) }),
          ...(isActive !== undefined && { isActive }),
          ...(validFrom && { validFrom: new Date(validFrom) }),
          ...(validTo && { validTo: new Date(validTo) }),
          ...(maxQuantity && { maxQuantity }),
          ...(minQuantity && { minQuantity }),
          updatedAt: new Date()
        })
        .where(eq(productBundles.id, bundleId))
        .returning();

      if (!updatedBundle) {
        return res.status(404).json({
          success: false,
          error: 'Bundle not found'
        });
      }

      // Update bundle items if provided
      if (items) {
        // Delete existing items
        await db
          .delete(productBundleItems)
          .where(eq(productBundleItems.bundleId, bundleId));

        // Insert new items
        if (items.length > 0) {
          const bundleItems = items.map((item: any, index: number) => ({
            id: crypto.randomUUID(),
            bundleId,
            productId: item.productId,
            quantity: item.quantity || 1,
            isRequired: item.isRequired !== false,
            discountPercentage: item.discountPercentage || 0,
            sortOrder: item.sortOrder || index,
            createdAt: new Date()
          }));

          await db.insert(productBundleItems).values(bundleItems);
        }
      }

      // Update pricing if provided
      if (pricing) {
        await db
          .update(productBundlePricing)
          .set({
            bundlePrice: pricing.bundlePrice,
            comparePrice: pricing.comparePrice,
            currency: pricing.currency || 'BDT',
            discountType: pricing.discountType,
            discountValue: pricing.discountValue,
            effectiveTo: pricing.effectiveTo ? new Date(pricing.effectiveTo) : null,
            updatedAt: new Date()
          })
          .where(eq(productBundlePricing.bundleId, bundleId));
      }

      // Clear caches
      await this.clearBundleCaches(updatedBundle.vendorId, updatedBundle.categoryId, bundleId);

      res.json({
        success: true,
        bundle: updatedBundle,
        message: 'Bundle updated successfully'
      });
    } catch (error) {
      console.error('Error updating bundle:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update bundle'
      });
    }
  }

  /**
   * Delete product bundle
   * DELETE /api/v1/products/bundles/:bundleId
   */
  async deleteBundle(req: Request, res: Response) {
    try {
      const { bundleId } = req.params;

      // Get bundle details for cache clearing
      const bundle = await db
        .select()
        .from(productBundles)
        .where(eq(productBundles.id, bundleId))
        .limit(1);

      if (!bundle.length) {
        return res.status(404).json({
          success: false,
          error: 'Bundle not found'
        });
      }

      // Delete related data
      await Promise.all([
        db.delete(productBundleItems).where(eq(productBundleItems.bundleId, bundleId)),
        db.delete(productBundlePricing).where(eq(productBundlePricing.bundleId, bundleId))
      ]);

      // Delete bundle
      await db
        .delete(productBundles)
        .where(eq(productBundles.id, bundleId));

      // Clear caches
      await this.clearBundleCaches(bundle[0].vendorId, bundle[0].categoryId, bundleId);

      res.json({
        success: true,
        message: 'Bundle deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting bundle:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete bundle'
      });
    }
  }

  /**
   * Get bundle analytics
   * GET /api/v1/products/bundles/:bundleId/analytics
   */
  async getBundleAnalytics(req: Request, res: Response) {
    try {
      const { bundleId } = req.params;
      const { period = '30d' } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      // Get bundle sales data
      const salesData = await db
        .select({
          totalSales: count(orderItems.id),
          totalRevenue: sum(orderItems.price),
          averageOrderValue: sql<number>`AVG(${orderItems.price})`
        })
        .from(orderItems)
        .where(and(
          eq(orderItems.productId, bundleId), // Assuming bundles are treated as special products
          sql`${orderItems.createdAt} >= ${startDate}`,
          sql`${orderItems.createdAt} <= ${endDate}`
        ));

      // Get performance comparison with individual products
      const bundleItems = await db
        .select({ productId: productBundleItems.productId })
        .from(productBundleItems)
        .where(eq(productBundleItems.bundleId, bundleId));

      const individualProductSales = bundleItems.length > 0 ? await db
        .select({
          productId: orderItems.productId,
          sales: count(orderItems.id),
          revenue: sum(orderItems.price)
        })
        .from(orderItems)
        .where(and(
          inArray(orderItems.productId, bundleItems.map(item => item.productId)),
          sql`${orderItems.createdAt} >= ${startDate}`,
          sql`${orderItems.createdAt} <= ${endDate}`
        ))
        .groupBy(orderItems.productId) : [];

      const analytics = {
        bundle: {
          totalSales: salesData[0]?.totalSales || 0,
          totalRevenue: salesData[0]?.totalRevenue || 0,
          averageOrderValue: salesData[0]?.averageOrderValue || 0
        },
        individualProducts: individualProductSales,
        period,
        dateRange: { startDate, endDate }
      };

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Error getting bundle analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get bundle analytics'
      });
    }
  }

  /**
   * Get suggested bundles for a product
   * GET /api/v1/products/:productId/suggested-bundles
   */
  async getSuggestedBundles(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { limit = 10 } = req.query;

      // Get product details
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Find bundles that could include this product
      const suggestedBundles = await this.generateBundleSuggestions(
        productId, 
        product[0].categoryId, 
        product[0].vendorId,
        Number(limit)
      );

      res.json({
        success: true,
        suggestions: suggestedBundles
      });
    } catch (error) {
      console.error('Error getting suggested bundles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get suggested bundles'
      });
    }
  }

  /**
   * Check bundle availability
   * GET /api/v1/products/bundles/:bundleId/availability
   */
  async checkBundleAvailability(req: Request, res: Response) {
    try {
      const { bundleId } = req.params;
      const { quantity = 1 } = req.query;

      // Get bundle items
      const bundleItems = await db
        .select({
          bundleItem: productBundleItems,
          product: products
        })
        .from(productBundleItems)
        .leftJoin(products, eq(productBundleItems.productId, products.id))
        .where(eq(productBundleItems.bundleId, bundleId));

      if (!bundleItems.length) {
        return res.status(404).json({
          success: false,
          error: 'Bundle not found'
        });
      }

      // Check availability for each item
      const availabilityChecks = bundleItems.map(item => {
        const requiredQuantity = item.bundleItem.quantity * Number(quantity);
        const availableQuantity = parseInt(item.product?.inventory || '0');
        
        return {
          productId: item.bundleItem.productId,
          productName: item.product?.name,
          requiredQuantity,
          availableQuantity,
          isAvailable: availableQuantity >= requiredQuantity,
          shortfall: Math.max(0, requiredQuantity - availableQuantity)
        };
      });

      const isAvailable = availabilityChecks.every(check => check.isAvailable);
      const unavailableItems = availabilityChecks.filter(check => !check.isAvailable);

      res.json({
        success: true,
        availability: {
          isAvailable,
          checks: availabilityChecks,
          unavailableItems,
          canPartialFulfill: availabilityChecks.some(check => check.isAvailable)
        }
      });
    } catch (error) {
      console.error('Error checking bundle availability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check bundle availability'
      });
    }
  }

  // Helper methods

  private async clearBundleCaches(vendorId: string, categoryId?: string, bundleId?: string): Promise<void> {
    const cacheKeys = [
      'bundles:featured',
      'bundles:popular',
      `vendor_bundles:${vendorId}`,
      ...(categoryId ? [`category_bundles:${categoryId}`] : []),
      ...(bundleId ? [`bundle:${bundleId}`] : [])
    ];
    
    await Promise.all(cacheKeys.map(key => this.redisService.del(key)));
  }

  private async generateBundleSuggestions(
    productId: string, 
    categoryId: string, 
    vendorId: string, 
    limit: number
  ): Promise<any[]> {
    // Find frequently bought together products
    const frequentlyBoughtTogether = await db
      .select({
        productId: orderItems.productId,
        count: count(orderItems.id),
        product: products
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(and(
        sql`${orderItems.orderId} IN (
          SELECT DISTINCT ${orderItems.orderId} 
          FROM ${orderItems} 
          WHERE ${orderItems.productId} = ${productId}
        )`,
        sql`${orderItems.productId} != ${productId}`,
        eq(products.vendorId, vendorId),
        eq(products.isActive, true)
      ))
      .groupBy(orderItems.productId, products.id)
      .orderBy(desc(count(orderItems.id)))
      .limit(limit);

    // Generate bundle suggestions
    const suggestions = frequentlyBoughtTogether.map(item => ({
      productId: item.productId,
      product: item.product,
      frequency: item.count,
      suggestedDiscount: this.calculateSuggestedDiscount(item.count),
      bundleType: 'frequently_bought_together'
    }));

    return suggestions;
  }

  private calculateSuggestedDiscount(frequency: number): number {
    // Calculate discount based on frequency
    if (frequency >= 50) return 15; // 15% discount for highly frequent combinations
    if (frequency >= 20) return 10; // 10% discount for moderately frequent
    if (frequency >= 10) return 5;  // 5% discount for less frequent
    return 0; // No discount for rare combinations
  }

  /**
   * Health check
   */
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'bundle-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}