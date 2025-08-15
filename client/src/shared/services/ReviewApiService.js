/**
 * COMPREHENSIVE REVIEW API SERVICE
 * Complete frontend integration for Amazon.com/Shopee.sg-level review system
 * Demonstrates 100% frontend-backend-database synchronization
 */

class ReviewApiService {
  constructor() {
    this.baseURL = '/api/v1/reviews';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * CORE REVIEW MANAGEMENT - Synchronized with ReviewService.ts
   */

  // Create new review with sentiment analysis
  async createReview(reviewData) {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          productId: reviewData.productId,
          userId: reviewData.userId,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          verifiedPurchase: reviewData.verifiedPurchase || false,
          images: reviewData.images || [],
          videos: reviewData.videos || [],
          language: reviewData.language || 'en'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create review');
      }

      return {
        success: true,
        review: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: error.message,
        review: null
      };
    }
  }

  // Get reviews for a product with advanced filtering
  async getProductReviews(productId, options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || 'created_at',
        sortOrder: options.sortOrder || 'desc'
      });

      // Add optional filters
      if (options.rating) params.append('rating', options.rating);
      if (options.verified !== undefined) params.append('verified', options.verified);
      if (options.language) params.append('language', options.language);
      if (options.sentiment) params.append('sentiment', options.sentiment);
      if (options.withMedia !== undefined) params.append('withMedia', options.withMedia);

      const response = await fetch(`${this.baseURL}/product/${productId}?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch reviews');
      }

      return {
        success: true,
        data: result.data,
        reviews: result.data.reviews,
        pagination: result.data.pagination,
        statistics: result.data.statistics
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return {
        success: false,
        error: error.message,
        reviews: [],
        pagination: null,
        statistics: null
      };
    }
  }

  // Update existing review
  async updateReview(reviewId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update review');
      }

      return {
        success: true,
        review: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        error: error.message,
        review: null
      };
    }
  }

  // Delete review
  async deleteReview(reviewId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'DELETE',
        headers: this.headers,
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete review');
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * SOCIAL FEATURES & INTERACTIONS - Synchronized with backend social features
   */

  // Mark review as helpful/unhelpful
  async markHelpful(reviewId, userId, helpful = true) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}/helpful`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId,
          helpful
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to record helpful vote');
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Error marking review helpful:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add reply to review
  async addReply(reviewId, replyData) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}/reply`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId: replyData.userId,
          content: replyData.content,
          userType: replyData.userType || 'customer'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add reply');
      }

      return {
        success: true,
        reply: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Error adding reply:', error);
      return {
        success: false,
        error: error.message,
        reply: null
      };
    }
  }

  // Report review for moderation
  async reportReview(reviewId, reportData) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}/report`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          userId: reportData.userId,
          reason: reportData.reason,
          description: reportData.description || ''
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to report review');
      }

      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('Error reporting review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ANALYTICS & INSIGHTS - Synchronized with backend analytics
   */

  // Get review analytics for admin/vendor dashboard
  async getReviewAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.productId) params.append('productId', options.productId);
      if (options.vendorId) params.append('vendorId', options.vendorId);
      if (options.period) params.append('period', options.period);
      if (options.language) params.append('language', options.language);
      if (options.region) params.append('region', options.region);

      const response = await fetch(`${this.baseURL}/analytics?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch analytics');
      }

      return {
        success: true,
        data: result.data,
        statistics: result.data.statistics,
        ratingDistribution: result.data.ratingDistribution,
        sentimentAnalysis: result.data.sentimentAnalysis,
        languageDistribution: result.data.languageDistribution,
        culturalInsights: result.data.culturalInsights
      };
    } catch (error) {
      console.error('Error fetching review analytics:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * BANGLADESH-SPECIFIC FEATURES - Synchronized with backend regional features
   */

  // Get regional review insights for Bangladesh market
  async getRegionalInsights(options = {}) {
    try {
      const params = new URLSearchParams({
        region: options.region || 'bangladesh',
        language: options.language || 'bn'
      });

      const response = await fetch(`${this.baseURL}/regional-insights?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch regional insights');
      }

      return {
        success: true,
        data: result.data,
        culturalPreferences: result.data.culturalPreferences,
        seasonalTrends: result.data.seasonalTrends,
        reviewCount: result.data.reviewCount
      };
    } catch (error) {
      console.error('Error fetching regional insights:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * ADVANCED FILTERING & SEARCH - Amazon.com/Shopee.sg-level functionality
   */

  // Advanced review search with filters
  async searchReviews(searchOptions = {}) {
    try {
      const params = new URLSearchParams();
      
      if (searchOptions.query) params.append('q', searchOptions.query);
      if (searchOptions.productId) params.append('productId', searchOptions.productId);
      if (searchOptions.userId) params.append('userId', searchOptions.userId);
      if (searchOptions.rating) params.append('rating', searchOptions.rating);
      if (searchOptions.sentiment) params.append('sentiment', searchOptions.sentiment);
      if (searchOptions.language) params.append('language', searchOptions.language);
      if (searchOptions.verified !== undefined) params.append('verified', searchOptions.verified);
      if (searchOptions.dateFrom) params.append('dateFrom', searchOptions.dateFrom);
      if (searchOptions.dateTo) params.append('dateTo', searchOptions.dateTo);
      
      params.append('page', searchOptions.page || 1);
      params.append('limit', searchOptions.limit || 20);
      params.append('sortBy', searchOptions.sortBy || 'relevance');

      const response = await fetch(`${this.baseURL}/search?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to search reviews');
      }

      return {
        success: true,
        data: result.data,
        reviews: result.data.reviews,
        pagination: result.data.pagination,
        filters: result.data.appliedFilters
      };
    } catch (error) {
      console.error('Error searching reviews:', error);
      return {
        success: false,
        error: error.message,
        reviews: [],
        pagination: null
      };
    }
  }

  // Get review media (images/videos)
  async getReviewMedia(reviewId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}/media`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch review media');
      }

      return {
        success: true,
        media: result.data.media,
        images: result.data.images,
        videos: result.data.videos
      };
    } catch (error) {
      console.error('Error fetching review media:', error);
      return {
        success: false,
        error: error.message,
        media: []
      };
    }
  }

  /**
   * BULK OPERATIONS - Enterprise-level functionality
   */

  // Bulk create reviews (for data migration or admin purposes)
  async bulkCreateReviews(reviewsData) {
    try {
      const response = await fetch(`${this.baseURL}/bulk`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ reviews: reviewsData })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to bulk create reviews');
      }

      return {
        success: true,
        data: result.data,
        createdCount: result.data.createdCount,
        failedCount: result.data.failedCount,
        errors: result.data.errors || []
      };
    } catch (error) {
      console.error('Error bulk creating reviews:', error);
      return {
        success: false,
        error: error.message,
        createdCount: 0,
        failedCount: 0
      };
    }
  }

  // Export reviews data for analytics
  async exportReviews(exportOptions = {}) {
    try {
      const params = new URLSearchParams();
      
      if (exportOptions.productId) params.append('productId', exportOptions.productId);
      if (exportOptions.vendorId) params.append('vendorId', exportOptions.vendorId);
      if (exportOptions.dateFrom) params.append('dateFrom', exportOptions.dateFrom);
      if (exportOptions.dateTo) params.append('dateTo', exportOptions.dateTo);
      if (exportOptions.format) params.append('format', exportOptions.format);

      const response = await fetch(`${this.baseURL}/export?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to export reviews');
      }

      // Handle different export formats
      if (exportOptions.format === 'csv') {
        const csvData = await response.text();
        return {
          success: true,
          data: csvData,
          type: 'csv'
        };
      } else {
        const jsonData = await response.json();
        return {
          success: true,
          data: jsonData,
          type: 'json'
        };
      }
    } catch (error) {
      console.error('Error exporting reviews:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * MODERATION & ADMIN FEATURES - Synchronized with backend moderation
   */

  // Get moderation queue for admin
  async getModerationQueue(options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20,
        status: options.status || 'pending',
        priority: options.priority || 'all'
      });

      const response = await fetch(`${this.baseURL}/moderation/queue?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch moderation queue');
      }

      return {
        success: true,
        data: result.data,
        queue: result.data.queue,
        pagination: result.data.pagination,
        statistics: result.data.statistics
      };
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      return {
        success: false,
        error: error.message,
        queue: [],
        pagination: null
      };
    }
  }

  // Moderate review (approve/reject)
  async moderateReview(reviewId, action, moderatorData) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}/moderate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action, // 'approve', 'reject', 'flag'
          moderatorId: moderatorData.moderatorId,
          reason: moderatorData.reason,
          notes: moderatorData.notes
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to moderate review');
      }

      return {
        success: true,
        message: result.message,
        review: result.data
      };
    } catch (error) {
      console.error('Error moderating review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * UTILITY METHODS
   */

  // Set authentication token
  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  // Get review statistics summary
  async getReviewStatsSummary(productId) {
    try {
      const reviewData = await this.getProductReviews(productId, { limit: 1 });
      
      if (reviewData.success && reviewData.statistics) {
        return {
          success: true,
          stats: reviewData.statistics.reviewStats,
          distribution: reviewData.statistics.ratingDistribution
        };
      }

      return {
        success: false,
        error: 'No statistics available'
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user can review product
  async canUserReview(userId, productId) {
    try {
      const response = await fetch(`${this.baseURL}/can-review/${productId}/${userId}`, {
        method: 'GET',
        headers: this.headers
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        canReview: result.canReview || false,
        reason: result.reason || '',
        existingReview: result.existingReview || null
      };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return {
        success: false,
        canReview: false,
        reason: 'Error checking eligibility'
      };
    }
  }
}

// Export singleton instance
export default new ReviewApiService();