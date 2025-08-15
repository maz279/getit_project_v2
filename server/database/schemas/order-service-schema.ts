/**
 * Order Service Database Schema - Phase 1 Week 2
 * Isolated database schema for order management microservice
 * 
 * @fileoverview Order service database schema with full isolation
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
  index,
  unique,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ================================
// ORDER SERVICE ENUMS
// ================================

export const orderStatus = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded', 'completed']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const paymentMethod = pgEnum('payment_method', ['cash_on_delivery', 'bkash', 'nagad', 'rocket', 'card', 'bank_transfer', 'mobile_banking', 'digital_wallet']);
export const shippingMethod = pgEnum('shipping_method', ['standard', 'express', 'overnight', 'pickup', 'international']);
export const shippingStatus = pgEnum('shipping_status', ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'failed', 'returned']);

// ================================
// ORDER SERVICE CORE TABLES
// ================================

// Orders table for order management
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  
  // Foreign key references (will be replaced with service calls)
  userId: integer("user_id").notNull(), // Reference to User Service
  vendorId: integer("vendor_id"), // Reference to User Service
  
  // Order details
  status: orderStatus("status").default('pending'),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Payment information
  paymentStatus: paymentStatus("payment_status").default('pending'),
  paymentMethod: paymentMethod("payment_method"),
  paymentReference: text("payment_reference"),
  paidAt: timestamp("paid_at"),
  
  // Shipping information
  shippingMethod: shippingMethod("shipping_method"),
  shippingStatus: shippingStatus("shipping_status").default('pending'),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  trackingNumber: text("tracking_number"),
  
  // Order metadata
  notes: text("notes"),
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  metadata: jsonb("metadata"),
  
  // Bangladesh-specific fields
  mobileBankingDetails: jsonb("mobile_banking_details"),
  deliveryInstructions: text("delivery_instructions"),
  culturalConsiderations: jsonb("cultural_considerations"),
  
  // Timestamps
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  cancelledAt: timestamp("cancelled_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
    userIdIdx: index('orders_user_id_idx').on(table.userId),
    vendorIdIdx: index('orders_vendor_id_idx').on(table.vendorId),
    statusIdx: index('orders_status_idx').on(table.status),
    paymentStatusIdx: index('orders_payment_status_idx').on(table.paymentStatus),
    shippingStatusIdx: index('orders_shipping_status_idx').on(table.shippingStatus),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    totalAmountIdx: index('orders_total_amount_idx').on(table.totalAmount),
  };
});

// Order items table for order line items
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  
  // Foreign key references (will be replaced with service calls)
  productId: integer("product_id").notNull(), // Reference to Product Service
  vendorId: integer("vendor_id").notNull(), // Reference to User Service
  
  // Item details
  productName: text("product_name").notNull(),
  productSku: text("product_sku").notNull(),
  productImage: text("product_image"),
  
  // Pricing
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  
  // Product metadata at time of order
  productVariant: jsonb("product_variant"),
  productAttributes: jsonb("product_attributes"),
  
  // Item-specific status
  itemStatus: orderStatus("item_status").default('pending'),
  
  // Bangladesh-specific fields
  bengaliProductName: text("bengali_product_name"),
  halalCertified: boolean("halal_certified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
    vendorIdIdx: index('order_items_vendor_id_idx').on(table.vendorId),
    statusIdx: index('order_items_status_idx').on(table.itemStatus),
    skuIdx: index('order_items_sku_idx').on(table.productSku),
  };
});

// Order payments table for payment tracking
export const orderPayments = pgTable("order_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  
  // Payment details
  paymentMethod: paymentMethod("payment_method").notNull(),
  paymentStatus: paymentStatus("payment_status").default('pending'),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Payment gateway information
  gatewayTransactionId: text("gateway_transaction_id"),
  gatewayResponse: jsonb("gateway_response"),
  
  // Bangladesh mobile banking specific
  mobileBankingProvider: text("mobile_banking_provider"),
  mobileBankingTransactionId: text("mobile_banking_transaction_id"),
  mobileBankingNumber: text("mobile_banking_number"),
  
  // Payment metadata
  reference: text("reference"),
  notes: text("notes"),
  failureReason: text("failure_reason"),
  
  // Timestamps
  processedAt: timestamp("processed_at"),
  confirmedAt: timestamp("confirmed_at"),
  failedAt: timestamp("failed_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    orderIdIdx: index('order_payments_order_id_idx').on(table.orderId),
    statusIdx: index('order_payments_status_idx').on(table.paymentStatus),
    methodIdx: index('order_payments_method_idx').on(table.paymentMethod),
    gatewayTransactionIdx: index('order_payments_gateway_transaction_idx').on(table.gatewayTransactionId),
    mobileBankingProviderIdx: index('order_payments_mobile_banking_provider_idx').on(table.mobileBankingProvider),
    createdAtIdx: index('order_payments_created_at_idx').on(table.createdAt),
  };
});

// Order shipments table for shipping tracking
export const orderShipments = pgTable("order_shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  
  // Shipping details
  shippingMethod: shippingMethod("shipping_method").notNull(),
  shippingStatus: shippingStatus("shipping_status").default('pending'),
  trackingNumber: text("tracking_number"),
  
  // Shipping provider
  carrierId: integer("carrier_id"), // Reference to Logistics Service
  carrierName: text("carrier_name"),
  carrierService: text("carrier_service"),
  
  // Addresses
  shippingAddress: jsonb("shipping_address").notNull(),
  pickupAddress: jsonb("pickup_address"),
  
  // Costs
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  insuranceCost: decimal("insurance_cost", { precision: 10, scale: 2 }),
  
  // Package details
  packageWeight: decimal("package_weight", { precision: 10, scale: 2 }),
  packageDimensions: jsonb("package_dimensions"),
  packageCount: integer("package_count").default(1),
  
  // Bangladesh-specific fields
  deliveryInstructions: text("delivery_instructions"),
  contactPersonName: text("contact_person_name"),
  contactPersonPhone: text("contact_person_phone"),
  deliveryTimePreference: text("delivery_time_preference"),
  
  // Timestamps
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    orderIdIdx: index('order_shipments_order_id_idx').on(table.orderId),
    statusIdx: index('order_shipments_status_idx').on(table.shippingStatus),
    trackingNumberIdx: index('order_shipments_tracking_number_idx').on(table.trackingNumber),
    carrierIdIdx: index('order_shipments_carrier_id_idx').on(table.carrierId),
    shippedAtIdx: index('order_shipments_shipped_at_idx').on(table.shippedAt),
    deliveredAtIdx: index('order_shipments_delivered_at_idx').on(table.deliveredAt),
  };
});

// ================================
// ORDER SERVICE RELATIONS
// ================================

export const orderRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(orderPayments),
  shipments: many(orderShipments),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const orderPaymentRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, {
    fields: [orderPayments.orderId],
    references: [orders.id],
  }),
}));

export const orderShipmentRelations = relations(orderShipments, ({ one }) => ({
  order: one(orders, {
    fields: [orderShipments.orderId],
    references: [orders.id],
  }),
}));

// ================================
// ORDER SERVICE TYPES
// ================================

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderPayment = typeof orderPayments.$inferSelect;
export type NewOrderPayment = typeof orderPayments.$inferInsert;
export type OrderShipment = typeof orderShipments.$inferSelect;
export type NewOrderShipment = typeof orderShipments.$inferInsert;

// ================================
// ORDER SERVICE ZOD SCHEMAS
// ================================

export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertOrderPaymentSchema = createInsertSchema(orderPayments);
export const insertOrderShipmentSchema = createInsertSchema(orderShipments);

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertOrderPayment = z.infer<typeof insertOrderPaymentSchema>;
export type InsertOrderShipment = z.infer<typeof insertOrderShipmentSchema>;