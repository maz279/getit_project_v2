/**
 * Reconciliation Model - Payment Gateway Reconciliation Data Layer
 * Enterprise-grade reconciliation data processing and analytics
 */

import { db } from '../../../db';
import { orders, users, vendors } from '@shared/schema';
import { eq, and, gte, lte, sum, count, desc, asc, avg } from 'drizzle-orm';

export interface ReconciliationData {
  id: string;
  reconciliationType: 'daily' | 'weekly' | 'monthly' | 'manual';
  paymentGateway: 'bkash' | 'nagad' | 'rocket' | 'ssl_commerz' | 'bank_transfer';
  reconciliationDate: Date;
  periodStart: Date;
  periodEnd: Date;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  totalTransactions: number;
  totalAmount: number;
  reconciledTransactions: number;
  reconciledAmount: number;
  discrepancies: ReconciliationDiscrepancy[];
  matchingAccuracy: number;
  processingTime: number; // in minutes
  initiatedBy: string;
  completedAt?: Date;
  createdAt: Date;
}

export interface ReconciliationDiscrepancy {
  id: string;
  reconciliationId: string;
  discrepancyType: 'missing_platform' | 'missing_gateway' | 'amount_mismatch' | 'status_mismatch' | 'duplicate';
  platformTransactionId?: string;
  gatewayTransactionId?: string;
  platformAmount?: number;
  gatewayAmount?: number;
  variance?: number;
  description: string;
  status: 'pending' | 'resolved' | 'waived' | 'disputed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
}

export interface TransactionMatch {
  id: string;
  reconciliationId: string;
  platformTransactionId: string;
  gatewayTransactionId: string;
  matchingMethod: 'automatic' | 'manual' | 'fuzzy';
  matchingScore: number;
  platformAmount: number;
  gatewayAmount: number;
  variance: number;
  matchedBy?: string;
  matchedAt: Date;
}

export interface ReconciliationAnalytics {
  period: { startDate: Date; endDate: Date };
  gatewayId?: string;
  totalReconciliations: number;
  successfulReconciliations: number;
  averageAccuracy: number;
  averageProcessingTime: number;
  totalDiscrepancies: number;
  resolvedDiscrepancies: number;
  resolutionRate: number;
  gatewayPerformance: Array<{
    gateway: string;
    accuracy: number;
    discrepancyRate: number;
    avgProcessingTime: number;
    totalAmount: number;
  }>;
  discrepancyTrends: Array<{
    date: string;
    totalDiscrepancies: number;
    resolvedDiscrepancies: number;
    pendingDiscrepancies: number;
  }>;
  amountReconciled: number;
  amountOutstanding: number;
}

export interface GatewayTransaction {
  transactionId: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: Date;
  reference?: string;
  customerInfo?: any;
  metadata?: any;
}

export interface PlatformTransaction {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionDate: Date;
  reference?: string;
  customerId: string;
  vendorId?: string;
}

export class ReconciliationModel {
  
  /**
   * Process reconciliation data for payment gateway
   */
  async processReconciliationData(params: {
    paymentGateway: string;
    reconciliationDate: Date;
    platformTransactions: PlatformTransaction[];
    gatewayTransactions: GatewayTransaction[];
    autoMatchThreshold: number;
    toleranceAmount: number;
  }) {
    try {
      const reconciliationId = this.generateReconciliationId();
      const matches: TransactionMatch[] = [];
      const discrepancies: ReconciliationDiscrepancy[] = [];
      
      // Perform automatic matching
      const matchingResults = await this.performAutomaticMatching(
        params.platformTransactions,
        params.gatewayTransactions,
        params.autoMatchThreshold,
        params.toleranceAmount
      );
      
      matches.push(...matchingResults.matches);
      discrepancies.push(...matchingResults.discrepancies);
      
      // Calculate metrics
      const totalTransactions = params.platformTransactions.length;
      const totalAmount = params.platformTransactions.reduce((sum, txn) => sum + txn.amount, 0);
      const reconciledTransactions = matches.length;
      const reconciledAmount = matches.reduce((sum, match) => sum + match.platformAmount, 0);
      const matchingAccuracy = totalTransactions > 0 ? (reconciledTransactions / totalTransactions) * 100 : 0;
      
      const reconciliationData: ReconciliationData = {
        id: reconciliationId,
        reconciliationType: 'daily',
        paymentGateway: params.paymentGateway as any,
        reconciliationDate: params.reconciliationDate,
        periodStart: new Date(params.reconciliationDate.getFullYear(), params.reconciliationDate.getMonth(), params.reconciliationDate.getDate()),
        periodEnd: new Date(params.reconciliationDate.getFullYear(), params.reconciliationDate.getMonth(), params.reconciliationDate.getDate() + 1),
        status: 'in_progress',
        totalTransactions,
        totalAmount,
        reconciledTransactions,
        reconciledAmount,
        discrepancies,
        matchingAccuracy,
        processingTime: 0,
        initiatedBy: 'system',
        createdAt: new Date()
      };

      return {
        reconciliation: reconciliationData,
        matches,
        discrepancies,
        summary: {
          totalProcessed: totalTransactions,
          successfulMatches: matches.length,
          discrepanciesFound: discrepancies.length,
          accuracy: matchingAccuracy
        }
      };
    } catch (error) {
      throw new Error(`Failed to process reconciliation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate reconciliation analytics
   */
  async calculateReconciliationAnalytics(params: {
    startDate: Date;
    endDate: Date;
    gatewayId?: string;
    includeHistoricalTrends: boolean;
    groupBy: 'daily' | 'weekly' | 'monthly';
  }): Promise<ReconciliationAnalytics> {
    try {
      // Get reconciliation data for period
      const reconciliations = await this.getReconciliationsForPeriod(params);
      
      // Calculate basic metrics
      const totalReconciliations = reconciliations.length;
      const successfulReconciliations = reconciliations.filter(r => r.status === 'completed').length;
      const averageAccuracy = reconciliations.length > 0 ? 
        reconciliations.reduce((sum, r) => sum + r.matchingAccuracy, 0) / reconciliations.length : 0;
      const averageProcessingTime = reconciliations.length > 0 ?
        reconciliations.reduce((sum, r) => sum + r.processingTime, 0) / reconciliations.length : 0;
      
      // Calculate discrepancy metrics
      const allDiscrepancies = reconciliations.flatMap(r => r.discrepancies);
      const totalDiscrepancies = allDiscrepancies.length;
      const resolvedDiscrepancies = allDiscrepancies.filter(d => d.status === 'resolved').length;
      const resolutionRate = totalDiscrepancies > 0 ? (resolvedDiscrepancies / totalDiscrepancies) * 100 : 100;
      
      // Calculate gateway performance
      const gatewayPerformance = await this.calculateGatewayPerformance(reconciliations);
      
      // Generate discrepancy trends
      const discrepancyTrends = await this.generateDiscrepancyTrends(
        params.startDate,
        params.endDate,
        params.groupBy
      );
      
      // Calculate reconciled amounts
      const amountReconciled = reconciliations.reduce((sum, r) => sum + r.reconciledAmount, 0);
      const amountOutstanding = reconciliations.reduce((sum, r) => sum + (r.totalAmount - r.reconciledAmount), 0);

      const analytics: ReconciliationAnalytics = {
        period: { startDate: params.startDate, endDate: params.endDate },
        gatewayId: params.gatewayId,
        totalReconciliations,
        successfulReconciliations,
        averageAccuracy,
        averageProcessingTime,
        totalDiscrepancies,
        resolvedDiscrepancies,
        resolutionRate,
        gatewayPerformance,
        discrepancyTrends,
        amountReconciled,
        amountOutstanding
      };

      return analytics;
    } catch (error) {
      throw new Error(`Failed to calculate reconciliation analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process discrepancy resolution
   */
  async processDiscrepancyResolution(params: {
    discrepancyId: string;
    resolutionType: 'platform_adjustment' | 'gateway_adjustment' | 'write_off' | 'dispute';
    resolutionAmount?: number;
    notes: string;
    resolvedBy: string;
  }) {
    try {
      const discrepancy = await this.getDiscrepancyById(params.discrepancyId);
      if (!discrepancy) {
        throw new Error('Discrepancy not found');
      }

      const resolution = {
        discrepancyId: params.discrepancyId,
        resolutionType: params.resolutionType,
        resolutionAmount: params.resolutionAmount || discrepancy.variance || 0,
        originalVariance: discrepancy.variance || 0,
        adjustmentMade: params.resolutionAmount !== undefined,
        notes: params.notes,
        resolvedBy: params.resolvedBy,
        resolvedAt: new Date()
      };

      // Update discrepancy status
      const updatedDiscrepancy = {
        ...discrepancy,
        status: params.resolutionType === 'dispute' ? 'disputed' : 'resolved',
        resolution: JSON.stringify(resolution),
        resolvedAt: new Date()
      };

      // Calculate impact on reconciliation
      const reconciliationImpact = await this.calculateResolutionImpact(
        discrepancy.reconciliationId,
        resolution
      );

      return {
        discrepancy: updatedDiscrepancy,
        resolution,
        reconciliationImpact,
        adjustmentEntry: params.resolutionAmount ? 
          await this.createAdjustmentEntry(discrepancy, resolution) : null
      };
    } catch (error) {
      throw new Error(`Failed to process discrepancy resolution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate reconciliation variance analysis
   */
  async generateVarianceAnalysis(params: {
    reconciliationId: string;
    includeRootCause: boolean;
    includeRecommendations: boolean;
  }) {
    try {
      const reconciliation = await this.getReconciliationById(params.reconciliationId);
      if (!reconciliation) {
        throw new Error('Reconciliation not found');
      }

      // Analyze discrepancies by type and amount
      const discrepancyAnalysis = this.analyzeDiscrepancies(reconciliation.discrepancies);
      
      // Calculate variance metrics
      const totalVariance = reconciliation.discrepancies.reduce((sum, d) => sum + Math.abs(d.variance || 0), 0);
      const averageVariance = reconciliation.discrepancies.length > 0 ? 
        totalVariance / reconciliation.discrepancies.length : 0;
      const largestVariance = Math.max(...reconciliation.discrepancies.map(d => Math.abs(d.variance || 0)));
      
      // Identify patterns
      const patterns = await this.identifyVariancePatterns(reconciliation.discrepancies);
      
      // Root cause analysis
      let rootCauseAnalysis;
      if (params.includeRootCause) {
        rootCauseAnalysis = await this.performRootCauseAnalysis(reconciliation);
      }
      
      // Generate recommendations
      let recommendations;
      if (params.includeRecommendations) {
        recommendations = await this.generateReconciliationRecommendations(
          discrepancyAnalysis,
          patterns,
          reconciliation.paymentGateway
        );
      }

      const varianceAnalysis = {
        reconciliationId: params.reconciliationId,
        totalVariance,
        averageVariance,
        largestVariance,
        varianceRate: reconciliation.totalAmount > 0 ? (totalVariance / reconciliation.totalAmount) * 100 : 0,
        discrepancyBreakdown: discrepancyAnalysis,
        patterns,
        rootCauseAnalysis,
        recommendations,
        riskAssessment: this.assessReconciliationRisk(reconciliation, totalVariance),
        analyzedAt: new Date()
      };

      return varianceAnalysis;
    } catch (error) {
      throw new Error(`Failed to generate variance analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate gateway performance metrics
   */
  async calculateGatewayPerformanceMetrics(params: {
    gateways: string[];
    startDate: Date;
    endDate: Date;
    includeComparison: boolean;
  }) {
    try {
      const gatewayMetrics = [];

      for (const gateway of params.gateways) {
        // Get reconciliation data for gateway
        const reconciliations = await this.getReconciliationsForGateway(
          gateway,
          params.startDate,
          params.endDate
        );

        if (reconciliations.length === 0) {
          continue;
        }

        // Calculate performance metrics
        const totalTransactions = reconciliations.reduce((sum, r) => sum + r.totalTransactions, 0);
        const reconciledTransactions = reconciliations.reduce((sum, r) => sum + r.reconciledTransactions, 0);
        const totalAmount = reconciliations.reduce((sum, r) => sum + r.totalAmount, 0);
        const reconciledAmount = reconciliations.reduce((sum, r) => sum + r.reconciledAmount, 0);
        const totalDiscrepancies = reconciliations.reduce((sum, r) => sum + r.discrepancies.length, 0);
        
        const metrics = {
          gateway,
          period: { startDate: params.startDate, endDate: params.endDate },
          transactionMetrics: {
            totalTransactions,
            reconciledTransactions,
            reconciliationRate: totalTransactions > 0 ? (reconciledTransactions / totalTransactions) * 100 : 0
          },
          amountMetrics: {
            totalAmount,
            reconciledAmount,
            outstandingAmount: totalAmount - reconciledAmount,
            reconciliationRate: totalAmount > 0 ? (reconciledAmount / totalAmount) * 100 : 0
          },
          qualityMetrics: {
            totalDiscrepancies,
            discrepancyRate: totalTransactions > 0 ? (totalDiscrepancies / totalTransactions) * 100 : 0,
            averageProcessingTime: reconciliations.reduce((sum, r) => sum + r.processingTime, 0) / reconciliations.length,
            accuracy: reconciliations.reduce((sum, r) => sum + r.matchingAccuracy, 0) / reconciliations.length
          },
          reliability: {
            successfulReconciliations: reconciliations.filter(r => r.status === 'completed').length,
            failedReconciliations: reconciliations.filter(r => r.status === 'failed').length,
            successRate: (reconciliations.filter(r => r.status === 'completed').length / reconciliations.length) * 100
          }
        };

        gatewayMetrics.push(metrics);
      }

      // Sort by performance score
      gatewayMetrics.sort((a, b) => {
        const scoreA = this.calculateGatewayScore(a);
        const scoreB = this.calculateGatewayScore(b);
        return scoreB - scoreA;
      });

      // Add comparison data if requested
      let comparisonData;
      if (params.includeComparison) {
        comparisonData = await this.generateGatewayComparison(gatewayMetrics);
      }

      return {
        gatewayMetrics,
        summary: {
          totalGateways: gatewayMetrics.length,
          bestPerforming: gatewayMetrics[0]?.gateway,
          averageAccuracy: gatewayMetrics.reduce((sum, g) => sum + g.qualityMetrics.accuracy, 0) / gatewayMetrics.length,
          totalAmountProcessed: gatewayMetrics.reduce((sum, g) => sum + g.amountMetrics.totalAmount, 0)
        },
        comparison: comparisonData,
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to calculate gateway performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private generateReconciliationId(): string {
    return `recon_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async performAutomaticMatching(
    platformTransactions: PlatformTransaction[],
    gatewayTransactions: GatewayTransaction[],
    threshold: number,
    toleranceAmount: number
  ) {
    const matches: TransactionMatch[] = [];
    const discrepancies: ReconciliationDiscrepancy[] = [];
    const unmatchedPlatform = [...platformTransactions];
    const unmatchedGateway = [...gatewayTransactions];

    // Exact matching first
    for (let i = unmatchedPlatform.length - 1; i >= 0; i--) {
      const platformTxn = unmatchedPlatform[i];
      
      for (let j = unmatchedGateway.length - 1; j >= 0; j--) {
        const gatewayTxn = unmatchedGateway[j];
        
        // Check for exact amount match within tolerance
        if (Math.abs(platformTxn.amount - gatewayTxn.amount) <= toleranceAmount &&
            this.isTimeSimilar(platformTxn.transactionDate, gatewayTxn.transactionDate)) {
          
          matches.push({
            id: this.generateMatchId(),
            reconciliationId: '',
            platformTransactionId: platformTxn.transactionId,
            gatewayTransactionId: gatewayTxn.transactionId,
            matchingMethod: 'automatic',
            matchingScore: 100,
            platformAmount: platformTxn.amount,
            gatewayAmount: gatewayTxn.amount,
            variance: Math.abs(platformTxn.amount - gatewayTxn.amount),
            matchedAt: new Date()
          });

          unmatchedPlatform.splice(i, 1);
          unmatchedGateway.splice(j, 1);
          break;
        }
      }
    }

    // Create discrepancies for unmatched transactions
    for (const platformTxn of unmatchedPlatform) {
      discrepancies.push({
        id: this.generateDiscrepancyId(),
        reconciliationId: '',
        discrepancyType: 'missing_gateway',
        platformTransactionId: platformTxn.transactionId,
        platformAmount: platformTxn.amount,
        description: `Platform transaction ${platformTxn.transactionId} has no matching gateway transaction`,
        status: 'pending',
        priority: platformTxn.amount > 10000 ? 'high' : 'medium', // High priority for amounts > 10k BDT
        createdAt: new Date()
      });
    }

    for (const gatewayTxn of unmatchedGateway) {
      discrepancies.push({
        id: this.generateDiscrepancyId(),
        reconciliationId: '',
        discrepancyType: 'missing_platform',
        gatewayTransactionId: gatewayTxn.transactionId,
        gatewayAmount: gatewayTxn.amount,
        description: `Gateway transaction ${gatewayTxn.transactionId} has no matching platform transaction`,
        status: 'pending',
        priority: gatewayTxn.amount > 10000 ? 'high' : 'medium',
        createdAt: new Date()
      });
    }

    return { matches, discrepancies };
  }

  private isTimeSimilar(date1: Date, date2: Date): boolean {
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    return timeDiff <= 2 * 60 * 60 * 1000; // Within 2 hours
  }

  private generateMatchId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateDiscrepancyId(): string {
    return `disc_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async getReconciliationsForPeriod(params: any) {
    // Get reconciliation records for the period
    return [];
  }

  private async calculateGatewayPerformance(reconciliations: any[]) {
    // Calculate performance metrics by gateway
    return [];
  }

  private async generateDiscrepancyTrends(startDate: Date, endDate: Date, groupBy: string) {
    // Generate discrepancy trend data
    return [];
  }

  private async getDiscrepancyById(discrepancyId: string) {
    // Get discrepancy by ID
    return null;
  }

  private async calculateResolutionImpact(reconciliationId: string, resolution: any) {
    // Calculate impact of resolution on reconciliation
    return {
      accuracyImprovement: 0.5,
      amountAdjusted: resolution.resolutionAmount
    };
  }

  private async createAdjustmentEntry(discrepancy: any, resolution: any) {
    // Create accounting adjustment entry
    return {
      entryId: `adj_${Date.now()}`,
      amount: resolution.resolutionAmount,
      description: `Reconciliation adjustment for discrepancy ${discrepancy.id}`
    };
  }

  private async getReconciliationById(reconciliationId: string) {
    // Get reconciliation by ID
    return null;
  }

  private analyzeDiscrepancies(discrepancies: ReconciliationDiscrepancy[]) {
    const analysis = {
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byAmount: {
        small: 0, // < 1000 BDT
        medium: 0, // 1000-10000 BDT
        large: 0 // > 10000 BDT
      }
    };

    for (const discrepancy of discrepancies) {
      // By type
      analysis.byType[discrepancy.discrepancyType] = (analysis.byType[discrepancy.discrepancyType] || 0) + 1;
      
      // By priority
      analysis.byPriority[discrepancy.priority] = (analysis.byPriority[discrepancy.priority] || 0) + 1;
      
      // By amount
      const amount = Math.abs(discrepancy.variance || 0);
      if (amount < 1000) analysis.byAmount.small++;
      else if (amount <= 10000) analysis.byAmount.medium++;
      else analysis.byAmount.large++;
    }

    return analysis;
  }

  private async identifyVariancePatterns(discrepancies: ReconciliationDiscrepancy[]) {
    // Identify patterns in discrepancies
    return {
      timeBasedPatterns: [],
      amountBasedPatterns: [],
      gatewaySpecificPatterns: []
    };
  }

  private async performRootCauseAnalysis(reconciliation: ReconciliationData) {
    // Perform root cause analysis
    return {
      primaryCauses: ['Gateway API delays', 'Amount formatting differences'],
      recommendations: ['Implement retry mechanism', 'Standardize amount formatting']
    };
  }

  private async generateReconciliationRecommendations(analysis: any, patterns: any, gateway: string) {
    // Generate recommendations based on analysis
    return [
      'Increase automatic matching threshold for this gateway',
      'Implement real-time reconciliation for high-value transactions',
      'Review gateway integration configuration'
    ];
  }

  private assessReconciliationRisk(reconciliation: ReconciliationData, totalVariance: number) {
    const varianceRate = reconciliation.totalAmount > 0 ? (totalVariance / reconciliation.totalAmount) * 100 : 0;
    
    let riskLevel = 'low';
    if (varianceRate > 5) riskLevel = 'critical';
    else if (varianceRate > 2) riskLevel = 'high';
    else if (varianceRate > 1) riskLevel = 'medium';

    return {
      level: riskLevel,
      score: varianceRate,
      factors: {
        varianceRate,
        discrepancyCount: reconciliation.discrepancies.length,
        matchingAccuracy: reconciliation.matchingAccuracy
      }
    };
  }

  private async getReconciliationsForGateway(gateway: string, startDate: Date, endDate: Date) {
    // Get reconciliations for specific gateway
    return [];
  }

  private calculateGatewayScore(gatewayMetrics: any): number {
    // Calculate overall performance score for gateway
    const accuracy = gatewayMetrics.qualityMetrics.accuracy;
    const successRate = gatewayMetrics.reliability.successRate;
    const reconciliationRate = gatewayMetrics.amountMetrics.reconciliationRate;
    
    return (accuracy * 0.4) + (successRate * 0.3) + (reconciliationRate * 0.3);
  }

  private async generateGatewayComparison(gatewayMetrics: any[]) {
    // Generate comparison data between gateways
    return {
      bestPerformer: gatewayMetrics[0]?.gateway,
      averagePerformance: {
        accuracy: gatewayMetrics.reduce((sum, g) => sum + g.qualityMetrics.accuracy, 0) / gatewayMetrics.length,
        successRate: gatewayMetrics.reduce((sum, g) => sum + g.reliability.successRate, 0) / gatewayMetrics.length
      }
    };
  }
}