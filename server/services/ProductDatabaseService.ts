/**
 * Product Database Service
 * 
 * Manages authentic product data population and search functionality.
 * Ensures data integrity by only working with authentic product information.
 */

import { DatabaseStorage } from '../storage';
import { authenticBangladeshProducts, findRelevantCategories, categoryKeywords } from '../data/authentic-products';
import type { Product, InsertProduct } from '@shared/schema';

export class ProductDatabaseService {
  private storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  /**
   * Initialize the product database with authentic Bangladesh products
   */
  async initializeDatabase(): Promise<void> {
    try {
      console.log('🔄 Initializing authentic product database...');
      
      // Check if products already exist
      const existingProducts = await this.storage.getProducts(5);
      if (existingProducts.length > 0) {
        console.log(`✅ Database already contains ${existingProducts.length} products`);
        return;
      }

      // Create categories first and get their IDs
      const categoryMap = new Map<string, string>();
      const uniqueCategories = [...new Set(authenticBangladeshProducts.map(p => p.category))];
      
      for (const categoryName of uniqueCategories) {
        try {
          const category = await this.storage.createCategory({
            name: categoryName,
            nameBn: `${categoryName}`, // Will add Bengali translations later
            slug: categoryName.toLowerCase().replace(/\s+/g, '-')
          });
          categoryMap.set(categoryName, category.id);
          console.log(`✅ Created category: ${categoryName} (ID: ${category.id})`);
        } catch (error) {
          console.warn(`⚠️ Category may already exist: ${categoryName}`);
          // Try to find existing category
          const categories = await this.storage.getCategories();
          const existingCategory = categories.find(c => c.name === categoryName);
          if (existingCategory) {
            categoryMap.set(categoryName, existingCategory.id);
            console.log(`✅ Found existing category: ${categoryName} (ID: ${existingCategory.id})`);
          }
        }
      }

      // Insert authentic products with correct structure for actual database
      let insertedCount = 0;
      for (const productData of authenticBangladeshProducts) {
        try {
          const categoryId = categoryMap.get(productData.category);
          if (!categoryId) {
            console.error(`❌ No category ID found for: ${productData.category}`);
            continue;
          }

          // Create product using actual database structure 
          const productToInsert = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            categoryId: categoryId,
            vendorId: null, // We'll set this later when we have vendors
            inventory: 100, // Default inventory (matches DB column name)
            isActive: true,
            isFeatured: false,
            status: 'active' as const,
            brand: 'Generic', // Default values for required fields
            origin: 'Bangladesh'
          };

          const insertedProduct = await this.storage.createProduct(productToInsert);
          insertedCount++;
          console.log(`✅ Inserted: ${productData.name} → Category: ${productData.category}`);
        } catch (error) {
          console.error(`❌ Failed to insert product: ${productData.name}`, error);
        }
      }

      console.log(`✅ Successfully initialized database with ${insertedCount} authentic products`);
      console.log(`📊 Categories available: ${categoryMap.size}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize product database:', error);
      throw error;
    }
  }

  /**
   * Search products using authentic database with intelligent filtering
   */
  async searchProducts(query: string, options: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    products: Product[];
    total: number;
    categories: string[];
    priceRange: { min: number; max: number };
    searchMetadata: {
      query: string;
      matchedKeywords: string[];
      suggestedCategories: string[];
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 AUTHENTIC PRODUCT SEARCH: "${query}"`);
      
      // Get all products for comprehensive search
      const allProducts = await this.storage.getProducts();
      
      if (allProducts.length === 0) {
        return {
          products: [],
          total: 0,
          categories: [],
          priceRange: { min: 0, max: 0 },
          searchMetadata: {
            query,
            matchedKeywords: [],
            suggestedCategories: [],
            processingTime: Date.now() - startTime
          }
        };
      }

      // Filter products based on search query
      const lowerQuery = query.toLowerCase();
      const searchWords = lowerQuery.split(' ').filter(word => word.length > 1);
      
      const filteredProducts = allProducts.filter(product => {
        // Search in name, description, and category
        const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        
        // Check if any search word matches
        return searchWords.some(word => searchableText.includes(word));
      });

      // Apply additional filters
      let finalProducts = filteredProducts;
      
      if (options.category) {
        finalProducts = finalProducts.filter(p => p.category === options.category);
      }
      
      if (options.minPrice !== undefined) {
        finalProducts = finalProducts.filter(p => p.price >= options.minPrice!);
      }
      
      if (options.maxPrice !== undefined) {
        finalProducts = finalProducts.filter(p => p.price <= options.maxPrice!);
      }

      // Sort by relevance (exact matches first, then partial matches)
      finalProducts.sort((a, b) => {
        const aExact = a.name.toLowerCase().includes(lowerQuery);
        const bExact = b.name.toLowerCase().includes(lowerQuery);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Secondary sort by price (ascending)
        return a.price - b.price;
      });

      // Apply pagination
      const { limit = 20, offset = 0 } = options;
      const paginatedProducts = finalProducts.slice(offset, offset + limit);

      // Calculate metadata
      const categories = [...new Set(finalProducts.map(p => p.category).filter((cat): cat is string => Boolean(cat)))];
      const prices = finalProducts.map(p => p.price);
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      };

      // Find matched keywords and suggest categories
      const matchedKeywords: string[] = [];
      const suggestedCategories = findRelevantCategories(query);
      
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
          if (lowerQuery.includes(keyword)) {
            matchedKeywords.push(keyword);
          }
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Found ${finalProducts.length} products in ${processingTime}ms`);

      return {
        products: paginatedProducts,
        total: finalProducts.length,
        categories,
        priceRange,
        searchMetadata: {
          query,
          matchedKeywords: [...new Set(matchedKeywords)],
          suggestedCategories,
          processingTime
        }
      };

    } catch (error) {
      console.error('❌ Product search error:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, limit: number = 20): Promise<Product[]> {
    try {
      return await this.storage.getProductsByCategory(category);
    } catch (error) {
      console.error(`❌ Error getting products by category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get featured products (top-rated or newest)
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const products = await this.storage.getProducts(limit);
      // For now, return products sorted by price (could be enhanced with ratings later)
      return products.sort((a, b) => b.price - a.price).slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting featured products:', error);
      return [];
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<{
    totalProducts: number;
    categories: string[];
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    try {
      const products = await this.storage.getProducts();
      const categories = [...new Set(products.map(p => p.category).filter((cat): cat is string => Boolean(cat)))];
      const prices = products.map(p => p.price);
      
      return {
        totalProducts: products.length,
        categories,
        averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0
        }
      };
    } catch (error) {
      console.error('❌ Error getting product stats:', error);
      return {
        totalProducts: 0,
        categories: [],
        averagePrice: 0,
        priceRange: { min: 0, max: 0 }
      };
    }
  }
}

// Export singleton instance
export const productDatabaseService = new ProductDatabaseService();