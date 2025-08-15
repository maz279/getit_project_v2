
import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Users, Lock, Settings, Globe } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const PrivacyControls: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState({
    wishlistVisibility: 'private',
    allowRecommendations: true,
    shareData: false,
    twoFactorAuth: true,
    sessionTimeout: '30',
    dataEncryption: true
  });

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can see your wishlist' },
    { value: 'friends', label: 'Friends Only', description: 'Only your friends can see' },
    { value: 'private', label: 'Private', description: 'Only you can see your wishlist' }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          Privacy & Security Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wishlist Visibility */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Wishlist Visibility Settings</h3>
          <div className="grid gap-3">
            {visibilityOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  privacySettings.wishlistVisibility === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPrivacySettings(prev => ({...prev, wishlistVisibility: option.value}))}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {option.value === 'public' && <Globe className="w-4 h-4 text-blue-600" />}
                    {option.value === 'friends' && <Users className="w-4 h-4 text-green-600" />}
                    {option.value === 'private' && <Lock className="w-4 h-4 text-gray-600" />}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Protection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Data Protection</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Allow Personalized Recommendations</h4>
                <p className="text-sm text-gray-600">Use your data to provide better product suggestions</p>
              </div>
              <Switch
                checked={privacySettings.allowRecommendations}
                onCheckedChange={(checked) => setPrivacySettings(prev => ({...prev, allowRecommendations: checked}))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Share Anonymous Data</h4>
                <p className="text-sm text-gray-600">Help improve our service with anonymous usage data</p>
              </div>
              <Switch
                checked={privacySettings.shareData}
                onCheckedChange={(checked) => setPrivacySettings(prev => ({...prev, shareData: checked}))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Data Encryption</h4>
                <p className="text-sm text-gray-600">Encrypt all your wishlist data (Recommended)</p>
              </div>
              <Switch
                checked={privacySettings.dataEncryption}
                onCheckedChange={(checked) => setPrivacySettings(prev => ({...prev, dataEncryption: checked}))}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Account Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Two-Factor Authentication
              </label>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Mobile OTP</span>
                <Switch
                  checked={privacySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({...prev, twoFactorAuth: checked}))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Session Timeout (minutes)
              </label>
              <Select 
                value={privacySettings.sessionTimeout} 
                onValueChange={(value) => setPrivacySettings(prev => ({...prev, sessionTimeout: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Compliance Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Compliance & Standards</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>✓ GDPR Compliant - International privacy standards</p>
            <p>✓ Bangladesh Data Protection Act compliance</p>
            <p>✓ 256-bit SSL encryption for all data transmission</p>
            <p>✓ Regular security audits and monitoring</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </Button>
          <Button variant="outline" size="sm">
            Download My Data
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
