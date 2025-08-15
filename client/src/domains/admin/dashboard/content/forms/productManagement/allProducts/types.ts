
export interface ProductData {
  id: string;
  name: string;
  sku: string;
  category: string;
  vendor: string;
  price: number;
  cost: number;
  stock: number;
  sold: number;
  revenue: number;
  profit: number;
  rating: number;
  reviews: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  lowStock: number;
  totalRevenue: number;
  totalProfit: number;
  averageRating: number;
  totalReviews: number;
}

export interface PerformanceMetrics {
  conversionRate: number;
  averageOrderValue: number;
  returnRate: number;
  customerSatisfaction: number;
  inventoryTurnover: number;
  profitMargin: number;
  salesGrowth: number;
  marketShare: number;
}

export interface InventoryData {
  warehouseDistribution: WarehouseStock[];
  stockMovement: StockMovement[];
  reorderAlerts: ReorderAlert[];
  deadStock: DeadStockItem[];
}

export interface WarehouseStock {
  warehouse: string;
  location: string;
  totalItems: number;
  value: number;
  utilization: number;
}

export interface StockMovement {
  date: string;
  inbound: number;
  outbound: number;
  adjustments: number;
  net: number;
}

export interface ReorderAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedOrder: number;
  supplier: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeadStockItem {
  productId: string;
  productName: string;
  stock: number;
  value: number;
  lastSold: string;
  daysInStock: number;
  recommendation: string;
}

export interface ProductAnalytics {
  salesTrends: SalesTrend[];
  categoryPerformance: CategoryPerformance[];
  vendorPerformance: VendorPerformance[];
  customerSegments: CustomerSegment[];
  seasonalPatterns: SeasonalPattern[];
}

export interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
  units: number;
  revenue: number;
}

export interface CategoryPerformance {
  category: string;
  products: number;
  revenue: number;
  orders: number;
  avgRating: number;
  growth: number;
}

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  products: number;
  revenue: number;
  orders: number;
  rating: number;
  performance: number;
}

export interface CustomerSegment {
  segment: string;
  customers: number;
  revenue: number;
  avgOrderValue: number;
  frequency: number;
}

export interface SeasonalPattern {
  period: string;
  demand: number;
  revenue: number;
  topProducts: string[];
}

export interface BulkAction {
  id: string;
  name: string;
  description: string;
  type: 'price_update' | 'inventory_update' | 'status_change' | 'category_change';
  icon: string;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  suggestedReorder: number;
  vendor: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedStockoutDate: string;
}

export interface TopPerformer {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  units: number;
  growth: number;
  rating: number;
}

export interface ProductTrend {
  date: string;
  totalProducts: number;
  activeProducts: number;
  newProducts: number;
  discontinuedProducts: number;
  revenue: number;
  orders: number;
}

export interface AllProductsData {
  overallStats: ProductStats;
  performanceMetrics: PerformanceMetrics;
  products: ProductData[];
  inventoryData: InventoryData;
  analytics: ProductAnalytics;
  lowStockAlerts: LowStockAlert[];
  topPerformers: TopPerformer[];
  trends: ProductTrend[];
  bulkActions: BulkAction[];
  salesData: SalesTrend[];
}
