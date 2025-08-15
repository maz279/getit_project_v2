/**
 * CDN Configuration for Amazon.com/Shopee.sg-Level Asset Delivery
 * Bangladesh-optimized content delivery network setup
 */

export interface CDNConfig {
  baseUrl: string;
  regions: CDNRegion[];
  cacheHeaders: CacheConfig;
  optimization: OptimizationConfig;
  security: SecurityConfig;
}

export interface CDNRegion {
  name: string;
  endpoint: string;
  priority: number;
  latency: number;
}

export interface CacheConfig {
  images: string;
  videos: string;
  fonts: string;
  scripts: string;
  styles: string;
  documents: string;
}

export interface OptimizationConfig {
  imageFormats: string[];
  videoFormats: string[];
  compression: {
    enabled: boolean;
    level: number;
    minSize: number;
  };
  minification: {
    css: boolean;
    js: boolean;
    html: boolean;
  };
}

export interface SecurityConfig {
  cors: {
    enabled: boolean;
    origins: string[];
  };
  hotlinkProtection: boolean;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
  };
}

/**
 * Production CDN Configuration
 */
export const CDN_CONFIG: CDNConfig = {
  baseUrl: import.meta.env.VITE_CDN_URL || 'https://cdn.getit.com.bd',
  
  regions: [
    {
      name: 'Dhaka',
      endpoint: 'https://dhaka.cdn.getit.com.bd',
      priority: 1,
      latency: 15 // ms
    },
    {
      name: 'Chittagong',
      endpoint: 'https://chittagong.cdn.getit.com.bd',
      priority: 2,
      latency: 25
    },
    {
      name: 'Sylhet',
      endpoint: 'https://sylhet.cdn.getit.com.bd',
      priority: 3,
      latency: 35
    },
    {
      name: 'Singapore',
      endpoint: 'https://singapore.cdn.getit.com.bd',
      priority: 4,
      latency: 45
    },
    {
      name: 'Mumbai',
      endpoint: 'https://mumbai.cdn.getit.com.bd',
      priority: 5,
      latency: 55
    }
  ],

  cacheHeaders: {
    images: 'public, max-age=31536000, stale-while-revalidate=86400', // 1 year, 1 day stale
    videos: 'public, max-age=2592000, stale-while-revalidate=86400',  // 30 days, 1 day stale
    fonts: 'public, max-age=31536000, immutable',                     // 1 year, immutable
    scripts: 'public, max-age=31536000, stale-while-revalidate=3600', // 1 year, 1 hour stale
    styles: 'public, max-age=31536000, stale-while-revalidate=3600',  // 1 year, 1 hour stale
    documents: 'public, max-age=3600, stale-while-revalidate=60'      // 1 hour, 1 minute stale
  },

  optimization: {
    imageFormats: ['webp', 'avif', 'png', 'jpg', 'jpeg'],
    videoFormats: ['webm', 'mp4', 'ogg'],
    compression: {
      enabled: true,
      level: 6, // Balanced compression
      minSize: 1024 // Only compress files > 1KB
    },
    minification: {
      css: true,
      js: true,
      html: true
    }
  },

  security: {
    cors: {
      enabled: true,
      origins: [
        'https://getit.com.bd',
        'https://www.getit.com.bd',
        'https://admin.getit.com.bd',
        'https://vendor.getit.com.bd'
      ]
    },
    hotlinkProtection: true,
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 1000
    }
  }
};

/**
 * Development CDN Configuration
 */
export const DEV_CDN_CONFIG: CDNConfig = {
  ...CDN_CONFIG,
  baseUrl: 'http://localhost:5173/src/assets',
  regions: [
    {
      name: 'Local',
      endpoint: 'http://localhost:5173/src/assets',
      priority: 1,
      latency: 5
    }
  ],
  cacheHeaders: {
    images: 'no-cache',
    videos: 'no-cache',
    fonts: 'no-cache',
    scripts: 'no-cache',
    styles: 'no-cache',
    documents: 'no-cache'
  }
};

/**
 * Get CDN configuration based on environment
 */
export function getCDNConfig(): CDNConfig {
  return import.meta.env.DEV ? DEV_CDN_CONFIG : CDN_CONFIG;
}

/**
 * CDN URL Builder
 */
export class CDNUrlBuilder {
  private config: CDNConfig;

  constructor() {
    this.config = getCDNConfig();
  }

  /**
   * Build optimized CDN URL
   */
  buildUrl(path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    region?: string;
  }): string {
    const baseUrl = this.getOptimalEndpoint(options?.region);
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    let url = `${baseUrl}/${cleanPath}`;

    // Add optimization parameters
    if (options && Object.keys(options).length > 0) {
      const params = new URLSearchParams();
      
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format) params.set('f', options.format);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    return url;
  }

  /**
   * Get responsive image URLs
   */
  buildResponsiveUrls(path: string): {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  } {
    return {
      small: this.buildUrl(path, { width: 480, quality: 75 }),
      medium: this.buildUrl(path, { width: 768, quality: 80 }),
      large: this.buildUrl(path, { width: 1200, quality: 85 }),
      xlarge: this.buildUrl(path, { width: 1920, quality: 90 })
    };
  }

  /**
   * Get WebP optimized URLs
   */
  buildWebPUrls(path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): { webp: string; fallback: string } {
    return {
      webp: this.buildUrl(path, { ...options, format: 'webp' }),
      fallback: this.buildUrl(path, options)
    };
  }

  private getOptimalEndpoint(preferredRegion?: string): string {
    if (import.meta.env.DEV) {
      return this.config.baseUrl;
    }

    if (preferredRegion) {
      const region = this.config.regions.find(r => r.name.toLowerCase() === preferredRegion.toLowerCase());
      if (region) return region.endpoint;
    }

    // Return highest priority region (lowest latency)
    const optimalRegion = this.config.regions.reduce((best, current) => 
      current.priority < best.priority ? current : best
    );

    return optimalRegion.endpoint;
  }
}

export const cdnUrlBuilder = new CDNUrlBuilder();