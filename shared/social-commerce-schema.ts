/**
 * Social Commerce Database Schema - Amazon.com/Shopee.sg Level
 * Complete social networking and commerce integration with Bangladesh features
 * 
 * @fileoverview Production-ready social commerce schema with comprehensive relationships
 * @author GetIt Platform Team
 * @version 3.0.0
 */

import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users, vendors, products, orders } from './schema.js';

// Custom ENUM types for social commerce
export const profileTypeEnum = pgEnum('profile_type', ['customer', 'influencer', 'vendor', 'admin']);
export const verificationStatusEnum = pgEnum('verification_status', ['unverified', 'pending', 'verified', 'rejected']);
export const postTypeEnum = pgEnum('post_type', ['text', 'image', 'video', 'product_showcase', 'story', 'live', 'poll', 'review']);
export const postVisibilityEnum = pgEnum('post_visibility', ['public', 'followers', 'friends', 'private', 'group']);
export const interactionTargetEnum = pgEnum('interaction_target', ['post', 'comment', 'user', 'product', 'group', 'wishlist']);
export const interactionTypeEnum = pgEnum('interaction_type', ['like', 'follow', 'share', 'save', 'view', 'comment', 'react']);
export const influencerTierEnum = pgEnum('influencer_tier', ['nano', 'micro', 'macro', 'mega', 'celebrity']);
export const influencerStatusEnum = pgEnum('influencer_status', ['pending', 'approved', 'rejected', 'suspended', 'active', 'inactive']);
export const campaignTypeEnum = pgEnum('campaign_type', ['product_review', 'brand_awareness', 'product_launch', 'seasonal', 'flash_sale', 'unboxing']);
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'active', 'paused', 'completed', 'cancelled', 'pending_approval']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'approved', 'rejected', 'withdrawn', 'in_review']);
export const groupPrivacyEnum = pgEnum('group_privacy', ['public', 'private', 'secret', 'invite_only']);
export const memberRoleEnum = pgEnum('member_role', ['member', 'moderator', 'admin', 'owner', 'contributor']);
export const wishlistPrivacyEnum = pgEnum('wishlist_privacy', ['public', 'friends', 'private', 'followers']);
export const priorityLevelEnum = pgEnum('priority_level', ['low', 'medium', 'high', 'urgent']);
export const contentStatusEnum = pgEnum('content_status', ['active', 'hidden', 'reported', 'under_review', 'removed']);

// 1. SOCIAL PROFILES - Core social identity management
export const socialProfiles = pgTable('social_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id).notNull(),
  profileType: profileTypeEnum('profile_type').default('customer'),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  displayNameBn: varchar('display_name_bn', { length: 100 }), // Bengali display name
  bio: text('bio'),
  bioBn: text('bio_bn'), // Bengali bio
  avatarUrl: varchar('avatar_url', { length: 500 }),
  coverUrl: varchar('cover_url', { length: 500 }),
  followerCount: integer('follower_count').default(0),
  followingCount: integer('following_count').default(0),
  totalLikes: integer('total_likes').default(0),
  totalShares: integer('total_shares').default(0),
  totalPosts: integer('total_posts').default(0),
  verificationStatus: verificationStatusEnum('verification_status').default('unverified'),
  verifiedAt: timestamp('verified_at'),
  privacySettings: jsonb('privacy_settings').$type<{
    profile: 'public' | 'private' | 'friends';
    posts: 'public' | 'followers' | 'friends' | 'private';
    followers: 'public' | 'private';
    following: 'public' | 'private';
    wishlist: 'public' | 'friends' | 'private';
  }>().default({
    profile: 'public',
    posts: 'public', 
    followers: 'public',
    following: 'public',
    wishlist: 'public'
  }),
  socialLinks: jsonb('social_links').$type<{
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  }>(),
  interests: jsonb('interests').$type<string[]>().default([]),
  location: varchar('location', { length: 255 }),
  locationBn: varchar('location_bn', { length: 255 }), // Bengali location
  language: varchar('language', { length: 10 }).default('en'), // en, bn, hi, ar
  timezone: varchar('timezone', { length: 50 }).default('Asia/Dhaka'),
  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 2. SOCIAL POSTS - Content creation and sharing
export const socialPosts = pgTable('social_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => socialProfiles.id).notNull(),
  postType: postTypeEnum('post_type').notNull(),
  content: text('content'),
  contentBn: text('content_bn'), // Bengali content
  mediaUrls: jsonb('media_urls').$type<string[]>().default([]),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  productTags: jsonb('product_tags').$type<string[]>().default([]), // Array of product IDs
  userTags: jsonb('user_tags').$type<string[]>().default([]), // Array of user IDs mentioned
  hashtags: jsonb('hashtags').$type<string[]>().default([]),
  locationTag: varchar('location_tag', { length: 255 }),
  locationTagBn: varchar('location_tag_bn', { length: 255 }),
  visibility: postVisibilityEnum('visibility').default('public'),
  groupId: uuid('group_id').references(() => socialGroups.id), // If posted in a group
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  shareCount: integer('share_count').default(0),
  viewCount: integer('view_count').default(0),
  saveCount: integer('save_count').default(0),
  engagementScore: decimal('engagement_score', { precision: 8, scale: 4 }).default('0'),
  isSponsored: boolean('is_sponsored').default(false),
  sponsorId: uuid('sponsor_id').references(() => vendors.id),
  sponsorshipAmount: decimal('sponsorship_amount', { precision: 12, scale: 2 }),
  campaignId: uuid('campaign_id'), // Reference to collaboration campaign
  isPromoted: boolean('is_promoted').default(false),
  promotionBudget: decimal('promotion_budget', { precision: 10, scale: 2 }),
  targetAudience: jsonb('target_audience').$type<{
    ageGroups?: string[];
    locations?: string[];
    interests?: string[];
    gender?: string;
  }>(),
  status: contentStatusEnum('status').default('active'),
  moderationFlags: jsonb('moderation_flags').$type<{
    isReported: boolean;
    reportCount: number;
    flaggedReasons: string[];
    moderatorNotes?: string;
  }>().default({
    isReported: false,
    reportCount: 0,
    flaggedReasons: []
  }),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 3. SOCIAL INTERACTIONS - Likes, follows, shares, saves
export const socialInteractions = pgTable('social_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id).notNull(),
  targetType: interactionTargetEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  interactionType: interactionTypeEnum('interaction_type').notNull(),
  metadata: jsonb('metadata').$type<{
    reactionType?: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    shareMessage?: string;
    shareToGroups?: string[];
    shareToPlatforms?: string[];
    deviceType?: string;
    location?: string;
  }>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// 4. SOCIAL COMMENTS - Post and product comments
export const socialComments = pgTable('social_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => socialPosts.id).notNull(),
  authorId: uuid('author_id').references(() => socialProfiles.id).notNull(),
  parentCommentId: uuid('parent_comment_id').references(() => socialComments.id), // For replies
  content: text('content').notNull(),
  contentBn: text('content_bn'), // Bengali content
  mediaUrl: varchar('media_url', { length: 500 }),
  mediaType: varchar('media_type', { length: 20 }), // image, video, gif
  userTags: jsonb('user_tags').$type<string[]>().default([]),
  likeCount: integer('like_count').default(0),
  replyCount: integer('reply_count').default(0),
  isPinned: boolean('is_pinned').default(false),
  isHidden: boolean('is_hidden').default(false),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at'),
  status: contentStatusEnum('status').default('active'),
  moderationFlags: jsonb('moderation_flags').$type<{
    isReported: boolean;
    reportCount: number;
    flaggedReasons: string[];
  }>().default({
    isReported: false,
    reportCount: 0,
    flaggedReasons: []
  }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 5. INFLUENCER PROFILES - Enhanced influencer management
export const influencerProfiles = pgTable('influencer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id).notNull(),
  socialProfileId: uuid('social_profile_id').references(() => socialProfiles.id).notNull(),
  influencerTier: influencerTierEnum('influencer_tier').notNull(),
  categories: jsonb('categories').$type<string[]>().notNull().default([]), // fashion, tech, lifestyle, food, beauty
  niches: jsonb('niches').$type<string[]>().default([]), // specific subcategories
  externalPlatforms: jsonb('external_platforms').$type<{
    facebook?: { followers: number; engagement_rate: number; url: string; verified: boolean };
    instagram?: { followers: number; engagement_rate: number; url: string; verified: boolean };
    youtube?: { subscribers: number; views: number; url: string; verified: boolean };
    tiktok?: { followers: number; likes: number; url: string; verified: boolean };
    twitter?: { followers: number; engagement_rate: number; url: string; verified: boolean };
  }>(),
  totalFollowers: integer('total_followers').default(0),
  averageEngagementRate: decimal('average_engagement_rate', { precision: 5, scale: 2 }),
  averageViews: integer('average_views'),
  contentQualityScore: decimal('content_quality_score', { precision: 5, scale: 2 }),
  authenticityScore: decimal('authenticity_score', { precision: 5, scale: 2 }),
  responseRate: decimal('response_rate', { precision: 5, scale: 2 }),
  collaborationRate: decimal('collaboration_rate', { precision: 12, scale: 2 }), // Per post/video rate
  minimumCollaborationAmount: decimal('minimum_collaboration_amount', { precision: 12, scale: 2 }),
  preferredCollaborationTypes: jsonb('preferred_collaboration_types').$type<string[]>().default([]),
  portfolioUrls: jsonb('portfolio_urls').$type<string[]>().default([]),
  testimonials: jsonb('testimonials').$type<{
    vendorId: string;
    rating: number;
    comment: string;
    campaignType: string;
    date: string;
  }[]>().default([]),
  performanceMetrics: jsonb('performance_metrics').$type<{
    totalCampaigns: number;
    successfulCampaigns: number;
    averageROI: number;
    averageConversionRate: number;
    totalEarnings: number;
    averageRating: number;
  }>(),
  demographics: jsonb('demographics').$type<{
    ageGroups: { [key: string]: number };
    locations: { [key: string]: number };
    interests: { [key: string]: number };
    genderDistribution: { [key: string]: number };
  }>(),
  verificationDocuments: jsonb('verification_documents').$type<{
    nid?: string;
    passport?: string;
    drivingLicense?: string;
    bankStatement?: string;
    tradeLicense?: string;
  }>(),
  bankDetails: jsonb('bank_details').$type<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    routingNumber: string;
    mobileBank?: {
      bkash?: string;
      nagad?: string;
      rocket?: string;
    };
  }>(),
  status: influencerStatusEnum('status').default('pending'),
  approvedAt: timestamp('approved_at'),
  approvedBy: integer('approved_by'),
  suspendedAt: timestamp('suspended_at'),
  suspensionReason: text('suspension_reason'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 6. COLLABORATION CAMPAIGNS - Brand partnership campaigns
export const collaborationCampaigns = pgTable('collaboration_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendors.id).notNull(),
  campaignName: varchar('campaign_name', { length: 255 }).notNull(),
  campaignNameBn: varchar('campaign_name_bn', { length: 255 }),
  description: text('description'),
  descriptionBn: text('description_bn'),
  campaignType: campaignTypeEnum('campaign_type').notNull(),
  objectives: jsonb('objectives').$type<string[]>().default([]),
  targetAudience: jsonb('target_audience').$type<{
    ageGroups: string[];
    locations: string[];
    interests: string[];
    gender: string;
    influencerTiers: string[];
    minimumFollowers: number;
    minimumEngagementRate: number;
  }>(),
  budget: decimal('budget', { precision: 15, scale: 2 }).notNull(),
  budgetPerInfluencer: decimal('budget_per_influencer', { precision: 12, scale: 2 }),
  productIds: jsonb('product_ids').$type<string[]>().default([]),
  requirements: jsonb('requirements').$type<{
    contentType: string[];
    postingFrequency: string;
    hashtags: string[];
    mentions: string[];
    disclosureRequired: boolean;
    exclusivityPeriod: number;
    geographicRestrictions: string[];
  }>(),
  deliverables: jsonb('deliverables').$type<{
    posts: number;
    stories: number;
    videos: number;
    liveStreams: number;
    reviews: number;
    customContent: string[];
  }>(),
  guidelines: text('guidelines'),
  guidelinesBn: text('guidelines_bn'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: campaignStatusEnum('status').default('draft'),
  isPromoted: boolean('is_promoted').default(false),
  applicationDeadline: timestamp('application_deadline'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  approvedParticipants: integer('approved_participants').default(0),
  totalReach: integer('total_reach').default(0),
  totalEngagement: integer('total_engagement').default(0),
  totalViews: integer('total_views').default(0),
  conversionCount: integer('conversion_count').default(0),
  salesGenerated: decimal('sales_generated', { precision: 15, scale: 2 }).default('0'),
  roi: decimal('roi', { precision: 8, scale: 4 }),
  performanceMetrics: jsonb('performance_metrics').$type<{
    averageEngagementRate: number;
    averageReach: number;
    clickThroughRate: number;
    conversionRate: number;
    brandMentions: number;
    userGeneratedContent: number;
    influencerRatings: number[];
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 7. COLLABORATION APPLICATIONS - Influencer campaign applications
export const collaborationApplications = pgTable('collaboration_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => collaborationCampaigns.id).notNull(),
  influencerId: uuid('influencer_id').references(() => influencerProfiles.id).notNull(),
  proposal: text('proposal'),
  proposalBn: text('proposal_bn'),
  proposedRate: decimal('proposed_rate', { precision: 12, scale: 2 }),
  deliverableTimeline: jsonb('deliverable_timeline').$type<{
    contentType: string;
    deliveryDate: string;
    description: string;
  }[]>(),
  portfolioSamples: jsonb('portfolio_samples').$type<{
    type: string;
    url: string;
    description: string;
    metrics?: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  }[]>(),
  expectedMetrics: jsonb('expected_metrics').$type<{
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedViews: number;
    conversionEstimate: number;
  }>(),
  socialProof: jsonb('social_proof').$type<{
    previousCampaigns: number;
    averagePerformance: number;
    testimonials: string[];
    certifications: string[];
  }>(),
  status: applicationStatusEnum('status').default('pending'),
  vendorFeedback: text('vendor_feedback'),
  vendorRating: integer('vendor_rating'), // 1-5 rating
  negotiatedRate: decimal('negotiated_rate', { precision: 12, scale: 2 }),
  contractTerms: jsonb('contract_terms').$type<{
    paymentTerms: string;
    deliverables: string[];
    timeline: string;
    exclusivityClause: boolean;
    revisionPolicy: string;
  }>(),
  appliedAt: timestamp('applied_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  completedAt: timestamp('completed_at')
});

// 8. SOCIAL GROUPS - Enhanced community features
export const socialGroups = pgTable('social_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  nameBn: varchar('name_bn', { length: 255 }),
  description: text('description'),
  descriptionBn: text('description_bn'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  coverUrl: varchar('cover_url', { length: 500 }),
  category: varchar('category', { length: 100 }),
  subcategory: varchar('subcategory', { length: 100 }),
  privacyType: groupPrivacyEnum('privacy_type').default('public'),
  memberCount: integer('member_count').default(0),
  postCount: integer('post_count').default(0),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  groupRules: jsonb('group_rules').$type<{
    description: string;
    rules: string[];
    rulesBn?: string[];
    postingGuidelines: string[];
    moderationPolicy: string;
  }>(),
  moderationSettings: jsonb('moderation_settings').$type<{
    requireApproval: boolean;
    autoModeration: boolean;
    bannedWords: string[];
    postApprovalRequired: boolean;
    memberApprovalRequired: boolean;
  }>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  location: varchar('location', { length: 255 }),
  locationBn: varchar('location_bn', { length: 255 }),
  language: varchar('language', { length: 10 }).default('en'),
  isVerified: boolean('is_verified').default(false),
  isOfficial: boolean('is_official').default(false),
  engagementScore: decimal('engagement_score', { precision: 8, scale: 4 }).default('0'),
  growthRate: decimal('growth_rate', { precision: 5, scale: 2 }).default('0'),
  averagePostEngagement: decimal('average_post_engagement', { precision: 8, scale: 4 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 9. GROUP MEMBERSHIPS - Enhanced membership management
export const groupMemberships = pgTable('group_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').references(() => socialGroups.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: memberRoleEnum('role').default('member'),
  permissions: jsonb('permissions').$type<{
    canPost: boolean;
    canComment: boolean;
    canModerate: boolean;
    canInvite: boolean;
    canManageMembers: boolean;
    canEditGroup: boolean;
  }>().default({
    canPost: true,
    canComment: true,
    canModerate: false,
    canInvite: false,
    canManageMembers: false,
    canEditGroup: false
  }),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastActivity: timestamp('last_activity'),
  contributionScore: integer('contribution_score').default(0),
  postCount: integer('post_count').default(0),
  commentCount: integer('comment_count').default(0),
  isMuted: boolean('is_muted').default(false),
  muteExpiry: timestamp('mute_expiry'),
  isBanned: boolean('is_banned').default(false),
  banExpiry: timestamp('ban_expiry'),
  banReason: text('ban_reason'),
  invitedBy: integer('invited_by'),
  inviteAcceptedAt: timestamp('invite_accepted_at')
});

// 10. SOCIAL WISHLISTS - Enhanced wishlist features
export const socialWishlists = pgTable('social_wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  nameBn: varchar('name_bn', { length: 255 }),
  description: text('description'),
  descriptionBn: text('description_bn'),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  privacyType: wishlistPrivacyEnum('privacy_type').default('public'),
  productCount: integer('product_count').default(0),
  followerCount: integer('follower_count').default(0),
  shareCount: integer('share_count').default(0),
  viewCount: integer('view_count').default(0),
  isCollaborative: boolean('is_collaborative').default(false),
  collaborators: jsonb('collaborators').$type<{
    userId: number;
    permissions: string[];
    addedAt: string;
  }[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  category: varchar('category', { length: 100 }),
  isPublic: boolean('is_public').default(true),
  isFeatured: boolean('is_featured').default(false),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).default('0'),
  averagePrice: decimal('average_price', { precision: 12, scale: 2 }).default('0'),
  priceRange: jsonb('price_range').$type<{
    min: number;
    max: number;
    currency: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 11. WISHLIST ITEMS - Enhanced wishlist item management
export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  wishlistId: uuid('wishlist_id').references(() => socialWishlists.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  addedBy: integer('added_by').references(() => users.id).notNull(),
  priority: priorityLevelEnum('priority').default('medium'),
  notes: text('notes'),
  notesBn: text('notes_bn'),
  priceAlertThreshold: decimal('price_alert_threshold', { precision: 12, scale: 2 }),
  originalPrice: decimal('original_price', { precision: 12, scale: 2 }),
  currentPrice: decimal('current_price', { precision: 12, scale: 2 }),
  lowestPrice: decimal('lowest_price', { precision: 12, scale: 2 }),
  priceHistory: jsonb('price_history').$type<{
    date: string;
    price: number;
    source: string;
  }[]>().default([]),
  availability: varchar('availability', { length: 50 }).default('in_stock'),
  tags: jsonb('tags').$type<string[]>().default([]),
  customization: jsonb('customization').$type<{
    color?: string;
    size?: string;
    variant?: string;
    specifications?: { [key: string]: any };
  }>(),
  shareCount: integer('share_count').default(0),
  viewCount: integer('view_count').default(0),
  isPurchased: boolean('is_purchased').default(false),
  purchasedAt: timestamp('purchased_at'),
  orderId: uuid('order_id').references(() => orders.id),
  addedAt: timestamp('added_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 12. SOCIAL REVIEWS - Enhanced review system
export const socialReviews = pgTable('social_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  reviewerId: integer('reviewer_id').references(() => users.id).notNull(),
  socialProfileId: uuid('social_profile_id').references(() => socialProfiles.id),
  orderId: uuid('order_id').references(() => orders.id),
  rating: integer('rating').notNull(), // 1-5 stars
  title: varchar('title', { length: 255 }),
  titleBn: varchar('title_bn', { length: 255 }),
  content: text('content'),
  contentBn: text('content_bn'),
  pros: jsonb('pros').$type<string[]>().default([]),
  cons: jsonb('cons').$type<string[]>().default([]),
  mediaUrls: jsonb('media_urls').$type<{
    type: 'image' | 'video';
    url: string;
    caption?: string;
    thumbnail?: string;
  }[]>().default([]),
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),
  verifiedPurchase: boolean('verified_purchase').default(false),
  isFeatured: boolean('is_featured').default(false),
  isIncentivized: boolean('is_incentivized').default(false), // If review was incentivized
  responseFromVendor: text('response_from_vendor'),
  responseFromVendorBn: text('response_from_vendor_bn'),
  responseDate: timestamp('response_date'),
  sentiment: varchar('sentiment', { length: 20 }), // positive, negative, neutral
  sentimentScore: decimal('sentiment_score', { precision: 5, scale: 4 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  usageContext: jsonb('usage_context').$type<{
    usageDuration: string;
    useCase: string;
    userType: string;
    recommendation: string;
  }>(),
  demographics: jsonb('demographics').$type<{
    ageGroup: string;
    location: string;
    experience: string;
  }>(),
  moderationStatus: contentStatusEnum('moderation_status').default('active'),
  moderationNotes: text('moderation_notes'),
  reportCount: integer('report_count').default(0),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 13. SOCIAL ANALYTICS - Comprehensive analytics tracking
export const socialAnalytics = pgTable('social_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // post, user, product, campaign, group, wishlist
  entityId: uuid('entity_id').notNull(),
  date: timestamp('date').notNull(),
  timeframe: varchar('timeframe', { length: 20 }).notNull(), // hourly, daily, weekly, monthly
  metrics: jsonb('metrics').$type<{
    views?: number;
    uniqueViews?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    engagementRate?: number;
    reach?: number;
    impressions?: number;
    clickThroughRate?: number;
    conversionRate?: number;
    revenue?: number;
    newFollowers?: number;
    profileVisits?: number;
  }>(),
  demographics: jsonb('demographics').$type<{
    ageGroups?: { [key: string]: number };
    locations?: { [key: string]: number };
    interests?: { [key: string]: number };
    devices?: { [key: string]: number };
    genderDistribution?: { [key: string]: number };
  }>(),
  platformBreakdown: jsonb('platform_breakdown').$type<{
    website?: number;
    mobile?: number;
    facebook?: number;
    instagram?: number;
    youtube?: number;
    tiktok?: number;
    direct?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow()
});

// 14. CONTENT MODERATION LOG - Track all moderation activities
export const contentModerationLog = pgTable('content_moderation_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentType: varchar('content_type', { length: 50 }).notNull(), // post, comment, review, profile
  contentId: uuid('content_id').notNull(),
  moderatorId: integer('moderator_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(), // approve, reject, hide, delete, flag, warn
  reason: varchar('reason', { length: 100 }),
  details: text('details'),
  systemGenerated: boolean('system_generated').default(false),
  confidence: decimal('confidence', { precision: 5, scale: 4 }), // AI confidence score
  appealStatus: varchar('appeal_status', { length: 20 }), // none, pending, approved, rejected
  appealNotes: text('appeal_notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// 15. SOCIAL NOTIFICATIONS - Comprehensive notification system
export const socialNotifications = pgTable('social_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // like, comment, follow, mention, share, collaboration
  title: varchar('title', { length: 255 }).notNull(),
  titleBn: varchar('title_bn', { length: 255 }),
  message: text('message').notNull(),
  messageBn: text('message_bn'),
  entityType: varchar('entity_type', { length: 50 }), // post, comment, user, campaign
  entityId: uuid('entity_id'),
  actionUrl: varchar('action_url', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  priority: priorityLevelEnum('priority').default('medium'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  sentViaEmail: boolean('sent_via_email').default(false),
  sentViaPush: boolean('sent_via_push').default(false),
  sentViaSms: boolean('sent_via_sms').default(false),
  metadata: jsonb('metadata').$type<{
    actorId?: number;
    actorName?: string;
    actorAvatar?: string;
    groupId?: string;
    campaignId?: string;
    additionalData?: { [key: string]: any };
  }>(),
  createdAt: timestamp('created_at').defaultNow()
});

// Indexes for optimal performance
// Note: Drizzle ORM indexes would be defined separately in migrations