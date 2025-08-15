/**
 * Product Variants Controller - Amazon.com/Shopee.sg Level
 * Advanced product variant management with complex options
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  products, categories, vendors
} from '@shared/schema';
import { eq, desc, asc, and, or, inArray, sql } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

export class ProductVariantsController {
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get all variants for a product
   * GET /api/v1/products/:productId/variants
   */
  async getProductVariants(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { includeInventory = true, includeImages = true, includePricing = true } = req.query;

      // Get product variants with all related data
      let query = db
        .select({
          variant: productVariants,
          options: productVariantOptions,
          ...(includeInventory && { inventory: productVariantInventory }),
          ...(includeImages && { images: productVariantImages }),
          ...(includePricing && { pricing: productVariantPricing })
        })
        .from(productVariants)
        .leftJoin(productVariantOptions, eq(productVariants.id, productVariantOptions.variantId));

      if (includeInventory) {
        query = query.leftJoin(productVariantInventory, eq(productVariants.id, productVariantInventory.variantId));
      }

      if (includeImages) {
        query = query.leftJoin(productVariantImages, eq(productVariants.id, productVariantImages.variantId));
      }

      if (includePricing) {
        query = query.leftJoin(productVariantPricing, eq(productVariants.id, productVariantPricing.variantId));
      }

      const variantData = await query
        .where(eq(productVariants.productId, productId))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.createdAt));

      // Group variants by variant ID
      const variantsMap = new Map();
      
      variantData.forEach(row => {
        const variantId = row.variant.id;
        
        if (!variantsMap.has(variantId)) {
          variantsMap.set(variantId, {
            ...row.variant,
            options: [],
            inventory: row.inventory || null,
            images: [],
            pricing: row.pricing || null
          });
        }

        const variant = variantsMap.get(variantId);
        
        // Add option if not already added
        if (row.options && !variant.options.find((opt: any) => opt.id === row.options.id)) {
          variant.options.push(row.options);
        }

        // Add image if not already added
        if (row.images && !variant.images.find((img: any) => img.id === row.images.id)) {
          variant.images.push(row.images);
        }
      });

      const variants = Array.from(variantsMap.values());

      // Calculate variant combinations
      const variantCombinations = this.generateVariantCombinations(variants);

      res.json({
        success: true,
        variants,
        combinations: variantCombinations,
        totalVariants: variants.length
      });
    } catch (error) {
      console.error('Error getting product variants:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product variants'
      });
    }
  }

  /**
   * Create new product variant
   * POST /api/v1/products/:productId/variants
   */
  async createProductVariant(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const {
        name,
        nameEn,
        nameBn,
        type, // 'color', 'size', 'material', 'style', etc.
        options, // Array of variant options
        images = [],
        pricing,
        inventory,
        isRequired = false,
        isActive = true,
        sortOrder = 0
      } = req.body;

      // Validate product exists
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

      // Create the variant
      const [newVariant] = await db
        .insert(productVariants)
        .values({
          id: crypto.randomUUID(),
          productId,
          name,
          nameEn,
          nameBn,
          type,
          isRequired,
          isActive,
          sortOrder,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Create variant options
      if (options && options.length > 0) {
        const variantOptions = options.map((option: any, index: number) => ({
          id: crypto.randomUUID(),
          variantId: newVariant.id,
          value: option.value,
          valueEn: option.valueEn,
          valueBn: option.valueBn,
          displayName: option.displayName,
          colorCode: option.colorCode || null,
          image: option.image || null,
          priceAdjustment: option.priceAdjustment || 0,
          isActive: option.isActive !== false,
          sortOrder: option.sortOrder || index,
          createdAt: new Date()
        }));

        await db.insert(productVariantOptions).values(variantOptions);
      }

      // Create variant images if provided
      if (images.length > 0) {
        const variantImages = images.map((image: any, index: number) => ({
          id: crypto.randomUUID(),
          variantId: newVariant.id,
          imageUrl: image.url,
          altText: image.altText || '',
          sortOrder: image.sortOrder || index,
          isActive: true,
          createdAt: new Date()
        }));

        await db.insert(productVariantImages).values(variantImages);
      }

      // Create variant pricing if provided
      if (pricing) {
        await db.insert(productVariantPricing).values({
          id: crypto.randomUUID(),
          variantId: newVariant.id,
          basePrice: pricing.basePrice,
          salePrice: pricing.salePrice || null,
          comparePrice: pricing.comparePrice || null,
          currency: pricing.currency || 'BDT',
          priceAdjustment: pricing.priceAdjustment || 0,
          isActive: true,
          effectiveFrom: new Date(),
          effectiveTo: pricing.effectiveTo || null,
          createdAt: new Date()
        });
      }

      // Create variant inventory if provided
      if (inventory) {
        await db.insert(productVariantInventory).values({
          id: crypto.randomUUID(),
          variantId: newVariant.id,
          sku: inventory.sku || `${productId}-${newVariant.id.slice(-6)}`,
          quantity: inventory.quantity || 0,
          reservedQuantity: 0,
          availableQuantity: inventory.quantity || 0,
          lowStockThreshold: inventory.lowStockThreshold || 5,
          trackQuantity: inventory.trackQuantity !== false,
          allowBackorder: inventory.allowBackorder || false,
          weight: inventory.weight || null,
          dimensions: inventory.dimensions || null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Clear product cache
      const cacheKeys = [
        `product:${productId}`,
        `product_variants:${productId}`,
        `product_full:${productId}`
      ];
      
      await Promise.all(cacheKeys.map(key => this.redisService.del(key)));

      res.status(201).json({
        success: true,
        variant: newVariant,
        message: 'Product variant created successfully'
      });
    } catch (error) {
      console.error('Error creating product variant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product variant'
      });
    }
  }

  /**
   * Update product variant
   * PUT /api/v1/products/:productId/variants/:variantId
   */
  async updateProductVariant(req: Request, res: Response) {
    try {
      const { productId, variantId } = req.params;
      const {
        name,
        nameEn,
        nameBn,
        type,
        isRequired,
        isActive,
        sortOrder,
        options,
        images,
        pricing,
        inventory
      } = req.body;

      // Update variant
      const [updatedVariant] = await db
        .update(productVariants)
        .set({
          ...(name && { name }),
          ...(nameEn && { nameEn }),
          ...(nameBn && { nameBn }),
          ...(type && { type }),
          ...(isRequired !== undefined && { isRequired }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
          updatedAt: new Date()
        })
        .where(and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        ))
        .returning();

      if (!updatedVariant) {
        return res.status(404).json({
          success: false,
          error: 'Product variant not found'
        });
      }

      // Update options if provided
      if (options) {
        // Delete existing options
        await db
          .delete(productVariantOptions)
          .where(eq(productVariantOptions.variantId, variantId));

        // Insert new options
        if (options.length > 0) {
          const variantOptions = options.map((option: any, index: number) => ({
            id: crypto.randomUUID(),
            variantId,
            value: option.value,
            valueEn: option.valueEn,
            valueBn: option.valueBn,
            displayName: option.displayName,
            colorCode: option.colorCode || null,
            image: option.image || null,
            priceAdjustment: option.priceAdjustment || 0,
            isActive: option.isActive !== false,
            sortOrder: option.sortOrder || index,
            createdAt: new Date()
          }));

          await db.insert(productVariantOptions).values(variantOptions);
        }
      }

      // Update images if provided
      if (images) {
        await db
          .delete(productVariantImages)
          .where(eq(productVariantImages.variantId, variantId));

        if (images.length > 0) {
          const variantImages = images.map((image: any, index: number) => ({
            id: crypto.randomUUID(),
            variantId,
            imageUrl: image.url,
            altText: image.altText || '',
            sortOrder: image.sortOrder || index,
            isActive: true,
            createdAt: new Date()
          }));

          await db.insert(productVariantImages).values(variantImages);
        }
      }

      // Update pricing if provided
      if (pricing) {
        await db
          .update(productVariantPricing)
          .set({
            basePrice: pricing.basePrice,
            salePrice: pricing.salePrice || null,
            comparePrice: pricing.comparePrice || null,
            currency: pricing.currency || 'BDT',
            priceAdjustment: pricing.priceAdjustment || 0,
            effectiveTo: pricing.effectiveTo || null,
            updatedAt: new Date()
          })
          .where(eq(productVariantPricing.variantId, variantId));
      }

      // Update inventory if provided
      if (inventory) {
        await db
          .update(productVariantInventory)
          .set({
            sku: inventory.sku,
            quantity: inventory.quantity,
            lowStockThreshold: inventory.lowStockThreshold,
            trackQuantity: inventory.trackQuantity,
            allowBackorder: inventory.allowBackorder,
            weight: inventory.weight,
            dimensions: inventory.dimensions,
            updatedAt: new Date()
          })
          .where(eq(productVariantInventory.variantId, variantId));
      }

      // Clear caches
      const cacheKeys = [
        `product:${productId}`,
        `product_variants:${productId}`,
        `product_full:${productId}`,
        `variant:${variantId}`
      ];
      
      await Promise.all(cacheKeys.map(key => this.redisService.del(key)));

      res.json({
        success: true,
        variant: updatedVariant,
        message: 'Product variant updated successfully'
      });
    } catch (error) {
      console.error('Error updating product variant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product variant'
      });
    }
  }

  /**
   * Delete product variant
   * DELETE /api/v1/products/:productId/variants/:variantId
   */
  async deleteProductVariant(req: Request, res: Response) {
    try {
      const { productId, variantId } = req.params;

      // Delete variant and all related data (cascading)
      await Promise.all([
        db.delete(productVariantOptions).where(eq(productVariantOptions.variantId, variantId)),
        db.delete(productVariantImages).where(eq(productVariantImages.variantId, variantId)),
        db.delete(productVariantPricing).where(eq(productVariantPricing.variantId, variantId)),
        db.delete(productVariantInventory).where(eq(productVariantInventory.variantId, variantId))
      ]);

      const [deletedVariant] = await db
        .delete(productVariants)
        .where(and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        ))
        .returning();

      if (!deletedVariant) {
        return res.status(404).json({
          success: false,
          error: 'Product variant not found'
        });
      }

      // Clear caches
      const cacheKeys = [
        `product:${productId}`,
        `product_variants:${productId}`,
        `product_full:${productId}`,
        `variant:${variantId}`
      ];
      
      await Promise.all(cacheKeys.map(key => this.redisService.del(key)));

      res.json({
        success: true,
        message: 'Product variant deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product variant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product variant'
      });
    }
  }

  /**
   * Get variant pricing for all combinations
   * GET /api/v1/products/:productId/variants/pricing
   */
  async getVariantPricing(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { combinations } = req.query;

      // Get base product price
      const product = await db
        .select({ basePrice: products.price })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const basePrice = product[0].basePrice;

      // Get all variant pricing
      const variantPricing = await db
        .select({
          variantId: productVariantPricing.variantId,
          basePrice: productVariantPricing.basePrice,
          salePrice: productVariantPricing.salePrice,
          comparePrice: productVariantPricing.comparePrice,
          priceAdjustment: productVariantPricing.priceAdjustment,
          option: productVariantOptions
        })
        .from(productVariantPricing)
        .leftJoin(productVariantOptions, eq(productVariantPricing.variantId, productVariantOptions.variantId))
        .leftJoin(productVariants, eq(productVariantPricing.variantId, productVariants.id))
        .where(eq(productVariants.productId, productId));

      // Calculate pricing for all combinations
      const pricingMatrix = this.calculateVariantPricing(basePrice, variantPricing);

      res.json({
        success: true,
        basePrice,
        variantPricing: pricingMatrix
      });
    } catch (error) {
      console.error('Error getting variant pricing:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get variant pricing'
      });
    }
  }

  /**
   * Update variant inventory
   * PATCH /api/v1/products/:productId/variants/:variantId/inventory
   */
  async updateVariantInventory(req: Request, res: Response) {
    try {
      const { productId, variantId } = req.params;
      const {
        quantity,
        reservedQuantity,
        lowStockThreshold,
        trackQuantity,
        allowBackorder
      } = req.body;

      // Update inventory
      const [updatedInventory] = await db
        .update(productVariantInventory)
        .set({
          ...(quantity !== undefined && { 
            quantity,
            availableQuantity: sql`${quantity} - COALESCE(${productVariantInventory.reservedQuantity}, 0)`
          }),
          ...(reservedQuantity !== undefined && { 
            reservedQuantity,
            availableQuantity: sql`${productVariantInventory.quantity} - ${reservedQuantity}`
          }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold }),
          ...(trackQuantity !== undefined && { trackQuantity }),
          ...(allowBackorder !== undefined && { allowBackorder }),
          updatedAt: new Date()
        })
        .where(eq(productVariantInventory.variantId, variantId))
        .returning();

      if (!updatedInventory) {
        return res.status(404).json({
          success: false,
          error: 'Variant inventory not found'
        });
      }

      // Clear caches
      await this.redisService.del(`variant_inventory:${variantId}`);
      await this.redisService.del(`product_variants:${productId}`);

      res.json({
        success: true,
        inventory: updatedInventory,
        message: 'Variant inventory updated successfully'
      });
    } catch (error) {
      console.error('Error updating variant inventory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update variant inventory'
      });
    }
  }

  /**
   * Get variant availability
   * GET /api/v1/products/:productId/variants/availability
   */
  async getVariantAvailability(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { variantOptions } = req.query;

      // Get availability for all variants or specific combination
      let whereClause = eq(productVariants.productId, productId);
      
      if (variantOptions) {
        const options = JSON.parse(variantOptions as string);
        // Add logic to filter by specific variant combination
      }

      const availability = await db
        .select({
          variantId: productVariants.id,
          variantName: productVariants.name,
          optionValue: productVariantOptions.value,
          quantity: productVariantInventory.quantity,
          reservedQuantity: productVariantInventory.reservedQuantity,
          availableQuantity: productVariantInventory.availableQuantity,
          trackQuantity: productVariantInventory.trackQuantity,
          allowBackorder: productVariantInventory.allowBackorder,
          isInStock: sql<boolean>`CASE 
            WHEN ${productVariantInventory.trackQuantity} = false THEN true
            WHEN ${productVariantInventory.allowBackorder} = true THEN true
            ELSE ${productVariantInventory.availableQuantity} > 0
          END`
        })
        .from(productVariants)
        .leftJoin(productVariantOptions, eq(productVariants.id, productVariantOptions.variantId))
        .leftJoin(productVariantInventory, eq(productVariants.id, productVariantInventory.variantId))
        .where(whereClause);

      // Group by variant
      const variantAvailability = availability.reduce((acc: any, item) => {
        const variantId = item.variantId;
        if (!acc[variantId]) {
          acc[variantId] = {
            variantId,
            variantName: item.variantName,
            options: [],
            inventory: {
              quantity: item.quantity,
              reservedQuantity: item.reservedQuantity,
              availableQuantity: item.availableQuantity,
              trackQuantity: item.trackQuantity,
              allowBackorder: item.allowBackorder,
              isInStock: item.isInStock
            }
          };
        }
        
        if (item.optionValue) {
          acc[variantId].options.push(item.optionValue);
        }
        
        return acc;
      }, {});

      res.json({
        success: true,
        availability: Object.values(variantAvailability)
      });
    } catch (error) {
      console.error('Error getting variant availability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get variant availability'
      });
    }
  }

  /**
   * Get variant combinations for selection
   * GET /api/v1/products/:productId/variants/combinations
   */
  async getVariantCombinations(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      // Get all variants and their options
      const variants = await db
        .select({
          variant: productVariants,
          option: productVariantOptions,
          inventory: productVariantInventory,
          pricing: productVariantPricing
        })
        .from(productVariants)
        .leftJoin(productVariantOptions, eq(productVariants.id, productVariantOptions.variantId))
        .leftJoin(productVariantInventory, eq(productVariants.id, productVariantInventory.variantId))
        .leftJoin(productVariantPricing, eq(productVariants.id, productVariantPricing.variantId))
        .where(eq(productVariants.productId, productId))
        .orderBy(asc(productVariants.sortOrder), asc(productVariantOptions.sortOrder));

      // Generate all possible combinations
      const combinations = this.generateVariantCombinations(variants);

      res.json({
        success: true,
        combinations,
        totalCombinations: combinations.length
      });
    } catch (error) {
      console.error('Error getting variant combinations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get variant combinations'
      });
    }
  }

  // Helper methods

  private generateVariantCombinations(variants: any[]): any[] {
    // Group variants by type
    const variantGroups = variants.reduce((acc: any, item) => {
      const variantId = item.variant?.id || item.id;
      if (!acc[variantId]) {
        acc[variantId] = {
          variant: item.variant || item,
          options: []
        };
      }
      if (item.option) {
        acc[variantId].options.push(item.option);
      }
      return acc;
    }, {});

    const variantTypes = Object.values(variantGroups);
    
    if (variantTypes.length === 0) return [];

    // Generate combinations using cartesian product
    return this.cartesianProduct(variantTypes.map((vt: any) => vt.options));
  }

  private cartesianProduct(arrays: any[][]): any[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0].map(item => [item]);

    const result: any[] = [];
    const [first, ...rest] = arrays;
    const restCombinations = this.cartesianProduct(rest);

    for (const firstItem of first) {
      for (const restCombination of restCombinations) {
        result.push([firstItem, ...restCombination]);
      }
    }

    return result;
  }

  private calculateVariantPricing(basePrice: number, variantPricing: any[]): any {
    const pricingMatrix: any = {};

    // Group pricing by variant combinations
    variantPricing.forEach(pricing => {
      const key = `${pricing.variantId}_${pricing.option?.value || 'default'}`;
      pricingMatrix[key] = {
        basePrice: pricing.basePrice || basePrice,
        salePrice: pricing.salePrice,
        comparePrice: pricing.comparePrice,
        adjustment: pricing.priceAdjustment || 0,
        finalPrice: (pricing.basePrice || basePrice) + (pricing.priceAdjustment || 0)
      };
    });

    return pricingMatrix;
  }

  /**
   * Health check
   */
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'product-variants-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}