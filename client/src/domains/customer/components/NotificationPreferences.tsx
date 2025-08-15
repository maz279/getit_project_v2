import React, { useState } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Bell, Mail, MessageSquare, Smartphone, Volume2, Clock, ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  priority: 'high' | 'medium' | 'low';
}

const NotificationPreferences: React.FC = () => {
  const [globalEmail, setGlobalEmail] = useState(true);
  const [globalSMS, setGlobalSMS] = useState(true);
  const [globalPush, setGlobalPush] = useState(true);
  const [globalInApp, setGlobalInApp] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  const [frequency, setFrequency] = useState('instant');

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'order-updates',
      category: 'Orders',
      name: 'Order Updates',
      description: 'Order confirmation, shipping updates, delivery confirmations',
      email: true,
      sms: true,
      push: true,
      inApp: true,
      priority: 'high'
    },
    {
      id: 'payment-updates',
      category: 'Payments',
      name: 'Payment Updates',
      description: 'Payment confirmations, failed payments, refund updates',
      email: true,
      sms: true,
      push: true,
      inApp: true,
      priority: 'high'
    },
    {
      id: 'deals-offers',
      category: 'Marketing',
      name: 'Deals & Offers',
      description: 'Flash sales, special discounts, personalized offers',
      email: true,
      sms: false,
      push: true,
      inApp: true,
      priority: 'medium'
    },
    {
      id: 'product-recommendations',
      category: 'Personalization',
      name: 'Product Recommendations',
      description: 'AI-powered product suggestions based on your interests',
      email: false,
      sms: false,
      push: true,
      inApp: true,
      priority: 'low'
    },
    {
      id: 'price-drops',
      category: 'Wishlist',
      name: 'Price Drop Alerts',
      description: 'Notifications when items in your wishlist go on sale',
      email: true,
      sms: false,
      push: true,
      inApp: true,
      priority: 'medium'
    },
    {
      id: 'stock-alerts',
      category: 'Inventory',
      name: 'Stock Alerts',
      description: 'Notifications when out-of-stock items become available',
      email: true,
      sms: false,
      push: true,
      inApp: true,
      priority: 'medium'
    },
    {
      id: 'security-alerts',
      category: 'Security',
      name: 'Security Alerts',
      description: 'Login attempts, password changes, suspicious activity',
      email: true,
      sms: true,
      push: true,
      inApp: true,
      priority: 'high'
    },
    {
      id: 'newsletter',
      category: 'Communication',
      name: 'Newsletter',
      description: 'Weekly digest, platform updates, Bangladesh market news',
      email: true,
      sms: false,
      push: false,
      inApp: false,
      priority: 'low'
    },
    {
      id: 'social-updates',
      category: 'Social',
      name: 'Social Updates',
      description: 'Friend activities, reviews, social commerce updates',
      email: false,
      sms: false,
      push: true,
      inApp: true,
      priority: 'low'
    },
    {
      id: 'loyalty-rewards',
      category: 'Loyalty',
      name: 'Loyalty & Rewards',
      description: 'Points earned, tier upgrades, reward redemption opportunities',
      email: true,
      sms: false,
      push: true,
      inApp: true,
      priority: 'medium'
    }
  ]);

  const handleNotificationChange = (id: string, channel: 'email' | 'sms' | 'push' | 'inApp', value: boolean) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, [channel]: value }
          : notif
      )
    );
  };

  const handleGlobalToggle = (channel: 'email' | 'sms' | 'push' | 'inApp', value: boolean) => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, [channel]: value }))
    );
    
    switch (channel) {
      case 'email': setGlobalEmail(value); break;
      case 'sms': setGlobalSMS(value); break;
      case 'push': setGlobalPush(value); break;
      case 'inApp': setGlobalInApp(value); break;
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Orders': return '📦';
      case 'Payments': return '💳';
      case 'Marketing': return '🎯';
      case 'Personalization': return '🤖';
      case 'Wishlist': return '❤️';
      case 'Inventory': return '📊';
      case 'Security': return '🔒';
      case 'Communication': return '📧';
      case 'Social': return '👥';
      case 'Loyalty': return '⭐';
      default: return '🔔';
    }
  };

  const totalEnabled = notifications.reduce((count, notif) => 
    count + (notif.email || notif.sms || notif.push || notif.inApp ? 1 : 0), 0
  );

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      {/* Blue-purple-red gradient header for consistent design */}
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/account/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
          <p className="text-gray-600">Control how and when you receive notifications</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{totalEnabled}</div>
              <div className="text-sm text-gray-600">Active Notifications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {notifications.filter(n => n.email).length}
              </div>
              <div className="text-sm text-gray-600">Email Notifications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {notifications.filter(n => n.push).length}
              </div>
              <div className="text-sm text-gray-600">Push Notifications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {notifications.filter(n => n.sms).length}
              </div>
              <div className="text-sm text-gray-600">SMS Notifications</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive and how
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Global Controls */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Controls</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant={globalEmail ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGlobalToggle('email', !globalEmail)}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      All Email
                    </Button>
                    <Button
                      variant={globalSMS ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGlobalToggle('sms', !globalSMS)}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      All SMS
                    </Button>
                    <Button
                      variant={globalPush ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGlobalToggle('push', !globalPush)}
                      className="flex items-center gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      All Push
                    </Button>
                    <Button
                      variant={globalInApp ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGlobalToggle('inApp', !globalInApp)}
                      className="flex items-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      All In-App
                    </Button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="text-xl">{getCategoryIcon(notification.category)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{notification.name}</h4>
                            <p className="text-sm text-gray-600">{notification.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{notification.category}</Badge>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${notification.id}-email`} className="text-sm">Email</Label>
                          <Switch
                            id={`${notification.id}-email`}
                            checked={notification.email}
                            onCheckedChange={(checked) => handleNotificationChange(notification.id, 'email', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${notification.id}-sms`} className="text-sm">SMS</Label>
                          <Switch
                            id={`${notification.id}-sms`}
                            checked={notification.sms}
                            onCheckedChange={(checked) => handleNotificationChange(notification.id, 'sms', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${notification.id}-push`} className="text-sm">Push</Label>
                          <Switch
                            id={`${notification.id}-push`}
                            checked={notification.push}
                            onCheckedChange={(checked) => handleNotificationChange(notification.id, 'push', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${notification.id}-inapp`} className="text-sm">In-App</Label>
                          <Switch
                            id={`${notification.id}-inapp`}
                            checked={notification.inApp}
                            onCheckedChange={(checked) => handleNotificationChange(notification.id, 'inApp', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch checked={globalEmail} onCheckedChange={setGlobalEmail} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Address</Label>
                      <p className="text-sm text-gray-600">ahmed.rahman@gmail.com</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Frequency</Label>
                      <p className="text-sm text-gray-600">How often to send emails</p>
                    </div>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    SMS Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch checked={globalSMS} onCheckedChange={setGlobalSMS} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Phone Number</Label>
                      <p className="text-sm text-gray-600">+880 1712-345678</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      📱 SMS rates apply. Standard messaging charges from your carrier may apply.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Notification Schedule
                </CardTitle>
                <CardDescription>
                  Control when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="quietHours" className="font-medium">Quiet Hours</Label>
                    <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
                  </div>
                  <Switch
                    id="quietHours"
                    checked={quietHours}
                    onCheckedChange={setQuietHours}
                  />
                </div>

                {quietHours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quietStart">Quiet Hours Start</Label>
                      <Select value={quietStart} onValueChange={setQuietStart}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quietEnd">Quiet Hours End</Label>
                      <Select value={quietEnd} onValueChange={setQuietEnd}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Bangladesh Time Zone</h4>
                  <p className="text-sm text-green-700">
                    All notification schedules are based on Bangladesh Standard Time (GMT+6). 
                    Emergency and security notifications may override quiet hours settings.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Prayer Time Consideration</h4>
                  <p className="text-sm text-yellow-700">
                    We respect Bangladesh cultural practices. Non-urgent notifications are automatically 
                    paused during prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for Muslim users.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Configure Prayer Time Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Gray-blue-purple gradient footer for consistent design */}
      <Footer />
    </div>
  );
};

export default NotificationPreferences;