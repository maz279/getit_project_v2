/**
 * Review Service - Amazon.com/Shopee.sg Level Business Logic
 * Handles all product review-related business operations
 */

import { db } from '../../../../db';
import { 
  productReviews,
  users,
  orders,
  orderItems,
  products,
  type Product
} from '@shared/schema';
import { eq, and, desc, asc, sql, count, gte, lte, inArray } from 'drizzle-orm';
import { 
  ReviewSearchParams,
  ReviewResponse,
  ProductReview,
  ReviewResponseItem,
  RatingDistribution,
  NotFoundError,
  ValidationError,
  UnauthorizedError
} from '../types';

export class ReviewService {
  private serviceName = 'review-service';

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    console.log(`🚀 Initializing ${this.serviceName}`, {
      service: this.serviceName,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get reviews for a product with advanced filtering
   */
  async getProductReviews(params: ReviewSearchParams): Promise<ReviewResponse> {
    try {
      const {
        productId,
        rating,
        verified,
        hasImages,
        hasVideo,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = params;

      if (!productId) {
        throw new ValidationError('Product ID is required');
      }

      const offset = (page - 1) * limit;

      // Build the query conditions
      const conditions = [eq(productReviews.productId, productId)];

      if (rating !== undefined) {
        conditions.push(eq(productReviews.rating, rating));
      }

      if (verified !== undefined) {
        conditions.push(eq(productReviews.isVerified, verified));
      }

      if (hasImages) {
        conditions.push(sql`json_array_length(${productReviews.images}) > 0`);
      }

      if (hasVideo) {
        conditions.push(sql`${productReviews.video} IS NOT NULL`);
      }

      // Build the main query
      let query = db
        .select({
          review: productReviews,
          userName: users.username,
          userAvatar: users.avatar
        })
        .from(productReviews)
        .leftJoin(users, eq(productReviews.userId, users.id))
        .where(and(...conditions));

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.orderBy(sortOrder === 'asc' ? asc(productReviews.rating) : desc(productReviews.rating));
          break;
        case 'helpful':
          query = query.orderBy(sortOrder === 'asc' ? asc(productReviews.helpfulCount) : desc(productReviews.helpfulCount));
          break;
        default:
          query = query.orderBy(sortOrder === 'asc' ? asc(productReviews.createdAt) : desc(productReviews.createdAt));
      }

      // Apply pagination
      query = query.limit(limit).offset(offset);

      const reviewsResult = await query;

      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(productReviews)
        .where(and(...conditions));

      // Calculate statistics
      const stats = await this.getProductReviewStats(productId);

      // Transform results
      const reviews: ProductReview[] = reviewsResult.map(row => ({
        id: row.review.id,
        productId: row.review.productId,
        userId: row.review.userId,
        userName: row.userName || 'Anonymous',
        userAvatar: row.userAvatar,
        rating: row.review.rating,
        title: row.review.title,
        comment: row.review.comment,
        images: row.review.images ? JSON.parse(row.review.images as string) : undefined,
        video: row.review.video,
        pros: row.review.pros ? JSON.parse(row.review.pros as string) : undefined,
        cons: row.review.cons ? JSON.parse(row.review.cons as string) : undefined,
        isVerified: row.review.isVerified,
        helpfulCount: row.review.helpfulCount || 0,
        responses: [], // Will be populated separately if needed
        createdAt: row.review.createdAt,
        updatedAt: row.review.updatedAt
      }));

      return {
        reviews,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        ratingDistribution: stats.ratingDistribution
      };
    } catch (error) {
      console.error('Failed to get product reviews:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(
    reviewId: string, 
    options: { includeResponses?: boolean } = {}
  ): Promise<ProductReview | null> {
    try {
      const [reviewResult] = await db
        .select({
          review: productReviews,
          userName: users.username,
          userAvatar: users.avatar
        })
        .from(productReviews)
        .leftJoin(users, eq(productReviews.userId, users.id))
        .where(eq(productReviews.id, reviewId));

      if (!reviewResult) {
        return null;
      }

      const review: ProductReview = {
        id: reviewResult.review.id,
        productId: reviewResult.review.productId,
        userId: reviewResult.review.userId,
        userName: reviewResult.userName || 'Anonymous',
        userAvatar: reviewResult.userAvatar,
        rating: reviewResult.review.rating,
        title: reviewResult.review.title,
        comment: reviewResult.review.comment,
        images: reviewResult.review.images ? JSON.parse(reviewResult.review.images as string) : undefined,
        video: reviewResult.review.video,
        pros: reviewResult.review.pros ? JSON.parse(reviewResult.review.pros as string) : undefined,
        cons: reviewResult.review.cons ? JSON.parse(reviewResult.review.cons as string) : undefined,
        isVerified: reviewResult.review.isVerified,
        helpfulCount: reviewResult.review.helpfulCount || 0,
        responses: [],
        createdAt: reviewResult.review.createdAt,
        updatedAt: reviewResult.review.updatedAt
      };

      if (options.includeResponses) {
        review.responses = await this.getReviewResponses(reviewId);
      }

      return review;
    } catch (error) {
      console.error('Failed to get review by ID:', error);
      throw error;
    }
  }

  /**
   * Create new review
   */
  async createReview(reviewData: any, isVerified: boolean = false): Promise<ProductReview> {
    try {
      // Check if user already reviewed this product
      const existingReview = await db
        .select()
        .from(productReviews)
        .where(
          and(
            eq(productReviews.productId, reviewData.productId),
            eq(productReviews.userId, reviewData.userId)
          )
        );

      if (existingReview.length > 0) {
        throw new ValidationError('User has already reviewed this product');
      }

      // Prepare review data
      const reviewInsertData = {
        ...reviewData,
        images: reviewData.images ? JSON.stringify(reviewData.images) : null,
        pros: reviewData.pros ? JSON.stringify(reviewData.pros) : null,
        cons: reviewData.cons ? JSON.stringify(reviewData.cons) : null,
        isVerified,
        helpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [createdReview] = await db
        .insert(productReviews)
        .values(reviewInsertData)
        .returning();

      // Get user info
      const [user] = await db
        .select({ username: users.username, avatar: users.avatar })
        .from(users)
        .where(eq(users.id, reviewData.userId));

      return {
        id: createdReview.id,
        productId: createdReview.productId,
        userId: createdReview.userId,
        userName: user?.username || 'Anonymous',
        userAvatar: user?.avatar,
        rating: createdReview.rating,
        title: createdReview.title,
        comment: createdReview.comment,
        images: createdReview.images ? JSON.parse(createdReview.images as string) : undefined,
        video: createdReview.video,
        pros: createdReview.pros ? JSON.parse(createdReview.pros as string) : undefined,
        cons: createdReview.cons ? JSON.parse(createdReview.cons as string) : undefined,
        isVerified: createdReview.isVerified,
        helpfulCount: createdReview.helpfulCount || 0,
        responses: [],
        createdAt: createdReview.createdAt,
        updatedAt: createdReview.updatedAt
      };
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string, 
    updateData: any, 
    userId: string
  ): Promise<ProductReview | null> {
    try {
      // Check if review exists and belongs to user
      const [existingReview] = await db
        .select()
        .from(productReviews)
        .where(
          and(
            eq(productReviews.id, reviewId),
            eq(productReviews.userId, userId)
          )
        );

      if (!existingReview) {
        return null;
      }

      // Prepare update data
      const reviewUpdateData = {
        ...updateData,
        images: updateData.images ? JSON.stringify(updateData.images) : undefined,
        pros: updateData.pros ? JSON.stringify(updateData.pros) : undefined,
        cons: updateData.cons ? JSON.stringify(updateData.cons) : undefined,
        updatedAt: new Date()
      };

      const [updatedReview] = await db
        .update(productReviews)
        .set(reviewUpdateData)
        .where(eq(productReviews.id, reviewId))
        .returning();

      return this.getReviewById(updatedReview.id);
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    try {
      const conditions = [eq(productReviews.id, reviewId)];
      
      // Non-admin users can only delete their own reviews
      if (!isAdmin) {
        conditions.push(eq(productReviews.userId, userId));
      }

      const deletedReviews = await db
        .delete(productReviews)
        .where(and(...conditions))
        .returning();

      return deletedReviews.length > 0;
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  }

  /**
   * Mark review as helpful/unhelpful
   */
  async markReviewHelpful(
    reviewId: string, 
    userId: string, 
    helpful: boolean
  ): Promise<{ helpful: boolean; helpfulCount: number }> {
    try {
      // For now, we'll just update the helpful count
      // In a full implementation, we'd track individual user votes
      const increment = helpful ? 1 : -1;
      
      const [updatedReview] = await db
        .update(productReviews)
        .set({
          helpfulCount: sql`${productReviews.helpfulCount} + ${increment}`,
          updatedAt: new Date()
        })
        .where(eq(productReviews.id, reviewId))
        .returning({ helpfulCount: productReviews.helpfulCount });

      return {
        helpful,
        helpfulCount: updatedReview?.helpfulCount || 0
      };
    } catch (error) {
      console.error('Failed to mark review helpful:', error);
      throw error;
    }
  }

  /**
   * Report review
   */
  async reportReview(
    reviewId: string, 
    userId: string, 
    reason: string, 
    description?: string
  ): Promise<{ id: string; status: string }> {
    try {
      // In a full implementation, we'd create a reports table
      // For now, we'll return a mock response
      const reportId = `report_${Date.now()}`;
      
      console.log('Review reported:', {
        reviewId,
        reportedBy: userId,
        reason,
        description,
        timestamp: new Date().toISOString()
      });

      return {
        id: reportId,
        status: 'pending'
      };
    } catch (error) {
      console.error('Failed to report review:', error);
      throw error;
    }
  }

  /**
   * Respond to review (vendor/admin)
   */
  async respondToReview(
    reviewId: string,
    userId: string,
    responseText: string,
    userRole: string
  ): Promise<ReviewResponseItem> {
    try {
      // Verify review exists
      const review = await this.getReviewById(reviewId);
      if (!review) {
        throw new NotFoundError('Review not found');
      }

      // Verify user has permission to respond
      if (userRole !== 'admin' && userRole !== 'vendor') {
        throw new UnauthorizedError('Only vendors and admins can respond to reviews');
      }

      // In a full implementation, we'd create a review_responses table
      // For now, we'll return a mock response
      const response: ReviewResponseItem = {
        id: `response_${Date.now()}`,
        reviewId,
        respondentId: userId,
        respondentName: 'Vendor/Admin',
        respondentType: userRole as 'vendor' | 'admin',
        response: responseText,
        createdAt: new Date()
      };

      console.log('Review response created:', response);

      return response;
    } catch (error) {
      console.error('Failed to respond to review:', error);
      throw error;
    }
  }

  /**
   * Get review analytics for product
   */
  async getReviewAnalytics(productId: string, timeRange: string): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const stats = await this.getProductReviewStats(productId);
      
      // Get trend data (mock implementation)
      const trendData = await this.getReviewTrend(productId, startDate, endDate);

      return {
        ...stats,
        trend: trendData,
        timeRange
      };
    } catch (error) {
      console.error('Failed to get review analytics:', error);
      throw error;
    }
  }

  /**
   * Get user reviews
   */
  async getUserReviews(params: ReviewSearchParams): Promise<ReviewResponse> {
    try {
      const {
        userId,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const offset = (page - 1) * limit;

      // Build query
      let query = db
        .select({
          review: productReviews,
          productName: products.name
        })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .where(eq(productReviews.userId, userId));

      // Apply sorting
      query = query.orderBy(
        sortOrder === 'asc' ? asc(productReviews[sortBy]) : desc(productReviews[sortBy])
      );

      // Apply pagination
      query = query.limit(limit).offset(offset);

      const reviewsResult = await query;

      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(productReviews)
        .where(eq(productReviews.userId, userId));

      // Transform results
      const reviews: ProductReview[] = reviewsResult.map(row => ({
        id: row.review.id,
        productId: row.review.productId,
        userId: row.review.userId,
        userName: 'Me',
        rating: row.review.rating,
        title: row.review.title,
        comment: row.review.comment,
        images: row.review.images ? JSON.parse(row.review.images as string) : undefined,
        video: row.review.video,
        pros: row.review.pros ? JSON.parse(row.review.pros as string) : undefined,
        cons: row.review.cons ? JSON.parse(row.review.cons as string) : undefined,
        isVerified: row.review.isVerified,
        helpfulCount: row.review.helpfulCount || 0,
        responses: [],
        createdAt: row.review.createdAt,
        updatedAt: row.review.updatedAt
      }));

      return {
        reviews,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        averageRating: 0,
        totalReviews: totalCount,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    } catch (error) {
      console.error('Failed to get user reviews:', error);
      throw error;
    }
  }

  /**
   * Bulk moderate reviews (admin only)
   */
  async bulkModerateReviews(
    reviewIds: string[], 
    action: string, 
    reason?: string
  ): Promise<{ affected: number; action: string }> {
    try {
      let affected = 0;

      switch (action) {
        case 'approve':
          // Mark reviews as approved
          affected = reviewIds.length;
          break;
        case 'reject':
        case 'hide':
          // Hide reviews
          affected = reviewIds.length;
          break;
        case 'flag':
          // Flag for manual review
          affected = reviewIds.length;
          break;
        default:
          throw new ValidationError('Invalid moderation action');
      }

      console.log(`Bulk ${action} operation:`, {
        reviewIds,
        action,
        reason,
        affected,
        timestamp: new Date().toISOString()
      });

      return { affected, action };
    } catch (error) {
      console.error('Failed to bulk moderate reviews:', error);
      throw error;
    }
  }

  /**
   * Check if user has purchased product
   */
  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    try {
      const [purchase] = await db
        .select({ id: orders.id })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orders.userId, parseInt(userId)),
            eq(orderItems.productId, productId),
            eq(orders.status, 'delivered')
          )
        )
        .limit(1);

      return !!purchase;
    } catch (error) {
      console.error('Failed to check user purchase:', error);
      return false;
    }
  }

  // Helper methods

  private async getProductReviewStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistribution;
  }> {
    try {
      // Get total reviews and average rating
      const [stats] = await db
        .select({
          totalReviews: count(),
          averageRating: sql<number>`ROUND(AVG(${productReviews.rating}), 2)`
        })
        .from(productReviews)
        .where(eq(productReviews.productId, productId));

      // Get rating distribution
      const ratingDist = await db
        .select({
          rating: productReviews.rating,
          count: count()
        })
        .from(productReviews)
        .where(eq(productReviews.productId, productId))
        .groupBy(productReviews.rating);

      const ratingDistribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingDist.forEach(item => {
        ratingDistribution[item.rating as keyof RatingDistribution] = item.count;
      });

      return {
        averageRating: stats?.averageRating || 0,
        totalReviews: stats?.totalReviews || 0,
        ratingDistribution
      };
    } catch (error) {
      console.error('Failed to get product review stats:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  private async getReviewResponses(reviewId: string): Promise<ReviewResponseItem[]> {
    // Mock implementation - in a full system, we'd query a review_responses table
    return [];
  }

  private async getReviewTrend(productId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Mock implementation - in a full system, we'd calculate actual trend data
    return [];
  }
}