
export interface SuspendedVendor {
  id: string;
  vendorId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  registrationDate: string;
  suspensionDate: string;
  suspensionReason: string;
  suspensionType: 'temporary' | 'permanent' | 'under_review';
  originalIssue: string;
  violationType: 'quality_issues' | 'policy_violation' | 'fraud' | 'non_compliance' | 'customer_complaints' | 'payment_issues';
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  suspendedBy: string;
  reviewStatus: 'pending' | 'under_review' | 'approved_for_reinstatement' | 'permanently_suspended';
  lastReviewDate: string;
  reinstateEligibleDate?: string;
  totalOrdersBeforeSuspension: number;
  totalRevenueBeforeSuspension: number;
  customerComplaintsCount: number;
  averageRating: number;
  complianceScore: number;
  paymentIssuesCount: number;
  qualityIssuesCount: number;
  appealStatus: 'none' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  appealDate?: string;
  appealReason?: string;
  correctionPlan?: string;
  documentsRequired: string[];
  documentsSubmitted: string[];
  reinstatementConditions: string[];
  monitoringPeriod?: number;
  notes: string;
  actionHistory: SuspensionAction[];
}

export interface SuspensionAction {
  id: string;
  actionType: 'suspended' | 'warning_issued' | 'appeal_submitted' | 'review_started' | 'reinstated' | 'permanently_banned';
  actionDate: string;
  actionBy: string;
  reason: string;
  details: string;
  attachments?: string[];
}

export interface SuspendedVendorStats {
  totalSuspended: number;
  temporarySuspensions: number;
  permanentSuspensions: number;
  underReview: number;
  appealsPending: number;
  eligibleForReinstatement: number;
  recentSuspensions: number;
  averageSuspensionDuration: number;
  reinstatementRate: number;
  recurringViolations: number;
}

export interface SuspensionFilter {
  suspensionType: string[];
  violationType: string[];
  severityLevel: string[];
  reviewStatus: string[];
  appealStatus: string[];
  dateRange: {
    start: string;
    end: string;
  };
  category: string[];
  complianceScoreRange: {
    min: number;
    max: number;
  };
}

export interface ReinstatementRequest {
  id: string;
  vendorId: string;
  businessName: string;
  requestDate: string;
  reason: string;
  correctionPlan: string;
  evidenceSubmitted: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  conditions: string[];
  monitoringPeriod: number;
}
