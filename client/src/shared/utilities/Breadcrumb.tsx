/**
 * Breadcrumb Component
 * Enterprise-grade navigation breadcrumb with dynamic routing
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
  language?: 'en' | 'bn';
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  showHome = true,
  className,
  language = 'en'
}) => {
  const homeItem: BreadcrumbItem = {
    label: language === 'bn' ? 'হোম' : 'Home',
    href: '/',
    icon: <Home className="w-4 h-4" />
  };

  const allItems = showHome ? [homeItem, ...items] : items;

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 flex-shrink-0">
                {separator}
              </span>
            )}
            
            <div className="flex items-center">
              {item.icon && (
                <span className="mr-2">
                  {item.icon}
                </span>
              )}
              
              {item.current || !item.href ? (
                <span className={cn(
                  'text-sm font-medium',
                  item.current ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;