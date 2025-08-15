
/**
 * SalesOverviewRenderer - Comprehensive Sales Management Dashboard
 * Amazon.com/Shopee.sg-Level Sales Analytics with Bangladesh Market Focus
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, Target,
  Calendar as CalendarIcon, Download, Filter, RefreshCw, Eye, BarChart3,
  Activity, Users, Package, Smartphone, CreditCard, MapPin, Star
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, ComposedChart
} from 'recharts';
import { format, startOfDay, subDays } from 'date-fns';

// Bangladesh market sales data
const dailySalesData = [
  { date: '2024-07-01', revenue: 485000, orders: 189, customers: 167, avgOrderValue: 2567 },
  { date: '2024-07-02', revenue: 523000, orders: 202, customers: 178, avgOrderValue: 2589 },
  { date: '2024-07-03', revenue: 567000, orders: 215, customers: 189, avgOrderValue: 2637 },
  { date: '2024-07-04', revenue: 524000, orders: 194, customers: 171, avgOrderValue: 2701 },
  { date: '2024-07-05', revenue: 689000, orders: 258, customers: 216, avgOrderValue: 2671 },
  { date: '2024-07-06', revenue: 656000, orders: 248, customers: 202, avgOrderValue: 2645 },
  { date: '2024-07-07', revenue: 734000, orders: 285, customers: 243, avgOrderValue: 2575 }
];

const monthlySalesData = [
  { month: 'Jan', revenue: 14200000, orders: 5340, growth: 12.5, forecast: 15400000, target: 15000000 },
  { month: 'Feb', revenue: 12890000, orders: 4900, growth: -9.2, forecast: 14100000, target: 14500000 },
  { month: 'Mar', revenue: 18800000, orders: 6680, growth: 45.8, forecast: 19200000, target: 17000000 },
  { month: 'Apr', revenue: 19450000, orders: 6890, growth: 3.5, forecast: 20100000, target: 19000000 },
  { month: 'May', revenue: 22800000, orders: 7800, growth: 17.2, forecast: 23900000, target: 21000000 },
  { month: 'Jun', revenue: 20200000, orders: 6950, growth: -11.4, forecast: 22500000, target: 22000000 },
  { month: 'Jul', revenue: 22650000, orders: 7800, growth: 12.1, forecast: 24800000, target: 23000000 }
];

const paymentMethodData = [
  { method: 'bKash', amount: 10800000, percentage: 45, transactions: 3250, color: '#E91E63' },
  { method: 'Nagad', amount: 6000000, percentage: 25, transactions: 1890, color: '#FF9800' },
  { method: 'Rocket', amount: 3840000, percentage: 16, transactions: 1240, color: '#9C27B0' },
  { method: 'Cash on Delivery', amount: 2400000, percentage: 10, transactions: 890, color: '#4CAF50' },
  { method: 'Card Payment', amount: 960000, percentage: 4, transactions: 320, color: '#2196F3' }
];

const topSellingCategories = [
  { category: 'Electronics', sales: 8500000, percentage: 85, orders: 2340, growth: 23.5, color: 'bg-blue-500' },
  { category: 'Fashion & Beauty', sales: 6800000, percentage: 72, orders: 1890, growth: 18.2, color: 'bg-green-500' },
  { category: 'Home & Kitchen', sales: 4200000, percentage: 58, orders: 1456, growth: 12.8, color: 'bg-purple-500' },
  { category: 'Sports & Outdoor', sales: 2890000, percentage: 45, orders: 982, growth: 31.5, color: 'bg-orange-500' },
  { category: 'Books & Education', sales: 1650000, percentage: 32, orders: 567, growth: -5.2, color: 'bg-red-500' }
];

const hourlyPattern = [
  { hour: '00:00', orders: 12, revenue: 45000, activeUsers: 89 },
  { hour: '03:00', orders: 8, revenue: 28000, activeUsers: 45 },
  { hour: '06:00', orders: 28, revenue: 89000, activeUsers: 234 },
  { hour: '09:00', orders: 85, revenue: 267000, activeUsers: 567 },
  { hour: '12:00', orders: 128, revenue: 415000, activeUsers: 789 },
  { hour: '15:00', orders: 156, revenue: 532000, activeUsers: 892 },
  { hour: '18:00', orders: 195, revenue: 685000, activeUsers: 1234 },
  { hour: '21:00', orders: 168, revenue: 545000, activeUsers: 987 },
  { hour: '23:00', orders: 96, revenue: 282000, activeUsers: 456 }
];

const bangladeshRegionalData = [
  { division: 'Dhaka', sales: 12500000, percentage: 52, orders: 4250, growth: 15.2 },
  { division: 'Chittagong', sales: 5890000, percentage: 25, orders: 1890, growth: 12.8 },
  { division: 'Sylhet', sales: 2340000, percentage: 10, orders: 789, growth: 23.5 },
  { division: 'Khulna', sales: 1560000, percentage: 6, orders: 456, growth: 8.7 },
  { division: 'Rajshahi', sales: 890000, percentage: 4, orders: 234, growth: 18.3 },
  { division: 'Others', sales: 820000, percentage: 3, orders: 181, growth: 6.5 }
];

const festivalImpactData = [
  { festival: 'Eid ul-Fitr', impact: '+285%', duration: '7 days', revenue: 18500000, status: 'upcoming' },
  { festival: 'Pohela Boishakh', impact: '+165%', duration: '3 days', revenue: 8900000, status: 'completed' },
  { festival: 'Durga Puja', impact: '+142%', duration: '5 days', revenue: 12400000, status: 'upcoming' },
  { festival: 'Independence Day', impact: '+89%', duration: '2 days', revenue: 4560000, status: 'completed' }
];

export const SalesOverviewRenderer: React.FC = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    liveOrders: 1247,
    activeUsers: 3456,
    revenueToday: 734000,
    conversionRate: 3.8
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate real-time data update
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRealTimeData(prev => ({
      ...prev,
      liveOrders: prev.liveOrders + Math.floor(Math.random() * 10) - 5,
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
      revenueToday: prev.revenueToday + Math.floor(Math.random() * 5000) - 2500
    }));
    setRefreshing(false);
  };

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        liveOrders: Math.max(0, prev.liveOrders + Math.floor(Math.random() * 6) - 3),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 20) - 10)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (growth: number) => {
    return growth > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales analytics with Bangladesh market insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Today's Revenue
              <DollarSign className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realTimeData.revenueToday)}</div>
            <div className="flex items-center text-xs opacity-90 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +26.8% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Live Orders
              <ShoppingCart className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(realTimeData.liveOrders)}</div>
            <div className="flex items-center text-xs opacity-90 mt-1">
              <Activity className="h-3 w-3 mr-1" />
              Real-time updates
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Active Users
              <Users className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(realTimeData.activeUsers)}</div>
            <div className="flex items-center text-xs opacity-90 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.3% peak hour traffic
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Conversion Rate
              <Target className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData.conversionRate}%</div>
            <div className="flex items-center text-xs opacity-90 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.2% optimization needed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Tabs System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="festivals">Festivals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis tickFormatter={(value) => `৳${(value / 100000).toFixed(0)}L`} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#1677ff" fill="#1677ff20" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Sales Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={hourlyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${value}`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'orders' ? `${value} orders` : formatCurrency(Number(value)),
                        name === 'orders' ? 'Orders' : 'Revenue'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="orders" fill="#1677ff" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Categories Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSellingCategories.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.category}</span>
                        <Badge variant={item.growth > 0 ? "default" : "destructive"} className="text-xs">
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatCurrency(item.sales)}</span>
                        <span className="text-xs text-gray-500 ml-2">({formatNumber(item.orders)} orders)</span>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend & Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `৳${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'revenue' ? 'Actual Revenue' : 
                      name === 'forecast' ? 'Forecasted Revenue' : 'Target'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1677ff" name="Actual Revenue" />
                  <Line type="monotone" dataKey="forecast" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                  <Line type="monotone" dataKey="target" stroke="#00ff00" strokeWidth={2} strokeDasharray="2 2" name="Target" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      dataKey="amount"
                      label={({ method, percentage }) => `${method}: ${percentage}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: method.color }} />
                        <div>
                          <p className="font-medium">{method.method}</p>
                          <p className="text-sm text-gray-500">{formatNumber(method.transactions)} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(method.amount)}</p>
                        <p className="text-sm text-gray-500">{method.percentage}% share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Bangladesh Regional Sales Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {bangladeshRegionalData.map((region) => (
                    <div key={region.division} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{region.division}</h4>
                        <p className="text-sm text-gray-500">{formatNumber(region.orders)} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(region.sales)}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{region.percentage}%</span>
                          <Badge variant={region.growth > 10 ? "default" : "secondary"} className="text-xs">
                            +{region.growth}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={bangladeshRegionalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="division" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `৳${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="sales" fill="#1677ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Festivals Tab */}
        <TabsContent value="festivals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Bangladesh Festival Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {festivalImpactData.map((festival) => (
                  <div 
                    key={festival.festival} 
                    className={`p-6 rounded-lg border-2 ${
                      festival.status === 'upcoming' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">{festival.festival}</h3>
                      <Badge variant={festival.status === 'upcoming' ? "default" : "secondary"}>
                        {festival.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sales Impact:</span>
                        <span className="text-2xl font-bold text-green-600">{festival.impact}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{festival.duration}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue Generated:</span>
                        <span className="font-bold">{formatCurrency(festival.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
