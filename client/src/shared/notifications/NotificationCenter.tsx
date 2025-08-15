import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { 
  Bell, 
  Check, 
  X, 
  Settings, 
  Filter, 
  Search,
  ShoppingCart,
  Package,
  CreditCard,
  User,
  Star,
  Gift,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Mail,
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'promotion' | 'system' | 'review' | 'message' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    label: string;
    url: string;
  };
  metadata?: {
    orderId?: string;
    amount?: number;
    productId?: string;
    userId?: string;
  };
}

export const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #ORD-2024-001 has been confirmed and is being processed.',
      timestamp: '2024-07-15T10:30:00Z',
      read: false,
      priority: 'medium',
      actionable: true,
      action: {
        label: 'View Order',
        url: '/orders/ORD-2024-001'
      },
      metadata: {
        orderId: 'ORD-2024-001',
        amount: 2500
      }
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of ৳2,500 has been processed successfully via bKash.',
      timestamp: '2024-07-15T09:45:00Z',
      read: false,
      priority: 'high',
      actionable: true,
      action: {
        label: 'View Receipt',
        url: '/payments/receipt/PAY-001'
      },
      metadata: {
        amount: 2500
      }
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Flash Sale Alert!',
      message: 'Limited time offer: 50% off on selected electronics. Sale ends in 2 hours!',
      timestamp: '2024-07-15T08:15:00Z',
      read: true,
      priority: 'medium',
      actionable: true,
      action: {
        label: 'Shop Now',
        url: '/flash-sale'
      }
    },
    {
      id: '4',
      type: 'system',
      title: 'Account Security Update',
      message: 'Your account security settings have been updated successfully.',
      timestamp: '2024-07-14T16:20:00Z',
      read: false,
      priority: 'high',
      actionable: true,
      action: {
        label: 'Review Settings',
        url: '/account/security'
      }
    },
    {
      id: '5',
      type: 'review',
      title: 'Review Request',
      message: 'Please rate your recent purchase of Wireless Headphones.',
      timestamp: '2024-07-14T14:30:00Z',
      read: true,
      priority: 'low',
      actionable: true,
      action: {
        label: 'Write Review',
        url: '/products/review/PROD-001'
      },
      metadata: {
        productId: 'PROD-001'
      }
    },
    {
      id: '6',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from customer support regarding your inquiry.',
      timestamp: '2024-07-14T11:45:00Z',
      read: false,
      priority: 'medium',
      actionable: true,
      action: {
        label: 'View Message',
        url: '/messages/MSG-001'
      }
    },
    {
      id: '7',
      type: 'security',
      title: 'Login Alert',
      message: 'New login detected from Chrome on Windows at 2024-07-14 10:30 AM.',
      timestamp: '2024-07-14T10:30:00Z',
      read: true,
      priority: 'high',
      actionable: true,
      action: {
        label: 'Review Activity',
        url: '/account/activity'
      }
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    categories: {
      order: true,
      payment: true,
      promotion: true,
      system: true,
      review: false,
      message: true,
      security: true
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-blue-600" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'promotion': return <Gift className="w-5 h-5 text-purple-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
      case 'review': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'security': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAsUnread = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeTab);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const highPriority = notifications.filter(n => n.priority === 'high').length;
    const actionable = notifications.filter(n => n.actionable).length;
    
    return { total, unread, highPriority, actionable };
  };

  const stats = getNotificationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Unread</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">High Priority</p>
                <p className="text-2xl font-bold">{stats.highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Actionable</p>
                <p className="text-2xl font-bold">{stats.actionable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="order">Orders</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={markAsUnread}
            onDelete={deleteNotification}
            getNotificationIcon={getNotificationIcon}
            getPriorityColor={getPriorityColor}
            getTimeAgo={getTimeAgo}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={markAsUnread}
            onDelete={deleteNotification}
            getNotificationIcon={getNotificationIcon}
            getPriorityColor={getPriorityColor}
            getTimeAgo={getTimeAgo}
          />
        </TabsContent>

        <TabsContent value="order" className="space-y-4">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={markAsUnread}
            onDelete={deleteNotification}
            getNotificationIcon={getNotificationIcon}
            getPriorityColor={getPriorityColor}
            getTimeAgo={getTimeAgo}
          />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={markAsUnread}
            onDelete={deleteNotification}
            getNotificationIcon={getNotificationIcon}
            getPriorityColor={getPriorityColor}
            getTimeAgo={getTimeAgo}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Delivery Methods */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Delivery Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                      </div>
                      <Button
                        variant={notificationSettings.email ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          email: !notificationSettings.email
                        })}
                      >
                        {notificationSettings.email ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-600">Browser and mobile push notifications</p>
                        </div>
                      </div>
                      <Button
                        variant={notificationSettings.push ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          push: !notificationSettings.push
                        })}
                      >
                        {notificationSettings.push ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium">SMS</p>
                          <p className="text-sm text-gray-600">Text message notifications</p>
                        </div>
                      </div>
                      <Button
                        variant={notificationSettings.sms ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          sms: !notificationSettings.sms
                        })}
                      >
                        {notificationSettings.sms ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">In-App</p>
                          <p className="text-sm text-gray-600">Notifications within the app</p>
                        </div>
                      </div>
                      <Button
                        variant={notificationSettings.inApp ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings({
                          ...notificationSettings,
                          inApp: !notificationSettings.inApp
                        })}
                      >
                        {notificationSettings.inApp ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Notification Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(notificationSettings.categories).map(([category, enabled]) => (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getNotificationIcon(category)}
                          <div>
                            <p className="font-medium capitalize">{category}</p>
                            <p className="text-sm text-gray-600">
                              {category === 'order' && 'Order updates and shipping notifications'}
                              {category === 'payment' && 'Payment confirmations and billing updates'}
                              {category === 'promotion' && 'Sales, offers, and promotional content'}
                              {category === 'system' && 'System updates and maintenance notices'}
                              {category === 'review' && 'Review requests and feedback reminders'}
                              {category === 'message' && 'Messages and support communications'}
                              {category === 'security' && 'Security alerts and login notifications'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={enabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            categories: {
                              ...notificationSettings.categories,
                              [category]: !enabled
                            }
                          })}
                        >
                          {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  getNotificationIcon: (type: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
  getTimeAgo: (timestamp: string) => string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  getNotificationIcon,
  getPriorityColor,
  getTimeAgo
}) => {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up! No new notifications to show.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{getTimeAgo(notification.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {notification.actionable && notification.action && (
                          <Button size="sm" variant="outline">
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => notification.read ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id)}
                        >
                          {notification.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};