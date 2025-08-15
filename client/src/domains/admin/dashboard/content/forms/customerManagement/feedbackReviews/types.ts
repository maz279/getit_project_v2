
export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  productId: string;
  productName: string;
  productImage?: string;
  vendorId: string;
  vendorName: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationStatus: 'unmoderated' | 'approved' | 'rejected' | 'needs_review';
  createdAt: string;
  updatedAt: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  images?: string[];
  videos?: string[];
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  subCategory?: string;
  language: string;
  reportCount: number;
  moderatorNotes?: string;
  responseFromVendor?: {
    message: string;
    timestamp: string;
    respondedBy: string;
  };
}

export interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: 'product' | 'service' | 'delivery' | 'website' | 'app' | 'general';
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  rating?: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  followUpRequired: boolean;
  customerSatisfactionScore?: number;
  relatedOrderId?: string;
  relatedProductId?: string;
  source: 'web' | 'mobile' | 'email' | 'phone' | 'chat';
}

export interface ReviewMetrics {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  averageRating: number;
  totalFeedback: number;
  resolvedFeedback: number;
  customerSatisfactionScore: number;
  responseRate: number;
}

export interface ReviewAnalytics {
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  sentimentAnalysis: Array<{
    sentiment: string;
    count: number;
    percentage: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageRating: number;
    sentiment: string;
  }>;
  timeSeriesData: Array<{
    date: string;
    reviews: number;
    averageRating: number;
    feedback: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    count: number;
    sentiment: string;
  }>;
  vendorPerformance: Array<{
    vendorId: string;
    vendorName: string;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
  }>;
}

export interface ModerationSettings {
  autoApprove: boolean;
  requireModeration: boolean;
  profanityFilter: boolean;
  spamDetection: boolean;
  minimumRating: number;
  minimumCharacters: number;
  requirePurchaseVerification: boolean;
  allowAnonymousReviews: boolean;
  emailNotifications: boolean;
  webhookUrl?: string;
}
