/**
 * Progressive Web App Service
 * Phase 2 Week 5-6: PWA Implementation
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

interface PWAConfig {
  enableInstallPrompt: boolean;
  enablePushNotifications: boolean;
  enableBackgroundSync: boolean;
  enableOfflineSupport: boolean;
  cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: NotificationAction[];
}

interface PWAMetrics {
  installPromptShown: number;
  installPromptAccepted: number;
  notificationsSent: number;
  offlinePageViews: number;
  cacheHitRate: number;
  serviceWorkerActive: boolean;
}

class PWAService {
  private static instance: PWAService;
  private config: PWAConfig;
  private metrics: PWAMetrics;
  private deferredPrompt: InstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.config = {
      enableInstallPrompt: true,
      enablePushNotifications: true,
      enableBackgroundSync: true,
      enableOfflineSupport: true,
      cacheStrategy: 'stale-while-revalidate'
    };

    this.metrics = {
      installPromptShown: 0,
      installPromptAccepted: 0,
      notificationsSent: 0,
      offlinePageViews: 0,
      cacheHitRate: 0,
      serviceWorkerActive: false
    };

    this.initializePWA();
  }

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupNotifications();
        this.setupBackgroundSync();
        this.checkOnlineStatus();
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      this.metrics.serviceWorkerActive = true;
      
      console.log('Service Worker registered successfully');
      
      // Update service worker
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private setupInstallPrompt(): void {
    if (!this.config.enableInstallPrompt) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as InstallPromptEvent;
      this.metrics.installPromptShown++;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.metrics.installPromptAccepted++;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  private showInstallButton(): void {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.onclick = () => this.showInstallPrompt();
    } else {
      // Create install button if it doesn't exist
      const button = document.createElement('button');
      button.id = 'install-button';
      button.innerHTML = 'Install App';
      button.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors';
      button.onclick = () => this.showInstallPrompt();
      document.body.appendChild(button);
    }
  }

  private hideInstallButton(): void {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  public async showInstallPrompt(): Promise<void> {
    if (!this.deferredPrompt) return;

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.metrics.installPromptAccepted++;
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  }

  private async setupNotifications(): Promise<void> {
    if (!this.config.enablePushNotifications) return;

    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  }

  public async sendNotification(options: NotificationOptions): Promise<void> {
    if (!this.config.enablePushNotifications) return;

    if ('serviceWorker' in navigator && this.registration) {
      try {
        await this.registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/badge-72x72.png',
          tag: options.tag,
          actions: options.actions || [],
          data: {
            timestamp: Date.now(),
            url: window.location.href
          }
        });
        
        this.metrics.notificationsSent++;
      } catch (error) {
        console.error('Notification send failed:', error);
      }
    }
  }

  private setupBackgroundSync(): void {
    if (!this.config.enableBackgroundSync) return;

    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Background sync is supported
      console.log('Background sync is supported');
    }
  }

  private checkOnlineStatus(): void {
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        this.handleOnline();
      } else {
        this.handleOffline();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
  }

  private handleOnline(): void {
    console.log('App is online');
    this.hideOfflineIndicator();
    this.syncOfflineData();
  }

  private handleOffline(): void {
    console.log('App is offline');
    this.showOfflineIndicator();
    this.metrics.offlinePageViews++;
  }

  private showOfflineIndicator(): void {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = 'block';
    } else {
      // Create offline indicator
      const div = document.createElement('div');
      div.id = 'offline-indicator';
      div.innerHTML = `
        <div class="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          <span>You're offline. Some features may not be available.</span>
        </div>
      `;
      document.body.appendChild(div);
    }
  }

  private hideOfflineIndicator(): void {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  private async syncOfflineData(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.sync.register('background-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  public async cacheResource(url: string): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('pwa-cache-v1');
        await cache.add(url);
        console.log(`Resource cached: ${url}`);
      } catch (error) {
        console.error(`Failed to cache resource: ${url}`, error);
      }
    }
  }

  public async getCachedResource(url: string): Promise<Response | undefined> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('pwa-cache-v1');
        const response = await cache.match(url);
        if (response) {
          this.metrics.cacheHitRate++;
          return response;
        }
      } catch (error) {
        console.error(`Failed to get cached resource: ${url}`, error);
      }
    }
    return undefined;
  }

  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  }

  public getConfig(): PWAConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getMetrics(): PWAMetrics {
    return { ...this.metrics };
  }

  public async getStorageUsage(): Promise<{ quota: number; usage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota || 0,
          usage: estimate.usage || 0
        };
      } catch (error) {
        console.error('Failed to get storage usage:', error);
      }
    }
    return { quota: 0, usage: 0 };
  }

  public generatePWAReport(): {
    config: PWAConfig;
    metrics: PWAMetrics;
    capabilities: {
      serviceWorker: boolean;
      notifications: boolean;
      installation: boolean;
      backgroundSync: boolean;
    };
    recommendations: string[];
  } {
    const capabilities = {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      installation: 'beforeinstallprompt' in window,
      backgroundSync: 'sync' in window.ServiceWorkerRegistration.prototype
    };

    const recommendations = [
      'Implement service worker for offline functionality',
      'Add web app manifest for installation',
      'Enable push notifications for user engagement',
      'Implement background sync for data synchronization',
      'Optimize caching strategy for better performance',
      'Add offline fallback pages for better UX'
    ];

    return {
      config: this.getConfig(),
      metrics: this.getMetrics(),
      capabilities,
      recommendations
    };
  }
}

export default PWAService;