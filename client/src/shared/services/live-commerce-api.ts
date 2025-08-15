import { 
  LiveCommerceSession, 
  LiveCommerceProduct, 
  LiveStreamViewer, 
  LiveStreamInteraction, 
  LiveStreamPurchase, 
  LiveCommerceHost, 
  LiveStreamAnalytics,
  LiveStreamModerator,
  LiveStreamNotification,
  LiveStreamRecording,
  FlashSale,
  LiveStreamCategory,
  LiveStreamFollow,
  LiveStreamGift,
  LiveStreamPoll,
  LiveStreamPollResponse,
  LiveStreamBadge,
  InsertLiveCommerceSession,
  InsertLiveCommerceProduct,
  InsertLiveStreamViewer,
  InsertLiveStreamInteraction,
  InsertLiveStreamPurchase,
  InsertLiveCommerceHost,
  InsertLiveStreamAnalytics,
  InsertLiveStreamModerator,
  InsertLiveStreamNotification,
  InsertLiveStreamRecording,
  InsertFlashSale,
  InsertLiveStreamCategory,
  InsertLiveStreamFollow,
  InsertLiveStreamGift,
  InsertLiveStreamPoll,
  InsertLiveStreamPollResponse,
  InsertLiveStreamBadge
} from '@/../../shared/schema';

/**
 * Amazon.com/Shopee.sg-Level Live Commerce API Service
 * Comprehensive API interface for live streaming commerce with Bangladesh integration
 */

const BASE_URL = '/api/v1/live-commerce';

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

interface StreamListParams {
  status?: 'live' | 'scheduled' | 'ended' | 'all';
  category?: string;
  language?: string;
  featured?: boolean;
  vendorId?: string;
  hostId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface ChatMessageParams {
  streamId: string;
  message: string;
  messageBn?: string;
  type?: 'message' | 'question' | 'poll_response';
  replyToId?: string;
}

interface PurchaseParams {
  streamId: string;
  productId: string;
  quantity: number;
  paymentMethod: string;
  specialPrice?: number;
  flashSaleId?: string;
}

interface AnalyticsParams {
  streamId: string;
  startDate?: Date;
  endDate?: Date;
  metrics?: string[];
}

interface NotificationParams {
  streamId: string;
  type: 'stream_starting' | 'stream_reminder' | 'flash_sale_alert' | 'product_available' | 'host_live' | 'new_follower';
  recipientType: 'followers' | 'subscribers' | 'all_users' | 'targeted_audience' | 'vip_users';
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  scheduledFor?: Date;
}

// Helper function for API calls
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Live Commerce Session Management
export const liveCommerceApi = {
  // Session Management
  async getSessions(params: StreamListParams = {}): Promise<PaginatedResponse<LiveCommerceSession>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/sessions${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiRequest<LiveCommerceSession[]>(endpoint);
  },

  async getSession(sessionId: string): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>(`/sessions/${sessionId}`);
  },

  async createSession(sessionData: InsertLiveCommerceSession): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  async updateSession(sessionId: string, sessionData: Partial<InsertLiveCommerceSession>): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    });
  },

  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  },

  // Session Control
  async startSession(sessionId: string): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>(`/sessions/${sessionId}/start`, {
      method: 'POST'
    });
  },

  async endSession(sessionId: string): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>(`/sessions/${sessionId}/end`, {
      method: 'POST'
    });
  },

  async pauseSession(sessionId: string): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>(`/sessions/${sessionId}/pause`, {
      method: 'POST'
    });
  },

  async resumeSession(sessionId: string): Promise<ApiResponse<LiveCommerceSession>> {
    return apiRequest<LiveCommerceSession>(`/sessions/${sessionId}/resume`, {
      method: 'POST'
    });
  },

  // Viewer Management
  async joinSession(sessionId: string, deviceInfo?: any): Promise<ApiResponse<LiveStreamViewer>> {
    return apiRequest<LiveStreamViewer>(`/sessions/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify({ deviceInfo })
    });
  },

  async leaveSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/sessions/${sessionId}/leave`, {
      method: 'POST'
    });
  },

  async getViewers(sessionId: string): Promise<ApiResponse<LiveStreamViewer[]>> {
    return apiRequest<LiveStreamViewer[]>(`/sessions/${sessionId}/viewers`);
  },

  async getViewerStats(sessionId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/sessions/${sessionId}/viewers/stats`);
  },

  // Chat and Interactions
  async sendMessage(messageData: ChatMessageParams): Promise<ApiResponse<LiveStreamInteraction>> {
    return apiRequest<LiveStreamInteraction>('/chat/send', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },

  async getChatMessages(sessionId: string, limit?: number, offset?: number): Promise<ApiResponse<LiveStreamInteraction[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return apiRequest<LiveStreamInteraction[]>(`/sessions/${sessionId}/chat${params.toString() ? `?${params}` : ''}`);
  },

  async moderateMessage(interactionId: string, action: 'approve' | 'reject' | 'hide' | 'pin'): Promise<ApiResponse<LiveStreamInteraction>> {
    return apiRequest<LiveStreamInteraction>(`/chat/${interactionId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  async reactToMessage(interactionId: string, reaction: 'like' | 'heart' | 'thumbs_up'): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/chat/${interactionId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reaction })
    });
  },

  // Product Management
  async getSessionProducts(sessionId: string): Promise<ApiResponse<LiveCommerceProduct[]>> {
    return apiRequest<LiveCommerceProduct[]>(`/sessions/${sessionId}/products`);
  },

  async addProductToSession(sessionId: string, productData: InsertLiveCommerceProduct): Promise<ApiResponse<LiveCommerceProduct>> {
    return apiRequest<LiveCommerceProduct>(`/sessions/${sessionId}/products`, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateSessionProduct(sessionId: string, productId: string, productData: Partial<InsertLiveCommerceProduct>): Promise<ApiResponse<LiveCommerceProduct>> {
    return apiRequest<LiveCommerceProduct>(`/sessions/${sessionId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async highlightProduct(sessionId: string, productId: string, highlight: boolean): Promise<ApiResponse<LiveCommerceProduct>> {
    return apiRequest<LiveCommerceProduct>(`/sessions/${sessionId}/products/${productId}/highlight`, {
      method: 'POST',
      body: JSON.stringify({ highlight })
    });
  },

  // Purchase Management
  async purchaseProduct(purchaseData: PurchaseParams): Promise<ApiResponse<LiveStreamPurchase>> {
    return apiRequest<LiveStreamPurchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
  },

  async getPurchases(sessionId: string): Promise<ApiResponse<LiveStreamPurchase[]>> {
    return apiRequest<LiveStreamPurchase[]>(`/sessions/${sessionId}/purchases`);
  },

  async getUserPurchases(userId: string): Promise<ApiResponse<LiveStreamPurchase[]>> {
    return apiRequest<LiveStreamPurchase[]>(`/users/${userId}/purchases`);
  },

  // Host Management
  async getHosts(params?: { verified?: boolean; level?: string; page?: number; limit?: number }): Promise<PaginatedResponse<LiveCommerceHost>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return apiRequest<LiveCommerceHost[]>(`/hosts${queryParams.toString() ? `?${queryParams}` : ''}`);
  },

  async getHost(hostId: string): Promise<ApiResponse<LiveCommerceHost>> {
    return apiRequest<LiveCommerceHost>(`/hosts/${hostId}`);
  },

  async createHost(hostData: InsertLiveCommerceHost): Promise<ApiResponse<LiveCommerceHost>> {
    return apiRequest<LiveCommerceHost>('/hosts', {
      method: 'POST',
      body: JSON.stringify(hostData)
    });
  },

  async updateHost(hostId: string, hostData: Partial<InsertLiveCommerceHost>): Promise<ApiResponse<LiveCommerceHost>> {
    return apiRequest<LiveCommerceHost>(`/hosts/${hostId}`, {
      method: 'PUT',
      body: JSON.stringify(hostData)
    });
  },

  async followHost(hostId: string): Promise<ApiResponse<LiveStreamFollow>> {
    return apiRequest<LiveStreamFollow>(`/hosts/${hostId}/follow`, {
      method: 'POST'
    });
  },

  async unfollowHost(hostId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/hosts/${hostId}/unfollow`, {
      method: 'POST'
    });
  },

  async getHostFollowers(hostId: string): Promise<ApiResponse<LiveStreamFollow[]>> {
    return apiRequest<LiveStreamFollow[]>(`/hosts/${hostId}/followers`);
  },

  // Analytics
  async getAnalytics(params: AnalyticsParams): Promise<ApiResponse<LiveStreamAnalytics>> {
    return apiRequest<LiveStreamAnalytics>('/analytics', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async getSessionAnalytics(sessionId: string): Promise<ApiResponse<LiveStreamAnalytics>> {
    return apiRequest<LiveStreamAnalytics>(`/sessions/${sessionId}/analytics`);
  },

  async getHostAnalytics(hostId: string, period?: string): Promise<ApiResponse<any>> {
    const params = period ? `?period=${period}` : '';
    return apiRequest<any>(`/hosts/${hostId}/analytics${params}`);
  },

  async getRevenueAnalytics(params: { startDate?: Date; endDate?: Date; vendorId?: string }): Promise<ApiResponse<any>> {
    return apiRequest<any>('/analytics/revenue', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Flash Sales
  async getFlashSales(sessionId?: string): Promise<ApiResponse<FlashSale[]>> {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return apiRequest<FlashSale[]>(`/flash-sales${params}`);
  },

  async createFlashSale(flashSaleData: InsertFlashSale): Promise<ApiResponse<FlashSale>> {
    return apiRequest<FlashSale>('/flash-sales', {
      method: 'POST',
      body: JSON.stringify(flashSaleData)
    });
  },

  async updateFlashSale(flashSaleId: string, flashSaleData: Partial<InsertFlashSale>): Promise<ApiResponse<FlashSale>> {
    return apiRequest<FlashSale>(`/flash-sales/${flashSaleId}`, {
      method: 'PUT',
      body: JSON.stringify(flashSaleData)
    });
  },

  async purchaseFlashSale(flashSaleId: string, quantity: number): Promise<ApiResponse<LiveStreamPurchase>> {
    return apiRequest<LiveStreamPurchase>(`/flash-sales/${flashSaleId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    });
  },

  // Notifications
  async sendNotification(notificationData: NotificationParams): Promise<ApiResponse<LiveStreamNotification>> {
    return apiRequest<LiveStreamNotification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  },

  async getNotifications(userId?: string): Promise<ApiResponse<LiveStreamNotification[]>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiRequest<LiveStreamNotification[]>(`/notifications${params}`);
  },

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/notifications/${notificationId}/read`, {
      method: 'POST'
    });
  },

  // Recordings
  async getRecordings(sessionId?: string): Promise<ApiResponse<LiveStreamRecording[]>> {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return apiRequest<LiveStreamRecording[]>(`/recordings${params}`);
  },

  async getRecording(recordingId: string): Promise<ApiResponse<LiveStreamRecording>> {
    return apiRequest<LiveStreamRecording>(`/recordings/${recordingId}`);
  },

  async createRecording(recordingData: InsertLiveStreamRecording): Promise<ApiResponse<LiveStreamRecording>> {
    return apiRequest<LiveStreamRecording>('/recordings', {
      method: 'POST',
      body: JSON.stringify(recordingData)
    });
  },

  async updateRecording(recordingId: string, recordingData: Partial<InsertLiveStreamRecording>): Promise<ApiResponse<LiveStreamRecording>> {
    return apiRequest<LiveStreamRecording>(`/recordings/${recordingId}`, {
      method: 'PUT',
      body: JSON.stringify(recordingData)
    });
  },

  // Polls
  async getPolls(sessionId: string): Promise<ApiResponse<LiveStreamPoll[]>> {
    return apiRequest<LiveStreamPoll[]>(`/sessions/${sessionId}/polls`);
  },

  async createPoll(pollData: InsertLiveStreamPoll): Promise<ApiResponse<LiveStreamPoll>> {
    return apiRequest<LiveStreamPoll>('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData)
    });
  },

  async votePoll(pollId: string, selectedOption: string): Promise<ApiResponse<LiveStreamPollResponse>> {
    return apiRequest<LiveStreamPollResponse>(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ selectedOption })
    });
  },

  async endPoll(pollId: string): Promise<ApiResponse<LiveStreamPoll>> {
    return apiRequest<LiveStreamPoll>(`/polls/${pollId}/end`, {
      method: 'POST'
    });
  },

  async getPollResults(pollId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/polls/${pollId}/results`);
  },

  // Gifts
  async sendGift(giftData: InsertLiveStreamGift): Promise<ApiResponse<LiveStreamGift>> {
    return apiRequest<LiveStreamGift>('/gifts', {
      method: 'POST',
      body: JSON.stringify(giftData)
    });
  },

  async getGifts(sessionId: string): Promise<ApiResponse<LiveStreamGift[]>> {
    return apiRequest<LiveStreamGift[]>(`/sessions/${sessionId}/gifts`);
  },

  async getGiftTypes(): Promise<ApiResponse<any[]>> {
    return apiRequest<any[]>('/gifts/types');
  },

  // Moderation
  async assignModerator(sessionId: string, moderatorId: string, permissions: any): Promise<ApiResponse<LiveStreamModerator>> {
    return apiRequest<LiveStreamModerator>(`/sessions/${sessionId}/moderators`, {
      method: 'POST',
      body: JSON.stringify({ moderatorId, permissions })
    });
  },

  async removeModerator(sessionId: string, moderatorId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/sessions/${sessionId}/moderators/${moderatorId}`, {
      method: 'DELETE'
    });
  },

  async getModerators(sessionId: string): Promise<ApiResponse<LiveStreamModerator[]>> {
    return apiRequest<LiveStreamModerator[]>(`/sessions/${sessionId}/moderators`);
  },

  // Categories
  async getCategories(): Promise<ApiResponse<LiveStreamCategory[]>> {
    return apiRequest<LiveStreamCategory[]>('/categories');
  },

  async createCategory(categoryData: InsertLiveStreamCategory): Promise<ApiResponse<LiveStreamCategory>> {
    return apiRequest<LiveStreamCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  // Badges
  async getUserBadges(userId: string): Promise<ApiResponse<LiveStreamBadge[]>> {
    return apiRequest<LiveStreamBadge[]>(`/users/${userId}/badges`);
  },

  async awardBadge(badgeData: InsertLiveStreamBadge): Promise<ApiResponse<LiveStreamBadge>> {
    return apiRequest<LiveStreamBadge>('/badges', {
      method: 'POST',
      body: JSON.stringify(badgeData)
    });
  },

  async getBadgeTypes(): Promise<ApiResponse<any[]>> {
    return apiRequest<any[]>('/badges/types');
  },

  // Bangladesh-specific features
  async getBangladeshStats(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/bangladesh/stats');
  },

  async getFestivalStreams(): Promise<ApiResponse<LiveCommerceSession[]>> {
    return apiRequest<LiveCommerceSession[]>('/bangladesh/festivals');
  },

  async getMobileBankingStats(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/bangladesh/mobile-banking');
  },

  async getCulturalTrends(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/bangladesh/cultural-trends');
  },

  // Search and Discovery
  async searchStreams(query: string, filters?: any): Promise<ApiResponse<LiveCommerceSession[]>> {
    return apiRequest<LiveCommerceSession[]>('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters })
    });
  },

  async getTrendingStreams(period?: string): Promise<ApiResponse<LiveCommerceSession[]>> {
    const params = period ? `?period=${period}` : '';
    return apiRequest<LiveCommerceSession[]>(`/trending${params}`);
  },

  async getRecommendedStreams(userId?: string): Promise<ApiResponse<LiveCommerceSession[]>> {
    const params = userId ? `?userId=${userId}` : '';
    return apiRequest<LiveCommerceSession[]>(`/recommended${params}`);
  },

  // Health and Status
  async getServiceHealth(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/health');
  },

  async getServiceStats(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/stats');
  }
};

export default liveCommerceApi;