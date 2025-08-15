
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Separator } from '@/shared/ui/separator';
import { Badge } from '@/shared/ui/badge';
import { Settings, DollarSign, Clock, Shield, Bell } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

export const PayoutSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    // Processing Settings
    autoProcessingEnabled: true,
    batchProcessingEnabled: true,
    maxBatchSize: 100,
    processingInterval: 'daily',
    
    // Fee Settings
    defaultProcessingFee: 2.5,
    feeType: 'percentage',
    minimumFee: 10,
    maximumFee: 500,
    
    // Approval Settings
    autoApprovalEnabled: true,
    autoApprovalLimit: 10000,
    requireDualApproval: false,
    dualApprovalLimit: 50000,
    
    // Security Settings
    fraudDetectionEnabled: true,
    velocityChecking: true,
    maxDailyLimit: 100000,
    maxMonthlyLimit: 1000000,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    adminAlerts: true,
    vendorNotifications: true
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would save settings to your backend
      console.log('Saving settings:', settings);
      
      toast({
        title: 'Success',
        description: 'Payout settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Processing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Auto Processing</Label>
              <p className="text-sm text-gray-500">
                Automatically process approved payout requests
              </p>
            </div>
            <Switch
              checked={settings.autoProcessingEnabled}
              onCheckedChange={(value) => handleSettingChange('autoProcessingEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Batch Processing</Label>
              <p className="text-sm text-gray-500">
                Process multiple requests in batches for efficiency
              </p>
            </div>
            <Switch
              checked={settings.batchProcessingEnabled}
              onCheckedChange={(value) => handleSettingChange('batchProcessingEnabled', value)}
            />
          </div>

          {settings.batchProcessingEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
              <div>
                <Label htmlFor="maxBatchSize">Max Batch Size</Label>
                <Input
                  id="maxBatchSize"
                  type="number"
                  value={settings.maxBatchSize}
                  onChange={(e) => handleSettingChange('maxBatchSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="processingInterval">Processing Interval</Label>
                <Select
                  value={settings.processingInterval}
                  onValueChange={(value) => handleSettingChange('processingInterval', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Fee Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultProcessingFee">Default Processing Fee</Label>
              <div className="flex">
                <Input
                  id="defaultProcessingFee"
                  type="number"
                  step="0.01"
                  value={settings.defaultProcessingFee}
                  onChange={(e) => handleSettingChange('defaultProcessingFee', parseFloat(e.target.value))}
                />
                <Select
                  value={settings.feeType}
                  onValueChange={(value) => handleSettingChange('feeType', value)}
                >
                  <SelectTrigger className="w-32 ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">৳</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Fee Range</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={settings.minimumFee}
                  onChange={(e) => handleSettingChange('minimumFee', parseFloat(e.target.value))}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={settings.maximumFee}
                  onChange={(e) => handleSettingChange('maximumFee', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Current Fee Structure:</strong> {settings.defaultProcessingFee}
              {settings.feeType === 'percentage' ? '%' : ' ৳'} 
              {settings.feeType === 'percentage' && 
                ` (Min: ৳${settings.minimumFee}, Max: ৳${settings.maximumFee})`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Approval Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Approval Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Auto Approval</Label>
              <p className="text-sm text-gray-500">
                Automatically approve requests below a certain limit
              </p>
            </div>
            <Switch
              checked={settings.autoApprovalEnabled}
              onCheckedChange={(value) => handleSettingChange('autoApprovalEnabled', value)}
            />
          </div>

          {settings.autoApprovalEnabled && (
            <div className="pl-4 border-l-2 border-gray-200">
              <Label htmlFor="autoApprovalLimit">Auto Approval Limit (৳)</Label>
              <Input
                id="autoApprovalLimit"
                type="number"
                value={settings.autoApprovalLimit}
                onChange={(e) => handleSettingChange('autoApprovalLimit', parseFloat(e.target.value))}
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Dual Approval Required</Label>
              <p className="text-sm text-gray-500">
                Require two approvers for high-value transactions
              </p>
            </div>
            <Switch
              checked={settings.requireDualApproval}
              onCheckedChange={(value) => handleSettingChange('requireDualApproval', value)}
            />
          </div>

          {settings.requireDualApproval && (
            <div className="pl-4 border-l-2 border-gray-200">
              <Label htmlFor="dualApprovalLimit">Dual Approval Limit (৳)</Label>
              <Input
                id="dualApprovalLimit"
                type="number"
                value={settings.dualApprovalLimit}
                onChange={(e) => handleSettingChange('dualApprovalLimit', parseFloat(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Fraud Detection</Label>
              <p className="text-sm text-gray-500">
                Enable automated fraud detection and prevention
              </p>
            </div>
            <Switch
              checked={settings.fraudDetectionEnabled}
              onCheckedChange={(value) => handleSettingChange('fraudDetectionEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Velocity Checking</Label>
              <p className="text-sm text-gray-500">
                Monitor transaction frequency and patterns
              </p>
            </div>
            <Switch
              checked={settings.velocityChecking}
              onCheckedChange={(value) => handleSettingChange('velocityChecking', value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxDailyLimit">Max Daily Limit (৳)</Label>
              <Input
                id="maxDailyLimit"
                type="number"
                value={settings.maxDailyLimit}
                onChange={(e) => handleSettingChange('maxDailyLimit', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxMonthlyLimit">Max Monthly Limit (৳)</Label>
              <Input
                id="maxMonthlyLimit"
                type="number"
                value={settings.maxMonthlyLimit}
                onChange={(e) => handleSettingChange('maxMonthlyLimit', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email alerts</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-gray-500">Send SMS alerts</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Admin Alerts</Label>
                <p className="text-sm text-gray-500">Notify administrators</p>
              </div>
              <Switch
                checked={settings.adminAlerts}
                onCheckedChange={(value) => handleSettingChange('adminAlerts', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Vendor Notifications</Label>
                <p className="text-sm text-gray-500">Notify vendors</p>
              </div>
              <Switch
                checked={settings.vendorNotifications}
                onCheckedChange={(value) => handleSettingChange('vendorNotifications', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
