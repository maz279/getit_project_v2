// EnterpriseVendorDashboard.tsx - Amazon.com/Shopee.sg-Level Vendor Dashboard
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, ShoppingCart, Package, Users, Star, Eye, AlertCircle, CheckCircle, Clock, ArrowUpRight, Award, Target } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface VendorMetrics {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    totalProducts: number;
    averageRating: number;
    customerSatisfaction: number;
    conversionRate: number;
  };
  sales: {
    daily: { date: string; revenue: number; orders: number }[];
    topProducts: { name: string; sales: number; revenue: number; growth: number }[];
    categories: { category: string; revenue: number; percentage: number }[];
  };
  performance: {
    orderFulfillment: number;
    shippingTime: number;
    returnRate: number;
    responseTime: number;
    ratings: { star: number; count: number; percentage: number }[];
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
  };
}

const EnterpriseVendorDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Vendor Dashboard - Manage Your Store | GetIt Bangladesh',
    description: 'Comprehensive vendor dashboard with sales analytics, order management, inventory tracking, and business insights.',
    keywords: 'vendor dashboard, seller portal, business analytics, order management, inventory tracking'
  });

  useEffect(() => {
    // Mock vendor metrics data
    setTimeout(() => {
      const mockMetrics: VendorMetrics = {
        overview: {
          totalRevenue: 2450000,
          revenueGrowth: 18.5,
          totalOrders: 1245,
          ordersGrowth: 12.3,
          totalProducts: 156,
          averageRating: 4.6,
          customerSatisfaction: 94.2,
          conversionRate: 3.8
        },
        sales: {
          daily: [
            { date: '2025-01-05', revenue: 89000, orders: 42 },
            { date: '2025-01-06', revenue: 95000, orders: 38 },
            { date: '2025-01-07', revenue: 112000, orders: 55 },
            { date: '2025-01-08', revenue: 98000, orders: 47 },
            { date: '2025-01-09', revenue: 126000, orders: 61 },
            { date: '2025-01-10', revenue: 134000, orders: 68 },
            { date: '2025-01-11', revenue: 118000, orders: 52 },
            { date: '2025-01-12', revenue: 142000, orders: 73 }
          ],
          topProducts: [
            { name: 'Premium Wireless Headphones', sales: 234, revenue: 1170000, growth: 25.6 },
            { name: 'Smart Watch Series 5', sales: 189, revenue: 945000, growth: 18.2 },
            { name: 'Bluetooth Speaker Pro', sales: 156, revenue: 468000, growth: 31.4 },
            { name: 'Gaming Mechanical Keyboard', sales: 98, revenue: 294000, growth: 12.8 }
          ],
          categories: [
            { category: 'Electronics', revenue: 1450000, percentage: 59.2 },
            { category: 'Accessories', revenue: 650000, percentage: 26.5 },
            { category: 'Gaming', revenue: 350000, percentage: 14.3 }
          ]
        },
        performance: {
          orderFulfillment: 97.8,
          shippingTime: 2.1,
          returnRate: 2.3,
          responseTime: 1.2,
          ratings: [
            { star: 5, count: 856, percentage: 68.7 },
            { star: 4, count: 278, percentage: 22.3 },
            { star: 3, count: 89, percentage: 7.1 },
            { star: 2, count: 15, percentage: 1.2 },
            { star: 1, count: 7, percentage: 0.6 }
          ]
        },
        customers: {
          totalCustomers: 3456,
          newCustomers: 234,
          repeatCustomers: 1876,
          averageOrderValue: 1968,
          customerLifetimeValue: 8450
        }
      };

      setMetrics(mockMetrics);
      setLoading(false);
    }, 1500);
  }, [selectedPeriod]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!metrics) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sales', label: 'Sales Analytics', icon: DollarSign },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'performance', label: 'Performance', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Vendor Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Vendor Dashboard</h1>
              <p className="text-lg opacity-90">
                Welcome back! Here's your store performance overview.
              </p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                Export Report
              </button>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">৳{(metrics.overview.totalRevenue / 1000).toFixed(0)}K</p>
                  <p className="opacity-80">Total Revenue</p>
                  <p className="text-sm opacity-70 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{metrics.overview.revenueGrowth}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{metrics.overview.totalOrders}</p>
                  <p className="opacity-80">Total Orders</p>
                  <p className="text-sm opacity-70 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{metrics.overview.ordersGrowth}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{metrics.overview.averageRating}</p>
                  <p className="opacity-80">Average Rating</p>
                  <p className="text-sm opacity-70">{metrics.overview.customerSatisfaction}% satisfaction</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{metrics.overview.conversionRate}%</p>
                  <p className="opacity-80">Conversion Rate</p>
                  <p className="text-sm opacity-70">{metrics.overview.totalProducts} products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Package className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Add Product</span>
                  </button>
                  
                  <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Manage Orders</span>
                  </button>
                  
                  <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Sales Reports</span>
                  </button>
                  
                  <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">Customer Care</span>
                  </button>
                  
                  <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Star className="h-6 w-6 text-yellow-600" />
                    <span className="text-sm font-medium">Promotions</span>
                  </button>
                  
                  <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-6 w-6 text-indigo-600" />
                    <span className="text-sm font-medium">Analytics</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800">New order received</p>
                      <p className="text-sm text-green-700">Order #GIT12346 - ৳4,500 - 5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">Product stock updated</p>
                      <p className="text-sm text-blue-700">Wireless Headphones - Stock: 25 units - 12 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">Low stock alert</p>
                      <p className="text-sm text-yellow-700">Smart Watch - Only 3 units left - 1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium text-purple-800">New review received</p>
                      <p className="text-sm text-purple-700">5-star review for Gaming Keyboard - 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Analytics Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Sales Trend */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Sales Trend</h3>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.sales.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).getDate().toString()}
                      />
                      <YAxis tickFormatter={(value) => `৳${(value/1000).toFixed(0)}K`} />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-BD')}
                        formatter={(value, name) => [`৳${(value as number).toLocaleString()}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Performance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Sales by Category</h3>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.sales.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {metrics.sales.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`৳${(value as number).toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Products</h3>
                
                <div className="space-y-4">
                  {metrics.sales.topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-purple-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.sales} units sold</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900">৳{(product.revenue / 1000).toFixed(0)}K</p>
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <ArrowUpRight className="h-3 w-3" />
                          +{product.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.orderFulfillment}%</p>
                      <p className="text-gray-600">Order Fulfillment</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${metrics.performance.orderFulfillment}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.shippingTime}</p>
                      <p className="text-gray-600">Avg. Shipping Days</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Target: ≤3 days</p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.returnRate}%</p>
                      <p className="text-gray-600">Return Rate</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Industry avg: 8%</p>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.responseTime}h</p>
                      <p className="text-gray-600">Response Time</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Target: ≤2 hours</p>
                </div>
              </div>

              {/* Customer Ratings */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Ratings Breakdown</h3>
                
                <div className="space-y-4">
                  {metrics.performance.ratings.map(rating => (
                    <div key={rating.star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="font-medium">{rating.star}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${rating.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-24">
                        <span className="text-sm text-gray-600">{rating.count}</span>
                        <span className="text-sm text-gray-500">({rating.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnterpriseVendorDashboard;