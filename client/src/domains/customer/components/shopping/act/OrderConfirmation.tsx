/**
 * Phase 3: Act Stage - Order Confirmation
 * Amazon.com 5 A's Framework Implementation
 * Complete Order Confirmation with Tracking & Post-Purchase
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin,
  Clock,
  Star,
  Download,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Gift,
  Heart,
  ArrowRight,
  Navigation,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderConfirmationProps {
  orderId?: string;
  className?: string;
}

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  placedAt: string;
  estimatedDelivery: string;
  totalAmount: number;
  items: OrderItem[];
  shipping: ShippingDetails;
  payment: PaymentDetails;
  customer: CustomerDetails;
  tracking: TrackingInfo;
  nextSteps: NextStep[];
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  seller: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
}

interface ShippingDetails {
  method: string;
  carrier: string;
  cost: number;
  address: {
    name: string;
    street: string;
    city: string;
    area: string;
    phone: string;
  };
  instructions?: string;
}

interface PaymentDetails {
  method: string;
  provider: string;
  transactionId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  loyaltyTier: string;
  memberSince: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  location: string;
  lastUpdate: string;
  estimatedDelivery: string;
  steps: TrackingStep[];
}

interface TrackingStep {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: any;
  urgent: boolean;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  className,
}) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'tracking' | 'items' | 'support'>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load order details
    const loadOrderDetails = () => {
      const mockOrder: OrderDetails = {
        orderId: orderId || 'GT2025-0001',
        orderNumber: '#GT-2025-0001',
        status: 'confirmed',
        placedAt: '2024-12-13 14:30:00',
        estimatedDelivery: '2024-12-14 18:00:00',
        totalAmount: 12100,
        items: [
          {
            id: 'item1',
            name: 'Premium Wireless Gaming Headset',
            image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300',
            price: 12500,
            quantity: 1,
            variant: 'Midnight Black',
            seller: 'TechPro Official Store',
            status: 'confirmed'
          }
        ],
        shipping: {
          method: 'Express Delivery',
          carrier: 'GetIt Express',
          cost: 100,
          address: {
            name: 'Ahmed Rahman',
            street: 'House 123, Road 45, Gulshan-2',
            city: 'Dhaka',
            area: 'Gulshan',
            phone: '+8801712345678'
          },
          instructions: 'Call before delivery'
        },
        payment: {
          method: 'bKash Mobile Banking',
          provider: 'bKash',
          transactionId: 'BK1234567890',
          amount: 12100,
          status: 'paid'
        },
        customer: {
          name: 'Ahmed Rahman',
          email: 'ahmed@example.com',
          phone: '+8801712345678',
          loyaltyTier: 'Gold',
          memberSince: '2023-05-15'
        },
        tracking: {
          trackingNumber: 'GT2025000001',
          carrier: 'GetIt Express',
          status: 'Order Confirmed',
          location: 'Dhaka Warehouse',
          lastUpdate: '2024-12-13 14:45:00',
          estimatedDelivery: '2024-12-14 18:00:00',
          steps: [
            {
              id: 'step1',
              status: 'Order Placed',
              description: 'Your order has been successfully placed',
              location: 'GetIt Platform',
              timestamp: '2024-12-13 14:30:00',
              completed: true,
              current: false
            },
            {
              id: 'step2',
              status: 'Order Confirmed',
              description: 'Payment verified and order confirmed',
              location: 'Dhaka Processing Center',
              timestamp: '2024-12-13 14:45:00',
              completed: true,
              current: true
            },
            {
              id: 'step3',
              status: 'Processing',
              description: 'Items being prepared for shipment',
              location: 'Dhaka Warehouse',
              timestamp: '',
              completed: false,
              current: false
            },
            {
              id: 'step4',
              status: 'Shipped',
              description: 'Package dispatched for delivery',
              location: 'In Transit',
              timestamp: '',
              completed: false,
              current: false
            },
            {
              id: 'step5',
              status: 'Out for Delivery',
              description: 'Package out for final delivery',
              location: 'Gulshan Area',
              timestamp: '',
              completed: false,
              current: false
            },
            {
              id: 'step6',
              status: 'Delivered',
              description: 'Package successfully delivered',
              location: 'Delivery Address',
              timestamp: '',
              completed: false,
              current: false
            }
          ]
        },
        nextSteps: [
          {
            id: 'track',
            title: 'Track Your Order',
            description: 'Get real-time updates on your package location',
            action: 'Track Now',
            icon: Navigation,
            urgent: false
          },
          {
            id: 'prepare',
            title: 'Prepare for Delivery',
            description: 'Ensure someone is available to receive the package',
            action: 'Set Reminder',
            icon: Calendar,
            urgent: true
          },
          {
            id: 'review',
            title: 'Review Purchase',
            description: 'Share your experience after delivery',
            action: 'Leave Review',
            icon: Star,
            urgent: false
          }
        ]
      };

      setTimeout(() => {
        setOrderDetails(mockOrder);
        setLoading(false);
      }, 1000);
    };

    loadOrderDetails();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              Unable to load order information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Success Header */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div>
              <span className="font-semibold">Order Number:</span>
              <span className="ml-2 text-primary font-mono">{orderDetails.orderNumber}</span>
            </div>
            <div>
              <span className="font-semibold">Estimated Delivery:</span>
              <span className="ml-2 text-green-600 font-medium">
                {formatDate(orderDetails.estimatedDelivery)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button className="h-16 flex flex-col gap-1">
          <Navigation className="h-5 w-5" />
          <span className="text-sm">Track Order</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1">
          <Download className="h-5 w-5" />
          <span className="text-sm">Download Invoice</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1">
          <Share2 className="h-5 w-5" />
          <span className="text-sm">Share Order</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['summary', 'tracking', 'items', 'support'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Order Status:</span>
                    <Badge className={getStatusColor(orderDetails.status)}>
                      {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span>{formatDate(orderDetails.placedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{orderDetails.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-sm">{orderDetails.payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-3">
                    <span>Total Amount:</span>
                    <span className="text-primary">৳{orderDetails.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Delivery Address</h4>
                    <div className="text-sm space-y-1">
                      <div>{orderDetails.shipping.address.name}</div>
                      <div>{orderDetails.shipping.address.street}</div>
                      <div>{orderDetails.shipping.address.city}, {orderDetails.shipping.address.area}</div>
                      <div>{orderDetails.shipping.address.phone}</div>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span>Shipping Method:</span>
                      <span>{orderDetails.shipping.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carrier:</span>
                      <span>{orderDetails.shipping.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Cost:</span>
                      <span>৳{orderDetails.shipping.cost}</span>
                    </div>
                  </div>
                  {orderDetails.shipping.instructions && (
                    <div className="border-t pt-3">
                      <span className="font-semibold">Special Instructions:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {orderDetails.shipping.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps & Recommendations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.nextSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          step.urgent ? 'bg-orange-100' : 'bg-blue-100'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            step.urgent ? 'text-orange-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            {step.action}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=60"
                      alt="Gaming Mouse"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Wireless Gaming Mouse</h4>
                      <p className="text-sm text-muted-foreground">Perfect companion for your headset</p>
                      <div className="text-sm font-bold text-primary">৳4,200</div>
                    </div>
                    <Button size="sm">Add</Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=60"
                      alt="Gaming Keyboard"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Mechanical Gaming Keyboard</h4>
                      <p className="text-sm text-muted-foreground">Complete your gaming setup</p>
                      <div className="text-sm font-bold text-primary">৳8,500</div>
                    </div>
                    <Button size="sm">Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Real-Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Tracking Number:</span>
                  <span className="font-mono">{orderDetails.tracking.trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Current Status:</span>
                  <Badge className="bg-blue-100 text-blue-700">{orderDetails.tracking.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Last Update:</span>
                  <span>{formatDate(orderDetails.tracking.lastUpdate)}</span>
                </div>
              </div>

              <div className="space-y-6">
                {orderDetails.tracking.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2',
                      step.completed ? 'bg-green-500 border-green-500' :
                      step.current ? 'bg-blue-500 border-blue-500' :
                      'bg-gray-200 border-gray-300'
                    )}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : step.current ? (
                        <Clock className="h-4 w-4 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    
                    {index < orderDetails.tracking.steps.length - 1 && (
                      <div className={cn(
                        'absolute left-4 mt-8 w-0.5 h-6',
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      )}></div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-semibold',
                        step.completed ? 'text-green-600' :
                        step.current ? 'text-blue-600' :
                        'text-gray-600'
                      )}>
                        {step.status}
                      </h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {step.location}
                        </span>
                        {step.timestamp && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(step.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Sold by: {item.seller}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-bold text-primary">৳{item.price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Heart className="h-3 w-3 mr-1" />
                        Buy Again
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat Support
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support: +880-1234-567890
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email: support@getit.com.bd
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Order Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">Return Policy</h4>
                  <p className="text-muted-foreground">30-day return window for unopened items</p>
                </div>
                <div>
                  <h4 className="font-semibold">Cancellation</h4>
                  <p className="text-muted-foreground">Cancel within 1 hour of placing order</p>
                </div>
                <div>
                  <h4 className="font-semibold">Warranty</h4>
                  <p className="text-muted-foreground">2-year manufacturer warranty included</p>
                </div>
                <div>
                  <h4 className="font-semibold">Support Hours</h4>
                  <p className="text-muted-foreground">24/7 customer support available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;