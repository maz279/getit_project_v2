/**
 * ApiService - Unified API client for all HTTP requests
 * Consolidates BaseApiService, ApiGatewayApiService, and 20+ API services
 * Enterprise-grade HTTP client with comprehensive error handling and caching
 */

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pagination?: {
      current: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  cache?: boolean;
  retries?: number;
  authentication?: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path: string;
  details?: any;
}

class ApiService {
  private static instance: ApiService;
  private baseURL: string;
  private defaultTimeout: number = 30000;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
  private responseInterceptors: Array<(response: any) => any> = [];

  private constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '/api';
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Generic HTTP request method
   */
  public async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      params = {},
      data,
      timeout = this.defaultTimeout,
      cache = false,
      retries = 3,
      authentication = true
    } = config;

    // Build URL with params
    const url = new URL(endpoint, this.baseURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const cacheKey = `${method}:${url.toString()}`;
    
    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Build request config
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(authentication && this.getAuthHeaders())
      },
      ...(data && { body: JSON.stringify(data) }),
      signal: AbortSignal.timeout(timeout)
    };

    // Apply request interceptors
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = interceptor(processedConfig);
    }

    try {
      const response = await this.executeWithRetry(
        () => fetch(url.toString(), requestConfig),
        retries
      );

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const result = await response.json();
      
      // Apply response interceptors
      let processedResult = result;
      for (const interceptor of this.responseInterceptors) {
        processedResult = interceptor(processedResult);
      }

      const apiResponse: ApiResponse<T> = {
        data: processedResult.data || processedResult,
        success: true,
        message: processedResult.message,
        meta: processedResult.meta
      };

      // Cache GET responses
      if (method === 'GET' && cache) {
        this.setCachedResponse(cacheKey, apiResponse, 300000); // 5 minutes TTL
      }

      return apiResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'method' | 'params'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET', params });
  }

  /**
   * POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'data'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  /**
   * Upload file
   */
  public async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw await this.handleErrorResponse(response);
    }

    const result = await response.json();
    return {
      data: result.data || result,
      success: true,
      message: result.message
    };
  }

  /**
   * Download file
   */
  public async download(
    endpoint: string,
    filename?: string,
    params?: Record<string, any>
  ): Promise<void> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw await this.handleErrorResponse(response);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Add request interceptor
   */
  public addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  public addResponseInterceptor(interceptor: (response: any) => any): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Remove authentication token
   */
  public removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  /**
   * Handle error response
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    const error: ApiError = {
      message: 'Request failed',
      code: 'API_ERROR',
      status: response.status,
      timestamp: new Date().toISOString(),
      path: response.url
    };

    try {
      const errorData = await response.json();
      error.message = errorData.message || error.message;
      error.code = errorData.code || error.code;
      error.details = errorData.details;
    } catch {
      error.message = response.statusText || error.message;
    }

    return error;
  }

  /**
   * Handle general errors
   */
  private handleError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout',
        code: 'TIMEOUT',
        status: 408,
        timestamp: new Date().toISOString(),
        path: ''
      };
    }

    if (error.message === 'Failed to fetch') {
      return {
        message: 'Network error',
        code: 'NETWORK_ERROR',
        status: 0,
        timestamp: new Date().toISOString(),
        path: ''
      };
    }

    return error;
  }

  /**
   * Get cached response
   */
  private getCachedResponse(key: string): ApiResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached response
   */
  private setCachedResponse(key: string, data: ApiResponse, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default ApiService.getInstance();