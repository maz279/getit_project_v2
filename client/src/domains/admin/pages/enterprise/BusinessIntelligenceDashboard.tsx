// BusinessIntelligenceDashboard.tsx - Amazon.com/Shopee.sg-Level Business Intelligence
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Package, ShoppingCart, Eye, Target, Globe, AlertTriangle, CheckCircle, Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface BusinessMetrics {
  revenue: {
    total: number;
    growth: number;
    monthly: { month: string; amount: number; target: number }[];
    byCategory: { category: string; amount: number; percentage: number }[];
  };
  customers: {
    total: number;
    new: number;
    retention: number;
    lifetime_value: number;
    demographics: { region: string; count: number; percentage: number }[];
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    avg_value: number;
    trends: { date: string; orders: number; value: number }[];
  };
  products: {
    total: number;
    active: number;
    out_of_stock: number;
    top_selling: { name: string; sales: number; revenue: number }[];
  };
  market: {
    bangladesh_share: number;
    international_share: number;
    growth_rate: number;
    conversion_rate: number;
  };
}

const BusinessIntelligenceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Business Intelligence Dashboard - Enterprise Analytics | GetIt Bangladesh',
    description: 'Comprehensive business intelligence dashboard with real-time analytics, KPIs, revenue tracking, and market insights for enterprise decision making.',
    keywords: 'business intelligence, analytics dashboard, KPI tracking, revenue analytics, market insights'
  });

  useEffect(() => {
    // Mock business intelligence data
    setTimeout(() => {
      const mockMetrics: BusinessMetrics = {
        revenue: {
          total: 12450000,
          growth: 24.5,
          monthly: [
            { month: 'Jan', amount: 980000, target: 1000000 },
            { month: 'Feb', amount: 1120000, target: 1100000 },
            { month: 'Mar', amount: 1350000, target: 1250000 },
            { month: 'Apr', amount: 1480000, target: 1400000 },
            { month: 'May', amount: 1650000, target: 1550000 },
            { month: 'Jun', amount: 1890000, target: 1700000 },
            { month: 'Jul', amount: 2180000, target: 1900000 },
            { month: 'Aug', amount: 2450000, target: 2100000 }
          ],
          byCategory: [
            { category: 'Electronics', amount: 4500000, percentage: 36.2 },
            { category: 'Fashion', amount: 3200000, percentage: 25.7 },
            { category: 'Home & Living', amount: 2100000, percentage: 16.9 },
            { category: 'Health & Beauty', amount: 1450000, percentage: 11.6 },
            { category: 'Books & Media', amount: 800000, percentage: 6.4 },
            { category: 'Others', amount: 400000, percentage: 3.2 }
          ]
        },
        customers: {
          total: 245000,
          new: 18500,
          retention: 78.5,
          lifetime_value: 2850,
          demographics: [
            { region: 'Dhaka', count: 98000, percentage: 40.0 },
            { region: 'Chittagong', count: 49000, percentage: 20.0 },
            { region: 'Sylhet', count: 29400, percentage: 12.0 },
            { region: 'Rajshahi', count: 24500, percentage: 10.0 },
            { region: 'Khulna', count: 19600, percentage: 8.0 },
            { region: 'Others', count: 24500, percentage: 10.0 }
          ]
        },
        orders: {
          total: 89500,
          completed: 82100,
          pending: 4200,
          cancelled: 3200,
          avg_value: 1850,
          trends: [
            { date: '2025-01-01', orders: 1250, value: 2340000 },
            { date: '2025-01-02', orders: 980, value: 1820000 },
            { date: '2025-01-03', orders: 1420, value: 2650000 },
            { date: '2025-01-04', orders: 1680, value: 3120000 },
            { date: '2025-01-05', orders: 1580, value: 2940000 },
            { date: '2025-01-06', orders: 1350, value: 2510000 },
            { date: '2025-01-07', orders: 1720, value: 3200000 },
            { date: '2025-01-08', orders: 1980, value: 3680000 },
            { date: '2025-01-09', orders: 1840, value: 3420000 },
            { date: '2025-01-10', orders: 2150, value: 4010000 },
            { date: '2025-01-11', orders: 2280, value: 4250000 },
            { date: '2025-01-12', orders: 2480, value: 4620000 }
          ]
        },
        products: {
          total: 125000,
          active: 118500,
          out_of_stock: 6500,
          top_selling: [
            { name: 'Samsung Galaxy A54 5G', sales: 2450, revenue: 102900000 },
            { name: 'Apple iPhone 14', sales: 1850, revenue: 185000000 },
            { name: 'Dell Inspiron Laptop', sales: 890, revenue: 71200000 },
            { name: 'Sony WH-1000XM4', sales: 1650, revenue: 49500000 },
            { name: 'Nike Air Max', sales: 2200, revenue: 35200000 }
          ]
        },
        market: {
          bangladesh_share: 15.8,
          international_share: 2.3,
          growth_rate: 45.2,
          conversion_rate: 3.8
        }
      };

      setMetrics(mockMetrics);
      setLoading(false);
    }, 1500);
  }, [selectedPeriod, selectedRegion]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading business intelligence...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Business Intelligence</h1>
              <p className="text-xl opacity-90">
                Real-time analytics and insights for data-driven decisions
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
              
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg"
              >
                <option value="all">All Regions</option>
                <option value="dhaka">Dhaka</option>
                <option value="chittagong">Chittagong</option>
                <option value="sylhet">Sylhet</option>
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
          
          {/* Executive KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">৳{(metrics.revenue.total / 1000000).toFixed(1)}M</p>
                  <p className="opacity-80">Total Revenue</p>
                  <p className="text-sm opacity-70 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{metrics.revenue.growth}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{(metrics.customers.total / 1000).toFixed(0)}K</p>
                  <p className="opacity-80">Total Customers</p>
                  <p className="text-sm opacity-70 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{metrics.customers.new} new
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{(metrics.orders.total / 1000).toFixed(0)}K</p>
                  <p className="opacity-80">Total Orders</p>
                  <p className="text-sm opacity-70">৳{metrics.orders.avg_value} avg value</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{metrics.market.bangladesh_share}%</p>
                  <p className="opacity-80">Market Share</p>
                  <p className="text-sm opacity-70 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{metrics.market.growth_rate}% growth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Analytics */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Revenue Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue vs Target</h3>
              
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={metrics.revenue.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `৳${(value/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value, name) => [`৳${(value as number/1000000).toFixed(2)}M`, name === 'amount' ? 'Actual' : 'Target']} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" name="Actual Revenue" />
                  <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue by Category</h3>
              
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={metrics.revenue.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {metrics.revenue.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`৳${(value as number/1000000).toFixed(2)}M`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Order Analytics */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Order Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Status Overview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-medium">Completed</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{metrics.orders.completed.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{((metrics.orders.completed / metrics.orders.total) * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-yellow-500" />
                    <span className="font-medium">Pending</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{metrics.orders.pending.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{((metrics.orders.pending / metrics.orders.total) * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <span className="font-medium">Cancelled</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{metrics.orders.cancelled.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{((metrics.orders.cancelled / metrics.orders.total) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Order Trends */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Daily Order Trends</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.orders.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).getDate().toString()}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `৳${(value/1000000).toFixed(1)}M`} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-BD')}
                    formatter={(value, name) => [
                      name === 'value' ? `৳${(value as number/1000000).toFixed(2)}M` : value,
                      name === 'value' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={3} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Analytics */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Demographics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Demographics by Region</h3>
              
              <div className="space-y-4">
                {metrics.customers.demographics.map((region, index) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-gray-900">{region.region}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{region.count.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{region.percentage}%</p>
                      </div>
                      
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${region.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Metrics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{metrics.customers.retention}%</p>
                  <p className="text-gray-700 font-medium">Retention Rate</p>
                  <p className="text-sm text-gray-600 mt-1">Customer loyalty</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">৳{metrics.customers.lifetime_value}</p>
                  <p className="text-gray-700 font-medium">Lifetime Value</p>
                  <p className="text-sm text-gray-600 mt-1">Average CLV</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{metrics.market.conversion_rate}%</p>
                  <p className="text-gray-700 font-medium">Conversion Rate</p>
                  <p className="text-sm text-gray-600 mt-1">Visitors to buyers</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">{metrics.customers.new.toLocaleString()}</p>
                  <p className="text-gray-700 font-medium">New Customers</p>
                  <p className="text-sm text-gray-600 mt-1">This period</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Performance */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Product Performance</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Selling Products */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h3>
              
              <div className="space-y-4">
                {metrics.products.top_selling.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-purple-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">৳{(product.revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Inventory Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Inventory Status</h3>
              
              <div className="space-y-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Package className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-green-600">{metrics.products.total.toLocaleString()}</p>
                  <p className="text-gray-700 font-medium">Total Products</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{metrics.products.active.toLocaleString()}</p>
                    <p className="text-gray-700 font-medium">Active</p>
                    <p className="text-sm text-gray-600">{((metrics.products.active / metrics.products.total) * 100).toFixed(1)}%</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{metrics.products.out_of_stock.toLocaleString()}</p>
                    <p className="text-gray-700 font-medium">Out of Stock</p>
                    <p className="text-sm text-gray-600">{((metrics.products.out_of_stock / metrics.products.total) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BusinessIntelligenceDashboard;