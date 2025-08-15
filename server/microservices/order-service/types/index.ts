/**
 * Order Service Types - Enterprise Type Definitions
 * Comprehensive type definitions for order management
 */

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'returned' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded';

export type PaymentMethod = 
  | 'bkash' 
  | 'nagad' 
  | 'rocket' 
  | 'sslcommerz' 
  | 'cod';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  vendorId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: number;
  subtotal: string;
  shipping: string;
  discount: string;
  tax: string;
  total: string;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  shippingAddress: any;
  billingAddress?: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  userId: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: string;
    name: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface OrderSearchQuery {
  q: string;
  status?: OrderStatus;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface OrderAnalyticsQuery {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  status?: OrderStatus;
}

export interface OrderResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface PaginatedOrderResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderAnalyticsResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<OrderStatus, number>;
  dailyStats?: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  topProducts?: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  orderItemId?: string;
  fromStatus?: string;
  toStatus: string;
  notes?: string;
  updatedBy?: number;
  metadata?: any;
  createdAt: Date;
}

// Express Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}