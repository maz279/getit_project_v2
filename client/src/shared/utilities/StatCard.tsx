/**
 * Stat Card Component
 * Enterprise-grade statistics display card
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  language?: 'en' | 'bn';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  format = 'number',
  currency = '৳',
  description,
  className,
  size = 'md',
  language = 'en'
}) => {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return `${currency}${numValue.toLocaleString()}`;
      case 'percentage':
        return `${numValue}%`;
      default:
        return numValue.toLocaleString();
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="w-3 h-3" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <Card className={cn('stat-card', className)}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {icon && (
                <div className="p-2 bg-blue-100 rounded-lg">
                  {icon}
                </div>
              )}
              <p className="text-sm font-medium text-gray-600">
                {title}
              </p>
            </div>
            
            <div className={cn(
              'font-bold text-gray-900 mb-2',
              valueSizes[size]
            )}>
              {formatValue(value)}
            </div>
            
            {description && (
              <p className="text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>
          
          {change && (
            <div className="text-right">
              <Badge className={cn(
                'text-xs px-2 py-1',
                getChangeColor()
              )}>
                <div className="flex items-center gap-1">
                  {getChangeIcon()}
                  <span>
                    {change.value > 0 ? '+' : ''}{change.value}%
                  </span>
                </div>
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'bn' 
                  ? `${change.period} থেকে`
                  : `vs ${change.period}`
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;