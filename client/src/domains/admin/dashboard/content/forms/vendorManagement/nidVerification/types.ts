
export interface NidRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  businessName: string;
  nidNumber: string;
  nidType: 'smart_card' | 'manual_card' | 'birth_certificate';
  holderName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  email: string;
  bloodGroup?: string;
  nidImages: {
    front: string;
    back: string;
  };
  selfiImage?: string;
  biometricData?: {
    fingerprint: string;
    faceData: string;
  };
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'under_review' | 'flagged';
  verificationMethod: 'manual' | 'api' | 'biometric' | 'hybrid';
  issuedDate: string;
  expiryDate?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  fraudFlags: string[];
  verificationNotes: string;
  lastUpdated: string;
  createdAt: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  division: string;
  district: string;
  upazilla: string;
  union?: string;
  ward?: string;
  voterSerial?: string;
  blacklistStatus: 'clean' | 'flagged' | 'blacklisted';
  apiResponse?: any;
  faceMatchScore?: number;
  duplicateCheck: {
    hasDuplicate: boolean;
    duplicateCount: number;
    duplicateIds: string[];
  };
}

export interface NidStats {
  totalNids: number;
  pendingVerification: number;
  verifiedNids: number;
  rejectedNids: number;
  expiredNids: number;
  flaggedNids: number;
  biometricVerified: number;
  apiVerified: number;
  manualVerified: number;
  averageProcessingTime: string;
  complianceRate: number;
  fraudDetectionRate: number;
  successRate: number;
  todayProcessed: number;
  weeklyTrend: number;
  monthlyTrend: number;
}

export interface BiometricMatch {
  id: string;
  nidId: string;
  matchType: 'fingerprint' | 'face' | 'both';
  matchScore: number;
  confidence: number;
  matchedAt: string;
  matchedBy: string;
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    location: string;
  };
  result: 'match' | 'no_match' | 'low_quality' | 'error';
  errorDetails?: string;
}

export interface IdentityCompliance {
  nidId: string;
  complianceChecks: {
    nidFormatValid: boolean;
    nidLengthValid: boolean;
    imageQualityCheck: boolean;
    duplicateCheck: boolean;
    blacklistCheck: boolean;
    ageVerification: boolean;
    addressVerification: boolean;
    phoneVerification: boolean;
    emailVerification: boolean;
  };
  overallScore: number;
  riskAssessment: string;
  recommendations: string[];
  lastChecked: string;
}

export interface FraudDetection {
  id: string;
  nidId: string;
  fraudType: 'duplicate_nid' | 'fake_image' | 'identity_theft' | 'suspicious_pattern' | 'blacklist_match';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: string;
  detectedBy: 'system' | 'manual_review' | 'ai_model';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  investigatedBy?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface NidAnalytics {
  processingMetrics: {
    dailyProcessed: number[];
    weeklyProcessed: number[];
    monthlyProcessed: number[];
    averageProcessingTime: number[];
    successRates: number[];
  };
  verificationMethods: {
    api: number;
    manual: number;
    biometric: number;
    hybrid: number;
  };
  rejectionReasons: {
    [key: string]: number;
  };
  geographicDistribution: {
    [division: string]: number;
  };
  fraudDetectionStats: {
    totalFraudCases: number;
    fraudsByType: { [key: string]: number };
    monthlyFraudTrend: number[];
  };
  complianceMetrics: {
    averageComplianceScore: number;
    complianceDistribution: number[];
    topComplianceIssues: string[];
  };
}
