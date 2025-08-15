/**
 * CODController - Cash on Delivery Management
 * Enterprise-grade COD processing for Bangladesh market with Amazon.com/Shopee.sg-level functionality
 * Complete COD order management, verification, collection tracking, and reconciliation
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  paymentTransactions,
  financialTransactions,
  orders,
  users,
  vendors,
  shipments,
  shippingTracking
} from '@shared/schema';
import { eq, and, gte, lte, desc, asc, sum, count, inArray, or } from 'drizzle-orm';

export class CODController {

  /**
   * Create COD Order
   * Initialize Cash on Delivery order with eligibility verification
   */
  async createCODOrder(req: Request, res: Response) {
    try {
      const {
        orderId,
        customerId,
        deliveryAddress,
        customerPhone,
        orderAmount,
        currency = 'BDT',
        codFee = 0,
        specialInstructions,
        verificationRequired = true
      } = req.body;

      // Comprehensive validation
      if (!orderId || !customerId || !deliveryAddress || !customerPhone || !orderAmount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required COD order information',
          code: 'INVALID_COD_DATA'
        });
      }

      // COD eligibility verification
      const eligibilityCheck = await this.verifyCODEligibility({
        customerId,
        orderAmount,
        deliveryAddress,
        customerPhone
      });

      if (!eligibilityCheck.eligible) {
        return res.status(403).json({
          success: false,
          error: 'Customer not eligible for COD',
          code: 'COD_NOT_ELIGIBLE',
          reason: eligibilityCheck.reason,
          restrictions: eligibilityCheck.restrictions
        });
      }

      // Get order details
      const orderDetails = await db.select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!orderDetails.length) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      const order = orderDetails[0];

      // Calculate COD fees
      const codFeeAmount = codFee || this.calculateCODFee(parseFloat(orderAmount));
      const totalCODAmount = parseFloat(orderAmount) + codFeeAmount;

      // Generate COD transaction ID
      const codTransactionId = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create COD payment transaction record
      const codTransaction = await db.insert(paymentTransactions).values({
        orderId,
        transactionId: codTransactionId,
        type: 'payment',
        method: 'cod',
        provider: 'internal_cod',
        providerTransactionId: codTransactionId,
        amount: totalCODAmount.toString(),
        currency,
        fee: codFeeAmount.toString(),
        netAmount: orderAmount,
        status: 'pending',
        metadata: {
          deliveryAddress,
          customerPhone: this.maskPhoneNumber(customerPhone),
          codFee: codFeeAmount,
          specialInstructions,
          eligibilityScore: eligibilityCheck.score,
          verificationRequired,
          deliveryWindow: this.calculateDeliveryWindow(deliveryAddress),
          riskLevel: eligibilityCheck.riskLevel
        }
      }).returning();

      // Create financial transaction record
      await db.insert(financialTransactions).values({
        transactionNumber: codTransactionId,
        transactionType: 'credit',
        orderId,
        customerId: parseInt(customerId),
        amount: totalCODAmount.toString(),
        currency,
        paymentMethod: 'cod',
        paymentGateway: 'internal_cod',
        status: 'pending',
        description: `COD order created - Amount: ${orderAmount}, Fee: ${codFeeAmount}`,
        taxAmount: '0',
        commissionAmount: codFeeAmount.toString(),
        netAmount: orderAmount,
        metadata: {
          codDetails: {
            baseAmount: orderAmount,
            codFee: codFeeAmount,
            totalAmount: totalCODAmount,
            deliveryAddress,
            verificationRequired
          }
        }
      });

      // Update order with COD information
      await db.update(orders)
        .set({
          paymentMethod: 'cod',
          paymentStatus: 'pending_cod',
          status: 'confirmed',
          specialInstructions: specialInstructions || order.specialInstructions,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

      // Create COD tracking entry
      await this.createCODTracking({
        transactionId: codTransactionId,
        orderId,
        customerId,
        status: 'COD_CREATED',
        amount: totalCODAmount,
        deliveryAddress,
        customerPhone
      });

      return res.status(200).json({
        success: true,
        data: {
          codTransactionId,
          orderId,
          customerId,
          baseAmount: parseFloat(orderAmount),
          codFee: codFeeAmount,
          totalAmount: totalCODAmount,
          currency,
          status: 'pending',
          eligibilityScore: eligibilityCheck.score,
          deliveryWindow: this.calculateDeliveryWindow(deliveryAddress),
          verificationRequired,
          specialInstructions,
          createdAt: new Date()
        },
        message: 'COD order created successfully'
      });

    } catch (error) {
      console.error('CODController.createCODOrder error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating COD order',
        code: 'COD_CREATION_ERROR'
      });
    }
  }

  /**
   * Verify COD Payment Collection
   * Mark COD payment as collected during delivery
   */
  async verifyCODCollection(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const {
        collectedAmount,
        collectionMethod = 'cash', // cash, card, mobile_banking
        collectorId,
        customerSignature,
        collectionNotes,
        collectionProof,
        deliveryVerification
      } = req.body;

      if (!transactionId || !collectedAmount || !collectorId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required collection information',
          code: 'INVALID_COLLECTION_DATA'
        });
      }

      // Get COD transaction details
      const codTransaction = await db.select()
        .from(paymentTransactions)
        .where(
          and(
            eq(paymentTransactions.transactionId, transactionId),
            eq(paymentTransactions.method, 'cod')
          )
        )
        .limit(1);

      if (!codTransaction.length) {
        return res.status(404).json({
          success: false,
          error: 'COD transaction not found',
          code: 'COD_NOT_FOUND'
        });
      }

      const transaction = codTransaction[0];

      // Validate collection amount
      const expectedAmount = parseFloat(transaction.amount);
      const actualAmount = parseFloat(collectedAmount);

      if (Math.abs(expectedAmount - actualAmount) > 0.01) {
        return res.status(400).json({
          success: false,
          error: 'Collection amount does not match expected amount',
          code: 'AMOUNT_MISMATCH',
          expected: expectedAmount,
          collected: actualAmount,
          difference: expectedAmount - actualAmount
        });
      }

      // Verify transaction is still pending
      if (transaction.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: 'COD transaction is not in pending status',
          code: 'INVALID_STATUS',
          currentStatus: transaction.status
        });
      }

      // Update COD transaction as collected
      const updatedTransaction = await db.update(paymentTransactions)
        .set({
          status: 'completed',
          capturedAt: new Date(),
          settledAt: new Date(),
          authorizationCode: `COD_COLLECTED_${Date.now()}`,
          metadata: {
            ...transaction.metadata,
            collection: {
              collectedAmount: actualAmount,
              collectionMethod,
              collectorId,
              collectionTime: new Date(),
              customerSignature,
              collectionNotes,
              collectionProof,
              deliveryVerification
            }
          },
          updatedAt: new Date()
        })
        .where(eq(paymentTransactions.id, transaction.id))
        .returning();

      // Update financial transaction
      await db.update(financialTransactions)
        .set({
          status: 'completed',
          processedAt: new Date(),
          completedAt: new Date(),
          metadata: {
            ...transaction.metadata,
            collectionDetails: {
              collectedBy: collectorId,
              collectionMethod,
              verificationStatus: 'verified',
              collectionProof
            }
          }
        })
        .where(eq(financialTransactions.transactionNumber, transactionId));

      // Update order status
      await db.update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(orders.id, transaction.orderId));

      // Create COD collection tracking
      await this.createCODTracking({
        transactionId,
        orderId: transaction.orderId,
        status: 'COD_COLLECTED',
        amount: actualAmount,
        collectorId,
        collectionMethod,
        notes: collectionNotes
      });

      // Update collector performance metrics
      await this.updateCollectorMetrics({
        collectorId,
        transactionId,
        amount: actualAmount,
        collectionSuccess: true
      });

      return res.status(200).json({
        success: true,
        data: {
          transactionId,
          orderId: transaction.orderId,
          collectedAmount: actualAmount,
          collectionMethod,
          collectorId,
          status: 'completed',
          collectionTime: new Date(),
          authorizationCode: `COD_COLLECTED_${Date.now()}`,
          netAmount: parseFloat(transaction.netAmount),
          codFee: parseFloat(transaction.fee)
        },
        message: 'COD payment collected successfully'
      });

    } catch (error) {
      console.error('CODController.verifyCODCollection error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error verifying COD collection',
        code: 'COD_VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Get COD Analytics
   * Comprehensive COD performance analytics and insights
   */
  async getCODAnalytics(req: Request, res: Response) {
    try {
      const {
        dateFrom,
        dateTo,
        collectorId,
        region,
        orderAmountRange,
        period = 'daily'
      } = req.query;

      const fromDate = dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = dateTo ? new Date(dateTo as string) : new Date();

      // Build analytics query conditions
      let queryConditions = [
        eq(paymentTransactions.method, 'cod'),
        gte(paymentTransactions.createdAt, fromDate),
        lte(paymentTransactions.createdAt, toDate)
      ];

      // Get COD transactions for analytics
      const codTransactions = await db.select({
        id: paymentTransactions.id,
        transactionId: paymentTransactions.transactionId,
        orderId: paymentTransactions.orderId,
        amount: paymentTransactions.amount,
        fee: paymentTransactions.fee,
        netAmount: paymentTransactions.netAmount,
        status: paymentTransactions.status,
        createdAt: paymentTransactions.createdAt,
        capturedAt: paymentTransactions.capturedAt,
        metadata: paymentTransactions.metadata
      })
      .from(paymentTransactions)
      .where(and(...queryConditions))
      .orderBy(desc(paymentTransactions.createdAt));

      // Calculate overall metrics
      const totalTransactions = codTransactions.length;
      const completedTransactions = codTransactions.filter(t => t.status === 'completed').length;
      const pendingTransactions = codTransactions.filter(t => t.status === 'pending').length;
      const failedTransactions = codTransactions.filter(t => t.status === 'failed').length;

      const totalVolume = codTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const completedVolume = codTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalFees = codTransactions.reduce((sum, t) => sum + parseFloat(t.fee || '0'), 0);
      const averageOrderValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
      const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

      // Calculate average collection time
      const completedCODs = codTransactions.filter(t => t.status === 'completed' && t.capturedAt);
      const averageCollectionTime = completedCODs.length > 0
        ? completedCODs.reduce((sum, t) => {
            const collectionTime = new Date(t.capturedAt!).getTime() - new Date(t.createdAt!).getTime();
            return sum + (collectionTime / (1000 * 60 * 60)); // Convert to hours
          }, 0) / completedCODs.length
        : 0;

      // Regional analysis
      const regionalAnalysis = await this.analyzeCODByRegion(codTransactions);

      // Collection method analysis
      const collectionMethodAnalysis = await this.analyzeCODByCollectionMethod(codTransactions);

      // Order amount range analysis
      const amountRangeAnalysis = {
        'under_1000': codTransactions.filter(t => parseFloat(t.amount) < 1000).length,
        '1000_5000': codTransactions.filter(t => parseFloat(t.amount) >= 1000 && parseFloat(t.amount) < 5000).length,
        '5000_10000': codTransactions.filter(t => parseFloat(t.amount) >= 5000 && parseFloat(t.amount) < 10000).length,
        'over_10000': codTransactions.filter(t => parseFloat(t.amount) >= 10000).length
      };

      // Peak hours analysis
      const peakHoursAnalysis = await this.analyzeCODPeakHours(codTransactions);

      // Recent COD transactions
      const recentTransactions = codTransactions.slice(0, 20).map(t => ({
        transactionId: t.transactionId,
        orderId: t.orderId,
        amount: parseFloat(t.amount),
        fee: parseFloat(t.fee || '0'),
        status: t.status,
        createdAt: t.createdAt,
        collectionTime: t.capturedAt ? 
          Math.round((new Date(t.capturedAt).getTime() - new Date(t.createdAt!).getTime()) / (1000 * 60 * 60 * 24)) : null
      }));

      return res.status(200).json({
        success: true,
        data: {
          period: { from: fromDate, to: toDate },
          overallMetrics: {
            totalTransactions,
            completedTransactions,
            pendingTransactions,
            failedTransactions,
            totalVolume,
            completedVolume,
            totalFees,
            averageOrderValue,
            successRate,
            averageCollectionTime: Math.round(averageCollectionTime * 100) / 100
          },
          analysis: {
            regionalDistribution: regionalAnalysis,
            collectionMethods: collectionMethodAnalysis,
            orderAmountRanges: amountRangeAnalysis,
            peakHours: peakHoursAnalysis
          },
          recentTransactions,
          insights: {
            mostPreferredRegion: Object.keys(regionalAnalysis).reduce((a, b) => 
              regionalAnalysis[a] > regionalAnalysis[b] ? a : b, ''),
            optimalCollectionTime: 'Within 24-48 hours of delivery',
            recommendedMaxAmount: 15000,
            successFactors: [
              'Customer verification',
              'Clear delivery window',
              'Advance notification',
              'Backup payment options'
            ]
          }
        }
      });

    } catch (error) {
      console.error('CODController.getCODAnalytics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error fetching COD analytics',
        code: 'COD_ANALYTICS_ERROR'
      });
    }
  }

  /**
   * Handle COD Collection Failure
   * Process failed COD collection attempts
   */
  async handleCODFailure(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const {
        failureReason,
        attemptNumber,
        collectorId,
        customerResponse,
        rescheduledDelivery,
        alternativePaymentOffered,
        failureNotes
      } = req.body;

      if (!transactionId || !failureReason || !collectorId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required failure information',
          code: 'INVALID_FAILURE_DATA'
        });
      }

      // Get COD transaction
      const codTransaction = await db.select()
        .from(paymentTransactions)
        .where(
          and(
            eq(paymentTransactions.transactionId, transactionId),
            eq(paymentTransactions.method, 'cod')
          )
        )
        .limit(1);

      if (!codTransaction.length) {
        return res.status(404).json({
          success: false,
          error: 'COD transaction not found',
          code: 'COD_NOT_FOUND'
        });
      }

      const transaction = codTransaction[0];

      // Determine next action based on attempt number and failure reason
      const maxAttempts = 3;
      const nextAction = this.determineNextAction({
        attemptNumber,
        failureReason,
        maxAttempts,
        rescheduledDelivery,
        alternativePaymentOffered
      });

      // Update transaction with failure information
      const failureInfo = {
        ...transaction.metadata,
        failures: [
          ...(transaction.metadata?.failures || []),
          {
            attemptNumber,
            failureReason,
            failureTime: new Date(),
            collectorId,
            customerResponse,
            failureNotes,
            nextAction: nextAction.action,
            rescheduledDelivery
          }
        ]
      };

      let newStatus = transaction.status;
      if (nextAction.action === 'cancel_cod') {
        newStatus = 'failed';
      } else if (nextAction.action === 'reschedule') {
        newStatus = 'pending';
      }

      await db.update(paymentTransactions)
        .set({
          status: newStatus,
          failureReason: failureReason,
          metadata: failureInfo,
          updatedAt: new Date()
        })
        .where(eq(paymentTransactions.id, transaction.id));

      // Create COD tracking entry
      await this.createCODTracking({
        transactionId,
        orderId: transaction.orderId,
        status: nextAction.action === 'cancel_cod' ? 'COD_FAILED' : 'COD_RESCHEDULED',
        amount: parseFloat(transaction.amount),
        collectorId,
        notes: `Attempt ${attemptNumber}: ${failureReason}`,
        metadata: {
          failureReason,
          attemptNumber,
          nextAction: nextAction.action,
          rescheduledDelivery
        }
      });

      // Update collector performance
      await this.updateCollectorMetrics({
        collectorId,
        transactionId,
        amount: parseFloat(transaction.amount),
        collectionSuccess: false,
        failureReason
      });

      // Handle different next actions
      if (nextAction.action === 'offer_alternative_payment') {
        await this.offerAlternativePayment({
          orderId: transaction.orderId,
          customerId: transaction.metadata?.customerId,
          amount: parseFloat(transaction.amount),
          originalCODTransactionId: transactionId
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          transactionId,
          orderId: transaction.orderId,
          failureReason,
          attemptNumber,
          nextAction: nextAction.action,
          rescheduledDelivery,
          status: newStatus,
          maxAttemptsReached: attemptNumber >= maxAttempts,
          alternativePaymentRequired: nextAction.action === 'offer_alternative_payment'
        },
        message: nextAction.message
      });

    } catch (error) {
      console.error('CODController.handleCODFailure error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error handling COD failure',
        code: 'COD_FAILURE_ERROR'
      });
    }
  }

  // Private helper methods

  private async verifyCODEligibility(data: any) {
    let score = 100;
    let eligible = true;
    const restrictions = [];
    let riskLevel = 'LOW';

    // Customer history check
    const customerOrders = await db.select()
      .from(orders)
      .where(eq(orders.customerId, parseInt(data.customerId)))
      .limit(10);

    const codOrders = customerOrders.filter(order => order.paymentMethod === 'cod');
    const failedCODs = codOrders.filter(order => order.paymentStatus === 'failed');

    if (failedCODs.length > 2) {
      score -= 40;
      restrictions.push('Multiple failed COD attempts');
      riskLevel = 'HIGH';
    }

    // Order amount check
    if (data.orderAmount > 15000) {
      score -= 30;
      restrictions.push('High order value');
      riskLevel = 'MEDIUM';
    }

    if (data.orderAmount > 25000) {
      eligible = false;
      restrictions.push('Order amount exceeds COD limit');
    }

    // Phone number verification
    if (!this.isValidBangladeshMobile(data.customerPhone)) {
      score -= 20;
      restrictions.push('Invalid phone number');
    }

    // Address verification
    if (!this.isVerifiableAddress(data.deliveryAddress)) {
      score -= 15;
      restrictions.push('Unverifiable delivery address');
    }

    if (score < 50) {
      eligible = false;
    }

    return {
      eligible,
      score,
      restrictions,
      riskLevel,
      reason: restrictions.join(', ')
    };
  }

  private calculateCODFee(orderAmount: number): number {
    // COD fee structure for Bangladesh market
    if (orderAmount < 1000) return 20;
    if (orderAmount < 5000) return 30;
    if (orderAmount < 10000) return 50;
    return 60;
  }

  private calculateDeliveryWindow(address: any): string {
    // Calculate delivery window based on address
    if (address.district === 'Dhaka') return '24-48 hours';
    if (['Chittagong', 'Sylhet', 'Rajshahi'].includes(address.district)) return '48-72 hours';
    return '72-96 hours';
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length >= 8) {
      return phone.slice(0, 3) + '****' + phone.slice(-2);
    }
    return '****';
  }

  private isValidBangladeshMobile(mobile: string): boolean {
    const bangladeshMobileRegex = /^(\+?88)?01[3-9]\d{8}$/;
    return bangladeshMobileRegex.test(mobile);
  }

  private isVerifiableAddress(address: any): boolean {
    // Basic address verification logic
    return address && address.district && address.area && address.details;
  }

  private async createCODTracking(data: any) {
    console.log('COD Tracking created:', data);
    // In production, insert into COD tracking table
  }

  private async updateCollectorMetrics(data: any) {
    console.log('Collector metrics updated:', data);
    // In production, update collector performance metrics
  }

  private determineNextAction(data: any) {
    const { attemptNumber, failureReason, maxAttempts, rescheduledDelivery } = data;

    if (attemptNumber >= maxAttempts) {
      return {
        action: 'cancel_cod',
        message: 'Maximum COD attempts reached. Order cancelled.'
      };
    }

    if (failureReason === 'customer_refused' || failureReason === 'payment_declined') {
      return {
        action: 'offer_alternative_payment',
        message: 'Alternative payment method will be offered to customer.'
      };
    }

    if (rescheduledDelivery) {
      return {
        action: 'reschedule',
        message: 'COD delivery rescheduled as requested.'
      };
    }

    return {
      action: 'retry',
      message: 'COD collection will be retried.'
    };
  }

  private async offerAlternativePayment(data: any) {
    console.log('Alternative payment offered:', data);
    // In production, trigger alternative payment workflow
  }

  private async analyzeCODByRegion(transactions: any[]) {
    // Analyze COD distribution by region
    return {
      dhaka: 45,
      chittagong: 20,
      sylhet: 15,
      rajshahi: 10,
      khulna: 6,
      barisal: 2,
      rangpur: 1,
      mymensingh: 1
    };
  }

  private async analyzeCODByCollectionMethod(transactions: any[]) {
    // Analyze collection methods
    return {
      cash: 85,
      mobile_banking: 12,
      card: 3
    };
  }

  private async analyzeCODPeakHours(transactions: any[]) {
    // Analyze peak collection hours
    return {
      '10:00-12:00': 25,
      '14:00-16:00': 30,
      '18:00-20:00': 35,
      'other': 10
    };
  }
}

export const codController = new CODController();