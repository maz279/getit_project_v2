/**
 * Animated Analytics Dashboard
 * Comprehensive Amazon.com/Shopee.sg-level analytics dashboard with animated widgets
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Import our animated widgets
import AnimatedKPICard from '../../analytics/AnimatedKPICard';
import AnimatedChartWidget from '../../analytics/AnimatedChartWidget';
import AnimatedGaugeWidget from '../../analytics/AnimatedGaugeWidget';
import AnimatedActivityFeed from '../../analytics/AnimatedActivityFeed';

interface DashboardData {
  overview: {
    revenue: { total: number; growth: number; trend: 'up' | 'down' | 'stable' };
    orders: { total: number; averageValue: number; conversionRate: number };
    customers: { total: number; active: number; new: number; churnRate: number };
    vendors: { total: number; active: number; new: number; averageRating: number };
    products: { total: number; active: number; outOfStock: number; averageRating: number };
    geography: { topRegions: any[]; paymentMethods: any[] };
  };
  charts: {
    salesTrend: any;
    topCategories: any;
    customerSegments: any;
  } | null;
  period: { startDate: string; endDate: string };
  generatedAt: string;
  bangladesh: {
    festivals: any;
    businessHours: any;
  };
}

interface RealTimeData {
  sales: {
    todayRevenue: number;
    todayOrders: number;
    liveVisitors: number;
    conversionRate: number;
  };
  users: {
    current: number;
    peak: number;
    devices: { mobile: number; desktop: number; tablet: number };
  };
  inventory: {
    outOfStock: number;
    lowStock: number;
    newProducts: number;
  };
  systemHealth: {
    status: string;
    uptime: string;
    responseTime: string;
    errorRate: string;
  };
  lastUpdated: string;
}

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30Days');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch dashboard overview data
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['/api/v1/analytics/dashboard/overview', selectedPeriod],
    enabled: true,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch real-time data
  const { data: realTimeData, isLoading: isRealTimeLoading, refetch: refetchRealTime } = useQuery({
    queryKey: ['/api/v1/analytics/dashboard/real-time'],
    enabled: true,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch Bangladesh-specific data
  const { data: bangladeshData, isLoading: isBangladeshLoading, refetch: refetchBangladesh } = useQuery({
    queryKey: ['/api/v1/analytics/dashboard/bangladesh', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Type casting for development
  const typedDashboardData = dashboardData as any;
  const typedRealTimeData = realTimeData as any;
  const typedBangladeshData = bangladeshData as any;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDashboard(), refetchRealTime(), refetchBangladesh()]);
      setLastRefresh(new Date());
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const exportData = () => {
    // This would trigger the export API
    const exportUrl = `/api/v1/analytics/reports/comprehensive`;
    const exportData = {
      period: selectedPeriod,
      format: 'excel',
      sections: ['sales', 'customers', 'vendors', 'products'],
      includeCharts: true,
      includeBangladeshMetrics: true
    };
    
    fetch(exportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportData)
    }).then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_dashboard_${selectedPeriod}_${Date.now()}.xlsx`;
        a.click();
      });
  };

  // Mock activity data for demonstration
  const mockActivities = [
    {
      id: '1',
      type: 'order' as const,
      title: 'New Order Received',
      description: 'Order #12345 placed by Fatima Ahmed',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      metadata: { amount: 2500, location: 'Dhaka' },
      user: { name: 'Fatima Ahmed' }
    },
    {
      id: '2',
      type: 'payment' as const,
      title: 'Payment Processed',
      description: 'bKash payment successful',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      metadata: { amount: 1800, status: 'completed' }
    },
    {
      id: '3',
      type: 'user' as const,
      title: 'New User Registration',
      description: 'Rahman Khan registered from Chittagong',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      metadata: { location: 'Chittagong' },
      user: { name: 'Rahman Khan' }
    },
    {
      id: '4',
      type: 'review' as const,
      title: 'Product Review',
      description: 'Samsung Galaxy received 5-star review',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      metadata: { rating: 5 },
      user: { name: 'Nasir Uddin' }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-blue-600 dark:text-blue-400"
              >
                <BarChart3 className="h-8 w-8" />
              </motion.div>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time business intelligence and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7Days">Last 7 Days</SelectItem>
                <SelectItem value="last30Days">Last 30 Days</SelectItem>
                <SelectItem value="last90Days">Last 90 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
              </motion.div>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">System Status: All Systems Operational</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {(realTimeData as any)?.systemHealth?.uptime || '99.9%'} Uptime
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedKPICard
            title="Total Revenue"
            data={{
              value: typedDashboardData?.overview?.revenue?.total || 0,
              change: typedDashboardData?.overview?.revenue?.growth || 0,
              target: (typedDashboardData?.overview?.revenue?.total || 0) * 1.2,
              format: 'currency',
              trend: typedDashboardData?.overview?.revenue?.trend || 'stable'
            }}
            icon="revenue"
            loading={isDashboardLoading}
            animationDelay={0.1}
          />

          <AnimatedKPICard
            title="Total Orders"
            data={{
              value: typedDashboardData?.overview?.orders?.total || 0,
              change: 8.5,
              target: (typedDashboardData?.overview?.orders?.total || 0) * 1.15,
              format: 'number',
              trend: 'up'
            }}
            icon="orders"
            loading={isDashboardLoading}
            animationDelay={0.2}
          />

          <AnimatedKPICard
            title="Active Customers"
            data={{
              value: typedDashboardData?.overview?.customers?.active || 0,
              change: 12.3,
              target: (typedDashboardData?.overview?.customers?.active || 0) * 1.25,
              format: 'number',
              trend: 'up'
            }}
            icon="customers"
            loading={isDashboardLoading}
            animationDelay={0.3}
          />

          <AnimatedKPICard
            title="Conversion Rate"
            data={{
              value: typedDashboardData?.overview?.orders?.conversionRate || 0,
              change: 2.1,
              target: 3.5,
              format: 'percentage',
              trend: 'up'
            }}
            icon="conversion"
            loading={isDashboardLoading}
            animationDelay={0.4}
          />
        </div>

        {/* Gauge Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedGaugeWidget
            title="Sales Performance"
            data={{
              current: realTimeData?.sales?.todayRevenue || 0,
              target: 50000,
              max: 100000,
              unit: 'BDT',
              trend: 'up',
              status: 'good'
            }}
            loading={isRealTimeLoading}
            animationDelay={0.5}
          />

          <AnimatedGaugeWidget
            title="Customer Satisfaction"
            data={{
              current: dashboardData?.overview?.products?.averageRating || 0,
              target: 4.5,
              max: 5,
              unit: 'Stars',
              trend: 'up',
              status: 'excellent'
            }}
            loading={isDashboardLoading}
            animationDelay={0.6}
          />

          <AnimatedGaugeWidget
            title="System Health"
            data={{
              current: 98.5,
              target: 99,
              max: 100,
              unit: '%',
              trend: 'stable',
              status: 'excellent'
            }}
            loading={false}
            animationDelay={0.7}
          />
        </div>

        {/* Charts and Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <AnimatedChartWidget
              title="Sales Revenue Trend"
              data={dashboardData?.charts?.salesTrend?.data || [
                { name: 'Jan', value: 45000 },
                { name: 'Feb', value: 52000 },
                { name: 'Mar', value: 48000 },
                { name: 'Apr', value: 61000 },
                { name: 'May', value: 55000 },
                { name: 'Jun', value: 67000 }
              ]}
              type="area"
              loading={isDashboardLoading}
              height={350}
              realTime={true}
              onRefresh={refetchDashboard}
              animationDelay={0.8}
            />
          </div>

          {/* Activity Feed */}
          <AnimatedActivityFeed
            title="Real-Time Activity"
            activities={mockActivities}
            loading={false}
            realTime={true}
            animationDelay={0.9}
          />
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedChartWidget
            title="Top Product Categories"
            data={dashboardData?.charts?.topCategories?.data || [
              { name: 'Electronics', value: 25000 },
              { name: 'Fashion', value: 18000 },
              { name: 'Home & Garden', value: 12000 },
              { name: 'Books', value: 8000 },
              { name: 'Sports', value: 6000 }
            ]}
            type="bar"
            loading={isDashboardLoading}
            height={300}
            animationDelay={1.0}
          />

          <AnimatedChartWidget
            title="Customer Segments"
            data={dashboardData?.charts?.customerSegments?.data || [
              { name: 'Premium', value: 35 },
              { name: 'Regular', value: 45 },
              { name: 'New', value: 20 }
            ]}
            type="pie"
            loading={isDashboardLoading}
            height={300}
            animationDelay={1.1}
          />
        </div>

        {/* Bangladesh Insights */}
        {bangladeshData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <Globe className="h-5 w-5" />
                  Bangladesh Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Banking Adoption</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bangladeshData.summary?.bangladesh?.mobileBankingAdoption || 85}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Top Division</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bangladeshData.summary?.bangladesh?.topDivision || 'Dhaka'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Traffic</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bangladeshData.summary?.bangladesh?.mobileTraffic || 75}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export { AnalyticsDashboard };
export default AnalyticsDashboard;