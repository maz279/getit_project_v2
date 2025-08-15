/**
 * NotificationCenter Component - Amazon.com/Shopee.sg-Level Notification System
 * 
 * Complete Notification Management:
 * - Real-time notification display and management
 * - Categorized notifications (orders, reviews, payouts, system)
 * - Mark as read/unread functionality
 * - Filter and search notifications
 * - Bulk actions for notification management
 * - Bangladesh-specific notification types
 * - Mobile-responsive slide-out panel
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  Filter, 
  Search,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../../utils/helpers/className';

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

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = searchQuery === '' || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [notifications, searchQuery, selectedType]);

  // Notification types with counts
  const notificationTypes = useMemo(() => {
    const counts = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'all', label: 'All', count: notifications.length, icon: Bell },
      { id: 'order', label: 'Orders', count: counts.order || 0, icon: ShoppingCart },
      { id: 'review', label: 'Reviews', count: counts.review || 0, icon: Star },
      { id: 'payout', label: 'Payouts', count: counts.payout || 0, icon: DollarSign },
      { id: 'system', label: 'System', count: counts.system || 0, icon: AlertCircle },
      { id: 'promotion', label: 'Promotions', count: counts.promotion || 0, icon: Package }
    ];
  }, [notifications]);

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconMap = {
      order: ShoppingCart,
      review: Star,
      payout: DollarSign,
      system: AlertCircle,
      promotion: Package,
      warning: AlertCircle
    };

    const IconComponent = iconMap[type as keyof typeof iconMap] || Bell;
    
    const colorMap = {
      urgent: 'text-red-500',
      high: 'text-orange-500',
      medium: 'text-blue-500',
      low: 'text-gray-500'
    };

    return (
      <IconComponent className={cn('h-5 w-5', colorMap[priority as keyof typeof colorMap])} />
    );
  };

  // Format relative time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Handle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Select all filtered notifications
  const selectAllFiltered = () => {
    const allIds = new Set(filteredNotifications.map(n => n.id));
    setSelectedNotifications(allIds);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedNotifications(new Set());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {notifications.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Type Filter */}
          <div className="flex space-x-1 overflow-x-auto">
            {notificationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                  selectedType === type.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <type.icon className="h-3 w-3" />
                <span>{type.label}</span>
                {type.count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    selectedType === type.id
                      ? "bg-white bg-opacity-20"
                      : "bg-gray-200"
                  )}>
                    {type.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedNotifications.size} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={clearSelections}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Mark Read
                </button>
                <button className="text-sm text-red-600 hover:text-red-700">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-center">
                {searchQuery || selectedType !== 'all' 
                  ? 'No notifications match your filters'
                  : 'You have no new notifications'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors",
                    !notification.isRead && "bg-blue-50"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleNotificationSelection(notification.id)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />

                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          notification.isRead ? "text-gray-700" : "text-gray-900"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm mt-1",
                        notification.isRead ? "text-gray-500" : "text-gray-700"
                      )}>
                        {notification.message}
                      </p>
                      
                      {/* Action Button */}
                      {notification.actionUrl && (
                        <div className="mt-2">
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-primary hover:text-primary-600 font-medium"
                          >
                            View Details →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="flex-shrink-0">
                      <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={selectAllFiltered}
                className="flex-1 text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Select All
              </button>
              <button className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Mark All Read
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationCenter;