/**
 * Form Field Component
 * Enterprise-grade form field with validation and accessibility
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  rows?: number;
  className?: string;
  language?: 'en' | 'bn';
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required,
  disabled,
  helperText,
  rows = 3,
  className,
  language = 'en'
}) => {
  const hasError = !!error;
  const hasSuccess = success && !hasError && value.length > 0;

  const inputProps = {
    id,
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    disabled,
    required,
    className: cn(
      'w-full',
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      className
    )
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        {type === 'textarea' ? (
          <Textarea {...inputProps} rows={rows} />
        ) : (
          <Input {...inputProps} type={type} />
        )}

        {(hasError || hasSuccess) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {hasError && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {hasSuccess && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className={cn(
          'text-sm',
          hasError ? 'text-red-600' : 'text-gray-600'
        )}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default FormField;