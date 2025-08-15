
export interface TradeLicense {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  licenseNumber: string;
  licenseType: 'trade' | 'manufacturing' | 'import_export' | 'service' | 'retail' | 'wholesale';
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: 'pending' | 'verified' | 'expired' | 'rejected' | 'suspended';
  documents: LicenseDocument[];
  businessCategory: string;
  registrationAddress: BusinessAddress;
  contactDetails: ContactDetails;
  verificationDetails?: VerificationDetails;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  renewalHistory: RenewalRecord[];
  flags: ComplianceFlag[];
  lastVerified?: string;
  verifiedBy?: string;
}

export interface LicenseDocument {
  id: string;
  type: 'license_certificate' | 'registration_form' | 'tax_clearance' | 'proof_of_address' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
}

export interface BusinessAddress {
  street: string;
  city: string;
  district: string;
  division: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactDetails {
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  website?: string;
  contactPerson: string;
  designation: string;
}

export interface VerificationDetails {
  verifiedAt: string;
  verifiedBy: string;
  verificationMethod: 'manual' | 'automated' | 'hybrid';
  verificationNotes: string;
  crossChecks: CrossCheck[];
}

export interface CrossCheck {
  source: string;
  status: 'verified' | 'failed' | 'pending';
  checkedAt: string;
  details: string;
}

export interface RenewalRecord {
  id: string;
  renewedAt: string;
  expiryDate: string;
  status: 'active' | 'expired';
  renewalFee: number;
  documents: string[];
}

export interface ComplianceFlag {
  id: string;
  type: 'warning' | 'violation' | 'expired' | 'missing_document';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdAt: string;
  resolvedAt?: string;
  actionRequired: string;
}

export interface TradeLicenseStats {
  totalLicenses: number;
  pendingReview: number;
  verified: number;
  expired: number;
  rejected: number;
  expiringIn30Days: number;
  expiringIn7Days: number;
  complianceRate: number;
  averageProcessingTime: number;
  todaysSubmissions: number;
}

export interface LicenseFilter {
  status: string[];
  licenseType: string[];
  businessCategory: string[];
  riskLevel: string[];
  division: string[];
  issuingAuthority: string[];
  expiryDateRange: {
    start: string;
    end: string;
  };
  complianceScoreRange: {
    min: number;
    max: number;
  };
  searchQuery: string;
  sortBy: 'submittedAt' | 'expiryDate' | 'complianceScore' | 'vendorName';
  sortOrder: 'asc' | 'desc';
}

export interface RegulatoryRequirement {
  id: string;
  name: string;
  description: string;
  applicableTo: string[];
  mandatory: boolean;
  documentRequired: string[];
  renewalPeriod: number; // in months
  penaltyForNonCompliance: string;
  isActive: boolean;
}

export interface ComplianceReport {
  id: string;
  licenseId: string;
  reportType: 'quarterly' | 'annual' | 'incident';
  generatedAt: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  findings: ComplianceFinding[];
  recommendations: string[];
  nextReviewDate: string;
}

export interface ComplianceFinding {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'in_progress';
  actionRequired: string;
  deadline?: string;
}
