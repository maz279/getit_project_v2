
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { SalesReport } from './types';

interface SalesReportsTabProps {
  data: SalesReport[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const SalesReportsTab: React.FC<SalesReportsTabProps> = ({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}) => {
  const chartData = [
    { name: 'Jan', orders: 2400, revenue: 156000 },
    { name: 'Feb', orders: 1398, revenue: 89000 },
    { name: 'Mar', orders: 9800, revenue: 620000 },
    { name: 'Apr', orders: 3908, revenue: 248000 },
    { name: 'May', orders: 4800, revenue: 304000 },
    { name: 'Jun', orders: 3800, revenue: 241000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sales Performance Reports</h2>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{report.period} Sales Summary</span>
                <Badge variant={report.growth > 0 ? "default" : "destructive"}>
                  {report.growth > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(report.growth)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{report.orders.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">৳{report.revenue.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-xl font-semibold">৳{report.averageOrderValue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Top Products</p>
                <div className="flex flex-wrap gap-1">
                  {report.topProducts.map((product, idx) => (
                    <Badge key={idx} variant="secondary">{product}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Top Categories</p>
                <div className="flex flex-wrap gap-1">
                  {report.topCategories.map((category, idx) => (
                    <Badge key={idx} variant="outline">{category}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Orders']} />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
