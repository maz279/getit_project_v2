/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * PostgreSQL Primary Database Configuration
 * Amazon.com/Shopee.sg-Level Database Architecture
 * Last Updated: July 6, 2025
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(__dirname, '../../environments', `${env}.env`) });

/**
 * Primary PostgreSQL Database Configuration
 * Optimized for high-performance e-commerce operations
 */
module.exports = {
  // Basic Connection Configuration
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'getit_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    
    // SSL Configuration for Production
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
      ca: process.env.DB_SSL_CA_CERT,
      cert: process.env.DB_SSL_CLIENT_CERT,
      key: process.env.DB_SSL_CLIENT_KEY
    } : false
  },

  // Connection Pool Configuration
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  },

  // Performance Optimization Settings
  performance: {
    // Query Timeout Settings
    statement_timeout: '60s',
    lock_timeout: '30s',
    idle_in_transaction_session_timeout: '300s',
    
    // Memory Settings
    shared_buffers: '256MB',
    effective_cache_size: '1GB',
    work_mem: '4MB',
    maintenance_work_mem: '64MB',
    
    // Checkpoint Settings
    checkpoint_completion_target: 0.9,
    wal_buffers: '16MB',
    max_wal_size: '1GB',
    min_wal_size: '80MB',
    
    // Connection Settings
    max_connections: 100,
    shared_preload_libraries: ['pg_stat_statements', 'auto_explain']
  },

  // E-commerce Specific Optimizations
  ecommerce: {
    // Product Catalog Optimizations
    catalog: {
      // Enable full-text search
      enable_fts: true,
      fts_config: 'english',
      // Product indexing strategy
      index_strategy: 'concurrent',
      // Image storage optimization
      large_object_threshold: '2MB'
    },

    // Order Processing Optimizations
    orders: {
      // Transaction isolation for orders
      isolation_level: 'READ COMMITTED',
      // Lock timeout for inventory
      lock_timeout: '5s',
      // Enable row-level security
      row_level_security: true
    },

    // Analytics Optimizations
    analytics: {
      // Partitioning strategy for analytics tables
      partition_strategy: 'monthly',
      // Compression for historical data
      compression: 'lz4',
      // Materialized view refresh
      matview_refresh: 'incremental'
    }
  },

  // Bangladesh-Specific Configuration
  bangladesh: {
    // Timezone Settings
    timezone: 'Asia/Dhaka',
    
    // Currency and Localization
    locale: 'bn_BD',
    currency_code: 'BDT',
    
    // Text Search Configuration
    text_search: {
      // Bengali language support
      dictionaries: ['bengali', 'english'],
      stemming: true,
      stop_words: true
    },

    // Regulatory Compliance
    compliance: {
      // Data retention policies
      data_retention: {
        user_data: '7 years',
        transaction_data: '10 years',
        audit_logs: 'indefinite'
      },
      
      // Encryption requirements
      encryption: {
        sensitive_fields: ['nid', 'phone', 'bank_account'],
        algorithm: 'AES-256-GCM'
      }
    }
  },

  // Monitoring and Logging
  monitoring: {
    // Enable statement logging
    log_statement: process.env.NODE_ENV === 'development' ? 'all' : 'ddl',
    log_min_duration_statement: process.env.NODE_ENV === 'production' ? 1000 : 0,
    
    // Enable auto_explain for slow queries
    auto_explain: {
      enabled: true,
      log_min_duration: '1s',
      log_analyze: true,
      log_buffers: true,
      log_timing: true,
      log_triggers: true,
      log_verbose: true
    },

    // Performance tracking
    pg_stat_statements: {
      enabled: true,
      track: 'all',
      max: 10000,
      save: true
    }
  },

  // Backup and Recovery Configuration
  backup: {
    // Base backup settings
    base_backup: {
      compression: 'gzip',
      compression_level: 6,
      format: 'tar',
      checkpoint: 'fast'
    },

    // WAL archiving
    wal_archiving: {
      enabled: process.env.NODE_ENV === 'production',
      archive_mode: 'on',
      archive_command: process.env.WAL_ARCHIVE_COMMAND || 'test ! -f /backup/wal/%f && cp %p /backup/wal/%f',
      max_wal_senders: 3,
      wal_keep_segments: 32
    },

    // Point-in-time recovery
    pitr: {
      restore_command: process.env.WAL_RESTORE_COMMAND || 'cp /backup/wal/%f %p',
      recovery_target_timeline: 'latest'
    }
  },

  // Security Configuration
  security: {
    // Authentication
    authentication: {
      method: 'md5',
      password_encryption: 'scram-sha-256',
      password_min_length: 8
    },

    // Network Security
    network: {
      listen_addresses: process.env.NODE_ENV === 'production' ? 'localhost' : '*',
      max_connections: 100,
      tcp_keepalives_idle: 600,
      tcp_keepalives_interval: 30,
      tcp_keepalives_count: 3
    },

    // Audit Configuration
    audit: {
      enabled: process.env.NODE_ENV === 'production',
      log_connections: true,
      log_disconnections: true,
      log_lock_waits: true,
      log_checkpoints: true,
      log_autovacuum_min_duration: 0
    }
  },

  // Maintenance Configuration
  maintenance: {
    // Autovacuum Settings
    autovacuum: {
      enabled: true,
      max_workers: 3,
      naptime: '1min',
      vacuum_threshold: 50,
      vacuum_scale_factor: 0.2,
      analyze_threshold: 50,
      analyze_scale_factor: 0.1
    },

    // Statistics Collection
    statistics: {
      track_activities: true,
      track_counts: true,
      track_io_timing: true,
      track_functions: 'all',
      stats_temp_directory: '/tmp/pg_stat_tmp'
    }
  },

  // Development-Specific Settings
  development: process.env.NODE_ENV === 'development' ? {
    // Enable detailed logging
    verbose_logging: true,
    
    // Development helper functions
    helper_functions: true,
    
    // Sample data generation
    sample_data: {
      enabled: process.env.SEED_DATABASE === 'true',
      products: 1000,
      users: 100,
      orders: 500
    }
  } : undefined
};

/**
 * Drizzle ORM Configuration
 * Integrated with primary database settings
 */
module.exports.drizzle = {
  client: 'pg',
  connection: module.exports.connection,
  pool: module.exports.pool,
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
    schemaName: 'public'
  },
  seeds: {
    directory: './seeds'
  }
};

/**
 * Health Check Configuration
 */
module.exports.healthCheck = {
  enabled: true,
  interval: 30000, // 30 seconds
  timeout: 5000,   // 5 seconds
  retries: 3,
  queries: {
    simple: 'SELECT 1',
    version: 'SELECT version()',
    uptime: 'SELECT extract(epoch from now() - pg_postmaster_start_time()) as uptime'
  }
};