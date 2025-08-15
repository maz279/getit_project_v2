
export interface VendorPerformanceMetric {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  businessName: string;
  category: string;
  joinDate: string;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  overallScore: number;
  kpiScores: {
    orderFulfillment: number;
    customerSatisfaction: number;
    qualityScore: number;
    deliveryPerformance: number;
    responseTime: number;
    returnRate: number;
    complianceScore: number;
  };
  monthlyMetrics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    customerRating: number;
    onTimeDelivery: number;
    defectRate: number;
    refundRate: number;
  };
  performanceTrends: {
    month: string;
    score: number;
    orders: number;
    revenue: number;
    satisfaction: number;
  }[];
  alerts: VendorAlert[];
  lastUpdated: string;
}

export interface VendorAlert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  category: 'performance' | 'compliance' | 'quality' | 'delivery' | 'customer';
  title: string;
  message: string;
  actionRequired: boolean;
  severity: 'high' | 'medium' | 'low';
  createdAt: string;
  resolvedAt?: string;
}

export interface PerformanceBenchmark {
  id: string;
  category: string;
  metric: string;
  industryAverage: number;
  topPerformers: number;
  minimumThreshold: number;
  unit: string;
  description: string;
}

export interface VendorScorecard {
  vendorId: string;
  period: string;
  categories: {
    orderManagement: {
      score: number;
      metrics: {
        fulfillmentRate: number;
        processingTime: number;
        accuracyRate: number;
        cancellationRate: number;
      };
    };
    customerService: {
      score: number;
      metrics: {
        responseTime: number;
        resolutionRate: number;
        satisfactionScore: number;
        communicationQuality: number;
      };
    };
    productQuality: {
      score: number;
      metrics: {
        defectRate: number;
        returnRate: number;
        qualityRating: number;
        complianceScore: number;
      };
    };
    logistics: {
      score: number;
      metrics: {
        onTimeDelivery: number;
        shippingAccuracy: number;
        packagingQuality: number;
        trackingUpdates: number;
      };
    };
    businessCompliance: {
      score: number;
      metrics: {
        documentCompliance: number;
        policyAdherence: number;
        legalCompliance: number;
        ethicalStandards: number;
      };
    };
  };
  recommendations: string[];
  improvementPlan: string[];
}

export interface PerformanceStats {
  totalVendors: number;
  activeVendors: number;
  excellentPerformers: number;
  underPerformers: number;
  averageScore: number;
  monthlyGrowth: number;
  alertsCount: number;
  complianceRate: number;
}
