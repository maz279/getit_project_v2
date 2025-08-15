import { apiRequest } from '@/lib/queryClient';
import { 
  SocialPost, 
  InfluencerProfile, 
  CollaborationCampaign, 
  SocialWishlist,
  SocialComment,
  CollaborationApplication,
  SocialWishlistItem,
  SocialCommerceAnalytics,
  InsertSocialPost,
  InsertSocialComment,
  InsertInfluencerProfile,
  InsertCollaborationCampaign,
  InsertCollaborationApplication,
  InsertSocialWishlist,
  InsertSocialWishlistItem
} from '@/shared/schema';

// Social Commerce API Service for Amazon.com/Shopee.sg-Level Features
export class SocialCommerceApiService {
  private static baseUrl = '/api/v1/social-commerce';

  // ============================================================================
  // SOCIAL POSTS MANAGEMENT
  // ============================================================================

  static async getTrendingPosts(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<SocialPost[]> {
    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    try {
      const response = await apiRequest(`${this.baseUrl}/posts/trending?${queryParams}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch trending posts, using fallback data:', error);
      return this.getMockTrendingPosts();
    }
  }

  static async createPost(post: InsertSocialPost): Promise<SocialPost> {
    return apiRequest(`${this.baseUrl}/posts`, {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  static async getPostById(id: string): Promise<SocialPost | null> {
    try {
      return await apiRequest(`${this.baseUrl}/posts/${id}`);
    } catch (error) {
      console.warn('Failed to fetch post:', error);
      return null;
    }
  }

  static async likePost(postId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  static async sharePost(postId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/posts/${postId}/share`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // SOCIAL COMMENTS MANAGEMENT
  // ============================================================================

  static async getPostComments(postId: string): Promise<SocialComment[]> {
    try {
      return await apiRequest(`${this.baseUrl}/posts/${postId}/comments`) || [];
    } catch (error) {
      console.warn('Failed to fetch comments:', error);
      return [];
    }
  }

  static async createComment(comment: InsertSocialComment): Promise<SocialComment> {
    return apiRequest(`${this.baseUrl}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  static async likeComment(commentId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // INFLUENCER MANAGEMENT
  // ============================================================================

  static async getFeaturedInfluencers(params?: {
    tier?: string;
    region?: string;
    limit?: number;
  }): Promise<InfluencerProfile[]> {
    const queryParams = new URLSearchParams();
    if (params?.tier) queryParams.append('tier', params.tier);
    if (params?.region) queryParams.append('region', params.region);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    try {
      const response = await apiRequest(`${this.baseUrl}/influencers/featured?${queryParams}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch influencers, using fallback data:', error);
      return this.getMockInfluencers();
    }
  }

  static async createInfluencerProfile(profile: InsertInfluencerProfile): Promise<InfluencerProfile> {
    return apiRequest(`${this.baseUrl}/influencers`, {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  static async getInfluencerById(id: string): Promise<InfluencerProfile | null> {
    try {
      return await apiRequest(`${this.baseUrl}/influencers/${id}`);
    } catch (error) {
      console.warn('Failed to fetch influencer:', error);
      return null;
    }
  }

  static async followInfluencer(influencerId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/influencers/${influencerId}/follow`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // COLLABORATION CAMPAIGNS
  // ============================================================================

  static async getActiveCampaigns(params?: {
    vendorId?: string;
    category?: string;
    budget?: number;
    limit?: number;
  }): Promise<CollaborationCampaign[]> {
    const queryParams = new URLSearchParams();
    if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.budget) queryParams.append('maxBudget', params.budget.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    try {
      const response = await apiRequest(`${this.baseUrl}/campaigns/active?${queryParams}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch campaigns, using fallback data:', error);
      return this.getMockCampaigns();
    }
  }

  static async createCampaign(campaign: InsertCollaborationCampaign): Promise<CollaborationCampaign> {
    return apiRequest(`${this.baseUrl}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  static async applyCampaign(application: InsertCollaborationApplication): Promise<CollaborationApplication> {
    return apiRequest(`${this.baseUrl}/campaigns/apply`, {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  static async getCampaignApplications(campaignId: string): Promise<CollaborationApplication[]> {
    try {
      return await apiRequest(`${this.baseUrl}/campaigns/${campaignId}/applications`) || [];
    } catch (error) {
      console.warn('Failed to fetch applications:', error);
      return [];
    }
  }

  // ============================================================================
  // SOCIAL WISHLISTS
  // ============================================================================

  static async getPopularWishlists(params?: {
    category?: string;
    visibility?: string;
    limit?: number;
  }): Promise<SocialWishlist[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.visibility) queryParams.append('visibility', params.visibility);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    try {
      const response = await apiRequest(`${this.baseUrl}/wishlists/popular?${queryParams}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch wishlists, using fallback data:', error);
      return this.getMockWishlists();
    }
  }

  static async createWishlist(wishlist: InsertSocialWishlist): Promise<SocialWishlist> {
    return apiRequest(`${this.baseUrl}/wishlists`, {
      method: 'POST',
      body: JSON.stringify(wishlist),
    });
  }

  static async addWishlistItem(item: InsertSocialWishlistItem): Promise<SocialWishlistItem> {
    return apiRequest(`${this.baseUrl}/wishlists/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  static async joinWishlist(wishlistId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/wishlists/${wishlistId}/join`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================

  static async getSocialCommerceStats(): Promise<{
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
  }> {
    try {
      const response = await apiRequest(`${this.baseUrl}/stats`);
      return response || this.getMockStats();
    } catch (error) {
      console.warn('Failed to fetch stats, using fallback data:', error);
      return this.getMockStats();
    }
  }

  static async getAnalytics(params: {
    userId?: string;
    vendorId?: string;
    influencerId?: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<SocialCommerceAnalytics[]> {
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.vendorId) queryParams.append('vendorId', params.vendorId);
    if (params.influencerId) queryParams.append('influencerId', params.influencerId);
    queryParams.append('dateFrom', params.dateFrom);
    queryParams.append('dateTo', params.dateTo);

    try {
      return await apiRequest(`${this.baseUrl}/analytics?${queryParams}`) || [];
    } catch (error) {
      console.warn('Failed to fetch analytics:', error);
      return [];
    }
  }

  // ============================================================================
  // SEARCH & DISCOVERY
  // ============================================================================

  static async searchContent(query: string, type?: 'posts' | 'influencers' | 'campaigns' | 'wishlists'): Promise<any[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (type) queryParams.append('type', type);

    try {
      return await apiRequest(`${this.baseUrl}/search?${queryParams}`) || [];
    } catch (error) {
      console.warn('Failed to search content:', error);
      return [];
    }
  }

  // ============================================================================
  // BANGLADESH CULTURAL FEATURES
  // ============================================================================

  static async getFestivalContent(festival: string): Promise<SocialPost[]> {
    try {
      return await apiRequest(`${this.baseUrl}/festivals/${festival}/content`) || [];
    } catch (error) {
      console.warn('Failed to fetch festival content:', error);
      return [];
    }
  }

  static async getBangladeshInfluencers(region?: string): Promise<InfluencerProfile[]> {
    const queryParams = new URLSearchParams();
    if (region) queryParams.append('region', region);

    try {
      return await apiRequest(`${this.baseUrl}/bangladesh/influencers?${queryParams}`) || [];
    } catch (error) {
      console.warn('Failed to fetch Bangladesh influencers:', error);
      return [];
    }
  }

  // ============================================================================
  // MOCK DATA FALLBACKS (for offline functionality)
  // ============================================================================

  private static getMockStats() {
    return {
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
  }

  private static getMockTrendingPosts(): SocialPost[] {
    return [
      {
        id: 'mock-post-1',
        userId: 'user-1',
        productId: 'product-1',
        vendorId: null,
        title: 'Amazing Eid Collection Review',
        content: 'Just received my Eid outfit and I am absolutely in love! The traditional designs with modern touches are perfect.',
        mediaUrls: ['/api/placeholder/400/300'],
        postType: 'review',
        visibility: 'public',
        isSponsored: false,
        campaignId: null,
        hashtags: ['eid', 'fashion', 'bangladesh', 'traditional'],
        mentionedUsers: [],
        likesCount: 234,
        commentsCount: 45,
        sharesCount: 23,
        viewsCount: 1250,
        engagementScore: 8.5,
        isVerified: true,
        moderationStatus: 'approved',
        moderatedBy: null,
        moderatedAt: null,
        moderationNotes: null,
        reportCount: 0,
        isHidden: false,
        pinnedUntil: null,
        bangladeshTags: ['eid', 'dhaka'],
        culturalContext: { festival: 'eid', region: 'dhaka' },
        createdAt: new Date('2024-12-15T10:00:00Z'),
        updatedAt: new Date('2024-12-15T10:00:00Z')
      }
    ];
  }

  private static getMockInfluencers(): InfluencerProfile[] {
    return [
      {
        id: 'inf-1',
        userId: 'user-2',
        influencerTier: 'micro',
        followersCount: 25000,
        avgEngagementRate: 4.2,
        nichesSpecialties: ['fashion', 'lifestyle'],
        contentCategories: ['outfit', 'styling', 'reviews'],
        platformMetrics: { instagram: 25000, facebook: 15000 },
        collaborationRate: 5000,
        campaignPreferences: { minBudget: 3000, categories: ['fashion'] },
        availabilityStatus: 'available',
        portfolioUrls: ['/portfolio/sample1.jpg'],
        mediaKit: { avgViews: 10000, demographics: 'women 18-35' },
        performanceMetrics: { conversionRate: 3.2, avgEngagement: 4.2 },
        verificationStatus: 'verified',
        verifiedBy: 'admin-1',
        verifiedAt: new Date('2024-12-01T00:00:00Z'),
        isActive: true,
        totalCampaigns: 12,
        totalEarnings: 45000,
        averageRating: 4.8,
        bangladeshRegions: ['dhaka', 'chittagong'],
        culturalExpertise: ['eid', 'boishakh', 'fashion'],
        createdAt: new Date('2024-01-15T00:00:00Z'),
        updatedAt: new Date('2024-12-15T00:00:00Z')
      }
    ];
  }

  private static getMockCampaigns(): CollaborationCampaign[] {
    return [
      {
        id: 'camp-1',
        vendorId: 'vendor-1',
        campaignName: 'Eid Fashion Campaign 2025',
        campaignDescription: 'Showcase our new Eid collection with traditional meets modern designs',
        campaignType: 'product_promotion',
        targetProducts: ['prod-1', 'prod-2'],
        budget: 25000,
        budgetCurrency: 'BDT',
        paymentStructure: 'per_post',
        campaignObjectives: ['brand_awareness', 'sales_conversion'],
        targetAudience: { age: '18-45', gender: 'women', location: 'bangladesh' },
        contentGuidelines: 'Focus on traditional values and modern styling',
        requiredDeliverables: { posts: 3, stories: 5, reels: 2 },
        campaignDuration: 14,
        startDate: new Date('2025-03-15T00:00:00Z'),
        endDate: new Date('2025-03-29T00:00:00Z'),
        applicationDeadline: new Date('2025-03-10T00:00:00Z'),
        status: 'active',
        maxInfluencers: 10,
        currentInfluencers: 3,
        totalApplications: 23,
        approvedApplications: 3,
        targetInfluencerTier: 'micro',
        minFollowers: 10000,
        maxFollowers: 100000,
        requiredRegions: ['dhaka', 'chittagong'],
        culturalRequirements: ['eid_knowledge', 'bangladesh_culture'],
        performanceMetrics: { reach: 0, engagement: 0, conversions: 0 },
        totalSpent: 15000,
        roi: 0,
        isPublic: true,
        bangladeshFocus: true,
        festivalTiming: 'eid',
        createdAt: new Date('2025-01-15T00:00:00Z'),
        updatedAt: new Date('2025-01-15T00:00:00Z')
      }
    ];
  }

  private static getMockWishlists(): SocialWishlist[] {
    return [
      {
        id: 'wish-1',
        userId: 'user-3',
        name: 'Eid Shopping Collection',
        description: 'Everything I need for a perfect Eid celebration',
        visibility: 'public',
        isCollaborative: true,
        allowedCollaborators: ['user-4', 'user-5'],
        category: 'eid',
        priority: 'high',
        targetBudget: 50000,
        currentValue: 35000,
        itemCount: 12,
        shareCount: 15,
        viewCount: 250,
        isActive: true,
        tags: ['eid', 'fashion', 'family'],
        reminderDate: new Date('2025-03-20T00:00:00Z'),
        eventDate: new Date('2025-03-30T00:00:00Z'),
        isGiftWishlist: false,
        giftGiverIds: [],
        bangladeshOccasion: 'eid',
        culturalContext: { festival: 'eid', familySize: 5 },
        createdAt: new Date('2025-01-10T00:00:00Z'),
        updatedAt: new Date('2025-01-15T00:00:00Z')
      }
    ];
  }
}

export default SocialCommerceApiService;