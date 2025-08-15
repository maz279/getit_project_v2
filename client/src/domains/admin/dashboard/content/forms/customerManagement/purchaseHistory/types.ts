
export interface PurchaseHistoryData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  customerLifetimeValue: number;
  favoriteCategories: string[];
  paymentMethods: string[];
  deliveryPreference: string;
  returnRate: number;
  loyaltyPoints: number;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  orders: PurchaseOrder[];
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  deliveryDate?: string;
  returnWindow: number; // days
  canReturn: boolean;
  canReorder: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  category: string;
  brand: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendorName: string;
  isReviewable: boolean;
  warrantyPeriod?: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PurchaseAnalytics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  repeatCustomerRate: number;
  averageOrdersPerCustomer: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  salesTrends: Array<{
    period: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    orders: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}

export interface PurchaseSearchFilters {
  dateRange: {
    start: string;
    end: string;
  };
  orderStatus: string[];
  paymentMethods: string[];
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
  brands: string[];
  customerTiers: string[];
  returnStatus: string[];
}

export interface PurchaseRecommendation {
  customerId: string;
  type: 'reorder' | 'upsell' | 'cross_sell' | 'seasonal' | 'trending';
  products: Array<{
    productId: string;
    productName: string;
    price: number;
    image: string;
    reason: string;
    confidence: number;
  }>;
  estimatedRevenue: number;
  validUntil: string;
}
