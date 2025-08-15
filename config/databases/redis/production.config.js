// Redis Production Configuration
// Distributed cache and session management for GetIt platform

module.exports = {
  // Database Information
  database: {
    name: 'Redis',
    type: 'key_value',
    version: '7.0',
    vendor: 'redis',
    role: 'cache_session',
    enabled: true,
    description: 'Redis cluster for distributed caching, session management, and real-time data'
  },

  // Cluster Configuration
  cluster: {
    enabled: true,
    mode: 'cluster',
    
    nodes: [
      {
        name: 'redis-master-1',
        host: process.env.REDIS_MASTER1_HOST || 'redis-master-1.getit.internal',
        port: process.env.REDIS_MASTER1_PORT || 6379,
        role: 'master',
        slots: '0-5460'
      },
      {
        name: 'redis-master-2',
        host: process.env.REDIS_MASTER2_HOST || 'redis-master-2.getit.internal',
        port: process.env.REDIS_MASTER2_PORT || 6379,
        role: 'master',
        slots: '5461-10922'
      },
      {
        name: 'redis-master-3',
        host: process.env.REDIS_MASTER3_HOST || 'redis-master-3.getit.internal',
        port: process.env.REDIS_MASTER3_PORT || 6379,
        role: 'master',
        slots: '10923-16383'
      },
      {
        name: 'redis-slave-1',
        host: process.env.REDIS_SLAVE1_HOST || 'redis-slave-1.getit.internal',
        port: process.env.REDIS_SLAVE1_PORT || 6379,
        role: 'slave',
        masterOf: 'redis-master-1'
      },
      {
        name: 'redis-slave-2',
        host: process.env.REDIS_SLAVE2_HOST || 'redis-slave-2.getit.internal',
        port: process.env.REDIS_SLAVE2_PORT || 6379,
        role: 'slave',
        masterOf: 'redis-master-2'
      },
      {
        name: 'redis-slave-3',
        host: process.env.REDIS_SLAVE3_HOST || 'redis-slave-3.getit.internal',
        port: process.env.REDIS_SLAVE3_PORT || 6379,
        role: 'slave',
        masterOf: 'redis-master-3'
      }
    ],

    failover: {
      enabled: true,
      autoFailover: true,
      failoverTimeout: 5000, // 5 seconds
      nodeTimeout: 15000,    // 15 seconds
      retryDelayOnFailover: 100,
      retryDelayOnClusterDown: 300,
      maxRedirects: 16
    }
  },

  // Connection Configuration
  connection: {
    // Single Node Fallback
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    
    // Connection Pool
    family: 4, // IPv4
    keepAlive: true,
    connectTimeout: 10000, // 10 seconds
    commandTimeout: 5000,  // 5 seconds
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    
    // TLS Configuration
    tls: {
      enabled: process.env.REDIS_TLS_ENABLED === 'true',
      cert: process.env.REDIS_TLS_CERT,
      key: process.env.REDIS_TLS_KEY,
      ca: process.env.REDIS_TLS_CA,
      rejectUnauthorized: true
    }
  },

  // Database Selection
  databases: {
    sessions: {
      db: 0,
      description: 'User sessions and authentication tokens',
      keyPattern: 'session:*',
      defaultTTL: 3600, // 1 hour
      maxTTL: 86400     // 24 hours
    },
    
    cache: {
      db: 1,
      description: 'Application cache (products, categories, etc.)',
      keyPattern: 'cache:*',
      defaultTTL: 1800, // 30 minutes
      maxTTL: 7200      // 2 hours
    },
    
    analytics: {
      db: 2,
      description: 'Real-time analytics and counters',
      keyPattern: 'analytics:*',
      defaultTTL: 86400, // 24 hours
      maxTTL: 604800     // 7 days
    },
    
    queue: {
      db: 3,
      description: 'Background job queues',
      keyPattern: 'queue:*',
      defaultTTL: 3600, // 1 hour
      maxTTL: 86400     // 24 hours
    },
    
    ratelimit: {
      db: 4,
      description: 'Rate limiting counters',
      keyPattern: 'ratelimit:*',
      defaultTTL: 3600, // 1 hour
      maxTTL: 3600      // 1 hour
    },
    
    pubsub: {
      db: 5,
      description: 'Pub/Sub messaging',
      keyPattern: 'pubsub:*',
      defaultTTL: 300,  // 5 minutes
      maxTTL: 1800      // 30 minutes
    }
  },

  // Performance Configuration
  performance: {
    // Memory Settings
    maxMemory: '4gb',
    maxMemoryPolicy: 'allkeys-lru',
    maxMemorySamples: 5,
    
    // Persistence Settings
    save: [
      { seconds: 900, changes: 1 },    // Save if at least 1 key changed in 900 seconds
      { seconds: 300, changes: 10 },   // Save if at least 10 keys changed in 300 seconds
      { seconds: 60, changes: 10000 }  // Save if at least 10000 keys changed in 60 seconds
    ],
    
    // RDB Configuration
    rdbCompression: true,
    rdbChecksum: true,
    rdbSaveIncrementalFsync: true,
    
    // AOF Configuration
    appendOnly: true,
    appendFsync: 'everysec',
    appendRewriteIncrementalFsync: true,
    autoAofRewritePercentage: 100,
    autoAofRewriteMinSize: '64mb',
    
    // Network Settings
    tcpKeepAlive: 300,
    tcpBacklog: 511,
    timeout: 0,
    
    // Client Settings
    maxClients: 10000,
    clientQueryBufferLimit: '1gb',
    clientOutputBufferLimit: {
      normal: '0 0 0',
      replica: '256mb 64mb 60',
      pubsub: '32mb 8mb 60'
    }
  },

  // Caching Strategies
  caching: {
    // Product Cache
    products: {
      enabled: true,
      keyPrefix: 'product:',
      ttl: 3600, // 1 hour
      strategy: 'write_through',
      invalidation: ['product_update', 'inventory_change'],
      compression: true
    },
    
    // Category Cache
    categories: {
      enabled: true,
      keyPrefix: 'category:',
      ttl: 7200, // 2 hours
      strategy: 'write_behind',
      invalidation: ['category_update'],
      compression: false
    },
    
    // User Profile Cache
    userProfiles: {
      enabled: true,
      keyPrefix: 'user:profile:',
      ttl: 1800, // 30 minutes
      strategy: 'lazy_loading',
      invalidation: ['profile_update'],
      compression: true
    },
    
    // Search Results Cache
    searchResults: {
      enabled: true,
      keyPrefix: 'search:',
      ttl: 900, // 15 minutes
      strategy: 'cache_aside',
      invalidation: ['product_update', 'inventory_change'],
      compression: true,
      maxResults: 1000
    },
    
    // Vendor Cache
    vendors: {
      enabled: true,
      keyPrefix: 'vendor:',
      ttl: 3600, // 1 hour
      strategy: 'write_through',
      invalidation: ['vendor_update'],
      compression: true
    },
    
    // Cart Cache
    carts: {
      enabled: true,
      keyPrefix: 'cart:',
      ttl: 86400, // 24 hours
      strategy: 'write_through',
      invalidation: ['cart_update', 'user_logout'],
      compression: false,
      persistOnExpiry: true
    }
  },

  // Session Management
  sessions: {
    enabled: true,
    keyPrefix: 'session:',
    
    // Session Types
    types: {
      user: {
        ttl: 3600,    // 1 hour
        rolling: true,
        secure: true,
        httpOnly: true
      },
      admin: {
        ttl: 1800,    // 30 minutes
        rolling: true,
        secure: true,
        httpOnly: true,
        requireReauth: true
      },
      vendor: {
        ttl: 7200,    // 2 hours
        rolling: true,
        secure: true,
        httpOnly: true
      },
      guest: {
        ttl: 86400,   // 24 hours
        rolling: false,
        secure: false,
        httpOnly: false
      }
    },
    
    // Session Security
    security: {
      encryption: true,
      algorithm: 'aes-256-gcm',
      secretKey: process.env.SESSION_SECRET_KEY,
      signatureValidation: true,
      ipValidation: true,
      userAgentValidation: true,
      concurrentSessions: 3
    },
    
    // Session Cleanup
    cleanup: {
      enabled: true,
      interval: 3600, // 1 hour
      batchSize: 1000,
      expiredSessionGracePeriod: 300 // 5 minutes
    }
  },

  // Rate Limiting
  rateLimiting: {
    enabled: true,
    keyPrefix: 'ratelimit:',
    
    // API Rate Limits
    api: {
      global: {
        window: 3600,  // 1 hour
        limit: 10000,  // requests
        skipSuccessfulRequests: false
      },
      perUser: {
        window: 3600,  // 1 hour
        limit: 1000,   // requests
        skipSuccessfulRequests: true
      },
      perIP: {
        window: 3600,  // 1 hour
        limit: 5000,   // requests
        skipSuccessfulRequests: false
      }
    },
    
    // Authentication Rate Limits
    auth: {
      login: {
        window: 900,   // 15 minutes
        limit: 5,      // attempts
        blockDuration: 900
      },
      register: {
        window: 3600,  // 1 hour
        limit: 3,      // attempts
        blockDuration: 3600
      },
      passwordReset: {
        window: 3600,  // 1 hour
        limit: 3,      // attempts
        blockDuration: 3600
      }
    },
    
    // Search Rate Limits
    search: {
      window: 60,    // 1 minute
      limit: 100,    // searches
      skipCache: false
    }
  },

  // Pub/Sub Configuration
  pubsub: {
    enabled: true,
    
    channels: {
      // Real-time Notifications
      notifications: {
        pattern: 'notifications:*',
        maxSubscribers: 10000,
        messageRetention: 100
      },
      
      // Order Updates
      orders: {
        pattern: 'orders:*',
        maxSubscribers: 1000,
        messageRetention: 50
      },
      
      // Inventory Updates
      inventory: {
        pattern: 'inventory:*',
        maxSubscribers: 500,
        messageRetention: 25
      },
      
      // Analytics Events
      analytics: {
        pattern: 'analytics:*',
        maxSubscribers: 100,
        messageRetention: 1000
      },
      
      // System Events
      system: {
        pattern: 'system:*',
        maxSubscribers: 50,
        messageRetention: 200
      }
    },
    
    // Message Format
    messageFormat: {
      encoding: 'json',
      compression: true,
      encryption: false,
      maxMessageSize: '1mb'
    }
  },

  // Background Jobs
  jobs: {
    enabled: true,
    keyPrefix: 'job:',
    
    queues: {
      // High Priority Queue
      high: {
        concurrency: 10,
        attempts: 3,
        backoff: 'exponential',
        delay: 0
      },
      
      // Default Queue
      default: {
        concurrency: 5,
        attempts: 3,
        backoff: 'fixed',
        delay: 1000
      },
      
      // Low Priority Queue
      low: {
        concurrency: 2,
        attempts: 2,
        backoff: 'fixed',
        delay: 5000
      },
      
      // Email Queue
      email: {
        concurrency: 3,
        attempts: 5,
        backoff: 'exponential',
        delay: 2000
      }
    },
    
    // Job Types
    jobTypes: {
      'send_email': { queue: 'email', priority: 'normal' },
      'process_payment': { queue: 'high', priority: 'high' },
      'update_inventory': { queue: 'default', priority: 'normal' },
      'generate_report': { queue: 'low', priority: 'low' },
      'send_notification': { queue: 'default', priority: 'normal' },
      'backup_data': { queue: 'low', priority: 'low' }
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    
    metrics: {
      enabled: true,
      interval: 60, // seconds
      retention: 86400, // 24 hours
      
      systemMetrics: [
        'memory_usage',
        'cpu_usage',
        'network_io',
        'disk_io',
        'connected_clients',
        'total_connections_received',
        'total_commands_processed',
        'instantaneous_ops_per_sec',
        'keyspace_hits',
        'keyspace_misses',
        'expired_keys',
        'evicted_keys'
      ]
    },
    
    alerts: [
      {
        name: 'high_memory_usage',
        condition: 'memory_usage > 80',
        duration: 300,
        severity: 'warning'
      },
      {
        name: 'high_cpu_usage',
        condition: 'cpu_usage > 85',
        duration: 300,
        severity: 'warning'
      },
      {
        name: 'low_hit_ratio',
        condition: 'hit_ratio < 0.8',
        duration: 600,
        severity: 'warning'
      },
      {
        name: 'connection_limit',
        condition: 'connected_clients > 8000',
        duration: 60,
        severity: 'critical'
      },
      {
        name: 'cluster_node_down',
        condition: 'cluster_state != ok',
        duration: 30,
        severity: 'critical'
      }
    ],
    
    healthChecks: {
      enabled: true,
      interval: 30, // seconds
      timeout: 5,   // seconds
      
      checks: [
        'ping_test',
        'memory_usage',
        'cluster_status',
        'replication_status',
        'persistence_status'
      ]
    }
  },

  // Security Configuration
  security: {
    // Authentication
    auth: {
      enabled: true,
      requireAuth: true,
      password: process.env.REDIS_PASSWORD,
      
      // ACL Configuration
      acl: {
        enabled: true,
        users: [
          {
            username: 'app_user',
            password: process.env.REDIS_APP_PASSWORD,
            commands: ['+@read', '+@write', '-flushdb', '-flushall', '-debug'],
            keys: ['cache:*', 'session:*', 'user:*'],
            channels: ['notifications:*', 'orders:*']
          },
          {
            username: 'admin_user',
            password: process.env.REDIS_ADMIN_PASSWORD,
            commands: ['+@all'],
            keys: ['*'],
            channels: ['*']
          },
          {
            username: 'readonly_user',
            password: process.env.REDIS_READONLY_PASSWORD,
            commands: ['+@read', '-@dangerous'],
            keys: ['*'],
            channels: ['*']
          }
        ]
      }
    },
    
    // Network Security
    network: {
      bindAddress: '0.0.0.0',
      protectedMode: true,
      tcpKeepAlive: 300,
      
      // IP Whitelist
      allowedIPs: [
        '10.0.0.0/8',     // Private network
        '172.16.0.0/12',  // Private network
        '192.168.0.0/16'  // Private network
      ]
    },
    
    // Data Security
    data: {
      encryption: {
        enabled: false, // Redis doesn't support native encryption
        external: true  // Handled by infrastructure
      },
      
      masking: {
        enabled: true,
        patterns: [
          'session:*:email',
          'session:*:phone',
          'user:*:personal_info'
        ]
      }
    }
  },

  // Backup Configuration
  backup: {
    enabled: true,
    
    rdb: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      location: process.env.REDIS_BACKUP_LOCATION || 's3://getit-backups/redis/rdb',
      retention: 7, // days
      compression: true
    },
    
    aof: {
      enabled: true,
      rewriteSchedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
      location: process.env.REDIS_AOF_BACKUP_LOCATION || 's3://getit-backups/redis/aof',
      retention: 3, // days
      compression: true
    }
  },

  // Environment Configuration
  environment: {
    production: true,
    logLevel: 'notice',
    debugMode: false,
    slowlogMaxLen: 128,
    slowlogLogSlowerThan: 10000, // 10ms
    latencyMonitoring: true
  }
};