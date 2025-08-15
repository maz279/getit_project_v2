/**
 * Service Metrics - Performance Monitoring
 * Phase 2: Service Consolidation Implementation
 */

export interface ServiceMetrics {
  serviceName: string;
  requestCount: number;
  errorCount: number;
  successCount: number;
  averageResponseTime: number;
  uptime: number;
  operationMetrics: Map<string, OperationMetrics>;
}

export interface OperationMetrics {
  name: string;
  requestCount: number;
  errorCount: number;
  successCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

export class ServiceMetrics {
  private serviceName: string;
  private startTime: Date;
  private operationMetrics: Map<string, OperationMetrics>;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.startTime = new Date();
    this.operationMetrics = new Map();
  }

  initialize(): void {
    // Initialize metrics collection
  }

  incrementRequestCount(operation: string): void {
    const metrics = this.getOrCreateOperationMetrics(operation);
    metrics.requestCount++;
  }

  incrementErrorCount(operation: string): void {
    const metrics = this.getOrCreateOperationMetrics(operation);
    metrics.errorCount++;
  }

  incrementSuccessCount(operation: string): void {
    const metrics = this.getOrCreateOperationMetrics(operation);
    metrics.successCount++;
  }

  recordResponseTime(operation: string, responseTime: number): void {
    const metrics = this.getOrCreateOperationMetrics(operation);
    metrics.totalResponseTime += responseTime;
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.requestCount;
    metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
  }

  getMetrics(): ServiceMetrics {
    const totalRequests = Array.from(this.operationMetrics.values())
      .reduce((sum, metrics) => sum + metrics.requestCount, 0);
    
    const totalErrors = Array.from(this.operationMetrics.values())
      .reduce((sum, metrics) => sum + metrics.errorCount, 0);
    
    const totalSuccess = Array.from(this.operationMetrics.values())
      .reduce((sum, metrics) => sum + metrics.successCount, 0);
    
    const totalResponseTime = Array.from(this.operationMetrics.values())
      .reduce((sum, metrics) => sum + metrics.totalResponseTime, 0);

    return {
      serviceName: this.serviceName,
      requestCount: totalRequests,
      errorCount: totalErrors,
      successCount: totalSuccess,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      uptime: Date.now() - this.startTime.getTime(),
      operationMetrics: this.operationMetrics
    };
  }

  private getOrCreateOperationMetrics(operation: string): OperationMetrics {
    if (!this.operationMetrics.has(operation)) {
      this.operationMetrics.set(operation, {
        name: operation,
        requestCount: 0,
        errorCount: 0,
        successCount: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0
      });
    }
    return this.operationMetrics.get(operation)!;
  }

  async shutdown(): Promise<void> {
    // Save metrics before shutdown
  }
}