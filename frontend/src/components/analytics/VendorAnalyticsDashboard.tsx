import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Star,
  Users,
  Eye,
  Target,
  Award,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { VendorAnalyticsService } from '@/services/analytics/VendorAnalyticsService';
import { cn } from '@/lib/utils';

interface VendorMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  conversionRate: number;
  averageOrderValue: number;
  customerRating: number;
  revenueGrowth: number;
  orderGrowth: number;
  viewGrowth: number;
  commissionEarned: number;
  pendingPayouts: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
  rating: number;
  stock: number;
}

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * VENDOR ANALYTICS DASHBOARD
 * Amazon.com/Shopee.sg-Level Vendor Performance Interface
 * 
 * Features:
 * - Comprehensive vendor performance metrics
 * - Product performance tracking
 * - Sales and revenue analytics
 * - Customer feedback and ratings
 * - Bangladesh market insights
 * - Commission and payout tracking
 * - Mobile-responsive design
 */
export default function VendorAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Fetch vendor metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['vendor-analytics-metrics', timeRange],
    queryFn: () => VendorAnalyticsService.getVendorMetrics(timeRange),
    refetchInterval: isAutoRefresh ? 30000 : false,
    staleTime: 30000
  });

  // Fetch sales data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['vendor-analytics-sales', timeRange],
    queryFn: () => VendorAnalyticsService.getSalesData(timeRange),
    refetchInterval: isAutoRefresh ? 30000 : false,
    staleTime: 30000
  });

  // Fetch product performance
  const { data: productPerformance, isLoading: productLoading } = useQuery({
    queryKey: ['vendor-analytics-products', timeRange],
    queryFn: () => VendorAnalyticsService.getProductPerformance(timeRange),
    refetchInterval: isAutoRefresh ? 30000 : false,
    staleTime: 30000
  });

  // Fetch category performance
  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['vendor-analytics-categories', timeRange],
    queryFn: () => VendorAnalyticsService.getCategoryPerformance(timeRange),
    refetchInterval: isAutoRefresh ? 30000 : false,
    staleTime: 30000
  });

  // Format currency for Bangladesh market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Calculate performance score
  const calculatePerformanceScore = (metrics: VendorMetrics) => {
    if (!metrics) return 0;
    const revenueScore = Math.min((metrics.revenueGrowth / 20) * 25, 25);
    const ratingScore = (metrics.customerRating / 5) * 25;
    const conversionScore = Math.min((metrics.conversionRate / 5) * 25, 25);
    const growthScore = Math.min((metrics.orderGrowth / 15) * 25, 25);
    return Math.round(revenueScore + ratingScore + conversionScore + growthScore);
  };

  const performanceScore = calculatePerformanceScore(metrics);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendor Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your store performance and optimize your sales
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30d
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90d
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Store Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-2xl font-bold text-blue-600">{performanceScore}/100</span>
              </div>
              <Progress value={performanceScore} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {performanceScore >= 80 ? 'Excellent' : 
                 performanceScore >= 60 ? 'Good' : 
                 performanceScore >= 40 ? 'Average' : 'Needs Improvement'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Based on sales, ratings, and growth
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {metrics?.revenueGrowth && metrics.revenueGrowth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                metrics?.revenueGrowth && metrics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {metrics?.revenueGrowth ? formatPercentage(metrics.revenueGrowth) : '0%'}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : (metrics?.totalOrders || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {metrics?.orderGrowth && metrics.orderGrowth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                metrics?.orderGrowth && metrics.orderGrowth > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {metrics?.orderGrowth ? formatPercentage(metrics.orderGrowth) : '0%'}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : (metrics?.totalViews || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {metrics?.viewGrowth && metrics.viewGrowth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                metrics?.viewGrowth && metrics.viewGrowth > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {metrics?.viewGrowth ? formatPercentage(metrics.viewGrowth) : '0%'}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${(metrics?.customerRating || 0).toFixed(1)}/5`}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(metrics?.customerRating || 0) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="orders" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {categoryPerformance?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <Badge variant="secondary">{(metrics?.conversionRate || 0).toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Order Value</span>
                  <Badge variant="secondary">{formatCurrency(metrics?.averageOrderValue || 0)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Products</span>
                  <Badge variant="secondary">{(metrics?.totalProducts || 0).toLocaleString()}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission & Payouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Commission Earned</span>
                  <Badge variant="default">{formatCurrency(metrics?.commissionEarned || 0)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Payouts</span>
                  <Badge variant="outline">{formatCurrency(metrics?.pendingPayouts || 0)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Next Payout</span>
                  <Badge variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    7 days
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Product Listing Quality</span>
                  <Badge variant="default">Good</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <Badge variant="default">Excellent</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Order Fulfillment</span>
                  <Badge variant="default">On Time</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance?.slice(0, 10).map((product: ProductPerformance, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{product.views.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{product.conversionRate.toFixed(1)}% conversion</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Revenue Growth</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your revenue has increased by {formatPercentage(metrics?.revenueGrowth || 0)} compared to last period.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100">Customer Satisfaction</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your customer rating of {(metrics?.customerRating || 0).toFixed(1)}/5 is above average.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Optimize Product Listings</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Add more high-quality images and detailed descriptions to increase conversion rates.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Expand Product Range</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Consider adding more products in your top-performing categories.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}