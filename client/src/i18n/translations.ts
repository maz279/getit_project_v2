export interface Translation {
  // Navigation
  home: string;
  discover: string;
  categories: string;
  cart: string;
  account: string;
  orders: string;
  support: string;
  
  // Common Actions
  search: string;
  searchPlaceholder: string;
  addToCart: string;
  buyNow: string;
  viewDetails: string;
  showMore: string;
  showLess: string;
  loading: string;
  error: string;
  success: string;
  
  // Authentication
  login: string;
  register: string;
  logout: string;
  forgotPassword: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  
  // Product Related
  products: string;
  product: string;
  price: string;
  originalPrice: string;
  discount: string;
  inStock: string;
  outOfStock: string;
  limitedStock: string;
  freeShipping: string;
  fastDelivery: string;
  
  // Discovery Components
  aiPersonalization: string;
  aiPersonalizationDesc: string;
  trendingProducts: string;
  trendingProductsDesc: string;
  voiceSearch: string;
  voiceSearchDesc: string;
  voiceSearchPrompt: string;
  visualSearch: string;
  visualSearchDesc: string;
  liveShopping: string;
  liveShoppingDesc: string;
  socialCommerce: string;
  socialCommerceDesc: string;
  
  // Categories
  electronics: string;
  fashion: string;
  homeGarden: string;
  beauty: string;
  sports: string;
  books: string;
  automotive: string;
  babyKids: string;
  
  // Payment Methods
  bkash: string;
  nagad: string;
  rocket: string;
  creditCard: string;
  debitCard: string;
  cashOnDelivery: string;
  
  // Shipping
  shipping: string;
  freeShippingOver: string;
  standardDelivery: string;
  expressDelivery: string;
  sameDayDelivery: string;
  
  // Cultural/Bangladesh Specific
  eidCollection: string;
  prayerTimes: string;
  festivalsOffers: string;
  bangladeshMade: string;
  localVendors: string;
  
  // Company Info
  aboutUs: string;
  contactUs: string;
  privacyPolicy: string;
  termsOfService: string;
  returnPolicy: string;
  faq: string;
  
  // Footer
  quickLinks: string;
  customerService: string;
  followUs: string;
  downloadApp: string;
  newsletter: string;
  
  // Mobile Banking
  mobileBanking: string;
  payWithBkash: string;
  payWithNagad: string;
  payWithRocket: string;
  
  // Language
  language: string;
  selectLanguage: string;
  english: string;
  bengali: string;
}

export const translations: Record<'en' | 'bn', Translation> = {
  en: {
    // Navigation
    home: 'Home',
    discover: 'Discover',
    categories: 'Categories',
    cart: 'Cart',
    account: 'Account',
    orders: 'Orders',
    support: 'Support',
    
    // Common Actions
    search: 'Search',
    searchPlaceholder: 'Search for products...',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    viewDetails: 'View Details',
    showMore: 'Show More',
    showLess: 'Show Less',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    forgotPassword: 'Forgot Password',
    emailAddress: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    
    // Product Related
    products: 'Products',
    product: 'Product',
    price: 'Price',
    originalPrice: 'Original Price',
    discount: 'Discount',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    limitedStock: 'Limited Stock',
    freeShipping: 'Free Shipping',
    fastDelivery: 'Fast Delivery',
    
    // Discovery Components
    aiPersonalization: 'AI Personalization',
    aiPersonalizationDesc: 'Discover products tailored just for you with advanced AI recommendations',
    trendingProducts: 'Trending Products',
    trendingProductsDesc: 'Explore what\'s popular right now in Bangladesh',
    voiceSearch: 'Voice Search',
    voiceSearchDesc: 'Search by speaking in Bengali or English',
    voiceSearchPrompt: 'Say something like "Samsung phone" or "Eid collection"',
    visualSearch: 'Visual Search',
    visualSearchDesc: 'Search by uploading an image',
    liveShop: 'Live Shopping',
    liveShoppingDesc: 'Join live shopping sessions with real-time deals',
    socialCommerce: 'Social Commerce',
    socialCommerceDesc: 'Shop with friends and discover trending products',
    
    // Categories
    electronics: 'Electronics',
    fashion: 'Fashion',
    homeGarden: 'Home & Garden',
    beauty: 'Beauty',
    sports: 'Sports',
    books: 'Books',
    automotive: 'Automotive',
    babyKids: 'Baby & Kids',
    
    // Payment Methods
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    creditCard: 'Credit Card',
    debitCard: 'Debit Card',
    cashOnDelivery: 'Cash on Delivery',
    
    // Shipping
    shipping: 'Shipping',
    freeShippingOver: 'Free shipping over ৳500',
    standardDelivery: 'Standard Delivery',
    expressDelivery: 'Express Delivery',
    sameDayDelivery: 'Same Day Delivery',
    
    // Cultural/Bangladesh Specific
    eidCollection: 'Eid Collection',
    prayerTimes: 'Prayer Times',
    festivalsOffers: 'Festival Offers',
    bangladeshMade: 'Made in Bangladesh',
    localVendors: 'Local Vendors',
    
    // Company Info
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    returnPolicy: 'Return Policy',
    faq: 'FAQ',
    
    // Footer
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    followUs: 'Follow Us',
    downloadApp: 'Download App',
    newsletter: 'Newsletter',
    
    // Mobile Banking
    mobileBanking: 'Mobile Banking',
    payWithBkash: 'Pay with bKash',
    payWithNagad: 'Pay with Nagad',
    payWithRocket: 'Pay with Rocket',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    bengali: 'বাংলা',
  },
  
  bn: {
    // Navigation
    home: 'হোম',
    discover: 'আবিষ্কার',
    categories: 'বিভাগ',
    cart: 'কার্ট',
    account: 'অ্যাকাউন্ট',
    orders: 'অর্ডার',
    support: 'সাপোর্ট',
    
    // Common Actions
    search: 'খুঁজুন',
    searchPlaceholder: 'পণ্য খুঁজুন...',
    addToCart: 'কার্টে যোগ করুন',
    buyNow: 'এখনই কিনুন',
    viewDetails: 'বিস্তারিত দেখুন',
    showMore: 'আরও দেখুন',
    showLess: 'কম দেখুন',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    
    // Authentication
    login: 'লগইন',
    register: 'নিবন্ধন',
    logout: 'লগআউট',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন',
    emailAddress: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    
    // Product Related
    products: 'পণ্যসমূহ',
    product: 'পণ্য',
    price: 'দাম',
    originalPrice: 'আসল দাম',
    discount: 'ছাড়',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টক নেই',
    limitedStock: 'সীমিত স্টক',
    freeShipping: 'বিনামূল্যে ডেলিভারি',
    fastDelivery: 'দ্রুত ডেলিভারি',
    
    // Discovery Components
    aiPersonalization: 'এআই ব্যক্তিগতকরণ',
    aiPersonalizationDesc: 'উন্নত এআই সুপারিশ সহ আপনার জন্য বিশেষভাবে তৈরি পণ্য আবিষ্কার করুন',
    trendingProducts: 'ট্রেন্ডিং পণ্য',
    trendingProductsDesc: 'বাংলাদেশে এখন জনপ্রিয় কী তা দেখুন',
    voiceSearch: 'ভয়েস সার্চ',
    voiceSearchDesc: 'বাংলা বা ইংরেজিতে কথা বলে খুঁজুন',
    voiceSearchPrompt: 'যেমন বলুন "স্যামসাং ফোন" বা "ঈদ কালেকশন"',
    visualSearch: 'ভিজ্যুয়াল সার্চ',
    visualSearchDesc: 'ছবি আপলোড করে খুঁজুন',
    liveShop: 'লাইভ শপিং',
    liveShoppingDesc: 'রিয়েল-টাইম ডিলের সাথে লাইভ শপিং সেশনে যোগ দিন',
    socialCommerce: 'সোশ্যাল কমার্স',
    socialCommerceDesc: 'বন্ধুদের সাথে কেনাকাটা করুন এবং ট্রেন্ডিং পণ্য আবিষ্কার করুন',
    
    // Categories
    electronics: 'ইলেকট্রনিক্স',
    fashion: 'ফ্যাশন',
    homeGarden: 'ঘর ও বাগান',
    beauty: 'সৌন্দর্য',
    sports: 'খেলাধুলা',
    books: 'বই',
    automotive: 'অটোমোবাইল',
    babyKids: 'শিশু ও বাচ্চা',
    
    // Payment Methods
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    rocket: 'রকেট',
    creditCard: 'ক্রেডিট কার্ড',
    debitCard: 'ডেবিট কার্ড',
    cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
    
    // Shipping
    shipping: 'ডেলিভারি',
    freeShippingOver: '৳৫০০ এর উপরে বিনামূল্যে ডেলিভারি',
    standardDelivery: 'স্ট্যান্ডার্ড ডেলিভারি',
    expressDelivery: 'এক্সপ্রেস ডেলিভারি',
    sameDayDelivery: 'একই দিনে ডেলিভারি',
    
    // Cultural/Bangladesh Specific
    eidCollection: 'ঈদ কালেকশন',
    prayerTimes: 'নামাজের সময়',
    festivalsOffers: 'উৎসবের অফার',
    bangladeshMade: 'বাংলাদেশে তৈরি',
    localVendors: 'স্থানীয় বিক্রেতা',
    
    // Company Info
    aboutUs: 'আমাদের সম্পর্কে',
    contactUs: 'যোগাযোগ করুন',
    privacyPolicy: 'প্রাইভেসি নীতি',
    termsOfService: 'সেবার শর্তাবলী',
    returnPolicy: 'রিটার্ন নীতি',
    faq: 'প্রশ্নোত্তর',
    
    // Footer
    quickLinks: 'দ্রুত লিংক',
    customerService: 'গ্রাহক সেবা',
    followUs: 'আমাদের ফলো করুন',
    downloadApp: 'অ্যাপ ডাউনলোড করুন',
    newsletter: 'নিউজলেটার',
    
    // Mobile Banking
    mobileBanking: 'মোবাইল ব্যাংকিং',
    payWithBkash: 'বিকাশ দিয়ে পেমেন্ট',
    payWithNagad: 'নগদ দিয়ে পেমেন্ট',
    payWithRocket: 'রকেট দিয়ে পেমেন্ট',
    
    // Language
    language: 'ভাষা',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    english: 'English',
    bengali: 'বাংলা',
  }
};