
export interface BankAccount {
  id: string;
  vendorId: string;
  vendorName: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
  accountType: 'savings' | 'current' | 'business' | 'joint';
  currency: string;
  country: string;
  status: 'pending' | 'verified' | 'rejected' | 'suspended' | 'expired';
  verificationMethod: 'micro_deposit' | 'document_verification' | 'api_verification' | 'manual_verification';
  documents: BankDocument[];
  verificationAttempts: number;
  lastVerificationDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  complianceFlags: ComplianceFlag[];
  riskScore: number;
  fraudAlerts: FraudAlert[];
  transactionHistory: TransactionRecord[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface BankDocument {
  id: string;
  type: 'bank_statement' | 'void_check' | 'letter_from_bank' | 'account_certificate' | 'signature_card';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  ocrData?: any;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface ComplianceFlag {
  id: string;
  type: 'aml_check' | 'sanctions_check' | 'pep_check' | 'adverse_media' | 'regulatory_compliance';
  status: 'clear' | 'flagged' | 'under_review';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  type: 'suspicious_activity' | 'duplicate_account' | 'blacklist_match' | 'velocity_check' | 'pattern_anomaly';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  triggeredAt: string;
  investigatedBy?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface TransactionRecord {
  id: string;
  type: 'micro_deposit' | 'verification_withdrawal' | 'test_transaction';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId: string;
  processedAt: string;
  failureReason?: string;
}

export interface BankVerificationStats {
  totalAccounts: number;
  pendingVerification: number;
  verifiedAccounts: number;
  rejectedAccounts: number;
  expiredAccounts: number;
  suspendedAccounts: number;
  averageVerificationTime: number;
  verificationSuccessRate: number;
  fraudAlertsCount: number;
  complianceIssues: number;
  monthlyTrend: {
    month: string;
    verified: number;
    rejected: number;
    pending: number;
  }[];
}

export interface BankingAuthority {
  id: string;
  name: string;
  country: string;
  regulationType: 'central_bank' | 'financial_regulator' | 'banking_authority';
  apiEndpoint?: string;
  verificationMethods: string[];
  supportedBanks: string[];
  complianceRequirements: string[];
  isActive: boolean;
}

export interface BankVerificationFilters {
  status?: string[];
  bankName?: string;
  accountType?: string[];
  country?: string[];
  riskScore?: {
    min: number;
    max: number;
  };
  verificationMethod?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  complianceStatus?: string[];
  fraudAlerts?: boolean;
}

export interface VerificationAction {
  id: string;
  accountId: string;
  action: 'approve' | 'reject' | 'suspend' | 'request_documents' | 'initiate_micro_deposit' | 'flag_for_review';
  performedBy: string;
  reason?: string;
  notes?: string;
  timestamp: string;
  result?: string;
}
