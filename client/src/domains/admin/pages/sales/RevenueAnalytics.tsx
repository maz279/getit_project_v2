import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, Activity, Calendar,
  Download, RefreshCw, ArrowUpRight, ArrowDownRight, Target, Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState('30days');
  const [comparison, setComparison] = useState('month');

  // Mock data - replace with API call
  const revenueData = [
    { month: 'Jan', current: 850000, previous: 720000, target: 900000 },
    { month: 'Feb', current: 920000, previous: 850000, target: 950000 },
    { month: 'Mar', current: 1100000, previous: 920000, target: 1000000 },
    { month: 'Apr', current: 980000, previous: 1100000, target: 1100000 },
    { month: 'May', current: 1250000, previous: 980000, target: 1200000 },
    { month: 'Jun', current: 1180000, previous: 1250000, target: 1300000 }
  ];

  const revenueByChannel = [
    { channel: 'Direct Sales', revenue: 680000, percentage: 45, color: '#3B82F6' },
    { channel: 'Marketplace', revenue: 420000, percentage: 28, color: '#10B981' },
    { channel: 'Mobile App', revenue: 260000, percentage: 17, color: '#F59E0B' },
    { channel: 'Social Commerce', revenue: 150000, percentage: 10, color: '#EF4444' }
  ];

  const revenueByRegion = [
    { region: 'Dhaka', revenue: 580000, growth: 15.2 },
    { region: 'Chittagong', revenue: 320000, growth: 8.5 },
    { region: 'Sylhet', revenue: 180000, growth: -2.3 },
    { region: 'Rajshahi', revenue: 150000, growth: 12.7 },
    { region: 'Khulna', revenue: 120000, growth: 5.8 },
    { region: 'Barisal', revenue: 90000, growth: 18.9 },
    { region: 'Rangpur', revenue: 70000, growth: 22.1 }
  ];

  const monthlyMetrics = [
    { metric: 'Gross Revenue', value: 1180000, change: -5.6, target: 1300000 },
    { metric: 'Net Revenue', value: 944000, change: -4.2, target: 1040000 },
    { metric: 'Profit Margin', value: 18.5, change: 1.2, target: 20 },
    { metric: 'Revenue Per User', value: 856, change: 8.3, target: 900 }
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <PieChart className="h-8 w-8 text-purple-600" />
              Revenue Analytics
            </h1>
            <p className="text-gray-600 mt-2">Deep dive into revenue performance and profit margins</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Export Analytics
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {monthlyMetrics.map((metric) => (
            <Card key={metric.metric}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{metric.metric}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.metric === 'Profit Margin' 
                    ? `${metric.value}%` 
                    : metric.metric === 'Revenue Per User'
                    ? `৳${metric.value}`
                    : `৳${(metric.value / 1000).toFixed(0)}k`
                  }
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {metric.change > 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">{Math.abs(metric.change)}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">{Math.abs(metric.change)}%</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {metric.metric === 'Profit Margin' 
                        ? `${metric.target}%` 
                        : metric.metric === 'Revenue Per User'
                        ? `৳${metric.target}`
                        : `৳${(metric.target / 1000).toFixed(0)}k`
                      }
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-1 mt-3"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trend">Revenue Trend</TabsTrigger>
            <TabsTrigger value="channel">By Channel</TabsTrigger>
            <TabsTrigger value="region">By Region</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Revenue Trend */}
          <TabsContent value="trend">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend Analysis</CardTitle>
                <CardDescription>Monthly revenue comparison with targets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `৳${(value / 1000).toFixed(0)}k`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Current Year"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previous" 
                      stroke="#94A3B8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Previous Year"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Channel */}
          <TabsContent value="channel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Sales Channel</CardTitle>
                  <CardDescription>Distribution across different channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={revenueByChannel}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="percentage"
                      >
                        {revenueByChannel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>Revenue breakdown by channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueByChannel.map((channel) => (
                      <div key={channel.channel}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="font-medium">{channel.channel}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {channel.percentage}%
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">৳{(channel.revenue / 1000).toFixed(0)}k</span>
                        </div>
                        <Progress value={channel.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* By Region */}
          <TabsContent value="region">
            <Card>
              <CardHeader>
                <CardTitle>Regional Revenue Performance</CardTitle>
                <CardDescription>Revenue distribution and growth by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueByRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `৳${(value / 1000).toFixed(0)}k`} />
                    <Bar dataKey="revenue" fill="#3B82F6">
                      {revenueByRegion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.growth > 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {revenueByRegion.slice(0, 3).map((region) => (
                    <div key={region.region} className="text-center">
                      <div className="text-sm text-gray-600">{region.region}</div>
                      <div className="text-lg font-bold">৳{(region.revenue / 1000).toFixed(0)}k</div>
                      <div className={`text-sm flex items-center justify-center gap-1 ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {region.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(region.growth)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
                <CardDescription>Revenue growth comparison by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `৳${(value / 1000).toFixed(0)}k`} />
                    <Legend />
                    <Bar dataKey="previous" fill="#94A3B8" name="Previous Year" />
                    <Bar dataKey="current" fill="#3B82F6" name="Current Year" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}