/**
 * Enterprise Asset Loading Hook
 * Amazon.com/Shopee.sg-Level Asset Management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { assetService } from '../services/AssetService';
import { imageOptimizer } from '../utils/imageOptimizer';

interface UseAssetLoaderOptions {
  preload?: boolean;
  lazy?: boolean;
  responsive?: boolean;
  webp?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface AssetLoaderResult {
  url: string;
  webpUrl?: string;
  responsiveUrls?: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  isLoading: boolean;
  error: Error | null;
  load: () => void;
  preload: () => Promise<void>;
}

export function useAssetLoader(
  assetPath: string,
  options: UseAssetLoaderOptions = {}
): AssetLoaderResult {
  const {
    preload = false,
    lazy = false,
    responsive = false,
    webp = false,
    quality = 85,
    width,
    height,
    onLoad,
    onError
  } = options;

  const [url, setUrl] = useState<string>('');
  const [webpUrl, setWebpUrl] = useState<string | undefined>();
  const [responsiveUrls, setResponsiveUrls] = useState<any>();
  const [isLoading, setIsLoading] = useState(!lazy);
  const [error, setError] = useState<Error | null>(null);
  
  const loadStartTime = useRef<number>(0);
  const hasLoaded = useRef<boolean>(false);

  const generateUrls = useCallback(() => {
    try {
      const baseUrl = assetService.getAssetUrl(assetPath, {
        quality,
        width,
        height
      });
      setUrl(baseUrl);

      if (webp) {
        const optimized = assetService.getOptimizedImage(assetPath, {
          width,
          height,
          quality
        });
        setWebpUrl(optimized.webp);
      }

      if (responsive) {
        const responsiveSet = assetService.getResponsiveImageUrls(assetPath);
        setResponsiveUrls(responsiveSet);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate asset URLs');
      setError(error);
      onError?.(error);
    }
  }, [assetPath, quality, width, height, webp, responsive, onError]);

  const load = useCallback(async () => {
    if (hasLoaded.current) return;
    
    setIsLoading(true);
    setError(null);
    loadStartTime.current = performance.now();

    try {
      generateUrls();
      
      if (preload) {
        await assetService.preloadAssets([assetPath]);
      }

      hasLoaded.current = true;
      const loadTime = performance.now() - loadStartTime.current;
      
      // Track performance
      assetService.trackAssetPerformance(assetPath, loadTime, 0);
      
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load asset');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [assetPath, preload, generateUrls, onLoad, onError]);

  const preloadAsset = useCallback(async () => {
    await assetService.preloadAssets([assetPath]);
  }, [assetPath]);

  // Auto-load if not lazy
  useEffect(() => {
    if (!lazy) {
      load();
    }
  }, [lazy, load]);

  // Preload if requested
  useEffect(() => {
    if (preload && !lazy) {
      preloadAsset();
    }
  }, [preload, lazy, preloadAsset]);

  return {
    url,
    webpUrl,
    responsiveUrls,
    isLoading,
    error,
    load,
    preload: preloadAsset
  };
}

/**
 * Hook for lazy loading images with Intersection Observer
 */
export function useLazyImage(
  ref: React.RefObject<HTMLImageElement>,
  assetPath: string,
  options: UseAssetLoaderOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const assetLoader = useAssetLoader(assetPath, { ...options, lazy: true });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          assetLoader.load();
          observer.unobserve(element);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, isVisible, assetLoader]);

  return {
    ...assetLoader,
    isVisible
  };
}

/**
 * Hook for progressive image loading
 */
export function useProgressiveImage(
  assetPath: string,
  options: UseAssetLoaderOptions = {}
) {
  const [placeholderUrl, setPlaceholderUrl] = useState<string>('');
  const [fullImageUrl, setFullImageUrl] = useState<string>('');
  const [isPlaceholderLoaded, setIsPlaceholderLoaded] = useState(false);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);

  const placeholderAsset = useAssetLoader(assetPath, {
    ...options,
    width: 50,
    quality: 20,
    onLoad: () => setIsPlaceholderLoaded(true)
  });

  const fullImageAsset = useAssetLoader(assetPath, {
    ...options,
    onLoad: () => setIsFullImageLoaded(true)
  });

  useEffect(() => {
    setPlaceholderUrl(placeholderAsset.url);
  }, [placeholderAsset.url]);

  useEffect(() => {
    if (isPlaceholderLoaded) {
      setFullImageUrl(fullImageAsset.url);
    }
  }, [isPlaceholderLoaded, fullImageAsset.url]);

  return {
    placeholderUrl,
    fullImageUrl,
    isPlaceholderLoaded,
    isFullImageLoaded,
    webpUrl: fullImageAsset.webpUrl,
    responsiveUrls: fullImageAsset.responsiveUrls,
    isLoading: placeholderAsset.isLoading || fullImageAsset.isLoading,
    error: placeholderAsset.error || fullImageAsset.error
  };
}

/**
 * Hook for preloading multiple assets
 */
export function useAssetPreloader(assetPaths: string[]) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [errors, setErrors] = useState<Error[]>([]);

  const preloadAssets = useCallback(async () => {
    if (assetPaths.length === 0) return;

    setIsPreloading(true);
    setPreloadedCount(0);
    setErrors([]);

    try {
      await assetService.preloadAssets(assetPaths);
      setPreloadedCount(assetPaths.length);
    } catch (error) {
      setErrors(prev => [...prev, error as Error]);
    } finally {
      setIsPreloading(false);
    }
  }, [assetPaths]);

  useEffect(() => {
    preloadAssets();
  }, [preloadAssets]);

  return {
    isPreloading,
    preloadedCount,
    totalCount: assetPaths.length,
    progress: assetPaths.length > 0 ? (preloadedCount / assetPaths.length) * 100 : 0,
    errors,
    preload: preloadAssets
  };
}