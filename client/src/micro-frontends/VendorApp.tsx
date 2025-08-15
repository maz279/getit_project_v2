/**
 * Vendor Micro-Frontend Application
 * Phase 1 Week 1-2: Module Federation Vendor App
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Vendor Domain Components (Creating basic structure)
const VendorDashboard = React.lazy(() => import('@/domains/vendor/pages/VendorDashboard'));
const VendorRegister = React.lazy(() => import('@/domains/vendor/pages/VendorRegister'));
const VendorLogin = React.lazy(() => import('@/domains/vendor/pages/VendorLogin'));
const VendorProductManager = React.lazy(() => import('@/domains/vendor/pages/VendorProductManager'));
const VendorOrderManager = React.lazy(() => import('@/domains/vendor/pages/VendorOrderManager'));
const VendorAnalytics = React.lazy(() => import('@/domains/vendor/pages/VendorAnalytics'));
const VendorProfile = React.lazy(() => import('@/domains/vendor/pages/VendorProfile'));
const VendorSettings = React.lazy(() => import('@/domains/vendor/pages/VendorSettings'));

// Shared Components
import LoadingSpinner from '@/shared/utilities/LoadingSpinner';
import NotFound from '@/shared/utilities/NotFound';

// Loading Fallback
const LoadingFallback = ({ message = 'Loading vendor dashboard...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <h2 className="text-2xl font-bold text-red-600 mb-4">Vendor Dashboard Error</h2>
      <p className="text-gray-700 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Reload Vendor Dashboard
      </button>
    </div>
  </div>
);

const VendorApp: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Vendor Authentication - Must be FIRST */}
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          
          {/* Vendor Dashboard */}
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          
          {/* Product Management */}
          <Route path="/vendor/products" element={<VendorProductManager />} />
          <Route path="/vendor/products/*" element={<VendorProductManager />} />
          
          {/* Order Management */}
          <Route path="/vendor/orders" element={<VendorOrderManager />} />
          <Route path="/vendor/orders/*" element={<VendorOrderManager />} />
          
          {/* Analytics */}
          <Route path="/vendor/analytics" element={<VendorAnalytics />} />
          <Route path="/vendor/analytics/*" element={<VendorAnalytics />} />
          
          {/* Profile */}
          <Route path="/vendor/profile" element={<VendorProfile />} />
          <Route path="/vendor/profile/*" element={<VendorProfile />} />
          
          {/* Settings */}
          <Route path="/vendor/settings" element={<VendorSettings />} />
          <Route path="/vendor/settings/*" element={<VendorSettings />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default VendorApp;