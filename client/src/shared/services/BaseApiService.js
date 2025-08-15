// Base API Service
// GetIt Bangladesh - Enterprise-grade API service foundation
// Centralized HTTP client with authentication, error handling, and caching

class BaseApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'web'
    };
    
    // Request cache for performance
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Error handlers
    this.errorHandlers = new Map();
    
    this.setupDefaultErrorHandlers();
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Set authentication token
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Generate cache key
  generateCacheKey(url, method, data) {
    const key = `${method}:${url}`;
    if (data && method !== 'GET') {
      return `${key}:${JSON.stringify(data)}`;
    }
    return key;
  }

  // Check cache
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      const expired = entries.filter(([, value]) => 
        Date.now() - value.timestamp >= this.cacheTimeout
      );
      expired.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Clear cache
  clearCache(pattern) {
    if (pattern) {
      const keys = Array.from(this.cache.keys());
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }

  // Setup default error handlers
  setupDefaultErrorHandlers() {
    // Authentication errors
    this.errorHandlers.set(401, (error) => {
      this.clearCache();
      // Trigger logout
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: error }));
      return { success: false, error: 'Authentication required' };
    });

    // Authorization errors
    this.errorHandlers.set(403, (error) => {
      return { success: false, error: 'Access forbidden' };
    });

    // Not found errors
    this.errorHandlers.set(404, (error) => {
      return { success: false, error: 'Resource not found' };
    });

    // Server errors
    this.errorHandlers.set(500, (error) => {
      return { success: false, error: 'Server error occurred' };
    });

    // Network errors
    this.errorHandlers.set('NETWORK_ERROR', (error) => {
      return { success: false, error: 'Network connection failed' };
    });

    // Timeout errors
    this.errorHandlers.set('TIMEOUT', (error) => {
      return { success: false, error: 'Request timeout' };
    });
  }

  // Apply request interceptors
  async applyRequestInterceptors(config) {
    let finalConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      try {
        finalConfig = await interceptor(finalConfig);
      } catch (error) {
        console.warn('Request interceptor error:', error);
      }
    }
    
    return finalConfig;
  }

  // Apply response interceptors
  async applyResponseInterceptors(response) {
    let finalResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        finalResponse = await interceptor(finalResponse);
      } catch (error) {
        console.warn('Response interceptor error:', error);
      }
    }
    
    return finalResponse;
  }

  // Handle API errors
  handleError(error, config) {
    const status = error.status || error.code || 'UNKNOWN';
    const handler = this.errorHandlers.get(status);
    
    if (handler) {
      return handler(error);
    }

    // Default error handling
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      status,
      details: error
    };
  }

  // Make HTTP request
  async request(url, options = {}) {
    try {
      const {
        method = 'GET',
        data,
        headers = {},
        cache = method === 'GET',
        timeout = 30000,
        ...fetchOptions
      } = options;

      // Generate full URL
      const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

      // Check cache for GET requests
      if (cache && method === 'GET') {
        const cacheKey = this.generateCacheKey(fullURL, method, data);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      // Prepare request config
      let config = {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        ...fetchOptions
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        if (data instanceof FormData) {
          // Remove Content-Type for FormData (browser sets it with boundary)
          delete config.headers['Content-Type'];
          config.body = data;
        } else {
          config.body = JSON.stringify(data);
        }
      }

      // Add query parameters for GET requests
      let requestURL = fullURL;
      if (data && method === 'GET') {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        const queryString = params.toString();
        if (queryString) {
          requestURL = `${fullURL}${fullURL.includes('?') ? '&' : '?'}${queryString}`;
        }
      }

      // Apply request interceptors
      config = await this.applyRequestInterceptors(config);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), timeout);
      });

      // Make request with timeout
      const response = await Promise.race([
        fetch(requestURL, config),
        timeoutPromise
      ]);

      // Check response status
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      // Parse response
      let responseData;
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType.includes('text/')) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      // Apply response interceptors
      const finalResponse = await this.applyResponseInterceptors({
        data: responseData,
        status: response.status,
        headers: response.headers,
        config
      });

      // Cache successful GET requests
      if (cache && method === 'GET' && response.ok) {
        const cacheKey = this.generateCacheKey(fullURL, method, data);
        this.setCache(cacheKey, finalResponse.data);
      }

      return { success: true, data: finalResponse.data };

    } catch (error) {
      console.error('API Request Error:', error);
      return this.handleError(error, options);
    }
  }

  // HTTP method shortcuts
  async get(url, params = {}, options = {}) {
    return this.request(url, { method: 'GET', data: params, ...options });
  }

  async post(url, data = {}, options = {}) {
    return this.request(url, { method: 'POST', data, ...options });
  }

  async put(url, data = {}, options = {}) {
    return this.request(url, { method: 'PUT', data, ...options });
  }

  async patch(url, data = {}, options = {}) {
    return this.request(url, { method: 'PATCH', data, ...options });
  }

  async delete(url, options = {}) {
    return this.request(url, { method: 'DELETE', ...options });
  }

  // File upload helper
  async upload(url, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional fields
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.post(url, formData, {
      ...options,
      headers: { ...options.headers }
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/health', {}, { cache: false, timeout: 5000 });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Batch requests
  async batch(requests) {
    const promises = requests.map(req => 
      this.request(req.url, req.options).catch(error => ({ error, request: req }))
    );
    
    return await Promise.all(promises);
  }
}

// Create and export singleton instance
const baseApiService = new BaseApiService();

// Setup authentication interceptor
baseApiService.addRequestInterceptor((config) => {
  // Add user language preference
  const language = localStorage.getItem('language') || 'bn';
  config.headers['Accept-Language'] = language;
  
  // Add Bangladesh-specific headers
  config.headers['X-Country'] = 'BD';
  config.headers['X-Currency'] = 'BDT';
  config.headers['X-Timezone'] = 'Asia/Dhaka';
  
  return config;
});

// Setup response interceptor for error logging
baseApiService.addResponseInterceptor((response) => {
  // Log successful requests in development
  if (import.meta.env.DEV) {
    console.log('API Response:', response);
  }
  
  return response;
});

export default baseApiService;