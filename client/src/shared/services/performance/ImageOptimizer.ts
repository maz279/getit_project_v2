/**
 * Image Optimizer Service
 * Amazon.com/Shopee.sg-Level Image Optimization
 * WebP/AVIF format support, responsive images, lazy loading
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  responsive?: boolean;
  blur?: boolean;
}

interface OptimizedImageData {
  url: string;
  format: string;
  size: number;
  width: number;
  height: number;
  compression: number;
}

class ImageOptimizer {
  private static instance: ImageOptimizer;
  private supportedFormats: Set<string> = new Set();
  private optimizedImages: Map<string, OptimizedImageData> = new Map();
  
  private constructor() {
    this.detectFormatSupport();
  }

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Detect supported image formats
   */
  private detectFormatSupport(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    // Check WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      this.supportedFormats.add('webp');
    }

    // Check AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      this.supportedFormats.add('avif');
    }

    // JPEG and PNG are always supported
    this.supportedFormats.add('jpeg');
    this.supportedFormats.add('png');
  }

  /**
   * Optimize image with modern formats
   */
  public async optimizeImage(
    src: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageData> {
    const cacheKey = this.getCacheKey(src, options);
    
    if (this.optimizedImages.has(cacheKey)) {
      return this.optimizedImages.get(cacheKey)!;
    }

    const optimizedData = await this.processImage(src, options);
    this.optimizedImages.set(cacheKey, optimizedData);
    
    return optimizedData;
  }

  /**
   * Process image optimization
   */
  private async processImage(
    src: string,
    options: ImageOptimizationOptions
  ): Promise<OptimizedImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate dimensions
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          options.width,
          options.height
        );

        canvas.width = width;
        canvas.height = height;

        // Apply blur if requested
        if (options.blur) {
          ctx.filter = 'blur(2px)';
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Determine optimal format
        const format = this.getOptimalFormat(options.format);
        const quality = (options.quality || 85) / 100;

        // Convert to optimized format
        const optimizedUrl = canvas.toDataURL(this.getMimeType(format), quality);
        
        // Calculate size (approximate)
        const size = this.estimateSize(optimizedUrl);
        const originalSize = this.estimateSize(src);
        const compression = originalSize > 0 ? (1 - size / originalSize) * 100 : 0;

        resolve({
          url: optimizedUrl,
          format,
          size,
          width,
          height,
          compression
        });
      };

      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }

  /**
   * Calculate optimal dimensions
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    if (!targetWidth && !targetHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    if (targetWidth && targetHeight) {
      return { width: targetWidth, height: targetHeight };
    }

    if (targetWidth) {
      const ratio = originalHeight / originalWidth;
      return { width: targetWidth, height: Math.round(targetWidth * ratio) };
    }

    if (targetHeight) {
      const ratio = originalWidth / originalHeight;
      return { width: Math.round(targetHeight * ratio), height: targetHeight };
    }

    return { width: originalWidth, height: originalHeight };
  }

  /**
   * Get optimal format based on browser support
   */
  private getOptimalFormat(preferredFormat?: string): string {
    if (preferredFormat && this.supportedFormats.has(preferredFormat)) {
      return preferredFormat;
    }

    // Prefer modern formats
    if (this.supportedFormats.has('avif')) {
      return 'avif';
    }

    if (this.supportedFormats.has('webp')) {
      return 'webp';
    }

    return 'jpeg';
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
   * Estimate file size
   */
  private estimateSize(url: string): number {
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      return base64 ? (base64.length * 3) / 4 : 0;
    }
    return 0;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(src: string, options: ImageOptimizationOptions): string {
    return `${src}_${JSON.stringify(options)}`;
  }

  /**
   * Create responsive image with multiple sizes
   */
  public async createResponsiveImage(
    src: string,
    sizes: number[] = [320, 640, 1024, 1920],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageData[]> {
    const responsiveImages: OptimizedImageData[] = [];

    for (const size of sizes) {
      const optimizedImage = await this.optimizeImage(src, {
        ...options,
        width: size
      });
      responsiveImages.push(optimizedImage);
    }

    return responsiveImages;
  }

  /**
   * Get supported formats
   */
  public getSupportedFormats(): string[] {
    return Array.from(this.supportedFormats);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.optimizedImages.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; totalSavings: number } {
    let totalSavings = 0;
    
    this.optimizedImages.forEach(image => {
      totalSavings += image.compression;
    });

    return {
      size: this.optimizedImages.size,
      totalSavings: totalSavings / this.optimizedImages.size || 0
    };
  }
}

export default ImageOptimizer;