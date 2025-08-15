/**
 * Phase 2: Swipe Gestures Component
 * Amazon.com/Shopee.sg-Level Swipe Navigation
 * Optimized for Bangladesh mobile users
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enableHorizontal?: boolean;
  enableVertical?: boolean;
  showIndicators?: boolean;
  hapticFeedback?: boolean;
  className?: string;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface SwipeState {
  isActive: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
}

const SwipeGestures: React.FC<SwipeGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enableHorizontal = true,
  enableVertical = true,
  showIndicators = true,
  hapticFeedback = true,
  className,
}) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isActive: false,
    direction: null,
    distance: 0,
    velocity: 0,
  });
  
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<TouchPoint | null>(null);
  const [availableGestures, setAvailableGestures] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const swipeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Calculate available gestures
  useEffect(() => {
    const gestures: string[] = [];
    if (enableHorizontal) {
      if (onSwipeLeft) gestures.push('swipe-left');
      if (onSwipeRight) gestures.push('swipe-right');
    }
    if (enableVertical) {
      if (onSwipeUp) gestures.push('swipe-up');
      if (onSwipeDown) gestures.push('swipe-down');
    }
    setAvailableGestures(gestures);
  }, [enableHorizontal, enableVertical, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

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
    const touch = event.touches[0];
    const startPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    setTouchStart(startPoint);
    setTouchCurrent(startPoint);
    setSwipeState({
      isActive: true,
      direction: null,
      distance: 0,
      velocity: 0,
    });
  };

  // Handle touch move
  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = event.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    setTouchCurrent(currentPoint);
    
    const deltaX = currentPoint.x - touchStart.x;
    const deltaY = currentPoint.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeDiff = currentPoint.time - touchStart.time;
    const velocity = distance / timeDiff;
    
    // Determine direction
    let direction: SwipeState['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (enableHorizontal) {
        direction = deltaX > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (enableVertical) {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }
    
    setSwipeState({
      isActive: true,
      direction,
      distance,
      velocity,
    });
    
    // Prevent default scrolling for vertical swipes
    if (direction === 'up' || direction === 'down') {
      event.preventDefault();
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent) return;
    
    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeDiff = touchCurrent.time - touchStart.time;
    const velocity = distance / timeDiff;
    
    // Check if swipe meets threshold
    if (distance > threshold && velocity > 0.1) {
      let direction: SwipeState['direction'] = null;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (enableHorizontal) {
          direction = deltaX > 0 ? 'right' : 'left';
        }
      } else {
        // Vertical swipe
        if (enableVertical) {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      }
      
      // Execute swipe action
      if (direction) {
        triggerHapticFeedback('medium');
        
        switch (direction) {
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
        }
      }
    }
    
    // Reset state
    setTouchStart(null);
    setTouchCurrent(null);
    setSwipeState({
      isActive: false,
      direction: null,
      distance: 0,
      velocity: 0,
    });
  };

  // Get swipe indicators
  const getSwipeIndicators = () => {
    if (!showIndicators || availableGestures.length === 0) return null;
    
    return (
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {availableGestures.map((gesture, index) => {
          const isActive = swipeState.isActive && 
            swipeState.direction === gesture.split('-')[1];
          
          const icons = {
            'swipe-left': ArrowLeft,
            'swipe-right': ArrowRight,
            'swipe-up': ArrowUp,
            'swipe-down': ArrowDown,
          };
          
          const Icon = icons[gesture as keyof typeof icons];
          
          return (
            <Badge
              key={index}
              variant={isActive ? 'default' : 'secondary'}
              className={cn(
                'p-1 transition-all duration-200',
                isActive && 'scale-110 bg-primary'
              )}
            >
              <Icon className="h-3 w-3" />
            </Badge>
          );
        })}
      </div>
    );
  };

  // Get swipe feedback
  const getSwipeFeedback = () => {
    if (!swipeState.isActive || !swipeState.direction) return null;
    
    const progress = Math.min(swipeState.distance / threshold, 1);
    const isReady = progress >= 1;
    
    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            'bg-black/70 text-white text-sm font-medium',
            isReady ? 'scale-110 bg-green-500/70' : 'scale-100'
          )}>
            <Hand className="h-4 w-4" />
            <span className="capitalize">
              {swipeState.direction} {isReady ? 'Release!' : `${Math.round(progress * 100)}%`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: enableVertical ? 'none' : 'pan-y',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Swipe Indicators */}
      {getSwipeIndicators()}
      
      {/* Swipe Feedback */}
      {getSwipeFeedback()}
      
      {/* Content */}
      <div className={cn(
        'transition-transform duration-200',
        swipeState.isActive && 'scale-[0.98]'
      )}>
        {children}
      </div>
      
      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
          <div>Gestures: {availableGestures.length}</div>
          <div>Threshold: {threshold}px</div>
          {swipeState.isActive && (
            <div>
              Distance: {Math.round(swipeState.distance)}px
              <br />
              Velocity: {swipeState.velocity.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeGestures;