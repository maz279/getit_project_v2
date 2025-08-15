/**
 * Real-Time Payment Controller - Amazon.com/Shopee.sg Level
 * Instant payment processing with sub-second response times
 */

import { Request, Response } from 'express';
import { LoggingService } from '../../../../services/LoggingService';
import { RealTimePaymentService } from '../services/RealTimePaymentService';

export class RealTimePaymentController {
  private realTimePaymentService: RealTimePaymentService;
  private loggingService: LoggingService;

  constructor() {
    this.realTimePaymentService = new RealTimePaymentService();
    this.loggingService = new LoggingService();
  }

  /**
   * Process instant payment
   */
  async processInstantPayment(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { 
        fromAccount, 
        toAccount, 
        amount, 
        currency = 'BDT',
        paymentMethod,
        reference,
        metadata
      } = req.body;
      const userId = req.user?.userId;

      const payment = await this.realTimePaymentService.processInstantPayment({
        fromAccount,
        toAccount,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        reference,
        metadata,
        initiatedBy: userId
      });

      const processingTime = Date.now() - startTime;

      this.loggingService.logInfo('Instant payment processed', {
        paymentId: payment.id,
        fromAccount,
        toAccount,
        amount,
        currency,
        paymentMethod,
        processingTime,
        initiatedBy: userId
      });

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: payment,
        processingTime,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.loggingService.logError('Failed to process instant payment', { 
        error, 
        processingTime 
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to process payment',
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
    }
  }

  /**
   * Validate payment before processing
   */
  async validatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { 
        fromAccount, 
        toAccount, 
        amount, 
        currency = 'BDT',
        paymentMethod 
      } = req.body;
      const userId = req.user?.userId;

      const validation = await this.realTimePaymentService.validatePayment({
        fromAccount,
        toAccount,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        validatedBy: userId
      });

      res.json({
        success: true,
        data: validation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Payment validation failed', error);
      res.status(400).json({
        success: false,
        message: 'Payment validation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get payment status in real-time
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const status = await this.realTimePaymentService.getPaymentStatus(paymentId);

      // Check access permissions
      if (userRole !== 'admin' && 
          status.initiatedBy !== userId && 
          status.fromAccount !== userId && 
          status.toAccount !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own payment status.'
        });
        return;
      }

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get payment status', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cancel pending payment
   */
  async cancelPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;

      const cancelledPayment = await this.realTimePaymentService.cancelPayment({
        paymentId,
        reason,
        cancelledBy: userId
      });

      this.loggingService.logInfo('Payment cancelled', {
        paymentId,
        reason,
        cancelledBy: userId
      });

      res.json({
        success: true,
        message: 'Payment cancelled successfully',
        data: cancelledPayment,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to cancel payment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process bulk payments
   */
  async processBulkPayments(req: Request, res: Response): Promise<void> {
    try {
      const { payments, batchId, scheduledTime } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required for bulk payments.'
        });
        return;
      }

      const bulkPayment = await this.realTimePaymentService.processBulkPayments({
        payments,
        batchId,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
        initiatedBy: userId
      });

      this.loggingService.logInfo('Bulk payments processed', {
        batchId,
        paymentCount: payments.length,
        scheduledTime,
        initiatedBy: userId
      });

      res.json({
        success: true,
        message: 'Bulk payments processed successfully',
        data: bulkPayment,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process bulk payments', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk payments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time payment analytics
   */
  async getRealTimePaymentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        timeframe = '24h',
        paymentMethod = 'all',
        currency = 'BDT',
        status = 'all'
      } = req.query;
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required for payment analytics.'
        });
        return;
      }

      const analytics = await this.realTimePaymentService.getRealTimePaymentAnalytics({
        timeframe: timeframe as string,
        paymentMethod: paymentMethod as string,
        currency: currency as string,
        status: status as string
      });

      res.json({
        success: true,
        data: analytics,
        timeframe,
        paymentMethod,
        currency,
        status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get payment analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get payment network health status
   */
  async getNetworkHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required for network health status.'
        });
        return;
      }

      const healthStatus = await this.realTimePaymentService.getNetworkHealthStatus();

      res.json({
        success: true,
        data: healthStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get network health status', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get network health status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process refund for payment
   */
  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { amount, reason, refundType = 'full' } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required for refunds.'
        });
        return;
      }

      const refund = await this.realTimePaymentService.processRefund({
        paymentId,
        amount: amount ? parseFloat(amount) : undefined,
        reason,
        refundType,
        processedBy: userId
      });

      this.loggingService.logInfo('Payment refund processed', {
        paymentId,
        refundId: refund.id,
        amount: refund.amount,
        reason,
        refundType,
        processedBy: userId
      });

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: refund,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process refund', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Schedule recurring payment
   */
  async scheduleRecurringPayment(req: Request, res: Response): Promise<void> {
    try {
      const { 
        fromAccount,
        toAccount,
        amount,
        currency = 'BDT',
        frequency,
        startDate,
        endDate,
        maxOccurrences
      } = req.body;
      const userId = req.user?.userId;

      const recurringPayment = await this.realTimePaymentService.scheduleRecurringPayment({
        fromAccount,
        toAccount,
        amount: parseFloat(amount),
        currency,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : undefined,
        scheduledBy: userId
      });

      this.loggingService.logInfo('Recurring payment scheduled', {
        recurringPaymentId: recurringPayment.id,
        fromAccount,
        toAccount,
        amount,
        frequency,
        startDate,
        endDate,
        maxOccurrences,
        scheduledBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Recurring payment scheduled successfully',
        data: recurringPayment,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to schedule recurring payment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule recurring payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get payment history with real-time filtering
   */
  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const { 
        accountId,
        startDate,
        endDate,
        paymentMethod = 'all',
        status = 'all',
        minAmount,
        maxAmount,
        page = 1,
        limit = 50
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Access control
      let finalAccountId = accountId as string;
      if (userRole !== 'admin') {
        finalAccountId = userId?.toString();
      }

      const history = await this.realTimePaymentService.getPaymentHistory({
        accountId: finalAccountId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        paymentMethod: paymentMethod as string,
        status: status as string,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

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
      this.loggingService.logError('Failed to get payment history', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}