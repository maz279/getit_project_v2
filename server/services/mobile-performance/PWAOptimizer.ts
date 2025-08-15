/**
 * PHASE 4: PWA OPTIMIZER SERVICE
 * Progressive Web App capabilities for mobile-first optimization
 * Investment: $20,000 | Week 1-2: Mobile & Performance Excellence
 * Date: July 26, 2025
 */

import { z } from 'zod';

// PWA Configuration Schema
const PWAConfigSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  description: z.string(),
  themeColor: z.string(),
  backgroundColor: z.string(),
  display: z.enum(['standalone', 'fullscreen', 'minimal-ui', 'browser']),
  orientation: z.enum(['portrait', 'landscape', 'any']),
  startUrl: z.string(),
  scope: z.string(),
  icons: z.array(z.object({
    src: z.string(),
    sizes: z.string(),
    type: z.string(),
    purpose: z.string().optional()
  })),
  caching: z.object({
    staticAssets: z.array(z.string()),
    apiEndpoints: z.array(z.string()),
    cacheFirst: z.array(z.string()),
    networkFirst: z.array(z.string())
  })
});

// Mobile Performance Metrics
interface MobilePerformanceMetrics {
  readonly pageLoadTime: number;
  readonly firstContentfulPaint: number;
  readonly largestContentfulPaint: number;
  readonly cumulativeLayoutShift: number;
  readonly firstInputDelay: number;
  readonly timeToInteractive: number;
  readonly totalBlockingTime: number;
  readonly performanceScore: number;
  readonly mobileScore: number;
  readonly desktopScore: number;
}

// Touch Interaction Configuration
interface TouchInteractionConfig {
  readonly gestureRecognition: boolean;
  readonly swipeNavigation: boolean;
  readonly pinchZoom: boolean;
  readonly doubleTapZoom: boolean;
  readonly longPressMenu: boolean;
  readonly touchFeedback: 'haptic' | 'visual' | 'both' | 'none';
  readonly minimumTouchTarget: number; // in pixels
}

// Service Worker Configuration
interface ServiceWorkerConfig {
  readonly scope: string;
  readonly updateInterval: number;
  readonly offlinePages: string[];
  readonly cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  readonly maxCacheSize: number; // in MB
  readonly excludeFromCache: string[];
}

export class PWAOptimizer {
  private readonly config: z.infer<typeof PWAConfigSchema>;
  private readonly performanceMetrics: Map<string, MobilePerformanceMetrics>;
  private readonly touchConfig: TouchInteractionConfig;
  private readonly serviceWorkerConfig: ServiceWorkerConfig;

  constructor() {
    this.config = this.initializePWAConfig();
    this.performanceMetrics = new Map();
    this.touchConfig = this.initializeTouchConfig();
    this.serviceWorkerConfig = this.initializeServiceWorkerConfig();
  }

  /**
   * Initialize PWA configuration for GetIt Bangladesh
   */
  private initializePWAConfig(): z.infer<typeof PWAConfigSchema> {
    return {
      name: 'GetIt Bangladesh - Multi-Vendor E-commerce',
      shortName: 'GetIt BD',
      description: 'Bangladesh\'s premier multi-vendor e-commerce platform with AI-powered search',
      themeColor: '#1f2937',
      backgroundColor: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      startUrl: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ],
      caching: {
        staticAssets: [
          '/',
          '/search',
          '/categories',
          '/manifest.json',
          '/offline.html',
          '/css/main.css',
          '/js/app.js',
          '/icons/',
          '/images/logo.png'
        ],
        apiEndpoints: [
          '/api/search/suggestions',
          '/api/search/enhanced',
          '/api/products/categories',
          '/api/products/trending',
          '/api/groq-ai/recommendations'
        ],
        cacheFirst: [
          '/icons/',
          '/images/',
          '/css/',
          '/js/',
          '/fonts/'
        ],
        networkFirst: [
          '/api/',
          '/search',
          '/products',
          '/categories'
        ]
      }
    };
  }

  /**
   * Initialize touch interaction configuration
   */
  private initializeTouchConfig(): TouchInteractionConfig {
    return {
      gestureRecognition: true,
      swipeNavigation: true,
      pinchZoom: true,
      doubleTapZoom: true,
      longPressMenu: true,
      touchFeedback: 'both',
      minimumTouchTarget: 44 // iOS/Android recommended minimum
    };
  }

  /**
   * Initialize service worker configuration
   */
  private initializeServiceWorkerConfig(): ServiceWorkerConfig {
    return {
      scope: '/',
      updateInterval: 24 * 60 * 60 * 1000, // 24 hours
      offlinePages: [
        '/',
        '/search',
        '/categories',
        '/trending',
        '/offline.html'
      ],
      cacheStrategy: 'stale-while-revalidate',
      maxCacheSize: 50, // 50MB
      excludeFromCache: [
        '/api/auth/',
        '/api/payments/',
        '/api/orders/',
        '/admin/',
        '/vendor/'
      ]
    };
  }

  /**
   * Generate web app manifest
   */
  generateManifest(): Record<string, any> {
    return {
      name: this.config.name,
      short_name: this.config.shortName,
      description: this.config.description,
      theme_color: this.config.themeColor,
      background_color: this.config.backgroundColor,
      display: this.config.display,
      orientation: this.config.orientation,
      start_url: this.config.startUrl,
      scope: this.config.scope,
      icons: this.config.icons,
      categories: ['shopping', 'e-commerce', 'marketplace'],
      lang: 'en',
      dir: 'ltr',
      screenshots: [
        {
          src: '/screenshots/mobile-1.png',
          sizes: '390x844',
          type: 'image/png',
          form_factor: 'narrow'
        },
        {
          src: '/screenshots/desktop-1.png',
          sizes: '1920x1080',
          type: 'image/png',
          form_factor: 'wide'
        }
      ],
      shortcuts: [
        {
          name: 'Search Products',
          short_name: 'Search',
          description: 'Search for products using AI-powered search',
          url: '/search',
          icons: [
            {
              src: '/icons/shortcut-search.png',
              sizes: '96x96'
            }
          ]
        },
        {
          name: 'Trending Products',
          short_name: 'Trending',
          description: 'Browse trending products in Bangladesh',
          url: '/trending',
          icons: [
            {
              src: '/icons/shortcut-trending.png',
              sizes: '96x96'
            }
          ]
        }
      ]
    };
  }

  /**
   * Generate service worker script
   */
  generateServiceWorker(): string {
    const { caching, staticAssets, apiEndpoints, cacheFirst, networkFirst } = this.config.caching;
    const { cacheStrategy, maxCacheSize, excludeFromCache } = this.serviceWorkerConfig;

    return `
/**
 * GetIt Bangladesh PWA Service Worker
 * Generated: ${new Date().toISOString()}
 */

const CACHE_NAME = 'getit-bd-v${Date.now()}';
const STATIC_CACHE = 'getit-static-v${Date.now()}';
const DYNAMIC_CACHE = 'getit-dynamic-v${Date.now()}';
const MAX_CACHE_SIZE = ${maxCacheSize} * 1024 * 1024; // ${maxCacheSize}MB

// Static assets to cache
const STATIC_ASSETS = ${JSON.stringify(staticAssets, null, 2)};

// API endpoints to cache
const API_ENDPOINTS = ${JSON.stringify(apiEndpoints, null, 2)};

// Cache-first resources
const CACHE_FIRST = ${JSON.stringify(cacheFirst, null, 2)};

// Network-first resources
const NETWORK_FIRST = ${JSON.stringify(networkFirst, null, 2)};

// Exclude from cache
const EXCLUDE_FROM_CACHE = ${JSON.stringify(excludeFromCache, null, 2)};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing GetIt Bangladesh Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting and activate new service worker');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating GetIt Bangladesh Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Taking control of all clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip excluded URLs
  if (EXCLUDE_FROM_CACHE.some(pattern => url.pathname.includes(pattern))) {
    return;
  }

  // Handle static assets with cache-first strategy
  if (CACHE_FIRST.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle API endpoints with network-first strategy
  if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle page navigation with stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Default strategy
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network-first strategy for API endpoints
async function networkFirstStrategy(request) {
  try {
    console.log('[SW] Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline and no cached version available', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponse = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  return cachedResponse || networkResponse || caches.match('/offline.html');
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  let totalSize = 0;
  const sizePromises = keys.map(async (key) => {
    const response = await cache.match(key);
    if (response) {
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer.byteLength;
    }
    return 0;
  });
  
  const sizes = await Promise.all(sizePromises);
  totalSize = sizes.reduce((sum, size) => sum + size, 0);
  
  if (totalSize > maxSize) {
    console.log('[SW] Cache size limit exceeded, cleaning oldest entries');
    const entriesToDelete = Math.ceil(keys.length * 0.1); // Delete 10% of entries
    
    for (let i = 0; i < entriesToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'search-sync') {
    event.waitUntil(syncOfflineSearches());
  }
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncOfflineCart());
  }
});

// Sync offline searches
async function syncOfflineSearches() {
  console.log('[SW] Syncing offline searches');
  // Implementation for syncing offline search data
}

// Sync offline cart
async function syncOfflineCart() {
  console.log('[SW] Syncing offline cart');
  // Implementation for syncing offline cart data
}

// Push notification handler
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'getit-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

console.log('[SW] GetIt Bangladesh Service Worker loaded successfully');
`;
  }

  /**
   * Generate offline page HTML
   */
  generateOfflinePage(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - GetIt Bangladesh</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }
        
        .offline-container {
            max-width: 500px;
            width: 100%;
        }
        
        .offline-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            font-weight: 700;
        }
        
        p {
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.9;
            line-height: 1.6;
        }
        
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
        
        .retry-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        
        .offline-features {
            margin-top: 40px;
            text-align: left;
        }
        
        .offline-features h3 {
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .offline-features ul {
            list-style: none;
            padding-left: 20px;
        }
        
        .offline-features li {
            margin-bottom: 10px;
            position: relative;
        }
        
        .offline-features li:before {
            content: "✓";
            position: absolute;
            left: -20px;
            color: #4ade80;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            p { font-size: 1rem; }
            .offline-icon { width: 80px; height: 80px; font-size: 32px; }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>You're Offline</h1>
        <p>No internet connection detected. But don't worry, you can still browse cached products and use some features of GetIt Bangladesh!</p>
        
        <a href="/" class="retry-btn" onclick="window.location.reload()">Try Again</a>
        <a href="/search" class="retry-btn">Browse Cached Products</a>
        
        <div class="offline-features">
            <h3>Available Offline Features:</h3>
            <ul>
                <li>Browse previously viewed products</li>
                <li>View cached categories and trending items</li>
                <li>Access saved searches and favorites</li>
                <li>Continue shopping with cached data</li>
                <li>Use basic search functionality</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Check for connectivity and reload when back online
        window.addEventListener('online', () => {
            console.log('Connection restored, reloading...');
            window.location.reload();
        });
        
        // Update UI based on connection status
        function updateConnectivityStatus() {
            const isOnline = navigator.onLine;
            if (isOnline) {
                window.location.reload();
            }
        }
        
        // Check connectivity periodically
        setInterval(updateConnectivityStatus, 5000);
        
        // Service worker registration check
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                console.log('Service Worker ready, offline capabilities enabled');
            });
        }
    </script>
</body>
</html>
`;
  }

  /**
   * Measure mobile performance metrics
   */
  async measurePerformance(url: string): Promise<MobilePerformanceMetrics> {
    const metrics: MobilePerformanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      performanceScore: 0,
      mobileScore: 0,
      desktopScore: 0
    };

    // Store metrics
    this.performanceMetrics.set(url, metrics);
    
    return metrics;
  }

  /**
   * Optimize touch interactions
   */
  optimizeTouchInteractions(): TouchInteractionConfig {
    return {
      ...this.touchConfig,
      // Add dynamic optimizations based on device capabilities
      touchFeedback: 'vibrate' in navigator ? 'haptic' : 'visual'
    };
  }

  /**
   * Get PWA configuration
   */
  getPWAConfig(): z.infer<typeof PWAConfigSchema> {
    return this.config;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(url?: string): Map<string, MobilePerformanceMetrics> | MobilePerformanceMetrics | null {
    if (url) {
      return this.performanceMetrics.get(url) || null;
    }
    return this.performanceMetrics;
  }

  /**
   * Get touch configuration
   */
  getTouchConfig(): TouchInteractionConfig {
    return this.touchConfig;
  }

  /**
   * Get service worker configuration
   */
  getServiceWorkerConfig(): ServiceWorkerConfig {
    return this.serviceWorkerConfig;
  }

  /**
   * Check PWA installation eligibility
   */
  checkInstallEligibility(): {
    eligible: boolean;
    criteria: Record<string, boolean>;
  } {
    const criteria = {
      hasManifest: true,
      hasServiceWorker: true,
      hasIcons: this.config.icons.length >= 2,
      hasStartUrl: !!this.config.startUrl,
      isHttps: true, // Assuming HTTPS in production
      hasDisplay: this.config.display === 'standalone',
      hasThemeColor: !!this.config.themeColor
    };

    const eligible = Object.values(criteria).every(criterion => criterion);

    return { eligible, criteria };
  }

  /**
   * Generate app shell HTML
   */
  generateAppShell(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="${this.config.themeColor}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${this.config.shortName}">
    
    <title>${this.config.name}</title>
    
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icons/icon-152x152.png">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/css/critical.css" as="style">
    <link rel="preload" href="/js/app.js" as="script">
    
    <!-- Critical CSS inline -->
    <style>
        /* Critical CSS for app shell */
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${this.config.backgroundColor};
        }
        .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .loading { display: flex; align-items: center; justify-content: center; flex: 1; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid ${this.config.themeColor}; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="loading">
            <div class="spinner"></div>
        </div>
    </div>
    
    <script>
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
        
        // PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Show install button
            showInstallPrompt();
        });
        
        function showInstallPrompt() {
            // Implementation for showing install prompt
        }
    </script>
</body>
</html>
`;
  }
}

// Export singleton instance
export const pwaOptimizer = new PWAOptimizer();