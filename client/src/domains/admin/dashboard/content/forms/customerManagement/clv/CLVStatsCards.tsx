
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { TrendingUp, Users, DollarSign, AlertTriangle, UserPlus, BarChart3 } from 'lucide-react';
import { CLVMetrics } from './types';

interface CLVStatsCardsProps {
  metrics: CLVMetrics;
}

export const CLVStatsCards: React.FC<CLVStatsCardsProps> = ({ metrics }) => {
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `৳${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `৳${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `৳${(amount / 1000).toFixed(0)}K`;
    }
    return `৳${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.totalCustomers / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-gray-500 text-center">Total Customers</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <DollarSign className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.averageCLV)}
          </div>
          <div className="text-sm text-gray-500 text-center">Average CLV</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.totalCLV)}
          </div>
          <div className="text-sm text-gray-500 text-center">Total CLV</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <BarChart3 className="h-6 w-6 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.highValueCustomers / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-gray-500 text-center">High Value</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.atRiskCustomers / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-500 text-center">At Risk</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <UserPlus className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.retentionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 text-center">Retention Rate</div>
        </CardContent>
      </Card>
    </div>
  );
};
