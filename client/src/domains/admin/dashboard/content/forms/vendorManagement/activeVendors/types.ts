
export interface ActiveVendor {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  subCategory: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'under_review';
  joinDate: string;
  lastActive: string;
  totalProducts: number;
  activeProducts: number;
  totalSales: number;
  monthlyRevenue: number;
  commissionRate: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
  onTimeDelivery: number;
  returnRate: number;
  qualityScore: number;
  logo?: string;
  businessLicense: string;
  taxId: string;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  documents: Array<{
    type: string;
    url: string;
    verified: boolean;
    uploadDate: string;
  }>;
  kycStatus: 'complete' | 'incomplete' | 'pending' | 'rejected';
  contractStatus: 'signed' | 'pending' | 'expired' | 'terminated';
  performanceMetrics: {
    orderFulfillmentRate: number;
    customerSatisfaction: number;
    disputeRate: number;
    refundRate: number;
  };
  paymentInfo: {
    totalEarnings: number;
    pendingPayments: number;
    lastPaymentDate: string;
    paymentMethod: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface VendorMetrics {
  totalActiveVendors: number;
  newVendorsThisMonth: number;
  pendingVerifications: number;
  suspendedVendors: number;
  averageRating: number;
  totalRevenue: number;
  averageCommissionRate: number;
  topPerformingVendors: number;
  vendorRetentionRate: number;
  averageOnboardingTime: number;
}

export interface VendorAnalytics {
  performanceDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    vendorCount: number;
    revenue: number;
    averageRating: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    vendorCount: number;
    revenue: number;
    marketShare: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    newVendors: number;
    totalRevenue: number;
    averageRating: number;
    activeVendors: number;
  }>;
  topVendors: Array<{
    id: string;
    name: string;
    revenue: number;
    rating: number;
    category: string;
  }>;
  complianceMetrics: {
    kycCompleted: number;
    documentsVerified: number;
    contractsSigned: number;
    taxComplianceRate: number;
  };
}

export interface VendorOnboarding {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  applicationDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  currentStep: number;
  totalSteps: number;
  documentsUploaded: number;
  requiredDocuments: number;
  estimatedCompletionDate: string;
  assignedReviewer?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface VendorSettings {
  autoApproval: boolean;
  minimumRating: number;
  commissionStructure: Array<{
    category: string;
    rate: number;
    minimumVolume: number;
  }>;
  verificationRequirements: {
    businessLicense: boolean;
    taxCertificate: boolean;
    bankVerification: boolean;
    addressProof: boolean;
  };
  performanceThresholds: {
    minimumOrderFulfillment: number;
    maximumReturnRate: number;
    minimumResponseTime: number;
  };
  paymentSettings: {
    paymentCycle: 'weekly' | 'bi-weekly' | 'monthly';
    minimumPayout: number;
    holdingPeriod: number;
  };
}
