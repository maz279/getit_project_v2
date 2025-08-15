import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useNotifications - Advanced Notification Management Hook
 * Amazon.com/Shopee.sg-Level Notification System with Bangladesh Integration
 */
export const useNotifications = () => {
  const { user, trackUserActivity } = useAuth();
  const [notificationState, setNotificationState] = useState({
    loading: false,
    error: null,
    notifications: [],
    unreadCount: 0,
    totalNotifications: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    
    // Notification Categories
    categories: {
      orders: { enabled: true, count: 0, unread: 0 },
      payments: { enabled: true, count: 0, unread: 0 },
      shipping: { enabled: true, count: 0, unread: 0 },
      promotions: { enabled: true, count: 0, unread: 0 },
      system: { enabled: true, count: 0, unread: 0 },
      security: { enabled: true, count: 0, unread: 0 },
      social: { enabled: true, count: 0, unread: 0 },
      reviews: { enabled: true, count: 0, unread: 0 }
    },
    
    // Notification Preferences
    preferences: {
      push: true,
      email: true,
      sms: false, // Bangladesh SMS integration
      inApp: true,
      sound: true,
      vibration: true,
      desktop: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    
    // Bangladesh-specific settings
    bangladeshSettings: {
      bengaliNotifications: true,
      prayerTimeNotifications: true,
      festivalNotifications: true,
      localOffers: true,
      codReminders: true,
      mobileBankingAlerts: true
    },
    
    // Real-time notification queue
    liveNotifications: [],
    isConnected: false,
    lastSync: null,
    
    // Filters
    filters: {
      category: 'all',
      status: 'all', // all, read, unread
      priority: 'all', // all, high, medium, low
      dateRange: 'all', // today, week, month, all
      sortBy: 'newest' // newest, oldest, priority
    }
  });

  // Load notifications on component mount
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadPreferences();
      initializeRealTimeConnection();
      loadNotificationStatistics();
    }
  }, [user]);

  // Auto-refresh notifications
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        loadNotifications(1, false, true); // Silent refresh
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Load notifications with pagination and filters
  const loadNotifications = useCallback(async (page = 1, append = false, silent = false) => {
    try {
      if (!silent) {
        setNotificationState(prev => ({ ...prev, loading: true, error: null }));
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...notificationState.filters
      });

      const response = await fetch(`/api/v1/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setNotificationState(prev => ({
          ...prev,
          loading: false,
          notifications: append ? [...prev.notifications, ...data.notifications] : data.notifications,
          unreadCount: data.unreadCount,
          totalNotifications: data.total,
          currentPage: page,
          totalPages: data.totalPages,
          hasMore: page < data.totalPages,
          lastSync: new Date()
        }));

        return { success: true, data };
      } else {
        const error = await response.json();
        if (!silent) {
          setNotificationState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to load notifications'
          }));
        }
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Notifications loading error:', error);
      if (!silent) {
        setNotificationState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load notifications'
        }));
      }
      return { success: false, error: 'Failed to load notifications' };
    }
  }, [notificationState.filters]);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const preferences = await response.json();
        setNotificationState(prev => ({
          ...prev,
          preferences: { ...prev.preferences, ...preferences },
          bangladeshSettings: { ...prev.bangladeshSettings, ...preferences.bangladeshSettings }
        }));
      }
    } catch (error) {
      console.error('Preferences loading error:', error);
    }
  }, []);

  // Load notification statistics
  const loadNotificationStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/notifications/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setNotificationState(prev => ({
          ...prev,
          categories: { ...prev.categories, ...stats.categories }
        }));
      }
    } catch (error) {
      console.error('Statistics loading error:', error);
    }
  }, []);

  // Initialize real-time WebSocket connection
  const initializeRealTimeConnection = useCallback(() => {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/notifications/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setNotificationState(prev => ({ ...prev, isConnected: true }));
        // Send authentication token
        ws.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('auth_token')
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleRealTimeNotification(message);
      };

      ws.onclose = () => {
        setNotificationState(prev => ({ ...prev, isConnected: false }));
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (user) {
            initializeRealTimeConnection();
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setNotificationState(prev => ({ ...prev, isConnected: false }));
      };

      return ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }, [user]);

  // Handle real-time notification
  const handleRealTimeNotification = useCallback((message) => {
    if (message.type === 'notification') {
      const notification = message.data;
      
      setNotificationState(prev => ({
        ...prev,
        liveNotifications: [notification, ...prev.liveNotifications.slice(0, 4)], // Keep last 5
        unreadCount: prev.unreadCount + 1,
        notifications: [notification, ...prev.notifications]
      }));

      // Show browser notification if enabled
      if (notificationState.preferences.desktop && 'Notification' in window) {
        showBrowserNotification(notification);
      }

      // Play sound if enabled
      if (notificationState.preferences.sound) {
        playNotificationSound(notification.priority);
      }

      // Track notification received
      trackUserActivity('notification_received', user?.id, {
        notificationId: notification.id,
        category: notification.category,
        priority: notification.priority
      });
    }
  }, [notificationState.preferences, user, trackUserActivity]);

  // Show browser notification
  const showBrowserNotification = useCallback((notification) => {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        vibrate: notificationState.preferences.vibration ? [200, 100, 200] : undefined
      });

      browserNotification.onclick = () => {
        window.focus();
        markAsRead(notification.id);
        browserNotification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }, [notificationState.preferences.vibration]);

  // Play notification sound
  const playNotificationSound = useCallback((priority) => {
    try {
      const audio = new Audio();
      audio.volume = 0.3;
      
      switch (priority) {
        case 'high':
          audio.src = '/sounds/notification-high.mp3';
          break;
        case 'medium':
          audio.src = '/sounds/notification-medium.mp3';
          break;
        default:
          audio.src = '/sounds/notification-low.mp3';
      }
      
      audio.play().catch(error => {
        console.log('Sound play failed:', error);
      });
    } catch (error) {
      console.error('Notification sound error:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotificationState(prev => ({
          ...prev,
          notifications: prev.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true, readAt: new Date() }
              : notification
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));

        await trackUserActivity('notification_read', user?.id, { notificationId });
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false };
    }
  }, [user, trackUserActivity]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotificationState(prev => ({
          ...prev,
          notifications: prev.notifications.map(notification => ({
            ...notification,
            read: true,
            readAt: new Date()
          })),
          unreadCount: 0
        }));

        await trackUserActivity('all_notifications_read', user?.id);
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false };
    }
  }, [user, trackUserActivity]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotificationState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(notification => notification.id !== notificationId),
          totalNotifications: prev.totalNotifications - 1
        }));

        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      return { success: false };
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotificationState(prev => ({
          ...prev,
          notifications: [],
          unreadCount: 0,
          totalNotifications: 0
        }));

        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Clear all notifications error:', error);
      return { success: false };
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        const updatedPreferences = await response.json();
        setNotificationState(prev => ({
          ...prev,
          preferences: { ...prev.preferences, ...updatedPreferences }
        }));

        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setNotificationState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setNotificationState(prev => ({
      ...prev,
      filters: {
        category: 'all',
        status: 'all',
        priority: 'all',
        dateRange: 'all',
        sortBy: 'newest'
      },
      currentPage: 1
    }));
  }, []);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (notificationState.hasMore && !notificationState.loading) {
      return await loadNotifications(notificationState.currentPage + 1, true);
    }
  }, [notificationState.hasMore, notificationState.loading, notificationState.currentPage, loadNotifications]);

  // Computed values
  const filteredNotifications = useMemo(() => {
    let filtered = [...notificationState.notifications];
    
    // Apply filters
    if (notificationState.filters.category !== 'all') {
      filtered = filtered.filter(n => n.category === notificationState.filters.category);
    }
    
    if (notificationState.filters.status !== 'all') {
      filtered = filtered.filter(n => 
        notificationState.filters.status === 'read' ? n.read : !n.read
      );
    }
    
    if (notificationState.filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === notificationState.filters.priority);
    }
    
    return filtered;
  }, [notificationState.notifications, notificationState.filters]);

  const notificationsByCategory = useMemo(() => {
    return notificationState.notifications.reduce((acc, notification) => {
      const category = notification.category || 'system';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(notification);
      return acc;
    }, {});
  }, [notificationState.notifications]);

  const hasUnreadNotifications = useMemo(() => {
    return notificationState.unreadCount > 0;
  }, [notificationState.unreadCount]);

  const highPriorityCount = useMemo(() => {
    return notificationState.notifications.filter(n => n.priority === 'high' && !n.read).length;
  }, [notificationState.notifications]);

  return {
    // State
    ...notificationState,
    
    // Methods
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    requestNotificationPermission,
    applyFilters,
    clearFilters,

    // Computed values
    filteredNotifications,
    notificationsByCategory,
    hasUnreadNotifications,
    highPriorityCount,
    isEmpty: !notificationState.loading && notificationState.notifications.length === 0,
    canLoadMore: notificationState.hasMore && !notificationState.loading,
    isLoading: notificationState.loading,
    
    // Quick access
    unreadNotifications: notificationState.notifications.filter(n => !n.read),
    recentNotifications: notificationState.notifications.slice(0, 5),
    orderNotifications: notificationState.notifications.filter(n => n.category === 'orders'),
    paymentNotifications: notificationState.notifications.filter(n => n.category === 'payments'),
    promotionNotifications: notificationState.notifications.filter(n => n.category === 'promotions'),
    
    // Bangladesh-specific features
    bengaliNotificationsEnabled: notificationState.bangladeshSettings.bengaliNotifications,
    prayerTimeNotificationsEnabled: notificationState.bangladeshSettings.prayerTimeNotifications,
    festivalNotificationsEnabled: notificationState.bangladeshSettings.festivalNotifications,
    mobileBankingAlertsEnabled: notificationState.bangladeshSettings.mobileBankingAlerts,
    
    // Real-time status
    isRealTimeConnected: notificationState.isConnected,
    hasLiveNotifications: notificationState.liveNotifications.length > 0,
    lastSyncTime: notificationState.lastSync
  };
};

export default useNotifications;