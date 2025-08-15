import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { 
  Play, 
  Users, 
  Heart, 
  ShoppingCart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX,
  Maximize,
  Gift,
  Zap,
  Star,
  Clock,
  Camera,
  Tv
} from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostImage: string;
  thumbnailUrl: string;
  streamUrl: string;
  viewerCount: number;
  likes: number;
  isLive: boolean;
  startTime: string;
  endTime?: string;
  category: string;
  products: StreamProduct[];
  tags: string[];
  language: 'bengali' | 'english' | 'mixed';
  chatEnabled: boolean;
  specialOffers: SpecialOffer[];
}

interface StreamProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
  soldCount: number;
  stockLeft: number;
  flashSale?: boolean;
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validUntil: string;
  productIds: string[];
}

interface LiveShoppingStreamsProps {
  className?: string;
  maxStreams?: number;
  category?: string;
}

export const LiveShoppingStreams: React.FC<LiveShoppingStreamsProps> = ({ 
  className = "",
  maxStreams = 8,
  category = 'all'
}) => {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState(category);
  const [sortBy, setSortBy] = useState<'viewers' | 'recent' | 'popular'>('viewers');

  // Fetch live streams
  const { data: liveStreams, isLoading, error } = useQuery({
    queryKey: ['/api/v1/live-commerce/streams', filterCategory, sortBy],
    staleTime: 30 * 1000, // 30 seconds for live data
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Mock live streams data for demonstration
  const mockLiveStreams: LiveStream[] = [
    {
      id: '1',
      title: 'ঈদ স্পেশাল ফ্যাশন শো - ৫০% পর্যন্ত ছাড়!',
      description: 'Latest Eid collection with exclusive discounts. Live from Dhaka Fashion Week.',
      hostName: 'Fatima Rahman',
      hostImage: '/api/placeholder/100/100',
      thumbnailUrl: '/api/placeholder/400/300',
      streamUrl: '/api/placeholder/video',
      viewerCount: 2547,
      likes: 1834,
      isLive: true,
      startTime: '2025-01-12T15:30:00Z',
      category: 'Fashion',
      language: 'mixed',
      chatEnabled: true,
      tags: ['eid', 'fashion', 'discount', 'live'],
      products: [
        {
          id: 'p1',
          name: 'Designer Eid Punjabi',
          price: 2800,
          originalPrice: 4000,
          image: '/api/placeholder/200/200',
          discount: 30,
          soldCount: 45,
          stockLeft: 12,
          flashSale: true
        },
        {
          id: 'p2',
          name: 'Silk Saree Collection',
          price: 8500,
          originalPrice: 12000,
          image: '/api/placeholder/200/200',
          discount: 29,
          soldCount: 23,
          stockLeft: 8
        }
      ],
      specialOffers: [
        {
          id: 'o1',
          title: 'Flash Sale',
          description: 'Buy 2 Get 1 Free on selected items',
          discountPercent: 50,
          validUntil: '2025-01-12T18:00:00Z',
          productIds: ['p1']
        }
      ]
    },
    {
      id: '2',
      title: 'Tech Review: Latest Samsung Galaxy Series',
      description: 'Live unboxing and review of Samsung Galaxy phones with special pricing.',
      hostName: 'Rashid Ahmed',
      hostImage: '/api/placeholder/100/100',
      thumbnailUrl: '/api/placeholder/400/300',
      streamUrl: '/api/placeholder/video',
      viewerCount: 1876,
      likes: 945,
      isLive: true,
      startTime: '2025-01-12T14:00:00Z',
      category: 'Electronics',
      language: 'english',
      chatEnabled: true,
      tags: ['tech', 'samsung', 'review', 'unboxing'],
      products: [
        {
          id: 'p3',
          name: 'Samsung Galaxy A54 5G',
          price: 42000,
          originalPrice: 45000,
          image: '/api/placeholder/200/200',
          discount: 7,
          soldCount: 67,
          stockLeft: 15
        }
      ],
      specialOffers: []
    },
    {
      id: '3',
      title: 'Home & Kitchen Essentials - রান্নাঘরের জিনিসপত্র',
      description: 'Essential kitchen items and home appliances with live cooking demonstration.',
      hostName: 'Nasreen Sultana',
      hostImage: '/api/placeholder/100/100',
      thumbnailUrl: '/api/placeholder/400/300',
      streamUrl: '/api/placeholder/video',
      viewerCount: 1245,
      likes: 876,
      isLive: true,
      startTime: '2025-01-12T16:00:00Z',
      category: 'Home',
      language: 'bengali',
      chatEnabled: true,
      tags: ['cooking', 'kitchen', 'home', 'demo'],
      products: [
        {
          id: 'p4',
          name: 'Rice Cooker 3L',
          price: 4500,
          originalPrice: 5500,
          image: '/api/placeholder/200/200',
          discount: 18,
          soldCount: 34,
          stockLeft: 20
        }
      ],
      specialOffers: []
    },
    {
      id: '4',
      title: 'Beauty & Skincare Live Session',
      description: 'Professional makeup tutorial with product demonstrations and Q&A.',
      hostName: 'Shirin Akter',
      hostImage: '/api/placeholder/100/100',
      thumbnailUrl: '/api/placeholder/400/300',
      streamUrl: '/api/placeholder/video',
      viewerCount: 967,
      likes: 1456,
      isLive: false,
      startTime: '2025-01-12T13:00:00Z',
      endTime: '2025-01-12T14:30:00Z',
      category: 'Beauty',
      language: 'mixed',
      chatEnabled: false,
      tags: ['beauty', 'skincare', 'makeup', 'tutorial'],
      products: [],
      specialOffers: []
    }
  ];

  const streams = liveStreams || mockLiveStreams;
  const filteredStreams = streams
    .filter(stream => filterCategory === 'all' || stream.category.toLowerCase() === filterCategory.toLowerCase())
    .sort((a, b) => {
      switch (sortBy) {
        case 'viewers': return b.viewerCount - a.viewerCount;
        case 'recent': return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'popular': return b.likes - a.likes;
        default: return 0;
      }
    })
    .slice(0, maxStreams);

  const categories = ['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports', 'Books'];

  const formatViewerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTimeAgo = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-full">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                লাইভ শপিং স্ট্রিম
              </h2>
              <p className="text-gray-600">Interactive live shopping experiences from Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="viewers">Most Viewers</option>
            <option value="recent">Recently Started</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Live Stream Analytics */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">🔴</div>
            <div className="font-semibold">Live Now</div>
            <div className="text-gray-600">{filteredStreams.filter(s => s.isLive).length} streams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">👥</div>
            <div className="font-semibold">Total Viewers</div>
            <div className="text-gray-600">{formatViewerCount(filteredStreams.reduce((sum, s) => sum + s.viewerCount, 0))}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">🛍️</div>
            <div className="font-semibold">Products Featured</div>
            <div className="text-gray-600">{filteredStreams.reduce((sum, s) => sum + s.products.length, 0)}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">⚡</div>
            <div className="font-semibold">Flash Sales</div>
            <div className="text-gray-600">{filteredStreams.reduce((sum, s) => sum + s.specialOffers.length, 0)} active</div>
          </div>
        </div>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStreams.map((stream) => (
          <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-0">
              {/* Stream Thumbnail */}
              <div className="relative">
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Live/Offline Indicator */}
                <div className="absolute top-2 left-2">
                  {stream.isLive ? (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      🔴 LIVE
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      📹 Recorded
                    </Badge>
                  )}
                </div>

                {/* Viewer Count */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {formatViewerCount(stream.viewerCount)}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                  <Button
                    size="lg"
                    className="rounded-full bg-white text-black hover:bg-gray-100"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>

                {/* Duration/Time */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {stream.isLive ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(stream.startTime)}
                    </span>
                  ) : (
                    <span>Ended</span>
                  )}
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4 space-y-3">
                {/* Host Info */}
                <div className="flex items-center gap-2">
                  <img
                    src={stream.hostImage}
                    alt={stream.hostName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{stream.hostName}</p>
                    <p className="text-xs text-gray-500">{stream.category}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      stream.language === 'bengali' ? 'border-green-200 text-green-700' :
                      stream.language === 'english' ? 'border-blue-200 text-blue-700' :
                      'border-purple-200 text-purple-700'
                    }`}
                  >
                    {stream.language === 'bengali' ? '🇧🇩 বাংলা' : 
                     stream.language === 'english' ? '🇺🇸 English' : '🌐 Mixed'}
                  </Badge>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {stream.title}
                </h4>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatViewerCount(stream.likes)}
                    </span>
                    {stream.chatEnabled && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {stream.products.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {stream.products.length} products
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Featured Products Preview */}
                {stream.products.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Featured Products:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {stream.products.slice(0, 2).map((product) => (
                        <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-blue-600">
                                ৳{product.price.toLocaleString()}
                              </span>
                              {product.discount && (
                                <Badge variant="destructive" className="text-xs">
                                  -{product.discount}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Offers */}
                {stream.specialOffers.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">
                        {stream.specialOffers[0].title} - {stream.specialOffers[0].discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedStream(stream)}
                  >
                    {stream.isLive ? (
                      <>
                        <Camera className="h-3 w-3 mr-1" />
                        Watch Live
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Watch Replay
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Live Shopping Categories */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
        <h3 className="font-semibold text-gray-900 mb-4">Popular Live Shopping Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.slice(1).map((category) => (
            <button
              key={category}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white transition-colors group"
              onClick={() => setFilterCategory(category.toLowerCase())}
            >
              <div className="text-2xl mb-1">
                {category === 'Fashion' && '👗'}
                {category === 'Electronics' && '📱'}
                {category === 'Home' && '🏠'}
                {category === 'Beauty' && '💄'}
                {category === 'Sports' && '⚽'}
                {category === 'Books' && '📚'}
              </div>
              <span className="text-sm font-medium text-center">{category}</span>
              <span className="text-xs text-gray-500">
                {filteredStreams.filter(s => s.category.toLowerCase() === category.toLowerCase()).length} streams
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveShoppingStreams;