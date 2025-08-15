
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { AlertCircle, Calendar, Settings, CreditCard } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

const scheduleSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor ID'),
  schedule_type: z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly']),
  payout_day: z.number().min(1).max(31),
  minimum_payout_amount: z.number().min(0),
  auto_payout_enabled: z.boolean(),
  preferred_payment_method: z.enum(['bank_transfer', 'mobile_banking', 'check', 'digital_wallet']),
  bank_account_info: z.object({
    account_name: z.string().optional(),
    account_number: z.string().optional(),
    bank_name: z.string().optional(),
    routing_number: z.string().optional()
  }).optional(),
  mobile_banking_info: z.object({
    provider: z.string().optional(),
    account_number: z.string().optional(),
    account_name: z.string().optional()
  }).optional()
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface PayoutScheduleFormProps {
  onClose: () => void;
  initialData?: any;
}

export const PayoutScheduleForm: React.FC<PayoutScheduleFormProps> = ({ 
  onClose, 
  initialData 
}) => {
  const { toast } = useToast();
  
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      minimum_payout_amount: 1000,
      auto_payout_enabled: false,
      schedule_type: 'monthly',
      payout_day: 15,
      ...initialData
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  
  const scheduleType = watch('schedule_type');
  const paymentMethod = watch('preferred_payment_method');
  const autoPayoutEnabled = watch('auto_payout_enabled');

  const getPayoutDayLabel = () => {
    switch (scheduleType) {
      case 'weekly':
        return 'Day of Week (1-7, Monday=1)';
      case 'bi_weekly':
        return 'Starting Day (1-14)';
      case 'monthly':
        return 'Day of Month (1-31)';
      case 'quarterly':
        return 'Day of Quarter (1-90)';
      default:
        return 'Payout Day';
    }
  };

  const getPayoutDayMax = () => {
    switch (scheduleType) {
      case 'weekly': return 7;
      case 'bi_weekly': return 14;
      case 'monthly': return 31;
      case 'quarterly': return 90;
      default: return 31;
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      // Here you would call your API service
      console.log('Schedule data:', data);
      
      toast({
        title: 'Success',
        description: 'Payout schedule created successfully',
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create payout schedule',
        variant: 'destructive',
      });
    }
  };

  const renderPaymentMethodInfo = () => {
    if (!paymentMethod) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Method Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethod === 'bank_transfer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_account_name">Account Name</Label>
                  <Input
                    id="bank_account_name"
                    {...register('bank_account_info.account_name')}
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    {...register('bank_account_info.account_number')}
                    placeholder="Bank account number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    {...register('bank_account_info.bank_name')}
                    placeholder="Bank name"
                  />
                </div>
                <div>
                  <Label htmlFor="routing_number">Routing Number</Label>
                  <Input
                    id="routing_number"
                    {...register('bank_account_info.routing_number')}
                    placeholder="Routing number"
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'mobile_banking' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile_provider">Provider</Label>
                  <Select onValueChange={(value) => setValue('mobile_banking_info.provider', value)}>
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
                  <Label htmlFor="mobile_account_number">Mobile Number</Label>
                  <Input
                    id="mobile_account_number"
                    {...register('mobile_banking_info.account_number')}
                    placeholder="Mobile banking number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mobile_account_name">Account Name</Label>
                <Input
                  id="mobile_account_name"
                  {...register('mobile_banking_info.account_name')}
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Configuration
          </CardTitle>
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
              <Label htmlFor="schedule_type">Schedule Type *</Label>
              <Select onValueChange={(value) => setValue('schedule_type', value as any)}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payout_day">{getPayoutDayLabel()} *</Label>
              <Input
                id="payout_day"
                type="number"
                min="1"
                max={getPayoutDayMax()}
                {...register('payout_day', { valueAsNumber: true })}
              />
              {errors.payout_day && (
                <p className="text-sm text-red-500 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.payout_day.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="minimum_payout_amount">Minimum Payout Amount (৳) *</Label>
              <Input
                id="minimum_payout_amount"
                type="number"
                step="0.01"
                {...register('minimum_payout_amount', { valueAsNumber: true })}
                placeholder="1000.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="auto_payout_enabled" className="text-base font-medium">
                Enable Auto Payout
              </Label>
              <p className="text-sm text-gray-500">
                Automatically process payouts when conditions are met
              </p>
            </div>
            <Switch
              id="auto_payout_enabled"
              checked={autoPayoutEnabled}
              onCheckedChange={(checked) => setValue('auto_payout_enabled', checked)}
            />
          </div>

          {autoPayoutEnabled && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Auto Payout Rules:</strong>
                <br />
                • Minimum amount reached: ৳{watch('minimum_payout_amount')?.toLocaleString() || '0'}
                <br />
                • Schedule: {scheduleType} on day {watch('payout_day')}
                <br />
                • Payment method: {paymentMethod || 'Not selected'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="preferred_payment_method">Preferred Payment Method *</Label>
            <Select onValueChange={(value) => setValue('preferred_payment_method', value as any)}>
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

          {renderPaymentMethodInfo()}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
};
