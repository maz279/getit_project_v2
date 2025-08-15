
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Calendar, Clock, CreditCard, AlertCircle } from 'lucide-react';

export const PaymentTermsTab: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('');

  const paymentTerms = [
    {
      id: 'weekly',
      name: 'Weekly Payout',
      frequency: 'Every 7 days',
      minimumAmount: '৳500',
      processingDays: '1-2 days',
      status: 'active'
    },
    {
      id: 'biweekly',
      name: 'Bi-weekly Payout',
      frequency: 'Every 14 days',
      minimumAmount: '৳1,000',
      processingDays: '1-2 days',
      status: 'active'
    },
    {
      id: 'monthly',
      name: 'Monthly Payout',
      frequency: 'Every 30 days',
      minimumAmount: '৳2,000',
      processingDays: '2-3 days',
      status: 'active'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payment Terms & Conditions</h3>
          <p className="text-gray-600">Configure payout schedules and payment conditions</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Payout Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentTerms.map((term) => (
                <div key={term.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{term.name}</h4>
                    <Badge variant={term.status === 'active' ? 'default' : 'secondary'}>
                      {term.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Frequency:</span> {term.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Min Amount:</span> {term.minimumAmount}
                    </div>
                    <div>
                      <span className="font-medium">Processing:</span> {term.processingDays}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Processing Fee</Label>
                <div className="flex items-center space-x-2">
                  <Input placeholder="2.5" />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transaction Limit (Daily)</Label>
                <Input placeholder="50000" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Minimum Payout Amount</Label>
                <Input placeholder="500" />
              </div>

              <div className="space-y-2">
                <Label>Maximum Hold Period (Days)</Label>
                <Input placeholder="30" />
              </div>

              <div className="space-y-2">
                <Label>Late Payment Penalty (%)</Label>
                <Input placeholder="1.5" />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">Bangladeshi Taka (৳)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Special Terms</Label>
                <Textarea
                  placeholder="Enter any special payment terms or conditions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="tax_compliance" className="rounded" />
                <Label htmlFor="tax_compliance" className="text-sm">Tax compliance verification required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="kyc_verification" className="rounded" />
                <Label htmlFor="kyc_verification" className="text-sm">KYC verification mandatory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="performance_review" className="rounded" />
                <Label htmlFor="performance_review" className="text-sm">Performance review before payout</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="dispute_resolution" className="rounded" />
                <Label htmlFor="dispute_resolution" className="text-sm">Dispute resolution process</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
