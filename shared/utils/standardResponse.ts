/**
 * Standardized API Response Utility
 * Phase 1 Week 2: API Response Standardization
 * Amazon.com/Shopee.sg-Level Response Consistency
 */

import { StandardApiResponse } from '../api-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a standardized success response
 */
export const standardizeResponse = <T>(
  data: T,
  message?: string,
  processingTime?: number
): StandardApiResponse<T> => ({
  success: true,
  data,
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    version: '1.0.0',
    processingTime: processingTime || 0,
    message,
  },
});

/**
 * Creates a standardized error response
 */
export const standardizeErrorResponse = (
  code: string,
  message: string,
  details?: any,
  processingTime?: number
): StandardApiResponse<null> => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    version: '1.0.0',
    processingTime: processingTime || 0,
  },
});

/**
 * Creates a standardized validation error response
 */
export const standardizeValidationError = (
  errors: Record<string, string[]>,
  processingTime?: number
): StandardApiResponse<null> => ({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: errors,
  },
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    version: '1.0.0',
    processingTime: processingTime || 0,
  },
});

/**
 * Creates a standardized pagination response
 */
export const standardizePaginationResponse = <T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  processingTime?: number
): StandardApiResponse<{
  items: T[];
  pagination: typeof pagination;
}> => ({
  success: true,
  data: {
    items: data,
    pagination,
  },
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    version: '1.0.0',
    processingTime: processingTime || 0,
  },
});

/**
 * Express middleware to add processing time to responses
 */
export const addProcessingTimeMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(body: any) {
    const processingTime = Date.now() - startTime;
    
    try {
      if (typeof body === 'string') {
        const parsedBody = JSON.parse(body);
        if (parsedBody.metadata) {
          parsedBody.metadata.processingTime = processingTime;
          body = JSON.stringify(parsedBody);
        }
      } else if (body && body.metadata) {
        body.metadata.processingTime = processingTime;
      }
    } catch (error) {
      // If parsing fails, continue without adding processing time
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Express error handler middleware for standardized error responses
 */
export const standardErrorHandler = (err: any, req: any, res: any, next: any) => {
  const processingTime = Date.now() - (req.startTime || 0);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json(standardizeValidationError(err.details, processingTime));
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(standardizeErrorResponse('UNAUTHORIZED', 'Authentication required', err.details, processingTime));
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json(standardizeErrorResponse('FORBIDDEN', 'Access denied', err.details, processingTime));
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json(standardizeErrorResponse('NOT_FOUND', 'Resource not found', err.details, processingTime));
  }
  
  if (err.name === 'ConflictError') {
    return res.status(409).json(standardizeErrorResponse('CONFLICT', 'Resource conflict', err.details, processingTime));
  }
  
  // Default server error
  return res.status(500).json(standardizeErrorResponse(
    'INTERNAL_SERVER_ERROR',
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    processingTime
  ));
};

/**
 * Async wrapper for route handlers with standardized error handling
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Common HTTP status codes for standardized responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Success response helpers
 */
export const successResponse = {
  ok: <T>(data: T, message?: string) => standardizeResponse(data, message),
  created: <T>(data: T, message?: string) => standardizeResponse(data, message || 'Resource created successfully'),
  accepted: <T>(data: T, message?: string) => standardizeResponse(data, message || 'Request accepted for processing'),
  noContent: (message?: string) => standardizeResponse(null, message || 'Operation completed successfully'),
};

/**
 * Error response helpers
 */
export const errorResponse = {
  badRequest: (message: string, details?: any) => standardizeErrorResponse('BAD_REQUEST', message, details),
  unauthorized: (message: string = 'Authentication required', details?: any) => standardizeErrorResponse('UNAUTHORIZED', message, details),
  forbidden: (message: string = 'Access denied', details?: any) => standardizeErrorResponse('FORBIDDEN', message, details),
  notFound: (message: string = 'Resource not found', details?: any) => standardizeErrorResponse('NOT_FOUND', message, details),
  conflict: (message: string = 'Resource conflict', details?: any) => standardizeErrorResponse('CONFLICT', message, details),
  unprocessableEntity: (message: string = 'Validation failed', details?: any) => standardizeErrorResponse('UNPROCESSABLE_ENTITY', message, details),
  internalServerError: (message: string = 'Internal server error', details?: any) => standardizeErrorResponse('INTERNAL_SERVER_ERROR', message, details),
  serviceUnavailable: (message: string = 'Service unavailable', details?: any) => standardizeErrorResponse('SERVICE_UNAVAILABLE', message, details),
};

export default {
  standardizeResponse,
  standardizeErrorResponse,
  standardizeValidationError,
  standardizePaginationResponse,
  addProcessingTimeMiddleware,
  standardErrorHandler,
  asyncHandler,
  HTTP_STATUS,
  successResponse,
  errorResponse,
};