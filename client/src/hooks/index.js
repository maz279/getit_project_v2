// Master Hooks Index
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Hooks Ecosystem
// Complete React hooks system for enterprise e-commerce platform

// Authentication Hooks
export { useAuth } from './auth';

// Shopping Cart Hooks
export { useCart } from './cart';

// Product Management Hooks
export { useProduct, useProducts } from './product';

// Common Utility Hooks
export { 
  useLocalStorage, 
  useDebounce, 
  useWindowSize, 
  usePagination 
} from './common';

// All hooks are now available for easy import throughout the application
// Example usage:
// import { useAuth, useCart, useProducts, usePagination } from '@/hooks';