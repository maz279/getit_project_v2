/**
 * StatCard Component
 * Enterprise-grade stat card for displaying key metrics
 * Part of shared component standardization for Phase 1 completion
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  loading = false,
  onClick,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'border-gray-200 bg-white',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  const trendColor = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const TrendIcon = trend?.type === 'increase' ? TrendingUp : 
                   trend?.type === 'decrease' ? TrendingDown : Minus;

  if (loading) {
    return (
      <Card className={cn('animate-pulse', variantStyles[variant], className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  'px-2 py-1 text-xs font-medium',
                  trend.type === 'increase' && 'bg-green-100 text-green-800',
                  trend.type === 'decrease' && 'bg-red-100 text-red-800',
                  trend.type === 'neutral' && 'bg-gray-100 text-gray-800'
                )}
              >
                <TrendIcon className="w-3 h-3 mr-1" />
                {Math.abs(trend.value)}%
              </Badge>
              {trend.label && (
                <span className="text-xs text-gray-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};