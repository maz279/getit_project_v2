import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  TrendingUp,
  Star,
  Package,
  CreditCard,
  Gift,
  Award,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { CustomerAnalyticsService } from '@/services/analytics/CustomerAnalyticsService';
import { cn } from '@/lib/utils';

interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  totalSavings: number;
  loyaltyPoints: number;
  wishlistItems: number;
  totalReviews: number;
  customerSince: string;
  membershipTier: string;
  nextReward: string;
}

interface OrderHistory {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
}

interface RecentActivity {
  type: string;
  description: string;
  date: string;
  amount?: number;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * CUSTOMER ANALYTICS DASHBOARD
 * Amazon.com/Shopee.sg-Level Customer Experience Interface
 * 
 * Features:
 * - Personal shopping analytics and insights
 * - Order history and spending patterns
 * - Rewards and loyalty program tracking
 * - Wishlist and recommendation analytics
 * - Bangladesh market personalization
 * - Cultural event savings tracking
 * - Mobile-optimized interface
 */
export default function CustomerAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch customer metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['customer-analytics-metrics', timeRange],
    queryFn: () => CustomerAnalyticsService.getCustomerMetrics(timeRange),
    staleTime: 60000
  });

  // Fetch order history
  const { data: orderHistory, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-analytics-orders', timeRange],
    queryFn: () => CustomerAnalyticsService.getOrderHistory(timeRange),
    staleTime: 60000
  });

  // Fetch spending patterns
  const { data: spendingPatterns, isLoading: spendingLoading } = useQuery({
    queryKey: ['customer-analytics-spending', timeRange],
    queryFn: () => CustomerAnalyticsService.getSpendingPatterns(timeRange),
    staleTime: 60000
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['customer-analytics-activity'],
    queryFn: () => CustomerAnalyticsService.getRecentActivity(),
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

  // Calculate membership progress
  const calculateMembershipProgress = (currentTier: string, totalSpent: number) => {
    const tiers = {
      'Bronze': { min: 0, max: 10000, next: 'Silver' },
      'Silver': { min: 10000, max: 50000, next: 'Gold' },
      'Gold': { min: 50000, max: 100000, next: 'Platinum' },
      'Platinum': { min: 100000, max: Infinity, next: 'Diamond' }
    };

    const current = tiers[currentTier as keyof typeof tiers];
    if (!current) return { progress: 0, nextTier: 'Bronze', amountNeeded: 0 };

    const progress = current.max === Infinity ? 100 : ((totalSpent - current.min) / (current.max - current.min)) * 100;
    const amountNeeded = current.max === Infinity ? 0 : current.max - totalSpent;

    return { progress, nextTier: current.next, amountNeeded };
  };

  const membershipProgress = calculateMembershipProgress(metrics?.membershipTier || 'Bronze', metrics?.totalSpent || 0);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Shopping Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your shopping journey and discover new savings opportunities
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30 days
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90 days
            </Button>
            <Button
              variant={timeRange === '365d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('365d')}
            >
              1 year
            </Button>
          </div>
        </div>
      </div>

      {/* Membership Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {metrics?.membershipTier || 'Bronze'} Member
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Member since {metrics?.customerSince ? new Date(metrics.customerSince).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {metrics?.loyaltyPoints || 0} Points
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Next reward: {metrics?.nextReward || 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress to {membershipProgress.nextTier}</span>
              <span>{membershipProgress.progress.toFixed(0)}%</span>
            </div>
            <Progress value={membershipProgress.progress} className="h-2" />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {membershipProgress.amountNeeded > 0 && (
                `Spend ${formatCurrency(membershipProgress.amountNeeded)} more to reach ${membershipProgress.nextTier}`
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : (metrics?.totalOrders || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average: {formatCurrency(metrics?.averageOrderValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricsLoading ? '...' : formatCurrency(metrics?.totalSavings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From deals and discounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : (metrics?.wishlistItems || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Items you're watching
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingPatterns}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {spendingPatterns?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.slice(0, 8).map((activity: RecentActivity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.description}</p>
                      {activity.amount && (
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderHistory?.slice(0, 5).map((order: OrderHistory) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items} items • {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shopping Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Most Shopped Category</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {spendingPatterns?.[0]?.category || 'Electronics'} - {spendingPatterns?.[0]?.percentage.toFixed(1) || '0'}% of spending
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100">Best Shopping Day</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Friday - You save 15% more on average
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Upcoming Festival</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Eid sale coming up - Save up to 70% on your favorite items
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Price Drop Alert</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                3 items in your wishlist are now on sale
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Available Points</span>
              <Badge variant="default">{metrics?.loyaltyPoints || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Next Reward</span>
              <Badge variant="outline">{metrics?.nextReward || 'N/A'}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Free Shipping</span>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}