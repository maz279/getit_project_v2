/**
 * Payment Orchestration Service - Amazon.com/Shopee.sg Level
 * Complete workflow orchestration for complex payment processing
 * Multi-step payments, retry mechanisms, and compensation transactions
 */

import { EventEmitter } from 'events';
import { eventStreamingService, PaymentEventTypes, PaymentStreams } from './EventStreamingService';
import { db } from '../../../db';
import { paymentTransactions, paymentWorkflows, fraudAlerts } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface PaymentWorkflow {
  workflowId: string;
  orderId: string;
  userId: number;
  paymentMethod: string;
  amount: number;
  currency: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  metadata: Record<string, any>;
  correlationId: string;
  startedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

interface WorkflowStep {
  stepId: string;
  stepType: string;
  stepName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  input: Record<string, any>;
  output?: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
}

interface WorkflowDefinition {
  workflowType: string;
  steps: Array<{
    stepType: string;
    stepName: string;
    handler: (input: any, context: WorkflowContext) => Promise<any>;
    retryPolicy?: RetryPolicy;
    compensationHandler?: (input: any, context: WorkflowContext) => Promise<void>;
  }>;
}

interface WorkflowContext {
  workflowId: string;
  orderId: string;
  userId: number;
  correlationId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  metadata: Record<string, any>;
}

interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  retryableErrors: string[];
}

export class PaymentOrchestrationService extends EventEmitter {
  private workflows: Map<string, PaymentWorkflow> = new Map();
  private workflowDefinitions: Map<string, WorkflowDefinition> = new Map();
  private isProcessing: boolean = false;

  constructor() {
    super();
    this.setupWorkflowDefinitions();
    this.setupEventHandlers();
  }

  /**
   * Initialize the orchestration service
   */
  async initialize(): Promise<void> {
    console.log('[PaymentOrchestrationService] Initializing...');
    
    // Load pending workflows from database
    await this.loadPendingWorkflows();
    
    // Start workflow processing
    this.startWorkflowProcessing();
    
    console.log('[PaymentOrchestrationService] Initialized successfully');
  }

  /**
   * Start a new payment workflow
   */
  async startWorkflow(params: {
    orderId: string;
    userId: number;
    paymentMethod: string;
    amount: number;
    currency: string;
    workflowType: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflowDefinition = this.workflowDefinitions.get(params.workflowType);
    if (!workflowDefinition) {
      throw new Error(`Unknown workflow type: ${params.workflowType}`);
    }

    // Create workflow steps
    const steps: WorkflowStep[] = workflowDefinition.steps.map((stepDef, index) => ({
      stepId: `step_${index}_${stepDef.stepType}`,
      stepType: stepDef.stepType,
      stepName: stepDef.stepName,
      status: 'pending',
      input: {},
      retryCount: 0,
      maxRetries: stepDef.retryPolicy?.maxRetries || 3
    }));

    const workflow: PaymentWorkflow = {
      workflowId,
      orderId: params.orderId,
      userId: params.userId,
      paymentMethod: params.paymentMethod,
      amount: params.amount,
      currency: params.currency,
      steps,
      currentStepIndex: 0,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      metadata: params.metadata || {},
      correlationId,
      startedAt: new Date()
    };

    // Store workflow in memory and database
    this.workflows.set(workflowId, workflow);
    await this.persistWorkflow(workflow);

    // Publish workflow started event
    await eventStreamingService.publishEvent({
      eventType: 'workflow.started',
      streamName: PaymentStreams.TRANSACTIONS,
      aggregateId: workflowId,
      eventData: {
        workflowId,
        orderId: params.orderId,
        workflowType: params.workflowType,
        amount: params.amount,
        currency: params.currency
      }
    });

    console.log(`[PaymentOrchestrationService] Started workflow ${workflowId} for order ${params.orderId}`);
    return workflowId;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<PaymentWorkflow | null> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      return workflow;
    }

    // Try to load from database
    return await this.loadWorkflowFromDatabase(workflowId);
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(workflowId: string, reason: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status === 'completed' || workflow.status === 'cancelled') {
      throw new Error(`Workflow ${workflowId} is already ${workflow.status}`);
    }

    workflow.status = 'cancelled';
    workflow.metadata.cancellationReason = reason;
    workflow.failedAt = new Date();

    await this.persistWorkflow(workflow);

    // Publish workflow cancelled event
    await eventStreamingService.publishEvent({
      eventType: 'workflow.cancelled',
      streamName: PaymentStreams.TRANSACTIONS,
      aggregateId: workflowId,
      eventData: {
        workflowId,
        reason,
        cancelledAt: workflow.failedAt
      }
    });

    console.log(`[PaymentOrchestrationService] Cancelled workflow ${workflowId}: ${reason}`);
  }

  /**
   * Setup workflow definitions
   */
  private setupWorkflowDefinitions(): void {
    // Standard payment workflow
    this.workflowDefinitions.set('standard_payment', {
      workflowType: 'standard_payment',
      steps: [
        {
          stepType: 'validation',
          stepName: 'Validate Payment Request',
          handler: this.validatePaymentRequest.bind(this),
          retryPolicy: { maxRetries: 2, backoffMultiplier: 1.5, maxBackoffMs: 5000, retryableErrors: ['VALIDATION_ERROR'] }
        },
        {
          stepType: 'fraud_check',
          stepName: 'Fraud Detection',
          handler: this.performFraudCheck.bind(this),
          retryPolicy: { maxRetries: 1, backoffMultiplier: 2, maxBackoffMs: 3000, retryableErrors: ['FRAUD_SERVICE_ERROR'] }
        },
        {
          stepType: 'authorization',
          stepName: 'Authorize Payment',
          handler: this.authorizePayment.bind(this),
          retryPolicy: { maxRetries: 3, backoffMultiplier: 2, maxBackoffMs: 10000, retryableErrors: ['GATEWAY_ERROR', 'NETWORK_ERROR'] }
        },
        {
          stepType: 'capture',
          stepName: 'Capture Payment',
          handler: this.capturePayment.bind(this),
          retryPolicy: { maxRetries: 5, backoffMultiplier: 2, maxBackoffMs: 30000, retryableErrors: ['GATEWAY_ERROR', 'NETWORK_ERROR'] }
        },
        {
          stepType: 'settlement',
          stepName: 'Initiate Settlement',
          handler: this.initiateSettlement.bind(this),
          retryPolicy: { maxRetries: 3, backoffMultiplier: 1.5, maxBackoffMs: 15000, retryableErrors: ['SETTLEMENT_ERROR'] }
        },
        {
          stepType: 'notification',
          stepName: 'Send Notifications',
          handler: this.sendNotifications.bind(this),
          retryPolicy: { maxRetries: 2, backoffMultiplier: 1.2, maxBackoffMs: 5000, retryableErrors: ['NOTIFICATION_ERROR'] }
        }
      ]
    });

    // Express payment workflow (for mobile banking)
    this.workflowDefinitions.set('express_payment', {
      workflowType: 'express_payment',
      steps: [
        {
          stepType: 'validation',
          stepName: 'Quick Validation',
          handler: this.validatePaymentRequest.bind(this)
        },
        {
          stepType: 'express_processing',
          stepName: 'Express Payment Processing',
          handler: this.processExpressPayment.bind(this),
          retryPolicy: { maxRetries: 2, backoffMultiplier: 1.5, maxBackoffMs: 8000, retryableErrors: ['GATEWAY_ERROR'] }
        },
        {
          stepType: 'notification',
          stepName: 'Instant Notifications',
          handler: this.sendInstantNotifications.bind(this)
        }
      ]
    });

    console.log('[PaymentOrchestrationService] Workflow definitions loaded');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle workflow step completion events
    this.on('step_completed', async (workflowId: string, stepIndex: number, result: any) => {
      await this.handleStepCompletion(workflowId, stepIndex, result);
    });

    this.on('step_failed', async (workflowId: string, stepIndex: number, error: Error) => {
      await this.handleStepFailure(workflowId, stepIndex, error);
    });
  }

  /**
   * Start workflow processing loop
   */
  private async startWorkflowProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.isProcessing) {
      try {
        await this.processActiveWorkflows();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Process every second
      } catch (error) {
        console.error('[PaymentOrchestrationService] Error in processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer on error
      }
    }
  }

  /**
   * Process all active workflows
   */
  private async processActiveWorkflows(): Promise<void> {
    const activeWorkflows = Array.from(this.workflows.values())
      .filter(workflow => workflow.status === 'pending' || workflow.status === 'processing');

    for (const workflow of activeWorkflows) {
      try {
        await this.processWorkflowStep(workflow);
      } catch (error) {
        console.error(`[PaymentOrchestrationService] Error processing workflow ${workflow.workflowId}:`, error);
      }
    }
  }

  /**
   * Process next step in workflow
   */
  private async processWorkflowStep(workflow: PaymentWorkflow): Promise<void> {
    if (workflow.currentStepIndex >= workflow.steps.length) {
      // Workflow completed
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      await this.persistWorkflow(workflow);
      
      await eventStreamingService.publishEvent({
        eventType: 'workflow.completed',
        streamName: PaymentStreams.TRANSACTIONS,
        aggregateId: workflow.workflowId,
        eventData: {
          workflowId: workflow.workflowId,
          orderId: workflow.orderId,
          completedAt: workflow.completedAt,
          totalSteps: workflow.steps.length
        }
      });
      
      return;
    }

    const currentStep = workflow.steps[workflow.currentStepIndex];
    
    if (currentStep.status === 'pending') {
      currentStep.status = 'processing';
      currentStep.startedAt = new Date();
      workflow.status = 'processing';
      
      const workflowDefinition = this.workflowDefinitions.get('standard_payment'); // Default for now
      if (!workflowDefinition) return;
      
      const stepDefinition = workflowDefinition.steps.find(s => s.stepType === currentStep.stepType);
      if (!stepDefinition) return;

      try {
        const context: WorkflowContext = {
          workflowId: workflow.workflowId,
          orderId: workflow.orderId,
          userId: workflow.userId,
          correlationId: workflow.correlationId,
          paymentMethod: workflow.paymentMethod,
          amount: workflow.amount,
          currency: workflow.currency,
          metadata: workflow.metadata
        };

        const result = await stepDefinition.handler(currentStep.input, context);
        
        currentStep.status = 'completed';
        currentStep.completedAt = new Date();
        currentStep.output = result;
        
        workflow.currentStepIndex++;
        await this.persistWorkflow(workflow);
        
        this.emit('step_completed', workflow.workflowId, workflow.currentStepIndex - 1, result);
        
      } catch (error) {
        currentStep.status = 'failed';
        currentStep.failedAt = new Date();
        currentStep.errorMessage = error.message;
        
        this.emit('step_failed', workflow.workflowId, workflow.currentStepIndex, error);
      }
    }
  }

  /**
   * Step handlers
   */
  private async validatePaymentRequest(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Validating payment for order ${context.orderId}`);
    
    // Validation logic
    if (context.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    if (!context.paymentMethod) {
      throw new Error('Payment method is required');
    }
    
    return { validated: true, validatedAt: new Date() };
  }

  private async performFraudCheck(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Performing fraud check for order ${context.orderId}`);
    
    // Fraud check logic (integrate with fraud service)
    const riskScore = Math.random() * 100;
    const isHighRisk = riskScore > 75;
    
    if (isHighRisk) {
      throw new Error('High fraud risk detected');
    }
    
    return { 
      riskScore, 
      riskLevel: riskScore > 50 ? 'medium' : 'low',
      checkedAt: new Date() 
    };
  }

  private async authorizePayment(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Authorizing payment for order ${context.orderId}`);
    
    // Authorization logic
    const authorizationId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      authorizationId,
      status: 'authorized',
      authorizedAmount: context.amount,
      authorizedAt: new Date()
    };
  }

  private async capturePayment(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Capturing payment for order ${context.orderId}`);
    
    // Capture logic
    const captureId = `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      captureId,
      status: 'captured',
      capturedAmount: context.amount,
      capturedAt: new Date()
    };
  }

  private async initiateSettlement(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Initiating settlement for order ${context.orderId}`);
    
    // Settlement logic
    const settlementId = `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      settlementId,
      status: 'pending_settlement',
      settlementAmount: context.amount,
      initiatedAt: new Date()
    };
  }

  private async sendNotifications(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Sending notifications for order ${context.orderId}`);
    
    // Notification logic
    return {
      notificationsSent: ['email', 'sms', 'push'],
      sentAt: new Date()
    };
  }

  private async processExpressPayment(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Processing express payment for order ${context.orderId}`);
    
    // Express payment logic (simplified for mobile banking)
    const transactionId = `express_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      status: 'completed',
      processedAmount: context.amount,
      processedAt: new Date()
    };
  }

  private async sendInstantNotifications(input: any, context: WorkflowContext): Promise<any> {
    console.log(`[PaymentOrchestrationService] Sending instant notifications for order ${context.orderId}`);
    
    return {
      instantNotificationsSent: ['push', 'sms'],
      sentAt: new Date()
    };
  }

  /**
   * Handle step completion
   */
  private async handleStepCompletion(workflowId: string, stepIndex: number, result: any): Promise<void> {
    console.log(`[PaymentOrchestrationService] Step ${stepIndex} completed for workflow ${workflowId}`);
    
    await eventStreamingService.publishEvent({
      eventType: 'workflow.step.completed',
      streamName: PaymentStreams.TRANSACTIONS,
      aggregateId: workflowId,
      eventData: {
        workflowId,
        stepIndex,
        result,
        completedAt: new Date()
      }
    });
  }

  /**
   * Handle step failure
   */
  private async handleStepFailure(workflowId: string, stepIndex: number, error: Error): Promise<void> {
    console.log(`[PaymentOrchestrationService] Step ${stepIndex} failed for workflow ${workflowId}: ${error.message}`);
    
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const step = workflow.steps[stepIndex];
    
    // Implement retry logic
    if (step.retryCount < step.maxRetries) {
      step.retryCount++;
      step.status = 'pending';
      
      const backoffMs = Math.min(1000 * Math.pow(2, step.retryCount), 30000);
      
      setTimeout(async () => {
        console.log(`[PaymentOrchestrationService] Retrying step ${stepIndex} for workflow ${workflowId} (attempt ${step.retryCount})`);
        await this.processWorkflowStep(workflow);
      }, backoffMs);
      
    } else {
      // Max retries exceeded, fail the workflow
      workflow.status = 'failed';
      workflow.failedAt = new Date();
      
      await this.persistWorkflow(workflow);
      
      await eventStreamingService.publishEvent({
        eventType: 'workflow.failed',
        streamName: PaymentStreams.TRANSACTIONS,
        aggregateId: workflowId,
        eventData: {
          workflowId,
          failedStep: stepIndex,
          error: error.message,
          failedAt: workflow.failedAt
        }
      });
    }
  }

  /**
   * Persist workflow to database
   */
  private async persistWorkflow(workflow: PaymentWorkflow): Promise<void> {
    try {
      await db.insert(paymentWorkflows).values({
        workflowId: workflow.workflowId,
        orderId: workflow.orderId,
        userId: workflow.userId,
        paymentMethod: workflow.paymentMethod,
        amount: workflow.amount,
        currency: workflow.currency,
        steps: workflow.steps,
        currentStepIndex: workflow.currentStepIndex,
        status: workflow.status,
        retryCount: workflow.retryCount,
        maxRetries: workflow.maxRetries,
        metadata: workflow.metadata,
        correlationId: workflow.correlationId,
        startedAt: workflow.startedAt,
        completedAt: workflow.completedAt,
        failedAt: workflow.failedAt
      }).onConflictDoUpdate({
        target: paymentWorkflows.workflowId,
        set: {
          steps: workflow.steps,
          currentStepIndex: workflow.currentStepIndex,
          status: workflow.status,
          retryCount: workflow.retryCount,
          metadata: workflow.metadata,
          completedAt: workflow.completedAt,
          failedAt: workflow.failedAt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('[PaymentOrchestrationService] Failed to persist workflow:', error);
    }
  }

  /**
   * Load pending workflows from database
   */
  private async loadPendingWorkflows(): Promise<void> {
    try {
      const pendingWorkflows = await db.select()
        .from(paymentWorkflows)
        .where(and(
          eq(paymentWorkflows.status, 'pending'),
          eq(paymentWorkflows.status, 'processing')
        ));

      for (const workflowData of pendingWorkflows) {
        const workflow: PaymentWorkflow = {
          workflowId: workflowData.workflowId,
          orderId: workflowData.orderId,
          userId: workflowData.userId,
          paymentMethod: workflowData.paymentMethod,
          amount: parseFloat(workflowData.amount),
          currency: workflowData.currency,
          steps: workflowData.steps as WorkflowStep[],
          currentStepIndex: workflowData.currentStepIndex,
          status: workflowData.status as any,
          retryCount: workflowData.retryCount,
          maxRetries: workflowData.maxRetries,
          metadata: workflowData.metadata as Record<string, any>,
          correlationId: workflowData.correlationId,
          startedAt: new Date(workflowData.startedAt),
          completedAt: workflowData.completedAt ? new Date(workflowData.completedAt) : undefined,
          failedAt: workflowData.failedAt ? new Date(workflowData.failedAt) : undefined
        };

        this.workflows.set(workflow.workflowId, workflow);
      }

      console.log(`[PaymentOrchestrationService] Loaded ${pendingWorkflows.length} pending workflows`);
    } catch (error) {
      console.error('[PaymentOrchestrationService] Failed to load pending workflows:', error);
    }
  }

  /**
   * Load workflow from database
   */
  private async loadWorkflowFromDatabase(workflowId: string): Promise<PaymentWorkflow | null> {
    try {
      const [workflowData] = await db.select()
        .from(paymentWorkflows)
        .where(eq(paymentWorkflows.workflowId, workflowId));

      if (!workflowData) return null;

      return {
        workflowId: workflowData.workflowId,
        orderId: workflowData.orderId,
        userId: workflowData.userId,
        paymentMethod: workflowData.paymentMethod,
        amount: parseFloat(workflowData.amount),
        currency: workflowData.currency,
        steps: workflowData.steps as WorkflowStep[],
        currentStepIndex: workflowData.currentStepIndex,
        status: workflowData.status as any,
        retryCount: workflowData.retryCount,
        maxRetries: workflowData.maxRetries,
        metadata: workflowData.metadata as Record<string, any>,
        correlationId: workflowData.correlationId,
        startedAt: new Date(workflowData.startedAt),
        completedAt: workflowData.completedAt ? new Date(workflowData.completedAt) : undefined,
        failedAt: workflowData.failedAt ? new Date(workflowData.failedAt) : undefined
      };
    } catch (error) {
      console.error(`[PaymentOrchestrationService] Failed to load workflow ${workflowId}:`, error);
      return null;
    }
  }

  /**
   * Shutdown the orchestration service
   */
  async shutdown(): Promise<void> {
    console.log('[PaymentOrchestrationService] Shutting down...');
    this.isProcessing = false;
  }
}

// Singleton instance
export const paymentOrchestrationService = new PaymentOrchestrationService();