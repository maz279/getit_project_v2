export interface ProcessingMetrics {
  averageProcessingTime: number;
  totalProcessedOrders: number;
  processingEfficiency: number;
  errorRate: number;
}

export interface OperationalKPIs {
  fulfillmentRate: number;
  customerSatisfaction: number;
  returnRate: number;
  averageResponseTime: number;
}

export interface QualityMetrics {
  qualityScore: number;
  defectRate: number;
  complianceRate: number;
  accuracyRate: number;
}

export interface TrendData {
  month: string;
  value: number;
  change: number;
}

export interface BenchmarkData {
  metric: string;
  current: number;
  target: number;
  benchmark: number;
  status: 'above' | 'below' | 'at';
}

export interface PerformanceMetricsData {
  processingMetrics: ProcessingMetrics;
  operationalKPIs: OperationalKPIs;
  qualityMetrics: QualityMetrics;
  trends: TrendData[];
  benchmarks: BenchmarkData[];
}

export const mockPerformanceMetricsData: PerformanceMetricsData = {
  processingMetrics: {
    averageProcessingTime: 2.3,
    totalProcessedOrders: 12847,
    processingEfficiency: 94.2,
    errorRate: 0.8
  },
  operationalKPIs: {
    fulfillmentRate: 97.8,
    customerSatisfaction: 4.6,
    returnRate: 3.2,
    averageResponseTime: 1.4
  },
  qualityMetrics: {
    qualityScore: 96.5,
    defectRate: 0.9,
    complianceRate: 98.7,
    accuracyRate: 99.2
  },
  trends: [
    { month: 'Jan', value: 92.5, change: 2.1 },
    { month: 'Feb', value: 93.8, change: 1.4 },
    { month: 'Mar', value: 94.2, change: 0.4 },
    { month: 'Apr', value: 95.1, change: 0.9 },
    { month: 'May', value: 94.8, change: -0.3 },
    { month: 'Jun', value: 96.2, change: 1.5 }
  ],
  benchmarks: [
    { metric: 'Processing Time', current: 2.3, target: 2.0, benchmark: 2.5, status: 'above' },
    { metric: 'Efficiency', current: 94.2, target: 95.0, benchmark: 90.0, status: 'above' },
    { metric: 'Error Rate', current: 0.8, target: 0.5, benchmark: 1.0, status: 'below' },
    { metric: 'Customer Satisfaction', current: 4.6, target: 4.5, benchmark: 4.2, status: 'above' },
    { metric: 'Return Rate', current: 3.2, target: 3.0, benchmark: 4.0, status: 'below' }
  ]
};