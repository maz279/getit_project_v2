// Mobile responsiveness hook for Phase 3 Enhancement
import { useState, useEffect, useCallback } from 'react';

interface ScreenSize {
  width: number;
  height: number;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  pixelRatio: number;
}

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

export const useDeviceInfo = (): DeviceInfo => {
  const screenSize = useScreenSize();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    touchSupported: false,
    pixelRatio: 1
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = screenSize.width;
      const height = screenSize.height;

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        pixelRatio: window.devicePixelRatio || 1
      });
    };

    updateDeviceInfo();
  }, [screenSize]);

  return deviceInfo;
};

// Breakpoint hook
export const useBreakpoint = () => {
  const screenSize = useScreenSize();

  const breakpoints = {
    xs: screenSize.width < 480,
    sm: screenSize.width >= 480 && screenSize.width < 768,
    md: screenSize.width >= 768 && screenSize.width < 1024,
    lg: screenSize.width >= 1024 && screenSize.width < 1280,
    xl: screenSize.width >= 1280,
    '2xl': screenSize.width >= 1536
  };

  const currentBreakpoint = Object.entries(breakpoints)
    .reverse()
    .find(([, matches]) => matches)?.[0] || 'xs';

  return {
    ...breakpoints,
    current: currentBreakpoint,
    isAtLeast: (breakpoint: keyof typeof breakpoints) => {
      const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const currentIndex = order.indexOf(currentBreakpoint);
      const targetIndex = order.indexOf(breakpoint);
      return currentIndex >= targetIndex;
    }
  };
};

// Touch gesture hook
export const useTouchGestures = (elementRef: React.RefObject<HTMLElement>) => {
  const [gestures, setGestures] = useState({
    isTouch: false,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 },
    direction: 'none' as 'left' | 'right' | 'up' | 'down' | 'none'
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setGestures(prev => ({
      ...prev,
      isTouch: true,
      startPoint: { x: touch.clientX, y: touch.clientY },
      currentPoint: { x: touch.clientX, y: touch.clientY }
    }));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestures.startPoint.x;
    const deltaY = touch.clientY - gestures.startPoint.y;
    
    let direction: 'left' | 'right' | 'up' | 'down' | 'none' = 'none';
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setGestures(prev => ({
      ...prev,
      currentPoint: { x: touch.clientX, y: touch.clientY },
      direction
    }));
  }, [gestures.startPoint]);

  const handleTouchEnd = useCallback(() => {
    setGestures(prev => ({
      ...prev,
      isTouch: false,
      direction: 'none'
    }));
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return gestures;
};

// Responsive component sizing hook
export const useResponsiveSize = (config: {
  mobile: number;
  tablet: number;
  desktop: number;
}) => {
  const { isMobile, isTablet, isDesktop } = useDeviceInfo();

  if (isMobile) return config.mobile;
  if (isTablet) return config.tablet;
  if (isDesktop) return config.desktop;
  return config.desktop;
};

// Safe area insets for mobile devices
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};

export default {
  useScreenSize,
  useDeviceInfo,
  useBreakpoint,
  useTouchGestures,
  useResponsiveSize,
  useSafeArea
};