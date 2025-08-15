import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Spinner component
export const Spinner = ({
  size = "md",
  color = "blue",
  className,
  ...props
}) => {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4", 
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    pink: "text-pink-600", // bKash
    orange: "text-orange-600", // Nagad
    white: "text-white"
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  );
};

// Loading dots animation
export const LoadingDots = ({ 
  color = "blue",
  size = "md",
  className 
}) => {
  const sizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  };

  const colorClasses = {
    blue: "bg-blue-600",
    gray: "bg-gray-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    pink: "bg-pink-600",
    orange: "bg-orange-600"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Loading overlay
export const LoadingOverlay = ({
  loading = false,
  children,
  text = "Loading...",
  className,
  blur = true
}) => {
  if (!loading) return children;

  return (
    <div className={cn("relative", className)}>
      {/* Content with optional blur */}
      <div className={cn(blur && "blur-sm pointer-events-none")}>
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-2" />
          <p className="text-sm text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  );
};

// Page loader
export const PageLoader = ({
  size = "lg",
  text = "Loading page...",
  fullScreen = false,
  className
}) => {
  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    fullScreen ? "fixed inset-0 bg-white z-50" : "py-12",
    className
  );

  return (
    <div className={containerClasses}>
      <Spinner size={size} className="mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

// Skeleton components for content loading
export const Skeleton = ({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse"
}) => {
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: ""
  };

  const variantClasses = {
    text: "h-4 bg-gray-200 rounded",
    rectangular: "bg-gray-200 rounded",
    circular: "bg-gray-200 rounded-full",
    rounded: "bg-gray-200 rounded-lg"
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={cn(
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

// Text skeleton
export const TextSkeleton = ({
  lines = 3,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={cn(
            index === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
};

// Avatar skeleton
export const AvatarSkeleton = ({
  size = "md",
  className
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  );
};

// Card skeleton
export const CardSkeleton = ({
  className,
  showAvatar = false,
  showImage = false,
  lines = 3
}) => {
  return (
    <div className={cn("p-4 border rounded-lg space-y-4", className)}>
      {/* Image skeleton */}
      {showImage && (
        <Skeleton className="w-full h-48" variant="rectangular" />
      )}
      
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <AvatarSkeleton size="sm" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}
      
      {/* Content lines */}
      <TextSkeleton lines={lines} />
      
      {/* Action buttons */}
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" variant="rounded" />
        <Skeleton className="h-8 w-16" variant="rounded" />
      </div>
    </div>
  );
};

// Product card skeleton
export const ProductCardSkeleton = ({
  className
}) => {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Product image */}
      <Skeleton className="w-full h-48" />
      
      <div className="p-4 space-y-3">
        {/* Product title */}
        <TextSkeleton lines={2} />
        
        {/* Price */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4" variant="circular" />
          ))}
          <Skeleton className="h-4 w-12 ml-2" />
        </div>
        
        {/* Add to cart button */}
        <Skeleton className="h-10 w-full" variant="rounded" />
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

// List skeleton
export const ListSkeleton = ({
  items = 5,
  showAvatar = false,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showAvatar && <AvatarSkeleton size="sm" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" variant="rounded" />
        </div>
      ))}
    </div>
  );
};

// Loading button
export const LoadingButton = ({
  loading = false,
  children,
  loadingText = "Loading...",
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 rounded-md",
        "bg-blue-600 text-white hover:bg-blue-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors duration-200",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" className="mr-2" />}
      {loading ? loadingText : children}
    </button>
  );
};

// Progress bar
export const ProgressBar = ({
  value = 0,
  max = 100,
  size = "md",
  color = "blue",
  showLabel = false,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
    pink: "bg-pink-600",
    orange: "bg-orange-600"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "bg-gray-200 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "transition-all duration-300 ease-out rounded-full",
            colorClasses[color],
            sizeClasses[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-gray-600 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// Circular progress
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = "md",
  color = "blue",
  showLabel = false,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
    orange: "text-orange-600"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg className={cn(sizeClasses[size], "transform -rotate-90")}>
        <circle
          cx="50%"
          cy="50%"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-200"
        />
        <circle
          cx="50%"
          cy="50%"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-300", colorClasses[color])}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-medium">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default {
  Spinner,
  LoadingDots,
  LoadingOverlay,
  PageLoader,
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  ProductCardSkeleton,
  TableSkeleton,
  ListSkeleton,
  LoadingButton,
  ProgressBar,
  CircularProgress
};