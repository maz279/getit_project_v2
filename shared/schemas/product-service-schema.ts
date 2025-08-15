import { pgTable, uuid, varchar, timestamp, jsonb, decimal, integer, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id').references(() => categories.id),
  name: jsonb('name').notNull(), // {"en": "Electronics", "bn": "ইলেকট্রনিক্স"}
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  level: integer('level').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Products core
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: varchar('sku', { length: 100 }).unique().notNull(),
  name: jsonb('name').notNull(), // {"en": "Product Name", "bn": "পণ্যের নাম"}
  description: jsonb('description'),
  vendorId: uuid('vendor_id').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Product variants
export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id),
  sku: varchar('sku', { length: 100 }).unique().notNull(),
  attributes: jsonb('attributes'), // {"color": "red", "size": "XL"}
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  stockQuantity: integer('stock_quantity').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Product images
export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id),
  variantId: uuid('variant_id').references(() => productVariants.id),
  url: text('url').notNull(),
  altText: jsonb('alt_text'), // {"en": "Alt text", "bn": "বিকল্প পাঠ্য"}
  position: integer('position').default(0),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Product reviews
export const productReviews = pgTable('product_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id),
  userId: uuid('user_id').notNull(),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  comment: text('comment'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  variants: many(productVariants),
  images: many(productImages),
  reviews: many(productReviews)
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id]
  }),
  images: many(productImages)
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.object({
      en: z.string().min(1),
      bn: z.string().optional()
    }),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  });

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.object({
      en: z.string().min(1),
      bn: z.string().optional()
    }),
    description: z.object({
      en: z.string().optional(),
      bn: z.string().optional()
    }).optional(),
    status: z.enum(['active', 'inactive', 'draft'])
  });

export const insertProductVariantSchema = createInsertSchema(productVariants)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    stockQuantity: z.number().int().min(0)
  });

export const insertProductImageSchema = createInsertSchema(productImages)
  .omit({ id: true, createdAt: true })
  .extend({
    url: z.string().url(),
    altText: z.object({
      en: z.string().optional(),
      bn: z.string().optional()
    }).optional(),
    position: z.number().int().min(0)
  });

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;