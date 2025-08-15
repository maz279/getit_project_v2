
export interface PendingVendorApplication {
  id: string;
  applicationNumber: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  category: string;
  subCategory: string;
  registrationDate: string;
  documentsSubmitted: Document[];
  applicationStatus: 'submitted' | 'under_review' | 'pending_documents' | 'approved' | 'rejected';
  reviewStatus: 'not_started' | 'in_progress' | 'completed';
  assignedReviewer?: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessDetails: {
    tradeLicense: string;
    taxId: string;
    yearEstablished: number;
    numberOfEmployees: number;
    annualRevenue: number;
    bankAccount: string;
  };
  verificationDocuments: {
    tradeLicense: boolean;
    taxCertificate: boolean;
    bankStatement: boolean;
    identityProof: boolean;
    addressProof: boolean;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastUpdated: string;
  notes: string;
  reviewComments: ReviewComment[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ReviewComment {
  id: string;
  reviewer: string;
  comment: string;
  timestamp: string;
  type: 'note' | 'approval' | 'rejection' | 'request_document';
}

export interface ApplicationStats {
  totalApplications: number;
  pendingReview: number;
  underReview: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  documentsToVerify: number;
  urgentApplications: number;
}
