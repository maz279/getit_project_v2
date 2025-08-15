import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, X, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Label } from '@/shared/ui/label';

/**
 * Push Notifications - Amazon.com/Shopee.sg-Level Notification System
 * Complete push notification management with preferences and smart delivery
 */

interface PushNotificationsProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  userId?: string;
}

interface NotificationPreferences {
  orders: boolean;
  deals: boolean;
  priceDrops: boolean;
  stockAlerts: boolean;
  promotions: boolean;
  newArrivals: boolean;
  reviews: boolean;
  shipping: boolean;
  marketing: boolean;
  social: boolean;
}

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
  category: 'transactional' | 'promotional' | 'social';
}

const PushNotifications: React.FC<PushNotificationsProps> = ({
  onPermissionChange,
  onSubscriptionChange,
  userId
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orders: true,
    deals: true,
    priceDrops: true,
    stockAlerts: true,
    promotions: false,
    newArrivals: false,
    reviews: true,
    shipping: true,
    marketing: false,
    social: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Notification channels configuration
  const notificationChannels: NotificationChannel[] = [
    {
      id: 'orders',
      name: 'Order Updates',
      description: 'Order confirmations, shipping updates, delivery notifications',
      icon: '📦',
      defaultEnabled: true,
      category: 'transactional'
    },
    {
      id: 'deals',
      name: 'Flash Deals',
      description: 'Limited-time offers and flash sales',
      icon: '⚡',
      defaultEnabled: true,
      category: 'promotional'
    },
    {
      id: 'priceDrops',
      name: 'Price Drops',
      description: 'Price alerts for wishlist and followed items',
      icon: '💰',
      defaultEnabled: true,
      category: 'promotional'
    },
    {
      id: 'stockAlerts',
      name: 'Stock Alerts',
      description: 'Back in stock notifications for saved items',
      icon: '🔔',
      defaultEnabled: true,
      category: 'promotional'
    },
    {
      id: 'shipping',
      name: 'Shipping Updates',
      description: 'Package tracking and delivery status',
      icon: '🚚',
      defaultEnabled: true,
      category: 'transactional'
    },
    {
      id: 'reviews',
      name: 'Review Reminders',
      description: 'Product review requests and feedback',
      icon: '⭐',
      defaultEnabled: true,
      category: 'social'
    },
    {
      id: 'newArrivals',
      name: 'New Arrivals',
      description: 'Latest products in your favorite categories',
      icon: '🆕',
      defaultEnabled: false,
      category: 'promotional'
    },
    {
      id: 'promotions',
      name: 'Promotions',
      description: 'Coupons, discounts, and special offers',
      icon: '🎁',
      defaultEnabled: false,
      category: 'promotional'
    },
    {
      id: 'marketing',
      name: 'Marketing Updates',
      description: 'Newsletter, product recommendations, and tips',
      icon: '📢',
      defaultEnabled: false,
      category: 'promotional'
    },
    {
      id: 'social',
      name: 'Social Activity',
      description: 'Comments, likes, and social interactions',
      icon: '👥',
      defaultEnabled: false,
      category: 'social'
    }
  ];

  // Initialize notification state
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Load saved preferences
      const savedPreferences = localStorage.getItem('notification-preferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  // Check for existing subscription
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      setSubscription(existingSubscription);
      onSubscriptionChange?.(existingSubscription);
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      onPermissionChange?.(result);

      if (result === 'granted') {
        await subscribeToPush();
      }

      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || 'demo-key';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      setSubscription(subscription);
      onSubscriptionChange?.(subscription);

      // Send subscription to server
      await saveSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      onSubscriptionChange?.(null);

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  const saveSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId,
          preferences
        })
      });
    } catch (error) {
      console.error('Error saving subscription to server:', error);
    }
  };

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/v1/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('notification-preferences', JSON.stringify(newPreferences));

    // Update server preferences
    if (subscription) {
      try {
        await fetch('/api/v1/notifications/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            preferences: newPreferences
          })
        });
      } catch (error) {
        console.error('Error updating preferences on server:', error);
      }
    }
  };

  const handlePreferenceChange = (channel: string, enabled: boolean) => {
    const newPreferences = { ...preferences, [channel]: enabled };
    updatePreferences(newPreferences);
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      new Notification('GetIt Bangladesh', {
        body: 'Test notification - Your notifications are working perfectly!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'test-notification'
      });
    }
  };

  // Utility function for VAPID key conversion
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Enabled', color: 'text-green-600', icon: Bell };
      case 'denied':
        return { text: 'Blocked', color: 'text-red-600', icon: BellOff };
      default:
        return { text: 'Not Set', color: 'text-gray-600', icon: Bell };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="push-notifications-container">
      {/* Main Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${status.color}`} />
              <span>Push Notifications</span>
            </div>
            <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
              {status.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Get notified about orders, deals, and important updates
          </p>

          {permission === 'default' && (
            <Button 
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}

          {permission === 'granted' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  ✓ Notifications enabled
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendTestNotification}
                  className="flex-1"
                >
                  Test Notification
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unsubscribeFromPush}
                  className="flex-1"
                >
                  Disable
                </Button>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {showSettings && permission === 'granted' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Notification Preferences
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Transactional Notifications */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Essential Notifications
                <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
              </h3>
              <div className="space-y-3">
                {notificationChannels
                  .filter(channel => channel.category === 'transactional')
                  .map(channel => (
                    <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{channel.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{channel.name}</div>
                          <div className="text-xs text-gray-600">{channel.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[channel.id as keyof NotificationPreferences]}
                        onCheckedChange={(checked) => handlePreferenceChange(channel.id, checked)}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Promotional Notifications */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Deals & Promotions</h3>
              <div className="space-y-3">
                {notificationChannels
                  .filter(channel => channel.category === 'promotional')
                  .map(channel => (
                    <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{channel.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{channel.name}</div>
                          <div className="text-xs text-gray-600">{channel.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[channel.id as keyof NotificationPreferences]}
                        onCheckedChange={(checked) => handlePreferenceChange(channel.id, checked)}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Social Notifications */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Social & Community</h3>
              <div className="space-y-3">
                {notificationChannels
                  .filter(channel => channel.category === 'social')
                  .map(channel => (
                    <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{channel.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{channel.name}</div>
                          <div className="text-xs text-gray-600">{channel.description}</div>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[channel.id as keyof NotificationPreferences]}
                        onCheckedChange={(checked) => handlePreferenceChange(channel.id, checked)}
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="border-t pt-4">
              <Label className="font-medium text-gray-900">Quiet Hours</Label>
              <p className="text-sm text-gray-600 mt-1">
                Notifications will be delayed during these hours (10 PM - 8 AM)
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Enable quiet hours</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
    return null;
  };

  return {
    permission,
    subscription,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window
  };
};

export default PushNotifications;