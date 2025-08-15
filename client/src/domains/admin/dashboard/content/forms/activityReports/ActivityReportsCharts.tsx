
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data
const activitySummaryData = [
  { period: 'Jan', totalActivities: 12450, uniqueUsers: 3420, averageSessionTime: 8.5 },
  { period: 'Feb', totalActivities: 15600, uniqueUsers: 3890, averageSessionTime: 9.2 },
  { period: 'Mar', totalActivities: 18200, uniqueUsers: 4520, averageSessionTime: 10.1 },
  { period: 'Apr', totalActivities: 21300, uniqueUsers: 5100, averageSessionTime: 11.3 },
  { period: 'May', totalActivities: 24800, uniqueUsers: 5680, averageSessionTime: 12.0 },
  { period: 'Jun', totalActivities: 28500, uniqueUsers: 6200, averageSessionTime: 12.8 }
];

const categoryBreakdown = [
  { category: 'Product Browsing', count: 45600, percentage: 38, color: '#3b82f6' },
  { category: 'Search Activities', count: 32400, percentage: 27, color: '#10b981' },
  { category: 'Cart Operations', count: 18900, percentage: 16, color: '#f59e0b' },
  { category: 'Account Management', count: 12800, percentage: 11, color: '#ef4444' },
  { category: 'Social Interactions', count: 9600, percentage: 8, color: '#8b5cf6' }
];

export const ActivityReportsCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              totalActivities: { label: "Total Activities", color: "#3b82f6" },
              uniqueUsers: { label: "Unique Users", color: "#10b981" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activitySummaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="totalActivities" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="uniqueUsers" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Activities", color: "#8884d8" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
