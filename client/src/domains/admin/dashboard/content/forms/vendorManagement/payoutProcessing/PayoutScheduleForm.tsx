
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';

interface PayoutScheduleFormProps {
  onClose: () => void;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export const PayoutScheduleForm: React.FC<PayoutScheduleFormProps> = ({ 
  onClose, 
  initialData, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    vendor_id: initialData?.vendor_id || '',
    schedule_type: initialData?.schedule_type || '',
    payout_day: initialData?.payout_day || '',
    minimum_payout_amount: initialData?.minimum_payout_amount || '100',
    auto_payout_enabled: initialData?.auto_payout_enabled || false,
    preferred_payment_method: initialData?.preferred_payment_method || '',
    bank_account_info: initialData?.bank_account_info || {},
    mobile_banking_info: initialData?.mobile_banking_info || {},
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payout schedule form submitted:', formData);
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBankInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_account_info: {
        ...(prev.bank_account_info || {}),
        [field]: value
      }
    }));
  };

  const handleMobileBankingInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      mobile_banking_info: {
        ...(prev.mobile_banking_info || {}),
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="vendor_id">Vendor ID</Label>
          <Input
            id="vendor_id"
            value={formData.vendor_id}
            onChange={(e) => handleInputChange('vendor_id', e.target.value)}
            placeholder="Enter vendor ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule_type">Schedule Type</Label>
          <Select value={formData.schedule_type} onValueChange={(value) => handleInputChange('schedule_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select schedule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payout_day">Payout Day</Label>
          <Input
            id="payout_day"
            type="number"
            min="1"
            max={formData.schedule_type === 'weekly' ? '7' : '31'}
            value={formData.payout_day}
            onChange={(e) => handleInputChange('payout_day', e.target.value)}
            placeholder={formData.schedule_type === 'weekly' ? 'Day of week (1-7)' : 'Day of month (1-31)'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimum_payout_amount">Minimum Payout Amount</Label>
          <Input
            id="minimum_payout_amount"
            type="number"
            step="0.01"
            value={formData.minimum_payout_amount}
            onChange={(e) => handleInputChange('minimum_payout_amount', e.target.value)}
            placeholder="Minimum amount for payout"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_payment_method">Preferred Payment Method</Label>
          <Select value={formData.preferred_payment_method} onValueChange={(value) => handleInputChange('preferred_payment_method', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto_payout_enabled"
            checked={formData.auto_payout_enabled}
            onCheckedChange={(checked) => handleInputChange('auto_payout_enabled', checked)}
          />
          <Label htmlFor="auto_payout_enabled">Enable Auto Payout</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Active Schedule</Label>
        </div>
      </div>

      <Separator />

      {formData.preferred_payment_method === 'bank_transfer' && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_account_name">Account Name</Label>
                <Input
                  id="bank_account_name"
                  value={formData.bank_account_info?.account_name || ''}
                  onChange={(e) => handleBankInfoChange('account_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_info?.account_number || ''}
                  onChange={(e) => handleBankInfoChange('account_number', e.target.value)}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name_info">Bank Name</Label>
                <Input
                  id="bank_name_info"
                  value={formData.bank_account_info?.bank_name || ''}
                  onChange={(e) => handleBankInfoChange('bank_name', e.target.value)}
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_routing_number">Routing Number</Label>
                <Input
                  id="bank_routing_number"
                  value={formData.bank_account_info?.routing_number || ''}
                  onChange={(e) => handleBankInfoChange('routing_number', e.target.value)}
                  placeholder="Routing number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.preferred_payment_method === 'mobile_banking' && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile Banking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile_provider">Provider</Label>
                <Select 
                  value={formData.mobile_banking_info?.provider || ''} 
                  onValueChange={(value) => handleMobileBankingInfoChange('provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="upay">Upay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_number_info">Mobile Number</Label>
                <Input
                  id="mobile_number_info"
                  value={formData.mobile_banking_info?.mobile_number || ''}
                  onChange={(e) => handleMobileBankingInfoChange('mobile_number', e.target.value)}
                  placeholder="Mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_account_name">Account Name</Label>
                <Input
                  id="mobile_account_name"
                  value={formData.mobile_banking_info?.account_name || ''}
                  onChange={(e) => handleMobileBankingInfoChange('account_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Save Schedule
        </Button>
      </div>
    </form>
  );
};
