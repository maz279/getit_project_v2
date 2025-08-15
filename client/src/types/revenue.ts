
export interface RevenueModel {
  id: string;
  model_name: string;
  model_type: 'percentage' | 'tiered' | 'flat_fee' | 'hybrid';
  description?: string | null;
  base_rate: number;
  tier_structure: any[];
  minimum_threshold?: number | null;
  maximum_threshold?: number | null;
  category_rates: Record<string, any>;
  is_active: boolean;
  effective_from: string;
  effective_to?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionStructure {
  id: string;
  model_name: string;
  model_type: 'percentage' | 'tiered' | 'flat_fee' | 'hybrid';
  description?: string | null;
  base_rate: number;
  tier_structure: any[];
  minimum_threshold?: number | null;
  maximum_threshold?: number | null;
  category_rates: Record<string, any>;
  is_active: boolean;
  effective_from: string;
  effective_to?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueDispute {
  id: string;
  dispute_number: string;
  vendor_id: string;
  commission_id?: string | null;
  dispute_type: 'calculation_error' | 'payment_delay' | 'rate_disagreement' | 'other';
  dispute_amount: number;
  claimed_amount?: number | null;
  dispute_reason: string;
  dispute_description?: string | null;
  evidence_documents: any[];
  status: 'open' | 'under_review' | 'resolved' | 'rejected' | 'escalated';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string | null;
  resolution_notes?: string | null;
  resolution_amount?: number | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  expected_resolution_date?: string | null;
  escalation_level: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTermsConfig {
  id: string;
  term_name: string;
  payout_frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  minimum_payout_amount: number;
  processing_days: number;
  payment_methods: string[];
  processing_fee_rate?: number | null;
  late_payment_penalty_rate?: number | null;
  currency: string;
  terms_conditions?: string | null;
  compliance_requirements: any[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IncentiveProgram {
  id: string;
  program_name: string;
  program_type: 'volume_bonus' | 'performance_bonus' | 'loyalty_reward' | 'milestone_reward';
  description?: string | null;
  eligibility_criteria: Record<string, any>;
  reward_structure: Record<string, any>;
  budget_allocation?: number | null;
  start_date: string;
  end_date?: string | null;
  target_metrics: Record<string, any>;
  participation_count: number;
  total_rewards_paid: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
