/**
 * Tax Model - Bangladesh Tax Compliance Data Layer
 * Enterprise-grade tax calculation and regulatory data processing
 */

import { db } from '../../../db';
import { taxRecords, orders, orderItems, vendorCommissions } from '@shared/schema';
import { eq, and, gte, lte, sum, count, desc, asc, avg } from 'drizzle-orm';

export interface TaxRate {
  taxType: string;
  entityType: string;
  rate: number;
  threshold?: number;
  description: string;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
}

export interface TaxCalculation {
  id: string;
  entityType: string;
  entityId: string;
  taxType: string;
  baseAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  exemptionAmount?: number;
  exemptionReason?: string;
  calculatedAt: Date;
  metadata: any;
}

export interface VATRecord {
  id: string;
  transactionId: string;
  transactionType: string;
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  vatNumber?: string;
  isReversed: boolean;
  recordedAt: Date;
}

export interface WithholdingTaxRecord {
  id: string;
  payeeId: string;
  payeeType: string;
  grossAmount: number;
  withholdingRate: number;
  withholdingAmount: number;
  netAmount: number;
  taxYear: number;
  challanNumber?: string;
  filedAt?: Date;
  status: string;
}

export interface TaxReturn {
  id: string;
  returnType: string;
  taxYear: number;
  entityId: string;
  totalIncome: number;
  taxableIncome: number;
  totalTax: number;
  paidTax: number;
  refundDue: number;
  status: string;
  filedAt?: Date;
  dueDate: Date;
}

export class TaxModel {
  
  /**
   * Calculate VAT for transactions
   */
  async calculateVAT(transactions: Array<{
    transactionId: string;
    transactionType: string;
    amount: number;
    productType?: string;
    exemptionCode?: string;
  }>) {
    try {
      const vatCalculations = [];
      
      for (const transaction of transactions) {
        // Get applicable VAT rate
        const vatRate = await this.getVATRate(transaction.productType, transaction.exemptionCode);
        
        // Check for exemptions
        const exemption = await this.checkVATExemption(transaction.exemptionCode);
        
        const vatAmount = exemption ? 0 : transaction.amount * vatRate;
        const totalAmount = transaction.amount + vatAmount;

        const vatRecord: VATRecord = {
          id: this.generateId(),
          transactionId: transaction.transactionId,
          transactionType: transaction.transactionType,
          baseAmount: transaction.amount,
          vatRate,
          vatAmount,
          totalAmount,
          isReversed: false,
          recordedAt: new Date()
        };

        vatCalculations.push(vatRecord);
      }

      return vatCalculations;
    } catch (error) {
      throw new Error(`Failed to calculate VAT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate withholding tax for vendor payments
   */
  async calculateWithholdingTax(payments: Array<{
    vendorId: string;
    amount: number;
    paymentType: string;
    taxYear: number;
  }>) {
    try {
      const withholdingCalculations = [];
      
      for (const payment of payments) {
        // Get vendor's annual income to determine tax slab
        const annualIncome = await this.getVendorAnnualIncome(payment.vendorId, payment.taxYear);
        
        // Calculate applicable withholding rate
        const withholdingRate = await this.getWithholdingTaxRate(annualIncome, payment.paymentType);
        
        const withholdingAmount = payment.amount * withholdingRate;
        const netAmount = payment.amount - withholdingAmount;

        const withholdingRecord: WithholdingTaxRecord = {
          id: this.generateId(),
          payeeId: payment.vendorId,
          payeeType: 'vendor',
          grossAmount: payment.amount,
          withholdingRate,
          withholdingAmount,
          netAmount,
          taxYear: payment.taxYear,
          status: 'calculated'
        };

        withholdingCalculations.push(withholdingRecord);
      }

      return withholdingCalculations;
    } catch (error) {
      throw new Error(`Failed to calculate withholding tax: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process VAT return for period
   */
  async processVATReturn(params: {
    entityId: string;
    returnPeriod: string;
    startDate: Date;
    endDate: Date;
  }) {
    try {
      // Get all VAT transactions for the period
      const vatRecords = await this.getVATRecordsForPeriod(params.entityId, params.startDate, params.endDate);
      
      // Calculate VAT collected (output VAT)
      const vatCollected = vatRecords
        .filter(record => record.transactionType === 'sale')
        .reduce((sum, record) => sum + record.vatAmount, 0);
      
      // Calculate VAT paid (input VAT)
      const vatPaid = vatRecords
        .filter(record => record.transactionType === 'purchase')
        .reduce((sum, record) => sum + record.vatAmount, 0);
      
      // Net VAT liability
      const netVATLiability = vatCollected - vatPaid;
      
      const vatReturn = {
        id: this.generateId(),
        entityId: params.entityId,
        returnPeriod: params.returnPeriod,
        periodStart: params.startDate,
        periodEnd: params.endDate,
        vatCollected,
        vatPaid,
        netVATLiability,
        adjustments: 0,
        penaltyAmount: 0,
        totalDue: Math.max(0, netVATLiability),
        refundDue: Math.max(0, -netVATLiability),
        status: 'draft',
        records: vatRecords,
        generatedAt: new Date()
      };

      return vatReturn;
    } catch (error) {
      throw new Error(`Failed to process VAT return: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tax compliance status for entity
   */
  async getTaxComplianceStatus(params: {
    entityId: string;
    taxYear: number;
    includeDetails: boolean;
  }) {
    try {
      // Get all tax obligations for the entity and year
      const taxReturns = await this.getTaxReturnsForYear(params.entityId, params.taxYear);
      const withholdingRecords = await this.getWithholdingRecordsForYear(params.entityId, params.taxYear);
      const vatReturns = await this.getVATReturnsForYear(params.entityId, params.taxYear);

      // Calculate compliance metrics
      const totalReturns = taxReturns.length + vatReturns.length;
      const filedReturns = [...taxReturns, ...vatReturns].filter(r => r.status === 'filed').length;
      const overdueReturns = [...taxReturns, ...vatReturns].filter(r => 
        r.status !== 'filed' && new Date() > r.dueDate
      ).length;

      const complianceScore = totalReturns > 0 ? (filedReturns / totalReturns) * 100 : 100;

      const complianceStatus = {
        entityId: params.entityId,
        taxYear: params.taxYear,
        overall: {
          complianceScore,
          status: complianceScore >= 95 ? 'excellent' : 
                  complianceScore >= 80 ? 'good' : 
                  complianceScore >= 60 ? 'satisfactory' : 'poor',
          totalObligations: totalReturns,
          completedObligations: filedReturns,
          overdueObligations: overdueReturns
        },
        incomeTax: {
          totalReturns: taxReturns.length,
          filedReturns: taxReturns.filter(r => r.status === 'filed').length,
          pendingAmount: taxReturns.reduce((sum, r) => sum + (r.totalTax - r.paidTax), 0)
        },
        vat: {
          totalReturns: vatReturns.length,
          filedReturns: vatReturns.filter(r => r.status === 'filed').length,
          pendingAmount: vatReturns.reduce((sum, r) => sum + Math.max(0, r.netVATLiability), 0)
        },
        withholding: {
          totalRecords: withholdingRecords.length,
          filedRecords: withholdingRecords.filter(r => r.status === 'filed').length,
          totalWithheld: withholdingRecords.reduce((sum, r) => sum + r.withholdingAmount, 0)
        },
        details: params.includeDetails ? {
          taxReturns,
          vatReturns,
          withholdingRecords
        } : undefined
      };

      return complianceStatus;
    } catch (error) {
      throw new Error(`Failed to get tax compliance status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate customs duty for imports
   */
  async calculateCustomsDuty(imports: Array<{
    importId: string;
    hsCode: string;
    countryOfOrigin: string;
    importValue: number;
    currency: string;
    productCategory: string;
  }>) {
    try {
      const customsCalculations = [];
      
      for (const importItem of imports) {
        // Get duty rate based on HS code and country
        const dutyRate = await this.getCustomsDutyRate(importItem.hsCode, importItem.countryOfOrigin);
        
        // Convert to BDT if needed
        const importValueBDT = await this.convertToBDT(importItem.importValue, importItem.currency);
        
        // Calculate duty amount
        const dutyAmount = importValueBDT * dutyRate;
        
        // Calculate supplementary duty if applicable
        const supplementaryDuty = await this.calculateSupplementaryDuty(importItem.productCategory, importValueBDT);
        
        // Calculate VAT on landed cost
        const landedCost = importValueBDT + dutyAmount + supplementaryDuty;
        const vatAmount = landedCost * 0.15; // 15% VAT
        
        const customsCalculation = {
          importId: importItem.importId,
          hsCode: importItem.hsCode,
          importValue: importValueBDT,
          dutyRate,
          dutyAmount,
          supplementaryDuty,
          vatAmount,
          totalTax: dutyAmount + supplementaryDuty + vatAmount,
          totalCost: landedCost + vatAmount,
          calculatedAt: new Date()
        };

        customsCalculations.push(customsCalculation);
      }

      return customsCalculations;
    } catch (error) {
      throw new Error(`Failed to calculate customs duty: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate tax analytics for period
   */
  async generateTaxAnalytics(params: {
    entityId?: string;
    startDate: Date;
    endDate: Date;
    analyticsType: string;
    groupBy: string;
  }) {
    try {
      // Get tax data for the period
      const taxData = await this.getTaxDataForPeriod(params.entityId, params.startDate, params.endDate);
      
      // Process analytics based on type
      let analytics;
      
      switch (params.analyticsType) {
        case 'revenue_analytics':
          analytics = await this.processRevenueAnalytics(taxData, params.groupBy);
          break;
        case 'compliance_analytics':
          analytics = await this.processComplianceAnalytics(taxData, params.groupBy);
          break;
        case 'liability_analytics':
          analytics = await this.processLiabilityAnalytics(taxData, params.groupBy);
          break;
        default:
          analytics = await this.processGeneralTaxAnalytics(taxData, params.groupBy);
      }

      return {
        period: { startDate: params.startDate, endDate: params.endDate },
        analyticsType: params.analyticsType,
        groupBy: params.groupBy,
        data: analytics,
        summary: {
          totalVATCollected: taxData.vatCollected || 0,
          totalVATPaid: taxData.vatPaid || 0,
          totalWithholding: taxData.totalWithholding || 0,
          netTaxLiability: (taxData.vatCollected || 0) - (taxData.vatPaid || 0)
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate tax analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tax exemptions and special rates
   */
  async getTaxExemptions(filters: {
    exemptionType?: string;
    entityType?: string;
    isActive?: boolean;
  }) {
    try {
      // Bangladesh tax exemptions (simplified structure)
      const exemptions = [
        {
          code: 'EXPORT_GOODS',
          description: 'Export of goods and services',
          exemptionType: 'vat',
          rate: 0,
          threshold: 0,
          conditions: ['Must have export permit', 'Foreign currency receipt required'],
          isActive: true
        },
        {
          code: 'ESSENTIAL_FOOD',
          description: 'Essential food items (rice, wheat, sugar, salt)',
          exemptionType: 'vat',
          rate: 0,
          threshold: 0,
          conditions: ['Must be on essential food list'],
          isActive: true
        },
        {
          code: 'MEDICINES',
          description: 'Life-saving drugs and essential medicines',
          exemptionType: 'vat',
          rate: 0,
          threshold: 0,
          conditions: ['Must be registered with DGDA'],
          isActive: true
        },
        {
          code: 'EDUCATION_BOOKS',
          description: 'Educational books and materials',
          exemptionType: 'vat',
          rate: 0,
          threshold: 0,
          conditions: ['Must be educational content'],
          isActive: true
        },
        {
          code: 'SMALL_BUSINESS',
          description: 'Small business income tax exemption',
          exemptionType: 'income_tax',
          rate: 0,
          threshold: 300000, // 3 lakh BDT
          conditions: ['Annual turnover below threshold'],
          isActive: true
        }
      ];

      let filteredExemptions = exemptions;

      if (filters.exemptionType) {
        filteredExemptions = filteredExemptions.filter(ex => ex.exemptionType === filters.exemptionType);
      }

      if (filters.isActive !== undefined) {
        filteredExemptions = filteredExemptions.filter(ex => ex.isActive === filters.isActive);
      }

      return filteredExemptions;
    } catch (error) {
      throw new Error(`Failed to get tax exemptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private generateId(): string {
    return `tax_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async getVATRate(productType?: string, exemptionCode?: string): Promise<number> {
    // Check for exemptions first
    if (exemptionCode) {
      const exemption = await this.checkVATExemption(exemptionCode);
      if (exemption) return 0;
    }

    // Product-specific rates
    const productRates: Record<string, number> = {
      'essential_food': 0,
      'medicine': 0,
      'books': 0,
      'agriculture': 0.05,
      'luxury': 0.20,
      'standard': 0.15
    };

    return productRates[productType || 'standard'] || 0.15; // Default 15%
  }

  private async checkVATExemption(exemptionCode?: string): Promise<boolean> {
    if (!exemptionCode) return false;
    
    const exemptCodes = ['EXPORT_GOODS', 'ESSENTIAL_FOOD', 'MEDICINES', 'EDUCATION_BOOKS'];
    return exemptCodes.includes(exemptionCode);
  }

  private async getVendorAnnualIncome(vendorId: string, taxYear: number): Promise<number> {
    // Get vendor's annual income from commissions
    const startDate = new Date(taxYear, 3, 1); // April 1st (BD fiscal year)
    const endDate = new Date(taxYear + 1, 2, 31); // March 31st

    const [result] = await db.select({
      totalIncome: sum(vendorCommissions.commissionAmount)
    })
    .from(vendorCommissions)
    .where(and(
      eq(vendorCommissions.vendorId, vendorId),
      gte(vendorCommissions.createdAt, startDate),
      lte(vendorCommissions.createdAt, endDate)
    ));

    return Number(result?.totalIncome || 0);
  }

  private async getWithholdingTaxRate(annualIncome: number, paymentType: string): Promise<number> {
    // Bangladesh income tax slabs for withholding
    if (annualIncome <= 300000) return 0; // No tax for income below 3 lakh
    if (annualIncome <= 1000000) return 0.03; // 3% for 3-10 lakh
    if (annualIncome <= 2500000) return 0.05; // 5% for 10-25 lakh
    if (annualIncome <= 5000000) return 0.06; // 6% for 25-50 lakh
    return 0.07; // 7% for above 50 lakh
  }

  private async getVATRecordsForPeriod(entityId: string, startDate: Date, endDate: Date) {
    // Get VAT records for the period
    return [];
  }

  private async getTaxReturnsForYear(entityId: string, taxYear: number) {
    // Get tax returns for the year
    return [];
  }

  private async getWithholdingRecordsForYear(entityId: string, taxYear: number) {
    // Get withholding records for the year
    return [];
  }

  private async getVATReturnsForYear(entityId: string, taxYear: number) {
    // Get VAT returns for the year
    return [];
  }

  private async getCustomsDutyRate(hsCode: string, countryOfOrigin: string): Promise<number> {
    // Simplified customs duty rates based on HS code
    const dutyRates: Record<string, number> = {
      '84': 0.05, // Machinery - 5%
      '85': 0.20, // Electronics - 20%
      '62': 0.25, // Textiles - 25%
      '20': 0.10, // Food products - 10%
      'default': 0.15 // Default rate - 15%
    };

    const category = hsCode.substring(0, 2);
    return dutyRates[category] || dutyRates.default;
  }

  private async convertToBDT(amount: number, currency: string): Promise<number> {
    if (currency === 'BDT') return amount;
    
    // Simplified currency conversion (would use real exchange rates)
    const exchangeRates: Record<string, number> = {
      'USD': 110,
      'EUR': 120,
      'GBP': 140,
      'INR': 1.3
    };

    return amount * (exchangeRates[currency] || 1);
  }

  private async calculateSupplementaryDuty(productCategory: string, importValue: number): Promise<number> {
    // Bangladesh supplementary duty rates
    const supplementaryRates: Record<string, number> = {
      'luxury_cars': 0.45,
      'electronics_premium': 0.25,
      'cosmetics_luxury': 0.35,
      'tobacco': 0.57,
      'default': 0
    };

    const rate = supplementaryRates[productCategory] || supplementaryRates.default;
    return importValue * rate;
  }

  private async getTaxDataForPeriod(entityId: string | undefined, startDate: Date, endDate: Date) {
    // Get comprehensive tax data for analytics
    return {
      vatCollected: 0,
      vatPaid: 0,
      totalWithholding: 0,
      customsDuty: 0,
      supplementaryDuty: 0
    };
  }

  private async processRevenueAnalytics(taxData: any, groupBy: string) {
    // Process revenue-based tax analytics
    return {};
  }

  private async processComplianceAnalytics(taxData: any, groupBy: string) {
    // Process compliance analytics
    return {};
  }

  private async processLiabilityAnalytics(taxData: any, groupBy: string) {
    // Process tax liability analytics
    return {};
  }

  private async processGeneralTaxAnalytics(taxData: any, groupBy: string) {
    // Process general tax analytics
    return {};
  }
}