/**
 * PWA Service
 * Phase 2 Week 7-8: Mobile-First Transformation
 * Progressive Web App features including offline support, push notifications, and app-like experience
 */

interface PWAConfig {
  enableOfflineSupport: boolean;
  enablePushNotifications: boolean;
  enableInstallPrompt: boolean;
  enableBackgroundSync: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  maxCacheSize: number;
  offlinePages: string[];
}

interface InstallPromptEvent extends Event {
  platforms: string[];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PWAMetrics {
  installPromptShown: number;
  installPromptAccepted: number;
  offlinePageViews: number;
  pushNotificationsSent: number;
  pushNotificationsClicked: number;
  serviceWorkerUpdateCount: number;
  cacheHitRate: number;
  backgroundSyncJobs: number;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

class PWAService {
  private static instance: PWAService;
  private config: PWAConfig;
  private metrics: PWAMetrics;
  private installPromptEvent: InstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  constructor(config: Partial<PWAConfig> = {}) {
    this.config = {
      enableOfflineSupport: true,
      enablePushNotifications: true,
      enableInstallPrompt: true,
      enableBackgroundSync: true,
      cacheStrategy: 'stale-while-revalidate',
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      offlinePages: ['/', '/products', '/cart', '/account'],
      ...config,
    };

    this.metrics = {
      installPromptShown: 0,
      installPromptAccepted: 0,
      offlinePageViews: 0,
      pushNotificationsSent: 0,
      pushNotificationsClicked: 0,
      serviceWorkerUpdateCount: 0,
      cacheHitRate: 0,
      backgroundSyncJobs: 0,
    };

    this.initialize();
  }

  static getInstance(config?: Partial<PWAConfig>): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService(config);
    }
    return PWAService.instance;
  }

  /**
   * Initialize PWA service
   */
  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
    }

    // Set up install prompt handling
    if (this.config.enableInstallPrompt) {
      this.setupInstallPrompt();
    }

    // Initialize push notifications
    if (this.config.enablePushNotifications) {
      await this.initializePushNotifications();
    }

    // Set up offline detection
    this.setupOfflineDetection();

    // Set up background sync
    if (this.config.enableBackgroundSync) {
      this.setupBackgroundSync();
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered:', this.registration);

      // Check for service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              this.showUpdateNotification();
              this.metrics.serviceWorkerUpdateCount++;
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        try {
          this.handleServiceWorkerMessage(event);
        } catch (error) {
          console.error('Service worker message handler error:', error);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPromptEvent = e as InstallPromptEvent;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.metrics.installPromptAccepted++;
      this.installPromptEvent = null;
    });
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<void> {
    if (!this.installPromptEvent) return;

    this.metrics.installPromptShown++;

    // Create custom install prompt UI
    const installPrompt = this.createInstallPromptUI();
    document.body.appendChild(installPrompt);

    // Handle user interaction
    const installButton = installPrompt.querySelector('.install-button');
    const dismissButton = installPrompt.querySelector('.dismiss-button');

    installButton?.addEventListener('click', async () => {
      await this.triggerInstallPrompt();
      document.body.removeChild(installPrompt);
    });

    dismissButton?.addEventListener('click', () => {
      document.body.removeChild(installPrompt);
      this.installPromptEvent = null;
    });
  }

  /**
   * Create install prompt UI
   */
  private createInstallPromptUI(): HTMLElement {
    const prompt = document.createElement('div');
    prompt.innerHTML = `
      <div class="pwa-install-prompt" style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3B82F6, #1E40AF);
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 400px;
        margin: 0 auto;
      ">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
          Install GetIt App
        </h3>
        <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">
          Get faster access and offline browsing by installing our app
        </p>
        <div style="display: flex; gap: 12px;">
          <button class="install-button" style="
            background: white;
            color: #1E40AF;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            flex: 1;
          ">
            Install
          </button>
          <button class="dismiss-button" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            flex: 1;
          ">
            Not Now
          </button>
        </div>
      </div>
    `;
    return prompt;
  }

  /**
   * Trigger install prompt
   */
  private async triggerInstallPrompt(): Promise<void> {
    if (!this.installPromptEvent) return;

    await this.installPromptEvent.prompt();
    
    const { outcome } = await this.installPromptEvent.userChoice;
    
    if (outcome === 'accepted') {
      this.metrics.installPromptAccepted++;
      console.log('User accepted install prompt');
    } else {
      console.log('User dismissed install prompt');
    }
    
    this.installPromptEvent = null;
  }

  /**
   * Initialize push notifications
   */
  private async initializePushNotifications(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Push notifications not supported');
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.subscribeToPushNotifications();
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.registration) return;

    try {
      const applicationServerKey = this.urlB64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NMu_BpHGpqiRHq9PpkxCcgdmOVzQGzNLZbhPLw8WoY4vTDN_lm5E_M'
      );

      this.pushSubscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.pushSubscription);

      console.log('Push subscription successful');
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  /**
   * Show notification
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    if (this.registration) {
      await this.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag,
        data: options.data,
        actions: options.actions,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
      });

      this.metrics.pushNotificationsSent++;
    }
  }

  /**
   * Setup offline detection
   */
  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.handleOnlineStatus(false);
    });
  }

  /**
   * Handle online status changes
   */
  private handleOnlineStatus(isOnline: boolean): void {
    if (isOnline) {
      // Remove offline banner
      const offlineBanner = document.querySelector('.offline-banner');
      if (offlineBanner) {
        offlineBanner.remove();
      }

      // Sync pending data
      this.syncPendingData();
    } else {
      // Show offline banner
      this.showOfflineBanner();
    }
  }

  /**
   * Show offline banner
   */
  private showOfflineBanner(): void {
    const existingBanner = document.querySelector('.offline-banner');
    if (existingBanner) return;

    const banner = document.createElement('div');
    banner.className = 'offline-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #F59E0B;
        color: white;
        padding: 8px 16px;
        text-align: center;
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
      ">
        You're offline. Some features may be limited.
      </div>
    `;
    document.body.appendChild(banner);
  }

  /**
   * Setup background sync
   */
  private setupBackgroundSync(): void {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background sync not supported');
      return;
    }

    // Listen for sync events
    navigator.serviceWorker.addEventListener('message', (event) => {
      try {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
          this.metrics.backgroundSyncJobs++;
          console.log('Background sync completed');
        }
      } catch (error) {
        console.error('Background sync message handler error:', error);
      }
    });
  }

  /**
   * Sync pending data
   */
  private async syncPendingData(): Promise<void> {
    if (!this.registration) return;

    try {
      // Trigger background sync
      await this.registration.sync.register('sync-data');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    try {
      if (!event.data || typeof event.data !== 'object') {
        console.warn('Invalid service worker message data:', event.data);
        return;
      }

      const { type, payload } = event.data;

      switch (type) {
        case 'CACHE_HIT':
          this.updateCacheHitRate(true);
          break;
        case 'CACHE_MISS':
          this.updateCacheHitRate(false);
          break;
        case 'OFFLINE_PAGE_VIEW':
          this.metrics.offlinePageViews++;
          break;
        case 'NOTIFICATION_CLICKED':
          this.metrics.pushNotificationsClicked++;
          break;
        default:
          console.log('Unknown service worker message:', type, payload);
      }
    } catch (error) {
      console.error('Service worker message handler error:', error);
    }
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(isHit: boolean): void {
    const totalRequests = this.metrics.cacheHitRate * 100 + 1;
    const hitRate = isHit ? 1 : 0;
    this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (totalRequests - 1) + hitRate) / totalRequests;
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(): void {
    this.showNotification({
      title: 'App Updated',
      body: 'New features and improvements are available. Refresh to update.',
      tag: 'app-update',
      actions: [
        { action: 'refresh', title: 'Refresh' },
        { action: 'dismiss', title: 'Later' },
      ],
      requireInteraction: true,
      data: { type: 'app-update' },
    });
  }

  /**
   * Convert base64 to Uint8Array
   */
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Check if app is installable
   */
  isInstallable(): boolean {
    return this.installPromptEvent !== null;
  }

  /**
   * Get PWA status
   */
  getPWAStatus(): {
    isInstalled: boolean;
    isOffline: boolean;
    serviceWorkerActive: boolean;
    pushNotificationsEnabled: boolean;
  } {
    return {
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isOffline: !navigator.onLine,
      serviceWorkerActive: this.registration?.active !== null,
      pushNotificationsEnabled: Notification.permission === 'granted',
    };
  }

  /**
   * Get PWA metrics
   */
  getPWAMetrics(): PWAMetrics {
    return { ...this.metrics };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('Cache cleared');
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  }

  /**
   * Force update service worker
   */
  async forceUpdateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    await this.registration.update();
    
    if (this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Unregister service worker
   */
  async unregisterServiceWorker(): Promise<void> {
    if (!this.registration) return;

    await this.registration.unregister();
    console.log('Service worker unregistered');
  }
}

export default PWAService;
export type { PWAConfig, NotificationOptions, PWAMetrics, PushSubscriptionData };