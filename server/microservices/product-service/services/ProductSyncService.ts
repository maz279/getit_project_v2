/**
 * Product Sync Service - Amazon.com/Shopee.sg Level
 * Real-time multi-channel synchronization with sub-second updates
 * Cross-platform inventory, pricing, and catalog sync
 */

import { EventEmitter } from 'events';
import { db } from '../../../db';
import { products, categories, productVariants, inventoryMovements } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { productEventStreamingService, ProductEventTypes, ProductStreams } from './ProductEventStreamingService';

interface SyncChannel {
  id: string;
  name: string;
  type: 'marketplace' | 'social' | 'offline' | 'mobile_app' | 'web';
  endpoint: string;
  authentication: {
    type: 'oauth' | 'api_key' | 'jwt';
    credentials: Record<string, string>;
  };
  syncConfig: {
    inventory: boolean;
    pricing: boolean;
    catalog: boolean;
    orders: boolean;
    realTime: boolean;
    batchSize: number;
    retryAttempts: number;
  };
  lastSync: Date;
  status: 'active' | 'inactive' | 'error' | 'syncing';
}

interface SyncOperation {
  id: string;
  channelId: string;
  type: 'inventory_update' | 'price_change' | 'catalog_sync' | 'product_create' | 'product_update';
  productId: string;
  data: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

interface SyncMetrics {
  channelId: string;
  successRate: number;
  avgProcessingTime: number;
  totalOperations: number;
  failedOperations: number;
  lastSuccessfulSync: Date;
  currentBacklog: number;
}

interface ConflictResolution {
  productId: string;
  conflictType: 'inventory' | 'pricing' | 'content';
  channels: string[];
  conflictData: Array<{
    channelId: string;
    value: any;
    timestamp: Date;
    priority: number;
  }>;
  resolution: 'manual' | 'automatic' | 'priority_based' | 'latest_wins';
  resolvedValue?: any;
  resolvedAt?: Date;
}

export class ProductSyncService extends EventEmitter {
  private channels: Map<string, SyncChannel> = new Map();
  private operationQueue: Map<string, SyncOperation> = new Map();
  private syncMetrics: Map<string, SyncMetrics> = new Map();
  private conflicts: Map<string, ConflictResolution> = new Map();
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeSyncService();
  }

  /**
   * Initialize sync service and setup channels
   */
  async initializeSyncService(): Promise<void> {
    console.log('[ProductSyncService] Initializing real-time sync service...');
    
    // Setup default channels
    await this.setupDefaultChannels();
    
    // Start real-time processing
    this.startRealTimeProcessing();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('[ProductSyncService] Real-time sync service initialized successfully');
  }

  /**
   * Register a new sync channel
   */
  async registerChannel(channelConfig: Omit<SyncChannel, 'id' | 'lastSync' | 'status'>): Promise<string> {
    try {
      const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const channel: SyncChannel = {
        id: channelId,
        ...channelConfig,
        lastSync: new Date(),
        status: 'inactive'
      };

      this.channels.set(channelId, channel);
      
      // Initialize metrics
      this.syncMetrics.set(channelId, {
        channelId,
        successRate: 100,
        avgProcessingTime: 0,
        totalOperations: 0,
        failedOperations: 0,
        lastSuccessfulSync: new Date(),
        currentBacklog: 0
      });

      console.log(`[ProductSyncService] Channel registered: ${channel.name} (${channelId})`);
      
      return channelId;
    } catch (error) {
      console.error('[ProductSyncService] Failed to register channel:', error);
      throw error;
    }
  }

  /**
   * Sync product to specific channel with real-time processing
   */
  async syncProductToChannel(
    productId: string, 
    channelId: string, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    try {
      const channel = this.channels.get(channelId);
      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      if (!channel.syncConfig.realTime && priority !== 'high') {
        // Queue for batch processing
        return await this.queueBatchSync(productId, channelId);
      }

      // Get product data
      const [product] = await db.select()
        .from(products)
        .where(eq(products.id, productId));

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Create sync operation
      const operationId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const operation: SyncOperation = {
        id: operationId,
        channelId,
        type: 'product_update',
        productId,
        data: await this.prepareProductData(product, channel),
        status: 'pending',
        attempts: 0,
        createdAt: new Date()
      };

      this.operationQueue.set(operationId, operation);

      // Process immediately for real-time sync
      if (channel.syncConfig.realTime) {
        await this.processOperation(operation);
      }

      console.log(`[ProductSyncService] Product sync queued: ${productId} -> ${channel.name}`);
      
      return operationId;
    } catch (error) {
      console.error('[ProductSyncService] Failed to sync product:', error);
      throw error;
    }
  }

  /**
   * Sync inventory update across all channels
   */
  async syncInventoryUpdate(productId: string, newQuantity: number, oldQuantity: number): Promise<void> {
    try {
      console.log(`[ProductSyncService] Syncing inventory update: ${productId} (${oldQuantity} -> ${newQuantity})`);

      const activeChannels = Array.from(this.channels.values())
        .filter(channel => channel.status === 'active' && channel.syncConfig.inventory);

      const syncPromises = activeChannels.map(async (channel) => {
        const operationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const operation: SyncOperation = {
          id: operationId,
          channelId: channel.id,
          type: 'inventory_update',
          productId,
          data: {
            quantity: newQuantity,
            previousQuantity: oldQuantity,
            timestamp: new Date().toISOString()
          },
          status: 'pending',
          attempts: 0,
          createdAt: new Date()
        };

        this.operationQueue.set(operationId, operation);

        // Process immediately if real-time enabled
        if (channel.syncConfig.realTime) {
          return this.processOperation(operation);
        }
      });

      await Promise.allSettled(syncPromises);

      // Publish sync completion event
      await productEventStreamingService.publishEvent({
        eventType: ProductEventTypes.INVENTORY_CHANGED,
        streamName: ProductStreams.INVENTORY,
        aggregateId: productId,
        eventData: {
          productId,
          newQuantity,
          oldQuantity,
          syncedChannels: activeChannels.length
        }
      });

    } catch (error) {
      console.error('[ProductSyncService] Failed to sync inventory update:', error);
      throw error;
    }
  }

  /**
   * Sync price change across all channels
   */
  async syncPriceChange(productId: string, newPrice: number, oldPrice: number): Promise<void> {
    try {
      console.log(`[ProductSyncService] Syncing price change: ${productId} (${oldPrice} -> ${newPrice})`);

      const activeChannels = Array.from(this.channels.values())
        .filter(channel => channel.status === 'active' && channel.syncConfig.pricing);

      const syncPromises = activeChannels.map(async (channel) => {
        const operationId = `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const operation: SyncOperation = {
          id: operationId,
          channelId: channel.id,
          type: 'price_change',
          productId,
          data: {
            price: newPrice,
            previousPrice: oldPrice,
            currency: 'BDT',
            timestamp: new Date().toISOString()
          },
          status: 'pending',
          attempts: 0,
          createdAt: new Date()
        };

        this.operationQueue.set(operationId, operation);

        // Process immediately if real-time enabled
        if (channel.syncConfig.realTime) {
          return this.processOperation(operation);
        }
      });

      await Promise.allSettled(syncPromises);

      // Publish sync completion event
      await productEventStreamingService.publishEvent({
        eventType: ProductEventTypes.PRICE_UPDATED,
        streamName: ProductStreams.PRICING,
        aggregateId: productId,
        eventData: {
          productId,
          newPrice,
          oldPrice,
          syncedChannels: activeChannels.length
        }
      });

    } catch (error) {
      console.error('[ProductSyncService] Failed to sync price change:', error);
      throw error;
    }
  }

  /**
   * Get sync status for all channels
   */
  async getSyncStatus(): Promise<{
    channels: SyncChannel[];
    metrics: SyncMetrics[];
    queueStatus: {
      pending: number;
      processing: number;
      failed: number;
    };
    conflicts: ConflictResolution[];
  }> {
    try {
      const queueOperations = Array.from(this.operationQueue.values());
      
      return {
        channels: Array.from(this.channels.values()),
        metrics: Array.from(this.syncMetrics.values()),
        queueStatus: {
          pending: queueOperations.filter(op => op.status === 'pending').length,
          processing: queueOperations.filter(op => op.status === 'processing').length,
          failed: queueOperations.filter(op => op.status === 'failed').length
        },
        conflicts: Array.from(this.conflicts.values())
      };
    } catch (error) {
      console.error('[ProductSyncService] Failed to get sync status:', error);
      throw error;
    }
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(
    conflictId: string, 
    resolution: ConflictResolution['resolution'],
    manualValue?: any
  ): Promise<void> {
    try {
      const conflict = this.conflicts.get(conflictId);
      if (!conflict) {
        throw new Error(`Conflict not found: ${conflictId}`);
      }

      let resolvedValue: any;

      switch (resolution) {
        case 'manual':
          resolvedValue = manualValue;
          break;
        case 'latest_wins':
          const latest = conflict.conflictData.reduce((prev, current) => 
            current.timestamp > prev.timestamp ? current : prev
          );
          resolvedValue = latest.value;
          break;
        case 'priority_based':
          const highest = conflict.conflictData.reduce((prev, current) => 
            current.priority > prev.priority ? current : prev
          );
          resolvedValue = highest.value;
          break;
        case 'automatic':
          // Apply business rules for automatic resolution
          resolvedValue = await this.applyAutomaticResolution(conflict);
          break;
      }

      // Update conflict
      conflict.resolution = resolution;
      conflict.resolvedValue = resolvedValue;
      conflict.resolvedAt = new Date();

      // Apply resolution to product
      await this.applyConflictResolution(conflict);

      // Remove from conflicts
      this.conflicts.delete(conflictId);

      console.log(`[ProductSyncService] Conflict resolved: ${conflictId} -> ${resolvedValue}`);

    } catch (error) {
      console.error('[ProductSyncService] Failed to resolve conflict:', error);
      throw error;
    }
  }

  /**
   * Private: Setup default channels
   */
  private async setupDefaultChannels(): Promise<void> {
    try {
      // Web channel (default)
      await this.registerChannel({
        name: 'GetIt Web Platform',
        type: 'web',
        endpoint: process.env.WEB_PLATFORM_URL || 'https://getit.com.bd',
        authentication: {
          type: 'jwt',
          credentials: { secret: process.env.JWT_SECRET || 'default' }
        },
        syncConfig: {
          inventory: true,
          pricing: true,
          catalog: true,
          orders: true,
          realTime: true,
          batchSize: 100,
          retryAttempts: 3
        }
      });

      // Mobile app channel
      await this.registerChannel({
        name: 'GetIt Mobile App',
        type: 'mobile_app',
        endpoint: 'internal://mobile-app',
        authentication: {
          type: 'jwt',
          credentials: { secret: process.env.JWT_SECRET || 'default' }
        },
        syncConfig: {
          inventory: true,
          pricing: true,
          catalog: true,
          orders: true,
          realTime: true,
          batchSize: 50,
          retryAttempts: 2
        }
      });

      // Social commerce channel
      await this.registerChannel({
        name: 'Social Commerce',
        type: 'social',
        endpoint: 'internal://social-commerce',
        authentication: {
          type: 'api_key',
          credentials: { key: 'social_commerce_key' }
        },
        syncConfig: {
          inventory: true,
          pricing: true,
          catalog: true,
          orders: false,
          realTime: true,
          batchSize: 25,
          retryAttempts: 3
        }
      });

    } catch (error) {
      console.error('[ProductSyncService] Failed to setup default channels:', error);
    }
  }

  /**
   * Private: Start real-time processing
   */
  private async startRealTimeProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Process operations every 100ms for real-time sync
    this.processingInterval = setInterval(async () => {
      await this.processOperationQueue();
    }, 100);
  }

  /**
   * Private: Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for product events from EventStreamingService
    productEventStreamingService.on('productEvent', async (event) => {
      try {
        switch (event.eventType) {
          case ProductEventTypes.INVENTORY_CHANGED:
            await this.handleInventoryChangeEvent(event);
            break;
          case ProductEventTypes.PRICE_UPDATED:
            await this.handlePriceUpdateEvent(event);
            break;
          case ProductEventTypes.PRODUCT_UPDATED:
            await this.handleProductUpdateEvent(event);
            break;
        }
      } catch (error) {
        console.error('[ProductSyncService] Error handling event:', error);
      }
    });
  }

  /**
   * Private: Process operation queue
   */
  private async processOperationQueue(): Promise<void> {
    try {
      const pendingOperations = Array.from(this.operationQueue.values())
        .filter(op => op.status === 'pending' || op.status === 'retrying')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, 10); // Process max 10 operations per cycle

      for (const operation of pendingOperations) {
        await this.processOperation(operation);
      }
    } catch (error) {
      console.error('[ProductSyncService] Error processing operation queue:', error);
    }
  }

  /**
   * Private: Process individual operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      operation.status = 'processing';
      operation.attempts++;

      const channel = this.channels.get(operation.channelId);
      if (!channel) {
        throw new Error(`Channel not found: ${operation.channelId}`);
      }

      const startTime = Date.now();

      // Simulate channel sync (replace with actual API calls)
      await this.syncToChannel(operation, channel);

      const processingTime = Date.now() - startTime;

      // Update operation status
      operation.status = 'completed';
      operation.completedAt = new Date();

      // Update metrics
      await this.updateSyncMetrics(operation.channelId, true, processingTime);

      // Remove from queue
      this.operationQueue.delete(operation.id);

      console.log(`[ProductSyncService] Operation completed: ${operation.id} (${processingTime}ms)`);

    } catch (error) {
      console.error(`[ProductSyncService] Operation failed: ${operation.id}`, error);
      
      operation.error = error.message;
      
      if (operation.attempts < (this.channels.get(operation.channelId)?.syncConfig.retryAttempts || 3)) {
        operation.status = 'retrying';
        // Exponential backoff
        setTimeout(() => {
          operation.status = 'pending';
        }, Math.pow(2, operation.attempts) * 1000);
      } else {
        operation.status = 'failed';
        await this.updateSyncMetrics(operation.channelId, false, 0);
      }
    }
  }

  /**
   * Private: Sync operation to channel
   */
  private async syncToChannel(operation: SyncOperation, channel: SyncChannel): Promise<void> {
    // Mock implementation - replace with actual channel API calls
    const delay = Math.random() * 100 + 50; // 50-150ms simulation
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`Channel sync failed: ${channel.name}`);
    }

    console.log(`[ProductSyncService] Synced to ${channel.name}: ${operation.type} for product ${operation.productId}`);
  }

  /**
   * Private: Prepare product data for channel
   */
  private async prepareProductData(product: any, channel: SyncChannel): Promise<Record<string, any>> {
    // Transform product data based on channel requirements
    const baseData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      sku: product.sku,
      images: product.images,
      isActive: product.isActive
    };

    // Channel-specific transformations
    switch (channel.type) {
      case 'social':
        return {
          ...baseData,
          socialDescription: product.description.substring(0, 280), // Social media limit
          hashtags: product.tags?.slice(0, 5) || []
        };
      case 'mobile_app':
        return {
          ...baseData,
          mobileOptimizedImages: product.images?.map(img => `${img}?mobile=true`) || []
        };
      default:
        return baseData;
    }
  }

  /**
   * Private: Update sync metrics
   */
  private async updateSyncMetrics(channelId: string, success: boolean, processingTime: number): Promise<void> {
    const metrics = this.syncMetrics.get(channelId);
    if (!metrics) return;

    metrics.totalOperations++;
    if (success) {
      metrics.lastSuccessfulSync = new Date();
    } else {
      metrics.failedOperations++;
    }

    metrics.successRate = ((metrics.totalOperations - metrics.failedOperations) / metrics.totalOperations) * 100;
    metrics.avgProcessingTime = ((metrics.avgProcessingTime * (metrics.totalOperations - 1)) + processingTime) / metrics.totalOperations;
    metrics.currentBacklog = Array.from(this.operationQueue.values()).filter(op => op.channelId === channelId && op.status === 'pending').length;
  }

  /**
   * Private: Queue batch sync operation
   */
  private async queueBatchSync(productId: string, channelId: string): Promise<string> {
    const operationId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Implementation for batch sync queuing
    return operationId;
  }

  /**
   * Private: Handle product events
   */
  private async handleInventoryChangeEvent(event: any): Promise<void> {
    const { productId, newQuantity, oldQuantity } = event.eventData;
    await this.syncInventoryUpdate(productId, newQuantity, oldQuantity);
  }

  private async handlePriceUpdateEvent(event: any): Promise<void> {
    const { productId, newPrice, oldPrice } = event.eventData;
    await this.syncPriceChange(productId, newPrice, oldPrice);
  }

  private async handleProductUpdateEvent(event: any): Promise<void> {
    const { productId } = event.eventData;
    
    // Sync to all active channels
    const activeChannels = Array.from(this.channels.values()).filter(c => c.status === 'active');
    for (const channel of activeChannels) {
      await this.syncProductToChannel(productId, channel.id, 'medium');
    }
  }

  /**
   * Private: Apply automatic conflict resolution
   */
  private async applyAutomaticResolution(conflict: ConflictResolution): Promise<any> {
    // Implement business logic for automatic conflict resolution
    switch (conflict.conflictType) {
      case 'inventory':
        // Use the lowest inventory to prevent overselling
        return Math.min(...conflict.conflictData.map(d => d.value));
      case 'pricing':
        // Use weighted average based on priority
        const totalPriority = conflict.conflictData.reduce((sum, d) => sum + d.priority, 0);
        return conflict.conflictData.reduce((sum, d) => sum + (d.value * d.priority / totalPriority), 0);
      default:
        // Default to latest value
        return conflict.conflictData.reduce((prev, current) => 
          current.timestamp > prev.timestamp ? current : prev
        ).value;
    }
  }

  /**
   * Private: Apply conflict resolution to product
   */
  private async applyConflictResolution(conflict: ConflictResolution): Promise<void> {
    const updateData: any = {};
    
    switch (conflict.conflictType) {
      case 'inventory':
        updateData.inventory = conflict.resolvedValue;
        break;
      case 'pricing':
        updateData.price = conflict.resolvedValue;
        break;
      case 'content':
        // Handle content conflicts (name, description, etc.)
        updateData[conflict.conflictData[0]?.value?.field] = conflict.resolvedValue;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(products)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(products.id, conflict.productId));
    }
  }

  /**
   * Shutdown sync service
   */
  async shutdown(): Promise<void> {
    console.log('[ProductSyncService] Shutting down...');
    
    this.isProcessing = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    this.removeAllListeners();
    
    console.log('[ProductSyncService] Shutdown completed');
  }
}

// Singleton instance
export const productSyncService = new ProductSyncService();