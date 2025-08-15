
import React, { useState } from 'react';
import { Bell, Settings, Mail, MessageCircle, Smartphone, Clock, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const SmartNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState({
    priceDrops: true,
    stockAlerts: true,
    dealAlerts: true,
    personalizedRecommendations: false,
    festivalReminders: true,
    seasonalSuggestions: false
  });

  const [preferences, setPreferences] = useState({
    channels: ['email', 'sms'],
    language: 'bangla',
    frequency: 'immediate',
    timing: 'respectful'
  });

  const notificationTypes = [
    {
      id: 'priceDrops',
      title: 'Price Drop Alerts',
      titleBn: 'দাম কমার বিজ্ঞপ্তি',
      description: 'Get notified when items in your wishlist go on sale',
      icon: <Bell className="w-5 h-5 text-green-600" />,
      enabled: notifications.priceDrops
    },
    {
      id: 'stockAlerts',
      title: 'Stock Alerts',
      titleBn: 'স্টক বিজ্ঞপ্তি',
      description: 'Back-in-stock notifications via SMS/WhatsApp',
      icon: <MessageCircle className="w-5 h-5 text-blue-600" />,
      enabled: notifications.stockAlerts
    },
    {
      id: 'dealAlerts',
      title: 'Deal Alerts',
      titleBn: 'অফার বিজ্ঞপ্তি',
      description: 'Flash sale and limited-time offer notifications',
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      enabled: notifications.dealAlerts
    },
    {
      id: 'festivalReminders',
      title: 'Festival Reminders',
      titleBn: 'উৎসবের রিমাইন্ডার',
      description: 'Eid and festival shopping reminders',
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      enabled: notifications.festivalReminders
    }
  ];

  const handleNotificationToggle = (id: string) => {
    setNotifications(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev]
    }));
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          Smart Notifications & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Alert Types</h3>
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {type.icon}
                <div>
                  <h4 className="font-medium text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-600">{type.titleBn}</p>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </div>
              </div>
              <Switch
                checked={type.enabled}
                onCheckedChange={() => handleNotificationToggle(type.id)}
              />
            </div>
          ))}
        </div>

        {/* Communication Preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Communication Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notification Channels
              </label>
              <div className="space-y-2">
                {[
                  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
                  { id: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
                  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> }
                ].map((channel) => (
                  <div key={channel.id} className="flex items-center gap-2">
                    <Switch
                      checked={preferences.channels.includes(channel.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPreferences(prev => ({
                            ...prev,
                            channels: [...prev.channels, channel.id]
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            channels: prev.channels.filter(c => c !== channel.id)
                          }));
                        }
                      }}
                    />
                    {channel.icon}
                    <span className="text-sm text-gray-700">{channel.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Language Preference
              </label>
              <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({...prev, language: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bangla">বাংলা (Bangla)</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="both">Both Languages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Frequency Settings
              </label>
              <Select value={preferences.frequency} onValueChange={(value) => setPreferences(prev => ({...prev, frequency: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Timing Preferences
              </label>
              <Select value={preferences.timing} onValueChange={(value) => setPreferences(prev => ({...prev, timing: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="respectful">Respectful of Prayer Times</SelectItem>
                  <SelectItem value="anytime">Any Time</SelectItem>
                  <SelectItem value="business">Business Hours Only</SelectItem>
                  <SelectItem value="evening">Evening Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cultural Customization */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-gray-900">Cultural Customization</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Switch defaultChecked />
              <span>Festival Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked />
              <span>Prayer Time Awareness</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch />
              <span>Regional Preferences</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
