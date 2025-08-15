import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { 
  Store, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Award,
  MessageSquare
} from 'lucide-react';

interface VendorStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  monthlyOrders: number;
  orderGrowth: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalCustomers: number;
  repeatCustomers: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  fulfillmentRate: number;
  pendingPayouts: number;
  completedPayouts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  soldUnits: number;
  revenue: number;
  rating: number;
  stock: number;
}

interface Notification {
  id: string;
  type: 'order' | 'review' | 'stock' | 'payout' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const VendorDashboard: React.FC = () => {
  // State Management
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStats: VendorStats = {
        totalRevenue: 2500000,
        monthlyRevenue: 350000,
        revenueGrowth: 15.2,
        totalOrders: 1245,
        monthlyOrders: 156,
        orderGrowth: 8.7,
        totalProducts: 89,
        activeProducts: 82,
        outOfStockProducts: 7,
        totalCustomers: 890,
        repeatCustomers: 234,
        averageRating: 4.6,
        totalReviews: 456,
        responseRate: 94,
        fulfillmentRate: 97,
        pendingPayouts: 45000,
        completedPayouts: 2455000
      };

      const mockRecentOrders: RecentOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-2025-001234',
          customerName: 'Ahmad Rahman',
          items: 2,
          total: 67500,
          status: 'pending',
          date: '2025-07-07',
          paymentStatus: 'paid'
        },
        {
          id: '2',
          orderNumber: 'ORD-2025-001235',
          customerName: 'Fatima Khan',
          items: 1,
          total: 45000,
          status: 'processing',
          date: '2025-07-07',
          paymentStatus: 'paid'
        },
        {
          id: '3',
          orderNumber: 'ORD-2025-001236',
          customerName: 'Mohammed Ali',
          items: 3,
          total: 125000,
          status: 'shipped',
          date: '2025-07-06',
          paymentStatus: 'paid'
        }
      ];

      const mockTopProducts: TopProduct[] = [
        {
          id: '1',
          name: 'Samsung Galaxy A54 5G',
          image: '/placeholder-phone.jpg',
          soldUnits: 89,
          revenue: 4005000,
          rating: 4.5,
          stock: 15
        },
        {
          id: '2',
          name: 'iPhone 15 Pro',
          image: '/placeholder-iphone.jpg',
          soldUnits: 34,
          revenue: 3230000,
          rating: 4.8,
          stock: 8
        },
        {
          id: '3',
          name: 'Samsung Galaxy Buds2 Pro',
          image: '/placeholder-earbuds.jpg',
          soldUnits: 156,
          revenue: 1326000,
          rating: 4.3,
          stock: 45
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'New Order Received',
          message: 'Order #ORD-2025-001234 for ৳67,500 needs processing',
          timestamp: '2025-07-07T10:30:00Z',
          isRead: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'stock',
          title: 'Low Stock Alert',
          message: 'iPhone 15 Pro has only 8 units remaining',
          timestamp: '2025-07-07T09:15:00Z',
          isRead: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'review',
          title: 'New Review Received',
          message: 'Customer left a 5-star review for Samsung Galaxy A54',
          timestamp: '2025-07-07T08:45:00Z',
          isRead: true,
          priority: 'low'
        },
        {
          id: '4',
          type: 'payout',
          title: 'Payout Processed',
          message: 'Weekly payout of ৳45,000 has been transferred',
          timestamp: '2025-07-06T16:00:00Z',
          isRead: true,
          priority: 'medium'
        }
      ];

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setTopProducts(mockTopProducts);
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'review': return <MessageSquare className="h-4 w-4" />;
      case 'stock': return <Package className="h-4 w-4" />;
      case 'payout': return <DollarSign className="h-4 w-4" />;
      case 'system': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-gray-600">Unable to load vendor dashboard data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Store className="h-6 w-6" />
                Vendor Dashboard
              </h1>
              <p className="text-gray-600">Welcome back! Here's your store performance overview.</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Store
              </Button>
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getGrowthIcon(stats.revenueGrowth)}
                      <span className={`text-sm font-medium ${getGrowthColor(stats.revenueGrowth)}`}>
                        {Math.abs(stats.revenueGrowth)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
                    <p className="text-2xl font-bold">{stats.monthlyOrders}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getGrowthIcon(stats.orderGrowth)}
                      <span className={`text-sm font-medium ${getGrowthColor(stats.orderGrowth)}`}>
                        {Math.abs(stats.orderGrowth)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold">{stats.activeProducts}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.outOfStockProducts} out of stock
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Store Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stats.averageRating}</p>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.totalReviews} reviews
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Orders
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{order.orderNumber}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                          <p className="text-sm text-gray-500">
                            {order.items} item(s) • {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total)}</p>
                          <Badge 
                            variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Top Selling Products
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-contain bg-gray-50 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{product.rating}</span>
                            </div>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-600">Stock: {product.stock}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.soldUnits} sold</p>
                          <p className="text-xs text-gray-600">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Response Rate</span>
                      <span className="text-sm font-bold">{stats.responseRate}%</span>
                    </div>
                    <Progress value={stats.responseRate} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">Respond to customer inquiries within 24 hours</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Fulfillment Rate</span>
                      <span className="text-sm font-bold">{stats.fulfillmentRate}%</span>
                    </div>
                    <Progress value={stats.fulfillmentRate} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">Orders fulfilled successfully</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm font-bold">{((stats.averageRating / 5) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(stats.averageRating / 5) * 100} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">Based on customer reviews and ratings</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border ${getNotificationColor(notification.priority)} ${
                          !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-sm text-gray-500">All time earnings</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Pending Payouts</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingPayouts)}</p>
                    <p className="text-sm text-gray-500">Processing for payment</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Completed Payouts</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.completedPayouts)}</p>
                    <p className="text-sm text-gray-500">Successfully transferred</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Customers</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</p>
                    <p className="text-sm text-gray-500">{stats.repeatCustomers} repeat customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <p className="text-sm text-gray-600">Manage and track all your orders</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Order Management Coming Soon</h3>
                  <p className="text-gray-600">Full order management interface will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <p className="text-sm text-gray-600">Manage your product catalog and inventory</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Product Management Coming Soon</h3>
                  <p className="text-gray-600">Full product management interface will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <p className="text-sm text-gray-600">Detailed insights into your business performance</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-gray-600">Comprehensive business analytics will be available here</p>
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