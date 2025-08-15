/**
 * Order Processing - Order fulfillment and processing workflow
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, User, MapPin,
  FileText, Printer, QrCode, Phone, Mail, MessageSquare, Camera,
  BarChart3, DollarSign, Tag, Box, Weight, Ruler
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';

// Sample processing order data
const processingOrder = {
  id: 'ORD#12456',
  date: '2024-06-28 14:23',
  customer: {
    name: 'Fatima Rahman',
    email: 'fatima.r@email.com',
    phone: '+880 1712-345678',
    address: 'House 123, Road 45, Dhanmondi, Dhaka-1209',
    area: 'Dhanmondi',
    city: 'Dhaka',
    type: 'regular'
  },
  items: [
    {
      id: 'ITEM001',
      sku: 'ELEC-TV-SAM-001',
      name: 'Samsung 55" Crystal 4K Smart TV',
      vendor: 'Dhaka Electronics Hub',
      quantity: 1,
      price: 'BDT 65,990',
      status: 'ready',
      location: 'A-12-3'
    },
    {
      id: 'ITEM002',
      sku: 'FASH-SAR-CTN-002',
      name: 'Premium Cotton Saree Collection',
      vendor: 'Fashion Paradise BD',
      quantity: 2,
      price: 'BDT 4,900',
      status: 'picking',
      location: 'B-05-7'
    },
    {
      id: 'ITEM003',
      sku: 'HOME-PLW-SFT-003',
      name: 'Soft Cotton Pillow Set',
      vendor: 'Home Comfort Store',
      quantity: 4,
      price: 'BDT 2,400',
      status: 'pending',
      location: 'C-08-2'
    }
  ],
  payment: {
    method: 'bKash',
    status: 'paid',
    transactionId: 'BKS2024062812345',
    amount: 'BDT 73,290'
  },
  shipping: {
    method: 'Pathao',
    type: 'Express Delivery',
    cost: 'BDT 120',
    estimatedDelivery: '2024-06-29',
    trackingNumber: null
  },
  processingStatus: 'picking',
  progress: 35
};

// Processing statistics
const processingStats = {
  pending: 45,
  picking: 23,
  packing: 18,
  ready: 34,
  avgTime: '2.5 hrs'
};

const OrderProcessing = () => {
  const [selectedOrder, setSelectedOrder] = useState(processingOrder);
  const [showPackingDialog, setShowPackingDialog] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [packingDetails, setPackingDetails] = useState({
    boxSize: '',
    weight: '',
    fragile: false,
    specialInstructions: ''
  });

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'picking':
        return <Badge className="bg-blue-100 text-blue-800">Picking</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProcessingStage = (status: string) => {
    const stages = [
      { key: 'received', label: 'Order Received', completed: true },
      { key: 'picking', label: 'Picking Items', completed: status !== 'pending' },
      { key: 'packing', label: 'Packing', completed: status === 'packed' || status === 'ready' },
      { key: 'ready', label: 'Ready to Ship', completed: status === 'ready' }
    ];
    return stages;
  };

  return (
    <AdminLayout
      currentPage="Order Processing"
      breadcrumbItems={[
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Order Processing' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order Processing Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage order fulfillment and shipping preparation
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button>
              <QrCode className="w-4 h-4 mr-2" />
              Scan Order
            </Button>
          </div>
        </div>

        {/* Processing Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{processingStats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Picking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{processingStats.picking}</div>
              <p className="text-xs text-gray-500 mt-1">In warehouse</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Packing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{processingStats.packing}</div>
              <p className="text-xs text-gray-500 mt-1">Being packed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ready to Ship</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{processingStats.ready}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingStats.avgTime}</div>
              <p className="text-xs text-gray-500 mt-1">Per order</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Processing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order #{selectedOrder.id}</CardTitle>
                    <CardDescription>Processing order items</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {selectedOrder.processingStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Processing Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing Progress</span>
                    <span className="font-medium">{selectedOrder.progress}%</span>
                  </div>
                  <Progress value={selectedOrder.progress} className="h-2" />
                </div>

                {/* Processing Stages */}
                <div className="flex justify-between mb-6">
                  {getProcessingStage(selectedOrder.processingStatus).map((stage, index) => (
                    <div key={stage.key} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${stage.completed 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-600'}
                        `}>
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2 text-center">{stage.label}</span>
                      </div>
                      {index < 3 && (
                        <div className={`
                          w-24 h-0.5 mx-2 mt-5
                          ${stage.completed ? 'bg-green-600' : 'bg-gray-200'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Order Items</h4>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                            <p className="text-sm text-gray-500">Vendor: {item.vendor}</p>
                            <p className="text-sm text-gray-500">Location: {item.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-500">{item.price}</p>
                          {getItemStatusBadge(item.status)}
                        </div>
                      </div>
                      {item.status === 'pending' && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline">
                            <QrCode className="w-4 h-4 mr-2" />
                            Scan Item
                          </Button>
                          <Button size="sm">
                            Mark as Picked
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => setShowPackingDialog(true)}
                  >
                    <Box className="w-4 h-4 mr-2" />
                    Start Packing
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Preparation */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Preparation</CardTitle>
                <CardDescription>Prepare package for courier pickup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courier">Courier Service</Label>
                    <Select defaultValue={selectedOrder.shipping.method}>
                      <SelectTrigger id="courier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pathao">Pathao Express</SelectItem>
                        <SelectItem value="Paperfly">Paperfly</SelectItem>
                        <SelectItem value="Sundarban">Sundarban Courier</SelectItem>
                        <SelectItem value="RedX">RedX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="service">Service Type</Label>
                    <Select defaultValue="express">
                      <SelectTrigger id="service">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="express">Express (24 hrs)</SelectItem>
                        <SelectItem value="standard">Standard (2-3 days)</SelectItem>
                        <SelectItem value="economy">Economy (4-5 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Package Details</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
                      <Input id="weight" placeholder="0.0" />
                    </div>
                    <div>
                      <Label htmlFor="length" className="text-xs">Length (cm)</Label>
                      <Input id="length" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="width" className="text-xs">Width (cm)</Label>
                      <Input id="width" placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="fragile" />
                  <Label htmlFor="fragile">Mark as Fragile</Label>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowLabelDialog(true)}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Shipping Label
                  </Button>
                  <Button className="flex-1">
                    <Truck className="w-4 h-4 mr-2" />
                    Schedule Pickup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Order Info Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>FR</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedOrder.customer.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {selectedOrder.customer.type}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p>{selectedOrder.customer.address}</p>
                      <p className="text-gray-500">{selectedOrder.customer.area}, {selectedOrder.customer.city}</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Customer
                </Button>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <Badge variant="outline">{selectedOrder.payment.method}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {selectedOrder.payment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <code className="text-xs">{selectedOrder.payment.transactionId}</code>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>{selectedOrder.payment.amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Tag className="w-4 h-4 mr-2" />
                  Print Price Tags
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Processing Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Add notes about this order processing..."
                  rows={3}
                />
                <Button className="w-full mt-3">Save Note</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Packing Dialog */}
        <Dialog open={showPackingDialog} onOpenChange={setShowPackingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Packing Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="box-size">Box Size</Label>
                <Select>
                  <SelectTrigger id="box-size">
                    <SelectValue placeholder="Select box size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (20x15x10 cm)</SelectItem>
                    <SelectItem value="medium">Medium (30x25x20 cm)</SelectItem>
                    <SelectItem value="large">Large (40x35x30 cm)</SelectItem>
                    <SelectItem value="xlarge">Extra Large (50x45x40 cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pack-weight">Package Weight (kg)</Label>
                <Input id="pack-weight" type="number" placeholder="0.0" />
              </div>

              <div className="space-y-2">
                <Label>Packing Materials Used</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bubble-wrap" />
                    <Label htmlFor="bubble-wrap">Bubble Wrap</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="foam" />
                    <Label htmlFor="foam">Foam Padding</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="paper" />
                    <Label htmlFor="paper">Paper Filling</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea 
                  id="special-instructions"
                  placeholder="Any special handling instructions..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPackingDialog(false)}>
                Cancel
              </Button>
              <Button>Complete Packing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Shipping Label Dialog */}
        <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shipping Label Preview</DialogTitle>
            </DialogHeader>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold">Shipping Label</h3>
                <p className="text-sm text-gray-500">
                  From: GetIt Warehouse, Dhaka<br />
                  To: {selectedOrder.customer.name}<br />
                  {selectedOrder.customer.address}
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <span>Weight: 2.5 kg</span>
                  <span>•</span>
                  <span>COD: No</span>
                  <span>•</span>
                  <span>Fragile: Yes</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLabelDialog(false)}>
                Cancel
              </Button>
              <Button>
                <Printer className="w-4 h-4 mr-2" />
                Print Label
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default OrderProcessing;