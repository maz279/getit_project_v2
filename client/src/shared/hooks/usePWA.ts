/**
 * Progressive Web App (PWA) Hook
 * Provides comprehensive PWA capabilities for Amazon.com/Shopee.sg-level
 * offline functionality and native app experience
 * 
 * @fileoverview Enterprise PWA hook with offline support and app-like features
 * @author GetIt Platform Team
 * @version 3.0.0
 * @since Phase 3 Professional Polish Implementation
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * PWA installation prompt interface
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA configuration interface
 */
interface PWAConfig {
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableBackgroundSync: boolean;
  enableCaching: boolean;
  culturalContext: 'bangladesh' | 'global';
  offlinePages: string[];
  cacheStrategies: {
    static: 'cache-first' | 'network-first';
    dynamic: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    api: 'network-first' | 'cache-first';
  };
}

/**
 * Offline capabilities interface
 */
interface OfflineCapabilities {
  canBrowseProducts: boolean;
  canViewCart: boolean;
  canReadOrders: boolean;
  canUseWishlist: boolean;
  canAccessHelp: boolean;
  canViewProfile: boolean;
  queuedActions: OfflineAction[];
}

/**
 * Offline action interface
 */
interface OfflineAction {
  id: string;
  type: 'cart_add' | 'cart_remove' | 'wishlist_add' | 'order_track' | 'profile_update';
  payload: any;
  timestamp: Date;
  status: 'pending' | 'synced' | 'failed';
}

/**
 * PWA features interface
 */
interface PWAFeatures {
  installable: boolean;
  installed: boolean;
  standalone: boolean;
  offline: boolean;
  pushSupported: boolean;
  backgroundSync: boolean;
  serviceWorkerActive: boolean;
}

/**
 * PWA hook return type
 */
interface PWAReturn {
  config: PWAConfig;
  features: PWAFeatures;
  offlineCapabilities: OfflineCapabilities;
  updateConfig: (newConfig: Partial<PWAConfig>) => void;
  installApp: () => Promise<boolean>;
  enableNotifications: () => Promise<boolean>;
  syncOfflineActions: () => Promise<void>;
  addOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => void;
  clearOfflineData: () => Promise<void>;
  updateOfflineContent: () => Promise<void>;
  getOfflineStatus: () => {
    isOffline: boolean;
    lastOnline: Date | null;
    networkType: string | null;
  };
}

/**
 * Enterprise PWA Hook
 * 
 * Provides comprehensive Progressive Web App capabilities:
 * - Offline browsing with cached products and cart
 * - App installation prompt and management
 * - Background synchronization of user actions
 * - Push notifications for order updates
 * - Offline queue for user actions
 * - Cultural optimization for Bangladesh market
 * - Service worker management
 * 
 * @example
 * ```tsx
 * const {
 *   features,
 *   installApp,
 *   enableNotifications,
 *   addOfflineAction,
 *   offlineCapabilities
 * } = usePWA({
 *   enableOfflineMode: true,
 *   enablePushNotifications: true,
 *   culturalContext: 'bangladesh'
 * });
 * 
 * // Install app
 * const handleInstall = async () => {
 *   const installed = await installApp();
 *   if (installed) {
 *     console.log('App installed successfully');
 *   }
 * };
 * 
 * // Add offline action
 * const addToCartOffline = (productId: string) => {
 *   addOfflineAction({
 *     type: 'cart_add',
 *     payload: { productId, quantity: 1 }
 *   });
 * };
 * ```
 * 
 * @param initialConfig - Initial PWA configuration
 * @returns {PWAReturn} PWA utilities and state
 */
export function usePWA(initialConfig: Partial<PWAConfig> = {}): PWAReturn {
  // Default configuration
  const defaultConfig: PWAConfig = {
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableBackgroundSync: true,
    enableCaching: true,
    culturalContext: 'bangladesh',
    offlinePages: ['/', '/products', '/cart', '/orders', '/profile', '/help'],
    cacheStrategies: {
      static: 'cache-first',
      dynamic: 'stale-while-revalidate',
      api: 'network-first'
    },
    ...initialConfig
  };

  // State management
  const [config, setConfig] = useState<PWAConfig>(defaultConfig);
  const [features, setFeatures] = useState<PWAFeatures>({
    installable: false,
    installed: false,
    standalone: false,
    offline: false,
    pushSupported: false,
    backgroundSync: false,
    serviceWorkerActive: false
  });

  const [offlineCapabilities, setOfflineCapabilities] = useState<OfflineCapabilities>({
    canBrowseProducts: false,
    canViewCart: false,
    canReadOrders: false,
    canUseWishlist: false,
    canAccessHelp: false,
    canViewProfile: false,
    queuedActions: []
  });

  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOffline: !navigator.onLine,
    lastOnline: navigator.onLine ? new Date() : null,
    networkType: (navigator as any).connection?.effectiveType || null
  });

  /**
   * Update PWA configuration
   * 
   * @param newConfig - Partial configuration to update
   */
  const updateConfig = useCallback((newConfig: Partial<PWAConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Initialize PWA features detection
   */
  useEffect(() => {
    const detectFeatures = async () => {
      const newFeatures: PWAFeatures = {
        installable: false,
        installed: window.matchMedia('(display-mode: standalone)').matches,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        offline: !navigator.onLine,
        pushSupported: 'PushManager' in window && 'serviceWorker' in navigator,
        backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
        serviceWorkerActive: false
      };

      // Check service worker status
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          newFeatures.serviceWorkerActive = !!registration && registration.active !== null;
        } catch (error) {
          console.error('Service worker check failed:', error);
        }
      }

      setFeatures(newFeatures);
    };

    detectFeatures();
  }, []);

  /**
   * Initialize service worker
   */
  useEffect(() => {
    if ('serviceWorker' in navigator && config.enableOfflineMode) {
      registerServiceWorker();
    }
  }, [config.enableOfflineMode]);

  /**
   * Listen for install prompt
   */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
      setFeatures(prev => ({ ...prev, installable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  /**
   * Listen for network status changes
   */
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOffline: false,
        lastOnline: new Date()
      }));
      setFeatures(prev => ({ ...prev, offline: false }));
      
      // Sync offline actions when coming back online
      if (config.enableBackgroundSync) {
        syncOfflineActions();
      }
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOffline: true }));
      setFeatures(prev => ({ ...prev, offline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config.enableBackgroundSync]);

  /**
   * Register service worker
   */
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setFeatures(prev => ({ ...prev, serviceWorkerActive: true }));
              updateOfflineCapabilities();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  /**
   * Update offline capabilities based on cached content
   */
  const updateOfflineCapabilities = async () => {
    try {
      const cacheNames = await caches.keys();
      const hasProductCache = cacheNames.some(name => name.includes('products'));
      const hasCartCache = cacheNames.some(name => name.includes('cart'));
      const hasOrdersCache = cacheNames.some(name => name.includes('orders'));
      
      setOfflineCapabilities(prev => ({
        ...prev,
        canBrowseProducts: hasProductCache,
        canViewCart: hasCartCache,
        canReadOrders: hasOrdersCache,
        canUseWishlist: hasProductCache,
        canAccessHelp: true, // Help pages are always cached
        canViewProfile: true // Profile data cached locally
      }));
    } catch (error) {
      console.error('Failed to check offline capabilities:', error);
    }
  };

  /**
   * Install the PWA
   * 
   * @returns Promise<boolean> - Installation success
   */
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setFeatures(prev => ({ ...prev, installed: true, installable: false }));
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('App installation failed:', error);
      return false;
    }
  }, [installPrompt]);

  /**
   * Enable push notifications
   * 
   * @returns Promise<boolean> - Permission granted
   */
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!features.pushSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key
          });
          
          // Send subscription to server
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription,
              culturalContext: config.culturalContext
            })
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Notification setup failed:', error);
      return false;
    }
  }, [features.pushSupported, config.culturalContext]);

  /**
   * Add offline action to queue
   * 
   * @param action - Action to queue
   */
  const addOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending'
    };

    setOfflineCapabilities(prev => ({
      ...prev,
      queuedActions: [...prev.queuedActions, newAction]
    }));

    // Store in localStorage for persistence
    try {
      const storedActions = JSON.parse(localStorage.getItem('pwa_offline_actions') || '[]');
      storedActions.push(newAction);
      localStorage.setItem('pwa_offline_actions', JSON.stringify(storedActions));
    } catch (error) {
      console.error('Failed to store offline action:', error);
    }
  }, []);

  /**
   * Sync offline actions when online
   */
  const syncOfflineActions = useCallback(async (): Promise<void> => {
    if (networkStatus.isOffline) {
      return;
    }

    try {
      const storedActions = JSON.parse(localStorage.getItem('pwa_offline_actions') || '[]');
      const pendingActions = storedActions.filter((action: OfflineAction) => action.status === 'pending');

      for (const action of pendingActions) {
        try {
          // Sync action with server based on type
          await syncAction(action);
          
          // Mark as synced
          action.status = 'synced';
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          action.status = 'failed';
        }
      }

      // Update localStorage
      localStorage.setItem('pwa_offline_actions', JSON.stringify(storedActions));
      
      // Update state
      setOfflineCapabilities(prev => ({
        ...prev,
        queuedActions: storedActions
      }));

    } catch (error) {
      console.error('Offline sync failed:', error);
    }
  }, [networkStatus.isOffline]);

  /**
   * Sync individual action
   * 
   * @param action - Action to sync
   */
  const syncAction = async (action: OfflineAction) => {
    const endpoints: { [key: string]: string } = {
      'cart_add': '/api/cart/add',
      'cart_remove': '/api/cart/remove',
      'wishlist_add': '/api/wishlist/add',
      'order_track': '/api/orders/track',
      'profile_update': '/api/profile/update'
    };

    const endpoint = endpoints[action.type];
    if (!endpoint) {
      throw new Error(`Unknown action type: ${action.type}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload)
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status: ${response.status}`);
    }
  };

  /**
   * Clear offline data
   */
  const clearOfflineData = useCallback(async (): Promise<void> => {
    try {
      // Clear caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Clear localStorage
      localStorage.removeItem('pwa_offline_actions');
      localStorage.removeItem('pwa_cached_data');
      
      // Reset state
      setOfflineCapabilities(prev => ({
        ...prev,
        queuedActions: [],
        canBrowseProducts: false,
        canViewCart: false,
        canReadOrders: false
      }));

    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, []);

  /**
   * Update offline content
   */
  const updateOfflineContent = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // Trigger cache update
        await registration.update();
        
        // Message service worker to update specific content
        if (registration.active) {
          registration.active.postMessage({
            type: 'UPDATE_CACHE',
            pages: config.offlinePages
          });
        }
      }
    } catch (error) {
      console.error('Failed to update offline content:', error);
    }
  }, [config.offlinePages]);

  /**
   * Get current offline status
   */
  const getOfflineStatus = useCallback(() => networkStatus, [networkStatus]);

  // Load offline actions from localStorage on mount
  useEffect(() => {
    try {
      const storedActions = JSON.parse(localStorage.getItem('pwa_offline_actions') || '[]');
      setOfflineCapabilities(prev => ({
        ...prev,
        queuedActions: storedActions
      }));
    } catch (error) {
      console.error('Failed to load offline actions:', error);
    }
  }, []);

  return {
    config,
    features,
    offlineCapabilities,
    updateConfig,
    installApp,
    enableNotifications,
    syncOfflineActions,
    addOfflineAction,
    clearOfflineData,
    updateOfflineContent,
    getOfflineStatus
  };
}

export default usePWA;