
// Mock data for activity reports
export const activitySummaryData = [
  { period: 'Jan', totalActivities: 12450, uniqueUsers: 3420, averageSessionTime: 8.5 },
  { period: 'Feb', totalActivities: 15600, uniqueUsers: 3890, averageSessionTime: 9.2 },
  { period: 'Mar', totalActivities: 18200, uniqueUsers: 4520, averageSessionTime: 10.1 },
  { period: 'Apr', totalActivities: 21300, uniqueUsers: 5100, averageSessionTime: 11.3 },
  { period: 'May', totalActivities: 24800, uniqueUsers: 5680, averageSessionTime: 12.0 },
  { period: 'Jun', totalActivities: 28500, uniqueUsers: 6200, averageSessionTime: 12.8 }
];

export const categoryBreakdown = [
  { category: 'Product Browsing', count: 45600, percentage: 38, color: '#3b82f6' },
  { category: 'Search Activities', count: 32400, percentage: 27, color: '#10b981' },
  { category: 'Cart Operations', count: 18900, percentage: 16, color: '#f59e0b' },
  { category: 'Account Management', count: 12800, percentage: 11, color: '#ef4444' },
  { category: 'Social Interactions', count: 9600, percentage: 8, color: '#8b5cf6' }
];

export const deviceAnalytics = [
  { device: 'Mobile', users: 24500, sessions: 45600, bounceRate: 25.4 },
  { device: 'Desktop', users: 18200, sessions: 32800, bounceRate: 18.2 },
  { device: 'Tablet', users: 8900, sessions: 15200, bounceRate: 22.8 }
];

export const peakHoursData = [
  { hour: '00:00', activities: 580 },
  { hour: '02:00', activities: 320 },
  { hour: '04:00', activities: 190 },
  { hour: '06:00', activities: 450 },
  { hour: '08:00', activities: 1200 },
  { hour: '10:00', activities: 2800 },
  { hour: '12:00', activities: 3400 },
  { hour: '14:00', activities: 2900 },
  { hour: '16:00', activities: 3200 },
  { hour: '18:00', activities: 4100 },
  { hour: '20:00', activities: 3800 },
  { hour: '22:00', activities: 2200 }
];

export const topPages = [
  { page: '/products/electronics', views: 24500, uniqueViews: 18200, avgTime: '3:45' },
  { page: '/categories/fashion', views: 18900, uniqueViews: 14600, avgTime: '4:12' },
  { page: '/deals/flash-sale', views: 15600, uniqueViews: 12800, avgTime: '2:58' },
  { page: '/search/results', views: 12400, uniqueViews: 9800, avgTime: '2:34' },
  { page: '/account/dashboard', views: 8900, uniqueViews: 7200, avgTime: '5:23' }
];
