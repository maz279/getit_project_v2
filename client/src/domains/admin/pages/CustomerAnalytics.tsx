/**
 * Customer Analytics Dashboard
 * Comprehensive customer analytics with Amazon.com/Shopee.sg-level features
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
import { 
  Users, 
  UserCheck, 
  UserX, 
  Heart, 
  Star, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  MapPin,
  Download,
  RefreshCw,
  Target,
  Award
} from 'lucide-react';
import AnimatedChartWidget from '../../analytics/AnimatedChartWidget';
import AnimatedKPICard from '../../analytics/AnimatedKPICard';
import AnimatedGaugeWidget from '../../analytics/AnimatedGaugeWidget';
import AnimatedActivityFeed from '../../analytics/AnimatedActivityFeed';

interface CustomerAnalyticsData {
  overview: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    churnRate: number;
    averageLifetimeValue: number;
    retentionRate: number;
    satisfactionScore: number;
  };
  segments: {
    rfm: any[];
    behavioral: any[];
    demographic: any[];
    lifecycle: any[];
  };
  trends: {
    acquisitionTrend: any[];
    retentionTrend: any[];
    valueDistribution: any[];
    engagementMetrics: any[];
  };
  geography: {
    byDivision: any[];
    byCity: any[];
    urbanVsRural: any[];
  };
  loyalty: {
    tierDistribution: any[];
    pointsRedemption: any[];
    repeatPurchases: any[];
  };
  bangladesh: {
    mobileUsage: any[];
    paymentPreferences: any[];
    culturalInsights: any[];
  };
}

const CustomerAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30Days');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch customer overview data
  const { data: customerData, isLoading: isCustomerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ['/api/v1/analytics/customers/overview', selectedPeriod, selectedSegment],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch customer segments
  const { data: segmentsData, isLoading: isSegmentsLoading } = useQuery({
    queryKey: ['/api/v1/analytics/customers/segments', selectedPeriod],
    enabled: true,
    refetchInterval: 600000
  });

  // Fetch customer trends
  const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['/api/v1/analytics/customers/trends', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch geographic data
  const { data: geographyData, isLoading: isGeographyLoading } = useQuery({
    queryKey: ['/api/v1/analytics/customers/geography', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch loyalty data
  const { data: loyaltyData, isLoading: isLoyaltyLoading } = useQuery({
    queryKey: ['/api/v1/analytics/customers/loyalty', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Fetch Bangladesh-specific data
  const { data: bangladeshData, isLoading: isBangladeshLoading } = useQuery({
    queryKey: ['/api/v1/analytics/customers/bangladesh', selectedPeriod],
    enabled: true,
    refetchInterval: 300000
  });

  // Type casting for development
  const typedCustomerData = customerData as any;
  const typedSegmentsData = segmentsData as any;
  const typedTrendsData = trendsData as any;
  const typedGeographyData = geographyData as any;
  const typedLoyaltyData = loyaltyData as any;
  const typedBangladeshData = bangladeshData as any;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchCustomer()]);
    setIsRefreshing(false);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting customer analytics in ${format} format`);
  };

  const isLoading = isCustomerLoading || isSegmentsLoading || isTrendsLoading;

  // Sample activity data for the feed
  const sampleActivities = [
    {
      id: '1',
      type: 'user' as const,
      title: 'New VIP Customer',
      description: 'Fatima Rahman joined VIP tier',
      timestamp: new Date(Date.now() - 300000),
      metadata: { location: 'Dhaka', status: 'active' },
      user: { name: 'Fatima Rahman' }
    },
    {
      id: '2',
      type: 'user' as const,
      title: 'High-Value Purchase',
      description: 'Customer spent ৳25,000 in single order',
      timestamp: new Date(Date.now() - 600000),
      metadata: { amount: 25000, location: 'Chittagong' },
      user: { name: 'Ahmed Khan' }
    },
    {
      id: '3',
      type: 'alert' as const,
      title: 'Churn Risk Alert',
      description: '15 customers at risk of churning',
      timestamp: new Date(Date.now() - 900000),
      metadata: { priority: 'high' as const }
    }
  ];

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
              Customer Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive customer insights and behavior analysis
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
            title="Total Customers"
            data={{
              value: typedCustomerData?.overview?.totalCustomers || 0,
              change: 8.2,
              target: (typedCustomerData?.overview?.totalCustomers || 0) * 1.1,
              format: 'number',
              trend: 'up'
            }}
            icon="customers"
            loading={isLoading}
            animationDelay={0.1}
          />

          <AnimatedKPICard
            title="Active Customers"
            data={{
              value: typedCustomerData?.overview?.activeCustomers || 0,
              change: 5.7,
              target: (typedCustomerData?.overview?.totalCustomers || 0) * 0.8,
              format: 'number',
              trend: 'up'
            }}
            icon="customers"
            loading={isLoading}
            animationDelay={0.2}
          />

          <AnimatedKPICard
            title="Customer Lifetime Value"
            data={{
              value: typedCustomerData?.overview?.averageLifetimeValue || 0,
              change: 12.4,
              target: (typedCustomerData?.overview?.averageLifetimeValue || 0) * 1.2,
              format: 'currency',
              trend: 'up'
            }}
            icon="value"
            loading={isLoading}
            animationDelay={0.3}
          />

          <AnimatedKPICard
            title="Retention Rate"
            data={{
              value: typedCustomerData?.overview?.retentionRate || 0,
              change: -2.1,
              target: 85,
              format: 'percentage',
              trend: 'down'
            }}
            icon="retention"
            loading={isLoading}
            animationDelay={0.4}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="segments">Segments</TabsTrigger>
                <TabsTrigger value="geography">Geography</TabsTrigger>
                <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
                <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedChartWidget
                    title="Customer Acquisition Trend"
                    data={typedTrendsData?.acquisitionTrend || []}
                    type="line"
                    loading={isTrendsLoading}
                    height={300}
                    colors={['#3B82F6', '#10B981']}
                    animationDelay={0.1}
                  />

                  <AnimatedChartWidget
                    title="Customer Value Distribution"
                    data={typedTrendsData?.valueDistribution || []}
                    type="bar"
                    loading={isTrendsLoading}
                    height={300}
                    colors={['#8B5CF6']}
                    animationDelay={0.2}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <AnimatedGaugeWidget
                    title="Customer Satisfaction"
                    data={{
                      current: typedCustomerData?.overview?.satisfactionScore || 0,
                      target: 85,
                      max: 100,
                      unit: '%',
                      trend: 'up',
                      status: 'good'
                    }}
                    loading={isLoading}
                    animationDelay={0.1}
                  />

                  <AnimatedGaugeWidget
                    title="Retention Rate"
                    data={{
                      current: typedCustomerData?.overview?.retentionRate || 0,
                      target: 80,
                      max: 100,
                      unit: '%',
                      trend: 'stable',
                      status: 'warning'
                    }}
                    loading={isLoading}
                    animationDelay={0.2}
                  />

                  <AnimatedGaugeWidget
                    title="Churn Risk"
                    data={{
                      current: typedCustomerData?.overview?.churnRate || 0,
                      target: 5,
                      max: 20,
                      unit: '%',
                      trend: 'down',
                      status: 'good'
                    }}
                    loading={isLoading}
                    animationDelay={0.3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="segments" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedChartWidget
                    title="RFM Segmentation"
                    data={typedSegmentsData?.rfm || []}
                    type="pie"
                    loading={isSegmentsLoading}
                    height={300}
                    animationDelay={0.1}
                  />

                  <AnimatedChartWidget
                    title="Customer Lifecycle"
                    data={typedSegmentsData?.lifecycle || []}
                    type="bar"
                    loading={isSegmentsLoading}
                    height={300}
                    colors={['#F59E0B']}
                    animationDelay={0.2}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Segment Performance</CardTitle>
                    <CardDescription>Key metrics by customer segment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(typedSegmentsData?.behavioral || []).slice(0, 5).map((segment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">{segment?.name || `Segment ${index + 1}`}</h4>
                            <p className="text-sm text-gray-600">{segment?.count || 0} customers</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">৳{(segment?.avgValue || 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Avg. Value</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="geography" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedChartWidget
                    title="Customers by Division"
                    data={typedGeographyData?.byDivision || []}
                    type="bar"
                    loading={isGeographyLoading}
                    height={300}
                    colors={['#059669']}
                    animationDelay={0.1}
                  />

                  <AnimatedChartWidget
                    title="Urban vs Rural"
                    data={typedGeographyData?.urbanVsRural || []}
                    type="pie"
                    loading={isGeographyLoading}
                    height={300}
                    animationDelay={0.2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="loyalty" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedChartWidget
                    title="Loyalty Tier Distribution"
                    data={typedLoyaltyData?.tierDistribution || []}
                    type="pie"
                    loading={isLoyaltyLoading}
                    height={300}
                    animationDelay={0.1}
                  />

                  <AnimatedChartWidget
                    title="Points Redemption Trend"
                    data={typedLoyaltyData?.pointsRedemption || []}
                    type="line"
                    loading={isLoyaltyLoading}
                    height={300}
                    colors={['#DC2626']}
                    animationDelay={0.2}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Loyalty Program Performance</CardTitle>
                    <CardDescription>Key loyalty metrics and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">2,450</p>
                        <p className="text-sm text-gray-600">VIP Members</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">4.7</p>
                        <p className="text-sm text-gray-600">Avg. Rating</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">78%</p>
                        <p className="text-sm text-gray-600">Repeat Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bangladesh" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatedChartWidget
                    title="Mobile Banking Usage"
                    data={typedBangladeshData?.mobileUsage || []}
                    type="pie"
                    loading={isBangladeshLoading}
                    height={300}
                    animationDelay={0.1}
                  />

                  <AnimatedChartWidget
                    title="Payment Preferences"
                    data={typedBangladeshData?.paymentPreferences || []}
                    type="bar"
                    loading={isBangladeshLoading}
                    height={300}
                    colors={['#7C3AED']}
                    animationDelay={0.2}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Cultural Insights</CardTitle>
                    <CardDescription>Bangladesh-specific customer behavior patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(typedBangladeshData?.culturalInsights || []).map((insight: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-semibold">{insight?.title || `Insight ${index + 1}`}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {insight?.description || 'Cultural behavior pattern identified'}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {insight?.category || 'General'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Summary Cards and Activity */}
          <div className="space-y-6">
            {/* Customer Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Customer Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New Customers</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{typedCustomerData?.overview?.newCustomers || 0}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Churn Rate</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{typedCustomerData?.overview?.churnRate || 0}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfaction Score</span>
                  <Badge variant="default">
                    {typedCustomerData?.overview?.satisfactionScore || 0}/100
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Top Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['VIP Customers', 'Frequent Buyers', 'New Customers', 'At Risk'].map((segment, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{segment}</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 1000)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <AnimatedActivityFeed
              title="Customer Activity"
              activities={sampleActivities}
              loading={false}
              maxItems={5}
              showTimestamps={true}
              realTime={true}
              animationDelay={0.3}
            />

            {/* Geographic Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi'].map((city, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{city}</span>
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 30)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;