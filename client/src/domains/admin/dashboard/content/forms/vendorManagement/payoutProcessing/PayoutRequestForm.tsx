
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';

interface PayoutRequestFormProps {
  onClose: () => void;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export const PayoutRequestForm: React.FC<PayoutRequestFormProps> = ({ 
  onClose, 
  initialData, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    vendor_id: initialData?.vendor_id || '',
    request_amount: initialData?.request_amount || '',
    currency: initialData?.currency || 'BDT',
    payout_period_start: initialData?.payout_period_start || '',
    payout_period_end: initialData?.payout_period_end || '',
    payment_method: initialData?.payment_method || '',
    bank_account_details: initialData?.bank_account_details || {},
    mobile_banking_details: initialData?.mobile_banking_details || {},
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payout request form submitted:', formData);
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

  const handleBankDetailsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_account_details: {
        ...(prev.bank_account_details || {}),
        [field]: value
      }
    }));
  };

  const handleMobileBankingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      mobile_banking_details: {
        ...(prev.mobile_banking_details || {}),
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
          <Label htmlFor="request_amount">Request Amount</Label>
          <Input
            id="request_amount"
            type="number"
            step="0.01"
            value={formData.request_amount}
            onChange={(e) => handleInputChange('request_amount', e.target.value)}
            placeholder="Enter amount"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BDT">BDT</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
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

        <div className="space-y-2">
          <Label htmlFor="payout_period_start">Payout Period Start</Label>
          <Input
            id="payout_period_start"
            type="date"
            value={formData.payout_period_start}
            onChange={(e) => handleInputChange('payout_period_start', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payout_period_end">Payout Period End</Label>
          <Input
            id="payout_period_end"
            type="date"
            value={formData.payout_period_end}
            onChange={(e) => handleInputChange('payout_period_end', e.target.value)}
            required
          />
        </div>
      </div>

      <Separator />

      {formData.payment_method === 'bank_transfer' && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.bank_account_details?.account_name || ''}
                  onChange={(e) => handleBankDetailsChange('account_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.bank_account_details?.account_number || ''}
                  onChange={(e) => handleBankDetailsChange('account_number', e.target.value)}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_account_details?.bank_name || ''}
                  onChange={(e) => handleBankDetailsChange('bank_name', e.target.value)}
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routing_number">Routing Number</Label>
                <Input
                  id="routing_number"
                  value={formData.bank_account_details?.routing_number || ''}
                  onChange={(e) => handleBankDetailsChange('routing_number', e.target.value)}
                  placeholder="Routing number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.payment_method === 'mobile_banking' && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile Banking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select 
                  value={formData.mobile_banking_details?.provider || ''} 
                  onValueChange={(value) => handleMobileBankingChange('provider', value)}
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
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  value={formData.mobile_banking_details?.mobile_number || ''}
                  onChange={(e) => handleMobileBankingChange('mobile_number', e.target.value)}
                  placeholder="Mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_name_mobile">Account Name</Label>
                <Input
                  id="account_name_mobile"
                  value={formData.mobile_banking_details?.account_name || ''}
                  onChange={(e) => handleMobileBankingChange('account_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes or instructions"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Payout Request
        </Button>
      </div>
    </form>
  );
};
