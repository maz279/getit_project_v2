/**
 * Customer Micro-Frontend Application
 * Phase 1 Week 1-2: Module Federation Customer App
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Customer Domain Components
import Homepage from '@/domains/customer/pages/Homepage';
import ProductDiscoveryPage from '@/domains/customer/pages/discovery/ProductDiscoveryPage';
import CategoryPage from '@/domains/customer/pages/category/CategoryPage';
import ProductList from '@/domains/customer/pages/products/ProductList';
import CartPage from '@/domains/customer/pages/CartPage';
import CheckoutFlow from '@/domains/customer/pages/checkout/CheckoutFlow';
import CustomerDashboard from '@/domains/customer/pages/CustomerDashboard';
import OrdersPage from '@/domains/customer/pages/orders/OrdersPage';
import SearchResultsPage from '@/domains/customer/pages/discovery/SearchResultsPage';
import NewArrivals from '@/domains/customer/pages/discovery/NewArrivals';
import BestSellers from '@/domains/customer/pages/discovery/BestSellers';
import DealsPage from '@/domains/customer/pages/DealsPage';
import WishlistManager from '@/domains/customer/pages/shopping/WishlistManager';

// Shared Components
import LoadingSpinner from '@/shared/utilities/LoadingSpinner';
import NotFound from '@/shared/utilities/NotFound';

// Authentication Pages
import SignupPage from '@/pages/auth/SignupPage';
import LoginPage from '@/pages/auth/LoginPage';

// Loading Fallback
const LoadingFallback = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <LoadingSpinner />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Error Fallback
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="text-center p-8 max-w-md">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-700 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

const CustomerApp: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback message="Loading customer experience..." />}>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Homepage />} />
          
          {/* Product Discovery */}
          <Route path="/discover" element={<ProductDiscoveryPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductList />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/best-sellers" element={<BestSellers />} />
          <Route path="/deals" element={<DealsPage />} />
          
          {/* Shopping Experience */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutFlow />} />
          <Route path="/wishlist" element={<WishlistManager />} />
          
          {/* Authentication */}
          <Route path="/register" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Customer Account */}
          <Route path="/account" element={<CustomerDashboard />} />
          <Route path="/account/*" element={<CustomerDashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/*" element={<OrdersPage />} />
          
          {/* Customer Routes */}
          <Route path="/customer/*" element={<CustomerDashboard />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CustomerApp;