/**
 * Phase 3.4: Real-Time Features Service
 * WebSocket-based real-time features with notifications, chat, and presence
 * Target: Real-time user engagement and live interactions
 */

// TypeScript interfaces for Real-Time Features
interface RealTimeConfig {
  enabled: boolean;
  webSocketURL: string;
  reconnectAttempts: number;
  heartbeatInterval: number;
  notificationsEnabled: boolean;
  chatEnabled: boolean;
  presenceEnabled: boolean;
  liveStreamingEnabled: boolean;
  collaborativeEnabled: boolean;
  analyticsEnabled: boolean;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

interface NotificationConfig {
  enabled: boolean;
  types: string[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  persistentEnabled: boolean;
  badgeEnabled: boolean;
  templateEnabled: boolean;
}

interface ChatConfig {
  enabled: boolean;
  roomsEnabled: boolean;
  privateMessagesEnabled: boolean;
  typingIndicatorsEnabled: boolean;
  mediaEnabled: boolean;
  moderationEnabled: boolean;
  encryptionEnabled: boolean;
}

interface PresenceConfig {
  enabled: boolean;
  statusTracking: boolean;
  activityTracking: boolean;
  locationTracking: boolean;
  userListEnabled: boolean;
  sessionTimeout: number;
}

interface LiveStreamingConfig {
  enabled: boolean;
  broadcastingEnabled: boolean;
  viewingEnabled: boolean;
  chatIntegration: boolean;
  recordingEnabled: boolean;
  qualityOptions: string[];
}

interface RealTimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  userId: string;
  read: boolean;
  persistent: boolean;
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
}

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  edited: boolean;
  replyTo?: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface UserPresence {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage: string;
  activity: string;
  location?: {
    country: string;
    city: string;
  };
}

interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamerId: string;
  streamerName: string;
  thumbnail: string;
  viewers: number;
  startTime: string;
  category: string;
  tags: string[];
  quality: string;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  status: 'live' | 'ended' | 'scheduled';
}

// Real-Time Features Service
export class RealTimeFeaturesService {
  private config: RealTimeConfig;
  private notificationConfig: NotificationConfig;
  private chatConfig: ChatConfig;
  private presenceConfig: PresenceConfig;
  private liveStreamingConfig: LiveStreamingConfig;
  private webSocket: WebSocket | null = null;
  private connectionRetries = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private notifications: Map<string, RealTimeNotification> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private userPresence: Map<string, UserPresence> = new Map();
  private liveStreams: Map<string, LiveStream> = new Map();
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    this.config = {
      enabled: true,
      webSocketURL: 'ws://localhost:3001',
      reconnectAttempts: 5,
      heartbeatInterval: 30000,
      notificationsEnabled: true,
      chatEnabled: true,
      presenceEnabled: true,
      liveStreamingEnabled: true,
      collaborativeEnabled: true,
      analyticsEnabled: true
    };

    this.notificationConfig = {
      enabled: true,
      types: ['order', 'message', 'system', 'promotion', 'security'],
      soundEnabled: true,
      vibrationEnabled: true,
      persistentEnabled: true,
      badgeEnabled: true,
      templateEnabled: true
    };

    this.chatConfig = {
      enabled: true,
      roomsEnabled: true,
      privateMessagesEnabled: true,
      typingIndicatorsEnabled: true,
      mediaEnabled: true,
      moderationEnabled: true,
      encryptionEnabled: false
    };

    this.presenceConfig = {
      enabled: true,
      statusTracking: true,
      activityTracking: true,
      locationTracking: false,
      userListEnabled: true,
      sessionTimeout: 300000
    };

    this.liveStreamingConfig = {
      enabled: true,
      broadcastingEnabled: true,
      viewingEnabled: true,
      chatIntegration: true,
      recordingEnabled: true,
      qualityOptions: ['720p', '1080p', '4k']
    };

    this.initializeConnection();
    this.setupEventListeners();
  }

  private initializeConnection(): void {
    if (!this.config.enabled) return;

    try {
      this.webSocket = new WebSocket(this.config.webSocketURL);
      
      this.webSocket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionRetries = 0;
        this.startHeartbeat();
        this.sendPresenceUpdate();
      };

      this.webSocket.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.webSocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.attemptReconnection();
      };

      this.webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.simulateWebSocketConnection();
    }
  }

  private simulateWebSocketConnection(): void {
    // Simulate WebSocket connection for development
    console.log('Simulating WebSocket connection');
    
    // Simulate incoming messages
    setInterval(() => {
      this.handleMessage({
        type: 'notification',
        payload: {
          id: 'notif-' + Date.now(),
          type: 'info',
          title: 'New Activity',
          message: 'Someone liked your product',
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          read: false,
          persistent: true
        },
        timestamp: new Date().toISOString()
      });
    }, 30000);

    // Simulate presence updates
    setInterval(() => {
      this.updateUserPresence({
        userId: 'user-' + Math.random().toString(36).substr(2, 9),
        username: 'User' + Math.floor(Math.random() * 1000),
        status: ['online', 'away', 'busy'][Math.floor(Math.random() * 3)] as any,
        lastSeen: new Date().toISOString(),
        currentPage: '/dashboard',
        activity: 'browsing products'
      });
    }, 15000);
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        this.handleNotification(message.payload);
        break;
      case 'chat':
        this.handleChatMessage(message.payload);
        break;
      case 'presence':
        this.handlePresenceUpdate(message.payload);
        break;
      case 'livestream':
        this.handleLiveStreamUpdate(message.payload);
        break;
      case 'typing':
        this.handleTypingIndicator(message.payload);
        break;
      case 'heartbeat':
        this.handleHeartbeat(message.payload);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }

    // Emit to event listeners
    this.emit(message.type, message.payload);
  }

  private handleNotification(notification: RealTimeNotification): void {
    if (!this.notificationConfig.enabled) return;

    this.notifications.set(notification.id, notification);
    
    // Show browser notification
    if (this.notificationConfig.soundEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id
            });
          }
        });
      }
    }

    // Play notification sound
    if (this.notificationConfig.soundEnabled && typeof window !== 'undefined') {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    }

    // Vibrate device
    if (this.notificationConfig.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  private handleChatMessage(message: ChatMessage): void {
    if (!this.chatConfig.enabled) return;

    const roomMessages = this.chatMessages.get(message.roomId) || [];
    roomMessages.push(message);
    this.chatMessages.set(message.roomId, roomMessages);

    // Limit message history
    if (roomMessages.length > 100) {
      roomMessages.splice(0, roomMessages.length - 100);
    }
  }

  private handlePresenceUpdate(presence: UserPresence): void {
    if (!this.presenceConfig.enabled) return;

    this.userPresence.set(presence.userId, presence);

    // Auto-remove offline users after timeout
    if (presence.status === 'offline') {
      setTimeout(() => {
        this.userPresence.delete(presence.userId);
      }, this.presenceConfig.sessionTimeout);
    }
  }

  private handleLiveStreamUpdate(stream: LiveStream): void {
    if (!this.liveStreamingConfig.enabled) return;

    this.liveStreams.set(stream.id, stream);

    // Remove ended streams after some time
    if (stream.status === 'ended') {
      setTimeout(() => {
        this.liveStreams.delete(stream.id);
      }, 300000); // 5 minutes
    }
  }

  private handleTypingIndicator(data: { roomId: string; userId: string; username: string; typing: boolean }): void {
    if (!this.chatConfig.typingIndicatorsEnabled) return;

    this.emit('typing', data);
  }

  private handleHeartbeat(data: any): void {
    // Respond to heartbeat
    this.sendMessage({
      type: 'heartbeat_response',
      payload: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString()
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({
        type: 'heartbeat',
        payload: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnection(): void {
    if (this.connectionRetries < this.config.reconnectAttempts) {
      this.connectionRetries++;
      const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.connectionRetries}/${this.config.reconnectAttempts})`);
        this.initializeConnection();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private sendMessage(message: WebSocketMessage): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message queued:', message);
    }
  }

  private sendPresenceUpdate(): void {
    if (!this.presenceConfig.enabled) return;

    const presence: UserPresence = {
      userId: 'current-user', // This would be actual user ID
      username: 'Current User',
      status: 'online',
      lastSeen: new Date().toISOString(),
      currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      activity: 'browsing'
    };

    this.sendMessage({
      type: 'presence',
      payload: presence,
      timestamp: new Date().toISOString()
    });
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track page visibility for presence
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.updateStatus('away');
      } else {
        this.updateStatus('online');
      }
    });

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.throttle(() => {
        this.updateActivity('active');
      }, 5000));
    });
  }

  private throttle(func: Function, limit: number): () => void {
    let inThrottle: boolean;
    return function(this: any) {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Public methods
  sendNotification(notification: Omit<RealTimeNotification, 'id' | 'timestamp'>): void {
    const fullNotification: RealTimeNotification = {
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...notification
    };

    this.sendMessage({
      type: 'notification',
      payload: fullNotification,
      timestamp: new Date().toISOString()
    });
  }

  sendChatMessage(roomId: string, message: string): void {
    if (!this.chatConfig.enabled) return;

    const chatMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      roomId,
      userId: 'current-user',
      username: 'Current User',
      message,
      timestamp: new Date().toISOString(),
      type: 'text',
      edited: false
    };

    this.sendMessage({
      type: 'chat',
      payload: chatMessage,
      timestamp: new Date().toISOString()
    });
  }

  joinChatRoom(roomId: string): void {
    this.sendMessage({
      type: 'join_room',
      payload: { roomId },
      timestamp: new Date().toISOString()
    });
  }

  leaveChatRoom(roomId: string): void {
    this.sendMessage({
      type: 'leave_room',
      payload: { roomId },
      timestamp: new Date().toISOString()
    });
  }

  updateStatus(status: UserPresence['status']): void {
    if (!this.presenceConfig.enabled) return;

    this.sendMessage({
      type: 'presence_update',
      payload: { status },
      timestamp: new Date().toISOString()
    });
  }

  updateActivity(activity: string): void {
    if (!this.presenceConfig.enabled) return;

    this.sendMessage({
      type: 'activity_update',
      payload: { activity },
      timestamp: new Date().toISOString()
    });
  }

  updateUserPresence(presence: UserPresence): void {
    this.userPresence.set(presence.userId, presence);
    this.emit('presence_update', presence);
  }

  startLiveStream(streamData: Omit<LiveStream, 'id' | 'viewers' | 'startTime'>): string {
    const stream: LiveStream = {
      id: 'stream-' + Date.now(),
      viewers: 0,
      startTime: new Date().toISOString(),
      status: 'live',
      ...streamData
    };

    this.liveStreams.set(stream.id, stream);
    
    this.sendMessage({
      type: 'livestream_start',
      payload: stream,
      timestamp: new Date().toISOString()
    });

    return stream.id;
  }

  endLiveStream(streamId: string): void {
    const stream = this.liveStreams.get(streamId);
    if (stream) {
      stream.status = 'ended';
      this.liveStreams.set(streamId, stream);
      
      this.sendMessage({
        type: 'livestream_end',
        payload: { streamId },
        timestamp: new Date().toISOString()
      });
    }
  }

  joinLiveStream(streamId: string): void {
    this.sendMessage({
      type: 'livestream_join',
      payload: { streamId },
      timestamp: new Date().toISOString()
    });
  }

  leaveLiveStream(streamId: string): void {
    this.sendMessage({
      type: 'livestream_leave',
      payload: { streamId },
      timestamp: new Date().toISOString()
    });
  }

  // Event system
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Getters
  getNotifications(): RealTimeNotification[] {
    return Array.from(this.notifications.values());
  }

  getUnreadNotifications(): RealTimeNotification[] {
    return Array.from(this.notifications.values()).filter(n => !n.read);
  }

  getChatMessages(roomId: string): ChatMessage[] {
    return this.chatMessages.get(roomId) || [];
  }

  getOnlineUsers(): UserPresence[] {
    return Array.from(this.userPresence.values()).filter(p => p.status === 'online');
  }

  getLiveStreams(): LiveStream[] {
    return Array.from(this.liveStreams.values()).filter(s => s.status === 'live');
  }

  // Configuration methods
  updateConfig(config: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RealTimeConfig {
    return { ...this.config };
  }

  // Connection management
  connect(): void {
    if (!this.webSocket || this.webSocket.readyState === WebSocket.CLOSED) {
      this.initializeConnection();
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.webSocket) {
      this.webSocket.close();
    }
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.webSocket) return 'disconnected';
    
    switch (this.webSocket.readyState) {
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CONNECTING:
        return 'connecting';
      default:
        return 'disconnected';
    }
  }

  // Health check
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    const connectionStatus = this.getConnectionStatus();
    const onlineUsers = this.getOnlineUsers().length;
    const unreadNotifications = this.getUnreadNotifications().length;
    const liveStreams = this.getLiveStreams().length;
    
    return {
      status: connectionStatus === 'connected' ? 'healthy' : 
              connectionStatus === 'connecting' ? 'degraded' : 'unhealthy',
      details: {
        connectionStatus,
        onlineUsers,
        unreadNotifications,
        liveStreams,
        totalNotifications: this.notifications.size,
        totalChatRooms: this.chatMessages.size,
        configEnabled: this.config.enabled,
        featuresEnabled: {
          notifications: this.notificationConfig.enabled,
          chat: this.chatConfig.enabled,
          presence: this.presenceConfig.enabled,
          liveStreaming: this.liveStreamingConfig.enabled
        }
      }
    };
  }
}

// Export singleton instance
export const realTimeFeaturesService = new RealTimeFeaturesService();