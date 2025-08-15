
export interface DeliveryPerformanceStats {
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  totalDeliveries: number;
  failedDeliveries: number;
  returnRate: number;
  costPerDelivery: number;
  revenueImpact: number;
}

export interface CourierPerformance {
  id: string;
  name: string;
  logo: string;
  onTimeRate: number;
  averageTime: number;
  totalDeliveries: number;
  customerRating: number;
  costPerDelivery: number;
  coverage: string[];
  strengths: string[];
  weaknesses: string[];
  status: 'active' | 'inactive' | 'suspended';
}

export interface RegionalPerformance {
  region: string;
  district: string;
  onTimeRate: number;
  averageTime: number;
  totalDeliveries: number;
  challenges: string[];
  improvements: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface TimeAnalysis {
  hour: number;
  day: string;
  deliveries: number;
  onTimeRate: number;
  averageTime: number;
  peak: boolean;
}

export interface CustomerSatisfaction {
  rating: number;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  commonComplaints: string[];
  improvements: string[];
  trendData: Array<{
    date: string;
    rating: number;
    reviews: number;
  }>;
}

export interface Benchmarking {
  metric: string;
  ourPerformance: number;
  industryAverage: number;
  bestInClass: number;
  competitorA: number;
  competitorB: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export interface DeliveryPerformanceData {
  stats: DeliveryPerformanceStats;
  courierPerformance: CourierPerformance[];
  regionalPerformance: RegionalPerformance[];
  timeAnalysis: TimeAnalysis[];
  customerSatisfaction: CustomerSatisfaction;
  benchmarking: Benchmarking[];
}
