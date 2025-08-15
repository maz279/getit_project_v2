/**
 * Social Commerce API Service - Amazon.com/Shopee.sg Level API Integration
 * Complete API integration service for social commerce features
 * 
 * @fileoverview Enterprise-grade API service with Bangladesh cultural integration
 * @author GetIt Platform Team
 * @version 4.0.0
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const SOCIAL_COMMERCE_BASE = `${API_BASE_URL}/social-commerce`;

// Create axios instance with default config
const api = axios.create({
  baseURL: SOCIAL_COMMERCE_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class SocialCommerceApiService {
  // =================== SOCIAL PROFILES ===================
  
  /**
   * Get social profiles with filters
   */
  static async getSocialProfiles(params = {}) {
    try {
      const response = await api.get('/profiles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social profiles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single social profile by ID
   */
  static async getSocialProfile(profileId) {
    try {
      const response = await api.get(`/profiles/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new social profile
   */
  static async createSocialProfile(profileData) {
    try {
      const response = await api.post('/profiles', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating social profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update social profile
   */
  static async updateSocialProfile(profileId, updateData) {
    try {
      const response = await api.put(`/profiles/${profileId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating social profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete social profile
   */
  static async deleteSocialProfile(profileId) {
    try {
      const response = await api.delete(`/profiles/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting social profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Follow a profile
   */
  static async followProfile(profileId, userId) {
    try {
      const response = await api.post(`/profiles/${profileId}/follow`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error following profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Unfollow a profile
   */
  static async unfollowProfile(profileId, userId) {
    try {
      const response = await api.delete(`/profiles/${profileId}/follow`, { data: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error unfollowing profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get profile followers
   */
  static async getProfileFollowers(profileId, params = {}) {
    try {
      const response = await api.get(`/profiles/${profileId}/followers`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile followers:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get profile following
   */
  static async getProfileFollowing(profileId, params = {}) {
    try {
      const response = await api.get(`/profiles/${profileId}/following`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile following:', error);
      throw this.handleError(error);
    }
  }

  // =================== SOCIAL POSTS ===================

  /**
   * Get social posts with filters
   */
  static async getSocialPosts(params = {}) {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social posts:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single social post by ID
   */
  static async getSocialPost(postId) {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new social post
   */
  static async createSocialPost(postData) {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('Error creating social post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update social post
   */
  static async updateSocialPost(postId, updateData) {
    try {
      const response = await api.put(`/posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating social post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete social post
   */
  static async deleteSocialPost(postId) {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting social post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Like a post
   */
  static async likePost(postId, userId) {
    try {
      const response = await api.post(`/posts/${postId}/like`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId, userId) {
    try {
      const response = await api.delete(`/posts/${postId}/like`, { data: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Share a post
   */
  static async sharePost(postId, shareData) {
    try {
      const response = await api.post(`/posts/${postId}/share`, shareData);
      return response.data;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Save a post
   */
  static async savePost(postId, userId) {
    try {
      const response = await api.post(`/posts/${postId}/save`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error saving post:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get post analytics
   */
  static async getPostAnalytics(postId) {
    try {
      const response = await api.get(`/posts/${postId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user feed
   */
  static async getUserFeed(userId, params = {}) {
    try {
      const response = await api.get(`/feed/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user feed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get trending posts
   */
  static async getTrendingPosts(params = {}) {
    try {
      const response = await api.get('/trending', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      throw this.handleError(error);
    }
  }

  // =================== SOCIAL COMMENTS ===================

  /**
   * Get post comments
   */
  static async getPostComments(postId, params = {}) {
    try {
      const response = await api.get(`/posts/${postId}/comments`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching post comments:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create comment
   */
  static async createComment(postId, commentData) {
    try {
      const response = await api.post(`/posts/${postId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update comment
   */
  static async updateComment(commentId, updateData) {
    try {
      const response = await api.put(`/comments/${commentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(commentId) {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Like comment
   */
  static async likeComment(commentId, userId) {
    try {
      const response = await api.post(`/comments/${commentId}/like`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reply to comment
   */
  static async replyToComment(commentId, replyData) {
    try {
      const response = await api.post(`/comments/${commentId}/reply`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw this.handleError(error);
    }
  }

  // =================== INFLUENCER MANAGEMENT ===================

  /**
   * Get influencers
   */
  static async getInfluencers(params = {}) {
    try {
      const response = await api.get('/influencers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching influencers:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single influencer
   */
  static async getInfluencer(influencerId) {
    try {
      const response = await api.get(`/influencers/${influencerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching influencer:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Apply to become influencer
   */
  static async applyForInfluencer(applicationData) {
    try {
      const response = await api.post('/influencers/apply', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for influencer:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update influencer profile
   */
  static async updateInfluencerProfile(influencerId, updateData) {
    try {
      const response = await api.put(`/influencers/${influencerId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating influencer profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get influencer analytics
   */
  static async getInfluencerAnalytics(influencerId, params = {}) {
    try {
      const response = await api.get(`/influencers/${influencerId}/analytics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching influencer analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get influencer earnings
   */
  static async getInfluencerEarnings(influencerId, params = {}) {
    try {
      const response = await api.get(`/influencers/${influencerId}/earnings`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching influencer earnings:', error);
      throw this.handleError(error);
    }
  }

  // =================== COLLABORATION CAMPAIGNS ===================

  /**
   * Get collaboration campaigns
   */
  static async getCollaborationCampaigns(params = {}) {
    try {
      const response = await api.get('/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching collaboration campaigns:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single collaboration campaign
   */
  static async getCollaborationCampaign(campaignId) {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collaboration campaign:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create collaboration campaign
   */
  static async createCollaborationCampaign(campaignData) {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating collaboration campaign:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update collaboration campaign
   */
  static async updateCollaborationCampaign(campaignId, updateData) {
    try {
      const response = await api.put(`/campaigns/${campaignId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating collaboration campaign:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete collaboration campaign
   */
  static async deleteCollaborationCampaign(campaignId) {
    try {
      const response = await api.delete(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting collaboration campaign:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Apply for campaign
   */
  static async applyForCampaign(campaignId, applicationData) {
    try {
      const response = await api.post(`/campaigns/${campaignId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for campaign:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get campaign applications
   */
  static async getCampaignApplications(campaignId, params = {}) {
    try {
      const response = await api.get(`/campaigns/${campaignId}/applications`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign applications:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Review campaign application
   */
  static async reviewCampaignApplication(campaignId, applicationId, reviewData) {
    try {
      const response = await api.put(`/campaigns/${campaignId}/applications/${applicationId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error reviewing campaign application:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get campaign analytics
   */
  static async getCampaignAnalytics(campaignId) {
    try {
      const response = await api.get(`/campaigns/${campaignId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw this.handleError(error);
    }
  }

  // =================== SOCIAL GROUPS ===================

  /**
   * Get social groups
   */
  static async getSocialGroups(params = {}) {
    try {
      const response = await api.get('/groups', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social groups:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single social group
   */
  static async getSocialGroup(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create social group
   */
  static async createSocialGroup(groupData) {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating social group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update social group
   */
  static async updateSocialGroup(groupId, updateData) {
    try {
      const response = await api.put(`/groups/${groupId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating social group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete social group
   */
  static async deleteSocialGroup(groupId) {
    try {
      const response = await api.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting social group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Join group
   */
  static async joinGroup(groupId, userData) {
    try {
      const response = await api.post(`/groups/${groupId}/join`, userData);
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Leave group
   */
  static async leaveGroup(groupId, userData) {
    try {
      const response = await api.post(`/groups/${groupId}/leave`, userData);
      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get group members
   */
  static async getGroupMembers(groupId, params = {}) {
    try {
      const response = await api.get(`/groups/${groupId}/members`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update group member role
   */
  static async updateGroupMemberRole(groupId, userId, roleData) {
    try {
      const response = await api.put(`/groups/${groupId}/members/${userId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating group member role:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove group member
   */
  static async removeGroupMember(groupId, userId) {
    try {
      const response = await api.delete(`/groups/${groupId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing group member:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get group posts
   */
  static async getGroupPosts(groupId, params = {}) {
    try {
      const response = await api.get(`/groups/${groupId}/posts`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching group posts:', error);
      throw this.handleError(error);
    }
  }

  // =================== SOCIAL WISHLISTS ===================

  /**
   * Get social wishlists
   */
  static async getSocialWishlists(params = {}) {
    try {
      const response = await api.get('/wishlists', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social wishlists:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single social wishlist
   */
  static async getSocialWishlist(wishlistId) {
    try {
      const response = await api.get(`/wishlists/${wishlistId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social wishlist:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create social wishlist
   */
  static async createSocialWishlist(wishlistData) {
    try {
      const response = await api.post('/wishlists', wishlistData);
      return response.data;
    } catch (error) {
      console.error('Error creating social wishlist:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update social wishlist
   */
  static async updateSocialWishlist(wishlistId, updateData) {
    try {
      const response = await api.put(`/wishlists/${wishlistId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating social wishlist:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete social wishlist
   */
  static async deleteSocialWishlist(wishlistId) {
    try {
      const response = await api.delete(`/wishlists/${wishlistId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting social wishlist:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Add wishlist item
   */
  static async addWishlistItem(wishlistId, itemData) {
    try {
      const response = await api.post(`/wishlists/${wishlistId}/items`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error adding wishlist item:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove wishlist item
   */
  static async removeWishlistItem(wishlistId, itemId) {
    try {
      const response = await api.delete(`/wishlists/${wishlistId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing wishlist item:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get wishlist items
   */
  static async getWishlistItems(wishlistId, params = {}) {
    try {
      const response = await api.get(`/wishlists/${wishlistId}/items`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Follow wishlist
   */
  static async followWishlist(wishlistId, userData) {
    try {
      const response = await api.post(`/wishlists/${wishlistId}/follow`, userData);
      return response.data;
    } catch (error) {
      console.error('Error following wishlist:', error);
      throw this.handleError(error);
    }
  }

  // =================== SOCIAL ANALYTICS ===================

  /**
   * Get social analytics overview
   */
  static async getSocialAnalyticsOverview(params = {}) {
    try {
      const response = await api.get('/analytics/overview', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching social analytics overview:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get engagement analytics
   */
  static async getEngagementAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/engagement', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get content analytics
   */
  static async getContentAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/content', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get trending analytics
   */
  static async getTrendingAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/trending', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get demographics analytics
   */
  static async getDemographicsAnalytics(params = {}) {
    try {
      const response = await api.get('/analytics/demographics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching demographics analytics:', error);
      throw this.handleError(error);
    }
  }

  // =================== SEARCH & DISCOVERY ===================

  /**
   * Search profiles
   */
  static async searchProfiles(params = {}) {
    try {
      const response = await api.get('/search/profiles', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching profiles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search posts
   */
  static async searchPosts(params = {}) {
    try {
      const response = await api.get('/search/posts', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search groups
   */
  static async searchGroups(params = {}) {
    try {
      const response = await api.get('/search/groups', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching groups:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search hashtags
   */
  static async searchHashtags(params = {}) {
    try {
      const response = await api.get('/search/hashtags', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching hashtags:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get discovery suggestions
   */
  static async getDiscoverySuggestions(params = {}) {
    try {
      const response = await api.get('/discover/suggestions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching discovery suggestions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get discovery trending
   */
  static async getDiscoveryTrending(params = {}) {
    try {
      const response = await api.get('/discover/trending', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching discovery trending:', error);
      throw this.handleError(error);
    }
  }

  // =================== BANGLADESH SPECIFIC ===================

  /**
   * Get Bangladesh cultural trends
   */
  static async getBangladeshCulturalTrends(params = {}) {
    try {
      const response = await api.get('/bangladesh/cultural-trends', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Bangladesh cultural trends:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get Bangladesh local influencers
   */
  static async getBangladeshLocalInfluencers(params = {}) {
    try {
      const response = await api.get('/bangladesh/local-influencers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Bangladesh local influencers:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get Bangladesh festival content
   */
  static async getBangladeshFestivalContent(params = {}) {
    try {
      const response = await api.get('/bangladesh/festival-content', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Bangladesh festival content:', error);
      throw this.handleError(error);
    }
  }

  // =================== UTILITY METHODS ===================

  /**
   * Handle API errors
   */
  static handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Upload media files
   */
  static async uploadMedia(files, type = 'post') {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
      formData.append('type', type);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get service health
   */
  static async getHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching service health:', error);
      throw this.handleError(error);
    }
  }
}

export default SocialCommerceApiService;