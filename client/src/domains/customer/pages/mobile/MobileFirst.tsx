// MobileFirst.tsx - Amazon.com/Shopee.sg-Level Mobile Shopping Experience
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Smartphone, QrCode, Camera, Mic, Zap, Download, Bell, Gift, MapPin, Clock, Star, ShoppingCart, Heart, Search, Menu, User, Headphones } from 'lucide-react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface MobileFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'payment' | 'shopping' | 'social' | 'utility';
  isNew?: boolean;
  isPremium?: boolean;
  screenshot: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ElementType;
  action: () => void;
  color: string;
}

interface MobileDeal {
  id: string;
  title: string;
  product: {
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    rating: number;
  };
  discount: number;
  timeLeft: string;
  appExclusive: boolean;
}

const MobileFirst: React.FC = () => {
  const [features, setFeatures] = useState<MobileFeature[]>([]);
  const [deals, setDeals] = useState<MobileDeal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'payment' | 'shopping' | 'social' | 'utility'>('all');
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  useSEO({
    title: 'Mobile Shopping Experience | GetIt Bangladesh',
    description: 'Experience the best mobile shopping with exclusive app features, mobile payments, AR try-on, and voice search. Shop anywhere, anytime!',
    keywords: 'mobile shopping, mobile app, mobile payments, QR code, voice search, mobile exclusive deals, app features'
  });

  useEffect(() => {
    // Check if running as PWA/app
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsAppInstalled(isInStandaloneMode || isInWebAppiOS);

    const mockFeatures: MobileFeature[] = [
      {
        id: '1',
        title: 'QR Code Shopping',
        description: 'Scan any product QR code to instantly view details, reviews, and buy online',
        icon: QrCode,
        category: 'shopping',
        isNew: true,
        screenshot: '/mobile/qr-shopping.jpg'
      },
      {
        id: '2',
        title: 'Voice Search',
        description: 'Search for products using voice commands in Bengali or English',
        icon: Mic,
        category: 'shopping',
        screenshot: '/mobile/voice-search.jpg'
      },
      {
        id: '3',
        title: 'AR Try-On',
        description: 'Try on clothes, accessories, and makeup using augmented reality',
        icon: Camera,
        category: 'shopping',
        isPremium: true,
        screenshot: '/mobile/ar-tryon.jpg'
      },
      {
        id: '4',
        title: 'Mobile Banking',
        description: 'Pay instantly with bKash, Nagad, Rocket directly from the app',
        icon: Smartphone,
        category: 'payment',
        screenshot: '/mobile/mobile-banking.jpg'
      },
      {
        id: '5',
        title: 'Live Shopping',
        description: 'Watch live product demos and shop while streaming',
        icon: Zap,
        category: 'social',
        isNew: true,
        screenshot: '/mobile/live-shopping.jpg'
      },
      {
        id: '6',
        title: 'Offline Mode',
        description: 'Browse saved products and manage cart even without internet',
        icon: Download,
        category: 'utility',
        screenshot: '/mobile/offline-mode.jpg'
      },
      {
        id: '7',
        title: 'Smart Notifications',
        description: 'Get personalized alerts for price drops, restocks, and flash sales',
        icon: Bell,
        category: 'utility',
        screenshot: '/mobile/notifications.jpg'
      },
      {
        id: '8',
        title: 'Location-based Deals',
        description: 'Discover exclusive offers based on your current location',
        icon: MapPin,
        category: 'shopping',
        screenshot: '/mobile/location-deals.jpg'
      }
    ];

    const mockDeals: MobileDeal[] = [
      {
        id: '1',
        title: 'App Launch Special',
        product: {
          name: 'Samsung Galaxy Buds Pro',
          image: '/products/galaxy-buds.jpg',
          price: 12000,
          originalPrice: 15000,
          rating: 4.7
        },
        discount: 20,
        timeLeft: '2:45:30',
        appExclusive: true
      },
      {
        id: '2',
        title: 'Mobile Monday',
        product: {
          name: 'Wireless Power Bank',
          image: '/products/power-bank.jpg',
          price: 2500,
          originalPrice: 3500,
          rating: 4.5
        },
        discount: 29,
        timeLeft: '5:12:45',
        appExclusive: true
      }
    ];

    setFeatures(mockFeatures);
    setDeals(mockDeals);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'QR Scan',
      icon: QrCode,
      action: () => console.log('QR Scan'),
      color: 'blue'
    },
    {
      id: '2',
      title: 'Voice Search',
      icon: Mic,
      action: () => console.log('Voice Search'),
      color: 'green'
    },
    {
      id: '3',
      title: 'AR Try-On',
      icon: Camera,
      action: () => console.log('AR Try-On'),
      color: 'purple'
    },
    {
      id: '4',
      title: 'Live Chat',
      icon: Headphones,
      action: () => console.log('Live Chat'),
      color: 'red'
    }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  const categories = [
    { key: 'all' as const, label: 'All Features' },
    { key: 'shopping' as const, label: 'Shopping' },
    { key: 'payment' as const, label: 'Payment' },
    { key: 'social' as const, label: 'Social' },
    { key: 'utility' as const, label: 'Utility' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                📱 Mobile-First Shopping
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Experience the future of e-commerce with our advanced mobile features designed for Bangladesh
              </p>
              
              {!isAppInstalled && showInstallPrompt && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <Smartphone className="h-8 w-8" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Get the Mobile App</h3>
                      <p className="text-sm opacity-90">Unlock exclusive features and mobile-only deals</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all">
                        Install App
                      </button>
                      <button 
                        onClick={() => setShowInstallPrompt(false)}
                        className="text-white/70 hover:text-white px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <QrCode className="h-4 w-4" />
                  <span>QR Code Shopping</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Mic className="h-4 w-4" />
                  <span>Voice Search</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile Banking</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative mx-auto w-64 h-[500px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
                  {/* Mock phone screen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600">
                    <div className="p-6 text-white">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                          <span className="font-semibold">GetIt</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode className="h-4 w-4" />
                            <span className="text-sm">Scan to Shop</span>
                          </div>
                          <div className="w-full h-16 bg-white/20 rounded"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                            <Mic className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-xs">Voice</span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                            <Camera className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-xs">AR Try-On</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions for Mobile Users */}
      <section className="py-8 md:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 rounded-xl text-center hover:shadow-lg transition-all bg-${action.color}-100 text-${action.color}-600`}
              >
                <action.icon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-xs font-medium">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* App-Exclusive Deals */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📱 App-Exclusive Deals</h2>
            <p className="text-gray-600">Special offers only available in our mobile app</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => (
              <div key={deal.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={deal.product.image} 
                    alt={deal.product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/api/placeholder/300/200?text=${deal.product.name}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{deal.discount}% OFF
                  </div>
                  {deal.appExclusive && (
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      App Only
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{deal.title}</h3>
                  <h4 className="text-gray-700 mb-3">{deal.product.name}</h4>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-purple-600">৳{deal.product.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 line-through">৳{deal.product.originalPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{deal.product.rating}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 text-sm text-red-600">
                    <Clock className="h-4 w-4" />
                    <span>Ends in {deal.timeLeft}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Buy Now in App
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Features */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mobile Features</h2>
            <p className="text-gray-600">Discover what makes our mobile experience special</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map(feature => (
              <div key={feature.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={feature.screenshot} 
                    alt={feature.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/api/placeholder/300/200?text=${feature.title}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {feature.isNew && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        NEW
                      </span>
                    )}
                    {feature.isPremium && (
                      <span className="bg-gold-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      feature.category === 'payment' ? 'bg-green-100 text-green-600' :
                      feature.category === 'shopping' ? 'bg-blue-100 text-blue-600' :
                      feature.category === 'social' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Try Feature
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Stats */}
      <section className="py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Mobile Shopping Revolution</h2>
            <p className="text-xl opacity-90">Join millions of users shopping on mobile</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2.5M+</div>
              <div className="text-sm opacity-90">Mobile Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-sm opacity-90">Mobile Orders</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-sm opacity-90">QR Code Scans/Month</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-sm opacity-90">App Store Rating</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MobileFirst;