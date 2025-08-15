/**
 * Standardized API Response Utility
 * Week 2: API Response Format Standardization
 * Amazon.com/Shopee.sg-Level Response Consistency
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StandardApiResponse } from '../../shared/api-types';

// Request tracking for processing time
const requestStartTimes = new Map<string, number>();

/**
 * Middleware to track request start time
 */
export const requestTrackingMiddleware = (req: Request, res: Response, next: Function) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  req.startTime = Date.now();
  requestStartTimes.set(requestId, req.startTime);
  
  // Set standard headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-API-Version', '1.0.0');
  
  next();
};

/**
 * Create standardized success response
 */
export const createSuccessResponse = <T>(
  req: Request, 
  data: T, 
  statusCode: number = 200
): StandardApiResponse<T> => {
  const requestId = req.requestId || uuidv4();
  const startTime = requestStartTimes.get(requestId) || req.startTime || Date.now();
  const processingTime = Date.now() - startTime;
  
  // Clean up tracking
  requestStartTimes.delete(requestId);
  
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      version: '1.0.0',
      processingTime
    }
  };
};

/**
 * Create standardized error response
 */
export const createErrorResponse = (
  req: Request,
  error: {
    code: string;
    message: string;
    details?: any;
  },
  statusCode: number = 500
): StandardApiResponse<null> => {
  const requestId = req.requestId || uuidv4();
  const startTime = requestStartTimes.get(requestId) || req.startTime || Date.now();
  const processingTime = Date.now() - startTime;
  
  // Clean up tracking
  requestStartTimes.delete(requestId);
  
  return {
    success: false,
    data: null,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      version: '1.0.0',
      processingTime
    }
  };
};

/**
 * Send standardized success response
 */
export const sendSuccessResponse = <T>(
  req: Request,
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  const response = createSuccessResponse(req, data, statusCode);
  res.status(statusCode).json(response);
};

/**
 * Send standardized error response
 */
export const sendErrorResponse = (
  req: Request,
  res: Response,
  error: {
    code: string;
    message: string;
    details?: any;
  },
  statusCode: number = 500
): void => {
  const response = createErrorResponse(req, error, statusCode);
  res.status(statusCode).json(response);
};

/**
 * Error handler middleware for standardized error responses
 */
export const standardErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: Function
): void => {
  console.error('Error occurred:', err);
  
  // Handle different error types
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'Internal server error';
  let details = undefined;
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = 'Validation failed';
    details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    errorMessage = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    errorMessage = 'Access denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    errorMessage = 'Resource not found';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    errorCode = err.code || 'ERROR';
    errorMessage = err.message || 'An error occurred';
    details = err.details;
  }
  
  sendErrorResponse(req, res, {
    code: errorCode,
    message: errorMessage,
    details
  }, statusCode);
};

/**
 * Extend Express Request interface
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Common error codes for consistency
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_INPUT: 'INVALID_INPUT',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  DEPRECATED_API: 'DEPRECATED_API',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  FEATURE_NOT_ENABLED: 'FEATURE_NOT_ENABLED',
  UNSUPPORTED_OPERATION: 'UNSUPPORTED_OPERATION'
} as const;

/**
 * Success response helper functions
 */
export const responseHelpers = {
  success: <T>(req: Request, res: Response, data: T) => 
    sendSuccessResponse(req, res, data, 200),
  
  created: <T>(req: Request, res: Response, data: T) => 
    sendSuccessResponse(req, res, data, 201),
  
  accepted: <T>(req: Request, res: Response, data: T) => 
    sendSuccessResponse(req, res, data, 202),
  
  noContent: (req: Request, res: Response) => 
    sendSuccessResponse(req, res, null, 204),
  
  badRequest: (req: Request, res: Response, message: string, details?: any) => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      details
    }, 400),
  
  unauthorized: (req: Request, res: Response, message: string = 'Authentication required') => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.UNAUTHORIZED,
      message
    }, 401),
  
  forbidden: (req: Request, res: Response, message: string = 'Access denied') => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.FORBIDDEN,
      message
    }, 403),
  
  notFound: (req: Request, res: Response, message: string = 'Resource not found') => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.NOT_FOUND,
      message
    }, 404),
  
  conflict: (req: Request, res: Response, message: string, details?: any) => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.CONFLICT,
      message,
      details
    }, 409),
  
  rateLimitExceeded: (req: Request, res: Response, message: string = 'Rate limit exceeded') => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message
    }, 429),
  
  internalServerError: (req: Request, res: Response, message: string = 'Internal server error', details?: any) => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
      details
    }, 500),
  
  serviceUnavailable: (req: Request, res: Response, message: string = 'Service temporarily unavailable') => 
    sendErrorResponse(req, res, {
      code: ERROR_CODES.SERVICE_UNAVAILABLE,
      message
    }, 503)
};

export default {
  requestTrackingMiddleware,
  createSuccessResponse,
  createErrorResponse,
  sendSuccessResponse,
  sendErrorResponse,
  standardErrorHandler,
  responseHelpers,
  ERROR_CODES
};