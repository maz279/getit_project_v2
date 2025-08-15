
import { Suspense, lazy } from "react";
import { Toaster } from "../shared/ui/toaster";
import { Toaster as Sonner } from "../shared/ui/sonner";
import { TooltipProvider } from "../shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { LanguageProvider } from "../contexts/LanguageContext";
import { SimpleLanguageProvider } from "../contexts/SimpleLanguageContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../domains/customer/auth/components/AuthProvider";
import { ROUTES } from "../constants/routes";
import Index from "../domains/customer/pages/Index";
import CustomerLayout from "../shared/layouts/CustomerLayout";

// Common pages
const NotFound = lazy(() => import("../shared/utilities/NotFound"));

// Authentication pages
const Login = lazy(() => import("../domains/customer/components/Login"));
const VerifyEmail = lazy(() => import("../domains/customer/components/VerifyEmail"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const FreshSignup = lazy(() => import("../pages/auth/FreshSignup"));

// Shop pages
const Products = lazy(() => import("../domains/customer/pages/discovery/Products"));
const Categories = lazy(() => import("../domains/customer/pages/discovery/Categories"));
const WomensClothing = lazy(() => import("../domains/customer/pages/discovery/WomensClothing"));
const BestSellers = lazy(() => import("../domains/customer/pages/discovery/BestSellers"));
const NewArrivals = lazy(() => import("../domains/customer/pages/discovery/NewArrivals"));
const Wishlist = lazy(() => import("../domains/customer/pages/shopping/Wishlist"));
const BulkOrders = lazy(() => import("../domains/customer/pages/orders/BulkOrders"));
const Cart = lazy(() => import("../domains/customer/components/Cart"));
const GiftCards = lazy(() => import("../domains/customer/components/GiftCards"));
const GroupBuy = lazy(() => import("../domains/customer/components/GroupBuy"));
const Premium = lazy(() => import("../domains/customer/components/Premium"));


// Promotions pages
const FlashSale = lazy(() => import("../domains/customer/components/FlashSale"));
const DailyDeals = lazy(() => import("../domains/customer/components/DailyDeals"));
const MegaSale = lazy(() => import("../domains/customer/components/MegaSale"));

// Account pages
const MyAccount = lazy(() => import("../domains/customer/components/MyAccount"));
const Orders = lazy(() => import("../domains/customer/components/Orders"));
const Settings = lazy(() => import("../domains/customer/components/Settings"));
const PaymentMethods = lazy(() => import("../domains/customer/components/PaymentMethods"));
const SecuritySettings = lazy(() => import("../domains/customer/components/SecuritySettings"));
const PrivacySettings = lazy(() => import("../domains/customer/components/PrivacySettings"));
const NotificationPreferences = lazy(() => import("../domains/customer/components/NotificationPreferences"));

// Order pages
const OrderTracking = lazy(() => import("../domains/customer/components/OrderTracking"));
const TrackOrder = lazy(() => import("../domains/customer/components/TrackOrder"));

// Support pages
const SupportHelpCenter = lazy(() => import("../domains/customer/components/HelpCenter"));
const CustomerServicePage = lazy(() => import("../pages/CustomerServicePage"));

// Subscription pages
const SubscriptionPage = lazy(() => import("../domains/customer/pages/SubscriptionPage"));

// New Amazon.com/Shopee.sg Level Customer Pages
const SubscriptionCenter = lazy(() => import("../domains/customer/pages/subscription/SubscriptionCenter"));
const CustomerAnalyticsDashboard = lazy(() => import("../domains/customer/components/analytics/CustomerAnalyticsDashboard"));
const ReviewCenter = lazy(() => import("../domains/customer/pages/reviews/ReviewCenter"));
const NotificationCenter = lazy(() => import("../domains/customer/pages/notifications/NotificationCenter"));
const CustomerSupportPortal = lazy(() => import("../domains/customer/pages/support/CustomerSupportPortal"));
const AdvancedOrderTracking = lazy(() => import("../domains/customer/pages/orders/AdvancedOrderTracking"));

// Advanced Shopping Experience Pages
const ProductComparison = lazy(() => import("../domains/customer/pages/products/ProductComparison"));
const AdvancedCheckout = lazy(() => import("../domains/customer/pages/checkout/AdvancedCheckout"));
const WishlistManager = lazy(() => import("../domains/customer/pages/shopping/WishlistManager"));
// AdvancedSearchFilters removed during cleanup
// New Amazon.com/Shopee.sg Level Admin Pages
const BusinessIntelligenceDashboard = lazy(() => import("../domains/admin/pages/enterprise/BusinessIntelligenceDashboard"));
const FraudDetectionCenter = lazy(() => import("../domains/admin/pages/fraud/FraudDetectionCenter"));

// Vendor pages
const VendorCenter = lazy(() => import("../domains/vendor/pages/VendorCenter"));
const VendorRegister = lazy(() => import("../domains/vendor/pages/VendorRegister"));
const VendorLogin = lazy(() => import("../domains/vendor/pages/VendorLogin"));

// Performance Test Page
const PerformanceTestPage = lazy(() => import("../domains/admin/components/PerformanceTestPage"));
const VendorDashboard = lazy(() => import("../domains/vendor/pages/Dashboard"));
const EnterpriseVendorDashboard = lazy(() => import("../domains/vendor/pages/EnterpriseVendorDashboardPage"));
const OptimizationDashboard = lazy(() => import("../domains/admin/components/OptimizationDashboard"));

// Search components
// AdvancedSearchInterface removed - using standardized AISearchBar via Header component

// Company pages
const AboutUs = lazy(() => import("../domains/customer/components/AboutUs"));

// Admin pages
const AdminDashboard = lazy(() => import("../domains/admin/pages/AdminDashboard"));
const AdminLayout = lazy(() => import("../domains/admin/dashboard/layout/AdminLayout"));
const AnalyticsDashboard = lazy(() => import("../domains/admin/pages/AnalyticsDashboard"));
const AnalyticsManagement = lazy(() => import("../domains/admin/pages/AnalyticsManagement"));
const SalesAnalytics = lazy(() => import("../domains/admin/pages/SalesAnalytics"));
const CustomerAnalytics = lazy(() => import("../domains/admin/pages/CustomerAnalytics"));
const ReportsManagement = lazy(() => import("../domains/admin/pages/ReportsManagement"));
const AuditDashboard = lazy(() => import("../domains/admin/pages/AuditDashboard"));

// Admin Test Pages


// AI Support Pages - Amazon.com/Shopee.sg Level
const AISupport = lazy(() => import("../domains/customer/components/AISupport"));
const SentimentAnalytics = lazy(() => import("../domains/admin/pages/SentimentAnalytics"));
const AgentRouting = lazy(() => import("../domains/admin/pages/AgentRouting"));

// Notification Demo Page
const NotificationDemo = lazy(() => import("../domains/admin/pages/communications/NotificationDemo"));

// Shipping Demo Page - Amazon.com/Shopee.sg-Level Shipping Platform
const ShippingDemo = lazy(() => import("../domains/customer/components/ShippingDemo"));

// Comprehensive Admin Dashboard Pages - Amazon.com/Shopee.sg Level
const DashboardOverview = lazy(() => import("../domains/admin/dashboard/DashboardOverview"));
const DashboardAnalytics = lazy(() => import("../domains/admin/pages/AnalyticsDashboard"));
const RealTimeMetrics = lazy(() => import("../domains/analytics/RealtimeMetrics"));
const KPIMonitoring = lazy(() => import("../domains/admin/dashboard/sections/KPIMonitoringDashboard"));
const PerformanceInsights = lazy(() => import("../domains/admin/dashboard/sections/PerformanceInsightsDashboard"));

// Vendor Management Pages
const VendorList = lazy(() => import("../domains/admin/pages/vendors/VendorList"));
const VendorRegistration = lazy(() => import("../domains/admin/pages/vendors/VendorRegistration"));
const KYCVerification = lazy(() => import("../domains/admin/pages/vendors/KYCVerification"));
const VendorPerformance = lazy(() => import("../domains/admin/pages/vendors/VendorPerformance"));
const VendorPayouts = lazy(() => import("../domains/admin/pages/vendors/VendorPayouts"));

// Product Management Pages
const ProductList = lazy(() => import("../domains/admin/pages/products/ProductList"));
const ProductCatalog = lazy(() => import("../domains/admin/pages/products/ProductCatalog"));
const AddProduct = lazy(() => import("../domains/admin/pages/products/AddProduct"));
const CategoryManagement = lazy(() => import("../domains/admin/pages/products/CategoryManagement"));
const InventoryManagement = lazy(() => import("../domains/admin/pages/products/InventoryManagement"));
const ProductModeration = lazy(() => import("../domains/admin/pages/products/ProductModeration"));

// Order Management Pages
const AdminOrderList = lazy(() => import("../domains/admin/pages/orders/OrderList"));
const OrderProcessing = lazy(() => import("../domains/admin/pages/orders/OrderProcessing"));
const AdminOrderTracking = lazy(() => import("../domains/admin/pages/orders/OrderTracking"));
const ReturnsRefunds = lazy(() => import("../domains/customer/components/ReturnsRefunds"));
const AllOrders = lazy(() => import("../domains/admin/pages/orders/AllOrders"));
const PaymentManagement = lazy(() => import("../domains/admin/pages/orders/PaymentManagement"));
const ShippingManagement = lazy(() => import("../domains/admin/pages/orders/ShippingManagement"));
const OrderAnalytics = lazy(() => import("../domains/admin/pages/orders/OrderAnalytics"));

// Customer Management Pages
const CustomerList = lazy(() => import("../domains/admin/pages/customers/CustomerList"));
const CustomerSegments = lazy(() => import("../domains/admin/pages/customers/CustomerSegments"));

// Brand Pages - Amazon.com/Shopee.sg Level
const BrandDirectory = lazy(() => import("../domains/customer/pages/brands/BrandDirectory"));
const BrandProfile = lazy(() => import("../domains/customer/pages/brands/BrandProfile"));

// Live Commerce Pages - Amazon.com/Shopee.sg Level
const LiveShopping = lazy(() => import("../domains/customer/pages/live/LiveShopping"));

// Social Commerce Pages - Amazon.com/Shopee.sg Level
const SocialCommerce = lazy(() => import("../domains/customer/pages/social/SocialCommerce"));

// Mobile First Pages - Amazon.com/Shopee.sg Level
const MobileFirst = lazy(() => import("../domains/customer/pages/mobile/MobileFirst"));

// Help Center Pages - Amazon.com/Shopee.sg Level  
const CustomerHelpCenter = lazy(() => import("../domains/customer/pages/help/HelpCenter"));

// Checkout Pages - Amazon.com/Shopee.sg Level
const CheckoutFlow = lazy(() => import("../domains/customer/pages/checkout/CheckoutFlow"));

// Flash Deals Pages - Amazon.com/Shopee.sg Level
const FlashDeals = lazy(() => import("../domains/customer/pages/deals/FlashDeals"));

// User Management Pages
const AdminList = lazy(() => import("../domains/admin/pages/users/AdminList"));
const RoleManagement = lazy(() => import("../domains/admin/pages/users/RoleManagement"));
const Permissions = lazy(() => import("../domains/admin/pages/users/Permissions"));
const ActivityLogs = lazy(() => import("../domains/admin/pages/users/ActivityLogs"));
const UserAnalytics = lazy(() => import("../domains/admin/pages/users/UserAnalytics"));

// Sales Management Pages
const SalesOverview = lazy(() => import("../domains/admin/pages/sales/SalesOverview"));
const RevenueAnalytics = lazy(() => import("../domains/admin/pages/sales/RevenueAnalytics"));
const SalesReports = lazy(() => import("../domains/admin/pages/sales/SalesReports"));
const SalesForecast = lazy(() => import("../domains/admin/pages/sales/SalesForecast"));

// Live Commerce Pages - Amazon.com/Shopee.sg Level
// Live Commerce components temporarily disabled during consolidation
// const LiveCommerceDashboard = lazy(() => import("../domains/live-commerce/LiveCommerceDashboard"));
// const LiveStreamWrapper = lazy(() => import("../domains/live-commerce/LiveStreamWrapper"));

// Social Commerce Pages - Amazon.com/Shopee.sg Level
const SocialCommerceDashboard = lazy(() => import("../domains/customer/social/SocialCommerceDashboard"));

// Marketing Pages - Amazon.com/Shopee.sg Level - Temporarily disabled during consolidation
// const MarketingDashboard = lazy(() => import("../domains/MarketingDashboard"));
// const CampaignManager = lazy(() => import("../domains/marketing/CampaignManager"));
// const PromotionManager = lazy(() => import("../domains/marketing/PromotionManager"));
// const EmailCampaignManager = lazy(() => import("../domains/marketing/EmailCampaignManager"));
// const LoyaltyProgramManager = lazy(() => import("../domains/marketing/LoyaltyProgramManager"));
// const MarketingAnalytics = lazy(() => import("../domains/marketing/MarketingAnalytics"));

// Fraud Detection Pages - Amazon.com/Shopee.sg Level
const FraudDetectionPage = lazy(() => import("../domains/admin/pages/security/FraudDetectionPage"));

// Customer Journey Pages - Amazon.com/Shopee.sg Level Complete Implementation
const ProductDiscoveryJourney = lazy(() => import("../domains/customer/pages/journey/ProductDiscovery"));
// AdvancedSearchJourney removed during cleanup
const ProductDetailsJourney = lazy(() => import("../domains/customer/pages/journey/ProductDetails"));
const ShoppingCartJourney = lazy(() => import("../domains/customer/pages/journey/ShoppingCart"));
const CheckoutJourney = lazy(() => import("../domains/customer/pages/journey/Checkout"));
const OrderTrackingJourney = lazy(() => import("../domains/customer/pages/journey/OrderTracking"));

// Phase 2 Demo - Performance & Mobile Optimization
const Phase2Demo = lazy(() => import("../domains/customer/pages/Phase2Demo"));

// Phase 1 Week 3-4 Testing - Component Modernization Testing
const Phase1Week3_4Test = lazy(() => import("../domains/admin/components/Phase1Week3-4Test"));

// Customer Pages - Phase 1 Customer Frontend Implementation
const CategoryBrowse = lazy(() => import("../domains/customer/pages/CategoryBrowse"));
const DealsPage = lazy(() => import("../domains/customer/pages/DealsPage"));
const CustomerNewArrivals = lazy(() => import("../domains/customer/pages/NewArrivals"));
const RecommendationsPage = lazy(() => import("../domains/customer/pages/RecommendationsPage"));
const TrendingPage = lazy(() => import("../domains/customer/pages/TrendingPage"));
const SearchResultsPage = lazy(() => import("../domains/customer/pages/SearchResultsPage"));
const ProductDetailsPage = lazy(() => import("../domains/customer/pages/journey/ProductDetails"));
const CustomerCartPage = lazy(() => import("../domains/customer/pages/CartPage"));

// Phase 2 Account Management Pages - Amazon.com/Shopee.sg Level
const AccountDashboard = lazy(() => import("../domains/customer/components/AccountDashboard"));
const ProfileSettings = lazy(() => import("../domains/customer/ProfileSettings"));
const OrderHistoryPage = lazy(() => import("../domains/customer/OrderHistory"));
const AddressBookPage = lazy(() => import("../domains/customer/AddressBook"));
const LoyaltyDashboardPage = lazy(() => import("../domains/customer/components/LoyaltyDashboardPage"));
const PersonalizationPage = lazy(() => import("../domains/customer/PersonalizationSection"));
const AccountRecommendationsPage = lazy(() => import("../domains/customer/pages/RecommendationsPage"));

// Phase 1 Discovery Page - Amazon.com/Shopee.sg Level
const DiscoveryPage = lazy(() => import("../domains/customer/pages/discovery/DiscoveryPage"));



const queryClient = new QueryClient();

export const App = () => (
  <HelmetProvider>
    <SimpleLanguageProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AuthProvider>
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-purple-600">
                      <div className="text-white text-xl font-semibold">Loading...</div>
                    </div>
                  }>
              <Routes>
                {/* Customer Pages with Persistent Layout */}
                <Route path="/" element={<CustomerLayout />}>
                  {/* Home */}
                  <Route index element={<Index />} />
                  
                  {/* Customer Homepage routes redirect to main homepage (Index) */}
                  <Route path="customer/homepage" element={<Index />} />
                  <Route path="home" element={<Index />} />
                  
                  {/* Customer Journey - Amazon.com/Shopee.sg Level Implementation */}
                  <Route path="discover" element={<DiscoveryPage />} />
                  <Route path="discovery" element={<DiscoveryPage />} />
                  <Route path="product-discovery" element={<ProductDiscoveryJourney />} />
                  {/* AdvancedSearchJourney route removed during cleanup */}
                  <Route path="product/:id" element={<ProductDetailsJourney />} />
                  <Route path="cart" element={<ShoppingCartJourney />} />
                  <Route path="checkout" element={<CheckoutJourney />} />
                  <Route path="order/track" element={<OrderTrackingJourney />} />
                  <Route path="tracking" element={<OrderTrackingJourney />} />
                  
                  {/* Customer Shopping Experience - Phase 1 Implementation */}
                  <Route path="category-browse" element={<CategoryBrowse />} />
                  <Route path="deals" element={<DealsPage />} />
                  <Route path="trending" element={<TrendingPage />} />
                  <Route path="recommendations" element={<RecommendationsPage />} />
                  <Route path="search" element={<SearchResultsPage />} />
                  <Route path="customer/cart" element={<CustomerCartPage />} />
                  
                  {/* Shop */}
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="womens-clothing" element={<WomensClothing />} />
                  <Route path="best-sellers" element={<BestSellers />} />
                  <Route path="new-arrivals" element={<NewArrivals />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="bulk-orders" element={<BulkOrders />} />
                  <Route path="gift-cards" element={<GiftCards />} />
                  <Route path="group-buy" element={<GroupBuy />} />
                  <Route path="premium" element={<Premium />} />
                  
                  {/* Promotions */}
                  <Route path="flash-sale" element={<FlashSale />} />
                  <Route path="daily-deals" element={<DailyDeals />} />
                  <Route path="mega-sale" element={<MegaSale />} />
                  
                  {/* Support & Help */}
                  <Route path="customer-support" element={<CustomerSupportPortal />} />
                  <Route path="help" element={<CustomerHelpCenter />} />
                  <Route path="help-center" element={<SupportHelpCenter />} />
                </Route>
                
                {/* Authentication Pages (No Layout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<FreshSignup />} />
                <Route path="/signup" element={<FreshSignup />} />
                <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
                <Route path={ROUTES.AUTH.REGISTER} element={<FreshSignup />} />
                <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<VerifyEmail />} />
                
                {/* Customer Analytics & Management - Amazon.com/Shopee.sg Level */}
                <Route path="/subscription-center" element={<SubscriptionCenter />} />
                <Route path="/customer-analytics" element={<CustomerAnalyticsDashboard />} />
                <Route path="/review-center" element={<ReviewCenter />} />
                <Route path="/notification-center" element={<NotificationCenter />} />
                <Route path="/customer-support" element={<CustomerSupportPortal />} />
                <Route path="/order-tracking-advanced" element={<AdvancedOrderTracking />} />
                
                {/* Advanced Shopping Experience - Amazon.com/Shopee.sg Level */}
                <Route path="/product-comparison" element={<ProductComparison />} />
                <Route path="/advanced-checkout" element={<AdvancedCheckout />} />
                <Route path="/wishlist-manager" element={<WishlistManager />} />
                {/* AdvancedSearchFilters route removed during cleanup */}
                <Route path="/vendor/enterprise-dashboard" element={<EnterpriseVendorDashboard />} />
                

                
                {/* Orders */}
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/track-order" element={<TrackOrder />} />
                
                {/* Brands */}
                <Route path="/brands" element={<BrandDirectory />} />
                <Route path="/brands/:brandId" element={<BrandProfile />} />
                
                {/* Customer Experience - Amazon.com/Shopee.sg Level */}
                <Route path="/live" element={<LiveShopping />} />
                <Route path="/live-shopping" element={<LiveShopping />} />
                <Route path="/social" element={<SocialCommerce />} />
                <Route path="/social-commerce" element={<SocialCommerce />} />
                <Route path="/mobile" element={<MobileFirst />} />
                <Route path="/mobile-first" element={<MobileFirst />} />
                <Route path="/compare" element={<ProductComparison />} />
                <Route path="/product-comparison" element={<ProductComparison />} />
                <Route path="/checkout" element={<CheckoutFlow />} />
                <Route path="/flash-deals" element={<FlashDeals />} />
                <Route path="/deals/flash" element={<FlashDeals />} />
                <Route path="/deals/flash" element={<FlashDeals />} />
                
                {/* Support */}
                <Route path="/help" element={<CustomerHelpCenter />} />
                <Route path="/customer-service" element={<CustomerServicePage />} />
                <Route path="/ai-support" element={<AISupport />} />
                {/* Advanced search interface route removed - using standardized AISearchBar via Header */}
                
                {/* Vendor */}
                <Route path="/seller-center" element={<VendorCenter />} />
                <Route path="/vendor/register" element={<VendorRegister />} />
                <Route path="/vendor/login" element={<VendorLogin />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/enterprise-dashboard" element={<EnterpriseVendorDashboard />} />
                
                {/* Company */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/about-us" element={<AboutUs />} />
                
                {/* Live Commerce - Amazon.com/Shopee.sg Level - Temporarily disabled during consolidation */}
                {/* <Route path="/live-commerce" element={<LiveCommerceDashboard />} />
                <Route path="/live-commerce/dashboard" element={<LiveCommerceDashboard />} />
                <Route path="/live-commerce/stream/:sessionId" element={<LiveStreamWrapper />} />
                <Route path="/live/:streamId" element={<LiveStreamWrapper />} /> */}
                
                {/* Social Commerce - Amazon.com/Shopee.sg Level */}
                <Route path="/social-commerce" element={<SocialCommerceDashboard />} />
                <Route path="/social-commerce/dashboard" element={<SocialCommerceDashboard />} />
                <Route path="/social" element={<SocialCommerceDashboard />} />

                {/* Marketing - Amazon.com/Shopee.sg Level - Temporarily disabled during consolidation */}
                {/* <Route path="/marketing" element={<MarketingDashboard />} />
                <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
                <Route path="/marketing/campaigns" element={<CampaignManager />} />
                <Route path="/marketing/promotions" element={<PromotionManager />} />
                <Route path="/marketing/email" element={<EmailCampaignManager />} />
                <Route path="/marketing/loyalty" element={<LoyaltyProgramManager />} />
                <Route path="/marketing/analytics" element={<MarketingAnalytics />} /> */}
                
                {/* Admin Marketing Routes - Temporarily disabled during consolidation */}
                {/* <Route path="/admin/marketing" element={<MarketingDashboard />} />
                <Route path="/admin/marketing/dashboard" element={<MarketingDashboard />} />
                <Route path="/admin/marketing/campaigns" element={<CampaignManager />} />
                <Route path="/admin/marketing/promotions" element={<PromotionManager />} />
                <Route path="/admin/marketing/email" element={<EmailCampaignManager />} />
                <Route path="/admin/marketing/loyalty" element={<LoyaltyProgramManager />} />
                <Route path="/admin/marketing/analytics" element={<MarketingAnalytics />} /> */}
                
                {/* Admin - NEW Comprehensive Dashboard Routes */}
                <Route path="/admin/dashboard" element={<AdminLayout><DashboardOverview /></AdminLayout>} />
                <Route path="/admin/dashboard/overview" element={<AdminLayout><DashboardOverview /></AdminLayout>} />
                <Route path="/admin/dashboard/analytics" element={<AdminLayout><DashboardAnalytics /></AdminLayout>} />
                <Route path="/admin/dashboard/realtime" element={<AdminLayout><RealTimeMetrics /></AdminLayout>} />
                <Route path="/admin/dashboard/kpi" element={<AdminLayout><KPIMonitoring /></AdminLayout>} />
                <Route path="/admin/dashboard/insights" element={<AdminLayout><PerformanceInsights /></AdminLayout>} />
                
                {/* Vendor Management Routes */}
                <Route path="/admin/vendors" element={<AdminLayout><VendorList /></AdminLayout>} />
                <Route path="/admin/vendors/list" element={<AdminLayout><VendorList /></AdminLayout>} />
                <Route path="/admin/vendors/registration" element={<AdminLayout><VendorRegistration /></AdminLayout>} />
                <Route path="/admin/vendors/kyc" element={<AdminLayout><KYCVerification /></AdminLayout>} />
                <Route path="/admin/vendors/performance" element={<AdminLayout><VendorPerformance /></AdminLayout>} />
                <Route path="/admin/vendors/payouts" element={<AdminLayout><VendorPayouts /></AdminLayout>} />
                
                {/* Product Management Routes */}
                <Route path="/admin/products" element={<AdminLayout><ProductList /></AdminLayout>} />
                <Route path="/admin/products/list" element={<AdminLayout><ProductList /></AdminLayout>} />
                <Route path="/admin/products/catalog" element={<AdminLayout><ProductCatalog /></AdminLayout>} />
                <Route path="/admin/products/add" element={<AdminLayout><AddProduct /></AdminLayout>} />
                <Route path="/admin/products/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
                <Route path="/admin/products/inventory" element={<AdminLayout><InventoryManagement /></AdminLayout>} />
                <Route path="/admin/products/moderation" element={<AdminLayout><ProductModeration /></AdminLayout>} />
                
                {/* Order Management Routes */}
                <Route path="/admin/orders" element={<AdminLayout><AdminOrderList /></AdminLayout>} />
                <Route path="/admin/orders/list" element={<AdminLayout><AdminOrderList /></AdminLayout>} />
                <Route path="/admin/orders/all" element={<AdminLayout><AllOrders /></AdminLayout>} />
                <Route path="/admin/orders/processing" element={<AdminLayout><OrderProcessing /></AdminLayout>} />
                <Route path="/admin/orders/tracking" element={<AdminLayout><AdminOrderTracking /></AdminLayout>} />
                <Route path="/admin/orders/returns" element={<AdminLayout><ReturnsRefunds /></AdminLayout>} />
                <Route path="/admin/orders/payments" element={<AdminLayout><PaymentManagement /></AdminLayout>} />
                <Route path="/admin/orders/shipping" element={<AdminLayout><ShippingManagement /></AdminLayout>} />
                <Route path="/admin/orders/analytics" element={<AdminLayout><OrderAnalytics /></AdminLayout>} />
                
                {/* Customer Management Routes */}
                <Route path="/admin/customers" element={<AdminLayout><CustomerList /></AdminLayout>} />
                <Route path="/admin/customers/list" element={<AdminLayout><CustomerList /></AdminLayout>} />
                <Route path="/admin/customers/segments" element={<AdminLayout><CustomerSegments /></AdminLayout>} />
                
                {/* User Management Routes */}
                <Route path="/admin/users/admin-list" element={<AdminLayout><AdminList /></AdminLayout>} />
                <Route path="/admin/users/roles" element={<AdminLayout><RoleManagement /></AdminLayout>} />
                <Route path="/admin/users/permissions" element={<AdminLayout><Permissions /></AdminLayout>} />
                <Route path="/admin/users/activity-logs" element={<AdminLayout><ActivityLogs /></AdminLayout>} />
                <Route path="/admin/users/analytics" element={<AdminLayout><UserAnalytics /></AdminLayout>} />
                
                {/* Sales Management Routes */}
                <Route path="/admin/sales/overview" element={<AdminLayout><SalesOverview /></AdminLayout>} />
                <Route path="/admin/sales/revenue" element={<AdminLayout><RevenueAnalytics /></AdminLayout>} />
                <Route path="/admin/sales/reports" element={<AdminLayout><SalesReports /></AdminLayout>} />
                <Route path="/admin/sales/forecast" element={<AdminLayout><SalesForecast /></AdminLayout>} />
                
                {/* Legacy dashboard routes */}
                <Route path="/admin/dashboard/legacy" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                
                {/* Analytics */}
                <Route path="/admin/analytics" element={<AdminLayout><AnalyticsDashboard /></AdminLayout>} />
                <Route path="/admin/analytics/management" element={<AdminLayout><AnalyticsManagement /></AdminLayout>} />
                <Route path="/admin/analytics/sales" element={<AdminLayout><SalesAnalytics /></AdminLayout>} />
                <Route path="/admin/analytics/customers" element={<AdminLayout><CustomerAnalytics /></AdminLayout>} />
                <Route path="/admin/analytics/reports" element={<AdminLayout><ReportsManagement /></AdminLayout>} />
                
                {/* Admin Test Pages */}

                
                {/* AI Support Admin Routes - Amazon.com/Shopee.sg Level */}
                <Route path="/admin/ai-support" element={<AdminLayout><AISupport /></AdminLayout>} />
                <Route path="/admin/sentiment-analytics" element={<AdminLayout><SentimentAnalytics /></AdminLayout>} />
                <Route path="/admin/agent-routing" element={<AdminLayout><AgentRouting /></AdminLayout>} />
                
                {/* Notification Demo - Amazon.com/Shopee.sg Level */}
                <Route path="/notification-demo" element={<NotificationDemo />} />
                <Route path="/admin/notification-demo" element={<AdminLayout><NotificationDemo /></AdminLayout>} />
                
                {/* Shipping Demo - Amazon.com/Shopee.sg Level Shipping Platform */}
                <Route path="/shipping-demo" element={<ShippingDemo />} />
                <Route path="/admin/shipping-demo" element={<AdminLayout><ShippingDemo /></AdminLayout>} />
                <Route path="/shipping" element={<ShippingDemo />} />
                
                {/* New Amazon.com/Shopee.sg Level Admin Pages */}
                <Route path="/admin/business-intelligence" element={<AdminLayout><BusinessIntelligenceDashboard /></AdminLayout>} />
                <Route path="/admin/fraud-detection" element={<AdminLayout><FraudDetectionCenter /></AdminLayout>} />
                <Route path="/fraud-detection" element={<FraudDetectionCenter />} />
                <Route path="/admin/audit" element={<AdminLayout><AuditDashboard /></AdminLayout>} />
                <Route path="/audit" element={<AuditDashboard />} />
                
                {/* Phase 6 Optimization Dashboard */}
                <Route path="/optimization" element={<OptimizationDashboard />} />
                
                {/* Phase 1 Performance Test Page */}
                <Route path="/performance-test" element={<PerformanceTestPage />} />
                <Route path="/performance" element={<PerformanceTestPage />} />
                

                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
              </AuthProvider>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SimpleLanguageProvider>
  </HelmetProvider>
);

export default App;
