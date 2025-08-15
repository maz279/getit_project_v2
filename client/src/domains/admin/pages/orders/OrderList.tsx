/**
 * Order List - Comprehensive order management interface
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  ShoppingCart, Search, Filter, Download, Eye, Package, Truck,
  CheckCircle, XCircle, Clock, MoreVertical, DollarSign, Users,
  Calendar, MapPin, Phone, Mail, FileText, Printer, RefreshCw
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/shared/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';

// Sample order data
const ordersData = [
  {
    id: 'ORD#12456',
    date: '2024-06-28 14:23',
    customer: {
      name: 'Fatima Rahman',
      email: 'fatima.r@email.com',
      phone: '+880 1712-345678',
      type: 'regular'
    },
    items: 3,
    total: 'BDT 12,450',
    payment: {
      method: 'bKash',
      status: 'paid'
    },
    shipping: {
      method: 'Pathao',
      address: 'House 123, Road 45, Dhanmondi, Dhaka',
      status: 'processing'
    },
    status: 'processing',
    vendor: 'Multi-vendor'
  },
  {
    id: 'ORD#12455',
    date: '2024-06-28 12:15',
    customer: {
      name: 'Karim Ahmed',
      email: 'karim.ahmed@email.com',
      phone: '+880 1812-456789',
      type: 'vip'
    },
    items: 1,
    total: 'BDT 65,990',
    payment: {
      method: 'Credit Card',
      status: 'paid'
    },
    shipping: {
      method: 'Express',
      address: 'Apartment 5B, Green Tower, Gulshan, Dhaka',
      status: 'shipped'
    },
    status: 'shipped',
    vendor: 'Dhaka Electronics Hub'
  },
  {
    id: 'ORD#12454',
    date: '2024-06-28 10:45',
    customer: {
      name: 'Ayesha Begum',
      email: 'ayesha.b@email.com',
      phone: '+880 1912-567890',
      type: 'new'
    },
    items: 5,
    total: 'BDT 4,567',
    payment: {
      method: 'COD',
      status: 'pending'
    },
    shipping: {
      method: 'Standard',
      address: 'Village Market, Sylhet Sadar, Sylhet',
      status: 'pending'
    },
    status: 'pending',
    vendor: 'Fashion Paradise BD'
  },
  {
    id: 'ORD#12453',
    date: '2024-06-27 18:30',
    customer: {
      name: 'Hasan Ali',
      email: 'hasan.ali@email.com',
      phone: '+880 1612-678901',
      type: 'regular'
    },
    items: 2,
    total: 'BDT 34,500',
    payment: {
      method: 'Nagad',
      status: 'paid'
    },
    shipping: {
      method: 'Paperfly',
      address: 'Office Complex, Chittagong Port, Chittagong',
      status: 'delivered'
    },
    status: 'delivered',
    vendor: 'Home Comfort Store'
  },
  {
    id: 'ORD#12452',
    date: '2024-06-27 16:20',
    customer: {
      name: 'Nasir Uddin',
      email: 'nasir.u@email.com',
      phone: '+880 1512-789012',
      type: 'regular'
    },
    items: 8,
    total: 'BDT 8,900',
    payment: {
      method: 'Rocket',
      status: 'failed'
    },
    shipping: {
      method: 'Standard',
      address: 'Road 12, Khulna City, Khulna',
      status: 'cancelled'
    },
    status: 'cancelled',
    vendor: 'Fresh Foods Market'
  }
];

// Order statistics
const orderStats = {
  today: { count: 145, value: 'BDT 12.5L' },
  week: { count: 892, value: 'BDT 78.4L' },
  month: { count: 3456, value: 'BDT 3.2Cr' },
  pending: 23,
  processing: 45,
  shipped: 67,
  delivered: 234
};

const OrderList = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(ordersData.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (method: string, status: string) => {
    const methodBadge = (
      <Badge variant="outline" className="mr-1">
        {method}
      </Badge>
    );
    
    const statusIcon = status === 'paid' ? (
      <CheckCircle className="w-3 h-3 text-green-500" />
    ) : status === 'failed' ? (
      <XCircle className="w-3 h-3 text-red-500" />
    ) : (
      <Clock className="w-3 h-3 text-orange-500" />
    );

    return (
      <div className="flex items-center gap-1">
        {methodBadge}
        {statusIcon}
      </div>
    );
  };

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">VIP</Badge>;
      case 'regular':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Regular</Badge>;
      case 'new':
        return <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      currentPage="Order List"
      breadcrumbItems={[
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Order List' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage all customer orders
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.today.count}</div>
              <p className="text-xs text-gray-500 mt-1">Value: {orderStats.today.value}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.week.count}</div>
              <p className="text-xs text-gray-500 mt-1">Value: {orderStats.week.value}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.month.count}</div>
              <p className="text-xs text-gray-500 mt-1">Value: {orderStats.month.value}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-orange-600">Pending: {orderStats.pending}</span>
                  <span className="text-blue-600">Processing: {orderStats.processing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Shipped: {orderStats.shipped}</span>
                  <span className="text-green-600">Delivered: {orderStats.delivered}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {orderStats.pending > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {orderStats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="search">Search Orders</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        placeholder="Order ID, customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date-range">Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger id="date-range">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment">Payment Method</Label>
                    <Select value={filterPayment} onValueChange={setFilterPayment}>
                      <SelectTrigger id="payment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="bkash">bKash</SelectItem>
                        <SelectItem value="nagad">Nagad</SelectItem>
                        <SelectItem value="rocket">Rocket</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="vendor">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        <SelectItem value="multi">Multi-vendor Orders</SelectItem>
                        <SelectItem value="V001">Dhaka Electronics Hub</SelectItem>
                        <SelectItem value="V002">Fashion Paradise BD</SelectItem>
                        <SelectItem value="V003">Fresh Foods Market</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Orders</CardTitle>
                  {selectedOrders.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Labels
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Invoices
                      </Button>
                      <Button variant="outline" size="sm">
                        <Package className="w-4 h-4 mr-2" />
                        Bulk Update
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedOrders.length === ordersData.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Shipping</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.id}</div>
                            <div className="text-xs text-gray-500">{order.date}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{order.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {order.customer.name}
                                {getCustomerTypeBadge(order.customer.type)}
                              </div>
                              <div className="text-xs text-gray-500">{order.customer.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.items} items</div>
                          <div className="text-xs text-gray-500">{order.vendor}</div>
                        </TableCell>
                        <TableCell className="font-bold">{order.total}</TableCell>
                        <TableCell>{getPaymentBadge(order.payment.method, order.payment.status)}</TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {order.shipping.method}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.shipping.status}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Truck className="w-4 h-4 mr-2" />
                                Track Shipment
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Contact Customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing 1 to 5 of {orderStats.month.count} orders
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other status tabs would have similar content filtered by status */}
          <TabsContent value="pending">
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
                <p className="text-gray-500">Orders awaiting payment confirmation or processing</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                <Package className="w-4 h-4 mr-2 text-blue-600" />
                Bulk Process Orders
              </Button>
              <Button variant="outline" className="justify-start">
                <Truck className="w-4 h-4 mr-2 text-purple-600" />
                Assign to Courier
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2 text-green-600" />
                Export Daily Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="w-4 h-4 mr-2 text-orange-600" />
                Customer Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OrderList;