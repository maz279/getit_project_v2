/**
 * Form Field Component - Design System
 * Enterprise form field with validation, accessibility, and cultural support
 */

import React, { forwardRef, useState, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../../lib/utils';

const formFieldVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500"
      },
      size: {
        sm: "h-9 px-2 py-1 text-xs",
        default: "h-10",
        lg: "h-11 px-4 py-3",
        xl: "h-12 px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof formFieldVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  required?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  characterLimit?: number;
  language?: 'en' | 'bn';
  culturalFormat?: 'phone-bd' | 'nid-bd' | 'postal-bd';
  onValidate?: (value: string) => string | null;
  debounceMs?: number;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    className,
    variant,
    size,
    type = "text",
    label,
    description,
    error,
    success,
    warning,
    required = false,
    loading = false,
    icon,
    iconPosition = 'left',
    suffix,
    prefix,
    characterLimit,
    language = 'en',
    culturalFormat,
    onValidate,
    debounceMs = 300,
    value,
    onChange,
    onBlur,
    placeholder,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const fieldId = useId();
    const descriptionId = `${fieldId}-description`;
    const errorId = `${fieldId}-error`;

    // Determine the current variant based on validation state
    const currentVariant = error || validationError 
      ? 'error' 
      : success 
        ? 'success' 
        : warning 
          ? 'warning' 
          : variant;

    // Cultural formatting functions
    const formatValue = (val: string): string => {
      if (!culturalFormat) return val;

      switch (culturalFormat) {
        case 'phone-bd':
          // Format Bangladesh phone number: +880 XXXX-XXXXXX
          const cleaned = val.replace(/\D/g, '');
          if (cleaned.length <= 3) return cleaned;
          if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
          return `+880 ${cleaned.slice(3, 7)}-${cleaned.slice(7, 13)}`;
        
        case 'nid-bd':
          // Format Bangladesh NID: XXXX XXXX XXXX
          const nidCleaned = val.replace(/\D/g, '');
          return nidCleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3').trim();
        
        case 'postal-bd':
          // Format Bangladesh postal code: XXXX
          return val.replace(/\D/g, '').slice(0, 4);
        
        default:
          return val;
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const formattedValue = formatValue(rawValue);
      
      setInternalValue(formattedValue);
      
      // Clear previous debounce
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Debounced validation
      if (onValidate) {
        const timeout = setTimeout(() => {
          const validationResult = onValidate(formattedValue);
          setValidationError(validationResult);
        }, debounceMs);
        setDebounceTimeout(timeout);
      }

      // Call parent onChange
      if (onChange) {
        const syntheticEvent = {
          ...event,
          target: { ...event.target, value: formattedValue }
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Run immediate validation on blur
      if (onValidate) {
        const validationResult = onValidate(internalValue);
        setValidationError(validationResult);
      }

      if (onBlur) {
        onBlur(event);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const getPlaceholder = (): string => {
      if (placeholder) return placeholder;
      
      if (culturalFormat && language === 'bn') {
        switch (culturalFormat) {
          case 'phone-bd':
            return '+৮৮০ XXXX-XXXXXX';
          case 'nid-bd':
            return 'XXXX XXXX XXXX';
          case 'postal-bd':
            return 'XXXX';
          default:
            return '';
        }
      }
      
      return '';
    };

    const characterCount = typeof internalValue === 'string' ? internalValue.length : 0;
    const isOverLimit = characterLimit && characterCount > characterLimit;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              "text-sm font-medium leading-none",
              currentVariant === 'error' && "text-destructive",
              currentVariant === 'success' && "text-green-600",
              currentVariant === 'warning' && "text-yellow-600"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {prefix}
            </div>
          )}

          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <div className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
              prefix && "left-8"
            )}>
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={fieldId}
            type={type}
            className={cn(
              formFieldVariants({ variant: currentVariant, size }),
              icon && iconPosition === 'left' && (prefix ? "pl-16" : "pl-10"),
              icon && iconPosition === 'right' && "pr-10",
              suffix && "pr-10",
              loading && "pr-10",
              className
            )}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={getPlaceholder()}
            aria-describedby={cn(
              description && descriptionId,
              (error || validationError || warning || success) && errorId
            )}
            aria-invalid={!!(error || validationError)}
            aria-required={required}
            {...props}
          />

          {/* Right Icon */}
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              icon && iconPosition === 'right' && "right-10"
            )}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground"></div>
            </div>
          )}

          {/* Suffix */}
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}

          {/* Focus Ring Enhancement */}
          {isFocused && (
            <div className="absolute inset-0 rounded-md border-2 border-ring pointer-events-none" />
          )}
        </div>

        {/* Character Count */}
        {characterLimit && (
          <div className={cn(
            "text-xs text-right",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}>
            {characterCount}/{characterLimit}
          </div>
        )}

        {/* Help Text */}
        {description && !error && !validationError && !warning && !success && (
          <p
            id={descriptionId}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        )}

        {/* Validation Messages */}
        {(error || validationError || warning || success) && (
          <p
            id={errorId}
            className={cn(
              "text-xs",
              (error || validationError) && "text-destructive",
              success && "text-green-600",
              warning && "text-yellow-600"
            )}
          >
            {error || validationError || warning || success}
          </p>
        )}

        {/* Cultural Help Text */}
        {culturalFormat && language === 'bn' && (
          <p className="text-xs text-muted-foreground">
            {culturalFormat === 'phone-bd' && 'বাংলাদেশী ফোন নম্বর ফরম্যাট: +৮৮০ XXXX-XXXXXX'}
            {culturalFormat === 'nid-bd' && 'জাতীয় পরিচয়পত্র নম্বর ফরম্যাট: XXXX XXXX XXXX'}
            {culturalFormat === 'postal-bd' && 'পোস্টাল কোড ফরম্যাট: XXXX'}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField, formFieldVariants };