/**
 * Container Component
 * Enterprise-grade responsive container with max-width constraints
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding = 'md',
  className,
  centered = true
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6',
    lg: 'px-6 sm:px-8'
  };

  return (
    <div className={cn(
      'w-full',
      sizeClasses[size],
      paddingClasses[padding],
      centered && 'mx-auto',
      className
    )}>
      {children}
    </div>
  );
};

export default Container;