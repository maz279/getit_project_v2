/**
 * Service Worker for PWA
 * Phase 2 Week 5-6: PWA Implementation
 * Amazon.com/Shopee.sg Enterprise Standards
 */

const CACHE_NAME = 'pwa-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache
const urlsToCache = [
  '/',
  '/offline.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Network request
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Network failure - serve offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data
      syncOfflineData()
    );
  }
});

// Push notification
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('GetIt E-commerce', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    // Implement your offline data sync logic here
    console.log('Syncing offline data...');
    
    // Example: Send queued requests
    const offlineRequests = await getOfflineRequests();
    for (const request of offlineRequests) {
      await fetch(request.url, request.options);
    }
    
    // Clear offline queue
    await clearOfflineQueue();
    
    console.log('Offline data sync completed');
  } catch (error) {
    console.error('Offline sync failed:', error);
  }
}

// Helper function to get offline requests
async function getOfflineRequests() {
  // Implement logic to retrieve offline requests from IndexedDB
  return [];
}

// Helper function to clear offline queue
async function clearOfflineQueue() {
  // Implement logic to clear offline queue
}