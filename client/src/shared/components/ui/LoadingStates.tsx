// Advanced loading states for Phase 3 User Experience Enhancement
import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimation';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

// Shimmer skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  isLoading = true,
  children
}) => {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  const shimmerStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        ...shimmerStyle,
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

// Text skeleton
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}> = ({ lines = 3, className = '', isLoading = true, children }) => {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  return (
    <div className={className}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '70%' : '100%'}
          className="mb-2"
        />
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{
  hasImage?: boolean;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}> = ({ hasImage = true, className = '', isLoading = true, children }) => {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {hasImage && (
        <Skeleton height="200px" className="mb-4 rounded" />
      )}
      <Skeleton height="1.5rem" width="80%" className="mb-2" />
      <TextSkeleton lines={2} />
      <div className="flex justify-between items-center mt-4">
        <Skeleton height="1rem" width="60px" />
        <Skeleton height="2rem" width="80px" className="rounded" />
      </div>
    </div>
  );
};

// Progress indicator
export const ProgressIndicator: React.FC<{
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ 
  progress, 
  className = '', 
  showPercentage = true,
  color = 'blue' 
}) => {
  const animatedProgress = useAnimatedValue(progress, { duration: 500 });
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(animatedProgress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Spinner component
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'white';
  className?: string;
}> = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    white: 'text-white'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Pulse loading animation
export const PulseLoader: React.FC<{
  count?: number;
  color?: string;
  className?: string;
}> = ({ 
  count = 3, 
  color = 'bg-blue-500',
  className = '' 
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${color} animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

export default {
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  ProgressIndicator,
  Spinner,
  PulseLoader
};