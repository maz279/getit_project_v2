/**
 * Service Worker Registration Utility
 * Phase 1.4: Service Worker & Caching Strategy Integration
 */

// Check if service worker is supported
const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Service worker registration options
interface ServiceWorkerRegistrationOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

// Register service worker
export const registerServiceWorker = async (
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    console.log('Service Worker not supported');
    return null;
  }

  const { onUpdate, onSuccess, onError } = options;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Check for service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              onUpdate?.(registration);
            } else {
              // Service worker installed for the first time
              console.log('Service worker installed');
              onSuccess?.(registration);
            }
          }
        });
      }
    });

    // Check if service worker is already controlling the page
    if (navigator.serviceWorker.controller) {
      console.log('Service worker is controlling the page');
      onSuccess?.(registration);
    }

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    onError?.(error as Error);
    return null;
  }
};

// Unregister service worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker unregistered');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};

// Update service worker
export const updateServiceWorker = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Service Worker update check initiated');
    }
  } catch (error) {
    console.error('Service Worker update failed:', error);
  }
};

// Skip waiting for new service worker
export const skipWaitingServiceWorker = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('Service Worker skip waiting initiated');
    }
  } catch (error) {
    console.error('Service Worker skip waiting failed:', error);
  }
};

// Cache URLs in service worker
export const cacheUrls = async (urls: string[]): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls: urls
      });
      console.log('URLs sent to service worker for caching');
    }
  } catch (error) {
    console.error('Failed to cache URLs:', error);
  }
};

// Initialize service worker with React app
export const initializeServiceWorker = (
  onUpdate?: (registration: ServiceWorkerRegistration) => void,
  onSuccess?: (registration: ServiceWorkerRegistration) => void
): void => {
  if (process.env.NODE_ENV === 'production') {
    registerServiceWorker({
      onUpdate: (registration) => {
        // Show update available notification
        if (onUpdate) {
          onUpdate(registration);
        } else {
          console.log('New version available! Please refresh the page.');
        }
      },
      onSuccess: (registration) => {
        if (onSuccess) {
          onSuccess(registration);
        } else {
          console.log('App is cached and ready for offline use.');
        }
      },
      onError: (error) => {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
};

// Service worker status
export const getServiceWorkerStatus = async (): Promise<{
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  isControlling: boolean;
}> => {
  if (!isServiceWorkerSupported()) {
    return {
      isSupported: false,
      isRegistered: false,
      isActive: false,
      isControlling: false
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      isSupported: true,
      isRegistered: !!registration,
      isActive: !!(registration?.active),
      isControlling: !!navigator.serviceWorker.controller
    };
  } catch (error) {
    console.error('Failed to get service worker status:', error);
    return {
      isSupported: true,
      isRegistered: false,
      isActive: false,
      isControlling: false
    };
  }
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
  skipWaitingServiceWorker,
  cacheUrls,
  initializeServiceWorker,
  getServiceWorkerStatus
};