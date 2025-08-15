/**
 * Loading Spinner Component - Design System
 * Enterprise loading indicators with multiple variants
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../../lib/utils';

const spinnerVariants = cva(
  "animate-spin inline-block",
  {
    variants: {
      variant: {
        default: "border-4 border-current border-t-transparent rounded-full",
        dots: "flex space-x-1",
        pulse: "bg-current rounded-full animate-pulse",
        bars: "flex space-x-1 items-end",
        ring: "border-4 border-gray-200 border-t-blue-600 rounded-full",
        // Cultural variants
        cultural: "border-4 border-green-200 border-t-red-600 rounded-full",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
      },
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4", 
        default: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
      },
      speed: {
        slow: "animate-spin-slow",
        default: "animate-spin",
        fast: "animate-spin-fast"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      speed: "default"
    }
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  variant,
  size,
  speed,
  text,
  overlay = false,
  fullScreen = false,
  ...props
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={cn(spinnerVariants({ variant, size }), className)}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-current rounded-full animate-bounce",
                  size === 'xs' && "w-1 h-1",
                  size === 'sm' && "w-1.5 h-1.5",
                  size === 'default' && "w-2 h-2",
                  size === 'lg' && "w-3 h-3",
                  size === 'xl' && "w-4 h-4"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'bars':
        return (
          <div className={cn(spinnerVariants({ variant, size }), className)}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-current animate-pulse",
                  size === 'xs' && "w-0.5 h-2",
                  size === 'sm' && "w-0.5 h-3",
                  size === 'default' && "w-1 h-4",
                  size === 'lg' && "w-1 h-6",
                  size === 'xl' && "w-1.5 h-8"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${20 + (i % 2) * 10}%`
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(spinnerVariants({ variant, size, speed }), className)} />
        );
      
      case 'gradient':
        return (
          <div className={cn(spinnerVariants({ variant, size }), className)}>
            <div className="absolute inset-0 animate-spin bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full" />
          </div>
        );
      
      default:
        return (
          <div className={cn(spinnerVariants({ variant, size, speed }), className)} />
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderSpinner()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        {content}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      {content}
    </div>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner, spinnerVariants };