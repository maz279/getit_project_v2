
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const revenueData = [
  { date: '2024-01-01', revenue: 120000, orders: 450, avgOrder: 267 },
  { date: '2024-01-02', revenue: 135000, orders: 520, avgOrder: 260 },
  { date: '2024-01-03', revenue: 128000, orders: 480, avgOrder: 267 },
  { date: '2024-01-04', revenue: 142000, orders: 560, avgOrder: 254 },
  { date: '2024-01-05', revenue: 156000, orders: 590, avgOrder: 264 },
  { date: '2024-01-06', revenue: 149000, orders: 575, avgOrder: 259 },
  { date: '2024-01-07', revenue: 163000, orders: 610, avgOrder: 267 }
];

export const OverviewTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "#10b981" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Revenue Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">৳163,000</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                +9.2%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Weekly Average</p>
                <p className="text-2xl font-bold text-blue-600">৳142,000</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                +12.5%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Monthly Projection</p>
                <p className="text-2xl font-bold text-purple-600">৳9.6M</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                +8.7%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
