/**
 * Analytics Management Hub
 * Unified analytics management interface with Amazon.com/Shopee.sg-level features
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  Download,
  Calendar,
  Eye,
  ArrowRight,
  Activity,
  Target,
  DollarSign,
  Gauge
} from 'lucide-react';
import AnimatedKPICard from '../../analytics/AnimatedKPICard';
import AnimatedChartWidget from '../../analytics/AnimatedChartWidget';
import AnimatedActivityFeed from '../../analytics/AnimatedActivityFeed';

interface AnalyticsOverview {
  dashboard: {
    totalRevenue: number;
    totalOrders: number;
    activeCustomers: number;
    systemHealth: number;
  };
  sales: {
    todayRevenue: number;
    revenueGrowth: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    retentionRate: number;
    churnRate: number;
  };
  reports: {
    activeReports: number;
    scheduledReports: number;
    completedToday: number;
    pendingReports: number;
  };
  quickInsights: any[];
}

const AnalyticsManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30Days');

  // Fetch analytics overview data
  const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['/api/v1/analytics/management/overview', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch quick insights
  const { data: insightsData, isLoading: isInsightsLoading } = useQuery({
    queryKey: ['/api/v1/analytics/management/insights', selectedPeriod],
    enabled: true,
    refetchInterval: 600000
  });

  const typedOverviewData = overviewData as any;
  const typedInsightsData = insightsData as any;

  const isLoading = isOverviewLoading || isInsightsLoading;

  // Analytics modules configuration
  const analyticsModules = [
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      description: 'Real-time animated performance dashboard',
      icon: Activity,
      color: 'blue',
      path: '/admin/analytics',
      metrics: {
        primary: typedOverviewData?.dashboard?.totalRevenue || 0,
        primaryLabel: 'Total Revenue',
        secondary: typedOverviewData?.dashboard?.systemHealth || 0,
        secondaryLabel: 'System Health'
      }
    },
    {
      id: 'sales',
      title: 'Sales Analytics',
      description: 'Comprehensive sales performance insights',
      icon: BarChart3,
      color: 'green',
      path: '/admin/analytics/sales',
      metrics: {
        primary: typedOverviewData?.sales?.todayRevenue || 0,
        primaryLabel: 'Today Revenue',
        secondary: typedOverviewData?.sales?.revenueGrowth || 0,
        secondaryLabel: 'Growth Rate'
      }
    },
    {
      id: 'customers',
      title: 'Customer Analytics',
      description: 'Customer behavior and segmentation analysis',
      icon: Users,
      color: 'purple',
      path: '/admin/analytics/customers',
      metrics: {
        primary: typedOverviewData?.customers?.totalCustomers || 0,
        primaryLabel: 'Total Customers',
        secondary: typedOverviewData?.customers?.retentionRate || 0,
        secondaryLabel: 'Retention Rate'
      }
    },
    {
      id: 'reports',
      title: 'Reports Management',
      description: 'Generate and manage analytics reports',
      icon: FileText,
      color: 'orange',
      path: '/admin/analytics/reports',
      metrics: {
        primary: typedOverviewData?.reports?.activeReports || 0,
        primaryLabel: 'Active Reports',
        secondary: typedOverviewData?.reports?.completedToday || 0,
        secondaryLabel: 'Completed Today'
      }
    }
  ];

  // Sample activity data
  const sampleActivities = [
    {
      id: '1',
      type: 'alert' as const,
      title: 'Sales Report Generated',
      description: 'Monthly sales report completed successfully',
      timestamp: new Date(Date.now() - 300000),
      metadata: { status: 'completed' }
    },
    {
      id: '2',
      type: 'user' as const,
      title: 'High-Value Customer Segment',
      description: 'New VIP customer segment identified',
      timestamp: new Date(Date.now() - 600000),
      metadata: { priority: 'high' as const },
      user: { name: 'Analytics System' }
    },
    {
      id: '3',
      type: 'alert' as const,
      title: 'Performance Alert',
      description: 'Revenue target exceeded by 15%',
      timestamp: new Date(Date.now() - 900000),
      metadata: { priority: 'medium' as const }
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

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
              Analytics Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive analytics platform for business intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </motion.div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedKPICard
            title="Total Revenue"
            data={{
              value: typedOverviewData?.dashboard?.totalRevenue || 0,
              change: typedOverviewData?.sales?.revenueGrowth || 0,
              target: (typedOverviewData?.dashboard?.totalRevenue || 0) * 1.2,
              format: 'currency',
              trend: (typedOverviewData?.sales?.revenueGrowth || 0) > 0 ? 'up' : 'down'
            }}
            icon="revenue"
            loading={isLoading}
            animationDelay={0.1}
          />

          <AnimatedKPICard
            title="Active Customers"
            data={{
              value: typedOverviewData?.customers?.totalCustomers || 0,
              change: 8.5,
              target: (typedOverviewData?.customers?.totalCustomers || 0) * 1.1,
              format: 'number',
              trend: 'up'
            }}
            icon="customers"
            loading={isLoading}
            animationDelay={0.2}
          />

          <AnimatedKPICard
            title="System Health"
            data={{
              value: typedOverviewData?.dashboard?.systemHealth || 0,
              change: 2.1,
              target: 95,
              format: 'percentage',
              trend: 'up'
            }}
            icon="performance"
            loading={isLoading}
            animationDelay={0.3}
          />

          <AnimatedKPICard
            title="Active Reports"
            data={{
              value: typedOverviewData?.reports?.activeReports || 0,
              change: 15.3,
              target: (typedOverviewData?.reports?.activeReports || 0) * 1.3,
              format: 'number',
              trend: 'up'
            }}
            icon="reports"
            loading={isLoading}
            animationDelay={0.4}
          />
        </div>

        {/* Analytics Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyticsModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-lg border-2 ${getColorClasses(module.color)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/50 dark:bg-gray-800/50`}>
                        <module.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <p className="text-2xl font-bold">
                        {module.id === 'sales' && module.metrics.primary > 1000 
                          ? `৳${(module.metrics.primary / 1000).toFixed(1)}K`
                          : module.metrics.primary.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {module.metrics.primaryLabel}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <p className="text-2xl font-bold">
                        {module.metrics.secondaryLabel.includes('Rate') || module.metrics.secondaryLabel.includes('Health')
                          ? `${module.metrics.secondary}%`
                          : module.metrics.secondary.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {module.metrics.secondaryLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link to={module.path} className="flex-1">
                      <Button className="w-full" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Open Dashboard
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Insights Chart */}
          <div className="lg:col-span-2">
            <AnimatedChartWidget
              title="Performance Overview"
              data={typedInsightsData?.quickInsights || [
                { name: 'Sales', value: 45000, revenue: 45000 },
                { name: 'Customers', value: 1200, revenue: 35000 },
                { name: 'Orders', value: 890, revenue: 25000 },
                { name: 'Products', value: 450, revenue: 15000 }
              ]}
              type="bar"
              loading={isLoading}
              height={350}
              colors={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']}
              animationDelay={0.2}
            />
          </div>

          {/* Activity Feed */}
          <div>
            <AnimatedActivityFeed
              title="System Activity"
              activities={sampleActivities}
              loading={false}
              maxItems={6}
              showTimestamps={true}
              realTime={true}
              animationDelay={0.3}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used analytics operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/analytics/reports">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Generate Report</span>
                </Button>
              </Link>

              <Link to="/admin/analytics/sales">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Sales Analysis</span>
                </Button>
              </Link>

              <Link to="/admin/analytics/customers">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Customer Insights</span>
                </Button>
              </Link>

              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                  <Gauge className="h-5 w-5" />
                  <span className="text-sm">Live Dashboard</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Analytics</span>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Data Sync</span>
                <Badge variant="default" className="bg-blue-100 text-blue-700">
                  Running
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Query Response Time</span>
                  <span className="font-medium">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Freshness</span>
                  <span className="font-medium">&lt; 1min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bangladesh Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Gateways</span>
                  <span className="font-medium">3 Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Courier Partners</span>
                  <span className="font-medium">5 Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;