/**
 * Phase 4 Task 4.3: API Integration Service
 * Amazon.com/Shopee.sg Enterprise-Level GraphQL & REST API Integration
 * 
 * Features:
 * - GraphQL integration with Apollo Client
 * - REST API fallback mechanisms
 * - Real-time subscriptions
 * - Request/response caching
 * - Optimistic updates
 * - Error handling and retry logic
 */

import { ApolloClient, InMemoryCache, createHttpLink, from, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createClient } from 'graphql-ws';

interface APIEndpoint {
  name: string;
  url: string;
  type: 'graphql' | 'rest';
  authentication: 'bearer' | 'apikey' | 'oauth' | 'none';
  retryAttempts: number;
  timeout: number;
  cacheTTL: number;
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
  };
}

interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
  context?: Record<string, any>;
}

interface RestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface RequestMetrics {
  requestId: string;
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  retryCount: number;
  cacheHit: boolean;
  timestamp: number;
}

class APIIntegrationService {
  private static instance: APIIntegrationService;
  private apolloClient: ApolloClient<any>;
  private restClient: any;
  private endpoints: Map<string, APIEndpoint> = new Map();
  private requestMetrics: RequestMetrics[] = [];
  private rateLimiters: Map<string, { requests: number; resetTime: number }> = new Map();
  private cache: Map<string, { data: any; expires: number }> = new Map();

  private constructor() {
    this.initializeEndpoints();
    this.initializeGraphQLClient();
    this.initializeRESTClient();
    this.startMetricsCollection();
  }

  static getInstance(): APIIntegrationService {
    if (!APIIntegrationService.instance) {
      APIIntegrationService.instance = new APIIntegrationService();
    }
    return APIIntegrationService.instance;
  }

  /**
   * Initialize API endpoints configuration
   */
  private initializeEndpoints(): void {
    // Product Service
    this.endpoints.set('products', {
      name: 'products',
      url: '/api/graphql',
      type: 'graphql',
      authentication: 'bearer',
      retryAttempts: 3,
      timeout: 5000,
      cacheTTL: 300000, // 5 minutes
      rateLimiting: {
        maxRequests: 100,
        windowMs: 60000 // 1 minute
      }
    });

    // Order Service
    this.endpoints.set('orders', {
      name: 'orders',
      url: '/api/graphql',
      type: 'graphql',
      authentication: 'bearer',
      retryAttempts: 3,
      timeout: 10000,
      cacheTTL: 60000, // 1 minute
      rateLimiting: {
        maxRequests: 50,
        windowMs: 60000
      }
    });

    // User Service
    this.endpoints.set('users', {
      name: 'users',
      url: '/api/graphql',
      type: 'graphql',
      authentication: 'bearer',
      retryAttempts: 2,
      timeout: 5000,
      cacheTTL: 180000, // 3 minutes
      rateLimiting: {
        maxRequests: 30,
        windowMs: 60000
      }
    });

    // Analytics Service (REST fallback)
    this.endpoints.set('analytics', {
      name: 'analytics',
      url: '/api/analytics',
      type: 'rest',
      authentication: 'bearer',
      retryAttempts: 2,
      timeout: 15000,
      cacheTTL: 600000, // 10 minutes
      rateLimiting: {
        maxRequests: 20,
        windowMs: 60000
      }
    });

    // Payment Service
    this.endpoints.set('payments', {
      name: 'payments',
      url: '/api/graphql',
      type: 'graphql',
      authentication: 'bearer',
      retryAttempts: 5,
      timeout: 30000,
      cacheTTL: 0, // No caching for payments
      rateLimiting: {
        maxRequests: 10,
        windowMs: 60000
      }
    });
  }

  /**
   * Initialize GraphQL client with Apollo
   */
  private initializeGraphQLClient(): void {
    // HTTP Link
    const httpLink = createHttpLink({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || '/api/graphql',
      credentials: 'include'
    });

    // Auth Link
    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem('accessToken');
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      };
    });

    // Error Link
    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
          
          // Handle specific error types
          if (message.includes('Unauthorized')) {
            this.handleUnauthorizedError();
          }
        });
      }

      if (networkError) {
        console.error(`Network error: ${networkError}`);
        
        // Handle network errors
        if (networkError.statusCode === 401) {
          this.handleUnauthorizedError();
        }
      }
    });

    // Retry Link
    const retryLink = new RetryLink({
      delay: {
        initial: 300,
        max: Infinity,
        jitter: true
      },
      attempts: {
        max: 3,
        retryIf: (error, _operation) => !!error && error.statusCode !== 401
      }
    });

    // Apollo Client
    this.apolloClient = new ApolloClient({
      link: from([errorLink, retryLink, authLink, httpLink]),
      cache: new InMemoryCache({
        typePolicies: {
          Product: {
            fields: {
              reviews: {
                merge: false
              }
            }
          },
          User: {
            fields: {
              orders: {
                merge: false
              }
            }
          }
        }
      }),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all'
        },
        query: {
          errorPolicy: 'all'
        }
      }
    });
  }

  /**
   * Initialize REST client
   */
  private initializeRESTClient(): void {
    this.restClient = {
      request: async (config: RestRequest): Promise<any> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || 5000);

        try {
          const response = await fetch(config.url, {
            method: config.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              ...config.headers
            },
            body: config.body ? JSON.stringify(config.body) : undefined,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }
    };
  }

  /**
   * Execute GraphQL query
   */
  async executeGraphQLQuery(query: GraphQLQuery): Promise<any> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();
    
    try {
      // Check rate limiting
      if (!this.checkRateLimit('graphql')) {
        throw new Error('Rate limit exceeded');
      }

      // Check cache
      const cacheKey = this.generateCacheKey('graphql', query);
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        this.recordMetrics(requestId, 'graphql', 'QUERY', performance.now() - startTime, 200, true, 0, true);
        return cachedData;
      }

      // Execute query
      const result = await this.apolloClient.query({
        query: gql(query.query),
        variables: query.variables,
        context: query.context,
        fetchPolicy: 'cache-first'
      });

      // Cache result
      this.setCache(cacheKey, result.data, 300000); // 5 minutes default

      this.recordMetrics(requestId, 'graphql', 'QUERY', performance.now() - startTime, 200, true, 0, false);
      return result.data;
    } catch (error) {
      this.recordMetrics(requestId, 'graphql', 'QUERY', performance.now() - startTime, 500, false, 0, false);
      throw error;
    }
  }

  /**
   * Execute GraphQL mutation
   */
  async executeGraphQLMutation(mutation: GraphQLQuery): Promise<any> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();
    
    try {
      // Check rate limiting
      if (!this.checkRateLimit('graphql')) {
        throw new Error('Rate limit exceeded');
      }

      // Execute mutation
      const result = await this.apolloClient.mutate({
        mutation: gql(mutation.query),
        variables: mutation.variables,
        context: mutation.context,
        optimisticResponse: mutation.context?.optimisticResponse,
        update: mutation.context?.update
      });

      this.recordMetrics(requestId, 'graphql', 'MUTATION', performance.now() - startTime, 200, true, 0, false);
      return result.data;
    } catch (error) {
      this.recordMetrics(requestId, 'graphql', 'MUTATION', performance.now() - startTime, 500, false, 0, false);
      throw error;
    }
  }

  /**
   * Execute REST request
   */
  async executeRESTRequest(request: RestRequest): Promise<any> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();
    
    try {
      // Check rate limiting
      if (!this.checkRateLimit('rest')) {
        throw new Error('Rate limit exceeded');
      }

      // Check cache for GET requests
      if (request.method === 'GET') {
        const cacheKey = this.generateCacheKey('rest', request);
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
          this.recordMetrics(requestId, 'rest', request.method, performance.now() - startTime, 200, true, 0, true);
          return cachedData;
        }
      }

      // Execute request with retry logic
      let lastError: Error | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount <= maxRetries) {
        try {
          const result = await this.restClient.request(request);
          
          // Cache GET requests
          if (request.method === 'GET') {
            const cacheKey = this.generateCacheKey('rest', request);
            this.setCache(cacheKey, result, 180000); // 3 minutes default
          }

          this.recordMetrics(requestId, 'rest', request.method, performance.now() - startTime, 200, true, retryCount, false);
          return result;
        } catch (error) {
          lastError = error as Error;
          retryCount++;
          
          if (retryCount <= maxRetries) {
            await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
          }
        }
      }

      this.recordMetrics(requestId, 'rest', request.method, performance.now() - startTime, 500, false, retryCount, false);
      throw lastError;
    } catch (error) {
      this.recordMetrics(requestId, 'rest', request.method, performance.now() - startTime, 500, false, 0, false);
      throw error;
    }
  }

  /**
   * Subscribe to GraphQL subscription
   */
  subscribeToGraphQL(subscription: GraphQLQuery, callback: (data: any) => void): () => void {
    const observable = this.apolloClient.subscribe({
      query: gql(subscription.query),
      variables: subscription.variables
    });

    const subscriptionInstance = observable.subscribe({
      next: (result) => callback(result.data),
      error: (error) => console.error('Subscription error:', error),
      complete: () => console.log('Subscription complete')
    });

    return () => subscriptionInstance.unsubscribe();
  }

  /**
   * Batch GraphQL requests
   */
  async batchGraphQLRequests(queries: GraphQLQuery[]): Promise<any[]> {
    const promises = queries.map(query => this.executeGraphQLQuery(query));
    return Promise.all(promises);
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const limiter = this.rateLimiters.get(endpoint);
    
    if (!limiter) {
      this.rateLimiters.set(endpoint, { requests: 1, resetTime: now + 60000 });
      return true;
    }

    if (now > limiter.resetTime) {
      limiter.requests = 1;
      limiter.resetTime = now + 60000;
      return true;
    }

    if (limiter.requests >= 100) { // Default limit
      return false;
    }

    limiter.requests++;
    return true;
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(type: string, request: any): string {
    return `${type}:${JSON.stringify(request)}`;
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record metrics
   */
  private recordMetrics(requestId: string, endpoint: string, method: string, duration: number, status: number, success: boolean, retryCount: number, cacheHit: boolean): void {
    const metrics: RequestMetrics = {
      requestId,
      endpoint,
      method,
      duration,
      status,
      success,
      retryCount,
      cacheHit,
      timestamp: Date.now()
    };

    this.requestMetrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics.shift();
    }
  }

  /**
   * Handle unauthorized error
   */
  private handleUnauthorizedError(): void {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.cleanupCache();
      this.cleanupMetrics();
    }, 60000); // Clean up every minute
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cleanup old metrics
   */
  private cleanupMetrics(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.requestMetrics = this.requestMetrics.filter(metric => metric.timestamp > oneHourAgo);
  }

  /**
   * Get API health metrics
   */
  getHealthMetrics(): any {
    const now = Date.now();
    const lastHour = now - 3600000;
    const recentMetrics = this.requestMetrics.filter(m => m.timestamp > lastHour);

    return {
      totalRequests: recentMetrics.length,
      successRate: recentMetrics.length ? recentMetrics.filter(m => m.success).length / recentMetrics.length : 0,
      averageResponseTime: recentMetrics.length ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length : 0,
      cacheHitRate: recentMetrics.length ? recentMetrics.filter(m => m.cacheHit).length / recentMetrics.length : 0,
      errorRate: recentMetrics.length ? recentMetrics.filter(m => !m.success).length / recentMetrics.length : 0,
      averageRetryCount: recentMetrics.length ? recentMetrics.reduce((sum, m) => sum + m.retryCount, 0) / recentMetrics.length : 0,
      cacheSize: this.cache.size,
      endpointHealth: this.getEndpointHealth(recentMetrics)
    };
  }

  /**
   * Get endpoint-specific health
   */
  private getEndpointHealth(metrics: RequestMetrics[]): any {
    const endpointStats: any = {};
    
    for (const metric of metrics) {
      if (!endpointStats[metric.endpoint]) {
        endpointStats[metric.endpoint] = {
          requests: 0,
          successes: 0,
          totalDuration: 0,
          errors: 0
        };
      }
      
      const stats = endpointStats[metric.endpoint];
      stats.requests++;
      stats.totalDuration += metric.duration;
      
      if (metric.success) {
        stats.successes++;
      } else {
        stats.errors++;
      }
    }
    
    // Calculate rates
    for (const endpoint in endpointStats) {
      const stats = endpointStats[endpoint];
      stats.successRate = stats.successes / stats.requests;
      stats.averageResponseTime = stats.totalDuration / stats.requests;
      stats.errorRate = stats.errors / stats.requests;
    }
    
    return endpointStats;
  }

  /**
   * Get GraphQL client instance
   */
  getGraphQLClient(): ApolloClient<any> {
    return this.apolloClient;
  }

  /**
   * Get REST client instance
   */
  getRESTClient(): any {
    return this.restClient;
  }
}

export default APIIntegrationService;