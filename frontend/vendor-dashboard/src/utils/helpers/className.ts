/**
 * Utility functions for className manipulation in vendor dashboard
 * 
 * Provides utility functions for dynamic className generation,
 * conditional styling, and component variant management
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine className values with proper Tailwind CSS merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate badge styles based on variant and color
 */
export function badgeVariants({
  variant = 'default',
  color = 'gray'
}: {
  variant?: 'default' | 'outline' | 'filled' | 'dot';
  color?: 'gray' | 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink';
} = {}) {
  const colorMap = {
    gray: {
      default: 'bg-gray-100 text-gray-800',
      outline: 'border border-gray-200 text-gray-700',
      filled: 'bg-gray-600 text-white',
      dot: 'bg-gray-400'
    },
    red: {
      default: 'bg-red-100 text-red-800',
      outline: 'border border-red-200 text-red-700',
      filled: 'bg-red-600 text-white',
      dot: 'bg-red-400'
    },
    blue: {
      default: 'bg-blue-100 text-blue-800',
      outline: 'border border-blue-200 text-blue-700',
      filled: 'bg-blue-600 text-white',
      dot: 'bg-blue-400'
    },
    green: {
      default: 'bg-green-100 text-green-800',
      outline: 'border border-green-200 text-green-700',
      filled: 'bg-green-600 text-white',
      dot: 'bg-green-400'
    },
    yellow: {
      default: 'bg-yellow-100 text-yellow-800',
      outline: 'border border-yellow-200 text-yellow-700',
      filled: 'bg-yellow-600 text-white',
      dot: 'bg-yellow-400'
    },
    purple: {
      default: 'bg-purple-100 text-purple-800',
      outline: 'border border-purple-200 text-purple-700',
      filled: 'bg-purple-600 text-white',
      dot: 'bg-purple-400'
    },
    pink: {
      default: 'bg-pink-100 text-pink-800',
      outline: 'border border-pink-200 text-pink-700',
      filled: 'bg-pink-600 text-white',
      dot: 'bg-pink-400'
    }
  };

  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = colorMap[color][variant];

  return cn(baseClasses, variantClasses);
}

/**
 * Generate button styles based on variant and size
 */
export function buttonVariants({
  variant = 'default',
  size = 'default'
}: {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'xl';
} = {}) {
  const variantMap = {
    default: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    primary: 'bg-primary text-white hover:bg-primary-600 border border-transparent',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 border border-transparent',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700 border border-transparent'
  };

  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none';

  return cn(baseClasses, variantMap[variant], sizeMap[size]);
}

/**
 * Generate input styles based on variant and state
 */
export function inputVariants({
  variant = 'default',
  state = 'default'
}: {
  variant?: 'default' | 'filled' | 'outline';
  state?: 'default' | 'error' | 'success' | 'disabled';
} = {}) {
  const variantMap = {
    default: 'border border-gray-300 bg-white',
    filled: 'border-0 bg-gray-100',
    outline: 'border-2 border-gray-200 bg-transparent'
  };

  const stateMap = {
    default: 'focus:border-primary focus:ring-primary',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed'
  };

  const baseClasses = 'block w-full px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

  return cn(baseClasses, variantMap[variant], stateMap[state]);
}

/**
 * Generate card styles based on variant
 */
export function cardVariants({
  variant = 'default',
  padding = 'default'
}: {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'default' | 'lg';
} = {}) {
  const variantMap = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };

  const paddingMap = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = 'rounded-lg';

  return cn(baseClasses, variantMap[variant], paddingMap[padding]);
}

/**
 * Generate status indicator styles
 */
export function statusVariants(status: 'online' | 'offline' | 'away' | 'busy') {
  const statusMap = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400'
  };

  return cn('h-3 w-3 rounded-full', statusMap[status]);
}

/**
 * Generate loading spinner styles
 */
export function spinnerVariants({
  size = 'default',
  color = 'primary'
}: {
  size?: 'sm' | 'default' | 'lg';
  color?: 'primary' | 'white' | 'gray';
} = {}) {
  const sizeMap = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorMap = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return cn(
    'animate-spin rounded-full border-2 border-transparent border-t-2',
    sizeMap[size],
    colorMap[color]
  );
}

/**
 * Utility for responsive grid classes
 */
export function gridCols(cols: {
  default?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) {
  const classes = [];
  
  if (cols.default) classes.push(`grid-cols-${cols.default}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);

  return classes.join(' ');
}