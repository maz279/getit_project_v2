/**
 * Order Tracking - Real-time order tracking and delivery management
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  MapPin, Truck, Package, CheckCircle, Clock, Phone, Navigation,
  MessageSquare, AlertCircle, User, Calendar, BarChart3, RefreshCw,
  Camera, FileText, Copy, ExternalLink, Info
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/shared/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';

// Sample tracking data
const trackingData = [
  {
    orderId: 'ORD#12456',
    trackingNumber: 'PTH2024062812456',
    courier: 'Pathao',
    status: 'in_transit',
    currentLocation: 'Dhanmondi Hub, Dhaka',
    destination: 'House 123, Road 45, Dhanmondi, Dhaka',
    customer: 'Fatima Rahman',
    phone: '+880 1712-345678',
    estimatedDelivery: '2024-06-29 14:00',
    riderName: 'Karim Ahmed',
    riderPhone: '+880 1812-999888',
    progress: 65,
    timeline: [
      { time: '2024-06-28 14:30', status: 'Order placed', location: 'Online', completed: true },
      { time: '2024-06-28 16:45', status: 'Picked up from warehouse', location: 'Mohakhali Warehouse', completed: true },
      { time: '2024-06-28 17:30', status: 'Arrived at sorting center', location: 'Dhaka Central Hub', completed: true },
      { time: '2024-06-28 20:15', status: 'Out for delivery', location: 'Dhanmondi Hub', completed: true },
      { time: '2024-06-29 14:00', status: 'Estimated delivery', location: 'Customer Address', completed: false }
    ]
  },
  {
    orderId: 'ORD#12455',
    trackingNumber: 'PFL2024062812455',
    courier: 'Paperfly',
    status: 'delivered',
    currentLocation: 'Delivered',
    destination: 'Apartment 5B, Green Tower, Gulshan, Dhaka',
    customer: 'Karim Ahmed',
    phone: '+880 1812-456789',
    deliveredTime: '2024-06-28 11:30',
    riderName: 'Hasan Ali',
    riderPhone: '+880 1912-888777',
    progress: 100,
    signature: true,
    photo: true
  },
  {
    orderId: 'ORD#12454',
    trackingNumber: 'SUN2024062812454',
    courier: 'Sundarban Courier',
    status: 'pending_pickup',
    currentLocation: 'Warehouse',
    destination: 'Village Market, Sylhet Sadar, Sylhet',
    customer: 'Ayesha Begum',
    phone: '+880 1912-567890',
    scheduledPickup: '2024-06-29 10:00',
    progress: 10
  }
];

// Delivery statistics
const deliveryStats = {
  inTransit: 145,
  delivered: 892,
  pending: 45,
  failed: 12,
  avgDeliveryTime: '1.8 days',
  onTimeDelivery: '94.5%'
};

const OrderTracking = () => {
  const [selectedOrder, setSelectedOrder] = useState(trackingData[0]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [filterCourier, setFilterCourier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_pickup':
        return <Badge variant="secondary">Pending Pickup</Badge>;
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-purple-100 text-purple-800">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed Delivery</Badge>;
      case 'returned':
        return <Badge variant="outline">Returned</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCourierBadge = (courier: string) => {
    const courierColors: { [key: string]: string } = {
      'Pathao': 'bg-orange-100 text-orange-800',
      'Paperfly': 'bg-blue-100 text-blue-800',
      'Sundarban Courier': 'bg-green-100 text-green-800',
      'RedX': 'bg-red-100 text-red-800',
      'eCourier': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={courierColors[courier] || 'bg-gray-100 text-gray-800'}>
        {courier}
      </Badge>
    );
  };

  return (
    <AdminLayout
      currentPage="Order Tracking"
      breadcrumbItems={[
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Order Tracking' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order Tracking Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time tracking and delivery management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Delivery Analytics
            </Button>
          </div>
        </div>

        {/* Delivery Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{deliveryStats.inTransit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Delivered Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{deliveryStats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{deliveryStats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryStats.avgDeliveryTime}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">On-Time Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{deliveryStats.onTimeDelivery}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Search */}
        <Card>
          <CardHeader>
            <CardTitle>Track Order</CardTitle>
            <CardDescription>Search by order ID or tracking number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Enter order ID or tracking number..."
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button>Track Order</Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tracking Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Active Shipments</CardTitle>
                  <div className="flex gap-2">
                    <Select value={filterCourier} onValueChange={setFilterCourier}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Couriers</SelectItem>
                        <SelectItem value="pathao">Pathao</SelectItem>
                        <SelectItem value="paperfly">Paperfly</SelectItem>
                        <SelectItem value="sundarban">Sundarban</SelectItem>
                        <SelectItem value="redx">RedX</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.map((order) => (
                    <div 
                      key={order.orderId}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{order.orderId}</h4>
                            {getCourierBadge(order.courier)}
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Tracking: {order.trackingNumber}</p>
                            <p>Customer: {order.customer} • {order.phone}</p>
                            <p className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {order.currentLocation}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {order.status === 'delivered' ? (
                            <div className="text-sm">
                              <p className="text-green-600 font-medium">Delivered</p>
                              <p className="text-gray-500">{order.deliveredTime}</p>
                            </div>
                          ) : order.status === 'in_transit' ? (
                            <div className="text-sm">
                              <p className="text-blue-600 font-medium">ETA</p>
                              <p className="text-gray-500">{order.estimatedDelivery}</p>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <p className="text-orange-600 font-medium">Scheduled</p>
                              <p className="text-gray-500">{order.scheduledPickup}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={order.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tracking Details</CardTitle>
                <CardDescription>Order #{selectedOrder.orderId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Status */}
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {selectedOrder.status === 'in_transit' && 'Package In Transit'}
                    {selectedOrder.status === 'delivered' && 'Package Delivered'}
                    {selectedOrder.status === 'pending_pickup' && 'Awaiting Pickup'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.currentLocation}</p>
                </div>

                {/* Delivery Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Delivery Progress</span>
                    <span className="font-medium">{selectedOrder.progress}%</span>
                  </div>
                  <Progress value={selectedOrder.progress} className="h-3" />
                </div>

                {/* Rider Information */}
                {selectedOrder.riderName && (
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Delivery Partner
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedOrder.riderName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto"
                          onClick={() => setShowContactDialog(true)}
                        >
                          {selectedOrder.riderPhone}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span>Motorcycle</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {selectedOrder.timeline && (
                  <div>
                    <h4 className="font-medium mb-3">Delivery Timeline</h4>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center
                              ${event.completed 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'}
                            `}>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            {index < selectedOrder.timeline.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <p className="font-medium text-sm">{event.status}</p>
                            <p className="text-xs text-gray-500">{event.location}</p>
                            <p className="text-xs text-gray-400">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proof of Delivery */}
                {selectedOrder.status === 'delivered' && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Proof of Delivery</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedOrder.signature && (
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          View Signature
                        </Button>
                      )}
                      {selectedOrder.photo && (
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          View Photo
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowDetailsDialog(true)}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View Full Details
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Tracking Number
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Track on Courier Site
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Tracking Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Live Tracking Map</CardTitle>
            <CardDescription>Real-time delivery location tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Live tracking map integration</p>
                <p className="text-sm text-gray-400 mt-2">
                  Shows real-time location of delivery partners
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Delivery Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Delivery Issues</CardTitle>
            <CardDescription>Orders requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">ORD#12453</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Failed Delivery</Badge>
                  </TableCell>
                  <TableCell>Pathao</TableCell>
                  <TableCell>Rahman Ali</TableCell>
                  <TableCell>2 hours ago</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Resolve</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ORD#12450</TableCell>
                  <TableCell>
                    <Badge variant="outline">Wrong Address</Badge>
                  </TableCell>
                  <TableCell>Paperfly</TableCell>
                  <TableCell>Nasir Khan</TableCell>
                  <TableCell>4 hours ago</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Delivery Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {selectedOrder.riderName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedOrder.riderName}</h4>
                  <p className="text-sm text-gray-500">{selectedOrder.riderPhone}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Rider
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
              </div>

              <div>
                <Label htmlFor="message">Quick Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message to rider..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default OrderTracking;