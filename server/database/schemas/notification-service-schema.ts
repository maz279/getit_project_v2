/**
 * Notification Service Database Schema - Phase 1 Week 2
 * MongoDB-style flexible schema for notifications using PostgreSQL JSONB
 * 
 * @fileoverview Notification service database schema with flexible document structure
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
  uuid,
  jsonb,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ================================
// NOTIFICATION SERVICE ENUMS
// ================================

export const notificationType = pgEnum('notification_type', [
  'email', 'sms', 'push', 'in_app', 'webhook', 'mobile_banking', 'voice_call'
]);

export const notificationStatus = pgEnum('notification_status', [
  'pending', 'sent', 'delivered', 'failed', 'cancelled', 'scheduled'
]);

export const notificationPriority = pgEnum('notification_priority', [
  'low', 'normal', 'high', 'urgent', 'critical'
]);

export const templateType = pgEnum('template_type', [
  'transactional', 'promotional', 'system', 'cultural', 'emergency'
]);

export const channelType = pgEnum('channel_type', [
  'email', 'sms', 'push', 'in_app', 'bkash', 'nagad', 'rocket', 'whatsapp'
]);

// ================================
// NOTIFICATION SERVICE CORE TABLES
// ================================

// Notifications table for all notification records
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Recipient information
  userId: integer("user_id"), // Reference to User Service
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  recipientDeviceToken: text("recipient_device_token"),
  
  // Notification details
  type: notificationType("type").notNull(),
  status: notificationStatus("status").default('pending'),
  priority: notificationPriority("priority").default('normal'),
  
  // Content
  subject: text("subject"),
  title: text("title"),
  message: text("message").notNull(),
  content: jsonb("content"), // Rich content with HTML, images, etc.
  
  // Template and localization
  templateId: uuid("template_id"),
  language: text("language").default('en'),
  culturalContext: jsonb("cultural_context"),
  
  // Channel-specific data
  channelType: channelType("channel_type").notNull(),
  channelData: jsonb("channel_data"), // Channel-specific configuration
  
  // Delivery tracking
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  clickedAt: timestamp("clicked_at"),
  
  // Failure handling
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  expiresAt: timestamp("expires_at"),
  
  // Metadata
  metadata: jsonb("metadata"),
  tags: jsonb("tags"),
  
  // Bangladesh-specific fields
  mobileBankingProvider: text("mobile_banking_provider"),
  mobileBankingTransactionId: text("mobile_banking_transaction_id"),
  culturalEventId: text("cultural_event_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    typeIdx: index('notifications_type_idx').on(table.type),
    statusIdx: index('notifications_status_idx').on(table.status),
    priorityIdx: index('notifications_priority_idx').on(table.priority),
    channelTypeIdx: index('notifications_channel_type_idx').on(table.channelType),
    templateIdIdx: index('notifications_template_id_idx').on(table.templateId),
    scheduledForIdx: index('notifications_scheduled_for_idx').on(table.scheduledFor),
    sentAtIdx: index('notifications_sent_at_idx').on(table.sentAt),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
    recipientEmailIdx: index('notifications_recipient_email_idx').on(table.recipientEmail),
    recipientPhoneIdx: index('notifications_recipient_phone_idx').on(table.recipientPhone),
  };
});

// Notification templates for reusable content
export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Template identification
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: templateType("type").notNull(),
  
  // Template content
  subject: text("subject"),
  title: text("title"),
  content: jsonb("content").notNull(), // Template with variables
  
  // Localization
  language: text("language").default('en'),
  translations: jsonb("translations"), // Multi-language support
  
  // Channel configuration
  supportedChannels: jsonb("supported_channels"), // Array of supported channels
  channelConfigurations: jsonb("channel_configurations"), // Channel-specific settings
  
  // Template variables
  variables: jsonb("variables"), // Template variable definitions
  defaultValues: jsonb("default_values"), // Default values for variables
  
  // Bangladesh-specific fields
  bengaliContent: jsonb("bengali_content"),
  culturalAdaptations: jsonb("cultural_adaptations"),
  
  // Status and versioning
  isActive: boolean("is_active").default(true),
  version: integer("version").default(1),
  
  // Metadata
  description: text("description"),
  tags: jsonb("tags"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    slugIdx: index('notification_templates_slug_idx').on(table.slug),
    typeIdx: index('notification_templates_type_idx').on(table.type),
    languageIdx: index('notification_templates_language_idx').on(table.language),
    activeIdx: index('notification_templates_active_idx').on(table.isActive),
    versionIdx: index('notification_templates_version_idx').on(table.version),
  };
});

// Notification preferences for users
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // User identification
  userId: integer("user_id").notNull(), // Reference to User Service
  
  // Channel preferences
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  inAppEnabled: boolean("in_app_enabled").default(true),
  mobileBankingEnabled: boolean("mobile_banking_enabled").default(true),
  
  // Notification type preferences
  transactionalEnabled: boolean("transactional_enabled").default(true),
  promotionalEnabled: boolean("promotional_enabled").default(true),
  systemEnabled: boolean("system_enabled").default(true),
  culturalEnabled: boolean("cultural_enabled").default(true),
  
  // Timing preferences
  quietHoursStart: text("quiet_hours_start").default('22:00'),
  quietHoursEnd: text("quiet_hours_end").default('08:00'),
  timezone: text("timezone").default('Asia/Dhaka'),
  
  // Frequency preferences
  frequency: jsonb("frequency"), // Frequency settings per notification type
  
  // Bangladesh-specific preferences
  prayerTimeNotifications: boolean("prayer_time_notifications").default(false),
  festivalNotifications: boolean("festival_notifications").default(true),
  mobileBankingAlerts: boolean("mobile_banking_alerts").default(true),
  
  // Language preferences
  preferredLanguage: text("preferred_language").default('en'),
  fallbackLanguage: text("fallback_language").default('en'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('notification_preferences_user_id_idx').on(table.userId),
    emailEnabledIdx: index('notification_preferences_email_enabled_idx').on(table.emailEnabled),
    smsEnabledIdx: index('notification_preferences_sms_enabled_idx').on(table.smsEnabled),
    pushEnabledIdx: index('notification_preferences_push_enabled_idx').on(table.pushEnabled),
    languageIdx: index('notification_preferences_language_idx').on(table.preferredLanguage),
  };
});

// Notification campaigns for bulk messaging
export const notificationCampaigns = pgTable("notification_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Campaign identification
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  
  // Campaign content
  templateId: uuid("template_id").references(() => notificationTemplates.id),
  subject: text("subject"),
  content: jsonb("content"),
  
  // Targeting
  targetAudience: jsonb("target_audience"), // Audience criteria
  estimatedRecipients: integer("estimated_recipients"),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  timeZone: text("time_zone").default('Asia/Dhaka'),
  
  // Status
  status: notificationStatus("status").default('pending'),
  
  // Results
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  failedCount: integer("failed_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  
  // Bangladesh-specific targeting
  culturalSegments: jsonb("cultural_segments"),
  mobileBankingUsers: boolean("mobile_banking_users").default(false),
  
  // Metadata
  createdBy: integer("created_by"), // Reference to User Service
  tags: jsonb("tags"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    slugIdx: index('notification_campaigns_slug_idx').on(table.slug),
    templateIdIdx: index('notification_campaigns_template_id_idx').on(table.templateId),
    statusIdx: index('notification_campaigns_status_idx').on(table.status),
    scheduledForIdx: index('notification_campaigns_scheduled_for_idx').on(table.scheduledFor),
    createdByIdx: index('notification_campaigns_created_by_idx').on(table.createdBy),
  };
});

// ================================
// NOTIFICATION SERVICE RELATIONS
// ================================

export const notificationRelations = relations(notifications, ({ one }) => ({
  template: one(notificationTemplates, {
    fields: [notifications.templateId],
    references: [notificationTemplates.id],
  }),
}));

export const notificationTemplateRelations = relations(notificationTemplates, ({ many }) => ({
  notifications: many(notifications),
  campaigns: many(notificationCampaigns),
}));

export const notificationCampaignRelations = relations(notificationCampaigns, ({ one }) => ({
  template: one(notificationTemplates, {
    fields: [notificationCampaigns.templateId],
    references: [notificationTemplates.id],
  }),
}));

// ================================
// NOTIFICATION SERVICE TYPES
// ================================

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
export type NotificationCampaign = typeof notificationCampaigns.$inferSelect;
export type NewNotificationCampaign = typeof notificationCampaigns.$inferInsert;

// ================================
// NOTIFICATION SERVICE ZOD SCHEMAS
// ================================

export const insertNotificationSchema = createInsertSchema(notifications);
export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates);
export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences);
export const insertNotificationCampaignSchema = createInsertSchema(notificationCampaigns);

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type InsertNotificationCampaign = z.infer<typeof insertNotificationCampaignSchema>;