
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Users, Award, TrendingUp, Gift, DollarSign, Target } from 'lucide-react';
import { LoyaltyAnalytics } from './types';

interface LoyaltyStatsCardsProps {
  analytics: LoyaltyAnalytics;
}

export const LoyaltyStatsCards: React.FC<LoyaltyStatsCardsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(analytics.totalMembers / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-gray-500 text-center">Total Members</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Award className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(analytics.activeMembers / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-gray-500 text-center">Active Members</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analytics.newMembersThisMonth.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 text-center">New This Month</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Gift className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {(analytics.totalPointsIssued / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-500 text-center">Points Issued</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <DollarSign className="h-6 w-6 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analytics.programROI.toFixed(1)}x
          </div>
          <div className="text-sm text-gray-500 text-center">Program ROI</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Target className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {analytics.memberRetentionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 text-center">Retention Rate</div>
        </CardContent>
      </Card>
    </div>
  );
};
