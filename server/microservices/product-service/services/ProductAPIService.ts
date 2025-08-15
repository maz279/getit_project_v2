/**
 * Product API Service - Amazon.com/Shopee.sg Level
 * Enterprise API management, third-party integrations, and developer ecosystem
 * Advanced rate limiting, API versioning, and webhook management
 */

import { EventEmitter } from 'events';
import { db } from '../../../db';
import { products, categories, vendors } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { productEventStreamingService, ProductEventTypes, ProductStreams } from './ProductEventStreamingService';

interface APIKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  vendorId?: number;
  permissions: APIPermission[];
  rateLimit: {
    requests: number;
    window: number; // seconds
    burst: number;
  };
  quotas: {
    daily: number;
    monthly: number;
    used: {
      daily: number;
      monthly: number;
    };
  };
  isActive: boolean;
  environment: 'sandbox' | 'production';
  createdAt: Date;
  expiresAt?: Date;
}

interface APIPermission {
  resource: 'products' | 'categories' | 'inventory' | 'orders' | 'analytics' | 'webhooks';
  actions: ('read' | 'write' | 'delete' | 'admin')[];
  scopes?: string[];
}

interface WebhookEndpoint {
  id: string;
  apiKeyId: string;
  url: string;
  events: ProductEventTypes[];
  isActive: boolean;
  secret: string;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  headers?: Record<string, string>;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
}

interface APIMetrics {
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  errorMessage?: string;
}

interface RateLimitStatus {
  apiKeyId: string;
  requests: number;
  windowStart: Date;
  burstTokens: number;
  isLimited: boolean;
  resetTime: Date;
}

interface ExternalIntegration {
  id: string;
  name: string;
  type: 'marketplace' | 'pos' | 'erp' | 'analytics' | 'marketing';
  provider: string;
  configuration: {
    apiUrl: string;
    authentication: Record<string, any>;
    syncFrequency: number;
    dataMapping: Record<string, string>;
  };
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error' | 'completed';
}

export class ProductAPIService extends EventEmitter {
  private apiKeys: Map<string, APIKey> = new Map();
  private webhooks: Map<string, WebhookEndpoint> = new Map();
  private rateLimits: Map<string, RateLimitStatus> = new Map();
  private apiMetrics: APIMetrics[] = [];
  private integrations: Map<string, ExternalIntegration> = new Map();
  private isProcessing: boolean = false;

  constructor() {
    super();
    this.initializeAPIService();
  }

  /**
   * Initialize API service and setup management
   */
  async initializeAPIService(): Promise<void> {
    console.log('[ProductAPIService] Initializing enterprise API service...');
    
    // Setup default integrations
    await this.setupDefaultIntegrations();
    
    // Start webhook processing
    this.startWebhookProcessing();
    
    // Setup rate limit cleanup
    this.setupRateLimitCleanup();
    
    // Setup API monitoring
    this.setupAPIMonitoring();
    
    console.log('[ProductAPIService] Enterprise API service initialized successfully');
  }

  /**
   * Create API key with permissions and rate limits
   */
  async createAPIKey(request: {
    name: string;
    vendorId?: number;
    permissions: APIPermission[];
    rateLimit?: {
      requests: number;
      window: number;
      burst: number;
    };
    quotas?: {
      daily: number;
      monthly: number;
    };
    environment?: 'sandbox' | 'production';
    expiresIn?: number; // days
  }): Promise<{
    apiKey: string;
    secret: string;
    keyId: string;
  }> {
    try {
      const keyId = `ak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const apiKey = `getit_${request.environment || 'sandbox'}_${Math.random().toString(36).substr(2, 16)}`;
      const secret = this.generateSecureSecret();

      const apiKeyData: APIKey = {
        id: keyId,
        name: request.name,
        key: apiKey,
        secret,
        vendorId: request.vendorId,
        permissions: request.permissions,
        rateLimit: request.rateLimit || {
          requests: 1000,
          window: 3600, // 1 hour
          burst: 50
        },
        quotas: {
          daily: request.quotas?.daily || 10000,
          monthly: request.quotas?.monthly || 300000,
          used: {
            daily: 0,
            monthly: 0
          }
        },
        isActive: true,
        environment: request.environment || 'sandbox',
        createdAt: new Date(),
        expiresAt: request.expiresIn ? new Date(Date.now() + request.expiresIn * 24 * 60 * 60 * 1000) : undefined
      };

      this.apiKeys.set(keyId, apiKeyData);

      console.log(`[ProductAPIService] API key created: ${request.name} (${keyId})`);

      return {
        apiKey,
        secret,
        keyId
      };

    } catch (error) {
      console.error('[ProductAPIService] Failed to create API key:', error);
      throw error;
    }
  }

  /**
   * Validate API request and check rate limits
   */
  async validateAPIRequest(
    apiKey: string,
    endpoint: string,
    method: string,
    ipAddress: string
  ): Promise<{
    isValid: boolean;
    keyData?: APIKey;
    rateLimitInfo?: {
      remaining: number;
      resetTime: Date;
      isLimited: boolean;
    };
    error?: string;
  }> {
    try {
      // Find API key
      const keyData = Array.from(this.apiKeys.values()).find(key => key.key === apiKey);
      
      if (!keyData) {
        return {
          isValid: false,
          error: 'Invalid API key'
        };
      }

      if (!keyData.isActive) {
        return {
          isValid: false,
          error: 'API key is inactive'
        };
      }

      if (keyData.expiresAt && keyData.expiresAt < new Date()) {
        return {
          isValid: false,
          error: 'API key has expired'
        };
      }

      // Check permissions
      const hasPermission = this.checkEndpointPermission(keyData, endpoint, method);
      if (!hasPermission) {
        return {
          isValid: false,
          error: 'Insufficient permissions'
        };
      }

      // Check rate limits
      const rateLimitCheck = await this.checkRateLimit(keyData, ipAddress);
      if (rateLimitCheck.isLimited) {
        return {
          isValid: false,
          rateLimitInfo: rateLimitCheck,
          error: 'Rate limit exceeded'
        };
      }

      // Check quotas
      const quotaCheck = this.checkQuotas(keyData);
      if (!quotaCheck.isValid) {
        return {
          isValid: false,
          error: quotaCheck.error
        };
      }

      return {
        isValid: true,
        keyData,
        rateLimitInfo: rateLimitCheck
      };

    } catch (error) {
      console.error('[ProductAPIService] API validation failed:', error);
      return {
        isValid: false,
        error: 'Internal validation error'
      };
    }
  }

  /**
   * Register webhook endpoint
   */
  async registerWebhook(request: {
    apiKeyId: string;
    url: string;
    events: ProductEventTypes[];
    secret?: string;
    retryPolicy?: {
      maxRetries: number;
      backoffMultiplier: number;
      initialDelay: number;
    };
    headers?: Record<string, string>;
  }): Promise<string> {
    try {
      const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const webhook: WebhookEndpoint = {
        id: webhookId,
        apiKeyId: request.apiKeyId,
        url: request.url,
        events: request.events,
        isActive: true,
        secret: request.secret || this.generateWebhookSecret(),
        retryPolicy: request.retryPolicy || {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000
        },
        headers: request.headers,
        successCount: 0,
        failureCount: 0
      };

      this.webhooks.set(webhookId, webhook);

      console.log(`[ProductAPIService] Webhook registered: ${request.url} (${webhookId})`);

      return webhookId;

    } catch (error) {
      console.error('[ProductAPIService] Failed to register webhook:', error);
      throw error;
    }
  }

  /**
   * Process webhook delivery
   */
  async deliverWebhook(event: any): Promise<void> {
    try {
      const relevantWebhooks = Array.from(this.webhooks.values())
        .filter(webhook => 
          webhook.isActive && 
          webhook.events.includes(event.eventType)
        );

      const deliveryPromises = relevantWebhooks.map(webhook => 
        this.deliverSingleWebhook(webhook, event)
      );

      await Promise.allSettled(deliveryPromises);

    } catch (error) {
      console.error('[ProductAPIService] Webhook delivery failed:', error);
    }
  }

  /**
   * Get API analytics and usage statistics
   */
  async getAPIAnalytics(timeRange: {
    start: Date;
    end: Date;
  }): Promise<{
    overview: {
      totalRequests: number;
      successRate: number;
      avgResponseTime: number;
      topEndpoints: Array<{ endpoint: string; requests: number }>;
    };
    usage: {
      byApiKey: Array<{
        apiKeyId: string;
        keyName: string;
        requests: number;
        errors: number;
        quotaUsage: number;
      }>;
      byEndpoint: Array<{
        endpoint: string;
        requests: number;
        avgResponseTime: number;
        errorRate: number;
      }>;
    };
    performance: {
      slowestEndpoints: Array<{
        endpoint: string;
        avgResponseTime: number;
        p95ResponseTime: number;
      }>;
      errorAnalysis: Array<{
        statusCode: number;
        count: number;
        percentage: number;
      }>;
    };
    webhooks: {
      totalDeliveries: number;
      successRate: number;
      avgDeliveryTime: number;
      failureReasons: Array<{
        reason: string;
        count: number;
      }>;
    };
  }> {
    try {
      const filteredMetrics = this.apiMetrics.filter(metric => 
        metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
      );

      // Calculate overview
      const totalRequests = filteredMetrics.length;
      const successfulRequests = filteredMetrics.filter(m => m.statusCode < 400).length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = totalRequests > 0 ? 
        filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests : 0;

      // Top endpoints
      const endpointCounts = new Map<string, number>();
      filteredMetrics.forEach(metric => {
        const count = endpointCounts.get(metric.endpoint) || 0;
        endpointCounts.set(metric.endpoint, count + 1);
      });
      const topEndpoints = Array.from(endpointCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, requests]) => ({ endpoint, requests }));

      // Usage by API key
      const keyUsage = new Map<string, { requests: number; errors: number }>();
      filteredMetrics.forEach(metric => {
        const existing = keyUsage.get(metric.apiKeyId) || { requests: 0, errors: 0 };
        existing.requests++;
        if (metric.statusCode >= 400) existing.errors++;
        keyUsage.set(metric.apiKeyId, existing);
      });

      const usage = {
        byApiKey: Array.from(keyUsage.entries()).map(([apiKeyId, stats]) => {
          const keyData = this.apiKeys.get(apiKeyId);
          return {
            apiKeyId,
            keyName: keyData?.name || 'Unknown',
            requests: stats.requests,
            errors: stats.errors,
            quotaUsage: keyData ? (keyData.quotas.used.daily / keyData.quotas.daily) * 100 : 0
          };
        }),
        byEndpoint: Array.from(endpointCounts.entries()).map(([endpoint, requests]) => {
          const endpointMetrics = filteredMetrics.filter(m => m.endpoint === endpoint);
          const errors = endpointMetrics.filter(m => m.statusCode >= 400).length;
          const avgResponseTime = endpointMetrics.reduce((sum, m) => sum + m.responseTime, 0) / endpointMetrics.length;
          
          return {
            endpoint,
            requests,
            avgResponseTime: Math.round(avgResponseTime),
            errorRate: (errors / requests) * 100
          };
        })
      };

      return {
        overview: {
          totalRequests,
          successRate: Math.round(successRate * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime),
          topEndpoints
        },
        usage,
        performance: {
          slowestEndpoints: [], // TODO: Implement
          errorAnalysis: [] // TODO: Implement
        },
        webhooks: {
          totalDeliveries: 0, // TODO: Implement
          successRate: 0,
          avgDeliveryTime: 0,
          failureReasons: []
        }
      };

    } catch (error) {
      console.error('[ProductAPIService] Failed to get API analytics:', error);
      throw error;
    }
  }

  /**
   * Manage external integrations
   */
  async createIntegration(integration: {
    name: string;
    type: ExternalIntegration['type'];
    provider: string;
    configuration: ExternalIntegration['configuration'];
  }): Promise<string> {
    try {
      const integrationId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const integrationData: ExternalIntegration = {
        id: integrationId,
        name: integration.name,
        type: integration.type,
        provider: integration.provider,
        configuration: integration.configuration,
        isActive: true,
        syncStatus: 'idle'
      };

      this.integrations.set(integrationId, integrationData);

      console.log(`[ProductAPIService] Integration created: ${integration.name} (${integrationId})`);

      return integrationId;

    } catch (error) {
      console.error('[ProductAPIService] Failed to create integration:', error);
      throw error;
    }
  }

  /**
   * Execute external integration sync
   */
  async syncIntegration(integrationId: string): Promise<{
    success: boolean;
    recordsProcessed: number;
    errors: string[];
  }> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      integration.syncStatus = 'syncing';
      
      console.log(`[ProductAPIService] Starting sync for integration: ${integration.name}`);

      // Mock sync process - replace with actual integration logic
      const recordsProcessed = Math.floor(Math.random() * 1000) + 100;
      const errors: string[] = [];

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate occasional errors
      if (Math.random() < 0.1) {
        errors.push('Connection timeout during sync');
        integration.syncStatus = 'error';
      } else {
        integration.syncStatus = 'completed';
      }

      integration.lastSync = new Date();

      console.log(`[ProductAPIService] Sync completed for ${integration.name}: ${recordsProcessed} records`);

      return {
        success: errors.length === 0,
        recordsProcessed,
        errors
      };

    } catch (error) {
      console.error('[ProductAPIService] Integration sync failed:', error);
      throw error;
    }
  }

  /**
   * Private: Setup default integrations
   */
  private async setupDefaultIntegrations(): Promise<void> {
    try {
      // Marketplace integrations
      await this.createIntegration({
        name: 'Amazon Marketplace',
        type: 'marketplace',
        provider: 'amazon',
        configuration: {
          apiUrl: 'https://mws.amazonservices.com',
          authentication: {
            type: 'mws',
            sellerId: process.env.AMAZON_SELLER_ID || '',
            accessKey: process.env.AMAZON_ACCESS_KEY || ''
          },
          syncFrequency: 3600, // 1 hour
          dataMapping: {
            'product.name': 'title',
            'product.price': 'price',
            'product.inventory': 'quantity'
          }
        }
      });

      // POS integration
      await this.createIntegration({
        name: 'Square POS',
        type: 'pos',
        provider: 'square',
        configuration: {
          apiUrl: 'https://connect.squareup.com/v2',
          authentication: {
            type: 'oauth',
            accessToken: process.env.SQUARE_ACCESS_TOKEN || ''
          },
          syncFrequency: 1800, // 30 minutes
          dataMapping: {
            'product.name': 'name',
            'product.price': 'base_price_money.amount'
          }
        }
      });

      // Analytics integration
      await this.createIntegration({
        name: 'Google Analytics',
        type: 'analytics',
        provider: 'google',
        configuration: {
          apiUrl: 'https://analyticsreporting.googleapis.com/v4',
          authentication: {
            type: 'service_account',
            credentials: process.env.GOOGLE_ANALYTICS_CREDENTIALS || '{}'
          },
          syncFrequency: 7200, // 2 hours
          dataMapping: {
            'product.views': 'ga:productDetailViews',
            'product.conversions': 'ga:productAddToCart'
          }
        }
      });

    } catch (error) {
      console.error('[ProductAPIService] Failed to setup default integrations:', error);
    }
  }

  /**
   * Private: Helper methods
   */
  private generateSecureSecret(): string {
    return `sec_${Math.random().toString(36).substr(2, 32)}`;
  }

  private generateWebhookSecret(): string {
    return `whsec_${Math.random().toString(36).substr(2, 24)}`;
  }

  private checkEndpointPermission(keyData: APIKey, endpoint: string, method: string): boolean {
    // Simplified permission checking - implement proper RBAC
    const resource = this.extractResourceFromEndpoint(endpoint);
    const action = this.mapMethodToAction(method);
    
    return keyData.permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  private extractResourceFromEndpoint(endpoint: string): string {
    if (endpoint.includes('/products')) return 'products';
    if (endpoint.includes('/categories')) return 'categories';
    if (endpoint.includes('/inventory')) return 'inventory';
    if (endpoint.includes('/analytics')) return 'analytics';
    return 'products'; // default
  }

  private mapMethodToAction(method: string): 'read' | 'write' | 'delete' | 'admin' {
    switch (method.toUpperCase()) {
      case 'GET': return 'read';
      case 'POST': case 'PUT': case 'PATCH': return 'write';
      case 'DELETE': return 'delete';
      default: return 'read';
    }
  }

  private async checkRateLimit(keyData: APIKey, ipAddress: string): Promise<RateLimitStatus> {
    const rateLimitKey = `${keyData.id}_${ipAddress}`;
    const existing = this.rateLimits.get(rateLimitKey);
    const now = new Date();

    if (!existing || (now.getTime() - existing.windowStart.getTime()) >= (keyData.rateLimit.window * 1000)) {
      // New window
      const newStatus: RateLimitStatus = {
        apiKeyId: keyData.id,
        requests: 1,
        windowStart: now,
        burstTokens: keyData.rateLimit.burst - 1,
        isLimited: false,
        resetTime: new Date(now.getTime() + keyData.rateLimit.window * 1000)
      };
      this.rateLimits.set(rateLimitKey, newStatus);
      return newStatus;
    }

    // Existing window
    existing.requests++;
    
    if (existing.requests > keyData.rateLimit.requests) {
      existing.isLimited = true;
    }

    return existing;
  }

  private checkQuotas(keyData: APIKey): { isValid: boolean; error?: string } {
    if (keyData.quotas.used.daily >= keyData.quotas.daily) {
      return { isValid: false, error: 'Daily quota exceeded' };
    }
    
    if (keyData.quotas.used.monthly >= keyData.quotas.monthly) {
      return { isValid: false, error: 'Monthly quota exceeded' };
    }

    return { isValid: true };
  }

  private async deliverSingleWebhook(webhook: WebhookEndpoint, event: any): Promise<void> {
    try {
      // Mock webhook delivery - replace with actual HTTP request
      console.log(`[ProductAPIService] Delivering webhook to ${webhook.url}:`, event.eventType);
      
      // Simulate delivery delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      
      // Simulate occasional failures
      if (Math.random() < 0.05) {
        webhook.failureCount++;
        throw new Error('Webhook delivery failed');
      }

      webhook.successCount++;
      webhook.lastTriggered = new Date();

    } catch (error) {
      console.error(`[ProductAPIService] Webhook delivery failed for ${webhook.url}:`, error);
      webhook.failureCount++;
    }
  }

  private startWebhookProcessing(): void {
    // Listen for product events and deliver webhooks
    productEventStreamingService.on('productEvent', async (event) => {
      await this.deliverWebhook(event);
    });
  }

  private setupRateLimitCleanup(): void {
    // Clean up expired rate limit entries every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [key, rateLimitStatus] of this.rateLimits.entries()) {
        if (now > rateLimitStatus.resetTime) {
          this.rateLimits.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  private setupAPIMonitoring(): void {
    // Setup API metrics collection
    this.on('apiRequest', (metrics: APIMetrics) => {
      this.apiMetrics.push(metrics);
      
      // Keep only last 10000 metrics entries
      if (this.apiMetrics.length > 10000) {
        this.apiMetrics = this.apiMetrics.slice(-10000);
      }
    });
  }

  /**
   * Shutdown API service
   */
  async shutdown(): Promise<void> {
    console.log('[ProductAPIService] Shutting down...');
    
    this.isProcessing = false;
    this.removeAllListeners();
    
    console.log('[ProductAPIService] Shutdown completed');
  }
}

// Singleton instance
export const productAPIService = new ProductAPIService();