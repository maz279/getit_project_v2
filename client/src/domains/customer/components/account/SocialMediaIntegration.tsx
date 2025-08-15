import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  ExternalLink, 
  Share2, 
  Users, 
  Heart, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube';
  username: string;
  displayName: string;
  followers: number;
  isConnected: boolean;
  lastSync: Date;
  autoShare: boolean;
  permissions: string[];
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  status: 'posted' | 'scheduled' | 'failed';
}

export const SocialMediaIntegration: React.FC = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'facebook',
      username: 'john.doe.bd',
      displayName: 'John Doe Bangladesh',
      followers: 1250,
      isConnected: true,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      autoShare: true,
      permissions: ['read_profile', 'publish_posts', 'read_insights']
    },
    {
      id: '2',
      platform: 'instagram',
      username: 'johndoe_bd',
      displayName: 'John Doe',
      followers: 850,
      isConnected: true,
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      autoShare: false,
      permissions: ['read_profile', 'publish_posts']
    }
  ]);

  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([
    {
      id: '1',
      platform: 'facebook',
      content: 'Just received my order from @GetItBangladesh! Amazing quality phone case 📱✨',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 24,
      shares: 3,
      comments: 8,
      status: 'posted'
    },
    {
      id: '2',
      platform: 'instagram',
      content: 'New wireless earbuds from GetIt! Sound quality is incredible 🎧 #GetItBD',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      likes: 67,
      shares: 12,
      comments: 15,
      status: 'posted'
    }
  ]);

  const availablePlatforms = [
    {
      platform: 'facebook' as const,
      icon: Facebook,
      name: 'Facebook',
      color: 'text-blue-600',
      description: 'Connect to share purchases and reviews'
    },
    {
      platform: 'instagram' as const,
      icon: Instagram,
      name: 'Instagram',
      color: 'text-pink-600',
      description: 'Share product photos and stories'
    },
    {
      platform: 'twitter' as const,
      icon: Twitter,
      name: 'Twitter',
      color: 'text-blue-500',
      description: 'Tweet about your favorite products'
    },
    {
      platform: 'linkedin' as const,
      icon: Linkedin,
      name: 'LinkedIn',
      color: 'text-blue-700',
      description: 'Professional product recommendations'
    },
    {
      platform: 'youtube' as const,
      icon: Youtube,
      name: 'YouTube',
      color: 'text-red-600',
      description: 'Create product review videos'
    }
  ];

  const handleConnect = (platform: string) => {
    // Simulate OAuth connection flow
    console.log(`Connecting to ${platform}...`);
    // In real implementation, this would redirect to OAuth provider
  };

  const handleDisconnect = (accountId: string) => {
    setConnectedAccounts(prev => 
      prev.filter(account => account.id !== accountId)
    );
  };

  const toggleAutoShare = (accountId: string) => {
    setConnectedAccounts(prev =>
      prev.map(account =>
        account.id === accountId
          ? { ...account, autoShare: !account.autoShare }
          : account
      )
    );
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = availablePlatforms.find(p => p.platform === platform);
    if (!platformData) return Share2;
    return platformData.icon;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = availablePlatforms.find(p => p.platform === platform);
    return platformData?.color || 'text-gray-600';
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Integration</h1>
          <p className="text-gray-600 mt-1">Connect your social accounts to share purchases and earn rewards</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {connectedAccounts.length} Connected
        </Badge>
      </div>

      {/* Benefits Banner */}
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Benefits:</strong> Earn 50 bonus points for each shared purchase, get early access to deals, 
          and help friends discover great products with your personal referral link.
        </AlertDescription>
      </Alert>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Connected Accounts</span>
          </CardTitle>
          <CardDescription>Manage your connected social media accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length > 0 ? (
            <div className="space-y-4">
              {connectedAccounts.map(account => {
                const IconComponent = getPlatformIcon(account.platform);
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <IconComponent className={`h-8 w-8 ${getPlatformColor(account.platform)}`} />
                      <div>
                        <h4 className="font-semibold text-gray-900">{account.displayName}</h4>
                        <p className="text-sm text-gray-600">@{account.username}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{formatFollowers(account.followers)} followers</span>
                          <span>•</span>
                          <span>Last sync: {account.lastSync.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Auto-share</span>
                        <Switch
                          checked={account.autoShare}
                          onCheckedChange={() => toggleAutoShare(account.id)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No social accounts connected yet</p>
          )}
        </CardContent>
      </Card>

      {/* Available Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Connect New Account</span>
          </CardTitle>
          <CardDescription>Connect additional social media platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlatforms.map(platform => {
              const isConnected = connectedAccounts.some(acc => acc.platform === platform.platform);
              const IconComponent = platform.icon;
              
              return (
                <div key={platform.platform} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <IconComponent className={`h-6 w-6 ${platform.color}`} />
                    <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                    {isConnected && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Connected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{platform.description}</p>
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleConnect(platform.platform)}
                    disabled={isConnected}
                    className="w-full"
                  >
                    {isConnected ? 'Connected' : `Connect ${platform.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Social Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Recent Social Activity</span>
          </CardTitle>
          <CardDescription>Your recent posts and engagement from GetIt purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map(post => {
                const IconComponent = getPlatformIcon(post.platform);
                return (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-5 w-5 ${getPlatformColor(post.platform)} mt-1`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium capitalize">{post.platform}</span>
                          <Badge className={`
                            text-xs
                            ${post.status === 'posted' ? 'bg-green-100 text-green-800' : 
                              post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}
                          `}>
                            {post.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {post.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-3">{post.content}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="h-4 w-4" />
                            <span>{post.shares}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No social activity yet</p>
              <p className="text-sm text-gray-500">Share your first purchase to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sharing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sharing Preferences</span>
          </CardTitle>
          <CardDescription>Control what gets shared automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Purchase Reviews</h4>
              <p className="text-sm text-gray-600">Automatically share your product reviews</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Wishlist Items</h4>
              <p className="text-sm text-gray-600">Let friends see items you're interested in</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Order Deliveries</h4>
              <p className="text-sm text-gray-600">Celebrate successful deliveries</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Deal Discoveries</h4>
              <p className="text-sm text-gray-600">Help friends find great deals</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaIntegration;