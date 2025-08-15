/**
 * Commission Tracking Service - Amazon.com/Shopee.sg Level Commission Management
 * Complete commission tracking and management for vendor platform
 */

export interface VendorCommissionRate {
  id: string;
  vendor_id: string;
  vendor_name: string;
  category_id: string;
  category_name: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed' | 'tiered';
  minimum_rate: number;
  maximum_rate: number;
  effective_from: Date;
  effective_to?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VendorCommission {
  id: string;
  vendor_id: string;
  vendor_name: string;
  order_id: string;
  product_id: string;
  product_name: string;
  order_total: number;
  commission_rate: number;
  commission_amount: number;
  commission_status: 'pending' | 'calculated' | 'paid' | 'disputed' | 'refunded';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CommissionDispute {
  id: string;
  commission_id: string;
  vendor_id: string;
  dispute_reason: string;
  dispute_description: string;
  dispute_status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  submitted_by: string;
  submitted_at: Date;
  resolved_by?: string;
  resolved_at?: Date;
  resolution_notes?: string;
}

export interface CommissionPayout {
  id: string;
  vendor_id: string;
  vendor_name: string;
  payout_period_start: Date;
  payout_period_end: Date;
  total_commissions: number;
  total_fees: number;
  net_payout: number;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method: 'bank_transfer' | 'mobile_banking' | 'check' | 'digital_wallet';
  payment_reference?: string;
  processed_at?: Date;
  created_at: Date;
}

export interface CommissionAnalytics {
  total_commissions: number;
  paid_commissions: number;
  pending_commissions: number;
  disputed_commissions: number;
  commission_growth_rate: number;
  top_earning_vendors: Array<{
    vendor_id: string;
    vendor_name: string;
    total_commissions: number;
    commission_count: number;
  }>;
  category_performance: Array<{
    category_id: string;
    category_name: string;
    total_commissions: number;
    average_rate: number;
  }>;
}

export class CommissionTrackingService {
  private static baseURL = '/api/v1/commissions';

  // Commission Rates
  static async getVendorCommissionRates(vendorId?: string): Promise<VendorCommissionRate[]> {
    const queryParams = vendorId ? `?vendor_id=${vendorId}` : '';
    const response = await fetch(`${this.baseURL}/rates${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commission rates');
    }
    
    return response.json();
  }

  static async createCommissionRate(rateData: Omit<VendorCommissionRate, 'id' | 'created_at' | 'updated_at'>): Promise<VendorCommissionRate> {
    const response = await fetch(`${this.baseURL}/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create commission rate');
    }
    
    return response.json();
  }

  static async updateCommissionRate(rateId: string, updates: Partial<VendorCommissionRate>): Promise<VendorCommissionRate> {
    const response = await fetch(`${this.baseURL}/rates/${rateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update commission rate');
    }
    
    return response.json();
  }

  // Commission Tracking
  static async getVendorCommissions(vendorId?: string, filters?: any): Promise<VendorCommission[]> {
    const queryParams = new URLSearchParams({
      ...(vendorId && { vendor_id: vendorId }),
      ...filters,
    });
    const response = await fetch(`${this.baseURL}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commissions');
    }
    
    return response.json();
  }

  static async getCommissionById(commissionId: string): Promise<VendorCommission> {
    const response = await fetch(`${this.baseURL}/${commissionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commission');
    }
    
    return response.json();
  }

  static async updateCommissionStatus(commissionId: string, status: VendorCommission['commission_status']): Promise<VendorCommission> {
    const response = await fetch(`${this.baseURL}/${commissionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commission_status: status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update commission status');
    }
    
    return response.json();
  }

  // Commission Disputes
  static async getCommissionDisputes(filters?: any): Promise<CommissionDispute[]> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/disputes?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commission disputes');
    }
    
    return response.json();
  }

  static async createCommissionDispute(disputeData: Omit<CommissionDispute, 'id' | 'submitted_at'>): Promise<CommissionDispute> {
    const response = await fetch(`${this.baseURL}/disputes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(disputeData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create commission dispute');
    }
    
    return response.json();
  }

  static async resolveCommissionDispute(disputeId: string, resolution: { resolution_notes: string; resolved_by: string }): Promise<CommissionDispute> {
    const response = await fetch(`${this.baseURL}/disputes/${disputeId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolution),
    });
    
    if (!response.ok) {
      throw new Error('Failed to resolve commission dispute');
    }
    
    return response.json();
  }

  // Commission Payouts
  static async getCommissionPayouts(vendorId?: string, filters?: any): Promise<CommissionPayout[]> {
    const queryParams = new URLSearchParams({
      ...(vendorId && { vendor_id: vendorId }),
      ...filters,
    });
    const response = await fetch(`${this.baseURL}/payouts?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commission payouts');
    }
    
    return response.json();
  }

  static async createCommissionPayout(payoutData: Omit<CommissionPayout, 'id' | 'created_at'>): Promise<CommissionPayout> {
    const response = await fetch(`${this.baseURL}/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payoutData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create commission payout');
    }
    
    return response.json();
  }

  static async processCommissionPayout(payoutId: string): Promise<CommissionPayout> {
    const response = await fetch(`${this.baseURL}/payouts/${payoutId}/process`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to process commission payout');
    }
    
    return response.json();
  }

  // Commission Analytics
  static async getCommissionAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<CommissionAnalytics> {
    const response = await fetch(`${this.baseURL}/analytics?period=${period}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commission analytics');
    }
    
    return response.json();
  }

  static async getVendorCommissionSummary(vendorId: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    const response = await fetch(`${this.baseURL}/vendors/${vendorId}/summary?period=${period}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vendor commission summary');
    }
    
    return response.json();
  }

  static async exportCommissionReport(filters?: any): Promise<Blob> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/export?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to export commission report');
    }
    
    return response.blob();
  }

  // Bulk Operations
  static async bulkUpdateCommissionStatus(commissionIds: string[], status: VendorCommission['commission_status']): Promise<any> {
    const response = await fetch(`${this.baseURL}/bulk-update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commission_ids: commissionIds, status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk update commission status');
    }
    
    return response.json();
  }

  static async bulkCreatePayouts(vendorIds: string[], period: { start: Date; end: Date }): Promise<any> {
    const response = await fetch(`${this.baseURL}/bulk-create-payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vendor_ids: vendorIds, period }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk create payouts');
    }
    
    return response.json();
  }
}

export default CommissionTrackingService;