import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Heart, 
  Share2, 
  TrendingUp, 
  MessageCircle, 
  Star, 
  Gift, 
  Award,
  Calendar,
  Globe,
  Camera,
  Video,
  ShoppingCart,
  Eye,
  Zap,
  Target,
  BarChart3,
  ChevronRight,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { SocialPost, InfluencerProfile, CollaborationCampaign, SocialWishlist } from '@/shared/schema';

interface SocialCommerceDashboardProps {
  userId?: string;
  userRole?: 'customer' | 'vendor' | 'influencer' | 'admin';
}

interface SocialCommerceStats {
  totalPosts: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  engagementRate: number;
  influencerCount: number;
  activeCampaigns: number;
  totalWishlists: number;
  bangladeshSpecificMetrics: {
    festivalPosts: number;
    culturalEngagement: number;
    regionalInfluencers: number;
  };
}

const SocialCommerceDashboard: React.FC<SocialCommerceDashboardProps> = ({ 
  userId, 
  userRole = 'customer' 
}) => {
  const [selectedTab, setSelectedTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch social commerce stats
  const { data: stats, isLoading: statsLoading } = useQuery<SocialCommerceStats>({
    queryKey: ['/api/v1/social-commerce/stats'],
    enabled: true,
  });

  // Fetch trending posts
  const { data: trendingPosts, isLoading: postsLoading } = useQuery<SocialPost[]>({
    queryKey: ['/api/v1/social-commerce/posts/trending', { category: filterCategory, search: searchQuery }],
    enabled: true,
  });

  // Fetch featured influencers
  const { data: featuredInfluencers, isLoading: influencersLoading } = useQuery<InfluencerProfile[]>({
    queryKey: ['/api/v1/social-commerce/influencers/featured'],
    enabled: true,
  });

  // Fetch active campaigns
  const { data: activeCampaigns, isLoading: campaignsLoading } = useQuery<CollaborationCampaign[]>({
    queryKey: ['/api/v1/social-commerce/campaigns/active'],
    enabled: true,
  });

  // Fetch popular wishlists
  const { data: popularWishlists, isLoading: wishlistsLoading } = useQuery<SocialWishlist[]>({
    queryKey: ['/api/v1/social-commerce/wishlists/popular'],
    enabled: true,
  });

  // Mock data for demonstration (fallback when APIs are not available)
  const mockStats: SocialCommerceStats = {
    totalPosts: 12450,
    totalLikes: 89320,
    totalShares: 15670,
    totalComments: 23580,
    engagementRate: 8.5,
    influencerCount: 2340,
    activeCampaigns: 156,
    totalWishlists: 8920,
    bangladeshSpecificMetrics: {
      festivalPosts: 890,
      culturalEngagement: 92.3,
      regionalInfluencers: 450
    }
  };

  const displayStats = stats || mockStats;

  // Bangladesh cultural awareness
  const bangladeshEvents = [
    { name: "Eid ul-Fitr", date: "2025-03-30", status: "upcoming" },
    { name: "Pohela Boishakh", date: "2025-04-14", status: "upcoming" },
    { name: "Victory Day", date: "2024-12-16", status: "recent" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Social Commerce Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Connect, Share, and Shop with Bangladesh's Leading Social Marketplace
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Globe className="w-3 h-3 mr-1" />
                Bangladesh
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                {displayStats.influencerCount.toLocaleString()} Influencers
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Posts</p>
                  <p className="text-3xl font-bold">{displayStats.totalPosts.toLocaleString()}</p>
                  <p className="text-blue-100 text-xs mt-1">+12% this month</p>
                </div>
                <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                  <Camera className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium">Total Engagement</p>
                  <p className="text-3xl font-bold">{displayStats.totalLikes.toLocaleString()}</p>
                  <p className="text-rose-100 text-xs mt-1">{displayStats.engagementRate}% rate</p>
                </div>
                <div className="bg-rose-400 bg-opacity-30 p-3 rounded-full">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Campaigns</p>
                  <p className="text-3xl font-bold">{displayStats.activeCampaigns}</p>
                  <p className="text-emerald-100 text-xs mt-1">+23 this week</p>
                </div>
                <div className="bg-emerald-400 bg-opacity-30 p-3 rounded-full">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Social Wishlists</p>
                  <p className="text-3xl font-bold">{displayStats.totalWishlists.toLocaleString()}</p>
                  <p className="text-purple-100 text-xs mt-1">+8% growth</p>
                </div>
                <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                  <Gift className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bangladesh Cultural Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-950 dark:to-red-950 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Bangladesh Cultural Events</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Festival-specific content and campaigns</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bangladeshEvents.map((event, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{event.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                    </div>
                    <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList className="grid w-full md:w-auto grid-cols-4 lg:grid-cols-4">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="influencers" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Influencers
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="wishlists" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Wishlists
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trending Posts */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Trending Posts
                    </CardTitle>
                    <CardDescription>Most engaging content from the Bangladesh community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/api/placeholder/48/48?seed=${index}`} />
                          <AvatarFallback>U{index}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Influencer Name {index}</p>
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Amazing Eid collection review! Love these traditional designs with modern touch 🎉
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {(index * 234).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {index * 45}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              {index * 23}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Post Analytics */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Content Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement Rate</span>
                        <span>{displayStats.engagementRate}%</span>
                      </div>
                      <Progress value={displayStats.engagementRate * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cultural Content</span>
                        <span>{displayStats.bangladeshSpecificMetrics.culturalEngagement}%</span>
                      </div>
                      <Progress value={displayStats.bangladeshSpecificMetrics.culturalEngagement} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Festival Posts</span>
                        <span>{displayStats.bangladeshSpecificMetrics.festivalPosts}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="influencers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
                    <div className="p-6 -mt-8">
                      <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800 mb-4">
                        <AvatarImage src={`/api/placeholder/64/64?seed=influencer${index}`} />
                        <AvatarFallback>IN{index}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Influencer {index}</h3>
                          <Badge variant="outline" className="text-xs">
                            {index % 2 === 0 ? 'Micro' : 'Macro'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Fashion & Lifestyle • Dhaka, Bangladesh
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {(index * 12500).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {(4.0 + index * 0.1).toFixed(1)}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Eid Fashion Campaign {index}</CardTitle>
                        <CardDescription>Traditional meets modern fashion collaboration</CardDescription>
                      </div>
                      <Badge variant={index % 2 === 0 ? 'default' : 'secondary'}>
                        {index % 2 === 0 ? 'Active' : 'Upcoming'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Budget</span>
                      <span className="font-medium">৳ {(index * 25000).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Applications</span>
                      <span className="font-medium">{index * 23}/50</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                      <span className="font-medium">March {15 + index}, 2025</span>
                    </div>
                    <Progress value={(index * 23 / 50) * 100} className="h-2" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wishlists" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`/api/placeholder/40/40?seed=wishlist${index}`} />
                        <AvatarFallback>W{index}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">Eid Shopping List {index}</CardTitle>
                        <CardDescription className="text-sm">by User {index}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Items</span>
                      <span className="font-medium">{index * 7} products</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                      <span className="font-medium">৳ {(index * 15000).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Collaborators</span>
                      <span className="font-medium">{index + 2} people</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Gift className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with social commerce features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Camera className="w-6 h-6" />
                <span>Create Post</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Star className="w-6 h-6" />
                <span>Join as Influencer</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Target className="w-6 h-6" />
                <span>Start Campaign</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Gift className="w-6 h-6" />
                <span>Create Wishlist</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialCommerceDashboard;