
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, MousePointer, DollarSign, Target, Award } from 'lucide-react';
import { FeaturedAnalytics } from './types';

interface FeaturedAnalyticsTabProps {
  analytics: FeaturedAnalytics;
}

export const FeaturedAnalyticsTab: React.FC<FeaturedAnalyticsTabProps> = ({ analytics }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics.performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="impressions" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="clicks" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="conversions" stackId="3" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerforming.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-gray-600">{product.clicks} clicks • {product.conversions} conversions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">৳{(product.revenue / 1000).toFixed(0)}K</p>
                    <Badge variant="outline" className="text-xs">{product.conversionRate}% CVR</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Placement Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Placement Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.placementPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="placement" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="impressions" fill="#8884d8" />
              <Bar dataKey="clicks" fill="#82ca9d" />
              <Bar dataKey="revenue" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MousePointer className="h-5 w-5 mr-2" />
            Detailed Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Placement</th>
                  <th className="text-left p-3">Impressions</th>
                  <th className="text-left p-3">Clicks</th>
                  <th className="text-left p-3">CTR</th>
                  <th className="text-left p-3">Revenue</th>
                  <th className="text-left p-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.placementPerformance.map((placement, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{placement.placement}</td>
                    <td className="p-3">{placement.impressions.toLocaleString()}</td>
                    <td className="p-3">{placement.clicks.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge variant={placement.ctr > 6 ? 'default' : placement.ctr > 4 ? 'secondary' : 'destructive'}>
                        {placement.ctr}%
                      </Badge>
                    </td>
                    <td className="p-3 font-semibold text-green-600">৳{(placement.revenue / 1000).toFixed(0)}K</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <TrendingUp className={`h-4 w-4 mr-1 ${placement.ctr > 6 ? 'text-green-500' : 'text-orange-500'}`} />
                        <span className={`text-sm ${placement.ctr > 6 ? 'text-green-600' : 'text-orange-600'}`}>
                          {placement.ctr > 6 ? 'Excellent' : placement.ctr > 4 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
