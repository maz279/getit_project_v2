import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Separator } from '@/shared/ui/separator';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  ShoppingCart, 
  Star, 
  Users, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Upload,
  Plus,
  Settings,
  MessageSquare,
  Bell,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Truck,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface VendorStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  averageRating: number;
  totalCustomers: number;
  conversionRate: number;
  returnRate: number;
}

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  status: string;
  category: string;
}

interface Order {
  id: string;
  date: string;
  customer: string;
  amount: number;
  items: number;
  status: string;
  paymentMethod: string;
}

const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  const [vendorStats, setVendorStats] = useState<VendorStats>({
    totalRevenue: 485670,
    monthlyRevenue: 45890,
    totalOrders: 1247,
    pendingOrders: 23,
    totalProducts: 156,
    activeProducts: 142,
    averageRating: 4.6,
    totalCustomers: 892,
    conversionRate: 3.2,
    returnRate: 2.1
  });

  const salesData: SalesData[] = [
    { month: 'Jan', revenue: 32400, orders: 145, customers: 120 },
    { month: 'Feb', revenue: 38900, orders: 178, customers: 145 },
    { month: 'Mar', revenue: 41200, orders: 192, customers: 167 },
    { month: 'Apr', revenue: 44100, orders: 201, customers: 189 },
    { month: 'May', revenue: 39800, orders: 185, customers: 156 },
    { month: 'Jun', revenue: 45890, orders: 218, customers: 201 }
  ];

  const topProducts: Product[] = [
    {
      id: 'PRD-001',
      name: 'Wireless Bluetooth Headphones',
      sku: 'WBH-2024-001',
      price: 2999,
      stock: 45,
      sold: 234,
      rating: 4.7,
      status: 'active',
      category: 'Electronics'
    },
    {
      id: 'PRD-002',
      name: 'Smart Fitness Watch',
      sku: 'SFW-2024-002',
      price: 8999,
      stock: 12,
      sold: 156,
      rating: 4.5,
      status: 'low_stock',
      category: 'Electronics'
    },
    {
      id: 'PRD-003',
      name: 'Cotton Casual Shirt',
      sku: 'CCS-2024-003',
      price: 1299,
      stock: 0,
      sold: 89,
      rating: 4.3,
      status: 'out_of_stock',
      category: 'Fashion'
    }
  ];

  const recentOrders: Order[] = [
    {
      id: 'ORD-2025-8901',
      date: '2025-07-03',
      customer: 'Rahman Abdullah',
      amount: 5999,
      items: 2,
      status: 'pending',
      paymentMethod: 'bKash'
    },
    {
      id: 'ORD-2025-8902',
      date: '2025-07-03',
      customer: 'Fatima Khan',
      amount: 2999,
      items: 1,
      status: 'processing',
      paymentMethod: 'Nagad'
    },
    {
      id: 'ORD-2025-8903',
      date: '2025-07-02',
      customer: 'Mehedi Hasan',
      amount: 8999,
      items: 1,
      status: 'shipped',
      paymentMethod: 'COD'
    }
  ];

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangePercentage = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600">Manage your store and track performance</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(vendorStats.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.totalOrders.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+8.3%</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.activeProducts}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-gray-600">{vendorStats.totalProducts} total</span>
                  </div>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorStats.averageRating}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{vendorStats.totalCustomers} customers</span>
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    Add Product
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="w-6 h-6 mb-2" />
                    Bulk Upload
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    Analytics
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Low Stock Alert</p>
                  <p className="text-xs text-red-600">3 products running low</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Pending Orders</p>
                  <p className="text-xs text-orange-600">{vendorStats.pendingOrders} orders need attention</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">New Messages</p>
                  <p className="text-xs text-blue-600">5 customer inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(month.revenue / 50000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-20 text-right">
                            {formatCurrency(month.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conversion Rate</span>
                      <span>{vendorStats.conversionRate}%</span>
                    </div>
                    <Progress value={vendorStats.conversionRate * 10} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span>{vendorStats.averageRating}/5</span>
                    </div>
                    <Progress value={(vendorStats.averageRating / 5) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Return Rate</span>
                      <span>{vendorStats.returnRate}%</span>
                    </div>
                    <Progress value={vendorStats.returnRate * 5} className="h-2 bg-red-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Customer</p>
                            <p>{order.customer}</p>
                          </div>
                          <div>
                            <p className="font-medium">Amount</p>
                            <p>{formatCurrency(order.amount)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Items</p>
                            <p>{order.items} items</p>
                          </div>
                          <div>
                            <p className="font-medium">Payment</p>
                            <p>{order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">Product Management</h2>
                <p className="text-gray-600">Manage your product catalog</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Product</th>
                        <th className="text-left p-4 font-medium">SKU</th>
                        <th className="text-left p-4 font-medium">Price</th>
                        <th className="text-left p-4 font-medium">Stock</th>
                        <th className="text-left p-4 font-medium">Sold</th>
                        <th className="text-left p-4 font-medium">Rating</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{product.sku}</td>
                          <td className="p-4 font-medium">{formatCurrency(product.price)}</td>
                          <td className="p-4">
                            <span className={`text-sm ${product.stock < 20 ? 'text-red-600 font-medium' : ''}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{product.sold}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{product.rating}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{vendorStats.pendingOrders}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-gray-600">Processing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">67</p>
                  <p className="text-sm text-gray-600">Shipped</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">1089</p>
                  <p className="text-sm text-gray-600">Delivered</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-600">{order.items} items</p>
                        </div>
                        <div>
                          <p className="font-semibold">{formatCurrency(order.amount)}</p>
                          <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(vendorStats.monthlyRevenue)}</p>
                      <p className="text-sm text-green-600">This Month</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(38900)}</p>
                      <p className="text-sm text-blue-600">Last Month</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Growth Rate</span>
                      <span className="text-green-600 font-medium">+18.0%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Customer Segment</p>
                    <p className="font-semibold">Young Professionals (25-35)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peak Shopping Hours</p>
                    <p className="font-semibold">7-10 PM</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Repeat Customer Rate</p>
                    <p className="font-semibold">34.5%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                    <p className="font-semibold">{formatCurrency(856)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{vendorStats.totalCustomers}</p>
                  <p className="text-sm text-gray-600">Total Customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">307</p>
                  <p className="text-sm text-gray-600">Repeat Customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl font-bold">{vendorStats.averageRating}</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews & Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">Rahman Abdullah</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      "Excellent product quality and fast delivery. The headphones work perfectly and the sound quality is amazing. Highly recommended!"
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">Fatima Khan</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4].map((star) => (
                            <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 week ago</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      "Good product but delivery was a bit delayed. Overall satisfied with the purchase."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;