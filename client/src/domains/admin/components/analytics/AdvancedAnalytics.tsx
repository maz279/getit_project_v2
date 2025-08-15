import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Eye,
  Clock,
  Globe,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    conversionGrowth: number;
  };
  sales: {
    daily: Array<{ date: string; revenue: number; orders: number; }>;
    categories: Array<{ name: string; revenue: number; percentage: number; }>;
    topProducts: Array<{ name: string; sales: number; revenue: number; }>;
  };
  customers: {
    segments: Array<{ name: string; count: number; percentage: number; }>;
    geography: Array<{ location: string; customers: number; revenue: number; }>;
    retention: Array<{ month: string; rate: number; }>;
  };
  traffic: {
    sources: Array<{ source: string; visitors: number; percentage: number; }>;
    devices: Array<{ device: string; sessions: number; percentage: number; }>;
    pageViews: Array<{ page: string; views: number; bounceRate: number; }>;
  };
}

export const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data - in real app, this would come from API
  const analyticsData: AnalyticsData = {
    overview: {
      totalRevenue: 2456780,
      totalOrders: 8543,
      totalCustomers: 12456,
      conversionRate: 3.2,
      revenueGrowth: 15.3,
      orderGrowth: 12.8,
      customerGrowth: 8.5,
      conversionGrowth: 2.1
    },
    sales: {
      daily: [
        { date: '2024-07-01', revenue: 45000, orders: 156 },
        { date: '2024-07-02', revenue: 52000, orders: 178 },
        { date: '2024-07-03', revenue: 38000, orders: 145 },
        { date: '2024-07-04', revenue: 61000, orders: 203 },
        { date: '2024-07-05', revenue: 49000, orders: 167 },
        { date: '2024-07-06', revenue: 54000, orders: 189 },
        { date: '2024-07-07', revenue: 47000, orders: 162 }
      ],
      categories: [
        { name: 'Electronics', revenue: 890000, percentage: 36.2 },
        { name: 'Fashion', revenue: 654000, percentage: 26.6 },
        { name: 'Home & Garden', revenue: 432000, percentage: 17.6 },
        { name: 'Books', revenue: 298000, percentage: 12.1 },
        { name: 'Sports', revenue: 182780, percentage: 7.5 }
      ],
      topProducts: [
        { name: 'Smartphone Pro Max', sales: 1250, revenue: 187500 },
        { name: 'Wireless Headphones', sales: 2100, revenue: 126000 },
        { name: 'Cotton T-Shirt', sales: 3200, revenue: 96000 },
        { name: 'Gaming Laptop', sales: 450, revenue: 135000 },
        { name: 'Smart Watch', sales: 880, revenue: 105600 }
      ]
    },
    customers: {
      segments: [
        { name: 'New Customers', count: 3456, percentage: 27.8 },
        { name: 'Returning Customers', count: 5432, percentage: 43.6 },
        { name: 'VIP Customers', count: 2345, percentage: 18.8 },
        { name: 'Inactive Customers', count: 1223, percentage: 9.8 }
      ],
      geography: [
        { location: 'Dhaka', customers: 4567, revenue: 1234567 },
        { location: 'Chittagong', customers: 2345, revenue: 654321 },
        { location: 'Sylhet', customers: 1234, revenue: 345678 },
        { location: 'Khulna', customers: 1123, revenue: 298765 },
        { location: 'Rajshahi', customers: 987, revenue: 234567 }
      ],
      retention: [
        { month: 'Jan', rate: 85.2 },
        { month: 'Feb', rate: 87.1 },
        { month: 'Mar', rate: 89.3 },
        { month: 'Apr', rate: 86.7 },
        { month: 'May', rate: 88.9 },
        { month: 'Jun', rate: 90.1 },
        { month: 'Jul', rate: 91.4 }
      ]
    },
    traffic: {
      sources: [
        { source: 'Direct', visitors: 45600, percentage: 38.2 },
        { source: 'Google', visitors: 32400, percentage: 27.1 },
        { source: 'Facebook', visitors: 18900, percentage: 15.8 },
        { source: 'Instagram', visitors: 12300, percentage: 10.3 },
        { source: 'YouTube', visitors: 10200, percentage: 8.6 }
      ],
      devices: [
        { device: 'Mobile', sessions: 67800, percentage: 56.8 },
        { device: 'Desktop', sessions: 38900, percentage: 32.6 },
        { device: 'Tablet', sessions: 12600, percentage: 10.6 }
      ],
      pageViews: [
        { page: '/products', views: 123456, bounceRate: 35.2 },
        { page: '/categories', views: 89012, bounceRate: 42.1 },
        { page: '/checkout', views: 67890, bounceRate: 28.9 },
        { page: '/cart', views: 54321, bounceRate: 31.5 },
        { page: '/profile', views: 43210, bounceRate: 25.8 }
      ]
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number, showSign: boolean = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const GrowthIndicator = ({ value, label }: { value: number; label: string }) => (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        <span className="text-sm font-medium">{formatPercentage(value)}</span>
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Traffic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
                <GrowthIndicator value={analyticsData.overview.revenueGrowth} label="vs last month" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</div>
                <GrowthIndicator value={analyticsData.overview.orderGrowth} label="vs last month" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalCustomers.toLocaleString()}</div>
                <GrowthIndicator value={analyticsData.overview.customerGrowth} label="vs last month" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
                <GrowthIndicator value={analyticsData.overview.conversionGrowth} label="vs last month" />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Revenue chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.sales.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" style={{ 
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                        }} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(category.revenue)}</div>
                        <div className="text-xs text-gray-600">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.sales.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Daily sales and order metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Sales performance chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Customer distribution by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.customers.segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full" style={{ 
                          backgroundColor: `hsl(${index * 90}, 60%, 50%)` 
                        }} />
                        <span className="text-sm font-medium">{segment.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{segment.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{segment.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Customers by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.customers.geography.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{location.location}</p>
                        <p className="text-sm text-gray-600">{location.customers} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(location.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Visitor sources and channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.traffic.sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" style={{ 
                          backgroundColor: `hsl(${index * 45}, 65%, 55%)` 
                        }} />
                        <span className="text-sm font-medium">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{source.visitors.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{source.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>Sessions by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Device usage chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};