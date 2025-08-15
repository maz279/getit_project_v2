/**
 * LiveShoppingStreams - Real-time Social Commerce Platform
 * Phase 1 Week 3-4: Component Modernization
 * Features: Live streaming, real-time chat, product integration, social engagement
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, MessageCircle, ShoppingCart, Heart, Users, Eye, Gift, Share2, Star, Clock, Zap, Badge as BadgeIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Separator } from '../../ui/separator';
import { Avatar } from '../../ui/avatar';
import { Progress } from '../../ui/progress';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostVerified: boolean;
  hostFollowers: number;
  streamUrl: string;
  thumbnailUrl: string;
  startTime: Date;
  duration: number;
  viewerCount: number;
  peakViewers: number;
  status: 'live' | 'scheduled' | 'ended';
  category: string;
  tags: string[];
  isFollowing: boolean;
  likeCount: number;
  isLiked: boolean;
}

interface StreamProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  specialOffer?: {
    type: 'flash_sale' | 'bundle' | 'exclusive';
    discount: number;
    endTime: Date;
    claimed: number;
    total: number;
  };
  isAvailable: boolean;
  isPinned: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'product_highlight' | 'system' | 'gift';
  productId?: string;
  giftType?: string;
  likes: number;
  isLiked: boolean;
  isModerator: boolean;
  isHost: boolean;
}

interface LiveShoppingStreamsProps {
  streams?: LiveStream[];
  featuredStreamId?: string;
  autoPlay?: boolean;
  showChat?: boolean;
  showProducts?: boolean;
  className?: string;
  onStreamSelect?: (streamId: string) => void;
  onProductClick?: (productId: string, streamId: string) => void;
  onFollowHost?: (hostId: string) => void;
  onSendGift?: (streamId: string, giftType: string) => void;
  onShareStream?: (streamId: string) => void;
}

export function LiveShoppingStreams({
  streams = [],
  featuredStreamId,
  autoPlay = false,
  showChat = true,
  showProducts = true,
  className = "",
  onStreamSelect,
  onProductClick,
  onFollowHost,
  onSendGift,
  onShareStream
}: LiveShoppingStreamsProps) {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [streamProducts, setStreamProducts] = useState<StreamProduct[]>([]);
  const [showProductPanel, setShowProductPanel] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [streamStats, setStreamStats] = useState({
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0,
    engagementRate: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockStreams: LiveStream[] = [
    {
      id: 'stream-1',
      title: 'Summer Fashion Collection 2024 - Live Showcase',
      description: 'Discover the hottest fashion trends with exclusive live deals!',
      hostId: 'host-1',
      hostName: 'Fashion Guru Saba',
      hostAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      hostVerified: true,
      hostFollowers: 15420,
      streamUrl: '/mock-stream-1.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      startTime: new Date(Date.now() - 1800000), // 30 minutes ago
      duration: 3600, // 1 hour
      viewerCount: 1247,
      peakViewers: 1890,
      status: 'live',
      category: 'Fashion',
      tags: ['summer', 'fashion', 'deals', 'exclusive'],
      isFollowing: false,
      likeCount: 342,
      isLiked: false
    },
    {
      id: 'stream-2',
      title: 'Tech Gadgets Unboxing & Reviews',
      description: 'Latest smartphones, laptops, and accessories with live demos',
      hostId: 'host-2',
      hostName: 'Tech Expert Rahman',
      hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      hostVerified: true,
      hostFollowers: 8930,
      streamUrl: '/mock-stream-2.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop',
      startTime: new Date(Date.now() - 900000), // 15 minutes ago
      duration: 2700, // 45 minutes
      viewerCount: 832,
      peakViewers: 1156,
      status: 'live',
      category: 'Electronics',
      tags: ['tech', 'gadgets', 'reviews', 'unboxing'],
      isFollowing: true,
      likeCount: 198,
      isLiked: true
    }
  ];

  const mockProducts: StreamProduct[] = [
    {
      id: 'product-1',
      name: 'Summer Floral Dress',
      price: 2499,
      originalPrice: 3499,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
      brand: 'StyleCo',
      rating: 4.6,
      reviewCount: 234,
      stock: 15,
      specialOffer: {
        type: 'flash_sale',
        discount: 30,
        endTime: new Date(Date.now() + 1800000), // 30 minutes from now
        claimed: 48,
        total: 100
      },
      isAvailable: true,
      isPinned: true
    },
    {
      id: 'product-2',
      name: 'Wireless Bluetooth Earbuds',
      price: 3999,
      originalPrice: 5999,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
      brand: 'TechSound',
      rating: 4.8,
      reviewCount: 1420,
      stock: 8,
      specialOffer: {
        type: 'exclusive',
        discount: 35,
        endTime: new Date(Date.now() + 3600000), // 1 hour from now
        claimed: 76,
        total: 150
      },
      isAvailable: true,
      isPinned: false
    }
  ];

  const mockChatMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      userId: 'user-1',
      username: 'fashionlover23',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      message: 'Love this dress! Is it available in blue?',
      timestamp: new Date(Date.now() - 120000),
      type: 'message',
      likes: 5,
      isLiked: false,
      isModerator: false,
      isHost: false
    },
    {
      id: 'msg-2',
      userId: 'host-1',
      username: 'Fashion Guru Saba',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=50&h=50&fit=crop&crop=face',
      message: 'Yes! Blue and red variants are available. Limited stock!',
      timestamp: new Date(Date.now() - 100000),
      type: 'message',
      likes: 12,
      isLiked: true,
      isModerator: false,
      isHost: true
    },
    {
      id: 'msg-3',
      userId: 'user-2',
      username: 'shopaholic_bd',
      message: 'Just ordered 2 dresses! Amazing deal 🔥',
      timestamp: new Date(Date.now() - 80000),
      type: 'message',
      likes: 8,
      isLiked: false,
      isModerator: false,
      isHost: false
    }
  ];

  // Initialize with mock data
  useEffect(() => {
    const allStreams = streams.length > 0 ? streams : mockStreams;
    const featured = featuredStreamId ? 
      allStreams.find(s => s.id === featuredStreamId) : 
      allStreams.find(s => s.status === 'live') || allStreams[0];
    
    if (featured) {
      setSelectedStream(featured);
      setStreamProducts(mockProducts);
      setChatMessages(mockChatMessages);
    }
  }, [streams, featuredStreamId]);

  // Simulate real-time updates - DISABLED during restructuring
  useEffect(() => {
    // Temporarily disabled to prevent infinite re-renders during Phase 1 restructuring
    // Will be re-enabled after component migration is complete
    return;
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Format currency
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  // Format time remaining
  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: 'current-user',
      username: 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'message',
      likes: 0,
      isLiked: false,
      isModerator: false,
      isHost: false
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  }, [newMessage]);

  // Handle key press in chat
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Toggle video play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!selectedStream) {
    return (
      <div className={`live-shopping-streams ${className}`}>
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No live streams available
          </h3>
          <p className="text-gray-500">
            Check back later for exciting live shopping experiences
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`live-shopping-streams ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Stream Area - Left Side */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stream Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <img src={selectedStream.hostAvatar} alt={selectedStream.hostName} />
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{selectedStream.hostName}</h3>
                      {selectedStream.hostVerified && (
                        <BadgeIcon className="w-4 h-4 text-blue-500 fill-current" />
                      )}
                      <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedStream.hostFollowers.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedStream.isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={() => onFollowHost?.(selectedStream.hostId)}
                  >
                    {selectedStream.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => onShareStream?.(selectedStream.id)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {/* Mock video player - replace with actual video component */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">{selectedStream.title}</h3>
                <p className="text-sm opacity-75">{selectedStream.description}</p>
              </div>
            </div>

            {/* Stream Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className="bg-red-500 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2" />
                LIVE
              </Badge>
              <div className="flex items-center gap-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{selectedStream.viewerCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Stream Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={() => onSendGift?.(selectedStream.id, 'heart')}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Send Gift
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className={`bg-black bg-opacity-50 hover:bg-opacity-70 ${selectedStream.isLiked ? 'text-red-500' : 'text-white'}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${selectedStream.isLiked ? 'fill-current' : ''}`} />
                  {selectedStream.likeCount}
                </Button>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">{selectedStream.title}</h2>
              <p className="text-gray-600 mb-4">{selectedStream.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Started {new Date(selectedStream.startTime).toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Peak: {selectedStream.peakViewers.toLocaleString()} viewers
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {selectedStream.category}
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedStream.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Featured Products */}
          {showProducts && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="w-4 h-4" />
                  Featured Products ({streamProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {streamProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onProductClick?.(product.id, selectedStream.id)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h4>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-red-600 text-lg">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.reviewCount})
                          </span>
                          {product.isPinned && (
                            <Badge className="bg-yellow-500 text-xs">Pinned</Badge>
                          )}
                        </div>

                        {/* Special Offer */}
                        {product.specialOffer && (
                          <div className="mt-2">
                            <Badge className="bg-red-500 text-xs mb-2">
                              <Zap className="w-3 h-3 mr-1" />
                              {product.specialOffer.discount}% OFF
                            </Badge>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Claimed: {product.specialOffer.claimed}/{product.specialOffer.total}</span>
                                <span className="text-red-600 font-medium">
                                  Ends in: {formatTimeRemaining(product.specialOffer.endTime)}
                                </span>
                              </div>
                              <Progress 
                                value={(product.specialOffer.claimed / product.specialOffer.total) * 100}
                                className="h-2"
                              />
                            </div>
                          </div>
                        )}

                        <Button className="w-full mt-2" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Live Chat */}
          {showChat && (
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat ({chatMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Chat Messages */}
                <div
                  ref={chatRef}
                  className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50"
                >
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex gap-2">
                      {message.userAvatar && (
                        <Avatar className="w-6 h-6">
                          <img src={message.userAvatar} alt={message.username} />
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            message.isHost ? 'text-red-600' : 
                            message.isModerator ? 'text-blue-600' : 
                            'text-gray-700'
                          }`}>
                            {message.username}
                          </span>
                          {message.isHost && (
                            <Badge className="bg-red-500 text-xs">Host</Badge>
                          )}
                          {message.isModerator && (
                            <Badge className="bg-blue-500 text-xs">Mod</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 break-words">
                          {message.message}
                        </p>
                        {message.likes > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Heart className="w-3 h-3 text-red-500 fill-current" />
                            <span className="text-xs text-gray-500">{message.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      ref={messageInputRef}
                      placeholder="Say something..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stream Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Stream Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Viewers:</span>
                  <span className="font-medium">{selectedStream.viewerCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peak Viewers:</span>
                  <span className="font-medium">{selectedStream.peakViewers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Likes:</span>
                  <span className="font-medium">{selectedStream.likeCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stream Duration:</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - selectedStream.startTime.getTime()) / 60000)} minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bangladesh Mobile Banking & Performance Optimization */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {/* Mobile Banking Quick Access */}
        <div className="bg-white rounded-lg shadow-lg p-3 border">
          <div className="text-xs font-medium text-gray-700 mb-2">মোবাইল ব্যাংকিং</div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-orange-600">🟠</span>
              <span>bKash</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-blue-600">🔵</span>
              <span>Nagad</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-purple-600">🟣</span>
              <span>Rocket</span>
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="bg-green-50 rounded-lg p-2 border border-green-200">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3 h-3 text-green-600" />
            <span className="text-green-800">Mobile Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveShoppingStreams;