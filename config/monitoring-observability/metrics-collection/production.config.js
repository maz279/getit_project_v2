// Metrics Collection Production Configuration
// Comprehensive monitoring and observability infrastructure

module.exports = {
  // Monitoring Service Information
  monitoring: {
    name: 'GetIt Monitoring Infrastructure',
    version: '3.0',
    type: 'comprehensive_observability',
    environment: 'production',
    enabled: true,
    description: 'Enterprise monitoring, metrics collection, and observability platform'
  },

  // Metrics Collection Stack
  metricsStack: {
    // Prometheus Configuration
    prometheus: {
      enabled: true,
      priority: 1,
      type: 'metrics_storage',
      
      // Server Configuration
      server: {
        host: process.env.PROMETHEUS_HOST || 'prometheus.getit.internal',
        port: process.env.PROMETHEUS_PORT || 9090,
        protocol: 'http',
        retention: '15d', // 15 days
        evaluationInterval: '15s',
        scrapeInterval: '15s'
      },

      // Storage Configuration
      storage: {
        tsdb: {
          retentionTime: '15d',
          retentionSize: '0', // unlimited
          walCompression: true,
          minBlockDuration: '2h',
          maxBlockDuration: '25h'
        },
        remoteWrite: {
          enabled: false,
          url: process.env.PROMETHEUS_REMOTE_WRITE_URL,
          remoteTimeout: '30s',
          queueConfig: {
            capacity: 10000,
            maxSamplesPerSend: 2000,
            batchSendDeadline: '5s'
          }
        }
      },

      // Scrape Configurations
      scrapeConfigs: [
        {
          jobName: 'api-gateway',
          staticConfigs: [
            { targets: ['api-gateway:8080'] }
          ],
          metricsPath: '/metrics',
          scrapeInterval: '15s'
        },
        {
          jobName: 'microservices',
          staticConfigs: [
            { targets: [
              'user-service:3001',
              'product-service:3002',
              'order-service:3003',
              'payment-service:3004',
              'notification-service:3005',
              'analytics-service:3006',
              'vendor-service:3007',
              'shipping-service:3008',
              'ml-service:3009',
              'finance-service:3010'
            ]}
          ],
          metricsPath: '/metrics',
          scrapeInterval: '15s'
        },
        {
          jobName: 'databases',
          staticConfigs: [
            { targets: [
              'postgres-exporter:9187',
              'redis-exporter:9121',
              'mongodb-exporter:9216',
              'elasticsearch-exporter:9114'
            ]}
          ],
          scrapeInterval: '30s'
        },
        {
          jobName: 'infrastructure',
          staticConfigs: [
            { targets: [
              'node-exporter:9100',
              'nginx-exporter:9113',
              'cadvisor:8080'
            ]}
          ],
          scrapeInterval: '30s'
        }
      ],

      // Alert Rules
      alertRules: {
        groups: [
          {
            name: 'api_gateway',
            rules: [
              {
                alert: 'HighRequestLatency',
                expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5',
                for: '2m',
                labels: { severity: 'warning' },
                annotations: {
                  summary: 'High request latency on API Gateway',
                  description: '95th percentile latency is above 500ms'
                }
              },
              {
                alert: 'HighErrorRate',
                expr: 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05',
                for: '5m',
                labels: { severity: 'critical' },
                annotations: {
                  summary: 'High error rate detected',
                  description: 'Error rate is above 5%'
                }
              }
            ]
          },
          {
            name: 'databases',
            rules: [
              {
                alert: 'DatabaseDown',
                expr: 'up{job=~"postgres|redis|mongodb|elasticsearch"} == 0',
                for: '1m',
                labels: { severity: 'critical' },
                annotations: {
                  summary: 'Database is down',
                  description: 'Database {{ $labels.instance }} is not responding'
                }
              },
              {
                alert: 'HighDatabaseConnections',
                expr: 'pg_stat_database_numbackends / pg_settings_max_connections > 0.8',
                for: '5m',
                labels: { severity: 'warning' },
                annotations: {
                  summary: 'High database connection usage',
                  description: 'PostgreSQL connection usage is above 80%'
                }
              }
            ]
          }
        ]
      }
    },

    // Grafana Configuration
    grafana: {
      enabled: true,
      priority: 1,
      type: 'visualization',
      
      // Server Configuration
      server: {
        host: process.env.GRAFANA_HOST || 'grafana.getit.internal',
        port: process.env.GRAFANA_PORT || 3000,
        protocol: 'http',
        domain: 'monitoring.getit.com.bd',
        rootUrl: 'https://monitoring.getit.com.bd'
      },

      // Authentication
      auth: {
        adminUser: process.env.GRAFANA_ADMIN_USER || 'admin',
        adminPassword: process.env.GRAFANA_ADMIN_PASSWORD,
        allowSignUp: false,
        
        oauth: {
          enabled: false,
          allowedDomains: ['getit.com.bd'],
          allowedOrganizations: ['GetIt Bangladesh']
        },
        
        ldap: {
          enabled: false,
          configFile: '/etc/grafana/ldap.toml'
        }
      },

      // Data Sources
      dataSources: [
        {
          name: 'Prometheus',
          type: 'prometheus',
          url: 'http://prometheus:9090',
          access: 'proxy',
          isDefault: true,
          basicAuth: false
        },
        {
          name: 'Loki',
          type: 'loki',
          url: 'http://loki:3100',
          access: 'proxy',
          basicAuth: false
        },
        {
          name: 'Jaeger',
          type: 'jaeger',
          url: 'http://jaeger-query:16686',
          access: 'proxy',
          basicAuth: false
        },
        {
          name: 'PostgreSQL',
          type: 'postgres',
          url: process.env.DATABASE_URL,
          database: process.env.PGDATABASE,
          user: process.env.GRAFANA_DB_USER,
          password: process.env.GRAFANA_DB_PASSWORD
        }
      ],

      // Dashboard Provisioning
      dashboards: {
        providers: [
          {
            name: 'getit-dashboards',
            type: 'file',
            path: '/etc/grafana/dashboards',
            options: {
              foldersFromFilesStructure: true
            }
          }
        ],
        
        defaultDashboards: [
          'api-gateway-overview',
          'microservices-health',
          'database-performance',
          'business-metrics',
          'error-tracking',
          'infrastructure-overview',
          'bangladesh-specific-metrics'
        ]
      },

      // Alerting
      alerting: {
        enabled: true,
        
        notificationChannels: [
          {
            name: 'email-alerts',
            type: 'email',
            settings: {
              addresses: ['alerts@getit.com.bd', 'devops@getit.com.bd'],
              singleEmail: false
            }
          },
          {
            name: 'slack-alerts',
            type: 'slack',
            settings: {
              url: process.env.SLACK_WEBHOOK_URL,
              channel: '#alerts',
              username: 'GetIt Monitoring'
            }
          },
          {
            name: 'sms-critical',
            type: 'webhook',
            settings: {
              url: process.env.SMS_ALERT_WEBHOOK,
              httpMethod: 'POST'
            }
          }
        ]
      }
    },

    // InfluxDB Configuration (Time Series)
    influxdb: {
      enabled: true,
      priority: 2,
      type: 'time_series_storage',
      
      // Server Configuration
      server: {
        host: process.env.INFLUXDB_HOST || 'influxdb.getit.internal',
        port: process.env.INFLUXDB_PORT || 8086,
        protocol: 'http',
        database: 'getit_metrics',
        retentionPolicy: 'autogen'
      },

      // Authentication
      auth: {
        username: process.env.INFLUXDB_USERNAME,
        password: process.env.INFLUXDB_PASSWORD,
        token: process.env.INFLUXDB_TOKEN
      },

      // Retention Policies
      retentionPolicies: [
        {
          name: 'realtime',
          duration: '24h',
          replication: 1,
          default: false
        },
        {
          name: 'daily',
          duration: '30d',
          replication: 1,
          default: true
        },
        {
          name: 'monthly',
          duration: '365d',
          replication: 1,
          default: false
        }
      ],

      // Measurements
      measurements: [
        'api_requests',
        'response_times',
        'error_rates',
        'database_performance',
        'queue_metrics',
        'business_metrics',
        'user_activity',
        'payment_transactions',
        'shipping_events'
      ]
    }
  },

  // Application Performance Monitoring (APM)
  apm: {
    // Jaeger Tracing
    jaeger: {
      enabled: true,
      priority: 1,
      type: 'distributed_tracing',
      
      // Collector Configuration
      collector: {
        host: process.env.JAEGER_COLLECTOR_HOST || 'jaeger-collector.getit.internal',
        port: process.env.JAEGER_COLLECTOR_PORT || 14268,
        endpoint: '/api/traces',
        protocol: 'http'
      },

      // Query Configuration
      query: {
        host: process.env.JAEGER_QUERY_HOST || 'jaeger-query.getit.internal',
        port: process.env.JAEGER_QUERY_PORT || 16686,
        basePath: '/'
      },

      // Sampling Configuration
      sampling: {
        type: 'probabilistic',
        param: 0.1, // 10% sampling
        
        perServiceStrategies: [
          { service: 'api-gateway', type: 'probabilistic', param: 0.5 },
          { service: 'payment-service', type: 'probabilistic', param: 1.0 },
          { service: 'order-service', type: 'probabilistic', param: 0.8 },
          { service: 'user-service', type: 'probabilistic', param: 0.3 }
        ]
      },

      // Storage
      storage: {
        type: 'elasticsearch',
        elasticsearch: {
          serverUrls: ['http://elasticsearch:9200'],
          indexPrefix: 'jaeger',
          maxSpanAge: '72h',
          maxNumSpans: 10000000
        }
      }
    },

    // Zipkin (Alternative Tracing)
    zipkin: {
      enabled: false,
      priority: 2,
      type: 'distributed_tracing_backup',
      
      server: {
        host: process.env.ZIPKIN_HOST || 'zipkin.getit.internal',
        port: process.env.ZIPKIN_PORT || 9411
      },

      storage: {
        type: 'elasticsearch',
        elasticsearch: {
          hosts: ['http://elasticsearch:9200'],
          index: 'zipkin'
        }
      }
    }
  },

  // Log Management
  logManagement: {
    // Loki Configuration
    loki: {
      enabled: true,
      priority: 1,
      type: 'log_aggregation',
      
      // Server Configuration
      server: {
        host: process.env.LOKI_HOST || 'loki.getit.internal',
        port: process.env.LOKI_PORT || 3100,
        httpListenPort: 3100,
        grpcListenPort: 9096
      },

      // Storage Configuration
      storage: {
        boltdbShipper: {
          activeIndexDirectory: '/loki/boltdb-shipper-active',
          cacheLocation: '/loki/boltdb-shipper-cache',
          sharedStore: 's3',
          s3: {
            bucketName: process.env.LOKI_S3_BUCKET,
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        }
      },

      // Schema Configuration
      schemaConfig: {
        configs: [
          {
            from: '2024-01-01',
            store: 'boltdb-shipper',
            objectStore: 's3',
            schema: 'v11',
            index: {
              prefix: 'getit_logs_',
              period: '24h'
            }
          }
        ]
      },

      // Retention
      tableManager: {
        retentionDeletesEnabled: true,
        retentionPeriod: '720h' // 30 days
      }
    },

    // Promtail (Log Collector)
    promtail: {
      enabled: true,
      priority: 1,
      type: 'log_collector',
      
      // Server Configuration
      server: {
        httpListenPort: 9080,
        grpcListenPort: 0
      },

      // Loki Client
      clients: [
        {
          url: 'http://loki:3100/loki/api/v1/push',
          batchWait: '1s',
          batchSize: 1048576 // 1MB
        }
      ],

      // Scrape Configurations
      scrapeConfigs: [
        {
          jobName: 'api-gateway',
          staticConfigs: [
            {
              targets: ['localhost'],
              labels: {
                job: 'api-gateway',
                host: 'api-gateway',
                __path__: '/var/log/api-gateway/*.log'
              }
            }
          ]
        },
        {
          jobName: 'microservices',
          staticConfigs: [
            {
              targets: ['localhost'],
              labels: {
                job: 'microservices',
                __path__: '/var/log/microservices/*/*.log'
              }
            }
          ]
        },
        {
          jobName: 'nginx',
          staticConfigs: [
            {
              targets: ['localhost'],
              labels: {
                job: 'nginx',
                __path__: '/var/log/nginx/*.log'
              }
            }
          ]
        }
      ]
    }
  },

  // Business Metrics
  businessMetrics: {
    enabled: true,
    
    // E-commerce Metrics
    ecommerce: {
      // Order Metrics
      orders: [
        'orders_total',
        'orders_completed',
        'orders_cancelled',
        'orders_pending',
        'average_order_value',
        'order_completion_rate',
        'order_fulfillment_time'
      ],

      // Payment Metrics
      payments: [
        'payments_total',
        'payments_successful',
        'payments_failed',
        'payment_success_rate',
        'payment_processing_time',
        'revenue_total',
        'revenue_by_method'
      ],

      // Product Metrics
      products: [
        'products_viewed',
        'products_purchased',
        'cart_additions',
        'cart_abandonment_rate',
        'conversion_rate',
        'product_return_rate'
      ],

      // User Metrics
      users: [
        'users_registered',
        'users_active',
        'session_duration',
        'page_views',
        'bounce_rate',
        'user_retention_rate'
      ]
    },

    // Bangladesh-Specific Metrics
    bangladeshSpecific: {
      // Mobile Banking Metrics
      mobileBanking: [
        'bkash_transactions',
        'nagad_transactions',
        'rocket_transactions',
        'mobile_banking_success_rate',
        'mobile_banking_processing_time'
      ],

      // Regional Metrics
      regional: [
        'orders_by_division',
        'delivery_time_by_area',
        'cod_preference_rate',
        'rural_vs_urban_orders'
      ],

      // Cultural Metrics
      cultural: [
        'festival_sales_surge',
        'ramadan_traffic_patterns',
        'friday_vs_other_days',
        'bengali_content_engagement'
      ]
    }
  },

  // Infrastructure Metrics
  infrastructureMetrics: {
    // System Metrics
    system: [
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'network_io',
      'load_average',
      'process_count'
    ],

    // Application Metrics
    application: [
      'request_rate',
      'response_time',
      'error_rate',
      'throughput',
      'concurrent_users',
      'queue_size'
    ],

    // Database Metrics
    database: [
      'connection_count',
      'query_execution_time',
      'slow_queries',
      'cache_hit_ratio',
      'deadlocks',
      'replication_lag'
    ],

    // Microservices Metrics
    microservices: [
      'service_health',
      'inter_service_calls',
      'circuit_breaker_state',
      'timeout_rate',
      'retry_count',
      'fallback_usage'
    ]
  },

  // Alerting Configuration
  alerting: {
    // Alert Manager
    alertManager: {
      enabled: true,
      
      // Server Configuration
      server: {
        host: process.env.ALERTMANAGER_HOST || 'alertmanager.getit.internal',
        port: process.env.ALERTMANAGER_PORT || 9093
      },

      // Routing Configuration
      route: {
        groupBy: ['alertname', 'severity'],
        groupWait: '30s',
        groupInterval: '5m',
        repeatInterval: '12h',
        receiver: 'default-receiver',
        
        routes: [
          {
            match: { severity: 'critical' },
            receiver: 'critical-alerts',
            groupWait: '10s',
            repeatInterval: '1h'
          },
          {
            match: { severity: 'warning' },
            receiver: 'warning-alerts',
            groupWait: '30s',
            repeatInterval: '4h'
          }
        ]
      },

      // Receivers
      receivers: [
        {
          name: 'default-receiver',
          emailConfigs: [
            {
              to: 'alerts@getit.com.bd',
              from: 'monitoring@getit.com.bd',
              subject: 'GetIt Alert: {{ .GroupLabels.alertname }}',
              body: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
            }
          ]
        },
        {
          name: 'critical-alerts',
          emailConfigs: [
            {
              to: 'critical@getit.com.bd',
              from: 'monitoring@getit.com.bd',
              subject: 'CRITICAL: {{ .GroupLabels.alertname }}',
              body: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
            }
          ],
          webhookConfigs: [
            {
              url: process.env.CRITICAL_ALERT_WEBHOOK,
              sendResolved: true
            }
          ]
        },
        {
          name: 'warning-alerts',
          emailConfigs: [
            {
              to: 'warnings@getit.com.bd',
              from: 'monitoring@getit.com.bd',
              subject: 'WARNING: {{ .GroupLabels.alertname }}',
              body: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
            }
          ]
        }
      ],

      // Inhibit Rules
      inhibitRules: [
        {
          sourceMatch: { severity: 'critical' },
          targetMatch: { severity: 'warning' },
          equal: ['alertname', 'instance']
        }
      ]
    },

    // Alert Escalation
    escalation: {
      enabled: true,
      
      levels: [
        {
          level: 1,
          duration: '5m',
          channels: ['email']
        },
        {
          level: 2,
          duration: '15m',
          channels: ['email', 'slack']
        },
        {
          level: 3,
          duration: '30m',
          channels: ['email', 'slack', 'sms']
        },
        {
          level: 4,
          duration: '60m',
          channels: ['email', 'slack', 'sms', 'phone']
        }
      ]
    }
  },

  // Custom Dashboards
  dashboards: {
    // Executive Dashboard
    executive: {
      title: 'GetIt Executive Dashboard',
      panels: [
        'revenue_overview',
        'order_metrics',
        'user_growth',
        'conversion_funnel',
        'geographic_distribution',
        'top_products',
        'key_performance_indicators'
      ]
    },

    // Operations Dashboard
    operations: {
      title: 'GetIt Operations Dashboard',
      panels: [
        'system_health',
        'service_status',
        'error_rates',
        'response_times',
        'infrastructure_metrics',
        'database_performance',
        'queue_status'
      ]
    },

    // Bangladesh Market Dashboard
    bangladeshMarket: {
      title: 'Bangladesh Market Analytics',
      panels: [
        'division_wise_sales',
        'mobile_banking_usage',
        'cod_vs_prepaid',
        'delivery_performance',
        'cultural_trends',
        'festival_impact',
        'rural_urban_split'
      ]
    },

    // Security Dashboard
    security: {
      title: 'Security Monitoring',
      panels: [
        'failed_login_attempts',
        'suspicious_activities',
        'payment_fraud_detection',
        'security_alerts',
        'access_patterns',
        'vulnerability_scanning'
      ]
    }
  },

  // Performance Monitoring
  performance: {
    // SLA Monitoring
    sla: {
      targets: {
        apiGateway: {
          availability: 99.9, // percentage
          responseTime: 200, // ms
          errorRate: 0.1 // percentage
        },
        microservices: {
          availability: 99.5,
          responseTime: 500,
          errorRate: 0.5
        },
        databases: {
          availability: 99.9,
          responseTime: 100,
          errorRate: 0.01
        }
      },
      
      reporting: {
        frequency: 'daily',
        recipients: ['sre@getit.com.bd', 'management@getit.com.bd']
      }
    },

    // Capacity Planning
    capacityPlanning: {
      enabled: true,
      
      metrics: [
        'cpu_utilization_trend',
        'memory_usage_trend',
        'storage_growth',
        'network_bandwidth_usage',
        'database_connection_usage'
      ],
      
      forecasting: {
        algorithm: 'linear_regression',
        forecastPeriod: '30d',
        confidence: 95 // percentage
      }
    }
  },

  // Integration Configuration
  integration: {
    // External Monitoring Services
    external: {
      // Uptime Monitoring
      uptimeRobot: {
        enabled: false,
        apiKey: process.env.UPTIME_ROBOT_API_KEY,
        monitors: [
          'https://getit.com.bd',
          'https://api.getit.com.bd',
          'https://admin.getit.com.bd'
        ]
      },

      // StatusPage Integration
      statusPage: {
        enabled: false,
        pageId: process.env.STATUS_PAGE_ID,
        apiKey: process.env.STATUS_PAGE_API_KEY
      }
    },

    // Webhooks
    webhooks: {
      enabled: true,
      
      endpoints: [
        {
          name: 'slack-notifications',
          url: process.env.SLACK_WEBHOOK_URL,
          events: ['alert_triggered', 'alert_resolved']
        },
        {
          name: 'incident-management',
          url: process.env.INCIDENT_WEBHOOK_URL,
          events: ['critical_alert', 'service_down']
        }
      ]
    }
  },

  // Security & Compliance
  security: {
    // Access Control
    accessControl: {
      authentication: true,
      authorization: true,
      rbac: true,
      
      roles: [
        'admin',
        'sre_engineer',
        'developer',
        'business_analyst',
        'read_only'
      ]
    },

    // Data Protection
    dataProtection: {
      encryption: {
        inTransit: 'TLS_1_3',
        atRest: 'AES_256'
      },
      
      retention: {
        metrics: '15d',
        logs: '30d',
        traces: '7d'
      },
      
      anonymization: {
        piiData: true,
        userIdentifiers: true
      }
    }
  }
};