import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Calendar, 
  Bell, 
  Star, 
  Clock, 
  Zap, 
  Gift, 
  TrendingUp,
  Eye,
  Heart,
  ArrowRight
} from 'lucide-react';

interface UpcomingDealsProps {
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const UpcomingDeals: React.FC<UpcomingDealsProps> = ({ viewMode = 'grid', className }) => {
  const [notifySet, setNotifySet] = useState<Set<number>>(new Set());

  const upcomingDeals = [
    {
      id: 1,
      name: 'MacBook Pro M4 Max 18" 2TB SSD',
      image: '/api/placeholder/300/300',
      currentPrice: '৳5,50,000',
      dealPrice: '৳4,75,000',
      discount: 14,
      category: 'Computers',
      startTime: '2024-07-12T10:00:00',
      endTime: '2024-07-12T18:00:00',
      dealType: 'flash',
      estimatedSavings: '৳75,000',
      popularity: 95,
      stock: 'Limited (20 units)',
      seller: 'Apple Store BD',
      previewRating: 4.9,
      isExclusive: true,
      tags: ['New Launch', 'Premium']
    },
    {
      id: 2,
      name: 'Samsung Galaxy S25 Ultra 1TB',
      image: '/api/placeholder/300/300',
      currentPrice: '৳1,65,000',
      dealPrice: '৳1,35,000',
      discount: 18,
      category: 'Smartphones',
      startTime: '2024-07-12T14:00:00',
      endTime: '2024-07-13T14:00:00',
      dealType: 'lightning',
      estimatedSavings: '৳30,000',
      popularity: 89,
      stock: 'Good (100+ units)',
      seller: 'Samsung Official',
      previewRating: 4.8,
      isExclusive: false,
      tags: ['Pre-order', 'Latest']
    },
    {
      id: 3,
      name: 'Sony PlayStation 5 Pro Console',
      image: '/api/placeholder/300/300',
      currentPrice: '৳85,000',
      dealPrice: '৳65,000',
      discount: 24,
      category: 'Gaming',
      startTime: '2024-07-13T16:00:00',
      endTime: '2024-07-13T20:00:00',
      dealType: 'mega',
      estimatedSavings: '৳20,000',
      popularity: 92,
      stock: 'Very Limited (5 units)',
      seller: 'GameZone BD',
      previewRating: 4.7,
      isExclusive: true,
      tags: ['Gaming', 'Exclusive']
    },
    {
      id: 4,
      name: 'Canon EOS R5 Mark II Camera Bundle',
      image: '/api/placeholder/300/300',
      currentPrice: '৳4,25,000',
      dealPrice: '৳3,50,000',
      discount: 18,
      category: 'Cameras',
      startTime: '2024-07-14T12:00:00',
      endTime: '2024-07-15T12:00:00',
      dealType: 'bundle',
      estimatedSavings: '৳75,000',
      popularity: 76,
      stock: 'Moderate (50 units)',
      seller: 'Camera Pro',
      previewRating: 4.6,
      isExclusive: false,
      tags: ['Bundle Deal', 'Professional']
    },
    {
      id: 5,
      name: 'LG OLED C4 77" 4K Smart TV',
      image: '/api/placeholder/300/300',
      currentPrice: '৳4,50,000',
      dealPrice: '৳3,25,000',
      discount: 28,
      category: 'TVs',
      startTime: '2024-07-15T18:00:00',
      endTime: '2024-07-16T06:00:00',
      dealType: 'midnight',
      estimatedSavings: '৳1,25,000',
      popularity: 83,
      stock: 'Limited (15 units)',
      seller: 'LG Official Store',
      previewRating: 4.8,
      isExclusive: true,
      tags: ['Premium', 'Midnight Deal']
    },
    {
      id: 6,
      name: 'Tesla Model Y Accessories Bundle',
      image: '/api/placeholder/300/300',
      currentPrice: '৳2,50,000',
      dealPrice: '৳1,75,000',
      discount: 30,
      category: 'Automotive',
      startTime: '2024-07-16T09:00:00',
      endTime: '2024-07-17T09:00:00',
      dealType: 'weekend',
      estimatedSavings: '৳75,000',
      popularity: 68,
      stock: 'Good (30 units)',
      seller: 'Tesla Bangladesh',
      previewRating: 4.5,
      isExclusive: false,
      tags: ['Weekend Special', 'Tesla']
    }
  ];

  const toggleNotify = (dealId: number) => {
    setNotifySet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Starting soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case 'flash': return <Zap className="w-4 h-4" />;
      case 'lightning': return <Zap className="w-4 h-4" />;
      case 'mega': return <Star className="w-4 h-4" />;
      case 'bundle': return <Gift className="w-4 h-4" />;
      case 'midnight': return <Clock className="w-4 h-4" />;
      case 'weekend': return <Calendar className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getDealTypeColor = (type: string) => {
    switch (type) {
      case 'flash': return 'from-yellow-500 to-orange-500';
      case 'lightning': return 'from-purple-500 to-pink-500';
      case 'mega': return 'from-red-500 to-orange-500';
      case 'bundle': return 'from-green-500 to-blue-500';
      case 'midnight': return 'from-indigo-500 to-purple-500';
      case 'weekend': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const UpcomingDealCard = ({ deal, isListView = false }: { deal: any; isListView?: boolean }) => {
    const isNotifySet = notifySet.has(deal.id);
    const timeUntil = getTimeUntilStart(deal.startTime);
    const dealIcon = getDealTypeIcon(deal.dealType);
    const dealColor = getDealTypeColor(deal.dealType);
    
    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 ${isListView ? 'flex' : ''} ${deal.isExclusive ? 'ring-2 ring-yellow-300' : ''}`}>
        <CardContent className={`p-4 ${isListView ? 'flex gap-4 w-full' : ''}`}>
          {/* Product Image */}
          <div className={`relative ${isListView ? 'w-48 h-48 flex-shrink-0' : 'w-full h-48'} mb-3`}>
            <img
              src={deal.image}
              alt={deal.name}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Deal Type Badge */}
            <Badge className={`absolute top-2 left-2 bg-gradient-to-r ${dealColor} text-white border-0 flex items-center gap-1`}>
              {dealIcon}
              {deal.dealType.charAt(0).toUpperCase() + deal.dealType.slice(1)}
            </Badge>
            
            {/* Exclusive Badge */}
            {deal.isExclusive && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                ⭐ Exclusive
              </Badge>
            )}

            {/* Countdown */}
            <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
              <Clock className="w-3 h-3 mr-1" />
              Starts in {timeUntil}
            </Badge>
            
            {/* Popularity Indicator */}
            <div className="absolute bottom-2 right-2 bg-white/90 rounded-full p-1">
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="font-bold text-green-600">{deal.popularity}%</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className={`${isListView ? 'flex-1' : ''} space-y-3`}>
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {deal.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h3 className={`font-semibold text-gray-900 line-clamp-2 ${isListView ? 'text-lg' : 'text-sm'}`}>
              {deal.name}
            </h3>
            
            {/* Preview Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600">{deal.previewRating}</span>
              </div>
              <span className="text-sm text-gray-500">Expected rating</span>
            </div>
            
            {/* Pricing Preview */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">{deal.currentPrice}</span>
                <span className={`font-bold text-green-600 ${isListView ? 'text-2xl' : 'text-lg'}`}>
                  {deal.dealPrice}
                </span>
                <Badge className="bg-red-100 text-red-700">
                  {deal.discount}% OFF
                </Badge>
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-medium">You'll save: {deal.estimatedSavings}</span>
              </div>
            </div>
            
            {/* Deal Details */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{deal.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Stock:</span>
                <span className={`font-medium ${deal.stock.includes('Limited') ? 'text-red-600' : 'text-green-600'}`}>
                  {deal.stock}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Seller:</span>
                <span className="font-medium">{deal.seller}</span>
              </div>
            </div>

            {/* Interest Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Interest Level</span>
                <span className="font-medium">{deal.popularity}% interested</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${dealColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${deal.popularity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-2 mt-4 ${isListView ? 'flex-col w-32' : ''}`}>
            <Button 
              size="sm" 
              variant={isNotifySet ? "default" : "outline"}
              onClick={() => toggleNotify(deal.id)}
              className="flex-1"
            >
              <Bell className={`w-4 h-4 mr-1 ${isNotifySet ? 'animate-pulse' : ''}`} />
              {isNotifySet ? 'Notify Set' : 'Notify Me'}
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                🔔 Upcoming Deals Preview
              </h3>
              <p className="text-gray-600">
                Get ready for amazing savings! Set notifications to never miss a deal.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{upcomingDeals.length}</div>
              <div className="text-sm text-gray-600">Deals Coming</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-yellow-600">5</div>
            <div className="text-xs text-gray-600">Exclusive Deals</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-green-600">30%</div>
            <div className="text-xs text-gray-600">Max Discount</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-purple-600">₹4L+</div>
            <div className="text-xs text-gray-600">Total Savings</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-red-600">{notifySet.size}</div>
            <div className="text-xs text-gray-600">Notifications Set</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deals Grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
      }>
        {upcomingDeals.map((deal) => (
          <UpcomingDealCard 
            key={deal.id} 
            deal={deal} 
            isListView={viewMode === 'list'} 
          />
        ))}
      </div>

      {/* Notification CTA */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 border-0 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">
            📱 Never Miss a Deal Again
          </h3>
          <p className="text-lg text-white/90 mb-4">
            Enable notifications and be the first to know about upcoming sales
          </p>
          <Button className="bg-white text-green-600 hover:bg-gray-100" size="lg">
            <Bell className="w-5 h-5 mr-2" />
            Enable Notifications
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};