// PostgreSQL Production Configuration
// Primary database for GetIt multi-vendor e-commerce platform

module.exports = {
  // Database Information
  database: {
    name: 'PostgreSQL',
    type: 'relational',
    version: '15.0',
    vendor: 'postgresql',
    role: 'primary',
    enabled: true,
    description: 'Primary PostgreSQL database for transactional data, user management, and core business logic'
  },

  // Connection Configuration
  connection: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DATABASE || 'getit_production',
    username: process.env.POSTGRES_USERNAME || 'getit_user',
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      enabled: true,
      rejectUnauthorized: true,
      ca: process.env.POSTGRES_SSL_CA,
      cert: process.env.POSTGRES_SSL_CERT,
      key: process.env.POSTGRES_SSL_KEY
    },
    applicationName: 'GetIt-Platform-Production',
    connectTimeout: 30000, // 30 seconds
    idleTimeout: 600000,   // 10 minutes
    maxLifetime: 3600000   // 1 hour
  },

  // Connection Pool Configuration
  pool: {
    min: 10,
    max: 100,
    acquireTimeout: 30000, // 30 seconds
    createTimeout: 30000,  // 30 seconds
    destroyTimeout: 5000,  // 5 seconds
    idleTimeout: 300000,   // 5 minutes
    reapInterval: 60000,   // 1 minute
    createRetryInterval: 200,
    validateConnection: true,
    testOnBorrow: true,
    evictionRunIntervalMillis: 30000,
    numTestsPerEvictionRun: 5,
    minEvictableIdleTimeMillis: 300000
  },

  // Schema Configuration
  schemas: {
    main: {
      name: 'public',
      description: 'Main application schema',
      tables: [
        'users',
        'profiles',
        'vendors',
        'products',
        'categories',
        'orders',
        'order_items',
        'order_status_history',
        'payment_transactions',
        'shipments',
        'shipment_tracking',
        'cart_items',
        'user_sessions',
        'user_behavior',
        'reviews',
        'ratings'
      ]
    },
    analytics: {
      name: 'analytics',
      description: 'Analytics and reporting data',
      tables: [
        'user_events',
        'product_views',
        'search_queries',
        'conversion_metrics',
        'revenue_analytics',
        'vendor_performance',
        'geographic_analytics'
      ]
    },
    audit: {
      name: 'audit',
      description: 'Audit trail and compliance data',
      tables: [
        'audit_logs',
        'data_changes',
        'compliance_records',
        'security_events',
        'access_logs'
      ]
    },
    staging: {
      name: 'staging',
      description: 'Staging area for data processing',
      tables: [
        'import_staging',
        'export_staging',
        'data_validation',
        'batch_processing'
      ]
    }
  },

  // Performance Configuration
  performance: {
    // Query Performance
    queryTimeout: 30000, // 30 seconds
    slowQueryThreshold: 5000, // 5 seconds
    enableQueryLogging: true,
    logSlowQueries: true,
    
    // Memory Settings
    sharedBuffers: '2GB',
    effectiveCacheSize: '8GB',
    workMem: '64MB',
    maintenanceWorkMem: '512MB',
    
    // Checkpoint Settings
    checkpointTimeout: '5min',
    checkpointCompletionTarget: 0.9,
    walBuffers: '16MB',
    walSegmentSize: '16MB',
    
    // Parallel Processing
    maxWorkerProcesses: 16,
    maxParallelWorkersPerGather: 4,
    maxParallelMaintenanceWorkers: 4,
    
    // Vacuum Settings
    autovacuum: true,
    autovacuumMaxWorkers: 6,
    autovacuumVacuumThreshold: 1000,
    autovacuumAnalyzeThreshold: 1000,
    autovacuumVacuumScaleFactor: 0.1,
    autovacuumAnalyzeScaleFactor: 0.05
  },

  // Replication Configuration
  replication: {
    enabled: true,
    mode: 'streaming',
    synchronous: false,
    
    master: {
      host: process.env.POSTGRES_MASTER_HOST,
      port: process.env.POSTGRES_MASTER_PORT || 5432,
      replicationUser: process.env.POSTGRES_REPLICATION_USER,
      replicationPassword: process.env.POSTGRES_REPLICATION_PASSWORD
    },
    
    slaves: [
      {
        name: 'read-replica-1',
        host: process.env.POSTGRES_SLAVE1_HOST,
        port: process.env.POSTGRES_SLAVE1_PORT || 5432,
        role: 'read',
        priority: 1
      },
      {
        name: 'read-replica-2',
        host: process.env.POSTGRES_SLAVE2_HOST,
        port: process.env.POSTGRES_SLAVE2_PORT || 5432,
        role: 'read',
        priority: 2
      }
    ],
    
    readWriteSplit: {
      enabled: true,
      writeOperations: ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'],
      readOperations: ['SELECT'],
      readPreference: 'slave_preferred'
    }
  },

  // Backup Configuration
  backup: {
    enabled: true,
    strategy: 'continuous',
    
    fullBackup: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: 30, // days
      compression: true,
      encryption: true,
      location: process.env.POSTGRES_BACKUP_LOCATION || 's3://getit-backups/postgres/full'
    },
    
    incrementalBackup: {
      enabled: true,
      schedule: '0 */6 * * *', // Every 6 hours
      retention: 7, // days
      compression: true,
      encryption: true,
      location: process.env.POSTGRES_BACKUP_LOCATION || 's3://getit-backups/postgres/incremental'
    },
    
    walArchiving: {
      enabled: true,
      archiveMode: 'on',
      archiveCommand: 'aws s3 cp %p s3://getit-wal-archive/%f',
      archiveTimeout: 300, // 5 minutes
      maxWalSize: '2GB',
      minWalSize: '1GB'
    },
    
    pointInTimeRecovery: {
      enabled: true,
      retentionPeriod: 7 // days
    }
  },

  // Security Configuration
  security: {
    authentication: {
      method: 'md5',
      passwordEncryption: 'scram-sha-256',
      passwordMinLength: 12,
      passwordComplexity: true,
      passwordExpiry: 90, // days
      maxConnections: 200
    },
    
    authorization: {
      roleBasedAccess: true,
      rowLevelSecurity: true,
      columnLevelSecurity: true,
      
      roles: [
        {
          name: 'app_read',
          permissions: ['SELECT'],
          schemas: ['public', 'analytics']
        },
        {
          name: 'app_write',
          permissions: ['SELECT', 'INSERT', 'UPDATE'],
          schemas: ['public']
        },
        {
          name: 'app_admin',
          permissions: ['ALL'],
          schemas: ['public', 'analytics', 'audit']
        },
        {
          name: 'readonly_user',
          permissions: ['SELECT'],
          schemas: ['public'],
          restrictions: ['no_sensitive_data']
        }
      ]
    },
    
    encryption: {
      dataAtRest: {
        enabled: true,
        algorithm: 'AES-256',
        keyRotation: true,
        keyRotationInterval: 90 // days
      },
      dataInTransit: {
        enabled: true,
        tlsVersion: '1.3',
        cipherSuites: ['ECDHE-RSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES128-GCM-SHA256']
      },
      sensitiveColumns: [
        'users.password_hash',
        'users.email',
        'users.phone',
        'payment_transactions.card_number',
        'payment_transactions.cvv',
        'vendors.bank_account',
        'profiles.nid_number',
        'profiles.tin_number'
      ]
    },
    
    auditing: {
      enabled: true,
      auditLevel: 'detailed',
      logConnections: true,
      logDisconnections: true,
      logStatement: 'all',
      logDuration: true,
      logLockWaits: true,
      logCheckpoints: true,
      auditTables: [
        'users',
        'vendors',
        'orders',
        'payment_transactions',
        'products'
      ]
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    
    metrics: {
      enabled: true,
      collectionInterval: 60, // seconds
      retentionPeriod: 90, // days
      
      systemMetrics: [
        'cpu_usage',
        'memory_usage',
        'disk_usage',
        'network_io',
        'disk_io'
      ],
      
      databaseMetrics: [
        'active_connections',
        'idle_connections',
        'queries_per_second',
        'transactions_per_second',
        'buffer_hit_ratio',
        'index_hit_ratio',
        'lock_waits',
        'deadlocks',
        'slow_queries',
        'table_sizes',
        'index_sizes'
      ]
    },
    
    alerting: {
      enabled: true,
      channels: ['email', 'slack', 'webhook'],
      
      alerts: [
        {
          name: 'high_cpu_usage',
          condition: 'cpu_usage > 80',
          duration: 300, // 5 minutes
          severity: 'warning'
        },
        {
          name: 'high_memory_usage',
          condition: 'memory_usage > 85',
          duration: 300,
          severity: 'warning'
        },
        {
          name: 'connection_limit',
          condition: 'active_connections > 80',
          duration: 60,
          severity: 'critical'
        },
        {
          name: 'slow_query_threshold',
          condition: 'slow_queries > 10',
          duration: 300,
          severity: 'warning'
        },
        {
          name: 'replication_lag',
          condition: 'replication_lag > 30',
          duration: 120,
          severity: 'critical'
        }
      ]
    },
    
    healthChecks: {
      enabled: true,
      interval: 30, // seconds
      timeout: 10,  // seconds
      
      checks: [
        'connection_test',
        'query_performance',
        'replication_status',
        'disk_space',
        'backup_status'
      ]
    }
  },

  // Maintenance Configuration
  maintenance: {
    vacuumSchedule: {
      enabled: true,
      schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
      options: ['ANALYZE', 'VERBOSE']
    },
    
    reindexSchedule: {
      enabled: true,
      schedule: '0 4 1 * *', // Monthly on 1st at 4 AM
      concurrently: true
    },
    
    statisticsUpdate: {
      enabled: true,
      schedule: '0 1 * * *', // Daily at 1 AM
      sampleSize: 10000
    },
    
    logRotation: {
      enabled: true,
      schedule: '0 0 * * *', // Daily at midnight
      retention: 30, // days
      compression: true
    }
  },

  // Data Management
  dataManagement: {
    partitioning: {
      enabled: true,
      strategy: 'range',
      
      partitionedTables: [
        {
          table: 'user_behavior',
          column: 'created_at',
          interval: 'monthly',
          retention: 24 // months
        },
        {
          table: 'audit_logs',
          column: 'created_at',
          interval: 'monthly',
          retention: 12 // months
        },
        {
          table: 'user_events',
          column: 'event_date',
          interval: 'monthly',
          retention: 6 // months
        }
      ]
    },
    
    archiving: {
      enabled: true,
      strategy: 'date_based',
      
      archiveRules: [
        {
          table: 'order_status_history',
          condition: 'created_at < NOW() - INTERVAL \'2 years\'',
          destination: 'archive_orders'
        },
        {
          table: 'user_sessions',
          condition: 'updated_at < NOW() - INTERVAL \'1 year\'',
          destination: 'archive_sessions'
        }
      ]
    },
    
    dataRetention: {
      enabled: true,
      policies: [
        {
          table: 'user_behavior',
          retention: '2 years',
          action: 'delete'
        },
        {
          table: 'search_queries',
          retention: '1 year',
          action: 'anonymize'
        },
        {
          table: 'access_logs',
          retention: '6 months',
          action: 'delete'
        }
      ]
    }
  },

  // Environment Specific Settings
  environment: {
    production: true,
    logLevel: 'info',
    debugMode: false,
    performanceLogging: true,
    queryOptimization: true,
    cacheEnabled: true,
    compressionEnabled: true
  },

  // Integration Configuration
  integration: {
    orm: {
      drizzle: {
        enabled: true,
        schema: '@shared/schema',
        migrations: 'migrations/',
        introspection: false
      }
    },
    
    connectionManager: {
      pooling: true,
      clustering: true,
      loadBalancing: true,
      failover: true
    },
    
    caching: {
      queryCache: true,
      resultCache: true,
      schemaCache: true,
      connectionCache: true
    }
  },

  // Compliance Configuration
  compliance: {
    gdpr: {
      enabled: false, // Not applicable for Bangladesh
      dataProcessingLog: false,
      rightToErasure: false
    },
    
    bangladesh: {
      dataProtectionAct: true,
      digitalCommerce: true,
      financialRegulation: true,
      
      auditRequirements: {
        transactionLogs: true,
        userActivityLogs: true,
        dataAccessLogs: true,
        systemChangeLogs: true
      }
    },
    
    pciDss: {
      enabled: true,
      level: 'Level 1',
      requirements: [
        'secure_network',
        'protect_cardholder_data',
        'maintain_vulnerability_program',
        'implement_access_controls',
        'monitor_networks',
        'maintain_security_policy'
      ]
    }
  }
};