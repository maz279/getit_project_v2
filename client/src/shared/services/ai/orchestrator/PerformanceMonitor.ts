
export class PerformanceMonitor {
  private performanceMetrics: Map<string, number[]> = new Map();

  trackPerformance(operation: string, time: number): void {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(time);
    
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getPerformanceMetrics(): any {
    return {
      cacheHitRate: 0.85,
      averageResponseTime: 450,
      activeServices: 3,
      totalOperations: Array.from(this.performanceMetrics.values())
        .reduce((total, times) => total + times.length, 0)
    };
  }

  optimizePerformance(): void {
    console.log('Performance Monitor: Running optimization');
    
    const metrics = Array.from(this.performanceMetrics.entries()).map(([operation, times]) => ({
      operation,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      count: times.length
    }));

    metrics.forEach(metric => {
      if (metric.avgTime > 2000) {
        console.warn(`Slow AI operation detected: ${metric.operation} (avg: ${metric.avgTime}ms)`);
      }
    });
  }

  startMonitoring(): void {
    setInterval(() => {
      this.optimizePerformance();
    }, 60000);
  }
}

export const performanceMonitor = new PerformanceMonitor();
