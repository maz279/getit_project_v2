/**
 * Phase 2: Service Layer Standardization
 * Standardized Service Communication Patterns
 * Investment: $7,000 | Week 3-4
 */

// Base types for service communication
interface ServiceRequest<T = any> {
  id: string;
  timestamp: number;
  service: string;
  action: string;
  payload: T;
  metadata?: Record<string, any>;
  retryCount?: number;
}

interface ServiceResponse<T = any> {
  id: string;
  timestamp: number;
  service: string;
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: Record<string, any>;
  processingTime: number;
}

interface ServiceError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// Communication patterns
export enum CommunicationPattern {
  REQUEST_RESPONSE = 'request-response',
  PUB_SUB = 'pub-sub',
  EVENT_SOURCING = 'event-sourcing',
  SAGA = 'saga'
}

/**
 * Base service communicator with standardized patterns
 */
export abstract class BaseServiceCommunicator {
  protected serviceName: string;
  protected patterns: Set<CommunicationPattern>;
  private requestId = 0;

  constructor(serviceName: string, patterns: CommunicationPattern[] = []) {
    this.serviceName = serviceName;
    this.patterns = new Set(patterns);
  }

  /**
   * Generate unique request ID
   */
  protected generateRequestId(): string {
    return `${this.serviceName}-${Date.now()}-${++this.requestId}`;
  }

  /**
   * Create standardized request
   */
  protected createRequest<T>(action: string, payload: T, metadata?: Record<string, any>): ServiceRequest<T> {
    return {
      id: this.generateRequestId(),
      timestamp: Date.now(),
      service: this.serviceName,
      action,
      payload,
      metadata
    };
  }

  /**
   * Create standardized response
   */
  protected createResponse<T>(
    requestId: string,
    success: boolean,
    data?: T,
    error?: ServiceError,
    processingTime?: number
  ): ServiceResponse<T> {
    return {
      id: requestId,
      timestamp: Date.now(),
      service: this.serviceName,
      success,
      data,
      error,
      processingTime: processingTime || 0
    };
  }

  /**
   * Abstract methods to be implemented by concrete services
   */
  abstract send<T>(request: ServiceRequest<T>): Promise<ServiceResponse>;
  abstract healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }>;
}

/**
 * HTTP-based service communicator
 */
export class HttpServiceCommunicator extends BaseServiceCommunicator {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(serviceName: string, baseUrl: string, options: {
    timeout?: number;
    retryAttempts?: number;
  } = {}) {
    super(serviceName, [CommunicationPattern.REQUEST_RESPONSE]);
    this.baseUrl = baseUrl;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
  }

  async send<T>(request: ServiceRequest<T>): Promise<ServiceResponse> {
    const startTime = performance.now();
    let lastError: any;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}/${request.action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': request.id,
            'X-Service': this.serviceName
          },
          body: JSON.stringify(request),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();
        const processingTime = performance.now() - startTime;

        if (response.ok) {
          return this.createResponse(request.id, true, responseData, undefined, processingTime);
        } else {
          const error: ServiceError = {
            code: `HTTP_${response.status}`,
            message: responseData.message || response.statusText,
            details: responseData,
            retryable: response.status >= 500
          };
          
          if (!error.retryable || attempt === this.retryAttempts) {
            return this.createResponse(request.id, false, undefined, error, processingTime);
          }
        }
      } catch (err: any) {
        lastError = err;
        const isRetryable = err.name === 'AbortError' || err.code === 'NETWORK_ERROR';
        
        if (!isRetryable || attempt === this.retryAttempts) {
          const error: ServiceError = {
            code: err.name || 'UNKNOWN_ERROR',
            message: err.message,
            details: err,
            retryable: isRetryable
          };
          
          const processingTime = performance.now() - startTime;
          return this.createResponse(request.id, false, undefined, error, processingTime);
        }

        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Should never reach here, but just in case
    const error: ServiceError = {
      code: 'MAX_RETRIES_EXCEEDED',
      message: `Failed after ${this.retryAttempts} retry attempts`,
      details: lastError,
      retryable: false
    };
    
    return this.createResponse(request.id, false, undefined, error, performance.now() - startTime);
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      const request = this.createRequest('health', {});
      const response = await this.send(request);
      
      if (response.success) {
        return {
          status: 'healthy',
          details: {
            baseUrl: this.baseUrl,
            responseTime: response.processingTime
          }
        };
      } else {
        return {
          status: 'unhealthy',
          details: {
            error: response.error,
            baseUrl: this.baseUrl
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          baseUrl: this.baseUrl
        }
      };
    }
  }
}

/**
 * WebSocket-based service communicator for real-time communication
 */
export class WebSocketServiceCommunicator extends BaseServiceCommunicator {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pendingRequests = new Map<string, {
    resolve: (response: ServiceResponse) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor(serviceName: string, url: string) {
    super(serviceName, [CommunicationPattern.REQUEST_RESPONSE, CommunicationPattern.PUB_SUB]);
    this.url = url;
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log(`WebSocket connection established for ${this.serviceName}`);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        console.error(`WebSocket error for ${this.serviceName}:`, error);
      };
    } catch (error) {
      console.error(`Failed to create WebSocket connection for ${this.serviceName}:`, error);
      this.scheduleReconnection();
    }
  }

  private handleMessage(data: string): void {
    try {
      const response: ServiceResponse = JSON.parse(data);
      const pending = this.pendingRequests.get(response.id);
      
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(response.id);
        pending.resolve(response);
      }
    } catch (error) {
      console.error(`Failed to parse WebSocket message for ${this.serviceName}:`, error);
    }
  }

  private handleDisconnection(): void {
    console.log(`WebSocket disconnected for ${this.serviceName}`);
    this.scheduleReconnection();
  }

  private scheduleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket for ${this.serviceName} (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for ${this.serviceName}`);
    }
  }

  async send<T>(request: ServiceRequest<T>): Promise<ServiceResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        const error: ServiceError = {
          code: 'CONNECTION_NOT_READY',
          message: 'WebSocket connection is not ready',
          retryable: true
        };
        resolve(this.createResponse(request.id, false, undefined, error));
        return;
      }

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        const error: ServiceError = {
          code: 'TIMEOUT',
          message: 'Request timed out',
          retryable: true
        };
        resolve(this.createResponse(request.id, false, undefined, error));
      }, 30000);

      this.pendingRequests.set(request.id, { resolve, reject, timeout });
      this.ws.send(JSON.stringify(request));
    });
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    const isConnected = this.ws && this.ws.readyState === WebSocket.OPEN;
    
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      details: {
        url: this.url,
        connected: isConnected,
        reconnectAttempts: this.reconnectAttempts
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear pending requests
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
      const error: ServiceError = {
        code: 'CONNECTION_CLOSED',
        message: 'Connection was closed',
        retryable: false
      };
      pending.resolve(this.createResponse('', false, undefined, error));
    });
    this.pendingRequests.clear();
  }
}

/**
 * Service registry for managing multiple service communicators
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services = new Map<string, BaseServiceCommunicator>();

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  register(name: string, service: BaseServiceCommunicator): void {
    this.services.set(name, service);
  }

  get(name: string): BaseServiceCommunicator | undefined {
    return this.services.get(name);
  }

  async healthCheck(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};
    
    for (const [name, service] of this.services) {
      try {
        health[name] = await service.healthCheck();
      } catch (error) {
        health[name] = {
          status: 'unhealthy',
          details: { error: error.message }
        };
      }
    }
    
    return health;
  }

  list(): string[] {
    return Array.from(this.services.keys());
  }
}

// Specific service communicators for the search platform
export class SearchServiceCommunicator extends HttpServiceCommunicator {
  constructor(baseUrl: string) {
    super('SearchService', baseUrl);
  }

  async search(query: string, filters?: any): Promise<ServiceResponse> {
    const request = this.createRequest('search', { query, filters });
    return this.send(request);
  }

  async suggest(query: string, limit?: number): Promise<ServiceResponse> {
    const request = this.createRequest('suggest', { query, limit });
    return this.send(request);
  }
}

export class AIServiceCommunicator extends HttpServiceCommunicator {
  constructor(baseUrl: string) {
    super('AIService', baseUrl);
  }

  async enhancedSearch(query: string, context?: any): Promise<ServiceResponse> {
    const request = this.createRequest('enhanced-search', { query, context });
    return this.send(request);
  }
}

export class AnalyticsServiceCommunicator extends WebSocketServiceCommunicator {
  constructor(url: string) {
    super('AnalyticsService', url);
  }

  async trackEvent(event: string, data: any): Promise<ServiceResponse> {
    const request = this.createRequest('track', { event, data });
    return this.send(request);
  }
}