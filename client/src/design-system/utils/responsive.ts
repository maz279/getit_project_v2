/**
 * Responsive Utilities
 * Breakpoint and responsive design utilities
 */

import { tokens } from '../tokens';

// Breakpoint utilities
export const breakpoints = tokens.breakpoints;

// Media query helpers
export const mediaQuery = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`
};

// Responsive utility classes
export const responsiveClasses = {
  // Display utilities
  display: {
    'hidden-xs': 'xs:hidden',
    'hidden-sm': 'sm:hidden',
    'hidden-md': 'md:hidden',
    'hidden-lg': 'lg:hidden',
    'hidden-xl': 'xl:hidden',
    'block-xs': 'xs:block',
    'block-sm': 'sm:block',
    'block-md': 'md:block',
    'block-lg': 'lg:block',
    'block-xl': 'xl:block'
  },
  // Grid utilities
  grid: {
    'cols-1-xs': 'xs:grid-cols-1',
    'cols-2-xs': 'xs:grid-cols-2',
    'cols-3-xs': 'xs:grid-cols-3',
    'cols-4-xs': 'xs:grid-cols-4',
    'cols-1-sm': 'sm:grid-cols-1',
    'cols-2-sm': 'sm:grid-cols-2',
    'cols-3-sm': 'sm:grid-cols-3',
    'cols-4-sm': 'sm:grid-cols-4',
    'cols-1-md': 'md:grid-cols-1',
    'cols-2-md': 'md:grid-cols-2',
    'cols-3-md': 'md:grid-cols-3',
    'cols-4-md': 'md:grid-cols-4',
    'cols-1-lg': 'lg:grid-cols-1',
    'cols-2-lg': 'lg:grid-cols-2',
    'cols-3-lg': 'lg:grid-cols-3',
    'cols-4-lg': 'lg:grid-cols-4'
  },
  // Spacing utilities
  spacing: {
    'p-1-xs': 'xs:p-1',
    'p-2-xs': 'xs:p-2',
    'p-4-xs': 'xs:p-4',
    'p-6-xs': 'xs:p-6',
    'p-1-sm': 'sm:p-1',
    'p-2-sm': 'sm:p-2',
    'p-4-sm': 'sm:p-4',
    'p-6-sm': 'sm:p-6',
    'p-1-md': 'md:p-1',
    'p-2-md': 'md:p-2',
    'p-4-md': 'md:p-4',
    'p-6-md': 'md:p-6'
  },
  // Typography utilities
  typography: {
    'text-xs-xs': 'xs:text-xs',
    'text-sm-xs': 'xs:text-sm',
    'text-base-xs': 'xs:text-base',
    'text-lg-xs': 'xs:text-lg',
    'text-xs-sm': 'sm:text-xs',
    'text-sm-sm': 'sm:text-sm',
    'text-base-sm': 'sm:text-base',
    'text-lg-sm': 'sm:text-lg',
    'text-xs-md': 'md:text-xs',
    'text-sm-md': 'md:text-sm',
    'text-base-md': 'md:text-base',
    'text-lg-md': 'md:text-lg'
  }
};

// Responsive container utilities
export const container = {
  'container-xs': 'max-w-xs mx-auto',
  'container-sm': 'max-w-sm mx-auto',
  'container-md': 'max-w-md mx-auto',
  'container-lg': 'max-w-lg mx-auto',
  'container-xl': 'max-w-xl mx-auto',
  'container-2xl': 'max-w-2xl mx-auto',
  'container-3xl': 'max-w-3xl mx-auto',
  'container-4xl': 'max-w-4xl mx-auto',
  'container-5xl': 'max-w-5xl mx-auto',
  'container-6xl': 'max-w-6xl mx-auto',
  'container-7xl': 'max-w-7xl mx-auto',
  'container-full': 'max-w-full mx-auto'
};

// Responsive hook for JavaScript
export const useResponsive = () => {
  const getBreakpoint = () => {
    const width = window.innerWidth;
    
    if (width < parseInt(breakpoints.xs)) return 'xs';
    if (width < parseInt(breakpoints.sm)) return 'sm';
    if (width < parseInt(breakpoints.md)) return 'md';
    if (width < parseInt(breakpoints.lg)) return 'lg';
    if (width < parseInt(breakpoints.xl)) return 'xl';
    return '2xl';
  };
  
  const isMobile = () => window.innerWidth < parseInt(breakpoints.md);
  const isTablet = () => window.innerWidth >= parseInt(breakpoints.md) && window.innerWidth < parseInt(breakpoints.lg);
  const isDesktop = () => window.innerWidth >= parseInt(breakpoints.lg);
  
  return {
    breakpoint: getBreakpoint(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    width: window.innerWidth
  };
};

// Responsive utilities export
export const responsiveUtils = {
  breakpoints,
  mediaQuery,
  responsiveClasses,
  container,
  useResponsive
};

export default responsiveUtils;