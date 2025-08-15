
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { SupportMetrics } from './types';

interface SupportStatsCardsProps {
  metrics: SupportMetrics;
}

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <MessageSquare className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.totalTickets / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-500 text-center">Total Tickets</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <AlertTriangle className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.openTickets}
          </div>
          <div className="text-sm text-gray-500 text-center">Open Tickets</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(metrics.resolvedTickets / 1000).toFixed(1)}K
          </div>
          <div className="text-sm text-gray-500 text-center">Resolved</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Clock className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.avgResponseTime.toFixed(1)}m
          </div>
          <div className="text-sm text-gray-500 text-center">Avg Response</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.customerSatisfaction.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 text-center">Satisfaction</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-teal-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.firstContactResolution.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 text-center">First Contact Resolution</div>
        </CardContent>
      </Card>
    </div>
  );
};
