/**
 * Design System Exports
 * Amazon.com/Shopee.sg-Level Unified Design System
 * Single source of truth for all design components
 */

// Export design tokens
export * from './tokens';

// Export atoms (basic building blocks)
export { default as Button } from './atoms/Button/Button';
export { default as Input } from './atoms/Input/Input';
export { default as Icon } from './atoms/Icon/Icon';
export { default as Typography } from './atoms/Typography/Typography';

// Export molecules (composed components)
export { default as SearchBar } from './molecules/SearchBar/SearchBar';
export { default as ProductCard } from './molecules/ProductCard/ProductCard';
export { default as FormField } from './molecules/FormField/FormField';

// Export organisms (complex components)
export { default as Header } from './organisms/Header/Header';
// ProductGrid - REMOVED: Now using @/shared/modernization/phase1/ProductGrid as single source of truth
export { default as CheckoutForm } from './organisms/CheckoutForm/CheckoutForm';

// Export templates (page layouts)
export { default as CustomerLayout } from './templates/CustomerLayout/CustomerLayout';
export { default as AdminLayout } from './templates/AdminLayout/AdminLayout';
export { default as VendorLayout } from './templates/VendorLayout/VendorLayout';