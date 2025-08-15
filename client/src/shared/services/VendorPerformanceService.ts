/**
 * Vendor Performance Service - Amazon.com/Shopee.sg Level Performance Management
 * Complete vendor performance tracking and analytics for marketplace platform
 */

export interface VendorPerformanceMetrics {
  vendor_id: string;
  vendor_name: string;
  performance_score: number;
  order_fulfillment_rate: number;
  on_time_delivery_rate: number;
  customer_satisfaction_score: number;
  return_rate: number;
  dispute_rate: number;
  response_time_hours: number;
  product_quality_score: number;
  inventory_accuracy: number;
  sales_volume: number;
  revenue_generated: number;
  period_start: Date;
  period_end: Date;
  last_updated: Date;
}

export interface VendorPerformanceAlert {
  id: string;
  vendor_id: string;
  vendor_name: string;
  alert_type: 'performance_drop' | 'low_satisfaction' | 'high_return_rate' | 'delayed_shipping' | 'inventory_issue';
  alert_level: 'info' | 'warning' | 'critical';
  message: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  is_resolved: boolean;
  created_at: Date;
  resolved_at?: Date;
}

export interface VendorPerformanceReport {
  id: string;
  vendor_id: string;
  vendor_name: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  report_period_start: Date;
  report_period_end: Date;
  overall_score: number;
  metrics: VendorPerformanceMetrics;
  improvement_areas: string[];
  recommendations: string[];
  benchmarks: {
    industry_average: number;
    top_performer_score: number;
    marketplace_average: number;
  };
  generated_at: Date;
}

export interface VendorPerformanceBenchmark {
  id: string;
  metric_name: string;
  category: string;
  excellent_threshold: number;
  good_threshold: number;
  acceptable_threshold: number;
  poor_threshold: number;
  industry_average: number;
  marketplace_average: number;
  last_updated: Date;
}

export interface VendorPerformanceHistory {
  vendor_id: string;
  date: Date;
  performance_score: number;
  key_metrics: {
    [key: string]: number;
  };
  notes?: string;
}

export class VendorPerformanceService {
  private static baseURL = '/api/v1/vendor-performance';

  // Performance Metrics
  static async getVendorPerformanceMetrics(vendorId: string, period?: { start: Date; end: Date }): Promise<VendorPerformanceMetrics> {
    const queryParams = period ? `?start=${period.start.toISOString()}&end=${period.end.toISOString()}` : '';
    const response = await fetch(`${this.baseURL}/${vendorId}/metrics${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor performance metrics');
    }
    
    return response.json();
  }

  static async getAllVendorPerformanceMetrics(filters?: any): Promise<VendorPerformanceMetrics[]> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/metrics?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch all vendor performance metrics');
    }
    
    return response.json();
  }

  static async updateVendorPerformanceMetrics(vendorId: string, metrics: Partial<VendorPerformanceMetrics>): Promise<VendorPerformanceMetrics> {
    const response = await fetch(`${this.baseURL}/${vendorId}/metrics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vendor performance metrics');
    }
    
    return response.json();
  }

  // Performance Alerts
  static async getVendorPerformanceAlerts(vendorId?: string, filters?: any): Promise<VendorPerformanceAlert[]> {
    const queryParams = new URLSearchParams({
      ...(vendorId && { vendor_id: vendorId }),
      ...filters,
    });
    const response = await fetch(`${this.baseURL}/alerts?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor performance alerts');
    }
    
    return response.json();
  }

  static async createVendorPerformanceAlert(alertData: Omit<VendorPerformanceAlert, 'id' | 'created_at'>): Promise<VendorPerformanceAlert> {
    const response = await fetch(`${this.baseURL}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create vendor performance alert');
    }
    
    return response.json();
  }

  static async resolveVendorPerformanceAlert(alertId: string): Promise<VendorPerformanceAlert> {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/resolve`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to resolve vendor performance alert');
    }
    
    return response.json();
  }

  // Performance Reports
  static async getVendorPerformanceReports(vendorId?: string, filters?: any): Promise<VendorPerformanceReport[]> {
    const queryParams = new URLSearchParams({
      ...(vendorId && { vendor_id: vendorId }),
      ...filters,
    });
    const response = await fetch(`${this.baseURL}/reports?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor performance reports');
    }
    
    return response.json();
  }

  static async generateVendorPerformanceReport(
    vendorId: string, 
    reportType: VendorPerformanceReport['report_type'],
    period: { start: Date; end: Date }
  ): Promise<VendorPerformanceReport> {
    const response = await fetch(`${this.baseURL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: vendorId,
        report_type: reportType,
        period,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate vendor performance report');
    }
    
    return response.json();
  }

  static async exportVendorPerformanceReport(reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/reports/${reportId}/export?format=${format}`);
    
    if (!response.ok) {
      throw new Error('Failed to export vendor performance report');
    }
    
    return response.blob();
  }

  // Performance Benchmarks
  static async getVendorPerformanceBenchmarks(): Promise<VendorPerformanceBenchmark[]> {
    const response = await fetch(`${this.baseURL}/benchmarks`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor performance benchmarks');
    }
    
    return response.json();
  }

  static async updateVendorPerformanceBenchmarks(benchmarks: Partial<VendorPerformanceBenchmark>[]): Promise<VendorPerformanceBenchmark[]> {
    const response = await fetch(`${this.baseURL}/benchmarks`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(benchmarks),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vendor performance benchmarks');
    }
    
    return response.json();
  }

  // Performance History
  static async getVendorPerformanceHistory(vendorId: string, period?: { start: Date; end: Date }): Promise<VendorPerformanceHistory[]> {
    const queryParams = period ? `?start=${period.start.toISOString()}&end=${period.end.toISOString()}` : '';
    const response = await fetch(`${this.baseURL}/${vendorId}/history${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor performance history');
    }
    
    return response.json();
  }

  static async addVendorPerformanceHistoryEntry(historyData: VendorPerformanceHistory): Promise<VendorPerformanceHistory> {
    const response = await fetch(`${this.baseURL}/${historyData.vendor_id}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add vendor performance history entry');
    }
    
    return response.json();
  }

  // Analytics
  static async getVendorPerformanceAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    const response = await fetch(`${this.baseURL}/analytics?period=${period}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor performance analytics');
    }
    
    return response.json();
  }

  static async getTopPerformingVendors(limit: number = 10, metric: string = 'performance_score'): Promise<VendorPerformanceMetrics[]> {
    const response = await fetch(`${this.baseURL}/top-performers?limit=${limit}&metric=${metric}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch top performing vendors');
    }
    
    return response.json();
  }

  static async getUnderperformingVendors(limit: number = 10, threshold: number = 70): Promise<VendorPerformanceMetrics[]> {
    const response = await fetch(`${this.baseURL}/underperformers?limit=${limit}&threshold=${threshold}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch underperforming vendors');
    }
    
    return response.json();
  }

  // Bulk Operations
  static async bulkUpdatePerformanceMetrics(updates: Array<{ vendor_id: string; metrics: Partial<VendorPerformanceMetrics> }>): Promise<any> {
    const response = await fetch(`${this.baseURL}/bulk-update-metrics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk update performance metrics');
    }
    
    return response.json();
  }

  static async bulkGenerateReports(vendorIds: string[], reportType: VendorPerformanceReport['report_type']): Promise<any> {
    const response = await fetch(`${this.baseURL}/bulk-generate-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vendor_ids: vendorIds, report_type: reportType }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk generate reports');
    }
    
    return response.json();
  }
}

export default VendorPerformanceService;