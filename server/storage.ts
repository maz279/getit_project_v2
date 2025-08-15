import { 
  users, 
  profiles,
  products,
  categories,
  vendors,
  cartItems,
  orders,
  orderItems,
  orderStatusHistory,
  shipments,
  shipmentTracking,
  paymentTransactions,
  vendorApplications,
  vendorDocuments,
  vendorProfiles,
  type User, 
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Vendor,
  type InsertVendor,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderStatusHistory,
  type InsertOrderStatusHistory,
  type Shipment,
  type InsertShipment,
  type ShipmentTracking,
  type InsertShipmentTracking,
  type PaymentTransaction,
  type InsertPaymentTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods - adjusted for actual schema
  getUser(id: string): Promise<User | undefined>; // users.id is text
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail?(email: string): Promise<User | undefined>;
  getUserByPhone?(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: any): Promise<User>; // For auth compatibility
  updateUser?(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product methods - using actual schema fields
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>; // products.categoryId is uuid
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Cart methods - using actual schema (userId is integer)
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  
  // Order methods - using actual schema
  getOrders(userId?: number): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  // Order Status History
  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;
  addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  
  // Payment Transactions
  getPaymentTransactions(orderId: string): Promise<PaymentTransaction[]>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  
  // Shipments
  getShipments(orderId?: string): Promise<Shipment[]>;
  getShipment(id: string): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipmentStatus(id: string, status: string): Promise<Shipment | undefined>;
  
  // Shipment Tracking
  getShipmentTracking(shipmentId: string): Promise<ShipmentTracking[]>;
  addShipmentTrackingEvent(tracking: InsertShipmentTracking): Promise<ShipmentTracking>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.phone, phone));
      return user;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(userData as any).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async upsertUser(userData: any): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Product methods
  async getProducts(limit = 50, offset = 0): Promise<Product[]> {
    try {
      return await db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        inventory: products.inventory,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        brand: products.brand,
        origin: products.origin,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      }).from(products).limit(limit).offset(offset);
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return await db.select().from(products).where(eq(products.categoryId, category));
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      const [product] = await db.insert(products).values(productData).returning();
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const [product] = await db
        .update(products)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${query}%`));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    try {
      return await db.select({
        id: categories.id,
        name: categories.name,
        nameBn: categories.nameBn,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        parentId: categories.parentId,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
      }).from(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getCategory(id: string): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category;
    } catch (error) {
      console.error('Error getting category:', error);
      return undefined;
    }
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    try {
      const [category] = await db.insert(categories).values(categoryData).returning();
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    try {
      return await db.select().from(vendors);
    } catch (error) {
      console.error('Error getting vendors:', error);
      return [];
    }
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    try {
      const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
      return vendor;
    } catch (error) {
      console.error('Error getting vendor:', error);
      return undefined;
    }
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    try {
      const [vendor] = await db.insert(vendors).values(vendorData).returning();
      return vendor;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    try {
      return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    try {
      const [cartItem] = await db.insert(cartItems).values(cartItemData).returning();
      return cartItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    try {
      const [cartItem] = await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, id))
        .returning();
      return cartItem;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return undefined;
    }
  }

  async removeFromCart(id: string): Promise<boolean> {
    try {
      const result = await db.delete(cartItems).where(eq(cartItems.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  // Order methods
  async getOrders(userId?: number): Promise<Order[]> {
    try {
      if (userId) {
        return await db.select().from(orders).where(eq(orders.userId, userId));
      }
      return await db.select().from(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      const [order] = await db.insert(orders).values(orderData).returning();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    try {
      const [order] = await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();
      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    } catch (error) {
      console.error('Error getting order items:', error);
      return [];
    }
  }

  // Order Status History
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    try {
      return await db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, orderId))
        .orderBy(desc(orderStatusHistory.createdAt));
    } catch (error) {
      console.error('Error getting order status history:', error);
      return [];
    }
  }

  async addOrderStatusHistory(historyData: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    try {
      const [history] = await db.insert(orderStatusHistory).values(historyData).returning();
      return history;
    } catch (error) {
      console.error('Error adding order status history:', error);
      throw error;
    }
  }

  // Payment Transactions
  async getPaymentTransactions(orderId: string): Promise<PaymentTransaction[]> {
    try {
      return await db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, orderId));
    } catch (error) {
      console.error('Error getting payment transactions:', error);
      return [];
    }
  }

  async createPaymentTransaction(transactionData: InsertPaymentTransaction): Promise<PaymentTransaction> {
    try {
      const [transaction] = await db.insert(paymentTransactions).values(transactionData).returning();
      return transaction;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  // Shipments
  async getShipments(orderId?: string): Promise<Shipment[]> {
    try {
      if (orderId) {
        return await db.select().from(shipments).where(eq(shipments.orderId, orderId));
      }
      return await db.select().from(shipments);
    } catch (error) {
      console.error('Error getting shipments:', error);
      return [];
    }
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    try {
      const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
      return shipment;
    } catch (error) {
      console.error('Error getting shipment:', error);
      return undefined;
    }
  }

  async createShipment(shipmentData: InsertShipment): Promise<Shipment> {
    try {
      const [shipment] = await db.insert(shipments).values(shipmentData).returning();
      return shipment;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }

  async updateShipmentStatus(id: string, status: string): Promise<Shipment | undefined> {
    try {
      const [shipment] = await db
        .update(shipments)
        .set({ status })
        .where(eq(shipments.id, id))
        .returning();
      return shipment;
    } catch (error) {
      console.error('Error updating shipment status:', error);
      return undefined;
    }
  }

  // Shipment Tracking
  async getShipmentTracking(shipmentId: string): Promise<ShipmentTracking[]> {
    try {
      return await db
        .select()
        .from(shipmentTracking)
        .where(eq(shipmentTracking.shipmentId, shipmentId))
        .orderBy(desc(shipmentTracking.createdAt));
    } catch (error) {
      console.error('Error getting shipment tracking:', error);
      return [];
    }
  }

  async addShipmentTrackingEvent(trackingData: InsertShipmentTracking): Promise<ShipmentTracking> {
    try {
      const [tracking] = await db.insert(shipmentTracking).values(trackingData).returning();
      return tracking;
    } catch (error) {
      console.error('Error adding shipment tracking event:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();