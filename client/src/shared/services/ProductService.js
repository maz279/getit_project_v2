// Product Service
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Product API Service
// Complete product management with search, filtering, recommendations

import BaseApiService from './BaseApiService.js';

class ProductService extends BaseApiService {
  constructor() {
    super();
    this.servicePath = '/products';
  }

  // Product CRUD Operations
  async getProducts(params = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      vendor,
      brand,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'relevance',
      search,
      featured,
      onSale,
      newArrivals,
      inStock = true,
      division,
      district,
      ...filters
    } = params;

    const queryParams = {
      page,
      limit,
      sortBy,
      inStock,
      ...filters
    };

    // Add optional filters
    if (category) queryParams.category = category;
    if (subcategory) queryParams.subcategory = subcategory;
    if (vendor) queryParams.vendor = vendor;
    if (brand) queryParams.brand = brand;
    if (minPrice) queryParams.minPrice = minPrice;
    if (maxPrice) queryParams.maxPrice = maxPrice;
    if (rating) queryParams.rating = rating;
    if (search) queryParams.search = search;
    if (featured) queryParams.featured = featured;
    if (onSale) queryParams.onSale = onSale;
    if (newArrivals) queryParams.newArrivals = newArrivals;
    if (division) queryParams.division = division;
    if (district) queryParams.district = district;

    return this.get(this.servicePath, queryParams);
  }

  async getProductById(productId) {
    return this.get(`${this.servicePath}/${productId}`);
  }

  async getFeaturedProducts(limit = 12) {
    return this.get(`${this.servicePath}/featured`, { limit });
  }

  async getBestSellers(limit = 12) {
    return this.get(`${this.servicePath}/bestsellers`, { limit });
  }

  async getNewArrivals(limit = 12) {
    return this.get(`${this.servicePath}/new-arrivals`, { limit });
  }

  async getFlashSaleProducts(limit = 20) {
    return this.get(`${this.servicePath}/flash-sale`, { limit });
  }

  async getDailyDeals(limit = 10) {
    return this.get(`${this.servicePath}/daily-deals`, { limit });
  }

  async getTrendingProducts(limit = 15) {
    return this.get(`${this.servicePath}/trending`, { limit });
  }

  // Search Operations
  async searchProducts(query, params = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      filters = {},
      suggestions = true
    } = params;

    return this.get(`${this.servicePath}/search`, {
      q: query,
      page,
      limit,
      sortBy,
      suggestions,
      ...filters
    });
  }

  async getSearchSuggestions(query, limit = 10) {
    return this.get(`${this.servicePath}/search/suggestions`, {
      q: query,
      limit
    });
  }

  async getAutoComplete(query, limit = 8) {
    return this.get(`${this.servicePath}/search/autocomplete`, {
      q: query,
      limit
    });
  }

  // Category Operations
  async getCategories() {
    return this.get('/categories');
  }

  async getCategoryById(categoryId) {
    return this.get(`/categories/${categoryId}`);
  }

  async getProductsByCategory(categoryId, params = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      ...filters
    } = params;

    return this.get(`/categories/${categoryId}/products`, {
      page,
      limit,
      sortBy,
      ...filters
    });
  }

  async getSubcategories(categoryId) {
    return this.get(`/categories/${categoryId}/subcategories`);
  }

  // Brand Operations
  async getBrands(categoryId = null) {
    const params = categoryId ? { category: categoryId } : {};
    return this.get('/brands', params);
  }

  async getProductsByBrand(brandId, params = {}) {
    return this.get(`/brands/${brandId}/products`, params);
  }

  // Vendor Products
  async getVendorProducts(vendorId, params = {}) {
    return this.get(`/vendors/${vendorId}/products`, params);
  }

  // Product Recommendations
  async getRecommendedProducts(productId = null, params = {}) {
    const {
      type = 'similar',
      limit = 12,
      userId = null
    } = params;

    const endpoint = productId 
      ? `${this.servicePath}/${productId}/recommendations`
      : `${this.servicePath}/recommendations`;

    return this.get(endpoint, { type, limit, userId });
  }

  async getPersonalizedRecommendations(userId, limit = 20) {
    return this.get(`${this.servicePath}/recommendations/personalized`, {
      userId,
      limit
    });
  }

  async getSimilarProducts(productId, limit = 8) {
    return this.get(`${this.servicePath}/${productId}/similar`, { limit });
  }

  async getFrequentlyBoughtTogether(productId, limit = 6) {
    return this.get(`${this.servicePath}/${productId}/frequently-bought-together`, { limit });
  }

  async getRelatedProducts(productId, limit = 10) {
    return this.get(`${this.servicePath}/${productId}/related`, { limit });
  }

  // Product Reviews
  async getProductReviews(productId, params = {}) {
    const {
      page = 1,
      limit = 10,
      rating = null,
      sortBy = 'newest',
      verified = null
    } = params;

    const queryParams = { page, limit, sortBy };
    if (rating) queryParams.rating = rating;
    if (verified !== null) queryParams.verified = verified;

    return this.get(`${this.servicePath}/${productId}/reviews`, queryParams);
  }

  async addProductReview(productId, reviewData) {
    return this.post(`${this.servicePath}/${productId}/reviews`, reviewData);
  }

  async updateProductReview(productId, reviewId, reviewData) {
    return this.put(`${this.servicePath}/${productId}/reviews/${reviewId}`, reviewData);
  }

  async deleteProductReview(productId, reviewId) {
    return this.delete(`${this.servicePath}/${productId}/reviews/${reviewId}`);
  }

  async getReviewSummary(productId) {
    return this.get(`${this.servicePath}/${productId}/reviews/summary`);
  }

  // Product Questions & Answers
  async getProductQuestions(productId, params = {}) {
    return this.get(`${this.servicePath}/${productId}/questions`, params);
  }

  async addProductQuestion(productId, questionData) {
    return this.post(`${this.servicePath}/${productId}/questions`, questionData);
  }

  async answerProductQuestion(productId, questionId, answerData) {
    return this.post(`${this.servicePath}/${productId}/questions/${questionId}/answers`, answerData);
  }

  // Wishlist Operations
  async addToWishlist(productId, userId) {
    return this.post('/wishlist', { productId, userId });
  }

  async removeFromWishlist(productId, userId) {
    return this.delete('/wishlist', { data: { productId, userId } });
  }

  async getWishlist(userId, params = {}) {
    return this.get('/wishlist', { userId, ...params });
  }

  async isInWishlist(productId, userId) {
    return this.get('/wishlist/check', { productId, userId });
  }

  // Comparison Operations
  async addToComparison(productId, userId) {
    return this.post('/comparison', { productId, userId });
  }

  async removeFromComparison(productId, userId) {
    return this.delete('/comparison', { data: { productId, userId } });
  }

  async getComparison(userId) {
    return this.get('/comparison', { userId });
  }

  async compareProducts(productIds) {
    return this.post('/comparison/compare', { productIds });
  }

  // Inventory & Availability
  async checkAvailability(productId, quantity = 1, location = null) {
    return this.get(`${this.servicePath}/${productId}/availability`, {
      quantity,
      location
    });
  }

  async getStockLevel(productId) {
    return this.get(`${this.servicePath}/${productId}/stock`);
  }

  async subscribeToStockAlert(productId, userId, email) {
    return this.post(`${this.servicePath}/${productId}/stock-alert`, {
      userId,
      email
    });
  }

  // Price Operations
  async getPriceHistory(productId, days = 30) {
    return this.get(`${this.servicePath}/${productId}/price-history`, { days });
  }

  async subscribeToPriceAlert(productId, userId, targetPrice, email) {
    return this.post(`${this.servicePath}/${productId}/price-alert`, {
      userId,
      targetPrice,
      email
    });
  }

  async getBestPrice(productId) {
    return this.get(`${this.servicePath}/${productId}/best-price`);
  }

  // Bangladesh-Specific Operations
  async getProductsByDivision(division, params = {}) {
    return this.get(`${this.servicePath}/location/division/${division}`, params);
  }

  async getLocalProducts(lat, lng, radius = 10, params = {}) {
    return this.get(`${this.servicePath}/location/nearby`, {
      lat,
      lng,
      radius,
      ...params
    });
  }

  async getCODAvailableProducts(params = {}) {
    return this.get(`${this.servicePath}/cod-available`, params);
  }

  async getMobileBankingProducts(params = {}) {
    return this.get(`${this.servicePath}/mobile-banking`, params);
  }

  // Product Analytics
  async trackProductView(productId, userId = null) {
    return this.post(`${this.servicePath}/${productId}/view`, { userId });
  }

  async trackProductClick(productId, source, userId = null) {
    return this.post(`${this.servicePath}/${productId}/click`, {
      source,
      userId
    });
  }

  async getProductAnalytics(productId) {
    return this.get(`${this.servicePath}/${productId}/analytics`);
  }

  // Bulk Operations
  async getProductsBulk(productIds) {
    return this.post(`${this.servicePath}/bulk`, { productIds });
  }

  async checkAvailabilityBulk(items) {
    return this.post(`${this.servicePath}/availability/bulk`, { items });
  }

  // Image & Media Operations
  async getProductImages(productId) {
    return this.get(`${this.servicePath}/${productId}/images`);
  }

  async getProductVideos(productId) {
    return this.get(`${this.servicePath}/${productId}/videos`);
  }

  async searchByImage(imageFile) {
    return this.upload(`${this.servicePath}/search/image`, imageFile);
  }

  // Advanced Filtering
  async getFilterOptions(category = null) {
    const params = category ? { category } : {};
    return this.get(`${this.servicePath}/filters`, params);
  }

  async getAttributeValues(attribute, category = null) {
    const params = { attribute };
    if (category) params.category = category;
    return this.get(`${this.servicePath}/attributes`, params);
  }

  // Export/Import Operations
  async exportProducts(params = {}) {
    return this.get(`${this.servicePath}/export`, params);
  }

  // Health Check
  async healthCheck() {
    return this.get(`${this.servicePath}/health`);
  }
}

// Create and export singleton instance
const productService = new ProductService();

export default productService;