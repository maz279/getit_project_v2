
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MonthlyTrendsTabProps {
  monthlyTrendsData: any[];
  categoryTrendsData: any[];
  customerSegmentData: any[];
}

export const MonthlyTrendsTab: React.FC<MonthlyTrendsTabProps> = ({
  monthlyTrendsData,
  categoryTrendsData,
  customerSegmentData
}) => {
  return (
    <div className="space-y-6">
      {/* Monthly Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Sales Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: { label: "Sales", color: "#3b82f6" },
                orders: { label: "Orders", color: "#10b981" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Bar yAxisId="right" dataKey="orders" fill="#10b981" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                growth: { label: "Growth %", color: "#f59e0b" }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryTrendsData.map((category, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">{category.category}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={category.growth > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {category.growth > 0 ? '+' : ''}{category.growth}%
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {['jan', 'feb', 'mar', 'apr', 'may', 'jun'].map((month) => (
                    <div key={month} className="text-center">
                      <p className="text-xs text-gray-600 capitalize">{month}</p>
                      <p className="text-sm font-medium">৳{(category[month as keyof typeof category] as number / 1000).toFixed(0)}K</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Segment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerSegmentData.map((segment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{segment.segment}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Count:</span>
                    <span className="text-sm font-medium">{segment.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Revenue:</span>
                    <span className="text-sm font-medium">৳{(segment.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Growth:</span>
                    <Badge className={segment.growth > 15 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      +{segment.growth}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
