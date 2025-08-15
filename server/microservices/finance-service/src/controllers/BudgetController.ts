/**
 * Budget Controller - Budget Planning & Financial Tracking
 * Enterprise-grade budget management for vendors and platform operations
 */

import { Request, Response } from 'express';
import { BudgetService } from '../services/BudgetService';
import { LoggingService } from '../../../../services/LoggingService';

export class BudgetController {
  private budgetService: BudgetService;
  private loggingService: LoggingService;

  constructor() {
    this.budgetService = new BudgetService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create budget for vendor or department
   */
  async createBudget(req: Request, res: Response): Promise<void> {
    try {
      const { 
        budgetName,
        budgetType, // 'vendor', 'department', 'project', 'marketing'
        entityId, // vendorId, departmentId, etc.
        fiscalYear,
        budgetCategories,
        totalBudgetAmount,
        currency = 'BDT',
        notes
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      // Vendor can only create budget for themselves
      const finalEntityId = req.user?.role === 'vendor' ? userId?.toString() : entityId;

      const budget = await this.budgetService.createBudget({
        budgetName,
        budgetType,
        entityId: finalEntityId,
        fiscalYear: fiscalYear || new Date().getFullYear(),
        budgetCategories,
        totalBudgetAmount: parseFloat(totalBudgetAmount),
        currency,
        notes,
        createdBy: userId
      });

      this.loggingService.logInfo('Budget created', {
        userId,
        budgetId: budget.id,
        budgetName,
        budgetType,
        entityId: finalEntityId,
        totalBudgetAmount,
        fiscalYear
      });

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create budget', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create budget',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get budgets with filtering
   */
  async getBudgets(req: Request, res: Response): Promise<void> {
    try {
      const { 
        budgetType,
        entityId,
        fiscalYear,
        status,
        page = 1, 
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Vendor can only see their own budgets
      const finalEntityId = userRole === 'vendor' ? userId?.toString() : entityId as string;

      const budgets = await this.budgetService.getBudgets({
        budgetType: budgetType as string,
        entityId: finalEntityId,
        fiscalYear: fiscalYear ? parseInt(fiscalYear as string) : undefined,
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json({
        success: true,
        data: budgets,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get budgets', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve budgets',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get budget details by ID
   */
  async getBudgetById(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const { 
        includeExpenses = true, 
        includeForecasts = true,
        includeVarianceAnalysis = true
      } = req.query;
      const userId = req.user?.userId;

      const budget = await this.budgetService.getBudgetById(budgetId, {
        includeExpenses: Boolean(includeExpenses),
        includeForecasts: Boolean(includeForecasts),
        includeVarianceAnalysis: Boolean(includeVarianceAnalysis),
        requestedBy: userId
      });

      // Check access permissions
      if (req.user?.role === 'vendor' && budget.entityId !== userId?.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Cannot view other vendor budgets.'
        });
        return;
      }

      res.json({
        success: true,
        data: budget,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get budget details', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve budget details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update budget
   */
  async updateBudget(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const updateData = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const updatedBudget = await this.budgetService.updateBudget(budgetId, {
        ...updateData,
        updatedBy: userId
      });

      this.loggingService.logInfo('Budget updated', {
        userId,
        budgetId,
        budgetName: updatedBudget.budgetName,
        updatedFields: Object.keys(updateData)
      });

      res.json({
        success: true,
        message: 'Budget updated successfully',
        data: updatedBudget,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update budget', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update budget',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add expense to budget category
   */
  async addExpense(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const { 
        categoryId,
        expenseAmount,
        expenseDescription,
        expenseDate = new Date(),
        invoiceReference,
        vendorReference
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const expense = await this.budgetService.addExpense({
        budgetId,
        categoryId,
        expenseAmount: parseFloat(expenseAmount),
        expenseDescription,
        expenseDate: new Date(expenseDate),
        invoiceReference,
        vendorReference,
        recordedBy: userId
      });

      this.loggingService.logInfo('Budget expense added', {
        userId,
        budgetId,
        categoryId,
        expenseAmount,
        expenseDescription
      });

      res.status(201).json({
        success: true,
        message: 'Expense added to budget successfully',
        data: expense,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to add budget expense', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add expense to budget',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get budget performance analysis
   */
  async getBudgetPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const { 
        analysisType = 'variance', // 'variance', 'trend', 'forecast'
        compareWithPrevious = true,
        includeCategoryBreakdown = true
      } = req.query;
      const userId = req.user?.userId;

      const performance = await this.budgetService.getBudgetPerformance(budgetId, {
        analysisType: analysisType as string,
        compareWithPrevious: Boolean(compareWithPrevious),
        includeCategoryBreakdown: Boolean(includeCategoryBreakdown),
        requestedBy: userId
      });

      res.json({
        success: true,
        data: performance,
        analysisType,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get budget performance', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve budget performance analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate budget forecast
   */
  async generateBudgetForecast(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const { 
        forecastPeriod = 12, // months
        forecastMethod = 'trend', // 'trend', 'seasonal', 'ml'
        includeGrowthAssumptions = true
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const forecast = await this.budgetService.generateBudgetForecast({
        budgetId,
        forecastPeriod: parseInt(forecastPeriod.toString()),
        forecastMethod,
        includeGrowthAssumptions: Boolean(includeGrowthAssumptions),
        generatedBy: userId
      });

      this.loggingService.logInfo('Budget forecast generated', {
        userId,
        budgetId,
        forecastPeriod,
        forecastMethod
      });

      res.json({
        success: true,
        message: 'Budget forecast generated successfully',
        data: forecast,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to generate budget forecast', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate budget forecast',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Set budget alerts and thresholds
   */
  async setBudgetAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const { 
        alertThresholds, // { category: percentage }
        notificationEmails,
        alertFrequency = 'weekly',
        isActive = true
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const alerts = await this.budgetService.setBudgetAlerts({
        budgetId,
        alertThresholds,
        notificationEmails,
        alertFrequency,
        isActive: Boolean(isActive),
        setupBy: userId
      });

      this.loggingService.logInfo('Budget alerts configured', {
        userId,
        budgetId,
        alertFrequency,
        thresholdCount: Object.keys(alertThresholds || {}).length
      });

      res.json({
        success: true,
        message: 'Budget alerts configured successfully',
        data: alerts,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to set budget alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to configure budget alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get budget comparison analysis
   */
  async getBudgetComparison(req: Request, res: Response): Promise<void> {
    try {
      const { 
        budgetIds, 
        comparisonType = 'period', // 'period', 'entity', 'category'
        comparisonPeriod,
        includeMetrics = true
      } = req.query;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const comparison = await this.budgetService.getBudgetComparison({
        budgetIds: budgetIds ? (budgetIds as string).split(',') : [],
        comparisonType: comparisonType as string,
        comparisonPeriod: comparisonPeriod as string,
        includeMetrics: Boolean(includeMetrics)
      });

      res.json({
        success: true,
        data: comparison,
        comparisonType,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get budget comparison', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve budget comparison',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate budget report
   */
  async generateBudgetReport(req: Request, res: Response): Promise<void> {
    try {
      const { 
        reportType = 'performance', // 'performance', 'variance', 'summary'
        entityIds,
        fiscalYear,
        reportFormat = 'pdf',
        includeCharts = true,
        language = 'en'
      } = req.query;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const report = await this.budgetService.generateBudgetReport({
        reportType: reportType as string,
        entityIds: entityIds ? (entityIds as string).split(',') : [],
        fiscalYear: fiscalYear ? parseInt(fiscalYear as string) : new Date().getFullYear(),
        reportFormat: reportFormat as string,
        includeCharts: Boolean(includeCharts),
        language: language as string,
        generatedBy: userId
      });

      this.loggingService.logInfo('Budget report generated', {
        userId,
        reportType,
        fiscalYear,
        reportFormat,
        language
      });

      if (reportFormat === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=budget-report-${reportType}-${fiscalYear}.pdf`);
        res.send(report);
      } else {
        res.json({
          success: true,
          data: report,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.loggingService.logError('Failed to generate budget report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate budget report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Approve or reject budget proposal
   */
  async reviewBudgetProposal(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      const { 
        action, // 'approve', 'reject', 'request_changes'
        reviewNotes,
        conditions,
        approvalLevel
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
        return;
      }

      const reviewResult = await this.budgetService.reviewBudgetProposal({
        budgetId,
        action,
        reviewNotes,
        conditions,
        approvalLevel,
        reviewedBy: userId
      });

      this.loggingService.logInfo('Budget proposal reviewed', {
        userId,
        budgetId,
        action,
        approvalLevel
      });

      res.json({
        success: true,
        message: `Budget proposal ${action}d successfully`,
        data: reviewResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to review budget proposal', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review budget proposal',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get budget analytics dashboard
   */
  async getBudgetAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        startDate, 
        endDate, 
        entityType = 'all', // 'vendor', 'department', 'all'
        entityId,
        analyticsType = 'overview'
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

      // Vendor can only see their own analytics
      const finalEntityId = userRole === 'vendor' ? userId?.toString() : entityId as string;

      const analytics = await this.budgetService.getBudgetAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        entityType: entityType as string,
        entityId: finalEntityId,
        analyticsType: analyticsType as string
      });

      res.json({
        success: true,
        data: analytics,
        period: {
          startDate,
          endDate
        },
        entityType,
        analyticsType,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get budget analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve budget analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Copy budget from previous period
   */
  async copyBudgetFromPrevious(req: Request, res: Response): Promise<void> {
    try {
      const { 
        sourceBudgetId,
        targetFiscalYear,
        adjustmentPercentage = 0, // increase/decrease all amounts by %
        adjustmentRules,
        copyExpenseHistory = false
      } = req.body;
      const userId = req.user?.userId;

      if (req.user?.role !== 'admin' && req.user?.role !== 'vendor') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or vendor role required.'
        });
        return;
      }

      const newBudget = await this.budgetService.copyBudgetFromPrevious({
        sourceBudgetId,
        targetFiscalYear: parseInt(targetFiscalYear),
        adjustmentPercentage: parseFloat(adjustmentPercentage.toString()),
        adjustmentRules,
        copyExpenseHistory: Boolean(copyExpenseHistory),
        createdBy: userId
      });

      this.loggingService.logInfo('Budget copied from previous period', {
        userId,
        sourceBudgetId,
        newBudgetId: newBudget.id,
        targetFiscalYear,
        adjustmentPercentage
      });

      res.status(201).json({
        success: true,
        message: 'Budget copied successfully from previous period',
        data: newBudget,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to copy budget from previous period', error);
      res.status(500).json({
        success: false,
        message: 'Failed to copy budget from previous period',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}