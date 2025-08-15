// Performance monitoring component for Phase 3 Advanced Performance
import React, { useState, useEffect, useRef } from 'react';
import { usePerformanceMetrics } from '../../hooks/useLazyLoad';

interface PerformanceData {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  timestamp: number;
}

export const PerformanceMonitor: React.FC<{
  isVisible?: boolean;
  componentName?: string;
}> = ({ isVisible = false, componentName = 'Unknown' }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceData | null>(null);
  const { metrics, startMeasure, endMeasure } = usePerformanceMetrics();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Collect performance data
  useEffect(() => {
    const collectMetrics = () => {
      const memory = (performance as any).memory;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const data: PerformanceData = {
        renderTime: metrics.renderTime,
        bundleSize: 0, // Would be calculated from bundle analyzer
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0, // MB
        networkLatency: navigation ? navigation.responseStart - navigation.requestStart : 0,
        cacheHitRate: 85, // Mock data - would come from actual cache metrics
        timestamp: Date.now()
      };

      setCurrentMetrics(data);
      setPerformanceData(prev => [...prev.slice(-19), data]); // Keep last 20 entries
    };

    if (isVisible) {
      collectMetrics();
      intervalRef.current = setInterval(collectMetrics, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, metrics]);

  // Performance score calculation
  const calculatePerformanceScore = () => {
    if (!currentMetrics) return 0;
    
    let score = 100;
    
    // Penalize high render times
    if (currentMetrics.renderTime > 16) score -= 20;
    if (currentMetrics.renderTime > 33) score -= 30;
    
    // Penalize high memory usage
    if (currentMetrics.memoryUsage > 50) score -= 15;
    if (currentMetrics.memoryUsage > 100) score -= 25;
    
    // Penalize high network latency
    if (currentMetrics.networkLatency > 100) score -= 10;
    if (currentMetrics.networkLatency > 500) score -= 20;
    
    // Bonus for high cache hit rate
    if (currentMetrics.cacheHitRate > 80) score += 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const performanceScore = calculatePerformanceScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible || !currentMetrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg max-w-sm z-[9999]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Performance Monitor
        </h3>
        <div className={`text-lg font-bold ${getScoreColor(performanceScore)}`}>
          {performanceScore}
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Component:</span>
          <span className="font-medium">{componentName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Render Time:</span>
          <span className={`font-medium ${currentMetrics.renderTime > 16 ? 'text-red-500' : 'text-green-500'}`}>
            {currentMetrics.renderTime.toFixed(2)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Memory:</span>
          <span className={`font-medium ${currentMetrics.memoryUsage > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
            {currentMetrics.memoryUsage.toFixed(1)}MB
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Network:</span>
          <span className={`font-medium ${currentMetrics.networkLatency > 100 ? 'text-red-500' : 'text-green-500'}`}>
            {currentMetrics.networkLatency.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cache Hit:</span>
          <span className="font-medium text-blue-500">
            {currentMetrics.cacheHitRate}%
          </span>
        </div>
      </div>
      
      {/* Performance trend chart (simplified) */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Render Time Trend</div>
        <div className="flex items-end space-x-1 h-8">
          {performanceData.slice(-10).map((data, i) => (
            <div
              key={i}
              className={`w-2 rounded-t ${data.renderTime > 16 ? 'bg-red-400' : 'bg-green-400'}`}
              style={{
                height: `${Math.min((data.renderTime / 50) * 100, 100)}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Performance warning component
export const PerformanceWarning: React.FC<{
  threshold: number;
  currentValue: number;
  metric: string;
  suggestion?: string;
}> = ({ threshold, currentValue, metric, suggestion }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(currentValue > threshold);
  }, [currentValue, threshold]);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Performance Warning:</strong> {metric} is {currentValue.toFixed(2)}, which exceeds the recommended threshold of {threshold}.
          </p>
          {suggestion && (
            <p className="text-sm text-yellow-600 mt-1">
              <strong>Suggestion:</strong> {suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default { PerformanceMonitor, PerformanceWarning };