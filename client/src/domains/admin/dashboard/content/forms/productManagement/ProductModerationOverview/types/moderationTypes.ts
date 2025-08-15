/**
 * PHASE 2: MODERATION TYPES
 * TypeScript interfaces for product moderation system
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

// Core product interface for moderation
export interface ModerationProduct {
  readonly id: string;
  readonly name: string;
  readonly vendor: string;
  readonly category: string;
  readonly price: string;
  readonly submittedAt: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly flags: string[];
  readonly score: number;
  readonly status: 'pending-review' | 'content-review' | 'quality-check' | 'approved' | 'rejected' | 'flagged';
  readonly images?: string[];
  readonly description?: string;
  readonly moderatorNotes?: string;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
}

// Moderation statistics interface
export interface ModerationStats {
  readonly pending: number;
  readonly approved: number;
  readonly rejected: number;
  readonly flagged: number;
  readonly reviewTime: number;
  readonly accuracy: number;
  readonly escalated: number;
  readonly dailyQuota: number;
  readonly completedToday: number;
  readonly teamEfficiency: number;
  readonly averageScoreImprovement: number;
}

// Recent activity interface
export interface RecentModerationAction {
  readonly id: number;
  readonly action: 'Approved' | 'Rejected' | 'Flagged' | 'Escalated';
  readonly product: string;
  readonly productId: string;
  readonly moderator: string;
  readonly time: string;
  readonly type: 'approval' | 'rejection' | 'flag' | 'escalation';
  readonly reason?: string;
  readonly notes?: string;
  readonly previousStatus?: string;
  readonly newStatus?: string;
}

// Filter configuration interface
export interface ModerationFilters {
  readonly status: string[];
  readonly priority: string[];
  readonly category: string[];
  readonly vendor: string[];
  readonly dateRange: {
    start?: string;
    end?: string;
  };
  readonly searchQuery: string;
  readonly minScore?: number;
  readonly maxScore?: number;
  readonly reviewedBy?: string;
  readonly hasFlags: boolean;
}

// Bulk operation interface
export interface BulkOperation {
  readonly type: 'approve' | 'reject' | 'assign' | 'flag' | 'escalate';
  readonly productIds: string[];
  readonly reason?: string;
  readonly notes?: string;
  readonly assignedReviewer?: string;
  readonly scheduledFor?: string;
}

// Moderation team member interface
export interface ModerationTeamMember {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'moderator' | 'senior-moderator' | 'team-lead' | 'admin';
  readonly reviewsToday: number;
  readonly reviewsThisWeek: number;
  readonly accuracy: number;
  readonly averageReviewTime: number;
  readonly specialties: string[];
  readonly isOnline: boolean;
  readonly currentWorkload: number;
}

// Analytics data interface
export interface ModerationAnalytics {
  readonly dailyStats: Array<{
    date: string;
    pending: number;
    approved: number;
    rejected: number;
    avgReviewTime: number;
  }>;
  readonly categoryBreakdown: Array<{
    category: string;
    pending: number;
    approved: number;
    rejected: number;
    avgScore: number;
  }>;
  readonly vendorPerformance: Array<{
    vendor: string;
    totalSubmissions: number;
    approvalRate: number;
    avgScore: number;
    topIssues: string[];
  }>;
  readonly reviewerPerformance: Array<{
    reviewer: string;
    reviewsCompleted: number;
    accuracy: number;
    avgReviewTime: number;
    efficiency: number;
  }>;
}

// UI state interfaces
export interface ModerationUIState {
  readonly selectedProducts: string[];
  readonly activeFilter: string;
  readonly showBulkActions: boolean;
  readonly showFilters: boolean;
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
  readonly viewMode: 'list' | 'grid' | 'detailed';
}

// Configuration interfaces
export interface ModerationSettings {
  readonly autoAssignment: boolean;
  readonly maxReviewTime: number; // minutes
  readonly escalationRules: {
    highPriorityTime: number;
    flagThreshold: number;
    scoreThreshold: number;
  };
  readonly notifications: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    pushEnabled: boolean;
  };
  readonly workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  readonly qualityGates: {
    minScore: number;
    requiredReviews: number;
    flaggedItemsRequireApproval: boolean;
  };
}

// Form interfaces for moderation actions
export interface ModerationActionForm {
  readonly action: 'approve' | 'reject' | 'flag' | 'escalate';
  readonly reason: string;
  readonly notes: string;
  readonly priority?: 'low' | 'medium' | 'high' | 'critical';
  readonly assignTo?: string;
  readonly scheduleFor?: string;
  readonly tags?: string[];
}

// Search and pagination interfaces
export interface SearchParams {
  readonly query: string;
  readonly filters: ModerationFilters;
  readonly page: number;
  readonly limit: number;
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

// Error and loading states
export interface ModerationError {
  readonly code: string;
  readonly message: string;
  readonly details?: any;
  readonly timestamp: number;
}

export interface LoadingStates {
  readonly stats: boolean;
  readonly products: boolean;
  readonly actions: boolean;
  readonly analytics: boolean;
  readonly teamData: boolean;
  readonly bulkOperation: boolean;
}

// Event interfaces for real-time updates
export interface ModerationEvent {
  readonly type: 'product_updated' | 'new_submission' | 'reviewer_assigned' | 'escalation' | 'bulk_action_completed';
  readonly productIds: string[];
  readonly userId: string;
  readonly timestamp: number;
  readonly data: any;
}

// Export utility types
export type ModerationAction = 'approve' | 'reject' | 'flag' | 'escalate' | 'assign';
export type ProductStatus = 'pending-review' | 'content-review' | 'quality-check' | 'approved' | 'rejected' | 'flagged';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ReviewerRole = 'moderator' | 'senior-moderator' | 'team-lead' | 'admin';