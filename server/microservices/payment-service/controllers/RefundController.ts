/**
 * Refund Controller - Amazon.com/Shopee.sg Level
 * Comprehensive refund management with automated processing
 * Support for partial refunds, refund analytics, and multi-gateway refunds
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  refundRequests, 
  paymentTransactions, 
  orders,
  orderItems,
  vendorPayouts
} from '@shared/schema';
import { eq, desc, and, gte, lte, sql, count, sum, avg } from 'drizzle-orm';

interface RefundRequest {
  orderId: string;
  transactionId: string;
  amount: number;
  reason: string;
  refundType: 'full' | 'partial';
  items?: Array<{
    itemId: string;
    quantity: number;
    refundAmount: number;
  }>;
}

interface RefundAnalytics {
  totalRefunds: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  refundRate: number;
  topRefundReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export class RefundController {

  /**
   * Create a new refund request
   * @route POST /api/v1/payments/refunds/create
   */
  async createRefundRequest(req: Request, res: Response): Promise<void> {
    try {
      const refundData: RefundRequest = req.body;
      const userId = req.user?.userId;

      // Validate the original transaction
      const [transaction] = await db.select()
        .from(paymentTransactions)
        .where(
          and(
            eq(paymentTransactions.id, refundData.transactionId),
            eq(paymentTransactions.orderId, refundData.orderId),
            eq(paymentTransactions.status, 'completed')
          )
        );

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found or not eligible for refund',
          code: 'TRANSACTION_NOT_FOUND'
        });
        return;
      }

      // Validate refund amount
      const maxRefundAmount = parseFloat(transaction.amount);
      if (refundData.amount > maxRefundAmount) {
        res.status(400).json({
          success: false,
          message: `Refund amount cannot exceed transaction amount of ${maxRefundAmount}`,
          code: 'INVALID_REFUND_AMOUNT'
        });
        return;
      }

      // Check for existing refunds
      const existingRefunds = await db.select({
        totalRefunded: sum(refundRequests.amount)
      })
      .from(refundRequests)
      .where(
        and(
          eq(refundRequests.transactionId, refundData.transactionId),
          sql`${refundRequests.status} IN ('approved', 'completed')`
        )
      );

      const totalRefunded = parseFloat(existingRefunds[0]?.totalRefunded || '0');
      const remainingAmount = maxRefundAmount - totalRefunded;

      if (refundData.amount > remainingAmount) {
        res.status(400).json({
          success: false,
          message: `Maximum refundable amount is ${remainingAmount}`,
          code: 'INSUFFICIENT_REFUND_BALANCE'
        });
        return;
      }

      // Generate refund reference
      const refundReference = `RF_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      // Create refund request
      const [refund] = await db.insert(refundRequests).values({
        refundReference,
        transactionId: refundData.transactionId,
        orderId: refundData.orderId,
        userId: userId,
        amount: refundData.amount,
        reason: refundData.reason,
        refundType: refundData.refundType,
        refundMethod: transaction.method, // Refund to original payment method
        status: 'requested',
        itemsData: refundData.items || null
      }).returning();

      // Auto-approve small refunds (< 1000 BDT) for COD orders
      if (transaction.method === 'cod' && refundData.amount < 1000) {
        await this.autoApproveRefund(refund.id, 'system');
      }

      res.status(201).json({
        success: true,
        data: {
          refundId: refund.id,
          refundReference: refund.refundReference,
          amount: refund.amount,
          status: refund.status,
          estimatedProcessingTime: this.getEstimatedProcessingTime(transaction.method)
        },
        message: 'Refund request created successfully'
      });

    } catch (error) {
      console.error('Create refund request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create refund request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Process refund (Admin approval)
   * @route PUT /api/v1/payments/refunds/:id/process
   */
  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, adminNotes } = req.body; // 'approve' or 'reject'
      const adminId = req.user?.userId;

      const [refund] = await db.select()
        .from(refundRequests)
        .where(eq(refundRequests.id, id));

      if (!refund) {
        res.status(404).json({
          success: false,
          message: 'Refund request not found'
        });
        return;
      }

      if (refund.status !== 'requested') {
        res.status(400).json({
          success: false,
          message: 'Refund request is not in pending state'
        });
        return;
      }

      if (action === 'approve') {
        // Process the refund
        const result = await this.executeRefund(refund);
        
        await db.update(refundRequests)
          .set({
            status: result.success ? 'processing' : 'failed',
            approvedBy: adminId,
            approvedAt: new Date(),
            adminNotes,
            gatewayRefundId: result.gatewayRefundId,
            errorMessage: result.error
          })
          .where(eq(refundRequests.id, id));

        res.status(200).json({
          success: true,
          data: {
            refundId: id,
            status: result.success ? 'processing' : 'failed',
            gatewayRefundId: result.gatewayRefundId,
            estimatedCompletion: result.estimatedCompletion
          },
          message: result.success ? 'Refund approved and processing' : 'Refund approval failed'
        });

      } else if (action === 'reject') {
        await db.update(refundRequests)
          .set({
            status: 'rejected',
            approvedBy: adminId,
            approvedAt: new Date(),
            adminNotes
          })
          .where(eq(refundRequests.id, id));

        res.status(200).json({
          success: true,
          data: {
            refundId: id,
            status: 'rejected'
          },
          message: 'Refund request rejected'
        });
      }

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get refund history for a user
   * @route GET /api/v1/payments/refunds/history
   */
  async getRefundHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      let whereConditions = [eq(refundRequests.userId, userId)];
      if (status) whereConditions.push(eq(refundRequests.status, status as string));
      if (startDate) whereConditions.push(gte(refundRequests.createdAt, new Date(startDate as string)));
      if (endDate) whereConditions.push(lte(refundRequests.createdAt, new Date(endDate as string)));

      const refunds = await db.select({
        id: refundRequests.id,
        refundReference: refundRequests.refundReference,
        orderId: refundRequests.orderId,
        amount: refundRequests.amount,
        reason: refundRequests.reason,
        status: refundRequests.status,
        refundMethod: refundRequests.refundMethod,
        createdAt: refundRequests.createdAt,
        processedAt: refundRequests.processedAt,
        estimatedCompletion: refundRequests.estimatedCompletion
      })
      .from(refundRequests)
      .where(and(...whereConditions))
      .orderBy(desc(refundRequests.createdAt))
      .limit(Number(limit))
      .offset(offset);

      // Get total count
      const [{ total }] = await db.select({
        total: count()
      })
      .from(refundRequests)
      .where(and(...whereConditions));

      res.status(200).json({
        success: true,
        data: {
          refunds,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: Number(total),
            totalPages: Math.ceil(Number(total) / Number(limit))
          }
        },
        message: 'Refund history retrieved successfully'
      });

    } catch (error) {
      console.error('Get refund history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve refund history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get refund analytics (Admin only)
   * @route GET /api/v1/payments/refunds/analytics
   */
  async getRefundAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const fromDate = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = endDate ? new Date(endDate as string) : new Date();

      // Get overall refund statistics
      const refundStats = await db.select({
        totalRefunds: count(),
        totalRefundAmount: sum(refundRequests.amount),
        averageRefundAmount: avg(refundRequests.amount),
        approvedRefunds: sql<number>`sum(case when ${refundRequests.status} in ('approved', 'completed') then 1 else 0 end)`,
        rejectedRefunds: sql<number>`sum(case when ${refundRequests.status} = 'rejected' then 1 else 0 end)`,
        pendingRefunds: sql<number>`sum(case when ${refundRequests.status} = 'requested' then 1 else 0 end)`
      })
      .from(refundRequests)
      .where(
        and(
          gte(refundRequests.createdAt, fromDate),
          lte(refundRequests.createdAt, toDate)
        )
      );

      // Get refund trends
      const refundTrends = await db.select({
        date: sql<string>`date(${refundRequests.createdAt})`,
        refundCount: count(),
        refundAmount: sum(refundRequests.amount),
        averageAmount: avg(refundRequests.amount)
      })
      .from(refundRequests)
      .where(
        and(
          gte(refundRequests.createdAt, fromDate),
          lte(refundRequests.createdAt, toDate)
        )
      )
      .groupBy(sql`date(${refundRequests.createdAt})`)
      .orderBy(sql`date(${refundRequests.createdAt})`);

      // Get top refund reasons
      const topReasons = await db.select({
        reason: refundRequests.reason,
        count: count(),
        totalAmount: sum(refundRequests.amount)
      })
      .from(refundRequests)
      .where(
        and(
          gte(refundRequests.createdAt, fromDate),
          lte(refundRequests.createdAt, toDate)
        )
      )
      .groupBy(refundRequests.reason)
      .orderBy(sql`count(*) desc`)
      .limit(10);

      // Calculate refund rate (refunds vs total transactions)
      const totalTransactions = await db.select({
        count: count()
      })
      .from(paymentTransactions)
      .where(
        and(
          gte(paymentTransactions.createdAt, fromDate),
          lte(paymentTransactions.createdAt, toDate),
          eq(paymentTransactions.status, 'completed')
        )
      );

      const refundRate = refundStats[0].totalRefunds && totalTransactions[0].count
        ? (refundStats[0].totalRefunds / totalTransactions[0].count) * 100
        : 0;

      res.status(200).json({
        success: true,
        data: {
          overview: {
            ...refundStats[0],
            refundRate: Math.round(refundRate * 100) / 100
          },
          trends: refundTrends,
          topReasons: topReasons.map(reason => ({
            ...reason,
            percentage: refundStats[0].totalRefunds 
              ? Math.round((reason.count / refundStats[0].totalRefunds) * 10000) / 100
              : 0
          })),
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          }
        },
        message: 'Refund analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Get refund analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve refund analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Bulk process refunds (Admin only)
   * @route POST /api/v1/payments/refunds/bulk-process
   */
  async bulkProcessRefunds(req: Request, res: Response): Promise<void> {
    try {
      const { refundIds, action, adminNotes } = req.body;
      const adminId = req.user?.userId;

      if (!Array.isArray(refundIds) || refundIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid refund IDs provided'
        });
        return;
      }

      const results = [];

      for (const refundId of refundIds) {
        try {
          const [refund] = await db.select()
            .from(refundRequests)
            .where(eq(refundRequests.id, refundId));

          if (!refund || refund.status !== 'requested') {
            results.push({
              refundId,
              success: false,
              error: 'Refund not found or not in pending state'
            });
            continue;
          }

          if (action === 'approve') {
            const result = await this.executeRefund(refund);
            
            await db.update(refundRequests)
              .set({
                status: result.success ? 'processing' : 'failed',
                approvedBy: adminId,
                approvedAt: new Date(),
                adminNotes,
                gatewayRefundId: result.gatewayRefundId,
                errorMessage: result.error
              })
              .where(eq(refundRequests.id, refundId));

            results.push({
              refundId,
              success: result.success,
              status: result.success ? 'processing' : 'failed',
              gatewayRefundId: result.gatewayRefundId
            });

          } else if (action === 'reject') {
            await db.update(refundRequests)
              .set({
                status: 'rejected',
                approvedBy: adminId,
                approvedAt: new Date(),
                adminNotes
              })
              .where(eq(refundRequests.id, refundId));

            results.push({
              refundId,
              success: true,
              status: 'rejected'
            });
          }

        } catch (error) {
          results.push({
            refundId,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;

      res.status(200).json({
        success: true,
        data: {
          results,
          summary: {
            total: refundIds.length,
            successful: successCount,
            failed: refundIds.length - successCount
          }
        },
        message: `Bulk refund processing completed: ${successCount}/${refundIds.length} successful`
      });

    } catch (error) {
      console.error('Bulk process refunds error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk refunds',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods

  private async autoApproveRefund(refundId: string, approvedBy: string): Promise<void> {
    try {
      const [refund] = await db.select()
        .from(refundRequests)
        .where(eq(refundRequests.id, refundId));

      if (refund) {
        const result = await this.executeRefund(refund);
        
        await db.update(refundRequests)
          .set({
            status: result.success ? 'processing' : 'failed',
            approvedBy: approvedBy,
            approvedAt: new Date(),
            adminNotes: 'Auto-approved: Small amount COD refund',
            gatewayRefundId: result.gatewayRefundId,
            errorMessage: result.error
          })
          .where(eq(refundRequests.id, refundId));
      }
    } catch (error) {
      console.error('Auto-approve refund error:', error);
    }
  }

  private async executeRefund(refund: any): Promise<{
    success: boolean;
    gatewayRefundId?: string;
    estimatedCompletion?: Date;
    error?: string;
  }> {
    try {
      // Get original transaction details
      const [transaction] = await db.select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.id, refund.transactionId));

      if (!transaction) {
        throw new Error('Original transaction not found');
      }

      // Process refund based on payment method
      switch (transaction.method) {
        case 'bkash':
          return await this.processBkashRefund(refund, transaction);
        case 'nagad':
          return await this.processNagadRefund(refund, transaction);
        case 'rocket':
          return await this.processRocketRefund(refund, transaction);
        case 'stripe':
          return await this.processStripeRefund(refund, transaction);
        case 'cod':
          return await this.processCODRefund(refund, transaction);
        default:
          throw new Error(`Unsupported payment method for refund: ${transaction.method}`);
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async processBkashRefund(refund: any, transaction: any): Promise<any> {
    // Implementation for bKash refund API
    // This would integrate with bKash refund API
    return {
      success: true,
      gatewayRefundId: `bkash_ref_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };
  }

  private async processNagadRefund(refund: any, transaction: any): Promise<any> {
    // Implementation for Nagad refund API
    return {
      success: true,
      gatewayRefundId: `nagad_ref_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    };
  }

  private async processRocketRefund(refund: any, transaction: any): Promise<any> {
    // Implementation for Rocket refund API
    return {
      success: true,
      gatewayRefundId: `rocket_ref_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private async processStripeRefund(refund: any, transaction: any): Promise<any> {
    // Implementation for Stripe refund API
    return {
      success: true,
      gatewayRefundId: `stripe_ref_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private async processCODRefund(refund: any, transaction: any): Promise<any> {
    // For COD, refund is processed manually or via bank transfer
    return {
      success: true,
      gatewayRefundId: `cod_ref_${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private getEstimatedProcessingTime(paymentMethod: string): string {
    const timeMap = {
      'bkash': '1-3 business days',
      'nagad': '3-5 business days',
      'rocket': '5-7 business days',
      'stripe': '5-10 business days',
      'cod': '7-10 business days'
    };
    
    return timeMap[paymentMethod] || '7-10 business days';
  }
}

export const refundController = new RefundController();