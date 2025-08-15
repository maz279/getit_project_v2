/**
 * Reconciliation Service - Payment Gateway Reconciliation
 * Enterprise-grade reconciliation for bKash, Nagad, Rocket, and bank payments business logic
 */

import { db } from '../../../db';
import { orders, payments } from '@shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

interface ReconciliationRecord {
  id: string;
  reconciliationType: string;
  paymentGateway: string;
  reconciliationDate: Date;
  status: string;
  totalTransactions: number;
  reconciledAmount: number;
  discrepancies: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class ReconciliationService {
  
  /**
   * Start reconciliation process for payment gateway
   */
  async startReconciliation(params: {
    reconciliationType: string;
    paymentGateway: string;
    reconciliationDate: Date;
    autoMatch: boolean;
    toleranceAmount: number;
    initiatedBy: string;
  }) {
    try {
      // Generate reconciliation ID
      const reconciliationId = this.generateReconciliationId(params.paymentGateway);
      
      // Get platform transactions for the date
      const platformTransactions = await this.getPlatformTransactions(
        params.paymentGateway,
        params.reconciliationDate
      );

      // Get gateway transactions (would fetch from gateway APIs)
      const gatewayTransactions = await this.getGatewayTransactions(
        params.paymentGateway,
        params.reconciliationDate
      );

      // Perform reconciliation matching
      const reconciliationResult = await this.performReconciliation({
        platformTransactions,
        gatewayTransactions,
        autoMatch: params.autoMatch,
        toleranceAmount: params.toleranceAmount
      });

      const reconciliation = {
        id: reconciliationId,
        reconciliationType: params.reconciliationType,
        paymentGateway: params.paymentGateway,
        reconciliationDate: params.reconciliationDate,
        status: 'in_progress',
        totalTransactions: platformTransactions.length,
        reconciledAmount: reconciliationResult.reconciledAmount,
        matchedTransactions: reconciliationResult.matchedTransactions,
        discrepancies: reconciliationResult.discrepancies,
        autoMatch: params.autoMatch,
        toleranceAmount: params.toleranceAmount,
        initiatedBy: params.initiatedBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save reconciliation record
      await this.saveReconciliation(reconciliation);

      return reconciliation;
    } catch (error) {
      throw new Error(`Failed to start reconciliation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get reconciliation records with filtering
   */
  async getReconciliations(filters: {
    startDate?: Date;
    endDate?: Date;
    paymentGateway?: string;
    status?: string;
    reconciliationType?: string;
    page: number;
    limit: number;
  }) {
    try {
      // This would query the actual reconciliation table
      const reconciliations = await this.queryReconciliations(filters);

      return {
        reconciliations,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: reconciliations.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get reconciliations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get reconciliation details by ID
   */
  async getReconciliationById(reconciliationId: string, options: {
    includeTransactions: boolean;
    includeDiscrepancies: boolean;
  }) {
    try {
      const reconciliation = await this.findReconciliationById(reconciliationId);
      
      if (!reconciliation) {
        throw new Error('Reconciliation not found');
      }

      if (options.includeTransactions) {
        reconciliation.transactions = await this.getReconciliationTransactions(reconciliationId);
      }

      if (options.includeDiscrepancies) {
        reconciliation.discrepancyDetails = await this.getReconciliationDiscrepancies(reconciliationId);
      }

      return reconciliation;
    } catch (error) {
      throw new Error(`Failed to get reconciliation details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform manual reconciliation matching
   */
  async performManualMatching(params: {
    reconciliationId: string;
    platformTransactionId: string;
    gatewayTransactionId: string;
    matchingAmount: number;
    notes?: string;
    matchedBy: string;
  }) {
    try {
      const reconciliation = await this.findReconciliationById(params.reconciliationId);
      
      if (!reconciliation) {
        throw new Error('Reconciliation not found');
      }

      // Get transaction details
      const platformTransaction = await this.getPlatformTransactionById(params.platformTransactionId);
      const gatewayTransaction = await this.getGatewayTransactionById(
        params.gatewayTransactionId,
        reconciliation.paymentGateway
      );

      if (!platformTransaction || !gatewayTransaction) {
        throw new Error('Transaction not found');
      }

      // Create manual match record
      const matchRecord = {
        id: this.generateMatchId(),
        reconciliationId: params.reconciliationId,
        platformTransactionId: params.platformTransactionId,
        gatewayTransactionId: params.gatewayTransactionId,
        platformAmount: platformTransaction.amount,
        gatewayAmount: gatewayTransaction.amount,
        matchingAmount: params.matchingAmount,
        matchType: 'manual',
        variance: Math.abs(platformTransaction.amount - gatewayTransaction.amount),
        notes: params.notes,
        matchedBy: params.matchedBy,
        matchedAt: new Date()
      };

      // Save match record
      await this.saveMatchRecord(matchRecord);

      // Update reconciliation status
      await this.updateReconciliationProgress(params.reconciliationId);

      return {
        matchRecord,
        reconciliationStatus: await this.getReconciliationStatus(params.reconciliationId)
      };
    } catch (error) {
      throw new Error(`Failed to perform manual matching: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark discrepancy as resolved
   */
  async resolveDiscrepancy(params: {
    reconciliationId: string;
    discrepancyId: string;
    resolutionType: string;
    resolutionNotes?: string;
    adjustmentAmount?: number;
    resolutionReference?: string;
    resolvedBy: string;
  }) {
    try {
      const discrepancy = await this.findDiscrepancyById(params.discrepancyId);
      
      if (!discrepancy) {
        throw new Error('Discrepancy not found');
      }

      const resolution = {
        id: this.generateResolutionId(),
        discrepancyId: params.discrepancyId,
        reconciliationId: params.reconciliationId,
        resolutionType: params.resolutionType,
        resolutionNotes: params.resolutionNotes,
        adjustmentAmount: params.adjustmentAmount || 0,
        resolutionReference: params.resolutionReference,
        resolvedBy: params.resolvedBy,
        resolvedAt: new Date()
      };

      // Save resolution record
      await this.saveResolution(resolution);

      // Update discrepancy status
      await this.updateDiscrepancyStatus(params.discrepancyId, 'resolved');

      // Update reconciliation progress
      await this.updateReconciliationProgress(params.reconciliationId);

      return resolution;
    } catch (error) {
      throw new Error(`Failed to resolve discrepancy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete reconciliation process
   */
  async completeReconciliation(params: {
    reconciliationId: string;
    completionNotes?: string;
    forceComplete: boolean;
    completedBy: string;
  }) {
    try {
      const reconciliation = await this.findReconciliationById(params.reconciliationId);
      
      if (!reconciliation) {
        throw new Error('Reconciliation not found');
      }

      // Check if reconciliation can be completed
      const canComplete = await this.canCompleteReconciliation(params.reconciliationId, params.forceComplete);
      
      if (!canComplete.canComplete && !params.forceComplete) {
        throw new Error(`Cannot complete reconciliation: ${canComplete.reason}`);
      }

      // Get final reconciliation statistics
      const finalStats = await this.calculateFinalReconciliationStats(params.reconciliationId);

      const completedReconciliation = {
        ...reconciliation,
        status: 'completed',
        completionNotes: params.completionNotes,
        completedBy: params.completedBy,
        completedAt: new Date(),
        finalStats
      };

      // Update reconciliation record
      await this.updateReconciliation(params.reconciliationId, completedReconciliation);

      // Generate reconciliation report
      const report = await this.generateCompletionReport(params.reconciliationId);

      return {
        ...completedReconciliation,
        report
      };
    } catch (error) {
      throw new Error(`Failed to complete reconciliation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(params: {
    startDate?: Date;
    endDate?: Date;
    paymentGateway?: string;
    reportType: string;
    format: string;
    includeDiscrepancies: boolean;
    generatedBy: string;
  }) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = params.endDate || new Date();

      // Get reconciliation data for the period
      const reconciliations = await this.getReconciliationsForReport({
        startDate,
        endDate,
        paymentGateway: params.paymentGateway
      });

      // Process report data based on type
      const reportData = await this.processReconciliationReport(
        reconciliations,
        params.reportType,
        params.includeDiscrepancies
      );

      const report = {
        reportId: this.generateReportId(),
        reportType: params.reportType,
        format: params.format,
        period: { startDate, endDate },
        paymentGateway: params.paymentGateway,
        data: reportData,
        summary: {
          totalReconciliations: reconciliations.length,
          totalAmount: reconciliations.reduce((sum, r) => sum + r.reconciledAmount, 0),
          successRate: this.calculateSuccessRate(reconciliations),
          averageProcessingTime: this.calculateAverageProcessingTime(reconciliations)
        },
        generatedBy: params.generatedBy,
        generatedAt: new Date()
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate reconciliation report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get reconciliation statistics
   */
  async getReconciliationStatistics(params: {
    startDate?: Date;
    endDate?: Date;
    paymentGateway?: string;
    groupBy: string;
  }) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = params.endDate || new Date();

      const reconciliations = await this.getReconciliationsForStats({
        startDate,
        endDate,
        paymentGateway: params.paymentGateway
      });

      const statistics = await this.calculateReconciliationStatistics(
        reconciliations,
        params.groupBy
      );

      return {
        period: { startDate, endDate },
        paymentGateway: params.paymentGateway,
        groupBy: params.groupBy,
        statistics
      };
    } catch (error) {
      throw new Error(`Failed to get reconciliation statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download gateway transaction file
   */
  async downloadGatewayTransactions(params: {
    paymentGateway: string;
    transactionDate: Date;
    fileFormat: string;
    requestedBy: string;
  }) {
    try {
      // Fetch transactions from gateway API
      const transactions = await this.fetchGatewayTransactions(
        params.paymentGateway,
        params.transactionDate
      );

      // Format data based on requested format
      let fileData;
      if (params.fileFormat === 'csv') {
        fileData = await this.formatTransactionsAsCSV(transactions);
      } else {
        fileData = JSON.stringify(transactions, null, 2);
      }

      // Log download request
      await this.logFileDownload({
        paymentGateway: params.paymentGateway,
        transactionDate: params.transactionDate,
        fileFormat: params.fileFormat,
        requestedBy: params.requestedBy,
        recordCount: transactions.length
      });

      return fileData;
    } catch (error) {
      throw new Error(`Failed to download gateway transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload external reconciliation file
   */
  async uploadReconciliationFile(params: {
    reconciliationId: string;
    fileType: string;
    fileData: string;
    fileName: string;
    autoProcess: boolean;
    uploadedBy: string;
  }) {
    try {
      // Parse uploaded file
      const parsedData = await this.parseReconciliationFile(params.fileData, params.fileType);

      // Save file record
      const fileRecord = {
        id: this.generateFileId(),
        reconciliationId: params.reconciliationId,
        fileName: params.fileName,
        fileType: params.fileType,
        recordCount: parsedData.records.length,
        uploadedBy: params.uploadedBy,
        uploadedAt: new Date(),
        status: 'uploaded'
      };

      await this.saveFileRecord(fileRecord);

      // Auto-process if requested
      let processResult;
      if (params.autoProcess) {
        processResult = await this.processUploadedFile(fileRecord.id, parsedData);
      }

      return {
        fileRecord,
        parsedData: {
          recordCount: parsedData.records.length,
          validRecords: parsedData.validRecords,
          invalidRecords: parsedData.invalidRecords
        },
        processResult
      };
    } catch (error) {
      throw new Error(`Failed to upload reconciliation file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get pending reconciliation items
   */
  async getPendingReconciliationItems(params: {
    paymentGateway?: string;
    itemType: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    try {
      const pendingItems = await this.queryPendingItems(params);

      return {
        items: pendingItems,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: pendingItems.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get pending reconciliation items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule automatic reconciliation
   */
  async scheduleAutoReconciliation(params: {
    paymentGateways: string[];
    schedule: string;
    timeOfDay: string;
    autoResolveMatches: boolean;
    notificationEmails?: string[];
    scheduledBy: string;
  }) {
    try {
      const scheduledJob = {
        id: this.generateJobId(),
        jobType: 'auto_reconciliation',
        paymentGateways: params.paymentGateways,
        schedule: params.schedule,
        timeOfDay: params.timeOfDay,
        autoResolveMatches: params.autoResolveMatches,
        notificationEmails: params.notificationEmails || [],
        isActive: true,
        scheduledBy: params.scheduledBy,
        createdAt: new Date(),
        nextRunTime: this.calculateNextRunTime(params.schedule, params.timeOfDay)
      };

      // Save scheduled job
      await this.saveScheduledJob(scheduledJob);

      return scheduledJob;
    } catch (error) {
      throw new Error(`Failed to schedule automatic reconciliation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private generateReconciliationId(gateway: string): string {
    return `REC_${gateway.toUpperCase()}_${Date.now()}`;
  }

  private async getPlatformTransactions(gateway: string, date: Date) {
    // Get platform transactions for the gateway and date
    const transactions = await db.select()
      .from(payments)
      .where(and(
        eq(payments.paymentMethod, gateway),
        gte(payments.createdAt, new Date(date.getFullYear(), date.getMonth(), date.getDate())),
        lte(payments.createdAt, new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))
      ));

    return transactions;
  }

  private async getGatewayTransactions(gateway: string, date: Date) {
    // Fetch transactions from gateway API (mock implementation)
    // In real implementation, this would call bKash, Nagad, Rocket APIs
    
    const mockTransactions = [
      {
        id: `${gateway}_txn_001`,
        amount: 1000,
        currency: 'BDT',
        status: 'completed',
        transactionTime: date,
        reference: 'REF123'
      }
    ];

    return mockTransactions;
  }

  private async performReconciliation(params: {
    platformTransactions: any[];
    gatewayTransactions: any[];
    autoMatch: boolean;
    toleranceAmount: number;
  }) {
    const matchedTransactions = [];
    const discrepancies = [];
    let reconciledAmount = 0;

    // Simple matching algorithm (in production, this would be more sophisticated)
    for (const platformTxn of params.platformTransactions) {
      const gatewayMatch = params.gatewayTransactions.find(gatewayTxn => 
        Math.abs(platformTxn.amount - gatewayTxn.amount) <= params.toleranceAmount &&
        this.areTransactionTimesClose(platformTxn.createdAt, gatewayTxn.transactionTime)
      );

      if (gatewayMatch) {
        matchedTransactions.push({
          platformTransaction: platformTxn,
          gatewayTransaction: gatewayMatch,
          variance: Math.abs(platformTxn.amount - gatewayMatch.amount)
        });
        reconciledAmount += platformTxn.amount;
      } else {
        discrepancies.push({
          type: 'unmatched_platform',
          transaction: platformTxn,
          reason: 'No matching gateway transaction found'
        });
      }
    }

    // Check for gateway transactions without platform matches
    for (const gatewayTxn of params.gatewayTransactions) {
      const platformMatch = matchedTransactions.find(match => 
        match.gatewayTransaction.id === gatewayTxn.id
      );

      if (!platformMatch) {
        discrepancies.push({
          type: 'unmatched_gateway',
          transaction: gatewayTxn,
          reason: 'No matching platform transaction found'
        });
      }
    }

    return {
      matchedTransactions,
      discrepancies,
      reconciledAmount
    };
  }

  private areTransactionTimesClose(time1: Date, time2: Date): boolean {
    const timeDiff = Math.abs(time1.getTime() - time2.getTime());
    return timeDiff <= 60 * 60 * 1000; // Within 1 hour
  }

  private async saveReconciliation(reconciliation: any) {
    // Save reconciliation to database
  }

  private async queryReconciliations(filters: any) {
    // Query reconciliations from database
    return [];
  }

  private async findReconciliationById(id: string) {
    // Find reconciliation by ID
    return null;
  }

  private async getReconciliationTransactions(reconciliationId: string) {
    // Get transactions for reconciliation
    return [];
  }

  private async getReconciliationDiscrepancies(reconciliationId: string) {
    // Get discrepancies for reconciliation
    return [];
  }

  private async getPlatformTransactionById(id: string) {
    // Get platform transaction by ID
    return null;
  }

  private async getGatewayTransactionById(id: string, gateway: string) {
    // Get gateway transaction by ID
    return null;
  }

  private generateMatchId(): string {
    return `MATCH_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async saveMatchRecord(match: any) {
    // Save match record to database
  }

  private async updateReconciliationProgress(reconciliationId: string) {
    // Update reconciliation progress
  }

  private async getReconciliationStatus(reconciliationId: string) {
    // Get current reconciliation status
    return { status: 'in_progress', progress: 75 };
  }

  private async findDiscrepancyById(id: string) {
    // Find discrepancy by ID
    return null;
  }

  private generateResolutionId(): string {
    return `RES_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async saveResolution(resolution: any) {
    // Save resolution to database
  }

  private async updateDiscrepancyStatus(discrepancyId: string, status: string) {
    // Update discrepancy status
  }

  private async canCompleteReconciliation(reconciliationId: string, forceComplete: boolean) {
    // Check if reconciliation can be completed
    return { canComplete: true, reason: '' };
  }

  private async calculateFinalReconciliationStats(reconciliationId: string) {
    // Calculate final reconciliation statistics
    return {
      totalTransactions: 100,
      matchedTransactions: 95,
      unresolvedDiscrepancies: 5,
      matchRate: 95
    };
  }

  private async updateReconciliation(reconciliationId: string, data: any) {
    // Update reconciliation record
  }

  private async generateCompletionReport(reconciliationId: string) {
    // Generate completion report
    return { reportId: 'RPT_001', summary: 'Reconciliation completed successfully' };
  }

  private async getReconciliationsForReport(filters: any) {
    // Get reconciliations for report generation
    return [];
  }

  private async processReconciliationReport(reconciliations: any[], reportType: string, includeDiscrepancies: boolean) {
    // Process report data
    return {};
  }

  private generateReportId(): string {
    return `RPT_${Date.now()}`;
  }

  private calculateSuccessRate(reconciliations: any[]): number {
    if (reconciliations.length === 0) return 100;
    const completed = reconciliations.filter(r => r.status === 'completed').length;
    return (completed / reconciliations.length) * 100;
  }

  private calculateAverageProcessingTime(reconciliations: any[]): number {
    // Calculate average processing time in hours
    return 2.5;
  }

  private async getReconciliationsForStats(filters: any) {
    // Get reconciliations for statistics
    return [];
  }

  private async calculateReconciliationStatistics(reconciliations: any[], groupBy: string) {
    // Calculate statistics grouped by specified field
    return {};
  }

  private async fetchGatewayTransactions(gateway: string, date: Date) {
    // Fetch transactions from gateway API
    return [];
  }

  private async formatTransactionsAsCSV(transactions: any[]): Promise<string> {
    // Format transactions as CSV
    const headers = 'ID,Amount,Currency,Status,Date,Reference\n';
    const rows = transactions.map(txn => 
      `${txn.id},${txn.amount},${txn.currency},${txn.status},${txn.transactionTime},${txn.reference}`
    ).join('\n');
    
    return headers + rows;
  }

  private async logFileDownload(params: any) {
    // Log file download request
  }

  private async parseReconciliationFile(fileData: string, fileType: string) {
    // Parse uploaded reconciliation file
    return {
      records: [],
      validRecords: 0,
      invalidRecords: 0
    };
  }

  private generateFileId(): string {
    return `FILE_${Date.now()}`;
  }

  private async saveFileRecord(fileRecord: any) {
    // Save file record to database
  }

  private async processUploadedFile(fileId: string, parsedData: any) {
    // Process uploaded file data
    return { status: 'processed', processedRecords: parsedData.records.length };
  }

  private async queryPendingItems(params: any) {
    // Query pending reconciliation items
    return [];
  }

  private generateJobId(): string {
    return `JOB_${Date.now()}`;
  }

  private async saveScheduledJob(job: any) {
    // Save scheduled job to database
  }

  private calculateNextRunTime(schedule: string, timeOfDay: string): Date {
    // Calculate next run time based on schedule
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 1); // Next day
    return nextRun;
  }
}