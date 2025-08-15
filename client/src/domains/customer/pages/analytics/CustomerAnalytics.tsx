// CustomerAnalytics.tsx - Amazon.com/Shopee.sg-Level Customer Analytics Dashboard
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingBag, Heart, Clock, DollarSign, Package, Calendar, Star, Filter, Download, RefreshCw, Eye } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface AnalyticsData {
  spending: {
    monthly: number[];
    categories: { name: string; amount: number; color: string }[];
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  shopping: {
    orders: number;
    items: number;
    avgOrderValue: number;
    frequentCategories: string[];
  };
  savings: {
    total: number;
    deals: number;
    cashback: number;
    coupons: number;
  };
  behavior: {
    wishlistItems: number;
    reviewsWritten: number;
    loyaltyPoints: number;
    favoriteTime: string;
  };
}

interface ActivityData {
  date: string;
  orders: number;
  spending: number;
  views: number;
}

const CustomerAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'My Shopping Analytics - Insights & Statistics | GetIt Bangladesh',
    description: 'View your personal shopping analytics, spending patterns, savings, and discover insights about your shopping behavior.',
    keywords: 'shopping analytics, spending insights, customer dashboard, shopping statistics, Bangladesh shopping'
  });

  useEffect(() => {
    // Mock analytics data
    const mockAnalyticsData: AnalyticsData = {
      spending: {
        monthly: [2500, 3200, 2800, 3500, 4100, 3800],
        categories: [
          { name: 'Electronics', amount: 8500, color: '#3B82F6' },
          { name: 'Fashion', amount: 5200, color: '#EF4444' },
          { name: 'Home & Living', amount: 3800, color: '#10B981' },
          { name: 'Books', amount: 1200, color: '#F59E0B' },
          { name: 'Health & Beauty', amount: 2300, color: '#8B5CF6' }
        ],
        trend: 'up',
        change: 15.6
      },
      shopping: {
        orders: 47,
        items: 142,
        avgOrderValue: 1850,
        frequentCategories: ['Electronics', 'Fashion', 'Home & Living']
      },
      savings: {
        total: 12450,
        deals: 8200,
        cashback: 2100,
        coupons: 2150
      },
      behavior: {
        wishlistItems: 28,
        reviewsWritten: 15,
        loyaltyPoints: 3420,
        favoriteTime: '8:00 PM - 10:00 PM'
      }
    };

    const mockActivityData: ActivityData[] = [
      { date: '2025-01-01', orders: 2, spending: 3200, views: 45 },
      { date: '2025-01-02', orders: 0, spending: 0, views: 23 },
      { date: '2025-01-03', orders: 1, spending: 1800, views: 67 },
      { date: '2025-01-04', orders: 3, spending: 4200, views: 89 },
      { date: '2025-01-05', orders: 0, spending: 0, views: 34 },
      { date: '2025-01-06', orders: 1, spending: 2100, views: 56 },
      { date: '2025-01-07', orders: 2, spending: 3600, views: 78 },
      { date: '2025-01-08', orders: 0, spending: 0, views: 29 },
      { date: '2025-01-09', orders: 1, spending: 1400, views: 43 },
      { date: '2025-01-10', orders: 2, spending: 2800, views: 91 },
      { date: '2025-01-11', orders: 1, spending: 1900, views: 52 },
      { date: '2025-01-12', orders: 3, spending: 5100, views: 67 }
    ];

    setAnalyticsData(mockAnalyticsData);
    setActivityData(mockActivityData);
    setLoading(false);
  }, [selectedPeriod]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Shopping Analytics</h1>
              <p className="text-xl opacity-90">
                Discover insights about your shopping patterns and spending habits
              </p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
              
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{analyticsData.shopping.orders}</p>
                  <p className="opacity-80">Total Orders</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">৳{analyticsData.spending.monthly.reduce((a, b) => a + b, 0).toLocaleString()}</p>
                  <p className="opacity-80">Total Spent</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{analyticsData.shopping.items}</p>
                  <p className="opacity-80">Items Purchased</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">৳{analyticsData.savings.total.toLocaleString()}</p>
                  <p className="opacity-80">Total Savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spending Analysis */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Spending Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Monthly Spending Trend</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  analyticsData.spending.trend === 'up' ? 'bg-green-100 text-green-800' : 
                  analyticsData.spending.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  {analyticsData.spending.change > 0 ? '+' : ''}{analyticsData.spending.change}%
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.spending.monthly.map((amount, index) => ({
                  month: `Month ${index + 1}`,
                  amount
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`৳${value}`, 'Spending']} />
                  <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.spending.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analyticsData.spending.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`৳${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {analyticsData.spending.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">৳{category.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopping Activity */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping Activity</h2>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Daily Activity (Last 12 Days)</h3>
            
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate().toString()} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-BD')}
                  formatter={(value, name) => [
                    name === 'spending' ? `৳${value}` : value,
                    name === 'spending' ? 'Spending' : name === 'orders' ? 'Orders' : 'Page Views'
                  ]}
                />
                <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="orders" />
                <Line yAxisId="right" type="monotone" dataKey="views" stroke="#EF4444" strokeWidth={2} name="views" />
                <Line yAxisId="left" type="monotone" dataKey="spending" stroke="#10B981" strokeWidth={2} name="spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Insights & Recommendations */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Insights & Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Shopping Behavior */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Shopping Behavior</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorite shopping time:</span>
                  <span className="font-medium">{analyticsData.behavior.favoriteTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. order value:</span>
                  <span className="font-medium">৳{analyticsData.shopping.avgOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loyalty points:</span>
                  <span className="font-medium">{analyticsData.behavior.loyaltyPoints}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 You shop most during evening hours. Check our night deals for extra savings!
                </p>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Your Savings</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deal discounts:</span>
                  <span className="font-medium text-green-600">৳{analyticsData.savings.deals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cashback earned:</span>
                  <span className="font-medium text-green-600">৳{analyticsData.savings.cashback}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon savings:</span>
                  <span className="font-medium text-green-600">৳{analyticsData.savings.coupons}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 You've saved ৳{analyticsData.savings.total.toLocaleString()} this period! Great job finding deals!
                </p>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Engagement</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wishlist items:</span>
                  <span className="font-medium">{analyticsData.behavior.wishlistItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews written:</span>
                  <span className="font-medium">{analyticsData.behavior.reviewsWritten}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorite categories:</span>
                  <span className="font-medium">{analyticsData.shopping.frequentCategories.length}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  ⭐ Write more reviews to earn bonus loyalty points and help other shoppers!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Personalized for You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Budget Optimizer</h3>
              <p className="text-gray-600 text-sm mb-4">
                Based on your spending patterns, we recommend setting a monthly budget of ৳{Math.round(analyticsData.spending.monthly.reduce((a, b) => a + b) / analyticsData.spending.monthly.length * 1.1).toLocaleString()}
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Set Budget
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Deal Alerts</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get notified about deals in your favorite categories: {analyticsData.shopping.frequentCategories.join(', ')}
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Enable Alerts
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Shopping Schedule</h3>
              <p className="text-gray-600 text-sm mb-4">
                Schedule your shopping during {analyticsData.behavior.favoriteTime} when you're most active for better deals
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Schedule Shopping
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomerAnalytics;