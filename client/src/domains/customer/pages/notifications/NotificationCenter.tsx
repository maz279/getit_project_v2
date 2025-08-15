// NotificationCenter.tsx - Amazon.com/Shopee.sg-Level Notification Management
import React, { useState, useEffect } from 'react';
import { Bell, Archive, Trash2, Settings, Star, Package, CreditCard, Truck, Gift, Users, AlertCircle, CheckCircle, Info, Megaphone, Filter, Search, MoreVertical } from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'shipping' | 'promotion' | 'account' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isArchived: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  imageUrl?: string;
  metadata?: {
    orderId?: string;
    amount?: number;
    discount?: number;
    productName?: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Notification Center - Manage Your Notifications | GetIt Bangladesh',
    description: 'Stay updated with order status, deals, payments, and account notifications. Manage your notification preferences.',
    keywords: 'notifications, order updates, deals alerts, payment notifications, Bangladesh notifications'
  });

  useEffect(() => {
    // Mock notification data
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #GIT12345 has been shipped and is on the way! Track your package.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        priority: 'high',
        actionUrl: '/track-order',
        metadata: { orderId: 'GIT12345' }
      },
      {
        id: 'notif-2',
        type: 'promotion',
        title: 'Flash Sale Alert! 70% Off Electronics',
        message: 'Limited time offer on smartphones, laptops, and accessories. Sale ends in 6 hours!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        priority: 'high',
        actionUrl: '/flash-deals',
        imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
        metadata: { discount: 70 }
      },
      {
        id: 'notif-3',
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your bKash payment of ৳2,450 for order #GIT12344 has been confirmed.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'medium',
        metadata: { orderId: 'GIT12344', amount: 2450 }
      },
      {
        id: 'notif-4',
        type: 'shipping',
        title: 'Out for Delivery',
        message: 'Your package is out for delivery and will arrive today between 2:00 PM - 6:00 PM.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'high',
        actionUrl: '/track-order',
        metadata: { orderId: 'GIT12343' }
      },
      {
        id: 'notif-5',
        type: 'account',
        title: 'Welcome to GetIt Premium!',
        message: 'Enjoy free shipping, exclusive deals, and priority support. Your membership is now active.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'medium',
        actionUrl: '/premium'
      },
      {
        id: 'notif-6',
        type: 'promotion',
        title: 'New Year Mega Sale - Up to 80% Off',
        message: 'The biggest sale of the year is here! Don\'t miss out on incredible discounts across all categories.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: true,
        isArchived: false,
        priority: 'medium',
        actionUrl: '/mega-sale',
        imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400',
        metadata: { discount: 80 }
      },
      {
        id: 'notif-7',
        type: 'system',
        title: 'Account Security Update',
        message: 'We\'ve enhanced our security measures. Please review your account settings and enable 2FA.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isRead: false,
        isArchived: false,
        priority: 'high',
        actionUrl: '/account/security'
      },
      {
        id: 'notif-8',
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #GIT12342 has been delivered successfully. Please rate your experience.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isRead: true,
        isArchived: true,
        priority: 'low',
        actionUrl: '/orders',
        metadata: { orderId: 'GIT12342' }
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-5 w-5" />;
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'shipping': return <Truck className="h-5 w-5" />;
      case 'promotion': return <Gift className="h-5 w-5" />;
      case 'account': return <Users className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    if (priority === 'medium') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString('en-BD');
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'archived' && notification.isArchived);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
    );
  };

  const handleArchive = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isArchived: true } : n)
    );
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleBulkAction = (action: 'read' | 'archive' | 'delete') => {
    if (selectedNotifications.length === 0) return;

    setNotifications(prev => {
      if (action === 'delete') {
        return prev.filter(n => !selectedNotifications.includes(n.id));
      }
      return prev.map(n => {
        if (selectedNotifications.includes(n.id)) {
          if (action === 'read') return { ...n, isRead: true };
          if (action === 'archive') return { ...n, isArchived: true };
        }
        return n;
      });
    });
    
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (notificationId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Notification Center</h1>
              <p className="text-xl opacity-90">
                Stay updated with your orders, deals, and account activities
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                    <p className="opacity-80">Unread</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Actions */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread</option>
                  <option value="archived">Archived</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="order">Orders</option>
                  <option value="payment">Payments</option>
                  <option value="shipping">Shipping</option>
                  <option value="promotion">Promotions</option>
                  <option value="account">Account</option>
                  <option value="system">System</option>
                </select>
                
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-sm text-purple-700 font-medium">
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('read')}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <Archive className="h-3 w-3" />
                    Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Select All Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">
                  Select all ({filteredNotifications.length} notifications)
                </span>
              </label>
            </div>
            
            {/* Notifications */}
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                    />
                    
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type, notification.priority)}`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          {getPriorityIcon(notification.priority)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          
                          {/* Actions Menu */}
                          <div className="relative group">
                            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {!notification.isRead ? (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    Mark as Read
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleMarkAsUnread(notification.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    Mark as Unread
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleArchive(notification.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                  <Archive className="h-4 w-4" />
                                  Archive
                                </button>
                                
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 leading-relaxed">{notification.message}</p>
                      
                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          {notification.metadata.orderId && (
                            <span>Order: {notification.metadata.orderId}</span>
                          )}
                          {notification.metadata.amount && (
                            <span>Amount: ৳{notification.metadata.amount}</span>
                          )}
                          {notification.metadata.discount && (
                            <span className="text-green-600">
                              {notification.metadata.discount}% Off
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Image */}
                      {notification.imageUrl && (
                        <img
                          src={notification.imageUrl}
                          alt="Notification"
                          className="w-24 h-16 object-cover rounded border mb-3"
                        />
                      )}
                      
                      {/* Action Button */}
                      {notification.actionUrl && (
                        <button className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                          View Details
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? `No notifications match your search for "${searchQuery}"`
                    : filter === 'unread'
                    ? 'You\'re all caught up! No unread notifications.'
                    : filter === 'archived'
                    ? 'No archived notifications found.'
                    : 'You don\'t have any notifications yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default NotificationCenter;