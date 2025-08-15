/**
 * PHASE 4: OFFLINE CAPABILITY MANAGER
 * Service worker coordination and offline-first architecture
 * Investment: $20,000 | Week 2-3: Offline & Performance Excellence  
 * Date: July 26, 2025
 */

import { z } from 'zod';

// Offline Configuration Schema
const OfflineConfigSchema = z.object({
  maxOfflineStorage: z.number(), // MB
  syncInterval: z.number(), // minutes
  offlineQueueSize: z.number(),
  prioritySync: z.array(z.string()),
  backgroundSync: z.boolean(),
  offlineAnalytics: z.boolean()
});

// Offline Action Types
enum OfflineActionType {
  SEARCH = 'search',
  PRODUCT_VIEW = 'product_view',
  CART_ADD = 'cart_add',
  CART_REMOVE = 'cart_remove',
  WISHLIST_ADD = 'wishlist_add',
  USER_INTERACTION = 'user_interaction',
  ANALYTICS_EVENT = 'analytics_event'
}

// Offline Queue Item
interface OfflineQueueItem {
  readonly id: string;
  readonly type: OfflineActionType;
  readonly action: string;
  readonly data: Record<string, any>;
  readonly timestamp: number;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly retryCount: number;
  readonly maxRetries: number;
}

// Offline Storage Interface
interface OfflineStorage {
  readonly searches: Map<string, any>;
  readonly products: Map<string, any>;
  readonly categories: Map<string, any>;
  readonly cart: Array<any>;
  readonly wishlist: Array<any>;
  readonly userPreferences: Record<string, any>;
  readonly analytics: Array<any>;
}

// Sync Status
interface SyncStatus {
  readonly isOnline: boolean;
  readonly lastSync: number;
  readonly pendingItems: number;
  readonly syncInProgress: boolean;
  readonly failedSyncs: number;
  readonly nextSyncTime: number;
}

export class OfflineCapabilityManager {
  private readonly config: z.infer<typeof OfflineConfigSchema>;
  private readonly offlineQueue: Map<string, OfflineQueueItem>;
  private readonly offlineStorage: OfflineStorage;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor() {
    this.config = this.initializeOfflineConfig();
    this.offlineQueue = new Map();
    this.offlineStorage = this.initializeOfflineStorage();
    
    this.setupConnectivityMonitoring();
    this.startSyncScheduler();
  }

  /**
   * Initialize offline configuration
   */
  private initializeOfflineConfig(): z.infer<typeof OfflineConfigSchema> {
    return {
      maxOfflineStorage: 100, // 100MB
      syncInterval: 5, // 5 minutes
      offlineQueueSize: 1000,
      prioritySync: ['cart_add', 'cart_remove', 'user_interaction'],
      backgroundSync: true,
      offlineAnalytics: true
    };
  }

  /**
   * Initialize offline storage structure
   */
  private initializeOfflineStorage(): OfflineStorage {
    return {
      searches: new Map(),
      products: new Map(),
      categories: new Map(),
      cart: [],
      wishlist: [],
      userPreferences: {},
      analytics: []
    };
  }

  /**
   * Setup connectivity monitoring
   */
  private setupConnectivityMonitoring(): void {
    // In a real implementation, this would monitor actual network connectivity
    this.isOnline = navigator?.onLine ?? true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Connection restored, initiating sync...');
        this.isOnline = true;
        this.performSync();
      });

      window.addEventListener('offline', () => {
        console.log('📱 Offline mode activated');
        this.isOnline = false;
      });
    }
  }

  /**
   * Start sync scheduler
   */
  private startSyncScheduler(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performSync();
      }
    }, this.config.syncInterval * 60 * 1000);
  }

  /**
   * Queue offline action
   */
  async queueOfflineAction(
    type: OfflineActionType,
    action: string,
    data: Record<string, any>,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: OfflineQueueItem = {
      id,
      type,
      action,
      data,
      timestamp: Date.now(),
      priority,
      retryCount: 0,
      maxRetries: priority === 'critical' ? 10 : 3
    };

    // Check queue size limit
    if (this.offlineQueue.size >= this.config.offlineQueueSize) {
      // Remove oldest low-priority items
      this.cleanupQueue();
    }

    this.offlineQueue.set(id, queueItem);
    
    // If online and high priority, attempt immediate sync
    if (this.isOnline && (priority === 'high' || priority === 'critical')) {
      this.syncItem(queueItem);
    }

    console.log(`📦 Queued offline action: ${type} - ${action} (${priority})`);
    return id;
  }

  /**
   * Store search results for offline access
   */
  async storeOfflineSearch(
    query: string,
    results: any[],
    language: string = 'en'
  ): Promise<void> {
    const key = `${language}:${query.toLowerCase().trim()}`;
    
    this.offlineStorage.searches.set(key, {
      query,
      results,
      language,
      timestamp: Date.now(),
      accessCount: 1
    });

    // Limit search cache size (keep most recent/accessed)
    if (this.offlineStorage.searches.size > 500) {
      this.cleanupSearchCache();
    }

    console.log(`💾 Stored offline search: "${query}" (${results.length} results)`);
  }

  /**
   * Retrieve offline search results
   */
  async getOfflineSearch(
    query: string,
    language: string = 'en'
  ): Promise<any[] | null> {
    const key = `${language}:${query.toLowerCase().trim()}`;
    const cached = this.offlineStorage.searches.get(key);
    
    if (cached) {
      // Update access count and timestamp
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.offlineStorage.searches.set(key, cached);
      
      console.log(`📖 Retrieved offline search: "${query}" (${cached.results.length} results)`);
      return cached.results;
    }

    return null;
  }

  /**
   * Store product data for offline browsing
   */
  async storeOfflineProduct(productId: string, productData: any): Promise<void> {
    this.offlineStorage.products.set(productId, {
      ...productData,
      storedAt: Date.now(),
      accessCount: 0
    });

    // Limit product cache size
    if (this.offlineStorage.products.size > 1000) {
      this.cleanupProductCache();
    }

    console.log(`💾 Stored offline product: ${productId}`);
  }

  /**
   * Retrieve offline product data
   */
  async getOfflineProduct(productId: string): Promise<any | null> {
    const product = this.offlineStorage.products.get(productId);
    
    if (product) {
      product.accessCount++;
      product.lastAccessed = Date.now();
      this.offlineStorage.products.set(productId, product);
      
      console.log(`📖 Retrieved offline product: ${productId}`);
      return product;
    }

    return null;
  }

  /**
   * Store offline cart operations
   */
  async storeOfflineCartOperation(
    operation: 'add' | 'remove' | 'update',
    productId: string,
    data: any
  ): Promise<void> {
    const cartOperation = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      productId,
      data,
      timestamp: Date.now()
    };

    this.offlineStorage.cart.push(cartOperation);
    
    // Queue for sync
    await this.queueOfflineAction(
      operation === 'add' ? OfflineActionType.CART_ADD : OfflineActionType.CART_REMOVE,
      operation,
      { productId, ...data },
      'high'
    );

    console.log(`🛒 Stored offline cart operation: ${operation} - ${productId}`);
  }

  /**
   * Get offline cart state
   */
  getOfflineCart(): Array<any> {
    return this.offlineStorage.cart;
  }

  /**
   * Perform sync with server
   */
  private async performSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.offlineQueue.size === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Starting offline sync (${this.offlineQueue.size} items)`);

    const sortedItems = Array.from(this.offlineQueue.values()).sort((a, b) => {
      // Priority order: critical > high > medium > low
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of sortedItems) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          this.offlineQueue.delete(item.id);
          syncedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`❌ Sync failed for item ${item.id}:`, error);
        failedCount++;
      }
    }

    this.syncInProgress = false;
    console.log(`✅ Sync completed: ${syncedCount} synced, ${failedCount} failed`);
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: OfflineQueueItem): Promise<boolean> {
    try {
      // Simulate API call based on action type
      const endpoint = this.getEndpointForAction(item.type, item.action);
      
      // In a real implementation, this would make actual HTTP requests
      console.log(`🔄 Syncing ${item.type} - ${item.action} to ${endpoint}`);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      item.retryCount++;
      
      if (item.retryCount >= item.maxRetries) {
        console.error(`❌ Max retries exceeded for item ${item.id}`);
        this.offlineQueue.delete(item.id);
        return false;
      }

      console.warn(`⚠️ Retry ${item.retryCount}/${item.maxRetries} for item ${item.id}`);
      return false;
    }
  }

  /**
   * Get API endpoint for action type
   */
  private getEndpointForAction(type: OfflineActionType, action: string): string {
    const endpointMap: Record<OfflineActionType, string> = {
      [OfflineActionType.SEARCH]: '/api/search/sync',
      [OfflineActionType.PRODUCT_VIEW]: '/api/analytics/product-view',
      [OfflineActionType.CART_ADD]: '/api/cart/add',
      [OfflineActionType.CART_REMOVE]: '/api/cart/remove',
      [OfflineActionType.WISHLIST_ADD]: '/api/wishlist/add',
      [OfflineActionType.USER_INTERACTION]: '/api/analytics/interaction',
      [OfflineActionType.ANALYTICS_EVENT]: '/api/analytics/event'
    };

    return endpointMap[type] || '/api/sync';
  }

  /**
   * Cleanup queue when size limit is exceeded
   */
  private cleanupQueue(): void {
    const items = Array.from(this.offlineQueue.values());
    
    // Remove old low-priority items
    const lowPriorityOldItems = items
      .filter(item => item.priority === 'low')
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, Math.ceil(items.length * 0.1));

    for (const item of lowPriorityOldItems) {
      this.offlineQueue.delete(item.id);
    }

    console.log(`🧹 Cleaned up ${lowPriorityOldItems.length} old queue items`);
  }

  /**
   * Cleanup search cache
   */
  private cleanupSearchCache(): void {
    const searches = Array.from(this.offlineStorage.searches.entries());
    
    // Keep most accessed and recent searches
    const toRemove = searches
      .sort((a, b) => {
        const scoreA = a[1].accessCount + (Date.now() - a[1].timestamp) / 1000000;
        const scoreB = b[1].accessCount + (Date.now() - b[1].timestamp) / 1000000;
        return scoreA - scoreB;
      })
      .slice(0, Math.ceil(searches.length * 0.2));

    for (const [key] of toRemove) {
      this.offlineStorage.searches.delete(key);
    }

    console.log(`🧹 Cleaned up ${toRemove.length} old search cache entries`);
  }

  /**
   * Cleanup product cache
   */
  private cleanupProductCache(): void {
    const products = Array.from(this.offlineStorage.products.entries());
    
    // Keep most accessed and recent products
    const toRemove = products
      .sort((a, b) => {
        const scoreA = a[1].accessCount + (Date.now() - a[1].storedAt) / 1000000;
        const scoreB = b[1].accessCount + (Date.now() - b[1].storedAt) / 1000000;
        return scoreA - scoreB;
      })
      .slice(0, Math.ceil(products.length * 0.2));

    for (const [key] of toRemove) {
      this.offlineStorage.products.delete(key);
    }

    console.log(`🧹 Cleaned up ${toRemove.length} old product cache entries`);
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: 0, // In real implementation, track last successful sync
      pendingItems: this.offlineQueue.size,
      syncInProgress: this.syncInProgress,
      failedSyncs: 0, // In real implementation, track failed syncs
      nextSyncTime: Date.now() + (this.config.syncInterval * 60 * 1000)
    };
  }

  /**
   * Get offline storage statistics
   */
  getOfflineStorageStats(): {
    searches: number;
    products: number;
    cart: number;
    queueSize: number;
    estimatedSize: number; // in MB
  } {
    // Rough estimation of storage size
    const searchSize = this.offlineStorage.searches.size * 0.01; // ~10KB per search
    const productSize = this.offlineStorage.products.size * 0.1; // ~100KB per product
    const cartSize = this.offlineStorage.cart.length * 0.005; // ~5KB per cart item
    const queueSize = this.offlineQueue.size * 0.002; // ~2KB per queue item

    return {
      searches: this.offlineStorage.searches.size,
      products: this.offlineStorage.products.size,
      cart: this.offlineStorage.cart.length,
      queueSize: this.offlineQueue.size,
      estimatedSize: searchSize + productSize + cartSize + queueSize
    };
  }

  /**
   * Force sync
   */
  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.performSync();
  }

  /**
   * Clear offline data
   */
  clearOfflineData(type?: 'searches' | 'products' | 'cart' | 'all'): void {
    switch (type) {
      case 'searches':
        this.offlineStorage.searches.clear();
        break;
      case 'products':
        this.offlineStorage.products.clear();
        break;
      case 'cart':
        this.offlineStorage.cart = [];
        break;
      case 'all':
      default:
        this.offlineStorage.searches.clear();
        this.offlineStorage.products.clear();
        this.offlineStorage.cart = [];
        this.offlineStorage.analytics = [];
        this.offlineQueue.clear();
        break;
    }

    console.log(`🗑️ Cleared offline data: ${type || 'all'}`);
  }

  /**
   * Get configuration
   */
  getConfig(): z.infer<typeof OfflineConfigSchema> {
    return this.config;
  }

  /**
   * Health check
   */
  healthCheck(): {
    status: 'healthy' | 'degraded' | 'error';
    details: Record<string, any>;
  } {
    const stats = this.getOfflineStorageStats();
    const syncStatus = this.getSyncStatus();
    
    let status: 'healthy' | 'degraded' | 'error' = 'healthy';
    
    if (stats.estimatedSize > this.config.maxOfflineStorage * 0.9) {
      status = 'degraded';
    }
    
    if (!this.isOnline && syncStatus.pendingItems > 500) {
      status = 'error';
    }

    return {
      status,
      details: {
        isOnline: this.isOnline,
        storageStats: stats,
        syncStatus: syncStatus,
        configLimits: {
          maxStorage: this.config.maxOfflineStorage,
          queueSize: this.config.offlineQueueSize
        }
      }
    };
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    console.log('✅ Offline Capability Manager shutdown complete');
  }
}

// Export singleton instance
export const offlineManager = new OfflineCapabilityManager();