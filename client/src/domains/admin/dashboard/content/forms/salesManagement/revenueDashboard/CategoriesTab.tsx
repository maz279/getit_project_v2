
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const categoryRevenue = [
  { category: 'Electronics', revenue: 2800000, percentage: 35, growth: 15.2, color: '#3b82f6' },
  { category: 'Fashion', revenue: 2240000, percentage: 28, growth: 12.8, color: '#10b981' },
  { category: 'Home & Garden', revenue: 1600000, percentage: 20, growth: 18.5, color: '#f59e0b' },
  { category: 'Sports', revenue: 880000, percentage: 11, growth: 8.3, color: '#ef4444' },
  { category: 'Others', revenue: 480000, percentage: 6, growth: 5.1, color: '#8b5cf6' }
];

export const CategoriesTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "#3b82f6" }
            }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="revenue"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                >
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryRevenue.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">৳{(category.revenue / 1000000).toFixed(1)}M</span>
                    <Badge className={category.growth > 15 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      +{category.growth}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
