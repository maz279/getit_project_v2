// Animation hooks for Phase 3 User Experience Enhancement
import { useState, useEffect, useRef, useCallback } from 'react';

interface AnimationOptions {
  duration?: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  iterations?: number | 'infinite';
}

// Smooth value transition hook
export const useAnimatedValue = (
  targetValue: number,
  options: AnimationOptions = {}
) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(targetValue);

  const {
    duration = 300,
    easing = 'ease-out',
    delay = 0
  } = options;

  const easingFunctions = {
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    'linear': (t: number) => t
  };

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp + delay;
      startValueRef.current = currentValue;
    }

    if (timestamp < startTimeRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunctions[easing](progress);
    
    const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
    setCurrentValue(newValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      startTimeRef.current = undefined;
    }
  }, [targetValue, currentValue, duration, easing, delay]);

  useEffect(() => {
    if (Math.abs(targetValue - currentValue) > 0.001) {
      startTimeRef.current = undefined;
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, animate]);

  return currentValue;
};

// Intersection-based animation hook
export const useRevealAnimation = (options: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && triggerOnce && !hasTriggered) {
          setHasTriggered(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  const shouldAnimate = triggerOnce ? hasTriggered : isVisible;

  return {
    elementRef,
    isVisible: shouldAnimate,
    hasTriggered
  };
};

// Stagger animation hook for lists
export const useStaggerAnimation = (
  itemCount: number,
  options: {
    staggerDelay?: number;
    trigger?: boolean;
  } = {}
) => {
  const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const {
    staggerDelay = 100,
    trigger = true
  } = options;

  useEffect(() => {
    if (!trigger) return;

    // Clear existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    // Start stagger animation
    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setAnimatedItems(prev => new Set(prev).add(i));
      }, i * staggerDelay);
      
      timeoutsRef.current.push(timeout);
    }

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [itemCount, staggerDelay, trigger]);

  const isItemAnimated = useCallback((index: number) => {
    return animatedItems.has(index);
  }, [animatedItems]);

  const resetAnimation = useCallback(() => {
    setAnimatedItems(new Set());
  }, []);

  return {
    isItemAnimated,
    resetAnimation,
    animatedCount: animatedItems.size
  };
};

// Parallax scrolling hook
export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      
      setOffset(parallax);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    elementRef,
    offset,
    transform: `translateY(${offset}px)`
  };
};

export default {
  useAnimatedValue,
  useRevealAnimation,
  useStaggerAnimation,
  useParallax
};