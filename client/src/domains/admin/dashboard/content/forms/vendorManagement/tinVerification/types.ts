
export interface TinVerificationRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  tinNumber: string;
  businessType: 'individual' | 'partnership' | 'corporation' | 'llc' | 'trust' | 'estate';
  registrationDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: 'pending' | 'verified' | 'expired' | 'rejected' | 'suspended';
  verificationDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  documents: TinDocument[];
  taxFilingStatus: 'current' | 'delinquent' | 'unknown';
  lastFilingDate?: string;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TinDocument {
  id: string;
  type: 'tin_certificate' | 'tax_filing' | 'business_registration' | 'supporting_document';
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  verified: boolean;
  verificationDate?: string;
  verifiedBy?: string;
}

export interface TinVerificationStats {
  totalSubmissions: number;
  pendingReview: number;
  verified: number;
  expired: number;
  rejected: number;
  complianceRate: number;
  averageProcessingTime: number;
  urgentReviews: number;
}

export interface TaxAuthority {
  id: string;
  name: string;
  country: string;
  region?: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  verificationAPI?: {
    endpoint: string;
    requiresAuth: boolean;
    supportedFormats: string[];
  };
}

export interface TinValidationResult {
  isValid: boolean;
  tinNumber: string;
  businessName?: string;
  registrationStatus: string;
  filingStatus: string;
  lastUpdated: string;
  errorMessage?: string;
  confidence: number;
}

export interface ComplianceAlert {
  id: string;
  vendorId: string;
  alertType: 'expiry_warning' | 'filing_overdue' | 'status_change' | 'verification_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  dueDate?: string;
  actionRequired: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
