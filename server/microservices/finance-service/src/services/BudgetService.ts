/**
 * Budget Service - Financial Planning & Budget Management
 * Enterprise-grade budgeting and financial forecasting business logic
 */

import { db } from '../../../db';
import { vendors, orders, orderItems, products } from '@shared/schema';
import { eq, and, gte, lte, sum, desc, asc, avg } from 'drizzle-orm';

interface Budget {
  id: string;
  budgetName: string;
  entityType: string;
  entityId: string;
  budgetType: string;
  budgetPeriod: string;
  periodStart: Date;
  periodEnd: Date;
  totalBudgetAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  categoryLimit: number;
  alertThreshold: number;
  isActive: boolean;
}

export class BudgetService {
  
  /**
   * Create new budget
   */
  async createBudget(params: {
    budgetName: string;
    entityType: string;
    entityId: string;
    budgetType: string;
    budgetPeriod: string;
    periodStart: Date;
    periodEnd: Date;
    totalBudgetAmount: number;
    categories?: Array<{
      categoryName: string;
      allocatedAmount: number;
      categoryLimit?: number;
      alertThreshold?: number;
    }>;
    autoApprovalLimit?: number;
    approvalRequired: boolean;
    notes?: string;
    createdBy: string;
  }) {
    try {
      // Validate budget period
      this.validateBudgetPeriod(params.periodStart, params.periodEnd);

      // Validate budget categories allocation
      if (params.categories) {
        const totalCategoriesAmount = params.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
        if (totalCategoriesAmount > params.totalBudgetAmount) {
          throw new Error('Total category allocation exceeds budget amount');
        }
      }

      const budget = {
        id: this.generateBudgetId(),
        budgetName: params.budgetName,
        entityType: params.entityType,
        entityId: params.entityId,
        budgetType: params.budgetType,
        budgetPeriod: params.budgetPeriod,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        totalBudgetAmount: params.totalBudgetAmount,
        allocatedAmount: 0,
        spentAmount: 0,
        remainingAmount: params.totalBudgetAmount,
        status: 'draft',
        autoApprovalLimit: params.autoApprovalLimit || 0,
        approvalRequired: params.approvalRequired,
        notes: params.notes,
        createdBy: params.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save budget
      await this.saveBudget(budget);

      // Create budget categories if provided
      if (params.categories) {
        const categories = [];
        for (const categoryData of params.categories) {
          const category = {
            id: this.generateCategoryId(),
            budgetId: budget.id,
            categoryName: categoryData.categoryName,
            allocatedAmount: categoryData.allocatedAmount,
            spentAmount: 0,
            categoryLimit: categoryData.categoryLimit || categoryData.allocatedAmount,
            alertThreshold: categoryData.alertThreshold || 0.8, // 80% default
            isActive: true,
            createdAt: new Date()
          };
          
          await this.saveBudgetCategory(category);
          categories.push(category);
        }
        
        budget.categories = categories;
        
        // Update allocated amount
        const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
        await this.updateBudgetAllocatedAmount(budget.id, totalAllocated);
      }

      return budget;
    } catch (error) {
      throw new Error(`Failed to create budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get budgets with filtering
   */
  async getBudgets(filters: {
    entityType?: string;
    entityId?: string;
    budgetType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    try {
      const budgets = await this.queryBudgets(filters);

      return {
        budgets,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: budgets.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get budgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get budget details by ID
   */
  async getBudgetById(budgetId: string, options: {
    includeCategories: boolean;
    includeExpenses: boolean;
    includeForecasting: boolean;
  }) {
    try {
      const budget = await this.findBudgetById(budgetId);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      if (options.includeCategories) {
        budget.categories = await this.getBudgetCategories(budgetId);
      }

      if (options.includeExpenses) {
        budget.expenses = await this.getBudgetExpenses(budgetId);
      }

      if (options.includeForecasting) {
        budget.forecasting = await this.generateBudgetForecast(budgetId);
      }

      return budget;
    } catch (error) {
      throw new Error(`Failed to get budget details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update budget
   */
  async updateBudget(budgetId: string, updateData: {
    budgetName?: string;
    totalBudgetAmount?: number;
    status?: string;
    notes?: string;
    autoApprovalLimit?: number;
    approvalRequired?: boolean;
  }, updatedBy: string) {
    try {
      const budget = await this.findBudgetById(budgetId);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      // Validate budget amount if being updated
      if (updateData.totalBudgetAmount && updateData.totalBudgetAmount !== budget.totalBudgetAmount) {
        await this.validateBudgetAmountUpdate(budgetId, updateData.totalBudgetAmount);
      }

      const updatedBudget = {
        ...budget,
        ...updateData,
        remainingAmount: updateData.totalBudgetAmount ? 
          updateData.totalBudgetAmount - budget.spentAmount : 
          budget.remainingAmount,
        updatedBy,
        updatedAt: new Date()
      };

      await this.updateBudgetRecord(budgetId, updatedBudget);

      return updatedBudget;
    } catch (error) {
      throw new Error(`Failed to update budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record budget expense
   */
  async recordExpense(params: {
    budgetId: string;
    categoryId?: string;
    expenseType: string;
    amount: number;
    description: string;
    expenseDate: Date;
    reference?: string;
    approvalRequired?: boolean;
    attachments?: string[];
    recordedBy: string;
  }) {
    try {
      const budget = await this.findBudgetById(params.budgetId);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      // Check if budget period is active
      const now = new Date();
      if (now < budget.periodStart || now > budget.periodEnd) {
        throw new Error('Budget period is not active');
      }

      // Check budget availability
      if (budget.remainingAmount < params.amount) {
        throw new Error('Insufficient budget amount');
      }

      // Check category limits if category specified
      if (params.categoryId) {
        const category = await this.findBudgetCategory(params.categoryId);
        if (category && (category.spentAmount + params.amount) > category.categoryLimit) {
          throw new Error('Category limit exceeded');
        }
      }

      const expense = {
        id: this.generateExpenseId(),
        budgetId: params.budgetId,
        categoryId: params.categoryId,
        expenseType: params.expenseType,
        amount: params.amount,
        description: params.description,
        expenseDate: params.expenseDate,
        reference: params.reference,
        status: params.approvalRequired ? 'pending_approval' : 'approved',
        attachments: params.attachments || [],
        recordedBy: params.recordedBy,
        createdAt: new Date()
      };

      // Save expense record
      await this.saveExpense(expense);

      // Update budget spent amount if auto-approved
      if (!params.approvalRequired) {
        await this.updateBudgetSpentAmount(params.budgetId, params.amount);
        
        // Update category spent amount if applicable
        if (params.categoryId) {
          await this.updateCategorySpentAmount(params.categoryId, params.amount);
        }

        // Check for alerts
        await this.checkBudgetAlerts(params.budgetId);
      }

      return expense;
    } catch (error) {
      throw new Error(`Failed to record expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve budget expense
   */
  async approveExpense(params: {
    expenseId: string;
    approvalNotes?: string;
    approvedAmount?: number;
    approvedBy: string;
  }) {
    try {
      const expense = await this.findExpense(params.expenseId);
      
      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.status !== 'pending_approval') {
        throw new Error(`Cannot approve expense with status: ${expense.status}`);
      }

      const approvedAmount = params.approvedAmount || expense.amount;

      // Check budget availability for approved amount
      const budget = await this.findBudgetById(expense.budgetId);
      if (budget.remainingAmount < approvedAmount) {
        throw new Error('Insufficient budget amount for approval');
      }

      const approvedExpense = {
        ...expense,
        status: 'approved',
        approvedAmount,
        approvalNotes: params.approvalNotes,
        approvedBy: params.approvedBy,
        approvedAt: new Date()
      };

      // Update expense record
      await this.updateExpense(params.expenseId, approvedExpense);

      // Update budget spent amount
      await this.updateBudgetSpentAmount(expense.budgetId, approvedAmount);

      // Update category spent amount if applicable
      if (expense.categoryId) {
        await this.updateCategorySpentAmount(expense.categoryId, approvedAmount);
      }

      // Check for alerts
      await this.checkBudgetAlerts(expense.budgetId);

      return approvedExpense;
    } catch (error) {
      throw new Error(`Failed to approve expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate budget report
   */
  async generateBudgetReport(params: {
    budgetId?: string;
    entityId?: string;
    reportType: string;
    reportPeriod: string;
    includeForecasting: boolean;
    includeVarianceAnalysis: boolean;
    format: string;
    generatedBy: string;
  }) {
    try {
      let budgets: any[] = [];
      
      if (params.budgetId) {
        const budget = await this.findBudgetById(params.budgetId);
        if (budget) budgets = [budget];
      } else if (params.entityId) {
        budgets = await this.getBudgetsByEntity(params.entityId);
      } else {
        throw new Error('Either budgetId or entityId must be provided');
      }

      const reportData = {
        reportId: this.generateReportId(),
        reportType: params.reportType,
        reportPeriod: params.reportPeriod,
        budgets: [],
        summary: {
          totalBudgetAmount: 0,
          totalSpentAmount: 0,
          totalRemainingAmount: 0,
          budgetUtilization: 0,
          categoriesCount: 0
        },
        forecasting: null,
        varianceAnalysis: null,
        generatedBy: params.generatedBy,
        generatedAt: new Date()
      };

      for (const budget of budgets) {
        const budgetData = await this.processBudgetForReport(budget.id, {
          includeCategories: true,
          includeExpenses: true,
          includeForecasting: params.includeForecasting,
          includeVarianceAnalysis: params.includeVarianceAnalysis
        });
        
        reportData.budgets.push(budgetData);
        
        // Update summary
        reportData.summary.totalBudgetAmount += budget.totalBudgetAmount;
        reportData.summary.totalSpentAmount += budget.spentAmount;
        reportData.summary.totalRemainingAmount += budget.remainingAmount;
      }

      // Calculate utilization
      if (reportData.summary.totalBudgetAmount > 0) {
        reportData.summary.budgetUtilization = 
          (reportData.summary.totalSpentAmount / reportData.summary.totalBudgetAmount) * 100;
      }

      if (params.includeForecasting) {
        reportData.forecasting = await this.generateBudgetForecasting(budgets);
      }

      if (params.includeVarianceAnalysis) {
        reportData.varianceAnalysis = await this.generateVarianceAnalysis(budgets);
      }

      return reportData;
    } catch (error) {
      throw new Error(`Failed to generate budget report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get budget analytics
   */
  async getBudgetAnalytics(params: {
    entityId?: string;
    budgetType?: string;
    startDate?: Date;
    endDate?: Date;
    analyticsType: string;
    groupBy: string;
  }) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      const endDate = params.endDate || new Date();

      // Get budget data for analytics
      const budgets = await this.getBudgetsForAnalytics({
        entityId: params.entityId,
        budgetType: params.budgetType,
        startDate,
        endDate
      });

      // Process analytics based on type
      const analytics = await this.processBudgetAnalytics(
        budgets,
        params.analyticsType,
        params.groupBy
      );

      return {
        period: { startDate, endDate },
        analyticsType: params.analyticsType,
        groupBy: params.groupBy,
        data: analytics,
        summary: {
          totalBudgets: budgets.length,
          totalBudgetAmount: budgets.reduce((sum, b) => sum + b.totalBudgetAmount, 0),
          totalSpentAmount: budgets.reduce((sum, b) => sum + b.spentAmount, 0),
          averageUtilization: this.calculateAverageUtilization(budgets)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get budget analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer budget between categories
   */
  async transferBudget(params: {
    sourceBudgetId: string;
    targetBudgetId: string;
    amount: number;
    reason: string;
    approvalRequired: boolean;
    transferredBy: string;
  }) {
    try {
      const sourceBudget = await this.findBudgetById(params.sourceBudgetId);
      const targetBudget = await this.findBudgetById(params.targetBudgetId);

      if (!sourceBudget || !targetBudget) {
        throw new Error('Source or target budget not found');
      }

      if (sourceBudget.remainingAmount < params.amount) {
        throw new Error('Insufficient budget amount in source budget');
      }

      const transfer = {
        id: this.generateTransferId(),
        sourceBudgetId: params.sourceBudgetId,
        targetBudgetId: params.targetBudgetId,
        amount: params.amount,
        reason: params.reason,
        status: params.approvalRequired ? 'pending_approval' : 'completed',
        transferredBy: params.transferredBy,
        createdAt: new Date()
      };

      // Save transfer record
      await this.saveBudgetTransfer(transfer);

      // Execute transfer if no approval required
      if (!params.approvalRequired) {
        await this.executeBudgetTransfer(transfer.id);
      }

      return transfer;
    } catch (error) {
      throw new Error(`Failed to transfer budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set budget alerts and notifications
   */
  async setBudgetAlerts(params: {
    budgetId: string;
    alertType: string;
    threshold: number;
    notificationChannels: string[];
    recipients: string[];
    isActive: boolean;
    setBy: string;
  }) {
    try {
      const budget = await this.findBudgetById(params.budgetId);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      const alert = {
        id: this.generateAlertId(),
        budgetId: params.budgetId,
        alertType: params.alertType,
        threshold: params.threshold,
        notificationChannels: params.notificationChannels,
        recipients: params.recipients,
        isActive: params.isActive,
        lastTriggered: null,
        setBy: params.setBy,
        createdAt: new Date()
      };

      // Save alert configuration
      await this.saveBudgetAlert(alert);

      return alert;
    } catch (error) {
      throw new Error(`Failed to set budget alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get budget recommendations
   */
  async getBudgetRecommendations(params: {
    entityId: string;
    budgetType?: string;
    analysisDepth: string;
    includeMLPredictions: boolean;
  }) {
    try {
      // Get historical budget data
      const historicalBudgets = await this.getHistoricalBudgets(params.entityId);
      
      // Analyze spending patterns
      const spendingPatterns = await this.analyzeSpendingPatterns(historicalBudgets);
      
      // Generate recommendations
      const recommendations = await this.generateBudgetRecommendations({
        entityId: params.entityId,
        historicalData: historicalBudgets,
        spendingPatterns,
        analysisDepth: params.analysisDepth,
        includeMLPredictions: params.includeMLPredictions
      });

      return {
        entityId: params.entityId,
        analysisDepth: params.analysisDepth,
        spendingPatterns,
        recommendations,
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get budget recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private validateBudgetPeriod(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new Error('Budget start date must be before end date');
    }
    
    if (startDate < new Date()) {
      throw new Error('Budget start date cannot be in the past');
    }
  }

  private generateBudgetId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateCategoryId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateExpenseId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateReportId(): string {
    return `rpt_${Date.now()}`;
  }

  private generateTransferId(): string {
    return `xfer_${Date.now()}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}`;
  }

  private async saveBudget(budget: any) {
    // Save budget to database
  }

  private async saveBudgetCategory(category: any) {
    // Save budget category to database
  }

  private async updateBudgetAllocatedAmount(budgetId: string, amount: number) {
    // Update budget allocated amount
  }

  private async queryBudgets(filters: any) {
    // Query budgets from database
    return [];
  }

  private async findBudgetById(budgetId: string) {
    // Find budget by ID
    return null;
  }

  private async getBudgetCategories(budgetId: string) {
    // Get budget categories
    return [];
  }

  private async getBudgetExpenses(budgetId: string) {
    // Get budget expenses
    return [];
  }

  private async generateBudgetForecast(budgetId: string) {
    // Generate budget forecast
    return {
      projectedSpend: 0,
      estimatedCompletion: new Date(),
      riskFactors: []
    };
  }

  private async validateBudgetAmountUpdate(budgetId: string, newAmount: number) {
    // Validate budget amount update
    const budget = await this.findBudgetById(budgetId);
    if (budget && newAmount < budget.spentAmount) {
      throw new Error('New budget amount cannot be less than already spent amount');
    }
  }

  private async updateBudgetRecord(budgetId: string, updateData: any) {
    // Update budget record in database
  }

  private async findBudgetCategory(categoryId: string) {
    // Find budget category by ID
    return null;
  }

  private async saveExpense(expense: any) {
    // Save expense to database
  }

  private async updateBudgetSpentAmount(budgetId: string, amount: number) {
    // Update budget spent amount
  }

  private async updateCategorySpentAmount(categoryId: string, amount: number) {
    // Update category spent amount
  }

  private async checkBudgetAlerts(budgetId: string) {
    // Check and trigger budget alerts if necessary
  }

  private async findExpense(expenseId: string) {
    // Find expense by ID
    return null;
  }

  private async updateExpense(expenseId: string, updateData: any) {
    // Update expense record
  }

  private async getBudgetsByEntity(entityId: string) {
    // Get budgets by entity ID
    return [];
  }

  private async processBudgetForReport(budgetId: string, options: any) {
    // Process budget data for report
    return {};
  }

  private async generateBudgetForecasting(budgets: any[]) {
    // Generate budget forecasting
    return {};
  }

  private async generateVarianceAnalysis(budgets: any[]) {
    // Generate variance analysis
    return {};
  }

  private async getBudgetsForAnalytics(filters: any) {
    // Get budgets for analytics
    return [];
  }

  private async processBudgetAnalytics(budgets: any[], analyticsType: string, groupBy: string) {
    // Process budget analytics
    return {};
  }

  private calculateAverageUtilization(budgets: any[]): number {
    if (budgets.length === 0) return 0;
    
    const totalUtilization = budgets.reduce((sum, budget) => {
      const utilization = budget.totalBudgetAmount > 0 ? 
        (budget.spentAmount / budget.totalBudgetAmount) * 100 : 0;
      return sum + utilization;
    }, 0);
    
    return totalUtilization / budgets.length;
  }

  private async saveBudgetTransfer(transfer: any) {
    // Save budget transfer record
  }

  private async executeBudgetTransfer(transferId: string) {
    // Execute budget transfer
  }

  private async saveBudgetAlert(alert: any) {
    // Save budget alert configuration
  }

  private async getHistoricalBudgets(entityId: string) {
    // Get historical budget data
    return [];
  }

  private async analyzeSpendingPatterns(budgets: any[]) {
    // Analyze spending patterns
    return {
      seasonality: {},
      categoryTrends: {},
      averageUtilization: 0
    };
  }

  private async generateBudgetRecommendations(params: any) {
    // Generate budget recommendations using ML and historical data
    return [
      {
        type: 'budget_optimization',
        priority: 'high',
        recommendation: 'Consider reducing marketing budget by 10% and reallocating to inventory',
        expectedImpact: 'Potential 5% cost savings',
        confidence: 0.85
      }
    ];
  }
}