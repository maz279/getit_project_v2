/**
 * WebSocket Real-time Synchronization Hook
 * Provides enterprise-grade WebSocket connectivity for Amazon.com/Shopee.sg-level
 * real-time features and synchronization
 * 
 * @fileoverview Enterprise WebSocket hook with automatic reconnection and state management
 * @author GetIt Platform Team
 * @version 3.0.0
 * @since Phase 3 Professional Polish Implementation
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * WebSocket connection states
 */
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

/**
 * WebSocket message types for type safety
 */
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

/**
 * WebSocket configuration interface
 */
interface WebSocketConfig {
  url: string;
  protocols?: string[];
  maxReconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  enableHeartbeat: boolean;
  enableAutoReconnect: boolean;
  enableMessageQueue: boolean;
  culturalContext: 'bangladesh' | 'global';
}

/**
 * Real-time features interface
 */
interface RealTimeFeatures {
  liveCart: boolean;
  liveInventory: boolean;
  livePricing: boolean;
  liveNotifications: boolean;
  liveChat: boolean;
  liveTracking: boolean;
  liveAnalytics: boolean;
}

/**
 * WebSocket hook return type
 */
interface WebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (type: string, payload: any) => void;
  subscribe: (messageType: string, callback: (payload: any) => void) => () => void;
  config: WebSocketConfig;
  updateConfig: (newConfig: Partial<WebSocketConfig>) => void;
  features: RealTimeFeatures;
  toggleFeature: (feature: keyof RealTimeFeatures) => void;
  connectionMetrics: {
    connectTime: Date | null;
    reconnectCount: number;
    messagesSent: number;
    messagesReceived: number;
    lastHeartbeat: Date | null;
  };
}

/**
 * Enterprise WebSocket Hook
 * 
 * Provides comprehensive real-time synchronization capabilities:
 * - Automatic reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat mechanism for connection monitoring
 * - Type-safe message handling
 * - Cultural context support (Bengali notifications)
 * - Multiple real-time features (cart, inventory, pricing, etc.)
 * 
 * @example
 * ```tsx
 * const {
 *   isConnected,
 *   sendMessage,
 *   subscribe,
 *   features,
 *   toggleFeature
 * } = useWebSocket({
 *   url: 'ws://localhost:5000/ws',
 *   maxReconnectAttempts: 5,
 *   enableAutoReconnect: true
 * });
 * 
 * // Subscribe to real-time cart updates
 * useEffect(() => {
 *   const unsubscribe = subscribe('cart_update', (data) => {
 *     console.log('Cart updated:', data);
 *   });
 *   return unsubscribe;
 * }, [subscribe]);
 * 
 * // Send a message
 * const updateCart = () => {
 *   sendMessage('cart_update', { productId: '123', quantity: 2 });
 * };
 * ```
 * 
 * @param initialConfig - Initial WebSocket configuration
 * @returns {WebSocketReturn} WebSocket utilities and state
 */
export function useWebSocket(initialConfig: Partial<WebSocketConfig> = {}): WebSocketReturn {
  // Default configuration
  const defaultConfig: WebSocketConfig = {
    url: 'ws://localhost:5000/ws',
    protocols: [],
    maxReconnectAttempts: 5,
    reconnectInterval: 1000,
    heartbeatInterval: 30000,
    enableHeartbeat: true,
    enableAutoReconnect: true,
    enableMessageQueue: true,
    culturalContext: 'bangladesh',
    ...initialConfig
  };

  // State management
  const [config, setConfig] = useState<WebSocketConfig>(defaultConfig);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [features, setFeatures] = useState<RealTimeFeatures>({
    liveCart: true,
    liveInventory: true,
    livePricing: true,
    liveNotifications: true,
    liveChat: true,
    liveTracking: true,
    liveAnalytics: false
  });

  // Connection metrics
  const [connectionMetrics, setConnectionMetrics] = useState({
    connectTime: null as Date | null,
    reconnectCount: 0,
    messagesSent: 0,
    messagesReceived: 0,
    lastHeartbeat: null as Date | null
  });

  // Refs for WebSocket management
  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const subscribersRef = useRef<Map<string, ((payload: any) => void)[]>>(new Map());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  /**
   * Update WebSocket configuration
   * 
   * @param newConfig - Partial configuration to update
   */
  const updateConfig = useCallback((newConfig: Partial<WebSocketConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Toggle real-time feature
   * 
   * @param feature - Feature to toggle
   */
  const toggleFeature = useCallback((feature: keyof RealTimeFeatures) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  }, []);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    
    try {
      wsRef.current = new WebSocket(config.url, config.protocols);

      wsRef.current.onopen = () => {
        setConnectionState('connected');
        setConnectionMetrics(prev => ({
          ...prev,
          connectTime: new Date(),
          reconnectCount: reconnectAttemptsRef.current
        }));
        
        reconnectAttemptsRef.current = 0;

        // Send queued messages
        if (config.enableMessageQueue && messageQueueRef.current.length > 0) {
          messageQueueRef.current.forEach(message => {
            wsRef.current?.send(JSON.stringify(message));
          });
          messageQueueRef.current = [];
        }

        // Start heartbeat
        if (config.enableHeartbeat) {
          startHeartbeat();
        }

        // Send initial feature configuration
        sendMessage('configure_features', features);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          message.timestamp = new Date();
          
          setLastMessage(message);
          setConnectionMetrics(prev => ({
            ...prev,
            messagesReceived: prev.messagesReceived + 1
          }));

          // Handle heartbeat responses
          if (message.type === 'heartbeat_response') {
            setConnectionMetrics(prev => ({
              ...prev,
              lastHeartbeat: new Date()
            }));
            return;
          }

          // Notify subscribers
          const subscribers = subscribersRef.current.get(message.type);
          if (subscribers) {
            subscribers.forEach(callback => callback(message.payload));
          }

          // Handle system messages
          handleSystemMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setConnectionState('disconnected');
        stopHeartbeat();
        
        if (config.enableAutoReconnect && reconnectAttemptsRef.current < config.maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setConnectionState('reconnecting');
          
          const delay = Math.min(config.reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = () => {
        setConnectionState('error');
      };

    } catch (error) {
      setConnectionState('error');
      console.error('WebSocket connection error:', error);
    }
  }, [config, features]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionState('disconnected');
  }, []);

  /**
   * Send message through WebSocket
   * 
   * @param type - Message type
   * @param payload - Message payload
   */
  const sendMessage = useCallback((type: string, payload: any) => {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date(),
      userId: 'current_user_id', // This should come from auth context
      sessionId: 'current_session_id'
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      setConnectionMetrics(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1
      }));
    } else if (config.enableMessageQueue) {
      messageQueueRef.current.push(message);
    }
  }, [config.enableMessageQueue]);

  /**
   * Subscribe to specific message types
   * 
   * @param messageType - Type of message to subscribe to
   * @param callback - Callback function for received messages
   * @returns Unsubscribe function
   */
  const subscribe = useCallback((
    messageType: string, 
    callback: (payload: any) => void
  ): (() => void) => {
    const subscribers = subscribersRef.current.get(messageType) || [];
    subscribers.push(callback);
    subscribersRef.current.set(messageType, subscribers);

    // Return unsubscribe function
    return () => {
      const currentSubscribers = subscribersRef.current.get(messageType) || [];
      const index = currentSubscribers.indexOf(callback);
      if (index > -1) {
        currentSubscribers.splice(index, 1);
        if (currentSubscribers.length === 0) {
          subscribersRef.current.delete(messageType);
        } else {
          subscribersRef.current.set(messageType, currentSubscribers);
        }
      }
    };
  }, []);

  /**
   * Start heartbeat mechanism
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage('heartbeat', { timestamp: new Date() });
      }
    }, config.heartbeatInterval);
  }, [config.heartbeatInterval, sendMessage]);

  /**
   * Stop heartbeat mechanism
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle system messages
   * 
   * @param message - WebSocket message
   */
  const handleSystemMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'cart_sync':
        if (features.liveCart) {
          // Handle live cart synchronization
          console.log('Cart synchronized:', message.payload);
        }
        break;
        
      case 'inventory_update':
        if (features.liveInventory) {
          // Handle live inventory updates
          console.log('Inventory updated:', message.payload);
        }
        break;
        
      case 'price_update':
        if (features.livePricing) {
          // Handle live price updates
          console.log('Price updated:', message.payload);
        }
        break;
        
      case 'notification':
        if (features.liveNotifications) {
          // Handle live notifications with cultural context
          const notification = config.culturalContext === 'bangladesh' 
            ? translateNotification(message.payload)
            : message.payload;
          console.log('Notification:', notification);
        }
        break;
        
      case 'order_tracking':
        if (features.liveTracking) {
          // Handle live order tracking updates
          console.log('Order tracking updated:', message.payload);
        }
        break;
        
      default:
        // Handle other message types
        break;
    }
  };

  /**
   * Translate notifications for Bengali context
   * 
   * @param notification - Original notification
   * @returns Translated notification
   */
  const translateNotification = (notification: any) => {
    // Simple translation mapping for common notifications
    const translations: { [key: string]: string } = {
      'Order confirmed': 'অর্ডার কনফার্ম হয়েছে',
      'Item shipped': 'পণ্য পাঠানো হয়েছে',
      'Delivery completed': 'ডেলিভারি সম্পন্ন',
      'Payment successful': 'পেমেন্ট সফল',
      'Price dropped': 'দাম কমেছে'
    };

    return {
      ...notification,
      message: translations[notification.message] || notification.message
    };
  };

  // Connect on mount and config changes
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [config.url, config.protocols]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const isConnected = connectionState === 'connected';

  return {
    connectionState,
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    config,
    updateConfig,
    features,
    toggleFeature,
    connectionMetrics
  };
}

export default useWebSocket;