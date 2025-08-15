// Real-time updates hook for Phase 4 Advanced Features
import { useState, useEffect, useRef, useCallback } from 'react';

interface RealTimeConfig {
  endpoint?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface RealTimeState {
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate: number;
  connectionCount: number;
  messages: any[];
  error: string | null;
}

export const useRealTimeUpdates = (config: RealTimeConfig = {}) => {
  const {
    endpoint = '/api/realtime',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = config;

  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    isConnecting: false,
    lastUpdate: 0,
    connectionCount: 0,
    messages: [],
    error: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const heartbeatTimer = useRef<NodeJS.Timeout>();
  const reconnectTimer = useRef<NodeJS.Timeout>();

  // Connection management
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${endpoint}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          connectionCount: prev.connectionCount + 1,
          error: null
        }));
        
        reconnectAttempts.current = 0;
        startHeartbeat();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat
          if (data.type === 'heartbeat') {
            setState(prev => ({ ...prev, lastUpdate: Date.now() }));
            return;
          }

          // Handle regular messages
          setState(prev => ({
            ...prev,
            messages: [...prev.messages.slice(-99), data],
            lastUpdate: Date.now()
          }));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
        stopHeartbeat();
        scheduleReconnect();
      };

      wsRef.current.onerror = (error) => {
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection error',
          isConnecting: false 
        }));
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection',
        isConnecting: false 
      }));
    }
  }, [endpoint]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopHeartbeat();
    clearReconnectTimer();
  }, []);

  // Send message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatTimer.current = setInterval(() => {
      sendMessage({ type: 'heartbeat', timestamp: Date.now() });
    }, heartbeatInterval);
  }, [heartbeatInterval, sendMessage]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = undefined;
    }
  }, []);

  // Reconnection logic
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to reconnect after ${maxReconnectAttempts} attempts` 
      }));
      return;
    }

    reconnectAttempts.current++;
    
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, reconnectInterval * Math.pow(2, reconnectAttempts.current - 1)); // Exponential backoff
  }, [connect, reconnectInterval, maxReconnectAttempts]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = undefined;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stopHeartbeat, clearReconnectTimer]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  // Get latest message by type
  const getLatestMessage = useCallback((type: string) => {
    return state.messages
      .filter(msg => msg.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [state.messages]);

  // Connection status
  const getConnectionStatus = useCallback(() => {
    if (state.isConnected) return 'connected';
    if (state.isConnecting) return 'connecting';
    if (state.error) return 'error';
    return 'disconnected';
  }, [state.isConnected, state.isConnecting, state.error]);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    
    // Utilities
    getLatestMessage,
    getConnectionStatus,
    
    // Computed
    hasMessages: state.messages.length > 0,
    lastMessageTime: state.messages.length > 0 
      ? Math.max(...state.messages.map(m => m.timestamp || 0))
      : 0
  };
};

// Hook for specific real-time features
export const useRealTimeNotifications = () => {
  const realTime = useRealTimeUpdates({ endpoint: '/api/notifications' });
  
  const notifications = realTime.messages.filter(msg => 
    msg.type === 'notification' || msg.type === 'alert'
  );
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (notificationId: string) => {
    realTime.sendMessage({
      type: 'mark_read',
      notificationId,
      timestamp: Date.now()
    });
  };
  
  return {
    ...realTime,
    notifications,
    unreadCount,
    markAsRead
  };
};

// Hook for real-time search suggestions
export const useRealTimeSearch = () => {
  const realTime = useRealTimeUpdates({ endpoint: '/api/search/realtime' });
  
  const trendingSearches = realTime.getLatestMessage('trending_searches')?.data || [];
  const popularProducts = realTime.getLatestMessage('popular_products')?.data || [];
  
  return {
    ...realTime,
    trendingSearches,
    popularProducts
  };
};

export default { useRealTimeUpdates, useRealTimeNotifications, useRealTimeSearch };