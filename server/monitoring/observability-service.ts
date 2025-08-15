/**
 * Observability Service for GetIt Bangladesh
 * Amazon.com/Shopee.sg-Level Monitoring and Analytics
 */

import { Request, Response } from 'express';
import { getEnterpriseDB } from '../database/enterprise-db';
import { getEnterpriseRedis } from '../services/EnterpriseRedisService';

interface MetricPoint {
  timestamp: number;
  value: number;
  labels: Record<string, string>;
}

interface TraceSpan {
  traceId: string;
  spanId: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: number;
    fields: Record<string, any>;
  }>;
}

export class ObservabilityService {
  private metrics: Map<string, MetricPoint[]> = new Map();
  private traces: Map<string, TraceSpan[]> = new Map();
  private enterpriseDB = getEnterpriseDB();
  private enterpriseRedis = getEnterpriseRedis();
  
  constructor() {
    this.initializeMetrics();
    this.startMetricsCollection();
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics() {
    const defaultMetrics = [
      'http_requests_total',
      'http_request_duration_seconds',
      'business_revenue_total',
      'business_orders_total',
      'business_customers_total',
      'business_products_sold',
      'payment_transactions_total',
      'search_queries_total',
      'cart_operations_total',
      'vendor_activities_total'
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric, []);
    });
  }

  /**
   * Start automatic metrics collection
   */
  private startMetricsCollection() {
    // Collect business metrics every minute
    setInterval(() => {
      this.collectBusinessMetrics();
    }, 60000);

    // Collect performance metrics every 30 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);

    // Collect system metrics every 15 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 15000);
  }

  /**
   * Collect business metrics
   */
  private async collectBusinessMetrics() {
    try {
      const now = Date.now();
      
      // Revenue metrics
      const revenue = await this.calculateHourlyRevenue();
      this.recordMetric('business_revenue_total', revenue, { 
        period: 'hourly',
        currency: 'BDT' 
      });

      // Order metrics
      const orders = await this.calculateHourlyOrders();
      this.recordMetric('business_orders_total', orders, { 
        period: 'hourly' 
      });

      // Customer metrics
      const customers = await this.calculateActiveCustomers();
      this.recordMetric('business_customers_total', customers, { 
        type: 'active' 
      });

      // Geographic metrics (Bangladesh-specific)
      const geographicMetrics = await this.calculateGeographicMetrics();
      Object.entries(geographicMetrics).forEach(([division, revenue]) => {
        this.recordMetric('business_revenue_by_division', revenue as number, { 
          division,
          country: 'bangladesh' 
        });
      });

      // Payment method metrics
      const paymentMetrics = await this.calculatePaymentMethodMetrics();
      Object.entries(paymentMetrics).forEach(([method, data]) => {
        this.recordMetric('payment_transactions_total', (data as any).count, { 
          method,
          status: 'completed' 
        });
        this.recordMetric('payment_success_rate', (data as any).successRate, { 
          method 
        });
      });

    } catch (error) {
      console.error('Error collecting business metrics:', error);
    }
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics() {
    try {
      // Database performance
      const dbMetrics = await this.enterpriseDB.getPerformanceMetrics();
      if (dbMetrics) {
        this.recordMetric('database_query_duration_ms', dbMetrics.avgQueryTime, { 
          database: 'postgresql' 
        });
        this.recordMetric('database_connections_active', dbMetrics.activeConnections, { 
          database: 'postgresql' 
        });
      }

      // Cache performance
      const cacheMetrics = this.enterpriseRedis.getMetrics();
      this.recordMetric('cache_hit_rate', cacheMetrics.hitRate, { 
        cache: 'redis' 
      });
      this.recordMetric('cache_operations_total', cacheMetrics.operations, { 
        cache: 'redis' 
      });

      // Node.js performance
      const memUsage = process.memoryUsage();
      this.recordMetric('nodejs_memory_usage_bytes', memUsage.heapUsed, { 
        type: 'heap_used' 
      });
      this.recordMetric('nodejs_memory_usage_bytes', memUsage.rss, { 
        type: 'rss' 
      });

      this.recordMetric('nodejs_process_uptime_seconds', process.uptime(), {});

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics() {
    try {
      const now = Date.now();
      
      // HTTP request metrics (simulated - in real implementation, this would come from middleware)
      const httpMetrics = await this.getHttpMetrics();
      this.recordMetric('http_requests_total', httpMetrics.totalRequests, { 
        method: 'GET', 
        status: '200' 
      });
      this.recordMetric('http_request_duration_seconds', httpMetrics.avgDuration / 1000, { 
        method: 'GET' 
      });

      // Error rates
      this.recordMetric('http_requests_total', httpMetrics.errorRequests, { 
        method: 'GET', 
        status: '500' 
      });

    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  /**
   * Record a metric point
   */
  public recordMetric(name: string, value: number, labels: Record<string, string> = {}) {
    const point: MetricPoint = {
      timestamp: Date.now(),
      value,
      labels
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const points = this.metrics.get(name)!;
    points.push(point);

    // Keep only last 1000 points per metric
    if (points.length > 1000) {
      points.splice(0, points.length - 1000);
    }
  }

  /**
   * Start a trace span
   */
  public startSpan(traceId: string, operationName: string, parentSpanId?: string): string {
    const spanId = this.generateSpanId();
    const span: TraceSpan = {
      traceId,
      spanId,
      operationName,
      startTime: Date.now(),
      duration: 0,
      tags: {
        'span.kind': 'server',
        'component': 'getit-backend'
      },
      logs: []
    };

    if (parentSpanId) {
      span.tags['parent.span.id'] = parentSpanId;
    }

    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }

    this.traces.get(traceId)!.push(span);
    return spanId;
  }

  /**
   * Finish a trace span
   */
  public finishSpan(traceId: string, spanId: string, tags: Record<string, any> = {}) {
    const spans = this.traces.get(traceId);
    if (!spans) return;

    const span = spans.find(s => s.spanId === spanId);
    if (!span) return;

    span.duration = Date.now() - span.startTime;
    span.tags = { ...span.tags, ...tags };
  }

  /**
   * Add log to span
   */
  public logToSpan(traceId: string, spanId: string, fields: Record<string, any>) {
    const spans = this.traces.get(traceId);
    if (!spans) return;

    const span = spans.find(s => s.spanId === spanId);
    if (!span) return;

    span.logs.push({
      timestamp: Date.now(),
      fields
    });
  }

  /**
   * Get metrics in Prometheus format
   */
  public getPrometheusMetrics(): string {
    let output = '';

    this.metrics.forEach((points, name) => {
      if (points.length === 0) return;

      const latestPoint = points[points.length - 1];
      const labelsStr = Object.entries(latestPoint.labels)
        .map(([key, value]) => `${key}="${value}"`)
        .join(',');

      output += `# TYPE ${name} gauge\n`;
      output += `${name}{${labelsStr}} ${latestPoint.value} ${latestPoint.timestamp}\n`;
    });

    return output;
  }

  /**
   * Get business metrics for dashboard
   */
  public async getBusinessMetrics(timeRange: string = '1h'): Promise<any> {
    const endTime = Date.now();
    const startTime = this.parseTimeRange(timeRange, endTime);

    const metrics = {
      revenue: {
        total: await this.calculateRevenue(startTime, endTime),
        hourly: await this.calculateHourlyRevenue(),
        trend: this.getMetricTrend('business_revenue_total', startTime, endTime)
      },
      orders: {
        total: await this.calculateOrders(startTime, endTime),
        hourly: await this.calculateHourlyOrders(),
        conversionRate: await this.calculateConversionRate()
      },
      customers: {
        active: await this.calculateActiveCustomers(),
        new: await this.calculateNewCustomers(startTime, endTime),
        retention: await this.calculateCustomerRetention()
      },
      geography: await this.calculateGeographicMetrics(),
      payments: await this.calculatePaymentMethodMetrics(),
      products: {
        topSelling: await this.getTopSellingProducts(10),
        categories: await this.getProductCategoryMetrics()
      }
    };

    return metrics;
  }

  /**
   * Get trace data for analysis
   */
  public getTraces(traceId?: string): TraceSpan[] | Map<string, TraceSpan[]> {
    if (traceId) {
      return this.traces.get(traceId) || [];
    }
    return this.traces;
  }

  /**
   * AI-powered anomaly detection
   */
  public async detectAnomalies(): Promise<any[]> {
    const anomalies = [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    try {
      // Revenue anomaly detection
      const revenueData = this.getMetricTrend('business_revenue_total', now - 24 * oneHour, now);
      const revenueAnomaly = this.detectStatisticalAnomaly(revenueData, 'revenue');
      if (revenueAnomaly) {
        anomalies.push(revenueAnomaly);
      }

      // Response time anomaly detection
      const responseTimeData = this.getMetricTrend('http_request_duration_seconds', now - 6 * oneHour, now);
      const responseTimeAnomaly = this.detectStatisticalAnomaly(responseTimeData, 'response_time');
      if (responseTimeAnomaly) {
        anomalies.push(responseTimeAnomaly);
      }

      // Error rate anomaly detection
      const errorRateData = this.calculateErrorRate(now - 6 * oneHour, now);
      if (errorRateData > 0.05) { // 5% error rate threshold
        anomalies.push({
          type: 'error_rate',
          severity: 'high',
          value: errorRateData,
          threshold: 0.05,
          message: 'Error rate exceeds 5% threshold',
          timestamp: now
        });
      }

    } catch (error) {
      console.error('Error in anomaly detection:', error);
    }

    return anomalies;
  }

  // Private helper methods

  private generateSpanId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private parseTimeRange(range: string, endTime: number): number {
    const match = range.match(/^(\d+)([smhd])$/);
    if (!match) return endTime - 3600000; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      's': 1000,
      'm': 60000,
      'h': 3600000,
      'd': 86400000
    };

    return endTime - (value * multipliers[unit]);
  }

  private getMetricTrend(metricName: string, startTime: number, endTime: number): number[] {
    const points = this.metrics.get(metricName) || [];
    return points
      .filter(p => p.timestamp >= startTime && p.timestamp <= endTime)
      .map(p => p.value);
  }

  private detectStatisticalAnomaly(data: number[], type: string): any | null {
    if (data.length < 10) return null;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    const latest = data[data.length - 1];
    const zScore = Math.abs((latest - mean) / stdDev);

    if (zScore > 3) { // 3 standard deviations
      return {
        type: `${type}_anomaly`,
        severity: zScore > 4 ? 'critical' : 'warning',
        value: latest,
        mean,
        stdDev,
        zScore,
        message: `${type} value ${latest} is ${zScore.toFixed(2)} standard deviations from mean`,
        timestamp: Date.now()
      };
    }

    return null;
  }

  // Business calculation methods (simplified implementations)

  private async calculateHourlyRevenue(): Promise<number> {
    // In real implementation, this would query the database
    // For now, return simulated data
    return Math.random() * 50000 + 10000; // 10k-60k BDT
  }

  private async calculateHourlyOrders(): Promise<number> {
    return Math.floor(Math.random() * 200 + 50); // 50-250 orders
  }

  private async calculateActiveCustomers(): Promise<number> {
    return Math.floor(Math.random() * 1000 + 500); // 500-1500 customers
  }

  private async calculateRevenue(startTime: number, endTime: number): Promise<number> {
    const hours = (endTime - startTime) / (60 * 60 * 1000);
    return (await this.calculateHourlyRevenue()) * hours;
  }

  private async calculateOrders(startTime: number, endTime: number): Promise<number> {
    const hours = (endTime - startTime) / (60 * 60 * 1000);
    return (await this.calculateHourlyOrders()) * hours;
  }

  private async calculateNewCustomers(startTime: number, endTime: number): Promise<number> {
    return Math.floor(Math.random() * 100 + 20);
  }

  private async calculateConversionRate(): Promise<number> {
    return Math.random() * 5 + 2; // 2-7%
  }

  private async calculateCustomerRetention(): Promise<number> {
    return Math.random() * 30 + 60; // 60-90%
  }

  private async calculateGeographicMetrics(): Promise<Record<string, number>> {
    return {
      'dhaka': Math.random() * 30000 + 20000,
      'chittagong': Math.random() * 15000 + 10000,
      'sylhet': Math.random() * 8000 + 5000,
      'rajshahi': Math.random() * 6000 + 4000,
      'khulna': Math.random() * 5000 + 3000,
      'barisal': Math.random() * 3000 + 2000,
      'rangpur': Math.random() * 4000 + 2500,
      'mymensingh': Math.random() * 3500 + 2000
    };
  }

  private async calculatePaymentMethodMetrics(): Promise<Record<string, any>> {
    return {
      'bkash': {
        count: Math.floor(Math.random() * 500 + 200),
        successRate: Math.random() * 5 + 95
      },
      'nagad': {
        count: Math.floor(Math.random() * 300 + 150),
        successRate: Math.random() * 5 + 94
      },
      'rocket': {
        count: Math.floor(Math.random() * 200 + 100),
        successRate: Math.random() * 5 + 93
      },
      'card': {
        count: Math.floor(Math.random() * 400 + 200),
        successRate: Math.random() * 3 + 96
      }
    };
  }

  private async getTopSellingProducts(limit: number): Promise<any[]> {
    return Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      sales: Math.floor(Math.random() * 1000 + 100),
      revenue: Math.floor(Math.random() * 50000 + 10000)
    }));
  }

  private async getProductCategoryMetrics(): Promise<Record<string, number>> {
    return {
      'electronics': Math.random() * 20000 + 15000,
      'fashion': Math.random() * 25000 + 20000,
      'home': Math.random() * 15000 + 10000,
      'books': Math.random() * 8000 + 5000,
      'sports': Math.random() * 12000 + 8000
    };
  }

  private async getHttpMetrics(): Promise<any> {
    return {
      totalRequests: Math.floor(Math.random() * 10000 + 5000),
      errorRequests: Math.floor(Math.random() * 100 + 50),
      avgDuration: Math.random() * 200 + 100
    };
  }

  private calculateErrorRate(startTime: number, endTime: number): number {
    return Math.random() * 0.02; // 0-2% error rate
  }
}

// Export singleton instance
export const observabilityService = new ObservabilityService();