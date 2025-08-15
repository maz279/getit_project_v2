/**
 * Comprehensive API Types for RTK Query Implementation
 * Phase 1 Week 1: Complete TypeScript interfaces for all API endpoints
 * Amazon.com/Shopee.sg-Level Type Safety
 */

import { z } from 'zod';

// Standard API Response Format
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    version: string;
    processingTime?: number;
  };
}

// Common Filter Types
export interface BaseFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  termsAccepted: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    verified: boolean;
  };
  expiresAt: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters extends BaseFilters {
  role?: string;
  verified?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  images: string[];
  vendor: {
    id: number;
    name: string;
    rating: number;
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters extends BaseFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  vendorId?: number;
  rating?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  images: string[];
  specifications?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  vendorId: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderFilters extends BaseFilters {
  userId?: number;
  vendorId?: number;
  status?: string;
  paymentStatus?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface CreateOrderRequest {
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  notes?: string;
}

// Cart Types
export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
  addedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  children?: Category[];
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters extends BaseFilters {
  parentId?: number;
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
}

// Vendor Types
export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  description?: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  address: Address;
  businessLicense?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorFilters extends BaseFilters {
  isVerified?: boolean;
  isActive?: boolean;
  rating?: number;
}

export interface CreateVendorRequest {
  name: string;
  email: string;
  phone: string;
  description?: string;
  logo?: string;
  address: Address;
  businessLicense?: string;
  taxId?: string;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  type: 'order' | 'payment' | 'shipping' | 'product' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationFilters extends BaseFilters {
  userId?: number;
  type?: string;
  isRead?: boolean;
}

export interface CreateNotificationRequest {
  userId: number;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Review Types
export interface Review {
  id: number;
  userId: number;
  productId: number;
  orderId: number;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFilters extends BaseFilters {
  productId?: number;
  userId?: number;
  rating?: number;
  isVerified?: boolean;
}

export interface CreateReviewRequest {
  productId: number;
  orderId: number;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

// Wishlist Types
export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  items: WishlistItem[];
  itemCount: number;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  method: 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters extends BaseFilters {
  orderId?: number;
  method?: string;
  status?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface CreatePaymentRequest {
  orderId: number;
  amount: number;
  currency: string;
  method: Payment['method'];
  paymentDetails: Record<string, any>;
}

// Support Types
export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assignedTo?: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketFilters extends BaseFilters {
  userId?: number;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: number;
}

export interface CreateSupportTicketRequest {
  subject: string;
  message: string;
  priority: SupportTicket['priority'];
  category: string;
  attachments?: string[];
}

// Analytics Types
export interface AnalyticsData {
  metric: string;
  value: number;
  change: number;
  changePercent: number;
  period: string;
  data: Array<{
    date: string;
    value: number;
  }>;
}

export interface AnalyticsFilters {
  metric?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

// Search Types
export interface SearchResult {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  total: number;
  facets: {
    categories: Array<{ name: string; count: number; }>;
    brands: Array<{ name: string; count: number; }>;
    priceRanges: Array<{ min: number; max: number; count: number; }>;
  };
}

export interface SearchFilters extends BaseFilters {
  query: string;
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  location?: string;
}

// Shipping Types
export interface Shipping {
  id: number;
  orderId: number;
  method: string;
  cost: number;
  estimatedDelivery: string;
  trackingNumber?: string;
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  carrier: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingFilters extends BaseFilters {
  orderId?: number;
  status?: string;
  carrier?: string;
  trackingNumber?: string;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  productId: number;
  vendorId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  lastRestocked: string;
  updatedAt: string;
}

export interface InventoryFilters extends BaseFilters {
  productId?: number;
  vendorId?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export interface UpdateInventoryRequest {
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
}

// Coupon Types
export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFilters extends BaseFilters {
  code?: string;
  type?: string;
  isActive?: boolean;
  validNow?: boolean;
}

export interface CreateCouponRequest {
  code: string;
  type: Coupon['type'];
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
}

// Configuration Types
export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface ConfigFilters extends BaseFilters {
  key?: string;
  type?: string;
  isPublic?: boolean;
}

// Health Check Types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: Record<string, {
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime: number;
    details?: any;
  }>;
  version: string;
}

// Export all types
export type {
  StandardApiResponse,
  BaseFilters,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserFilters,
  UpdateUserRequest,
  Product,
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  Order,
  OrderItem,
  Address,
  OrderFilters,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CartItem,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  Category,
  CategoryFilters,
  CreateCategoryRequest,
  Vendor,
  VendorFilters,
  CreateVendorRequest,
  Notification,
  NotificationFilters,
  CreateNotificationRequest,
  Review,
  ReviewFilters,
  CreateReviewRequest,
  WishlistItem,
  Wishlist,
  Payment,
  PaymentFilters,
  CreatePaymentRequest,
  SupportTicket,
  SupportTicketFilters,
  CreateSupportTicketRequest,
  AnalyticsData,
  AnalyticsFilters,
  SearchResult,
  SearchFilters,
  Shipping,
  ShippingFilters,
  InventoryItem,
  InventoryFilters,
  UpdateInventoryRequest,
  Coupon,
  CouponFilters,
  CreateCouponRequest,
  SystemConfig,
  ConfigFilters,
  HealthCheck,
};