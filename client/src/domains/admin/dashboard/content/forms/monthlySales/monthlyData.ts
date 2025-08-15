
// Mock data for monthly trends
export const monthlyTrendsData = [
  { month: 'Jan', sales: 2400000, orders: 12000, customers: 8500, growth: 12.5, revenue: 2400000, profit: 480000 },
  { month: 'Feb', sales: 2100000, orders: 10500, customers: 7800, growth: -12.5, revenue: 2100000, profit: 420000 },
  { month: 'Mar', sales: 2800000, orders: 14000, customers: 9200, growth: 33.3, revenue: 2800000, profit: 560000 },
  { month: 'Apr', sales: 3200000, orders: 16000, customers: 10500, growth: 14.3, revenue: 3200000, profit: 640000 },
  { month: 'May', sales: 2900000, orders: 14500, customers: 9800, growth: -9.4, revenue: 2900000, profit: 580000 },
  { month: 'Jun', sales: 3500000, orders: 17500, customers: 11200, growth: 20.7, revenue: 3500000, profit: 700000 },
  { month: 'Jul', sales: 3800000, orders: 19000, customers: 12000, growth: 8.6, revenue: 3800000, profit: 760000 },
  { month: 'Aug', sales: 3600000, orders: 18000, customers: 11500, growth: -5.3, revenue: 3600000, profit: 720000 },
  { month: 'Sep', sales: 4200000, orders: 21000, customers: 13500, growth: 16.7, revenue: 4200000, profit: 840000 },
  { month: 'Oct', sales: 4500000, orders: 22500, customers: 14200, growth: 7.1, revenue: 4500000, profit: 900000 },
  { month: 'Nov', sales: 5200000, orders: 26000, customers: 16500, growth: 15.6, revenue: 5200000, profit: 1040000 },
  { month: 'Dec', sales: 6800000, orders: 34000, customers: 21000, growth: 30.8, revenue: 6800000, profit: 1360000 }
];

export const categoryTrendsData = [
  { category: 'Electronics', jan: 850000, feb: 780000, mar: 920000, apr: 1050000, may: 980000, jun: 1200000, growth: 15.2 },
  { category: 'Fashion', jan: 650000, feb: 580000, mar: 720000, apr: 820000, may: 750000, jun: 890000, growth: 12.8 },
  { category: 'Home & Garden', jan: 420000, feb: 390000, mar: 480000, apr: 520000, may: 490000, jun: 580000, growth: 11.5 },
  { category: 'Books', jan: 180000, feb: 160000, mar: 200000, apr: 220000, may: 210000, jun: 240000, growth: 8.7 },
  { category: 'Sports', jan: 290000, feb: 270000, mar: 320000, apr: 350000, may: 340000, jun: 390000, growth: 14.2 }
];

export const customerSegmentData = [
  { segment: 'New Customers', count: 45200, percentage: 35, revenue: 1580000, growth: 28.5 },
  { segment: 'Returning Customers', count: 58700, percentage: 45, revenue: 2350000, growth: 12.3 },
  { segment: 'VIP Customers', count: 12800, percentage: 10, revenue: 1920000, growth: 18.7 },
  { segment: 'Premium Members', count: 13100, percentage: 10, revenue: 1650000, growth: 22.1 }
];

export const monthlyGoalsData = [
  { metric: 'Sales Revenue', target: 4000000, actual: 3500000, achievement: 87.5, status: 'warning' },
  { metric: 'New Customers', target: 12000, actual: 11200, achievement: 93.3, status: 'good' },
  { metric: 'Order Volume', target: 18000, actual: 17500, achievement: 97.2, status: 'excellent' },
  { metric: 'Profit Margin', target: 22, actual: 20, achievement: 90.9, status: 'good' }
];

export const predictiveData = [
  { month: 'Jul', actual: 3800000, predicted: 3750000, confidence: 85 },
  { month: 'Aug', actual: 3600000, predicted: 3650000, confidence: 82 },
  { month: 'Sep', actual: 4200000, predicted: 4100000, confidence: 88 },
  { month: 'Oct', actual: null, predicted: 4650000, confidence: 78 },
  { month: 'Nov', actual: null, predicted: 5100000, confidence: 75 },
  { month: 'Dec', actual: null, predicted: 5800000, confidence: 72 }
];
