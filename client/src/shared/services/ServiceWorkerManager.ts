// Advanced Service Worker Manager for Phase 4 Features & Integrations
interface ServiceWorkerConfig {
  swPath: string;
  scope: string;
  updateCheckInterval: number;
  skipWaiting: boolean;
  enableNotifications: boolean;
}

interface CacheStrategy {
  cacheName: string;
  strategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  maxAge: number;
  maxEntries: number;
}

interface SyncTask {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;
  private updateAvailable = false;
  private cacheStrategies: Map<string, CacheStrategy> = new Map();
  private syncTasks: Map<string, SyncTask> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      swPath: '/sw.js',
      scope: '/',
      updateCheckInterval: 3600000, // 1 hour
      skipWaiting: true,
      enableNotifications: true,
      ...config
    };

    this.initializeDefaultCacheStrategies();
  }

  // Register service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swPath,
        { scope: this.config.scope }
      );

      this.setupEventListeners();
      this.checkForUpdates();
      this.setupPeriodicUpdateCheck();

      console.log('Service Worker registered successfully');
      this.emit('registered', this.registration);
      
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.emit('error', error);
      return null;
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        this.emit('unregistered');
      }
      return success;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Check for updates
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  // Update app
  async updateApp(): Promise<void> {
    if (!this.registration || !this.registration.waiting) return;

    // Tell the waiting service worker to become active
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page after the new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Cache management
  async addCacheStrategy(pattern: string, strategy: CacheStrategy): Promise<void> {
    this.cacheStrategies.set(pattern, strategy);
    
    if (this.registration) {
      this.registration.active?.postMessage({
        type: 'ADD_CACHE_STRATEGY',
        pattern,
        strategy
      });
    }
  }

  async clearCache(cacheName?: string): Promise<void> {
    if (!cacheName) {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      this.emit('cacheCleared', { all: true });
    } else {
      await caches.delete(cacheName);
      this.emit('cacheCleared', { cacheName });
    }
  }

  async getCacheSize(): Promise<{ [cacheName: string]: number }> {
    const cacheNames = await caches.keys();
    const sizes: { [cacheName: string]: number } = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      sizes[cacheName] = totalSize;
    }
    
    return sizes;
  }

  // Background sync
  async addSyncTask(task: Omit<SyncTask, 'timestamp' | 'retryCount'>): Promise<void> {
    const syncTask: SyncTask = {
      ...task,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.syncTasks.set(task.id, syncTask);
    
    if (this.registration && 'sync' in window) {
      try {
        await (this.registration as any).sync.register(task.type);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  async removeSyncTask(taskId: string): Promise<void> {
    this.syncTasks.delete(taskId);
  }

  getSyncTasks(): SyncTask[] {
    return Array.from(this.syncTasks.values());
  }

  // Push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.emit('notificationPermission', permission);
    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') return null;

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      this.emit('pushSubscribed', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        const success = await subscription.unsubscribe();
        if (success) {
          this.emit('pushUnsubscribed');
        }
        return success;
      }
      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // Event management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Private methods
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Handle updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true;
            this.emit('updateAvailable');
          }
        });
      }
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });
  }

  private handleServiceWorkerMessage(message: any): void {
    switch (message.type) {
      case 'SYNC_COMPLETE':
        this.removeSyncTask(message.taskId);
        this.emit('syncComplete', message);
        break;
      case 'SYNC_FAILED':
        const task = this.syncTasks.get(message.taskId);
        if (task) {
          task.retryCount++;
          this.emit('syncFailed', message);
        }
        break;
      case 'CACHE_UPDATED':
        this.emit('cacheUpdated', message);
        break;
      default:
        this.emit('message', message);
    }
  }

  private setupPeriodicUpdateCheck(): void {
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  private initializeDefaultCacheStrategies(): void {
    // Static assets - Cache first
    this.cacheStrategies.set('/static/', {
      cacheName: 'static-cache',
      strategy: 'cacheFirst',
      maxAge: 86400000, // 1 day
      maxEntries: 100
    });

    // API calls - Network first
    this.cacheStrategies.set('/api/', {
      cacheName: 'api-cache',
      strategy: 'networkFirst',
      maxAge: 300000, // 5 minutes
      maxEntries: 50
    });

    // Images - Stale while revalidate
    this.cacheStrategies.set('/images/', {
      cacheName: 'image-cache',
      strategy: 'staleWhileRevalidate',
      maxAge: 604800000, // 1 week
      maxEntries: 200
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Status getters
  get isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  get isRegistered(): boolean {
    return this.registration !== null;
  }

  get hasUpdate(): boolean {
    return this.updateAvailable;
  }

  get isControlling(): boolean {
    return navigator.serviceWorker.controller !== null;
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

export default ServiceWorkerManager;