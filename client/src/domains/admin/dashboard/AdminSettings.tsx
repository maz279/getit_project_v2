
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Settings, Globe, Shield, Bell, CreditCard, Users, Package } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoApproveVendors: false,
    autoApproveProducts: false,
    maintenanceMode: false,
    allowGuestCheckout: true,
    requireEmailVerification: true,
    enableMultiCurrency: true
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const systemSettings = [
    {
      category: 'General',
      icon: Settings,
      settings: [
        {
          key: 'maintenanceMode',
          title: 'Maintenance Mode',
          description: 'Put the site in maintenance mode',
          type: 'toggle'
        },
        {
          key: 'allowGuestCheckout',
          title: 'Guest Checkout',
          description: 'Allow users to checkout without registration',
          type: 'toggle'
        }
      ]
    },
    {
      category: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Send email notifications to admins',
          type: 'toggle'
        },
        {
          key: 'smsNotifications',
          title: 'SMS Notifications',
          description: 'Send SMS notifications for critical alerts',
          type: 'toggle'
        }
      ]
    },
    {
      category: 'Vendor Management',
      icon: Users,
      settings: [
        {
          key: 'autoApproveVendors',
          title: 'Auto-approve Vendors',
          description: 'Automatically approve new vendor registrations',
          type: 'toggle'
        },
        {
          key: 'requireEmailVerification',
          title: 'Email Verification',
          description: 'Require email verification for new vendors',
          type: 'toggle'
        }
      ]
    },
    {
      category: 'Product Management',
      icon: Package,
      settings: [
        {
          key: 'autoApproveProducts',
          title: 'Auto-approve Products',
          description: 'Automatically approve new products from verified vendors',
          type: 'toggle'
        }
      ]
    },
    {
      category: 'Payment & Currency',
      icon: CreditCard,
      settings: [
        {
          key: 'enableMultiCurrency',
          title: 'Multi-Currency Support',
          description: 'Enable multiple currency support',
          type: 'toggle'
        }
      ]
    }
  ];

  const configurationCards = [
    {
      title: 'Site Configuration',
      icon: Globe,
      description: 'Manage site-wide settings and configurations',
      items: ['Site Name', 'Logo', 'Favicon', 'Meta Tags', 'SEO Settings']
    },
    {
      title: 'Security Settings',
      icon: Shield,
      description: 'Configure security and access controls',
      items: ['Two-Factor Auth', 'Password Policy', 'Session Timeout', 'IP Whitelist']
    },
    {
      title: 'Payment Configuration',
      icon: CreditCard,
      description: 'Manage payment gateways and settings',
      items: ['bKash', 'Nagad', 'Rocket', 'Bank Transfer', 'Commission Rates']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Save All Changes
        </Button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {configurationCards.map((config, index) => {
          const Icon = config.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                </div>
                <p className="text-sm text-gray-600">{config.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {config.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-700">{item}</span>
                      <Badge variant="outline" className="text-xs">Configure</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systemSettings.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <Card key={categoryIndex}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <CardTitle>{category.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{setting.title}</h4>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <Switch
                        checked={settings[setting.key as keyof typeof settings]}
                        onCheckedChange={() => toggleSetting(setting.key)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Platform Version</div>
              <div className="font-semibold text-gray-900">v2.1.0</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Database Version</div>
              <div className="font-semibold text-gray-900">PostgreSQL 14.2</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Server Status</div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <div className="font-semibold text-green-600">Online</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Last Backup</div>
              <div className="font-semibold text-gray-900">2 hours ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
