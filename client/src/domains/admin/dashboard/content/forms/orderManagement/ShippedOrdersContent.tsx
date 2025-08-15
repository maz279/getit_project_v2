
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Progress } from '@/shared/ui/progress';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  Edit, 
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw,
  Download,
  Printer,
  Star,
  User,
  Calendar,
  DollarSign,
  Navigation,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Globe,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export const ShippedOrdersContent: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock shipped orders data
  const shippedOrders = [
    {
      id: 'ORD-2024-001',
      orderNumber: '#12345',
      customer: {
        name: 'Sarah Ahmed',
        email: 'sarah@email.com',
        phone: '+8801712345678'
      },
      status: 'in-transit',
      carrier: 'Pathao Courier',
      trackingNumber: 'PT123456789BD',
      shippedDate: '2024-01-15T10:30:00Z',
      estimatedDelivery: '2024-01-17T18:00:00Z',
      actualDelivery: null,
      totalAmount: 2850,
      items: 3,
      weight: 1.2,
      shippingAddress: {
        name: 'Sarah Ahmed',
        street: '123 Main St',
        city: 'Dhaka',
        area: 'Dhanmondi',
        postalCode: '1205',
        country: 'Bangladesh',
        phone: '+8801712345678'
      },
      shippingMethod: 'Express Delivery',
      shippingCost: 150,
      deliveryProgress: 65,
      currentLocation: 'Dhaka Distribution Center',
      deliveryAttempts: 0,
      customerRating: null,
      notes: 'Handle with care - fragile items',
      insuranceValue: 2850,
      codAmount: 0,
      priority: 'high'
    },
    {
      id: 'ORD-2024-002',
      orderNumber: '#12346',
      customer: {
        name: 'Mohammad Rahman',
        email: 'rahman@email.com',
        phone: '+8801823456789'
      },
      status: 'out-for-delivery',
      carrier: 'Steadfast Courier',
      trackingNumber: 'SF987654321BD',
      shippedDate: '2024-01-14T14:20:00Z',
      estimatedDelivery: '2024-01-16T16:00:00Z',
      actualDelivery: null,
      totalAmount: 1650,
      items: 2,
      weight: 0.8,
      shippingAddress: {
        name: 'Mohammad Rahman',
        street: '456 Oak Ave',
        city: 'Chittagong',
        area: 'Agrabad',
        postalCode: '4100',
        country: 'Bangladesh',
        phone: '+8801823456789'
      },
      shippingMethod: 'Standard Delivery',
      shippingCost: 120,
      deliveryProgress: 85,
      currentLocation: 'Out for delivery - Chittagong Hub',
      deliveryAttempts: 0,
      customerRating: null,
      notes: '',
      insuranceValue: 1650,
      codAmount: 1650,
      priority: 'medium'
    },
    {
      id: 'ORD-2024-003',
      orderNumber: '#12347',
      customer: {
        name: 'Fatima Khan',
        email: 'fatima@email.com',
        phone: '+8801934567890'
      },
      status: 'delivered',
      carrier: 'RedX',
      trackingNumber: 'RX456789123BD',
      shippedDate: '2024-01-13T09:15:00Z',
      estimatedDelivery: '2024-01-15T17:00:00Z',
      actualDelivery: '2024-01-15T15:30:00Z',
      totalAmount: 3200,
      items: 5,
      weight: 2.1,
      shippingAddress: {
        name: 'Fatima Khan',
        street: '789 Pine Rd',
        city: 'Sylhet',
        area: 'Zindabazar',
        postalCode: '3100',
        country: 'Bangladesh',
        phone: '+8801934567890'
      },
      shippingMethod: 'Express Delivery',
      shippingCost: 180,
      deliveryProgress: 100,
      currentLocation: 'Delivered',
      deliveryAttempts: 1,
      customerRating: 5,
      notes: 'Customer very satisfied',
      insuranceValue: 3200,
      codAmount: 0,
      priority: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'out-for-delivery': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delivery-attempted': return 'bg-orange-100 text-orange-800';
      case 'exception': return 'bg-red-100 text-red-800';
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

  const filteredOrders = shippedOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCarrier = carrierFilter === 'all' || order.carrier === carrierFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesCarrier && matchesStatus;
  });

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

  // Shipping stats
  const shippingStats = [
    { key: 'in-transit', label: 'In Transit', count: 45, icon: Truck },
    { key: 'out-for-delivery', label: 'Out for Delivery', count: 23, icon: Navigation },
    { key: 'delivered', label: 'Delivered Today', count: 67, icon: CheckCircle },
    { key: 'exceptions', label: 'Exceptions', count: 5, icon: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipped Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage shipped orders and deliveries</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Tracking
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Shipping Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {shippingStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.key} className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === stat.key ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setStatusFilter(stat.key)}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Management</TabsTrigger>
          <TabsTrigger value="carriers">Carrier Performance</TabsTrigger>
          <TabsTrigger value="analytics">Shipping Analytics</TabsTrigger>
          <TabsTrigger value="settings">Shipping Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by order number, customer name, or tracking number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Carriers</SelectItem>
                      <SelectItem value="Pathao Courier">Pathao Courier</SelectItem>
                      <SelectItem value="Steadfast Courier">Steadfast</SelectItem>
                      <SelectItem value="RedX">RedX</SelectItem>
                      <SelectItem value="SA Paribahan">SA Paribahan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="exception">Exception</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
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
              </div>
              
              {selectedOrders.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{selectedOrders.length} selected</Badge>
                  <Button size="sm" variant="outline">Bulk Track Update</Button>
                  <Button size="sm" variant="outline">Send SMS Updates</Button>
                  <Button size="sm" variant="outline">Generate Reports</Button>
                  <Button size="sm" variant="outline">Print Labels</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipped Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Shipped Orders ({filteredOrders.length} orders)</CardTitle>
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
                      <TableHead>Order Info</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Shipping Details</TableHead>
                      <TableHead>Tracking & Status</TableHead>
                      <TableHead>Delivery Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => handleSelectOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-blue-600">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{order.items} items • ৳{order.totalAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Weight: {order.weight}kg</div>
                            <Badge className={getPriorityColor(order.priority)} variant="outline">
                              {order.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {order.customer.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {order.customer.phone}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.shippingAddress.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{order.carrier}</div>
                            <div className="text-xs text-gray-500 font-mono">{order.trackingNumber}</div>
                            <div className="text-xs text-gray-500">{order.shippingMethod}</div>
                            <div className="text-xs text-green-600">৳{order.shippingCost}</div>
                            {order.codAmount > 0 && (
                              <Badge variant="outline" className="text-xs">COD: ৳{order.codAmount}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-600">{order.currentLocation}</div>
                            <div className="text-xs text-gray-500">
                              Shipped: {new Date(order.shippedDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              ETA: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </div>
                            {order.actualDelivery && (
                              <div className="text-xs text-green-600">
                                Delivered: {new Date(order.actualDelivery).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{order.deliveryProgress}%</span>
                            </div>
                            <Progress value={order.deliveryProgress} className="h-2" />
                            {order.customerRating && (
                              <div className="flex items-center text-xs">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span>{order.customerRating}/5</span>
                              </div>
                            )}
                            {order.deliveryAttempts > 0 && (
                              <div className="text-xs text-orange-600">
                                Attempts: {order.deliveryAttempts}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Track Package">
                              <MapPin className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Contact Customer">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Print Label">
                              <Printer className="h-4 w-4" />
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

        <TabsContent value="delivery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Today's Deliveries</h4>
                      <p className="text-sm text-gray-600">67 orders scheduled</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Tomorrow's Deliveries</h4>
                      <p className="text-sm text-gray-600">45 orders scheduled</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">45</div>
                      <div className="text-xs text-gray-500">Planned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Failed Delivery Attempts</div>
                      <div className="text-xs text-gray-500">3 orders need attention</div>
                    </div>
                    <Button size="sm" variant="outline">Resolve</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Delayed Shipments</div>
                      <div className="text-xs text-gray-500">7 orders behind schedule</div>
                    </div>
                    <Button size="sm" variant="outline">Update</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Address Issues</div>
                      <div className="text-xs text-gray-500">2 orders need address verification</div>
                    </div>
                    <Button size="sm" variant="outline">Contact</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="carriers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Pathao Courier', 'Steadfast', 'RedX'].map((carrier) => (
              <Card key={carrier}>
                <CardHeader>
                  <CardTitle className="text-lg">{carrier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Shipments</span>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">On-Time Delivery</span>
                      <span className="font-semibold text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Delivery Time</span>
                      <span className="font-semibold">2.3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-semibold">4.2</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orders Shipped</span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orders Delivered</span>
                    <span className="font-semibold">67</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Success Rate</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Delivery Time</span>
                    <span className="font-semibold">2.1 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping Volume</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="font-semibold">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery Time</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="font-semibold">-8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="font-semibold">+5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Shipping Cost</span>
                    <span className="font-semibold">৳45,680</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost per Delivery</span>
                    <span className="font-semibold">৳135</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance Claims</span>
                    <span className="font-semibold">৳2,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Shipping</span>
                    <span className="font-semibold">৳3,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">5 Star Reviews</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">4 Star Reviews</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complaints</span>
                    <span className="font-semibold text-red-600">3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">4.6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-assign carriers</h4>
                      <p className="text-sm text-gray-600">Automatically assign best carrier based on location</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS notifications</h4>
                      <p className="text-sm text-gray-600">Send SMS updates to customers</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Insurance coverage</h4>
                      <p className="text-sm text-gray-600">Add insurance for high-value orders</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum delivery attempts</label>
                    <Input type="number" defaultValue="3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default delivery window (hours)</label>
                    <Input type="number" defaultValue="48" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto-return after (days)</label>
                    <Input type="number" defaultValue="7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
