/**
 * RealTimeService - Unified Real-Time Features Service
 * Consolidates all real-time functionality
 * 
 * Consolidates:
 * - RealtimeApiService.js
 * - WebSocket connections
 * - Live updates
 * - Real-time notifications
 * - Live commerce features
 */

import ApiService from './ApiService';

interface RealTimeConfig {
  websocketUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enableAutoReconnect: boolean;
  enableLogging: boolean;
  channels: string[];
  authentication: boolean;
}

interface RealTimeMessage {
  id: string;
  type: RealTimeMessageType;
  channel: string;
  data: any;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

interface RealTimeSubscription {
  id: string;
  channel: string;
  callback: (message: RealTimeMessage) => void;
  filters?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

interface LiveSession {
  id: string;
  type: LiveSessionType;
  title: string;
  description: string;
  hostId: string;
  status: LiveSessionStatus;
  participantCount: number;
  maxParticipants: number;
  startTime: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

interface LiveMessage {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  message: string;
  type: LiveMessageType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface LiveReaction {
  id: string;
  sessionId: string;
  userId: string;
  type: LiveReactionType;
  count: number;
  timestamp: Date;
}

interface PresenceStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  metadata?: Record<string, any>;
}

type RealTimeMessageType = 
  | 'chat' 
  | 'notification' 
  | 'update' 
  | 'system' 
  | 'order' 
  | 'product' 
  | 'user' 
  | 'live_session' 
  | 'presence' 
  | 'reaction';

type LiveSessionType = 
  | 'product_demo' 
  | 'live_shopping' 
  | 'q_and_a' 
  | 'webinar' 
  | 'customer_support' 
  | 'vendor_meeting';

type LiveSessionStatus = 
  | 'scheduled' 
  | 'live' 
  | 'ended' 
  | 'cancelled';

type LiveMessageType = 
  | 'text' 
  | 'emoji' 
  | 'system' 
  | 'product_link' 
  | 'image' 
  | 'question';

type LiveReactionType = 
  | 'like' 
  | 'love' 
  | 'wow' 
  | 'haha' 
  | 'sad' 
  | 'angry' 
  | 'fire' 
  | 'heart' 
  | 'thumbs_up' 
  | 'thumbs_down';

interface RealTimeStats {
  activeConnections: number;
  totalMessages: number;
  messagesPerMinute: number;
  activeChannels: number;
  liveSessions: number;
  averageLatency: number;
  connectionUptime: number;
}

class RealTimeService {
  private static instance: RealTimeService;
  private config: RealTimeConfig;
  private websocket: WebSocket | null = null;
  private subscriptions: Map<string, RealTimeSubscription> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: RealTimeMessage[] = [];
  private presenceStatus: PresenceStatus | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      websocketUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableAutoReconnect: true,
      enableLogging: process.env.NODE_ENV === 'development',
      channels: ['general', 'notifications', 'orders', 'products'],
      authentication: true,
    };

    this.initializeService();
  }

  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  private async initializeService(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Connect to WebSocket
      await this.connect();
      
      // Setup presence tracking
      this.setupPresenceTracking();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing real-time service:', error);
    }
  }

  // WebSocket connection management
  public async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';
    this.log('Connecting to WebSocket...');

    try {
      const token = localStorage.getItem('authToken');
      const wsUrl = this.config.authentication && token 
        ? `${this.config.websocketUrl}?token=${token}`
        : this.config.websocketUrl;

      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = this.onWebSocketOpen.bind(this);
      this.websocket.onmessage = this.onWebSocketMessage.bind(this);
      this.websocket.onclose = this.onWebSocketClose.bind(this);
      this.websocket.onerror = this.onWebSocketError.bind(this);

    } catch (error) {
      this.log('Error connecting to WebSocket:', error);
      this.connectionState = 'disconnected';
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.log('Disconnecting from WebSocket...');
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
  }

  private onWebSocketOpen(): void {
    this.log('WebSocket connected');
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Send queued messages
    this.sendQueuedMessages();

    // Resubscribe to channels
    this.resubscribeToChannels();
  }

  private onWebSocketMessage(event: MessageEvent): void {
    try {
      const message: RealTimeMessage = JSON.parse(event.data);
      this.handleMessage(message);
    } catch (error) {
      this.log('Error parsing WebSocket message:', error);
    }
  }

  private onWebSocketClose(event: CloseEvent): void {
    this.log('WebSocket disconnected:', event.code, event.reason);
    this.connectionState = 'disconnected';

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.config.enableAutoReconnect && event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private onWebSocketError(error: Event): void {
    this.log('WebSocket error:', error);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnect attempts reached');
      return;
    }

    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({
        type: 'system',
        channel: 'heartbeat',
        data: { timestamp: Date.now() },
      });
    }, this.config.heartbeatInterval);
  }

  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private resubscribeToChannels(): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.isActive) {
        this.sendMessage({
          type: 'system',
          channel: 'subscribe',
          data: { channel: subscription.channel },
        });
      }
    });
  }

  // Message handling
  private handleMessage(message: RealTimeMessage): void {
    this.log('Received message:', message);

    // Handle system messages
    if (message.type === 'system') {
      this.handleSystemMessage(message);
      return;
    }

    // Route message to subscribers
    this.subscriptions.forEach((subscription) => {
      if (subscription.channel === message.channel && subscription.isActive) {
        try {
          subscription.callback(message);
        } catch (error) {
          this.log('Error in message callback:', error);
        }
      }
    });
  }

  private handleSystemMessage(message: RealTimeMessage): void {
    switch (message.channel) {
      case 'heartbeat':
        // Heartbeat response - no action needed
        break;
      case 'presence':
        this.handlePresenceUpdate(message.data);
        break;
      case 'error':
        this.log('Server error:', message.data);
        break;
      default:
        this.log('Unknown system message:', message);
    }
  }

  private handlePresenceUpdate(data: any): void {
    // Update presence status
    if (data.userId && data.status) {
      // Handle presence update
      this.log('Presence update:', data);
    }
  }

  // Channel subscription
  public subscribe(channel: string, callback: (message: RealTimeMessage) => void, filters?: Record<string, any>): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: RealTimeSubscription = {
      id: subscriptionId,
      channel,
      callback,
      filters,
      isActive: true,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscription message if connected
    if (this.connectionState === 'connected') {
      this.sendMessage({
        type: 'system',
        channel: 'subscribe',
        data: { channel, filters },
      });
    }

    this.log(`Subscribed to channel: ${channel}`);
    return subscriptionId;
  }

  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);

      // Send unsubscription message if connected
      if (this.connectionState === 'connected') {
        this.sendMessage({
          type: 'system',
          channel: 'unsubscribe',
          data: { channel: subscription.channel },
        });
      }

      this.log(`Unsubscribed from channel: ${subscription.channel}`);
    }
  }

  public unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      this.unsubscribe(subscription.id);
    });
  }

  // Message sending
  public sendMessage(message: Omit<RealTimeMessage, 'id' | 'timestamp'>): void {
    const fullMessage: RealTimeMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...message,
    };

    if (this.connectionState === 'connected' && this.websocket) {
      try {
        this.websocket.send(JSON.stringify(fullMessage));
        this.log('Sent message:', fullMessage);
      } catch (error) {
        this.log('Error sending message:', error);
        this.messageQueue.push(fullMessage);
      }
    } else {
      this.messageQueue.push(fullMessage);
    }
  }

  public sendChatMessage(channel: string, message: string, metadata?: Record<string, any>): void {
    this.sendMessage({
      type: 'chat',
      channel,
      data: { message, metadata },
    });
  }

  public sendNotification(userId: string, title: string, content: string, metadata?: Record<string, any>): void {
    this.sendMessage({
      type: 'notification',
      channel: `user_${userId}`,
      data: { title, content, metadata },
    });
  }

  public sendUpdate(channel: string, updateType: string, data: any): void {
    this.sendMessage({
      type: 'update',
      channel,
      data: { updateType, ...data },
    });
  }

  // Live sessions
  public async createLiveSession(session: Omit<LiveSession, 'id' | 'participantCount' | 'status'>): Promise<{ success: boolean; session?: LiveSession; error?: string }> {
    try {
      const response = await ApiService.post<LiveSession>('/live-sessions', session);
      
      if (response.status === 201) {
        // Subscribe to session updates
        this.subscribe(`live_session_${response.data.id}`, (message) => {
          this.handleLiveSessionUpdate(message);
        });

        return { success: true, session: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async joinLiveSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post(`/live-sessions/${sessionId}/join`);
      
      if (response.status === 200) {
        // Subscribe to session messages
        this.subscribe(`live_session_${sessionId}`, (message) => {
          this.handleLiveSessionMessage(message);
        });

        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async leaveLiveSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post(`/live-sessions/${sessionId}/leave`);
      
      if (response.status === 200) {
        // Unsubscribe from session
        this.subscriptions.forEach((subscription) => {
          if (subscription.channel === `live_session_${sessionId}`) {
            this.unsubscribe(subscription.id);
          }
        });

        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public sendLiveMessage(sessionId: string, message: string, type: LiveMessageType = 'text'): void {
    this.sendMessage({
      type: 'live_session',
      channel: `live_session_${sessionId}`,
      data: {
        action: 'message',
        message,
        messageType: type,
      },
    });
  }

  public sendLiveReaction(sessionId: string, reactionType: LiveReactionType): void {
    this.sendMessage({
      type: 'live_session',
      channel: `live_session_${sessionId}`,
      data: {
        action: 'reaction',
        reactionType,
      },
    });
  }

  private handleLiveSessionUpdate(message: RealTimeMessage): void {
    this.log('Live session update:', message);
    // Handle session updates (participant count, status changes, etc.)
  }

  private handleLiveSessionMessage(message: RealTimeMessage): void {
    this.log('Live session message:', message);
    // Handle session messages and reactions
  }

  // Presence tracking
  private setupPresenceTracking(): void {
    // Set initial presence
    this.setPresence('online');

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setPresence('away');
      } else {
        this.setPresence('online');
      }
    });

    // Track user activity
    let lastActivity = Date.now();
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      lastActivity = Date.now();
      if (this.presenceStatus?.status === 'away') {
        this.setPresence('online');
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity
    setInterval(() => {
      if (Date.now() - lastActivity > 300000) { // 5 minutes
        this.setPresence('away');
      }
    }, 60000); // Check every minute
  }

  public setPresence(status: 'online' | 'offline' | 'away' | 'busy', metadata?: Record<string, any>): void {
    this.presenceStatus = {
      userId: this.getCurrentUserId(),
      status,
      lastSeen: new Date(),
      metadata,
    };

    this.sendMessage({
      type: 'presence',
      channel: 'presence',
      data: this.presenceStatus,
    });
  }

  public getPresence(): PresenceStatus | null {
    return this.presenceStatus;
  }

  // Order updates
  public subscribeToOrderUpdates(orderId: string, callback: (update: any) => void): string {
    return this.subscribe(`order_${orderId}`, (message) => {
      if (message.type === 'order') {
        callback(message.data);
      }
    });
  }

  public subscribeToUserOrders(userId: string, callback: (update: any) => void): string {
    return this.subscribe(`user_orders_${userId}`, (message) => {
      if (message.type === 'order') {
        callback(message.data);
      }
    });
  }

  // Product updates
  public subscribeToProductUpdates(productId: string, callback: (update: any) => void): string {
    return this.subscribe(`product_${productId}`, (message) => {
      if (message.type === 'product') {
        callback(message.data);
      }
    });
  }

  public subscribeToInventoryUpdates(callback: (update: any) => void): string {
    return this.subscribe('inventory', (message) => {
      if (message.type === 'product' && message.data.updateType === 'inventory') {
        callback(message.data);
      }
    });
  }

  // Statistics
  public async getStats(): Promise<RealTimeStats> {
    try {
      const response = await ApiService.get<RealTimeStats>('/realtime/stats');
      return response.status === 200 ? response.data : this.getDefaultStats();
    } catch (error) {
      return this.getDefaultStats();
    }
  }

  public getConnectionState(): string {
    return this.connectionState;
  }

  public getActiveSubscriptions(): RealTimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
  }

  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  // Configuration
  public updateConfig(config: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): RealTimeConfig {
    return { ...this.config };
  }

  // Helper methods
  private getCurrentUserId(): string {
    // Get current user ID from auth service or localStorage
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getDefaultStats(): RealTimeStats {
    return {
      activeConnections: 0,
      totalMessages: 0,
      messagesPerMinute: 0,
      activeChannels: 0,
      liveSessions: 0,
      averageLatency: 0,
      connectionUptime: 0,
    };
  }

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[RealTimeService] ${message}`, data);
    }
  }

  // Cleanup
  public destroy(): void {
    this.disconnect();
    this.unsubscribeAll();
  }
}

export default RealTimeService.getInstance();
export {
  RealTimeService,
  RealTimeConfig,
  RealTimeMessage,
  RealTimeSubscription,
  LiveSession,
  LiveMessage,
  LiveReaction,
  PresenceStatus,
  RealTimeMessageType,
  LiveSessionType,
  LiveSessionStatus,
  LiveMessageType,
  LiveReactionType,
  RealTimeStats,
};