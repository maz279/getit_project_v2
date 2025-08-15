/**
 * Page Header Component
 * Enterprise-grade page header with breadcrumbs and actions
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/shared/ui/breadcrumb';

interface BreadcrumbItemType {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  tabs,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-4',
      title: 'text-xl',
      description: 'text-sm'
    },
    md: {
      container: 'py-6',
      title: 'text-2xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-8',
      title: 'text-3xl',
      description: 'text-lg'
    }
  };

  return (
    <div className={cn('page-header', sizeClasses[size].container, className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.current ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h1 className={cn(
            'font-bold text-gray-900 truncate',
            sizeClasses[size].title
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              'mt-2 text-gray-600',
              sizeClasses[size].description
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="ml-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          {tabs}
        </div>
      )}
    </div>
  );
};

export default PageHeader;