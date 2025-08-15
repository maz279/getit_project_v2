
export interface DocumentSubmission {
  id: string;
  vendorId: string;
  vendorName: string;
  documentType: 'business_license' | 'tax_certificate' | 'identity_proof' | 'bank_statement' | 'insurance_certificate' | 'quality_certificate';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  expiryDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'kyc' | 'business' | 'financial' | 'compliance' | 'quality';
  metadata: {
    extractedText?: string;
    ocrConfidence?: number;
    digitalSignature?: boolean;
    fileHash?: string;
  };
  comments: DocumentComment[];
  auditTrail: AuditEntry[];
}

export interface DocumentComment {
  id: string;
  authorId: string;
  authorName: string;
  comment: string;
  timestamp: string;
  isInternal: boolean;
}

export interface AuditEntry {
  id: string;
  action: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'resubmitted' | 'expired';
  performedBy: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

export interface DocumentReviewStats {
  totalDocuments: number;
  pendingReview: number;
  underReview: number;
  approved: number;
  rejected: number;
  expired: number;
  averageReviewTime: number;
  complianceRate: number;
  todaysSubmissions: number;
  urgentReviews: number;
}

export interface ComplianceRule {
  id: string;
  documentType: string;
  ruleName: string;
  description: string;
  isActive: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  autoReject: boolean;
  pattern?: string;
  validationLogic: string;
}

export interface ReviewerPerformance {
  reviewerId: string;
  reviewerName: string;
  documentsReviewed: number;
  averageReviewTime: number;
  accuracyRate: number;
  workload: number;
  availability: 'available' | 'busy' | 'offline';
}

export interface DocumentFilter {
  status: string[];
  documentType: string[];
  priority: string[];
  category: string[];
  dateRange: {
    start: string;
    end: string;
  };
  vendorName: string;
  reviewerId: string;
  sortBy: 'submittedAt' | 'priority' | 'vendorName' | 'documentType';
  sortOrder: 'asc' | 'desc';
}
