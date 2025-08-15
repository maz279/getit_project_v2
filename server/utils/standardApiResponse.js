/**
 * Standardized API Response Utilities for GetIt Bangladesh
 * Provides consistent response formatting across all endpoints
 */

const { v4: uuidv4 } = (() => {
  try {
    return require('uuid');
  } catch (error) {
    // Fallback if uuid is not available
    return { v4: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) };
  }
})();

/**
 * Request tracking middleware for standardized responses
 */
const requestTrackingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  req.requestId = uuidv4();
  req.startTime = startTime;

  const originalJson = res.json;
  res.json = function(data) {
    const processingTime = Date.now() - startTime;
    
    if (!data.metadata) {
      data.metadata = {};
    }
    
    data.metadata = {
      ...data.metadata,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      version: '1.0.0',
      processingTime
    };

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Standardized response helpers
 */
const responseHelpers = {
  success: (req, res, data, message = 'Success') => {
    const response = {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(200).json(response);
  },

  created: (req, res, data, message = 'Resource created successfully') => {
    const response = {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(201).json(response);
  },

  badRequest: (req, res, message = 'Bad request', details = null) => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'BAD_REQUEST',
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(400).json(response);
  },

  unauthorized: (req, res, message = 'Unauthorized access') => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(401).json(response);
  },

  forbidden: (req, res, message = 'Access forbidden') => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'FORBIDDEN',
        message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(403).json(response);
  },

  notFound: (req, res, message = 'Resource not found') => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'NOT_FOUND',
        message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(404).json(response);
  },

  conflict: (req, res, message = 'Resource conflict') => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'CONFLICT',
        message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(409).json(response);
  },

  internalServerError: (req, res, message = 'Internal server error', details = null) => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        details: details || 'An unexpected error occurred'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(500).json(response);
  },

  serviceUnavailable: (req, res, message = 'Service temporarily unavailable') => {
    const response = {
      success: false,
      data: null,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || uuidv4(),
        version: '1.0.0',
        processingTime: req.startTime ? Date.now() - req.startTime : 0
      }
    };
    return res.status(503).json(response);
  }
};

module.exports = {
  requestTrackingMiddleware,
  responseHelpers
};