/**
 * Phase 2: Pull to Refresh Component
 * Amazon.com/Shopee.sg-Level Pull-to-Refresh Functionality
 * Optimized for Bangladesh mobile users
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { RefreshCw, ArrowDown, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
  hapticFeedback?: boolean;
  showIndicator?: boolean;
  refreshText?: string;
  className?: string;
}

interface RefreshState {
  isActive: boolean;
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldRefresh: boolean;
  status: 'idle' | 'pulling' | 'ready' | 'refreshing' | 'success' | 'error';
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  hapticFeedback = true,
  showIndicator = true,
  refreshText = 'Pull to refresh',
  className,
}) => {
  const [refreshState, setRefreshState] = useState<RefreshState>({
    isActive: false,
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    shouldRefresh: false,
    status: 'idle',
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isScrolledToTop = useRef<boolean>(true);
  
  // Check if container is scrolled to top
  const checkScrollPosition = () => {
    if (containerRef.current) {
      isScrolledToTop.current = containerRef.current.scrollTop === 0;
    }
  };

  // Haptic feedback
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticFeedback && 'vibrate' in navigator) {
      const patterns = {
        light: [25],
        medium: [50],
        heavy: [100],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Handle touch start
  const handleTouchStart = (event: React.TouchEvent) => {
    checkScrollPosition();
    
    if (!isScrolledToTop.current) return;
    
    const touch = event.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    
    setRefreshState(prev => ({
      ...prev,
      isActive: true,
      status: 'idle',
    }));
  };

  // Handle touch move
  const handleTouchMove = (event: React.TouchEvent) => {
    if (!refreshState.isActive || !isScrolledToTop.current) return;
    
    const touch = event.touches[0];
    currentY.current = touch.clientY;
    
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0) {
      // Prevent default scrolling
      event.preventDefault();
      
      // Calculate pull distance with resistance
      const pullDistance = Math.min(deltaY / resistance, threshold * 1.5);
      const shouldRefresh = pullDistance >= threshold;
      
      setRefreshState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        shouldRefresh,
        status: shouldRefresh ? 'ready' : 'pulling',
      }));
      
      // Haptic feedback when reaching threshold
      if (shouldRefresh && prev.status !== 'ready') {
        triggerHapticFeedback('medium');
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!refreshState.isActive) return;
    
    if (refreshState.shouldRefresh && !refreshState.isRefreshing) {
      performRefresh();
    } else {
      resetRefreshState();
    }
  };

  // Perform refresh
  const performRefresh = async () => {
    setRefreshState(prev => ({
      ...prev,
      isRefreshing: true,
      status: 'refreshing',
    }));
    
    triggerHapticFeedback('heavy');
    
    try {
      await onRefresh();
      
      setRefreshState(prev => ({
        ...prev,
        status: 'success',
      }));
      
      triggerHapticFeedback('light');
      
      // Show success for a moment
      setTimeout(() => {
        resetRefreshState();
      }, 1000);
      
    } catch (error) {
      setRefreshState(prev => ({
        ...prev,
        status: 'error',
      }));
      
      triggerHapticFeedback('heavy');
      
      // Show error for a moment
      setTimeout(() => {
        resetRefreshState();
      }, 2000);
    }
  };

  // Reset refresh state
  const resetRefreshState = () => {
    setRefreshState({
      isActive: false,
      isPulling: false,
      isRefreshing: false,
      pullDistance: 0,
      shouldRefresh: false,
      status: 'idle',
    });
  };

  // Get refresh indicator
  const getRefreshIndicator = () => {
    if (!showIndicator || refreshState.status === 'idle') return null;
    
    const progress = Math.min(refreshState.pullDistance / threshold, 1);
    const rotation = progress * 180;
    
    const statusConfig = {
      pulling: {
        icon: ArrowDown,
        text: refreshText,
        color: 'text-muted-foreground',
      },
      ready: {
        icon: RefreshCw,
        text: 'Release to refresh',
        color: 'text-primary',
      },
      refreshing: {
        icon: RefreshCw,
        text: 'Refreshing...',
        color: 'text-primary',
      },
      success: {
        icon: CheckCircle,
        text: 'Refresh complete',
        color: 'text-green-500',
      },
      error: {
        icon: AlertCircle,
        text: 'Refresh failed',
        color: 'text-red-500',
      },
    };
    
    const config = statusConfig[refreshState.status] || statusConfig.pulling;
    const Icon = config.icon;
    
    return (
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-10 flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'bg-background/80 backdrop-blur-sm border-b'
        )}
        style={{
          height: `${Math.max(refreshState.pullDistance, 0)}px`,
          transform: `translateY(-${Math.max(threshold - refreshState.pullDistance, 0)}px)`,
        }}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon
            className={cn(
              'h-4 w-4 transition-all duration-200',
              config.color,
              refreshState.status === 'refreshing' && 'animate-spin',
              refreshState.status === 'pulling' && 'transition-transform duration-100'
            )}
            style={{
              transform: refreshState.status === 'pulling' ? 
                `rotate(${rotation}deg)` : undefined,
            }}
          />
          <span className={config.color}>{config.text}</span>
        </div>
      </div>
    );
  };

  // Get pull progress indicator
  const getPullProgress = () => {
    if (!showIndicator || refreshState.status === 'idle') return null;
    
    const progress = Math.min(refreshState.pullDistance / threshold, 1);
    
    return (
      <div className="absolute top-0 left-0 right-0 z-5">
        <div
          className={cn(
            'h-1 transition-all duration-100',
            refreshState.status === 'ready' ? 'bg-primary' : 'bg-primary/50'
          )}
          style={{
            width: `${progress * 100}%`,
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-auto touch-manipulation',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onScroll={checkScrollPosition}
      style={{
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull Progress */}
      {getPullProgress()}
      
      {/* Refresh Indicator */}
      {getRefreshIndicator()}
      
      {/* Content */}
      <div
        className={cn(
          'transition-transform duration-200 ease-out',
          refreshState.isPulling && 'transform-gpu'
        )}
        style={{
          transform: refreshState.isPulling ? 
            `translateY(${Math.max(refreshState.pullDistance - threshold, 0)}px)` : 
            undefined,
        }}
      >
        {children}
      </div>
      
      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 z-50">
          <Card className="w-48">
            <CardContent className="p-3 text-xs space-y-1">
              <div>Status: {refreshState.status}</div>
              <div>Distance: {Math.round(refreshState.pullDistance)}px</div>
              <div>Threshold: {threshold}px</div>
              <div>Progress: {Math.round((refreshState.pullDistance / threshold) * 100)}%</div>
              <div>Scrolled Top: {isScrolledToTop.current ? 'Yes' : 'No'}</div>
              <Badge variant={refreshState.shouldRefresh ? 'default' : 'secondary'}>
                {refreshState.shouldRefresh ? 'Ready' : 'Not Ready'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;