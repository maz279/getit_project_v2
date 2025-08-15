/**
 * Unified API Client - Single API Client Pattern
 * Phase 2: Service Consolidation Implementation
 * 
 * Replaces multiple scattered API clients with single unified client
 */

import { BaseService } from '../base/BaseService';
import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: {
    requestId: string;
    timestamp: Date;
    duration: number;
    service: string;
    operation: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  headers?: { [key: string]: string };
  timeout?: number;
  retries?: number;
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  authToken?: string;
  headers: { [key: string]: string };
}

/**
 * Unified API Client
 * Single source for all API communications
 */
export class UnifiedApiClient extends BaseService {
  private config: ApiClientConfig;
  private logger: ServiceLogger;
  private errorHandler: ErrorHandler;
  private requestInterceptors: Array<(request: ApiRequest) => Promise<ApiRequest>>;
  private responseInterceptors: Array<(response: ApiResponse<any>) => Promise<ApiResponse<any>>>;

  constructor(config: Partial<ApiClientConfig> = {}) {
    super('UnifiedApiClient');
    
    this.config = {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
      timeout: 5000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    };

    this.logger = new ServiceLogger('UnifiedApiClient');
    this.errorHandler = new ErrorHandler('UnifiedApiClient');
    this.requestInterceptors = [];
    this.responseInterceptors = [];

    this.setupDefaultInterceptors();
  }

  /**
   * HTTP Methods
   */
  async get<T>(endpoint: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      endpoint,
      ...options
    });
  }

  async post<T>(endpoint: string, data?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      endpoint,
      data,
      ...options
    });
  }

  async put<T>(endpoint: string, data?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      endpoint,
      data,
      ...options
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      endpoint,
      data,
      ...options
    });
  }

  async delete<T>(endpoint: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      endpoint,
      ...options
    });
  }

  /**
   * Core Request Method
   */
  private async request<T>(apiRequest: ApiRequest): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      this.logger.info('API request started', {
        requestId,
        method: apiRequest.method,
        endpoint: apiRequest.endpoint
      });

      // Apply request interceptors
      let processedRequest = apiRequest;
      for (const interceptor of this.requestInterceptors) {
        processedRequest = await interceptor(processedRequest);
      }

      // Prepare request
      const url = this.buildUrl(processedRequest.endpoint);
      const headers = this.buildHeaders(processedRequest.headers);
      const timeout = processedRequest.timeout || this.config.timeout;

      // Execute request with retry logic
      const response = await this.executeWithRetry(
        () => this.executeRequest(url, processedRequest, headers, timeout),
        processedRequest.retries || this.config.retries
      );

      const duration = Date.now() - startTime;

      let apiResponse: ApiResponse<T> = {
        success: response.ok,
        data: response.ok ? await response.json() : undefined,
        error: response.ok ? undefined : {
          code: response.status.toString(),
          message: response.statusText,
          retryable: this.isRetryableError(response.status)
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          duration,
          service: 'UnifiedApiClient',
          operation: `${apiRequest.method} ${apiRequest.endpoint}`
        }
      };

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        apiResponse = await interceptor(apiResponse);
      }

      this.logger.info('API request completed', {
        requestId,
        success: apiResponse.success,
        duration,
        status: response.status
      });

      return apiResponse;

    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('API request failed', {
        requestId,
        error: error.message,
        duration
      });

      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error.message,
          retryable: this.isRetryableError(0)
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          duration,
          service: 'UnifiedApiClient',
          operation: `${apiRequest.method} ${apiRequest.endpoint}`
        }
      };
    }
  }

  /**
   * Service-Specific API Methods
   */
  
  // User Management Service APIs
  async authenticateUser(email: string, password: string): Promise<ApiResponse<any>> {
    return this.post('/users/authenticate', { email, password });
  }

  async registerUser(userData: any): Promise<ApiResponse<any>> {
    return this.post('/users/register', userData);
  }

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    return this.get(`/users/${userId}/profile`);
  }

  async updateUserProfile(userId: string, updates: any): Promise<ApiResponse<any>> {
    return this.patch(`/users/${userId}/profile`, updates);
  }

  // Product Catalog Service APIs
  async getProducts(filters?: any, page?: number, limit?: number): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([key, value]) => params.append(key, String(value)));
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    
    return this.get(`/products?${params.toString()}`);
  }

  async getProduct(productId: string): Promise<ApiResponse<any>> {
    return this.get(`/products/${productId}`);
  }

  async createProduct(productData: any): Promise<ApiResponse<any>> {
    return this.post('/products', productData);
  }

  async updateProduct(productId: string, updates: any): Promise<ApiResponse<any>> {
    return this.patch(`/products/${productId}`, updates);
  }

  async deleteProduct(productId: string): Promise<ApiResponse<any>> {
    return this.delete(`/products/${productId}`);
  }

  // Order Management Service APIs
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.post('/orders', orderData);
  }

  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.get(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<ApiResponse<any>> {
    return this.patch(`/orders/${orderId}/status`, { status, notes });
  }

  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<any>> {
    return this.post(`/orders/${orderId}/cancel`, { reason });
  }

  async getOrdersByCustomer(customerId: string, page?: number, limit?: number): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    
    return this.get(`/customers/${customerId}/orders?${params.toString()}`);
  }

  // Payment Processing Service APIs
  async processPayment(paymentData: any): Promise<ApiResponse<any>> {
    return this.post('/payments/process', paymentData);
  }

  async processRefund(refundData: any): Promise<ApiResponse<any>> {
    return this.post('/payments/refund', refundData);
  }

  async getPaymentMethods(userId: string): Promise<ApiResponse<any>> {
    return this.get(`/users/${userId}/payment-methods`);
  }

  async addPaymentMethod(userId: string, methodData: any): Promise<ApiResponse<any>> {
    return this.post(`/users/${userId}/payment-methods`, methodData);
  }

  async deletePaymentMethod(methodId: string): Promise<ApiResponse<any>> {
    return this.delete(`/payment-methods/${methodId}`);
  }

  // Bangladesh Mobile Banking APIs
  async processMobileBankingPayment(paymentData: any): Promise<ApiResponse<any>> {
    return this.post('/payments/mobile-banking', paymentData);
  }

  /**
   * Interceptor Management
   */
  addRequestInterceptor(interceptor: (request: ApiRequest) => Promise<ApiRequest>): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: ApiResponse<any>) => Promise<ApiResponse<any>>): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Configuration Management
   */
  setAuthToken(token: string): void {
    this.config.authToken = token;
    this.config.headers['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    this.config.authToken = undefined;
    delete this.config.headers['Authorization'];
  }

  updateConfig(updates: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Private Helper Methods
   */
  private setupDefaultInterceptors(): void {
    // Request interceptor for authentication
    this.addRequestInterceptor(async (request: ApiRequest) => {
      if (this.config.authToken) {
        request.headers = {
          ...request.headers,
          'Authorization': `Bearer ${this.config.authToken}`
        };
      }
      return request;
    });

    // Response interceptor for error handling
    this.addResponseInterceptor(async (response: ApiResponse<any>) => {
      if (!response.success && response.error?.code === '401') {
        // Handle unauthorized - could trigger token refresh
        this.logger.warn('Unauthorized request detected', {
          requestId: response.metadata.requestId
        });
      }
      return response;
    });
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;
    
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  private buildHeaders(requestHeaders?: { [key: string]: string }): { [key: string]: string } {
    return {
      ...this.config.headers,
      ...requestHeaders
    };
  }

  private async executeRequest(
    url: string,
    request: ApiRequest,
    headers: { [key: string]: string },
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
        signal: controller.signal
      };

      if (request.data && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        fetchOptions.body = JSON.stringify(request.data);
      }

      const response = await fetch(url, fetchOptions);
      return response;

    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries && this.isRetryableError(0)) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.delay(delay);
          
          this.logger.warn('Retrying API request', {
            attempt: attempt + 1,
            totalAttempts: retries + 1,
            delay
          });
        }
      }
    }

    throw lastError;
  }

  private isRetryableError(statusCode: number): boolean {
    return statusCode >= 500 || statusCode === 429 || statusCode === 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}