/**
 * Phase 2: Performance Monitoring Integration
 * Amazon.com/Shopee.sg-Level Performance Tracking Component
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  enableRealTimeMonitoring?: boolean;
  showDebugInfo?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enableRealTimeMonitoring = true,
  showDebugInfo = false,
  onMetricsUpdate,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Performance measurement utilities
  const measurePerformance = (): PerformanceMetrics => {
    // Get Navigation Timing API data
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Calculate load time
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
    
    // Calculate render time
    const renderTime = navigation.domContentLoadedEventEnd - navigation.navigationStart;
    
    // Estimate bundle size from resource timing
    const resources = performance.getEntriesByType('resource');
    const bundleSize = resources.reduce((total, resource) => {
      return total + (resource as PerformanceResourceTiming).transferSize || 0;
    }, 0);
    
    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Count network requests
    const networkRequests = resources.length;
    
    // Calculate cache hit rate
    const cachedResources = resources.filter(
      resource => (resource as PerformanceResourceTiming).transferSize === 0
    );
    const cacheHitRate = (cachedResources.length / networkRequests) * 100;

    return {
      loadTime: Math.round(loadTime),
      renderTime: Math.round(renderTime),
      bundleSize: Math.round(bundleSize / 1024), // Convert to KB
      memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
      networkRequests,
      cacheHitRate: Math.round(cacheHitRate),
      timestamp: Date.now(),
    };
  };

  // Start performance monitoring
  const startMonitoring = () => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Initial measurement
    const initialMetrics = measurePerformance();
    setMetrics(initialMetrics);
    onMetricsUpdate?.(initialMetrics);
    
    if (enableRealTimeMonitoring) {
      // Set up Performance Observer for real-time monitoring
      if ('PerformanceObserver' in window) {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
              const updatedMetrics = measurePerformance();
              setMetrics(updatedMetrics);
              onMetricsUpdate?.(updatedMetrics);
            }
          });
        });
        
        observerRef.current.observe({ entryTypes: ['navigation', 'resource'] });
      }
      
      // Set up periodic monitoring
      intervalRef.current = setInterval(() => {
        const updatedMetrics = measurePerformance();
        setMetrics(updatedMetrics);
        onMetricsUpdate?.(updatedMetrics);
      }, 5000); // Update every 5 seconds
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  // Performance score calculation
  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    const loadScore = metrics.loadTime < 2000 ? 100 : Math.max(0, 100 - (metrics.loadTime - 2000) / 100);
    const renderScore = metrics.renderTime < 1000 ? 100 : Math.max(0, 100 - (metrics.renderTime - 1000) / 50);
    const bundleScore = metrics.bundleSize < 300 ? 100 : Math.max(0, 100 - (metrics.bundleSize - 300) / 10);
    const cacheScore = metrics.cacheHitRate;
    
    return Math.round((loadScore + renderScore + bundleScore + cacheScore) / 4);
  };

  // Get performance status
  const getPerformanceStatus = (score: number): { color: string; label: string } => {
    if (score >= 90) return { color: 'green', label: 'Excellent' };
    if (score >= 70) return { color: 'yellow', label: 'Good' };
    if (score >= 50) return { color: 'orange', label: 'Needs Improvement' };
    return { color: 'red', label: 'Poor' };
  };

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [enableRealTimeMonitoring]);

  if (!metrics) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Initializing performance monitoring...
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceScore = getPerformanceScore(metrics);
  const status = getPerformanceStatus(performanceScore);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </span>
          <Badge variant={status.color === 'green' ? 'default' : 'secondary'}>
            {status.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Performance Score</span>
            <span className="font-medium">{performanceScore}/100</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Load Time
            </div>
            <div className="font-medium">
              {metrics.loadTime}ms
              {metrics.loadTime < 2000 && <span className="text-green-500 ml-1">✓</span>}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Zap className="h-3 w-3" />
              Render Time
            </div>
            <div className="font-medium">
              {metrics.renderTime}ms
              {metrics.renderTime < 1000 && <span className="text-green-500 ml-1">✓</span>}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Bundle Size
            </div>
            <div className="font-medium">
              {metrics.bundleSize}KB
              {metrics.bundleSize < 300 && <span className="text-green-500 ml-1">✓</span>}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            <div className="font-medium">
              {metrics.cacheHitRate}%
              {metrics.cacheHitRate > 70 && <span className="text-green-500 ml-1">✓</span>}
            </div>
          </div>
        </div>

        {showDebugInfo && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="text-sm text-muted-foreground">Debug Info:</div>
            <div className="text-xs space-y-1">
              <div>Memory Usage: {metrics.memoryUsage}MB</div>
              <div>Network Requests: {metrics.networkRequests}</div>
              <div>Last Updated: {new Date(metrics.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {/* Performance Target Status */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Phase 2 Targets:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Load Time {'<'} 2s</span>
              <span className={metrics.loadTime < 2000 ? 'text-green-500' : 'text-red-500'}>
                {metrics.loadTime < 2000 ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bundle Size {'<'} 300KB</span>
              <span className={metrics.bundleSize < 300 ? 'text-green-500' : 'text-red-500'}>
                {metrics.bundleSize < 300 ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mobile Score {'>'} 90</span>
              <span className={performanceScore > 90 ? 'text-green-500' : 'text-red-500'}>
                {performanceScore > 90 ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;