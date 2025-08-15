import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { logger } from '../../../../services/LoggingService';

/**
 * Report Controller - Amazon.com/Shopee.sg Level
 * Handles comprehensive report generation and management
 * Provides customizable reports, automated reporting, and export capabilities
 */
export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Generate custom analytics report
   */
  async generateCustomReport(req: Request, res: Response) {
    try {
      const { 
        reportType,
        parameters,
        format = 'json',
        includeCharts = true 
      } = req.body;

      if (!reportType || !parameters) {
        return res.status(400).json({
          success: false,
          error: 'Report type and parameters are required'
        });
      }

      logger.info('Custom report generation requested', {
        reportType,
        format,
        requestId: req.headers['x-request-id']
      });

      const reportData = await this.reportService.generateCustomReport({
        reportType,
        parameters,
        format: format as string,
        includeCharts: includeCharts as boolean
      });

      res.json({
        success: true,
        data: reportData,
        metadata: {
          reportType,
          format,
          generatedAt: new Date().toISOString(),
          reportId: reportData.reportId
        }
      });

    } catch (error) {
      logger.error('Custom report generation error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to generate custom report'
      });
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(req: Request, res: Response) {
    try {
      const { 
        category = 'all',
        includeCustom = true,
        userRole = 'admin' 
      } = req.query;

      const templates = await this.reportService.getAvailableTemplates({
        category: category as string,
        includeCustom: includeCustom === 'true',
        userRole: userRole as string
      });

      res.json({
        success: true,
        data: templates,
        metadata: {
          totalTemplates: templates.length,
          category,
          userRole
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Report templates error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch report templates'
      });
    }
  }

  /**
   * Create new report template
   */
  async createReportTemplate(req: Request, res: Response) {
    try {
      const { 
        name,
        description,
        configuration,
        category,
        accessLevel = 'private' 
      } = req.body;

      if (!name || !configuration) {
        return res.status(400).json({
          success: false,
          error: 'Template name and configuration are required'
        });
      }

      const template = await this.reportService.createReportTemplate({
        name,
        description,
        configuration,
        category,
        accessLevel: accessLevel as string
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Report template created successfully'
      });

    } catch (error) {
      logger.error('Report template creation error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create report template'
      });
    }
  }

  /**
   * Generate executive summary report
   */
  async generateExecutiveSummary(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d',
        includeForecasts = true,
        includeAlerts = true,
        format = 'pdf' 
      } = req.query;

      const summaryReport = await this.reportService.generateExecutiveSummary({
        timeRange: timeRange as string,
        includeForecasts: includeForecasts === 'true',
        includeAlerts: includeAlerts === 'true',
        format: format as string
      });

      res.json({
        success: true,
        data: summaryReport,
        metadata: {
          reportType: 'executive_summary',
          timeRange,
          format,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Executive summary generation error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate executive summary'
      });
    }
  }

  /**
   * Generate automated periodic reports
   */
  async generatePeriodicReport(req: Request, res: Response) {
    try {
      const { 
        reportId,
        period = 'weekly',
        recipients,
        deliveryMethod = 'email' 
      } = req.body;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'Report ID is required'
        });
      }

      const periodicReport = await this.reportService.generatePeriodicReport({
        reportId,
        period: period as string,
        recipients: recipients as string[],
        deliveryMethod: deliveryMethod as string
      });

      res.json({
        success: true,
        data: periodicReport,
        message: 'Periodic report scheduled successfully'
      });

    } catch (error) {
      logger.error('Periodic report generation error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate periodic report'
      });
    }
  }

  /**
   * Export report to various formats
   */
  async exportReport(req: Request, res: Response) {
    try {
      const { 
        reportId,
        format = 'pdf',
        includeRawData = false,
        compressionLevel = 'medium' 
      } = req.body;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'Report ID is required'
        });
      }

      const exportData = await this.reportService.exportReport({
        reportId,
        format: format as string,
        includeRawData: includeRawData as boolean,
        compressionLevel: compressionLevel as string
      });

      // Set appropriate headers for download
      res.setHeader('Content-Type', exportData.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      
      if (format === 'json') {
        res.json({
          success: true,
          data: exportData.data,
          metadata: exportData.metadata
        });
      } else {
        res.send(exportData.buffer);
      }

    } catch (error) {
      logger.error('Report export error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to export report'
      });
    }
  }

  /**
   * Get report generation history
   */
  async getReportHistory(req: Request, res: Response) {
    try {
      const { 
        limit = 50,
        offset = 0,
        reportType,
        dateRange 
      } = req.query;

      const history = await this.reportService.getReportHistory({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        reportType: reportType as string,
        dateRange: dateRange as string
      });

      res.json({
        success: true,
        data: history.reports,
        pagination: {
          total: history.total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: history.hasMore
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Report history error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch report history'
      });
    }
  }

  /**
   * Generate comprehensive business intelligence report
   */
  async generateBusinessIntelligenceReport(req: Request, res: Response) {
    try {
      const { 
        analysisDepth = 'comprehensive',
        timeRange = '90d',
        includeRecommendations = true,
        sectors = ['all'] 
      } = req.body;

      const biReport = await this.reportService.generateBusinessIntelligenceReport({
        analysisDepth: analysisDepth as string,
        timeRange: timeRange as string,
        includeRecommendations: includeRecommendations as boolean,
        sectors: sectors as string[]
      });

      res.json({
        success: true,
        data: biReport,
        metadata: {
          reportType: 'business_intelligence',
          analysisDepth,
          timeRange,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Business intelligence report error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate business intelligence report'
      });
    }
  }

  /**
   * Generate compliance and audit reports
   */
  async generateComplianceReport(req: Request, res: Response) {
    try {
      const { 
        complianceType = 'comprehensive',
        auditPeriod = '1y',
        includeRemediation = true,
        regulatoryFramework = 'bangladesh' 
      } = req.query;

      const complianceReport = await this.reportService.generateComplianceReport({
        complianceType: complianceType as string,
        auditPeriod: auditPeriod as string,
        includeRemediation: includeRemediation === 'true',
        regulatoryFramework: regulatoryFramework as string
      });

      res.json({
        success: true,
        data: complianceReport,
        metadata: {
          reportType: 'compliance_audit',
          complianceType,
          auditPeriod,
          framework: regulatoryFramework
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Compliance report error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate compliance report'
      });
    }
  }

  /**
   * Generate real-time dashboard reports
   */
  async generateRealTimeDashboardReport(req: Request, res: Response) {
    try {
      const { 
        dashboardType = 'operational',
        refreshInterval = 300,
        includeAlerts = true,
        widgets 
      } = req.body;

      const dashboardReport = await this.reportService.generateRealTimeDashboardReport({
        dashboardType: dashboardType as string,
        refreshInterval: refreshInterval as number,
        includeAlerts: includeAlerts as boolean,
        widgets: widgets as string[]
      });

      res.json({
        success: true,
        data: dashboardReport,
        metadata: {
          reportType: 'realtime_dashboard',
          dashboardType,
          refreshInterval,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Real-time dashboard report error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate real-time dashboard report'
      });
    }
  }

  /**
   * Schedule automated report generation
   */
  async scheduleAutomatedReport(req: Request, res: Response) {
    try {
      const { 
        templateId,
        schedule,
        recipients,
        parameters,
        isActive = true 
      } = req.body;

      if (!templateId || !schedule || !recipients) {
        return res.status(400).json({
          success: false,
          error: 'Template ID, schedule, and recipients are required'
        });
      }

      const scheduledReport = await this.reportService.scheduleAutomatedReport({
        templateId,
        schedule,
        recipients: recipients as string[],
        parameters: parameters || {},
        isActive: isActive as boolean
      });

      res.status(201).json({
        success: true,
        data: scheduledReport,
        message: 'Automated report scheduled successfully'
      });

    } catch (error) {
      logger.error('Automated report scheduling error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to schedule automated report'
      });
    }
  }

  /**
   * Generate Bangladesh-specific regulatory reports
   */
  async generateBangladeshRegulatoryReport(req: Request, res: Response) {
    try {
      const { 
        reportType = 'trade_license',
        period = 'quarterly',
        includeCompliance = true,
        language = 'english' 
      } = req.query;

      const regulatoryReport = await this.reportService.generateBangladeshRegulatoryReport({
        reportType: reportType as string,
        period: period as string,
        includeCompliance: includeCompliance === 'true',
        language: language as string
      });

      res.json({
        success: true,
        data: regulatoryReport,
        metadata: {
          reportType: 'bangladesh_regulatory',
          specificType: reportType,
          period,
          language,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Bangladesh regulatory report error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate regulatory report'
      });
    }
  }

  /**
   * Bulk report generation for multiple reports
   */
  async generateBulkReports(req: Request, res: Response) {
    try {
      const { reportRequests, parallelProcessing = true, notifyOnCompletion = true } = req.body;

      if (!Array.isArray(reportRequests) || reportRequests.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Report requests array is required'
        });
      }

      const bulkResults = await this.reportService.generateBulkReports({
        reportRequests,
        parallelProcessing: parallelProcessing as boolean,
        notifyOnCompletion: notifyOnCompletion as boolean
      });

      res.json({
        success: true,
        data: bulkResults,
        metadata: {
          totalRequested: reportRequests.length,
          successful: bulkResults.successful.length,
          failed: bulkResults.failed.length,
          processingTime: bulkResults.processingTime
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Bulk report generation error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate bulk reports'
      });
    }
  }
}