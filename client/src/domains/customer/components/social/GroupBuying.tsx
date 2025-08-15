import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { 
  Users, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  MessageCircle, 
  Gift, 
  Zap,
  TrendingUp,
  ShoppingCart,
  Timer,
  Target,
  Award,
  Crown,
  Flame,
  DollarSign,
  ArrowRight,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupBuyProduct {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  images: string[];
  originalPrice: number;
  groupPrice: number;
  minQuantity: number;
  maxQuantity: number;
  currentParticipants: number;
  timeRemaining: number;
  vendor: {
    id: string;
    name: string;
    rating: number;
    avatar: string;
  };
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  discount: number;
  isActive: boolean;
  isHot: boolean;
  isTrending: boolean;
  participants: Participant[];
  groupLeader?: Participant;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  quantity: number;
  joinedAt: Date;
  isLeader: boolean;
  isFriend: boolean;
  isVerified: boolean;
}

interface GroupBuyingProps {
  userId?: string;
  userFriends?: string[];
  onJoinGroup?: (productId: string, quantity: number) => void;
  onCreateGroup?: (productId: string, quantity: number) => void;
  onInviteFriends?: (productId: string, friendIds: string[]) => void;
  onShareGroup?: (productId: string, platform: string) => void;
}

export const GroupBuying: React.FC<GroupBuyingProps> = ({
  userId,
  userFriends = [],
  onJoinGroup,
  onCreateGroup,
  onInviteFriends,
  onShareGroup
}) => {
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedProduct, setSelectedProduct] = useState<GroupBuyProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [groupProducts, setGroupProducts] = useState<GroupBuyProduct[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Sample group buying products
  useEffect(() => {
    const mockProducts: GroupBuyProduct[] = [
      {
        id: 'gb1',
        name: 'Wireless Bluetooth Earbuds',
        nameBn: 'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস',
        description: 'Premium quality wireless earbuds with noise cancellation',
        descriptionBn: 'নয়েজ ক্যান্সেলেশন সহ প্রিমিয়াম মানের ওয়্যারলেস ইয়ারবাডস',
        images: ['/api/placeholder/400/400'],
        originalPrice: 4500,
        groupPrice: 2800,
        minQuantity: 10,
        maxQuantity: 50,
        currentParticipants: 7,
        timeRemaining: 2 * 24 * 60 * 60 * 1000, // 2 days
        vendor: {
          id: 'v1',
          name: 'TechWorld BD',
          rating: 4.8,
          avatar: '/api/placeholder/50/50'
        },
        category: 'Electronics',
        tags: ['wireless', 'bluetooth', 'earbuds'],
        rating: 4.6,
        reviewCount: 234,
        discount: 38,
        isActive: true,
        isHot: true,
        isTrending: true,
        participants: [
          {
            id: 'u1',
            name: 'আহমেদ রহমান',
            avatar: '/api/placeholder/40/40',
            quantity: 2,
            joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isLeader: true,
            isFriend: false,
            isVerified: true
          },
          {
            id: 'u2',
            name: 'ফাতেমা খান',
            avatar: '/api/placeholder/40/40',
            quantity: 1,
            joinedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isLeader: false,
            isFriend: true,
            isVerified: false
          }
        ],
        groupLeader: {
          id: 'u1',
          name: 'আহমেদ রহমান',
          avatar: '/api/placeholder/40/40',
          quantity: 2,
          joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isLeader: true,
          isFriend: false,
          isVerified: true
        }
      },
      {
        id: 'gb2',
        name: 'Smart Fitness Watch',
        nameBn: 'স্মার্ট ফিটনেস ওয়াচ',
        description: 'Advanced fitness tracking with heart rate monitor',
        descriptionBn: 'হার্ট রেট মনিটর সহ অ্যাডভান্সড ফিটনেস ট্র্যাকিং',
        images: ['/api/placeholder/400/400'],
        originalPrice: 8500,
        groupPrice: 5500,
        minQuantity: 5,
        maxQuantity: 25,
        currentParticipants: 3,
        timeRemaining: 1 * 24 * 60 * 60 * 1000, // 1 day
        vendor: {
          id: 'v2',
          name: 'FitTech Store',
          rating: 4.7,
          avatar: '/api/placeholder/50/50'
        },
        category: 'Wearables',
        tags: ['smartwatch', 'fitness', 'health'],
        rating: 4.5,
        reviewCount: 156,
        discount: 35,
        isActive: true,
        isHot: false,
        isTrending: true,
        participants: [
          {
            id: 'u3',
            name: 'মোহাম্মদ আলী',
            avatar: '/api/placeholder/40/40',
            quantity: 1,
            joinedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            isLeader: true,
            isFriend: false,
            isVerified: true
          }
        ],
        groupLeader: {
          id: 'u3',
          name: 'মোহাম্মদ আলী',
          avatar: '/api/placeholder/40/40',
          quantity: 1,
          joinedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          isLeader: true,
          isFriend: false,
          isVerified: true
        }
      }
    ];

    setGroupProducts(mockProducts);
  }, []);

  // Format time remaining
  const formatTimeRemaining = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate progress percentage
  const getProgress = (current: number, min: number, max: number) => {
    return Math.min((current / min) * 100, 100);
  };

  // Handle join group
  const handleJoinGroup = async (product: GroupBuyProduct) => {
    if (!userId) {
      toast.error('Please login to join group buying');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onJoinGroup) {
        onJoinGroup(product.id, quantity);
      }
      
      toast.success(`Successfully joined group buying for ${product.name}!`);
      
      // Update product participants
      setGroupProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, currentParticipants: p.currentParticipants + 1 }
          : p
      ));
      
    } catch (error) {
      toast.error('Failed to join group buying');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create group
  const handleCreateGroup = async (productId: string) => {
    if (!userId) {
      toast.error('Please login to create group buying');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onCreateGroup) {
        onCreateGroup(productId, quantity);
      }
      
      toast.success('Group buying created successfully!');
      
    } catch (error) {
      toast.error('Failed to create group buying');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share
  const handleShare = (product: GroupBuyProduct, platform: string) => {
    const shareUrl = `${window.location.origin}/group-buy/${product.id}`;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } else {
      if (onShareGroup) {
        onShareGroup(product.id, platform);
      }
      
      // Open sharing platform
      let shareLink = '';
      const text = `Check out this amazing group buying deal: ${product.name} for only ${formatCurrency(product.groupPrice)}!`;
      
      switch (platform) {
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'whatsapp':
          shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
          break;
      }
      
      if (shareLink) {
        window.open(shareLink, '_blank');
      }
    }
    
    setShareDialogOpen(false);
  };

  // Render product card
  const renderProductCard = (product: GroupBuyProduct) => {
    const progress = getProgress(product.currentParticipants, product.minQuantity, product.maxQuantity);
    const isMinReached = product.currentParticipants >= product.minQuantity;
    
    return (
      <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
        {/* Hot/Trending badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
          {product.isHot && (
            <Badge variant="destructive" className="text-xs">
              <Flame className="h-3 w-3 mr-1" />
              Hot
            </Badge>
          )}
          {product.isTrending && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {/* Time remaining badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="bg-white/90">
            <Timer className="h-3 w-3 mr-1" />
            {formatTimeRemaining(product.timeRemaining)}
          </Badge>
        </div>

        <div className="relative">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/api/placeholder/400/400';
            }}
          />
          
          {/* Discount overlay */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="text-sm font-bold">
              -{product.discount}%
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-600">{product.nameBn}</p>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(product.groupPrice)}
                </span>
                <span className="text-sm line-through text-gray-500">
                  {formatCurrency(product.originalPrice)}
                </span>
              </div>
              <p className="text-xs text-gray-600">Group price (min {product.minQuantity} pcs)</p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{product.currentParticipants}/{product.minQuantity}</span>
                </span>
                <span className={`font-medium ${isMinReached ? 'text-green-600' : 'text-orange-600'}`}>
                  {isMinReached ? 'Goal Reached!' : `${product.minQuantity - product.currentParticipants} more needed`}
                </span>
              </div>
              
              <Progress 
                value={progress} 
                className={`h-2 ${isMinReached ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'}`}
              />
            </div>

            {/* Participants preview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-2">
                  {product.participants.slice(0, 3).map((participant, index) => (
                    <Avatar key={participant.id} className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-xs">
                        {participant.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {product.participants.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{product.participants.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.rating}</span>
                <span>({product.reviewCount})</span>
              </div>
            </div>

            {/* Group leader */}
            {product.groupLeader && (
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <Crown className="h-4 w-4 text-yellow-500" />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={product.groupLeader.avatar} />
                  <AvatarFallback className="text-xs">
                    {product.groupLeader.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs font-medium">{product.groupLeader.name}</p>
                  <p className="text-xs text-gray-500">Group Leader</p>
                </div>
                {product.groupLeader.isVerified && (
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleJoinGroup(product)}
                disabled={isLoading}
              >
                <Users className="h-4 w-4 mr-1" />
                Join Group
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedProduct(product);
                  setShareDialogOpen(true);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedProduct(product);
                  setInviteDialogOpen(true);
                }}
              >
                <Gift className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Group Buying</h1>
        <p className="text-lg text-gray-600">
          Join friends to unlock amazing group discounts!
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Team up with friends</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>Save up to 50%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4" />
            <span>Limited time offers</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="ending-soon">
            <Clock className="h-4 w-4 mr-1" />
            Ending Soon
          </TabsTrigger>
          <TabsTrigger value="my-groups">
            <Users className="h-4 w-4 mr-1" />
            My Groups
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Target className="h-4 w-4 mr-1" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupProducts.filter(p => p.isTrending).map(renderProductCard)}
          </div>
        </TabsContent>

        <TabsContent value="ending-soon" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupProducts
              .filter(p => p.timeRemaining < 24 * 60 * 60 * 1000)
              .map(renderProductCard)}
          </div>
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Groups</h3>
            <p className="text-gray-500 mb-4">You haven't joined any group buying yet.</p>
            <Button onClick={() => setActiveTab('trending')}>
              Browse Group Deals
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Groups</h3>
            <p className="text-gray-500">Your completed group purchases will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Group Buying Deal</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(selectedProduct.groupPrice)} (Save {selectedProduct.discount}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedProduct, 'facebook')}
                  className="flex items-center space-x-2"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span>Facebook</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedProduct, 'twitter')}
                  className="flex items-center space-x-2"
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span>Twitter</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedProduct, 'whatsapp')}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedProduct, 'copy')}
                  className="flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Friends Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends to Group</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Invite your friends to join this group buying deal and unlock amazing discounts together!
            </p>

            <div className="space-y-2">
              <h4 className="font-medium">Your Friends</h4>
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Connect your social accounts to invite friends</p>
                <Button variant="outline" className="mt-2">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Connect Social Media
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupBuying;