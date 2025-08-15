/**
 * Instant Settlement Service - Amazon.com/Shopee.sg Level
 * T+0 settlement processing with multi-provider routing
 * Real-time liquidity management and settlement reconciliation
 */

import { EventEmitter } from 'events';
import { db } from '../../../db';
import { paymentSettlements, settlementBatches, vendorPayouts } from '@shared/schema';
import { eq, and, gte, lte, sum, desc } from 'drizzle-orm';
import { eventStreamingService, PaymentEventTypes, PaymentStreams } from './EventStreamingService';

interface SettlementRequest {
  settlementId?: string;
  transactionId: string;
  orderId: string;
  vendorId: number;
  amount: number;
  currency: string;
  settlementType: 'instant' | 'standard' | 'express';
  priority: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

interface SettlementProvider {
  providerId: string;
  providerName: string;
  supportedCurrencies: string[];
  maxAmount: number;
  processingFee: number;
  processingTime: number; // minutes
  isActive: boolean;
  reliability: number; // 0-1
  liquidity: number; // available balance
}

interface SettlementRoute {
  routeId: string;
  primaryProvider: SettlementProvider;
  fallbackProviders: SettlementProvider[];
  currency: string;
  amountRange: { min: number; max: number };
  estimatedTime: number; // minutes
  totalFee: number;
}

interface LiquidityPool {
  currency: string;
  totalLiquidity: number;
  availableLiquidity: number;
  reservedLiquidity: number;
  minimumReserve: number;
  lastUpdated: Date;
}

export class InstantSettlementService extends EventEmitter {
  private providers: Map<string, SettlementProvider> = new Map();
  private liquidityPools: Map<string, LiquidityPool> = new Map();
  private settlementQueue: SettlementRequest[] = [];
  private isProcessing: boolean = false;
  private settlementRoutes: Map<string, SettlementRoute[]> = new Map();

  constructor() {
    super();
    this.setupSettlementProviders();
    this.initializeLiquidityPools();
  }

  /**
   * Initialize the settlement service
   */
  async initialize(): Promise<void> {
    console.log('[InstantSettlementService] Initializing...');
    
    // Load pending settlements
    await this.loadPendingSettlements();
    
    // Start settlement processing
    this.startSettlementProcessing();
    
    // Start liquidity monitoring
    this.startLiquidityMonitoring();
    
    console.log('[InstantSettlementService] Initialized successfully');
  }

  /**
   * Request instant settlement
   */
  async requestSettlement(request: SettlementRequest): Promise<{
    settlementId: string;
    estimatedCompletionTime: Date;
    route: SettlementRoute;
    status: string;
  }> {
    
    const settlementId = request.settlementId || `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Find optimal settlement route
    const route = await this.findOptimalRoute(request);
    if (!route) {
      throw new Error('No suitable settlement route available');
    }

    // Check liquidity availability
    const liquidityCheck = await this.checkLiquidity(request.currency, request.amount);
    if (!liquidityCheck.available) {
      throw new Error(`Insufficient liquidity for ${request.currency}: ${liquidityCheck.reason}`);
    }

    // Reserve liquidity
    await this.reserveLiquidity(request.currency, request.amount);

    // Create settlement record
    await db.insert(paymentSettlements).values({
      settlementId,
      transactionId: request.transactionId,
      orderId: request.orderId,
      vendorId: request.vendorId,
      amount: request.amount.toString(),
      currency: request.currency,
      status: 'pending',
      settlementType: request.settlementType,
      priority: request.priority,
      providerId: route.primaryProvider.providerId,
      providerFee: route.totalFee.toString(),
      estimatedCompletionTime: new Date(Date.now() + route.estimatedTime * 60 * 1000),
      metadata: request.metadata || {},
      routeInfo: {
        routeId: route.routeId,
        primaryProvider: route.primaryProvider.providerId,
        fallbackProviders: route.fallbackProviders.map(p => p.providerId)
      }
    });

    // Add to processing queue
    const settlementRequest: SettlementRequest = {
      ...request,
      settlementId
    };
    
    this.addToQueue(settlementRequest);

    // Publish settlement requested event
    await eventStreamingService.publishEvent({
      eventType: PaymentEventTypes.SETTLEMENT_INITIATED,
      streamName: PaymentStreams.SETTLEMENTS,
      aggregateId: settlementId,
      eventData: {
        settlementId,
        transactionId: request.transactionId,
        orderId: request.orderId,
        vendorId: request.vendorId,
        amount: request.amount,
        currency: request.currency,
        settlementType: request.settlementType,
        estimatedTime: route.estimatedTime
      }
    });

    return {
      settlementId,
      estimatedCompletionTime: new Date(Date.now() + route.estimatedTime * 60 * 1000),
      route,
      status: 'queued'
    };
  }

  /**
   * Get settlement status
   */
  async getSettlementStatus(settlementId: string): Promise<any> {
    try {
      const [settlement] = await db.select()
        .from(paymentSettlements)
        .where(eq(paymentSettlements.settlementId, settlementId));

      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      return {
        settlementId: settlement.settlementId,
        status: settlement.status,
        amount: parseFloat(settlement.amount),
        currency: settlement.currency,
        providerId: settlement.providerId,
        estimatedCompletionTime: settlement.estimatedCompletionTime,
        actualCompletionTime: settlement.completedAt,
        fee: parseFloat(settlement.providerFee || '0'),
        metadata: settlement.metadata,
        routeInfo: settlement.routeInfo
      };
    } catch (error) {
      console.error(`[InstantSettlementService] Error getting status for ${settlementId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel settlement
   */
  async cancelSettlement(settlementId: string, reason: string): Promise<void> {
    try {
      const [settlement] = await db.select()
        .from(paymentSettlements)
        .where(eq(paymentSettlements.settlementId, settlementId));

      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      if (['completed', 'failed'].includes(settlement.status)) {
        throw new Error(`Cannot cancel ${settlement.status} settlement`);
      }

      // Update settlement status
      await db.update(paymentSettlements)
        .set({
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(paymentSettlements.settlementId, settlementId));

      // Release reserved liquidity
      await this.releaseLiquidity(settlement.currency, parseFloat(settlement.amount));

      // Remove from queue
      this.removeFromQueue(settlementId);

      console.log(`[InstantSettlementService] Settlement ${settlementId} cancelled: ${reason}`);
    } catch (error) {
      console.error(`[InstantSettlementService] Error cancelling settlement ${settlementId}:`, error);
      throw error;
    }
  }

  /**
   * Get liquidity status
   */
  async getLiquidityStatus(): Promise<LiquidityPool[]> {
    return Array.from(this.liquidityPools.values());
  }

  /**
   * Add liquidity to pool
   */
  async addLiquidity(currency: string, amount: number): Promise<void> {
    const pool = this.liquidityPools.get(currency);
    if (!pool) {
      throw new Error(`No liquidity pool for currency ${currency}`);
    }

    pool.totalLiquidity += amount;
    pool.availableLiquidity += amount;
    pool.lastUpdated = new Date();

    console.log(`[InstantSettlementService] Added ${amount} ${currency} to liquidity pool`);
  }

  /**
   * Private: Setup settlement providers
   */
  private setupSettlementProviders(): void {
    // Bangladesh mobile banking providers
    this.providers.set('bkash_settlement', {
      providerId: 'bkash_settlement',
      providerName: 'bKash Settlement',
      supportedCurrencies: ['BDT'],
      maxAmount: 500000,
      processingFee: 15,
      processingTime: 5, // 5 minutes
      isActive: true,
      reliability: 0.95,
      liquidity: 10000000
    });

    this.providers.set('nagad_settlement', {
      providerId: 'nagad_settlement',
      providerName: 'Nagad Settlement',
      supportedCurrencies: ['BDT'],
      maxAmount: 500000,
      processingFee: 12,
      processingTime: 3, // 3 minutes
      isActive: true,
      reliability: 0.93,
      liquidity: 8000000
    });

    this.providers.set('rocket_settlement', {
      providerId: 'rocket_settlement',
      providerName: 'Rocket Settlement',
      supportedCurrencies: ['BDT'],
      maxAmount: 300000,
      processingFee: 18,
      processingTime: 7, // 7 minutes
      isActive: true,
      reliability: 0.91,
      liquidity: 5000000
    });

    // Bank settlement providers
    this.providers.set('bank_transfer_bd', {
      providerId: 'bank_transfer_bd',
      providerName: 'Bangladesh Bank Transfer',
      supportedCurrencies: ['BDT'],
      maxAmount: 10000000,
      processingFee: 50,
      processingTime: 30, // 30 minutes
      isActive: true,
      reliability: 0.98,
      liquidity: 50000000
    });

    // International providers
    this.providers.set('stripe_settlements', {
      providerId: 'stripe_settlements',
      providerName: 'Stripe Settlements',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      maxAmount: 1000000,
      processingFee: 25,
      processingTime: 15, // 15 minutes
      isActive: true,
      reliability: 0.99,
      liquidity: 100000000
    });

    console.log(`[InstantSettlementService] Loaded ${this.providers.size} settlement providers`);
  }

  /**
   * Private: Initialize liquidity pools
   */
  private initializeLiquidityPools(): void {
    const currencies = ['BDT', 'USD', 'EUR', 'GBP'];
    
    for (const currency of currencies) {
      this.liquidityPools.set(currency, {
        currency,
        totalLiquidity: 10000000, // Initial liquidity
        availableLiquidity: 9000000,
        reservedLiquidity: 1000000,
        minimumReserve: 500000,
        lastUpdated: new Date()
      });
    }

    console.log(`[InstantSettlementService] Initialized liquidity pools for ${currencies.length} currencies`);
  }

  /**
   * Private: Find optimal settlement route
   */
  private async findOptimalRoute(request: SettlementRequest): Promise<SettlementRoute | null> {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => 
        provider.isActive &&
        provider.supportedCurrencies.includes(request.currency) &&
        provider.maxAmount >= request.amount &&
        provider.liquidity >= request.amount
      )
      .sort((a, b) => {
        // Sort by processing time, then reliability, then fee
        if (request.priority === 'high') {
          return a.processingTime - b.processingTime;
        } else {
          return a.processingFee - b.processingFee;
        }
      });

    if (availableProviders.length === 0) {
      return null;
    }

    const primaryProvider = availableProviders[0];
    const fallbackProviders = availableProviders.slice(1, 3); // Up to 2 fallbacks

    const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    return {
      routeId,
      primaryProvider,
      fallbackProviders,
      currency: request.currency,
      amountRange: { min: 0, max: primaryProvider.maxAmount },
      estimatedTime: primaryProvider.processingTime,
      totalFee: primaryProvider.processingFee
    };
  }

  /**
   * Private: Check liquidity availability
   */
  private async checkLiquidity(currency: string, amount: number): Promise<{
    available: boolean;
    reason?: string;
  }> {
    const pool = this.liquidityPools.get(currency);
    if (!pool) {
      return { available: false, reason: `No liquidity pool for ${currency}` };
    }

    if (pool.availableLiquidity < amount) {
      return { 
        available: false, 
        reason: `Insufficient liquidity: ${pool.availableLiquidity} < ${amount}` 
      };
    }

    if (pool.availableLiquidity - amount < pool.minimumReserve) {
      return { 
        available: false, 
        reason: `Would breach minimum reserve requirement` 
      };
    }

    return { available: true };
  }

  /**
   * Private: Reserve liquidity
   */
  private async reserveLiquidity(currency: string, amount: number): Promise<void> {
    const pool = this.liquidityPools.get(currency);
    if (!pool) {
      throw new Error(`No liquidity pool for ${currency}`);
    }

    pool.availableLiquidity -= amount;
    pool.reservedLiquidity += amount;
    pool.lastUpdated = new Date();
  }

  /**
   * Private: Release liquidity
   */
  private async releaseLiquidity(currency: string, amount: number): Promise<void> {
    const pool = this.liquidityPools.get(currency);
    if (!pool) {
      throw new Error(`No liquidity pool for ${currency}`);
    }

    pool.availableLiquidity += amount;
    pool.reservedLiquidity -= amount;
    pool.lastUpdated = new Date();
  }

  /**
   * Private: Add to processing queue
   */
  private addToQueue(request: SettlementRequest): void {
    // Insert based on priority
    if (request.priority === 'high') {
      this.settlementQueue.unshift(request);
    } else if (request.priority === 'medium') {
      const midpoint = Math.floor(this.settlementQueue.length / 2);
      this.settlementQueue.splice(midpoint, 0, request);
    } else {
      this.settlementQueue.push(request);
    }
  }

  /**
   * Private: Remove from queue
   */
  private removeFromQueue(settlementId: string): void {
    const index = this.settlementQueue.findIndex(req => req.settlementId === settlementId);
    if (index !== -1) {
      this.settlementQueue.splice(index, 1);
    }
  }

  /**
   * Private: Start settlement processing loop
   */
  private async startSettlementProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.isProcessing) {
      try {
        if (this.settlementQueue.length > 0) {
          const request = this.settlementQueue.shift();
          if (request) {
            await this.processSettlement(request);
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait if queue is empty
        }
      } catch (error) {
        console.error('[InstantSettlementService] Error in processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer on error
      }
    }
  }

  /**
   * Private: Process individual settlement
   */
  private async processSettlement(request: SettlementRequest): Promise<void> {
    if (!request.settlementId) return;

    console.log(`[InstantSettlementService] Processing settlement ${request.settlementId}`);

    try {
      // Update status to processing
      await db.update(paymentSettlements)
        .set({
          status: 'processing',
          processingStartedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(paymentSettlements.settlementId, request.settlementId));

      // Simulate settlement processing (in production, this would be actual provider API calls)
      const processingTime = 2000 + Math.random() * 3000; // 2-5 seconds
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Simulate success/failure (95% success rate)
      const isSuccessful = Math.random() > 0.05;

      if (isSuccessful) {
        // Update status to completed
        await db.update(paymentSettlements)
          .set({
            status: 'completed',
            completedAt: new Date(),
            actualProcessingTime: Math.round(processingTime / 1000),
            updatedAt: new Date()
          })
          .where(eq(paymentSettlements.settlementId, request.settlementId));

        // Convert reserved liquidity to settled
        await this.releaseLiquidity(request.currency, request.amount);
        
        // Publish settlement completed event
        await eventStreamingService.publishEvent({
          eventType: PaymentEventTypes.SETTLEMENT_COMPLETED,
          streamName: PaymentStreams.SETTLEMENTS,
          aggregateId: request.settlementId,
          eventData: {
            settlementId: request.settlementId,
            transactionId: request.transactionId,
            orderId: request.orderId,
            vendorId: request.vendorId,
            amount: request.amount,
            currency: request.currency,
            completedAt: new Date(),
            processingTime: Math.round(processingTime / 1000)
          }
        });

        console.log(`[InstantSettlementService] Settlement ${request.settlementId} completed successfully`);

      } else {
        // Handle failure
        await db.update(paymentSettlements)
          .set({
            status: 'failed',
            failedAt: new Date(),
            failureReason: 'Provider processing error',
            updatedAt: new Date()
          })
          .where(eq(paymentSettlements.settlementId, request.settlementId));

        // Release reserved liquidity
        await this.releaseLiquidity(request.currency, request.amount);

        console.log(`[InstantSettlementService] Settlement ${request.settlementId} failed`);
      }

    } catch (error) {
      console.error(`[InstantSettlementService] Error processing settlement ${request.settlementId}:`, error);
      
      // Update status to failed
      await db.update(paymentSettlements)
        .set({
          status: 'failed',
          failedAt: new Date(),
          failureReason: error.message,
          updatedAt: new Date()
        })
        .where(eq(paymentSettlements.settlementId, request.settlementId!));

      // Release reserved liquidity
      await this.releaseLiquidity(request.currency, request.amount);
    }
  }

  /**
   * Private: Start liquidity monitoring
   */
  private startLiquidityMonitoring(): void {
    setInterval(() => {
      for (const [currency, pool] of this.liquidityPools) {
        const utilizationRate = (pool.totalLiquidity - pool.availableLiquidity) / pool.totalLiquidity;
        
        if (utilizationRate > 0.8) {
          console.warn(`[InstantSettlementService] High liquidity utilization for ${currency}: ${(utilizationRate * 100).toFixed(1)}%`);
        }
        
        if (pool.availableLiquidity < pool.minimumReserve * 2) {
          console.warn(`[InstantSettlementService] Low liquidity for ${currency}: ${pool.availableLiquidity}`);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Private: Load pending settlements
   */
  private async loadPendingSettlements(): Promise<void> {
    try {
      const pendingSettlements = await db.select()
        .from(paymentSettlements)
        .where(and(
          eq(paymentSettlements.status, 'pending'),
          eq(paymentSettlements.status, 'processing')
        ));

      for (const settlement of pendingSettlements) {
        const request: SettlementRequest = {
          settlementId: settlement.settlementId,
          transactionId: settlement.transactionId,
          orderId: settlement.orderId,
          vendorId: settlement.vendorId,
          amount: parseFloat(settlement.amount),
          currency: settlement.currency,
          settlementType: settlement.settlementType as any,
          priority: settlement.priority as any,
          metadata: settlement.metadata as Record<string, any>
        };

        this.addToQueue(request);
      }

      console.log(`[InstantSettlementService] Loaded ${pendingSettlements.length} pending settlements`);
    } catch (error) {
      console.error('[InstantSettlementService] Failed to load pending settlements:', error);
    }
  }

  /**
   * Get settlement analytics
   */
  async getSettlementAnalytics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<any> {
    const timeframeHours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
    const startTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);

    try {
      const analytics = await db.select({
        totalSettlements: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(cast(amount as decimal))`,
        avgProcessingTime: sql<number>`avg(actual_processing_time)`,
        successRate: sql<number>`(count(case when status = 'completed' then 1 end) * 100.0 / count(*))`
      })
      .from(paymentSettlements)
      .where(gte(paymentSettlements.createdAt, startTime));

      const [stats] = analytics;

      return {
        timeframe,
        totalSettlements: parseInt(stats.totalSettlements.toString()),
        totalAmount: parseFloat(stats.totalAmount?.toString() || '0'),
        averageProcessingTime: parseFloat(stats.avgProcessingTime?.toString() || '0'),
        successRate: parseFloat(stats.successRate?.toString() || '0'),
        liquidityStatus: this.getLiquidityStatus(),
        queueLength: this.settlementQueue.length
      };
    } catch (error) {
      console.error('[InstantSettlementService] Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Shutdown the settlement service
   */
  async shutdown(): Promise<void> {
    console.log('[InstantSettlementService] Shutting down...');
    this.isProcessing = false;
    this.settlementQueue = [];
  }
}

// Singleton instance
export const instantSettlementService = new InstantSettlementService();