/**
 * Enterprise Search Service Database Schema
 * Amazon.com/Shopee.sg-Level Search Infrastructure
 * Comprehensive schema for advanced search capabilities
 */

import { pgTable, bigserial, text, varchar, integer, decimal, timestamp, jsonb, boolean, vector, index } from 'drizzle-orm/pg-core';
// Note: This file defines search-specific tables to be imported by the main schema
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ===== SEARCH QUERIES TABLE =====
// Advanced query tracking and analytics
export const searchQueries = pgTable('search_queries', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: integer('user_id').references(() => users.id),
  queryText: text('query_text').notNull(),
  queryType: varchar('query_type', { length: 50 }).default('text'), // text, voice, image, filter
  language: varchar('language', { length: 10 }).default('en'),
  filters: jsonb('filters'),
  resultsCount: integer('results_count'),
  responseTimeMs: integer('response_time_ms'),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow(),
  sessionId: varchar('session_id', { length: 100 }),
  deviceType: varchar('device_type', { length: 50 }),
  locationData: jsonb('location_data'),
}, (table) => ({
  userTimeIdx: index('idx_search_queries_user_time').on(table.userId, table.createdAt),
  queryTextIdx: index('idx_search_queries_text').on(table.queryText),
  queryTypeIdx: index('idx_search_queries_type').on(table.queryType),
  languageIdx: index('idx_search_queries_language').on(table.language),
}));

// ===== SEARCH RESULTS TABLE =====
// Result caching and optimization tracking
export const searchResults = pgTable('search_results', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  queryId: integer('query_id').references(() => searchQueries.id),
  productId: integer('product_id').references(() => products.id),
  rankPosition: integer('rank_position'),
  relevanceScore: decimal('relevance_score', { precision: 8, scale: 4 }),
  clickThroughRate: decimal('click_through_rate', { precision: 5, scale: 4 }),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  personalizationScore: decimal('personalization_score', { precision: 8, scale: 4 }),
  cachedUntil: timestamp('cached_until'),
  resultMetadata: jsonb('result_metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  queryProductIdx: index('idx_search_results_query_product').on(table.queryId, table.productId),
  relevanceIdx: index('idx_search_results_relevance').on(table.relevanceScore),
  rankPositionIdx: index('idx_search_results_rank').on(table.rankPosition),
  personalizationIdx: index('idx_search_results_personalization').on(table.personalizationScore),
}));

// ===== SEARCH ANALYTICS TABLE =====
// Performance intelligence and metrics
export const searchAnalytics = pgTable('search_analytics', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  date: timestamp('date').notNull(),
  totalSearches: integer('total_searches').default(0),
  uniqueUsers: integer('unique_users').default(0),
  avgResponseTimeMs: decimal('avg_response_time_ms', { precision: 8, scale: 2 }),
  zeroResultRate: decimal('zero_result_rate', { precision: 5, scale: 4 }),
  clickThroughRate: decimal('click_through_rate', { precision: 5, scale: 4 }),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  topQueries: jsonb('top_queries'),
  topFilters: jsonb('top_filters'),
  performanceMetrics: jsonb('performance_metrics'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('idx_search_analytics_date').on(table.date),
  totalSearchesIdx: index('idx_search_analytics_searches').on(table.totalSearches),
  ctrIdx: index('idx_search_analytics_ctr').on(table.clickThroughRate),
}));

// ===== USER SEARCH BEHAVIOR TABLE =====
// Personalization foundation and user preferences
export const userSearchBehavior = pgTable('user_search_behavior', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  categoryPreferences: jsonb('category_preferences'),
  searchPatterns: jsonb('search_patterns'),
  clickPatterns: jsonb('click_patterns'),
  purchasePatterns: jsonb('purchase_patterns'),
  languagePreference: varchar('language_preference', { length: 10 }).default('en'),
  devicePreferences: jsonb('device_preferences'),
  timePatterns: jsonb('time_patterns'),
  culturalPreferences: jsonb('cultural_preferences'), // Bangladesh-specific
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('idx_user_search_behavior_user').on(table.userId),
  languageIdx: index('idx_user_search_behavior_language').on(table.languagePreference),
  lastUpdatedIdx: index('idx_user_search_behavior_updated').on(table.lastUpdated),
}));

// ===== SEARCH SUGGESTIONS TABLE =====
// Autocomplete intelligence and trending queries
export const searchSuggestions = pgTable('search_suggestions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  suggestionText: text('suggestion_text').notNull(),
  category: varchar('category', { length: 100 }),
  popularityScore: integer('popularity_score').default(0),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  language: varchar('language', { length: 10 }).default('en'),
  isTrending: boolean('is_trending').default(false),
  isPopular: boolean('is_popular').default(false),
  userSegment: varchar('user_segment', { length: 50 }),
  culturalRelevance: jsonb('cultural_relevance'), // Bangladesh context
  createdAt: timestamp('created_at').defaultNow(),
  lastUsed: timestamp('last_used'),
}, (table) => ({
  suggestionTextIdx: index('idx_search_suggestions_text').on(table.suggestionText),
  popularityIdx: index('idx_search_suggestions_popularity').on(table.popularityScore),
  categoryIdx: index('idx_search_suggestions_category').on(table.category),
  languageIdx: index('idx_search_suggestions_language').on(table.language),
  trendingIdx: index('idx_search_suggestions_trending').on(table.isTrending),
}));

// ===== VISUAL SEARCH DATA TABLE =====
// Image/video search metadata and AI processing
export const visualSearchData = pgTable('visual_search_data', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  imageUrl: text('image_url').notNull(),
  imageHash: varchar('image_hash', { length: 64 }),
  extractedFeatures: jsonb('extracted_features'),
  colorPalette: jsonb('color_palette'),
  detectedObjects: jsonb('detected_objects'),
  textContent: text('text_content'),
  similarityVectors: vector('similarity_vectors', { dimensions: 512 }),
  productMatches: jsonb('product_matches'),
  confidenceScore: decimal('confidence_score', { precision: 5, scale: 4 }),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  aiModelVersion: varchar('ai_model_version', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  imageHashIdx: index('idx_visual_search_hash').on(table.imageHash),
  confidenceIdx: index('idx_visual_search_confidence').on(table.confidenceScore),
  statusIdx: index('idx_visual_search_status').on(table.processingStatus),
  vectorsIdx: index('idx_visual_search_vectors').on(table.similarityVectors),
}));

// ===== SEARCH PERFORMANCE METRICS TABLE =====
// Real-time performance monitoring and optimization
export const searchPerformanceMetrics = pgTable('search_performance_metrics', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  endpoint: varchar('endpoint', { length: 100 }),
  responseTimeMs: integer('response_time_ms'),
  queryComplexity: integer('query_complexity'),
  resultsCount: integer('results_count'),
  cacheHitRate: decimal('cache_hit_rate', { precision: 5, scale: 4 }),
  errorRate: decimal('error_rate', { precision: 5, scale: 4 }),
  throughput: integer('throughput'), // requests per second
  memoryUsage: integer('memory_usage'), // MB
  cpuUsage: decimal('cpu_usage', { precision: 5, scale: 2 }),
  userSatisfactionScore: decimal('user_satisfaction_score', { precision: 3, scale: 2 }),
}, (table) => ({
  timestampIdx: index('idx_search_performance_timestamp').on(table.timestamp),
  endpointIdx: index('idx_search_performance_endpoint').on(table.endpoint),
  responseTimeIdx: index('idx_search_performance_response').on(table.responseTimeMs),
}));

// ===== ZOD SCHEMAS FOR VALIDATION =====

// Search Queries Schema
export const insertSearchQuerySchema = createInsertSchema(searchQueries, {
  queryText: z.string().min(1).max(1000),
  queryType: z.enum(['text', 'voice', 'image', 'filter']).default('text'),
  language: z.string().length(2).default('en'),
  filters: z.record(z.any()).optional(),
  resultsCount: z.number().min(0).optional(),
  responseTimeMs: z.number().min(0).optional(),
  conversionRate: z.number().min(0).max(1).optional(),
  sessionId: z.string().max(100).optional(),
  deviceType: z.string().max(50).optional(),
  locationData: z.record(z.any()).optional(),
});

export const selectSearchQuerySchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
  queryText: z.string(),
  queryType: z.string(),
  language: z.string(),
  filters: z.record(z.any()).nullable(),
  resultsCount: z.number().nullable(),
  responseTimeMs: z.number().nullable(),
  conversionRate: z.string().nullable(),
  createdAt: z.date().nullable(),
  sessionId: z.string().nullable(),
  deviceType: z.string().nullable(),
  locationData: z.record(z.any()).nullable(),
});

// Search Suggestions Schema
export const insertSearchSuggestionSchema = createInsertSchema(searchSuggestions, {
  suggestionText: z.string().min(1).max(500),
  category: z.string().max(100).optional(),
  popularityScore: z.number().min(0).default(0),
  conversionRate: z.number().min(0).max(1).optional(),
  language: z.string().length(2).default('en'),
  isTrending: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  userSegment: z.string().max(50).optional(),
  culturalRelevance: z.record(z.any()).optional(),
});

// Visual Search Schema
export const insertVisualSearchSchema = createInsertSchema(visualSearchData, {
  imageUrl: z.string().url(),
  imageHash: z.string().max(64).optional(),
  extractedFeatures: z.record(z.any()).optional(),
  colorPalette: z.array(z.string()).optional(),
  detectedObjects: z.array(z.record(z.any())).optional(),
  textContent: z.string().optional(),
  productMatches: z.array(z.record(z.any())).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  aiModelVersion: z.string().max(20).optional(),
});

// User Search Behavior Schema
export const insertUserSearchBehaviorSchema = createInsertSchema(userSearchBehavior, {
  userId: z.number().positive(),
  categoryPreferences: z.record(z.number()).optional(),
  searchPatterns: z.record(z.any()).optional(),
  clickPatterns: z.record(z.any()).optional(),
  purchasePatterns: z.record(z.any()).optional(),
  languagePreference: z.string().length(2).default('en'),
  devicePreferences: z.record(z.any()).optional(),
  timePatterns: z.record(z.any()).optional(),
  culturalPreferences: z.record(z.any()).optional(),
});

// Performance Metrics Schema
export const insertSearchPerformanceSchema = createInsertSchema(searchPerformanceMetrics, {
  endpoint: z.string().max(100),
  responseTimeMs: z.number().min(0),
  queryComplexity: z.number().min(1).max(10),
  resultsCount: z.number().min(0),
  cacheHitRate: z.number().min(0).max(1),
  errorRate: z.number().min(0).max(1),
  throughput: z.number().min(0),
  memoryUsage: z.number().min(0),
  cpuUsage: z.number().min(0).max(100),
  userSatisfactionScore: z.number().min(0).max(10),
});

// TypeScript Types
export type SearchQuery = z.infer<typeof selectSearchQuerySchema>;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type SearchSuggestion = typeof searchSuggestions.$inferSelect;
export type InsertSearchSuggestion = z.infer<typeof insertSearchSuggestionSchema>;
export type VisualSearchData = typeof visualSearchData.$inferSelect;
export type InsertVisualSearchData = z.infer<typeof insertVisualSearchSchema>;
export type UserSearchBehavior = typeof userSearchBehavior.$inferSelect;
export type InsertUserSearchBehavior = z.infer<typeof insertUserSearchBehaviorSchema>;
export type SearchPerformanceMetric = typeof searchPerformanceMetrics.$inferSelect;
export type InsertSearchPerformanceMetric = z.infer<typeof insertSearchPerformanceSchema>;

// Export all tables for database migrations
export {
  searchQueries,
  searchResults,
  searchAnalytics,
  userSearchBehavior,
  searchSuggestions,
  visualSearchData,
  searchPerformanceMetrics
};