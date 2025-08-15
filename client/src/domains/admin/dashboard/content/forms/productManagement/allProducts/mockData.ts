export const mockAllProductsData = {
  overallStats: {
    totalProducts: 12548,
    totalCategories: 142,
    totalVendors: 856,
    totalValue: 2847592,
    lowStockItems: 78,
    outOfStockItems: 23,
    topSellingCategory: "Electronics",
    averagePrice: 89.50
  },
  
  performanceMetrics: {
    viewsToday: 45623,
    salesCount: 1247,
    conversionRate: 2.73,
    revenueToday: 112847,
    topProduct: "Smartphone Pro Max",
    fastestGrowing: "Wireless Headphones"
  },
  
  products: [
    {
      id: "prod_001",
      name: "Smartphone Pro Max",
      category: "Electronics",
      vendor: "TechCorp",
      price: 899.99,
      stock: 245,
      sales: 156,
      rating: 4.8,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
    },
    {
      id: "prod_002", 
      name: "Wireless Headphones",
      category: "Electronics",
      vendor: "AudioTech",
      price: 199.99,
      stock: 89,
      sales: 234,
      rating: 4.6,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
    },
    {
      id: "prod_003",
      name: "Cotton T-Shirt",
      category: "Fashion",
      vendor: "StyleHub",
      price: 29.99,
      stock: 456,
      sales: 78,
      rating: 4.3,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
    },
    {
      id: "prod_004",
      name: "Gaming Laptop",
      category: "Electronics", 
      vendor: "GameTech",
      price: 1299.99,
      stock: 23,
      sales: 89,
      rating: 4.9,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
    },
    {
      id: "prod_005",
      name: "Running Shoes",
      category: "Sports",
      vendor: "SportsPro",
      price: 129.99,
      stock: 167,
      sales: 145,
      rating: 4.5,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
    }
  ],
  
  trends: {
    salesTrend: [
      { month: "Jan", sales: 4200 },
      { month: "Feb", sales: 3800 },
      { month: "Mar", sales: 4500 },
      { month: "Apr", sales: 5100 },
      { month: "May", sales: 4800 },
      { month: "Jun", sales: 5600 }
    ],
    categoryTrends: [
      { category: "Electronics", growth: 12.5 },
      { category: "Fashion", growth: 8.3 },
      { category: "Sports", growth: 15.2 },
      { category: "Home", growth: 6.8 }
    ]
  },
  
  topPerformers: [
    { id: "prod_001", name: "Smartphone Pro Max", sales: 156, revenue: 140391 },
    { id: "prod_002", name: "Wireless Headphones", sales: 234, revenue: 46798 },
    { id: "prod_004", name: "Gaming Laptop", sales: 89, revenue: 115699 },
    { id: "prod_005", name: "Running Shoes", sales: 145, revenue: 18849 }
  ],
  
  inventoryData: {
    totalItems: 12548,
    lowStockCount: 78,
    outOfStockCount: 23,
    overStockCount: 45,
    stockValue: 2847592,
    stockByCategory: [
      { category: "Electronics", items: 3421, value: 1247589 },
      { category: "Fashion", items: 4567, value: 689234 },
      { category: "Sports", items: 2134, value: 456789 },
      { category: "Home", items: 2426, value: 453980 }
    ]
  },
  
  lowStockAlerts: [
    { id: "prod_004", name: "Gaming Laptop", stock: 23, reorderLevel: 50 },
    { id: "prod_006", name: "Bluetooth Speaker", stock: 12, reorderLevel: 30 },
    { id: "prod_007", name: "Smart Watch", stock: 8, reorderLevel: 25 }
  ],
  
  analytics: {
    viewsVsSales: [
      { month: "Jan", views: 45000, sales: 4200 },
      { month: "Feb", views: 48000, sales: 3800 },
      { month: "Mar", views: 52000, sales: 4500 },
      { month: "Apr", views: 56000, sales: 5100 },
      { month: "May", views: 53000, sales: 4800 },
      { month: "Jun", views: 61000, sales: 5600 }
    ],
    conversionRates: [
      { category: "Electronics", rate: 3.2 },
      { category: "Fashion", rate: 2.8 },
      { category: "Sports", rate: 4.1 },
      { category: "Home", rate: 2.5 }
    ],
    topSearchTerms: [
      { term: "smartphone", count: 8456 },
      { term: "headphones", count: 6234 },
      { term: "laptop", count: 5678 },
      { term: "shoes", count: 4567 }
    ]
  },
  
  salesData: {
    dailySales: [
      { date: "2024-01-01", sales: 156 },
      { date: "2024-01-02", sales: 234 },
      { date: "2024-01-03", sales: 189 },
      { date: "2024-01-04", sales: 267 },
      { date: "2024-01-05", sales: 198 },
      { date: "2024-01-06", sales: 223 },
      { date: "2024-01-07", sales: 245 }
    ],
    revenueByCategory: [
      { category: "Electronics", revenue: 1247589 },
      { category: "Fashion", revenue: 689234 },
      { category: "Sports", revenue: 456789 },
      { category: "Home", revenue: 453980 }
    ]
  },
  
  bulkActions: [
    { action: "Update Prices", count: 156 },
    { action: "Update Stock", count: 89 },
    { action: "Change Status", count: 45 },
    { action: "Bulk Export", count: 234 }
  ]
};