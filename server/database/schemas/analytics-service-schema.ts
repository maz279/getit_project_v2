/**
 * Analytics Service Database Schema - Phase 1 Week 2
 * ClickHouse-style analytics database schema for high-performance analytics
 * 
 * @fileoverview Analytics service database schema with columnar optimization
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
  bigint,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ================================
// ANALYTICS SERVICE ENUMS
// ================================

export const eventType = pgEnum('event_type', ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search', 'user_action', 'system_event']);
export const deviceType = pgEnum('device_type', ['mobile', 'desktop', 'tablet', 'bot', 'other']);
export const trafficSource = pgEnum('traffic_source', ['organic', 'paid', 'social', 'direct', 'referral', 'email']);
export const eventStatus = pgEnum('event_status', ['processed', 'pending', 'failed', 'archived']);

// ================================
// ANALYTICS SERVICE CORE TABLES
// ================================

// Events table for real-time event tracking
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Event metadata
  eventType: eventType("event_type").notNull(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"),
  eventAction: text("event_action"),
  eventLabel: text("event_label"),
  eventValue: decimal("event_value", { precision: 10, scale: 2 }),
  
  // User and session information
  userId: integer("user_id"), // Reference to User Service
  sessionId: text("session_id"),
  anonymousId: text("anonymous_id"),
  
  // Device and browser information
  deviceType: deviceType("device_type"),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  operatingSystem: text("operating_system"),
  screenResolution: text("screen_resolution"),
  userAgent: text("user_agent"),
  
  // Geographic information
  country: text("country"),
  region: text("region"),
  city: text("city"),
  ipAddress: text("ip_address"),
  timezone: text("timezone"),
  
  // Page and referrer information
  pageUrl: text("page_url"),
  pageTitle: text("page_title"),
  referrerUrl: text("referrer_url"),
  trafficSource: trafficSource("traffic_source"),
  
  // Product and commerce information
  productId: integer("product_id"), // Reference to Product Service
  productName: text("product_name"),
  productCategory: text("product_category"),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }),
  orderId: integer("order_id"), // Reference to Order Service
  
  // Custom dimensions and metrics
  customDimensions: jsonb("custom_dimensions"),
  customMetrics: jsonb("custom_metrics"),
  
  // Bangladesh-specific fields
  mobileOperator: text("mobile_operator"),
  networkType: text("network_type"),
  connectionSpeed: text("connection_speed"),
  
  // Timestamps
  eventTime: timestamp("event_time").notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    eventTypeIdx: index('events_event_type_idx').on(table.eventType),
    userIdIdx: index('events_user_id_idx').on(table.userId),
    sessionIdIdx: index('events_session_id_idx').on(table.sessionId),
    eventTimeIdx: index('events_event_time_idx').on(table.eventTime),
    productIdIdx: index('events_product_id_idx').on(table.productId),
    orderIdIdx: index('events_order_id_idx').on(table.orderId),
    deviceTypeIdx: index('events_device_type_idx').on(table.deviceType),
    countryIdx: index('events_country_idx').on(table.country),
    trafficSourceIdx: index('events_traffic_source_idx').on(table.trafficSource),
    createdAtIdx: index('events_created_at_idx').on(table.createdAt),
  };
});

// User behavior aggregations for performance
export const userBehavior = pgTable("user_behavior", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // User identification
  userId: integer("user_id").notNull(), // Reference to User Service
  sessionId: text("session_id"),
  
  // Behavioral metrics
  pageViews: integer("page_views").default(0),
  timeOnSite: integer("time_on_site").default(0), // in seconds
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }),
  pagesPerSession: decimal("pages_per_session", { precision: 5, scale: 2 }),
  
  // Commerce behavior
  productsViewed: integer("products_viewed").default(0),
  cartAdditions: integer("cart_additions").default(0),
  purchasesCompleted: integer("purchases_completed").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default('0'),
  
  // Engagement metrics
  clicksCount: integer("clicks_count").default(0),
  scrollDepth: decimal("scroll_depth", { precision: 5, scale: 2 }),
  videosWatched: integer("videos_watched").default(0),
  searchesPerformed: integer("searches_performed").default(0),
  
  // Device preferences
  preferredDevice: deviceType("preferred_device"),
  preferredBrowser: text("preferred_browser"),
  
  // Geographic patterns
  mostCommonCountry: text("most_common_country"),
  mostCommonCity: text("most_common_city"),
  
  // Bangladesh-specific behavior
  mobileBankingUsage: jsonb("mobile_banking_usage"),
  culturalEventEngagement: jsonb("cultural_event_engagement"),
  
  // Time aggregation
  aggregationDate: timestamp("aggregation_date").notNull(),
  firstEventAt: timestamp("first_event_at"),
  lastEventAt: timestamp("last_event_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('user_behavior_user_id_idx').on(table.userId),
    sessionIdIdx: index('user_behavior_session_id_idx').on(table.sessionId),
    aggregationDateIdx: index('user_behavior_aggregation_date_idx').on(table.aggregationDate),
    totalSpentIdx: index('user_behavior_total_spent_idx').on(table.totalSpent),
    pageViewsIdx: index('user_behavior_page_views_idx').on(table.pageViews),
    purchasesIdx: index('user_behavior_purchases_idx').on(table.purchasesCompleted),
  };
});

// Product analytics for business intelligence
export const productAnalytics = pgTable("product_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Product identification
  productId: integer("product_id").notNull(), // Reference to Product Service
  productName: text("product_name"),
  productCategory: text("product_category"),
  vendorId: integer("vendor_id"), // Reference to User Service
  
  // View metrics
  totalViews: bigint("total_views", { mode: "number" }).default(0),
  uniqueViews: integer("unique_views").default(0),
  averageViewDuration: decimal("average_view_duration", { precision: 10, scale: 2 }),
  
  // Engagement metrics
  addToCartCount: integer("add_to_cart_count").default(0),
  wishlistCount: integer("wishlist_count").default(0),
  shareCount: integer("share_count").default(0),
  reviewCount: integer("review_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  
  // Conversion metrics
  purchaseCount: integer("purchase_count").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default('0'),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
  
  // Search metrics
  searchImpressions: integer("search_impressions").default(0),
  searchClicks: integer("search_clicks").default(0),
  searchRank: decimal("search_rank", { precision: 5, scale: 2 }),
  
  // Bangladesh-specific metrics
  mobileViews: integer("mobile_views").default(0),
  desktopViews: integer("desktop_views").default(0),
  localPopularity: decimal("local_popularity", { precision: 5, scale: 2 }),
  
  // Time aggregation
  aggregationDate: timestamp("aggregation_date").notNull(),
  aggregationPeriod: text("aggregation_period"), // daily, weekly, monthly
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    productIdIdx: index('product_analytics_product_id_idx').on(table.productId),
    vendorIdIdx: index('product_analytics_vendor_id_idx').on(table.vendorId),
    aggregationDateIdx: index('product_analytics_aggregation_date_idx').on(table.aggregationDate),
    totalViewsIdx: index('product_analytics_total_views_idx').on(table.totalViews),
    revenueIdx: index('product_analytics_revenue_idx').on(table.revenue),
    conversionRateIdx: index('product_analytics_conversion_rate_idx').on(table.conversionRate),
    categoryIdx: index('product_analytics_category_idx').on(table.productCategory),
  };
});

// System performance metrics
export const systemMetrics = pgTable("system_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Metric identification
  metricName: text("metric_name").notNull(),
  metricType: text("metric_type").notNull(), // counter, gauge, histogram, summary
  service: text("service"),
  
  // Metric values
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  count: bigint("count", { mode: "number" }),
  sum: decimal("sum", { precision: 20, scale: 6 }),
  min: decimal("min", { precision: 20, scale: 6 }),
  max: decimal("max", { precision: 20, scale: 6 }),
  avg: decimal("avg", { precision: 20, scale: 6 }),
  
  // Labels and dimensions
  labels: jsonb("labels"),
  dimensions: jsonb("dimensions"),
  
  // Timestamps
  metricTime: timestamp("metric_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    metricNameIdx: index('system_metrics_metric_name_idx').on(table.metricName),
    serviceIdx: index('system_metrics_service_idx').on(table.service),
    metricTimeIdx: index('system_metrics_metric_time_idx').on(table.metricTime),
    metricTypeIdx: index('system_metrics_metric_type_idx').on(table.metricType),
    valueIdx: index('system_metrics_value_idx').on(table.value),
  };
});

// ================================
// ANALYTICS SERVICE RELATIONS
// ================================

export const userBehaviorRelations = relations(userBehavior, ({ many }) => ({
  events: many(events),
}));

export const productAnalyticsRelations = relations(productAnalytics, ({ many }) => ({
  events: many(events),
}));

// ================================
// ANALYTICS SERVICE TYPES
// ================================

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type UserBehavior = typeof userBehavior.$inferSelect;
export type NewUserBehavior = typeof userBehavior.$inferInsert;
export type ProductAnalytics = typeof productAnalytics.$inferSelect;
export type NewProductAnalytics = typeof productAnalytics.$inferInsert;
export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type NewSystemMetrics = typeof systemMetrics.$inferInsert;

// ================================
// ANALYTICS SERVICE ZOD SCHEMAS
// ================================

export const insertEventSchema = createInsertSchema(events);
export const insertUserBehaviorSchema = createInsertSchema(userBehavior);
export const insertProductAnalyticsSchema = createInsertSchema(productAnalytics);
export const insertSystemMetricsSchema = createInsertSchema(systemMetrics);

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;
export type InsertProductAnalytics = z.infer<typeof insertProductAnalyticsSchema>;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;