
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Users, Clock, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';
import { BehaviorMetrics } from './types';

interface BehaviorStatsCardsProps {
  metrics: BehaviorMetrics;
}

export const BehaviorStatsCards: React.FC<BehaviorStatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.totalActiveCustomers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 text-center">Active Customers</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Clock className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.averageSessionDuration.toFixed(1)}m
          </div>
          <div className="text-sm text-gray-500 text-center">Avg Session Duration</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.overallConversionRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 text-center">Conversion Rate</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Target className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.customerRetentionRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 text-center">Retention Rate</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Zap className="h-6 w-6 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.averageEngagementScore}
          </div>
          <div className="text-sm text-gray-500 text-center">Engagement Score</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.churnRiskCustomers.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 text-center">At-Risk Customers</div>
        </CardContent>
      </Card>
    </div>
  );
};
