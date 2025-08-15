
export interface ChatSession {
  id: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'waiting' | 'ended' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startTime: string;
  endTime?: string;
  duration: number;
  messageCount: number;
  rating?: number;
  feedback?: string;
  tags: string[];
  lastMessage: string;
  lastMessageTime: string;
  isFromMobile: boolean;
  customerLocation: string;
  orderNumber?: string;
  category: string;
  resolution: 'resolved' | 'escalated' | 'pending' | 'unresolved';
}

export interface ChatAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  currentSessions: number;
  maxSessions: number;
  totalChatsToday: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  resolutionRate: number;
  onlineTime: number;
  languages: string[];
  specialties: string[];
  lastActive: string;
  performance: {
    responsiveness: number;
    helpfulness: number;
    professionalism: number;
  };
}

export interface ChatMetrics {
  totalActiveSessions: number;
  waitingCustomers: number;
  averageWaitTime: number;
  averageResponseTime: number;
  totalChatsToday: number;
  resolvedChatsToday: number;
  customerSatisfactionRate: number;
  firstContactResolution: number;
  agentsOnline: number;
  totalAgents: number;
  peakHours: Array<{
    hour: string;
    sessions: number;
  }>;
}

export interface ChatAnalytics {
  dailyStats: Array<{
    date: string;
    totalChats: number;
    resolvedChats: number;
    averageWaitTime: number;
    customerSatisfaction: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    chatCount: number;
    averageWaitTime: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
    averageResolutionTime: number;
  }>;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    totalChats: number;
    averageRating: number;
    responseTime: number;
    resolutionRate: number;
  }>;
  customerSatisfactionTrends: Array<{
    month: string;
    satisfaction: number;
    responseTime: number;
    resolutionRate: number;
  }>;
}

export interface ChatSettings {
  general: {
    chatEnabled: boolean;
    operatingHours: {
      start: string;
      end: string;
      timezone: string;
    };
    maxConcurrentChats: number;
    autoAssignment: boolean;
    queueLimit: number;
  };
  automation: {
    autoGreeting: boolean;
    greetingMessage: string;
    prebotEnabled: boolean;
    prebotQuestions: string[];
    escalationRules: Array<{
      condition: string;
      action: string;
    }>;
  };
  appearance: {
    chatWidgetColor: string;
    chatWidgetPosition: 'bottom-right' | 'bottom-left';
    showAgentAvatar: boolean;
    showTypingIndicator: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notificationRecipients: string[];
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}
