/**
 * Design System Utilities Index
 * Complete export of all utility functions
 */

// Theme utilities
export * from './theme';

// Responsive utilities
export * from './responsive';

// Accessibility utilities
export * from './accessibility';

// Animation utilities
export * from './animations';

// Combined utilities export
export const utils = {
  theme: () => import('./theme'),
  responsive: () => import('./responsive'),
  accessibility: () => import('./accessibility'),
  animations: () => import('./animations')
};