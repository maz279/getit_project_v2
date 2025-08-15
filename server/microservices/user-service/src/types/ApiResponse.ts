/**
 * API Response Types - Amazon.com/Shopee.sg Level Implementation
 * Standardized response format for all API endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
}

export interface ApiError {
  field?: string;
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationMetadata;
  performance?: PerformanceMetadata;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PerformanceMetadata {
  processingTime: number;
  cacheHit: boolean;
  dbQueries: number;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Success response helpers
export class ApiResponseBuilder {
  static success<T>(data?: T, message = 'Operation successful'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  static error(message: string, errors?: ApiError[], statusCode = 500): ApiResponse {
    return {
      success: false,
      message,
      errors,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  static validationError(errors: ValidationError[]): ApiResponse {
    return {
      success: false,
      message: 'Validation failed',
      errors: errors.map(err => ({
        field: err.field,
        code: err.code,
        message: err.message
      })),
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMetadata,
    message = 'Data retrieved successfully'
  ): ApiResponse<T[]> {
    return {
      success: true,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0',
        pagination
      }
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Bangladesh-specific response types
export interface BangladeshApiResponse<T = any> extends ApiResponse<T> {
  localizedMessage?: {
    bengali: string;
    english: string;
  };
  bangladeshSpecific?: {
    division?: string;
    paymentMethods?: string[];
    shippingZones?: string[];
  };
}