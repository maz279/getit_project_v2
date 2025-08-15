// FlashDeals.tsx - Amazon.com/Shopee.sg-Level Flash Sale Experience
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Clock, Zap, Star, Heart, ShoppingCart, Eye, Share2, TrendingUp, Award, Flame, Timer, Bell } from 'lucide-react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface FlashDeal {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  flashPrice: number;
  discount: number;
  timeLeft: number; // in seconds
  sold: number;
  totalStock: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  featured: boolean;
  trending: boolean;
  limitPerUser: number;
  freeShipping: boolean;
}

interface FlashSaleSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  deals: FlashDeal[];
}

const FlashDeals: React.FC = () => {
  const [sessions, setSessions] = useState<FlashSaleSession[]>([]);
  const [activeSession, setActiveSession] = useState<FlashSaleSession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useSEO({
    title: 'Flash Deals - Limited Time Offers | GetIt Bangladesh',
    description: 'Grab amazing flash deals with up to 80% off! Limited time offers on electronics, fashion, home goods and more. Shop now before time runs out!',
    keywords: 'flash deals, flash sale, limited time offers, discounts, sale, special offers, lightning deals'
  });

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Mock flash sale sessions
    const mockSessions: FlashSaleSession[] = [
      {
        id: '1',
        title: '⚡ Super Flash Sale',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Ends in 4 hours
        status: 'active',
        deals: [
          {
            id: '1',
            name: 'Samsung Galaxy Buds Pro 2',
            image: '/products/galaxy-buds-pro.jpg',
            originalPrice: 18000,
            flashPrice: 12500,
            discount: 31,
            timeLeft: 4 * 60 * 60, // 4 hours
            sold: 87,
            totalStock: 100,
            rating: 4.7,
            reviews: 342,
            category: 'Electronics',
            brand: 'Samsung',
            featured: true,
            trending: true,
            limitPerUser: 2,
            freeShipping: true
          },
          {
            id: '2',
            name: 'Wireless Gaming Mouse',
            image: '/products/gaming-mouse.jpg',
            originalPrice: 5500,
            flashPrice: 2999,
            discount: 45,
            timeLeft: 4 * 60 * 60,
            sold: 156,
            totalStock: 200,
            rating: 4.5,
            reviews: 189,
            category: 'Gaming',
            brand: 'TechPro',
            featured: false,
            trending: true,
            limitPerUser: 3,
            freeShipping: false
          },
          {
            id: '3',
            name: 'Premium Cotton T-Shirt',
            image: '/products/cotton-tshirt.jpg',
            originalPrice: 1200,
            flashPrice: 599,
            discount: 50,
            timeLeft: 4 * 60 * 60,
            sold: 234,
            totalStock: 300,
            rating: 4.3,
            reviews: 128,
            category: 'Fashion',
            brand: 'ComfortWear',
            featured: false,
            trending: false,
            limitPerUser: 5,
            freeShipping: true
          },
          {
            id: '4',
            name: 'Smart Fitness Watch',
            image: '/products/fitness-watch.jpg',
            originalPrice: 8500,
            flashPrice: 4250,
            discount: 50,
            timeLeft: 4 * 60 * 60,
            sold: 43,
            totalStock: 80,
            rating: 4.6,
            reviews: 97,
            category: 'Wearables',
            brand: 'FitTech',
            featured: true,
            trending: false,
            limitPerUser: 1,
            freeShipping: true
          }
        ]
      },
      {
        id: '2',
        title: '🔥 Evening Flash Sale',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Starts in 2 hours
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Ends in 8 hours
        status: 'upcoming',
        deals: [
          {
            id: '5',
            name: 'iPhone 15 Pro Max',
            image: '/products/iphone-15-pro.jpg',
            originalPrice: 165000,
            flashPrice: 145000,
            discount: 12,
            timeLeft: 6 * 60 * 60,
            sold: 0,
            totalStock: 50,
            rating: 4.9,
            reviews: 567,
            category: 'Electronics',
            brand: 'Apple',
            featured: true,
            trending: true,
            limitPerUser: 1,
            freeShipping: true
          }
        ]
      }
    ];

    setSessions(mockSessions);
    setActiveSession(mockSessions.find(s => s.status === 'active') || null);
    setLoading(false);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStockProgress = (sold: number, total: number) => {
    return (sold / total) * 100;
  };

  const categories = ['all', 'Electronics', 'Fashion', 'Gaming', 'Wearables', 'Home & Kitchen'];
  const sortOptions = [
    { value: 'discount', label: 'Highest Discount' },
    { value: 'price', label: 'Lowest Price' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'timeLeft', label: 'Ending Soon' }
  ];

  const filteredDeals = activeSession?.deals.filter(deal => 
    selectedCategory === 'all' || deal.category === selectedCategory
  ).sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return b.discount - a.discount;
      case 'price':
        return a.flashPrice - b.flashPrice;
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.sold - a.sold;
      case 'timeLeft':
        return a.timeLeft - b.timeLeft;
      default:
        return 0;
    }
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600">Loading flash deals...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-8 w-8 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold">Flash Deals</h1>
            <Fire className="h-8 w-8 animate-bounce" />
          </div>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Lightning-fast deals with massive savings! Limited time, limited stock!
          </p>
          {activeSession && (
            <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <Timer className="h-5 w-5" />
              <span className="font-medium">Current Sale Ends In:</span>
              <span className="font-bold text-xl">
                {formatTime(Math.max(0, Math.floor((new Date(activeSession.endTime).getTime() - currentTime) / 1000)))}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Flash Sale Sessions */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Flash Sale Sessions</h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session)}
                className={`px-6 py-4 rounded-lg border-2 transition-all ${
                  activeSession?.id === session.id
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : session.status === 'active'
                    ? 'border-green-600 bg-green-50 text-green-700 hover:border-green-700'
                    : session.status === 'upcoming'
                    ? 'border-orange-600 bg-orange-50 text-orange-700 hover:border-orange-700'
                    : 'border-gray-300 bg-gray-50 text-gray-500'
                }`}
              >
                <div className="text-center">
                  <h3 className="font-bold mb-1">{session.title}</h3>
                  <div className="text-sm">
                    {session.status === 'active' && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live Now
                      </span>
                    )}
                    {session.status === 'upcoming' && (
                      <span>Starts in {formatTime(Math.max(0, Math.floor((new Date(session.startTime).getTime() - currentTime) / 1000)))}</span>
                    )}
                    {session.status === 'ended' && <span>Ended</span>}
                  </div>
                  <div className="text-xs mt-1">{session.deals.length} deals</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {!activeSession ? (
            <div className="text-center py-20">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Flash Sale</h2>
              <p className="text-gray-600">Check back soon for amazing deals!</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{activeSession.title}</h2>
                <p className="text-gray-600">
                  {filteredDeals.length} amazing deals • Limited time offers
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDeals.map(deal => (
                  <div key={deal.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-transparent hover:border-red-200">
                    <div className="relative">
                      <img 
                        src={deal.image} 
                        alt={deal.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/api/placeholder/300/200?text=${deal.name}`;
                        }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{deal.discount}%
                        </span>
                        {deal.featured && (
                          <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                        {deal.trending && (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </span>
                        )}
                      </div>

                      {/* Timer */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                        {formatTime(deal.timeLeft)}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                          <Share2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <Link href={`/products/${deal.id}`}>
                          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{deal.brand}</p>
                      
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{deal.rating}</span>
                        <span className="text-sm text-gray-500">({deal.reviews})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-red-600">৳{deal.flashPrice.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 line-through">৳{deal.originalPrice.toLocaleString()}</span>
                      </div>
                      
                      {/* Stock Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Sold: {deal.sold}</span>
                          <span>Stock: {deal.totalStock - deal.sold} left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${getStockProgress(deal.sold, deal.totalStock)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-3">
                        Limit: {deal.limitPerUser} per customer
                        {deal.freeShipping && (
                          <span className="ml-2 text-green-600 font-medium">Free Shipping</span>
                        )}
                      </div>
                      
                      <button 
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                          deal.totalStock - deal.sold > 0
                            ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={deal.totalStock - deal.sold <= 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {deal.totalStock - deal.sold > 0 ? 'Flash Buy Now' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDeals.length === 0 && (
                <div className="text-center py-20">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No deals found</h2>
                  <p className="text-gray-600">Try adjusting your filters or check back later</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Flash Deal!</h2>
          <p className="text-xl mb-8 opacity-90">
            Get notified about upcoming flash sales and exclusive deals
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-4 focus:ring-white/30 focus:outline-none"
            />
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Bell className="h-4 w-4" />
              Notify Me
            </button>
          </div>
          
          <p className="text-sm mt-4 opacity-75">
            Join 2M+ users getting exclusive deal alerts
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FlashDeals;