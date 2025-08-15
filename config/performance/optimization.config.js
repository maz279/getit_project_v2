// GetIt Performance Optimization Configuration
// Fine-tuned settings for Amazon.com/Shopee.sg level performance

export default {
  performance: {
    name: 'GetIt Performance Optimization',
    version: '1.0.0',
    environment: 'production',
    optimizationLevel: 'maximum',
    bangladeshSpecific: true
  },

  // Application Performance Tuning
  application: {
    nodeJs: {
      // V8 optimization flags
      v8Flags: [
        '--max-old-space-size=4096',
        '--max-new-space-size=512',
        '--optimize-for-size',
        '--turbo-fast-api-calls',
        '--use-osr',
        '--concurrent-recompilation',
        '--parallel-compile-tasks'
      ],
      
      // Event loop optimization
      eventLoop: {
        lag: 10, // milliseconds
        delay: 42, // milliseconds for microtask processing
        check: 5000 // health check interval
      },
      
      // Memory management
      memory: {
        gc: {
          incremental: true,
          concurrent: true,
          parallelMarking: true,
          enableIdle: true
        },
        heapSnapshot: {
          enabled: false, // Disable in production
          interval: 0
        }
      }
    },

    // Express.js optimizations
    express: {
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) return false;
          return true;
        }
      },
      
      // Request parsing limits
      limits: {
        jsonLimit: '50mb',
        urlencodedLimit: '50mb',
        parameterLimit: 1000,
        arrayLimit: 100
      },
      
      // Trust proxy settings for Bangladesh CDN
      trustProxy: {
        enabled: true,
        hops: 2 // Through Bangladesh CDN providers
      }
    }
  },

  // Database Performance Optimization
  database: {
    postgresql: {
      // Connection pooling fine-tuning
      pool: {
        min: 20,
        max: 200,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 300000,
        reapIntervalMillis: 60000,
        createRetryIntervalMillis: 200,
        propagateCreateError: false
      },
      
      // Query optimization
      query: {
        timeout: 30000,
        preparedStatements: true,
        binaryResults: true,
        parseInputDatesAsUTC: true,
        statementCacheSize: 1000
      }
    },

    redis: {
      // Connection optimization
      connection: {
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000
      },
      
      // Memory optimization
      memory: {
        maxMemoryPolicy: 'allkeys-lru',
        maxMemory: '4gb',
        keyCompression: true,
        hashMaxZiplistEntries: 512,
        hashMaxZiplistValue: 64
      }
    }
  },

  // Bangladesh Market Specific Optimizations
  bangladeshMarket: {
    // Payment gateway performance
    paymentGateways: {
      connectionPool: {
        bkash: { max: 50, timeout: 30000 },
        nagad: { max: 50, timeout: 30000 },
        rocket: { max: 30, timeout: 30000 },
        sslcommerz: { max: 40, timeout: 25000 }
      },
      
      // Retry strategies for Bangladesh networks
      retryStrategy: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        jitter: true
      }
    },
    
    // Shipping partner optimization
    shipping: {
      connectionPool: {
        pathao: { max: 30, timeout: 20000 },
        paperfly: { max: 25, timeout: 25000 },
        redx: { max: 20, timeout: 20000 },
        ecourier: { max: 20, timeout: 20000 },
        sundarban: { max: 15, timeout: 25000 }
      },
      
      // Bangladesh geographic optimization
      zoneOptimization: {
        dhaka: { priority: 1, timeout: 10000 },
        chittagong: { priority: 2, timeout: 15000 },
        sylhet: { priority: 3, timeout: 20000 },
        rajshahi: { priority: 4, timeout: 25000 },
        khulna: { priority: 4, timeout: 25000 },
        barisal: { priority: 5, timeout: 30000 },
        rangpur: { priority: 5, timeout: 30000 },
        mymensingh: { priority: 5, timeout: 30000 }
      }
    }
  }
};