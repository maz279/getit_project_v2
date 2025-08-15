/**
 * Navigation Search Service
 * Comprehensive page and menu search functionality for the entire application
 * Enables users to search for any page or menu item and navigate directly to it
 */

export interface NavigationItem {
  id: string;
  title: string;
  description: string;
  route: string;
  category: 'customer' | 'vendor' | 'admin' | 'auth' | 'support' | 'company';
  keywords: string[];
  icon?: string;
  requiresAuth?: boolean;
  requiresRole?: 'customer' | 'vendor' | 'admin';
  bengaliTitle?: string;
  bengaliDescription?: string;
}

export interface NavigationSearchResult {
  item: NavigationItem;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'keyword' | 'description';
  highlightText?: string;
}

class NavigationSearchService {
  private static instance: NavigationSearchService;
  private navigationItems: NavigationItem[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): NavigationSearchService {
    if (!NavigationSearchService.instance) {
      NavigationSearchService.instance = new NavigationSearchService();
    }
    return NavigationSearchService.instance;
  }

  /**
   * Initialize the navigation index with all available pages and menus
   */
  public initialize(): void {
    if (this.initialized) return;

    this.navigationItems = [
      // === CUSTOMER DOMAIN PAGES ===
      {
        id: 'home',
        title: 'Home',
        description: 'Main homepage with featured products and deals',
        route: '/',
        category: 'customer',
        keywords: ['home', 'homepage', 'main', 'index', 'featured', 'deals'],
        icon: 'Home',
        bengaliTitle: 'হোম',
        bengaliDescription: 'প্রধান হোমপেজ ফিচার্ড পণ্য এবং অফার সহ'
      },

      // === AUTHENTICATION PAGES ===
      {
        id: 'login',
        title: 'Login',
        description: 'Sign in to your account',
        route: '/login',
        category: 'authentication',
        keywords: ['login', 'signin', 'sign-in', 'account', 'access'],
        icon: 'LogIn',
        bengaliTitle: 'লগইন',
        bengaliDescription: 'আপনার অ্যাকাউন্টে সাইন ইন করুন'
      },
      {
        id: 'register',
        title: 'Register',
        description: 'Create a new account',
        route: '/register',
        category: 'authentication',
        keywords: ['register', 'signup', 'sign-up', 'create', 'account', 'new'],
        icon: 'UserPlus',
        bengaliTitle: 'নিবন্ধন',
        bengaliDescription: 'একটি নতুন অ্যাকাউন্ট তৈরি করুন'
      },
      {
        id: 'signup',
        title: 'Sign Up',
        description: 'Join our platform',
        route: '/signup',
        category: 'authentication',
        keywords: ['signup', 'sign-up', 'register', 'join', 'new', 'account'],
        icon: 'UserPlus',
        bengaliTitle: 'সাইন আপ',
        bengaliDescription: 'আমাদের প্ল্যাটফর্মে যোগ দিন'
      },
      {
        id: 'verify-email',
        title: 'Verify Email',
        description: 'Verify your email address',
        route: '/verify-email',
        category: 'authentication',
        keywords: ['verify', 'email', 'confirmation', 'activate'],
        icon: 'Mail',
        bengaliTitle: 'ইমেইল যাচাই',
        bengaliDescription: 'আপনার ইমেইল ঠিকানা যাচাই করুন'
      },

      // === CUSTOMER JOURNEY PAGES ===
      {
        id: 'discover',
        title: 'Discover',
        description: 'Discover new products and trends',
        route: '/discover',
        category: 'customer',
        keywords: ['discover', 'discovery', 'explore', 'find', 'browse'],
        icon: 'Compass',
        bengaliTitle: 'আবিষ্কার',
        bengaliDescription: 'নতুন পণ্য এবং ট্রেন্ড আবিষ্কার করুন'
      },
      {
        id: 'product-discovery',
        title: 'Product Discovery',
        description: 'Advanced product discovery experience',
        route: '/product-discovery',
        category: 'customer',
        keywords: ['product', 'discovery', 'search', 'explore', 'find'],
        icon: 'Search',
        bengaliTitle: 'পণ্য আবিষ্কার',
        bengaliDescription: 'উন্নত পণ্য আবিষ্কার অভিজ্ঞতা'
      },
      {
        id: 'category-browse',
        title: 'Category Browse',
        description: 'Browse products by category',
        route: '/category-browse',
        category: 'customer',
        keywords: ['category', 'browse', 'organize', 'filter', 'sort'],
        icon: 'Grid',
        bengaliTitle: 'ক্যাটেগরি ব্রাউজ',
        bengaliDescription: 'ক্যাটেগরি অনুযায়ী পণ্য ব্রাউজ করুন'
      },
      {
        id: 'deals-page',
        title: 'Deals',
        description: 'All current deals and offers',
        route: '/deals',
        category: 'customer',
        keywords: ['deals', 'offers', 'discounts', 'sale', 'promotion'],
        icon: 'Tag',
        bengaliTitle: 'ডিল',
        bengaliDescription: 'সকল বর্তমান ডিল এবং অফার'
      },
      {
        id: 'trending',
        title: 'Trending',
        description: 'Trending products and popular items',
        route: '/trending',
        category: 'customer',
        keywords: ['trending', 'popular', 'hot', 'viral', 'demand'],
        icon: 'TrendingUp',
        bengaliTitle: 'ট্রেন্ডিং',
        bengaliDescription: 'ট্রেন্ডিং পণ্য এবং জনপ্রিয় আইটেম'
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        description: 'Personalized product recommendations',
        route: '/recommendations',
        category: 'customer',
        keywords: ['recommendations', 'suggested', 'personalized', 'for you'],
        icon: 'ThumbsUp',
        bengaliTitle: 'সুপারিশ',
        bengaliDescription: 'ব্যক্তিগতকৃত পণ্যের সুপারিশ'
      },
      {
        id: 'search-results',
        title: 'Search Results',
        description: 'Product search results',
        route: '/search',
        category: 'customer',
        keywords: ['search', 'results', 'find', 'query', 'lookup'],
        icon: 'Search',
        bengaliTitle: 'অনুসন্ধান ফলাফল',
        bengaliDescription: 'পণ্য অনুসন্ধানের ফলাফল'
      },
      {
        id: 'products',
        title: 'Products',
        description: 'Browse all available products',
        route: '/products',
        category: 'customer',
        keywords: ['products', 'browse', 'shop', 'items', 'catalog'],
        icon: 'Package',
        bengaliTitle: 'পণ্যসমূহ',
        bengaliDescription: 'সকল উপলব্ধ পণ্য ব্রাউজ করুন'
      },
      {
        id: 'categories',
        title: 'Categories',
        description: 'Browse products by category',
        route: '/categories',
        category: 'customer',
        keywords: ['categories', 'browse', 'organize', 'sections'],
        icon: 'Grid',
        bengaliTitle: 'ক্যাটেগরি',
        bengaliDescription: 'ক্যাটেগরি অনুযায়ী পণ্য ব্রাউজ করুন'
      },
      {
        id: 'womens-clothing',
        title: 'Women\'s Clothing',
        description: 'Browse women\'s fashion and clothing',
        route: '/womens-clothing',
        category: 'customer',
        keywords: ['womens', 'women', 'clothing', 'fashion', 'dress', 'saree'],
        icon: 'ShirtIcon',
        bengaliTitle: 'মহিলাদের পোশাক',
        bengaliDescription: 'মহিলাদের ফ্যাশন এবং পোশাক ব্রাউজ করুন'
      },
      {
        id: 'bestsellers',
        title: 'Best Sellers',
        description: 'Most popular and best-selling products',
        route: '/bestsellers',
        category: 'customer',
        keywords: ['bestsellers', 'popular', 'top', 'trending', 'best'],
        icon: 'TrendingUp',
        bengaliTitle: 'বেস্ট সেলার',
        bengaliDescription: 'সবচেয়ে জনপ্রিয় এবং বেস্ট সেলিং পণ্য'
      },
      {
        id: 'new-arrivals',
        title: 'New Arrivals',
        description: 'Latest products and new additions',
        route: '/new-arrivals',
        category: 'customer',
        keywords: ['new', 'arrivals', 'latest', 'fresh', 'recent'],
        icon: 'Sparkles',
        bengaliTitle: 'নতুন আগমন',
        bengaliDescription: 'সর্বশেষ পণ্য এবং নতুন সংযোজন'
      },
      {
        id: 'wishlist',
        title: 'Wishlist',
        description: 'Your saved and favorite products',
        route: '/wishlist',
        category: 'customer',
        keywords: ['wishlist', 'favorites', 'saved', 'liked'],
        icon: 'Heart',
        requiresAuth: true,
        bengaliTitle: 'উইশলিস্ট',
        bengaliDescription: 'আপনার সংরক্ষিত এবং প্রিয় পণ্য'
      },
      {
        id: 'cart',
        title: 'Shopping Cart',
        description: 'Your shopping cart and checkout',
        route: '/cart',
        category: 'customer',
        keywords: ['cart', 'shopping', 'checkout', 'buy'],
        icon: 'ShoppingCart',
        bengaliTitle: 'শপিং কার্ট',
        bengaliDescription: 'আপনার শপিং কার্ট এবং চেকআউট'
      },
      {
        id: 'bulk-orders',
        title: 'Bulk Orders',
        description: 'Place large quantity orders',
        route: '/bulk-orders',
        category: 'customer',
        keywords: ['bulk', 'wholesale', 'quantity', 'large'],
        icon: 'Package2',
        bengaliTitle: 'বাল্ক অর্ডার',
        bengaliDescription: 'বড় পরিমাণে অর্ডার করুন'
      },

      // === PROMOTIONS & DEALS ===
      {
        id: 'flash-sale',
        title: 'Flash Sale',
        description: 'Limited time flash sale offers',
        route: '/flash-sale',
        category: 'customer',
        keywords: ['flash', 'sale', 'discount', 'limited', 'offer'],
        icon: 'Zap',
        bengaliTitle: 'ফ্ল্যাশ সেল',
        bengaliDescription: 'সীমিত সময়ের ফ্ল্যাশ সেল অফার'
      },
      {
        id: 'daily-deals',
        title: 'Daily Deals',
        description: 'Today\'s special deals and offers',
        route: '/daily-deals',
        category: 'customer',
        keywords: ['daily', 'deals', 'today', 'special', 'offer'],
        icon: 'Calendar',
        bengaliTitle: 'ডেইলি ডিল',
        bengaliDescription: 'আজকের বিশেষ ডিল এবং অফার'
      },
      {
        id: 'mega-sale',
        title: 'Mega Sale',
        description: 'Huge discounts and mega sale event',
        route: '/mega-sale',
        category: 'customer',
        keywords: ['mega', 'sale', 'huge', 'discount', 'event'],
        icon: 'Tag',
        bengaliTitle: 'মেগা সেল',
        bengaliDescription: 'বিশাল ছাড় এবং মেগা সেল ইভেন্ট'
      },

      // === ACCOUNT & PROFILE ===
      {
        id: 'my-account',
        title: 'My Account',
        description: 'Your account dashboard and profile',
        route: '/my-account',
        category: 'customer',
        keywords: ['account', 'profile', 'dashboard', 'personal'],
        icon: 'User',
        requiresAuth: true,
        bengaliTitle: 'আমার অ্যাকাউন্ট',
        bengaliDescription: 'আপনার অ্যাকাউন্ট ড্যাশবোর্ড এবং প্রোফাইল'
      },
      {
        id: 'orders',
        title: 'My Orders',
        description: 'View and manage your orders',
        route: '/orders',
        category: 'customer',
        keywords: ['orders', 'history', 'purchases', 'manage'],
        icon: 'Package',
        requiresAuth: true,
        bengaliTitle: 'আমার অর্ডার',
        bengaliDescription: 'আপনার অর্ডার দেখুন এবং পরিচালনা করুন'
      },
      {
        id: 'order-tracking',
        title: 'Track Order',
        description: 'Track your order status and delivery',
        route: '/track-order',
        category: 'customer',
        keywords: ['track', 'tracking', 'delivery', 'status'],
        icon: 'Truck',
        bengaliTitle: 'অর্ডার ট্র্যাক',
        bengaliDescription: 'আপনার অর্ডার স্ট্যাটাস এবং ডেলিভারি ট্র্যাক করুন'
      },
      {
        id: 'settings',
        title: 'Account Settings',
        description: 'Manage your account preferences',
        route: '/settings',
        category: 'customer',
        keywords: ['settings', 'preferences', 'config', 'account'],
        icon: 'Settings',
        requiresAuth: true,
        bengaliTitle: 'অ্যাকাউন্ট সেটিংস',
        bengaliDescription: 'আপনার অ্যাকাউন্ট পছন্দ পরিচালনা করুন'
      },
      {
        id: 'security-settings',
        title: 'Security Settings',
        description: 'Password and security preferences',
        route: '/security-settings',
        category: 'customer',
        keywords: ['security', 'password', 'privacy', 'protection'],
        icon: 'Shield',
        requiresAuth: true,
        bengaliTitle: 'নিরাপত্তা সেটিংস',
        bengaliDescription: 'পাসওয়ার্ড এবং নিরাপত্তা পছন্দ'
      },
      {
        id: 'payment-methods',
        title: 'Payment Methods',
        description: 'Manage your payment options',
        route: '/payment-methods',
        category: 'customer',
        keywords: ['payment', 'methods', 'cards', 'billing'],
        icon: 'CreditCard',
        requiresAuth: true,
        bengaliTitle: 'পেমেন্ট পদ্ধতি',
        bengaliDescription: 'আপনার পেমেন্ট অপশন পরিচালনা করুন'
      },

      // === AUTHENTICATION ===
      {
        id: 'login',
        title: 'Login',
        description: 'Sign in to your account',
        route: '/login',
        category: 'auth',
        keywords: ['login', 'signin', 'authenticate', 'enter'],
        icon: 'LogIn',
        bengaliTitle: 'লগইন',
        bengaliDescription: 'আপনার অ্যাকাউন্টে সাইন ইন করুন'
      },
      {
        id: 'signup',
        title: 'Sign Up',
        description: 'Create a new account',
        route: '/signup',
        category: 'auth',
        keywords: ['signup', 'register', 'create', 'new'],
        icon: 'UserPlus',
        bengaliTitle: 'সাইন আপ',
        bengaliDescription: 'একটি নতুন অ্যাকাউন্ট তৈরি করুন'
      },

      // === VENDOR DOMAIN ===
      {
        id: 'vendor-center',
        title: 'Vendor Center',
        description: 'Vendor dashboard and management',
        route: '/vendor/center',
        category: 'vendor',
        keywords: ['vendor', 'seller', 'dashboard', 'manage'],
        icon: 'Store',
        requiresAuth: true,
        requiresRole: 'vendor',
        bengaliTitle: 'ভেন্ডর সেন্টার',
        bengaliDescription: 'ভেন্ডর ড্যাশবোর্ড এবং ব্যবস্থাপনা'
      },
      {
        id: 'vendor-register',
        title: 'Become a Vendor',
        description: 'Register as a vendor to sell products',
        route: '/vendor/register',
        category: 'vendor',
        keywords: ['vendor', 'register', 'seller', 'become'],
        icon: 'ShoppingBag',
        bengaliTitle: 'ভেন্ডর হন',
        bengaliDescription: 'পণ্য বিক্রয়ের জন্য ভেন্ডর হিসেবে নিবন্ধন করুন'
      },
      {
        id: 'vendor-login',
        title: 'Vendor Login',
        description: 'Vendor account sign in',
        route: '/vendor/login',
        category: 'vendor',
        keywords: ['vendor', 'login', 'seller', 'signin'],
        icon: 'LogIn',
        bengaliTitle: 'ভেন্ডর লগইন',
        bengaliDescription: 'ভেন্ডর অ্যাকাউন্ট সাইন ইন'
      },

      // === SUPPORT & HELP ===
      {
        id: 'customer-support',
        title: 'Customer Support',
        description: 'Get help and support',
        route: '/customer-support',
        category: 'support',
        keywords: ['support', 'help', 'customer', 'assistance'],
        icon: 'HeadphonesIcon',
        bengaliTitle: 'কাস্টমার সাপোর্ট',
        bengaliDescription: 'সাহায্য এবং সহায়তা পান'
      },
      {
        id: 'help-center',
        title: 'Help Center',
        description: 'FAQ and help documentation',
        route: '/help-center',
        category: 'support',
        keywords: ['help', 'faq', 'documentation', 'guide'],
        icon: 'HelpCircle',
        bengaliTitle: 'হেল্প সেন্টার',
        bengaliDescription: 'FAQ এবং সাহায্য ডকুমেন্টেশন'
      },
      {
        id: 'ai-support',
        title: 'AI Support',
        description: 'AI-powered customer assistance',
        route: '/ai-support',
        category: 'support',
        keywords: ['ai', 'support', 'chatbot', 'assistance'],
        icon: 'Bot',
        bengaliTitle: 'AI সাপোর্ট',
        bengaliDescription: 'AI-চালিত কাস্টমার সহায়তা'
      },

      // === COMPANY & INFO ===
      {
        id: 'about-us',
        title: 'About Us',
        description: 'Learn about our company and mission',
        route: '/about-us',
        category: 'company',
        keywords: ['about', 'company', 'mission', 'team'],
        icon: 'Info',
        bengaliTitle: 'আমাদের সম্পর্কে',
        bengaliDescription: 'আমাদের কোম্পানি এবং মিশন সম্পর্কে জানুন'
      },
      {
        id: 'privacy-policy',
        title: 'Privacy Policy',
        description: 'Our privacy policy and data protection',
        route: '/privacy-policy',
        category: 'company',
        keywords: ['privacy', 'policy', 'data', 'protection'],
        icon: 'Shield',
        bengaliTitle: 'গোপনীয়তা নীতি',
        bengaliDescription: 'আমাদের গোপনীয়তা নীতি এবং ডেটা সুরক্ষা'
      },
      {
        id: 'terms-of-service',
        title: 'Terms of Service',
        description: 'Terms and conditions of use',
        route: '/terms-of-service',
        category: 'company',
        keywords: ['terms', 'service', 'conditions', 'legal'],
        icon: 'FileText',
        bengaliTitle: 'সেবার শর্তাবলী',
        bengaliDescription: 'ব্যবহারের শর্তাবলী'
      },

      // === COMPREHENSIVE ADMIN DOMAIN ===
      {
        id: 'admin-dashboard-overview',
        title: 'Admin Dashboard Overview',
        description: 'Administrative control panel overview',
        route: '/admin/dashboard/overview',
        category: 'admin',
        keywords: ['admin', 'dashboard', 'overview', 'control', 'management'],
        icon: 'LayoutDashboard',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'অ্যাডমিন ড্যাশবোর্ড ওভারভিউ',
        bengaliDescription: 'প্রশাসনিক নিয়ন্ত্রণ প্যানেল ওভারভিউ'
      },
      {
        id: 'business-intelligence-dashboard',
        title: 'Business Intelligence',
        description: 'Advanced business intelligence dashboard',
        route: '/admin/business-intelligence',
        category: 'admin',
        keywords: ['business', 'intelligence', 'bi', 'analytics', 'insights'],
        icon: 'Brain',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'ব্যবসায়িক বুদ্ধিমত্তা',
        bengaliDescription: 'উন্নত ব্যবসায়িক বুদ্ধিমত্তা ড্যাশবোর্ড'
      },
      {
        id: 'fraud-detection-center',
        title: 'Fraud Detection Center',
        description: 'Fraud detection and security monitoring',
        route: '/admin/fraud-detection',
        category: 'admin',
        keywords: ['fraud', 'detection', 'security', 'protection', 'monitoring'],
        icon: 'Shield',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'জালিয়াতি সনাক্তকরণ কেন্দ্র',
        bengaliDescription: 'জালিয়াতি সনাক্তকরণ এবং নিরাপত্তা নিরীক্ষণ'
      },
      {
        id: 'admin-vendors-management',
        title: 'Vendor Management',
        description: 'Manage vendors and seller accounts',
        route: '/admin/vendors',
        category: 'admin',
        keywords: ['vendors', 'sellers', 'manage', 'registration', 'approval'],
        icon: 'Store',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'ভেন্ডর ব্যবস্থাপনা',
        bengaliDescription: 'ভেন্ডর এবং বিক্রেতা অ্যাকাউন্ট পরিচালনা'
      },
      {
        id: 'admin-products-management',
        title: 'Product Management',
        description: 'Manage products, catalog and inventory',
        route: '/admin/products',
        category: 'admin',
        keywords: ['products', 'catalog', 'manage', 'inventory', 'moderation'],
        icon: 'Package',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'পণ্য ব্যবস্থাপনা',
        bengaliDescription: 'পণ্য, ক্যাটালগ এবং ইনভেন্টরি পরিচালনা'
      },
      {
        id: 'admin-orders-management',
        title: 'Order Management',
        description: 'Manage all orders and transactions',
        route: '/admin/orders',
        category: 'admin',
        keywords: ['orders', 'transactions', 'processing', 'fulfillment'],
        icon: 'ShoppingCart',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'অর্ডার ব্যবস্থাপনা',
        bengaliDescription: 'সকল অর্ডার এবং লেনদেন পরিচালনা'
      },
      {
        id: 'admin-customers-management',
        title: 'Customer Management',
        description: 'Manage customers and user accounts',
        route: '/admin/customers',
        category: 'admin',
        keywords: ['customers', 'users', 'accounts', 'segments', 'profiles'],
        icon: 'Users',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'গ্রাহক ব্যবস্থাপনা',
        bengaliDescription: 'গ্রাহক এবং ব্যবহারকারী অ্যাকাউন্ট পরিচালনা'
      },
      {
        id: 'admin-analytics-dashboard',
        title: 'Analytics Dashboard',
        description: 'Business analytics and comprehensive reports',
        route: '/admin/analytics',
        category: 'admin',
        keywords: ['analytics', 'reports', 'data', 'insights', 'metrics'],
        icon: 'BarChart',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'অ্যানালিটিক্স ড্যাশবোর্ড',
        bengaliDescription: 'ব্যবসায়িক অ্যানালিটিক্স এবং ব্যাপক রিপোর্ট'
      },
      {
        id: 'sales-analytics-admin',
        title: 'Sales Analytics',
        description: 'Sales performance and revenue analytics',
        route: '/admin/analytics/sales',
        category: 'admin',
        keywords: ['sales', 'revenue', 'performance', 'analytics', 'forecast'],
        icon: 'TrendingUp',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'বিক্রয় অ্যানালিটিক্স',
        bengaliDescription: 'বিক্রয় কর্মক্ষমতা এবং রাজস্ব বিশ্লেষণ'
      },
      {
        id: 'user-analytics-admin',
        title: 'User Analytics',
        description: 'User behavior and engagement analytics',
        route: '/admin/users/analytics',
        category: 'admin',
        keywords: ['user', 'behavior', 'engagement', 'analytics', 'activity'],
        icon: 'UserCheck',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'ব্যবহারকারী অ্যানালিটিক্স',
        bengaliDescription: 'ব্যবহারকারীর আচরণ এবং সম্পৃক্ততা বিশ্লেষণ'
      },
      {
        id: 'audit-dashboard-admin',
        title: 'Audit Dashboard',
        description: 'System audit and compliance monitoring',
        route: '/admin/audit',
        category: 'admin',
        keywords: ['audit', 'compliance', 'monitoring', 'logs', 'tracking'],
        icon: 'FileSearch',
        requiresAuth: true,
        requiresRole: 'admin',
        bengaliTitle: 'অডিট ড্যাশবোর্ড',
        bengaliDescription: 'সিস্টেম অডিট এবং সম্মতি নিরীক্ষণ'
      },

      // === COMPREHENSIVE VENDOR DOMAIN ===
      {
        id: 'seller-center-hub',
        title: 'Seller Center',
        description: 'Complete seller management hub',
        route: '/seller-center',
        category: 'vendor',
        keywords: ['seller', 'center', 'vendor', 'management', 'hub'],
        icon: 'Store',
        requiresAuth: true,
        bengaliTitle: 'বিক্রেতা কেন্দ্র',
        bengaliDescription: 'সম্পূর্ণ বিক্রেতা ব্যবস্থাপনা কেন্দ্র'
      },
      {
        id: 'vendor-dashboard-control',
        title: 'Vendor Dashboard',
        description: 'Vendor control panel and overview',
        route: '/vendor/dashboard',
        category: 'vendor',
        keywords: ['vendor', 'dashboard', 'control', 'panel', 'overview'],
        icon: 'BarChart3',
        requiresAuth: true,
        bengaliTitle: 'ভেন্ডর ড্যাশবোর্ড',
        bengaliDescription: 'ভেন্ডর কন্ট্রোল প্যানেল এবং ওভারভিউ'
      },
      {
        id: 'enterprise-vendor-advanced',
        title: 'Enterprise Vendor Dashboard',
        description: 'Advanced vendor dashboard for enterprise sellers',
        route: '/vendor/enterprise-dashboard',
        category: 'vendor',
        keywords: ['enterprise', 'vendor', 'dashboard', 'advanced', 'business'],
        icon: 'Building2',
        requiresAuth: true,
        bengaliTitle: 'এন্টারপ্রাইজ ভেন্ডর ড্যাশবোর্ড',
        bengaliDescription: 'এন্টারপ্রাইজ বিক্রেতাদের জন্য উন্নত ভেন্ডর ড্যাশবোর্ড'
      },

      // === DEMO AND TESTING PAGES ===
      {
        id: 'performance-test-page',
        title: 'Performance Test',
        description: 'System performance testing dashboard',
        route: '/performance-test',
        category: 'demo',
        keywords: ['performance', 'test', 'benchmark', 'speed', 'optimization'],
        icon: 'Zap',
        bengaliTitle: 'পারফরম্যান্স টেস্ট',
        bengaliDescription: 'সিস্টেম পারফরম্যান্স টেস্টিং ড্যাশবোর্ড'
      },
      {
        id: 'optimization-dashboard-main',
        title: 'Optimization Dashboard',
        description: 'System optimization and monitoring',
        route: '/optimization',
        category: 'demo',
        keywords: ['optimization', 'monitoring', 'performance', 'efficiency'],
        icon: 'Settings',
        bengaliTitle: 'অপটিমাইজেশন ড্যাশবোর্ড',
        bengaliDescription: 'সিস্টেম অপটিমাইজেশন এবং মনিটরিং'
      },
      {
        id: 'notification-demo-page',
        title: 'Notification Demo',
        description: 'Notification system demonstration',
        route: '/notification-demo',
        category: 'demo',
        keywords: ['notification', 'demo', 'alerts', 'messaging', 'system'],
        icon: 'Bell',
        bengaliTitle: 'নোটিফিকেশন ডেমো',
        bengaliDescription: 'নোটিফিকেশন সিস্টেম প্রদর্শনী'
      },
      {
        id: 'shipping-demo-page',
        title: 'Shipping Demo',
        description: 'Advanced shipping platform demonstration',
        route: '/shipping-demo',
        category: 'demo',
        keywords: ['shipping', 'demo', 'delivery', 'logistics', 'platform'],
        icon: 'Truck',
        bengaliTitle: 'শিপিং ডেমো',
        bengaliDescription: 'উন্নত শিপিং প্ল্যাটফর্ম প্রদর্শনী'
      },

      // === SOCIAL COMMERCE AND ADVANCED FEATURES ===
      {
        id: 'social-commerce-hub',
        title: 'Social Commerce Dashboard',
        description: 'Social shopping and community features',
        route: '/social-commerce',
        category: 'customer',
        keywords: ['social', 'commerce', 'community', 'sharing', 'friends'],
        icon: 'Users',
        bengaliTitle: 'সামাজিক বাণিজ্য ড্যাশবোর্ড',
        bengaliDescription: 'সামাজিক শপিং এবং কমিউনিটি বৈশিষ্ট্য'
      },

      // === ADDITIONAL MISSING CUSTOMER PAGES ===
      {
        id: 'subscription-center-main',
        title: 'Subscription Center',
        description: 'Manage subscriptions and recurring orders',
        route: '/subscription-center',
        category: 'customer',
        keywords: ['subscription', 'recurring', 'auto-order', 'manage'],
        icon: 'RefreshCw',
        requiresAuth: true,
        bengaliTitle: 'সাবস্ক্রিপশন সেন্টার',
        bengaliDescription: 'সাবস্ক্রিপশন এবং পুনরাবৃত্ত অর্ডার পরিচালনা'
      },
      {
        id: 'customer-analytics-main',
        title: 'Customer Analytics',
        description: 'Your shopping analytics and insights',
        route: '/customer-analytics',
        category: 'customer',
        keywords: ['analytics', 'insights', 'data', 'statistics', 'shopping'],
        icon: 'BarChart',
        requiresAuth: true,
        bengaliTitle: 'গ্রাহক অ্যানালিটিক্স',
        bengaliDescription: 'আপনার শপিং অ্যানালিটিক্স এবং অন্তর্দৃষ্টি'
      },
      {
        id: 'review-center-main',
        title: 'Review Center',
        description: 'Write and manage product reviews',
        route: '/review-center',
        category: 'customer',
        keywords: ['review', 'rating', 'feedback', 'write', 'manage'],
        icon: 'Star',
        requiresAuth: true,
        bengaliTitle: 'রিভিউ সেন্টার',
        bengaliDescription: 'পণ্যের রিভিউ লিখুন এবং পরিচালনা করুন'
      },
      {
        id: 'notification-center-main',
        title: 'Notification Center',
        description: 'Manage your notifications and alerts',
        route: '/notification-center',
        category: 'customer',
        keywords: ['notifications', 'alerts', 'messages', 'updates'],
        icon: 'Bell',
        requiresAuth: true,
        bengaliTitle: 'নোটিফিকেশন সেন্টার',
        bengaliDescription: 'আপনার নোটিফিকেশন এবং সতর্কতা পরিচালনা'
      },
      {
        id: 'order-tracking-advanced-main',
        title: 'Advanced Order Tracking',
        description: 'Advanced order tracking with detailed insights',
        route: '/order-tracking-advanced',
        category: 'customer',
        keywords: ['order', 'tracking', 'advanced', 'detailed', 'status'],
        icon: 'MapPin',
        requiresAuth: true,
        bengaliTitle: 'উন্নত অর্ডার ট্র্যাকিং',
        bengaliDescription: 'বিস্তারিত অন্তর্দৃষ্টি সহ উন্নত অর্ডার ট্র্যাকিং'
      },
      {
        id: 'product-comparison-main',
        title: 'Product Comparison',
        description: 'Compare products side by side',
        route: '/product-comparison',
        category: 'customer',
        keywords: ['compare', 'comparison', 'side-by-side', 'analyze'],
        icon: 'GitCompare',
        bengaliTitle: 'পণ্য তুলনা',
        bengaliDescription: 'পণ্যগুলি পাশাপাশি তুলনা করুন'
      },
      {
        id: 'advanced-checkout-main',
        title: 'Advanced Checkout',
        description: 'Enhanced checkout experience',
        route: '/advanced-checkout',
        category: 'customer',
        keywords: ['checkout', 'advanced', 'enhanced', 'payment'],
        icon: 'CreditCard',
        bengaliTitle: 'উন্নত চেকআউট',
        bengaliDescription: 'উন্নত চেকআউট অভিজ্ঞতা'
      },
      {
        id: 'wishlist-manager-main',
        title: 'Wishlist Manager',
        description: 'Advanced wishlist management',
        route: '/wishlist-manager',
        category: 'customer',
        keywords: ['wishlist', 'manager', 'advanced', 'organize', 'save'],
        icon: 'Heart',
        requiresAuth: true,
        bengaliTitle: 'উইশলিস্ট ম্যানেজার',
        bengaliDescription: 'উন্নত উইশলিস্ট ব্যবস্থাপনা'
      }
    ];

    this.initialized = true;
    console.log(`NavigationSearchService initialized with ${this.navigationItems.length} pages`);
  }

  /**
   * Search for pages and menus based on query
   */
  public search(
    query: string,
    options: {
      category?: NavigationItem['category'];
      language?: 'en' | 'bn';
      requiresAuth?: boolean;
      userRole?: 'customer' | 'vendor' | 'admin';
      limit?: number;
    } = {}
  ): NavigationSearchResult[] {
    if (!this.initialized) {
      this.initialize();
    }

    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const { category, language = 'en', userRole, limit = 10 } = options;
    
    const results: NavigationSearchResult[] = [];

    // Filter items based on permissions and category
    const filteredItems = this.navigationItems.filter(item => {
      // Category filter
      if (category && item.category !== category) return false;
      
      // Auth requirement filter
      if (item.requiresAuth && !userRole) return false;
      
      // Role requirement filter
      if (item.requiresRole && item.requiresRole !== userRole) return false;
      
      return true;
    });

    // Search through filtered items
    for (const item of filteredItems) {
      const title = language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title;
      const description = language === 'bn' && item.bengaliDescription ? item.bengaliDescription : item.description;
      
      // Exact title match
      if (title.toLowerCase() === normalizedQuery) {
        results.push({
          item,
          relevanceScore: 1.0,
          matchType: 'exact',
          highlightText: title
        });
        continue;
      }

      // Partial title match
      if (title.toLowerCase().includes(normalizedQuery)) {
        results.push({
          item,
          relevanceScore: 0.9,
          matchType: 'partial',
          highlightText: title
        });
        continue;
      }

      // Keyword match
      const keywordMatch = item.keywords.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(keyword.toLowerCase())
      );
      
      if (keywordMatch) {
        results.push({
          item,
          relevanceScore: 0.8,
          matchType: 'keyword',
          highlightText: title
        });
        continue;
      }

      // Description match
      if (description.toLowerCase().includes(normalizedQuery)) {
        results.push({
          item,
          relevanceScore: 0.6,
          matchType: 'description',
          highlightText: title
        });
        continue;
      }

      // Route match (e.g., searching for "vendor/register")
      if (item.route.toLowerCase().includes(normalizedQuery)) {
        results.push({
          item,
          relevanceScore: 0.7,
          matchType: 'partial',
          highlightText: title
        });
      }
    }

    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return limited results
    return results.slice(0, limit);
  }

  /**
   * Get popular pages based on category
   */
  public getPopularPages(category?: NavigationItem['category']): NavigationItem[] {
    if (!this.initialized) {
      this.initialize();
    }

    const popularIds = [
      'home', 'products', 'categories', 'bestsellers', 'new-arrivals',
      'cart', 'wishlist', 'my-account', 'orders', 'customer-support'
    ];

    return this.navigationItems
      .filter(item => {
        if (category && item.category !== category) return false;
        return popularIds.includes(item.id);
      })
      .sort((a, b) => popularIds.indexOf(a.id) - popularIds.indexOf(b.id));
  }

  /**
   * Get all navigation items by category
   */
  public getItemsByCategory(category: NavigationItem['category']): NavigationItem[] {
    if (!this.initialized) {
      this.initialize();
    }

    return this.navigationItems.filter(item => item.category === category);
  }

  /**
   * Get a specific navigation item by ID
   */
  public getItemById(id: string): NavigationItem | undefined {
    if (!this.initialized) {
      this.initialize();
    }

    return this.navigationItems.find(item => item.id === id);
  }
}

export default NavigationSearchService;