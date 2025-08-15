import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, real, index, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enhanced users schema for Phase 3 Authentication
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Changed to text to support custom IDs
  name: text('name').notNull(), // Full name instead of separate first/last
  username: text('username'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  phoneNumber: text('phone_number'), // Support both phone fields for compatibility
  role: text('role').notNull().default('customer'), // customer, vendor, admin
  city: text('city'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  preferences: jsonb('preferences'),
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  socialProvider: text('social_provider'), // google, facebook, apple
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id'),
  categoryId: uuid('category_id'),
  name: text('name').notNull(),
  nameBn: text('name_bn'),
  description: text('description'),
  descriptionBn: text('description_bn'),
  price: real('price').notNull(),
  comparePrice: real('compare_price'),
  costPrice: real('cost_price'),
  sku: text('sku'),
  barcode: text('barcode'),
  inventory: integer('inventory').default(0),
  minInventory: integer('min_inventory'),
  weight: real('weight'),
  dimensions: text('dimensions'), // jsonb in DB but simplified for now
  images: text('images'), // jsonb in DB but simplified for now
  tags: text('tags'), // jsonb in DB but simplified for now
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  shortDescription: text('short_description'),
  discountPercentage: real('discount_percentage'),
  maxInventory: integer('max_inventory'),
  videos: text('videos'), // jsonb in DB but simplified for now
  specifications: text('specifications'), // jsonb in DB but simplified for now
  features: text('features'), // jsonb in DB but simplified for now
  brand: text('brand'),
  model: text('model'),
  color: text('color'),
  size: text('size'),
  material: text('material'),
  warranty: text('warranty'),
  origin: text('origin'),
  hsCode: text('hs_code'),
  seoKeywords: text('seo_keywords'), // jsonb in DB but simplified for now
  metaTags: text('meta_tags'), // jsonb in DB but simplified for now
  rating: real('rating'),
  reviewCount: integer('review_count'),
  soldCount: integer('sold_count'),
  viewCount: integer('view_count'),
  wishlistCount: integer('wishlist_count'),
  isDigital: boolean('is_digital'),
  requiresShipping: boolean('requires_shipping'),
  isTaxable: boolean('is_taxable'),
  status: text('status'),
  publishedAt: timestamp('published_at'),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nameBn: text('name_bn'),
  slug: text('slug').unique(),
  imageUrl: text('image_url'),
  parentId: uuid('parent_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Enhanced Vendor Registration System (Amazon.com/Shopee.sg Standards)
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Comprehensive Vendor Applications Table
export const vendorApplications = pgTable('vendor_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  applicationNumber: text('application_number').notNull().unique(),
  
  // Basic Information
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  nidNumber: text('nid_number').notNull(),
  businessName: text('business_name').notNull(),
  businessType: text('business_type').notNull(),
  businessCategory: text('business_category').notNull(),
  yearsInBusiness: text('years_in_business'),
  businessDescription: text('business_description'),
  
  // Address Information
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  area: text('area').notNull(),
  streetAddress: text('street_address').notNull(),
  postalCode: text('postal_code').notNull(),
  sameAsPickup: boolean('same_as_pickup').default(false),
  multipleLocations: boolean('multiple_locations').default(false),
  
  // Business Verification
  hasTradeLicense: boolean('has_trade_license').default(false),
  tradeLicenseNumber: text('trade_license_number'),
  issuingAuthority: text('issuing_authority'),
  licenseIssueDate: text('license_issue_date'),
  licenseExpiryDate: text('license_expiry_date'),
  businessActivities: text('business_activities').array(),
  tinNumber: text('tin_number'),
  tinType: text('tin_type'),
  issuingCircle: text('issuing_circle'),
  
  // Bank Details
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountHolderName: text('account_holder_name').notNull(),
  branchName: text('branch_name').notNull(),
  accountType: text('account_type').notNull(),
  
  // Business Operations
  monthlySalesVolume: text('monthly_sales_volume'),
  expectedProductCount: text('expected_product_count'),
  businessModel: text('business_model').array(),
  targetCustomers: text('target_customers').array(),
  facebookPage: text('facebook_page'),
  website: text('website'),
  otherPlatforms: text('other_platforms'),
  
  // Store Setup
  storeName: text('store_name'),
  storeDescription: text('store_description'),
  storeCategory: text('store_category'),
  vendorType: text('vendor_type'),
  languagePreference: text('language_preference'),
  
  // Application Status
  status: text('status').notNull().default('pending'), // pending, under_review, approved, rejected
  currentStep: integer('current_step').default(1),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  adminNotes: text('admin_notes'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('vendor_app_email_idx').on(table.email),
  statusIdx: index('vendor_app_status_idx').on(table.status),
  submittedIdx: index('vendor_app_submitted_idx').on(table.submittedAt),
  businessNameIdx: index('vendor_app_business_name_idx').on(table.businessName),
}));

// Vendor Documents Table
export const vendorDocuments = pgTable('vendor_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').references(() => vendorApplications.id),
  documentType: text('document_type').notNull(), // nid_front, nid_back, trade_license, tin_certificate, bank_statement, address_proof
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  fileType: text('file_type'),
  fileUrl: text('file_url').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  verificationStatus: text('verification_status').default('pending'), // pending, verified, rejected
  verifiedAt: timestamp('verified_at'),
  verifiedBy: integer('verified_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
}, (table) => ({
  applicationIdx: index('vendor_doc_application_idx').on(table.applicationId),
  typeIdx: index('vendor_doc_type_idx').on(table.documentType),
  statusIdx: index('vendor_doc_status_idx').on(table.verificationStatus),
}));

// Vendor Application Status History
export const vendorApplicationStatusHistory = pgTable('vendor_application_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').references(() => vendorApplications.id),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  changedBy: integer('changed_by').references(() => users.id),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  applicationIdx: index('vendor_status_history_application_idx').on(table.applicationId),
  statusIdx: index('vendor_status_history_status_idx').on(table.newStatus),
}));

// Vendor Profiles (After Approval)
export const vendorProfiles = pgTable('vendor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  applicationId: uuid('application_id').references(() => vendorApplications.id),
  userId: integer('user_id').references(() => users.id),
  
  // Profile Information
  profileComplete: boolean('profile_complete').default(false),
  storeLogo: text('store_logo'),
  storeBanner: text('store_banner'),
  storeDescription: text('store_description'),
  businessHours: jsonb('business_hours'),
  socialLinks: jsonb('social_links'),
  
  // Performance Metrics
  rating: real('rating').default(0),
  totalOrders: integer('total_orders').default(0),
  totalRevenue: real('total_revenue').default(0),
  successRate: real('success_rate').default(0),
  responseTime: real('response_time').default(0),
  
  // Status
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  subscriptionPlan: text('subscription_plan').default('basic'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  vendorIdx: index('vendor_profile_vendor_idx').on(table.vendorId),
  userIdx: index('vendor_profile_user_idx').on(table.userId),
  activeIdx: index('vendor_profile_active_idx').on(table.isActive),
}));

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  total: real('total').notNull(),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Additional e-commerce tables
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').default(1),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  status: text('status').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  trackingNumber: text('tracking_number'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shipmentTracking = pgTable('shipment_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').references(() => shipments.id),
  location: text('location'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  amount: real('amount').notNull(),
  method: text('method'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderReturns = pgTable('order_returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id),
  reason: text('reason'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userBehaviors = pgTable('user_behaviors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  action: text('action'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  sessionToken: text('session_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Search Schema
export const aiSearchQueries = pgTable('ai_search_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  query: text('query').notNull(),
  queryType: text('query_type').notNull(), // 'text', 'voice', 'image', 'conversational'
  language: text('language').default('en'),
  userId: text('user_id'),
  searchContext: jsonb('search_context'),
  nlpAnalysis: jsonb('nlp_analysis'),
  mlEnhancements: jsonb('ml_enhancements'),
  results: jsonb('results'),
  responseTime: integer('response_time'),
  searchScore: real('search_score'),
  timestamp: timestamp('timestamp').defaultNow(),
}, (table) => ({
  queryIdx: index('query_idx').on(table.query),
  userIdx: index('user_idx').on(table.userId),
  typeIdx: index('type_idx').on(table.queryType),
  timestampIdx: index('timestamp_idx').on(table.timestamp),
}));

// Search Analytics Schema
export const searchAnalytics = pgTable('search_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  queryId: uuid('query_id').references(() => aiSearchQueries.id),
  userId: text('user_id'),
  searchIntent: text('search_intent'),
  searchCategory: text('search_category'),
  resultsCount: integer('results_count'),
  clickedResults: jsonb('clicked_results'),
  conversionRate: real('conversion_rate'),
  satisfactionScore: real('satisfaction_score'),
  timestamp: timestamp('timestamp').defaultNow(),
}, (table) => ({
  queryIdx: index('analytics_query_idx').on(table.queryId),
  userIdx: index('analytics_user_idx').on(table.userId),
  intentIdx: index('intent_idx').on(table.searchIntent),
}));

// AI Knowledge Base Schema
export const aiKnowledgeBase = pgTable('ai_knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentType: text('content_type').notNull(), // 'product', 'page', 'menu', 'faq', 'documentation'
  title: text('title').notNull(),
  content: text('content').notNull(),
  keywords: text('keywords').array(),
  embeddings: jsonb('embeddings'),
  categories: text('categories').array(),
  language: text('language').default('en'),
  metadata: jsonb('metadata'),
  isActive: boolean('is_active').default(true),
  searchScore: real('search_score').default(0),
  timestamp: timestamp('timestamp').defaultNow(),
}, (table) => ({
  contentIdx: index('content_idx').on(table.contentType),
  titleIdx: index('title_idx').on(table.title),
  keywordsIdx: index('keywords_idx').on(table.keywords),
  activeIdx: index('active_idx').on(table.isActive),
}));

// User Search Preferences Schema
export const userSearchPreferences = pgTable('user_search_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  searchHistory: jsonb('search_history'),
  preferredLanguage: text('preferred_language').default('en'),
  searchFilters: jsonb('search_filters'),
  personalizedKeywords: text('personalized_keywords').array(),
  searchBehavior: jsonb('search_behavior'),
  mlPersonalization: jsonb('ml_personalization'),
  timestamp: timestamp('timestamp').defaultNow(),
}, (table) => ({
  userIdx: index('user_pref_idx').on(table.userId),
}));

// Fraud Detection Logs Schema
export const fraudDetectionLogs = pgTable('fraud_detection_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id),
  transactionId: uuid('transaction_id'),
  action: text('action').notNull(), // allow, review, block, alert
  riskScore: real('risk_score').notNull(),
  riskLevel: text('risk_level').notNull(), // low, medium, high, critical
  riskFactors: jsonb('risk_factors'),
  recommendation: text('recommendation'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('fraud_logs_user_idx').on(table.userId),
  actionIdx: index('fraud_logs_action_idx').on(table.action),
  riskLevelIdx: index('fraud_logs_risk_level_idx').on(table.riskLevel),
  createdAtIdx: index('fraud_logs_created_at_idx').on(table.createdAt),
}));

// Insert schemas for existing e-commerce - Enhanced for Phase 3 Authentication
export const insertUserSchema = createInsertSchema(users, {
  id: z.string().optional(), // Make ID optional for auto-generation
  username: z.string().optional(), // Make username optional
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.string().default('customer'),
});
export const insertProductSchema = createInsertSchema(products);
export const insertCategorySchema = createInsertSchema(categories);
export const insertVendorSchema = createInsertSchema(vendors);
export const insertVendorApplicationSchema = createInsertSchema(vendorApplications);
export const insertVendorDocumentSchema = createInsertSchema(vendorDocuments);
export const insertVendorApplicationStatusHistorySchema = createInsertSchema(vendorApplicationStatusHistory);
export const insertVendorProfileSchema = createInsertSchema(vendorProfiles);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertOrderSchema = createInsertSchema(orders);

// Additional e-commerce insert schemas
export const insertProfileSchema = createInsertSchema(profiles);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory);
export const insertShipmentSchema = createInsertSchema(shipments);
export const insertShipmentTrackingSchema = createInsertSchema(shipmentTracking);
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions);
export const insertOrderReturnSchema = createInsertSchema(orderReturns);
export const insertUserBehaviorSchema = createInsertSchema(userBehaviors);
export const insertUserSessionSchema = createInsertSchema(userSessions);

// Insert schemas for AI search
export const insertAiSearchQuery = createInsertSchema(aiSearchQueries);
export const insertSearchAnalytics = createInsertSchema(searchAnalytics);
export const insertAiKnowledgeBase = createInsertSchema(aiKnowledgeBase);
export const insertUserSearchPreferences = createInsertSchema(userSearchPreferences);
export const insertFraudDetectionLogSchema = createInsertSchema(fraudDetectionLogs);

// Types for existing e-commerce
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type VendorApplication = typeof vendorApplications.$inferSelect;
export type VendorDocument = typeof vendorDocuments.$inferSelect;
export type VendorApplicationStatusHistory = typeof vendorApplicationStatusHistory.$inferSelect;
export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type InsertVendorDocument = z.infer<typeof insertVendorDocumentSchema>;
export type InsertVendorApplicationStatusHistory = z.infer<typeof insertVendorApplicationStatusHistorySchema>;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Additional e-commerce types
export type Profile = typeof profiles.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
export type ShipmentTracking = typeof shipmentTracking.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type OrderReturn = typeof orderReturns.$inferSelect;
export type UserBehavior = typeof userBehaviors.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type InsertShipmentTracking = z.infer<typeof insertShipmentTrackingSchema>;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type InsertOrderReturn = z.infer<typeof insertOrderReturnSchema>;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// Types for AI search
export type AiSearchQuery = typeof aiSearchQueries.$inferSelect;
export type SearchAnalytics = typeof searchAnalytics.$inferSelect;
export type AiKnowledgeBase = typeof aiKnowledgeBase.$inferSelect;
export type UserSearchPreferences = typeof userSearchPreferences.$inferSelect;

export type InsertAiSearchQuery = z.infer<typeof insertAiSearchQuery>;
export type InsertSearchAnalytics = z.infer<typeof insertSearchAnalytics>;
export type InsertAiKnowledgeBase = z.infer<typeof insertAiKnowledgeBase>;
export type InsertUserSearchPreferences = z.infer<typeof insertUserSearchPreferences>;

// Fraud Detection types
export type FraudDetectionLog = typeof fraudDetectionLogs.$inferSelect;
export type InsertFraudDetectionLog = z.infer<typeof insertFraudDetectionLogSchema>;