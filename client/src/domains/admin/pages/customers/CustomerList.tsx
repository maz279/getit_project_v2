/**
 * Customer List - Comprehensive customer management interface
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  Users, Search, Filter, Download, Eye, Mail, Phone, MessageSquare,
  Star, ShoppingBag, Calendar, MapPin, MoreVertical, TrendingUp,
  UserPlus, Ban, CheckCircle, AlertCircle, Gift, CreditCard
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
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

// Sample customer data
const customersData = [
  {
    id: 'CUST001',
    name: 'Fatima Rahman',
    email: 'fatima.r@email.com',
    phone: '+880 1712-345678',
    location: 'Dhaka',
    joinDate: '2023-03-15',
    status: 'active',
    type: 'vip',
    totalOrders: 45,
    totalSpent: 'BDT 2,45,670',
    lastOrder: '2 days ago',
    loyaltyPoints: 2450,
    avgOrderValue: 'BDT 5,459',
    preferredPayment: 'bKash',
    tags: ['frequent_buyer', 'electronics']
  },
  {
    id: 'CUST002',
    name: 'Karim Ahmed',
    email: 'karim.ahmed@email.com',
    phone: '+880 1812-456789',
    location: 'Chittagong',
    joinDate: '2023-06-20',
    status: 'active',
    type: 'regular',
    totalOrders: 23,
    totalSpent: 'BDT 1,23,450',
    lastOrder: '1 week ago',
    loyaltyPoints: 1234,
    avgOrderValue: 'BDT 5,367',
    preferredPayment: 'Credit Card',
    tags: ['fashion', 'seasonal_shopper']
  },
  {
    id: 'CUST003',
    name: 'Ayesha Begum',
    email: 'ayesha.b@email.com',
    phone: '+880 1912-567890',
    location: 'Sylhet',
    joinDate: '2024-01-10',
    status: 'active',
    type: 'new',
    totalOrders: 3,
    totalSpent: 'BDT 12,890',
    lastOrder: '3 weeks ago',
    loyaltyPoints: 128,
    avgOrderValue: 'BDT 4,296',
    preferredPayment: 'COD',
    tags: ['new_customer']
  },
  {
    id: 'CUST004',
    name: 'Hasan Ali',
    email: 'hasan.ali@email.com',
    phone: '+880 1612-678901',
    location: 'Rajshahi',
    joinDate: '2022-11-05',
    status: 'inactive',
    type: 'regular',
    totalOrders: 67,
    totalSpent: 'BDT 3,45,678',
    lastOrder: '2 months ago',
    loyaltyPoints: 3456,
    avgOrderValue: 'BDT 5,159',
    preferredPayment: 'Nagad',
    tags: ['high_value', 'inactive']
  },
  {
    id: 'CUST005',
    name: 'Nasir Uddin',
    email: 'nasir.u@email.com',
    phone: '+880 1512-789012',
    location: 'Khulna',
    joinDate: '2023-09-12',
    status: 'blocked',
    type: 'regular',
    totalOrders: 12,
    totalSpent: 'BDT 45,670',
    lastOrder: '4 months ago',
    loyaltyPoints: 0,
    avgOrderValue: 'BDT 3,805',
    preferredPayment: 'Rocket',
    tags: ['blocked', 'fraud_risk']
  }
];

// Customer statistics
const customerStats = {
  total: 15234,
  active: 13456,
  new: 1234,
  vip: 456,
  avgLifetimeValue: 'BDT 87,650',
  avgOrderFrequency: '2.3/month'
};

const CustomerList = () => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customersData.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>;
      case 'regular':
        return <Badge className="bg-blue-100 text-blue-800">Regular</Badge>;
      case 'new':
        return <Badge className="bg-green-100 text-green-800">New</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <AdminLayout
      currentPage="Customer List"
      breadcrumbItems={[
        { label: 'Customers', href: '/admin/customers' },
        { label: 'Customer List' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Customer Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and analyze your customer base
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.total.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">+234 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{customerStats.active.toLocaleString()}</div>
              <Progress value={88} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">New Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{customerStats.new}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">VIP Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{customerStats.vip}</div>
              <p className="text-xs text-gray-500 mt-1">Top spenders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Lifetime Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.avgLifetimeValue}</div>
              <p className="text-xs text-green-600 mt-1">+12% growth</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Order Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.avgOrderFrequency}</div>
              <p className="text-xs text-gray-500 mt-1">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Customers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="search">Search Customers</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search"
                        placeholder="Name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="location">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="dhaka">Dhaka</SelectItem>
                        <SelectItem value="chittagong">Chittagong</SelectItem>
                        <SelectItem value="sylhet">Sylhet</SelectItem>
                        <SelectItem value="rajshahi">Rajshahi</SelectItem>
                        <SelectItem value="khulna">Khulna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="spending">Spending Range</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="spending">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ranges</SelectItem>
                        <SelectItem value="0-50k">BDT 0 - 50k</SelectItem>
                        <SelectItem value="50k-2l">BDT 50k - 2L</SelectItem>
                        <SelectItem value="2l-5l">BDT 2L - 5L</SelectItem>
                        <SelectItem value="5l+">BDT 5L+</SelectItem>
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

            {/* Customer Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Customers</CardTitle>
                  {selectedCustomers.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Selected
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        SMS Campaign
                      </Button>
                      <Button variant="outline" size="sm">
                        <Gift className="w-4 h-4 mr-2" />
                        Send Coupon
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
                          checked={selectedCustomers.length === customersData.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">ID: {customer.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {customer.location}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(customer.type)}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{customer.totalOrders}</div>
                            <div className="text-xs text-gray-500">orders</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.totalSpent}</div>
                            <div className="text-xs text-gray-500">Avg: {customer.avgOrderValue}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{customer.lastOrder}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedCustomer(customer);
                                setShowCustomerDetails(true);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                View Orders
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Gift className="w-4 h-4 mr-2" />
                                Loyalty Points
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.status === 'active' ? (
                                <DropdownMenuItem className="text-red-600">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Block Customer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate Customer
                                </DropdownMenuItem>
                              )}
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
                    Showing 1 to 5 of {customerStats.total.toLocaleString()} customers
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

          {/* Other tabs would have filtered content */}
          <TabsContent value="vip">
            <Card>
              <CardContent className="py-8 text-center">
                <Star className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">VIP Customers</h3>
                <p className="text-gray-500">Your most valuable customers with highest lifetime value</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Distribution by customer type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Regular Customers</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">New Customers</span>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <Progress value={22} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">VIP Customers</span>
                    <span className="text-sm font-medium">7%</span>
                  </div>
                  <Progress value={7} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Inactive</span>
                    <span className="text-sm font-medium">3%</span>
                  </div>
                  <Progress value={3} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Payment Methods</CardTitle>
              <CardDescription>Customer payment preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { method: 'bKash', percentage: 35, count: 5340 },
                  { method: 'Credit/Debit Card', percentage: 25, count: 3808 },
                  { method: 'Cash on Delivery', percentage: 20, count: 3046 },
                  { method: 'Nagad', percentage: 12, count: 1828 },
                  { method: 'Rocket', percentage: 8, count: 1218 }
                ].map((payment) => (
                  <div key={payment.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{payment.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{payment.count} customers</span>
                      <Badge variant="outline">{payment.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details Dialog */}
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeBadge(selectedCustomer.type)}
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{selectedCustomer.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Joined: {selectedCustomer.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Shopping Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Orders:</span>
                        <span className="font-medium">{selectedCustomer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Spent:</span>
                        <span className="font-medium">{selectedCustomer.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Order Value:</span>
                        <span className="font-medium">{selectedCustomer.avgOrderValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loyalty Points:</span>
                        <span className="font-medium">{selectedCustomer.loyaltyPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Tags & Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                    <Badge variant="outline">
                      Prefers: {selectedCustomer.preferredPayment}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Order History
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Customer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CustomerList;