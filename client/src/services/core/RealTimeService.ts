/**
 * RealTimeService - Real-time features with WebSocket, live sessions, presence tracking, and messaging
 */

import ApiService from './ApiService';

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  protocols?: string[];
}

export interface RealTimeMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  sender?: string;
  channel?: string;
  metadata?: Record<string, any>;
}

export interface PresenceData {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  metadata?: Record<string, any>;
}

export interface LiveSession {
  id: string;
  type: 'streaming' | 'chat' | 'collaboration' | 'gaming';
  participants: string[];
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  expiry?: number;
  metadata?: Record<string, any>;
}

class RealTimeService {
  private static instance: RealTimeService;
  private apiService: typeof ApiService;
  private websocket: WebSocket | null = null;
  private config: WebSocketConfig;
  private messageListeners: Map<string, Array<(message: RealTimeMessage) => void>> = new Map();
  private presenceListeners: Array<(presence: PresenceData[]) => void> = [];
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private presenceData: Map<string, PresenceData> = new Map();
  private liveSessions: Map<string, LiveSession> = new Map();
  private messageQueue: RealTimeMessage[] = [];

  private constructor() {
    this.apiService = ApiService;
    this.config = {
      url: this.getWebSocketUrl(),
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      protocols: ['echo-protocol']
    };
  }

  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.config.url, this.config.protocols);
        
        this.websocket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          this.notifyConnectionListeners(true);
          resolve();
        };

        this.websocket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.websocket.onclose = () => {
          this.isConnected = false;
          this.stopHeartbeat();
          this.notifyConnectionListeners(false);
          this.attemptReconnect();
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.notifyConnectionListeners(false);
  }

  /**
   * Send message
   */
  public send(message: Omit<RealTimeMessage, 'id' | 'timestamp'>): void {
    const fullMessage: RealTimeMessage = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      ...message
    };

    if (this.isConnected && this.websocket) {
      this.websocket.send(JSON.stringify(fullMessage));
    } else {
      this.messageQueue.push(fullMessage);
    }
  }

  /**
   * Subscribe to messages
   */
  public subscribe(
    type: string,
    listener: (message: RealTimeMessage) => void
  ): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }
    
    this.messageListeners.get(type)!.push(listener);
    
    return () => {
      const listeners = this.messageListeners.get(type) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Unsubscribe from messages
   */
  public unsubscribe(type: string, listener?: (message: RealTimeMessage) => void): void {
    if (listener) {
      const listeners = this.messageListeners.get(type) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.messageListeners.delete(type);
    }
  }

  /**
   * Join channel
   */
  public joinChannel(channel: string): void {
    this.send({
      type: 'join_channel',
      data: { channel },
      channel
    });
  }

  /**
   * Leave channel
   */
  public leaveChannel(channel: string): void {
    this.send({
      type: 'leave_channel',
      data: { channel },
      channel
    });
  }

  /**
   * Send message to channel
   */
  public sendToChannel(channel: string, type: string, data: any): void {
    this.send({
      type,
      data,
      channel
    });
  }

  /**
   * Update presence
   */
  public updatePresence(
    status: 'online' | 'away' | 'busy' | 'offline',
    metadata?: Record<string, any>
  ): void {
    this.send({
      type: 'presence_update',
      data: {
        status,
        metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Get presence data
   */
  public getPresenceData(): PresenceData[] {
    return Array.from(this.presenceData.values());
  }

  /**
   * Subscribe to presence updates
   */
  public subscribeToPresence(listener: (presence: PresenceData[]) => void): () => void {
    this.presenceListeners.push(listener);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(l => l !== listener);
    };
  }

  /**
   * Create live session
   */
  public async createLiveSession(
    type: 'streaming' | 'chat' | 'collaboration' | 'gaming',
    metadata?: Record<string, any>
  ): Promise<LiveSession> {
    const response = await this.apiService.post('/realtime/sessions', {
      type,
      metadata
    });
    
    const session = response.data;
    this.liveSessions.set(session.id, session);
    
    return session;
  }

  /**
   * Join live session
   */
  public async joinLiveSession(sessionId: string): Promise<LiveSession> {
    const response = await this.apiService.post(`/realtime/sessions/${sessionId}/join`);
    const session = response.data;
    
    this.liveSessions.set(session.id, session);
    this.joinChannel(`session_${sessionId}`);
    
    return session;
  }

  /**
   * Leave live session
   */
  public async leaveLiveSession(sessionId: string): Promise<void> {
    await this.apiService.post(`/realtime/sessions/${sessionId}/leave`);
    this.liveSessions.delete(sessionId);
    this.leaveChannel(`session_${sessionId}`);
  }

  /**
   * Get live session
   */
  public async getLiveSession(sessionId: string): Promise<LiveSession | null> {
    try {
      const response = await this.apiService.get(`/realtime/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get active live sessions
   */
  public async getActiveLiveSessions(): Promise<LiveSession[]> {
    const response = await this.apiService.get('/realtime/sessions/active');
    return response.data;
  }

  /**
   * Send notification
   */
  public sendNotification(notification: NotificationData): void {
    this.send({
      type: 'notification',
      data: notification
    });
  }

  /**
   * Subscribe to notifications
   */
  public subscribeToNotifications(
    listener: (notification: NotificationData) => void
  ): () => void {
    return this.subscribe('notification', (message) => {
      listener(message.data);
    });
  }

  /**
   * Start screen sharing
   */
  public async startScreenShare(sessionId: string): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    this.send({
      type: 'screen_share_start',
      data: { sessionId },
      channel: `session_${sessionId}`
    });

    return stream;
  }

  /**
   * Stop screen sharing
   */
  public stopScreenShare(sessionId: string, stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
    
    this.send({
      type: 'screen_share_stop',
      data: { sessionId },
      channel: `session_${sessionId}`
    });
  }

  /**
   * Start voice chat
   */
  public async startVoiceChat(sessionId: string): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    this.send({
      type: 'voice_chat_start',
      data: { sessionId },
      channel: `session_${sessionId}`
    });

    return stream;
  }

  /**
   * Stop voice chat
   */
  public stopVoiceChat(sessionId: string, stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
    
    this.send({
      type: 'voice_chat_stop',
      data: { sessionId },
      channel: `session_${sessionId}`
    });
  }

  /**
   * Subscribe to connection status
   */
  public subscribeToConnection(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  /**
   * Get connection status
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  public getConfig(): WebSocketConfig {
    return { ...this.config };
  }

  /**
   * Get message queue size
   */
  public getMessageQueueSize(): number {
    return this.messageQueue.length;
  }

  /**
   * Clear message queue
   */
  public clearMessageQueue(): void {
    this.messageQueue = [];
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message: RealTimeMessage = JSON.parse(data);
      
      // Handle presence updates
      if (message.type === 'presence_update') {
        this.handlePresenceUpdate(message.data);
      }
      
      // Handle session updates
      if (message.type === 'session_update') {
        this.handleSessionUpdate(message.data);
      }
      
      // Notify listeners
      const listeners = this.messageListeners.get(message.type) || [];
      listeners.forEach(listener => listener(message));
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  /**
   * Handle presence update
   */
  private handlePresenceUpdate(data: PresenceData): void {
    this.presenceData.set(data.userId, data);
    this.notifyPresenceListeners();
  }

  /**
   * Handle session update
   */
  private handleSessionUpdate(data: LiveSession): void {
    this.liveSessions.set(data.id, data);
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.websocket) {
        this.websocket.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Attempt reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Process message queue
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected && this.websocket) {
      const message = this.messageQueue.shift()!;
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Notify connection listeners
   */
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  /**
   * Notify presence listeners
   */
  private notifyPresenceListeners(): void {
    const presenceArray = Array.from(this.presenceData.values());
    this.presenceListeners.forEach(listener => listener(presenceArray));
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }
}

export default RealTimeService.getInstance();