/**
 * OrderTrackingSystem - Amazon.com/Shopee.sg-Level Order Tracking
 * Real-time order tracking with delivery updates and communication
 */

import React, { useState, useEffect } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Package, Truck, MapPin, Clock, Check, AlertCircle, Phone, MessageSquare, Star, Camera, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { useSEO } from '@/shared/hooks/useSEO';

interface OrderStatus {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
  estimated?: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
  status: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  vehicle: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  paymentMethod: string;
  deliveryPerson?: DeliveryPerson;
  currentStatus: string;
  trackingNumber: string;
  courierService: string;
  statusHistory: OrderStatus[];
}

export const OrderTrackingSystem: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // SEO optimization
  useSEO({
    title: 'Track Your Order - Real-time Delivery Updates | GetIt Bangladesh',
    description: 'Track your order in real-time with live delivery updates, GPS tracking, and direct communication with delivery personnel.',
    keywords: 'order tracking, delivery status, real-time tracking, bangladesh delivery, courier tracking'
  });

  // Mock order data
  const mockOrder: Order = {
    id: '1',
    orderNumber: 'GT-2024-001234',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-17',
    totalAmount: 137560,
    items: [
      {
        id: '1',
        name: 'Samsung Galaxy S24 Ultra 256GB',
        price: 135000,
        quantity: 1,
        image: '/api/placeholder/80/80',
        vendor: 'Tech Store BD',
        status: 'out_for_delivery'
      },
      {
        id: '2',
        name: 'Wireless Bluetooth Headphones',
        price: 2500,
        quantity: 1,
        image: '/api/placeholder/80/80',
        vendor: 'Audio World',
        status: 'out_for_delivery'
      }
    ],
    shippingAddress: {
      name: 'Rahman Ahmed',
      address: 'House 123, Road 15, Block A, Bashundhara R/A',
      city: 'Dhaka',
      phone: '01712345678'
    },
    paymentMethod: 'bKash',
    deliveryPerson: {
      id: '1',
      name: 'Karim Uddin',
      phone: '01798765432',
      avatar: '/api/placeholder/40/40',
      rating: 4.8,
      vehicle: 'Motorcycle',
      location: {
        lat: 23.7808,
        lng: 90.2792
      }
    },
    currentStatus: 'out_for_delivery',
    trackingNumber: 'PT123456789BD',
    courierService: 'Pathao',
    statusHistory: [
      {
        id: '1',
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        timestamp: '2024-01-15T10:30:00Z',
        location: 'Dhaka',
        completed: true
      },
      {
        id: '2',
        status: 'preparing',
        title: 'Preparing Your Order',
        description: 'Vendor is preparing your items for shipment',
        timestamp: '2024-01-15T14:00:00Z',
        location: 'Dhaka',
        completed: true
      },
      {
        id: '3',
        status: 'picked_up',
        title: 'Picked Up',
        description: 'Order has been picked up by courier',
        timestamp: '2024-01-16T09:00:00Z',
        location: 'Dhaka',
        completed: true
      },
      {
        id: '4',
        status: 'in_transit',
        title: 'In Transit',
        description: 'Your order is on its way to the delivery hub',
        timestamp: '2024-01-16T11:30:00Z',
        location: 'Dhaka Sorting Center',
        completed: true
      },
      {
        id: '5',
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery and will arrive soon',
        timestamp: '2024-01-17T08:00:00Z',
        location: 'Bashundhara R/A',
        completed: true
      },
      {
        id: '6',
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been successfully delivered',
        timestamp: '2024-01-17T15:00:00Z',
        location: 'Bashundhara R/A',
        completed: false,
        estimated: true
      }
    ]
  };

  const trackOrder = async () => {
    if (!trackingNumber.trim()) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOrder(mockOrder);
    setLoading(false);
    setLastUpdated(new Date());
  };

  const refreshTracking = async () => {
    if (!order) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastUpdated(new Date());
    setLoading(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && order) {
      interval = setInterval(refreshTracking, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, order]);

  const getStatusProgress = () => {
    if (!order) return 0;
    const completedSteps = order.statusHistory.filter(status => status.completed).length;
    return (completedSteps / order.statusHistory.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'picked_up': return 'bg-orange-500';
      case 'in_transit': return 'bg-purple-500';
      case 'out_for_delivery': return 'bg-green-500';
      case 'delivered': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const TrackingInput: React.FC = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Track Your Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            placeholder="Enter tracking number or order ID"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1"
          />
          <Button onClick={trackOrder} disabled={loading}>
            {loading ? 'Tracking...' : 'Track Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const OrderHeader: React.FC = () => {
    if (!order) return null;

    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
              <p className="text-gray-600">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(order.currentStatus)} text-white`}>
                {order.currentStatus.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Courier Service</h3>
              <div className="text-sm text-gray-600">
                <p>{order.courierService}</p>
                <p>Tracking: {order.trackingNumber}</p>
                <p>Payment: {order.paymentMethod}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Estimated Delivery</h3>
              <div className="text-sm text-gray-600">
                <p className="text-lg font-semibold text-green-600">
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
                <p>Total: ৳{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Progress value={getStatusProgress()} className="flex-1 mr-4" />
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTracking}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatusTimeline: React.FC = () => {
    if (!order) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.statusHistory.map((status, index) => (
              <div key={status.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    status.completed ? getStatusColor(status.status) : 'bg-gray-300'
                  }`}>
                    {status.completed ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  {index < order.statusHistory.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      status.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      status.completed ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {status.title}
                    </h4>
                    {status.estimated && (
                      <Badge variant="outline" className="text-xs">
                        Estimated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{status.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(status.timestamp).toLocaleString()}
                    </div>
                    {status.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {status.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const OrderItems: React.FC = () => {
    if (!order) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-600">by {item.vendor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">৳{item.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const DeliveryPerson: React.FC = () => {
    if (!order?.deliveryPerson) return null;

    const deliveryPerson = order.deliveryPerson;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery Person</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={deliveryPerson.avatar} />
              <AvatarFallback>{deliveryPerson.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">{deliveryPerson.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm">{deliveryPerson.rating}</span>
              </div>
              <p className="text-sm text-gray-600">Vehicle: {deliveryPerson.vehicle}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
          </div>
          
          <Alert className="mt-4">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Your delivery person is approximately 2.5 km away from your location.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  const OrderActions: React.FC = () => {
    if (!order) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rate & Review
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-gray-600">Track your order in real-time with live updates</p>
        </div>

        <TrackingInput />

        {order && (
          <>
            <OrderHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline" className="mt-6">
                    <StatusTimeline />
                  </TabsContent>
                  
                  <TabsContent value="items" className="mt-6">
                    <OrderItems />
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-6">
                    <OrderActions />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <DeliveryPerson />
                  
                  {/* Live Map Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Live map integration</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTrackingSystem;