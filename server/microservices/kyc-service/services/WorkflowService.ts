import { db } from '../../../../shared/db';
import { 
  kycVerificationWorkflows,
  kycApplications,
  type InsertKycVerificationWorkflow 
} from '../../../../shared/kyc-schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class WorkflowService {
  
  /**
   * Initialize KYC workflow for a new application
   */
  async initializeWorkflow(applicationId: string): Promise<void> {
    try {
      // Define standard KYC workflow steps
      const workflowSteps = [
        {
          workflowStep: 'document_upload',
          stepOrder: 1,
          stepType: 'manual',
          stepStatus: 'in_progress' as const,
          requiredActions: ['upload_nid', 'upload_trade_license', 'upload_bank_statement']
        },
        {
          workflowStep: 'document_verification',
          stepOrder: 2,
          stepType: 'automated',
          stepStatus: 'pending' as const,
          requiredActions: ['ocr_processing', 'authenticity_check']
        },
        {
          workflowStep: 'identity_verification',
          stepOrder: 3,
          stepType: 'automated',
          stepStatus: 'pending' as const,
          requiredActions: ['face_verification', 'liveness_check']
        },
        {
          workflowStep: 'government_verification',
          stepOrder: 4,
          stepType: 'external',
          stepStatus: 'pending' as const,
          requiredActions: ['nid_validation', 'trade_license_validation']
        },
        {
          workflowStep: 'risk_assessment',
          stepOrder: 5,
          stepType: 'automated',
          stepStatus: 'pending' as const,
          requiredActions: ['fraud_check', 'compliance_screening']
        },
        {
          workflowStep: 'manual_review',
          stepOrder: 6,
          stepType: 'manual',
          stepStatus: 'pending' as const,
          requiredActions: ['admin_review', 'final_approval']
        }
      ];

      // Create workflow steps
      for (const step of workflowSteps) {
        await db.insert(kycVerificationWorkflows).values({
          kycApplicationId: applicationId,
          ...step,
          estimatedDuration: this.getEstimatedDuration(step.workflowStep),
          completionCriteria: this.getCompletionCriteria(step.workflowStep)
        });
      }

      console.log(`✅ KYC workflow initialized for application ${applicationId}`);
    } catch (error) {
      console.error('Error initializing workflow:', error);
      throw error;
    }
  }

  /**
   * Start review process for submitted application
   */
  async startReviewProcess(applicationId: string): Promise<void> {
    try {
      // Update document verification step to in_progress
      await db
        .update(kycVerificationWorkflows)
        .set({
          stepStatus: 'in_progress',
          startedAt: new Date()
        })
        .where(
          and(
            eq(kycVerificationWorkflows.kycApplicationId, applicationId),
            eq(kycVerificationWorkflows.workflowStep, 'document_verification')
          )
        );

      console.log(`✅ Review process started for application ${applicationId}`);
    } catch (error) {
      console.error('Error starting review process:', error);
      throw error;
    }
  }

  /**
   * Get application progress
   */
  async getApplicationProgress(applicationId: string): Promise<any> {
    try {
      const workflows = await db
        .select()
        .from(kycVerificationWorkflows)
        .where(eq(kycVerificationWorkflows.kycApplicationId, applicationId))
        .orderBy(kycVerificationWorkflows.stepOrder);

      const totalSteps = workflows.length;
      const completedSteps = workflows.filter(w => w.stepStatus === 'completed').length;
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

      const currentStep = workflows.find(w => w.stepStatus === 'in_progress') || 
                         workflows.find(w => w.stepStatus === 'pending');

      return {
        totalSteps,
        completedSteps,
        progressPercentage,
        currentStep: currentStep?.workflowStep || 'completed',
        workflows: workflows.map(w => ({
          step: w.workflowStep,
          status: w.stepStatus,
          startedAt: w.startedAt,
          completedAt: w.completedAt,
          estimatedDuration: w.estimatedDuration,
          actionRequired: w.actionRequired
        }))
      };
    } catch (error) {
      console.error('Error getting application progress:', error);
      throw error;
    }
  }

  /**
   * Update workflow step status
   */
  async updateStepStatus(
    applicationId: string, 
    stepName: string, 
    status: 'in_progress' | 'completed' | 'failed' | 'skipped',
    notes?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        stepStatus: status,
        updatedAt: new Date()
      };

      if (status === 'in_progress') {
        updateData.startedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      if (notes) {
        updateData.reviewNotes = notes;
      }

      await db
        .update(kycVerificationWorkflows)
        .set(updateData)
        .where(
          and(
            eq(kycVerificationWorkflows.kycApplicationId, applicationId),
            eq(kycVerificationWorkflows.workflowStep, stepName)
          )
        );

      // If step completed, start next step
      if (status === 'completed') {
        await this.startNextStep(applicationId, stepName);
      }

      console.log(`✅ Workflow step ${stepName} updated to ${status} for application ${applicationId}`);
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw error;
    }
  }

  /**
   * Start next step in workflow
   */
  private async startNextStep(applicationId: string, completedStep: string): Promise<void> {
    try {
      const workflows = await db
        .select()
        .from(kycVerificationWorkflows)
        .where(eq(kycVerificationWorkflows.kycApplicationId, applicationId))
        .orderBy(kycVerificationWorkflows.stepOrder);

      const currentStepIndex = workflows.findIndex(w => w.workflowStep === completedStep);
      const nextStep = workflows[currentStepIndex + 1];

      if (nextStep && nextStep.stepStatus === 'pending') {
        await db
          .update(kycVerificationWorkflows)
          .set({
            stepStatus: 'in_progress',
            startedAt: new Date()
          })
          .where(eq(kycVerificationWorkflows.id, nextStep.id));

        console.log(`✅ Started next workflow step: ${nextStep.workflowStep}`);
      }
    } catch (error) {
      console.error('Error starting next step:', error);
    }
  }

  /**
   * Get estimated duration for workflow step
   */
  private getEstimatedDuration(stepName: string): number {
    const durations: Record<string, number> = {
      'document_upload': 30, // 30 minutes
      'document_verification': 15, // 15 minutes
      'identity_verification': 10, // 10 minutes
      'government_verification': 1440, // 24 hours
      'risk_assessment': 5, // 5 minutes
      'manual_review': 480 // 8 hours
    };
    return durations[stepName] || 60;
  }

  /**
   * Get completion criteria for workflow step
   */
  private getCompletionCriteria(stepName: string): any {
    const criteria: Record<string, any> = {
      'document_upload': {
        required_documents: ['nid', 'trade_license', 'bank_statement'],
        quality_threshold: 0.8
      },
      'document_verification': {
        ocr_confidence: 0.85,
        authenticity_score: 0.9
      },
      'identity_verification': {
        face_match_score: 0.95,
        liveness_score: 0.9
      },
      'government_verification': {
        nid_verified: true,
        trade_license_verified: true
      },
      'risk_assessment': {
        max_risk_score: 0.3,
        fraud_indicators: 0
      },
      'manual_review': {
        admin_approval: true,
        compliance_verified: true
      }
    };
    return criteria[stepName] || {};
  }
}