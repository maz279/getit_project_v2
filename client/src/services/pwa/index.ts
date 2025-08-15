/**
 * PWA Services Index
 * Phase 2 Week 5-6: PWA Implementation
 * Amazon.com/Shopee.sg Enterprise Standards
 */

export { default as PWAService } from './PWAService';

// PWA service exports
export const pwaServices = {
  PWAService
};

// PWA utilities
export const pwaUtils = {
  // PWA support detection
  isPWASupported: () => {
    return 'serviceWorker' in navigator && 'caches' in window;
  },

  // Installation support
  isInstallSupported: () => {
    return 'beforeinstallprompt' in window;
  },

  // Notification support
  isNotificationSupported: () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  },

  // Background sync support
  isBackgroundSyncSupported: () => {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  },

  // Cache management
  getCacheUsage: async () => {
    const pwaService = (PWAService as any).getInstance();
    return pwaService.getStorageUsage();
  },

  // Send notification
  sendNotification: async (options: any) => {
    const pwaService = (PWAService as any).getInstance();
    return pwaService.sendNotification(options);
  }
};

// PWA configuration
export const pwaConfig = {
  cacheStrategy: 'stale-while-revalidate' as const,
  cacheName: 'pwa-cache-v1',
  
  notification: {
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
  },
  
  installPrompt: {
    enableAutoPrompt: true,
    deferredPromptDelay: 3000 // 3 seconds
  }
};

// PWA initialization
export const initializePWA = async () => {
  const pwaService = (PWAService as any).getInstance();
  
  // Initialize PWA features
  console.log('PWA initialization started');
  
  // Check for updates
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.addEventListener('updatefound', () => {
      console.log('PWA update available');
    });
  }
  
  return {
    service: pwaService,
    showInstallPrompt: () => pwaService.showInstallPrompt(),
    sendNotification: (options: any) => pwaService.sendNotification(options),
    cacheResource: (url: string) => pwaService.cacheResource(url),
    getMetrics: () => pwaService.getMetrics(),
    getConfig: () => pwaService.getConfig()
  };
};