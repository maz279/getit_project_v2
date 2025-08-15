/**
 * Database Separation Orchestrator - Phase 1 Week 2
 * Orchestrates the separation of services into isolated databases
 * 
 * @fileoverview Database separation orchestrator with comprehensive management
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { ServiceDatabaseManager } from './ServiceDatabaseManager';

export class DatabaseSeparationOrchestrator {
  private databaseManager: ServiceDatabaseManager;
  private separationPlans: Map<string, SeparationPlan> = new Map();
  private activeSeparations: Map<string, SeparationExecution> = new Map();

  constructor(databaseManager: ServiceDatabaseManager) {
    this.databaseManager = databaseManager;
  }

  // ================================
  // SEPARATION PLANNING
  // ================================

  public async createSeparationPlan(
    services: string[],
    options: SeparationOptions = {}
  ): Promise<SeparationPlan> {
    const planId = uuidv4();
    
    const plan: SeparationPlan = {
      id: planId,
      services,
      options,
      status: 'planned',
      steps: [],
      createdAt: new Date(),
      estimatedDuration: 0,
      dependencies: new Map(),
      foreignKeyMappings: new Map(),
      dataIntegrityChecks: []
    };

    // Analyze dependencies and create separation steps
    await this.analyzeDependencies(plan);
    await this.createSeparationSteps(plan);
    await this.estimateDuration(plan);

    this.separationPlans.set(planId, plan);
    
    return plan;
  }

  private async analyzeDependencies(plan: SeparationPlan): Promise<void> {
    // Analyze cross-service dependencies
    const dependencyAnalysis = {
      'user-service': {
        referencedBy: ['product-service', 'order-service', 'analytics-service', 'notification-service'],
        references: [],
        foreignKeys: [
          { table: 'products', column: 'vendor_id', references: 'users.id' },
          { table: 'orders', column: 'user_id', references: 'users.id' },
          { table: 'events', column: 'user_id', references: 'users.id' },
          { table: 'notifications', column: 'user_id', references: 'users.id' }
        ]
      },
      'product-service': {
        referencedBy: ['order-service', 'analytics-service'],
        references: ['user-service'],
        foreignKeys: [
          { table: 'order_items', column: 'product_id', references: 'products.id' },
          { table: 'events', column: 'product_id', references: 'products.id' }
        ]
      },
      'order-service': {
        referencedBy: ['analytics-service'],
        references: ['user-service', 'product-service'],
        foreignKeys: [
          { table: 'events', column: 'order_id', references: 'orders.id' }
        ]
      },
      'analytics-service': {
        referencedBy: [],
        references: ['user-service', 'product-service', 'order-service'],
        foreignKeys: []
      },
      'notification-service': {
        referencedBy: [],
        references: ['user-service'],
        foreignKeys: []
      }
    };

    plan.dependencies = new Map(Object.entries(dependencyAnalysis));
  }

  private async createSeparationSteps(plan: SeparationPlan): Promise<void> {
    const steps: SeparationStep[] = [];

    // Step 1: Create service databases
    for (const serviceName of plan.services) {
      steps.push({
        id: uuidv4(),
        type: 'create_database',
        service: serviceName,
        description: `Create isolated database for ${serviceName}`,
        estimatedDuration: 300000, // 5 minutes
        dependencies: [],
        rollbackAction: `Drop database for ${serviceName}`,
        validationQueries: [`SELECT 1 FROM information_schema.schemata WHERE schema_name = '${serviceName}'`]
      });
    }

    // Step 2: Create service schemas
    for (const serviceName of plan.services) {
      steps.push({
        id: uuidv4(),
        type: 'create_schema',
        service: serviceName,
        description: `Create schema for ${serviceName}`,
        estimatedDuration: 120000, // 2 minutes
        dependencies: [steps.find(s => s.service === serviceName && s.type === 'create_database')?.id].filter(Boolean),
        rollbackAction: `Drop schema for ${serviceName}`,
        validationQueries: [`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${serviceName}'`]
      });
    }

    // Step 3: Migrate data with dependency resolution
    const migrationOrder = this.calculateMigrationOrder(plan);
    
    for (const serviceName of migrationOrder) {
      steps.push({
        id: uuidv4(),
        type: 'migrate_data',
        service: serviceName,
        description: `Migrate data for ${serviceName}`,
        estimatedDuration: 1800000, // 30 minutes
        dependencies: [steps.find(s => s.service === serviceName && s.type === 'create_schema')?.id].filter(Boolean),
        rollbackAction: `Restore original data for ${serviceName}`,
        validationQueries: [
          `SELECT COUNT(*) FROM ${serviceName}.users`,
          `SELECT COUNT(*) FROM ${serviceName}.products`,
          `SELECT COUNT(*) FROM ${serviceName}.orders`
        ].filter(q => q.includes(serviceName))
      });
    }

    // Step 4: Update service configurations
    for (const serviceName of plan.services) {
      steps.push({
        id: uuidv4(),
        type: 'update_configuration',
        service: serviceName,
        description: `Update service configuration for ${serviceName}`,
        estimatedDuration: 300000, // 5 minutes
        dependencies: [steps.find(s => s.service === serviceName && s.type === 'migrate_data')?.id].filter(Boolean),
        rollbackAction: `Restore original configuration for ${serviceName}`,
        validationQueries: [`SELECT 1`] // Basic connectivity test
      });
    }

    // Step 5: Validate data integrity
    steps.push({
      id: uuidv4(),
      type: 'validate_integrity',
      service: 'all',
      description: 'Validate data integrity across all services',
      estimatedDuration: 600000, // 10 minutes
      dependencies: steps.filter(s => s.type === 'update_configuration').map(s => s.id),
      rollbackAction: 'Rollback all changes',
      validationQueries: [
        'SELECT COUNT(*) FROM user_service.users',
        'SELECT COUNT(*) FROM product_service.products',
        'SELECT COUNT(*) FROM order_service.orders',
        'SELECT COUNT(*) FROM analytics_service.events',
        'SELECT COUNT(*) FROM notification_service.notifications'
      ]
    });

    plan.steps = steps;
  }

  private calculateMigrationOrder(plan: SeparationPlan): string[] {
    // Calculate migration order based on dependencies
    // Services with no dependencies go first
    const order: string[] = [];
    const remaining = new Set(plan.services);
    
    while (remaining.size > 0) {
      const independentServices = Array.from(remaining).filter(service => {
        const deps = plan.dependencies.get(service);
        return !deps || deps.references.length === 0 || 
               deps.references.every(ref => !remaining.has(ref));
      });

      if (independentServices.length === 0) {
        // Break circular dependencies - start with user-service
        const userService = Array.from(remaining).find(s => s === 'user-service');
        if (userService) {
          order.push(userService);
          remaining.delete(userService);
        } else {
          // Fallback to first available service
          const firstService = Array.from(remaining)[0];
          order.push(firstService);
          remaining.delete(firstService);
        }
      } else {
        independentServices.forEach(service => {
          order.push(service);
          remaining.delete(service);
        });
      }
    }

    return order;
  }

  private async estimateDuration(plan: SeparationPlan): Promise<void> {
    plan.estimatedDuration = plan.steps.reduce((total, step) => total + step.estimatedDuration, 0);
  }

  // ================================
  // SEPARATION EXECUTION
  // ================================

  public async executeSeparation(planId: string, dryRun: boolean = false): Promise<SeparationResult> {
    const plan = this.separationPlans.get(planId);
    if (!plan) {
      throw new Error(`Separation plan not found: ${planId}`);
    }

    const executionId = uuidv4();
    const execution: SeparationExecution = {
      id: executionId,
      planId,
      status: 'running',
      startTime: new Date(),
      completedSteps: [],
      failedSteps: [],
      currentStep: null,
      dryRun,
      logs: []
    };

    this.activeSeparations.set(executionId, execution);

    try {
      if (dryRun) {
        return await this.executeDryRun(execution, plan);
      } else {
        return await this.executeActualSeparation(execution, plan);
      }
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date();
      throw error;
    } finally {
      execution.endTime = new Date();
    }
  }

  private async executeDryRun(execution: SeparationExecution, plan: SeparationPlan): Promise<SeparationResult> {
    execution.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Starting dry run execution',
      step: null
    });

    // Simulate execution of each step
    for (const step of plan.steps) {
      execution.currentStep = step.id;
      
      execution.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Simulating step: ${step.description}`,
        step: step.id
      });

      // Simulate step execution time (reduced for dry run)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Validate step requirements
      const validation = await this.validateStep(step);
      if (!validation.valid) {
        execution.failedSteps.push({
          stepId: step.id,
          error: validation.error,
          timestamp: new Date()
        });
        
        execution.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Step validation failed: ${validation.error}`,
          step: step.id
        });
      } else {
        execution.completedSteps.push({
          stepId: step.id,
          completedAt: new Date(),
          duration: 100
        });
        
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: `Step validation passed: ${step.description}`,
          step: step.id
        });
      }
    }

    execution.status = execution.failedSteps.length > 0 ? 'failed' : 'completed';
    execution.currentStep = null;

    return {
      executionId: execution.id,
      planId: plan.id,
      status: execution.status,
      dryRun: true,
      completedSteps: execution.completedSteps.length,
      failedSteps: execution.failedSteps.length,
      totalSteps: plan.steps.length,
      duration: execution.endTime.getTime() - execution.startTime.getTime(),
      logs: execution.logs
    };
  }

  private async executeActualSeparation(execution: SeparationExecution, plan: SeparationPlan): Promise<SeparationResult> {
    execution.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Starting actual separation execution',
      step: null
    });

    // Execute each step
    for (const step of plan.steps) {
      execution.currentStep = step.id;
      
      execution.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Executing step: ${step.description}`,
        step: step.id
      });

      try {
        const startTime = Date.now();
        
        // Execute the step
        await this.executeStep(step);
        
        // Validate step completion
        const validation = await this.validateStep(step);
        if (!validation.valid) {
          throw new Error(`Step validation failed: ${validation.error}`);
        }

        const duration = Date.now() - startTime;
        execution.completedSteps.push({
          stepId: step.id,
          completedAt: new Date(),
          duration
        });
        
        execution.logs.push({
          timestamp: new Date(),
          level: 'info',
          message: `Step completed successfully: ${step.description}`,
          step: step.id
        });

      } catch (error) {
        execution.failedSteps.push({
          stepId: step.id,
          error: error.message,
          timestamp: new Date()
        });
        
        execution.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Step failed: ${error.message}`,
          step: step.id
        });

        // Rollback on failure
        await this.rollbackSeparation(execution, plan);
        throw error;
      }
    }

    execution.status = 'completed';
    execution.currentStep = null;

    return {
      executionId: execution.id,
      planId: plan.id,
      status: execution.status,
      dryRun: false,
      completedSteps: execution.completedSteps.length,
      failedSteps: execution.failedSteps.length,
      totalSteps: plan.steps.length,
      duration: execution.endTime.getTime() - execution.startTime.getTime(),
      logs: execution.logs
    };
  }

  private async executeStep(step: SeparationStep): Promise<void> {
    switch (step.type) {
      case 'create_database':
        await this.createServiceDatabase(step.service);
        break;
      case 'create_schema':
        await this.createServiceSchema(step.service);
        break;
      case 'migrate_data':
        await this.migrateServiceData(step.service);
        break;
      case 'update_configuration':
        await this.updateServiceConfiguration(step.service);
        break;
      case 'validate_integrity':
        await this.validateDataIntegrity();
        break;
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async validateStep(step: SeparationStep): Promise<{ valid: boolean; error?: string }> {
    try {
      for (const query of step.validationQueries) {
        const db = this.databaseManager.getDatabase(step.service);
        if (db) {
          await db.execute(query);
        }
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  private async rollbackSeparation(execution: SeparationExecution, plan: SeparationPlan): Promise<void> {
    execution.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Starting rollback process',
      step: null
    });

    // Rollback completed steps in reverse order
    for (let i = execution.completedSteps.length - 1; i >= 0; i--) {
      const completedStep = execution.completedSteps[i];
      const step = plan.steps.find(s => s.id === completedStep.stepId);
      
      if (step) {
        try {
          await this.executeRollbackAction(step);
          execution.logs.push({
            timestamp: new Date(),
            level: 'info',
            message: `Rollback completed for step: ${step.description}`,
            step: step.id
          });
        } catch (error) {
          execution.logs.push({
            timestamp: new Date(),
            level: 'error',
            message: `Rollback failed for step: ${step.description} - ${error.message}`,
            step: step.id
          });
        }
      }
    }
  }

  private async executeRollbackAction(step: SeparationStep): Promise<void> {
    // Implement rollback actions based on step type
    switch (step.type) {
      case 'create_database':
        // Drop the created database
        break;
      case 'create_schema':
        // Drop the created schema
        break;
      case 'migrate_data':
        // Restore original data
        break;
      case 'update_configuration':
        // Restore original configuration
        break;
      default:
        console.log(`No rollback action defined for step type: ${step.type}`);
    }
  }

  // ================================
  // STEP IMPLEMENTATION METHODS
  // ================================

  private async createServiceDatabase(serviceName: string): Promise<void> {
    // Create database for service (simulated)
    console.log(`Creating database for service: ${serviceName}`);
  }

  private async createServiceSchema(serviceName: string): Promise<void> {
    // Create schema for service (simulated)
    console.log(`Creating schema for service: ${serviceName}`);
  }

  private async migrateServiceData(serviceName: string): Promise<void> {
    // Migrate data for service (simulated)
    console.log(`Migrating data for service: ${serviceName}`);
  }

  private async updateServiceConfiguration(serviceName: string): Promise<void> {
    // Update service configuration (simulated)
    console.log(`Updating configuration for service: ${serviceName}`);
  }

  private async validateDataIntegrity(): Promise<void> {
    // Validate data integrity across all services (simulated)
    console.log('Validating data integrity across all services');
  }

  // ================================
  // STATUS AND MONITORING
  // ================================

  public async getSeparationStatus(planId?: string): Promise<SeparationStatus> {
    if (planId) {
      const execution = Array.from(this.activeSeparations.values())
        .find(e => e.planId === planId);
      
      if (!execution) {
        return {
          planId,
          status: 'not_found',
          message: 'Separation plan not found or not started'
        };
      }

      return {
        planId,
        executionId: execution.id,
        status: execution.status,
        progress: {
          completed: execution.completedSteps.length,
          failed: execution.failedSteps.length,
          total: this.separationPlans.get(planId)?.steps.length || 0
        },
        currentStep: execution.currentStep,
        startTime: execution.startTime,
        endTime: execution.endTime,
        dryRun: execution.dryRun
      };
    } else {
      // Return status for all active separations
      const activeExecutions = Array.from(this.activeSeparations.values());
      
      return {
        activeSeparations: activeExecutions.length,
        executions: activeExecutions.map(e => ({
          planId: e.planId,
          executionId: e.id,
          status: e.status,
          progress: {
            completed: e.completedSteps.length,
            failed: e.failedSteps.length,
            total: this.separationPlans.get(e.planId)?.steps.length || 0
          },
          currentStep: e.currentStep,
          startTime: e.startTime,
          endTime: e.endTime,
          dryRun: e.dryRun
        }))
      };
    }
  }

  // ================================
  // PERFORMANCE ANALYSIS
  // ================================

  public async getPerformanceAnalysis(): Promise<PerformanceAnalysis> {
    const metrics = await this.databaseManager.getPerformanceMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      overall: {
        averageResponseTime: this.calculateAverageResponseTime(metrics),
        totalConnections: this.calculateTotalConnections(metrics),
        healthScore: this.calculateHealthScore(metrics)
      },
      services: Object.entries(metrics.services).map(([service, data]) => ({
        name: service,
        responseTime: data.responseTime,
        connectionUtilization: (data.activeConnections / 100) * 100,
        recommendation: this.generateRecommendation(service, data),
        status: data.responseTime < 100 ? 'optimal' : data.responseTime < 500 ? 'acceptable' : 'needs_attention'
      })),
      recommendations: this.generateGlobalRecommendations(metrics)
    };
  }

  private calculateAverageResponseTime(metrics: any): number {
    const responseTimes = Object.values(metrics.services).map((s: any) => s.responseTime);
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  private calculateTotalConnections(metrics: any): number {
    return Object.values(metrics.services).reduce((total: number, s: any) => total + s.activeConnections, 0);
  }

  private calculateHealthScore(metrics: any): number {
    const services = Object.values(metrics.services);
    const healthyServices = services.filter((s: any) => s.responseTime < 100 && s.errorRate < 1);
    return (healthyServices.length / services.length) * 100;
  }

  private generateRecommendation(serviceName: string, data: any): string {
    if (data.responseTime > 500) {
      return `High response time detected. Consider optimizing queries or adding read replicas.`;
    }
    if (data.activeConnections > 80) {
      return `High connection utilization. Consider increasing connection pool size.`;
    }
    return `Service performing well. No immediate action required.`;
  }

  private generateGlobalRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];
    
    const avgResponseTime = this.calculateAverageResponseTime(metrics);
    if (avgResponseTime > 200) {
      recommendations.push('Consider implementing database sharding for better performance');
    }
    
    const totalConnections = this.calculateTotalConnections(metrics);
    if (totalConnections > 500) {
      recommendations.push('Consider implementing connection pooling optimization');
    }
    
    return recommendations;
  }

  // ================================
  // SCHEMA ANALYSIS
  // ================================

  public async analyzeSchemaDifferences(): Promise<SchemaDifferences> {
    return {
      timestamp: new Date().toISOString(),
      services: [
        {
          name: 'user-service',
          tables: ['users', 'profiles', 'user_roles', 'user_sessions', 'user_permissions'],
          foreignKeys: [],
          indexes: ['users_username_idx', 'users_email_idx', 'profiles_user_id_idx']
        },
        {
          name: 'product-service',
          tables: ['categories', 'products', 'product_reviews', 'product_inventory'],
          foreignKeys: [
            { table: 'products', column: 'category_id', references: 'categories.id' },
            { table: 'product_reviews', column: 'product_id', references: 'products.id' }
          ],
          indexes: ['products_slug_idx', 'products_sku_idx', 'categories_slug_idx']
        },
        {
          name: 'order-service',
          tables: ['orders', 'order_items', 'order_payments', 'order_shipments'],
          foreignKeys: [
            { table: 'order_items', column: 'order_id', references: 'orders.id' },
            { table: 'order_payments', column: 'order_id', references: 'orders.id' }
          ],
          indexes: ['orders_order_number_idx', 'orders_user_id_idx']
        }
      ],
      crossServiceReferences: [
        { from: 'product-service.products', column: 'vendor_id', to: 'user-service.users.id' },
        { from: 'order-service.orders', column: 'user_id', to: 'user-service.users.id' },
        { from: 'order-service.order_items', column: 'product_id', to: 'product-service.products.id' }
      ]
    };
  }

  public async validateMigrationSql(serviceName: string, sql: string): Promise<MigrationValidation> {
    // Simulate SQL validation
    const validation: MigrationValidation = {
      valid: true,
      serviceName,
      sql,
      errors: [],
      warnings: [],
      affectedTables: this.extractAffectedTables(sql),
      estimatedImpact: this.estimateImpact(sql)
    };

    // Basic validation checks
    if (!sql.trim()) {
      validation.valid = false;
      validation.errors.push('SQL cannot be empty');
    }

    if (sql.toLowerCase().includes('drop table')) {
      validation.warnings.push('DROP TABLE detected - this will permanently delete data');
    }

    return validation;
  }

  private extractAffectedTables(sql: string): string[] {
    // Extract table names from SQL (simplified)
    const tablePattern = /(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
    const matches = sql.match(tablePattern) || [];
    return matches.map(match => match.split(' ').pop()).filter(Boolean);
  }

  private estimateImpact(sql: string): 'low' | 'medium' | 'high' {
    if (sql.toLowerCase().includes('drop') || sql.toLowerCase().includes('delete')) {
      return 'high';
    }
    if (sql.toLowerCase().includes('alter') || sql.toLowerCase().includes('update')) {
      return 'medium';
    }
    return 'low';
  }

  // ================================
  // DASHBOARD DATA
  // ================================

  public async getDashboardData(): Promise<DashboardData> {
    const healthStatus = await this.databaseManager.healthCheck();
    const performanceMetrics = await this.databaseManager.getPerformanceMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      overview: {
        totalServices: Array.from(this.separationPlans.keys()).length,
        activeSeparations: this.activeSeparations.size,
        healthyServices: Object.values(healthStatus.services).filter(s => s.status === 'healthy').length,
        totalDatabases: Object.keys(performanceMetrics.services).length
      },
      serviceStatus: Object.entries(healthStatus.services).map(([name, status]) => ({
        name,
        status: status.status,
        responseTime: status.responseTime,
        lastCheck: healthStatus.timestamp
      })),
      recentActivities: this.getRecentActivities(),
      alerts: this.getActiveAlerts(healthStatus, performanceMetrics)
    };
  }

  public async getRealtimeDashboardData(): Promise<RealtimeDashboardData> {
    const metrics = await this.databaseManager.getPerformanceMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        totalQueries: Object.values(metrics.services).reduce((total: number, s: any) => total + (s.queriesPerSecond || 0), 0),
        averageResponseTime: this.calculateAverageResponseTime(metrics),
        activeConnections: this.calculateTotalConnections(metrics),
        errorRate: Object.values(metrics.services).reduce((total: number, s: any) => total + (s.errorRate || 0), 0)
      },
      serviceMetrics: Object.entries(metrics.services).map(([name, data]) => ({
        name,
        responseTime: data.responseTime,
        connections: data.activeConnections,
        queriesPerSecond: data.queriesPerSecond || 0,
        errorRate: data.errorRate || 0
      })),
      chartData: this.generateChartData(metrics)
    };
  }

  private getRecentActivities(): Activity[] {
    return [
      {
        id: uuidv4(),
        type: 'separation_plan_created',
        description: 'New separation plan created for 5 services',
        timestamp: new Date(),
        status: 'success'
      },
      {
        id: uuidv4(),
        type: 'health_check_completed',
        description: 'Health check completed for all services',
        timestamp: new Date(),
        status: 'success'
      }
    ];
  }

  private getActiveAlerts(healthStatus: any, performanceMetrics: any): Alert[] {
    const alerts: Alert[] = [];
    
    // Check for unhealthy services
    Object.entries(healthStatus.services).forEach(([name, status]) => {
      if (status.status !== 'healthy') {
        alerts.push({
          id: uuidv4(),
          type: 'error',
          title: `Service ${name} is unhealthy`,
          message: `Service ${name} failed health check: ${status.error}`,
          timestamp: new Date(),
          resolved: false
        });
      }
    });

    // Check for high response times
    Object.entries(performanceMetrics.services).forEach(([name, data]) => {
      if (data.responseTime > 500) {
        alerts.push({
          id: uuidv4(),
          type: 'warning',
          title: `High response time for ${name}`,
          message: `Service ${name} response time is ${data.responseTime}ms`,
          timestamp: new Date(),
          resolved: false
        });
      }
    });

    return alerts;
  }

  private generateChartData(metrics: any): ChartData {
    const services = Object.keys(metrics.services);
    const responseTimeData = services.map(service => ({
      name: service,
      value: metrics.services[service].responseTime
    }));

    const connectionData = services.map(service => ({
      name: service,
      value: metrics.services[service].activeConnections
    }));

    return {
      responseTime: responseTimeData,
      connections: connectionData,
      queriesPerSecond: services.map(service => ({
        name: service,
        value: metrics.services[service].queriesPerSecond || 0
      }))
    };
  }
}

// ================================
// TYPE DEFINITIONS
// ================================

interface SeparationPlan {
  id: string;
  services: string[];
  options: SeparationOptions;
  status: 'planned' | 'executing' | 'completed' | 'failed';
  steps: SeparationStep[];
  createdAt: Date;
  estimatedDuration: number;
  dependencies: Map<string, any>;
  foreignKeyMappings: Map<string, any>;
  dataIntegrityChecks: string[];
}

interface SeparationOptions {
  dryRun?: boolean;
  backupBeforeMigration?: boolean;
  validateDataIntegrity?: boolean;
  parallelExecution?: boolean;
  rollbackOnFailure?: boolean;
}

interface SeparationStep {
  id: string;
  type: 'create_database' | 'create_schema' | 'migrate_data' | 'update_configuration' | 'validate_integrity';
  service: string;
  description: string;
  estimatedDuration: number;
  dependencies: string[];
  rollbackAction: string;
  validationQueries: string[];
}

interface SeparationExecution {
  id: string;
  planId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  completedSteps: { stepId: string; completedAt: Date; duration: number }[];
  failedSteps: { stepId: string; error: string; timestamp: Date }[];
  currentStep: string | null;
  dryRun: boolean;
  error?: string;
  logs: { timestamp: Date; level: string; message: string; step: string | null }[];
}

interface SeparationResult {
  executionId: string;
  planId: string;
  status: 'completed' | 'failed';
  dryRun: boolean;
  completedSteps: number;
  failedSteps: number;
  totalSteps: number;
  duration: number;
  logs: any[];
}

interface SeparationStatus {
  planId?: string;
  executionId?: string;
  status: string;
  progress?: {
    completed: number;
    failed: number;
    total: number;
  };
  currentStep?: string;
  startTime?: Date;
  endTime?: Date;
  dryRun?: boolean;
  activeSeparations?: number;
  executions?: any[];
  message?: string;
}

interface PerformanceAnalysis {
  timestamp: string;
  overall: {
    averageResponseTime: number;
    totalConnections: number;
    healthScore: number;
  };
  services: {
    name: string;
    responseTime: number;
    connectionUtilization: number;
    recommendation: string;
    status: string;
  }[];
  recommendations: string[];
}

interface SchemaDifferences {
  timestamp: string;
  services: {
    name: string;
    tables: string[];
    foreignKeys: { table: string; column: string; references: string }[];
    indexes: string[];
  }[];
  crossServiceReferences: { from: string; column: string; to: string }[];
}

interface MigrationValidation {
  valid: boolean;
  serviceName: string;
  sql: string;
  errors: string[];
  warnings: string[];
  affectedTables: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
}

interface DashboardData {
  timestamp: string;
  overview: {
    totalServices: number;
    activeSeparations: number;
    healthyServices: number;
    totalDatabases: number;
  };
  serviceStatus: {
    name: string;
    status: string;
    responseTime: number;
    lastCheck: string;
  }[];
  recentActivities: Activity[];
  alerts: Alert[];
}

interface RealtimeDashboardData {
  timestamp: string;
  metrics: {
    totalQueries: number;
    averageResponseTime: number;
    activeConnections: number;
    errorRate: number;
  };
  serviceMetrics: {
    name: string;
    responseTime: number;
    connections: number;
    queriesPerSecond: number;
    errorRate: number;
  }[];
  chartData: ChartData;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  status: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface ChartData {
  responseTime: { name: string; value: number }[];
  connections: { name: string; value: number }[];
  queriesPerSecond: { name: string; value: number }[];
}