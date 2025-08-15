/**
 * NotificationCenter - Real-time notification system for Bangladesh admin panel
 */

import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications] = React.useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'KYC Verification Pending',
      message: '12 vendors are waiting for KYC approval',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/admin/vendors/kyc'
    },
    {
      id: '2',
      type: 'success',
      title: 'bKash Payment Success',
      message: 'Festival season payments up 23% today',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Eid Campaign Active',
      message: 'Eid special promotion is performing well',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Pathao API Issue',
      message: 'Temporary connectivity issue with Pathao courier',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      read: false
    },
    {
      id: '5',
      type: 'info',
      title: 'Bengali Content Review',
      message: '45 products need Bengali content moderation',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* Notification Panel */}
      <div className="absolute right-0 top-16 w-96 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Bangladesh Market Status */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 dark:text-green-300">🇧🇩 BD Market Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${
                  notification.read
                    ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium text-sm ${
                        notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(notification.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    {notification.actionUrl && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-blue-600 dark:text-blue-400 text-xs mt-1"
                      >
                        View Details →
                      </Button>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;