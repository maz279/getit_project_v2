/**
 * WishlistNotifications - Price Alerts and Notifications Component
 * Amazon.com/Shopee.sg-Level Wishlist Notifications System
 * Phase 1 Week 3-4 Implementation
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Mail, 
  Smartphone,
  AlertCircle,
  CheckCircle,
  Settings,
  Star,
  Package,
  Calendar,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

interface PriceAlert {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  currentPrice: number;
  targetPrice: number;
  alertType: 'price_drop' | 'target_price' | 'back_in_stock' | 'sale_alert';
  isActive: boolean;
  createdDate: Date;
  triggeredDate?: Date;
  notificationMethod: ('email' | 'push' | 'sms')[];
}

interface NotificationSettings {
  priceDrops: {
    enabled: boolean;
    threshold: number; // percentage
    methods: ('email' | 'push' | 'sms')[];
  };
  stockAlerts: {
    enabled: boolean;
    methods: ('email' | 'push' | 'sms')[];
  };
  saleAlerts: {
    enabled: boolean;
    methods: ('email' | 'push' | 'sms')[];
  };
  weeklyDigest: {
    enabled: boolean;
    day: string;
    time: string;
  };
  instantAlerts: {
    enabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

interface WishlistNotificationsProps {
  alerts: PriceAlert[];
  settings: NotificationSettings;
  onCreateAlert: (alert: Omit<PriceAlert, 'id' | 'createdDate'>) => void;
  onUpdateAlert: (alertId: string, updates: Partial<PriceAlert>) => void;
  onDeleteAlert: (alertId: string) => void;
  onUpdateSettings: (settings: NotificationSettings) => void;
  className?: string;
}

export const WishlistNotifications: React.FC<WishlistNotificationsProps> = ({
  alerts,
  settings,
  onCreateAlert,
  onUpdateAlert,
  onDeleteAlert,
  onUpdateSettings,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [newAlertItem, setNewAlertItem] = useState('');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertIcon = (type: PriceAlert['alertType']) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'target_price':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'back_in_stock':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'sale_alert':
        return <Zap className="h-4 w-4 text-orange-600" />;
    }
  };

  const getAlertTypeName = (type: PriceAlert['alertType']) => {
    switch (type) {
      case 'price_drop':
        return 'Price Drop';
      case 'target_price':
        return 'Target Price';
      case 'back_in_stock':
        return 'Back in Stock';
      case 'sale_alert':
        return 'Sale Alert';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.isActive);
  const triggeredAlerts = alerts.filter(alert => alert.triggeredDate);
  const recentAlerts = triggeredAlerts.slice(0, 5);

  const handleSettingsUpdate = (newSettings: NotificationSettings) => {
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const updateSettingField = (section: keyof NotificationSettings, field: string, value: any) => {
    const updatedSettings = {
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [field]: value
      }
    };
    handleSettingsUpdate(updatedSettings);
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Price Alerts & Notifications</h1>
            <p className="text-blue-100">
              Stay updated on price changes and never miss a deal
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <div className="text-sm text-blue-100">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{activeAlerts.length}</p>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.alertType === 'price_drop').length}
            </p>
            <p className="text-sm text-gray-600">Price Drops</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {alerts.filter(a => a.alertType === 'target_price').length}
            </p>
            <p className="text-sm text-gray-600">Target Prices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{triggeredAlerts.length}</p>
            <p className="text-sm text-gray-600">Triggered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="recent">Recent Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Price Alerts ({activeAlerts.length})</span>
                <Button size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Create New Alert
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active alerts</h3>
                  <p className="text-gray-600 mb-4">
                    Create price alerts for your wishlist items to get notified when prices drop
                  </p>
                  <Button>Create Your First Alert</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <Card key={alert.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={alert.itemImage}
                            alt={alert.itemName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {alert.itemName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                {getAlertIcon(alert.alertType)}
                                <span className="ml-1">{getAlertTypeName(alert.alertType)}</span>
                              </span>
                              <span>Created {formatDate(alert.createdDate)}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="space-y-1">
                              <div>
                                <span className="text-sm text-gray-600">Current: </span>
                                <span className="font-semibold">{formatPrice(alert.currentPrice)}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Target: </span>
                                <span className="font-semibold text-green-600">{formatPrice(alert.targetPrice)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {alert.notificationMethod.map((method) => (
                                  <Badge key={method} variant="outline" className="text-xs">
                                    {method === 'email' ? <Mail className="h-3 w-3" /> :
                                     method === 'push' ? <Bell className="h-3 w-3" /> :
                                     <Smartphone className="h-3 w-3" />}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Switch
                              checked={alert.isActive}
                              onCheckedChange={(checked) => 
                                onUpdateAlert(alert.id, { isActive: checked })
                              }
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDeleteAlert(alert.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Alerts Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Triggered Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent alerts</h3>
                  <p className="text-gray-600">
                    When your price alerts trigger, they'll appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={alert.itemImage}
                            alt={alert.itemName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{alert.itemName}</h4>
                            <div className="flex items-center space-x-2 text-sm">
                              <Badge className="bg-green-100 text-green-800">
                                {getAlertTypeName(alert.alertType)} Triggered
                              </Badge>
                              {alert.triggeredDate && (
                                <span className="text-gray-600">
                                  {formatDate(alert.triggeredDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {formatPrice(alert.currentPrice)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Target: {formatPrice(alert.targetPrice)}
                            </div>
                          </div>
                          
                          <Button size="sm">
                            View Item
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Price Drop Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Price Drop Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable price drop alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when items go on sale</p>
                  </div>
                  <Switch
                    checked={localSettings.priceDrops.enabled}
                    onCheckedChange={(checked) => 
                      updateSettingField('priceDrops', 'enabled', checked)
                    }
                  />
                </div>
                
                {localSettings.priceDrops.enabled && (
                  <>
                    <div>
                      <Label htmlFor="priceDropThreshold">Minimum price drop percentage</Label>
                      <Input
                        id="priceDropThreshold"
                        type="number"
                        value={localSettings.priceDrops.threshold}
                        onChange={(e) => 
                          updateSettingField('priceDrops', 'threshold', parseInt(e.target.value) || 0)
                        }
                        className="w-24 mt-1"
                        min="1"
                        max="99"
                      />
                      <span className="text-sm text-gray-600 ml-2">%</span>
                    </div>
                    
                    <div>
                      <Label>Notification methods</Label>
                      <div className="flex space-x-4 mt-2">
                        {['email', 'push', 'sms'].map((method) => (
                          <label key={method} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={localSettings.priceDrops.methods.includes(method as any)}
                              onChange={(e) => {
                                const methods = e.target.checked
                                  ? [...localSettings.priceDrops.methods, method as any]
                                  : localSettings.priceDrops.methods.filter(m => m !== method);
                                updateSettingField('priceDrops', 'methods', methods);
                              }}
                            />
                            <span className="text-sm capitalize">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Back in stock alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when out-of-stock items are available</p>
                  </div>
                  <Switch
                    checked={localSettings.stockAlerts.enabled}
                    onCheckedChange={(checked) => 
                      updateSettingField('stockAlerts', 'enabled', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sale Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Sale Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Flash sale alerts</Label>
                    <p className="text-sm text-gray-600">Get notified about flash sales and special offers</p>
                  </div>
                  <Switch
                    checked={localSettings.saleAlerts.enabled}
                    onCheckedChange={(checked) => 
                      updateSettingField('saleAlerts', 'enabled', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Digest */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Weekly Digest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-medium">Weekly summary email</Label>
                    <p className="text-sm text-gray-600">Get a weekly summary of your wishlist activity</p>
                  </div>
                  <Switch
                    checked={localSettings.weeklyDigest.enabled}
                    onCheckedChange={(checked) => 
                      updateSettingField('weeklyDigest', 'enabled', checked)
                    }
                  />
                </div>
                
                {localSettings.weeklyDigest.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Day of week</Label>
                      <select
                        value={localSettings.weeklyDigest.day}
                        onChange={(e) => updateSettingField('weeklyDigest', 'day', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                      >
                        <option value="Sunday">Sunday</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={localSettings.weeklyDigest.time}
                        onChange={(e) => updateSettingField('weeklyDigest', 'time', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Quiet Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-medium">Enable quiet hours</Label>
                    <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
                  </div>
                  <Switch
                    checked={localSettings.instantAlerts.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      updateSettingField('instantAlerts', 'quietHours', {
                        ...localSettings.instantAlerts.quietHours,
                        enabled: checked
                      })
                    }
                  />
                </div>
                
                {localSettings.instantAlerts.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start time</Label>
                      <Input
                        type="time"
                        value={localSettings.instantAlerts.quietHours.start}
                        onChange={(e) => 
                          updateSettingField('instantAlerts', 'quietHours', {
                            ...localSettings.instantAlerts.quietHours,
                            start: e.target.value
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>End time</Label>
                      <Input
                        type="time"
                        value={localSettings.instantAlerts.quietHours.end}
                        onChange={(e) => 
                          updateSettingField('instantAlerts', 'quietHours', {
                            ...localSettings.instantAlerts.quietHours,
                            end: e.target.value
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-12 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Smart Notification Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <p className="font-medium mb-1">Set Realistic Targets</p>
              <p>Set price targets based on historical data</p>
            </div>
            <div>
              <p className="font-medium mb-1">Use Multiple Methods</p>
              <p>Combine email, push, and SMS for important alerts</p>
            </div>
            <div>
              <p className="font-medium mb-1">Review Regularly</p>
              <p>Update your alerts based on changing preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistNotifications;