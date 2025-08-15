/**
 * Admin Micro-Frontend Application
 * Phase 1 Week 1-2: Module Federation Admin App
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Admin Domain Components (Creating basic structure)
const AdminDashboard = React.lazy(() => import('@/domains/admin/pages/AdminDashboard'));
const ProductManager = React.lazy(() => import('@/domains/admin/pages/ProductManager'));
const OrderManager = React.lazy(() => import('@/domains/admin/pages/OrderManager'));
const UserManager = React.lazy(() => import('@/domains/admin/pages/UserManager'));
const AnalyticsDashboard = React.lazy(() => import('@/domains/admin/pages/AnalyticsDashboard'));
const ConfigurationDashboard = React.lazy(() => import('@/domains/admin/pages/ConfigurationDashboard'));

// Shared Components
import LoadingSpinner from '@/shared/utilities/LoadingSpinner';
import NotFound from '@/shared/utilities/NotFound';

// Loading Fallback
const LoadingFallback = ({ message = 'Loading admin panel...' }) => (
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
      <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Panel Error</h2>
      <p className="text-gray-700 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Reload Admin Panel
      </button>
    </div>
  </div>
);

const AdminApp: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Product Management */}
          <Route path="/admin/products" element={<ProductManager />} />
          <Route path="/admin/products/*" element={<ProductManager />} />
          
          {/* Order Management */}
          <Route path="/admin/orders" element={<OrderManager />} />
          <Route path="/admin/orders/*" element={<OrderManager />} />
          
          {/* User Management */}
          <Route path="/admin/users" element={<UserManager />} />
          <Route path="/admin/users/*" element={<UserManager />} />
          
          {/* Analytics */}
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/analytics/*" element={<AnalyticsDashboard />} />
          
          {/* Configuration */}
          <Route path="/admin/config" element={<ConfigurationDashboard />} />
          <Route path="/admin/config/*" element={<ConfigurationDashboard />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AdminApp;