
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
  CheckCircle, 
  Package, 
  MapPin, 
  Clock, 
  Star, 
  Eye, 
  Download,
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw,
  Printer,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  TrendingUp,
  Activity,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Award,
  ShoppingBag,
  Truck,
  Package2,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

export const DeliveredOrdersContent: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock delivered orders data
  const deliveredOrders = [
    {
      id: 'ORD-2024-001',
      orderNumber: '#12345',
      customer: {
        name: 'Sarah Ahmed',
        email: 'sarah@email.com',
        phone: '+8801712345678'
      },
      deliveryStatus: 'delivered',
      carrier: 'Pathao Courier',
      trackingNumber: 'PT123456789BD',
      orderedDate: '2024-01-10T10:30:00Z',
      shippedDate: '2024-01-12T14:20:00Z',
      deliveredDate: '2024-01-15T15:30:00Z',
      totalAmount: 2850,
      items: 3,
      shippingAddress: {
        name: 'Sarah Ahmed',
        street: '123 Main St',
        city: 'Dhaka',
        area: 'Dhanmondi',
        postalCode: '1205',
        country: 'Bangladesh'
      },
      deliveryTime: 120, // hours
      customerRating: 5,
      customerFeedback: 'Excellent service, fast delivery!',
      deliveryNotes: 'Delivered to customer directly',
      codAmount: 0,
      refundStatus: null,
      returnRequested: false,
      productsSatisfaction: 'excellent',
      deliveryExperience: 'excellent',
      wouldRecommend: true,
      deliveryAgent: 'Rafiq Khan',
      deliveryAttempts: 1,
      proofOfDelivery: true,
      signature: true
    },
    {
      id: 'ORD-2024-002',
      orderNumber: '#12346',
      customer: {
        name: 'Mohammad Rahman',
        email: 'rahman@email.com',
        phone: '+8801823456789'
      },
      deliveryStatus: 'delivered',
      carrier: 'Steadfast Courier',
      trackingNumber: 'SF987654321BD',
      orderedDate: '2024-01-08T09:15:00Z',
      shippedDate: '2024-01-10T11:45:00Z',
      deliveredDate: '2024-01-14T16:20:00Z',
      totalAmount: 1650,
      items: 2,
      shippingAddress: {
        name: 'Mohammad Rahman',
        street: '456 Oak Ave',
        city: 'Chittagong',
        area: 'Agrabad',
        postalCode: '4100',
        country: 'Bangladesh'
      },
      deliveryTime: 144, // hours
      customerRating: 4,
      customerFeedback: 'Good service, slight delay but acceptable',
      deliveryNotes: 'Left with neighbor as requested',
      codAmount: 1650,
      refundStatus: null,
      returnRequested: false,
      productsSatisfaction: 'good',
      deliveryExperience: 'good',
      wouldRecommend: true,
      deliveryAgent: 'Karim Uddin',
      deliveryAttempts: 2,
      proofOfDelivery: true,
      signature: false
    },
    {
      id: 'ORD-2024-003',
      orderNumber: '#12347',
      customer: {
        name: 'Fatima Khan',
        email: 'fatima@email.com',
        phone: '+8801934567890'
      },
      deliveryStatus: 'delivered',
      carrier: 'RedX',
      trackingNumber: 'RX456789123BD',
      orderedDate: '2024-01-05T14:30:00Z',
      shippedDate: '2024-01-07T08:15:00Z',
      deliveredDate: '2024-01-12T17:45:00Z',
      totalAmount: 3200,
      items: 5,
      shippingAddress: {
        name: 'Fatima Khan',
        street: '789 Pine Rd',
        city: 'Sylhet',
        area: 'Zindabazar',
        postalCode: '3100',
        country: 'Bangladesh'
      },
      deliveryTime: 168, // hours
      customerRating: 3,
      customerFeedback: 'Package was damaged, but items were okay',
      deliveryNotes: 'Package showed signs of rough handling',
      codAmount: 0,
      refundStatus: null,
      returnRequested: true,
      productsSatisfaction: 'average',
      deliveryExperience: 'poor',
      wouldRecommend: false,
      deliveryAgent: 'Nasir Ali',
      deliveryAttempts: 1,
      proofOfDelivery: true,
      signature: true
    }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionColor = (satisfaction: string) => {
    switch (satisfaction) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = deliveredOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCarrier = carrierFilter === 'all' || order.carrier === carrierFilter;
    const matchesRating = ratingFilter === 'all' || 
                         (ratingFilter === '5' && order.customerRating === 5) ||
                         (ratingFilter === '4' && order.customerRating === 4) ||
                         (ratingFilter === '3' && order.customerRating <= 3);
    
    return matchesSearch && matchesCarrier && matchesRating;
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

  // Delivery stats
  const deliveryStats = [
    { key: 'delivered-today', label: 'Delivered Today', count: 89, icon: CheckCircle },
    { key: 'excellent-ratings', label: 'Excellent Ratings', count: 67, icon: Star },
    { key: 'return-requests', label: 'Return Requests', count: 12, icon: RotateCcw },
    { key: 'pending-feedback', label: 'Pending Feedback', count: 23, icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivered Orders</h1>
          <p className="text-gray-600 mt-1">Manage completed deliveries and customer feedback</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {deliveryStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.key} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100">
                    <IconComponent className="h-6 w-6 text-green-600" />
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

      <Tabs defaultValue="delivered" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="delivered">Delivered Orders</TabsTrigger>
          <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Delivery Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Review</TabsTrigger>
          <TabsTrigger value="settings">Delivery Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="delivered" className="space-y-6">
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
                    </SelectContent>
                  </Select>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3 or Less</SelectItem>
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
                  <Button size="sm" variant="outline">Send Thank You Email</Button>
                  <Button size="sm" variant="outline">Request Feedback</Button>
                  <Button size="sm" variant="outline">Generate Report</Button>
                  <Button size="sm" variant="outline">Print Invoices</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivered Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders ({filteredOrders.length} orders)</CardTitle>
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
                      <TableHead>Delivery Details</TableHead>
                      <TableHead>Customer Feedback</TableHead>
                      <TableHead>Performance</TableHead>
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
                            <div className="text-xs text-gray-500">Tracking: {order.trackingNumber}</div>
                            <Badge className="bg-green-100 text-green-800" variant="outline">
                              DELIVERED
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
                            <div className="text-xs text-gray-500">Agent: {order.deliveryAgent}</div>
                            <div className="text-xs text-green-600">
                              Delivered: {new Date(order.deliveredDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Time: {Math.round(order.deliveryTime / 24)} days
                            </div>
                            <div className="text-xs text-gray-500">
                              Attempts: {order.deliveryAttempts}
                            </div>
                            {order.proofOfDelivery && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Proof Available
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Star className={`h-4 w-4 mr-1 ${getRatingColor(order.customerRating)}`} />
                              <span className={`font-medium ${getRatingColor(order.customerRating)}`}>
                                {order.customerRating}/5
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 max-w-48 truncate">
                              "{order.customerFeedback}"
                            </div>
                            <div className="space-y-1">
                              <Badge className={getSatisfactionColor(order.productsSatisfaction)} variant="outline">
                                Products: {order.productsSatisfaction}
                              </Badge>
                              <Badge className={getSatisfactionColor(order.deliveryExperience)} variant="outline">
                                Delivery: {order.deliveryExperience}
                              </Badge>
                            </div>
                            {order.wouldRecommend && (
                              <div className="flex items-center text-xs text-green-600">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Would recommend
                              </div>
                            )}
                            {order.returnRequested && (
                              <Badge variant="outline" className="text-xs text-orange-600">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Return Requested
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span>Delivery Score</span>
                                <span>{Math.round(order.customerRating * 20)}%</span>
                              </div>
                              <Progress value={order.customerRating * 20} className="h-1" />
                            </div>
                            <div className="flex items-center text-xs">
                              {order.deliveryTime <= 120 ? (
                                <div className="text-green-600 flex items-center">
                                  <Award className="h-3 w-3 mr-1" />
                                  Fast Delivery
                                </div>
                              ) : (
                                <div className="text-yellow-600 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Standard
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="View Feedback">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Print Invoice">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Download Report">
                              <Download className="h-4 w-4" />
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

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Overall Rating</h4>
                      <div className="flex items-center mt-1">
                        <Star className="h-5 w-5 text-yellow-500 mr-1" />
                        <span className="text-2xl font-bold">4.2</span>
                        <span className="text-gray-500 ml-2">out of 5</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Based on</div>
                      <div className="text-xl font-bold">1,234 reviews</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="h-3 w-3 text-yellow-500" />
                        <Progress value={rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : 5} className="flex-1 h-2" />
                        <span className="text-sm text-gray-500 w-10">{rating === 5 ? '60%' : rating === 4 ? '25%' : rating === 3 ? '10%' : '5%'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Product Quality</span>
                    <div className="flex items-center">
                      <Progress value={85} className="w-20 h-2 mr-2" />
                      <span className="font-semibold">4.3/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Speed</span>
                    <div className="flex items-center">
                      <Progress value={78} className="w-20 h-2 mr-2" />
                      <span className="font-semibold">3.9/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Packaging</span>
                    <div className="flex items-center">
                      <Progress value={90} className="w-20 h-2 mr-2" />
                      <span className="font-semibold">4.5/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Service</span>
                    <div className="flex items-center">
                      <Progress value={82} className="w-20 h-2 mr-2" />
                      <span className="font-semibold">4.1/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">On-Time Delivery</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Delivery Time</span>
                    <span className="font-semibold">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Attempt Success</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold text-green-600">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Rate</span>
                    <span className="font-semibold">3.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Damage Claims</span>
                    <span className="font-semibold text-red-600">1.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Issues</span>
                    <span className="font-semibold text-yellow-600">2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wrong Items</span>
                    <span className="font-semibold">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Loyalty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repeat Customers</span>
                    <span className="font-semibold text-green-600">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referral Rate</span>
                    <span className="font-semibold">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NPS Score</span>
                    <span className="font-semibold text-green-600">+42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Churn Rate</span>
                    <span className="font-semibold text-red-600">12%</span>
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
                    <span className="text-gray-600">Avg. Delivery Cost</span>
                    <span className="font-semibold">৳125</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Shipping</span>
                    <span className="font-semibold">৳15,400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Service</span>
                    <span className="font-semibold">৳8,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Savings</span>
                    <span className="font-semibold text-green-600">৳45,680</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Carriers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Pathao Courier', 'RedX', 'Steadfast'].map((carrier, index) => (
                    <div key={carrier} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{carrier}</div>
                          <div className="text-sm text-gray-500">
                            {index === 0 ? '95% satisfaction' : index === 1 ? '92% satisfaction' : '89% satisfaction'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {index === 0 ? '4.7' : index === 1 ? '4.5' : '4.2'}/5
                        </div>
                        <div className="text-xs text-gray-500">
                          {index === 0 ? '234 orders' : index === 1 ? '189 orders' : '156 orders'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Rafiq Khan', 'Karim Uddin', 'Nasir Ali'].map((agent, index) => (
                    <div key={agent} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{agent}</div>
                        <div className="text-sm text-gray-500">
                          {index === 0 ? 'Dhaka Zone' : index === 1 ? 'Chittagong Zone' : 'Sylhet Zone'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-semibold">
                            {index === 0 ? '4.8' : index === 1 ? '4.6' : '4.1'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {index === 0 ? '67 deliveries' : index === 1 ? '45 deliveries' : '32 deliveries'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Confirmation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-send delivery confirmation</h4>
                      <p className="text-sm text-gray-600">Send SMS/Email when order is delivered</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Request customer feedback</h4>
                      <p className="text-sm text-gray-600">Auto-request feedback 24hrs after delivery</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Proof of delivery required</h4>
                      <p className="text-sm text-gray-600">Require photo/signature for deliveries</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum satisfaction rating</label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3.0 Stars</SelectItem>
                        <SelectItem value="4">4.0 Stars</SelectItem>
                        <SelectItem value="4.5">4.5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alert for low ratings below</label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2.0 Stars</SelectItem>
                        <SelectItem value="3">3.0 Stars</SelectItem>
                        <SelectItem value="3.5">3.5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
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
