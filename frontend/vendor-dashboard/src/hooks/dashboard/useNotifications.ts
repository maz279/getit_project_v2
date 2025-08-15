/**
 * Notifications Hook for Vendor Dashboard
 * 
 * Manages notification state, real-time updates, and interaction
 * Integrates with notification-service microservice
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Notification {
  id: string;
  type: 'order' | 'review' | 'payout' | 'system' | 'promotion' | 'warning';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null
  });

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('vendor_auth_token');
      if (!token) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          notifications: [],
          unreadCount: 0
        }));
        return;
      }

      const response = await axios.get('/api/v1/notifications/vendor', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      if (response.data?.success) {
        const notifications = response.data.notifications || [];
        const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

        setState({
          notifications,
          unreadCount,
          loading: false,
          error: null
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load notifications'
      }));
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return;

      await axios.patch(`/api/v1/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return;

      await axios.patch('/api/v1/notifications/vendor/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return;

      await axios.delete(`/api/v1/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // Filter notifications by type
  const getNotificationsByType = useCallback((type: string) => {
    return state.notifications.filter(n => n.type === type);
  }, [state.notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.isRead);
  }, [state.notifications]);

  // Get urgent notifications
  const getUrgentNotifications = useCallback(() => {
    return state.notifications.filter(n => n.priority === 'urgent');
  }, [state.notifications]);

  // Initialize notifications
  useEffect(() => {
    fetchNotifications();
    
    // Set up periodic refresh
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    getUrgentNotifications
  };
};