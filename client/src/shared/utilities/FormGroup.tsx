/**
 * Form Group Component
 * Enterprise-grade form grouping with responsive layout
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps {
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  columns = 1,
  children,
  className,
  spacing = 'normal'
}) => {
  const spacingClasses = {
    tight: 'space-y-3',
    normal: 'space-y-4',
    loose: 'space-y-6'
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('form-group', spacingClasses[spacing], className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      <div className={cn(
        'grid gap-4',
        columnClasses[columns]
      )}>
        {children}
      </div>
    </div>
  );
};

export default FormGroup;