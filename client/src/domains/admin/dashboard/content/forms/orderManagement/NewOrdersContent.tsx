
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Separator } from '@/shared/ui/separator';
import { AlertCircle, Bell, Calendar, Check, ChevronRight, Clock, Download, Eye, Filter, MapPin, Package, PackageCheck, Phone, Plus, RefreshCw, Search, ShoppingBag, Star, Truck, User, X } from 'lucide-react';

export const NewOrdersContent: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  // Mock new orders data
  const newOrdersData = [
    {
      id: 'ORD-2024-015',
      customer: 'Rashida Begum',
      email: 'rashida@example.com',
      phone: '+8801712345678',
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'bKash',
      total: 3250,
      items: 4,
      orderDate: '2024-01-15T16:45:00Z',
      shippingAddress: 'Dhanmondi, Dhaka-1205',
      vendor: 'Fashion Central',
      priority: 'high',
      orderSource: 'mobile-app',
      estimatedDelivery: '2024-01-18',
      products: [
        { name: 'Cotton Saree', quantity: 1, price: 1500 },
        { name: 'Silk Scarf', quantity: 2, price: 750 },
        { name: 'Jewelry Set', quantity: 1, price: 1000 }
      ],
      customerNotes: 'Please deliver before Friday evening',
      urgentFlag: true
    },
    {
      id: 'ORD-2024-016',
      customer: 'Mohammad Ali',
      email: 'ali@example.com',
      phone: '+8801823456789',
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'Nagad',
      total: 1850,
      items: 2,
      orderDate: '2024-01-15T16:30:00Z',
      shippingAddress: 'Gulshan, Dhaka-1212',
      vendor: 'Tech Hub BD',
      priority: 'medium',
      orderSource: 'website',
      estimatedDelivery: '2024-01-17',
      products: [
        { name: 'Smartphone Case', quantity: 1, price: 650 },
        { name: 'Wireless Charger', quantity: 1, price: 1200 }
      ],
      customerNotes: '',
      urgentFlag: false
    },
    {
      id: 'ORD-2024-017',
      customer: 'Fatima Khan',
      email: 'fatima.k@example.com',
      phone: '+8801934567890',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash-on-delivery',
      total: 950,
      items: 1,
      orderDate: '2024-01-15T16:15:00Z',
      shippingAddress: 'Uttara, Dhaka-1230',
      vendor: 'Home Essentials',
      priority: 'low',
      orderSource: 'website',
      estimatedDelivery: '2024-01-19',
      products: [
        { name: 'Kitchen Organizer Set', quantity: 1, price: 950 }
      ],
      customerNotes: 'Call before delivery',
      urgentFlag: false
    },
    {
      id: 'ORD-2024-018',
      customer: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '+8801645678901',
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'Rocket',
      total: 2750,
      items: 3,
      orderDate: '2024-01-15T16:00:00Z',
      shippingAddress: 'Wari, Dhaka-1203',
      vendor: 'Electronics Pro',
      priority: 'high',
      orderSource: 'mobile-app',
      estimatedDelivery: '2024-01-17',
      products: [
        { name: 'Bluetooth Headphones', quantity: 1, price: 1500 },
        { name: 'Power Bank', quantity: 1, price: 800 },
        { name: 'USB Cable', quantity: 1, price: 450 }
      ],
      customerNotes: 'Office delivery preferred',
      urgentFlag: true
    }
  ];

  const filteredOrders = newOrdersData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on orders:`, selectedOrders);
    // Implement bulk action logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Orders</h1>
          <p className="text-gray-600 mt-1">Manage newly received orders requiring attention</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Manual Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Orders Today</p>
                <p className="text-2xl font-bold text-gray-900">{newOrdersData.length}</p>
                <p className="text-xs text-green-600">+12% from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {newOrdersData.filter(o => o.status === 'pending').length}
                </p>
                <p className="text-xs text-red-600">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {newOrdersData.filter(o => o.urgentFlag).length}
                </p>
                <p className="text-xs text-red-600">High priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{newOrdersData.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">Revenue today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Order Queue</TabsTrigger>
          <TabsTrigger value="processing">Quick Process</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters and Search */}
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                      <SelectItem value="amount-low">Amount: Low to High</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedOrders.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">{selectedOrders.length} orders selected</Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleBulkAction('confirm')}>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm All
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('assign')}>
                        <Truck className="h-4 w-4 mr-2" />
                        Assign Courier
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('print')}>
                        <Download className="h-4 w-4 mr-2" />
                        Print Labels
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrders([])}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Orders Queue</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">
                    {newOrdersData.filter(o => o.urgentFlag).length} Urgent
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {newOrdersData.filter(o => o.paymentStatus === 'pending').length} Payment Pending
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrders.length === filteredOrders.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className={`hover:bg-gray-50 ${order.urgentFlag ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => handleSelectOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-blue-600">{order.id}</span>
                              {order.urgentFlag && (
                                <Badge className="bg-red-100 text-red-800 text-xs">URGENT</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.orderDate).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">{order.orderSource}</div>
                            <div className="text-sm font-medium">৳{order.total.toLocaleString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{order.customer}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {order.phone}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.shippingAddress}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </Badge>
                            <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{order.items} items</div>
                            <div className="text-xs text-gray-500">
                              {order.products.slice(0, 2).map(p => p.name).join(', ')}
                              {order.products.length > 2 && '...'}
                            </div>
                            <div className="text-xs text-gray-400">{order.vendor}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <Badge className={getPriorityColor(order.priority)} variant="outline">
                              {order.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm">
                              <PackageCheck className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Processing Tools</CardTitle>
              <p className="text-sm text-gray-600">Streamline order processing with automated tools</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Auto-Confirmation Rules</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Auto-confirm paid orders</Label>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-assign courier for urgent orders</Label>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Send confirmation SMS</Label>
                      <Checkbox />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Processing Templates</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Standard Processing
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Express Processing
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Bulk Processing
                    </Button>
                  </div>
                </Card>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Bulk Processing Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col">
                    <Check className="h-6 w-6 mb-2" />
                    Confirm All Paid Orders
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Truck className="h-6 w-6 mb-2" />
                    Assign Default Courier
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Bell className="h-6 w-6 mb-2" />
                    Send Batch Notifications
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  [Chart: New orders over time]
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Processing Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Processing Time</span>
                    <span className="font-semibold">2.5 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fastest Processing</span>
                    <span className="font-semibold">15 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders Processed Today</span>
                    <span className="font-semibold">47</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Orders Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="notification-threshold">Notification Threshold</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select threshold..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 orders</SelectItem>
                    <SelectItem value="10">10 orders</SelectItem>
                    <SelectItem value="20">20 orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="auto-refresh">Auto Refresh Interval</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every minute</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Email Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="new-order-email" />
                    <Label htmlFor="new-order-email">New order received</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="urgent-order-email" />
                    <Label htmlFor="urgent-order-email">Urgent order alert</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
