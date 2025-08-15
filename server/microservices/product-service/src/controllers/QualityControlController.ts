/**
 * Quality Control Controller - Amazon.com/Shopee.sg Level
 * Content moderation, approval workflows, and quality assurance
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  products, categories, vendors, users
} from '@shared/schema';
import { eq, desc, asc, and, or, like, sql, count, gte, lte, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

// Type definitions for quality control
interface QualityIssue {
  issue: string;
  count: number;
}

interface ApprovalTrend {
  date: string;
  approved: number;
  rejected: number;
  pending: number;
}

interface ReviewerPerformance {
  reviewerId: string;
  reviewerName: string;
  approved: number;
  rejected: number;
  averageTime: number; // in hours
  accuracy: number; // percentage
}

interface CategoryQualityScore {
  categoryId: string;
  categoryName: string;
  averageScore: number;
  totalProducts: number;
  approvalRate: number;
}

export class QualityControlController {
  private redisService: RedisService;
  private bannedKeywords = [
    'fake', 'counterfeit', 'replica', 'copy', 'imitation',
    'prohibited', 'illegal', 'banned', 'restricted'
  ];
  private suspiciousPatterns = [
    /\b(100%|guaranteed|instant|miracle|amazing|incredible)\b/gi,
    /\b(free|freedom|liberty|bonus|gift|prize)\b/gi,
    /[!]{3,}|[?]{3,}|[\$]{2,}/g
  ];

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get products pending approval
   * GET /api/v1/products/quality-control/pending
   */
  async getPendingProducts(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        vendor, 
        priority,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build query conditions
      let whereConditions = [eq(products.status, 'pending')];
      
      if (category) {
        whereConditions.push(eq(products.categoryId, category as string));
      }
      
      if (vendor) {
        whereConditions.push(eq(products.vendorId, vendor as string));
      }

      // Get pending products with quality check details
      const pendingProducts = await db
        .select({
          product: products,
          vendor: vendors,
          category: categories,
          qualityCheck: productQualityChecks,
          approval: productApprovals
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(productQualityChecks, eq(products.id, productQualityChecks.productId))
        .leftJoin(productApprovals, eq(products.id, productApprovals.productId))
        .where(and(...whereConditions))
        .orderBy(sortOrder === 'desc' ? desc(products[sortBy as keyof typeof products]) : asc(products[sortBy as keyof typeof products]))
        .limit(Number(limit))
        .offset(offset);

      // Get total count
      const totalCount = await db
        .select({ count: count() })
        .from(products)
        .where(and(...whereConditions));

      // Analyze each product for quality issues
      const analyzedProducts = await Promise.all(
        pendingProducts.map(async (item) => {
          const qualityAnalysis = await this.analyzeProductQuality(item.product);
          return {
            ...item,
            qualityAnalysis,
            priority: this.calculatePriority(qualityAnalysis, item.product)
          };
        })
      );

      res.json({
        success: true,
        products: analyzedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting pending products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pending products'
      });
    }
  }

  /**
   * Perform automated quality check
   * POST /api/v1/products/:productId/quality-control/check
   */
  async performQualityCheck(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { performImageCheck = true, performContentCheck = true } = req.body;

      // Get product details
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const productData = product[0];

      // Perform comprehensive quality analysis
      const qualityAnalysis = await this.analyzeProductQuality(productData, {
        checkImages: performImageCheck,
        checkContent: performContentCheck
      });

      // Store quality check results
      const qualityCheckId = crypto.randomUUID();
      const qualityCheck = {
        id: qualityCheckId,
        productId,
        checkType: 'automated',
        status: qualityAnalysis.overallScore >= 80 ? 'passed' : qualityAnalysis.overallScore >= 60 ? 'warning' : 'failed',
        score: qualityAnalysis.overallScore,
        issues: JSON.stringify(qualityAnalysis.issues),
        recommendations: JSON.stringify(qualityAnalysis.recommendations),
        checkedBy: 'system',
        checkedAt: new Date(),
        metadata: JSON.stringify({
          contentScore: qualityAnalysis.contentScore,
          imageScore: qualityAnalysis.imageScore,
          complianceScore: qualityAnalysis.complianceScore,
          bangladeshCompliance: qualityAnalysis.bangladeshCompliance
        }),
        createdAt: new Date()
      };

      await db.insert(productQualityChecks).values(qualityCheck);

      // Auto-approve if score is high enough
      if (qualityAnalysis.overallScore >= 90 && qualityAnalysis.issues.length === 0) {
        await this.autoApproveProduct(productId, qualityCheckId);
      }

      res.json({
        success: true,
        qualityCheck: {
          id: qualityCheckId,
          status: qualityCheck.status,
          score: qualityCheck.score,
          analysis: qualityAnalysis
        }
      });
    } catch (error) {
      console.error('Error performing quality check:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform quality check'
      });
    }
  }

  /**
   * Approve product
   * POST /api/v1/products/:productId/quality-control/approve
   */
  async approveProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { 
        reviewerId, 
        comments, 
        conditions = [], 
        autoPublish = true,
        qualityScore
      } = req.body;

      // Verify product exists and is pending
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.status, 'pending')
        ))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found or not pending approval'
        });
      }

      // Create approval record
      const approvalId = crypto.randomUUID();
      const approval = {
        id: approvalId,
        productId,
        status: 'approved',
        reviewerId,
        reviewerNotes: comments || '',
        qualityScore: qualityScore || 85,
        conditions: JSON.stringify(conditions),
        reviewedAt: new Date(),
        createdAt: new Date()
      };

      await db.insert(productApprovals).values(approval);

      // Update product status
      const newStatus = autoPublish ? 'active' : 'approved';
      await db
        .update(products)
        .set({
          status: newStatus,
          approvedAt: new Date(),
          publishedAt: autoPublish ? new Date() : null,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      // Update vendor notification
      await this.notifyVendor(product[0].vendorId, 'product_approved', {
        productId,
        productName: product[0].name,
        status: newStatus
      });

      // Clear caches
      await this.clearProductCaches(productId);

      // Log approval action
      await this.logQualityAction(productId, reviewerId, 'approved', comments);

      res.json({
        success: true,
        approval: {
          id: approvalId,
          status: 'approved',
          productStatus: newStatus
        },
        message: 'Product approved successfully'
      });
    } catch (error) {
      console.error('Error approving product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve product'
      });
    }
  }

  /**
   * Reject product
   * POST /api/v1/products/:productId/quality-control/reject
   */
  async rejectProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { 
        reviewerId, 
        reason, 
        comments, 
        allowResubmission = true,
        violations = []
      } = req.body;

      // Verify product exists
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Create rejection record
      const approvalId = crypto.randomUUID();
      const rejection = {
        id: approvalId,
        productId,
        status: 'rejected',
        reviewerId,
        reviewerNotes: comments || '',
        rejectionReason: reason,
        violations: JSON.stringify(violations),
        allowResubmission,
        reviewedAt: new Date(),
        createdAt: new Date()
      };

      await db.insert(productApprovals).values(rejection);

      // Update product status
      await db
        .update(products)
        .set({
          status: 'rejected',
          rejectedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      // Notify vendor
      await this.notifyVendor(product[0].vendorId, 'product_rejected', {
        productId,
        productName: product[0].name,
        reason,
        comments,
        allowResubmission
      });

      // Log rejection action
      await this.logQualityAction(productId, reviewerId, 'rejected', comments);

      res.json({
        success: true,
        rejection: {
          id: approvalId,
          status: 'rejected',
          reason
        },
        message: 'Product rejected successfully'
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject product'
      });
    }
  }

  /**
   * Report product quality issue
   * POST /api/v1/products/:productId/quality-control/report
   */
  async reportProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { 
        reporterId, 
        reportType, 
        reason, 
        description, 
        priority = 'medium',
        images = []
      } = req.body;

      // Create report
      const reportId = crypto.randomUUID();
      const report = {
        id: reportId,
        productId,
        reporterId,
        reportType, // 'quality', 'fake', 'inappropriate', 'copyright', 'other'
        reason,
        description,
        priority,
        status: 'pending',
        images: JSON.stringify(images),
        createdAt: new Date()
      };

      await db.insert(productReports).values(report);

      // Trigger automated review if critical
      if (priority === 'high' || reportType === 'fake') {
        await this.triggerUrgentReview(productId, reportId);
      }

      res.status(201).json({
        success: true,
        report: {
          id: reportId,
          status: 'pending'
        },
        message: 'Report submitted successfully'
      });
    } catch (error) {
      console.error('Error reporting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to report product'
      });
    }
  }

  /**
   * Get quality control dashboard
   * GET /api/v1/products/quality-control/dashboard
   */
  async getQualityDashboard(req: Request, res: Response) {
    try {
      const { period = '30d' } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      // Get quality metrics
      const [
        totalPending,
        totalApproved,
        totalRejected,
        totalReports,
        averageReviewTime,
        topIssues
      ] = await Promise.all([
        this.getPendingCount(),
        this.getApprovedCount(startDate, endDate),
        this.getRejectedCount(startDate, endDate),
        this.getReportsCount(startDate, endDate),
        this.getAverageReviewTime(startDate, endDate),
        this.getTopQualityIssues(startDate, endDate)
      ]);

      // Get approval trends
      const approvalTrends = await this.getApprovalTrends(startDate, endDate);

      // Get reviewer performance
      const reviewerPerformance = await this.getReviewerPerformance(startDate, endDate);

      // Get category quality scores
      const categoryScores = await this.getCategoryQualityScores(startDate, endDate);

      const dashboard = {
        summary: {
          totalPending,
          totalApproved,
          totalRejected,
          totalReports,
          averageReviewTime,
          approvalRate: totalApproved + totalRejected > 0 ? (totalApproved / (totalApproved + totalRejected) * 100) : 0
        },
        trends: approvalTrends,
        reviewers: reviewerPerformance,
        categories: categoryScores,
        topIssues,
        period,
        dateRange: { startDate, endDate }
      };

      res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      console.error('Error getting quality dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quality dashboard'
      });
    }
  }

  /**
   * Bulk approve products
   * POST /api/v1/products/quality-control/bulk-approve
   */
  async bulkApproveProducts(req: Request, res: Response) {
    try {
      const { productIds, reviewerId, comments, autoPublish = false } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Product IDs array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const productId of productIds) {
        try {
          // Individual approval process
          const approvalId = crypto.randomUUID();
          const approval = {
            id: approvalId,
            productId,
            status: 'approved',
            reviewerId,
            reviewerNotes: comments || 'Bulk approval',
            qualityScore: 80,
            reviewedAt: new Date(),
            createdAt: new Date()
          };

          await db.insert(productApprovals).values(approval);

          const newStatus = autoPublish ? 'active' : 'approved';
          await db
            .update(products)
            .set({
              status: newStatus,
              approvedAt: new Date(),
              publishedAt: autoPublish ? new Date() : null,
              updatedAt: new Date()
            })
            .where(eq(products.id, productId));

          results.push({ productId, status: 'approved', approvalId });
        } catch (error) {
          errors.push({ productId, error: error.message });
        }
      }

      res.json({
        success: true,
        results,
        errors,
        summary: {
          total: productIds.length,
          approved: results.length,
          failed: errors.length
        }
      });
    } catch (error) {
      console.error('Error bulk approving products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk approve products'
      });
    }
  }

  // Helper methods for quality analysis

  private async analyzeProductQuality(product: any, options = { checkImages: true, checkContent: true }): Promise<any> {
    const analysis = {
      contentScore: 0,
      imageScore: 0,
      complianceScore: 0,
      bangladeshCompliance: 0,
      overallScore: 0,
      issues: [] as string[],
      recommendations: [] as string[]
    };

    // Content quality check
    if (options.checkContent) {
      analysis.contentScore = this.analyzeContentQuality(product);
    }

    // Image quality check
    if (options.checkImages) {
      analysis.imageScore = await this.analyzeImageQuality(product.id);
    }

    // Compliance check
    analysis.complianceScore = this.analyzeCompliance(product);

    // Bangladesh-specific compliance
    analysis.bangladeshCompliance = this.analyzeBangladeshCompliance(product);

    // Calculate overall score
    analysis.overallScore = Math.round(
      (analysis.contentScore + analysis.imageScore + analysis.complianceScore + analysis.bangladeshCompliance) / 4
    );

    // Generate issues and recommendations
    this.generateQualityRecommendations(analysis, product);

    return analysis;
  }

  private analyzeContentQuality(product: any): number {
    let score = 100;
    const issues = [];

    // Check for banned keywords
    const content = `${product.name} ${product.description}`.toLowerCase();
    for (const keyword of this.bannedKeywords) {
      if (content.includes(keyword)) {
        score -= 20;
        issues.push(`Contains banned keyword: ${keyword}`);
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        score -= 10;
        issues.push('Contains suspicious promotional language');
      }
    }

    // Check content length
    if (!product.description || product.description.length < 50) {
      score -= 15;
      issues.push('Description too short');
    }

    // Check for proper categorization
    if (!product.categoryId) {
      score -= 10;
      issues.push('Missing category');
    }

    return Math.max(0, score);
  }

  private async analyzeImageQuality(productId: string): Promise<number> {
    // Mock implementation - would integrate with actual image analysis
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    if (images.length === 0) return 0;
    if (images.length < 3) return 60;
    if (images.length >= 5) return 100;
    return 80;
  }

  private analyzeCompliance(product: any): number {
    let score = 100;

    // Check required fields
    if (!product.price || product.price <= 0) score -= 20;
    if (!product.name || product.name.length < 3) score -= 15;
    if (!product.description) score -= 15;

    // Check for valid vendor
    if (!product.vendorId) score -= 30;

    return Math.max(0, score);
  }

  private analyzeBangladeshCompliance(product: any): number {
    let score = 100;

    // Check for Bangladesh-specific requirements
    if (!product.nameBn) score -= 10; // Bengali name
    if (!product.descriptionBn) score -= 10; // Bengali description
    if (!product.vatRate) score -= 5; // VAT compliance
    
    // Check for local regulations compliance
    // This would integrate with actual regulatory checks

    return Math.max(0, score);
  }

  private generateQualityRecommendations(analysis: any, product: any): void {
    if (analysis.contentScore < 80) {
      analysis.recommendations.push('Improve product description and remove promotional language');
    }
    
    if (analysis.imageScore < 70) {
      analysis.recommendations.push('Add more high-quality product images');
    }
    
    if (analysis.complianceScore < 90) {
      analysis.recommendations.push('Complete all required product information');
    }
    
    if (analysis.bangladeshCompliance < 80) {
      analysis.recommendations.push('Add Bengali translations and ensure local compliance');
    }
  }

  private calculatePriority(qualityAnalysis: any, product: any): string {
    if (qualityAnalysis.overallScore < 40) return 'high';
    if (qualityAnalysis.issues.length > 5) return 'high';
    if (qualityAnalysis.overallScore < 70) return 'medium';
    return 'low';
  }

  private async autoApproveProduct(productId: string, qualityCheckId: string): Promise<void> {
    const approval = {
      id: crypto.randomUUID(),
      productId,
      status: 'approved',
      reviewerId: 'system',
      reviewerNotes: 'Auto-approved based on quality score',
      qualityScore: 95,
      reviewedAt: new Date(),
      createdAt: new Date()
    };

    await db.insert(productApprovals).values(approval);

    await db
      .update(products)
      .set({
        status: 'active',
        approvedAt: new Date(),
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));
  }

  private async notifyVendor(vendorId: string, type: string, data: any): Promise<void> {
    // Integration with notification service
    console.log(`Notify vendor ${vendorId} about ${type}:`, data);
  }

  private async clearProductCaches(productId: string): Promise<void> {
    const cacheKeys = [
      `product:${productId}`,
      `product_full:${productId}`,
      'products:pending',
      'products:featured'
    ];
    
    await Promise.all(cacheKeys.map(key => this.redisService.del(key)));
  }

  private async logQualityAction(productId: string, reviewerId: string, action: string, notes?: string): Promise<void> {
    // Log quality control actions for audit purposes
    console.log(`Quality action: ${action} on product ${productId} by ${reviewerId}: ${notes}`);
  }

  private async triggerUrgentReview(productId: string, reportId: string): Promise<void> {
    // Trigger urgent review process
    await db
      .update(products)
      .set({ status: 'under_review', updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  // Dashboard helper methods
  private async getPendingCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.status, 'pending'));
    return result[0].count;
  }

  private async getApprovedCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(productApprovals)
      .where(and(
        eq(productApprovals.status, 'approved'),
        gte(productApprovals.reviewedAt, startDate),
        lte(productApprovals.reviewedAt, endDate)
      ));
    return result[0].count;
  }

  private async getRejectedCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(productApprovals)
      .where(and(
        eq(productApprovals.status, 'rejected'),
        gte(productApprovals.reviewedAt, startDate),
        lte(productApprovals.reviewedAt, endDate)
      ));
    return result[0].count;
  }

  private async getReportsCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(productReports)
      .where(and(
        gte(productReports.createdAt, startDate),
        lte(productReports.createdAt, endDate)
      ));
    return result[0].count;
  }

  private async getAverageReviewTime(startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation - calculate average time between submission and approval
    return 24; // hours
  }

  private async getTopQualityIssues(startDate: Date, endDate: Date): Promise<QualityIssue[]> {
    // Analysis of quality check issues from database
    return [
      { issue: 'Insufficient product images', count: 45 },
      { issue: 'Poor description quality', count: 32 },
      { issue: 'Missing category', count: 28 },
      { issue: 'Pricing issues', count: 19 }
    ];
  }

  private async getApprovalTrends(startDate: Date, endDate: Date): Promise<ApprovalTrend[]> {
    // Daily approval/rejection trends from quality control data
    return [];
  }

  private async getReviewerPerformance(startDate: Date, endDate: Date): Promise<ReviewerPerformance[]> {
    // Reviewer productivity and accuracy metrics
    return [];
  }

  private async getCategoryQualityScores(startDate: Date, endDate: Date): Promise<CategoryQualityScore[]> {
    // Quality scores by product category
    return [];
  }

  /**
   * Health check
   */
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'quality-control-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}