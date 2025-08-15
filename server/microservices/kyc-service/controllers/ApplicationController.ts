import { Router, Request, Response } from 'express';
import { db } from '../../../../shared/db';
import { 
  kycApplications, 
  insertKycApplicationSchema,
  type InsertKycApplication,
  type KycApplication 
} from '../../../../shared/kyc-schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { kycValidation } from '../middleware/validation';
import { auditLogger } from '../middleware/auditLogger';
import { WorkflowService } from '../services/WorkflowService';
import { NotificationService } from '../services/NotificationService';
import { RiskAssessmentService } from '../services/RiskAssessmentService';

export class ApplicationController {
  public router: Router;
  private workflowService: WorkflowService;
  private notificationService: NotificationService;
  private riskAssessmentService: RiskAssessmentService;

  constructor() {
    this.router = Router();
    this.workflowService = new WorkflowService();
    this.notificationService = new NotificationService();
    this.riskAssessmentService = new RiskAssessmentService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Create new KYC application
    this.router.post(
      '/',
      kycValidation.validateApplication,
      this.createApplication.bind(this)
    );

    // Get all applications for user
    this.router.get(
      '/user/:userId',
      this.getUserApplications.bind(this)
    );

    // Get specific application
    this.router.get(
      '/:applicationId',
      this.getApplication.bind(this)
    );

    // Update application
    this.router.patch(
      '/:applicationId',
      kycValidation.validateApplicationUpdate,
      this.updateApplication.bind(this)
    );

    // Submit application for review
    this.router.post(
      '/:applicationId/submit',
      this.submitApplication.bind(this)
    );

    // Get application status
    this.router.get(
      '/:applicationId/status',
      this.getApplicationStatus.bind(this)
    );

    // Get application progress
    this.router.get(
      '/:applicationId/progress',
      this.getApplicationProgress.bind(this)
    );

    // Cancel application
    this.router.post(
      '/:applicationId/cancel',
      this.cancelApplication.bind(this)
    );

    // Resubmit application after rejection
    this.router.post(
      '/:applicationId/resubmit',
      this.resubmitApplication.bind(this)
    );

    // Get application statistics
    this.router.get(
      '/stats/summary',
      this.getApplicationStats.bind(this)
    );
  }

  /**
   * Create new KYC application
   */
  private async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const applicationData: InsertKycApplication = req.body;
      
      // Add request metadata
      applicationData.ipAddress = req.ip;
      applicationData.deviceFingerprint = req.headers['device-fingerprint'] as string;
      applicationData.applicationSource = 'web';
      applicationData.locationData = req.body.locationData || null;

      // Check for existing pending application
      const existingApplication = await db
        .select()
        .from(kycApplications)
        .where(
          and(
            eq(kycApplications.userId, applicationData.userId),
            sql`${kycApplications.status} IN ('pending', 'under_review')`
          )
        )
        .limit(1);

      if (existingApplication.length > 0) {
        res.status(400).json({
          error: 'Existing application in progress',
          applicationId: existingApplication[0].id,
          status: existingApplication[0].status
        });
        return;
      }

      // Create the application
      const [application] = await db
        .insert(kycApplications)
        .values(applicationData)
        .returning();

      // Initialize workflow
      await this.workflowService.initializeWorkflow(application.id);

      // Perform initial risk assessment
      await this.riskAssessmentService.performInitialAssessment(application.id);

      // Send confirmation notification
      await this.notificationService.sendApplicationCreated(application);

      // Log audit trail
      await auditLogger.logAction({
        kycApplicationId: application.id,
        action: 'created',
        performedBy: applicationData.userId,
        details: { applicationType: applicationData.applicationType },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({
        message: 'KYC application created successfully',
        application: {
          id: application.id,
          status: application.status,
          applicationType: application.applicationType,
          createdAt: application.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating KYC application:', error);
      res.status(500).json({ error: 'Failed to create KYC application' });
    }
  }

  /**
   * Get all applications for a user
   */
  private async getUserApplications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const applications = await db
        .select()
        .from(kycApplications)
        .where(eq(kycApplications.userId, parseInt(userId)))
        .orderBy(desc(kycApplications.createdAt))
        .limit(limit)
        .offset(offset);

      const totalCount = await db
        .select({ count: count() })
        .from(kycApplications)
        .where(eq(kycApplications.userId, parseInt(userId)));

      res.json({
        applications,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching user applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  /**
   * Get specific application
   */
  private async getApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;

      const [application] = await db
        .select()
        .from(kycApplications)
        .where(eq(kycApplications.id, applicationId))
        .limit(1);

      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      // Get application progress
      const progress = await this.workflowService.getApplicationProgress(applicationId);

      res.json({
        application: {
          ...application,
          progress
        }
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  }

  /**
   * Update application
   */
  private async updateApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const updateData = req.body;

      // Check if application exists and is updatable
      const [existingApplication] = await db
        .select()
        .from(kycApplications)
        .where(eq(kycApplications.id, applicationId))
        .limit(1);

      if (!existingApplication) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      if (existingApplication.status !== 'pending') {
        res.status(400).json({ 
          error: 'Application cannot be updated in current status',
          currentStatus: existingApplication.status
        });
        return;
      }

      // Update the application
      const [updatedApplication] = await db
        .update(kycApplications)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(kycApplications.id, applicationId))
        .returning();

      // Log audit trail
      await auditLogger.logAction({
        kycApplicationId: applicationId,
        action: 'updated',
        performedBy: req.body.userId,
        details: updateData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        message: 'Application updated successfully',
        application: updatedApplication
      });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ error: 'Failed to update application' });
    }
  }

  /**
   * Submit application for review
   */
  private async submitApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;

      // Validate application completeness
      const isComplete = await this.validateApplicationCompleteness(applicationId);
      if (!isComplete.valid) {
        res.status(400).json({
          error: 'Application is incomplete',
          missingItems: isComplete.missingItems
        });
        return;
      }

      // Update application status
      const [application] = await db
        .update(kycApplications)
        .set({
          status: 'under_review',
          submittedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(kycApplications.id, applicationId))
        .returning();

      // Trigger automated processing workflow
      await this.workflowService.startReviewProcess(applicationId);

      // Perform comprehensive risk assessment
      await this.riskAssessmentService.performComprehensiveAssessment(applicationId);

      // Send submission notification
      await this.notificationService.sendApplicationSubmitted(application);

      // Log audit trail
      await auditLogger.logAction({
        kycApplicationId: applicationId,
        action: 'submitted',
        performedBy: req.body.userId,
        oldStatus: 'pending',
        newStatus: 'under_review',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        message: 'Application submitted for review',
        application: {
          id: application.id,
          status: application.status,
          submittedAt: application.submittedAt
        }
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }

  /**
   * Get application status
   */
  private async getApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;

      const [application] = await db
        .select({
          id: kycApplications.id,
          status: kycApplications.status,
          riskLevel: kycApplications.riskLevel,
          submittedAt: kycApplications.submittedAt,
          reviewedAt: kycApplications.reviewedAt,
          rejectionReason: kycApplications.rejectionReason,
          autoVerificationScore: kycApplications.autoVerificationScore
        })
        .from(kycApplications)
        .where(eq(kycApplications.id, applicationId))
        .limit(1);

      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      // Get workflow progress
      const progress = await this.workflowService.getApplicationProgress(applicationId);

      res.json({
        status: application.status,
        riskLevel: application.riskLevel,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
        autoVerificationScore: application.autoVerificationScore,
        progress
      });
    } catch (error) {
      console.error('Error fetching application status:', error);
      res.status(500).json({ error: 'Failed to fetch application status' });
    }
  }

  /**
   * Get application progress
   */
  private async getApplicationProgress(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;

      const progress = await this.workflowService.getApplicationProgress(applicationId);

      res.json({ progress });
    } catch (error) {
      console.error('Error fetching application progress:', error);
      res.status(500).json({ error: 'Failed to fetch application progress' });
    }
  }

  /**
   * Cancel application
   */
  private async cancelApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const { reason } = req.body;

      const [application] = await db
        .update(kycApplications)
        .set({
          status: 'cancelled',
          rejectionReason: reason,
          updatedAt: new Date()
        })
        .where(eq(kycApplications.id, applicationId))
        .returning();

      // Log audit trail
      await auditLogger.logAction({
        kycApplicationId: applicationId,
        action: 'cancelled',
        performedBy: req.body.userId,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        message: 'Application cancelled successfully',
        application: {
          id: application.id,
          status: application.status
        }
      });
    } catch (error) {
      console.error('Error cancelling application:', error);
      res.status(500).json({ error: 'Failed to cancel application' });
    }
  }

  /**
   * Resubmit application after rejection
   */
  private async resubmitApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;

      // Reset application status and clear rejection reason
      const [application] = await db
        .update(kycApplications)
        .set({
          status: 'pending',
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null,
          updatedAt: new Date()
        })
        .where(eq(kycApplications.id, applicationId))
        .returning();

      // Restart workflow
      await this.workflowService.restartWorkflow(applicationId);

      // Log audit trail
      await auditLogger.logAction({
        kycApplicationId: applicationId,
        action: 'resubmitted',
        performedBy: req.body.userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        message: 'Application resubmitted successfully',
        application: {
          id: application.id,
          status: application.status
        }
      });
    } catch (error) {
      console.error('Error resubmitting application:', error);
      res.status(500).json({ error: 'Failed to resubmit application' });
    }
  }

  /**
   * Get application statistics
   */
  private async getApplicationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.workflowService.getApplicationStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching application stats:', error);
      res.status(500).json({ error: 'Failed to fetch application statistics' });
    }
  }

  /**
   * Validate application completeness
   */
  private async validateApplicationCompleteness(applicationId: string): Promise<{
    valid: boolean;
    missingItems: string[];
  }> {
    // Implementation would check required documents, verifications, etc.
    // This is a placeholder implementation
    return {
      valid: true,
      missingItems: []
    };
  }
}

export default ApplicationController;