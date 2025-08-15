import { pgTable, uuid, varchar, timestamp, decimal, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  userId: uuid('user_id').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BDT'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Order items
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id),
  productId: uuid('product_id').notNull(),
  variantId: uuid('variant_id'),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id),
  method: varchar('method', { length: 50 }), // bkash, nagad, rocket, card
  status: varchar('status', { length: 50 }).default('pending'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  transactionId: varchar('transaction_id', { length: 255 }),
  gatewayResponse: varchar('gateway_response'),
  createdAt: timestamp('created_at').defaultNow()
});

// Shipments
export const shipments = pgTable('shipments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  carrier: varchar('carrier', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Shipping addresses
export const shippingAddresses = pgTable('shipping_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  division: varchar('division', { length: 50 }).notNull(),
  district: varchar('district', { length: 50 }).notNull(),
  upazila: varchar('upazila', { length: 50 }).notNull(),
  details: varchar('details', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  payments: many(payments),
  shipments: many(shipments),
  shippingAddress: one(shippingAddresses)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id]
  })
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id]
  })
}));

// Insert schemas
export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    status: z.enum(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']),
    subtotal: z.number().positive(),
    taxAmount: z.number().min(0),
    shippingAmount: z.number().min(0),
    discountAmount: z.number().min(0),
    totalAmount: z.number().positive(),
    currency: z.enum(['BDT', 'USD', 'EUR'])
  });

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .omit({ id: true, createdAt: true })
  .extend({
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive()
  });

export const insertPaymentSchema = createInsertSchema(payments)
  .omit({ id: true, createdAt: true })
  .extend({
    method: z.enum(['bkash', 'nagad', 'rocket', 'card', 'cash_on_delivery']),
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']),
    amount: z.number().positive()
  });

export const insertShipmentSchema = createInsertSchema(shipments)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    status: z.enum(['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'returned'])
  });

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses)
  .omit({ id: true, createdAt: true })
  .extend({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    division: z.string().min(2).max(50),
    district: z.string().min(2).max(50),
    upazila: z.string().min(2).max(50)
  });

// Types
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;