/**
 * Live Commerce Schema - Amazon Live/Shopee Live Level Database Tables
 * Comprehensive livestreaming and real-time shopping infrastructure
 * 
 * @fileoverview Database schema for Amazon.com/Shopee.sg-level live commerce features
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  decimal, 
  uuid,
  jsonb,
  varchar,
  real,
  date,
  index
} from "drizzle-orm/pg-core";
// Define enums locally to avoid circular dependencies
import { pgEnum } from "drizzle-orm/pg-core";

// Amazon.com/Shopee.sg-Level Live Commerce Enums
export const streamType = pgEnum('stream_type', ['product_demo', 'flash_sale', 'auction', 'tutorial', 'q_and_a', 'behind_scenes', 'unboxing', 'review', 'comparison', 'event']);
export const streamStatus = pgEnum('stream_status', ['scheduled', 'live', 'paused', 'ended', 'cancelled', 'processing']);
export const languageCode = pgEnum('language_code', ['en', 'bn', 'hi', 'ar', 'mixed']);
export const deviceType = pgEnum('device_type', ['mobile', 'desktop', 'tablet', 'smart_tv', 'other']);
export const interactionType = pgEnum('interaction_type', ['message', 'like', 'heart', 'question', 'purchase_intent', 'poll_response', 'share', 'gift', 'follow']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const hostExperience = pgEnum('host_experience', ['beginner', 'intermediate', 'expert', 'celebrity', 'influencer']);
export const verificationStatus = pgEnum('verification_status', ['pending', 'verified', 'rejected', 'suspended']);
export const notificationType = pgEnum('notification_type', ['stream_starting', 'stream_reminder', 'flash_sale_alert', 'product_available', 'host_live', 'new_follower']);
export const recipientType = pgEnum('recipient_type', ['followers', 'subscribers', 'all_users', 'targeted_audience', 'vip_users']);
export const deliveryStatus = pgEnum('delivery_status', ['pending', 'sent', 'delivered', 'failed', 'expired']);
export const flashSaleStatus = pgEnum('flash_sale_status', ['scheduled', 'active', 'ended', 'sold_out', 'cancelled']);
export const moderationAction = pgEnum('moderation_action', ['approved', 'rejected', 'hidden', 'flagged', 'reported', 'auto_moderated']);
export const recordingQuality = pgEnum('recording_quality', ['480p', '720p', '1080p', '4k', 'audio_only']);
export const contentCategory = pgEnum('content_category', ['electronics', 'fashion', 'beauty', 'home', 'sports', 'books', 'food', 'automotive', 'healthcare', 'other']);
export const streamingPlatform = pgEnum('streaming_platform', ['internal', 'facebook', 'youtube', 'instagram', 'tiktok', 'twitter', 'multi_platform']);
export const purchaseMethod = pgEnum('purchase_method', ['live_stream', 'flash_sale', 'auction', 'direct_purchase', 'group_buy']);

// =================== LIVE STREAMING CORE TABLES ===================

// Live Streams table - Main streaming sessions
export const liveStreams = pgTable("live_streams", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostId: integer("host_id").notNull(), // References users.id
  title: varchar("title", { length: 500 }).notNull(),
  titleBn: varchar("title_bn", { length: 500 }),
  description: text("description"),
  descriptionBn: text("description_bn"),
  category: contentCategory("category").notNull(),
  streamType: streamType("stream_type").default('product_demo'),
  status: streamStatus("status").default('scheduled'),
  
  // Streaming URLs and Configuration
  streamKey: varchar("stream_key", { length: 255 }).unique().notNull(),
  rtmpUrl: varchar("rtmp_url", { length: 500 }),
  hlsUrl: varchar("hls_url", { length: 500 }),
  webrtcUrl: varchar("webrtc_url", { length: 500 }),
  recordingUrl: varchar("recording_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  
  // Scheduling and Timing
  scheduledStartTime: timestamp("scheduled_start_time"),
  actualStartTime: timestamp("actual_start_time"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // in minutes
  
  // Stream Settings
  streamSettings: jsonb("stream_settings"), // { allowChat, allowGifts, allowQuestions, moderatedChat, maxViewers, etc. }
  streamingPlatform: streamingPlatform("streaming_platform").default('internal'),
  recordingQuality: recordingQuality("recording_quality").default('1080p'),
  language: languageCode("language").default('en'),
  
  // Monetization
  isPaid: boolean("is_paid").default(false),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('BDT'),
  
  // Geographic and Cultural
  targetRegions: jsonb("target_regions"), // ['BD', 'IN', 'global']
  culturalTags: jsonb("cultural_tags"), // ['eid', 'pohela_boishakh', 'fashion_week']
  
  // Performance Metrics (denormalized for quick access)
  peakViewers: integer("peak_viewers").default(0),
  totalViews: integer("total_views").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default('0'),
  
  // Status and Moderation
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  moderationStatus: moderationAction("moderation_status").default('approved'),
  moderationNotes: text("moderation_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  hostIdIdx: index("live_streams_host_id_idx").on(table.hostId),
  statusIdx: index("live_streams_status_idx").on(table.status),
  categoryIdx: index("live_streams_category_idx").on(table.category),
  scheduledStartIdx: index("live_streams_scheduled_start_idx").on(table.scheduledStartTime),
  createdAtIdx: index("live_streams_created_at_idx").on(table.createdAt),
}));

// Live Stream Products - Products featured in streams
export const liveStreamProducts = pgTable("live_stream_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  productId: uuid("product_id").notNull(), // References products.id
  
  // Display and Ordering
  displayOrder: integer("display_order").default(1),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  
  // Special Pricing and Offers
  specialPrice: decimal("special_price", { precision: 10, scale: 2 }),
  limitedQuantity: integer("limited_quantity"),
  remainingQuantity: integer("remaining_quantity"),
  flashSaleEndTime: timestamp("flash_sale_end_time"),
  
  // Messaging and Highlights
  highlightMessage: varchar("highlight_message", { length: 500 }),
  highlightMessageBn: varchar("highlight_message_bn", { length: 500 }),
  promotionalTags: jsonb("promotional_tags"), // ['flash_sale', 'limited_edition', 'exclusive']
  
  // Performance Metrics
  clickCount: integer("click_count").default(0),
  viewCount: integer("view_count").default(0),
  purchaseCount: integer("purchase_count").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0'),
  conversionRate: real("conversion_rate").default(0),
  
  // Timing
  addedAt: timestamp("added_at").defaultNow(),
  removedAt: timestamp("removed_at"),
  lastShownAt: timestamp("last_shown_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_products_stream_id_idx").on(table.streamId),
  productIdIdx: index("live_stream_products_product_id_idx").on(table.productId),
  displayOrderIdx: index("live_stream_products_display_order_idx").on(table.displayOrder),
  isActiveIdx: index("live_stream_products_is_active_idx").on(table.isActive),
}));

// Live Stream Viewers - Viewer tracking and engagement
export const liveStreamViewers = pgTable("live_stream_viewers", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  userId: integer("user_id"), // References users.id, nullable for guest viewers
  
  // Session Information
  sessionId: varchar("session_id", { length: 255 }),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  watchDuration: integer("watch_duration").default(0), // in seconds
  
  // Viewer Information
  viewerInfo: jsonb("viewer_info"), // { userAgent, ipAddress, country, device, referrer }
  isAnonymous: boolean("is_anonymous").default(false),
  isVip: boolean("is_vip").default(false),
  isModerator: boolean("is_moderator").default(false),
  
  // Engagement Metrics
  messageCount: integer("message_count").default(0),
  likeCount: integer("like_count").default(0),
  shareCount: integer("share_count").default(0),
  giftsSent: integer("gifts_sent").default(0),
  purchasesMade: integer("purchases_made").default(0),
  
  // Connection Quality
  connectionQuality: varchar("connection_quality", { length: 50 }), // 'excellent', 'good', 'poor'
  bufferingEvents: integer("buffering_events").default(0),
  disconnectionCount: integer("disconnection_count").default(0),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_viewers_stream_id_idx").on(table.streamId),
  userIdIdx: index("live_stream_viewers_user_id_idx").on(table.userId),
  isActiveIdx: index("live_stream_viewers_is_active_idx").on(table.isActive),
  joinedAtIdx: index("live_stream_viewers_joined_at_idx").on(table.joinedAt),
}));

// Live Stream Chat - Real-time chat messages
export const liveStreamChat = pgTable("live_stream_chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  userId: integer("user_id"), // References users.id, nullable for system messages
  
  // Message Content
  message: text("message").notNull(),
  messageBn: text("message_bn"),
  messageType: interactionType("message_type").default('message'),
  
  // Message Metadata
  isSystemMessage: boolean("is_system_message").default(false),
  isPinned: boolean("is_pinned").default(false),
  isHighlighted: boolean("is_highlighted").default(false),
  replyToMessageId: uuid("reply_to_message_id"),
  
  // Engagement
  likeCount: integer("like_count").default(0),
  replyCount: integer("reply_count").default(0),
  
  // Moderation
  moderationStatus: moderationAction("moderation_status").default('approved'),
  moderatedBy: integer("moderated_by"), // References users.id
  moderatedAt: timestamp("moderated_at"),
  moderationReason: varchar("moderation_reason", { length: 255 }),
  
  // Virtual Gifts
  giftType: varchar("gift_type", { length: 100 }),
  giftValue: decimal("gift_value", { precision: 10, scale: 2 }),
  giftAnimation: varchar("gift_animation", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_chat_stream_id_idx").on(table.streamId),
  userIdIdx: index("live_stream_chat_user_id_idx").on(table.userId),
  messageTypeIdx: index("live_stream_chat_message_type_idx").on(table.messageType),
  createdAtIdx: index("live_stream_chat_created_at_idx").on(table.createdAt),
  moderationStatusIdx: index("live_stream_chat_moderation_status_idx").on(table.moderationStatus),
}));

// Live Stream Purchases - Instant purchase tracking
export const liveStreamPurchases = pgTable("live_stream_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  productId: uuid("product_id").notNull(), // References products.id
  userId: integer("user_id").notNull(), // References users.id
  orderId: uuid("order_id"), // References orders.id
  
  // Purchase Details
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('BDT'),
  
  // Purchase Context
  purchaseSource: purchaseMethod("purchase_source").default('live_stream'),
  wasSpecialPrice: boolean("was_special_price").default(false),
  wasFlashSale: boolean("was_flash_sale").default(false),
  wasLimitedQuantity: boolean("was_limited_quantity").default(false),
  
  // Payment Information
  paymentMethod: varchar("payment_method", { length: 100 }), // 'bkash', 'nagad', 'rocket', 'card'
  paymentStatus: paymentStatus("payment_status").default('pending'),
  paymentId: varchar("payment_id", { length: 255 }),
  
  // Timing and Context
  purchasedAt: timestamp("purchased_at").defaultNow(),
  streamTimeOfPurchase: integer("stream_time_of_purchase"), // minutes from stream start
  viewDurationBeforePurchase: integer("view_duration_before_purchase"), // in seconds
  
  // Commission and Revenue Sharing
  hostCommission: decimal("host_commission", { precision: 10, scale: 2 }).default('0'),
  platformCommission: decimal("platform_commission", { precision: 10, scale: 2 }).default('0'),
  vendorRevenue: decimal("vendor_revenue", { precision: 10, scale: 2 }).default('0'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_purchases_stream_id_idx").on(table.streamId),
  productIdIdx: index("live_stream_purchases_product_id_idx").on(table.productId),
  userIdIdx: index("live_stream_purchases_user_id_idx").on(table.userId),
  orderIdIdx: index("live_stream_purchases_order_id_idx").on(table.orderId),
  purchasedAtIdx: index("live_stream_purchases_purchased_at_idx").on(table.purchasedAt),
  paymentStatusIdx: index("live_stream_purchases_payment_status_idx").on(table.paymentStatus),
}));

// Live Stream Analytics - Comprehensive performance metrics
export const liveStreamAnalytics = pgTable("live_stream_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).unique().notNull(),
  
  // Viewer Metrics
  viewerCount: integer("viewer_count").default(0),
  peakViewers: integer("peak_viewers").default(0),
  totalViews: integer("total_views").default(0),
  uniqueViewers: integer("unique_viewers").default(0),
  averageWatchTime: integer("average_watch_time").default(0), // in seconds
  totalWatchTime: integer("total_watch_time").default(0), // in seconds
  
  // Engagement Metrics
  chatMessages: integer("chat_messages").default(0),
  likes: integer("likes").default(0),
  hearts: integer("hearts").default(0),
  shares: integer("shares").default(0),
  questions: integer("questions").default(0),
  polls: integer("polls").default(0),
  giftsReceived: integer("gifts_received").default(0),
  giftValue: decimal("gift_value", { precision: 10, scale: 2 }).default('0'),
  
  // Product and Shopping Metrics
  productClicks: integer("product_clicks").default(0),
  productViews: integer("product_views").default(0),
  addToCartActions: integer("add_to_cart_actions").default(0),
  purchases: integer("purchases").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default('0'),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default('0'),
  
  // Conversion Metrics
  viewToClickRate: real("view_to_click_rate").default(0),
  clickToCartRate: real("click_to_cart_rate").default(0),
  cartToPurchaseRate: real("cart_to_purchase_rate").default(0),
  overallConversionRate: real("overall_conversion_rate").default(0),
  engagementRate: real("engagement_rate").default(0),
  
  // Technical Metrics
  streamQuality: varchar("stream_quality", { length: 50 }), // 'excellent', 'good', 'poor'
  bufferingIncidents: integer("buffering_incidents").default(0),
  connectionIssues: integer("connection_issues").default(0),
  averageLatency: integer("average_latency").default(0), // in milliseconds
  
  // Geographic and Demographic Metrics
  topCountries: jsonb("top_countries"), // [{ country: 'BD', percentage: 75 }]
  topCities: jsonb("top_cities"), // [{ city: 'Dhaka', percentage: 45 }]
  deviceBreakdown: jsonb("device_breakdown"), // { mobile: 80, desktop: 15, tablet: 5 }
  ageGroupBreakdown: jsonb("age_group_breakdown"), // { '18-25': 40, '26-35': 35, etc. }
  
  // Peak Performance Windows
  peakEngagementTime: timestamp("peak_engagement_time"),
  peakPurchaseTime: timestamp("peak_purchase_time"),
  peakViewerTime: timestamp("peak_viewer_time"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_analytics_stream_id_idx").on(table.streamId),
  totalViewsIdx: index("live_stream_analytics_total_views_idx").on(table.totalViews),
  revenueIdx: index("live_stream_analytics_revenue_idx").on(table.revenue),
  engagementRateIdx: index("live_stream_analytics_engagement_rate_idx").on(table.engagementRate),
}));

// Live Stream Interactions - Detailed interaction tracking
export const liveStreamInteractions = pgTable("live_stream_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  userId: integer("user_id"), // References users.id, nullable for anonymous
  
  // Interaction Details
  interactionType: interactionType("interaction_type").notNull(),
  targetType: varchar("target_type", { length: 100 }), // 'stream', 'product', 'message', 'host'
  targetId: varchar("target_id", { length: 255 }),
  
  // Interaction Context
  streamTimeOffset: integer("stream_time_offset"), // seconds from stream start
  deviceType: deviceType("device_type"),
  interactionData: jsonb("interaction_data"), // Additional context data
  
  // Sentiment and Engagement
  sentimentScore: real("sentiment_score"), // -1 to 1
  engagementWeight: real("engagement_weight").default(1), // Weighted importance
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_interactions_stream_id_idx").on(table.streamId),
  userIdIdx: index("live_stream_interactions_user_id_idx").on(table.userId),
  interactionTypeIdx: index("live_stream_interactions_type_idx").on(table.interactionType),
  createdAtIdx: index("live_stream_interactions_created_at_idx").on(table.createdAt),
}));

// Live Stream Notifications - Real-time notification management
export const liveStreamNotifications = pgTable("live_stream_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  
  // Notification Content
  title: varchar("title", { length: 255 }).notNull(),
  titleBn: varchar("title_bn", { length: 255 }),
  message: text("message").notNull(),
  messageBn: text("message_bn"),
  
  // Targeting
  recipientType: varchar("recipient_type", { length: 100 }), // 'followers', 'subscribers', 'all_users', 'targeted'
  targetUserIds: jsonb("target_user_ids"), // Array of user IDs for targeted notifications
  targetCriteria: jsonb("target_criteria"), // Targeting criteria for dynamic audiences
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  
  // Performance
  totalSent: integer("total_sent").default(0),
  totalDelivered: integer("total_delivered").default(0),
  totalOpened: integer("total_opened").default(0),
  totalClicked: integer("total_clicked").default(0),
  
  // Configuration
  channels: jsonb("channels"), // ['push', 'email', 'sms', 'in_app']
  isActive: boolean("is_active").default(true),
  priority: varchar("priority", { length: 50 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_notifications_stream_id_idx").on(table.streamId),
  scheduledForIdx: index("live_stream_notifications_scheduled_for_idx").on(table.scheduledFor),
  recipientTypeIdx: index("live_stream_notifications_recipient_type_idx").on(table.recipientType),
}));

// Live Stream Highlights - AI-generated and manual highlights
export const liveStreamHighlights = pgTable("live_stream_highlights", {
  id: uuid("id").primaryKey().defaultRandom(),
  streamId: uuid("stream_id").references(() => liveStreams.id).notNull(),
  
  // Highlight Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: integer("start_time").notNull(), // seconds from stream start
  endTime: integer("end_time").notNull(), // seconds from stream start
  duration: integer("duration").notNull(), // in seconds
  
  // Media and URLs
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  videoUrl: varchar("video_url", { length: 500 }),
  gifUrl: varchar("gif_url", { length: 500 }),
  
  // Classification
  highlightType: varchar("highlight_type", { length: 100 }), // 'product_showcase', 'peak_engagement', 'purchase_moment', 'funny_moment', 'educational'
  isAiGenerated: boolean("is_ai_generated").default(false),
  confidence: real("confidence"), // AI confidence score 0-1
  
  // Engagement
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  likeCount: integer("like_count").default(0),
  
  // Performance
  engagementScore: real("engagement_score").default(0),
  viralityScore: real("virality_score").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  streamIdIdx: index("live_stream_highlights_stream_id_idx").on(table.streamId),
  highlightTypeIdx: index("live_stream_highlights_type_idx").on(table.highlightType),
  engagementScoreIdx: index("live_stream_highlights_engagement_score_idx").on(table.engagementScore),
}));