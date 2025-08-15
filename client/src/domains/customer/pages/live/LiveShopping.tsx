// LiveShopping.tsx - Amazon.com/Shopee.sg-Level Live Shopping Experience
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Play, Users, Eye, Heart, ShoppingCart, Share2, Volume2, VolumeX, MessageCircle, Gift, Star, Clock, Zap, Crown, Award } from 'lucide-react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface LiveStream {
  id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  thumbnail: string;
  viewers: number;
  duration: string;
  isLive: boolean;
  category: string;
  products: LiveProduct[];
  tags: string[];
  language: string;
}

interface LiveProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  stock: number;
  sold: number;
  timeLeft?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'message' | 'purchase' | 'gift' | 'system';
}

const LiveShopping: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Live Shopping - Watch & Shop Live | GetIt Bangladesh',
    description: 'Experience live shopping with real-time product demos, exclusive deals, and interactive shopping. Shop while you watch!',
    keywords: 'live shopping, live stream, product demo, exclusive deals, interactive shopping, real-time shopping'
  });

  useEffect(() => {
    // Simulate API call for live streams
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        title: 'Flash Sale: Electronics Mega Deal 🔥',
        host: {
          name: 'TechGuru BD',
          avatar: '/hosts/techguru.jpg',
          verified: true,
          followers: 125000
        },
        thumbnail: '/live/electronics-sale.jpg',
        viewers: 15420,
        duration: '2:34:15',
        isLive: true,
        category: 'Electronics',
        products: [
          {
            id: '1',
            name: 'Samsung Galaxy S24',
            price: 115000,
            originalPrice: 135000,
            discount: 15,
            image: '/products/galaxy-s24.jpg',
            stock: 50,
            sold: 23,
            timeLeft: '15:30'
          },
          {
            id: '2',
            name: 'iPhone 15 Pro',
            price: 145000,
            originalPrice: 165000,
            discount: 12,
            image: '/products/iphone-15.jpg',
            stock: 30,
            sold: 12,
            timeLeft: '45:20'
          }
        ],
        tags: ['Flash Sale', 'Electronics', 'Limited Time'],
        language: 'Bengali'
      },
      {
        id: '2',
        title: 'Fashion Friday: Latest Trends',
        host: {
          name: 'StyleQueen',
          avatar: '/hosts/stylequeen.jpg',
          verified: true,
          followers: 89000
        },
        thumbnail: '/live/fashion-show.jpg',
        viewers: 8960,
        duration: '1:45:32',
        isLive: true,
        category: 'Fashion',
        products: [
          {
            id: '3',
            name: 'Designer Kurti Set',
            price: 2500,
            originalPrice: 3500,
            discount: 29,
            image: '/products/kurti-set.jpg',
            stock: 100,
            sold: 67,
            timeLeft: '20:15'
          }
        ],
        tags: ['Fashion', 'Trends', 'Designer'],
        language: 'Bengali'
      },
      {
        id: '3',
        title: 'Home & Kitchen Essentials',
        host: {
          name: 'HomeHelper',
          avatar: '/hosts/homehelper.jpg',
          verified: false,
          followers: 45000
        },
        thumbnail: '/live/home-kitchen.jpg',
        viewers: 3240,
        duration: '0:58:43',
        isLive: true,
        category: 'Home & Kitchen',
        products: [
          {
            id: '4',
            name: 'Non-stick Cookware Set',
            price: 4500,
            originalPrice: 6000,
            discount: 25,
            image: '/products/cookware.jpg',
            stock: 75,
            sold: 34
          }
        ],
        tags: ['Home', 'Kitchen', 'Essentials'],
        language: 'English'
      }
    ];

    setStreams(mockStreams);
    setSelectedStream(mockStreams[0]);
    setLoading(false);

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'ShopperBD',
        message: 'Great deal on the Samsung!',
        timestamp: '2 min ago',
        type: 'message'
      },
      {
        id: '2',
        username: 'TechLover',
        message: 'Just bought the iPhone 15! 📱',
        timestamp: '1 min ago',
        type: 'purchase'
      },
      {
        id: '3',
        username: 'System',
        message: 'TechLover purchased iPhone 15 Pro',
        timestamp: '1 min ago',
        type: 'system'
      }
    ];

    setChatMessages(mockMessages);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: newMessage,
      timestamp: 'now',
      type: 'message'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleProductPurchase = (product: LiveProduct) => {
    // Simulate purchase
    console.log('Purchasing:', product);
    
    const purchaseMessage: ChatMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `You purchased ${product.name}!`,
      timestamp: 'now',
      type: 'system'
    };

    setChatMessages(prev => [...prev, purchaseMessage]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading live streams...</p>
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
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">🔴 Live Shopping</h1>
              <p className="text-lg opacity-90">Watch, interact, and shop in real-time</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{streams.reduce((total, stream) => total + stream.viewers, 0).toLocaleString()} watching</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                <span>{streams.filter(s => s.isLive).length} live now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-3">
            {selectedStream && (
              <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                {/* Video Player */}
                <div className="relative aspect-video bg-gray-900">
                  <img 
                    src={selectedStream.thumbnail} 
                    alt={selectedStream.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/api/placeholder/800/450?text=Live Stream`;
                    }}
                  />
                  
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                  
                  {/* Viewer Count */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {selectedStream.viewers.toLocaleString()}
                  </div>
                  
                  {/* Controls */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <button className="bg-black/70 text-white px-3 py-1 rounded-full text-sm hover:bg-black/90 transition-colors">
                      Share
                    </button>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="bg-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedStream.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <img 
                            src={selectedStream.host.avatar} 
                            alt={selectedStream.host.name}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/24/24?text=${selectedStream.host.name[0]}`;
                            }}
                          />
                          <span className="font-medium">{selectedStream.host.name}</span>
                          {selectedStream.host.verified && <Award className="h-4 w-4 text-blue-500" />}
                        </div>
                        <span>•</span>
                        <span>{selectedStream.host.followers.toLocaleString()} followers</span>
                        <span>•</span>
                        <span>Duration: {selectedStream.duration}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4" />
                        Follow
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedStream.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Featured Products */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStream.products.map(product => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex gap-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `/api/placeholder/80/80?text=${product.name}`;
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg font-bold text-red-600">৳{product.price.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
                                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  -{product.discount}%
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                <span>{product.sold} sold</span>
                                <span>{product.stock} left</span>
                                {product.timeLeft && (
                                  <span className="flex items-center gap-1 text-red-600">
                                    <Clock className="h-3 w-3" />
                                    {product.timeLeft}
                                  </span>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => handleProductPurchase(product)}
                                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Live Chat */}
            <div className="bg-white rounded-lg shadow-lg mb-6">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </h3>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showChat ? '−' : '+'}
                </button>
              </div>
              
              {showChat && (
                <>
                  <div className="h-64 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map(message => (
                      <div key={message.id} className={`text-sm ${
                        message.type === 'system' ? 'text-center text-gray-500 italic' :
                        message.type === 'purchase' ? 'bg-green-50 p-2 rounded' :
                        ''
                      }`}>
                        {message.type !== 'system' && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-purple-600">{message.username}:</span>
                            <span className="text-gray-900">{message.message}</span>
                          </div>
                        )}
                        {message.type === 'system' && (
                          <span>{message.message}</span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Other Live Streams */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Other Live Streams</h3>
              </div>
              <div className="p-4 space-y-4">
                {streams.filter(stream => stream.id !== selectedStream?.id).map(stream => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream)}
                    className="w-full text-left hover:bg-gray-50 transition-colors rounded-lg p-2"
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <img 
                          src={stream.thumbnail} 
                          alt={stream.title}
                          className="w-16 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/placeholder/64/48?text=Live`;
                          }}
                        />
                        {stream.isLive && (
                          <div className="absolute -top-1 -right-1 bg-red-600 text-white px-1 py-0.5 rounded text-xs">
                            LIVE
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{stream.title}</h4>
                        <p className="text-xs text-gray-600">{stream.host.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Eye className="h-3 w-3" />
                          <span>{stream.viewers.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Books'].map(category => (
              <Link href={`/live/category/${category.toLowerCase()}`} key={category}>
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{category[0]}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{category}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveShopping;