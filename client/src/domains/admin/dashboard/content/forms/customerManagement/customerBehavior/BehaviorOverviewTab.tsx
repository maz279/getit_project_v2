
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { BehaviorMetrics, BehaviorSegment } from './types';

interface BehaviorOverviewTabProps {
  metrics: BehaviorMetrics;
  segments: BehaviorSegment[];
}

export const BehaviorOverviewTab: React.FC<BehaviorOverviewTabProps> = ({
  metrics,
  segments
}) => {
  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'];

  const segmentData = segments.map(segment => ({
    name: segment.name,
    value: segment.customerCount,
    color: segment.color
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Behavior Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ sessions: {}, conversions: {}, revenue: {} }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.behaviorTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} name="Sessions" />
                <Line type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={2} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Segments Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: {} }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Behavior Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ revenue: {} }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.behaviorTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.slice(0, 3).map((segment, index) => (
              <div key={segment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <div className="font-medium">{segment.name}</div>
                    <div className="text-sm text-gray-500">{segment.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{segment.customerCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">customers</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
