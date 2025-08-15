import React, { useState } from 'react';
import { Bell, Settings, Star, Filter, Search, Plus, Check, X } from 'lucide-react';
import { NotificationCenter } from '@/shared/notifications/NotificationCenter';
// import { NotificationItem, NotificationPreferences } from '@/components/notifications';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

// Mock data for demo
const mockNotifications = [
  {
    id: '1',
    userId: 'user1',
    title: 'Order Shipped',
    message: 'Your order #BD12345 has been shipped via Pathao Courier. Expected delivery: Tomorrow by 6 PM.',
    type: 'shipping' as const,
    category: 'order',
    priority: 'medium' as const,
    channel: 'in-app' as const,
    isRead: false,
    isStarred: false,
    data: {
      orderId: 'BD12345',
      trackingNumber: 'PTH123456789',
      courier: 'Pathao',
      estimatedDelivery: '2025-01-11T18:00:00.000Z'
    },
    metadata: {
      culturalContext: {
        language: 'en',
        region: 'Dhaka'
      },
      paymentMethod: 'bKash'
    },
    actions: [
      {
        type: 'primary',
        label: 'Track Order',
        action: 'track_order',
        url: '/track/PTH123456789'
      },
      {
        type: 'secondary',
        label: 'Contact Courier',
        action: 'contact_courier',
        data: { courier: 'Pathao', phone: '+8801234567890' }
      }
    ],
    createdAt: new Date('2025-01-10T14:30:00.000Z'),
    updatedAt: new Date('2025-01-10T14:30:00.000Z')
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Payment Successful',
    message: 'Your bKash payment of ৳2,450 for order #BD12344 has been processed successfully.',
    type: 'success' as const,
    category: 'payment',
    priority: 'high' as const,
    channel: 'in-app' as const,
    isRead: false,
    isStarred: true,
    data: {
      orderId: 'BD12344',
      amount: 2450,
      currency: 'BDT',
      paymentMethod: 'bKash',
      transactionId: 'BKS987654321'
    },
    metadata: {
      culturalContext: {
        language: 'en',
        region: 'Chittagong'
      }
    },
    actions: [
      {
        type: 'primary',
        label: 'View Receipt',
        action: 'view_receipt',
        url: '/receipts/BKS987654321'
      }
    ],
    createdAt: new Date('2025-01-10T12:15:00.000Z'),
    updatedAt: new Date('2025-01-10T12:15:00.000Z')
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Festival Sale Alert! 🎉',
    message: 'Pohela Boishakh mega sale is live! Get up to 70% off on all electronics. Limited time offer!',
    type: 'promotional' as const,
    category: 'promotion',
    priority: 'medium' as const,
    channel: 'in-app' as const,
    isRead: true,
    isStarred: false,
    data: {
      saleId: 'PB2025',
      discount: 70,
      category: 'electronics',
      endTime: '2025-01-15T23:59:59.000Z'
    },
    metadata: {
      culturalContext: {
        language: 'en',
        festival: 'pohela_boishakh',
        region: 'Bangladesh'
      }
    },
    actions: [
      {
        type: 'primary',
        label: 'Shop Now',
        action: 'shop_sale',
        url: '/sale/pohela-boishakh-2025'
      },
      {
        type: 'secondary',
        label: 'View Wishlist',
        action: 'view_wishlist',
        url: '/wishlist'
      }
    ],
    createdAt: new Date('2025-01-09T10:00:00.000Z'),
    updatedAt: new Date('2025-01-09T10:00:00.000Z')
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Security Alert',
    message: 'A new device logged into your account from Dhaka. If this wasn\'t you, please secure your account immediately.',
    type: 'warning' as const,
    category: 'security',
    priority: 'urgent' as const,
    channel: 'in-app' as const,
    isRead: false,
    isStarred: false,
    data: {
      deviceInfo: {
        type: 'Mobile',
        browser: 'Chrome',
        location: 'Dhaka, Bangladesh',
        ip: '103.XXX.XXX.XXX'
      },
      loginTime: '2025-01-10T09:45:00.000Z'
    },
    metadata: {
      culturalContext: {
        language: 'en',
        region: 'Dhaka'
      }
    },
    actions: [
      {
        type: 'primary',
        label: 'Secure Account',
        action: 'secure_account',
        url: '/security/devices'
      },
      {
        type: 'secondary',
        label: 'It Was Me',
        action: 'confirm_login',
        data: { deviceId: 'dev123' }
      }
    ],
    createdAt: new Date('2025-01-10T09:45:00.000Z'),
    updatedAt: new Date('2025-01-10T09:45:00.000Z')
  },
  {
    id: '5',
    userId: 'user1',
    title: 'Nagad Cashback Received',
    message: 'You\'ve received ৳50 cashback in your Nagad wallet for your recent purchase. Balance: ৳1,250',
    type: 'success' as const,
    category: 'payment',
    priority: 'low' as const,
    channel: 'in-app' as const,
    isRead: true,
    isStarred: false,
    data: {
      cashbackAmount: 50,
      newBalance: 1250,
      currency: 'BDT',
      paymentMethod: 'Nagad'
    },
    metadata: {
      culturalContext: {
        language: 'en',
        region: 'Sylhet'
      }
    },
    actions: [
      {
        type: 'primary',
        label: 'View Wallet',
        action: 'view_wallet',
        url: '/wallet'
      }
    ],
    createdAt: new Date('2025-01-09T16:20:00.000Z'),
    updatedAt: new Date('2025-01-09T16:20:00.000Z')
  }
];

const mockStats = {
  total: 5,
  unread: 3,
  starred: 1,
  categories: {
    order: 1,
    payment: 2,
    promotion: 1,
    security: 1
  },
  channels: {
    'in-app': 5,
    email: 0,
    sms: 0,
    push: 0,
    whatsapp: 0
  },
  priorities: {
    low: 1,
    medium: 2,
    high: 1,
    urgent: 1
  }
};

/**
 * NotificationDemo Page
 * 
 * Comprehensive demonstration of the Amazon.com/Shopee.sg-level notification system
 * showcasing all notification components with Bangladesh market integration
 */
export default function NotificationDemo() {
  const [selectedTab, setSelectedTab] = useState('center');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');

  const handleNotificationAction = (action: any) => {
    console.log('Notification action triggered:', action);
    // In a real app, this would handle the action routing
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Mark as read:', notificationId);
    // In a real app, this would update the notification status
  };

  const handleMarkAsUnread = (notificationId: string) => {
    console.log('Mark as unread:', notificationId);
    // In a real app, this would update the notification status
  };

  const handleStar = (notificationId: string) => {
    console.log('Star notification:', notificationId);
    // In a real app, this would update the star status
  };

  const handleDelete = (notificationId: string) => {
    console.log('Delete notification:', notificationId);
    // In a real app, this would delete the notification
  };

  const handlePreferencesSave = () => {
    console.log('Preferences saved');
    // In a real app, this would save the preferences
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notification System Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Amazon.com/Shopee.sg-level notification management with Bangladesh market integration
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Language:</label>
                <Select value={language} onValueChange={(value: 'en' | 'bn') => setLanguage(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn">বাংলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">View:</label>
                <Select value={viewMode} onValueChange={(value: 'compact' | 'detailed') => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Total Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockStats.total}</div>
              <div className="text-sm text-muted-foreground">
                {mockStats.unread} unread, {mockStats.starred} starred
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                By Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Urgent</span>
                  <Badge variant="destructive">{mockStats.priorities.urgent}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>High</span>
                  <Badge variant="secondary">{mockStats.priorities.high}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medium</span>
                  <Badge variant="outline">{mockStats.priorities.medium}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Low</span>
                  <Badge variant="outline">{mockStats.priorities.low}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                By Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Order</span>
                  <Badge>{mockStats.categories.order}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <Badge>{mockStats.categories.payment}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Promotion</span>
                  <Badge>{mockStats.categories.promotion}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Security</span>
                  <Badge>{mockStats.categories.security}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="center">Notification Center</TabsTrigger>
            <TabsTrigger value="items">Individual Items</TabsTrigger>
            <TabsTrigger value="preferences">User Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="center">
            <Card>
              <CardHeader>
                <CardTitle>Notification Center Demo</CardTitle>
                <CardDescription>
                  Complete notification management interface with real-time features, 
                  filtering, search, and Bangladesh cultural integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationCenter
                  userId="user1"
                  notifications={mockNotifications}
                  stats={mockStats}
                  language={language}
                  onAction={handleNotificationAction}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onStar={handleStar}
                  onDelete={handleDelete}
                  showCulturalFeatures={true}
                  showAdvancedFilters={true}
                  enableRealTime={true}
                  className="h-96"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Notification Items</CardTitle>
                  <CardDescription>
                    Showcase of different notification types with Bangladesh-specific features
                    and cultural context integration.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="pt-6">
                      <NotificationItem
                        notification={notification}
                        language={language}
                        viewMode={viewMode}
                        showActions={true}
                        showAvatar={true}
                        showTimestamp={true}
                        showPriority={true}
                        showChannel={true}
                        onAction={handleNotificationAction}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onMarkAsUnread={() => handleMarkAsUnread(notification.id)}
                        onStar={() => handleStar(notification.id)}
                        onDelete={() => handleDelete(notification.id)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences Demo</CardTitle>
                <CardDescription>
                  Comprehensive preference management with Bangladesh cultural settings,
                  mobile banking integration, and localized features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationPreferences
                  userId="user1"
                  language={language}
                  showCulturalSettings={true}
                  showAdvancedSettings={true}
                  culturalContext={{
                    timezone: "Asia/Dhaka",
                    district: "Dhaka",
                    upazila: "Dhanmondi",
                    religion: "Islam",
                    festivals: ["eid", "pohela_boishakh", "victory_day"]
                  }}
                  onSave={handlePreferencesSave}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>🎉 Amazon.com/Shopee.sg-Level Features Implemented</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Real-time WebSocket integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Multi-channel support (Email, SMS, Push, In-App, WhatsApp)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Bangladesh cultural integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Bengali/English multi-language support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Mobile banking integration (bKash, Nagad, Rocket)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced filtering and search</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority-based routing and display</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Cultural context awareness (festivals, prayer times)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Comprehensive user preferences</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Action-based notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Responsive design with mobile optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Enterprise-grade backend integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}