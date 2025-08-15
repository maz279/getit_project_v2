
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DeliveryPerformanceData } from './types';

interface PerformanceOverviewTabProps {
  data: DeliveryPerformanceData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const PerformanceOverviewTab: React.FC<PerformanceOverviewTabProps> = ({
  data,
  timeRange,
  onTimeRangeChange
}) => {
  const chartData = [
    { month: 'Jan', onTime: 92.1, deliveries: 12500, satisfaction: 4.3 },
    { month: 'Feb', onTime: 93.2, deliveries: 13200, satisfaction: 4.4 },
    { month: 'Mar', onTime: 91.8, deliveries: 14100, satisfaction: 4.4 },
    { month: 'Apr', onTime: 94.5, deliveries: 15300, satisfaction: 4.5 },
    { month: 'May', onTime: 95.1, deliveries: 16200, satisfaction: 4.6 },
    { month: 'Jun', onTime: 94.2, deliveries: 15420, satisfaction: 4.6 }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Compare Periods
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Data as of {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              📈 On-Time Delivery Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="onTime" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              📦 Monthly Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="deliveries" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Key Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">✅ Strengths</h4>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• On-time delivery above industry average</li>
                <li>• Customer satisfaction improving</li>
                <li>• Cost per delivery optimized</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h4 className="font-semibold text-yellow-800">⚠️ Areas for Improvement</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Peak hour delivery delays</li>
                <li>• Rural area coverage gaps</li>
                <li>• Weather impact mitigation</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800">🎯 Action Items</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Implement route optimization</li>
                <li>• Expand delivery hub network</li>
                <li>• Enhance tracking system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
