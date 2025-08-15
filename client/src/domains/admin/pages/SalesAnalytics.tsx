/**
 * Sales Analytics Dashboard
 * Comprehensive sales analytics with Amazon.com/Shopee.sg-level features
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { DateRangePicker } from '@/shared/ui/date-range-picker';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Target,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import AnimatedChartWidget from '../../analytics/AnimatedChartWidget';
import AnimatedKPICard from '../../analytics/AnimatedKPICard';
import AnimatedGaugeWidget from '../../analytics/AnimatedGaugeWidget';

interface SalesAnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    revenueGrowth: number;
    orderGrowth: number;
  };
  charts: {
    revenueChart: any[];
    orderChart: any[];
    categoryBreakdown: any[];
    vendorPerformance: any[];
  };
  forecasts: {
    nextWeek: any[];
    nextMonth: any[];
  };
  trends: {
    hourlyRevenue: any[];
    peakHours: string[];
    topProducts: any[];
  };
  bangladesh: {
    paymentMethods: any[];
    divisions: any[];
    festivalImpact: any[];
  };
}

const SalesAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30Days');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch sales overview data
  const { data: salesData, isLoading: isSalesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['/api/v1/analytics/sales/overview', selectedPeriod, selectedVendor, selectedCategory],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch sales trends
  const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['/api/v1/analytics/sales/trends', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch forecasts
  const { data: forecastData, isLoading: isForecastLoading } = useQuery({
    queryKey: ['/api/v1/analytics/sales/forecasts', selectedPeriod],
    enabled: true,
    refetchInterval: 600000
  });

  // Fetch Bangladesh-specific metrics
  const { data: bangladeshData, isLoading: isBangladeshLoading } = useQuery({
    queryKey: ['/api/v1/analytics/sales/bangladesh', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Type casting for development
  const typedSalesData = salesData as any;
  const typedTrendsData = trendsData as any;
  const typedForecastData = forecastData as any;
  const typedBangladeshData = bangladeshData as any;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchSales()]);
    setIsRefreshing(false);
  };

  const handleExport = (format: string) => {
    // Export functionality
    console.log(`Exporting sales analytics in ${format} format`);
  };

  const isLoading = isSalesLoading || isTrendsLoading || isForecastLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Sales Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive sales performance and insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7Days">Last 7 Days</SelectItem>
                <SelectItem value="last30Days">Last 30 Days</SelectItem>
                <SelectItem value="last90Days">Last 90 Days</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('excel')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedKPICard
            title="Total Revenue"
            data={{
              value: typedSalesData?.overview?.totalRevenue || 0,
              change: typedSalesData?.overview?.revenueGrowth || 0,
              target: (typedSalesData?.overview?.totalRevenue || 0) * 1.2,
              format: 'currency',
              trend: (typedSalesData?.overview?.revenueGrowth || 0) > 0 ? 'up' : 'down'
            }}
            icon="revenue"
            loading={isLoading}
            animationDelay={0.1}
          />

          <AnimatedKPICard
            title="Total Orders"
            data={{
              value: typedSalesData?.overview?.totalOrders || 0,
              change: typedSalesData?.overview?.orderGrowth || 0,
              target: (typedSalesData?.overview?.totalOrders || 0) * 1.15,
              format: 'number',
              trend: (typedSalesData?.overview?.orderGrowth || 0) > 0 ? 'up' : 'down'
            }}
            icon="orders"
            loading={isLoading}
            animationDelay={0.2}
          />

          <AnimatedKPICard
            title="Average Order Value"
            data={{
              value: typedSalesData?.overview?.averageOrderValue || 0,
              change: 5.2,
              target: (typedSalesData?.overview?.averageOrderValue || 0) * 1.1,
              format: 'currency',
              trend: 'up'
            }}
            icon="value"
            loading={isLoading}
            animationDelay={0.3}
          />

          <AnimatedKPICard
            title="Conversion Rate"
            data={{
              value: typedSalesData?.overview?.conversionRate || 0,
              change: 2.1,
              target: 3.5,
              format: 'percentage',
              trend: 'up'
            }}
            icon="conversion"
            loading={isLoading}
            animationDelay={0.4}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedChartWidget
                title="Revenue Trend"
                data={typedSalesData?.charts?.revenueChart || []}
                type="line"
                loading={isLoading}
                height={300}
                colors={['#3B82F6', '#10B981']}
                animationDelay={0.1}
              />

              <AnimatedChartWidget
                title="Orders by Category"
                data={typedSalesData?.charts?.categoryBreakdown || []}
                type="pie"
                loading={isLoading}
                height={300}
                animationDelay={0.2}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Sales Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Target</span>
                      <Badge variant="secondary">85% Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Quarterly Target</span>
                      <Badge variant="secondary">72% Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Annual Target</span>
                      <Badge variant="secondary">65% Complete</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(typedTrendsData?.topProducts || []).slice(0, 5).map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{product?.name || `Product ${index + 1}`}</span>
                        <span className="text-sm font-medium">
                          ৳{(product?.revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Customer Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Customers</span>
                      <Badge variant="outline">25%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Returning Customers</span>
                      <Badge variant="outline">65%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">VIP Customers</span>
                      <Badge variant="outline">10%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedChartWidget
                title="Hourly Revenue Pattern"
                data={typedTrendsData?.hourlyRevenue || []}
                type="bar"
                loading={isTrendsLoading}
                height={300}
                colors={['#8B5CF6']}
                animationDelay={0.1}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Peak Sales Hours</CardTitle>
                  <CardDescription>Best performing time periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(typedTrendsData?.peakHours || []).map((hour: string, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">{hour}</span>
                        <Badge variant="secondary">Peak</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedChartWidget
                title="Next Week Forecast"
                data={typedForecastData?.nextWeek || []}
                type="line"
                loading={isForecastLoading}
                height={300}
                colors={['#F59E0B', '#10B981']}
                animationDelay={0.1}
              />

              <AnimatedChartWidget
                title="Monthly Forecast"
                data={typedForecastData?.nextMonth || []}
                type="area"
                loading={isForecastLoading}
                height={300}
                colors={['#EF4444', '#3B82F6']}
                animationDelay={0.2}
              />
            </div>
          </TabsContent>

          <TabsContent value="bangladesh" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedChartWidget
                title="Payment Method Preferences"
                data={typedBangladeshData?.paymentMethods || []}
                type="pie"
                loading={isBangladeshLoading}
                height={300}
                animationDelay={0.1}
              />

              <AnimatedChartWidget
                title="Sales by Division"
                data={typedBangladeshData?.divisions || []}
                type="bar"
                loading={isBangladeshLoading}
                height={300}
                colors={['#059669']}
                animationDelay={0.2}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Festival Impact Analysis</CardTitle>
                <CardDescription>Sales performance during Bangladesh festivals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(typedBangladeshData?.festivalImpact || []).map((festival: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{festival?.name || `Festival ${index + 1}`}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Revenue Impact: +{festival?.impact || 0}%
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {festival?.status || 'Completed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimatedGaugeWidget
                title="Sales Performance"
                data={{
                  current: 85,
                  target: 100,
                  max: 100,
                  unit: '%',
                  trend: 'up',
                  status: 'good'
                }}
                loading={isLoading}
                animationDelay={0.1}
              />

              <AnimatedGaugeWidget
                title="Target Achievement"
                data={{
                  current: 72,
                  target: 80,
                  max: 100,
                  unit: '%',
                  trend: 'up',
                  status: 'warning'
                }}
                loading={isLoading}
                animationDelay={0.2}
              />

              <AnimatedGaugeWidget
                title="Customer Satisfaction"
                data={{
                  current: 92,
                  target: 90,
                  max: 100,
                  unit: '%',
                  trend: 'up',
                  status: 'excellent'
                }}
                loading={isLoading}
                animationDelay={0.3}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesAnalytics;