
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target?: number;
  benchmark?: number;
  trend: number[];
}

export interface OrderProcessingMetrics {
  avgProcessingTime: number;
  pickingAccuracy: number;
  packingEfficiency: number;
  shippingSpeed: number;
  orderFulfillmentRate: number;
  onTimeDeliveryRate: number;
  customerSatisfactionScore: number;
  returnRate: number;
}

export interface OperationalKPIs {
  orderVelocity: number;
  warehouseUtilization: number;
  staffProductivity: number;
  costPerOrder: number;
  revenuePerOrder: number;
  profitMargin: number;
  inventoryTurnover: number;
  stockoutRate: number;
}

export interface QualityMetrics {
  orderAccuracy: number;
  damagedItemsRate: number;
  customerComplaintRate: number;
  qualityScore: number;
  defectRate: number;
  reworkRate: number;
  firstCallResolution: number;
  issueResolutionTime: number;
}

export interface ComplianceMetrics {
  regulatoryCompliance: number;
  safetyIncidents: number;
  auditScore: number;
  documentationAccuracy: number;
  policyAdherence: number;
  trainingCompletion: number;
  certificationStatus: number;
  riskScore: number;
}

export interface PerformanceTrend {
  date: string;
  processing: number;
  fulfillment: number;
  delivery: number;
  satisfaction: number;
  quality: number;
  compliance: number;
}

export interface BenchmarkComparison {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topPerformer: number;
  target: number;
  gap: number;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  manager: string;
  memberCount: number;
  avgProductivity: number;
  qualityScore: number;
  customerRating: number;
  ordersProcessed: number;
  errorRate: number;
  efficiency: number;
}

export interface AlertsNotifications {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

export interface PerformanceMetricsData {
  processingMetrics: OrderProcessingMetrics;
  operationalKPIs: OperationalKPIs;
  qualityMetrics: QualityMetrics;
  complianceMetrics: ComplianceMetrics;
  trends: PerformanceTrend[];
  benchmarks: BenchmarkComparison[];
  teamPerformance: TeamPerformance[];
  alerts: AlertsNotifications[];
}
