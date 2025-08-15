import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    id: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    variant?: string;
    sku: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    postalCode?: string;
  };
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDelivery: string;
  orderDate: string;
  notes?: string;
  customerNotes?: string;
  tags: string[];
}

interface OrderAction {
  type: 'status_update' | 'tracking_update' | 'note_added' | 'refund_processed';
  description: string;
  timestamp: string;
  user: string;
}

const VendorOrderManager: React.FC = () => {
  // State Management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [bulkSelectedOrders, setBulkSelectedOrders] = useState<Set<string>>(new Set());

  // Order Action State
  const [actionType, setActionType] = useState<string>('');
  const [actionNote, setActionNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');

  const courierPartners = [
    { id: 'pathao', name: 'Pathao' },
    { id: 'paperfly', name: 'Paperfly' },
    { id: 'sundarban', name: 'Sundarban Courier' },
    { id: 'redx', name: 'RedX' },
    { id: 'ecourier', name: 'eCourier' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2025-001234',
          customerName: 'Ahmad Rahman',
          customerEmail: 'ahmad@example.com',
          customerPhone: '+880 1712345678',
          items: [
            {
              id: 'i1',
              productName: 'Samsung Galaxy A54 5G',
              productImage: '/placeholder-phone.jpg',
              quantity: 1,
              price: 45000,
              variant: 'Midnight Black, 128GB',
              sku: 'SAM-A54-128-BK'
            },
            {
              id: 'i2',
              productName: 'Samsung Galaxy Buds2 Pro',
              productImage: '/placeholder-earbuds.jpg',
              quantity: 1,
              price: 8500,
              sku: 'SAM-BUDS2-PRO'
            }
          ],
          subtotal: 53500,
          shippingCost: 0,
          tax: 8025,
          total: 61525,
          status: 'pending',
          paymentStatus: 'paid',
          paymentMethod: 'bKash',
          shippingAddress: {
            name: 'Ahmad Rahman',
            phone: '+880 1712345678',
            addressLine1: '123 Main Street, Dhanmondi',
            addressLine2: 'Road 15, House 25',
            district: 'Dhaka',
            postalCode: '1205'
          },
          estimatedDelivery: '2025-07-10',
          orderDate: '2025-07-07T10:30:00Z',
          customerNotes: 'Please call before delivery',
          tags: ['priority', 'bulk_order']
        },
        {
          id: '2',
          orderNumber: 'ORD-2025-001235',
          customerName: 'Fatima Khan',
          customerEmail: 'fatima@example.com',
          customerPhone: '+880 1812345678',
          items: [
            {
              id: 'i3',
              productName: 'iPhone 15 Pro',
              productImage: '/placeholder-iphone.jpg',
              quantity: 1,
              price: 135000,
              variant: 'Natural Titanium, 256GB',
              sku: 'APPL-IP15P-256'
            }
          ],
          subtotal: 135000,
          shippingCost: 150,
          tax: 20250,
          total: 155400,
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'Credit Card',
          shippingAddress: {
            name: 'Fatima Khan',
            phone: '+880 1812345678',
            addressLine1: '456 Business Avenue',
            district: 'Dhaka',
            postalCode: '1212'
          },
          courierPartner: 'pathao',
          trackingNumber: 'PTH-2025-789012',
          estimatedDelivery: '2025-07-09',
          orderDate: '2025-07-06T14:20:00Z',
          notes: 'Priority shipping requested',
          tags: ['express', 'high_value']
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
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
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'returned': return <RefreshCw className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    console.log(`Bulk action: ${action} for orders:`, Array.from(bulkSelectedOrders));
    setBulkSelectedOrders(new Set());
  };

  const handleOrderAction = async () => {
    if (!selectedOrder || !actionType) return;

    try {
      switch (actionType) {
        case 'add_tracking':
          setOrders(prev => 
            prev.map(order => 
              order.id === selectedOrder.id 
                ? { 
                    ...order, 
                    trackingNumber,
                    courierPartner,
                    status: 'shipped'
                  }
                : order
            )
          );
          break;
        case 'add_note':
          setOrders(prev => 
            prev.map(order => 
              order.id === selectedOrder.id 
                ? { ...order, notes: actionNote }
                : order
            )
          );
          break;
        default:
          break;
      }

      // Reset form
      setActionType('');
      setActionNote('');
      setTrackingNumber('');
      setCourierPartner('');
      setShowOrderDetails(false);
    } catch (error) {
      console.error('Failed to perform order action:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Manage and track all your orders
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={loadOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {bulkSelectedOrders.size > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {bulkSelectedOrders.size} order(s) selected
              </span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('confirm')}>
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('process')}>
                Process
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('print')}>
                Print Labels
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBulkSelectedOrders(new Set())}>
                Clear
              </Button>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== 'all' || selectedPaymentStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Orders will appear here once customers place them'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={bulkSelectedOrders.has(order.id)}
                        onChange={(e) => {
                          const newSelected = new Set(bulkSelectedOrders);
                          if (e.target.checked) {
                            newSelected.add(order.id);
                          } else {
                            newSelected.delete(order.id);
                          }
                          setBulkSelectedOrders(newSelected);
                        }}
                        className="mt-1"
                      />

                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Order Info */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-lg">{order.orderNumber}</h3>
                              <p className="text-sm text-gray-600">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{order.status}</span>
                              </Badge>
                              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 text-sm">
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-8 h-8 object-contain bg-gray-50 rounded"
                                />
                                <span className="flex-1">
                                  {item.productName} 
                                  {item.variant && <span className="text-gray-500"> - {item.variant}</span>}
                                </span>
                                <span className="text-gray-600">×{item.quantity}</span>
                                <span className="font-medium">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              <span>{order.paymentMethod}</span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                <span>{order.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Customer & Shipping */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Shipping Address:</p>
                            <p className="text-sm">{order.shippingAddress.name}</p>
                            <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.district}
                              {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500">
                              Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </p>
                            {order.courierPartner && (
                              <p className="text-xs text-gray-500">
                                Courier: {courierPartners.find(c => c.id === order.courierPartner)?.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Total & Actions */}
                        <div className="space-y-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} item(s)
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusUpdate(order.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>

                            <Dialog open={showOrderDetails && selectedOrder?.id === order.id} 
                                   onOpenChange={setShowOrderDetails}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                                  <DialogDescription>
                                    Manage order information and perform actions
                                  </DialogDescription>
                                </DialogHeader>

                                <Tabs defaultValue="details" className="space-y-4">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="details">Order Details</TabsTrigger>
                                    <TabsTrigger value="customer">Customer Info</TabsTrigger>
                                    <TabsTrigger value="actions">Actions</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="details" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h3 className="font-medium mb-3">Order Items</h3>
                                        <div className="space-y-3">
                                          {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                                              <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-12 h-12 object-contain bg-gray-50 rounded"
                                              />
                                              <div className="flex-1">
                                                <p className="font-medium">{item.productName}</p>
                                                {item.variant && (
                                                  <p className="text-sm text-gray-600">{item.variant}</p>
                                                )}
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-medium">{formatCurrency(item.price)}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="font-medium mb-3">Order Summary</h3>
                                        <div className="space-y-2 p-3 border rounded">
                                          <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(order.subtotal)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Tax</span>
                                            <span>{formatCurrency(order.tax)}</span>
                                          </div>
                                          <div className="border-t pt-2 flex justify-between font-bold">
                                            <span>Total</span>
                                            <span className="text-green-600">{formatCurrency(order.total)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="customer" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h3 className="font-medium mb-3">Customer Information</h3>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">Name:</span>
                                            <span>{order.customerName}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span>{order.customerEmail}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span>{order.customerPhone}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="font-medium mb-3">Shipping Address</h3>
                                        <div className="space-y-1">
                                          <p className="font-medium">{order.shippingAddress.name}</p>
                                          <p>{order.shippingAddress.phone}</p>
                                          <p>{order.shippingAddress.addressLine1}</p>
                                          {order.shippingAddress.addressLine2 && (
                                            <p>{order.shippingAddress.addressLine2}</p>
                                          )}
                                          <p>{order.shippingAddress.district} {order.shippingAddress.postalCode}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {order.customerNotes && (
                                      <div>
                                        <h3 className="font-medium mb-2">Customer Notes</h3>
                                        <p className="text-sm p-3 bg-gray-50 rounded">{order.customerNotes}</p>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="actions" className="space-y-4">
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="actionType">Action Type</Label>
                                        <Select value={actionType} onValueChange={setActionType}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select action" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="add_tracking">Add Tracking Information</SelectItem>
                                            <SelectItem value="add_note">Add Internal Note</SelectItem>
                                            <SelectItem value="process_refund">Process Refund</SelectItem>
                                            <SelectItem value="contact_customer">Contact Customer</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {actionType === 'add_tracking' && (
                                        <div className="space-y-3">
                                          <div>
                                            <Label htmlFor="courierPartner">Courier Partner</Label>
                                            <Select value={courierPartner} onValueChange={setCourierPartner}>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select courier" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {courierPartners.map(courier => (
                                                  <SelectItem key={courier.id} value={courier.id}>
                                                    {courier.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <Label htmlFor="trackingNumber">Tracking Number</Label>
                                            <Input
                                              id="trackingNumber"
                                              value={trackingNumber}
                                              onChange={(e) => setTrackingNumber(e.target.value)}
                                              placeholder="Enter tracking number"
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {actionType === 'add_note' && (
                                        <div>
                                          <Label htmlFor="actionNote">Internal Note</Label>
                                          <Textarea
                                            id="actionNote"
                                            value={actionNote}
                                            onChange={(e) => setActionNote(e.target.value)}
                                            placeholder="Add internal note about this order"
                                            rows={3}
                                          />
                                        </div>
                                      )}

                                      <Button onClick={handleOrderAction} disabled={!actionType}>
                                        Perform Action
                                      </Button>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOrderManager;