/**
 * Payout Service - Vendor Payout Management
 * Enterprise-grade vendor payouts with Bangladesh payment methods business logic
 */

import { db } from '../../../db';
import { vendorCommissions, orders, vendors, users } from '@shared/schema';
import { eq, and, gte, lte, sum, desc, asc } from 'drizzle-orm';

interface Payout {
  id: string;
  payoutNumber: string;
  vendorId: string;
  payoutPeriodStart: Date;
  payoutPeriodEnd: Date;
  grossEarnings: number;
  commissionDeductions: number;
  taxWithholdings: number;
  otherDeductions: number;
  netPayoutAmount: number;
  paymentMethod: string;
  paymentDetails: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PayoutService {
  
  /**
   * Create vendor payout
   */
  async createPayout(params: {
    vendorId: string;
    payoutPeriodStart: Date;
    payoutPeriodEnd: Date;
    paymentMethod: string;
    paymentDetails: any;
    notes?: string;
    createdBy: string;
  }) {
    try {
      // Calculate vendor earnings for the period
      const earnings = await this.calculateVendorEarnings({
        vendorId: params.vendorId,
        startDate: params.payoutPeriodStart,
        endDate: params.payoutPeriodEnd,
        includeCommissions: true,
        includeTaxDeductions: true,
        includeAdjustments: true
      });

      // Generate payout number
      const payoutNumber = await this.generatePayoutNumber(params.vendorId);

      // Validate payment method and details
      await this.validatePaymentMethod(params.paymentMethod, params.paymentDetails);

      const payout = {
        id: this.generatePayoutId(),
        payoutNumber,
        vendorId: params.vendorId,
        payoutPeriodStart: params.payoutPeriodStart,
        payoutPeriodEnd: params.payoutPeriodEnd,
        grossEarnings: earnings.grossEarnings,
        commissionDeductions: earnings.commissionDeductions,
        taxWithholdings: earnings.taxWithholdings,
        otherDeductions: earnings.otherDeductions,
        netPayoutAmount: earnings.netPayoutAmount,
        paymentMethod: params.paymentMethod,
        paymentDetails: this.sanitizePaymentDetails(params.paymentDetails),
        status: 'pending',
        notes: params.notes,
        earningsBreakdown: earnings.breakdown,
        createdBy: params.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save payout record
      await this.savePayout(payout);

      return payout;
    } catch (error) {
      throw new Error(`Failed to create payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vendor payouts with filtering
   */
  async getPayouts(filters: {
    vendorId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    paymentMethod?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    try {
      const payouts = await this.queryPayouts(filters);

      return {
        payouts,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: payouts.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get payouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payout details by ID
   */
  async getPayoutById(payoutId: string, options: {
    includeBreakdown: boolean;
    includeOrders: boolean;
    requestedBy: string;
  }) {
    try {
      const payout = await this.findPayoutById(payoutId);
      
      if (!payout) {
        throw new Error('Payout not found');
      }

      if (options.includeBreakdown) {
        payout.earningsBreakdown = await this.getPayoutEarningsBreakdown(payoutId);
      }

      if (options.includeOrders) {
        payout.orders = await this.getPayoutOrders(payoutId);
      }

      return payout;
    } catch (error) {
      throw new Error(`Failed to get payout details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process payout payment
   */
  async processPayout(params: {
    payoutId: string;
    processingNotes?: string;
    paymentReference?: string;
    scheduledAt?: Date;
    processedBy: string;
  }) {
    try {
      const payout = await this.findPayoutById(params.payoutId);
      
      if (!payout) {
        throw new Error('Payout not found');
      }

      if (payout.status !== 'pending') {
        throw new Error(`Cannot process payout with status: ${payout.status}`);
      }

      // Initiate payment based on method
      const paymentResult = await this.initiatePayment(payout, params.paymentReference);

      const processedPayout = {
        ...payout,
        status: 'processing',
        processingNotes: params.processingNotes,
        paymentReference: paymentResult.paymentReference,
        scheduledAt: params.scheduledAt || new Date(),
        processedBy: params.processedBy,
        processedAt: new Date(),
        updatedAt: new Date()
      };

      // Update payout record
      await this.updatePayout(params.payoutId, processedPayout);

      return processedPayout;
    } catch (error) {
      throw new Error(`Failed to process payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete payout payment
   */
  async completePayout(params: {
    payoutId: string;
    transactionId?: string;
    completionNotes?: string;
    actualPaidAmount?: number;
    paidAt: Date;
    completedBy: string;
  }) {
    try {
      const payout = await this.findPayoutById(params.payoutId);
      
      if (!payout) {
        throw new Error('Payout not found');
      }

      if (payout.status !== 'processing') {
        throw new Error(`Cannot complete payout with status: ${payout.status}`);
      }

      const actualAmount = params.actualPaidAmount || payout.netPayoutAmount;

      const completedPayout = {
        ...payout,
        status: 'completed',
        transactionId: params.transactionId,
        completionNotes: params.completionNotes,
        actualPaidAmount: actualAmount,
        paidAt: params.paidAt,
        completedBy: params.completedBy,
        completedAt: new Date(),
        updatedAt: new Date()
      };

      // Update payout record
      await this.updatePayout(params.payoutId, completedPayout);

      // Update vendor balance
      await this.updateVendorBalance(payout.vendorId, -actualAmount);

      // Send notification to vendor
      await this.sendPayoutNotification(payout.vendorId, completedPayout);

      return completedPayout;
    } catch (error) {
      throw new Error(`Failed to complete payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel payout
   */
  async cancelPayout(params: {
    payoutId: string;
    cancellationReason: string;
    notes?: string;
    cancelledBy: string;
  }) {
    try {
      const payout = await this.findPayoutById(params.payoutId);
      
      if (!payout) {
        throw new Error('Payout not found');
      }

      if (!['pending', 'processing'].includes(payout.status)) {
        throw new Error(`Cannot cancel payout with status: ${payout.status}`);
      }

      const cancelledPayout = {
        ...payout,
        status: 'cancelled',
        cancellationReason: params.cancellationReason,
        cancellationNotes: params.notes,
        cancelledBy: params.cancelledBy,
        cancelledAt: new Date(),
        updatedAt: new Date()
      };

      // Update payout record
      await this.updatePayout(params.payoutId, cancelledPayout);

      return cancelledPayout;
    } catch (error) {
      throw new Error(`Failed to cancel payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate vendor earnings for period
   */
  async calculateVendorEarnings(params: {
    vendorId: string;
    startDate: Date;
    endDate: Date;
    includeCommissions: boolean;
    includeTaxDeductions: boolean;
    includeAdjustments: boolean;
  }) {
    try {
      // Get vendor commission records for the period
      const [commissionResult] = await db.select({
        totalEarnings: sum(vendorCommissions.commissionAmount)
      })
      .from(vendorCommissions)
      .where(and(
        eq(vendorCommissions.vendorId, params.vendorId),
        gte(vendorCommissions.createdAt, params.startDate),
        lte(vendorCommissions.createdAt, params.endDate)
      ));

      const grossEarnings = Number(commissionResult?.totalEarnings || 0);

      // Calculate deductions
      let commissionDeductions = 0;
      let taxWithholdings = 0;
      let otherDeductions = 0;

      if (params.includeCommissions) {
        commissionDeductions = await this.calculateCommissionDeductions(params.vendorId, params.startDate, params.endDate);
      }

      if (params.includeTaxDeductions) {
        taxWithholdings = await this.calculateTaxWithholdings(params.vendorId, grossEarnings);
      }

      if (params.includeAdjustments) {
        otherDeductions = await this.calculateOtherDeductions(params.vendorId, params.startDate, params.endDate);
      }

      const totalDeductions = commissionDeductions + taxWithholdings + otherDeductions;
      const netPayoutAmount = Math.max(0, grossEarnings - totalDeductions);

      // Get detailed breakdown
      const breakdown = await this.getEarningsBreakdown(params.vendorId, params.startDate, params.endDate);

      return {
        vendorId: params.vendorId,
        period: {
          startDate: params.startDate,
          endDate: params.endDate
        },
        grossEarnings,
        commissionDeductions,
        taxWithholdings,
        otherDeductions,
        totalDeductions,
        netPayoutAmount,
        breakdown
      };
    } catch (error) {
      throw new Error(`Failed to calculate vendor earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate payout statement for vendor
   */
  async generatePayoutStatement(params: {
    vendorId: string;
    startDate: Date;
    endDate: Date;
    format: string;
    includeDetails: boolean;
    language: string;
    generatedBy: string;
  }) {
    try {
      // Get vendor details
      const vendor = await this.getVendorDetails(params.vendorId);
      
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Get payouts for the period
      const payouts = await this.getPayoutsForPeriod(params.vendorId, params.startDate, params.endDate);

      // Calculate summary
      const summary = {
        totalPayouts: payouts.length,
        totalGrossEarnings: payouts.reduce((sum, p) => sum + p.grossEarnings, 0),
        totalDeductions: payouts.reduce((sum, p) => sum + p.totalDeductions, 0),
        totalNetAmount: payouts.reduce((sum, p) => sum + p.netPayoutAmount, 0)
      };

      if (params.format === 'pdf') {
        // Generate PDF statement
        const pdfBuffer = await this.generatePayoutStatementPDF({
          vendor,
          payouts,
          summary,
          period: { startDate: params.startDate, endDate: params.endDate },
          includeDetails: params.includeDetails,
          language: params.language
        });

        return pdfBuffer;
      } else {
        // Return JSON statement
        return {
          vendor,
          period: { startDate: params.startDate, endDate: params.endDate },
          summary,
          payouts: params.includeDetails ? payouts : undefined,
          generatedBy: params.generatedBy,
          generatedAt: new Date()
        };
      }
    } catch (error) {
      throw new Error(`Failed to generate payout statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payout analytics
   */
  async getPayoutAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
    analyticsType: string;
    groupBy: string;
  }) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = params.endDate || new Date();

      // Get payout data for analytics
      const payouts = await this.getPayoutsForAnalytics({
        startDate,
        endDate,
        vendorId: params.vendorId
      });

      // Process analytics based on type
      const analytics = await this.processPayoutAnalytics(
        payouts,
        params.analyticsType,
        params.groupBy
      );

      return {
        period: { startDate, endDate },
        analyticsType: params.analyticsType,
        groupBy: params.groupBy,
        data: analytics,
        summary: {
          totalPayouts: payouts.length,
          totalAmount: payouts.reduce((sum, p) => sum + p.netPayoutAmount, 0),
          averagePayoutAmount: payouts.length > 0 ? 
            payouts.reduce((sum, p) => sum + p.netPayoutAmount, 0) / payouts.length : 0,
          successfulPayouts: payouts.filter(p => p.status === 'completed').length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get payout analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get pending payouts requiring approval
   */
  async getPendingPayouts(params: {
    minimumAmount?: number;
    paymentMethod?: string;
    vendorId?: string;
    page: number;
    limit: number;
  }) {
    try {
      const pendingPayouts = await this.queryPendingPayouts(params);

      return {
        payouts: pendingPayouts,
        summary: {
          totalPending: pendingPayouts.length,
          totalPendingAmount: pendingPayouts.reduce((sum, p) => sum + p.netPayoutAmount, 0),
          oldestPending: this.getOldestPendingDate(pendingPayouts)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get pending payouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk payout operations
   */
  async bulkPayoutOperations(params: {
    operation: string;
    payoutIds: string[];
    operationData?: any;
    performedBy: string;
  }) {
    try {
      const results = {
        successCount: 0,
        failureCount: 0,
        results: [] as any[]
      };

      for (const payoutId of params.payoutIds) {
        try {
          let result;
          
          switch (params.operation) {
            case 'approve':
              result = await this.processPayout({
                payoutId,
                processedBy: params.performedBy
              });
              break;
              
            case 'process':
              result = await this.processPayout({
                payoutId,
                processedBy: params.performedBy
              });
              break;
              
            case 'complete':
              result = await this.completePayout({
                payoutId,
                paidAt: new Date(),
                completedBy: params.performedBy
              });
              break;
              
            case 'cancel':
              result = await this.cancelPayout({
                payoutId,
                cancellationReason: params.operationData?.reason || 'Bulk cancellation',
                cancelledBy: params.performedBy
              });
              break;
              
            default:
              throw new Error(`Unknown operation: ${params.operation}`);
          }

          results.successCount++;
          results.results.push({
            payoutId,
            status: 'success',
            result
          });
        } catch (error) {
          results.failureCount++;
          results.results.push({
            payoutId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to perform bulk payout operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Setup automatic payouts for vendor
   */
  async setupAutomaticPayouts(params: {
    vendorId: string;
    frequency: string;
    minimumAmount: number;
    paymentMethod: string;
    paymentDetails: any;
    isActive: boolean;
    setupBy: string;
  }) {
    try {
      // Validate payment method and details
      await this.validatePaymentMethod(params.paymentMethod, params.paymentDetails);

      const automaticPayout = {
        id: this.generateAutomaticPayoutId(),
        vendorId: params.vendorId,
        frequency: params.frequency,
        minimumAmount: params.minimumAmount,
        paymentMethod: params.paymentMethod,
        paymentDetails: this.sanitizePaymentDetails(params.paymentDetails),
        isActive: params.isActive,
        nextPayoutDate: this.calculateNextPayoutDate(params.frequency),
        setupBy: params.setupBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save automatic payout configuration
      await this.saveAutomaticPayout(automaticPayout);

      return automaticPayout;
    } catch (error) {
      throw new Error(`Failed to setup automatic payouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payout tax information
   */
  async getPayoutTaxInfo(params: {
    vendorId: string;
    fiscalYear: number;
    includeDeductions: boolean;
  }) {
    try {
      const startDate = new Date(params.fiscalYear, 3, 1); // April 1st (BD fiscal year)
      const endDate = new Date(params.fiscalYear + 1, 2, 31); // March 31st

      // Get all payouts for the fiscal year
      const payouts = await this.getPayoutsForPeriod(params.vendorId, startDate, endDate);

      const taxInfo = {
        vendorId: params.vendorId,
        fiscalYear: params.fiscalYear,
        period: { startDate, endDate },
        totalEarnings: payouts.reduce((sum, p) => sum + p.grossEarnings, 0),
        totalTaxWithheld: payouts.reduce((sum, p) => sum + p.taxWithholdings, 0),
        totalNetPaid: payouts.reduce((sum, p) => sum + p.netPayoutAmount, 0),
        payoutCount: payouts.length
      };

      if (params.includeDeductions) {
        taxInfo.deductionsBreakdown = await this.getTaxDeductionsBreakdown(params.vendorId, startDate, endDate);
      }

      return taxInfo;
    } catch (error) {
      throw new Error(`Failed to get payout tax information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private generatePayoutId(): string {
    return `payout_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async generatePayoutNumber(vendorId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `PO${year}${month}${sequence}`;
  }

  private async validatePaymentMethod(method: string, details: any) {
    // Validate Bangladesh payment methods
    const supportedMethods = ['bkash', 'nagad', 'rocket', 'bank_transfer', 'check'];
    
    if (!supportedMethods.includes(method)) {
      throw new Error(`Unsupported payment method: ${method}`);
    }

    // Validate method-specific details
    switch (method) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        if (!details.mobileNumber || !this.isValidBangladeshMobile(details.mobileNumber)) {
          throw new Error('Valid Bangladesh mobile number required');
        }
        break;
        
      case 'bank_transfer':
        if (!details.accountNumber || !details.bankName || !details.routingNumber) {
          throw new Error('Bank account details required');
        }
        break;
        
      case 'check':
        if (!details.payeeName || !details.address) {
          throw new Error('Payee name and address required for check');
        }
        break;
    }
  }

  private isValidBangladeshMobile(mobile: string): boolean {
    // Bangladesh mobile number format: +880XXXXXXXXX or 01XXXXXXXXX
    const bdMobileRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    return bdMobileRegex.test(mobile);
  }

  private sanitizePaymentDetails(details: any) {
    // Remove sensitive information from payment details for storage
    const sanitized = { ...details };
    
    if (sanitized.accountNumber) {
      sanitized.accountNumber = `****${sanitized.accountNumber.slice(-4)}`;
    }
    
    if (sanitized.mobileNumber) {
      sanitized.mobileNumber = `****${sanitized.mobileNumber.slice(-4)}`;
    }
    
    return sanitized;
  }

  private async savePayout(payout: any) {
    // Save payout to database
  }

  private async queryPayouts(filters: any) {
    // Query payouts from database
    return [];
  }

  private async findPayoutById(payoutId: string) {
    // Find payout by ID
    return null;
  }

  private async getPayoutEarningsBreakdown(payoutId: string) {
    // Get earnings breakdown for payout
    return {};
  }

  private async getPayoutOrders(payoutId: string) {
    // Get orders included in payout
    return [];
  }

  private async initiatePayment(payout: any, paymentReference?: string) {
    // Initiate payment based on method
    return {
      paymentReference: paymentReference || `PAY_${Date.now()}`,
      status: 'initiated'
    };
  }

  private async updatePayout(payoutId: string, updateData: any) {
    // Update payout in database
  }

  private async updateVendorBalance(vendorId: string, amount: number) {
    // Update vendor balance
  }

  private async sendPayoutNotification(vendorId: string, payout: any) {
    // Send notification to vendor
  }

  private async calculateCommissionDeductions(vendorId: string, startDate: Date, endDate: Date): Promise<number> {
    // Calculate platform commission deductions
    return 0;
  }

  private async calculateTaxWithholdings(vendorId: string, grossEarnings: number): Promise<number> {
    // Calculate tax withholdings based on Bangladesh tax law
    if (grossEarnings <= 300000) return 0; // No tax for earnings below 3 lakh
    if (grossEarnings <= 1000000) return grossEarnings * 0.03; // 3%
    if (grossEarnings <= 2500000) return grossEarnings * 0.05; // 5%
    return grossEarnings * 0.07; // 7%
  }

  private async calculateOtherDeductions(vendorId: string, startDate: Date, endDate: Date): Promise<number> {
    // Calculate other deductions (adjustments, penalties, etc.)
    return 0;
  }

  private async getEarningsBreakdown(vendorId: string, startDate: Date, endDate: Date) {
    // Get detailed earnings breakdown
    return {
      orderCommissions: 0,
      bonuses: 0,
      adjustments: 0
    };
  }

  private async getVendorDetails(vendorId: string) {
    const [vendor] = await db.select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);
    
    return vendor;
  }

  private async getPayoutsForPeriod(vendorId: string, startDate: Date, endDate: Date) {
    // Get payouts for vendor in period
    return [];
  }

  private async generatePayoutStatementPDF(params: any): Promise<Buffer> {
    // Generate PDF statement
    return Buffer.from('PDF content');
  }

  private async getPayoutsForAnalytics(filters: any) {
    // Get payouts for analytics
    return [];
  }

  private async processPayoutAnalytics(payouts: any[], analyticsType: string, groupBy: string) {
    // Process analytics data
    return {};
  }

  private async queryPendingPayouts(params: any) {
    // Query pending payouts
    return [];
  }

  private getOldestPendingDate(payouts: any[]): Date | null {
    if (payouts.length === 0) return null;
    
    return payouts.reduce((oldest, payout) => {
      return payout.createdAt < oldest ? payout.createdAt : oldest;
    }, payouts[0].createdAt);
  }

  private generateAutomaticPayoutId(): string {
    return `auto_payout_${Date.now()}`;
  }

  private calculateNextPayoutDate(frequency: string): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, 1);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async saveAutomaticPayout(automaticPayout: any) {
    // Save automatic payout configuration
  }

  private async getTaxDeductionsBreakdown(vendorId: string, startDate: Date, endDate: Date) {
    // Get tax deductions breakdown
    return {
      incomeTax: 0,
      vatWithholding: 0,
      advanceTax: 0
    };
  }
}