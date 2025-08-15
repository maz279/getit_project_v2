/**
 * Asset Optimizer Service
 * Amazon.com/Shopee.sg-Level Asset Optimization
 * Handles image optimization, lazy loading, and modern format support
 */

interface OptimizedAsset {
  id: string;
  originalUrl: string;
  optimizedUrl: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  size: number;
  originalSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  timestamp: number;
}

interface AssetOptimizationConfig {
  enableWebP: boolean;
  enableAVIF: boolean;
  quality: number;
  enableLazyLoading: boolean;
  enableResponsiveImages: boolean;
  enableImagePlaceholders: boolean;
  maxWidth: number;
  maxHeight: number;
}

interface AssetMetrics {
  totalAssets: number;
  optimizedAssets: number;
  totalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  loadingTime: number;
  cacheHitRate: number;
}

class AssetOptimizer {
  private static instance: AssetOptimizer;
  private config: AssetOptimizationConfig;
  private optimizedAssets: Map<string, OptimizedAsset>;
  private assetCache: Map<string, string>;
  private metrics: AssetMetrics;
  private intersectionObserver: IntersectionObserver | null = null;

  private constructor() {
    this.config = {
      enableWebP: true,
      enableAVIF: true,
      quality: 85,
      enableLazyLoading: true,
      enableResponsiveImages: true,
      enableImagePlaceholders: true,
      maxWidth: 1920,
      maxHeight: 1080
    };

    this.optimizedAssets = new Map();
    this.assetCache = new Map();
    this.metrics = {
      totalAssets: 0,
      optimizedAssets: 0,
      totalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      loadingTime: 0,
      cacheHitRate: 0
    };

    this.initializeLazyLoading();
  }

  static getInstance(): AssetOptimizer {
    if (!AssetOptimizer.instance) {
      AssetOptimizer.instance = new AssetOptimizer();
    }
    return AssetOptimizer.instance;
  }

  /**
   * Initialize lazy loading with Intersection Observer
   */
  private initializeLazyLoading(): void {
    if (!window.IntersectionObserver || !this.config.enableLazyLoading) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.intersectionObserver?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }

  /**
   * Optimize image with modern formats
   */
  public async optimizeImage(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
    } = {}
  ): Promise<OptimizedAsset> {
    const assetId = this.generateAssetId(originalUrl);
    
    // Check cache first
    if (this.optimizedAssets.has(assetId)) {
      return this.optimizedAssets.get(assetId)!;
    }

    const startTime = performance.now();
    
    try {
      // Get original image dimensions and size
      const originalImage = await this.loadImageData(originalUrl);
      const { width: originalWidth, height: originalHeight, size: originalSize } = originalImage;
      
      // Determine optimal format
      const format = this.determineOptimalFormat(options.format);
      
      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(
        originalWidth,
        originalHeight,
        options.width,
        options.height
      );
      
      // Optimize image
      const optimizedUrl = await this.processImage(originalUrl, {
        width,
        height,
        quality: options.quality || this.config.quality,
        format
      });
      
      // Calculate compression ratio
      const optimizedSize = await this.getImageSize(optimizedUrl);
      const compressionRatio = originalSize > 0 ? (1 - optimizedSize / originalSize) * 100 : 0;
      
      const optimizedAsset: OptimizedAsset = {
        id: assetId,
        originalUrl,
        optimizedUrl,
        format,
        size: optimizedSize,
        originalSize,
        compressionRatio,
        width,
        height,
        timestamp: Date.now()
      };
      
      // Cache the optimized asset
      this.optimizedAssets.set(assetId, optimizedAsset);
      
      // Update metrics
      this.updateMetrics(optimizedAsset, performance.now() - startTime);
      
      return optimizedAsset;
      
    } catch (error) {
      console.error('Image optimization failed:', error);
      
      // Return fallback asset
      return {
        id: assetId,
        originalUrl,
        optimizedUrl: originalUrl,
        format: 'jpeg',
        size: 0,
        originalSize: 0,
        compressionRatio: 0,
        width: 0,
        height: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Generate asset ID
   */
  private generateAssetId(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Load image data
   */
  private async loadImageData(url: string): Promise<{ width: number; height: number; size: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Estimate file size (rough calculation)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Estimate size based on canvas data
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const estimatedSize = imageData.data.length;
          
          resolve({
            width: img.width,
            height: img.height,
            size: estimatedSize
          });
        } else {
          resolve({
            width: img.width,
            height: img.height,
            size: 0
          });
        }
      };
      
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  /**
   * Determine optimal format based on browser support
   */
  private determineOptimalFormat(preferredFormat?: string): 'webp' | 'avif' | 'jpeg' | 'png' {
    if (preferredFormat) {
      return preferredFormat as 'webp' | 'avif' | 'jpeg' | 'png';
    }
    
    // Check browser support
    if (this.config.enableAVIF && this.supportsAVIF()) {
      return 'avif';
    }
    
    if (this.config.enableWebP && this.supportsWebP()) {
      return 'webp';
    }
    
    return 'jpeg';
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check AVIF support
   */
  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Calculate optimal dimensions
   */
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    let width = targetWidth || originalWidth;
    let height = targetHeight || originalHeight;
    
    // Apply max constraints
    if (width > this.config.maxWidth) {
      height = (height * this.config.maxWidth) / width;
      width = this.config.maxWidth;
    }
    
    if (height > this.config.maxHeight) {
      width = (width * this.config.maxHeight) / height;
      height = this.config.maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Process image with optimization
   */
  private async processImage(
    url: string,
    options: {
      width: number;
      height: number;
      quality: number;
      format: 'webp' | 'avif' | 'jpeg' | 'png';
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = options.width;
        canvas.height = options.height;
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, options.width, options.height);
        
        // Convert to optimized format
        const mimeType = this.getMimeType(options.format);
        const quality = options.quality / 100;
        
        const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(optimizedDataUrl);
      };
      
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'webp':
        return 'image/webp';
      case 'avif':
        return 'image/avif';
      case 'png':
        return 'image/png';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Get image size
   */
  private async getImageSize(url: string): Promise<number> {
    if (url.startsWith('data:')) {
      // For data URLs, estimate size
      const base64 = url.split(',')[1];
      return base64 ? (base64.length * 3) / 4 : 0;
    }
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(asset: OptimizedAsset, loadingTime: number): void {
    this.metrics.totalAssets++;
    this.metrics.optimizedAssets++;
    this.metrics.totalSize += asset.originalSize;
    this.metrics.optimizedSize += asset.size;
    this.metrics.compressionRatio = this.metrics.totalSize > 0 ? 
      (1 - this.metrics.optimizedSize / this.metrics.totalSize) * 100 : 0;
    this.metrics.loadingTime = (this.metrics.loadingTime + loadingTime) / 2; // Average
  }

  /**
   * Load image with lazy loading
   */
  private loadImage(img: HTMLImageElement): void {
    const dataSrc = img.dataset.src;
    if (dataSrc) {
      img.src = dataSrc;
      img.removeAttribute('data-src');
    }
  }

  /**
   * Create optimized image element
   */
  public createOptimizedImage(
    src: string,
    options: {
      alt?: string;
      className?: string;
      width?: number;
      height?: number;
      lazy?: boolean;
      placeholder?: string;
    } = {}
  ): HTMLImageElement {
    const img = document.createElement('img');
    
    // Set attributes
    if (options.alt) img.alt = options.alt;
    if (options.className) img.className = options.className;
    if (options.width) img.width = options.width;
    if (options.height) img.height = options.height;
    
    // Handle lazy loading
    if (options.lazy && this.config.enableLazyLoading) {
      img.dataset.src = src;
      
      // Add placeholder
      if (options.placeholder) {
        img.src = options.placeholder;
      } else if (this.config.enableImagePlaceholders) {
        img.src = this.generatePlaceholder(options.width || 300, options.height || 200);
      }
      
      // Add to intersection observer
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(img);
      }
    } else {
      img.src = src;
    }
    
    return img;
  }

  /**
   * Generate placeholder image
   */
  private generatePlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = width;
    canvas.height = height;
    
    // Create gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Get asset metrics
   */
  public getMetrics(): AssetMetrics {
    return { ...this.metrics };
  }

  /**
   * Get optimized assets
   */
  public getOptimizedAssets(): OptimizedAsset[] {
    return Array.from(this.optimizedAssets.values());
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.optimizedAssets.clear();
    this.assetCache.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AssetOptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  public getConfig(): AssetOptimizationConfig {
    return { ...this.config };
  }
}

export default AssetOptimizer;