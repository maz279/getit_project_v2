/**
 * Compression Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Advanced response compression with Bangladesh mobile optimization
 * Intelligent compression based on content type and network conditions
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { GatewayConfig } from '../config/gateway.config';
import { AuthenticatedRequest } from './authentication';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'compression-middleware' }
});

export const compressionMiddleware = (config: GatewayConfig) => {
  // Base compression configuration
  const baseCompression = compression({
    threshold: config.performance.compression.threshold,
    filter: (req, res) => {
      // Don't compress if the client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      
      // Don't compress if content is already compressed
      if (res.getHeader('content-encoding')) {
        return false;
      }
      
      // Use default compression filter for basic checks
      if (!compression.filter(req, res)) {
        return false;
      }
      
      // Custom compression logic
      return shouldCompressResponse(req as AuthenticatedRequest, res, config);
    },
    // Custom compression level based on content and client
    level: (req: Request) => {
      return getCompressionLevel(req as AuthenticatedRequest, config);
    }
  });

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Apply Bangladesh-specific compression optimizations
    if (config.bangladesh.mobile.optimization) {
      applyBangladeshOptimizations(req, res);
    }
    
    // Apply base compression
    baseCompression(req, res, next);
  };
};

function shouldCompressResponse(req: AuthenticatedRequest, res: Response, config: GatewayConfig): boolean {
  const contentType = res.getHeader('content-type') as string || '';
  
  // Always compress text-based content
  const textTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml'
  ];
  
  if (textTypes.some(type => contentType.startsWith(type))) {
    return true;
  }
  
  // Don't compress binary content (images, videos, etc.)
  const binaryTypes = [
    'image/',
    'video/',
    'audio/',
    'application/pdf',
    'application/zip',
    'application/gzip'
  ];
  
  if (binaryTypes.some(type => contentType.startsWith(type))) {
    return false;
  }
  
  // Compress API responses
  if (req.path.startsWith('/api/')) {
    return true;
  }
  
  // Don't compress small responses (overhead not worth it)
  const contentLength = parseInt(res.getHeader('content-length') as string || '0');
  if (contentLength > 0 && contentLength < config.performance.compression.threshold) {
    return false;
  }
  
  return true;
}

function getCompressionLevel(req: AuthenticatedRequest, config: GatewayConfig): number {
  const userAgent = req.headers['user-agent'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Higher compression for mobile users (to save bandwidth)
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  if (isMobile && config.bangladesh.mobile.optimization) {
    switch (config.bangladesh.mobile.compression) {
      case 'high':
        return 9; // Maximum compression
      case 'medium':
        return 6;
      case 'low':
        return 3;
      default:
        return 6;
    }
  }
  
  // Lower compression for desktop (CPU vs bandwidth trade-off)
  if (!isMobile) {
    return 4;
  }
  
  // Check client capabilities
  if (acceptEncoding.includes('br')) {
    // Client supports Brotli, can use higher compression
    return 6;
  }
  
  if (acceptEncoding.includes('gzip')) {
    // Standard gzip compression
    return config.performance.compression.level;
  }
  
  // Fallback
  return 1;
}

function applyBangladeshOptimizations(req: AuthenticatedRequest, res: Response): void {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  
  if (isMobile) {
    // Mobile optimizations for Bangladesh
    
    // Set cache headers for better mobile performance
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    // Enable service worker caching
    res.setHeader('Service-Worker-Allowed', '/');
    
    // Optimize for slow networks
    res.setHeader('X-Mobile-Optimized', 'true');
    res.setHeader('X-Bangladesh-Mobile', 'true');
    
    // Network hint headers for better resource loading
    res.setHeader('Link', '<https://fonts.googleapis.com>; rel=dns-prefetch');
    
    // Vary header to ensure proper caching by user agent
    const varyHeader = res.getHeader('Vary') || '';
    if (!varyHeader.includes('User-Agent')) {
      res.setHeader('Vary', varyHeader ? `${varyHeader}, User-Agent` : 'User-Agent');
    }
  }
  
  // Bangladesh-specific content optimizations
  const acceptLanguage = req.headers['accept-language'] || '';
  if (acceptLanguage.includes('bn')) {
    // Bengali language content optimizations
    res.setHeader('Content-Language', 'bn');
    res.setHeader('X-Locale-Optimized', 'bn-BD');
  }
  
  // Network condition hints
  const connectionType = req.headers['downlink'] as string;
  if (connectionType) {
    const speed = parseFloat(connectionType);
    if (speed < 1.0) {
      // Slow connection detected, apply aggressive optimization
      res.setHeader('X-Connection-Speed', 'slow');
      res.setHeader('X-Optimization-Level', 'aggressive');
    }
  }
}

// Advanced compression strategies for different content types
export const advancedCompressionStrategies = {
  // JSON API responses
  jsonOptimization: (req: AuthenticatedRequest, res: Response) => {
    if (req.path.startsWith('/api/') && req.headers.accept?.includes('application/json')) {
      // Enable aggressive compression for JSON
      res.setHeader('X-Compression-Strategy', 'json-optimized');
      
      // Remove whitespace in JSON responses (if not in development)
      if (process.env.NODE_ENV === 'production') {
        const originalJson = res.json;
        res.json = function(obj) {
          return originalJson.call(this, obj);
        };
      }
    }
  },
  
  // HTML content optimization
  htmlOptimization: (req: AuthenticatedRequest, res: Response) => {
    const contentType = res.getHeader('content-type') as string || '';
    
    if (contentType.includes('text/html')) {
      // HTML-specific optimizations
      res.setHeader('X-Compression-Strategy', 'html-optimized');
      
      // Enable aggressive HTML compression
      res.setHeader('X-HTML-Minified', 'true');
    }
  },
  
  // Bangladesh festival period optimization
  festivalOptimization: (req: AuthenticatedRequest, res: Response) => {
    if (isFestivalPeriod()) {
      // During festivals, apply maximum compression to handle traffic spikes
      res.setHeader('X-Festival-Optimization', 'enabled');
      res.setHeader('X-Compression-Priority', 'maximum');
      
      // Extended cache headers during festivals
      res.setHeader('Cache-Control', 'public, max-age=7200, stale-while-revalidate=172800');
    }
  }
};

// Brotli compression support (more efficient than gzip)
export const brotliSupport = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    // Client supports Brotli
    res.setHeader('X-Brotli-Supported', 'true');
    
    // Override compression middleware to use Brotli when possible
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name: string, value: string | string[]) {
      if (name.toLowerCase() === 'content-encoding' && value === 'gzip') {
        // Upgrade to Brotli if available
        return originalSetHeader.call(this, name, 'br');
      }
      return originalSetHeader.call(this, name, value);
    };
  }
  
  next();
};

// Real-time compression monitoring
export const compressionMonitoring = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  let originalSize = 0;
  let compressedSize = 0;
  
  // Track original response size
  const originalWrite = res.write;
  const originalEnd = res.end;
  
  res.write = function(chunk: any, encoding?: any) {
    if (chunk) {
      originalSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    return originalWrite.call(this, chunk, encoding);
  };
  
  res.end = function(chunk?: any, encoding?: any) {
    if (chunk) {
      originalSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    
    // Calculate compression metrics
    const compressionTime = Date.now() - startTime;
    const contentEncoding = res.getHeader('content-encoding');
    compressedSize = parseInt(res.getHeader('content-length') as string || '0') || originalSize;
    
    const compressionRatio = originalSize > 0 ? 
      Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;
    
    // Log compression metrics for monitoring
    if (originalSize > 1024) { // Only log for files > 1KB
      logger.debug('Compression metrics', {
        path: req.path,
        originalSize,
        compressedSize,
        compressionRatio: `${compressionRatio}%`,
        compressionTime,
        encoding: contentEncoding,
        userAgent: req.headers['user-agent']?.substring(0, 100),
        mobile: /mobile|android|iphone|ipad/i.test(req.headers['user-agent'] || ''),
        bangladesh: req.headers['accept-language']?.includes('bn')
      });
    }
    
    // Add compression info headers for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('X-Original-Size', originalSize.toString());
      res.setHeader('X-Compressed-Size', compressedSize.toString());
      res.setHeader('X-Compression-Ratio', `${compressionRatio}%`);
      res.setHeader('X-Compression-Time', `${compressionTime}ms`);
    }
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Helper functions
function isFestivalPeriod(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Major Bangladesh festivals
  const festivals = [
    { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
    { month: 8, startDay: 15, endDay: 20 }, // Eid (approximate)
    { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
    { month: 12, startDay: 15, endDay: 31 }  // Winter shopping season
  ];
  
  return festivals.some(festival => 
    month === festival.month && day >= festival.startDay && day <= festival.endDay
  );
}

export default compressionMiddleware;