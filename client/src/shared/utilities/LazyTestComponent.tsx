/**
 * Lazy Test Component
 * Phase 1 Week 1-2: Testing Lazy Loading
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LazyTestComponentProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

const LazyTestComponent: React.FC<LazyTestComponentProps> = ({
  title = 'Lazy Loaded Component',
  className,
  children,
}) => {
  return (
    <div className={cn('p-4 border rounded-lg bg-white shadow-sm', className)}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">
        This component was loaded lazily to improve performance.
      </p>
      {children}
    </div>
  );
};

export default LazyTestComponent;