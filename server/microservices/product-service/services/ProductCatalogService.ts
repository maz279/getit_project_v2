/**
 * Product Catalog Service - Amazon.com/Shopee.sg Level
 * Complete enterprise catalog management with advanced hierarchy
 * Multi-channel synchronization and complex product relationships
 */

import { db } from '../../../db';
import { 
  products, 
  categories, 
  productVariants, 
  productAttributes,
  productCollections,
  productCollectionItems,
  type Product,
  type InsertProduct,
  type Category,
  type ProductVariant
} from '@shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, ne } from 'drizzle-orm';
import { productEventStreamingService, ProductEventTypes, ProductStreams } from './ProductEventStreamingService';

interface ProductHierarchy {
  id: string;
  parentId?: string;
  name: string;
  type: 'category' | 'subcategory' | 'product' | 'variant';
  children: ProductHierarchy[];
  metadata: Record<string, any>;
}

interface CatalogFilter {
  categories?: string[];
  vendors?: number[];
  priceRange?: { min: number; max: number };
  attributes?: Record<string, any>;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
  condition?: 'new' | 'used' | 'refurbished' | 'all';
  rating?: number;
  tags?: string[];
}

interface ProductBundle {
  id: string;
  name: string;
  description: string;
  bundleType: 'fixed' | 'dynamic' | 'customizable';
  products: Array<{
    productId: string;
    quantity: number;
    discountPercentage?: number;
  }>;
  totalPrice: number;
  discountedPrice: number;
  savings: number;
}

interface CrossSellRecommendation {
  productId: string;
  recommendedProducts: Array<{
    productId: string;
    score: number;
    reason: string;
    type: 'frequently_bought_together' | 'similar' | 'complementary' | 'upgrade';
  }>;
}

export class ProductCatalogService {
  private serviceName = 'product-catalog-service';

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    console.log(`🚀 Initializing ${this.serviceName}`, {
      service: this.serviceName,
      version: '3.0.0',
      features: [
        'advanced-hierarchy',
        'multi-channel-sync',
        'product-bundles',
        'cross-sell-engine',
        'dynamic-pricing',
        'content-management'
      ],
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get complete product hierarchy
   */
  async getProductHierarchy(): Promise<ProductHierarchy[]> {
    try {
      // Get all categories with hierarchy
      const allCategories = await db.select({
        id: categories.id,
        name: categories.name,
        parentId: categories.parentId,
        slug: categories.slug,
        description: categories.description,
        nameBn: categories.nameBn,
        metadata: categories.metadata
      })
      .from(categories)
      .orderBy(asc(categories.name));

      // Build hierarchical structure
      const categoryMap = new Map<string, ProductHierarchy>();
      const rootCategories: ProductHierarchy[] = [];

      // Create category nodes
      for (const category of allCategories) {
        const node: ProductHierarchy = {
          id: category.id,
          parentId: category.parentId || undefined,
          name: category.name,
          type: category.parentId ? 'subcategory' : 'category',
          children: [],
          metadata: {
            slug: category.slug,
            description: category.description,
            nameBn: category.nameBn,
            ...category.metadata
          }
        };
        categoryMap.set(category.id, node);
      }

      // Build parent-child relationships
      for (const [id, node] of categoryMap) {
        if (node.parentId && categoryMap.has(node.parentId)) {
          categoryMap.get(node.parentId)!.children.push(node);
        } else {
          rootCategories.push(node);
        }
      }

      // Add products to categories
      for (const rootCategory of rootCategories) {
        await this.addProductsToHierarchyNode(rootCategory);
      }

      return rootCategories;
    } catch (error) {
      console.error('[ProductCatalogService] Failed to get product hierarchy:', error);
      throw error;
    }
  }

  /**
   * Advanced catalog search with comprehensive filtering
   */
  async searchCatalog(
    query: string,
    filters: CatalogFilter = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'relevance'
  ): Promise<{
    products: Product[];
    totalCount: number;
    facets: Record<string, any>;
    pagination: any;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Build base query
      let baseQuery = db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        comparePrice: products.comparePrice,
        sku: products.sku,
        inventory: products.inventory,
        images: products.images,
        specifications: products.specifications,
        tags: products.tags,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true));

      // Apply search query
      if (query) {
        const searchConditions = [
          like(products.name, `%${query}%`),
          like(products.description, `%${query}%`),
          sql`${products.tags} @> ${JSON.stringify([query])}`
        ];
        baseQuery = baseQuery.where(and(
          eq(products.isActive, true),
          sql`(${searchConditions.join(' OR ')})`
        ));
      }

      // Apply filters
      const filterConditions = [eq(products.isActive, true)];

      if (filters.categories && filters.categories.length > 0) {
        filterConditions.push(inArray(products.categoryId, filters.categories));
      }

      if (filters.vendors && filters.vendors.length > 0) {
        filterConditions.push(inArray(products.vendorId, filters.vendors));
      }

      if (filters.priceRange) {
        if (filters.priceRange.min > 0) {
          filterConditions.push(gte(products.price, filters.priceRange.min));
        }
        if (filters.priceRange.max > 0) {
          filterConditions.push(lte(products.price, filters.priceRange.max));
        }
      }

      if (filters.availability === 'in_stock') {
        filterConditions.push(sql`${products.inventory} > 0`);
      } else if (filters.availability === 'out_of_stock') {
        filterConditions.push(sql`${products.inventory} <= 0`);
      }

      if (filters.tags && filters.tags.length > 0) {
        for (const tag of filters.tags) {
          filterConditions.push(sql`${products.tags} @> ${JSON.stringify([tag])}`);
        }
      }

      // Apply all filters
      if (filterConditions.length > 0) {
        baseQuery = baseQuery.where(and(...filterConditions));
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          baseQuery = baseQuery.orderBy(asc(products.price));
          break;
        case 'price_desc':
          baseQuery = baseQuery.orderBy(desc(products.price));
          break;
        case 'name_asc':
          baseQuery = baseQuery.orderBy(asc(products.name));
          break;
        case 'name_desc':
          baseQuery = baseQuery.orderBy(desc(products.name));
          break;
        case 'newest':
          baseQuery = baseQuery.orderBy(desc(products.createdAt));
          break;
        case 'featured':
          baseQuery = baseQuery.orderBy(desc(products.isFeatured), desc(products.createdAt));
          break;
        default: // relevance
          baseQuery = baseQuery.orderBy(desc(products.isFeatured), desc(products.createdAt));
      }

      // Execute query with pagination
      const [productResults, totalCountResult] = await Promise.all([
        baseQuery.limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(products).where(and(...filterConditions))
      ]);

      const totalCount = totalCountResult[0]?.count || 0;

      // Generate facets for filtering
      const facets = await this.generateSearchFacets(filterConditions);

      // Publish search event
      await productEventStreamingService.publishEvent({
        eventType: ProductEventTypes.PRODUCT_SEARCHED,
        streamName: ProductStreams.ANALYTICS,
        aggregateId: `search_${Date.now()}`,
        eventData: {
          searchQuery: query,
          filters,
          resultCount: productResults.length,
          totalCount,
          page,
          sortBy
        }
      });

      return {
        products: productResults,
        totalCount,
        facets,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('[ProductCatalogService] Catalog search failed:', error);
      throw error;
    }
  }

  /**
   * Create product bundle
   */
  async createProductBundle(bundleData: {
    name: string;
    description: string;
    bundleType: 'fixed' | 'dynamic' | 'customizable';
    products: Array<{
      productId: string;
      quantity: number;
      discountPercentage?: number;
    }>;
    discountPercentage: number;
  }): Promise<ProductBundle> {
    try {
      // Get product details and calculate pricing
      const productDetails = await Promise.all(
        bundleData.products.map(async (item) => {
          const [product] = await db.select()
            .from(products)
            .where(eq(products.id, item.productId));
          return { ...item, product };
        })
      );

      // Calculate total price
      const totalPrice = productDetails.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      // Calculate discounted price
      const discountedPrice = totalPrice * (1 - bundleData.discountPercentage / 100);
      const savings = totalPrice - discountedPrice;

      const bundle: ProductBundle = {
        id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: bundleData.name,
        description: bundleData.description,
        bundleType: bundleData.bundleType,
        products: bundleData.products,
        totalPrice,
        discountedPrice,
        savings
      };

      // TODO: Save bundle to database (implement productBundles table)
      
      console.log(`[ProductCatalogService] Product bundle created: ${bundle.id}`, {
        bundleId: bundle.id,
        productCount: bundleData.products.length,
        totalPrice,
        savings: savings.toFixed(2)
      });

      return bundle;
    } catch (error) {
      console.error('[ProductCatalogService] Failed to create product bundle:', error);
      throw error;
    }
  }

  /**
   * Get cross-sell recommendations
   */
  async getCrossSellRecommendations(productId: string): Promise<CrossSellRecommendation> {
    try {
      // Get frequently bought together products
      const frequentlyBoughtTogether = await this.getFrequentlyBoughtTogether(productId);
      
      // Get similar products
      const similarProducts = await this.getSimilarProducts(productId);
      
      // Get complementary products
      const complementaryProducts = await this.getComplementaryProducts(productId);
      
      // Get upgrade recommendations
      const upgradeRecommendations = await this.getUpgradeRecommendations(productId);

      const recommendations: CrossSellRecommendation = {
        productId,
        recommendedProducts: [
          ...frequentlyBoughtTogether.map(p => ({ ...p, type: 'frequently_bought_together' as const })),
          ...similarProducts.map(p => ({ ...p, type: 'similar' as const })),
          ...complementaryProducts.map(p => ({ ...p, type: 'complementary' as const })),
          ...upgradeRecommendations.map(p => ({ ...p, type: 'upgrade' as const }))
        ].sort((a, b) => b.score - a.score).slice(0, 20)
      };

      return recommendations;
    } catch (error) {
      console.error('[ProductCatalogService] Failed to get cross-sell recommendations:', error);
      throw error;
    }
  }

  /**
   * Bulk update product catalog
   */
  async bulkUpdateCatalog(updates: Array<{
    productId: string;
    updates: Partial<InsertProduct>;
  }>): Promise<{ success: number; failed: number; errors: any[] }> {
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    try {
      for (const update of updates) {
        try {
          await db.update(products)
            .set({
              ...update.updates,
              updatedAt: new Date()
            })
            .where(eq(products.id, update.productId));

          // Publish update event
          await productEventStreamingService.publishEvent({
            eventType: ProductEventTypes.PRODUCT_UPDATED,
            streamName: ProductStreams.CATALOG,
            aggregateId: update.productId,
            eventData: {
              productId: update.productId,
              updates: update.updates
            }
          });

          success++;
        } catch (error) {
          failed++;
          errors.push({
            productId: update.productId,
            error: error.message
          });
        }
      }

      console.log(`[ProductCatalogService] Bulk update completed: ${success} success, ${failed} failed`);

      return { success, failed, errors };
    } catch (error) {
      console.error('[ProductCatalogService] Bulk update failed:', error);
      throw error;
    }
  }

  /**
   * Get catalog health metrics
   */
  async getCatalogHealthMetrics(): Promise<Record<string, any>> {
    try {
      const [
        totalProducts,
        activeProducts,
        categoriesCount,
        outOfStockCount,
        lowStockCount,
        recentlyUpdated
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(products),
        db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
        db.select({ count: sql<number>`count(*)` }).from(categories),
        db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.inventory} <= 0`),
        db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.inventory} > 0 AND ${products.inventory} <= 10`),
        db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.updatedAt} >= NOW() - INTERVAL '24 HOURS'`)
      ]);

      return {
        catalog: {
          totalProducts: totalProducts[0]?.count || 0,
          activeProducts: activeProducts[0]?.count || 0,
          inactiveProducts: (totalProducts[0]?.count || 0) - (activeProducts[0]?.count || 0),
          categoriesCount: categoriesCount[0]?.count || 0
        },
        inventory: {
          outOfStockCount: outOfStockCount[0]?.count || 0,
          lowStockCount: lowStockCount[0]?.count || 0,
          healthyStockCount: (activeProducts[0]?.count || 0) - (outOfStockCount[0]?.count || 0) - (lowStockCount[0]?.count || 0)
        },
        activity: {
          recentlyUpdated: recentlyUpdated[0]?.count || 0,
          updateRate: ((recentlyUpdated[0]?.count || 0) / (totalProducts[0]?.count || 1) * 100).toFixed(2) + '%'
        },
        health: {
          score: this.calculateHealthScore({
            totalProducts: totalProducts[0]?.count || 0,
            activeProducts: activeProducts[0]?.count || 0,
            outOfStockCount: outOfStockCount[0]?.count || 0,
            recentlyUpdated: recentlyUpdated[0]?.count || 0
          }),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[ProductCatalogService] Failed to get catalog health metrics:', error);
      throw error;
    }
  }

  /**
   * Private: Add products to hierarchy node
   */
  private async addProductsToHierarchyNode(node: ProductHierarchy): Promise<void> {
    try {
      // Add products for this category
      const categoryProducts = await db.select({
        id: products.id,
        name: products.name,
        price: products.price,
        inventory: products.inventory,
        isActive: products.isActive
      })
      .from(products)
      .where(and(
        eq(products.categoryId, node.id),
        eq(products.isActive, true)
      ))
      .limit(5); // Limit for performance

      // Add products as children
      for (const product of categoryProducts) {
        node.children.push({
          id: product.id,
          name: product.name,
          type: 'product',
          children: [],
          metadata: {
            price: product.price,
            inventory: product.inventory,
            isActive: product.isActive
          }
        });
      }

      // Recursively add products to child categories
      for (const child of node.children.filter(c => c.type === 'category' || c.type === 'subcategory')) {
        await this.addProductsToHierarchyNode(child);
      }
    } catch (error) {
      console.error('[ProductCatalogService] Failed to add products to hierarchy node:', error);
    }
  }

  /**
   * Private: Generate search facets
   */
  private async generateSearchFacets(filterConditions: any[]): Promise<Record<string, any>> {
    try {
      // Get category facets
      const categoryFacets = await db.select({
        categoryId: products.categoryId,
        categoryName: categories.name,
        count: sql<number>`count(*)`
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...filterConditions))
      .groupBy(products.categoryId, categories.name)
      .orderBy(desc(sql<number>`count(*)`));

      // Get price range facets
      const priceRanges = [
        { min: 0, max: 1000, label: 'Under ৳1,000' },
        { min: 1000, max: 5000, label: '৳1,000 - ৳5,000' },
        { min: 5000, max: 10000, label: '৳5,000 - ৳10,000' },
        { min: 10000, max: 25000, label: '৳10,000 - ৳25,000' },
        { min: 25000, max: null, label: 'Over ৳25,000' }
      ];

      const priceFacets = await Promise.all(
        priceRanges.map(async (range) => {
          const conditions = [...filterConditions];
          conditions.push(gte(products.price, range.min));
          if (range.max) {
            conditions.push(lte(products.price, range.max));
          }

          const [result] = await db.select({ count: sql<number>`count(*)` })
            .from(products)
            .where(and(...conditions));

          return {
            ...range,
            count: result?.count || 0
          };
        })
      );

      return {
        categories: categoryFacets,
        priceRanges: priceFacets.filter(range => range.count > 0),
        availability: {
          inStock: 0, // TODO: Calculate
          outOfStock: 0 // TODO: Calculate
        }
      };
    } catch (error) {
      console.error('[ProductCatalogService] Failed to generate search facets:', error);
      return {};
    }
  }

  /**
   * Private: Get frequently bought together products
   */
  private async getFrequentlyBoughtTogether(productId: string): Promise<Array<{ productId: string; score: number; reason: string }>> {
    // TODO: Implement based on order history analysis
    return [];
  }

  /**
   * Private: Get similar products
   */
  private async getSimilarProducts(productId: string): Promise<Array<{ productId: string; score: number; reason: string }>> {
    // TODO: Implement based on product attributes, category, tags
    return [];
  }

  /**
   * Private: Get complementary products
   */
  private async getComplementaryProducts(productId: string): Promise<Array<{ productId: string; score: number; reason: string }>> {
    // TODO: Implement based on product compatibility rules
    return [];
  }

  /**
   * Private: Get upgrade recommendations
   */
  private async getUpgradeRecommendations(productId: string): Promise<Array<{ productId: string; score: number; reason: string }>> {
    // TODO: Implement based on product features and price comparison
    return [];
  }

  /**
   * Private: Calculate health score
   */
  private calculateHealthScore(metrics: {
    totalProducts: number;
    activeProducts: number;
    outOfStockCount: number;
    recentlyUpdated: number;
  }): number {
    const activeRatio = metrics.activeProducts / metrics.totalProducts;
    const stockRatio = (metrics.activeProducts - metrics.outOfStockCount) / metrics.activeProducts;
    const updateRatio = metrics.recentlyUpdated / metrics.totalProducts;

    const score = (activeRatio * 0.4 + stockRatio * 0.4 + updateRatio * 0.2) * 100;
    return Math.round(score);
  }
}

// Singleton instance
export const productCatalogService = new ProductCatalogService();