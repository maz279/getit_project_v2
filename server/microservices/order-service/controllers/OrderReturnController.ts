/**
 * Order Return Controller - Amazon.com/Shopee.sg-Level Return & Refund Management
 * Handles complete return lifecycle with Bangladesh-specific policies
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  orderReturns, 
  orders, 
  orderItems, 
  vendors,
  users,
  paymentTransactions,
  orderStatusHistory,
  type OrderStatus
} from '../../../../shared/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { LoggingService } from '../../../services/LoggingService';
import { RedisService } from '../../../services/RedisService';

export class OrderReturnController {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Initiate return request
   */
  async initiateReturn(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const {
        orderItemIds, // Array of item IDs to return
        reason,
        description,
        returnType = 'refund', // refund, exchange, store_credit
        images, // Supporting images
        preferredRefundMethod
      } = req.body;
      const userId = req.user?.id;

      // Validate order ownership
      const [order] = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.id, orderId),
          eq(orders.userId, userId)
        ));

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found or access denied'
        });
        return;
      }

      // Check return eligibility
      const eligibility = await this.checkReturnEligibility(orderId, orderItemIds);
      if (!eligibility.eligible) {
        res.status(400).json({
          success: false,
          message: eligibility.reason,
          details: eligibility
        });
        return;
      }

      // Get order items to return
      const itemsToReturn = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          vendorId: orderItems.vendorId,
          name: orderItems.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          vendorBusinessName: vendors.businessName
        })
        .from(orderItems)
        .leftJoin(vendors, eq(orderItems.vendorId, vendors.id))
        .where(and(
          eq(orderItems.orderId, orderId),
          inArray(orderItems.id, orderItemIds)
        ));

      // Calculate return amount
      const returnAmount = itemsToReturn.reduce((sum, item) => 
        sum + Number(item.totalPrice), 0
      );

      // Generate return authorization number
      const returnAuthNumber = await this.generateReturnAuthNumber();

      // Create return requests for each item (grouped by vendor)
      const vendorGroups = this.groupItemsByVendor(itemsToReturn);
      const returnRequests = [];

      for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
        const vendorReturnAmount = vendorItems.reduce((sum, item) => 
          sum + Number(item.totalPrice), 0
        );

        const [returnRequest] = await db.insert(orderReturns).values({
          orderId,
          orderItemIds: vendorItems.map(item => item.id),
          vendorId,
          userId,
          returnAuthNumber,
          reason,
          description,
          returnType,
          status: 'requested',
          requestedAmount: returnAmount.toString(),
          vendorReturnAmount: vendorReturnAmount.toString(),
          supportingImages: images || [],
          preferredRefundMethod,
          isPartialReturn: itemsToReturn.length !== await this.getTotalOrderItemsCount(orderId),
          returnPolicy: await this.getReturnPolicyForVendor(vendorId),
          bangladeshSpecific: {
            codOriginal: order.paymentMethod === 'cod',
            vatRefundable: true,
            refundMethod: this.getBangladeshRefundMethods(order.paymentMethod),
            maxProcessingDays: this.getReturnProcessingDays(reason)
          },
          metadata: {
            initiatedBy: 'customer',
            originalPaymentMethod: order.paymentMethod,
            orderStatus: order.status,
            requestIP: req.ip,
            userAgent: req.get('User-Agent')
          }
        }).returning();

        returnRequests.push({
          ...returnRequest,
          items: vendorItems
        });
      }

      // Add status history
      await db.insert(orderStatusHistory).values({
        orderId,
        status: 'return_requested' as OrderStatus,
        notes: `Return requested: ${reason}`,
        changedBy: userId.toString(),
        changedAt: new Date(),
        metadata: {
          returnAuthNumber,
          returnType,
          itemCount: orderItemIds.length,
          returnAmount
        }
      });

      // Send notifications to vendors and customer
      await this.sendReturnNotifications(orderId, returnAuthNumber, vendorGroups);

      // Generate return label if applicable
      let returnLabel = null;
      if (returnType === 'refund' && reason !== 'change_of_mind') {
        returnLabel = await this.generateReturnLabel(orderId, returnAuthNumber);
      }

      this.loggingService.info('Return request initiated', {
        orderId,
        returnAuthNumber,
        returnType,
        itemCount: orderItemIds.length,
        returnAmount
      });

      res.status(201).json({
        success: true,
        data: {
          returnAuthNumber,
          returnRequests,
          returnAmount,
          estimatedProcessingDays: this.getReturnProcessingDays(reason),
          returnLabel,
          nextSteps: [
            'Wait for vendor approval',
            'Receive return shipping label (if applicable)',
            'Pack and ship items back',
            'Track return package',
            'Receive refund confirmation'
          ],
          bangladeshFeatures: {
            codRefundSupported: true,
            mobileBankingRefund: order.paymentMethod !== 'cod',
            vatRefundIncluded: true,
            processingLocation: 'Dhaka, Bangladesh'
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Initiate return error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to initiate return request',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get return requests for customer
   */
  async getCustomerReturns(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate
      } = req.query;

      let conditions = eq(orderReturns.userId, userId);
      
      if (status) {
        conditions = and(conditions, eq(orderReturns.status, status as string));
      }
      
      if (startDate) {
        conditions = and(conditions, gte(orderReturns.createdAt, new Date(startDate as string)));
      }
      
      if (endDate) {
        conditions = and(conditions, lte(orderReturns.createdAt, new Date(endDate as string)));
      }

      const customerReturns = await db
        .select({
          id: orderReturns.id,
          orderId: orderReturns.orderId,
          returnAuthNumber: orderReturns.returnAuthNumber,
          reason: orderReturns.reason,
          returnType: orderReturns.returnType,
          status: orderReturns.status,
          requestedAmount: orderReturns.requestedAmount,
          refundedAmount: orderReturns.refundedAmount,
          createdAt: orderReturns.createdAt,
          updatedAt: orderReturns.updatedAt,
          orderNumber: orders.orderNumber,
          vendorBusinessName: vendors.businessName
        })
        .from(orderReturns)
        .leftJoin(orders, eq(orderReturns.orderId, orders.id))
        .leftJoin(vendors, eq(orderReturns.vendorId, vendors.id))
        .where(conditions)
        .orderBy(desc(orderReturns.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Get return items for each return
      const returnsWithItems = await Promise.all(
        customerReturns.map(async (returnReq) => {
          const items = await this.getReturnItems(returnReq.id);
          const tracking = await this.getReturnTracking(returnReq.id);
          
          return {
            ...returnReq,
            items,
            tracking,
            canCancel: this.canCancelReturn(returnReq.status),
            estimatedCompletion: this.estimateReturnCompletion(returnReq.createdAt, returnReq.status)
          };
        })
      );

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orderReturns)
        .where(conditions);

      res.status(200).json({
        success: true,
        data: {
          returns: returnsWithItems,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalCount: count,
            totalPages: Math.ceil(count / Number(limit))
          },
          summary: {
            totalReturns: count,
            pendingReturns: returnsWithItems.filter(r => ['requested', 'approved', 'in_transit'].includes(r.status)).length,
            completedReturns: returnsWithItems.filter(r => r.status === 'completed').length
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Get customer returns error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve returns',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get vendor return requests
   */
  async getVendorReturns(req: Request, res: Response): Promise<void> {
    try {
      const vendorId = req.vendor?.id || req.query.vendorId as string;
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        priority
      } = req.query;

      let conditions = eq(orderReturns.vendorId, vendorId);
      
      if (status) {
        conditions = and(conditions, eq(orderReturns.status, status as string));
      }

      const vendorReturns = await db
        .select({
          id: orderReturns.id,
          orderId: orderReturns.orderId,
          returnAuthNumber: orderReturns.returnAuthNumber,
          reason: orderReturns.reason,
          description: orderReturns.description,
          returnType: orderReturns.returnType,
          status: orderReturns.status,
          requestedAmount: orderReturns.requestedAmount,
          vendorReturnAmount: orderReturns.vendorReturnAmount,
          supportingImages: orderReturns.supportingImages,
          createdAt: orderReturns.createdAt,
          orderNumber: orders.orderNumber,
          customerName: users.fullName,
          customerEmail: users.email,
          customerPhone: users.phone
        })
        .from(orderReturns)
        .leftJoin(orders, eq(orderReturns.orderId, orders.id))
        .leftJoin(users, eq(orderReturns.userId, users.id))
        .where(conditions)
        .orderBy(desc(orderReturns.createdAt))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      // Enhance with vendor-specific data
      const returnsWithDetails = await Promise.all(
        vendorReturns.map(async (returnReq) => {
          const items = await this.getReturnItems(returnReq.id);
          const policy = await this.getReturnPolicyForVendor(vendorId);
          
          return {
            ...returnReq,
            items,
            policy,
            actionRequired: this.getRequiredVendorAction(returnReq.status),
            deadlines: this.getReturnDeadlines(returnReq.createdAt, returnReq.status),
            riskLevel: this.assessReturnRisk(returnReq),
            financialImpact: {
              refundAmount: Number(returnReq.vendorReturnAmount),
              commissionImpact: this.calculateCommissionImpact(returnReq.vendorReturnAmount),
              restockingFee: this.calculateRestockingFee(returnReq.reason, returnReq.vendorReturnAmount)
            }
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          returns: returnsWithDetails,
          analytics: await this.getVendorReturnAnalytics(vendorId),
          policies: await this.getReturnPolicyForVendor(vendorId),
          bangladeshGuidelines: {
            maxResponseTime: '24 hours',
            refundTimeline: '7-14 business days',
            inspectionRequired: true,
            codRefundProcess: 'Bank transfer or mobile banking'
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Get vendor returns error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve vendor returns',
        error: (error as Error).message
      });
    }
  }

  /**
   * Vendor approve/reject return
   */
  async processVendorReturnDecision(req: Request, res: Response): Promise<void> {
    try {
      const { returnId } = req.params;
      const { decision, reason, notes, inspectionResults, refundAmount } = req.body; // approve, reject, request_more_info
      const vendorId = req.vendor?.id || req.query.vendorId as string;

      // Get return request
      const [returnRequest] = await db
        .select()
        .from(orderReturns)
        .where(and(
          eq(orderReturns.id, returnId),
          eq(orderReturns.vendorId, vendorId)
        ));

      if (!returnRequest) {
        res.status(404).json({
          success: false,
          message: 'Return request not found'
        });
        return;
      }

      if (returnRequest.status !== 'requested') {
        res.status(400).json({
          success: false,
          message: 'Return request cannot be modified in current status'
        });
        return;
      }

      let newStatus: string;
      let updateData: any = {
        updatedAt: new Date(),
        vendorResponse: {
          decision,
          reason,
          notes,
          inspectionResults,
          processedAt: new Date(),
          processedBy: vendorId
        }
      };

      switch (decision) {
        case 'approve':
          newStatus = 'approved';
          updateData.approvedBy = vendorId;
          updateData.approvedAt = new Date();
          updateData.approvedAmount = refundAmount || returnRequest.requestedAmount;
          break;

        case 'reject':
          newStatus = 'rejected';
          updateData.rejectedBy = vendorId;
          updateData.rejectedAt = new Date();
          updateData.rejectionReason = reason;
          break;

        case 'request_more_info':
          newStatus = 'pending_info';
          updateData.infoRequested = true;
          updateData.infoRequestedAt = new Date();
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Invalid decision'
          });
          return;
      }

      // Update return request
      updateData.status = newStatus;
      await db
        .update(orderReturns)
        .set(updateData)
        .where(eq(orderReturns.id, returnId));

      // Generate return label if approved
      let returnLabel = null;
      if (decision === 'approve') {
        returnLabel = await this.generateReturnLabel(returnRequest.orderId, returnRequest.returnAuthNumber);
      }

      // Send notifications
      await this.sendReturnDecisionNotification(returnRequest, decision, reason);

      // Add status history
      await db.insert(orderStatusHistory).values({
        orderId: returnRequest.orderId,
        status: newStatus as OrderStatus,
        notes: `Return ${decision}: ${reason || notes}`,
        changedBy: vendorId,
        changedAt: new Date(),
        metadata: {
          returnId,
          decision,
          refundAmount: updateData.approvedAmount
        }
      });

      this.loggingService.info('Vendor return decision processed', {
        returnId,
        vendorId,
        decision,
        newStatus
      });

      res.status(200).json({
        success: true,
        data: {
          returnId,
          decision,
          newStatus,
          returnLabel,
          nextSteps: this.getNextStepsAfterDecision(decision),
          estimatedCompletion: this.estimateReturnCompletion(returnRequest.createdAt, newStatus)
        }
      });

    } catch (error) {
      this.loggingService.error('Process vendor return decision error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to process return decision',
        error: (error as Error).message
      });
    }
  }

  /**
   * Process refund
   */
  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { returnId } = req.params;
      const { 
        refundAmount, 
        refundMethod, 
        refundReference, 
        notes,
        deductions // shipping, restocking, etc.
      } = req.body;

      // Get return request
      const [returnRequest] = await db
        .select()
        .from(orderReturns)
        .where(eq(orderReturns.id, returnId));

      if (!returnRequest) {
        res.status(404).json({
          success: false,
          message: 'Return request not found'
        });
        return;
      }

      if (!['approved', 'items_received'].includes(returnRequest.status)) {
        res.status(400).json({
          success: false,
          message: 'Refund can only be processed for approved returns with received items'
        });
        return;
      }

      // Calculate final refund amount
      const totalDeductions = deductions ? Object.values(deductions).reduce((sum: number, val: any) => sum + Number(val), 0) : 0;
      const finalRefundAmount = Number(refundAmount) - totalDeductions;

      // Create payment transaction for refund
      const [refundTransaction] = await db.insert(paymentTransactions).values({
        orderId: returnRequest.orderId,
        amount: finalRefundAmount.toString(),
        currency: 'BDT',
        transactionType: 'refund',
        paymentMethod: refundMethod,
        status: 'pending',
        gatewayResponse: {
          returnId,
          refundReference,
          originalAmount: refundAmount,
          deductions,
          finalAmount: finalRefundAmount
        },
        metadata: {
          returnAuthNumber: returnRequest.returnAuthNumber,
          refundReason: returnRequest.reason,
          processedBy: 'system'
        }
      }).returning();

      // Update return request
      await db
        .update(orderReturns)
        .set({
          status: 'refund_processed',
          refundedAmount: finalRefundAmount.toString(),
          refundMethod,
          refundReference,
          refundProcessedAt: new Date(),
          refundNotes: notes,
          deductions,
          updatedAt: new Date()
        })
        .where(eq(orderReturns.id, returnId));

      // Send refund confirmation notification
      await this.sendRefundConfirmationNotification(returnRequest, finalRefundAmount, refundMethod);

      this.loggingService.info('Refund processed', {
        returnId,
        refundAmount: finalRefundAmount,
        refundMethod,
        transactionId: refundTransaction.id
      });

      res.status(200).json({
        success: true,
        data: {
          returnId,
          refundTransaction,
          refundAmount: finalRefundAmount,
          refundMethod,
          refundReference,
          expectedProcessingTime: this.getRefundProcessingTime(refundMethod),
          bangladeshRefundInfo: {
            method: refundMethod,
            processingDays: this.getBangladeshRefundProcessingDays(refundMethod),
            supportedMethods: ['bank_transfer', 'bkash', 'nagad', 'rocket', 'store_credit']
          }
        }
      });

    } catch (error) {
      this.loggingService.error('Process refund error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: (error as Error).message
      });
    }
  }

  /**
   * Helper methods
   */
  private async checkReturnEligibility(orderId: string, orderItemIds: string[]): Promise<{
    eligible: boolean;
    reason?: string;
    eligibleItems?: string[];
    ineligibleItems?: string[];
  }> {
    // Get order details
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      return { eligible: false, reason: 'Order not found' };
    }

    // Check order status
    if (!['delivered', 'completed'].includes(order.status)) {
      return { eligible: false, reason: 'Order must be delivered to initiate return' };
    }

    // Check return window (14 days for most items)
    const deliveryDate = order.updatedAt; // Assuming this is delivery date
    const returnWindow = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
    const now = Date.now();
    
    if (now - deliveryDate.getTime() > returnWindow) {
      return { eligible: false, reason: 'Return window has expired (14 days)' };
    }

    // Check individual items
    const items = await db
      .select()
      .from(orderItems)
      .where(and(
        eq(orderItems.orderId, orderId),
        inArray(orderItems.id, orderItemIds)
      ));

    // For now, all items are eligible - in production, check category-specific rules
    return { 
      eligible: true, 
      eligibleItems: orderItemIds,
      ineligibleItems: []
    };
  }

  private groupItemsByVendor(items: any[]): Record<string, any[]> {
    return items.reduce((groups, item) => {
      const vendorId = item.vendorId;
      if (!groups[vendorId]) {
        groups[vendorId] = [];
      }
      groups[vendorId].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private async generateReturnAuthNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get daily return count
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orderReturns)
      .where(gte(orderReturns.createdAt, todayStart));

    const sequence = (count + 1).toString().padStart(4, '0');
    return `RET${year}${month}${day}${sequence}`;
  }

  private async getTotalOrderItemsCount(orderId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    
    return count;
  }

  private async getReturnPolicyForVendor(vendorId: string): Promise<any> {
    // Mock implementation - would fetch from vendor settings
    return {
      returnWindow: 14,
      restockingFee: 10,
      freeReturnReasons: ['defective', 'wrong_item', 'damaged_shipping'],
      customerPaidReasons: ['change_of_mind', 'size_mismatch'],
      nonReturnableCategories: ['perishable', 'custom_made', 'intimate_items']
    };
  }

  private getBangladeshRefundMethods(originalPaymentMethod: string): string[] {
    const methods = ['bank_transfer', 'store_credit'];
    
    if (originalPaymentMethod === 'bkash') methods.unshift('bkash');
    if (originalPaymentMethod === 'nagad') methods.unshift('nagad');
    if (originalPaymentMethod === 'rocket') methods.unshift('rocket');
    
    return methods;
  }

  private getReturnProcessingDays(reason: string): number {
    const processingDays: Record<string, number> = {
      'defective': 7,
      'wrong_item': 5,
      'damaged_shipping': 7,
      'change_of_mind': 10,
      'size_mismatch': 7,
      'not_as_described': 10
    };

    return processingDays[reason] || 10;
  }

  private async sendReturnNotifications(orderId: string, returnAuthNumber: string, vendorGroups: Record<string, any[]>): Promise<void> {
    // Implementation would send actual notifications
    // This is a placeholder
  }

  private async generateReturnLabel(orderId: string, returnAuthNumber: string): Promise<any> {
    // Mock implementation - would generate actual return shipping label
    return {
      labelUrl: `/api/v1/orders/${orderId}/return-label/${returnAuthNumber}`,
      trackingNumber: `RET-${returnAuthNumber}`,
      courierPartner: 'pathao',
      instructions: 'Pack items securely and attach this label'
    };
  }

  private async getReturnItems(returnId: string): Promise<any[]> {
    const [returnRequest] = await db
      .select()
      .from(orderReturns)
      .where(eq(orderReturns.id, returnId));

    if (!returnRequest || !returnRequest.orderItemIds) {
      return [];
    }

    return await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.id, returnRequest.orderItemIds));
  }

  private async getReturnTracking(returnId: string): Promise<any[]> {
    // Mock implementation - would fetch actual tracking data
    return [];
  }

  private canCancelReturn(status: string): boolean {
    return ['requested', 'pending_info'].includes(status);
  }

  private estimateReturnCompletion(createdAt: Date, status: string): Date {
    const days = status === 'approved' ? 7 : status === 'in_transit' ? 3 : 10;
    return new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private getRequiredVendorAction(status: string): string {
    const actions: Record<string, string> = {
      'requested': 'Review and approve/reject return request',
      'pending_info': 'Waiting for additional customer information',
      'approved': 'Await returned items',
      'in_transit': 'Prepare for item inspection',
      'items_received': 'Inspect items and process refund'
    };

    return actions[status] || 'No action required';
  }

  private getReturnDeadlines(createdAt: Date, status: string): any {
    const responseDeadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const completionDeadline = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    return {
      responseDeadline,
      completionDeadline,
      daysRemaining: Math.ceil((completionDeadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    };
  }

  private assessReturnRisk(returnRequest: any): string {
    // Simple risk assessment
    if (returnRequest.reason === 'change_of_mind') return 'low';
    if (returnRequest.reason === 'defective') return 'high';
    return 'medium';
  }

  private calculateCommissionImpact(vendorReturnAmount: string): number {
    return Number(vendorReturnAmount) * 0.12; // Assuming 12% commission
  }

  private calculateRestockingFee(reason: string, amount: string): number {
    if (['defective', 'wrong_item', 'damaged_shipping'].includes(reason)) {
      return 0; // No restocking fee for vendor/courier fault
    }
    return Number(amount) * 0.1; // 10% restocking fee for customer reasons
  }

  private async getVendorReturnAnalytics(vendorId: string): Promise<any> {
    // Mock analytics
    return {
      totalReturns: 42,
      returnRate: 5.2,
      avgProcessingTime: 3.5,
      topReasons: ['size_mismatch', 'change_of_mind', 'defective']
    };
  }

  private getNextStepsAfterDecision(decision: string): string[] {
    const steps: Record<string, string[]> = {
      'approve': [
        'Customer receives return shipping label',
        'Customer ships items back',
        'Vendor inspects returned items',
        'Refund is processed'
      ],
      'reject': [
        'Customer is notified of rejection',
        'Customer can appeal decision',
        'No further action required'
      ],
      'request_more_info': [
        'Customer provides additional information',
        'Vendor reviews additional information',
        'New decision is made'
      ]
    };

    return steps[decision] || [];
  }

  private async sendReturnDecisionNotification(returnRequest: any, decision: string, reason?: string): Promise<void> {
    // Implementation would send actual notifications
  }

  private async sendRefundConfirmationNotification(returnRequest: any, refundAmount: number, refundMethod: string): Promise<void> {
    // Implementation would send actual notifications
  }

  private getRefundProcessingTime(refundMethod: string): string {
    const times: Record<string, string> = {
      'bank_transfer': '3-5 business days',
      'bkash': '1-2 business days',
      'nagad': '1-2 business days',
      'rocket': '1-2 business days',
      'store_credit': 'Immediate'
    };

    return times[refundMethod] || '3-7 business days';
  }

  private getBangladeshRefundProcessingDays(refundMethod: string): number {
    const days: Record<string, number> = {
      'bank_transfer': 5,
      'bkash': 2,
      'nagad': 2,
      'rocket': 2,
      'store_credit': 0
    };

    return days[refundMethod] || 5;
  }
}