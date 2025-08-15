/**
 * Analytics Dashboard - Multi-chart analytics interface
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, Activity, MapPin,
  BarChart3, LineChart as LineChartIcon, ArrowUpRight, ArrowDownRight,
  Calendar, Download, Filter
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Funnel, FunnelChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, ComposedChart, Sankey
} from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';

// Sample data for various charts
const salesTrendData = [
  { date: 'Mon', daily: 32000, weekly: 220000, monthly: 880000 },
  { date: 'Tue', daily: 45000, weekly: 235000, monthly: 920000 },
  { date: 'Wed', daily: 38000, weekly: 240000, monthly: 900000 },
  { date: 'Thu', daily: 52000, weekly: 255000, monthly: 950000 },
  { date: 'Fri', daily: 68000, weekly: 290000, monthly: 1100000 },
  { date: 'Sat', daily: 85000, weekly: 340000, monthly: 1250000 },
  { date: 'Sun', daily: 72000, weekly: 360000, monthly: 1300000 },
];

const geographicData = [
  { division: 'Dhaka', sales: 450000, percentage: 35 },
  { division: 'Chittagong', sales: 280000, percentage: 22 },
  { division: 'Rajshahi', sales: 150000, percentage: 12 },
  { division: 'Khulna', sales: 120000, percentage: 9 },
  { division: 'Sylhet', sales: 100000, percentage: 8 },
  { division: 'Barisal', sales: 80000, percentage: 6 },
  { division: 'Rangpur', sales: 60000, percentage: 5 },
  { division: 'Mymensingh', sales: 40000, percentage: 3 },
];

const conversionFunnelData = [
  { name: 'Website Visits', value: 100000, fill: '#3B82F6' },
  { name: 'Product Views', value: 65000, fill: '#60A5FA' },
  { name: 'Add to Cart', value: 42000, fill: '#93BBFC' },
  { name: 'Checkout Started', value: 28000, fill: '#BFDBFE' },
  { name: 'Completed Orders', value: 15000, fill: '#DBEAFE' },
];

const customerBehaviorData = [
  { hour: '00:00', mobile: 320, desktop: 180, tablet: 50 },
  { hour: '03:00', mobile: 150, desktop: 80, tablet: 20 },
  { hour: '06:00', mobile: 280, desktop: 140, tablet: 40 },
  { hour: '09:00', mobile: 520, desktop: 380, tablet: 120 },
  { hour: '12:00', mobile: 680, desktop: 520, tablet: 180 },
  { hour: '15:00', mobile: 620, desktop: 480, tablet: 160 },
  { hour: '18:00', mobile: 820, desktop: 620, tablet: 220 },
  { hour: '21:00', mobile: 920, desktop: 680, tablet: 280 },
];

const topProductsData = [
  { name: 'Samsung Galaxy A54', sales: 342, revenue: 10260000, image: '📱' },
  { name: 'Cotton Saree Collection', sales: 285, revenue: 1425000, image: '👘' },
  { name: 'Walton AC 1.5 Ton', sales: 156, revenue: 7800000, image: '❄️' },
  { name: 'Premium Basmati Rice', sales: 890, revenue: 890000, image: '🍚' },
  { name: 'Leather Office Bag', sales: 234, revenue: 702000, image: '💼' },
  { name: 'Kids School Uniform', sales: 567, revenue: 567000, image: '👔' },
  { name: 'Fresh Hilsa Fish', sales: 432, revenue: 648000, image: '🐟' },
  { name: 'Gaming Laptop HP', sales: 89, revenue: 8900000, image: '💻' },
  { name: 'Gold Jewelry Set', sales: 45, revenue: 4500000, image: '💍' },
  { name: 'Baby Care Products', sales: 678, revenue: 678000, image: '👶' },
];

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedDivision, setSelectedDivision] = useState('all');

  return (
    <AdminLayout
      currentPage="Analytics Dashboard"
      breadcrumbItems={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Analytics Dashboard' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive business intelligence and analytics
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT 12,45,000</div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+23.5%</span>
                <span className="text-xs text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+15 new</span>
                <span className="text-xs text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Customer Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,234</div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+18.2%</span>
                <span className="text-xs text-gray-500 ml-1">growth rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15.2%</div>
              <div className="flex items-center mt-1">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600 font-medium">-2.1%</span>
                <span className="text-xs text-gray-500 ml-1">needs attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend Graphs */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend Analysis</CardTitle>
            <CardDescription>Daily, weekly, and monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `BDT ${value.toLocaleString()}`} />
                    <Area 
                      type="monotone" 
                      dataKey="daily" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorDaily)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="weekly">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `BDT ${value.toLocaleString()}`} />
                    <Bar dataKey="weekly" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="monthly">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `BDT ${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="monthly" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Geographic Distribution and Customer Behavior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Distribution Map */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Sales across Bangladesh divisions</CardDescription>
                </div>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {geographicData.map(div => (
                      <SelectItem key={div.division} value={div.division}>
                        {div.division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((division) => (
                  <div key={division.division} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{division.division}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">BDT {division.sales.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{division.percentage}% of total</div>
                      </div>
                    </div>
                    <Progress value={division.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Behavior Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior by Time</CardTitle>
              <CardDescription>Device usage patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={customerBehaviorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="mobile" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="desktop" stackId="1" stroke="#10B981" fill="#10B981" />
                  <Area type="monotone" dataKey="tablet" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel and Popular Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Visualization</CardTitle>
              <CardDescription>Customer journey from visit to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={conversionFunnelData} 
                  layout="horizontal"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="value" fill="#3B82F6">
                    {conversionFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Conversion Rate:</span>
                  <span className="font-semibold">15%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cart Abandonment Rate:</span>
                  <span className="font-semibold text-red-600">33%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Popular Products</CardTitle>
              <CardDescription>Best selling products with revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {topProductsData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{product.image}</div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sales} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">BDT {product.revenue.toLocaleString()}</div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Summary & Insights</CardTitle>
            <CardDescription>Key takeaways and actionable insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">🎯 Strengths</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Mobile traffic growing 23% MoM</li>
                  <li>• Dhaka division contributing 35% revenue</li>
                  <li>• Evening hours (6-9 PM) peak sales time</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600">⚠️ Areas of Improvement</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Cart abandonment rate at 33%</li>
                  <li>• Desktop conversion declining</li>
                  <li>• Low penetration in Rangpur division</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">💡 Recommendations</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Optimize checkout process</li>
                  <li>• Launch targeted campaigns for Rangpur</li>
                  <li>• Implement cart recovery emails</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;