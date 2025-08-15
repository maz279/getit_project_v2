/**
 * BNPL Controller - Amazon.com/Shopee.sg Level
 * Buy Now Pay Later financing and point-of-sale lending capabilities
 */

import { Request, Response } from 'express';
import { LoggingService } from '../../../../services/LoggingService';
import { BNPLService } from '../services/BNPLService';

export class BNPLController {
  private bnplService: BNPLService;
  private loggingService: LoggingService;

  constructor() {
    this.bnplService = new BNPLService();
    this.loggingService = new LoggingService();
  }

  /**
   * Check BNPL eligibility for customer
   */
  async checkEligibility(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, orderAmount, merchantId } = req.body;
      const userId = req.user?.userId;

      const eligibility = await this.bnplService.checkEligibility({
        customerId,
        orderAmount: parseFloat(orderAmount),
        merchantId,
        requestedBy: userId
      });

      this.loggingService.logInfo('BNPL eligibility checked', {
        customerId,
        orderAmount,
        merchantId,
        eligible: eligibility.eligible,
        maxAmount: eligibility.maxAmount,
        requestedBy: userId
      });

      res.json({
        success: true,
        data: eligibility,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to check BNPL eligibility', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check BNPL eligibility',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create BNPL financing offer
   */
  async createBNPLOffer(req: Request, res: Response): Promise<void> {
    try {
      const { 
        customerId, 
        orderAmount, 
        merchantId, 
        installments = 4,
        interestRate = 0,
        orderDetails 
      } = req.body;
      const userId = req.user?.userId;

      const offer = await this.bnplService.createBNPLOffer({
        customerId,
        orderAmount: parseFloat(orderAmount),
        merchantId,
        installments: parseInt(installments),
        interestRate: parseFloat(interestRate),
        orderDetails,
        createdBy: userId
      });

      this.loggingService.logInfo('BNPL offer created', {
        offerId: offer.id,
        customerId,
        orderAmount,
        merchantId,
        installments,
        interestRate,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'BNPL offer created successfully',
        data: offer,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create BNPL offer', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create BNPL offer',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Accept BNPL offer by customer
   */
  async acceptBNPLOffer(req: Request, res: Response): Promise<void> {
    try {
      const { offerId } = req.params;
      const { agreementAccepted, ipAddress, userAgent } = req.body;
      const userId = req.user?.userId;

      if (!agreementAccepted) {
        res.status(400).json({
          success: false,
          message: 'BNPL agreement must be accepted to proceed'
        });
        return;
      }

      const acceptedOffer = await this.bnplService.acceptBNPLOffer({
        offerId,
        customerId: userId,
        ipAddress,
        userAgent,
        acceptedAt: new Date()
      });

      this.loggingService.logInfo('BNPL offer accepted', {
        offerId,
        customerId: userId,
        transactionId: acceptedOffer.transactionId,
        ipAddress,
        userAgent
      });

      res.json({
        success: true,
        message: 'BNPL offer accepted successfully',
        data: acceptedOffer,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to accept BNPL offer', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept BNPL offer',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process BNPL payment
   */
  async processBNPLPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, installmentNumber, paymentMethod, amount } = req.body;
      const userId = req.user?.userId;

      const payment = await this.bnplService.processBNPLPayment({
        transactionId,
        installmentNumber: parseInt(installmentNumber),
        paymentMethod,
        amount: parseFloat(amount),
        paidBy: userId
      });

      this.loggingService.logInfo('BNPL payment processed', {
        transactionId,
        installmentNumber,
        paymentMethod,
        amount,
        paymentId: payment.id,
        paidBy: userId
      });

      res.json({
        success: true,
        message: 'BNPL payment processed successfully',
        data: payment,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process BNPL payment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process BNPL payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get BNPL transaction details
   */
  async getBNPLTransactionDetails(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const transaction = await this.bnplService.getBNPLTransactionDetails(transactionId);

      // Check access permissions
      if (userRole !== 'admin' && transaction.customerId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own BNPL transactions.'
        });
        return;
      }

      res.json({
        success: true,
        data: transaction,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get BNPL transaction details', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get BNPL transaction details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get customer BNPL history
   */
  async getCustomerBNPLHistory(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { 
        status = 'all',
        startDate, 
        endDate,
        page = 1, 
        limit = 20 
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Access control
      const finalCustomerId = userRole === 'admin' ? customerId : userId?.toString();

      const history = await this.bnplService.getCustomerBNPLHistory(
        finalCustomerId,
        {
          status: status as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      );

      res.json({
        success: true,
        data: history,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get customer BNPL history', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customer BNPL history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process early payment for BNPL
   */
  async processEarlyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { paymentMethod, applyDiscount = true } = req.body;
      const userId = req.user?.userId;

      const earlyPayment = await this.bnplService.processEarlyPayment({
        transactionId,
        paymentMethod,
        applyDiscount,
        paidBy: userId
      });

      this.loggingService.logInfo('BNPL early payment processed', {
        transactionId,
        paymentMethod,
        applyDiscount,
        totalAmount: earlyPayment.totalAmount,
        discountAmount: earlyPayment.discountAmount,
        paidBy: userId
      });

      res.json({
        success: true,
        message: 'Early payment processed successfully',
        data: earlyPayment,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process early payment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process early payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get BNPL analytics for merchants/admin
   */
  async getBNPLAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        merchantId, 
        timeframe = '30d',
        currency = 'BDT' 
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      let finalMerchantId = merchantId as string;

      // Role-based access control
      if (userRole === 'vendor') {
        finalMerchantId = userId?.toString();
      } else if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions for BNPL analytics.'
        });
        return;
      }

      const analytics = await this.bnplService.getBNPLAnalytics({
        merchantId: finalMerchantId,
        timeframe: timeframe as string,
        currency: currency as string
      });

      res.json({
        success: true,
        data: analytics,
        timeframe,
        currency,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get BNPL analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get BNPL analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update BNPL transaction status (admin only)
   */
  async updateBNPLTransactionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { status, reason, notifyCustomer = true } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required for status updates.'
        });
        return;
      }

      const updatedTransaction = await this.bnplService.updateBNPLTransactionStatus({
        transactionId,
        status,
        reason,
        notifyCustomer,
        updatedBy: userId
      });

      this.loggingService.logInfo('BNPL transaction status updated', {
        transactionId,
        status,
        reason,
        notifyCustomer,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'BNPL transaction status updated successfully',
        data: updatedTransaction,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update BNPL transaction status', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update BNPL transaction status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send payment reminder to customer
   */
  async sendPaymentReminder(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { reminderType = 'upcoming', customMessage } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const reminder = await this.bnplService.sendPaymentReminder({
        transactionId,
        reminderType,
        customMessage,
        sentBy: userId
      });

      this.loggingService.logInfo('BNPL payment reminder sent', {
        transactionId,
        reminderType,
        customMessage,
        sentBy: userId
      });

      res.json({
        success: true,
        message: 'Payment reminder sent successfully',
        data: reminder,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to send payment reminder', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send payment reminder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}