import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Slider } from '@/shared/ui/slider';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Settings, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Moon, 
  Sun, 
  Volume2,
  Smartphone,
  Mail,
  MessageSquare,
  DollarSign,
  Package,
  Star,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import EnhancedUserApiService from '@/shared/services/user/EnhancedUserApiService';

interface UserPreferences {
  // General Settings
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  
  // Notification Settings
  notifications: {
    email: {
      orderUpdates: boolean;
      promotions: boolean;
      newsletter: boolean;
      securityAlerts: boolean;
      priceDrops: boolean;
      backInStock: boolean;
    };
    push: {
      orderUpdates: boolean;
      promotions: boolean;
      deals: boolean;
      messages: boolean;
    };
    sms: {
      orderUpdates: boolean;
      securityAlerts: boolean;
      deliveryUpdates: boolean;
    };
  };
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
    shareWishlist: boolean;
    allowReviews: boolean;
    allowRecommendations: boolean;
    dataSharing: boolean;
    marketingConsent: boolean;
  };
  
  // Shopping Preferences
  shopping: {
    defaultShippingSpeed: string;
    autoApplyCoupons: boolean;
    saveForLater: boolean;
    quickBuy: boolean;
    compareProducts: boolean;
    wishlistNotifications: boolean;
    bundleRecommendations: boolean;
  };
  
  // Bangladesh Cultural Settings
  cultural: {
    festivalNotifications: boolean;
    prayerTimeNotifications: boolean;
    ramadanMode: boolean;
    localHolidays: boolean;
    bengaliCalendar: boolean;
    regionalOffers: boolean;
  };
}

const UserPreferences: React.FC = () => {
  // State Management
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const languages = [
    { code: 'bn', name: 'বাংলা (Bangla)', flag: '🇧🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' }
  ];

  const currencies = [
    { code: 'BDT', name: 'Bangladeshi Taka (৳)', symbol: '৳' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' }
  ];

  const timezones = [
    { code: 'Asia/Dhaka', name: 'Dhaka (UTC+6)' },
    { code: 'Asia/Kolkata', name: 'Kolkata (UTC+5:30)' },
    { code: 'UTC', name: 'UTC (UTC+0)' },
    { code: 'America/New_York', name: 'New York (UTC-5)' }
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await EnhancedUserApiService.getPreferences();
      if (response.success) {
        setPreferences(response.data || getDefaultPreferences());
      } else {
        setPreferences(getDefaultPreferences());
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setPreferences(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPreferences = (): UserPreferences => ({
    language: 'bn',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    theme: 'light',
    notifications: {
      email: {
        orderUpdates: true,
        promotions: true,
        newsletter: false,
        securityAlerts: true,
        priceDrops: true,
        backInStock: true
      },
      push: {
        orderUpdates: true,
        promotions: false,
        deals: true,
        messages: true
      },
      sms: {
        orderUpdates: true,
        securityAlerts: true,
        deliveryUpdates: true
      }
    },
    privacy: {
      profileVisibility: 'private',
      showOnlineStatus: false,
      shareWishlist: false,
      allowReviews: true,
      allowRecommendations: true,
      dataSharing: false,
      marketingConsent: false
    },
    shopping: {
      defaultShippingSpeed: 'standard',
      autoApplyCoupons: true,
      saveForLater: true,
      quickBuy: false,
      compareProducts: true,
      wishlistNotifications: true,
      bundleRecommendations: true
    },
    cultural: {
      festivalNotifications: true,
      prayerTimeNotifications: false,
      ramadanMode: false,
      localHolidays: true,
      bengaliCalendar: true,
      regionalOffers: true
    }
  });

  const updatePreference = (path: string, value: any) => {
    if (!preferences) return;
    
    const keys = path.split('.');
    const newPreferences = { ...preferences };
    let current: any = newPreferences;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const response = await EnhancedUserApiService.updatePreferences(preferences);
      if (response.success) {
        setAlerts([{ type: 'success', message: 'Preferences saved successfully' }]);
        setHasChanges(false);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to save preferences' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to save preferences' }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !preferences) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.map((alert, index) => (
        <Alert key={index} className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}

      {/* Save Banner */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadPreferences}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Preferences
          </CardTitle>
          <CardDescription>
            Customize your experience and manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="shopping">Shopping</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => updatePreference('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => updatePreference('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => updatePreference('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz.code} value={tz.code}>
                          {tz.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => updatePreference('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <span className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </span>
                      </SelectItem>
                      <SelectItem value="auto">
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Auto
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-6">
                {/* Email Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="h-5 w-5" />
                      Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(preferences.notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <p className="text-sm text-gray-600">
                            {key === 'orderUpdates' && 'Get updates about your orders'}
                            {key === 'promotions' && 'Receive promotional offers and deals'}
                            {key === 'newsletter' && 'Weekly newsletter with latest updates'}
                            {key === 'securityAlerts' && 'Important security notifications'}
                            {key === 'priceDrops' && 'Alerts when prices drop on your wishlist'}
                            {key === 'backInStock' && 'Notifications when items are back in stock'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updatePreference(`notifications.email.${key}`, checked)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Smartphone className="h-5 w-5" />
                      Push Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(preferences.notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <p className="text-sm text-gray-600">
                            {key === 'orderUpdates' && 'Push notifications for order status changes'}
                            {key === 'promotions' && 'Special offers and promotional notifications'}
                            {key === 'deals' && 'Flash sales and limited-time deals'}
                            {key === 'messages' && 'Messages from vendors and support'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updatePreference(`notifications.push.${key}`, checked)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* SMS Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5" />
                      SMS Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(preferences.notifications.sms).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <p className="text-sm text-gray-600">
                            {key === 'orderUpdates' && 'SMS updates for important order changes'}
                            {key === 'securityAlerts' && 'Critical security alerts via SMS'}
                            {key === 'deliveryUpdates' && 'Delivery status and scheduling updates'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updatePreference(`notifications.sms.${key}`, checked)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Data Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and how we use your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select
                      value={preferences.privacy.profileVisibility}
                      onValueChange={(value: 'public' | 'private' | 'friends') => 
                        updatePreference('privacy.profileVisibility', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private - Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries(preferences.privacy)
                    .filter(([key]) => key !== 'profileVisibility')
                    .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <p className="text-sm text-gray-600">
                          {key === 'showOnlineStatus' && 'Show when you\'re online to other users'}
                          {key === 'shareWishlist' && 'Allow others to see your wishlist'}
                          {key === 'allowReviews' && 'Allow others to see your product reviews'}
                          {key === 'allowRecommendations' && 'Show personalized product recommendations'}
                          {key === 'dataSharing' && 'Share data for analytics and improvements'}
                          {key === 'marketingConsent' && 'Consent to receive marketing communications'}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => 
                          updatePreference(`privacy.${key}`, checked)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shopping Preferences */}
            <TabsContent value="shopping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shopping Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your shopping experience and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultShippingSpeed">Default Shipping Speed</Label>
                    <Select
                      value={preferences.shopping.defaultShippingSpeed}
                      onValueChange={(value) => updatePreference('shopping.defaultShippingSpeed', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                        <SelectItem value="express">Express (1-2 days)</SelectItem>
                        <SelectItem value="same-day">Same Day</SelectItem>
                        <SelectItem value="next-day">Next Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries(preferences.shopping)
                    .filter(([key]) => key !== 'defaultShippingSpeed')
                    .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <p className="text-sm text-gray-600">
                          {key === 'autoApplyCoupons' && 'Automatically apply available coupons at checkout'}
                          {key === 'saveForLater' && 'Save items for later when removing from cart'}
                          {key === 'quickBuy' && 'Enable one-click purchasing'}
                          {key === 'compareProducts' && 'Show product comparison features'}
                          {key === 'wishlistNotifications' && 'Get notified about wishlist item changes'}
                          {key === 'bundleRecommendations' && 'Show product bundle suggestions'}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => 
                          updatePreference(`shopping.${key}`, checked)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cultural Settings */}
            <TabsContent value="cultural" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Bangladesh Cultural Settings
                  </CardTitle>
                  <CardDescription>
                    Customize your experience with Bangladesh cultural features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(preferences.cultural).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <p className="text-sm text-gray-600">
                          {key === 'festivalNotifications' && 'Get notified about Eid, Pohela Boishakh, and other festivals'}
                          {key === 'prayerTimeNotifications' && 'Daily prayer time reminders'}
                          {key === 'ramadanMode' && 'Special Ramadan features and timing'}
                          {key === 'localHolidays' && 'Victory Day, Independence Day, Language Day notifications'}
                          {key === 'bengaliCalendar' && 'Show dates in Bengali calendar'}
                          {key === 'regionalOffers' && 'Special offers for your region'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          updatePreference(`cultural.${key}`, checked)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;