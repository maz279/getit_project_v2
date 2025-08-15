import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  products, 
  productCategories, 
  productVariants, 
  productImages, 
  productReviews,
  vendors,
  type Product,
  type ProductCategory,
  type ProductVariant
} from '@shared/schema';
import { eq, and, desc, asc, count, sum, avg, sql, like, inArray } from 'drizzle-orm';

/**
 * Enhanced Product Management Controller
 * Amazon.com/Shopee.sg-Level Product Management System
 * 
 * Features:
 * - Bulk product operations (upload, edit, delete)
 * - Advanced categorization and attributes
 * - Variant management (size, color, etc.)
 * - Digital asset management
 * - SEO optimization
 * - Inventory synchronization
 * - Pricing strategies
 * - Product performance analytics
 */
export class EnhancedProductManagementController {
  
  /**
   * Get comprehensive product dashboard
   * Amazon.com-style product overview with key metrics
   */
  async getProductDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { period = '30d' } = req.query;
      
      // Get product overview statistics
      const [productStats] = await db
        .select({
          totalProducts: count(products.id),
          activeProducts: count(sql`CASE WHEN ${products.isActive} = true THEN 1 END`),
          outOfStock: count(sql`CASE WHEN ${products.inventory} <= 0 THEN 1 END`),
          lowStock: count(sql`CASE WHEN ${products.inventory} <= ${products.lowStockThreshold} THEN 1 END`),
          avgPrice: avg(products.price),
          totalValue: sum(sql`${products.price} * ${products.inventory}`),
          avgRating: avg(products.rating),
          totalReviews: sum(products.reviewCount)
        })
        .from(products)
        .where(eq(products.vendorId, parseInt(vendorId)));

      // Get top performing products
      const topProducts = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          inventory: products.inventory,
          rating: products.rating,
          reviewCount: products.reviewCount,
          salesCount: products.salesCount,
          revenue: sql`${products.price} * ${products.salesCount}`,
          image: products.mainImage
        })
        .from(products)
        .where(eq(products.vendorId, parseInt(vendorId)))
        .orderBy(desc(products.salesCount))
        .limit(10);

      // Get category performance
      const categoryPerformance = await db
        .select({
          categoryId: products.categoryId,
          categoryName: productCategories.name,
          productCount: count(products.id),
          avgPrice: avg(products.price),
          totalRevenue: sum(sql`${products.price} * ${products.salesCount}`),
          avgRating: avg(products.rating)
        })
        .from(products)
        .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
        .where(eq(products.vendorId, parseInt(vendorId)))
        .groupBy(products.categoryId, productCategories.name)
        .orderBy(desc(sum(sql`${products.price} * ${products.salesCount}`)));

      // Get recent product activities
      const recentProducts = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          status: products.status,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          image: products.mainImage
        })
        .from(products)
        .where(eq(products.vendorId, parseInt(vendorId)))
        .orderBy(desc(products.updatedAt))
        .limit(20);

      res.json({
        success: true,
        data: {
          overview: productStats,
          topProducts,
          categoryPerformance,
          recentProducts,
          insights: {
            stockAlerts: productStats.lowStock + productStats.outOfStock,
            averageMargin: ((productStats.avgPrice || 0) * 0.3).toFixed(2),
            performanceGrade: this.calculatePerformanceGrade(productStats),
            recommendations: this.generateRecommendations(productStats, topProducts)
          }
        }
      });
    } catch (error) {
      console.error('Product dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product dashboard'
      });
    }
  }

  /**
   * Bulk product upload with validation
   * Shopee-style bulk product operations
   */
  async bulkUploadProducts(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { products: productData, validateOnly = false } = req.body;
      
      if (!Array.isArray(productData) || productData.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Product data must be a non-empty array'
        });
        return;
      }

      // Validate each product
      const validationResults = await Promise.all(
        productData.map(async (product, index) => {
          const validation = await this.validateProduct(product, vendorId);
          return {
            index,
            product,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
          };
        })
      );

      const validProducts = validationResults.filter(r => r.isValid);
      const invalidProducts = validationResults.filter(r => !r.isValid);

      if (validateOnly) {
        res.json({
          success: true,
          data: {
            totalProducts: productData.length,
            validProducts: validProducts.length,
            invalidProducts: invalidProducts.length,
            validationResults
          }
        });
        return;
      }

      // Process valid products
      const uploadResults = [];
      for (const validProduct of validProducts) {
        try {
          const [newProduct] = await db.insert(products).values({
            vendorId: parseInt(vendorId),
            name: validProduct.product.name,
            description: validProduct.product.description,
            price: validProduct.product.price,
            comparePrice: validProduct.product.comparePrice,
            costPrice: validProduct.product.costPrice,
            inventory: validProduct.product.inventory,
            sku: validProduct.product.sku,
            categoryId: validProduct.product.categoryId,
            brand: validProduct.product.brand,
            tags: validProduct.product.tags,
            weight: validProduct.product.weight,
            dimensions: validProduct.product.dimensions,
            isActive: validProduct.product.isActive ?? true,
            seoTitle: validProduct.product.seoTitle,
            seoDescription: validProduct.product.seoDescription,
            seoKeywords: validProduct.product.seoKeywords,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();

          // Handle product images
          if (validProduct.product.images && validProduct.product.images.length > 0) {
            await this.uploadProductImages(newProduct.id, validProduct.product.images);
          }

          // Handle product variants
          if (validProduct.product.variants && validProduct.product.variants.length > 0) {
            await this.createProductVariants(newProduct.id, validProduct.product.variants);
          }

          uploadResults.push({
            index: validProduct.index,
            success: true,
            productId: newProduct.id,
            message: 'Product uploaded successfully'
          });
        } catch (error) {
          uploadResults.push({
            index: validProduct.index,
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          });
        }
      }

      res.json({
        success: true,
        data: {
          totalProducts: productData.length,
          uploadedProducts: uploadResults.filter(r => r.success).length,
          failedProducts: uploadResults.filter(r => !r.success).length,
          invalidProducts: invalidProducts.length,
          results: uploadResults,
          validationResults
        }
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process bulk upload'
      });
    }
  }

  /**
   * Advanced product search and filtering
   * Amazon-style product management with filters
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const {
        q = '',
        category,
        status,
        priceMin,
        priceMax,
        inventoryMin,
        inventoryMax,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      let query = db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        comparePrice: products.comparePrice,
        inventory: products.inventory,
        sku: products.sku,
        status: products.status,
        isActive: products.isActive,
        rating: products.rating,
        reviewCount: products.reviewCount,
        salesCount: products.salesCount,
        mainImage: products.mainImage,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: productCategories.name
      })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(eq(products.vendorId, parseInt(vendorId)));

      // Apply filters
      const conditions = [eq(products.vendorId, parseInt(vendorId))];

      if (q) {
        conditions.push(
          sql`${products.name} ILIKE ${`%${q}%`} OR ${products.description} ILIKE ${`%${q}%`} OR ${products.sku} ILIKE ${`%${q}%`}`
        );
      }

      if (category) {
        conditions.push(eq(products.categoryId, parseInt(category as string)));
      }

      if (status) {
        conditions.push(eq(products.status, status as string));
      }

      if (priceMin) {
        conditions.push(sql`${products.price} >= ${parseFloat(priceMin as string)}`);
      }

      if (priceMax) {
        conditions.push(sql`${products.price} <= ${parseFloat(priceMax as string)}`);
      }

      if (inventoryMin) {
        conditions.push(sql`${products.inventory} >= ${parseInt(inventoryMin as string)}`);
      }

      if (inventoryMax) {
        conditions.push(sql`${products.inventory} <= ${parseInt(inventoryMax as string)}`);
      }

      // Apply sorting
      const orderBy = sortOrder === 'desc' ? desc : asc;
      let sortColumn;
      switch (sortBy) {
        case 'name':
          sortColumn = products.name;
          break;
        case 'price':
          sortColumn = products.price;
          break;
        case 'inventory':
          sortColumn = products.inventory;
          break;
        case 'rating':
          sortColumn = products.rating;
          break;
        case 'salesCount':
          sortColumn = products.salesCount;
          break;
        default:
          sortColumn = products.updatedAt;
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const results = await query
        .where(and(...conditions))
        .orderBy(orderBy(sortColumn))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get total count
      const [totalCount] = await db
        .select({ count: count() })
        .from(products)
        .where(and(...conditions));

      res.json({
        success: true,
        data: {
          products: results,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / parseInt(limit as string))
          },
          filters: {
            query: q,
            category,
            status,
            priceRange: [priceMin, priceMax],
            inventoryRange: [inventoryMin, inventoryMax],
            sortBy,
            sortOrder
          }
        }
      });
    } catch (error) {
      console.error('Product search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products'
      });
    }
  }

  /**
   * Product performance analytics
   * Shopee-style business insights
   */
  async getProductAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { period = '30d', productIds } = req.query;
      
      let productFilter = eq(products.vendorId, parseInt(vendorId));
      if (productIds) {
        const ids = (productIds as string).split(',').map(id => parseInt(id));
        productFilter = and(
          eq(products.vendorId, parseInt(vendorId)),
          inArray(products.id, ids)
        );
      }

      // Get product performance metrics
      const analytics = await db
        .select({
          id: products.id,
          name: products.name,
          revenue: sql`${products.price} * ${products.salesCount}`,
          profit: sql`(${products.price} - ${products.costPrice}) * ${products.salesCount}`,
          margin: sql`((${products.price} - ${products.costPrice}) / ${products.price}) * 100`,
          conversionRate: sql`(${products.salesCount} / NULLIF(${products.viewCount}, 0)) * 100`,
          avgOrderValue: products.price,
          returnRate: sql`(${products.returnCount} / NULLIF(${products.salesCount}, 0)) * 100`,
          stockTurnover: sql`${products.salesCount} / NULLIF(${products.inventory}, 0)`,
          rating: products.rating,
          reviewCount: products.reviewCount,
          viewCount: products.viewCount,
          salesCount: products.salesCount,
          favoriteCount: products.favoriteCount
        })
        .from(products)
        .where(productFilter)
        .orderBy(desc(sql`${products.price} * ${products.salesCount}`));

      // Calculate insights
      const insights = this.calculateProductInsights(analytics);

      res.json({
        success: true,
        data: {
          analytics,
          insights,
          summary: {
            totalRevenue: analytics.reduce((sum, p) => sum + (parseFloat(p.revenue as string) || 0), 0),
            totalProfit: analytics.reduce((sum, p) => sum + (parseFloat(p.profit as string) || 0), 0),
            avgMargin: analytics.reduce((sum, p) => sum + (parseFloat(p.margin as string) || 0), 0) / analytics.length,
            avgConversionRate: analytics.reduce((sum, p) => sum + (parseFloat(p.conversionRate as string) || 0), 0) / analytics.length,
            topPerformers: analytics.slice(0, 5),
            needsAttention: analytics.filter(p => parseFloat(p.conversionRate as string) < 2 || parseFloat(p.margin as string) < 10)
          }
        }
      });
    } catch (error) {
      console.error('Product analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product analytics'
      });
    }
  }

  /**
   * SEO optimization suggestions
   * Amazon-style SEO recommendations
   */
  async getSEOSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { productId } = req.query;

      let productFilter = eq(products.vendorId, parseInt(vendorId));
      if (productId) {
        productFilter = and(
          eq(products.vendorId, parseInt(vendorId)),
          eq(products.id, parseInt(productId as string))
        );
      }

      const productsData = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          seoTitle: products.seoTitle,
          seoDescription: products.seoDescription,
          seoKeywords: products.seoKeywords,
          tags: products.tags,
          rating: products.rating,
          reviewCount: products.reviewCount,
          salesCount: products.salesCount
        })
        .from(products)
        .where(productFilter);

      const suggestions = productsData.map(product => ({
        productId: product.id,
        productName: product.name,
        seoScore: this.calculateSEOScore(product),
        suggestions: this.generateSEOSuggestions(product),
        opportunities: this.identifySEOOpportunities(product)
      }));

      res.json({
        success: true,
        data: {
          suggestions,
          summary: {
            avgSEOScore: suggestions.reduce((sum, s) => sum + s.seoScore, 0) / suggestions.length,
            needsImprovement: suggestions.filter(s => s.seoScore < 70).length,
            wellOptimized: suggestions.filter(s => s.seoScore >= 80).length
          }
        }
      });
    } catch (error) {
      console.error('SEO suggestions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate SEO suggestions'
      });
    }
  }

  // Helper methods
  private async validateProduct(product: any, vendorId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!product.name || product.name.length < 3) {
      errors.push('Product name must be at least 3 characters long');
    }

    if (!product.price || product.price <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (!product.inventory || product.inventory < 0) {
      errors.push('Product inventory must be 0 or greater');
    }

    if (!product.categoryId) {
      errors.push('Product category is required');
    }

    // SKU uniqueness check
    if (product.sku) {
      const existingSKU = await db
        .select()
        .from(products)
        .where(and(
          eq(products.vendorId, parseInt(vendorId)),
          eq(products.sku, product.sku)
        ))
        .limit(1);

      if (existingSKU.length > 0) {
        errors.push('SKU already exists for this vendor');
      }
    }

    // Warnings
    if (!product.description || product.description.length < 50) {
      warnings.push('Product description should be at least 50 characters for better SEO');
    }

    if (!product.images || product.images.length === 0) {
      warnings.push('Product should have at least one image');
    }

    if (!product.seoTitle || !product.seoDescription) {
      warnings.push('SEO title and description recommended for better search visibility');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async uploadProductImages(productId: number, images: string[]): Promise<void> {
    const imageData = images.map((imageUrl, index) => ({
      productId,
      imageUrl,
      altText: `Product image ${index + 1}`,
      sortOrder: index,
      createdAt: new Date()
    }));

    await db.insert(productImages).values(imageData);
  }

  private async createProductVariants(productId: number, variants: any[]): Promise<void> {
    const variantData = variants.map(variant => ({
      productId,
      name: variant.name,
      value: variant.value,
      price: variant.price,
      inventory: variant.inventory,
      sku: variant.sku,
      isActive: variant.isActive ?? true,
      createdAt: new Date()
    }));

    await db.insert(productVariants).values(variantData);
  }

  private calculatePerformanceGrade(stats: any): string {
    let score = 0;
    
    // Active products ratio
    const activeRatio = stats.activeProducts / stats.totalProducts;
    if (activeRatio > 0.8) score += 25;
    else if (activeRatio > 0.6) score += 15;
    else if (activeRatio > 0.4) score += 10;

    // Stock management
    const stockRatio = (stats.totalProducts - stats.outOfStock) / stats.totalProducts;
    if (stockRatio > 0.9) score += 25;
    else if (stockRatio > 0.7) score += 15;
    else if (stockRatio > 0.5) score += 10;

    // Average rating
    if (stats.avgRating > 4.5) score += 25;
    else if (stats.avgRating > 4.0) score += 15;
    else if (stats.avgRating > 3.5) score += 10;

    // Review count
    if (stats.totalReviews > 100) score += 25;
    else if (stats.totalReviews > 50) score += 15;
    else if (stats.totalReviews > 10) score += 10;

    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  }

  private generateRecommendations(stats: any, topProducts: any[]): string[] {
    const recommendations = [];

    if (stats.outOfStock > 0) {
      recommendations.push(`Restock ${stats.outOfStock} out-of-stock products immediately`);
    }

    if (stats.lowStock > 0) {
      recommendations.push(`Review inventory for ${stats.lowStock} low-stock products`);
    }

    if (stats.avgRating < 4.0) {
      recommendations.push('Focus on improving product quality and customer service');
    }

    if (topProducts.length > 0 && topProducts[0].salesCount < 10) {
      recommendations.push('Consider marketing campaigns to boost product visibility');
    }

    return recommendations;
  }

  private calculateProductInsights(analytics: any[]): any {
    return {
      topPerformers: analytics.slice(0, 5),
      underperformers: analytics.filter(p => parseFloat(p.conversionRate as string) < 2),
      highMarginProducts: analytics.filter(p => parseFloat(p.margin as string) > 50),
      fastMovingProducts: analytics.filter(p => parseFloat(p.stockTurnover as string) > 5),
      needsAttention: analytics.filter(p => 
        parseFloat(p.returnRate as string) > 10 || 
        parseFloat(p.conversionRate as string) < 1
      )
    };
  }

  private calculateSEOScore(product: any): number {
    let score = 0;
    
    // Title optimization
    if (product.seoTitle && product.seoTitle.length >= 30 && product.seoTitle.length <= 60) {
      score += 20;
    }
    
    // Description optimization
    if (product.seoDescription && product.seoDescription.length >= 120 && product.seoDescription.length <= 160) {
      score += 20;
    }
    
    // Keywords
    if (product.seoKeywords && product.seoKeywords.length > 0) {
      score += 15;
    }
    
    // Tags
    if (product.tags && product.tags.length >= 3) {
      score += 15;
    }
    
    // Social proof
    if (product.reviewCount > 10 && product.rating > 4.0) {
      score += 15;
    }
    
    // Sales performance
    if (product.salesCount > 50) {
      score += 15;
    }
    
    return score;
  }

  private generateSEOSuggestions(product: any): string[] {
    const suggestions = [];
    
    if (!product.seoTitle || product.seoTitle.length < 30) {
      suggestions.push('Add SEO title (30-60 characters)');
    }
    
    if (!product.seoDescription || product.seoDescription.length < 120) {
      suggestions.push('Add SEO description (120-160 characters)');
    }
    
    if (!product.seoKeywords || product.seoKeywords.length === 0) {
      suggestions.push('Add relevant keywords');
    }
    
    if (!product.tags || product.tags.length < 3) {
      suggestions.push('Add at least 3 relevant tags');
    }
    
    return suggestions;
  }

  private identifySEOOpportunities(product: any): string[] {
    const opportunities = [];
    
    if (product.salesCount > 100 && product.reviewCount < 20) {
      opportunities.push('Request more customer reviews');
    }
    
    if (product.rating > 4.5 && product.salesCount < 50) {
      opportunities.push('Increase marketing efforts for high-rated product');
    }
    
    return opportunities;
  }
}

export default EnhancedProductManagementController;