// MongoDB Production Configuration
// Document database for content management, analytics, and flexible schemas

module.exports = {
  // Database Information
  database: {
    name: 'MongoDB',
    type: 'document',
    version: '6.0',
    vendor: 'mongodb',
    role: 'content_analytics',
    enabled: true,
    description: 'MongoDB cluster for content management, analytics data, logs, and flexible document storage'
  },

  // Cluster Configuration
  cluster: {
    enabled: true,
    topology: 'replica_set',
    
    // Replica Set Configuration
    replicaSet: {
      name: 'getit-replica-set',
      members: [
        {
          host: process.env.MONGODB_PRIMARY_HOST || 'mongodb-primary.getit.internal',
          port: process.env.MONGODB_PRIMARY_PORT || 27017,
          role: 'primary',
          priority: 1,
          votes: 1,
          arbiterOnly: false
        },
        {
          host: process.env.MONGODB_SECONDARY1_HOST || 'mongodb-secondary-1.getit.internal',
          port: process.env.MONGODB_SECONDARY1_PORT || 27017,
          role: 'secondary',
          priority: 0.5,
          votes: 1,
          arbiterOnly: false
        },
        {
          host: process.env.MONGODB_SECONDARY2_HOST || 'mongodb-secondary-2.getit.internal',
          port: process.env.MONGODB_SECONDARY2_PORT || 27017,
          role: 'secondary',
          priority: 0.5,
          votes: 1,
          arbiterOnly: false
        },
        {
          host: process.env.MONGODB_ARBITER_HOST || 'mongodb-arbiter.getit.internal',
          port: process.env.MONGODB_ARBITER_PORT || 27017,
          role: 'arbiter',
          priority: 0,
          votes: 1,
          arbiterOnly: true
        }
      ],
      
      settings: {
        chainingAllowed: true,
        heartbeatIntervalMillis: 2000,
        heartbeatTimeoutSecs: 10,
        electionTimeoutMillis: 10000,
        catchUpTimeoutMillis: -1,
        getLastErrorModes: {},
        getLastErrorDefaults: {
          w: 'majority',
          wtimeout: 0
        }
      }
    },

    // Sharding Configuration (Future)
    sharding: {
      enabled: false, // Start with replica set, enable later for scale
      configServers: [],
      shards: [],
      mongosRouters: []
    }
  },

  // Connection Configuration
  connection: {
    // Connection String
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'getit_production',
    
    // Authentication
    auth: {
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
      authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
      authMechanism: 'SCRAM-SHA-256'
    },

    // Connection Pool
    pool: {
      minPoolSize: 5,
      maxPoolSize: 100,
      maxIdleTimeMS: 300000,    // 5 minutes
      waitQueueTimeoutMS: 30000, // 30 seconds
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,   // 60 seconds
      heartbeatFrequencyMS: 10000, // 10 seconds
      localThresholdMS: 15      // 15 milliseconds
    },

    // SSL/TLS Configuration
    ssl: {
      enabled: process.env.MONGODB_SSL_ENABLED === 'true',
      sslValidate: true,
      sslCA: process.env.MONGODB_SSL_CA,
      sslCert: process.env.MONGODB_SSL_CERT,
      sslKey: process.env.MONGODB_SSL_KEY,
      sslPass: process.env.MONGODB_SSL_PASS
    },

    // Read/Write Preferences
    readPreference: 'secondaryPreferred',
    readConcern: {
      level: 'majority'
    },
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 10000
    }
  },

  // Database Collections
  collections: {
    // Content Management
    content: {
      articles: {
        description: 'Blog articles and content pages',
        indexes: [
          { keys: { slug: 1 }, unique: true },
          { keys: { status: 1, publishedAt: -1 } },
          { keys: { tags: 1 } },
          { keys: { author: 1, createdAt: -1 } },
          { keys: { '$**': 'text' } } // Text search
        ],
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'content', 'status', 'author'],
            properties: {
              title: { bsonType: 'string', maxLength: 200 },
              content: { bsonType: 'string' },
              status: { enum: ['draft', 'published', 'archived'] },
              author: { bsonType: 'objectId' }
            }
          }
        }
      },

      media: {
        description: 'Media files metadata',
        indexes: [
          { keys: { type: 1, createdAt: -1 } },
          { keys: { userId: 1, createdAt: -1 } },
          { keys: { tags: 1 } },
          { keys: { filename: 1 } }
        ]
      },

      categories: {
        description: 'Dynamic category structure',
        indexes: [
          { keys: { slug: 1 }, unique: true },
          { keys: { parent: 1, order: 1 } },
          { keys: { level: 1, order: 1 } },
          { keys: { active: 1 } }
        ]
      }
    },

    // Analytics Collections
    analytics: {
      userEvents: {
        description: 'User behavior and interaction events',
        indexes: [
          { keys: { userId: 1, timestamp: -1 } },
          { keys: { event: 1, timestamp: -1 } },
          { keys: { sessionId: 1, timestamp: 1 } },
          { keys: { timestamp: -1 } },
          { keys: { productId: 1, timestamp: -1 } }
        ],
        // Time-based partitioning (TTL)
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 31536000 // 1 year
        }
      },

      searchQueries: {
        description: 'Search queries and results analytics',
        indexes: [
          { keys: { query: 1, timestamp: -1 } },
          { keys: { userId: 1, timestamp: -1 } },
          { keys: { timestamp: -1 } },
          { keys: { resultCount: 1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 15552000 // 6 months
        }
      },

      pageViews: {
        description: 'Page view analytics',
        indexes: [
          { keys: { page: 1, timestamp: -1 } },
          { keys: { userId: 1, timestamp: -1 } },
          { keys: { timestamp: -1 } },
          { keys: { referrer: 1, timestamp: -1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 7776000 // 3 months
        }
      },

      conversionFunnels: {
        description: 'Conversion funnel tracking',
        indexes: [
          { keys: { funnelId: 1, timestamp: -1 } },
          { keys: { userId: 1, step: 1 } },
          { keys: { timestamp: -1 } }
        ]
      }
    },

    // Logging Collections
    logs: {
      applicationLogs: {
        description: 'Application error and info logs',
        indexes: [
          { keys: { level: 1, timestamp: -1 } },
          { keys: { service: 1, timestamp: -1 } },
          { keys: { timestamp: -1 } },
          { keys: { correlationId: 1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 2592000 // 30 days
        }
      },

      auditLogs: {
        description: 'Security and audit logs',
        indexes: [
          { keys: { action: 1, timestamp: -1 } },
          { keys: { userId: 1, timestamp: -1 } },
          { keys: { resource: 1, timestamp: -1 } },
          { keys: { timestamp: -1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 31536000 // 1 year
        }
      },

      systemLogs: {
        description: 'System performance and health logs',
        indexes: [
          { keys: { component: 1, timestamp: -1 } },
          { keys: { severity: 1, timestamp: -1 } },
          { keys: { timestamp: -1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 604800 // 7 days
        }
      }
    },

    // Real-time Data
    realtime: {
      notifications: {
        description: 'User notifications',
        indexes: [
          { keys: { userId: 1, status: 1, createdAt: -1 } },
          { keys: { type: 1, createdAt: -1 } },
          { keys: { createdAt: -1 } }
        ],
        ttl: {
          field: 'createdAt',
          expireAfterSeconds: 7776000 // 3 months
        }
      },

      activityFeed: {
        description: 'User activity feed',
        indexes: [
          { keys: { userId: 1, timestamp: -1 } },
          { keys: { followingUserId: 1, timestamp: -1 } },
          { keys: { timestamp: -1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 2592000 // 30 days
        }
      },

      chatMessages: {
        description: 'Customer support chat messages',
        indexes: [
          { keys: { conversationId: 1, timestamp: 1 } },
          { keys: { userId: 1, timestamp: -1 } },
          { keys: { agentId: 1, timestamp: -1 } }
        ],
        ttl: {
          field: 'timestamp',
          expireAfterSeconds: 15552000 // 6 months
        }
      }
    },

    // Business Intelligence
    bi: {
      dailyMetrics: {
        description: 'Daily aggregated business metrics',
        indexes: [
          { keys: { date: -1 }, unique: true },
          { keys: { type: 1, date: -1 } }
        ]
      },

      vendorAnalytics: {
        description: 'Vendor performance analytics',
        indexes: [
          { keys: { vendorId: 1, date: -1 } },
          { keys: { date: -1 } }
        ]
      },

      productAnalytics: {
        description: 'Product performance analytics',
        indexes: [
          { keys: { productId: 1, date: -1 } },
          { keys: { category: 1, date: -1 } },
          { keys: { date: -1 } }
        ]
      }
    }
  },

  // Performance Configuration
  performance: {
    // Storage Engine
    storageEngine: 'wiredTiger',
    
    // WiredTiger Settings
    wiredTiger: {
      engineConfig: {
        cacheSizeGB: 8,
        journalCompressor: 'snappy',
        directoryForIndexes: true
      },
      collectionConfig: {
        blockCompressor: 'snappy'
      },
      indexConfig: {
        prefixCompression: true
      }
    },

    // Query Performance
    operationProfiling: {
      mode: 'slowOp',
      slowOpThresholdMs: 100,
      slowOpSampleRate: 1.0
    },

    // Indexing Strategy
    indexing: {
      background: true,
      sparse: true,
      partialFilterExpressions: true,
      wildcard: true
    },

    // Aggregation
    aggregation: {
      allowDiskUse: true,
      maxTimeMS: 30000,
      cursor: { batchSize: 1000 }
    }
  },

  // Sharding Configuration (Future)
  sharding: {
    enabled: false,
    strategy: 'range_based',
    
    shardKey: {
      userEvents: { userId: 1, timestamp: 1 },
      searchQueries: { timestamp: 1 },
      pageViews: { timestamp: 1 },
      notifications: { userId: 1 }
    },

    balancer: {
      enabled: true,
      activeWindow: {
        start: '02:00',
        stop: '06:00'
      }
    }
  },

  // Backup Configuration
  backup: {
    enabled: true,
    
    mongodump: {
      enabled: true,
      schedule: '0 1 * * *', // Daily at 1 AM
      location: process.env.MONGODB_BACKUP_LOCATION || 's3://getit-backups/mongodb',
      retention: 30, // days
      compression: true,
      oplog: true
    },

    oplogReplay: {
      enabled: true,
      retentionHours: 72
    },

    snapshotBackup: {
      enabled: true,
      schedule: '0 0 * * 0', // Weekly on Sunday
      location: process.env.MONGODB_SNAPSHOT_LOCATION || 's3://getit-snapshots/mongodb',
      retention: 4 // weeks
    },

    pointInTimeRecovery: {
      enabled: true,
      oplogSizeMB: 10240, // 10GB
      retentionHours: 168 // 7 days
    }
  },

  // Security Configuration
  security: {
    // Authentication
    authentication: {
      enabled: true,
      mechanism: 'SCRAM-SHA-256',
      
      users: [
        {
          user: 'app_user',
          pwd: process.env.MONGODB_APP_PASSWORD,
          roles: [
            { role: 'readWrite', db: 'getit_production' },
            { role: 'read', db: 'getit_analytics' }
          ]
        },
        {
          user: 'analytics_user',
          pwd: process.env.MONGODB_ANALYTICS_PASSWORD,
          roles: [
            { role: 'read', db: 'getit_production' },
            { role: 'readWrite', db: 'getit_analytics' }
          ]
        },
        {
          user: 'backup_user',
          pwd: process.env.MONGODB_BACKUP_PASSWORD,
          roles: [
            { role: 'backup', db: 'admin' },
            { role: 'read', db: 'getit_production' }
          ]
        },
        {
          user: 'admin_user',
          pwd: process.env.MONGODB_ADMIN_PASSWORD,
          roles: [
            { role: 'root', db: 'admin' }
          ]
        }
      ]
    },

    // Authorization
    authorization: {
      enabled: true,
      roles: [
        {
          role: 'contentManager',
          privileges: [
            {
              resource: { db: 'getit_production', collection: 'content.*' },
              actions: ['find', 'insert', 'update', 'remove']
            }
          ]
        },
        {
          role: 'analyticsReader',
          privileges: [
            {
              resource: { db: 'getit_production', collection: 'analytics.*' },
              actions: ['find']
            }
          ]
        }
      ]
    },

    // Encryption
    encryption: {
      atRest: {
        enabled: true,
        keyManagement: 'kmip',
        encryptionCipherMode: 'AES256-CBC'
      },
      inTransit: {
        enabled: true,
        mode: 'requireTLS',
        certificateKeyFile: process.env.MONGODB_TLS_CERT,
        CAFile: process.env.MONGODB_TLS_CA
      }
    },

    // Network Security
    network: {
      bindIp: '0.0.0.0',
      port: 27017,
      ipWhitelist: [
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16'
      ]
    },

    // Auditing
    auditing: {
      enabled: true,
      destination: 'file',
      path: '/var/log/mongodb/audit.log',
      format: 'JSON',
      filter: {
        atype: { $in: ['authenticate', 'authCheck', 'createUser', 'dropUser'] }
      }
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,

    metrics: {
      enabled: true,
      interval: 60, // seconds
      retention: 2592000, // 30 days

      systemMetrics: [
        'connections',
        'memory_usage',
        'cpu_usage',
        'disk_usage',
        'network_io',
        'opcounters',
        'opcountersRepl',
        'globalLock',
        'wiredTiger',
        'locks'
      ],

      databaseMetrics: [
        'collections',
        'indexes',
        'dataSize',
        'storageSize',
        'avgObjSize',
        'numExtents'
      ]
    },

    alerts: [
      {
        name: 'high_connection_usage',
        condition: 'connections_current > 80',
        duration: 300,
        severity: 'warning'
      },
      {
        name: 'high_memory_usage',
        condition: 'memory_resident > 8192', // 8GB
        duration: 300,
        severity: 'warning'
      },
      {
        name: 'replication_lag',
        condition: 'replication_lag > 10',
        duration: 120,
        severity: 'critical'
      },
      {
        name: 'slow_operations',
        condition: 'slow_ops_per_sec > 5',
        duration: 300,
        severity: 'warning'
      },
      {
        name: 'disk_space_low',
        condition: 'disk_usage > 85',
        duration: 60,
        severity: 'critical'
      }
    ],

    healthChecks: {
      enabled: true,
      interval: 30, // seconds
      timeout: 10,  // seconds

      checks: [
        'replica_set_status',
        'connection_test',
        'write_test',
        'read_test',
        'index_performance'
      ]
    }
  },

  // Data Management
  dataManagement: {
    // Collection Maintenance
    maintenance: {
      compaction: {
        enabled: true,
        schedule: '0 3 * * 0' // Weekly on Sunday at 3 AM
      },
      
      indexMaintenance: {
        enabled: true,
        schedule: '0 4 * * 0', // Weekly on Sunday at 4 AM
        rebuild: false,
        analyze: true
      }
    },

    // Data Lifecycle
    lifecycle: {
      archiving: {
        enabled: true,
        rules: [
          {
            collection: 'analytics.userEvents',
            condition: { timestamp: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
            action: 'archive'
          },
          {
            collection: 'logs.applicationLogs',
            condition: { timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
            action: 'delete'
          }
        ]
      },

      compression: {
        enabled: true,
        algorithm: 'snappy',
        level: 6
      }
    }
  },

  // Environment Configuration
  environment: {
    production: true,
    logLevel: 'info',
    verbosity: 'v',
    quiet: false,
    journal: true,
    smallFiles: false,
    prealloc: true,
    nsSize: 16,
    oplogSize: 10240 // 10GB
  },

  // Integration Configuration
  integration: {
    // ODM/ORM
    mongoose: {
      enabled: true,
      strictMode: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    },

    // Change Streams
    changeStreams: {
      enabled: true,
      collections: [
        'content.articles',
        'analytics.userEvents',
        'realtime.notifications'
      ],
      resumeAfter: true,
      startAtOperationTime: true
    },

    // GridFS
    gridfs: {
      enabled: true,
      bucket: 'uploads',
      chunkSizeBytes: 261120 // 255KB
    }
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    timezone: 'Asia/Dhaka',
    locale: 'bn_BD',
    currency: 'BDT',
    
    // Content Localization
    localization: {
      defaultLanguage: 'bn',
      supportedLanguages: ['bn', 'en'],
      contentFields: ['title', 'description', 'content', 'metadata']
    },
    
    // Compliance
    compliance: {
      dataRetention: {
        userEvents: 365, // days
        auditLogs: 2555,  // 7 years
        financialLogs: 2555, // 7 years
        personalData: 1095   // 3 years
      }
    }
  }
};