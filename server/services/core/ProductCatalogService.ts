/**
 * Product Catalog Service - Consolidated Enterprise Service
 * Consolidates: product/, api/ProductService.js, inventory/, search/
 * 
 * Amazon.com/Shopee.sg-Level Product Management
 * Phase 2: Service Consolidation Implementation
 */

import { IStorage } from '../../storage';
import { BaseService } from '../base/BaseService';
import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  discountPrice?: number;
  currency: string;
  images: string[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  inventory: ProductInventory;
  seo: ProductSEO;
  status: 'active' | 'inactive' | 'draft';
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecification {
  name: string;
  value: string;
  category: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inventory: number;
  sku: string;
  attributes: { [key: string]: string };
}

export interface ProductInventory {
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  seo: ProductSEO;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  vendorId?: string;
  search?: string;
  status?: Product['status'];
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
  facets: ProductFacets;
}

export interface ProductFacets {
  categories: { name: string; count: number }[];
  brands: { name: string; count: number }[];
  priceRanges: { range: string; count: number }[];
  availability: { inStock: number; outOfStock: number };
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  topCategories: { category: string; count: number }[];
  topBrands: { brand: string; count: number }[];
  inventoryStatus: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  averagePrice: number;
  recentlyAdded: number;
}

/**
 * Consolidated Product Catalog Service
 * Replaces multiple scattered product services with single enterprise service
 */
export class ProductCatalogService extends BaseService {
  private storage: IStorage;
  private logger: ServiceLogger;
  private errorHandler: ErrorHandler;

  constructor(storage: IStorage) {
    super('ProductCatalogService');
    this.storage = storage;
    this.logger = new ServiceLogger('ProductCatalogService');
    this.errorHandler = new ErrorHandler('ProductCatalogService');
  }

  /**
   * Product Management Operations
   */
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Creating new product', { title: productData.title });
      
      const product: Product = {
        ...productData,
        id: this.generateProductId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate product data
      await this.validateProductData(product);

      // Store product in database
      await this.storage.createProduct(product);

      // Update search index
      await this.indexProduct(product);

      // Update inventory
      await this.updateInventoryStatus(product);

      return product;
    }, 'createProduct');
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Updating product', { productId, updates });
      
      const existingProduct = await this.storage.getProductById(productId);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      const updatedProduct = {
        ...existingProduct,
        ...updates,
        updatedAt: new Date()
      };

      // Validate updated product data
      await this.validateProductData(updatedProduct);

      // Update product in database
      await this.storage.updateProduct(productId, updatedProduct);

      // Update search index
      await this.indexProduct(updatedProduct);

      // Update inventory status
      await this.updateInventoryStatus(updatedProduct);

      return updatedProduct;
    }, 'updateProduct');
  }

  async getProduct(productId: string): Promise<Product | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching product', { productId });
      
      const product = await this.storage.getProductById(productId);
      return product;
    }, 'getProduct');
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return await this.executeOperation(async () => {
      this.logger.info('Deleting product', { productId });
      
      const product = await this.storage.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Remove from database
      await this.storage.deleteProduct(productId);

      // Remove from search index
      await this.removeFromSearchIndex(productId);

      return true;
    }, 'deleteProduct');
  }

  /**
   * Product Search Operations
   */
  async searchProducts(
    filters: ProductFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductSearchResult> {
    return await this.executeOperation(async () => {
      this.logger.info('Searching products', { filters, page, limit });
      
      const offset = (page - 1) * limit;
      
      // Search products based on filters
      const products = await this.storage.searchProducts(filters, offset, limit);
      const total = await this.storage.countProducts(filters);
      
      // Get facets for filtering
      const facets = await this.getProductFacets(filters);

      return {
        products,
        total,
        page,
        limit,
        filters,
        facets
      };
    }, 'searchProducts');
  }

  async getProductsByCategory(categoryId: string, page: number = 1, limit: number = 20): Promise<ProductSearchResult> {
    return await this.searchProducts({ category: categoryId }, page, limit);
  }

  async getProductsByBrand(brand: string, page: number = 1, limit: number = 20): Promise<ProductSearchResult> {
    return await this.searchProducts({ brand }, page, limit);
  }

  async getProductsByVendor(vendorId: string, page: number = 1, limit: number = 20): Promise<ProductSearchResult> {
    return await this.searchProducts({ vendorId }, page, limit);
  }

  /**
   * Category Management Operations
   */
  async createCategory(categoryData: Omit<ProductCategory, 'id'>): Promise<ProductCategory | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Creating new category', { name: categoryData.name });
      
      const category: ProductCategory = {
        ...categoryData,
        id: this.generateCategoryId()
      };

      // Validate category data
      await this.validateCategoryData(category);

      // Store category in database
      await this.storage.createCategory(category);

      return category;
    }, 'createCategory');
  }

  async updateCategory(categoryId: string, updates: Partial<ProductCategory>): Promise<ProductCategory | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Updating category', { categoryId, updates });
      
      const existingCategory = await this.storage.getCategoryById(categoryId);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const updatedCategory = {
        ...existingCategory,
        ...updates
      };

      // Validate updated category data
      await this.validateCategoryData(updatedCategory);

      // Update category in database
      await this.storage.updateCategory(categoryId, updatedCategory);

      return updatedCategory;
    }, 'updateCategory');
  }

  async getCategories(): Promise<ProductCategory[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching all categories');
      
      const categories = await this.storage.getCategories();
      return categories;
    }, 'getCategories');
  }

  async getCategoryHierarchy(): Promise<ProductCategory[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching category hierarchy');
      
      const categories = await this.storage.getCategories();
      return this.buildCategoryHierarchy(categories);
    }, 'getCategoryHierarchy');
  }

  /**
   * Inventory Management Operations
   */
  async updateInventory(productId: string, quantity: number): Promise<ProductInventory | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Updating inventory', { productId, quantity });
      
      const product = await this.storage.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const updatedInventory: ProductInventory = {
        ...product.inventory,
        quantity,
        available: quantity - product.inventory.reserved,
        status: this.getInventoryStatus(quantity, product.inventory.lowStockThreshold)
      };

      // Update product with new inventory
      await this.storage.updateProduct(productId, {
        inventory: updatedInventory,
        updatedAt: new Date()
      });

      return updatedInventory;
    }, 'updateInventory');
  }

  async reserveInventory(productId: string, quantity: number): Promise<boolean> {
    return await this.executeOperation(async () => {
      this.logger.info('Reserving inventory', { productId, quantity });
      
      const product = await this.storage.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.inventory.available < quantity) {
        throw new Error('Insufficient inventory');
      }

      const updatedInventory: ProductInventory = {
        ...product.inventory,
        reserved: product.inventory.reserved + quantity,
        available: product.inventory.available - quantity,
        status: this.getInventoryStatus(
          product.inventory.available - quantity,
          product.inventory.lowStockThreshold
        )
      };

      // Update product with reserved inventory
      await this.storage.updateProduct(productId, {
        inventory: updatedInventory,
        updatedAt: new Date()
      });

      return true;
    }, 'reserveInventory');
  }

  async releaseInventory(productId: string, quantity: number): Promise<boolean> {
    return await this.executeOperation(async () => {
      this.logger.info('Releasing inventory', { productId, quantity });
      
      const product = await this.storage.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const updatedInventory: ProductInventory = {
        ...product.inventory,
        reserved: Math.max(0, product.inventory.reserved - quantity),
        available: product.inventory.available + quantity,
        status: this.getInventoryStatus(
          product.inventory.available + quantity,
          product.inventory.lowStockThreshold
        )
      };

      // Update product with released inventory
      await this.storage.updateProduct(productId, {
        inventory: updatedInventory,
        updatedAt: new Date()
      });

      return true;
    }, 'releaseInventory');
  }

  /**
   * Analytics Operations
   */
  async getProductAnalytics(): Promise<ProductAnalytics> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching product analytics');
      
      const totalProducts = await this.storage.getProductCount();
      const activeProducts = await this.storage.getActiveProductCount();
      const topCategories = await this.storage.getTopCategories();
      const topBrands = await this.storage.getTopBrands();
      const inventoryStatus = await this.storage.getInventoryStatus();
      const averagePrice = await this.storage.getAveragePrice();
      const recentlyAdded = await this.storage.getRecentlyAddedCount();

      return {
        totalProducts,
        activeProducts,
        topCategories,
        topBrands,
        inventoryStatus,
        averagePrice,
        recentlyAdded
      };
    }, 'getProductAnalytics');
  }

  /**
   * Bangladesh-Specific Operations
   */
  async getBangladeshProducts(): Promise<Product[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching Bangladesh-specific products');
      
      const filters: ProductFilters = {
        // Add Bangladesh-specific filters
      };

      const result = await this.searchProducts(filters);
      return result.products;
    }, 'getBangladeshProducts');
  }

  /**
   * Private Helper Methods
   */
  private generateProductId(): string {
    return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCategoryId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateProductData(product: Product): Promise<void> {
    if (!product.title || product.title.length < 3) {
      throw new Error('Product title must be at least 3 characters');
    }

    if (!product.description || product.description.length < 10) {
      throw new Error('Product description must be at least 10 characters');
    }

    if (!product.category) {
      throw new Error('Product category is required');
    }

    if (product.price <= 0) {
      throw new Error('Product price must be greater than 0');
    }

    if (!product.vendorId) {
      throw new Error('Vendor ID is required');
    }
  }

  private async validateCategoryData(category: ProductCategory): Promise<void> {
    if (!category.name || category.name.length < 2) {
      throw new Error('Category name must be at least 2 characters');
    }

    if (!category.slug) {
      throw new Error('Category slug is required');
    }
  }

  private async indexProduct(product: Product): Promise<void> {
    // Index product in search service
    this.logger.info('Indexing product for search', { productId: product.id });
  }

  private async removeFromSearchIndex(productId: string): Promise<void> {
    // Remove product from search index
    this.logger.info('Removing product from search index', { productId });
  }

  private async updateInventoryStatus(product: Product): Promise<void> {
    // Update inventory status based on current levels
    this.logger.info('Updating inventory status', { productId: product.id });
  }

  private async getProductFacets(filters: ProductFilters): Promise<ProductFacets> {
    // Get facets for search results
    return {
      categories: [],
      brands: [],
      priceRanges: [],
      availability: { inStock: 0, outOfStock: 0 }
    };
  }

  private getInventoryStatus(quantity: number, lowStockThreshold: number): ProductInventory['status'] {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= lowStockThreshold) return 'low_stock';
    return 'in_stock';
  }

  private buildCategoryHierarchy(categories: ProductCategory[]): ProductCategory[] {
    // Build hierarchical category structure
    return categories.filter(cat => !cat.parentId);
  }
}