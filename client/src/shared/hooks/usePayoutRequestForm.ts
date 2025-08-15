
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PayoutProcessingService, PayoutRequestInsert } from '@/shared/services/database/PayoutProcessingService';
import { useToast } from '@/shared/hooks/use-toast';

const payoutRequestSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor ID'),
  request_amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('BDT'),
  payout_period_start: z.string().min(1, 'Start date is required'),
  payout_period_end: z.string().min(1, 'End date is required'),
  payment_method: z.enum(['bank_transfer', 'mobile_banking', 'check', 'digital_wallet'], {
    errorMap: () => ({ message: 'Please select a valid payment method' })
  }),
  bank_account_details: z.object({
    account_name: z.string().optional(),
    account_number: z.string().optional(),
    bank_name: z.string().optional(),
    routing_number: z.string().optional(),
    swift_code: z.string().optional()
  }).optional(),
  mobile_banking_details: z.object({
    provider: z.string().optional(),
    account_number: z.string().optional(),
    account_name: z.string().optional()
  }).optional(),
  processing_fee: z.number().min(0).default(0),
  tax_deduction: z.number().min(0).default(0),
  priority_level: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  notes: z.string().optional(),
  external_reference: z.string().optional()
});

export type PayoutRequestFormData = z.infer<typeof payoutRequestSchema>;

export interface UsePayoutRequestFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  initialData?: Partial<PayoutRequestFormData>;
}

export const usePayoutRequestForm = ({
  onSuccess,
  onError,
  initialData
}: UsePayoutRequestFormProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PayoutRequestFormData>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      currency: 'BDT',
      processing_fee: 0,
      tax_deduction: 0,
      priority_level: 'normal',
      ...initialData
    }
  });

  const calculateNetAmount = useCallback((
    requestAmount: number,
    processingFee: number = 0,
    taxDeduction: number = 0
  ) => {
    return Math.max(0, requestAmount - processingFee - taxDeduction);
  }, []);

  const handleSubmit = useCallback(async (data: PayoutRequestFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate payment method specific details
      if (data.payment_method === 'bank_transfer' && !data.bank_account_details?.account_number) {
        throw new Error('Bank account details are required for bank transfer');
      }
      
      if (data.payment_method === 'mobile_banking' && !data.mobile_banking_details?.account_number) {
        throw new Error('Mobile banking details are required for mobile banking');
      }

      // Calculate net payout amount
      const net_payout_amount = calculateNetAmount(
        data.request_amount,
        data.processing_fee,
        data.tax_deduction
      );

      // Ensure all required fields are properly typed for PayoutRequestInsert
      const requestData: PayoutRequestInsert = {
        vendor_id: data.vendor_id,
        request_amount: data.request_amount,
        currency: data.currency,
        payout_period_start: data.payout_period_start,
        payout_period_end: data.payout_period_end,
        payment_method: data.payment_method,
        net_payout_amount,
        processing_fee: data.processing_fee || 0,
        tax_deduction: data.tax_deduction || 0,
        priority_level: data.priority_level,
        notes: data.notes,
        external_reference: data.external_reference,
        bank_account_details: data.bank_account_details ? JSON.stringify(data.bank_account_details) : null,
        mobile_banking_details: data.mobile_banking_details ? JSON.stringify(data.mobile_banking_details) : null
      };

      const result = await PayoutProcessingService.createPayoutRequest(requestData);

      toast({
        title: 'Success',
        description: 'Payout request created successfully',
      });

      form.reset();
      onSuccess?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payout request';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  }, [form, toast, onSuccess, onError, calculateNetAmount]);

  const validateDateRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return 'End date must be after start date';
    }
    
    if (end > new Date()) {
      return 'End date cannot be in the future';
    }
    
    return true;
  }, []);

  const getPaymentMethodFields = useCallback((paymentMethod: string) => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return ['account_name', 'account_number', 'bank_name', 'routing_number', 'swift_code'];
      case 'mobile_banking':
        return ['provider', 'account_number', 'account_name'];
      case 'digital_wallet':
        return ['wallet_provider', 'wallet_id'];
      default:
        return [];
    }
  }, []);

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    calculateNetAmount,
    validateDateRange,
    getPaymentMethodFields
  };
};
