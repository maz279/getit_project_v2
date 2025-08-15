
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { 
  Settings, 
  Shield, 
  DollarSign, 
  Clock, 
  FileText,
  Save,
  RefreshCw
} from 'lucide-react';

export const VendorSettingsTab: React.FC = () => {
  const [autoApproval, setAutoApproval] = useState(false);
  const [minimumRating, setMinimumRating] = useState(4.0);
  const [defaultCommission, setDefaultCommission] = useState(8.5);
  const [minimumPayout, setMinimumPayout] = useState(1000);

  const handleSaveSettings = () => {
    console.log('Saving vendor settings...');
  };

  const handleResetSettings = () => {
    console.log('Resetting to default settings...');
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-3 h-5 w-5 text-blue-600" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approval" className="text-base font-medium">Auto-Approval for Vendors</Label>
              <p className="text-sm text-gray-600">Automatically approve vendors that meet minimum criteria</p>
            </div>
            <Switch
              id="auto-approval"
              checked={autoApproval}
              onCheckedChange={setAutoApproval}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="min-rating">Minimum Required Rating</Label>
              <Input
                id="min-rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={minimumRating}
                onChange={(e) => setMinimumRating(parseFloat(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Vendors below this rating will be flagged for review</p>
            </div>

            <div>
              <Label htmlFor="default-commission">Default Commission Rate (%)</Label>
              <Input
                id="default-commission"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(parseFloat(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Applied to new vendors unless specified otherwise</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-3 h-5 w-5 text-green-600" />
            Verification Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="business-license">Business License Required</Label>
                <Switch id="business-license" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tax-certificate">Tax Certificate Required</Label>
                <Switch id="tax-certificate" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bank-verification">Bank Account Verification</Label>
                <Switch id="bank-verification" defaultChecked />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="address-proof">Address Proof Required</Label>
                <Switch id="address-proof" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="identity-verification">Identity Verification</Label>
                <Switch id="identity-verification" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="references">Trade References</Label>
                <Switch id="references" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-3 h-5 w-5 text-orange-600" />
            Performance Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="min-fulfillment">Min Order Fulfillment Rate (%)</Label>
              <Input
                id="min-fulfillment"
                type="number"
                min="0"
                max="100"
                defaultValue="90"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-return">Max Return Rate (%)</Label>
              <Input
                id="max-return"
                type="number"
                min="0"
                max="100"
                defaultValue="10"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="response-time">Max Response Time (hours)</Label>
              <Input
                id="response-time"
                type="number"
                min="1"
                max="72"
                defaultValue="24"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-3 h-5 w-5 text-purple-600" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="payment-cycle">Payment Cycle</Label>
              <select 
                id="payment-cycle"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly" selected>Monthly</option>
              </select>
            </div>
            <div>
              <Label htmlFor="min-payout">Minimum Payout Amount (৳)</Label>
              <Input
                id="min-payout"
                type="number"
                min="0"
                value={minimumPayout}
                onChange={(e) => setMinimumPayout(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="holding-period">Payment Holding Period (days)</Label>
              <Input
                id="holding-period"
                type="number"
                min="0"
                max="30"
                defaultValue="7"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-3 h-5 w-5 text-indigo-600" />
            Category-wise Commission Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: 'Electronics', rate: 8.5, minVolume: 50000 },
              { category: 'Fashion', rate: 10.0, minVolume: 30000 },
              { category: 'Home & Living', rate: 9.0, minVolume: 25000 },
              { category: 'Books', rate: 7.0, minVolume: 15000 },
              { category: 'Sports', rate: 8.0, minVolume: 20000 },
              { category: 'Beauty', rate: 12.0, minVolume: 35000 }
            ].map((item, index) => (
              <div key={index} className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Category</Label>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <Label htmlFor={`rate-${index}`}>Commission Rate (%)</Label>
                  <Input
                    id={`rate-${index}`}
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    defaultValue={item.rate}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`volume-${index}`}>Min Monthly Volume (৳)</Label>
                  <Input
                    id={`volume-${index}`}
                    type="number"
                    min="0"
                    defaultValue={item.minVolume}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleResetSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
