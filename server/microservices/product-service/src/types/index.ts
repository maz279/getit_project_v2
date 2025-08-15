/**
 * Product Service Type Definitions
 * Amazon.com/Shopee.sg Level Enterprise Types
 */

import { z } from 'zod';
import { 
  Product, 
  InsertProduct, 
  ProductVariant, 
  InsertProductVariant,
  ProductAttribute,
  InsertProductAttribute,
  Category,
  Vendor
} from '../../../../shared/schema';

// Product Search and Filter Types
export interface ProductSearchParams {
  query?: string;
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  isActive?: boolean;
  tags?: string[];
  sortBy?: 'price' | 'rating' | 'createdAt' | 'popularity' | 'sales';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Product Validation Schemas
export const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  nameBn: z.string().optional(),
  description: z.string().optional(),
  descriptionBn: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid sale price format').optional(),
  costPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost price format').optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  vendorId: z.string().uuid('Invalid vendor ID'),
  categoryId: z.string().uuid('Invalid category ID'),
  brand: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'inch'])
  }).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isDigital: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(300).optional(),
  metaKeywords: z.array(z.string()).optional()
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

// Error Types
export class ProductServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

export class ValidationError extends ProductServiceError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ProductServiceError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with ID ${id}` : ''} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

// ================================
// CATEGORY TYPES
// ================================

export interface CategorySearchParams {
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
  includeChildren?: boolean;
  includeProducts?: boolean;
  sortBy?: 'name' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CategoryResponse {
  categories: Category[];
  pagination?: Pagination;
}

export interface CategoryHierarchy extends Category {
  children: CategoryHierarchy[];
  productCount: number;
}

export interface CategoryAnalytics {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  topProducts: ProductPerformance[];
  salesTrend: SalesTrendPoint[];
  timeRange: string;
}

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  metaKeywords: z.array(z.string()).optional()
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

// ================================
// REVIEW TYPES
// ================================

export interface ReviewSearchParams {
  productId?: string;
  userId?: string;
  rating?: number;
  verified?: boolean;
  hasImages?: boolean;
  hasVideo?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewResponse {
  reviews: ProductReview[];
  pagination: Pagination;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  video?: string;
  pros?: string[];
  cons?: string[];
  isVerified: boolean;
  helpfulCount: number;
  isHelpful?: boolean;
  responses?: ReviewResponseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponseItem {
  id: string;
  reviewId: string;
  respondentId: string;
  respondentName: string;
  respondentType: 'vendor' | 'admin';
  response: string;
  createdAt: Date;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export const ReviewCreateSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  userId: z.string().uuid('Invalid user ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(100),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000),
  images: z.array(z.string().url()).optional(),
  video: z.string().url().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional()
});

export const ReviewUpdateSchema = ReviewCreateSchema.partial().omit(['productId', 'userId']);

export const ReviewResponseSchema = z.object({
  reviewId: z.string().uuid(),
  response: z.string().min(1, 'Response is required').max(1000),
  respondentType: z.enum(['vendor', 'admin'])
});

// ================================
// PAGINATION
// ================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ================================
// ANALYTICS TYPES
// ================================

export interface ProductPerformance {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  rating: number;
}

export interface SalesTrendPoint {
  date: string;
  sales: number;
  revenue: number;
}

// ================================
// BULK ORDER TYPES
// ================================

export interface BulkOrderSearchParams {
  vendorId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  minQuantity?: number;
  page?: number;
  limit?: number;
}

export interface BulkOrder {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  requestedPrice: number;
  approvedPrice?: number;
  deliveryDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  notes?: string;
  businessInfo: BusinessInfo;
  vendorResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessInfo {
  companyName: string;
  taxId?: string;
  businessType: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export const BulkOrderCreateSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(10, 'Minimum bulk order quantity is 10'),
  requestedPrice: z.number().positive('Requested price must be positive'),
  deliveryDate: z.date().min(new Date(), 'Delivery date must be in the future'),
  notes: z.string().max(1000).optional(),
  businessInfo: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    taxId: z.string().optional(),
    businessType: z.string(),
    contactPerson: z.string(),
    email: z.string().email(),
    phone: z.string()
  })
});

// ================================
// ADDITIONAL ERROR CLASSES
// ================================

export class ConflictError extends ProductServiceError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends ProductServiceError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class BadRequestError extends ProductServiceError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST', 400);
    this.name = 'BadRequestError';
  }
}

// ================================
// SERVICE INTERFACES
// ================================

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  timestamp: string;
  dependencies: {
    database: 'healthy' | 'unhealthy';
    cache?: 'healthy' | 'unhealthy';
    external?: 'healthy' | 'unhealthy';
  };
}

// Export all types
export type {
  Product,
  InsertProduct,
  ProductVariant,
  InsertProductVariant,
  ProductAttribute,
  InsertProductAttribute,
  Category,
  Vendor
};