/**
 * Influencer Dashboard - Amazon.com/Shopee.sg Level Influencer Management
 * Complete influencer dashboard with analytics and campaign management
 * 
 * @fileoverview Enterprise-grade influencer dashboard with Bangladesh features
 * @author GetIt Platform Team
 * @version 4.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Target,
  Calendar,
  Award,
  Star,
  Briefcase,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Camera,
  Video,
  Globe,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Progress } from '../../../shared/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InfluencerProfile {
  id: string;
  userId: number;
  socialProfileId: string;
  influencerTier: 'nano' | 'micro' | 'macro' | 'mega' | 'celebrity';
  categories: string[];
  totalFollowers: number;
  averageEngagementRate: number;
  averageViews: number;
  contentQualityScore: number;
  authenticityScore: number;
  responseRate: number;
  collaborationRate: number;
  status: string;
  rating: number;
  totalReviews: number;
  performanceMetrics: {
    totalCampaigns: number;
    successfulCampaigns: number;
    averageROI: number;
    averageConversionRate: number;
    totalEarnings: number;
    averageRating: number;
  };
  externalPlatforms: {
    facebook?: { followers: number; engagement_rate: number; verified: boolean };
    instagram?: { followers: number; engagement_rate: number; verified: boolean };
    youtube?: { subscribers: number; views: number; verified: boolean };
    tiktok?: { followers: number; likes: number; verified: boolean };
  };
}

interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  budget: number;
  status: string;
  startDate: string;
  endDate: string;
  applicationsCount: number;
  isApplied: boolean;
  applicationStatus?: string;
}

interface InfluencerDashboardProps {
  influencerProfile: InfluencerProfile;
  campaigns: Campaign[];
  analytics: any;
  earnings: any;
  className?: string;
}

const InfluencerDashboard: React.FC<InfluencerDashboardProps> = ({
  influencerProfile,
  campaigns,
  analytics,
  earnings,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');

  // Sample analytics data
  const engagementData = [
    { name: 'Jan', engagement: 4.2, reach: 15000 },
    { name: 'Feb', engagement: 4.8, reach: 18000 },
    { name: 'Mar', engagement: 5.1, reach: 22000 },
    { name: 'Apr', engagement: 4.9, reach: 25000 },
    { name: 'May', engagement: 5.3, reach: 28000 },
    { name: 'Jun', engagement: 5.7, reach: 32000 },
  ];

  const platformData = [
    { name: 'Instagram', value: 45, color: '#E1306C' },
    { name: 'YouTube', value: 30, color: '#FF0000' },
    { name: 'TikTok', value: 15, color: '#000000' },
    { name: 'Facebook', value: 10, color: '#1877F2' },
  ];

  const earningsData = [
    { month: 'Jan', earnings: 2500, campaigns: 3 },
    { month: 'Feb', earnings: 3200, campaigns: 4 },
    { month: 'Mar', earnings: 4100, campaigns: 5 },
    { month: 'Apr', earnings: 3800, campaigns: 4 },
    { month: 'May', earnings: 5200, campaigns: 6 },
    { month: 'Jun', earnings: 6100, campaigns: 7 },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'celebrity': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'mega': return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'macro': return 'bg-gradient-to-r from-green-500 to-blue-500';
      case 'micro': return 'bg-gradient-to-r from-yellow-500 to-green-500';
      case 'nano': return 'bg-gradient-to-r from-orange-500 to-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Influencer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your campaigns and track your performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Create Content
          </Button>
          <Button>
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Campaigns
          </Button>
        </div>
      </div>

      {/* Profile Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full ${getTierColor(influencerProfile.influencerTier)} p-1`}>
                <Avatar className="w-full h-full">
                  <AvatarImage src="/api/placeholder/80/80" />
                  <AvatarFallback className="text-2xl">IN</AvatarFallback>
                </Avatar>
              </div>
              <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 capitalize">
                {influencerProfile.influencerTier}
              </Badge>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Influencer Profile
                </h2>
                {influencerProfile.status === 'verified' && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{influencerProfile.rating}</span>
                  <span className="text-gray-500">({influencerProfile.totalReviews})</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(influencerProfile.totalFollowers)}
                  </div>
                  <div className="text-sm text-gray-500">Total Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {influencerProfile.averageEngagementRate}%
                  </div>
                  <div className="text-sm text-gray-500">Engagement Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(influencerProfile.collaborationRate)}
                  </div>
                  <div className="text-sm text-gray-500">Rate per Post</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {influencerProfile.performanceMetrics.totalCampaigns}
                  </div>
                  <div className="text-sm text-gray-500">Campaigns</div>
                </div>
              </div>

              {/* Performance Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Content Quality</span>
                    <span className="text-sm text-gray-500">
                      {influencerProfile.contentQualityScore}/100
                    </span>
                  </div>
                  <Progress value={influencerProfile.contentQualityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Authenticity</span>
                    <span className="text-sm text-gray-500">
                      {influencerProfile.authenticityScore}/100
                    </span>
                  </div>
                  <Progress value={influencerProfile.authenticityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Response Rate</span>
                    <span className="text-sm text-gray-500">
                      {influencerProfile.responseRate}%
                    </span>
                  </div>
                  <Progress value={influencerProfile.responseRate} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(influencerProfile.performanceMetrics.totalEarnings)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {campaigns.filter(c => c.isApplied).length} applications pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {influencerProfile.performanceMetrics.averageROI}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Above industry average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((influencerProfile.performanceMetrics.successfulCampaigns / influencerProfile.performanceMetrics.totalCampaigns) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {influencerProfile.performanceMetrics.successfulCampaigns} of {influencerProfile.performanceMetrics.totalCampaigns} campaigns
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart data={platformData} cx="50%" cy="50%" outerRadius={80}>
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Campaigns</h3>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              Quick Apply
            </Button>
          </div>

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold">{campaign.campaignName}</h4>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        {campaign.isApplied && (
                          <Badge variant="outline">
                            {campaign.applicationStatus || 'Applied'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Budget</div>
                          <div className="font-semibold">{formatCurrency(campaign.budget)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Type</div>
                          <div className="font-semibold capitalize">{campaign.campaignType.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-semibold">
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Applications</div>
                          <div className="font-semibold">{campaign.applicationsCount}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {!campaign.isApplied && campaign.status === 'active' && (
                        <Button size="sm">
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Analytics</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setTimeframe('7d')}>
                7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeframe('30d')}>
                30 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeframe('90d')}>
                90 Days
              </Button>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="grid gap-6">
            {Object.entries(influencerProfile.externalPlatforms).map(([platform, data]) => (
              <Card key={platform}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 capitalize">
                    <Globe className="w-5 h-5" />
                    <span>{platform}</span>
                    {data.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Followers/Subscribers</div>
                      <div className="text-2xl font-bold">
                        {formatNumber(data.followers || data.subscribers || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Engagement Rate</div>
                      <div className="text-2xl font-bold">
                        {data.engagement_rate}%
                      </div>
                    </div>
                    {data.views && (
                      <div>
                        <div className="text-sm text-gray-500">Total Views</div>
                        <div className="text-2xl font-bold">
                          {formatNumber(data.views)}
                        </div>
                      </div>
                    )}
                    {data.likes && (
                      <div>
                        <div className="text-sm text-gray-500">Total Likes</div>
                        <div className="text-2xl font-bold">
                          {formatNumber(data.likes)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Earnings Overview</h3>
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="earnings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earning Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Earned</span>
                    <span className="font-bold">
                      {formatCurrency(influencerProfile.performanceMetrics.totalEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(earningsData[earningsData.length - 1]?.earnings || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending</span>
                    <span className="font-bold text-yellow-600">
                      {formatCurrency(2400)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Available</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(3700)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Categories & Niches</h4>
                  <div className="flex flex-wrap gap-2">
                    {influencerProfile.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Collaboration Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Rate per Post</label>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(influencerProfile.collaborationRate)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Response Rate</label>
                      <div className="text-lg font-bold">
                        {influencerProfile.responseRate}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button>Update Profile</Button>
                  <Button variant="outline">Verification Documents</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerDashboard;