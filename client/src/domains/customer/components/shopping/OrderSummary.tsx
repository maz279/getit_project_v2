/**
 * Order Summary Component
 * Order confirmation with tracking and post-purchase engagement
 * Implements Amazon.com/Shopee.sg-level order confirmation experience
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
  Calendar,
  Receipt,
  Download,
  Share2,
  MessageCircle,
  Star,
  Heart,
  ShoppingCart,
  Phone,
  Mail,
  Clock,
  Shield,
  Gift
} from 'lucide-react';

interface OrderItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  seller: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
}

interface OrderDetails {
  orderId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  trackingNumber?: string;
  deliveryProgress: number;
}

interface OrderSummaryProps {
  orderId?: string;
  className?: string;
  language?: 'en' | 'bn';
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderId = 'ORD-2025-001234',
  className = '',
  language = 'en'
}) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch order details
    setTimeout(() => {
      setOrderDetails({
        orderId: orderId,
        orderDate: '2025-01-13',
        expectedDelivery: '2025-01-16',
        status: 'processing',
        paymentMethod: 'bKash',
        shippingAddress: {
          name: 'রহিম উদ্দিন',
          address: 'হাউস ১২৩, রোড ৮, ব্লক এ, বনানী',
          city: 'ঢাকা - ১২১৩',
          phone: '+8801712345678'
        },
        trackingNumber: 'TRK' + orderId.slice(-6),
        deliveryProgress: 35
      });

      setOrderItems([
        {
          id: '1',
          title: 'Premium Wireless Headphones',
          bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
          price: 2850,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
          variant: 'Black, Standard',
          seller: 'TechGear BD',
          status: 'processing'
        },
        {
          id: '2',
          title: 'Smart Fitness Watch',
          bengaliTitle: 'স্মার্ট ফিটনেস ওয়াচ',
          price: 3200,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
          variant: 'Silver, 42mm',
          seller: 'FitTech Store',
          status: 'processing'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-600 text-white';
      case 'processing': return 'bg-yellow-600 text-white';
      case 'shipped': return 'bg-purple-600 text-white';
      case 'out_for_delivery': return 'bg-orange-600 text-white';
      case 'delivered': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'bn') {
      switch (status) {
        case 'confirmed': return 'নিশ্চিত';
        case 'processing': return 'প্রক্রিয়াকরণ';
        case 'shipped': return 'পাঠানো হয়েছে';
        case 'out_for_delivery': return 'ডেলিভারির জন্য';
        case 'delivered': return 'ডেলিভার হয়েছে';
        default: return 'অজানা';
      }
    }
    
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const orderSteps = [
    { 
      id: 'confirmed', 
      title: language === 'bn' ? 'অর্ডার নিশ্চিত' : 'Order Confirmed', 
      icon: <CheckCircle className="w-5 h-5" />,
      completed: true 
    },
    { 
      id: 'processing', 
      title: language === 'bn' ? 'প্রক্রিয়াকরণ' : 'Processing', 
      icon: <Package className="w-5 h-5" />,
      completed: orderDetails?.status === 'processing' || orderDetails?.status === 'shipped' || orderDetails?.status === 'delivered' 
    },
    { 
      id: 'shipped', 
      title: language === 'bn' ? 'পাঠানো হয়েছে' : 'Shipped', 
      icon: <Truck className="w-5 h-5" />,
      completed: orderDetails?.status === 'shipped' || orderDetails?.status === 'delivered' 
    },
    { 
      id: 'delivered', 
      title: language === 'bn' ? 'ডেলিভার' : 'Delivered', 
      icon: <MapPin className="w-5 h-5" />,
      completed: orderDetails?.status === 'delivered' 
    }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (isLoading) {
    return (
      <div className={`order-summary ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'bn' ? 'অর্ডার লোড হচ্ছে...' : 'Loading order...'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className={`order-summary ${className}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'bn' ? 'অর্ডার পাওয়া যায়নি' : 'Order not found'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`order-summary ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Confirmation */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h1 className="text-2xl font-bold text-green-800 mb-2">
                  {language === 'bn' ? 'অর্ডার সফল!' : 'Order Successful!'}
                </h1>
                <p className="text-green-700 mb-4">
                  {language === 'bn' 
                    ? 'আপনার অর্ডার সফলভাবে নিশ্চিত হয়েছে'
                    : 'Your order has been confirmed successfully'}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Receipt className="w-4 h-4" />
                    <span className="font-medium">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(orderDetails.orderDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{language === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Order Tracking'}</span>
                  <Badge className={getStatusColor(orderDetails.status)}>
                    {getStatusText(orderDetails.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{language === 'bn' ? 'ডেলিভারি অগ্রগতি' : 'Delivery Progress'}</span>
                    <span>{orderDetails.deliveryProgress}%</span>
                  </div>
                  <Progress value={orderDetails.deliveryProgress} className="h-2" />
                </div>

                <div className="space-y-4">
                  {orderSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${step.completed ? 'text-green-800' : 'text-gray-600'}`}>
                          {step.title}
                        </div>
                        {step.id === 'confirmed' && (
                          <div className="text-sm text-gray-600">
                            {new Date(orderDetails.orderDate).toLocaleString()}
                          </div>
                        )}
                        {step.id === 'delivered' && !step.completed && (
                          <div className="text-sm text-gray-600">
                            {language === 'bn' ? 'প্রত্যাশিত:' : 'Expected:'} {new Date(orderDetails.expectedDelivery).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {index < orderSteps.length - 1 && (
                        <div className={`w-px h-8 ${step.completed ? 'bg-green-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>

                {orderDetails.trackingNumber && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-800">
                          {language === 'bn' ? 'ট্র্যাকিং নম্বর' : 'Tracking Number'}
                        </div>
                        <div className="text-blue-600 font-mono">{orderDetails.trackingNumber}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Truck className="w-4 h-4 mr-2" />
                        {language === 'bn' ? 'ট্র্যাক করুন' : 'Track'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'অর্ডার আইটেম' : 'Order Items'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600 mb-2">{item.variant}</p>
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'bn' ? 'বিক্রেতা:' : 'Seller:'} {item.seller}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">৳{item.price.toLocaleString()}</span>
                          <span className="text-gray-600">
                            {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {item.quantity}
                          </span>
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusText(item.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {language === 'bn' ? 'রিভিউ' : 'Review'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {language === 'bn' ? 'আবার কিনুন' : 'Buy Again'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{orderDetails.shippingAddress.name}</div>
                  <div className="text-gray-700">{orderDetails.shippingAddress.address}</div>
                  <div className="text-gray-700">{orderDetails.shippingAddress.city}</div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{orderDetails.shippingAddress.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'অর্ডার অ্যাকশন' : 'Order Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {language === 'bn' ? 'ইনভয়েস ডাউনলোড' : 'Download Invoice'}
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    {language === 'bn' ? 'অর্ডার শেয়ার' : 'Share Order'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => setShowContactInfo(!showContactInfo)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {language === 'bn' ? 'সাপোর্টে যোগাযোগ' : 'Contact Support'}
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {language === 'bn' ? 'রিটার্ন/রিফান্ড' : 'Return/Refund'}
                  </Button>
                </div>

                {showContactInfo && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">
                      {language === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Customer Support'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Phone className="w-4 h-4" />
                        <span>+880-1700-000000 (24/7)</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-700">
                        <Mail className="w-4 h-4" />
                        <span>support@getit.com.bd</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-700">
                        <MessageCircle className="w-4 h-4" />
                        <span>{language === 'bn' ? 'লাইভ চ্যাট উপলব্ধ' : 'Live chat available'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{language === 'bn' ? 'শিপিং:' : 'Shipping:'}</span>
                    <span className="text-green-600">{language === 'bn' ? 'ফ্রি' : 'Free'}</span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{language === 'bn' ? 'মোট:' : 'Total:'}</span>
                    <span className="text-blue-600">৳{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium mb-1">
                    {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                  </div>
                  <div className="text-sm text-gray-600">{orderDetails.paymentMethod}</div>
                </div>

                {/* Estimated Delivery */}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {language === 'bn' ? 'প্রত্যাশিত ডেলিভারি' : 'Expected Delivery'}
                    </span>
                  </div>
                  <div className="text-blue-700 mt-1">
                    {new Date(orderDetails.expectedDelivery).toLocaleDateString()}
                  </div>
                </div>

                {/* Security */}
                <div className="bg-green-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-green-800">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">
                      {language === 'bn' ? 'অর্ডার সুরক্ষা' : 'Order Protection'}
                    </span>
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    {language === 'bn' 
                      ? 'আপনার অর্ডার গ্যারান্টি সহ সুরক্ষিত'
                      : 'Your order is protected with guarantee'}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">
                    {language === 'bn' ? 'আপনি আরও পছন্দ করতে পারেন' : 'You might also like'}
                  </h4>
                  
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex gap-3 p-2 border rounded hover:bg-gray-50">
                        <img 
                          src={`https://images.unsplash.com/photo-155074242${item}?w=100`} 
                          alt={`Recommended product ${item}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium line-clamp-2">
                            Recommended Product {item}
                          </h5>
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">4.5</span>
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            ৳{(1500 + item * 500).toLocaleString()}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;