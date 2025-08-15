import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Star, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  Clock, 
  MapPin,
  Calendar,
  Eye,
  Target,
  Award,
  Gift,
  CreditCard,
  Truck,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * CUSTOMER ANALYTICS DASHBOARD
 * Amazon.com/Shopee.sg-Level Customer Shopping Insights
 * 
 * Features:
 * - Personal shopping analytics and insights
 * - Purchase history analysis
 * - Savings and loyalty tracking
 * - Product recommendations based on behavior
 * - Bangladesh market preferences
 * - Spending patterns and budgeting
 * - Wishlist and cart analytics
 * - Personalized shopping goals
 */

interface CustomerInsights {
  customerId: string;
  customerName: string;
  memberSince: Date;
  customerTier: string; // bronze, silver, gold, platinum
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lifetimeValue: number;
  loyaltyPoints: number;
  totalSavings: number;
  favoriteCategories: Array<{
    category: string;
    purchaseCount: number;
    totalSpent: number;
    percentage: number;
  }>;
  recentPurchases: Array<{
    orderId: string;
    date: Date;
    amount: number;
    items: number;
    status: string;
    vendor: string;
  }>;
  spendingTrend: Array<{
    month: string;
    spending: number;
    orders: number;
    savings: number;
  }>;
  wishlistItems: Array<{
    productId: string;
    productName: string;
    currentPrice: number;
    originalPrice: number;
    discount: number;
    vendor: string;
    inStock: boolean;
  }>;
  recommendations: Array<{
    productId: string;
    productName: string;
    price: number;
    rating: number;
    reason: string;
    category: string;
    vendor: string;
    image?: string;
  }>;
  paymentMethodUsage: Array<{
    method: string;
    usage: number;
    amount: number;
    percentage: number;
  }>;
  deliveryPreferences: {
    preferredCourier: string;
    averageDeliveryTime: number;
    deliverySuccessRate: number;
    codUsage: number;
  };
  shoppingGoals: Array<{
    goalId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    category: string;
    progress: number;
  }>;
  behaviorInsights: {
    averageSessionDuration: number;
    pagesPerSession: number;
    conversionRate: number;
    abandonedCarts: number;
    reviewsWritten: number;
    helpfulVotes: number;
  };
  regionalInsights: {
    region: string;
    localPopularCategories: Array<{ category: string; popularity: number }>;
    regionalOffers: Array<{ title: string; discount: number; validUntil: Date }>;
    nearbyStores: number;
  };
  seasonalInsights: {
    festivalSpending: Array<{ festival: string; spending: number; year: number }>;
    seasonalCategories: Array<{ season: string; categories: string[] }>;
    upcomingFestivals: Array<{ name: string; date: Date; expectedDiscount: number }>;
  };
}

interface CustomerAnalyticsDashboardProps {
  customerId: string;
  timeRange?: string;
}

export const CustomerAnalyticsDashboard: React.FC<CustomerAnalyticsDashboardProps> = ({
  customerId,
  timeRange = '12m'
}) => {
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch customer insights data
  const fetchCustomerInsights = useCallback(async () => {
    try {
      setLoading(true);
      
      // In real implementation, this would call the customer analytics API
      const response = await fetch(`/api/v1/analytics/customer/${customerId}?timeRange=${selectedTimeRange}&category=${selectedCategory}`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomerInsights(data);
        setLastUpdated(new Date());
      } else {
        // Fallback to demo data for development
        setCustomerInsights(generateDemoCustomerInsights());
        setLastUpdated(new Date());
      }
      
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      // Use demo data in case of API failure
      setCustomerInsights(generateDemoCustomerInsights());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [customerId, selectedTimeRange, selectedCategory]);

  // Generate demo data for development
  const generateDemoCustomerInsights = (): CustomerInsights => {
    return {
      customerId: customerId,
      customerName: "Ahmed Rahman",
      memberSince: new Date('2022-03-15'),
      customerTier: "gold",
      totalSpent: 145000,
      totalOrders: 47,
      averageOrderValue: 3085,
      lifetimeValue: 145000,
      loyaltyPoints: 2890,
      totalSavings: 15670,
      favoriteCategories: [
        { category: 'Electronics', purchaseCount: 15, totalSpent: 67000, percentage: 46.2 },
        { category: 'Fashion', purchaseCount: 12, totalSpent: 34000, percentage: 23.4 },
        { category: 'Books', purchaseCount: 8, totalSpent: 12000, percentage: 8.3 },
        { category: 'Home & Garden', purchaseCount: 7, totalSpent: 18000, percentage: 12.4 },
        { category: 'Sports', purchaseCount: 5, totalSpent: 14000, percentage: 9.7 }
      ],
      recentPurchases: [
        { orderId: 'ORD-001', date: new Date(), amount: 8500, items: 2, status: 'Delivered', vendor: 'TechMart BD' },
        { orderId: 'ORD-002', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), amount: 12500, items: 1, status: 'Shipped', vendor: 'Elite Electronics' },
        { orderId: 'ORD-003', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), amount: 3500, items: 3, status: 'Delivered', vendor: 'Fashion House' },
        { orderId: 'ORD-004', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amount: 6700, items: 1, status: 'Delivered', vendor: 'BookStore BD' },
        { orderId: 'ORD-005', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), amount: 4200, items: 2, status: 'Delivered', vendor: 'Home Essentials' }
      ],
      spendingTrend: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        spending: Math.floor(Math.random() * 15000) + 8000,
        orders: Math.floor(Math.random() * 8) + 2,
        savings: Math.floor(Math.random() * 2000) + 500
      })),
      wishlistItems: [
        { productId: '1', productName: 'MacBook Pro M3', currentPrice: 185000, originalPrice: 195000, discount: 5.1, vendor: 'Apple Store BD', inStock: true },
        { productId: '2', productName: 'Sony WH-1000XM5', currentPrice: 35000, originalPrice: 38000, discount: 7.9, vendor: 'Audio World', inStock: true },
        { productId: '3', productName: 'Nike Air Max 270', currentPrice: 12000, originalPrice: 15000, discount: 20.0, vendor: 'Sports Zone', inStock: false },
        { productId: '4', productName: 'Samsung 55" QLED TV', currentPrice: 95000, originalPrice: 105000, discount: 9.5, vendor: 'Electronics Hub', inStock: true },
        { productId: '5', productName: 'Adidas Ultraboost 22', currentPrice: 18000, originalPrice: 22000, discount: 18.2, vendor: 'Footwear Plus', inStock: true }
      ],
      recommendations: [
        { productId: '1', productName: 'iPhone 15 Pro', price: 125000, rating: 4.8, reason: 'Based on your electronics purchases', category: 'Electronics', vendor: 'Mobile World' },
        { productId: '2', productName: 'Uniqlo T-Shirt', price: 1500, rating: 4.6, reason: 'Popular in your area', category: 'Fashion', vendor: 'Fashion Hub' },
        { productId: '3', productName: 'Atomic Habits Book', price: 800, rating: 4.9, reason: 'Similar buyers also purchased', category: 'Books', vendor: 'BookStore BD' },
        { productId: '4', productName: 'Philips Air Fryer', price: 8500, rating: 4.7, reason: 'Trending in home appliances', category: 'Home & Kitchen', vendor: 'Home Essentials' }
      ],
      paymentMethodUsage: [
        { method: 'bKash', usage: 18, amount: 65400, percentage: 45.1 },
        { method: 'Nagad', usage: 12, amount: 43500, percentage: 30.0 },
        { method: 'COD', usage: 10, amount: 22000, percentage: 15.2 },
        { method: 'Rocket', usage: 5, amount: 10100, percentage: 7.0 },
        { method: 'Card', usage: 2, amount: 4000, percentage: 2.7 }
      ],
      deliveryPreferences: {
        preferredCourier: 'Pathao',
        averageDeliveryTime: 2.3,
        deliverySuccessRate: 96.5,
        codUsage: 21.3
      },
      shoppingGoals: [
        { goalId: '1', title: 'New Laptop Fund', targetAmount: 150000, currentAmount: 89000, targetDate: new Date('2025-12-31'), category: 'Electronics', progress: 59.3 },
        { goalId: '2', title: 'Eid Shopping Budget', targetAmount: 25000, currentAmount: 18500, targetDate: new Date('2025-08-15'), category: 'Fashion', progress: 74.0 },
        { goalId: '3', title: 'Home Renovation', targetAmount: 80000, currentAmount: 23000, targetDate: new Date('2026-06-30'), category: 'Home & Garden', progress: 28.7 }
      ],
      behaviorInsights: {
        averageSessionDuration: 8.5,
        pagesPerSession: 12.3,
        conversionRate: 3.8,
        abandonedCarts: 6,
        reviewsWritten: 23,
        helpfulVotes: 156
      },
      regionalInsights: {
        region: 'Dhaka',
        localPopularCategories: [
          { category: 'Electronics', popularity: 78 },
          { category: 'Fashion', popularity: 65 },
          { category: 'Food & Beverage', popularity: 58 }
        ],
        regionalOffers: [
          { title: 'Dhaka Express Delivery', discount: 15, validUntil: new Date('2025-07-31') },
          { title: 'Local Vendor Special', discount: 10, validUntil: new Date('2025-08-15') }
        ],
        nearbyStores: 47
      },
      seasonalInsights: {
        festivalSpending: [
          { festival: 'Eid ul-Fitr', spending: 28000, year: 2024 },
          { festival: 'Eid ul-Adha', spending: 22000, year: 2024 },
          { festival: 'Durga Puja', spending: 15000, year: 2024 }
        ],
        seasonalCategories: [
          { season: 'Summer', categories: ['Fashion', 'Electronics', 'Sports'] },
          { season: 'Monsoon', categories: ['Home & Garden', 'Health', 'Books'] },
          { season: 'Winter', categories: ['Fashion', 'Home & Kitchen', 'Gifts'] }
        ],
        upcomingFestivals: [
          { name: 'Eid ul-Adha', date: new Date('2025-08-12'), expectedDiscount: 25 },
          { name: 'Independence Day', date: new Date('2025-08-15'), expectedDiscount: 15 }
        ]
      }
    };
  };

  // Initialize and setup auto-refresh
  useEffect(() => {
    fetchCustomerInsights();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchCustomerInsights();
      }, 300000); // Refresh every 5 minutes
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchCustomerInsights, autoRefresh]);

  // Format currency for Bangladesh
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-bronze-600 bg-orange-100';
    }
  };

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    bkash: '#E2136E',
    nagad: '#FF6600',
    rocket: '#8B5CF6'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto text-blue-600" />
          <p className="text-lg font-medium">Loading Your Shopping Insights...</p>
          <p className="text-sm text-gray-500">Analyzing your shopping patterns</p>
        </div>
      </div>
    );
  }

  if (!customerInsights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="text-lg font-medium">Unable to Load Your Insights</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Shopping Insights</h1>
          <p className="text-gray-600">Personal analytics and shopping recommendations</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Customer Tier Badge */}
          <Badge className={`px-3 py-1 ${getTierColor(customerInsights.customerTier)}`}>
            <Award className="h-4 w-4 mr-1" />
            {customerInsights.customerTier.toUpperCase()} MEMBER
          </Badge>

          {/* Time Range Selector */}
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Auto Refresh Toggle */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Member Since & Summary */}
      <div className="text-sm text-gray-500">
        Member since {customerInsights.memberSince.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        })} • Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
          timeZone: 'Asia/Dhaka',
          hour12: true 
        })} (Dhaka Time)
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Spent */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">{formatCurrency(customerInsights.totalSpent)}</p>
                    <p className="text-sm text-green-600 mt-2">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      {customerInsights.totalOrders} orders
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                    <p className="text-2xl font-bold">{customerInsights.loyaltyPoints.toLocaleString()}</p>
                    <p className="text-sm text-blue-600 mt-2">
                      <Award className="h-4 w-4 inline mr-1" />
                      {customerInsights.customerTier} member
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            {/* Total Savings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Savings</p>
                    <p className="text-2xl font-bold">{formatCurrency(customerInsights.totalSavings)}</p>
                    <p className="text-sm text-purple-600 mt-2">
                      <Gift className="h-4 w-4 inline mr-1" />
                      From discounts & offers
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(customerInsights.averageOrderValue)}</p>
                    <p className="text-sm text-orange-600 mt-2">
                      <ShoppingBag className="h-4 w-4 inline mr-1" />
                      Per purchase
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={customerInsights.spendingTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'spending' ? formatCurrency(Number(value)) : 
                          name === 'savings' ? formatCurrency(Number(value)) : value,
                          name === 'spending' ? 'Spending' : 
                          name === 'savings' ? 'Savings' : 'Orders'
                        ]}
                      />
                      <Area type="monotone" dataKey="spending" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.6} />
                      <Area type="monotone" dataKey="savings" stackId="2" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Favorite Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={customerInsights.favoriteCategories}
                        dataKey="percentage"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                      >
                        {customerInsights.favoriteCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            chartColors.primary,
                            chartColors.secondary,
                            chartColors.accent,
                            chartColors.danger,
                            '#8B5CF6'
                          ][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerInsights.recentPurchases.slice(0, 5).map((purchase) => (
                    <div key={purchase.orderId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{purchase.orderId}</p>
                        <p className="text-sm text-gray-500">{purchase.vendor} • {purchase.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(purchase.amount)}</p>
                        <Badge variant={
                          purchase.status === 'Delivered' ? 'default' :
                          purchase.status === 'Shipped' ? 'outline' : 'secondary'
                        }>
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerInsights.paymentMethodUsage.map((method) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{method.method}</span>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(method.amount)}</span>
                          <div className="text-sm text-gray-500">{method.usage} transactions</div>
                        </div>
                      </div>
                      <Progress value={method.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerInsights.favoriteCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(category.totalSpent)}</span>
                          <div className="text-sm text-gray-500">{category.purchaseCount} purchases</div>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Lifetime Value</span>
                    <span className="font-bold">{formatCurrency(customerInsights.lifetimeValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Year</span>
                    <span className="font-bold">{formatCurrency(customerInsights.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Average</span>
                    <span className="font-bold">{formatCurrency(customerInsights.totalSpent / 12)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Total Saved</span>
                    <span className="font-bold">{formatCurrency(customerInsights.totalSavings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                My Wishlist ({customerInsights.wishlistItems.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerInsights.wishlistItems.map((item) => (
                  <div key={item.productId} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-gray-500">{item.vendor}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg">{formatCurrency(item.currentPrice)}</span>
                        {item.discount > 0 && (
                          <div className="text-sm">
                            <span className="line-through text-gray-500">{formatCurrency(item.originalPrice)}</span>
                            <span className="text-green-600 ml-2">-{formatPercentage(item.discount)}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={item.inStock ? 'default' : 'secondary'}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <Button className="w-full" disabled={!item.inStock}>
                      {item.inStock ? 'Add to Cart' : 'Notify When Available'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Shopping Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customerInsights.shoppingGoals.map((goal) => (
                  <div key={goal.goalId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge>{goal.category}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</span>
                        <span>{formatPercentage(goal.progress)}</span>
                      </div>
                      <Progress value={goal.progress} className="h-3" />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Target Date: {goal.targetDate.toLocaleDateString()}</span>
                      <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shopping Behavior */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Session Duration</span>
                    <span className="font-bold">{customerInsights.behaviorInsights.averageSessionDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages per Session</span>
                    <span className="font-bold">{customerInsights.behaviorInsights.pagesPerSession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-bold">{formatPercentage(customerInsights.behaviorInsights.conversionRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews Written</span>
                    <span className="font-bold">{customerInsights.behaviorInsights.reviewsWritten}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Popular in {customerInsights.regionalInsights.region}</h4>
                    {customerInsights.regionalInsights.localPopularCategories.map((category) => (
                      <div key={category.category} className="flex justify-between">
                        <span>{category.category}</span>
                        <span>{category.popularity}% popular</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Regional Offers</h4>
                    {customerInsights.regionalInsights.regionalOffers.map((offer, index) => (
                      <div key={index} className="text-sm text-green-600">
                        {offer.title} - {offer.discount}% off
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customerInsights.recommendations.map((rec) => (
                  <div key={rec.productId} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">{rec.productName}</h4>
                    <p className="text-sm text-gray-500">{rec.vendor}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{formatCurrency(rec.price)}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm ml-1">{rec.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">{rec.reason}</p>
                    <Button size="sm" className="w-full">View Product</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Loyalty Status */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${getTierColor(customerInsights.customerTier)}`}>
                    <Award className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{customerInsights.customerTier.toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">Member</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{customerInsights.loyaltyPoints.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Points Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Points Usage */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Use Your Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <Gift className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h4 className="font-medium">500 Points</h4>
                    <p className="text-sm text-gray-500">৳50 Discount</p>
                    <Button size="sm" className="mt-2">Redeem</Button>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <Truck className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <h4 className="font-medium">200 Points</h4>
                    <p className="text-sm text-gray-500">Free Delivery</p>
                    <Button size="sm" className="mt-2">Redeem</Button>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <Star className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <h4 className="font-medium">1000 Points</h4>
                    <p className="text-sm text-gray-500">Priority Support</p>
                    <Button size="sm" className="mt-2">Redeem</Button>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <Package className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h4 className="font-medium">1500 Points</h4>
                    <p className="text-sm text-gray-500">Exclusive Access</p>
                    <Button size="sm" className="mt-2">Redeem</Button>
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