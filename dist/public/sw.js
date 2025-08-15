/**
 * Service Worker - Amazon.com/Shopee.sg-Level PWA Experience
 * Advanced offline support, caching strategies, and push notifications
 */

const CACHE_NAME = 'getit-v2.0.0';
const STATIC_CACHE = 'getit-static-v2.0.0';
const DYNAMIC_CACHE = 'getit-dynamic-v2.0.0';
const API_CACHE = 'getit-api-v2.0.0';
const IMAGE_CACHE = 'getit-images-v2.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/v1\/products/,
  /\/api\/v1\/categories/,
  /\/api\/v1\/search/,
  /\/api\/v1\/user/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== API_CACHE && 
                     cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle navigation requests
    if (request.mode === 'navigate') {
      event.respondWith(handleNavigationRequest(request));
    }
    // Handle API requests
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleApiRequest(request));
    }
    // Handle image requests
    else if (request.destination === 'image') {
      event.respondWith(handleImageRequest(request));
    }
    // Handle static assets
    else {
      event.respondWith(handleStaticRequest(request));
    }
  }
});

// Navigation request handler - Network first with fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// API request handler - Cache first for specific endpoints
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this is a cacheable API endpoint
  const isCacheable = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (isCacheable) {
    return handleCacheFirstRequest(request, API_CACHE);
  } else {
    return handleNetworkFirstRequest(request, API_CACHE);
  }
}

// Image request handler - Cache first with optimization
async function handleImageRequest(request) {
  return handleCacheFirstRequest(request, IMAGE_CACHE);
}

// Static asset handler - Cache first
async function handleStaticRequest(request) {
  return handleCacheFirstRequest(request, STATIC_CACHE);
}

// Cache first strategy
async function handleCacheFirstRequest(request, cacheName) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Network fallback
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Network first strategy
async function handleNetworkFirstRequest(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Cache fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from GetIt',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'getit-notification',
    data: data.data || {},
    actions: data.actions || [
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
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'GetIt Bangladesh', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync handler
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'background-sync-wishlist') {
    event.waitUntil(syncWishlist());
  }
});

// Sync cart data
async function syncCart() {
  try {
    // Get pending cart updates from IndexedDB
    const pendingUpdates = await getPendingCartUpdates();
    
    for (const update of pendingUpdates) {
      const response = await fetch('/api/v1/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });
      
      if (response.ok) {
        await removePendingCartUpdate(update.id);
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync orders data
async function syncOrders() {
  try {
    // Fetch latest orders
    const response = await fetch('/api/v1/orders');
    if (response.ok) {
      const orders = await response.json();
      await updateOrdersCache(orders);
    }
  } catch (error) {
    console.error('Orders sync failed:', error);
  }
}

// Sync wishlist data
async function syncWishlist() {
  try {
    // Get pending wishlist updates from IndexedDB
    const pendingUpdates = await getPendingWishlistUpdates();
    
    for (const update of pendingUpdates) {
      const response = await fetch('/api/v1/wishlist/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });
      
      if (response.ok) {
        await removePendingWishlistUpdate(update.id);
      }
    }
  } catch (error) {
    console.error('Wishlist sync failed:', error);
  }
}

// IndexedDB helpers (simplified - would use idb library in real implementation)
async function getPendingCartUpdates() {
  // Implementation would use IndexedDB to get pending updates
  return [];
}

async function removePendingCartUpdate(id) {
  // Implementation would remove update from IndexedDB
}

async function getPendingWishlistUpdates() {
  // Implementation would use IndexedDB to get pending updates
  return [];
}

async function removePendingWishlistUpdate(id) {
  // Implementation would remove update from IndexedDB
}

async function updateOrdersCache(orders) {
  // Implementation would update cached orders in IndexedDB
}

// Handle periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered', event.tag);
  
  if (event.tag === 'sync-deals') {
    event.waitUntil(syncDeals());
  } else if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// Sync deals data
async function syncDeals() {
  try {
    const response = await fetch('/api/v1/deals/latest');
    if (response.ok) {
      const deals = await response.json();
      
      // Cache deals data
      const cache = await caches.open(API_CACHE);
      cache.put('/api/v1/deals/latest', new Response(JSON.stringify(deals)));
      
      // Send notification for new deals
      if (deals.length > 0) {
        self.registration.showNotification('New Deals Available!', {
          body: `${deals.length} new deals are now available`,
          icon: '/icons/icon-192x192.png',
          tag: 'new-deals',
          data: { url: '/deals' }
        });
      }
    }
  } catch (error) {
    console.error('Deals sync failed:', error);
  }
}

// Sync notifications
async function syncNotifications() {
  try {
    const response = await fetch('/api/v1/notifications/unread');
    if (response.ok) {
      const notifications = await response.json();
      
      // Show unread notifications
      for (const notification of notifications.slice(0, 3)) { // Limit to 3
        self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          tag: `notification-${notification.id}`,
          data: { url: notification.url }
        });
      }
    }
  } catch (error) {
    console.error('Notifications sync failed:', error);
  }
}