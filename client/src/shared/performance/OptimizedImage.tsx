/**
 * Optimized Image Component
 * Amazon.com/Shopee.sg-Level Performance Optimization
 * WebP/AVIF support with lazy loading and intersection observer
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate optimized image sources
  const generateSources = (baseSrc: string) => {
    const sources = [];
    
    // WebP support
    if (baseSrc.includes('.jpg') || baseSrc.includes('.jpeg') || baseSrc.includes('.png')) {
      const webpSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
      sources.push({
        srcSet: `${webpSrc}?q=${quality}&w=${width || 800}`,
        type: 'image/webp',
      });
    }
    
    // AVIF support (next-gen format)
    if (baseSrc.includes('.jpg') || baseSrc.includes('.jpeg') || baseSrc.includes('.png')) {
      const avifSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '.avif');
      sources.push({
        srcSet: `${avifSrc}?q=${quality}&w=${width || 800}`,
        type: 'image/avif',
      });
    }
    
    return sources;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const sources = generateSources(src);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder while loading */}
      {!isLoaded && !isError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}
      
      {/* Main image with progressive enhancement */}
      {isInView && (
        <picture>
          {sources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              type={source.type}
              sizes={sizes}
            />
          ))}
          <img
            ref={imgRef}
            src={`${src}?q=${quality}${width ? `&w=${width}` : ''}${height ? `&h=${height}` : ''}`}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              isError && 'opacity-50'
            )}
            sizes={sizes}
          />
        </picture>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Optimized Banner component for banners and promotional images
export const OptimizedBanner: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} className={cn("w-full h-auto", props.className)} />;
};

// Optimized Product Image component for product displays
export const OptimizedProductImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} className={cn("aspect-square object-cover", props.className)} />;
};

// Optimized Avatar component for user profile images
export const OptimizedAvatar: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} className={cn("rounded-full aspect-square object-cover", props.className)} />;
};

export default OptimizedImage;