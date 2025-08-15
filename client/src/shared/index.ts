/**
 * Shared Components Index
 * Phase 1 Week 1-2: Component Organization Restructuring
 * Consolidated export for shared components (MAX 20 components per Amazon.com standards)
 */

// Layout Components (4 components)
export { Header } from './layouts/components/Header/Header';
export { Footer } from './layouts/components/Footer/Footer';
export { MainLayout } from './layouts/MainLayout';
export { default as AuthLayout } from './layouts/AuthLayout';

// Core UI Components (4 components)
export { default as LoadingSpinner } from './utilities/LoadingSpinner';
export { default as Modal } from './ui/Modal';
export { default as NotFound } from './utilities/NotFound';
export { default as EmptyState } from './utilities/EmptyState';

// Form Components (2 components)
export { default as FormField } from './utilities/FormField';
export { default as FormGroup } from './utilities/FormGroup';

// Navigation Components (2 components)
export { default as Breadcrumb } from './utilities/Breadcrumb';
export { default as Pagination } from './utilities/Pagination';

// Utility Components (4 components)
export { default as Container } from './utilities/Container';
export { DataTable } from './ui/data-display';
export { default as StatCard } from './utilities/StatCard';
export { default as PageHeader } from './utilities/PageHeader';

// Performance Components (2 components)
export { default as OptimizedImage } from './utilities/OptimizedImage';
export { default as LazyTestComponent } from './utilities/LazyTestComponent';

// Mobile Components (2 components)
export { default as MobileNavigation } from './mobile/MobileNavigation';
export { default as TouchOptimizedButton } from './mobile/TouchOptimizedButton';

// Total: 20 components (Amazon.com standard compliant)
// All other components moved to domain-specific locations
// Component duplication eliminated (Button, Input consolidated to design-system)