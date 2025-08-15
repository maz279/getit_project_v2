
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { LoyaltyAnalytics } from './types';

interface LoyaltyOverviewTabProps {
  analytics: LoyaltyAnalytics;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const LoyaltyOverviewTab: React.FC<LoyaltyOverviewTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Program Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageEngagementScore.toFixed(1)}</div>
            <Progress value={analytics.averageEngagementScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Average member engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.rewardRedemptionRate.toFixed(1)}%</div>
            <Progress value={analytics.rewardRedemptionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Points redemption rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Points/Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averagePointsPerMember.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-2">Points per active member</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.membershipGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newMembers" stroke="#8884d8" name="New Members" />
                <Line type="monotone" dataKey="activeMembers" stroke="#82ca9d" name="Active Members" />
                <Line type="monotone" dataKey="churnedMembers" stroke="#ff7c7c" name="Churned" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Member Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.tierDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tier, percentage }) => `${tier} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Points Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.pointsAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="issued" fill="#8884d8" name="Issued" />
                <Bar dataKey="redeemed" fill="#82ca9d" name="Redeemed" />
                <Bar dataKey="expired" fill="#ff7c7c" name="Expired" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Category Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.engagementMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.category}</span>
                    <Badge variant="secondary">{metric.engagementRate.toFixed(1)}%</Badge>
                  </div>
                  <Progress value={metric.engagementRate} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Conversion: {metric.conversionRate.toFixed(1)}%</span>
                    <span>Revenue: ৳{(metric.revenueImpact / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPerformingRewards.map((reward, index) => (
              <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-gray-500">{reward.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{reward.pointsCost} pts</div>
                  <div className="text-sm text-gray-500">{reward.redeemed} redeemed</div>
                  <Badge variant="outline">{reward.popularity}% popularity</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
