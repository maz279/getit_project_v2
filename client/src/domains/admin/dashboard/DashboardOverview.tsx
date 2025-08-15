/**
 * DashboardOverview - Comprehensive Admin Dashboard Overview
 * Amazon.com/Shopee.sg-Level Dashboard with Bangladesh Market Focus
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  DollarSign, Users, Package, ShoppingCart, TrendingUp, TrendingDown,
  Activity, Clock, MapPin, Star, AlertTriangle, CheckCircle,
  Smartphone, CreditCard, Truck, Store, Calendar, Globe
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Sample data for Bangladesh market
const revenueData = [
  { date: 'Jan', revenue: 2400000, orders: 1240, customers: 890 },
  { date: 'Feb', revenue: 1398000, orders: 1100, customers: 780 },
  { date: 'Mar', revenue: 3800000, orders: 1680, customers: 1200 },
  { date: 'Apr', revenue: 3908000, orders: 1890, customers: 1350 },
  { date: 'May', revenue: 4800000, orders: 2100, customers: 1480 },
  { date: 'Jun', revenue: 3800000, orders: 1950, customers: 1320 },
];

const paymentMethodData = [
  { name: 'bKash', value: 45, color: '#E91E63' },
  { name: 'Nagad', value: 25, color: '#FF9800' },
  { name: 'Rocket', value: 15, color: '#9C27B0' },
  { name: 'Cash on Delivery', value: 12, color: '#4CAF50' },
  { name: 'Card Payment', value: 3, color: '#2196F3' },
];

const topVendors = [
  { id: 1, name: 'Fashion Hub BD', sales: 850000, orders: 324, rating: 4.8, growth: 12.5 },
  { id: 2, name: 'Electronics World', sales: 720000, orders: 298, rating: 4.7, growth: 8.3 },
  { id: 3, name: 'Home & Kitchen', sales: 650000, orders: 256, rating: 4.6, growth: 15.2 },
  { id: 4, name: 'Books & Stationery', sales: 480000, orders: 189, rating: 4.9, growth: 6.8 },
  { id: 5, name: 'Health & Beauty', sales: 420000, orders: 167, rating: 4.5, growth: -2.1 },
];

const recentActivities = [
  { id: 1, type: 'order', message: 'New order #ORD-2024-5891 from Dhaka', time: '2 minutes ago', status: 'info' },
  { id: 2, type: 'vendor', message: 'Fashion Hub BD uploaded 25 new products', time: '5 minutes ago', status: 'success' },
  { id: 3, type: 'payment', message: 'bKash payment verification completed', time: '8 minutes ago', status: 'success' },
  { id: 4, type: 'alert', message: 'Low stock alert for Samsung Galaxy A54', time: '12 minutes ago', status: 'warning' },
  { id: 5, type: 'system', message: 'System backup completed successfully', time: '15 minutes ago', status: 'info' },
];

const bangladeshStats = {
  divisions: [
    { name: 'Dhaka', orders: 1250, percentage: 35 },
    { name: 'Chittagong', orders: 890, percentage: 25 },
    { name: 'Sylhet', orders: 456, percentage: 13 },
    { name: 'Khulna', orders: 378, percentage: 11 },
    { name: 'Rajshahi', orders: 289, percentage: 8 },
    { name: 'Rangpur', orders: 234, percentage: 7 },
    { name: 'Mymensingh', orders: 156, percentage: 4 },
    { name: 'Barisal', orders: 123, percentage: 3 },
  ],
  festivals: {
    current: 'Eid Preparation',
    impact: '+250% sales increase',
    daysLeft: 15
  }
};

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 18500000,
    totalOrders: 8956,
    activeVendors: 342,
    totalCustomers: 15640,
    pendingOrders: 89,
    lowStockItems: 23,
    activeUsers: 1247,
    systemHealth: 99.9
  });

  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        pendingOrders: Math.max(0, prev.pendingOrders + Math.floor(Math.random() * 6) - 3)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'vendor': return <Store className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Time Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome to GetIt Bangladesh Admin Dashboard</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {['today', 'week', 'month', 'year'].map((period) => (
            <Button
              key={period}
              variant={timeFilter === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVendors}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15 new this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +234 new this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Users Now</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold">{stats.systemHealth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `৳${(value / 100000).toFixed(0)}L`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendors and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{vendor.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatCurrency(vendor.sales)}</span>
                      <span>{vendor.orders} orders</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        {vendor.rating}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={vendor.growth > 0 ? "default" : "destructive"}
                    className="ml-2"
                  >
                    {vendor.growth > 0 ? '+' : ''}{vendor.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bangladesh Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Orders by Division
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bangladeshStats.divisions.map((division) => (
                <div key={division.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{division.name}</span>
                  <div className="flex items-center space-x-2 flex-1 mx-4">
                    <Progress value={division.percentage} className="flex-1" />
                    <span className="text-sm text-gray-600 w-12">{division.percentage}%</span>
                  </div>
                  <span className="text-sm text-gray-500">{division.orders}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Festival Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Festival Season Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">{bangladeshStats.festivals.current}</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{bangladeshStats.festivals.impact}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {bangladeshStats.festivals.daysLeft} days remaining
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Smartphone className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm font-medium">Mobile Orders</p>
                  <p className="text-xl font-bold text-yellow-600">78%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Truck className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm font-medium">Express Delivery</p>
                  <p className="text-xl font-bold text-purple-600">65%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardOverview;