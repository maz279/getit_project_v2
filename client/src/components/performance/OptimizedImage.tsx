/**
 * Phase 1.3: Image Optimization & Lazy Loading
 * Target: LCP 6000ms → 2500ms (58% improvement)
 */

import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  priority = false,
  width,
  height,
  placeholder = 'blur',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(priority ? src : undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [src, priority, isInView]);

  // Handle load event
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle error event
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths.map(w => `${baseSrc}?w=${w}&q=75 ${w}w`).join(', ');
  };

  // Generate WebP source
  const getWebPSrc = (baseSrc: string) => {
    return baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate AVIF source
  const getAvifSrc = (baseSrc: string) => {
    return baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  };

  // Placeholder blur effect
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRTFFNEU4Ii8+Cjwvc3ZnPg==';

  if (hasError) {
    return (
      <div 
        className={`optimized-image-error ${className}`}
        style={{ 
          width: width || 'auto', 
          height: height || 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          fontSize: '14px'
        }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`}>
      <picture>
        {/* AVIF source for modern browsers */}
        <source
          srcSet={isInView ? generateSrcSet(getAvifSrc(src)) : undefined}
          sizes={sizes}
          type="image/avif"
        />
        
        {/* WebP source for modern browsers */}
        <source
          srcSet={isInView ? generateSrcSet(getWebPSrc(src)) : undefined}
          sizes={sizes}
          type="image/webp"
        />
        
        {/* Fallback JPEG/PNG */}
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={isInView ? generateSrcSet(src) : undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            backgroundImage: !isLoaded && placeholder === 'blur' ? `url(${blurDataURL})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: 'auto',
            maxWidth: '100%',
          }}
        />
      </picture>
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="optimized-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            fontSize: '14px',
            opacity: isInView ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {placeholder === 'blur' ? (
            <div className="animate-pulse">Loading...</div>
          ) : (
            placeholder
          )}
        </div>
      )}
    </div>
  );
};

// Specialized image components for different use cases
export const ProductImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    loading="lazy"
  />
);

export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes="100vw"
    loading="eager"
    priority={true}
  />
);

export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes="(max-width: 768px) 25vw, 20vw"
    loading="lazy"
  />
);

export const AvatarImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    sizes="(max-width: 768px) 40px, 48px"
    loading="lazy"
  />
);

// Progressive image loading utility
export const useProgressiveImage = (src: string) => {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLoadedSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  return { loadedSrc, isLoading };
};

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch image preloading
export const preloadImages = (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(preloadImage));
};

// Image optimization configuration
export const imageOptimizationConfig = {
  formats: ['avif', 'webp', 'jpeg'],
  quality: 75,
  sizes: {
    thumbnail: 200,
    small: 400,
    medium: 800,
    large: 1200,
    xlarge: 1600,
  },
  breakpoints: [320, 640, 768, 1024, 1280, 1920],
  lazyLoadOffset: 50,
  placeholderQuality: 10,
};

export default OptimizedImage;