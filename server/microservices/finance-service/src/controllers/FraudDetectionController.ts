/**
 * Fraud Detection Controller - Amazon.com/Shopee.sg Level
 * AI/ML-powered fraud detection and risk assessment
 */

import { Request, Response } from 'express';
import { LoggingService } from '../../../../services/LoggingService';
import { FraudDetectionService } from '../services/FraudDetectionService';

export class FraudDetectionController {
  private fraudDetectionService: FraudDetectionService;
  private loggingService: LoggingService;

  constructor() {
    this.fraudDetectionService = new FraudDetectionService();
    this.loggingService = new LoggingService();
  }

  /**
   * Analyze transaction for fraud risk
   */
  async analyzeTransaction(req: Request, res: Response): Promise<void> {
    try {
      const {
        transactionId,
        userId,
        amount,
        paymentMethod,
        deviceInfo,
        location,
        metadata
      } = req.body;
      const analystId = req.user?.userId;

      const analysis = await this.fraudDetectionService.analyzeTransaction({
        transactionId,
        userId,
        amount: parseFloat(amount),
        paymentMethod,
        deviceInfo,
        location,
        metadata,
        analyzedBy: analystId
      });

      this.loggingService.logInfo('Transaction fraud analysis completed', {
        transactionId,
        userId,
        amount,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        analysisTime: analysis.processingTime
      });

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to analyze transaction for fraud', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze transaction for fraud',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user risk profile
   */
  async getUserRiskProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { includeHistory = false } = req.query;
      const analystId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const riskProfile = await this.fraudDetectionService.getUserRiskProfile({
        userId,
        includeHistory: includeHistory === 'true',
        requestedBy: analystId
      });

      res.json({
        success: true,
        data: riskProfile,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get user risk profile', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user risk profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Real-time fraud monitoring dashboard
   */
  async getFraudMonitoringDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '24h' } = req.query;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const dashboard = await this.fraudDetectionService.getFraudMonitoringDashboard(
        timeframe as string
      );

      res.json({
        success: true,
        data: dashboard,
        timeframe,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get fraud monitoring dashboard', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fraud monitoring dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Train fraud detection models with new data
   */
  async trainFraudModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelType, trainingData, validationData } = req.body;
      const trainerId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'ml_engineer') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or ML engineer role required.'
        });
        return;
      }

      const training = await this.fraudDetectionService.trainFraudModel({
        modelType,
        trainingData,
        validationData,
        trainedBy: trainerId
      });

      this.loggingService.logInfo('Fraud detection model training initiated', {
        modelType,
        trainingDataSize: trainingData?.length || 0,
        validationDataSize: validationData?.length || 0,
        trainedBy: trainerId
      });

      res.json({
        success: true,
        message: 'Model training initiated successfully',
        data: training,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to train fraud model', error);
      res.status(500).json({
        success: false,
        message: 'Failed to train fraud model',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update fraud rules and thresholds
   */
  async updateFraudRules(req: Request, res: Response): Promise<void> {
    try {
      const { rules, thresholds, enabled = true } = req.body;
      const updatedBy = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const updatedRules = await this.fraudDetectionService.updateFraudRules({
        rules,
        thresholds,
        enabled,
        updatedBy
      });

      this.loggingService.logInfo('Fraud rules updated', {
        rulesCount: rules?.length || 0,
        thresholdsCount: Object.keys(thresholds || {}).length,
        enabled,
        updatedBy
      });

      res.json({
        success: true,
        message: 'Fraud rules updated successfully',
        data: updatedRules,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update fraud rules', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update fraud rules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get fraud alerts and notifications
   */
  async getFraudAlerts(req: Request, res: Response): Promise<void> {
    try {
      const {
        severity = 'all',
        status = 'all',
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const alerts = await this.fraudDetectionService.getFraudAlerts({
        severity: severity as string,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: alerts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get fraud alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fraud alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Investigate suspicious transaction
   */
  async investigateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { notes, priority = 'medium' } = req.body;
      const investigatorId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const investigation = await this.fraudDetectionService.investigateTransaction({
        transactionId,
        investigatorId,
        notes,
        priority
      });

      this.loggingService.logInfo('Transaction investigation initiated', {
        transactionId,
        investigatorId,
        priority,
        investigationId: investigation.id
      });

      res.json({
        success: true,
        message: 'Investigation initiated successfully',
        data: investigation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to investigate transaction', error);
      res.status(500).json({
        success: false,
        message: 'Failed to investigate transaction',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Block or approve suspicious user
   */
  async updateUserRiskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { action, reason, duration } = req.body; // action: block, approve, monitor
      const moderatorId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const riskUpdate = await this.fraudDetectionService.updateUserRiskStatus({
        userId,
        action,
        reason,
        duration: duration ? parseInt(duration) : undefined,
        moderatorId
      });

      this.loggingService.logInfo('User risk status updated', {
        userId,
        action,
        reason,
        duration,
        moderatorId
      });

      res.json({
        success: true,
        message: `User ${action} action completed successfully`,
        data: riskUpdate,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update user risk status', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user risk status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get ML model performance metrics
   */
  async getModelPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { modelType = 'all', timeframe = '30d' } = req.query;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'ml_engineer' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin, ML engineer, or fraud analyst role required.'
        });
        return;
      }

      const performance = await this.fraudDetectionService.getModelPerformance({
        modelType: modelType as string,
        timeframe: timeframe as string
      });

      res.json({
        success: true,
        data: performance,
        modelType,
        timeframe,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get model performance', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get model performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Batch analyze multiple transactions
   */
  async batchAnalyzeTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { transactions, analysisType = 'comprehensive' } = req.body;
      const analystId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const batchAnalysis = await this.fraudDetectionService.batchAnalyzeTransactions({
        transactions,
        analysisType,
        analystId
      });

      this.loggingService.logInfo('Batch fraud analysis completed', {
        transactionCount: transactions.length,
        analysisType,
        batchId: batchAnalysis.batchId,
        analystId
      });

      res.json({
        success: true,
        message: 'Batch analysis completed successfully',
        data: batchAnalysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to batch analyze transactions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to batch analyze transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate fraud detection report
   */
  async generateFraudReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        reportType = 'summary',
        startDate,
        endDate,
        filters,
        format = 'json'
      } = req.body;
      const generatedBy = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin' && userRole !== 'fraud_analyst') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin or fraud analyst role required.'
        });
        return;
      }

      const report = await this.fraudDetectionService.generateFraudReport({
        reportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        filters,
        format,
        generatedBy
      });

      this.loggingService.logInfo('Fraud detection report generated', {
        reportType,
        startDate,
        endDate,
        format,
        reportId: report.id,
        generatedBy
      });

      res.json({
        success: true,
        message: 'Fraud report generated successfully',
        data: report,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to generate fraud report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate fraud report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}