/**
 * Simplified ProductService - Working Version
 * Uses correct database schema and Redis methods
 */

import { Request, Response, NextFunction, Express } from 'express';
import { db } from '../../db.js';
import { products, categories, vendors } from '@shared/schema';
import { eq, desc, ilike, and, gte, lte } from 'drizzle-orm';
import { RedisService } from '../../services/RedisService';

export class ProductServiceSimplified {
  private serviceName = 'product-service-simplified';
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Register product routes
   */
  public registerRoutes(app: Express): void {
    // Health check
    app.get('/api/v1/products/health', this.getHealth);
    
    // Search routes (must be before parametric routes)
    app.get('/api/v1/products/search', this.searchProducts);
    app.get('/api/v1/products/featured', this.getFeaturedProducts);
    
    // Product routes
    app.get('/api/v1/products', this.getAllProducts);
    app.get('/api/v1/products/:id', this.getProductById);
    app.post('/api/v1/products', this.createProduct);
    app.put('/api/v1/products/:id', this.updateProduct);
    app.delete('/api/v1/products/:id', this.deleteProduct);
  }

  /**
   * Health check endpoint
   */
  private getHealth = async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      service: this.serviceName,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Get all products with pagination
   */
  private getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, category, minPrice, maxPrice } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Build query conditions
      let whereConditions = [eq(products.isActive, true)];
      
      if (category) {
        whereConditions.push(eq(products.categoryId, category as string));
      }
      
      if (minPrice) {
        whereConditions.push(gte(products.price, minPrice as string));
      }
      
      if (maxPrice) {
        whereConditions.push(lte(products.price, maxPrice as string));
      }

      const productList = await db
        .select()
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(...whereConditions))
        .orderBy(desc(products.createdAt))
        .limit(Number(limit))
        .offset(offset);

      res.json({
        success: true,
        products: productList,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: productList.length === Number(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  };

  /**
   * Get product by ID
   */
  private getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check cache first
      const cached = await this.redisService.getCachedProduct(id);
      if (cached) {
        return res.json({
          success: true,
          product: cached,
          fromCache: true
        });
      }

      const [product] = await db
        .select()
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(eq(products.id, id));

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Cache the result
      await this.redisService.cacheProduct(id, product, 600);

      res.json({
        success: true,
        product: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }
  };

  /**
   * Create new product
   */
  private createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productData = req.body;

      const [newProduct] = await db
        .insert(products)
        .values(productData)
        .returning();

      res.status(201).json({
        success: true,
        product: newProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product'
      });
    }
  };

  /**
   * Update product
   */
  private updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const [updatedProduct] = await db
        .update(products)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product'
      });
    }
  };

  /**
   * Delete product (soft delete)
   */
  private deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [deletedProduct] = await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product'
      });
    }
  };

  /**
   * Search products
   */
  private searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      
      const offset = (Number(page) - 1) * Number(limit);

      const searchResults = await db
        .select()
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(
          and(
            eq(products.isActive, true),
            ilike(products.name, `%${query}%`)
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(Number(limit))
        .offset(offset);

      res.json({
        success: true,
        query,
        products: searchResults,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: searchResults.length === Number(limit)
        }
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products'
      });
    }
  };

  /**
   * Get featured products
   */
  private getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;

      const featuredProducts = await db
        .select()
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(
          and(
            eq(products.isActive, true),
            eq(products.isFeatured, true)
          )
        )
        .orderBy(desc(products.rating))
        .limit(Number(limit));

      res.json({
        success: true,
        products: featuredProducts
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured products'
      });
    }
  };
}

export const productServiceSimplified = new ProductServiceSimplified();