/**
 * OrderOverview - Comprehensive Order Management Dashboard
 * Amazon.com/Shopee.sg-Level Order Processing with Bangladesh Market Focus
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { 
  Search, Filter, Download, RefreshCw, Eye, Edit, Truck, Package,
  Clock, CheckCircle, XCircle, AlertTriangle, MapPin, Phone, User,
  CreditCard, Calendar, MoreHorizontal, ArrowRight, ShoppingBag
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// Bangladesh-specific order data
const orderStatuses = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', count: 89 },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', count: 156 },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', count: 234 },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', count: 178 },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', count: 892 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', count: 45 },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-800', count: 23 }
};

const sampleOrders = [
  {
    id: 'ORD-2024-7891',
    customer: { name: 'মোহাম্মদ রহিম', phone: '+8801712345678', email: 'rahim@email.com' },
    items: [
      { name: 'Samsung Galaxy A54', quantity: 1, price: 45000 },
      { name: 'Phone Case', quantity: 1, price: 1500 }
    ],
    total: 46500,
    status: 'confirmed',
    paymentMethod: 'bKash',
    paymentStatus: 'paid',
    shippingAddress: 'Dhanmondi, Dhaka-1205',
    courier: 'Pathao',
    orderDate: new Date('2024-07-04T10:30:00'),
    estimatedDelivery: new Date('2024-07-06T18:00:00'),
    trackingNumber: 'PTH240704001'
  },
  {
    id: 'ORD-2024-7892',
    customer: { name: 'ফাতিমা খাতুন', phone: '+8801987654321', email: 'fatima@email.com' },
    items: [
      { name: 'Traditional Saree', quantity: 2, price: 3500 },
      { name: 'Jewelry Set', quantity: 1, price: 8900 }
    ],
    total: 15900,
    status: 'processing',
    paymentMethod: 'Nagad',
    paymentStatus: 'paid',
    shippingAddress: 'Chittagong-4000',
    courier: 'Paperfly',
    orderDate: new Date('2024-07-04T14:15:00'),
    estimatedDelivery: new Date('2024-07-08T16:00:00'),
    trackingNumber: 'PPF240704002'
  },
  {
    id: 'ORD-2024-7893',
    customer: { name: 'Ahmed Hassan', phone: '+8801555123456', email: 'ahmed@email.com' },
    items: [
      { name: 'Kitchen Appliance Set', quantity: 1, price: 12500 },
      { name: 'Dinner Set', quantity: 1, price: 2800 }
    ],
    total: 15300,
    status: 'shipped',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'pending',
    shippingAddress: 'Sylhet-3100',
    courier: 'Sundarban',
    orderDate: new Date('2024-07-03T09:20:00'),
    estimatedDelivery: new Date('2024-07-05T15:30:00'),
    trackingNumber: 'SUN240703001'
  },
  {
    id: 'ORD-2024-7894',
    customer: { name: 'নাদিয়া আক্তার', phone: '+8801777888999', email: 'nadia@email.com' },
    items: [
      { name: 'Beauty Products Bundle', quantity: 1, price: 4500 },
      { name: 'Skincare Set', quantity: 2, price: 2200 }
    ],
    total: 8900,
    status: 'delivered',
    paymentMethod: 'Rocket',
    paymentStatus: 'paid',
    shippingAddress: 'Khulna-9000',
    courier: 'eCourier',
    orderDate: new Date('2024-07-01T16:45:00'),
    estimatedDelivery: new Date('2024-07-03T12:00:00'),
    trackingNumber: 'ECR240701001'
  },
  {
    id: 'ORD-2024-7895',
    customer: { name: 'Karim Uddin', phone: '+8801333444555', email: 'karim@email.com' },
    items: [
      { name: 'Gaming Headphones', quantity: 1, price: 5500 },
      { name: 'Mouse Pad', quantity: 1, price: 800 }
    ],
    total: 6300,
    status: 'cancelled',
    paymentMethod: 'Card Payment',
    paymentStatus: 'refunded',
    shippingAddress: 'Rajshahi-6000',
    courier: 'RedX',
    orderDate: new Date('2024-07-02T11:30:00'),
    estimatedDelivery: new Date('2024-07-04T10:00:00'),
    trackingNumber: 'RDX240702001'
  }
];

const courierPartners = [
  { name: 'Pathao', orders: 342, onTime: 89, logo: '🏍️', status: 'active' },
  { name: 'Paperfly', orders: 256, onTime: 92, logo: '✈️', status: 'active' },
  { name: 'Sundarban', orders: 189, onTime: 85, logo: '🚛', status: 'active' },
  { name: 'eCourier', orders: 134, onTime: 94, logo: '📦', status: 'active' },
  { name: 'RedX', orders: 98, onTime: 87, logo: '🏃', status: 'active' }
];

const paymentMethods = [
  { name: 'bKash', orders: 456, success: 98.5, color: '#E91E63' },
  { name: 'Nagad', orders: 289, success: 97.8, color: '#FF9800' },
  { name: 'Rocket', orders: 178, success: 96.2, color: '#9C27B0' },
  { name: 'Cash on Delivery', orders: 134, success: 95.5, color: '#4CAF50' },
  { name: 'Card Payment', orders: 67, success: 94.1, color: '#2196F3' }
];

const dailyOrderStats = [
  { date: '2024-07-01', orders: 89, completed: 82, pending: 7, revenue: 234500 },
  { date: '2024-07-02', orders: 156, completed: 148, pending: 8, revenue: 412300 },
  { date: '2024-07-03', orders: 134, completed: 125, pending: 9, revenue: 356700 },
  { date: '2024-07-04', orders: 189, completed: 167, pending: 22, revenue: 567800 }
];

export function OrderOverview() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [filterDate, setFilterDate] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = orderStatuses[status as keyof typeof orderStatuses];
    return (
      <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredOrders = sampleOrders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on orders:`, selectedOrders);
    setSelectedOrders([]);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length 
        ? []
        : filteredOrders.map(order => order.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Complete order lifecycle management with Bangladesh market integration</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(orderStatuses).map(([status, info]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === status ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(info.count)}</div>
              <div className={`text-xs font-medium mt-1 ${info.color.split(' ')[1]}`}>
                {info.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Orders Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by order ID, customer name, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Order Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedOrders.length} order(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('update_status')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('assign_courier')}>
                      <Truck className="h-4 w-4 mr-2" />
                      Assign Courier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orders ({formatNumber(filteredOrders.length)})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={selectAllOrders}
                  />
                  <span className="text-sm text-gray-500">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Checkbox 
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                        />
                        
                        <div className="flex-1 space-y-3">
                          {/* Order Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-bold text-lg">{order.id}</h3>
                              {getStatusBadge(order.status)}
                              {getPaymentStatusBadge(order.paymentStatus)}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatCurrency(order.total)}</div>
                              <div className="text-sm text-gray-500">
                                {format(order.orderDate, 'MMM dd, yyyy HH:mm')}
                              </div>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{order.customer.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{order.customer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{order.shippingAddress}</span>
                            </div>
                          </div>

                          {/* Payment & Shipping Info */}
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4 text-gray-400" />
                              <span>{order.courier}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-blue-600">{order.trackingNumber}</span>
                            </div>
                            {order.estimatedDelivery && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>Est: {format(order.estimatedDelivery, 'MMM dd, HH:mm')}</span>
                              </div>
                            )}
                          </div>

                          {/* Order Items */}
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 mb-1">Items:</div>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-gray-600">
                                  <span>{item.name} × {item.quantity}</span>
                                  <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details: {order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Customer Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div>Name: {order.customer.name}</div>
                                    <div>Phone: {order.customer.phone}</div>
                                    <div>Email: {order.customer.email}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Shipping Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div>Address: {order.shippingAddress}</div>
                                    <div>Courier: {order.courier}</div>
                                    <div>Tracking: {order.trackingNumber}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Order Items</h4>
                                <div className="border rounded p-3">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between py-1">
                                      <span>{item.name} × {item.quantity}</span>
                                      <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New Orders Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  New Orders Queue
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {orderStatuses.pending.count} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.filter(order => order.status === 'pending').slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(order.orderDate)} ago
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(order.total)}</div>
                        <Button size="sm" className="mt-1">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Processing Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Processing Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyOrderStats.map((day) => (
                    <div key={day.date} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{format(new Date(day.date), 'MMM dd')}</span>
                        <span className="text-sm text-gray-600">
                          {day.completed}/{day.orders} completed
                        </span>
                      </div>
                      <Progress value={(day.completed / day.orders) * 100} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{day.pending} pending</span>
                        <span>{formatCurrency(day.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Courier Partners Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Courier Partners Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courierPartners.map((courier) => (
                    <div key={courier.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{courier.logo}</span>
                        <div>
                          <div className="font-medium">{courier.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatNumber(courier.orders)} orders
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{courier.onTime}%</div>
                        <div className="text-sm text-gray-500">On-time delivery</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Zones */}
            <Card>
              <CardHeader>
                <CardTitle>Bangladesh Shipping Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { zone: 'Dhaka Metro', deliveryTime: '1-2 days', cost: 60, orders: 456 },
                    { zone: 'Chittagong', deliveryTime: '2-3 days', cost: 80, orders: 234 },
                    { zone: 'Sylhet', deliveryTime: '3-4 days', cost: 100, orders: 123 },
                    { zone: 'Khulna', deliveryTime: '3-4 days', cost: 100, orders: 89 },
                    { zone: 'Other Districts', deliveryTime: '4-5 days', cost: 120, orders: 156 }
                  ].map((zone) => (
                    <div key={zone.zone} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{zone.zone}</div>
                        <div className="text-sm text-gray-500">{zone.deliveryTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">৳{zone.cost}</div>
                        <div className="text-sm text-gray-500">{formatNumber(zone.orders)} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: method.color }}
                          />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatNumber(method.orders)} orders</div>
                          <div className="text-sm text-green-600">{method.success}% success</div>
                        </div>
                      </div>
                      <Progress value={method.success} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">1,247</div>
                      <div className="text-sm text-blue-700">Today's Orders</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">89.5%</div>
                      <div className="text-sm text-green-700">Fulfillment Rate</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">৳2.4M</div>
                      <div className="text-sm text-purple-700">Today's Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">৳1,847</div>
                      <div className="text-sm text-orange-700">Avg Order Value</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrderOverview;