/**
 * Returns & Refunds - Return and refund management system
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  RotateCcw, Package, DollarSign, CheckCircle, XCircle, Clock,
  AlertTriangle, Camera, FileText, MessageSquare, TrendingUp,
  Truck, CreditCard, Info, Filter, Download, User
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';

// Sample returns data
const returnsData = [
  {
    id: 'RET#5678',
    orderId: 'ORD#12456',
    date: '2024-06-28',
    customer: {
      name: 'Fatima Rahman',
      email: 'fatima.r@email.com',
      phone: '+880 1712-345678'
    },
    item: {
      name: 'Samsung 55" Crystal 4K Smart TV',
      sku: 'ELEC-TV-SAM-001',
      price: 'BDT 65,990',
      vendor: 'Dhaka Electronics Hub'
    },
    reason: 'Defective Product',
    description: 'Display has dead pixels in the corner',
    status: 'pending',
    type: 'return',
    refundAmount: 'BDT 65,990',
    images: 2,
    priority: 'high'
  },
  {
    id: 'RET#5677',
    orderId: 'ORD#12455',
    date: '2024-06-27',
    customer: {
      name: 'Karim Ahmed',
      email: 'karim.ahmed@email.com',
      phone: '+880 1812-456789'
    },
    item: {
      name: 'Premium Cotton Saree Collection',
      sku: 'FASH-SAR-CTN-002',
      price: 'BDT 2,450',
      vendor: 'Fashion Paradise BD'
    },
    reason: 'Wrong Size',
    description: 'Ordered medium but received large',
    status: 'approved',
    type: 'exchange',
    refundAmount: 'BDT 0',
    images: 1,
    priority: 'medium'
  },
  {
    id: 'RET#5676',
    orderId: 'ORD#12453',
    date: '2024-06-26',
    customer: {
      name: 'Hasan Ali',
      email: 'hasan.ali@email.com',
      phone: '+880 1612-678901'
    },
    item: {
      name: 'Walton AC 1.5 Ton Inverter',
      sku: 'HOME-AC-WAL-003',
      price: 'BDT 52,000',
      vendor: 'Home Comfort Store'
    },
    reason: 'Not as Described',
    description: 'Product specifications don\'t match listing',
    status: 'investigating',
    type: 'return',
    refundAmount: 'BDT 52,000',
    images: 3,
    priority: 'high'
  }
];

// Return statistics
const returnStats = {
  pending: 23,
  approved: 45,
  rejected: 8,
  completed: 156,
  avgProcessingTime: '2.3 days',
  returnRate: '2.8%'
};

// Return reasons
const returnReasons = [
  'Defective Product',
  'Wrong Size/Color',
  'Not as Described',
  'Damaged in Shipping',
  'Changed Mind',
  'Found Better Price',
  'Other'
];

const ReturnsRefunds = () => {
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-800">Investigating</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'return':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Return</Badge>;
      case 'refund':
        return <Badge variant="outline" className="border-green-500 text-green-600">Refund</Badge>;
      case 'exchange':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Exchange</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      currentPage="Returns & Refunds"
      breadcrumbItems={[
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Returns & Refunds' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Returns & Refunds Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Process return requests and manage refunds
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Return Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{returnStats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{returnStats.approved}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to process</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{returnStats.rejected}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnStats.completed}</div>
              <p className="text-xs text-gray-500 mt-1">Total processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnStats.avgProcessingTime}</div>
              <p className="text-xs text-gray-500 mt-1">Processing time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Return Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnStats.returnRate}</div>
              <p className="text-xs text-green-600 mt-1">Below average</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">
              Pending
              {returnStats.pending > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {returnStats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="investigating">Investigating</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search returns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="return">Returns</SelectItem>
                      <SelectItem value="refund">Refunds Only</SelectItem>
                      <SelectItem value="exchange">Exchanges</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reasons</SelectItem>
                      {returnReasons.map(reason => (
                        <SelectItem key={reason} value={reason.toLowerCase().replace(/\s+/g, '-')}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Returns List */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Return Requests</CardTitle>
                <CardDescription>Review and process return/refund requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnsData.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.id}</div>
                            <div className="text-xs text-gray-500">Order: {returnItem.orderId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {returnItem.customer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{returnItem.customer.name}</div>
                              <div className="text-xs text-gray-500">{returnItem.customer.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{returnItem.item.name}</div>
                            <div className="text-xs text-gray-500">
                              {returnItem.item.vendor} • {returnItem.item.price}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{returnItem.reason}</div>
                            <div className="text-xs text-gray-500">{returnItem.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(returnItem.type)}</TableCell>
                        <TableCell className="font-bold">{returnItem.refundAmount}</TableCell>
                        <TableCell>{getPriorityBadge(returnItem.priority)}</TableCell>
                        <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedReturn(returnItem);
                                setShowApprovalDialog(true);
                              }}
                            >
                              Review
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* High Priority Alert */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong>3 high-priority returns</strong> require immediate attention. 
                These involve expensive items or have been pending for over 48 hours.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Other tabs would have similar content */}
          <TabsContent value="approved">
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Approved Returns</h3>
                <p className="text-gray-500">Returns approved and awaiting processing</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Return Reasons Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Reasons Distribution</CardTitle>
              <CardDescription>Most common reasons for returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { reason: 'Defective Product', count: 45, percentage: 35 },
                  { reason: 'Wrong Size/Color', count: 32, percentage: 25 },
                  { reason: 'Not as Described', count: 28, percentage: 22 },
                  { reason: 'Damaged in Shipping', count: 15, percentage: 12 },
                  { reason: 'Changed Mind', count: 8, percentage: 6 }
                ].map((item) => (
                  <div key={item.reason} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.reason}</span>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Return Rates</CardTitle>
              <CardDescription>Returns by vendor (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dhaka Electronics Hub</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>2.3%</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Improving
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fashion Paradise BD</TableCell>
                    <TableCell>23</TableCell>
                    <TableCell>3.8%</TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        Stable
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Home Comfort Store</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>1.5%</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Excellent
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Return Approval Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Return Request</DialogTitle>
            </DialogHeader>
            {selectedReturn && (
              <div className="space-y-6">
                {/* Return Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Name:</span> {selectedReturn.customer.name}</p>
                      <p><span className="text-gray-600">Email:</span> {selectedReturn.customer.email}</p>
                      <p><span className="text-gray-600">Phone:</span> {selectedReturn.customer.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Product Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Product:</span> {selectedReturn.item.name}</p>
                      <p><span className="text-gray-600">SKU:</span> {selectedReturn.item.sku}</p>
                      <p><span className="text-gray-600">Price:</span> {selectedReturn.item.price}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Return Reason */}
                <div>
                  <h4 className="font-medium mb-2">Return Details</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{selectedReturn.reason}</Badge>
                      {getTypeBadge(selectedReturn.type)}
                      {getPriorityBadge(selectedReturn.priority)}
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedReturn.description}
                    </p>
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <h4 className="font-medium mb-2">Submitted Evidence</h4>
                  <div className="flex gap-3">
                    {[...Array(selectedReturn.images)].map((_, i) => (
                      <div key={i} className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision */}
                <div>
                  <h4 className="font-medium mb-2">Decision</h4>
                  <RadioGroup defaultValue="approve">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="approve" id="approve" />
                        <div className="flex-1">
                          <Label htmlFor="approve" className="font-normal">
                            Approve Return
                          </Label>
                          <p className="text-sm text-gray-500">Accept the return request and process refund</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="reject" id="reject" />
                        <div className="flex-1">
                          <Label htmlFor="reject" className="font-normal">
                            Reject Return
                          </Label>
                          <p className="text-sm text-gray-500">Deny the return request with reason</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="investigate" id="investigate" />
                        <div className="flex-1">
                          <Label htmlFor="investigate" className="font-normal">
                            Need More Information
                          </Label>
                          <p className="text-sm text-gray-500">Request additional evidence or clarification</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Admin Notes */}
                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this decision..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowApprovalDialog(false);
                setShowRefundDialog(true);
              }}>
                Process Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Processing Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Refund Amount</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input defaultValue="65990" />
                  <span className="text-sm text-gray-500">BDT</span>
                </div>
              </div>

              <div>
                <Label>Refund Method</Label>
                <RadioGroup defaultValue="original" className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="original" id="original" />
                    <Label htmlFor="original">Original Payment Method (bKash)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit">Store Credit</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="refund-notes">Refund Notes</Label>
                <Textarea
                  id="refund-notes"
                  placeholder="Add any notes about this refund..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Refund will be processed within 3-5 business days after approval.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                Cancel
              </Button>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReturnsRefunds;