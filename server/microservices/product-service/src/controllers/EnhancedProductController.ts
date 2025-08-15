/**
 * Enhanced Product Controller - Amazon.com/Shopee.sg Level
 * Complete product management with advanced features
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  products, categories, vendors
} from '@shared/schema';
import { eq, desc, asc, ilike, and, gte, lte, or, count, sql, avg } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';
import { ProductSearchService } from '../services/ProductSearchService';

// Type definitions for enhanced product controller
interface ProductSearchResult {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    vendorId: string;
  };
  vendor?: any;
  category?: any;
}

interface EnhancementOptions {
  includeVariants?: boolean;
  includeImages?: boolean;
  includeAnalytics?: boolean;
}

interface EnhancedProduct extends ProductSearchResult {
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  analytics?: ProductAnalytics;
}

interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
}

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  sortOrder: number;
  isActive: boolean;
}

interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: Date;
}

interface ProductAnalytics {
  views: number;
  sales: number;
  conversionRate: number;
}

export class EnhancedProductController {
  private redisService: RedisService;
  private searchService: ProductSearchService;

  constructor() {
    this.redisService = new RedisService();
    this.searchService = new ProductSearchService();
  }

  /**
   * Get all products with advanced filtering and sorting
   * GET /api/v1/products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        vendor, 
        search,
        minPrice,
        maxPrice,
        rating,
        inStock,
        brand,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeVariants = false,
        includeImages = false,
        includeAnalytics = false
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Use search service if search query provided
      if (search) {
        const searchResults = await this.searchService.searchProducts(
          search as string,
          {
            category: category as string,
            vendor: vendor as string,
            priceMin: minPrice ? Number(minPrice) : undefined,
            priceMax: maxPrice ? Number(maxPrice) : undefined,
            rating: rating ? Number(rating) : undefined,
            inStock: inStock === 'true',
            brand: brand as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as 'asc' | 'desc'
          },
          Number(page),
          Number(limit)
        );

        return res.json({
          success: true,
          ...searchResults
        });
      }

      // Build query conditions for regular listing
      let whereConditions = [eq(products.isActive, true)];
      
      if (category) {
        whereConditions.push(eq(products.categoryId, category as string));
      }
      
      if (vendor) {
        whereConditions.push(eq(products.vendorId, vendor as string));
      }
      
      if (minPrice) {
        whereConditions.push(gte(products.price, minPrice as string));
      }
      
      if (maxPrice) {
        whereConditions.push(lte(products.price, maxPrice as string));
      }

      if (inStock === 'true') {
        whereConditions.push(gte(products.inventory, '1'));
      }

      if (brand) {
        whereConditions.push(eq(products.brand, brand as string));
      }

      if (rating) {
        whereConditions.push(gte(products.averageRating, rating as string));
      }

      // Build main query
      let query = db
        .select({
          product: products,
          category: categories,
          vendor: vendors
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(...whereConditions));

      // Apply sorting
      switch (sortBy) {
        case 'price':
          query = query.orderBy(sortOrder === 'desc' ? desc(products.price) : asc(products.price));
          break;
        case 'rating':
          query = query.orderBy(sortOrder === 'desc' ? desc(products.averageRating) : asc(products.averageRating));
          break;
        case 'popularity':
          query = query.orderBy(desc(products.viewCount));
          break;
        case 'name':
          query = query.orderBy(sortOrder === 'desc' ? desc(products.name) : asc(products.name));
          break;
        default:
          query = query.orderBy(sortOrder === 'desc' ? desc(products.createdAt) : asc(products.createdAt));
      }

      const productList = await query.limit(Number(limit)).offset(offset);

      // Enhance products with additional data if requested
      const enhancedProducts = await this.enhanceProductsData(
        productList, 
        { includeVariants, includeImages, includeAnalytics }
      );

      // Get total count for pagination
      const totalCount = await db
        .select({ count: count() })
        .from(products)
        .where(and(...whereConditions));

      res.json({
        success: true,
        products: enhancedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / Number(limit)),
          hasMore: Number(page) < Math.ceil(totalCount[0].count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  }

  /**
   * Get product by ID with complete details
   * GET /api/v1/products/:id
   */
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        includeVariants = true, 
        includeImages = true, 
        includeReviews = true,
        includeAnalytics = false,
        userId 
      } = req.query;

      // Check cache first
      const cacheKey = `product_full:${id}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached && !userId) {
        return res.json({
          success: true,
          product: JSON.parse(cached)
        });
      }

      // Get product details
      const product = await db
        .select({
          product: products,
          category: categories,
          vendor: vendors
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(eq(products.id, id))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const productData = product[0];

      // Enhance with additional data
      const enhancedProduct = await this.enhanceProductData(productData, {
        includeVariants: includeVariants === 'true',
        includeImages: includeImages === 'true',
        includeReviews: includeReviews === 'true',
        includeAnalytics: includeAnalytics === 'true'
      });

      // Track view if user provided
      if (userId) {
        await this.trackProductView(id, userId as string);
      }

      // Cache the result for 15 minutes
      await this.redisService.setex(cacheKey, 900, JSON.stringify(enhancedProduct));

      res.json({
        success: true,
        product: enhancedProduct
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }
  }

  /**
   * Create new product with comprehensive validation
   * POST /api/v1/products
   */
  async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        nameEn,
        nameBn,
        description,
        descriptionEn,
        descriptionBn,
        categoryId,
        vendorId,
        price,
        comparePrice,
        brand,
        sku,
        inventory,
        lowStockThreshold = 5,
        images = [],
        variants = [],
        tags = [],
        specifications = {},
        seoTitle,
        seoDescription,
        seoKeywords = [],
        isActive = true,
        isFeatured = false,
        weight,
        dimensions,
        shippingClass = 'standard'
      } = req.body;

      // Validate required fields
      if (!name || !description || !categoryId || !vendorId || !price) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Validate vendor exists
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid vendor'
        });
      }

      // Validate category exists
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (!category.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category'
        });
      }

      // Generate product ID and SKU
      const productId = crypto.randomUUID();
      const generatedSku = sku || `${vendor[0].businessName?.slice(0, 3).toUpperCase()}-${productId.slice(-6)}`;

      // Create product
      const newProduct = {
        id: productId,
        name,
        nameEn,
        nameBn,
        description,
        descriptionEn,
        descriptionBn,
        categoryId,
        vendorId,
        price: price.toString(),
        comparePrice: comparePrice?.toString(),
        brand,
        sku: generatedSku,
        inventory: inventory?.toString() || '0',
        lowStockThreshold,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
        specifications: JSON.stringify(specifications),
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || description.slice(0, 160),
        seoKeywords: JSON.stringify(seoKeywords),
        status: 'pending', // Requires approval
        isActive,
        isFeatured,
        weight: weight?.toString(),
        dimensions: JSON.stringify(dimensions),
        shippingClass,
        viewCount: 0,
        averageRating: '0',
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [createdProduct] = await db
        .insert(products)
        .values(newProduct)
        .returning();

      // Create product images
      if (images.length > 0) {
        const productImages = images.map((image: any, index: number) => ({
          id: crypto.randomUUID(),
          productId,
          imageUrl: image.url,
          altText: image.altText || name,
          sortOrder: index,
          isActive: true,
          createdAt: new Date()
        }));

        await db.insert(productImages).values(productImages);
      }

      // Clear relevant caches
      await this.clearProductCaches(vendorId, categoryId);

      res.status(201).json({
        success: true,
        product: createdProduct,
        message: 'Product created successfully and submitted for approval'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product'
      });
    }
  }

  /**
   * Get featured products
   * GET /api/v1/products/featured
   */
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const { limit = 12, category } = req.query;

      const cacheKey = `featured_products:${category || 'all'}:${limit}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return res.json({
          success: true,
          products: JSON.parse(cached)
        });
      }

      let whereConditions = [
        eq(products.isActive, true),
        eq(products.isFeatured, true),
        eq(products.status, 'active')
      ];

      if (category) {
        whereConditions.push(eq(products.categoryId, category as string));
      }

      const featuredProducts = await db
        .select({
          product: products,
          category: categories,
          vendor: vendors
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(...whereConditions))
        .orderBy(desc(products.viewCount), desc(products.createdAt))
        .limit(Number(limit));

      // Cache for 30 minutes
      await this.redisService.setex(cacheKey, 1800, JSON.stringify(featuredProducts));

      res.json({
        success: true,
        products: featuredProducts
      });
    } catch (error) {
      console.error('Error getting featured products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get featured products'
      });
    }
  }

  // Helper methods
  private async enhanceProductsData(productList: ProductSearchResult[], options: EnhancementOptions): Promise<EnhancedProduct[]> {
    if (!options.includeVariants && !options.includeImages && !options.includeAnalytics) {
      return productList as EnhancedProduct[];
    }

    return Promise.all(productList.map((item: ProductSearchResult) => this.enhanceProductData(item, options)));
  }

  private async enhanceProductData(productData: ProductSearchResult, options: EnhancementOptions): Promise<EnhancedProduct> {
    const enhanced = { ...productData };

    if (options.includeImages) {
      enhanced.images = await this.getProductImages(productData.product.id);
    }

    if (options.includeVariants) {
      enhanced.variants = await this.getProductVariants(productData.product.id);
    }

    if (options.includeReviews) {
      enhanced.recentReviews = await this.getRecentReviews(productData.product.id);
    }

    if (options.includeAnalytics) {
      enhanced.analytics = await this.getProductAnalytics(productData.product.id);
    }

    return enhanced;
  }

  private async getProductImages(productId: string): Promise<ProductImage[]> {
    return await db
      .select()
      .from(productImages)
      .where(and(eq(productImages.productId, productId), eq(productImages.isActive, true)))
      .orderBy(asc(productImages.sortOrder));
  }

  private async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.sortOrder));
  }

  private async getRecentReviews(productId: string): Promise<ProductReview[]> {
    // Integration with review service would return actual reviews
    return [];
  }

  private async getProductAnalytics(productId: string): Promise<any> {
    // Mock implementation - would get from analytics service
    return {
      views: 0,
      sales: 0,
      conversionRate: 0
    };
  }

  private async trackProductView(productId: string, userId: string): Promise<void> {
    try {
      // Update view count
      await db
        .update(products)
        .set({ 
          viewCount: sql`${products.viewCount} + 1`,
          lastViewedAt: new Date()
        })
        .where(eq(products.id, productId));

      // Track user behavior
      await db.insert(userBehavior).values({
        userId,
        action: 'product_view',
        entityType: 'product',
        entityId: productId,
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  private async clearProductCaches(vendorId?: string, categoryId?: string, productId?: string): Promise<void> {
    const cacheKeys = [
      'products:featured',
      'products:popular',
      'products:latest',
      ...(vendorId ? [`vendor_products:${vendorId}`] : []),
      ...(categoryId ? [`category_products:${categoryId}`] : []),
      ...(productId ? [`product:${productId}`, `product_full:${productId}`] : [])
    ];
    
    await Promise.all(cacheKeys.map(key => this.redisService.del(key)));
  }

  /**
   * Health check
   */
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'enhanced-product-controller',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'advanced_search',
        'product_variants',
        'quality_control',
        'analytics',
        'bangladeshi_localization',
        'seo_optimization'
      ]
    });
  }
}