
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Store, Users, DollarSign, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { VendorMetrics } from './types';

interface ActiveVendorsStatsCardsProps {
  metrics: VendorMetrics;
}

export const ActiveVendorsStatsCards: React.FC<ActiveVendorsStatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Store className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.totalActiveVendors.toLocaleString()}</div>
          <div className="text-sm text-gray-500 text-center">Active Vendors</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.newVendorsThisMonth}</div>
          <div className="text-sm text-gray-500 text-center">New This Month</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <DollarSign className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">৳{(metrics.totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-500 text-center">Total Revenue</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-500 text-center">Avg Rating</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Award className="h-6 w-6 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.topPerformingVendors}</div>
          <div className="text-sm text-gray-500 text-center">Top Performers</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.pendingVerifications}</div>
          <div className="text-sm text-gray-500 text-center">Pending Reviews</div>
        </CardContent>
      </Card>
    </div>
  );
};
