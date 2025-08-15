/**
 * OrderHistory.tsx - Amazon.com/Shopee.sg-Level Order Management
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Comprehensive order history with Bangladesh courier tracking,
 * mobile payment status, and Amazon.com/Shopee.sg-level functionality.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Progress } from '@/shared/ui/progress';
import { 
  Package, 
  Truck, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Star, 
  MessageCircle,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Eye,
  RotateCcw,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Bangladesh-specific icons  
import { FaShippingFast } from 'react-icons/fa';

import orderApiService from '@/shared/services/order/OrderApiService';
import { ShippingApiService } from '@/shared/services/shipping/ShippingApiService';
import { PaymentApiService } from '@/shared/services/payment/PaymentApiService';
import { ReviewApiService } from '@/shared/services/reviews/ReviewApiService';
import { useToast } from '@/shared/hooks/use-toast';

interface OrderHistoryProps {
  userId?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  orderDate: string;
  deliveryDate?: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    area: string;
    city: string;
    postalCode: string;
  };
  items: OrderItem[];
  tracking?: TrackingInfo;
  mobilePayment?: MobilePaymentStatus;
  vendor: {
    id: string;
    name: string;
    storeName: string;
  };
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  canReview: boolean;
  reviewed: boolean;
}

interface TrackingInfo {
  courier: 'pathao' | 'paperfly' | 'sundarban' | 'redx' | 'ecourier';
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  currentLocation?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    location: string;
    description: string;
  }>;
}

interface MobilePaymentStatus {
  provider: 'bkash' | 'nagad' | 'rocket';
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  fee: number;
  timestamp: string;
}

interface OrderAnalytics {
  totalOrders: number;
  totalSpent: number;
  totalSaved: number;
  avgOrderValue: number;
  favoriteCategories: string[];
  topVendors: string[];
  monthlySpending: Array<{
    month: string;
    amount: number;
    orders: number;
  }>;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    loadAnalytics();
  }, [userId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter, activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await OrderApiService.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const orderAnalytics = await OrderApiService.getOrderAnalytics();
      setAnalytics(orderAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by tab (status groups)
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(order => 
          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
        );
        break;
      case 'delivered':
        filtered = filtered.filter(order => order.status === 'delivered');
        break;
      case 'cancelled':
        filtered = filtered.filter(order => 
          ['cancelled', 'returned'].includes(order.status)
        );
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        order.vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(order => 
          new Date(order.orderDate) >= filterDate
        );
      }
    }

    setFilteredOrders(filtered);
  };

  const handleTrackOrder = async (order: Order) => {
    if (!order.tracking) {
      toast({
        title: "Tracking Unavailable",
        description: "Tracking information is not yet available for this order",
        variant: "destructive",
      });
      return;
    }

    try {
      const trackingInfo = await ShippingApiService.trackOrder(order.tracking.trackingNumber);
      
      // Update order with latest tracking info
      setOrders(prev => prev.map(o => 
        o.id === order.id 
          ? { ...o, tracking: { ...o.tracking, ...trackingInfo } }
          : o
      ));

      setSelectedOrder({
        ...order,
        tracking: { ...order.tracking, ...trackingInfo }
      });

    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Tracking Error",
        description: "Unable to fetch latest tracking information",
        variant: "destructive",
      });
    }
  };

  const handleReorderItems = async (order: Order) => {
    try {
      const reorderResult = await OrderApiService.reorderItems(order.id);
      toast({
        title: "Success",
        description: `${reorderResult.itemsAdded} items added to cart`,
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      toast({
        title: "Reorder Error",
        description: "Some items may no longer be available",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (order: Order) => {
    try {
      await OrderApiService.cancelOrder(order.id);
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: 'cancelled' as const } : o
      ));
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Cancellation Error",
        description: "Unable to cancel the order",
        variant: "destructive",
      });
    }
  };

  const handleReturnRequest = async (order: Order) => {
    try {
      await OrderApiService.requestReturn(order.id);
      toast({
        title: "Return Requested",
        description: "Your return request has been submitted",
      });
    } catch (error) {
      console.error('Error requesting return:', error);
      toast({
        title: "Return Error",
        description: "Unable to submit return request",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const invoiceUrl = await OrderApiService.downloadInvoice(order.id);
      // Open invoice in new tab
      window.open(invoiceUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Error",
        description: "Unable to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleWriteReview = async (item: OrderItem) => {
    // This would typically open a review modal
    console.log('Writing review for:', item.productName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourierIcon = (courier: string) => {
    // Return appropriate courier icon/logo
    return <FaShippingFast className="h-4 w-4" />;
  };

  const getOrderProgress = (status: string) => {
    switch (status) {
      case 'pending': return 10;
      case 'confirmed': return 25;
      case 'processing': return 50;
      case 'shipped': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header with Analytics */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        
        {analytics && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <div className="text-lg font-semibold text-green-600 mt-2">
                  ৳{analytics.totalSpent.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({orders.filter(o => ['cancelled', 'returned'].includes(o.status)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'You haven\'t placed any orders yet'
                  }
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{order.vendor.storeName}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">৳{order.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{order.orderDate}</p>
                    </div>
                  </div>

                  {/* Order Progress */}
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Order Progress</span>
                        <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </div>
                      <Progress value={getOrderProgress(order.status)} className="h-2" />
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-full h-full p-2 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">{item.variant}</p>
                          )}
                          <p className="text-xs text-gray-600">Qty: {item.quantity} × ৳{item.unitPrice}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">+{order.items.length - 3} more items</span>
                      </div>
                    )}
                  </div>

                  {/* Tracking Info */}
                  {order.tracking && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCourierIcon(order.tracking.courier)}
                          <span className="text-sm font-medium capitalize">{order.tracking.courier}</span>
                          <span className="text-sm text-gray-600">#{order.tracking.trackingNumber}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                          <MapPin className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                      </div>
                      {order.tracking.currentLocation && (
                        <p className="text-sm text-gray-600 mt-1">
                          Current location: {order.tracking.currentLocation}
                        </p>
                      )}
                      {order.tracking.estimatedDelivery && (
                        <p className="text-sm text-gray-600">
                          Estimated delivery: {order.tracking.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mobile Payment Status */}
                  {order.mobilePayment && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm font-medium capitalize">{order.mobilePayment.provider}</span>
                          <span className="text-sm text-gray-600">#{order.mobilePayment.transactionId}</span>
                        </div>
                        <Badge className={getPaymentStatusColor(order.mobilePayment.status)}>
                          {order.mobilePayment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Amount: ৳{order.mobilePayment.amount} (Fee: ৳{order.mobilePayment.fee})
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
                          <DialogDescription>
                            Complete order information and tracking
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Detailed order content would go here */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Order Information</h4>
                              <div className="space-y-1 text-sm">
                                <p>Order Date: {order.orderDate}</p>
                                <p>Status: {order.status}</p>
                                <p>Payment Method: {order.paymentMethod}</p>
                                <p>Total: ৳{order.totalAmount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Shipping Address</h4>
                              <div className="text-sm text-gray-600">
                                <p>{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.area}, {order.shippingAddress.city}</p>
                                <p>Postal Code: {order.shippingAddress.postalCode}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(order)}>
                      <Download className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>

                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm" onClick={() => handleReorderItems(order)}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reorder
                      </Button>
                    )}

                    {['pending', 'confirmed'].includes(order.status) && (
                      <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}

                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm" onClick={() => handleReturnRequest(order)}>
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    )}

                    {order.items.some(item => item.canReview && !item.reviewed) && (
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-1" />
                        Write Review
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Contact Seller
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderHistory;