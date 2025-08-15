/**
 * Rating Service - Amazon.com/Shopee.sg Level Rating Management
 * Complete rating and review management for e-commerce platform
 */

export interface RatingDisputeData {
  review_id: string;
  vendor_id: string;
  customer_id: string;
  dispute_reason: string;
  dispute_description: string;
  dispute_status: 'pending' | 'resolved' | 'rejected';
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: Date;
  updated_at?: Date;
}

export interface RatingPolicy {
  id: string;
  policy_name: string;
  policy_description: string;
  policy_type: 'quality' | 'verification' | 'dispute' | 'moderation';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewModerationData {
  review_id: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_reason?: string;
  moderator_id?: string;
  auto_moderated: boolean;
  created_at: Date;
}

export class RatingService {
  private static baseURL = '/api/v1/ratings';

  // Rating Disputes
  static async createDispute(disputeData: RatingDisputeData): Promise<RatingDisputeData> {
    const response = await fetch(`${this.baseURL}/disputes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(disputeData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create dispute');
    }
    
    return response.json();
  }

  static async getDisputes(filters?: any): Promise<RatingDisputeData[]> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/disputes?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch disputes');
    }
    
    return response.json();
  }

  static async updateDispute(disputeId: string, updates: Partial<RatingDisputeData>): Promise<RatingDisputeData> {
    const response = await fetch(`${this.baseURL}/disputes/${disputeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update dispute');
    }
    
    return response.json();
  }

  // Rating Policies
  static async createPolicy(policyData: Omit<RatingPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<RatingPolicy> {
    const response = await fetch(`${this.baseURL}/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(policyData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create policy');
    }
    
    return response.json();
  }

  static async getPolicies(): Promise<RatingPolicy[]> {
    const response = await fetch(`${this.baseURL}/policies`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch policies');
    }
    
    return response.json();
  }

  static async updatePolicy(policyId: string, updates: Partial<RatingPolicy>): Promise<RatingPolicy> {
    const response = await fetch(`${this.baseURL}/policies/${policyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update policy');
    }
    
    return response.json();
  }

  // Review Moderation
  static async createModerationRequest(moderationData: ReviewModerationData): Promise<ReviewModerationData> {
    const response = await fetch(`${this.baseURL}/moderation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moderationData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create moderation request');
    }
    
    return response.json();
  }

  static async getModerationRequests(filters?: any): Promise<ReviewModerationData[]> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/moderation?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch moderation requests');
    }
    
    return response.json();
  }

  static async updateModerationStatus(
    reviewId: string, 
    status: ReviewModerationData['moderation_status'],
    reason?: string
  ): Promise<ReviewModerationData> {
    const response = await fetch(`${this.baseURL}/moderation/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ moderation_status: status, moderation_reason: reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update moderation status');
    }
    
    return response.json();
  }

  // Analytics
  static async getRatingAnalytics(filters?: any): Promise<any> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/analytics?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rating analytics');
    }
    
    return response.json();
  }

  static async getDisputeAnalytics(filters?: any): Promise<any> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/disputes/analytics?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dispute analytics');
    }
    
    return response.json();
  }
}

export default RatingService;