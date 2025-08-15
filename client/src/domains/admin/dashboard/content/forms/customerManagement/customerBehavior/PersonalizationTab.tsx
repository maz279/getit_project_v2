
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react';
import { PersonalizationInsight } from './types';

interface PersonalizationTabProps {
  insights: PersonalizationInsight[];
}

export const PersonalizationTab: React.FC<PersonalizationTabProps> = ({ insights }) => {
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  const recommendationTypes = insights.reduce((acc, insight) => {
    acc[insight.recommendationType] = (acc[insight.recommendationType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(recommendationTypes).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const effectivenessData = insights.map(insight => ({
    customer: insight.customerId.slice(-3),
    ctr: (insight.clickThroughRate * 100).toFixed(1),
    conversion: (insight.conversionRate * 100).toFixed(1),
    revenue: insight.revenue
  }));

  const avgCTR = insights.reduce((sum, insight) => sum + insight.clickThroughRate, 0) / insights.length;
  const avgConversion = insights.reduce((sum, insight) => sum + insight.conversionRate, 0) / insights.length;
  const totalRevenue = insights.reduce((sum, insight) => sum + insight.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <MousePointer className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {(avgCTR * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 text-center">Avg Click-Through Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Target className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {(avgConversion * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 text-center">Avg Conversion Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <DollarSign className="h-6 w-6 text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 text-center">Total Revenue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {insights.filter(i => i.effectiveness === 'high').length}
            </div>
            <div className="text-sm text-gray-500 text-center">High Performing</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <CardTitle>Performance by Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ ctr: {}, conversion: {} }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={effectivenessData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="customer" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ctr" fill="#8884d8" name="CTR %" />
                  <Bar dataKey="conversion" fill="#82ca9d" name="Conversion %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personalization Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.slice(0, 10).map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">Customer {insight.customerId.slice(-6)}</div>
                    <Badge 
                      variant={insight.effectiveness === 'high' ? 'default' : 'secondary'}
                    >
                      {insight.effectiveness} effectiveness
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {insight.recommendationType} • 
                    CTR: {(insight.clickThroughRate * 100).toFixed(1)}% • 
                    Conversion: {(insight.conversionRate * 100).toFixed(1)}%
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.recommendations.slice(0, 3).map((rec, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">৳{insight.revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
