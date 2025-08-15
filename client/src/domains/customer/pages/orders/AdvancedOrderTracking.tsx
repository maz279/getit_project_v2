// AdvancedOrderTracking.tsx - Amazon.com/Shopee.sg-Level Advanced Order Tracking
import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, Phone, MessageSquare, Star, Repeat, ArrowRight } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface TrackingEvent {
  id: string;
  timestamp: Date;
  location: string;
  status: string;
  description: string;
  isCompleted: boolean;
}

interface OrderDetails {
  orderNumber: string;
  orderDate: Date;
  estimatedDelivery: Date;
  currentStatus: string;
  trackingNumber: string;
  items: {
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  courier: {
    name: string;
    logo: string;
    phone: string;
    trackingUrl: string;
  };
  events: TrackingEvent[];
}

const AdvancedOrderTracking: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useSEO({
    title: 'Advanced Order Tracking - Track Your Package Live | GetIt Bangladesh',
    description: 'Track your orders in real-time with GPS location, delivery estimates, and courier contact. Get live updates on your package delivery status.',
    keywords: 'order tracking, package tracking, delivery status, GPS tracking, Bangladesh shipping'
  });

  // Load mock order details
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
      handleTrackOrder(orderParam);
    }
  }, []);

  const handleTrackOrder = async (orderNum: string = orderNumber) => {
    if (!orderNum.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Mock order data
      const mockOrder: OrderDetails = {
        orderNumber: orderNum,
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        currentStatus: 'Out for Delivery',
        trackingNumber: 'GTK' + orderNum + '789',
        items: [
          {
            id: '1',
            name: 'Samsung Galaxy A54 5G (128GB)',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
            quantity: 1,
            price: 42000
          },
          {
            id: '2',
            name: 'Wireless Phone Case',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
            quantity: 1,
            price: 850
          }
        ],
        shippingAddress: {
          name: 'Ahmed Rahman',
          address: 'House 45, Road 12, Dhanmondi',
          city: 'Dhaka 1209',
          phone: '+880 1712-345678'
        },
        courier: {
          name: 'Pathao Courier',
          logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200',
          phone: '+880 1700-765432',
          trackingUrl: 'https://pathao.com/track'
        },
        events: [
          {
            id: '1',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            location: 'GetIt Warehouse, Dhaka',
            status: 'Order Confirmed',
            description: 'Your order has been confirmed and is being prepared for shipment.',
            isCompleted: true
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000),
            location: 'GetIt Fulfillment Center, Dhaka',
            status: 'Processing',
            description: 'Your items are being picked and packed.',
            isCompleted: true
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            location: 'Pathao Hub, Dhanmondi',
            status: 'Shipped',
            description: 'Package handed over to Pathao Courier for delivery.',
            isCompleted: true
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            location: 'Pathao Hub, Dhanmondi',
            status: 'In Transit',
            description: 'Package is on the way to local delivery facility.',
            isCompleted: true
          },
          {
            id: '5',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            location: 'Dhanmondi Local Hub',
            status: 'Out for Delivery',
            description: 'Package is out for delivery. Delivery executive: Karim (01712-999888)',
            isCompleted: true
          },
          {
            id: '6',
            timestamp: new Date(Date.now() + 4 * 60 * 60 * 1000),
            location: 'Your Address',
            status: 'Delivered',
            description: 'Package will be delivered to your address.',
            isCompleted: false
          }
        ]
      };

      setOrderDetails(mockOrder);
      setLoading(false);
    }, 1500);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'in transit': return 'bg-orange-100 text-orange-800';
      case 'out for delivery': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (diff < 0) return 'Overdue';
    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return 'Soon';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Track Your Order</h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Get real-time updates on your package location and delivery status
            </p>
          </div>
          
          {/* Tracking Input */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., GIT12345)"
                  className="flex-1 px-4 py-3 text-gray-900 bg-white rounded-lg border-none focus:ring-4 focus:ring-white/30"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                />
                <button
                  onClick={() => handleTrackOrder()}
                  disabled={loading}
                  className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Tracking...' : 'Track Order'}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Tracking your order...</p>
          </div>
        </section>
      )}

      {/* Order Details */}
      {orderDetails && !loading && (
        <>
          {/* Order Summary */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Order #{orderDetails.orderNumber}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Placed on {formatDate(orderDetails.orderDate)}</span>
                        <span>•</span>
                        <span>Tracking: {orderDetails.trackingNumber}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderDetails.currentStatus)}`}>
                        <Truck className="h-4 w-4" />
                        {orderDetails.currentStatus}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Estimated delivery: {getTimeRemaining(orderDetails.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg hover:bg-blue-100 transition-colors">
                      <Phone className="h-4 w-4" />
                      Call Courier
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg hover:bg-green-100 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      Live Chat
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 p-3 rounded-lg hover:bg-purple-100 transition-colors">
                      <MapPin className="h-4 w-4" />
                      Live Location
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 p-3 rounded-lg hover:bg-orange-100 transition-colors">
                      <Repeat className="h-4 w-4" />
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tracking Timeline */}
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Package Journey</h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-8">
                  {orderDetails.events.map((event, index) => (
                    <div key={event.id} className="relative flex items-start gap-6">
                      {/* Timeline Dot */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${
                        event.isCompleted 
                          ? 'bg-green-500' 
                          : index === orderDetails.events.findIndex(e => !e.isCompleted)
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-300'
                      }`}>
                        {event.isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : index === orderDetails.events.findIndex(e => !e.isCompleted) ? (
                          <Clock className="h-6 w-6 text-white" />
                        ) : (
                          <AlertCircle className="h-6 w-6 text-white" />
                        )}
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{event.status}</h4>
                            <p className="text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {event.timestamp > new Date() ? 'Expected' : 'Completed'}
                            </p>
                            <p className="font-medium text-gray-900">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed">{event.description}</p>
                        
                        {event.status === 'Out for Delivery' && event.isCompleted && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm font-medium">
                              📍 Your package is currently 2.5 km away and will arrive in approximately 30-45 minutes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Order Items & Delivery Info */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Items */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
                  
                  <div className="space-y-4">
                    {orderDetails.items.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-bold text-gray-900">৳{item.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-purple-600">
                        ৳{orderDetails.items.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-6">
                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h3>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">{orderDetails.shippingAddress.name}</p>
                      <p className="text-gray-700">{orderDetails.shippingAddress.address}</p>
                      <p className="text-gray-700">{orderDetails.shippingAddress.city}</p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {orderDetails.shippingAddress.phone}
                      </p>
                    </div>
                  </div>

                  {/* Courier Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Courier Information</h3>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={orderDetails.courier.logo}
                        alt={orderDetails.courier.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{orderDetails.courier.name}</p>
                        <p className="text-gray-600 text-sm">Delivery Partner</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <Phone className="h-4 w-4" />
                        Call Courier: {orderDetails.courier.phone}
                      </button>
                      
                      <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                        Track on {orderDetails.courier.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Instructions */}
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Delivery Instructions & Tips
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Be Available</p>
                        <p className="text-gray-600 text-sm">Please be available at the delivery address during the estimated time window.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Valid ID Required</p>
                        <p className="text-gray-600 text-sm">Keep a valid photo ID ready for verification during delivery.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Inspect Package</p>
                        <p className="text-gray-600 text-sm">Check your items before accepting delivery. Report any damage immediately.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Rate Your Experience</p>
                        <p className="text-gray-600 text-sm">Help us improve by rating your delivery experience.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* No Results */}
      {!orderDetails && !loading && orderNumber && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find an order with number "{orderNumber}". Please check your order number and try again.
            </p>
            <button
              onClick={() => {
                setOrderNumber('');
                setError('');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Another Order
            </button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default AdvancedOrderTracking;