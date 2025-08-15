
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  description: string;
  category: 'order_issue' | 'product_inquiry' | 'payment_issue' | 'shipping_problem' | 'refund_request' | 'technical_support' | 'account_issue' | 'general_inquiry';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  firstResponseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  orderNumber?: string;
  productId?: string;
  attachments: string[];
  tags: string[];
  satisfaction?: {
    rating: number;
    feedback: string;
    createdAt: string;
  };
  isEscalated: boolean;
  escalatedAt?: string;
  escalatedTo?: string;
  channel: 'email' | 'chat' | 'phone' | 'social_media' | 'mobile_app' | 'website';
  language: 'en' | 'bn';
  lastActivity: string;
  responseCount: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: string;
  readAt?: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  skills: string[];
  languages: string[];
  status: 'online' | 'offline' | 'busy' | 'away';
  activeTickets: number;
  maxTickets: number;
  rating: number;
  totalResolved: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  firstContactResolution: number;
  escalationRate: number;
  agentUtilization: number;
  ticketsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  ticketsByPriority: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  ticketsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  ticketsByChannel: Array<{
    channel: string;
    count: number;
    percentage: number;
  }>;
}

export interface SupportAnalytics {
  dailyVolume: Array<{
    date: string;
    tickets: number;
    resolved: number;
    avgResponseTime: number;
  }>;
  agentPerformance: Array<{
    agent: string;
    tickets: number;
    resolved: number;
    avgResponseTime: number;
    customerRating: number;
  }>;
  categoryTrends: Array<{
    category: string;
    thisWeek: number;
    lastWeek: number;
    change: number;
  }>;
  satisfactionTrends: Array<{
    month: string;
    rating: number;
    responses: number;
  }>;
}

export interface TicketFilter {
  status: string[];
  priority: string[];
  category: string[];
  assignedTo: string[];
  dateRange: {
    start: string;
    end: string;
  };
  searchQuery: string;
  sortBy: 'created' | 'updated' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  author: string;
}
