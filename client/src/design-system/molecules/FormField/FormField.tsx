/**
 * FormField Molecule - Complete form field with label and validation
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { forwardRef } from 'react';
import { Input, InputProps } from '../../atoms/Input/Input';
import { Typography } from '../../atoms/Typography/Typography';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends InputProps {
  label?: string;
  description?: string;
  required?: boolean;
  optional?: boolean;
  layout?: 'vertical' | 'horizontal';
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  successClassName?: string;
  fieldClassName?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    className,
    label,
    description,
    required,
    optional,
    layout = 'vertical',
    labelClassName,
    descriptionClassName,
    errorClassName,
    successClassName,
    fieldClassName,
    error,
    success,
    helperText,
    id,
    ...props
  }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

    if (layout === 'horizontal') {
      return (
        <div className={cn('flex items-start gap-4', className)}>
          {label && (
            <div className="flex-shrink-0 w-1/3">
              <Typography
                as="label"
                variant="small"
                className={cn(
                  'font-medium',
                  props.disabled && 'text-muted-foreground',
                  labelClassName
                )}
                htmlFor={fieldId}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
                {optional && <span className="text-muted-foreground ml-1">(optional)</span>}
              </Typography>
            </div>
          )}
          
          <div className="flex-1 space-y-1">
            <Input
              ref={ref}
              id={fieldId}
              className={cn(fieldClassName)}
              error={error}
              success={success}
              helperText={helperText}
              {...props}
            />
            
            {description && (
              <Typography
                variant="caption"
                className={cn('text-muted-foreground', descriptionClassName)}
              >
                {description}
              </Typography>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Typography
            as="label"
            variant="small"
            className={cn(
              'font-medium',
              props.disabled && 'text-muted-foreground',
              labelClassName
            )}
            htmlFor={fieldId}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {optional && <span className="text-muted-foreground ml-1">(optional)</span>}
          </Typography>
        )}
        
        {description && (
          <Typography
            variant="caption"
            className={cn('text-muted-foreground', descriptionClassName)}
          >
            {description}
          </Typography>
        )}
        
        <Input
          ref={ref}
          id={fieldId}
          className={cn(fieldClassName)}
          error={error}
          success={success}
          helperText={helperText}
          {...props}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };