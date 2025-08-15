/**
 * Vendor Service Types - Amazon.com/Shopee.sg Level Type Definitions
 * Comprehensive type system for vendor management operations
 */

// Core vendor interfaces
export interface Vendor {
  id: string;
  userId?: number;
  businessName: string;
  businessType?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: any;
  businessLicense?: string;
  taxId?: string;
  bankAccountInfo?: any;
  commissionRate?: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorRequest {
  businessName: string;
  businessType?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessLicense?: string;
  taxId?: string;
  bankAccountInfo?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
}

export interface UpdateVendorRequest {
  businessName?: string;
  businessType?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: any;
  businessLicense?: string;
  taxId?: string;
  bankAccountInfo?: any;
}

// KYC interfaces
export interface KYCSubmissionRequest {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    idNumber: string;
    idType: 'nid' | 'passport' | 'driving_license';
  };
  businessInfo: {
    registrationNumber: string;
    registrationDate: string;
    businessType: string;
    tradeLicense: string;
    tinNumber: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
    swiftCode?: string;
  };
  documents: {
    idDocument: string;
    businessRegistration: string;
    bankStatement: string;
    addressProof: string;
    tradeLicense: string;
  };
  declarations: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    dataProcessingConsent: boolean;
    complianceDeclaration: boolean;
  };
}

export interface KYCStatus {
  id: string;
  vendorId: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  submittedAt?: Date;
  reviewNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics interfaces
export interface VendorAnalytics {
  id: string;
  vendorId: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  salesCount: number;
  salesValue: string;
  orderCount: number;
  customerCount: number;
  productViews: number;
  storeViews: number;
  conversionRate: string;
  averageOrderValue: string;
  returnRate: string;
  metrics?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorDashboardAnalytics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  recentSalesGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    period: string;
    sales: number;
    orders: number;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
  };
  performanceMetrics: {
    orderFulfillmentRate: number;
    averageShippingTime: number;
    customerSatisfactionScore: number;
    returnRate: number;
  };
}

// Payout interfaces
export interface VendorPayout {
  id: string;
  vendorId: string;
  payoutType: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDetails?: any;
  requestedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  amount: number;
  paymentMethod: string;
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
    mobileNumber?: string;
    walletType?: string;
  };
}

// Query interfaces
export interface VendorQueryOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsQueryOptions {
  period: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export interface PayoutQueryOptions {
  page: number;
  limit: number;
  status?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
}

// Response interfaces
export interface VendorListResponse {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PayoutListResponse {
  payouts: VendorPayout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Order interfaces for vendor context
export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: string;
  itemCount: number;
  createdAt: Date;
  shippingAddress?: any;
}

// Store interfaces
export interface VendorStore {
  id: string;
  vendorId: string;
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  storeSettings?: any;
  businessHours?: any;
  socialMedia?: any;
  seoSettings?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Error interfaces
export interface VendorServiceError {
  code: string;
  message: string;
  details?: any;
}

// Service configuration
export interface VendorServiceConfig {
  defaultCommissionRate: number;
  maxPayoutAmount: number;
  kycRequiredForPayout: boolean;
  autoApprovePayouts: boolean;
  payoutProcessingDays: number;
  supportedPaymentMethods: string[];
}

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type KYCDocumentType = 'nid' | 'passport' | 'driving_license' | 'trade_license' | 'tin_certificate' | 'bank_statement';