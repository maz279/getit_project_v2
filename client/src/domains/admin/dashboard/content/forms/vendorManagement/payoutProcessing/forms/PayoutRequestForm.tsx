
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { AlertCircle, Calculator, CreditCard, Calendar } from 'lucide-react';
import { usePayoutRequestForm } from '@/shared/hooks/usePayoutRequestForm';

interface PayoutRequestFormProps {
  onClose: () => void;
  initialData?: any;
}

export const PayoutRequestForm: React.FC<PayoutRequestFormProps> = ({ 
  onClose, 
  initialData 
}) => {
  const { 
    form, 
    isSubmitting, 
    handleSubmit, 
    calculateNetAmount,
    validateDateRange,
    getPaymentMethodFields 
  } = usePayoutRequestForm({
    onSuccess: () => {
      onClose();
    },
    initialData
  });

  const { register, watch, setValue, formState: { errors } } = form;
  
  const watchedFields = watch();
  const selectedPaymentMethod = watch('payment_method');
  const requestAmount = watch('request_amount') || 0;
  const processingFee = watch('processing_fee') || 0;
  const taxDeduction = watch('tax_deduction') || 0;

  const netAmount = calculateNetAmount(requestAmount, processingFee, taxDeduction);

  useEffect(() => {
    // Auto-calculate processing fee based on payment method
    const feeRates = {
      bank_transfer: 0.01, // 1%
      mobile_banking: 0.015, // 1.5%
      check: 25, // Fixed fee
      digital_wallet: 0.02 // 2%
    };

    if (selectedPaymentMethod && requestAmount > 0) {
      const rate = feeRates[selectedPaymentMethod as keyof typeof feeRates];
      const fee = typeof rate === 'number' ? 
        (selectedPaymentMethod === 'check' ? rate : requestAmount * rate) : 0;
      setValue('processing_fee', Math.round(fee * 100) / 100);
    }
  }, [selectedPaymentMethod, requestAmount, setValue]);

  const renderPaymentMethodFields = () => {
    const fields = getPaymentMethodFields(selectedPaymentMethod);
    
    if (!selectedPaymentMethod || fields.length === 0) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Method Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPaymentMethod === 'bank_transfer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_name">Account Name *</Label>
                  <Input
                    id="account_name"
                    {...register('bank_account_details.account_name')}
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    {...register('bank_account_details.account_number')}
                    placeholder="Bank account number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    {...register('bank_account_details.bank_name')}
                    placeholder="Bank name"
                  />
                </div>
                <div>
                  <Label htmlFor="routing_number">Routing Number</Label>
                  <Input
                    id="routing_number"
                    {...register('bank_account_details.routing_number')}
                    placeholder="Routing number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="swift_code">SWIFT Code</Label>
                <Input
                  id="swift_code"
                  {...register('bank_account_details.swift_code')}
                  placeholder="SWIFT/BIC code"
                />
              </div>
            </>
          )}

          {selectedPaymentMethod === 'mobile_banking' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provider *</Label>
                  <Select onValueChange={(value) => setValue('mobile_banking_details.provider', value)}>
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
                <div>
                  <Label htmlFor="mobile_account_number">Mobile Number *</Label>
                  <Input
                    id="mobile_account_number"
                    {...register('mobile_banking_details.account_number')}
                    placeholder="Mobile banking number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mobile_account_name">Account Name *</Label>
                <Input
                  id="mobile_account_name"
                  {...register('mobile_banking_details.account_name')}
                  placeholder="Account holder name"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor_id">Vendor *</Label>
              <Input
                id="vendor_id"
                {...register('vendor_id')}
                placeholder="Select vendor"
              />
              {errors.vendor_id && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.vendor_id.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="priority_level">Priority Level</Label>
              <Select onValueChange={(value) => setValue('priority_level', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payout_period_start">Period Start *</Label>
              <Input
                id="payout_period_start"
                type="date"
                {...register('payout_period_start')}
              />
              {errors.payout_period_start && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {errors.payout_period_start.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="payout_period_end">Period End *</Label>
              <Input
                id="payout_period_end"
                type="date"
                {...register('payout_period_end')}
              />
              {errors.payout_period_end && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {errors.payout_period_end.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            Amount Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="request_amount">Request Amount (৳) *</Label>
              <Input
                id="request_amount"
                type="number"
                step="0.01"
                {...register('request_amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.request_amount && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.request_amount.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select onValueChange={(value) => setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="BDT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="processing_fee">Processing Fee (৳)</Label>
              <Input
                id="processing_fee"
                type="number"
                step="0.01"
                {...register('processing_fee', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="tax_deduction">Tax Deduction (৳)</Label>
              <Input
                id="tax_deduction"
                type="number"
                step="0.01"
                {...register('tax_deduction', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Net Payout Amount:</span>
            <Badge variant="secondary" className="text-lg">
              ৳{netAmount.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select onValueChange={(value) => setValue('payment_method', value as any)}>
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
            {errors.payment_method && (
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.payment_method.message}
              </p>
            )}
          </div>

          {renderPaymentMethodFields()}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="external_reference">External Reference</Label>
            <Input
              id="external_reference"
              {...register('external_reference')}
              placeholder="External reference number"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Payout Request'}
        </Button>
      </div>
    </form>
  );
};
