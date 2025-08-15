import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db';
import { kycAuditLogs } from '../../../../shared/schema';
import { eq, desc, sql, gte, lte, and, inArray, isNotNull } from 'drizzle-orm';

interface AuditLogData {
  kycApplicationId?: string;
  action: string;
  performedBy?: number;
  oldStatus?: string;
  newStatus?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  changedFields?: any;
  previousValues?: any;
  newValues?: any;
}

class AuditLogger {
  /**
   * Middleware to log all KYC-related requests
   */
  public middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Generate unique request ID
    const requestId = this.generateRequestId();
    req.headers['x-request-id'] = requestId;

    // Store original end function
    const originalEnd = res.end;
    const startTime = Date.now();

    // Override end function to log response
    res.end = function(chunk: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      
      // Log request/response if needed
      auditLogger.logRequest({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestId,
        userId: req.body?.userId || req.query?.userId
      });

      // Call original end function
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  /**
   * Log KYC action with comprehensive audit trail
   */
  public async logAction(data: AuditLogData): Promise<void> {
    try {
      // Log to console for immediate monitoring (simplified for development)
      console.log(`[KYC AUDIT] ${data.action}`, {
        applicationId: data.kycApplicationId,
        performedBy: data.performedBy,
        timestamp: new Date().toISOString(),
        ipAddress: data.ipAddress,
        details: data.details
      });

    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log application status change
   */
  public async logStatusChange(
    applicationId: string, 
    oldStatus: string, 
    newStatus: string, 
    performedBy: number,
    reason?: string,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'status_changed',
      performedBy,
      oldStatus,
      newStatus,
      details: {
        reason,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log document upload
   */
  public async logDocumentUpload(
    applicationId: string,
    documentType: string,
    documentId: string,
    uploadedBy: number,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'document_uploaded',
      performedBy: uploadedBy,
      details: {
        documentType,
        documentId,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log verification attempt
   */
  public async logVerificationAttempt(
    applicationId: string,
    verificationType: string,
    result: string,
    performedBy?: number,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'verification_attempted',
      performedBy,
      details: {
        verificationType,
        result,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log fraud detection event
   */
  public async logFraudDetection(
    applicationId: string,
    fraudType: string,
    fraudScore: number,
    evidence?: any,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'fraud_detected',
      details: {
        fraudType,
        fraudScore,
        evidence,
        metadata,
        severity: fraudScore > 0.8 ? 'high' : fraudScore > 0.5 ? 'medium' : 'low',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log compliance check
   */
  public async logComplianceCheck(
    applicationId: string,
    checkType: string,
    result: string,
    provider?: string,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'compliance_checked',
      details: {
        checkType,
        result,
        provider,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log manual review action
   */
  public async logManualReview(
    applicationId: string,
    reviewAction: string,
    reviewerId: number,
    comments?: string,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'manual_review',
      performedBy: reviewerId,
      details: {
        reviewAction,
        comments,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log data access
   */
  public async logDataAccess(
    applicationId: string,
    accessedBy: number,
    dataType: string,
    purpose: string,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'data_accessed',
      performedBy: accessedBy,
      details: {
        dataType,
        purpose,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log ML model prediction
   */
  public async logMLPrediction(
    applicationId: string,
    modelType: string,
    prediction: any,
    confidence: number,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'ml_prediction',
      details: {
        modelType,
        prediction,
        confidence,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log government API interaction
   */
  public async logGovernmentAPI(
    applicationId: string,
    apiType: string,
    result: string,
    responseCode?: string,
    metadata?: any
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'government_api_call',
      details: {
        apiType,
        result,
        responseCode,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any,
    applicationId?: string,
    userId?: number
  ): Promise<void> {
    await this.logAction({
      kycApplicationId: applicationId,
      action: 'security_event',
      performedBy: userId,
      details: {
        eventType,
        severity,
        details,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log request/response for monitoring
   */
  private logRequest(data: {
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    ipAddress?: string;
    userAgent?: string;
    requestId: string;
    userId?: any;
  }): void {
    // Log to console for immediate monitoring
    console.log(`[KYC REQUEST] ${data.method} ${data.url}`, {
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      userId: data.userId,
      requestId: data.requestId,
      timestamp: new Date().toISOString()
    });

    // You can also send to external monitoring services here
    // Example: send to DataDog, New Relic, etc.
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `kyc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get audit trail for application
   */
  public async getAuditTrail(applicationId: string, limit: number = 50): Promise<any[]> {
    try {
      const auditLogs = await db
        .select()
        .from(kycAuditLogs)
        .where(eq(kycAuditLogs.kycApplicationId, applicationId))
        .orderBy(desc(kycAuditLogs.timestamp))
        .limit(limit);

      return auditLogs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
        changedFields: log.changedFields ? JSON.parse(log.changedFields) : null,
        previousValues: log.previousValues ? JSON.parse(log.previousValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null
      }));
    } catch (error) {
      console.error('Failed to get audit trail:', error);
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  public async getAuditStatistics(timeframe: string = '24h'): Promise<any> {
    try {
      // Calculate date range based on timeframe
      let dateFilter: Date;
      switch (timeframe) {
        case '1h':
          dateFilter = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case '24h':
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      // Get action counts
      const actionCounts = await db
        .select({
          action: kycAuditLogs.action,
          count: sql<number>`count(*)`
        })
        .from(kycAuditLogs)
        .where(gte(kycAuditLogs.timestamp, dateFilter))
        .groupBy(kycAuditLogs.action);

      // Get user activity
      const userActivity = await db
        .select({
          performedBy: kycAuditLogs.performedBy,
          count: sql<number>`count(*)`
        })
        .from(kycAuditLogs)
        .where(
          and(
            gte(kycAuditLogs.timestamp, dateFilter),
            isNotNull(kycAuditLogs.performedBy)
          )
        )
        .groupBy(kycAuditLogs.performedBy)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(10);

      return {
        timeframe,
        actionCounts: actionCounts.reduce((acc, item) => {
          acc[item.action] = item.count;
          return acc;
        }, {} as Record<string, number>),
        topUsers: userActivity,
        totalEvents: actionCounts.reduce((sum, item) => sum + item.count, 0)
      };
    } catch (error) {
      console.error('Failed to get audit statistics:', error);
      return {
        timeframe,
        actionCounts: {},
        topUsers: [],
        totalEvents: 0
      };
    }
  }

  /**
   * Export audit logs for compliance
   */
  public async exportAuditLogs(
    startDate: Date, 
    endDate: Date, 
    applicationIds?: string[]
  ): Promise<any[]> {
    try {
      let query = db
        .select()
        .from(kycAuditLogs)
        .where(
          and(
            gte(kycAuditLogs.timestamp, startDate),
            lte(kycAuditLogs.timestamp, endDate)
          )
        );

      if (applicationIds && applicationIds.length > 0) {
        query = query.where(inArray(kycAuditLogs.kycApplicationId, applicationIds));
      }

      const logs = await query.orderBy(kycAuditLogs.timestamp);

      return logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
        changedFields: log.changedFields ? JSON.parse(log.changedFields) : null,
        previousValues: log.previousValues ? JSON.parse(log.previousValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null
      }));
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return [];
    }
  }
}

// Create singleton instance
export const auditLogger = new AuditLogger();

// Export middleware function directly
export default auditLogger.middleware;