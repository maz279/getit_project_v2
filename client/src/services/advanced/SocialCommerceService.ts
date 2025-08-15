/**
 * Phase 3.5: Social Commerce Service
 * Social login, sharing, proof, and influencer features
 * Target: Social-driven shopping and viral marketing
 */

// TypeScript interfaces for Social Commerce
interface SocialCommerceConfig {
  enabled: boolean;
  socialLoginEnabled: boolean;
  socialSharingEnabled: boolean;
  socialProofEnabled: boolean;
  influencerEnabled: boolean;
  socialCheckoutEnabled: boolean;
  userGeneratedContentEnabled: boolean;
  socialAnalyticsEnabled: boolean;
  communityEnabled: boolean;
}

interface SocialLoginProvider {
  name: string;
  enabled: boolean;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  config: Record<string, any>;
}

interface SocialSharingConfig {
  enabled: boolean;
  platforms: string[];
  shareButtons: boolean;
  deepLinking: boolean;
  trackingEnabled: boolean;
  customMessages: boolean;
}

interface SocialProofConfig {
  enabled: boolean;
  recentPurchases: boolean;
  userCounts: boolean;
  reviews: boolean;
  testimonials: boolean;
  influencerEndorsements: boolean;
  socialStats: boolean;
}

interface InfluencerConfig {
  enabled: boolean;
  programEnabled: boolean;
  commissionsEnabled: boolean;
  trackingEnabled: boolean;
  contentCreationEnabled: boolean;
  campaignManagement: boolean;
  analyticsEnabled: boolean;
}

interface SocialUser {
  id: string;
  provider: string;
  socialId: string;
  username: string;
  email: string;
  avatar: string;
  profile: {
    name: string;
    bio: string;
    location: string;
    website: string;
    followers: number;
    following: number;
    verified: boolean;
  };
  permissions: string[];
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

interface SocialShare {
  id: string;
  userId: string;
  platform: string;
  productId?: string;
  contentType: 'product' | 'review' | 'purchase' | 'recommendation';
  content: string;
  imageUrl?: string;
  url: string;
  timestamp: string;
  metrics: {
    shares: number;
    likes: number;
    comments: number;
    clicks: number;
  };
}

interface SocialProof {
  id: string;
  type: 'recent_purchase' | 'user_count' | 'review' | 'testimonial' | 'influencer_endorsement';
  productId?: string;
  message: string;
  imageUrl?: string;
  timestamp: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  user?: {
    name: string;
    avatar: string;
    location: string;
    verified: boolean;
  };
}

interface Influencer {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'active' | 'suspended';
  tier: 'micro' | 'macro' | 'mega';
  profile: {
    name: string;
    bio: string;
    avatar: string;
    socialLinks: Record<string, string>;
    followers: Record<string, number>;
    engagement: Record<string, number>;
    niche: string[];
  };
  metrics: {
    totalEarnings: number;
    totalSales: number;
    conversionRate: number;
    avgOrderValue: number;
    commissionRate: number;
  };
  campaigns: string[];
  createdAt: string;
}

interface SocialCampaign {
  id: string;
  title: string;
  description: string;
  type: 'product_launch' | 'seasonal' | 'brand_awareness' | 'user_generated';
  startDate: string;
  endDate: string;
  budget: number;
  targetAudience: {
    demographics: Record<string, any>;
    interests: string[];
    behaviors: string[];
  };
  influencers: string[];
  content: {
    hashtags: string[];
    mentions: string[];
    templates: string[];
  };
  metrics: {
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
}

interface UserGeneratedContent {
  id: string;
  userId: string;
  contentType: 'review' | 'photo' | 'video' | 'story' | 'unboxing';
  productId: string;
  content: string;
  mediaUrl?: string;
  approved: boolean;
  featured: boolean;
  timestamp: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    helpful: number;
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  };
}

// Social Commerce Service
export class SocialCommerceService {
  private config: SocialCommerceConfig;
  private sharingConfig: SocialSharingConfig;
  private proofConfig: SocialProofConfig;
  private influencerConfig: InfluencerConfig;
  private loginProviders: Map<string, SocialLoginProvider> = new Map();
  private socialUsers: Map<string, SocialUser> = new Map();
  private socialShares: Map<string, SocialShare> = new Map();
  private socialProofs: Map<string, SocialProof> = new Map();
  private influencers: Map<string, Influencer> = new Map();
  private campaigns: Map<string, SocialCampaign> = new Map();
  private userGeneratedContent: Map<string, UserGeneratedContent> = new Map();

  constructor() {
    this.config = {
      enabled: true,
      socialLoginEnabled: true,
      socialSharingEnabled: true,
      socialProofEnabled: true,
      influencerEnabled: true,
      socialCheckoutEnabled: true,
      userGeneratedContentEnabled: true,
      socialAnalyticsEnabled: true,
      communityEnabled: true
    };

    this.sharingConfig = {
      enabled: true,
      platforms: ['facebook', 'twitter', 'instagram', 'whatsapp', 'telegram', 'linkedin'],
      shareButtons: true,
      deepLinking: true,
      trackingEnabled: true,
      customMessages: true
    };

    this.proofConfig = {
      enabled: true,
      recentPurchases: true,
      userCounts: true,
      reviews: true,
      testimonials: true,
      influencerEndorsements: true,
      socialStats: true
    };

    this.influencerConfig = {
      enabled: true,
      programEnabled: true,
      commissionsEnabled: true,
      trackingEnabled: true,
      contentCreationEnabled: true,
      campaignManagement: true,
      analyticsEnabled: true
    };

    this.initializeSocialProviders();
    this.initializeSampleData();
  }

  private initializeSocialProviders(): void {
    // Facebook Login
    this.loginProviders.set('facebook', {
      name: 'Facebook',
      enabled: true,
      clientId: 'facebook-client-id',
      scopes: ['email', 'public_profile', 'user_friends'],
      redirectUri: 'https://getit.com/auth/facebook/callback',
      config: {
        version: 'v18.0',
        fields: 'id,name,email,picture'
      }
    });

    // Google Login
    this.loginProviders.set('google', {
      name: 'Google',
      enabled: true,
      clientId: 'google-client-id',
      scopes: ['email', 'profile', 'openid'],
      redirectUri: 'https://getit.com/auth/google/callback',
      config: {
        hosted_domain: null,
        prompt: 'select_account'
      }
    });

    // Apple Login
    this.loginProviders.set('apple', {
      name: 'Apple',
      enabled: true,
      clientId: 'apple-client-id',
      scopes: ['email', 'name'],
      redirectUri: 'https://getit.com/auth/apple/callback',
      config: {
        team_id: 'apple-team-id',
        key_id: 'apple-key-id'
      }
    });

    // Twitter Login
    this.loginProviders.set('twitter', {
      name: 'Twitter',
      enabled: true,
      clientId: 'twitter-client-id',
      scopes: ['tweet.read', 'users.read', 'offline.access'],
      redirectUri: 'https://getit.com/auth/twitter/callback',
      config: {
        api_version: '2.0'
      }
    });

    // Instagram Login
    this.loginProviders.set('instagram', {
      name: 'Instagram',
      enabled: true,
      clientId: 'instagram-client-id',
      scopes: ['user_profile', 'user_media'],
      redirectUri: 'https://getit.com/auth/instagram/callback',
      config: {
        api_version: 'v18.0'
      }
    });
  }

  private initializeSampleData(): void {
    // Sample social proofs
    this.socialProofs.set('proof-1', {
      id: 'proof-1',
      type: 'recent_purchase',
      productId: 'product-123',
      message: 'Sarah from Dhaka just bought this item 5 minutes ago',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      metrics: {
        impressions: 1250,
        clicks: 87,
        conversions: 12
      },
      user: {
        name: 'Sarah K.',
        avatar: '/avatars/sarah.jpg',
        location: 'Dhaka, Bangladesh',
        verified: false
      }
    });

    this.socialProofs.set('proof-2', {
      id: 'proof-2',
      type: 'user_count',
      message: '2,847 people are viewing this item right now',
      timestamp: new Date().toISOString(),
      metrics: {
        impressions: 5420,
        clicks: 234,
        conversions: 45
      }
    });

    this.socialProofs.set('proof-3', {
      id: 'proof-3',
      type: 'influencer_endorsement',
      productId: 'product-456',
      message: 'Recommended by @TechReviewerBD - "Best value for money!"',
      imageUrl: '/influencers/techreviewer.jpg',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      metrics: {
        impressions: 8750,
        clicks: 456,
        conversions: 89
      },
      user: {
        name: 'TechReviewer BD',
        avatar: '/influencers/techreviewer.jpg',
        location: 'Bangladesh',
        verified: true
      }
    });

    // Sample influencer
    this.influencers.set('influencer-1', {
      id: 'influencer-1',
      userId: 'user-789',
      status: 'active',
      tier: 'macro',
      profile: {
        name: 'TechReviewer BD',
        bio: 'Tech enthusiast and product reviewer from Bangladesh',
        avatar: '/influencers/techreviewer.jpg',
        socialLinks: {
          youtube: 'https://youtube.com/@techreviewerbd',
          instagram: 'https://instagram.com/techreviewerbd',
          facebook: 'https://facebook.com/techreviewerbd'
        },
        followers: {
          youtube: 125000,
          instagram: 85000,
          facebook: 200000
        },
        engagement: {
          youtube: 8.5,
          instagram: 6.2,
          facebook: 4.8
        },
        niche: ['technology', 'electronics', 'gadgets', 'reviews']
      },
      metrics: {
        totalEarnings: 45000,
        totalSales: 890,
        conversionRate: 3.2,
        avgOrderValue: 2800,
        commissionRate: 8.5
      },
      campaigns: ['campaign-1', 'campaign-2'],
      createdAt: '2024-01-15T00:00:00Z'
    });

    // Sample campaign
    this.campaigns.set('campaign-1', {
      id: 'campaign-1',
      title: 'Spring Electronics Sale 2025',
      description: 'Promote our latest electronics collection for the spring season',
      type: 'seasonal',
      startDate: '2025-03-01T00:00:00Z',
      endDate: '2025-03-31T23:59:59Z',
      budget: 150000,
      targetAudience: {
        demographics: {
          age: '18-35',
          location: 'Bangladesh',
          interests: ['technology', 'electronics']
        },
        interests: ['smartphones', 'laptops', 'accessories'],
        behaviors: ['online_shoppers', 'tech_enthusiasts']
      },
      influencers: ['influencer-1'],
      content: {
        hashtags: ['#SpringSale2025', '#TechDeals', '#GetItBD'],
        mentions: ['@GetItBD'],
        templates: ['Check out these amazing deals!', 'Spring cleaning your tech setup?']
      },
      metrics: {
        reach: 450000,
        engagement: 28500,
        clicks: 12500,
        conversions: 890,
        revenue: 2450000
      },
      status: 'active'
    });

    // Sample UGC
    this.userGeneratedContent.set('ugc-1', {
      id: 'ugc-1',
      userId: 'user-456',
      contentType: 'review',
      productId: 'product-123',
      content: 'Amazing product! Great quality and fast delivery. Highly recommend!',
      approved: true,
      featured: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      metrics: {
        likes: 45,
        comments: 12,
        shares: 8,
        helpful: 38
      },
      moderation: {
        status: 'approved',
        reviewedBy: 'moderator-1',
        reviewedAt: new Date(Date.now() - 82800000).toISOString()
      }
    });
  }

  // Social Login Methods
  async initiateSocialLogin(provider: string, redirectUrl?: string): Promise<string> {
    const socialProvider = this.loginProviders.get(provider);
    if (!socialProvider || !socialProvider.enabled) {
      throw new Error(`Social login provider ${provider} is not available`);
    }

    // Generate state parameter for security
    const state = btoa(JSON.stringify({
      provider,
      redirectUrl: redirectUrl || '/',
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substr(2, 9)
    }));

    // Build OAuth URL
    const authUrl = this.buildOAuthUrl(socialProvider, state);
    
    // In a real implementation, this would redirect to the OAuth provider
    console.log(`Initiating ${provider} login:`, authUrl);
    
    return authUrl;
  }

  private buildOAuthUrl(provider: SocialLoginProvider, state: string): string {
    const baseUrls = {
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      apple: 'https://appleid.apple.com/auth/authorize',
      twitter: 'https://twitter.com/i/oauth2/authorize',
      instagram: 'https://api.instagram.com/oauth/authorize'
    };

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      scope: provider.scopes.join(' '),
      state: state,
      response_type: 'code'
    });

    return `${baseUrls[provider.name.toLowerCase() as keyof typeof baseUrls]}?${params.toString()}`;
  }

  async handleSocialCallback(provider: string, code: string, state: string): Promise<SocialUser> {
    // Validate state parameter
    const stateData = JSON.parse(atob(state));
    if (stateData.provider !== provider) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for tokens (simulated)
    const tokens = await this.exchangeCodeForTokens(provider, code);
    
    // Get user profile
    const profile = await this.getUserProfile(provider, tokens.accessToken);
    
    // Create social user
    const socialUser: SocialUser = {
      id: `social-${provider}-${profile.id}`,
      provider,
      socialId: profile.id,
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar,
      profile: profile.profile,
      permissions: profile.permissions,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt
    };

    this.socialUsers.set(socialUser.id, socialUser);
    return socialUser;
  }

  private async exchangeCodeForTokens(provider: string, code: string): Promise<any> {
    // Simulate token exchange
    return {
      accessToken: `access_token_${provider}_${Date.now()}`,
      refreshToken: `refresh_token_${provider}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };
  }

  private async getUserProfile(provider: string, accessToken: string): Promise<any> {
    // Simulate profile fetching
    return {
      id: `${provider}_${Math.random().toString(36).substr(2, 9)}`,
      username: `user_${Math.floor(Math.random() * 10000)}`,
      email: `user@${provider}.com`,
      avatar: `/avatars/${provider}_default.jpg`,
      profile: {
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        bio: `I'm a ${provider} user`,
        location: 'Bangladesh',
        website: `https://${provider}.com`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
        verified: Math.random() > 0.8
      },
      permissions: ['read_profile', 'read_email']
    };
  }

  // Social Sharing Methods
  generateShareUrl(platform: string, content: any): string {
    const baseUrls = {
      facebook: 'https://www.facebook.com/sharer/sharer.php',
      twitter: 'https://twitter.com/intent/tweet',
      instagram: 'https://www.instagram.com',
      whatsapp: 'https://wa.me',
      telegram: 'https://t.me/share/url',
      linkedin: 'https://www.linkedin.com/sharing/share-offsite'
    };

    const params = this.buildShareParams(platform, content);
    const baseUrl = baseUrls[platform as keyof typeof baseUrls];
    
    return `${baseUrl}?${params.toString()}`;
  }

  private buildShareParams(platform: string, content: any): URLSearchParams {
    const params = new URLSearchParams();
    
    switch (platform) {
      case 'facebook':
        params.set('u', content.url);
        params.set('quote', content.text || '');
        break;
      case 'twitter':
        params.set('url', content.url);
        params.set('text', content.text || '');
        if (content.hashtags) {
          params.set('hashtags', content.hashtags.join(','));
        }
        break;
      case 'whatsapp':
        params.set('text', `${content.text || ''} ${content.url}`);
        break;
      case 'telegram':
        params.set('url', content.url);
        params.set('text', content.text || '');
        break;
      case 'linkedin':
        params.set('url', content.url);
        params.set('title', content.title || '');
        params.set('summary', content.text || '');
        break;
    }
    
    return params;
  }

  async shareContent(platform: string, content: any, userId?: string): Promise<SocialShare> {
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const share: SocialShare = {
      id: shareId,
      userId: userId || 'anonymous',
      platform,
      productId: content.productId,
      contentType: content.type || 'product',
      content: content.text || '',
      imageUrl: content.image,
      url: content.url,
      timestamp: new Date().toISOString(),
      metrics: {
        shares: 0,
        likes: 0,
        comments: 0,
        clicks: 0
      }
    };

    this.socialShares.set(shareId, share);
    
    // Track share event
    this.trackSocialEvent('share', {
      platform,
      contentType: content.type,
      userId
    });

    return share;
  }

  // Social Proof Methods
  addSocialProof(proof: Omit<SocialProof, 'id' | 'timestamp' | 'metrics'>): SocialProof {
    const proofId = `proof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const socialProof: SocialProof = {
      id: proofId,
      timestamp: new Date().toISOString(),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0
      },
      ...proof
    };

    this.socialProofs.set(proofId, socialProof);
    return socialProof;
  }

  getSocialProofsByType(type: SocialProof['type']): SocialProof[] {
    return Array.from(this.socialProofs.values()).filter(proof => proof.type === type);
  }

  getSocialProofsByProduct(productId: string): SocialProof[] {
    return Array.from(this.socialProofs.values()).filter(proof => proof.productId === productId);
  }

  // Influencer Methods
  registerInfluencer(influencerData: Omit<Influencer, 'id' | 'createdAt'>): Influencer {
    const influencerId = `influencer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const influencer: Influencer = {
      id: influencerId,
      createdAt: new Date().toISOString(),
      ...influencerData
    };

    this.influencers.set(influencerId, influencer);
    return influencer;
  }

  getInfluencersByTier(tier: Influencer['tier']): Influencer[] {
    return Array.from(this.influencers.values()).filter(inf => inf.tier === tier);
  }

  getInfluencersByStatus(status: Influencer['status']): Influencer[] {
    return Array.from(this.influencers.values()).filter(inf => inf.status === status);
  }

  // Campaign Methods
  createCampaign(campaignData: Omit<SocialCampaign, 'id'>): SocialCampaign {
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const campaign: SocialCampaign = {
      id: campaignId,
      ...campaignData
    };

    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  getCampaignsByStatus(status: SocialCampaign['status']): SocialCampaign[] {
    return Array.from(this.campaigns.values()).filter(camp => camp.status === status);
  }

  // UGC Methods
  submitUserGeneratedContent(contentData: Omit<UserGeneratedContent, 'id' | 'timestamp' | 'metrics' | 'moderation'>): UserGeneratedContent {
    const contentId = `ugc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const content: UserGeneratedContent = {
      id: contentId,
      timestamp: new Date().toISOString(),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        helpful: 0
      },
      moderation: {
        status: 'pending'
      },
      ...contentData
    };

    this.userGeneratedContent.set(contentId, content);
    return content;
  }

  getUGCByProduct(productId: string): UserGeneratedContent[] {
    return Array.from(this.userGeneratedContent.values()).filter(ugc => ugc.productId === productId);
  }

  getFeaturedUGC(): UserGeneratedContent[] {
    return Array.from(this.userGeneratedContent.values()).filter(ugc => ugc.featured && ugc.approved);
  }

  // Analytics Methods
  getSocialAnalytics(): {
    totalShares: number;
    totalProofImpressions: number;
    topPlatforms: Array<{ platform: string; shares: number }>;
    influencerMetrics: {
      totalInfluencers: number;
      totalEarnings: number;
      avgConversionRate: number;
    };
    ugcMetrics: {
      totalSubmissions: number;
      approvalRate: number;
      engagementRate: number;
    };
  } {
    const shares = Array.from(this.socialShares.values());
    const proofs = Array.from(this.socialProofs.values());
    const influencers = Array.from(this.influencers.values());
    const ugcContent = Array.from(this.userGeneratedContent.values());

    const platformShares = shares.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPlatforms = Object.entries(platformShares)
      .map(([platform, shares]) => ({ platform, shares }))
      .sort((a, b) => b.shares - a.shares)
      .slice(0, 5);

    const totalInfluencerEarnings = influencers.reduce((sum, inf) => sum + inf.metrics.totalEarnings, 0);
    const avgConversionRate = influencers.length > 0 
      ? influencers.reduce((sum, inf) => sum + inf.metrics.conversionRate, 0) / influencers.length
      : 0;

    const approvedUGC = ugcContent.filter(ugc => ugc.approved);
    const totalEngagement = ugcContent.reduce((sum, ugc) => 
      sum + ugc.metrics.likes + ugc.metrics.comments + ugc.metrics.shares, 0);

    return {
      totalShares: shares.length,
      totalProofImpressions: proofs.reduce((sum, proof) => sum + proof.metrics.impressions, 0),
      topPlatforms,
      influencerMetrics: {
        totalInfluencers: influencers.length,
        totalEarnings: totalInfluencerEarnings,
        avgConversionRate
      },
      ugcMetrics: {
        totalSubmissions: ugcContent.length,
        approvalRate: ugcContent.length > 0 ? (approvedUGC.length / ugcContent.length) * 100 : 0,
        engagementRate: ugcContent.length > 0 ? totalEngagement / ugcContent.length : 0
      }
    };
  }

  private trackSocialEvent(eventType: string, data: any): void {
    if (!this.config.socialAnalyticsEnabled) return;

    console.log(`Social event tracked: ${eventType}`, data);
    
    // In a real implementation, this would send to analytics service
  }

  // Configuration methods
  updateConfig(config: Partial<SocialCommerceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SocialCommerceConfig {
    return { ...this.config };
  }

  // Getters
  getAllSocialUsers(): SocialUser[] {
    return Array.from(this.socialUsers.values());
  }

  getAllSocialShares(): SocialShare[] {
    return Array.from(this.socialShares.values());
  }

  getAllSocialProofs(): SocialProof[] {
    return Array.from(this.socialProofs.values());
  }

  getAllInfluencers(): Influencer[] {
    return Array.from(this.influencers.values());
  }

  getAllCampaigns(): SocialCampaign[] {
    return Array.from(this.campaigns.values());
  }

  getAllUGC(): UserGeneratedContent[] {
    return Array.from(this.userGeneratedContent.values());
  }

  getLoginProviders(): SocialLoginProvider[] {
    return Array.from(this.loginProviders.values()).filter(provider => provider.enabled);
  }

  // Health check
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    const analytics = this.getSocialAnalytics();
    const enabledProviders = this.getLoginProviders().length;
    
    return {
      status: this.config.enabled && enabledProviders > 0 ? 'healthy' : 'degraded',
      details: {
        configEnabled: this.config.enabled,
        enabledProviders,
        totalUsers: this.socialUsers.size,
        totalShares: analytics.totalShares,
        totalInfluencers: analytics.influencerMetrics.totalInfluencers,
        totalUGC: analytics.ugcMetrics.totalSubmissions,
        featuresEnabled: {
          socialLogin: this.config.socialLoginEnabled,
          socialSharing: this.config.socialSharingEnabled,
          socialProof: this.config.socialProofEnabled,
          influencer: this.config.influencerEnabled,
          socialCheckout: this.config.socialCheckoutEnabled,
          ugc: this.config.userGeneratedContentEnabled
        }
      }
    };
  }
}

// Export singleton instance
export const socialCommerceService = new SocialCommerceService();