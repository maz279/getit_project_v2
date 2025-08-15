/**
 * Customer Product Service
 * Provides customer-facing product functionality integrating with product-service microservice
 */

const API_BASE = '/api/v1';

class CustomerProductService {
  // Get products with customer-specific features
  async getProducts({ 
    page = 1, 
    limit = 20, 
    category = '', 
    search = '', 
    minPrice = '', 
    maxPrice = '', 
    rating = '', 
    sortBy = 'createdAt',
    sortOrder = 'desc',
    vendor = '',
    inStock = true 
  } = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(search && { search }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(rating && { rating }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(vendor && { vendor }),
        ...(inStock && { inStock: 'true' })
      });

      const response = await fetch(`${API_BASE}/products?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data for customer frontend
      return {
        products: data.products?.map(this.transformProduct) || [],
        totalCount: data.totalCount || 0,
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        hasNextPage: data.hasNextPage || false,
        hasPrevPage: data.hasPrevPage || false
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get single product with full details
  async getProductById(productId) {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const product = await response.json();
      return this.transformProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get featured products for homepage
  async getFeaturedProducts(limit = 12) {
    try {
      const response = await fetch(`${API_BASE}/products/featured?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      return products.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return []; // Return empty array for graceful degradation
    }
  }

  // Get trending products
  async getTrendingProducts(limit = 12) {
    try {
      const response = await fetch(`${API_BASE}/products/trending?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      return products.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }
  }

  // Get new arrivals
  async getNewArrivals(limit = 12) {
    try {
      const response = await fetch(`${API_BASE}/products/new-arrivals?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      return products.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      return [];
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId, options = {}) {
    try {
      const params = new URLSearchParams({
        category: categoryId,
        ...options
      });

      const response = await fetch(`${API_BASE}/products?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        products: data.products?.map(this.transformProduct) || [],
        totalCount: data.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch category products');
    }
  }

  // Transform backend product data for frontend consumption
  transformProduct(product) {
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price) || 0,
      comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      imageUrl: product.imageUrl || product.images?.[0]?.url,
      images: product.images || [],
      category: product.category,
      categoryId: product.categoryId,
      vendor: product.vendor,
      vendorId: product.vendorId,
      vendorName: product.vendorName || product.vendor?.businessName,
      rating: parseFloat(product.rating) || 0,
      reviewCount: parseInt(product.reviewCount) || 0,
      isInStock: product.isInStock !== false, // Default to true if not specified
      stockQuantity: parseInt(product.stockQuantity) || 0,
      sku: product.sku,
      tags: product.tags || [],
      variants: product.variants || [],
      specifications: product.specifications || {},
      shippingInfo: product.shippingInfo || {},
      isNew: this.isNewProduct(product.createdAt),
      isFeatured: product.isFeatured || false,
      discount: this.calculateDiscount(product.price, product.comparePrice),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  // Helper: Check if product is new (within last 30 days)
  isNewProduct(createdAt) {
    if (!createdAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
  }

  // Helper: Calculate discount percentage
  calculateDiscount(price, comparePrice) {
    if (!comparePrice || !price || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  }
}

export const customerProductService = new CustomerProductService();
export default customerProductService;