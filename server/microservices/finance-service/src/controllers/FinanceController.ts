/**
 * Finance Controller - Amazon.com/Shopee.sg Level Financial Management
 * Enterprise-grade financial operations and commission management
 */

import { Request, Response } from 'express';
import { FinanceService } from '../services/FinanceService';
import { LoggingService } from '../../../../services/LoggingService';

export class FinanceController {
  private financeService: FinanceService;
  private loggingService: LoggingService;

  constructor() {
    this.financeService = new FinanceService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get financial dashboard overview
   */
  async getFinancialOverview(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d', vendorId } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Vendor can only see their own financial data
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const overview = await this.financeService.getFinancialOverview(
        timeframe as string,
        finalVendorId
      );

      this.loggingService.logInfo('Financial overview retrieved', {
        userId,
        vendorId: finalVendorId,
        timeframe
      });

      res.json({
        success: true,
        data: overview,
        timeframe,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get financial overview', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve financial overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get vendor commission details
   */
  async getVendorCommissions(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        startDate, 
        endDate, 
        status = 'all',
        page = 1, 
        limit = 50 
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Vendor can only see their own commissions
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId;

      const commissions = await this.financeService.getVendorCommissions(
        finalVendorId,
        {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          status: status as string,
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      );

      res.json({
        success: true,
        data: commissions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get vendor commissions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve vendor commissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process vendor payout
   */
  async processVendorPayout(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const payoutData = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required for payouts.'
        });
        return;
      }

      const payout = await this.financeService.processVendorPayout(
        vendorId,
        payoutData,
        userId
      );

      this.loggingService.logInfo('Vendor payout processed', {
        vendorId,
        payoutId: payout.id,
        amount: payout.amount,
        processedBy: userId
      });

      res.json({
        success: true,
        message: 'Payout processed successfully',
        data: payout,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process vendor payout', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payout',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get platform revenue analytics
   */
  async getPlatformRevenue(req: Request, res: Response): Promise<void> {
    try {
      const { 
        timeframe = '30d',
        granularity = 'daily',
        breakdown = 'category'
      } = req.query;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const revenue = await this.financeService.getPlatformRevenue(
        timeframe as string,
        granularity as string,
        breakdown as string
      );

      res.json({
        success: true,
        data: revenue,
        timeframe,
        granularity,
        breakdown,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get platform revenue', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve platform revenue',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get financial reports
   */
  async getFinancialReports(req: Request, res: Response): Promise<void> {
    try {
      const { 
        reportType = 'summary',
        timeframe = '30d',
        format = 'json',
        vendorId
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Vendor can only generate reports for their own data
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const report = await this.financeService.generateFinancialReport(
        reportType as string,
        timeframe as string,
        format as string,
        finalVendorId
      );

      this.loggingService.logInfo('Financial report generated', {
        reportType,
        timeframe,
        format,
        vendorId: finalVendorId,
        userId
      });

      res.json({
        success: true,
        data: report,
        reportType,
        timeframe,
        format,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to generate financial report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate financial report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get commission rates and settings
   */
  async getCommissionSettings(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, categoryId } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Vendor can only see their own commission settings
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const settings = await this.financeService.getCommissionSettings(
        finalVendorId,
        categoryId as string
      );

      res.json({
        success: true,
        data: settings,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get commission settings', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve commission settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update commission settings (Admin only)
   */
  async updateCommissionSettings(req: Request, res: Response): Promise<void> {
    try {
      const settingsData = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const updatedSettings = await this.financeService.updateCommissionSettings(
        settingsData,
        userId
      );

      this.loggingService.logInfo('Commission settings updated', {
        settingsData,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Commission settings updated successfully',
        data: updatedSettings,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update commission settings', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update commission settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get tax reports (Bangladesh specific)
   */
  async getTaxReports(req: Request, res: Response): Promise<void> {
    try {
      const { 
        fiscalYear = new Date().getFullYear(),
        vendorId,
        reportType = 'summary'
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Vendor can only see their own tax reports
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const taxReport = await this.financeService.generateTaxReport(
        parseInt(fiscalYear as string),
        finalVendorId,
        reportType as string
      );

      res.json({
        success: true,
        data: taxReport,
        fiscalYear,
        reportType,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to generate tax report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate tax report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate order commission
   */
  async calculateOrderCommission(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const commission = await this.financeService.calculateOrderCommission(orderId);

      res.json({
        success: true,
        data: commission,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to calculate order commission', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate order commission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}