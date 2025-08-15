import { EventEmitter } from 'events';
import { logger, PerformanceMonitor } from './LoggingService';

export interface ServiceDefinition {
  name: string;
  version: string;
  endpoint: string;
  healthCheck: string;
  dependencies: string[];
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    exponential: boolean;
  };
}

export interface ServiceEvent {
  type: string;
  serviceName: string;
  data: any;
  timestamp: Date;
  correlationId: string;
}

export interface WorkflowStep {
  serviceName: string;
  action: string;
  input: any;
  timeout?: number;
  retries?: number;
  condition?: (previousResults: any[]) => boolean;
}

export interface WorkflowDefinition {
  name: string;
  version: string;
  steps: WorkflowStep[];
  rollbackSteps?: WorkflowStep[];
  maxExecutionTime: number;
}

/**
 * Service Orchestrator for managing microservices coordination
 * Handles service discovery, workflow orchestration, and inter-service communication
 */
export class ServiceOrchestrator extends EventEmitter {
  private services: Map<string, ServiceDefinition> = new Map();
  private serviceHealth: Map<string, { status: 'healthy' | 'unhealthy'; lastCheck: Date }> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private activeExecutions: Map<string, any> = new Map();

  constructor() {
    super();
    this.setupHealthMonitoring();
    this.setupEventHandlers();
  }

  // Service Registration and Discovery
  registerService(service: ServiceDefinition): void {
    this.services.set(service.name, service);
    this.serviceHealth.set(service.name, {
      status: 'healthy',
      lastCheck: new Date()
    });

    logger.info(`Service registered: ${service.name}`, {
      serviceName: service.name,
      version: service.version,
      endpoint: service.endpoint
    });

    this.emit('serviceRegistered', service);
  }

  unregisterService(serviceName: string): void {
    this.services.delete(serviceName);
    this.serviceHealth.delete(serviceName);
    
    logger.info(`Service unregistered: ${serviceName}`, {
      serviceName
    });

    this.emit('serviceUnregistered', { serviceName });
  }

  getService(serviceName: string): ServiceDefinition | undefined {
    return this.services.get(serviceName);
  }

  getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  getHealthyServices(): ServiceDefinition[] {
    return Array.from(this.services.values()).filter(service => 
      this.serviceHealth.get(service.name)?.status === 'healthy'
    );
  }

  // Workflow Management
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.name, workflow);
    logger.info(`Workflow registered: ${workflow.name}`, {
      workflowName: workflow.name,
      version: workflow.version,
      steps: workflow.steps.length
    });
  }

  async executeWorkflow(workflowName: string, input: any, correlationId?: string): Promise<any> {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowName}`);
    }

    const executionId = correlationId || this.generateCorrelationId();
    const startTime = Date.now();

    logger.info(`Starting workflow execution: ${workflowName}`, {
      workflowName,
      executionId
    });

    try {
      const result = await this.executeWorkflowSteps(workflow, input, executionId);
      
      const duration = Date.now() - startTime;
      logger.info(`Workflow completed: ${workflowName}`, {
        workflowName,
        executionId,
        duration
      });

      return result;
    } catch (error) {
      logger.error(`Workflow failed: ${workflowName}`, error as Error, {
        workflowName,
        executionId
      });

      // Execute rollback if defined
      if (workflow.rollbackSteps) {
        await this.executeRollback(workflow, executionId);
      }

      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  private async executeWorkflowSteps(workflow: WorkflowDefinition, input: any, executionId: string): Promise<any> {
    const results: any[] = [];
    let currentInput = input;

    this.activeExecutions.set(executionId, {
      workflow: workflow.name,
      startTime: new Date(),
      currentStep: 0,
      results
    });

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      // Check condition if specified
      if (step.condition && !step.condition(results)) {
        logger.info(`Skipping step due to condition: ${step.action}`, {
          workflowName: workflow.name,
          executionId,
          stepIndex: i
        });
        continue;
      }

      // Update execution state
      this.activeExecutions.get(executionId)!.currentStep = i;

      try {
        const stepResult = await this.executeStep(step, currentInput, executionId);
        results.push(stepResult);
        currentInput = stepResult; // Use previous result as input for next step
      } catch (error) {
        logger.error(`Step failed: ${step.action}`, error as Error, {
          workflowName: workflow.name,
          executionId,
          stepIndex: i
        });
        throw error;
      }
    }

    return results[results.length - 1]; // Return final result
  }

  private async executeStep(step: WorkflowStep, input: any, correlationId: string): Promise<any> {
    const service = this.getService(step.serviceName);
    if (!service) {
      throw new Error(`Service not found: ${step.serviceName}`);
    }

    const health = this.serviceHealth.get(step.serviceName);
    if (health?.status !== 'healthy') {
      throw new Error(`Service unhealthy: ${step.serviceName}`);
    }

    const maxRetries = step.retries || service.retryPolicy.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        const backoffMs = service.retryPolicy.exponential 
          ? service.retryPolicy.backoffMs * Math.pow(2, attempt - 1)
          : service.retryPolicy.backoffMs;
        
        await this.delay(backoffMs);
        
        logger.warn(`Retrying step: ${step.action}`, {
          serviceName: step.serviceName,
          attempt,
          correlationId
        });
      }

      try {
        return await this.callService(service, step.action, input, correlationId);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  private async executeRollback(workflow: WorkflowDefinition, executionId: string): Promise<void> {
    if (!workflow.rollbackSteps) return;

    logger.info(`Starting rollback for workflow: ${workflow.name}`, {
      workflowName: workflow.name,
      executionId
    });

    for (const step of workflow.rollbackSteps.reverse()) {
      try {
        await this.executeStep(step, {}, executionId);
      } catch (error) {
        logger.error(`Rollback step failed: ${step.action}`, error as Error, {
          workflowName: workflow.name,
          executionId
        });
        // Continue with remaining rollback steps even if one fails
      }
    }
  }

  // Service Communication
  private async callService(service: ServiceDefinition, action: string, data: any, correlationId: string): Promise<any> {
    const url = `${service.endpoint}/${action}`;
    const timeout = service.timeout;

    logger.debug(`Calling service: ${service.name}/${action}`, {
      serviceName: service.name,
      action,
      correlationId,
      url
    });

    const startTime = Date.now();

    try {
      // In a real implementation, this would make HTTP calls to microservices
      // For now, we'll simulate the call
      const response = await this.simulateServiceCall(service, action, data, correlationId);
      
      const duration = Date.now() - startTime;
      
      logger.info(`Service call completed: ${service.name}/${action}`, {
        serviceName: service.name,
        action,
        correlationId,
        duration
      });

      return response;
    } catch (error) {
      logger.error(`Service call failed: ${service.name}/${action}`, error as Error, {
        serviceName: service.name,
        action,
        correlationId
      });
      throw error;
    }
  }

  private async simulateServiceCall(service: ServiceDefinition, action: string, data: any, correlationId: string): Promise<any> {
    // Simulate network delay
    await this.delay(Math.random() * 100 + 50);

    // Simulate different responses based on service and action
    const responses = {
      'user-service': {
        'authenticate': { userId: '12345', token: 'fake-jwt-token' },
        'getProfile': { id: '12345', name: 'John Doe', email: 'john@example.com' }
      },
      'product-service': {
        'getProduct': { id: data.productId, name: 'Sample Product', price: 99.99 },
        'updateInventory': { success: true, newQuantity: 95 }
      },
      'order-service': {
        'createOrder': { orderId: 'ORD-12345', status: 'created' },
        'updateStatus': { orderId: data.orderId, status: data.status }
      },
      'payment-service': {
        'processPayment': { transactionId: 'TXN-12345', status: 'completed' },
        'refund': { refundId: 'REF-12345', status: 'processed' }
      }
    };

    const serviceResponses = responses[service.name as keyof typeof responses] as any;
    return serviceResponses?.[action] || { success: true, data };
  }

  // Event-Driven Communication
  publishEvent(event: Omit<ServiceEvent, 'timestamp' | 'correlationId'>): void {
    const fullEvent: ServiceEvent = {
      ...event,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId()
    };

    logger.info(`Publishing event: ${event.type}`, {
      eventType: event.type,
      serviceName: event.serviceName,
      correlationId: fullEvent.correlationId
    });

    this.emit('serviceEvent', fullEvent);
  }

  subscribeToEvents(eventType: string, handler: (event: ServiceEvent) => void): void {
    this.on('serviceEvent', (event: ServiceEvent) => {
      if (event.type === eventType) {
        handler(event);
      }
    });
  }

  // Health Monitoring
  private setupHealthMonitoring(): void {
    setInterval(async () => {
      await this.checkServicesHealth();
    }, 30000); // Check every 30 seconds
  }

  private async checkServicesHealth(): Promise<void> {
    for (const [serviceName, service] of this.services) {
      try {
        // In production, this would make actual health check calls
        const isHealthy = await this.performHealthCheck(service);
        
        const currentHealth = this.serviceHealth.get(serviceName);
        const newStatus = isHealthy ? 'healthy' : 'unhealthy';
        
        this.serviceHealth.set(serviceName, {
          status: newStatus,
          lastCheck: new Date()
        });

        if (currentHealth?.status !== newStatus) {
          logger.info(`Service health changed: ${serviceName}`, {
            serviceName,
            oldStatus: currentHealth?.status,
            newStatus
          });

          this.emit('healthChanged', {
            serviceName,
            status: newStatus,
            previousStatus: currentHealth?.status
          });
        }
      } catch (error) {
        logger.error(`Health check failed for service: ${serviceName}`, error as Error);
      }
    }
  }

  private async performHealthCheck(service: ServiceDefinition): Promise<boolean> {
    // Simulate health check - in production, this would make HTTP requests
    await this.delay(Math.random() * 50);
    return Math.random() > 0.1; // 90% uptime simulation
  }

  private setupEventHandlers(): void {
    this.on('serviceEvent', (event: ServiceEvent) => {
      // Log all events for monitoring
      logger.info(`Service event received: ${event.type}`, {
        eventType: event.type,
        serviceName: event.serviceName,
        correlationId: event.correlationId
      });
    });

    this.on('healthChanged', (data: any) => {
      if (data.status === 'unhealthy') {
        logger.warn(`Service became unhealthy: ${data.serviceName}`, {
          serviceName: data.serviceName
        });
        // Trigger alerts, notifications, etc.
      }
    });
  }

  // Utility Methods
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Monitoring and Metrics
  getActiveExecutions(): any[] {
    return Array.from(this.activeExecutions.entries()).map(([id, execution]) => ({
      executionId: id,
      ...execution
    }));
  }

  getServiceHealth(): Record<string, any> {
    const health: Record<string, any> = {};
    
    for (const [serviceName, status] of this.serviceHealth) {
      health[serviceName] = status;
    }
    
    return health;
  }

  getWorkflowMetrics(): any {
    // In production, this would return actual metrics from a metrics store
    return {
      totalWorkflows: this.workflows.size,
      activeExecutions: this.activeExecutions.size,
      registeredServices: this.services.size,
      healthyServices: this.getHealthyServices().length
    };
  }
}

// Pre-defined workflows for GetIt platform
export const getItWorkflows: WorkflowDefinition[] = [
  {
    name: 'create-order',
    version: '1.0.0',
    maxExecutionTime: 30000,
    steps: [
      {
        serviceName: 'user-service',
        action: 'authenticate',
        input: {}
      },
      {
        serviceName: 'product-service',
        action: 'checkInventory',
        input: {}
      },
      {
        serviceName: 'order-service',
        action: 'createOrder',
        input: {}
      },
      {
        serviceName: 'payment-service',
        action: 'processPayment',
        input: {}
      },
      {
        serviceName: 'notification-service',
        action: 'sendOrderConfirmation',
        input: {}
      }
    ],
    rollbackSteps: [
      {
        serviceName: 'order-service',
        action: 'cancelOrder',
        input: {}
      },
      {
        serviceName: 'product-service',
        action: 'restoreInventory',
        input: {}
      }
    ]
  },
  {
    name: 'vendor-onboarding',
    version: '1.0.0',
    maxExecutionTime: 60000,
    steps: [
      {
        serviceName: 'user-service',
        action: 'createVendorAccount',
        input: {}
      },
      {
        serviceName: 'verification-service',
        action: 'verifyDocuments',
        input: {}
      },
      {
        serviceName: 'payment-service',
        action: 'setupPayoutAccount',
        input: {}
      },
      {
        serviceName: 'catalog-service',
        action: 'createVendorCatalog',
        input: {}
      },
      {
        serviceName: 'notification-service',
        action: 'sendWelcomeEmail',
        input: {}
      }
    ]
  }
];

// Global orchestrator instance
export const serviceOrchestrator = new ServiceOrchestrator();

// Register default workflows
getItWorkflows.forEach(workflow => {
  serviceOrchestrator.registerWorkflow(workflow);
});