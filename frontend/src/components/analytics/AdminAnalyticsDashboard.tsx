import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Activity,
  Eye,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { AdminAnalyticsService } from '@/services/analytics/AdminAnalyticsService';
import { cn } from '@/lib/utils';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  activeUsers: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
  revenue?: number;
  orders?: number;
  users?: number;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * ADMIN ANALYTICS DASHBOARD
 * Amazon.com/Shopee.sg-Level Executive Analytics Interface
 * 
 * Features:
 * - Real-time business metrics and KPIs
 * - Interactive charts and visualizations
 * - Bangladesh market insights
 * - Executive-level reporting
 * - Mobile-responsive design
 * - Export capabilities
 */
export default function AdminAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['admin-analytics-metrics', timeRange],
    queryFn: () => AdminAnalyticsService.getDashboardMetrics(timeRange),
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Fetch sales trends
  const { data: salesTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['admin-analytics-sales-trends', timeRange],
    queryFn: () => AdminAnalyticsService.getSalesTrends(timeRange),
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Fetch revenue breakdown
  const { data: revenueBreakdown, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-analytics-revenue-breakdown', timeRange],
    queryFn: () => AdminAnalyticsService.getRevenueBreakdown(timeRange),
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 30000
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['admin-analytics-alerts'],
    queryFn: () => AdminAnalyticsService.getSystemAlerts(),
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 10000
  });

  // Manual refresh function
  const handleRefresh = () => {
    refetchMetrics();
  };

  // Export dashboard data
  const handleExport = async () => {
    try {
      await AdminAnalyticsService.exportDashboardData(timeRange);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

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

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time business intelligence and performance metrics
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

          {/* Refresh Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={metricsLoading}
            >
              <RefreshCw className={cn("w-4 h-4", metricsLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              System Alerts ({alerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert: AlertItem) => (
              <div key={alert.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                • {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

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
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : (metrics?.activeUsers || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {metrics?.userGrowth && metrics.userGrowth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                metrics?.userGrowth && metrics.userGrowth > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {metrics?.userGrowth ? formatPercentage(metrics.userGrowth) : '0%'}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${(metrics?.conversionRate || 0).toFixed(1)}%`}
            </div>
            <div className="text-xs text-muted-foreground">
              AOV: {formatCurrency(metrics?.averageOrderValue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales & Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesTrends}>
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

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdown?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
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
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <Badge variant={metrics?.revenueGrowth && metrics.revenueGrowth > 0 ? 'default' : 'destructive'}>
                    {formatPercentage(metrics?.revenueGrowth || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Order Growth</span>
                  <Badge variant={metrics?.orderGrowth && metrics.orderGrowth > 0 ? 'default' : 'destructive'}>
                    {formatPercentage(metrics?.orderGrowth || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User Growth</span>
                  <Badge variant={metrics?.userGrowth && metrics.userGrowth > 0 ? 'default' : 'destructive'}>
                    {formatPercentage(metrics?.userGrowth || 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Health</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Alerts</span>
                  <Badge variant={alerts && alerts.length > 0 ? 'destructive' : 'default'}>
                    {alerts?.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Auto Refresh</span>
                  <Badge variant={isAutoRefresh ? 'default' : 'secondary'}>
                    {isAutoRefresh ? 'On' : 'Off'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}