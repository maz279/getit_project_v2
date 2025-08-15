// Layout System - GetIt Bangladesh Enterprise Layout Infrastructure
// Complete Amazon.com/Shopee.sg-Level Layout Components

// Main Layout Components
export * from './MainLayout';
export * from './AuthLayout';
export * from './CheckoutLayout';

// Re-export all layouts as default collections
import MainLayout from './MainLayout';
import AuthLayout from './AuthLayout';
import CheckoutLayout from './CheckoutLayout';

export const Layout = {
  MainLayout,
  AuthLayout,
  CheckoutLayout
};

export default Layout;