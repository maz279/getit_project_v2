/**
 * Commission Controller - Platform Commission Management
 * Enterprise-grade commission structures and calculations
 */

import { Request, Response } from 'express';
import { CommissionService } from '../services/CommissionService';
import { LoggingService } from '../../../../services/LoggingService';

export class CommissionController {
  private commissionService: CommissionService;
  private loggingService: LoggingService;

  constructor() {
    this.commissionService = new CommissionService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get commission structures with filtering
   */
  async getCommissionStructures(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        categoryId, 
        commissionType,
        isActive = true,
        page = 1, 
        limit = 50 
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Vendor can only see their own commission structures
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const structures = await this.commissionService.getCommissionStructures({
        vendorId: finalVendorId,
        categoryId: categoryId as string,
        commissionType: commissionType as string,
        isActive: Boolean(isActive),
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: structures,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get commission structures', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve commission structures',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new commission structure (Admin only)
   */
  async createCommissionStructure(req: Request, res: Response): Promise<void> {
    try {
      const structureData = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const structure = await this.commissionService.createCommissionStructure(structureData, userId);

      this.loggingService.logInfo('Commission structure created', {
        structureId: structure.id,
        vendorId: structure.vendorId,
        commissionType: structure.commissionType,
        commissionRate: structure.commissionRate,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Commission structure created successfully',
        data: structure,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create commission structure', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create commission structure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update commission structure (Admin only)
   */
  async updateCommissionStructure(req: Request, res: Response): Promise<void> {
    try {
      const { structureId } = req.params;
      const updateData = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const updatedStructure = await this.commissionService.updateCommissionStructure(
        structureId, 
        updateData, 
        userId
      );

      this.loggingService.logInfo('Commission structure updated', {
        structureId,
        updatedFields: Object.keys(updateData),
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Commission structure updated successfully',
        data: updatedStructure,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update commission structure', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update commission structure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate commission for specific order
   */
  async calculateOrderCommission(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { includeBreakdown = true } = req.query;
      const userId = req.user?.userId;

      const commission = await this.commissionService.calculateOrderCommission(
        orderId, 
        Boolean(includeBreakdown)
      );

      this.loggingService.logInfo('Order commission calculated', {
        userId,
        orderId,
        totalCommission: commission.totalCommission,
        platformCommission: commission.platformCommission,
        calculationMethod: commission.calculationMethod
      });

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

  /**
   * Get commission analytics and reports
   */
  async getCommissionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        startDate, 
        endDate, 
        vendorId,
        categoryId,
        analyticsType = 'summary',
        groupBy = 'month'
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Vendor can only see their own commission analytics
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const analytics = await this.commissionService.getCommissionAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        vendorId: finalVendorId,
        categoryId: categoryId as string,
        analyticsType: analyticsType as string,
        groupBy: groupBy as string
      });

      res.json({
        success: true,
        data: analytics,
        period: {
          startDate,
          endDate
        },
        analyticsType,
        groupBy,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get commission analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve commission analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get tiered commission calculations
   */
  async getTieredCommissions(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        salesVolume, 
        performanceMetrics,
        evaluationPeriod = 'monthly'
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Vendor can only see their own tiered commissions
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const tieredCommissions = await this.commissionService.getTieredCommissions({
        vendorId: finalVendorId,
        salesVolume: salesVolume ? parseFloat(salesVolume as string) : undefined,
        performanceMetrics: performanceMetrics ? JSON.parse(performanceMetrics as string) : undefined,
        evaluationPeriod: evaluationPeriod as string
      });

      res.json({
        success: true,
        data: tieredCommissions,
        evaluationPeriod,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get tiered commissions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tiered commissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate performance-based bonuses
   */
  async calculatePerformanceBonus(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        evaluationPeriod,
        performanceMetrics,
        bonusType = 'percentage'
      } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      // Vendor can only calculate bonus for themselves
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId;

      const bonus = await this.commissionService.calculatePerformanceBonus({
        vendorId: finalVendorId,
        evaluationPeriod,
        performanceMetrics,
        bonusType,
        calculatedBy: userId
      });

      this.loggingService.logInfo('Performance bonus calculated', {
        userId,
        vendorId: finalVendorId,
        bonusAmount: bonus.bonusAmount,
        bonusType,
        evaluationPeriod
      });

      res.json({
        success: true,
        message: 'Performance bonus calculated successfully',
        data: bonus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to calculate performance bonus', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate performance bonus',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get commission rates by product category
   */
  async getCommissionRatesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, includeInactive = false } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Vendor can only see their own rates
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const rates = await this.commissionService.getCommissionRatesByCategory({
        vendorId: finalVendorId,
        includeInactive: Boolean(includeInactive)
      });

      res.json({
        success: true,
        data: rates,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get commission rates by category', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve commission rates by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Apply promotional commission rates
   */
  async applyPromotionalRates(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorIds, 
        categoryIds, 
        promotionalRate, 
        validFrom, 
        validUntil,
        description 
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const promotionalCommissions = await this.commissionService.applyPromotionalRates({
        vendorIds,
        categoryIds,
        promotionalRate: parseFloat(promotionalRate),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        description,
        appliedBy: userId
      });

      this.loggingService.logInfo('Promotional commission rates applied', {
        userId,
        vendorCount: vendorIds?.length || 0,
        categoryCount: categoryIds?.length || 0,
        promotionalRate,
        validFrom,
        validUntil
      });

      res.json({
        success: true,
        message: 'Promotional commission rates applied successfully',
        data: promotionalCommissions,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to apply promotional rates', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply promotional commission rates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate commission settlement report
   */
  async generateCommissionSettlement(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        settlementPeriod,
        includeDetails = true,
        format = 'json'
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      // Vendor can only generate settlement for themselves
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId as string;

      const settlement = await this.commissionService.generateCommissionSettlement({
        vendorId: finalVendorId,
        settlementPeriod: settlementPeriod as string,
        includeDetails: Boolean(includeDetails),
        format: format as string,
        generatedBy: userId
      });

      this.loggingService.logInfo('Commission settlement report generated', {
        userId,
        vendorId: finalVendorId,
        settlementPeriod,
        totalCommission: settlement.totalCommission,
        format
      });

      res.json({
        success: true,
        data: settlement,
        settlementPeriod,
        format,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to generate commission settlement', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate commission settlement report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk update commission rates (Admin only)
   */
  async bulkUpdateCommissionRates(req: Request, res: Response): Promise<void> {
    try {
      const { updates, effectiveDate, reason } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const bulkUpdate = await this.commissionService.bulkUpdateCommissionRates({
        updates,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        reason,
        updatedBy: userId
      });

      this.loggingService.logInfo('Bulk commission rates updated', {
        userId,
        updateCount: updates?.length || 0,
        effectiveDate,
        reason
      });

      res.json({
        success: true,
        message: 'Commission rates updated successfully',
        data: bulkUpdate,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to bulk update commission rates', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update commission rates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get commission history for vendor
   */
  async getCommissionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        startDate, 
        endDate, 
        includeSettled = true,
        page = 1, 
        limit = 50 
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Vendor can only see their own commission history
      const finalVendorId = userRole === 'vendor' ? userId?.toString() : vendorId;

      const history = await this.commissionService.getCommissionHistory({
        vendorId: finalVendorId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeSettled: Boolean(includeSettled),
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
      this.loggingService.logError('Failed to get commission history', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve commission history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}