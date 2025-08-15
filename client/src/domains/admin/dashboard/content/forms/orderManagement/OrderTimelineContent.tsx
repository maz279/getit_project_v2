
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Clock, Package, Truck, Check, X, Search, Filter, Calendar, MapPin, User, Phone, Mail, ShoppingBag, AlertCircle, RefreshCw, Download, Eye, MessageSquare, Bell, History } from 'lucide-react';

export const OrderTimelineContent: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-2024-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock timeline data
  const timelineData = [
    {
      id: 'ORD-2024-001',
      customer: 'Sarah Ahmed',
      email: 'sarah@email.com',
      phone: '+8801712345678',
      status: 'delivered',
      total: 2850,
      orderDate: '2024-01-15T10:30:00Z',
      deliveryDate: '2024-01-18T15:45:00Z',
      timeline: [
        {
          id: 1,
          status: 'Order Placed',
          timestamp: '2024-01-15T10:30:00Z',
          description: 'Order placed successfully',
          location: 'Online',
          agent: 'System',
          icon: ShoppingBag,
          color: 'bg-blue-100 text-blue-800'
        },
        {
          id: 2,
          status: 'Payment Confirmed',
          timestamp: '2024-01-15T10:32:00Z',
          description: 'Payment of ৳2,850 confirmed via Mobile Banking',
          location: 'Payment Gateway',
          agent: 'Auto-System',
          icon: Check,
          color: 'bg-green-100 text-green-800'
        },
        {
          id: 3,
          status: 'Processing',
          timestamp: '2024-01-15T14:20:00Z',
          description: 'Order sent to vendor for processing',
          location: 'Tech Store BD',
          agent: 'Mohammad Ali',
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800'
        },
        {
          id: 4,
          status: 'Packed',
          timestamp: '2024-01-16T09:15:00Z',
          description: 'Items packed and ready for shipment',
          location: 'Warehouse - Dhaka',
          agent: 'Fatima Khan',
          icon: Package,
          color: 'bg-purple-100 text-purple-800'
        },
        {
          id: 5,
          status: 'Shipped',
          timestamp: '2024-01-16T16:30:00Z',
          description: 'Package picked up by courier',
          location: 'Dhaka Hub',
          agent: 'Courier Partner',
          icon: Truck,
          color: 'bg-indigo-100 text-indigo-800'
        },
        {
          id: 6,
          status: 'Out for Delivery',
          timestamp: '2024-01-18T09:00:00Z',
          description: 'Package out for delivery',
          location: 'Dhaka Local Hub',
          agent: 'Delivery Agent',
          icon: MapPin,
          color: 'bg-orange-100 text-orange-800'
        },
        {
          id: 7,
          status: 'Delivered',
          timestamp: '2024-01-18T15:45:00Z',
          description: 'Package delivered successfully',
          location: 'Customer Address',
          agent: 'Rahman Ahmed',
          icon: Check,
          color: 'bg-green-100 text-green-800'
        }
      ]
    },
    {
      id: 'ORD-2024-002',
      customer: 'Mohammad Rahman',
      email: 'rahman@email.com',
      phone: '+8801823456789',
      status: 'processing',
      total: 1650,
      orderDate: '2024-01-15T09:15:00Z',
      deliveryDate: null,
      timeline: [
        {
          id: 1,
          status: 'Order Placed',
          timestamp: '2024-01-15T09:15:00Z',
          description: 'Order placed successfully',
          location: 'Online',
          agent: 'System',
          icon: ShoppingBag,
          color: 'bg-blue-100 text-blue-800'
        },
        {
          id: 2,
          status: 'Payment Confirmed',
          timestamp: '2024-01-15T09:17:00Z',
          description: 'Payment of ৳1,650 confirmed via Credit Card',
          location: 'Payment Gateway',
          agent: 'Auto-System',
          icon: Check,
          color: 'bg-green-100 text-green-800'
        },
        {
          id: 3,
          status: 'Processing',
          timestamp: '2024-01-15T13:45:00Z',
          description: 'Order being processed by vendor',
          location: 'Fashion Hub',
          agent: 'In Progress',
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800'
        }
      ]
    }
  ];

  const orders = [
    { id: 'ORD-2024-001', customer: 'Sarah Ahmed', status: 'delivered', total: 2850 },
    { id: 'ORD-2024-002', customer: 'Mohammad Rahman', status: 'processing', total: 1650 },
    { id: 'ORD-2024-003', customer: 'Fatima Khan', status: 'shipped', total: 3200 },
    { id: 'ORD-2024-004', customer: 'Ahmed Hassan', status: 'delivered', total: 850 },
    { id: 'ORD-2024-005', customer: 'Nusrat Jahan', status: 'cancelled', total: 1200 }
  ];

  const selectedOrder = timelineData.find(order => order.id === selectedOrderId);

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Timeline</h1>
          <p className="text-gray-600 mt-1">Track and manage order lifecycle events</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Timeline
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order ID, customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Order List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrderId === order.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{order.id}</div>
                      <div className="text-xs text-gray-500">{order.customer}</div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-xs`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">৳{order.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Details */}
        <div className="lg:col-span-3">
          {selectedOrder && (
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Order {selectedOrder.id}</CardTitle>
                      <Badge className={`${getStatusColor(selectedOrder.status)} px-3 py-1`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{selectedOrder.customer}</div>
                          <div className="text-sm text-gray-500">{selectedOrder.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">Order Date</div>
                          <div className="text-sm text-gray-500">
                            {formatTimestamp(selectedOrder.orderDate).date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">Total Amount</div>
                          <div className="text-sm text-gray-500">৳{selectedOrder.total.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-8">
                        {selectedOrder.timeline.map((event, index) => {
                          const IconComponent = event.icon;
                          const timestamp = formatTimestamp(event.timestamp);
                          
                          return (
                            <div key={event.id} className="relative flex items-start">
                              {/* Timeline Dot */}
                              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${event.color} border-4 border-white shadow-lg`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              
                              {/* Event Content */}
                              <div className="ml-6 flex-1">
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{event.status}</h3>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-900">{timestamp.date}</div>
                                      <div className="text-xs text-gray-500">{timestamp.time}</div>
                                    </div>
                                  </div>
                                  <p className="text-gray-600 mb-2">{event.description}</p>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-500">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {event.location}
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                      <User className="h-4 w-4 mr-1" />
                                      {event.agent}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Customer Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{selectedOrder.customer}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{selectedOrder.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>+8801712345678</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>৳{(selectedOrder.total * 0.9).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>৳{(selectedOrder.total * 0.05).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>৳{(selectedOrder.total * 0.05).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-2">
                            <span>Total:</span>
                            <span>৳{selectedOrder.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Communication Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="font-medium">SMS Notification Sent</span>
                          </div>
                          <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Order confirmation SMS sent to customer</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-green-600" />
                            <span className="font-medium">Email Sent</span>
                          </div>
                          <span className="text-sm text-gray-500">1 day ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Shipping confirmation email sent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};
