/**
 * Touch-Optimized Button Component
 * Amazon.com/Shopee.sg-Level Unified Component
 * Re-export from design system to eliminate duplication
 */

// Re-export from unified design system
export { Button as TouchOptimizedButton, buttonVariants } from '@/design-system/atoms/Button/Button';
export type { ButtonProps as TouchOptimizedButtonProps } from '@/design-system/atoms/Button/Button';

// Default export for compatibility
export { Button as default } from '@/design-system/atoms/Button/Button';