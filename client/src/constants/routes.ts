
/**
 * Centralized Routing Configuration
 * Complete route mapping for domain-driven architecture
 */

export const ROUTES = {
  // Main routes
  HOME: '/',
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/signup',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // Customer Domain Routes
  CUSTOMER: {
    HOMEPAGE: '/customer/homepage',
    PROFILE: '/customer/profile',
    SETTINGS: '/customer/settings',
    ORDERS: '/customer/orders',
    WISHLIST: '/customer/wishlist',
    ANALYTICS: '/customer/analytics',
    SUPPORT: '/customer/support',
    NOTIFICATIONS: '/customer/notifications',
    REVIEWS: '/customer/reviews',
    SUBSCRIPTIONS: '/customer/subscriptions',
    RECOMMENDATIONS: '/customer/recommendations',
    DISCOVERY: '/customer/discovery',
  },
  
  // Shop
  SHOP: {
    CATEGORIES: '/categories',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id', // 🔧 Fix for 404 error
    WOMENS_FASHION: '/categories/fashion/womens-fashion',
    BEST_SELLERS: '/best-sellers',
    NEW_ARRIVALS: '/new-arrivals',
    WISHLIST: '/wishlist',
    BULK_ORDERS: '/bulk-orders',
    CART: '/cart',
    GIFT_CARDS: '/gift-cards',
    GROUP_BUY: '/group-buy',
    PREMIUM: '/premium',
    SEARCH: '/search',
    CHECKOUT: '/checkout',
    COMPARISON: '/comparison',
  },
  
  // Promotions
  PROMOTIONS: {
    FLASH_SALE: '/flash-sale',
    DAILY_DEALS: '/daily-deals',
    MEGA_SALE: '/mega-sale',
    FLASH_DEALS: '/flash-deals',
  },
  
  // Account
  ACCOUNT: {
    PROFILE: '/account',
    ORDERS: '/orders',
    SETTINGS: '/settings',
    PAYMENT_METHODS: '/payment-methods',
    SECURITY: '/account/security',
    PRIVACY: '/account/privacy',
    NOTIFICATIONS: '/account/notifications',
    LOYALTY: '/account/loyalty',
    PERSONALIZATION: '/account/personalization',
    ADDRESS_BOOK: '/account/address-book',
    ORDER_HISTORY: '/account/order-history',
  },
  
  // Orders
  ORDERS: {
    TRACKING: '/order-tracking',
    TRACK: '/track-order',
    ADVANCED_TRACKING: '/orders/advanced-tracking',
    ALL: '/orders/all',
  },
  
  // Support
  SUPPORT: {
    HELP_CENTER: '/help',
    AI_SUPPORT: '/support/ai',
    CONTACT: '/support/contact',
  },
  
  // Vendor Domain Routes
  VENDOR: {
    CENTER: '/seller-center',
    REGISTER: '/vendor/register',
    DASHBOARD: '/vendor/dashboard',
    ENTERPRISE: '/vendor/enterprise',
    KYC: '/vendor/kyc',
    PERFORMANCE: '/vendor/performance',
    PAYOUTS: '/vendor/payouts',
  },
  
  // Admin Domain Routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    BUSINESS_INTELLIGENCE: '/admin/business-intelligence',
    FRAUD_DETECTION: '/admin/fraud-detection',
    ORDERS: '/admin/orders',
    PRODUCTS: '/admin/products',
    CUSTOMERS: '/admin/customers',
    VENDORS: '/admin/vendors',
    USERS: '/admin/users',
    SALES: '/admin/sales',
    REPORTS: '/admin/reports',
    AUDIT: '/admin/audit',
    SENTIMENT: '/admin/sentiment',
    NOTIFICATIONS: '/admin/notifications',
    SHIPPING: '/admin/shipping',
    REAL_TIME_METRICS: '/admin/real-time-metrics',
    KPI_MONITORING: '/admin/kpi-monitoring',
    PERFORMANCE_INSIGHTS: '/admin/performance-insights',
  },
  
  // Analytics Domain Routes
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REAL_TIME: '/analytics/real-time',
    BUSINESS_INTELLIGENCE: '/analytics/business-intelligence',
    PREDICTIVE: '/analytics/predictive',
    CLICKHOUSE: '/analytics/clickhouse',
  },
  
  // Live Commerce Routes
  LIVE_COMMERCE: {
    DASHBOARD: '/live-commerce/dashboard',
    STREAMING: '/live-commerce/streaming',
    SOCIAL: '/live-commerce/social',
  },
  
  // Brand Routes
  BRANDS: {
    DIRECTORY: '/brands/directory',
    PROFILE: '/brands/profile',
  },
  
  // Social Commerce Routes
  SOCIAL: {
    COMMERCE: '/social/commerce',
    DASHBOARD: '/social/dashboard',
  },
  
  // Mobile Routes
  MOBILE: {
    FIRST: '/mobile/first',
    BANKING: '/mobile/banking',
  },
  
  // Journey Routes
  JOURNEY: {
    PRODUCT_DISCOVERY: '/journey/product-discovery',
    ADVANCED_SEARCH: '/journey/advanced-search',
    PRODUCT_DETAILS: '/journey/product-details',
    SHOPPING_CART: '/journey/shopping-cart',
    CHECKOUT: '/journey/checkout',
    ORDER_TRACKING: '/journey/order-tracking',
  },
  
  // Test Routes
  TEST: {
    PERFORMANCE: '/test/performance',
    PHASE_1_WEEK_3_4: '/test/phase-1-week-3-4',
    PHASE_2_DEMO: '/test/phase-2-demo',
  },
  
  // Company
  COMPANY: {
    ABOUT: '/about',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    MARKETING: '/marketing',
  },
  
  // Optimization
  OPTIMIZATION: {
    DASHBOARD: '/optimization/dashboard',
  },
  
  // Shipping
  SHIPPING: {
    DEMO: '/shipping/demo',
    INFO: '/shipping/info',
  },
  
  // Returns
  RETURNS: {
    REFUNDS: '/returns/refunds',
  },
} as const;

// Route path type for TypeScript
export type RoutePathType = typeof ROUTES;

// Flatten routes for easier searching
export const FLAT_ROUTES = Object.values(ROUTES).reduce((acc, routeGroup) => {
  if (typeof routeGroup === 'string') {
    acc.push(routeGroup);
  } else if (typeof routeGroup === 'object') {
    Object.values(routeGroup).forEach(route => {
      if (typeof route === 'string') {
        acc.push(route);
      }
    });
  }
  return acc;
}, [] as string[]);

// Route validation helper
export const isValidRoute = (path: string): boolean => {
  return FLAT_ROUTES.includes(path);
};

// Route navigation helper
export const getRouteByPattern = (pattern: string): string[] => {
  return FLAT_ROUTES.filter(route => route.includes(pattern));
};
