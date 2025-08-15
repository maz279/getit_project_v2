/**
 * ApiService - Unified API Client
 * Consolidates all API service functionality into a single, unified client
 * 
 * Consolidates:
 * - BaseApiService.js
 * - ApiGatewayApiService.js
 * - All individual API services (OrderService, ProductService, etc.)
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;

  private constructor() {
    this.config = {
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // Handle token refresh logic here
          return this.axiosInstance(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Domain-specific API methods (consolidated from existing services)
  
  // User Management
  public async getUserProfile(userId: string): Promise<ApiResponse> {
    return this.get(`/users/${userId}`);
  }

  public async updateUserProfile(userId: string, data: any): Promise<ApiResponse> {
    return this.put(`/users/${userId}`, data);
  }

  // Product Management
  public async getProducts(params?: any): Promise<ApiResponse> {
    return this.get('/products', { params });
  }

  public async getProduct(productId: string): Promise<ApiResponse> {
    return this.get(`/products/${productId}`);
  }

  public async createProduct(data: any): Promise<ApiResponse> {
    return this.post('/products', data);
  }

  // Order Management
  public async getOrders(params?: any): Promise<ApiResponse> {
    return this.get('/orders', { params });
  }

  public async createOrder(data: any): Promise<ApiResponse> {
    return this.post('/orders', data);
  }

  public async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse> {
    return this.put(`/orders/${orderId}/status`, { status });
  }

  // Cart Management
  public async getCart(userId: string): Promise<ApiResponse> {
    return this.get(`/cart/${userId}`);
  }

  public async addToCart(userId: string, data: any): Promise<ApiResponse> {
    return this.post(`/cart/${userId}/items`, data);
  }

  public async updateCartItem(userId: string, itemId: string, data: any): Promise<ApiResponse> {
    return this.put(`/cart/${userId}/items/${itemId}`, data);
  }

  public async removeFromCart(userId: string, itemId: string): Promise<ApiResponse> {
    return this.delete(`/cart/${userId}/items/${itemId}`);
  }

  // Vendor Management
  public async getVendors(params?: any): Promise<ApiResponse> {
    return this.get('/vendors', { params });
  }

  public async getVendor(vendorId: string): Promise<ApiResponse> {
    return this.get(`/vendors/${vendorId}`);
  }

  // Configuration Management
  public async getConfig(key: string): Promise<ApiResponse> {
    return this.get(`/config/${key}`);
  }

  public async updateConfig(key: string, value: any): Promise<ApiResponse> {
    return this.put(`/config/${key}`, { value });
  }

  // Asset Management
  public async uploadAsset(file: File, metadata?: any): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    return this.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // KYC Management
  public async submitKYCDocument(data: any): Promise<ApiResponse> {
    return this.post('/kyc/submit', data);
  }

  public async getKYCStatus(userId: string): Promise<ApiResponse> {
    return this.get(`/kyc/status/${userId}`);
  }

  // Finance Management
  public async getTransactions(params?: any): Promise<ApiResponse> {
    return this.get('/finance/transactions', { params });
  }

  public async getFinancialSummary(params?: any): Promise<ApiResponse> {
    return this.get('/finance/summary', { params });
  }

  // Subscription Management
  public async getSubscriptions(userId: string): Promise<ApiResponse> {
    return this.get(`/subscriptions/${userId}`);
  }

  public async createSubscription(data: any): Promise<ApiResponse> {
    return this.post('/subscriptions', data);
  }

  // Support Management
  public async createTicket(data: any): Promise<ApiResponse> {
    return this.post('/support/tickets', data);
  }

  public async getTickets(params?: any): Promise<ApiResponse> {
    return this.get('/support/tickets', { params });
  }

  // Video Call Management
  public async initiateVideoCall(data: any): Promise<ApiResponse> {
    return this.post('/video-calls/initiate', data);
  }

  public async joinVideoCall(callId: string): Promise<ApiResponse> {
    return this.post(`/video-calls/${callId}/join`);
  }

  // Helper methods
  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }

  private handleError(error: any): ApiResponse {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status = error.response?.status || 500;
    
    return {
      data: null,
      status,
      error: message,
    };
  }

  // Configuration methods
  public updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public removeAuthToken(): void {
    localStorage.removeItem('authToken');
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

export default ApiService.getInstance();
export { ApiService, ApiResponse, ApiConfig };