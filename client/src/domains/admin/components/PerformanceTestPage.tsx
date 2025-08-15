/**
 * Performance Test Page for GetIt Platform
 * Demonstrates Phase 1 Asset Management & Performance Foundation
 * 
 * @fileoverview Test page showcasing all performance optimization features
 * @version 2.0.0
 * @author GetIt Platform Team
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { OptimizedImage, OptimizedAvatar, OptimizedProductImage, OptimizedBanner } from '@/shared/performance/OptimizedImage';
import { PerformanceDashboard } from '@/shared/performance/PerformanceDashboard';
import { LazyComponentWrapper } from '@/shared/performance/LazyComponentWrapper';
import staticFallbackMode from '@/shared/utils/staticFallbackMode';
import emergencyClsActivator from '@/shared/utils/emergencyClsActivator';
import { useLazyLoading, useLazyImage, useNetworkAdaptiveLazyLoading } from '@/shared/hooks/useLazyLoading';
import { assetService } from '@/shared/services/AssetService';
import bundleOptimizer from '@/shared/utils/bundleOptimizer';
import performanceMonitor from '@/shared/utils/performanceMonitor';
import { 
  Activity, 
  Image, 
  Zap, 
  BarChart3, 
  Globe, 
  Smartphone,
  Gauge,
  Download,
  Eye,
  Clock
} from 'lucide-react';

/**
 * Performance test component for showcasing optimizations
 */
const PerformanceTestPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [assetStats, setAssetStats] = useState<any>(null);
  const [bundleReport, setBundleReport] = useState<any>(null);

  // Test image URLs (using Unsplash for demonstration)
  const testImages = {
    hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    product1: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    product2: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    product3: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    banner: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80'
  };

  /**
   * Load performance metrics with CLS monitoring
   */
  useEffect(() => {
    // IMMEDIATE EMERGENCY ACTIVATION - CLS Crisis Response
    console.log('🚨 CLS CRISIS DETECTED - Activating emergency mode immediately');
    emergencyClsActivator.activateEmergencyMode();

    // Check CLS immediately on page load
    const checkCLSImmediate = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            const cls = entry.value;
            if (cls > 0.1 && !emergencyClsActivator.isActive()) {
              console.log(`🛑 CRITICAL CLS DETECTED: ${cls.toFixed(2)} - Activating emergency mode`);
              emergencyClsActivator.activateEmergencyMode();
              return;
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    checkCLSImmediate();

    const loadMetrics = async () => {
      try {
        // Stop metrics loading if emergency mode is active
        if (emergencyClsActivator.isActive()) {
          console.log('🛑 Emergency CLS mode active - stopping all metrics updates');
          return;
        }

        // Get performance metrics (limited to prevent CLS)
        const performanceReport = performanceMonitor.getPerformanceReport();
        
        // Check CLS from performance report - emergency activation
        const cls = performanceReport?.coreWebVitals?.cls || 0;
        if (cls > 0.1) {
          console.log(`🛑 CRITICAL CLS DETECTED: ${cls.toFixed(2)} - Activating emergency mode immediately`);
          emergencyClsActivator.activateEmergencyMode();
          return;
        }

        // Only update metrics if safe
        setMetrics(performanceReport);

        console.log('📊 Performance test page metrics loaded (emergency mode protected)');
      } catch (error) {
        console.error('Failed to load performance metrics:', error);
        // Activate emergency mode on any error
        emergencyClsActivator.activateEmergencyMode();
      }
    };

    loadMetrics();

    // Update metrics every 10 seconds (unless static fallback mode is active)
    const interval = setInterval(() => {
      if (!staticFallbackMode.isActivated()) {
        loadMetrics();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Test asset preloading
   */
  const handlePreloadTest = async () => {
    const assets = [
      { path: testImages.product1, options: { format: 'webp' as const, quality: 85 } },
      { path: testImages.product2, options: { format: 'webp' as const, quality: 85 } },
      { path: testImages.product3, options: { format: 'webp' as const, quality: 85 } }
    ];

    try {
      await assetService.preloadAssets(assets);
      console.log('✅ Asset preloading test completed');
    } catch (error) {
      console.error('Asset preloading test failed:', error);
    }
  };

  /**
   * Test bundle optimization
   */
  const handleBundleTest = () => {
    const analysis = bundleOptimizer.analyzeBundleComposition();
    console.log('📦 Bundle analysis:', analysis);
    
    const bangladeshOptimization = bundleOptimizer.optimizeForBangladeshNetworks();
    console.log('🇧🇩 Bangladesh optimization:', bangladeshOptimization);
  };

  /**
   * Clear all caches for testing
   */
  const handleClearCaches = () => {
    assetService.clearCache();
    console.log('🗑️ All caches cleared');
  };

  /**
   * Manual emergency activation for CLS crisis
   */
  const handleEmergencyActivation = () => {
    console.log('🚨 MANUAL EMERGENCY ACTIVATION - User triggered');
    emergencyClsActivator.activateEmergencyMode();
  };

  /**
   * Check emergency status
   */
  const getEmergencyStatus = () => {
    return emergencyClsActivator.isActive() 
      ? '🛑 EMERGENCY ACTIVE' 
      : '✅ Normal Mode';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Phase 1: Asset Management & Performance Foundation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Testing Amazon.com/Shopee.sg-level performance optimizations
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <Button onClick={handlePreloadTest} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Test Preloading</span>
            </Button>
            <Button onClick={handleBundleTest} variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analyze Bundle</span>
            </Button>
            <Button onClick={handleClearCaches} variant="outline" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Clear Cache</span>
            </Button>
            <Button 
              onClick={handleEmergencyActivation} 
              variant="destructive" 
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
            >
              <Activity className="w-4 h-4" />
              <span>🚨 Emergency Mode</span>
            </Button>
          </div>
          
          {/* Emergency Status Display */}
          <div className="text-center mb-4">
            <Badge 
              variant={emergencyClsActivator.isActive() ? "destructive" : "secondary"}
              className="text-sm px-4 py-2"
            >
              {getEmergencyStatus()}
            </Badge>
          </div>
        </div>

        {/* Performance Dashboard */}
        <PerformanceDashboard className="mb-8" />

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="images">Optimized Images</TabsTrigger>
            <TabsTrigger value="lazy">Lazy Loading</TabsTrigger>
            <TabsTrigger value="components">Lazy Components</TabsTrigger>
            <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
            <TabsTrigger value="network">Network Adaptive</TabsTrigger>
          </TabsList>

          {/* Optimized Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-5 h-5" />
                  <span>Image Optimization Test</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hero Banner */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hero Banner (WebP, Priority Loading)</h3>
                  <OptimizedBanner
                    src={testImages.hero}
                    alt="Hero banner"
                    className="h-40 rounded-lg"
                    priority={true}
                    onLoadComplete={(loadTime) => console.log(`Hero loaded in ${loadTime}ms`)}
                  />
                </div>

                {/* Product Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Product Images (WebP, Lazy Loading)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <OptimizedProductImage
                      src={testImages.product1}
                      alt="Product 1"
                      className="rounded-lg"
                      onLoadComplete={(loadTime) => console.log(`Product 1 loaded in ${loadTime}ms`)}
                    />
                    <OptimizedProductImage
                      src={testImages.product2}
                      alt="Product 2"
                      className="rounded-lg"
                      onLoadComplete={(loadTime) => console.log(`Product 2 loaded in ${loadTime}ms`)}
                    />
                    <OptimizedProductImage
                      src={testImages.product3}
                      alt="Product 3"
                      className="rounded-lg"
                      onLoadComplete={(loadTime) => console.log(`Product 3 loaded in ${loadTime}ms`)}
                    />
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Avatar (Circular, High Quality)</h3>
                  <OptimizedAvatar
                    src={testImages.avatar}
                    alt="User avatar"
                    size={80}
                    onLoadComplete={(loadTime) => console.log(`Avatar loaded in ${loadTime}ms`)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lazy Loading Tab */}
          <TabsContent value="lazy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Intersection Observer Lazy Loading</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Spacer to test lazy loading */}
                  <div className="h-96 bg-gradient-to-b from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600">Scroll down to test lazy loading...</p>
                  </div>

                  {/* Lazy loaded images */}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <LazyImageTest key={index} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lazy Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Dynamic Component Loading</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Test lazy component loading */}
                  <LazyComponentWrapper
                    importFn={() => import('@/shared/utilities/LazyTestComponent')}
                    className="p-4 border rounded-lg"
                    onLoad={() => console.log('Lazy component loaded')}
                    onError={(error) => console.error('Lazy component error:', error)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bundle Analysis Tab */}
          <TabsContent value="bundle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Bundle Optimization Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bundleReport ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Current vs Optimized</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Current Size:</span>
                          <span>{(bundleReport.currentSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Optimized Size:</span>
                          <span className="text-green-600">{(bundleReport.optimizedSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reduction:</span>
                          <Badge variant="default">{bundleReport.reductionPercentage}%</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Performance Gains</h3>
                      <ul className="space-y-1 text-sm">
                        {bundleReport.performanceGains.map((gain: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>{gain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>Loading bundle analysis...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Adaptive Tab */}
          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Bangladesh Network Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NetworkAdaptiveTest />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

/**
 * Lazy image test component
 */
const LazyImageTest: React.FC<{ index: number }> = ({ index }) => {
  const [elementRef, imageState] = useLazyImage(
    `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&q=80`,
    { threshold: 0.1, priority: 'medium' }
  );

  return (
    <div ref={elementRef} className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Lazy Image {index + 1}</h4>
        <div className="flex items-center space-x-2">
          {imageState.isVisible && <Badge variant="outline">Visible</Badge>}
          {imageState.isLoaded && <Badge variant="default">Loaded</Badge>}
          {imageState.loadTime && (
            <Badge variant="secondary">{imageState.loadTime.toFixed(0)}ms</Badge>
          )}
        </div>
      </div>
      <div className="h-40 bg-gray-200 rounded flex items-center justify-center">
        {imageState.isLoaded && imageState.imageSrc ? (
          <img
            src={imageState.imageSrc}
            alt={`Lazy loaded image ${index + 1}`}
            className="w-full h-full object-cover rounded"
          />
        ) : imageState.isVisible ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="text-gray-400">Waiting for visibility...</div>
        )}
      </div>
    </div>
  );
};

/**
 * Network adaptive test component
 */
const NetworkAdaptiveTest: React.FC = () => {
  const [elementRef, networkState] = useNetworkAdaptiveLazyLoading({
    threshold: 0.1,
    networkAdaptive: true
  });

  return (
    <div ref={elementRef} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Network Information</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Connection Type:</span>
                <Badge variant="outline">{networkState.networkType.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Data Saver Mode:</span>
                <Badge variant={networkState.dataMode === 'saver' ? 'default' : 'outline'}>
                  {networkState.dataMode === 'saver' ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Optimization Active:</span>
                <Badge variant="default">
                  {networkState.networkType === '2g' || networkState.networkType === '3g' ? 'Yes' : 'Standard'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Loading Strategy</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Image Quality:</span>
                <span>{networkState.networkType === '2g' ? '60%' : networkState.networkType === '3g' ? '70%' : '80%'}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Width:</span>
                <span>{networkState.networkType === '2g' ? '640px' : networkState.networkType === '3g' ? '1024px' : '1920px'}</span>
              </div>
              <div className="flex justify-between">
                <span>Preload Distance:</span>
                <span>{networkState.networkType === '2g' ? '20px' : networkState.networkType === '3g' ? '35px' : '75px'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceTestPage;