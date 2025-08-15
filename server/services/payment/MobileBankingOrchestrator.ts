/**
 * Mobile Banking Orchestrator - Phase 2 Week 5-6
 * Unified orchestration service for bKash, Nagad, and Rocket payments
 * Investment: $55,000 Enhanced Implementation
 */

import { EventEmitter } from 'events';
import BKashPaymentService, { BKashTransaction, BKashErrorCode } from './BKashPaymentService';
import NagadPaymentService, { NagadTransaction } from './NagadPaymentService';
import RocketPaymentService, { RocketTransaction } from './RocketPaymentService';

export type PaymentProvider = 'bkash' | 'nagad' | 'rocket';

export interface UnifiedTransaction {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  customerMsisdn: string;
  merchantInvoiceNumber: string;
  fallbackOrder?: PaymentProvider[];
  metadata?: any;
}

export interface PaymentResult {
  success: boolean;
  provider: PaymentProvider;
  transactionId?: string;
  fallbackUsed?: boolean;
  fallbackProvider?: PaymentProvider;
  error?: BKashErrorCode;
  offlineQueued?: boolean;
  requiresPin?: boolean;
  processingTime: number;
  fees?: number;
  cashback?: number;
}

export interface ProviderHealth {
  provider: PaymentProvider;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  successRate: number;
  errorRate: number;
  lastChecked: Date;
}

export interface FallbackStrategy {
  enabled: boolean;
  order: PaymentProvider[];
  conditions: {
    maxRetries: number;
    timeoutThreshold: number;
    errorCodes: string[];
  };
}

export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageProcessingTime: number;
  providerDistribution: { [key in PaymentProvider]: number };
  fallbackUsageRate: number;
  offlineQueueSize: number;
}

export class MobileBankingOrchestrator extends EventEmitter {
  private bkashService: BKashPaymentService;
  private nagadService: NagadPaymentService;
  private rocketService: RocketPaymentService;
  
  private providerHealth: Map<PaymentProvider, ProviderHealth> = new Map();
  private fallbackStrategy: FallbackStrategy;
  private analytics: PaymentAnalytics;
  private rateLimiter: Map<string, number> = new Map();
  private loadBalancer: Map<PaymentProvider, number> = new Map();
  
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute
  private readonly ANALYTICS_INTERVAL = 300000; // 5 minutes
  private readonly RATE_LIMIT_PER_MINUTE = 200;

  constructor() {
    super();
    this.initializeServices();
    this.initializeFallbackStrategy();
    this.initializeAnalytics();
    this.startHealthMonitoring();
    this.startLoadBalancing();
  }

  /**
   * Unified payment processing with intelligent routing
   */
  async processPayment(transaction: UnifiedTransaction): Promise<PaymentResult> {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      if (!this.checkRateLimit(transaction.customerMsisdn)) {
        return {
          success: false,
          provider: transaction.provider,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryable: true,
            fallbackRequired: false
          },
          processingTime: Date.now() - startTime
        };
      }

      // Intelligent provider selection
      const selectedProvider = await this.selectOptimalProvider(transaction);
      
      // Process payment with selected provider
      let result = await this.processWithProvider(selectedProvider, transaction);
      
      // Handle fallback if needed
      if (!result.success && this.shouldFallback(result.error)) {
        result = await this.handleFallback(transaction, selectedProvider, result);
      }

      // Update analytics
      this.updateAnalytics(result);
      
      // Calculate final processing time
      result.processingTime = Date.now() - startTime;
      
      return result;

    } catch (error) {
      return {
        success: false,
        provider: transaction.provider,
        error: {
          code: 'ORCHESTRATOR_ERROR',
          message: 'Payment orchestration failed',
          retryable: false,
          fallbackRequired: false
        },
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Intelligent provider selection based on health and load
   */
  private async selectOptimalProvider(transaction: UnifiedTransaction): Promise<PaymentProvider> {
    // If specific provider requested and healthy, use it
    if (transaction.provider) {
      const health = this.providerHealth.get(transaction.provider);
      if (health && health.status === 'healthy') {
        return transaction.provider;
      }
    }

    // Select based on health, load, and performance
    const providers: PaymentProvider[] = ['bkash', 'nagad', 'rocket'];
    const scores = new Map<PaymentProvider, number>();

    for (const provider of providers) {
      const health = this.providerHealth.get(provider);
      if (!health || health.status === 'unhealthy') {
        scores.set(provider, 0);
        continue;
      }

      let score = 100;
      
      // Health score (40% weight)
      if (health.status === 'healthy') {
        score += 40;
      } else if (health.status === 'degraded') {
        score += 20;
      }

      // Performance score (30% weight)
      const responseTimeScore = Math.max(0, 30 - (health.responseTime / 1000) * 10);
      score += responseTimeScore;

      // Success rate score (20% weight)
      score += health.successRate * 20;

      // Load balancing score (10% weight)
      const currentLoad = this.loadBalancer.get(provider) || 0;
      const loadScore = Math.max(0, 10 - (currentLoad / 100) * 10);
      score += loadScore;

      scores.set(provider, score);
    }

    // Select provider with highest score
    let bestProvider: PaymentProvider = 'bkash';
    let bestScore = 0;

    scores.forEach((score, provider) => {
      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    });

    return bestProvider;
  }

  /**
   * Process payment with specific provider
   */
  private async processWithProvider(
    provider: PaymentProvider,
    transaction: UnifiedTransaction
  ): Promise<PaymentResult> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (provider) {
        case 'bkash':
          const bkashTransaction: BKashTransaction = {
            id: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            customerMsisdn: transaction.customerMsisdn,
            merchantInvoiceNumber: transaction.merchantInvoiceNumber,
            status: 'pending',
            timestamp: new Date(),
            retryCount: 0,
            riskScore: 0,
            deviceFingerprint: transaction.metadata?.deviceFingerprint || 'unknown'
          };
          result = await this.bkashService.processPayment(bkashTransaction);
          break;

        case 'nagad':
          const nagadTransaction: NagadTransaction = {
            id: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            customerMsisdn: transaction.customerMsisdn,
            merchantInvoiceNumber: transaction.merchantInvoiceNumber,
            status: 'pending',
            timestamp: new Date(),
            retryCount: 0,
            riskScore: 0,
            deviceFingerprint: transaction.metadata?.deviceFingerprint || 'unknown',
            nagadSpecificFields: transaction.metadata?.nagadSpecificFields
          };
          result = await this.nagadService.processPayment(nagadTransaction);
          break;

        case 'rocket':
          const rocketTransaction: RocketTransaction = {
            id: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            customerMsisdn: transaction.customerMsisdn,
            merchantInvoiceNumber: transaction.merchantInvoiceNumber,
            status: 'pending',
            timestamp: new Date(),
            retryCount: 0,
            riskScore: 0,
            deviceFingerprint: transaction.metadata?.deviceFingerprint || 'unknown',
            rocketSpecificFields: transaction.metadata?.rocketSpecificFields
          };
          result = await this.rocketService.processPayment(rocketTransaction);
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Update load balancer
      this.updateLoadBalancer(provider);

      return {
        success: result.success,
        provider,
        transactionId: result.transactionId,
        error: result.error,
        offlineQueued: result.offlineQueued,
        requiresPin: result.requiresPin,
        processingTime: Date.now() - startTime,
        fees: result.nagadResponse?.fees || result.rocketResponse?.fees,
        cashback: result.rocketResponse?.cashbackAmount
      };

    } catch (error) {
      return {
        success: false,
        provider,
        error: {
          code: 'PROVIDER_ERROR',
          message: `${provider} processing failed`,
          retryable: true,
          fallbackRequired: true
        },
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Handle fallback to alternative providers
   */
  private async handleFallback(
    transaction: UnifiedTransaction,
    originalProvider: PaymentProvider,
    originalResult: PaymentResult
  ): Promise<PaymentResult> {
    if (!this.fallbackStrategy.enabled) {
      return originalResult;
    }

    const fallbackOrder = transaction.fallbackOrder || this.fallbackStrategy.order;
    const availableProviders = fallbackOrder.filter(p => p !== originalProvider);

    for (const provider of availableProviders) {
      const health = this.providerHealth.get(provider);
      if (!health || health.status === 'unhealthy') {
        continue;
      }

      try {
        const fallbackResult = await this.processWithProvider(provider, transaction);
        
        if (fallbackResult.success) {
          fallbackResult.fallbackUsed = true;
          fallbackResult.fallbackProvider = provider;
          
          this.emit('fallback_success', {
            originalProvider,
            fallbackProvider: provider,
            transaction,
            result: fallbackResult
          });
          
          return fallbackResult;
        }
      } catch (error) {
        this.emit('fallback_error', {
          provider,
          error,
          transaction
        });
      }
    }

    // All fallback attempts failed
    this.emit('fallback_exhausted', {
      originalProvider,
      transaction,
      originalResult
    });

    return originalResult;
  }

  /**
   * Health monitoring for all providers
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      await this.checkProviderHealth();
    }, this.HEALTH_CHECK_INTERVAL);

    // Initial health check
    this.checkProviderHealth();
  }

  /**
   * Check health of all providers
   */
  private async checkProviderHealth(): Promise<void> {
    const providers: PaymentProvider[] = ['bkash', 'nagad', 'rocket'];
    
    for (const provider of providers) {
      const startTime = Date.now();
      
      try {
        const health = await this.performHealthCheck(provider);
        const responseTime = Date.now() - startTime;
        
        const healthStatus: ProviderHealth = {
          provider,
          status: health.healthy ? 'healthy' : 'degraded',
          responseTime,
          successRate: health.successRate,
          errorRate: health.errorRate,
          lastChecked: new Date()
        };

        this.providerHealth.set(provider, healthStatus);
        
        // Emit health change events
        this.emit('provider_health_changed', healthStatus);
        
      } catch (error) {
        const healthStatus: ProviderHealth = {
          provider,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          successRate: 0,
          errorRate: 100,
          lastChecked: new Date()
        };

        this.providerHealth.set(provider, healthStatus);
        this.emit('provider_unhealthy', { provider, error });
      }
    }
  }

  /**
   * Perform health check for specific provider
   */
  private async performHealthCheck(provider: PaymentProvider): Promise<{
    healthy: boolean;
    successRate: number;
    errorRate: number;
  }> {
    // Simulate health check
    const healthy = Math.random() > 0.05; // 95% uptime
    const successRate = healthy ? Math.random() * 20 + 80 : Math.random() * 50; // 80-100% or 0-50%
    const errorRate = 100 - successRate;

    return {
      healthy,
      successRate,
      errorRate
    };
  }

  /**
   * Load balancing management
   */
  private startLoadBalancing(): void {
    setInterval(() => {
      // Reset load balancer counters
      this.loadBalancer.clear();
    }, 60000); // Reset every minute
  }

  /**
   * Update load balancer
   */
  private updateLoadBalancer(provider: PaymentProvider): void {
    const currentLoad = this.loadBalancer.get(provider) || 0;
    this.loadBalancer.set(provider, currentLoad + 1);
  }

  /**
   * Analytics tracking
   */
  private initializeAnalytics(): void {
    this.analytics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      averageProcessingTime: 0,
      providerDistribution: {
        bkash: 0,
        nagad: 0,
        rocket: 0
      },
      fallbackUsageRate: 0,
      offlineQueueSize: 0
    };

    // Update analytics periodically
    setInterval(() => {
      this.updateOfflineQueueSize();
      this.emit('analytics_updated', this.analytics);
    }, this.ANALYTICS_INTERVAL);
  }

  /**
   * Update analytics with transaction result
   */
  private updateAnalytics(result: PaymentResult): void {
    this.analytics.totalTransactions++;
    
    if (result.success) {
      this.analytics.successfulTransactions++;
    } else {
      this.analytics.failedTransactions++;
    }

    // Update provider distribution
    this.analytics.providerDistribution[result.provider]++;

    // Update fallback usage rate
    if (result.fallbackUsed) {
      this.analytics.fallbackUsageRate = 
        (this.analytics.fallbackUsageRate * (this.analytics.totalTransactions - 1) + 1) / 
        this.analytics.totalTransactions;
    }

    // Update average processing time
    this.analytics.averageProcessingTime = 
      (this.analytics.averageProcessingTime * (this.analytics.totalTransactions - 1) + result.processingTime) / 
      this.analytics.totalTransactions;
  }

  /**
   * Update offline queue size
   */
  private updateOfflineQueueSize(): void {
    this.analytics.offlineQueueSize = 
      this.bkashService.offlineQueueLength + 
      this.nagadService.offlineQueueLength + 
      this.rocketService.offlineQueueLength;
  }

  /**
   * Helper methods
   */
  private initializeServices(): void {
    this.bkashService = new BKashPaymentService();
    this.nagadService = new NagadPaymentService();
    this.rocketService = new RocketPaymentService();

    // Forward events from individual services
    this.bkashService.on('fallback_required', (transaction, error) => {
      this.emit('provider_fallback_required', { provider: 'bkash', transaction, error });
    });

    this.nagadService.on('balance_synced', (customerMsisdn, balance) => {
      this.emit('balance_synced', { provider: 'nagad', customerMsisdn, balance });
    });

    this.rocketService.on('cashback_earned', (cashbackRecord) => {
      this.emit('cashback_earned', { provider: 'rocket', cashbackRecord });
    });
  }

  private initializeFallbackStrategy(): void {
    this.fallbackStrategy = {
      enabled: true,
      order: ['bkash', 'nagad', 'rocket'],
      conditions: {
        maxRetries: 3,
        timeoutThreshold: 30000,
        errorCodes: [
          'TIMEOUT',
          'NETWORK_ERROR',
          'RATE_LIMIT_EXCEEDED',
          'TEMPORARY_UNAVAILABLE'
        ]
      }
    };
  }

  private checkRateLimit(customerMsisdn: string): boolean {
    const current = this.rateLimiter.get(customerMsisdn) || 0;
    if (current >= this.RATE_LIMIT_PER_MINUTE) {
      return false;
    }
    this.rateLimiter.set(customerMsisdn, current + 1);
    return true;
  }

  private shouldFallback(error?: BKashErrorCode): boolean {
    if (!error || !this.fallbackStrategy.enabled) {
      return false;
    }

    return error.fallbackRequired || 
           this.fallbackStrategy.conditions.errorCodes.includes(error.code);
  }

  /**
   * Public API methods
   */
  async getProviderHealth(): Promise<ProviderHealth[]> {
    return Array.from(this.providerHealth.values());
  }

  async getAnalytics(): Promise<PaymentAnalytics> {
    this.updateOfflineQueueSize();
    return { ...this.analytics };
  }

  async updateFallbackStrategy(strategy: Partial<FallbackStrategy>): Promise<void> {
    this.fallbackStrategy = {
      ...this.fallbackStrategy,
      ...strategy
    };
    this.emit('fallback_strategy_updated', this.fallbackStrategy);
  }

  async getBalance(customerMsisdn: string): Promise<any> {
    const [bkashBalance, nagadBalance, rocketBalance] = await Promise.all([
      this.bkashService.getAccountBalance(customerMsisdn),
      this.nagadService.getBalance(customerMsisdn),
      this.rocketService.getTransactionHistory(customerMsisdn, 1)
    ]);

    return {
      bkash: bkashBalance,
      nagad: nagadBalance,
      rocket: rocketBalance,
      lastUpdated: new Date()
    };
  }

  async getTransactionHistory(
    customerMsisdn: string,
    provider?: PaymentProvider,
    limit: number = 50
  ): Promise<any[]> {
    if (provider) {
      switch (provider) {
        case 'bkash':
          return this.bkashService.getTransactionHistory(customerMsisdn, limit);
        case 'nagad':
          return this.nagadService.getTransactionHistory(customerMsisdn, limit);
        case 'rocket':
          return this.rocketService.getTransactionHistory(customerMsisdn, limit);
      }
    }

    // Get history from all providers
    const [bkashHistory, nagadHistory, rocketHistory] = await Promise.all([
      this.bkashService.getTransactionHistory(customerMsisdn, limit),
      this.nagadService.getTransactionHistory(customerMsisdn, limit),
      this.rocketService.getTransactionHistory(customerMsisdn, limit)
    ]);

    return [...bkashHistory, ...nagadHistory, ...rocketHistory]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Getters for monitoring
  get totalOfflineQueueLength(): number {
    return this.analytics.offlineQueueSize;
  }

  get currentLoadDistribution(): { [key in PaymentProvider]: number } {
    return {
      bkash: this.loadBalancer.get('bkash') || 0,
      nagad: this.loadBalancer.get('nagad') || 0,
      rocket: this.loadBalancer.get('rocket') || 0
    };
  }
}

export default MobileBankingOrchestrator;