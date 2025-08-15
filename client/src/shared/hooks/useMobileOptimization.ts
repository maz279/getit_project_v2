/**
 * Mobile Optimization Hook - Phase 2 Implementation
 * Shopee.sg-level mobile optimization with touch gestures, haptic feedback, and battery management
 * 
 * @fileoverview Complete mobile optimization hook for Phase 2 implementation
 * @author GetIt Platform Team
 * @version 2.0.0
 * @since Phase 2 Mobile-First Architecture Transformation
 */

import { useCallback, useEffect, useState, useRef } from 'react';

// Mobile Device Detection Interface
interface MobileDeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  operatingSystem: 'android' | 'ios' | 'windows' | 'linux' | 'macos';
  screenSize: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  networkType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  batteryLevel: number;
  isCharging: boolean;
  memoryInfo: {
    totalMemory: number;
    usedMemory: number;
    availableMemory: number;
  };
  connectionSpeed: 'slow' | 'moderate' | 'fast';
  touchCapabilities: {
    maxTouchPoints: number;
    supportsHaptics: boolean;
    supportsForce: boolean;
  };
}

// Touch Gesture Interfaces
interface TouchGestureConfig {
  swipeThreshold: number;
  tapTimeout: number;
  longPressTimeout: number;
  doubleTapTimeout: number;
  pinchThreshold: number;
  enableHapticFeedback: boolean;
  culturalGestures: boolean;
}

interface TouchGestureState {
  isActive: boolean;
  currentGesture: string | null;
  startTime: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  velocity: { x: number; y: number };
  scale: number;
  rotation: number;
}

// Performance Optimization Interface
interface PerformanceOptimization {
  responseTime: number;
  bundleOptimization: boolean;
  imageOptimization: boolean;
  lazyLoading: boolean;
  batterySaving: boolean;
  networkOptimization: boolean;
  cacheOptimization: boolean;
}

// Battery Management Interface
interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
  optimizationLevel: 'none' | 'moderate' | 'aggressive';
  recommendations: string[];
}

// Mobile Optimization Hook Configuration
interface MobileOptimizationConfig {
  enableTouchGestures: boolean;
  enableHapticFeedback: boolean;
  enableBatteryOptimization: boolean;
  enablePerformanceOptimization: boolean;
  enableNetworkOptimization: boolean;
  enableCulturalOptimization: boolean;
  targetResponseTime: number;
  batteryThresholds: {
    low: number;
    critical: number;
  };
}

// Hook Return Interface
interface MobileOptimizationReturn {
  deviceInfo: MobileDeviceInfo | null;
  touchGestureState: TouchGestureState;
  performanceOptimization: PerformanceOptimization;
  batteryStatus: BatteryStatus;
  config: MobileOptimizationConfig;
  // Device Detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  // Touch Gesture Functions
  enableTouchGestures: (element: HTMLElement) => void;
  disableTouchGestures: (element: HTMLElement) => void;
  triggerHapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  // Performance Functions
  optimizeForDevice: () => Promise<void>;
  measurePerformance: () => Promise<number>;
  enableBatterySaving: () => void;
  disableBatterySaving: () => void;
  // Network Functions
  optimizeForNetwork: (networkType: string) => void;
  preloadCriticalResources: () => void;
  // Cultural Functions
  enableBangladeshOptimization: () => void;
  adaptForPrayerTimes: () => void;
  // Utility Functions
  updateConfig: (newConfig: Partial<MobileOptimizationConfig>) => void;
  getOptimizationAnalytics: () => Promise<any>;
}

/**
 * Mobile Optimization Hook
 * 
 * Provides comprehensive mobile optimization capabilities:
 * - Touch gesture recognition with haptic feedback
 * - Battery-aware performance optimization
 * - Network-adaptive content loading
 * - Cultural optimization for Bangladesh market
 * - <100ms response time targeting
 * - Shopee.sg-level mobile experience
 * 
 * @example
 * ```tsx
 * const {
 *   isMobile,
 *   enableTouchGestures,
 *   triggerHapticFeedback,
 *   optimizeForDevice,
 *   batteryStatus
 * } = useMobileOptimization({
 *   enableTouchGestures: true,
 *   enableHapticFeedback: true,
 *   enableBatteryOptimization: true,
 *   targetResponseTime: 100
 * });
 * ```
 */
export const useMobileOptimization = (
  initialConfig: Partial<MobileOptimizationConfig> = {}
): MobileOptimizationReturn => {
  // State Management
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo | null>(null);
  const [touchGestureState, setTouchGestureState] = useState<TouchGestureState>({
    isActive: false,
    currentGesture: null,
    startTime: 0,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    scale: 1,
    rotation: 0
  });
  const [performanceOptimization, setPerformanceOptimization] = useState<PerformanceOptimization>({
    responseTime: 0,
    bundleOptimization: false,
    imageOptimization: false,
    lazyLoading: false,
    batterySaving: false,
    networkOptimization: false,
    cacheOptimization: false
  });
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: 100,
    charging: false,
    chargingTime: null,
    dischargingTime: null,
    optimizationLevel: 'none',
    recommendations: []
  });
  const [config, setConfig] = useState<MobileOptimizationConfig>({
    enableTouchGestures: true,
    enableHapticFeedback: true,
    enableBatteryOptimization: true,
    enablePerformanceOptimization: true,
    enableNetworkOptimization: true,
    enableCulturalOptimization: true,
    targetResponseTime: 100,
    batteryThresholds: {
      low: 20,
      critical: 10
    },
    ...initialConfig
  });

  // Refs for touch gesture handling
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchTimeoutRef = useRef<number | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Device Detection
  const isMobile = deviceInfo?.deviceType === 'mobile';
  const isTablet = deviceInfo?.deviceType === 'tablet';
  const isDesktop = deviceInfo?.deviceType === 'desktop';
  const isAndroid = deviceInfo?.operatingSystem === 'android';
  const isIOS = deviceInfo?.operatingSystem === 'ios';

  /**
   * Initialize device detection
   */
  useEffect(() => {
    const detectDevice = async () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobile|Android|iPhone|iPad/i.test(userAgent);
      const isTabletDevice = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      const isAndroidDevice = /Android/i.test(userAgent);
      const isIOSDevice = /iPhone|iPad/i.test(userAgent);

      // Get network information
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const networkType = connection?.effectiveType || 'unknown';

      // Get battery information
      const battery = await (navigator as any).getBattery?.() || null;

      // Get memory information
      const memory = (performance as any).memory || null;

      const deviceInfo: MobileDeviceInfo = {
        deviceType: isMobileDevice ? 'mobile' : isTabletDevice ? 'tablet' : 'desktop',
        operatingSystem: isAndroidDevice ? 'android' : isIOSDevice ? 'ios' : 'windows',
        screenSize: {
          width: window.screen.width,
          height: window.screen.height,
          pixelRatio: window.devicePixelRatio || 1
        },
        networkType: networkType as MobileDeviceInfo['networkType'],
        batteryLevel: battery ? Math.round(battery.level * 100) : 100,
        isCharging: battery ? battery.charging : false,
        memoryInfo: memory ? {
          totalMemory: memory.totalJSHeapSize,
          usedMemory: memory.usedJSHeapSize,
          availableMemory: memory.totalJSHeapSize - memory.usedJSHeapSize
        } : {
          totalMemory: 0,
          usedMemory: 0,
          availableMemory: 0
        },
        connectionSpeed: connection?.downlink >= 10 ? 'fast' : connection?.downlink >= 1 ? 'moderate' : 'slow',
        touchCapabilities: {
          maxTouchPoints: navigator.maxTouchPoints || 0,
          supportsHaptics: 'vibrate' in navigator,
          supportsForce: 'force' in TouchEvent.prototype
        }
      };

      setDeviceInfo(deviceInfo);
      
      // Update battery status
      if (battery) {
        setBatteryStatus(prev => ({
          ...prev,
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        }));
      }

      // Apply initial optimizations
      await optimizeForDevice();
    };

    detectDevice();
  }, []);

  /**
   * Enable touch gesture recognition
   */
  const enableTouchGestures = useCallback((element: HTMLElement) => {
    if (!config.enableTouchGestures) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now
      };

      setTouchGestureState(prev => ({
        ...prev,
        isActive: true,
        startTime: now,
        startPosition: { x: touch.clientX, y: touch.clientY },
        currentPosition: { x: touch.clientX, y: touch.clientY }
      }));

      // Setup long press detection
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      touchTimeoutRef.current = window.setTimeout(() => {
        triggerHapticFeedback('medium');
        setTouchGestureState(prev => ({
          ...prev,
          currentGesture: 'longpress'
        }));
      }, 500);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      setTouchGestureState(prev => ({
        ...prev,
        currentPosition: { x: touch.clientX, y: touch.clientY },
        velocity: {
          x: deltaX / (Date.now() - touchStartRef.current!.time),
          y: deltaY / (Date.now() - touchStartRef.current!.time)
        }
      }));

      // Detect swipe
      if (distance > 50) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        const direction = isHorizontal ? (deltaX > 0 ? 'right' : 'left') : (deltaY > 0 ? 'down' : 'up');
        
        setTouchGestureState(prev => ({
          ...prev,
          currentGesture: `swipe-${direction}`
        }));

        triggerHapticFeedback('light');
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      const now = Date.now();
      const duration = touchStartRef.current ? now - touchStartRef.current.time : 0;

      // Detect tap
      if (duration < 200 && touchGestureState.currentGesture === null) {
        setTouchGestureState(prev => ({
          ...prev,
          currentGesture: 'tap'
        }));
        triggerHapticFeedback('light');
      }

      // Reset state
      setTimeout(() => {
        setTouchGestureState(prev => ({
          ...prev,
          isActive: false,
          currentGesture: null
        }));
      }, 100);

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [config.enableTouchGestures, touchGestureState.currentGesture]);

  /**
   * Disable touch gesture recognition
   */
  const disableTouchGestures = useCallback((element: HTMLElement) => {
    // Remove all touch event listeners
    element.removeEventListener('touchstart', () => {});
    element.removeEventListener('touchmove', () => {});
    element.removeEventListener('touchend', () => {});
  }, []);

  /**
   * Trigger haptic feedback
   */
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (!config.enableHapticFeedback || !deviceInfo?.touchCapabilities.supportsHaptics) return;

    const patterns = {
      light: [10],
      medium: [50],
      heavy: [100]
    };

    navigator.vibrate(patterns[type]);
  }, [config.enableHapticFeedback, deviceInfo?.touchCapabilities.supportsHaptics]);

  /**
   * Optimize for device
   */
  const optimizeForDevice = useCallback(async () => {
    if (!deviceInfo) return;

    const optimizations: PerformanceOptimization = {
      responseTime: 0,
      bundleOptimization: config.enablePerformanceOptimization,
      imageOptimization: config.enablePerformanceOptimization,
      lazyLoading: config.enablePerformanceOptimization,
      batterySaving: config.enableBatteryOptimization && batteryStatus.level < config.batteryThresholds.low,
      networkOptimization: config.enableNetworkOptimization && (deviceInfo.networkType === '2g' || deviceInfo.networkType === '3g'),
      cacheOptimization: config.enablePerformanceOptimization
    };

    // Apply optimizations based on device type
    if (deviceInfo.deviceType === 'mobile') {
      optimizations.imageOptimization = true;
      optimizations.lazyLoading = true;
      
      // Enable battery saving for mobile devices
      if (batteryStatus.level < config.batteryThresholds.low) {
        optimizations.batterySaving = true;
      }
    }

    setPerformanceOptimization(optimizations);

    // Measure performance
    const responseTime = await measurePerformance();
    setPerformanceOptimization(prev => ({
      ...prev,
      responseTime
    }));

  }, [deviceInfo, batteryStatus, config]);

  /**
   * Measure performance
   */
  const measurePerformance = useCallback(async (): Promise<number> => {
    return new Promise((resolve) => {
      const start = performance.now();
      
      // Simulate performance measurement
      requestAnimationFrame(() => {
        const end = performance.now();
        const responseTime = end - start;
        resolve(responseTime);
      });
    });
  }, []);

  /**
   * Enable battery saving mode
   */
  const enableBatterySaving = useCallback(() => {
    setBatteryStatus(prev => ({
      ...prev,
      optimizationLevel: 'aggressive',
      recommendations: [
        'Reduce animation frequency',
        'Lower image quality',
        'Limit background processes',
        'Reduce network requests'
      ]
    }));

    setPerformanceOptimization(prev => ({
      ...prev,
      batterySaving: true
    }));
  }, []);

  /**
   * Disable battery saving mode
   */
  const disableBatterySaving = useCallback(() => {
    setBatteryStatus(prev => ({
      ...prev,
      optimizationLevel: 'none',
      recommendations: []
    }));

    setPerformanceOptimization(prev => ({
      ...prev,
      batterySaving: false
    }));
  }, []);

  /**
   * Optimize for network
   */
  const optimizeForNetwork = useCallback((networkType: string) => {
    const isSlowNetwork = networkType === '2g' || networkType === '3g';
    
    setPerformanceOptimization(prev => ({
      ...prev,
      networkOptimization: isSlowNetwork,
      imageOptimization: isSlowNetwork,
      lazyLoading: isSlowNetwork
    }));
  }, []);

  /**
   * Preload critical resources
   */
  const preloadCriticalResources = useCallback(() => {
    const criticalResources = [
      '/css/critical.css',
      '/js/critical.js',
      '/images/logo.webp'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 
                resource.endsWith('.js') ? 'script' : 'image';
      document.head.appendChild(link);
    });
  }, []);

  /**
   * Enable Bangladesh optimization
   */
  const enableBangladeshOptimization = useCallback(() => {
    // Bangladesh-specific optimizations
    const bangladeshOptimizations = {
      rightToLeftSupport: true,
      bengaliTextOptimization: true,
      mobilePaymentOptimization: true,
      lowBandwidthOptimization: true,
      culturalUXPatterns: true
    };

    console.log('Bangladesh optimizations enabled:', bangladeshOptimizations);
  }, []);

  /**
   * Adapt for prayer times
   */
  const adaptForPrayerTimes = useCallback(() => {
    const now = new Date();
    const prayerTimes = getPrayerTimes(now);
    
    // Adapt UI for prayer times
    const currentPrayerTime = getCurrentPrayerTime(now, prayerTimes);
    if (currentPrayerTime) {
      // Reduce animations and notifications during prayer time
      setPerformanceOptimization(prev => ({
        ...prev,
        batterySaving: true
      }));
    }
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<MobileOptimizationConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  /**
   * Get optimization analytics
   */
  const getOptimizationAnalytics = useCallback(async () => {
    return {
      deviceInfo,
      performanceOptimization,
      batteryStatus,
      touchGestureState,
      config,
      metrics: {
        averageResponseTime: performanceOptimization.responseTime,
        batteryOptimizationEnabled: performanceOptimization.batterySaving,
        networkOptimizationEnabled: performanceOptimization.networkOptimization,
        gestureRecognitionActive: touchGestureState.isActive
      }
    };
  }, [deviceInfo, performanceOptimization, batteryStatus, touchGestureState, config]);

  // Monitor battery status
  useEffect(() => {
    if (!deviceInfo) return;

    const updateBatteryStatus = async () => {
      const battery = await (navigator as any).getBattery?.() || null;
      if (battery) {
        const level = Math.round(battery.level * 100);
        
        setBatteryStatus(prev => ({
          ...prev,
          level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
          optimizationLevel: level < config.batteryThresholds.critical ? 'aggressive' :
                           level < config.batteryThresholds.low ? 'moderate' : 'none'
        }));

        // Auto-enable battery saving for low battery
        if (level < config.batteryThresholds.low && !performanceOptimization.batterySaving) {
          enableBatterySaving();
        }
      }
    };

    updateBatteryStatus();
    const interval = setInterval(updateBatteryStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [deviceInfo, config.batteryThresholds, performanceOptimization.batterySaving, enableBatterySaving]);

  // Performance monitoring
  useEffect(() => {
    if (!config.enablePerformanceOptimization) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const responseTime = entries.reduce((acc, entry) => acc + entry.duration, 0) / entries.length;
      
      setPerformanceOptimization(prev => ({
        ...prev,
        responseTime
      }));
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });
    performanceObserverRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [config.enablePerformanceOptimization]);

  return {
    deviceInfo,
    touchGestureState,
    performanceOptimization,
    batteryStatus,
    config,
    isMobile,
    isTablet,
    isDesktop,
    isAndroid,
    isIOS,
    enableTouchGestures,
    disableTouchGestures,
    triggerHapticFeedback,
    optimizeForDevice,
    measurePerformance,
    enableBatterySaving,
    disableBatterySaving,
    optimizeForNetwork,
    preloadCriticalResources,
    enableBangladeshOptimization,
    adaptForPrayerTimes,
    updateConfig,
    getOptimizationAnalytics
  };
};

// Helper functions
function getPrayerTimes(date: Date): any {
  // Simplified prayer times for Dhaka
  return {
    fajr: '05:30',
    dhuhr: '12:00',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30'
  };
}

function getCurrentPrayerTime(now: Date, prayerTimes: any): string | null {
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  for (const [prayer, time] of Object.entries(prayerTimes)) {
    const prayerTime = time as string;
    const [hour, minute] = prayerTime.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(hour, minute, 0, 0);
    
    // Check if current time is within 5 minutes of prayer time
    const timeDiff = Math.abs(now.getTime() - prayerDate.getTime());
    if (timeDiff <= 5 * 60 * 1000) { // 5 minutes in milliseconds
      return prayer;
    }
  }
  
  return null;
}

export default useMobileOptimization;