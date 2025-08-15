import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Target,
  Zap,
  FileText,
  Download,
  Settings,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Globe,
  Smartphone,
  Clock,
  ArrowUp,
  ArrowDown,
  Package,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

export const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [analyticsType, setAnalyticsType] = useState('sales');

  // Enhanced sample data for analytics
  const salesData = [
    { name: 'Jan', sales: 65000, profit: 28000, orders: 450, customers: 320 },
    { name: 'Feb', sales: 75000, profit: 32000, orders: 520, customers: 380 },
    { name: 'Mar', sales: 85000, profit: 38000, orders: 680, customers: 450 },
    { name: 'Apr', sales: 95000, profit: 45000, orders: 750, customers: 520 },
    { name: 'May', sales: 105000, profit: 52000, orders: 820, customers: 580 },
    { name: 'Jun', sales: 125000, profit: 62000, orders: 950, customers: 650 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35000, color: '#0088FE', percentage: 31.2 },
    { name: 'Fashion', value: 28000, color: '#00C49F', percentage: 25.0 },
    { name: 'Home & Garden', value: 22000, color: '#FFBB28', percentage: 19.6 },
    { name: 'Books', value: 15000, color: '#FF8042', percentage: 13.4 },
    { name: 'Sports', value: 12000, color: '#8884d8', percentage: 10.7 }
  ];

  const customerBehaviorData = [
    { time: '00:00', pageViews: 1200, uniqueVisitors: 850, bounceRate: 45, sessionDuration: 3.2 },
    { time: '04:00', pageViews: 800, uniqueVisitors: 620, bounceRate: 48, sessionDuration: 2.8 },
    { time: '08:00', pageViews: 2500, uniqueVisitors: 1800, bounceRate: 35, sessionDuration: 4.1 },
    { time: '12:00', pageViews: 3200, uniqueVisitors: 2400, bounceRate: 28, sessionDuration: 5.2 },
    { time: '16:00', pageViews: 2800, uniqueVisitors: 2100, bounceRate: 32, sessionDuration: 4.8 },
    { time: '20:00', pageViews: 1800, uniqueVisitors: 1350, bounceRate: 40, sessionDuration: 3.5 }
  ];

  const performanceMetrics = [
    { metric: 'Conversion Rate', value: 3.2, target: 4.0, trend: 'up' },
    { metric: 'Customer Satisfaction', value: 4.6, target: 4.8, trend: 'up' },
    { metric: 'Page Load Speed', value: 2.1, target: 1.5, trend: 'down' },
    { metric: 'Cart Abandonment', value: 68.5, target: 60.0, trend: 'down' },
    { metric: 'Return Rate', value: 3.2, target: 2.5, trend: 'down' },
  ];

  const trafficSources = [
    { source: 'Organic Search', visitors: 45000, percentage: 42.5, color: '#8884d8' },
    { source: 'Direct', visitors: 28000, percentage: 26.4, color: '#82ca9d' },
    { source: 'Social Media', visitors: 18000, percentage: 17.0, color: '#ffc658' },
    { source: 'Paid Ads', visitors: 12000, percentage: 11.3, color: '#ff7300' },
    { source: 'Email', visitors: 3000, percentage: 2.8, color: '#00ff88' }
  ];

  const deviceAnalytics = [
    { device: 'Mobile', sessions: 58000, percentage: 52.3, color: '#0088FE' },
    { device: 'Desktop', sessions: 42000, percentage: 37.8, color: '#00C49F' },
    { device: 'Tablet', sessions: 11000, percentage: 9.9, color: '#FFBB28' }
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 text-lg">Comprehensive data insights and business intelligence</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: '৳2,450,000', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-green-600' },
          { title: 'Total Orders', value: '4,165', change: '+8.2%', trend: 'up', icon: ShoppingCart, color: 'text-blue-600' },
          { title: 'New Customers', value: '1,823', change: '+15.3%', trend: 'up', icon: Users, color: 'text-purple-600' },
          { title: 'Page Views', value: '156,789', change: '-2.1%', trend: 'down', icon: Eye, color: 'text-orange-600' },
          { title: 'Conversion Rate', value: '3.2%', change: '+0.5%', trend: 'up', icon: Target, color: 'text-indigo-600' }
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          const TrendIcon = metric.trend === 'up' ? ArrowUp : ArrowDown;
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <IconComponent className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs value={analyticsType} onValueChange={setAnalyticsType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="customer">Customer Analytics</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Analytics</TabsTrigger>
          <TabsTrigger value="product">Product Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
        </TabsList>

        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Sales']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sales Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Sales Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="sale-amount">Sale Amount (৳)</Label>
                  <Input id="sale-amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="sale-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sale-date">Date</Label>
                  <Input id="sale-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="customer-id">Customer ID</Label>
                  <Input id="customer-id" placeholder="Optional" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Add Sale Record</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analytics */}
        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Behavior Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={customerBehaviorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pageViews" stroke="#8884d8" name="Page Views" />
                    <Line type="monotone" dataKey="uniqueVisitors" stroke="#82ca9d" name="Unique Visitors" />
                    <Line type="monotone" dataKey="sessionDuration" stroke="#ffc658" name="Avg Session (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: 'VIP Customers', count: 1250, percentage: 8.5, color: 'bg-purple-500' },
                    { segment: 'Regular Customers', count: 6800, percentage: 46.2, color: 'bg-blue-500' },
                    { segment: 'New Customers', count: 4200, percentage: 28.5, color: 'bg-green-500' },
                    { segment: 'Inactive Customers', count: 2480, percentage: 16.8, color: 'bg-gray-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="font-medium">{item.segment}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.count.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="customer-segment">Customer Segment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">VIP Customer</SelectItem>
                      <SelectItem value="regular">Regular Customer</SelectItem>
                      <SelectItem value="new">New Customer</SelectItem>
                      <SelectItem value="inactive">Inactive Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customer-value">Customer Value (৳)</Label>
                  <Input id="customer-value" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="engagement-score">Engagement Score</Label>
                  <Input id="engagement-score" type="number" min="1" max="10" placeholder="1-10" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Update Customer Data</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Analytics */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trafficSources} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="source" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceAnalytics}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                      label={({ device, percentage }) => `${device}: ${percentage}%`}
                    >
                      {deviceAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Sessions']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Analytics Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="traffic-source">Traffic Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">Organic Search</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="paid">Paid Ads</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visitors-count">Visitors</Label>
                  <Input id="visitors-count" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="bounce-rate">Bounce Rate (%)</Label>
                  <Input id="bounce-rate" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="avg-session">Avg Session Duration (min)</Label>
                  <Input id="avg-session" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Add Traffic Data</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Analytics */}
        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: 'Total Products', value: '12,456', change: '+234', icon: Package, color: 'text-blue-600' },
                  { title: 'Best Sellers', value: '1,847', change: '+89', icon: TrendingUp, color: 'text-green-600' },
                  { title: 'Low Stock Items', value: '156', change: '-23', icon: AlertTriangle, color: 'text-orange-600' },
                  { title: 'Out of Stock', value: '34', change: '-12', icon: XCircle, color: 'text-red-600' }
                ].map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={index} className="text-center p-6 border rounded-lg bg-white">
                      <div className={`mx-auto mb-4 p-3 rounded-full bg-gray-100 w-fit`}>
                        <IconComponent className={`w-8 h-8 ${metric.color}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                      <p className="text-gray-600 mb-2">{metric.title}</p>
                      <Badge variant="outline" className="text-sm">
                        {metric.change} this month
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Product Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Product Analytics Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="product-category">Product Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="product-views">Product Views</Label>
                  <Input id="product-views" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="conversion-rate">Conversion Rate (%)</Label>
                  <Input id="conversion-rate" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Update Product Analytics</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{metric.metric}</h4>
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <span className="text-sm text-gray-500">Target: {metric.target}</span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.target) * 100} 
                        className="mt-2 h-2" 
                      />
                    </div>
                    <div className={`ml-4 flex items-center ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend === 'up' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="metric-type">Metric Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="satisfaction">Customer Satisfaction</SelectItem>
                      <SelectItem value="load-speed">Page Load Speed</SelectItem>
                      <SelectItem value="abandonment">Cart Abandonment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="metric-value">Current Value</Label>
                  <Input id="metric-value" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div>
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input id="target-value" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Update Performance Metric</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
