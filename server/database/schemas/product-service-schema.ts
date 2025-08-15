/**
 * Product Service Database Schema - Phase 1 Week 2
 * Isolated database schema for product catalog microservice
 * 
 * @fileoverview Product service database schema with full isolation
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
  real,
  index,
  unique,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ================================
// PRODUCT SERVICE ENUMS
// ================================

export const productStatus = pgEnum('product_status', ['draft', 'active', 'inactive', 'discontinued', 'out_of_stock']);
export const categoryStatus = pgEnum('category_status', ['active', 'inactive', 'archived']);
export const reviewStatus = pgEnum('review_status', ['pending', 'approved', 'rejected', 'flagged']);
export const inventoryStatus = pgEnum('inventory_status', ['in_stock', 'low_stock', 'out_of_stock', 'discontinued']);

// ================================
// PRODUCT SERVICE CORE TABLES
// ================================

// Categories table for product categorization
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
  image: text("image"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  
  // Bangladesh-specific fields
  bengaliName: text("bengali_name"),
  culturalRelevance: jsonb("cultural_relevance"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    slugIdx: index('categories_slug_idx').on(table.slug),
    parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
    activeIdx: index('categories_active_idx').on(table.isActive),
    sortOrderIdx: index('categories_sort_order_idx').on(table.sortOrder),
  };
});

// Products table for product catalog
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  sku: text("sku").notNull().unique(),
  
  // Foreign key references (will be replaced with service calls)
  vendorId: integer("vendor_id").notNull(), // Reference to User Service
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  
  // Product details
  weight: real("weight"),
  dimensions: jsonb("dimensions"),
  images: jsonb("images"),
  gallery: jsonb("gallery"),
  variants: jsonb("variants"),
  attributes: jsonb("attributes"),
  specifications: jsonb("specifications"),
  
  // SEO and metadata
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  metaData: jsonb("meta_data"),
  
  // Status and visibility
  status: productStatus("status").default('draft'),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isDigital: boolean("is_digital").default(false),
  
  // Bangladesh-specific fields
  bengaliName: text("bengali_name"),
  bengaliDescription: text("bengali_description"),
  halalCertified: boolean("halal_certified").default(false),
  localManufacturer: boolean("local_manufacturer").default(false),
  
  // Inventory tracking
  trackQuantity: boolean("track_quantity").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  maxStockLevel: integer("max_stock_level").default(1000),
  
  // Timestamps
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    slugIdx: index('products_slug_idx').on(table.slug),
    skuIdx: index('products_sku_idx').on(table.sku),
    vendorIdIdx: index('products_vendor_id_idx').on(table.vendorId),
    categoryIdIdx: index('products_category_id_idx').on(table.categoryId),
    statusIdx: index('products_status_idx').on(table.status),
    activeIdx: index('products_active_idx').on(table.isActive),
    featuredIdx: index('products_featured_idx').on(table.isFeatured),
    priceIdx: index('products_price_idx').on(table.price),
    stockIdx: index('products_stock_idx').on(table.stockQuantity),
  };
});

// Product reviews table
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: integer("user_id").notNull(), // Reference to User Service
  orderId: integer("order_id"), // Reference to Order Service
  
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  pros: jsonb("pros"),
  cons: jsonb("cons"),
  images: jsonb("images"),
  
  // Review metadata
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isAnonymous: boolean("is_anonymous").default(false),
  helpfulCount: integer("helpful_count").default(0),
  reportCount: integer("report_count").default(0),
  
  // Moderation
  status: reviewStatus("status").default('pending'),
  moderatedBy: integer("moderated_by"), // Reference to User Service
  moderatedAt: timestamp("moderated_at"),
  moderationNotes: text("moderation_notes"),
  
  // Bangladesh-specific fields
  bengaliComment: text("bengali_comment"),
  culturalContext: jsonb("cultural_context"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    productIdIdx: index('product_reviews_product_id_idx').on(table.productId),
    userIdIdx: index('product_reviews_user_id_idx').on(table.userId),
    orderIdIdx: index('product_reviews_order_id_idx').on(table.orderId),
    ratingIdx: index('product_reviews_rating_idx').on(table.rating),
    statusIdx: index('product_reviews_status_idx').on(table.status),
    verifiedIdx: index('product_reviews_verified_idx').on(table.isVerifiedPurchase),
  };
});

// Product inventory table
export const productInventory = pgTable("product_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: integer("product_id").references(() => products.id).notNull(),
  
  // Inventory tracking
  currentStock: integer("current_stock").default(0),
  reservedStock: integer("reserved_stock").default(0),
  availableStock: integer("available_stock").default(0),
  reorderLevel: integer("reorder_level").default(0),
  reorderQuantity: integer("reorder_quantity").default(0),
  
  // Locations and warehouses
  warehouseId: integer("warehouse_id"), // Reference to Logistics Service
  location: text("location"),
  binLocation: text("bin_location"),
  
  // Costs
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  
  // Status and tracking
  status: inventoryStatus("status").default('in_stock'),
  lastStockUpdate: timestamp("last_stock_update"),
  lastStockCheck: timestamp("last_stock_check"),
  
  // Bangladesh-specific fields
  localSupplier: boolean("local_supplier").default(false),
  importDuty: decimal("import_duty", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    productIdIdx: index('product_inventory_product_id_idx').on(table.productId),
    warehouseIdIdx: index('product_inventory_warehouse_id_idx').on(table.warehouseId),
    statusIdx: index('product_inventory_status_idx').on(table.status),
    stockLevelIdx: index('product_inventory_stock_level_idx').on(table.currentStock),
    reorderLevelIdx: index('product_inventory_reorder_level_idx').on(table.reorderLevel),
  };
});

// ================================
// PRODUCT SERVICE RELATIONS
// ================================

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(productReviews),
  inventory: one(productInventory, {
    fields: [products.id],
    references: [productInventory.productId],
  }),
}));

export const productReviewRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
}));

export const productInventoryRelations = relations(productInventory, ({ one }) => ({
  product: one(products, {
    fields: [productInventory.productId],
    references: [products.id],
  }),
}));

// ================================
// PRODUCT SERVICE TYPES
// ================================

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;
export type ProductInventory = typeof productInventory.$inferSelect;
export type NewProductInventory = typeof productInventory.$inferInsert;

// ================================
// PRODUCT SERVICE ZOD SCHEMAS
// ================================

export const insertCategorySchema = createInsertSchema(categories);
export const insertProductSchema = createInsertSchema(products);
export const insertProductReviewSchema = createInsertSchema(productReviews);
export const insertProductInventorySchema = createInsertSchema(productInventory);

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type InsertProductInventory = z.infer<typeof insertProductInventorySchema>;