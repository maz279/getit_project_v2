// Elasticsearch Production Configuration
// Advanced search engine for product search, analytics, and full-text search capabilities

module.exports = {
  // Database Information
  database: {
    name: 'Elasticsearch',
    type: 'search_engine',
    version: '8.0',
    vendor: 'elastic',
    role: 'search_analytics',
    enabled: true,
    description: 'Elasticsearch cluster for advanced product search, full-text search, analytics, and real-time data processing'
  },

  // Cluster Configuration
  cluster: {
    enabled: true,
    name: 'getit-search-cluster',
    
    // Node Configuration
    nodes: [
      {
        name: 'master-1',
        host: process.env.ELASTICSEARCH_MASTER1_HOST || 'es-master-1.getit.internal',
        port: process.env.ELASTICSEARCH_MASTER1_PORT || 9200,
        transportPort: 9300,
        roles: ['master', 'data', 'ingest'],
        zone: 'zone-1'
      },
      {
        name: 'master-2',
        host: process.env.ELASTICSEARCH_MASTER2_HOST || 'es-master-2.getit.internal',
        port: process.env.ELASTICSEARCH_MASTER2_PORT || 9200,
        transportPort: 9300,
        roles: ['master', 'data', 'ingest'],
        zone: 'zone-2'
      },
      {
        name: 'master-3',
        host: process.env.ELASTICSEARCH_MASTER3_HOST || 'es-master-3.getit.internal',
        port: process.env.ELASTICSEARCH_MASTER3_PORT || 9200,
        transportPort: 9300,
        roles: ['master', 'data', 'ingest'],
        zone: 'zone-3'
      },
      {
        name: 'data-1',
        host: process.env.ELASTICSEARCH_DATA1_HOST || 'es-data-1.getit.internal',
        port: process.env.ELASTICSEARCH_DATA1_PORT || 9200,
        transportPort: 9300,
        roles: ['data', 'ingest'],
        zone: 'zone-1'
      },
      {
        name: 'data-2',
        host: process.env.ELASTICSEARCH_DATA2_HOST || 'es-data-2.getit.internal',
        port: process.env.ELASTICSEARCH_DATA2_PORT || 9200,
        transportPort: 9300,
        roles: ['data', 'ingest'],
        zone: 'zone-2'
      },
      {
        name: 'data-3',
        host: process.env.ELASTICSEARCH_DATA3_HOST || 'es-data-3.getit.internal',
        port: process.env.ELASTICSEARCH_DATA3_PORT || 9200,
        transportPort: 9300,
        roles: ['data', 'ingest'],
        zone: 'zone-3'
      }
    ],

    // Discovery Configuration
    discovery: {
      seedHosts: [
        'es-master-1.getit.internal:9300',
        'es-master-2.getit.internal:9300',
        'es-master-3.getit.internal:9300'
      ],
      initialMasterNodes: [
        'master-1',
        'master-2',
        'master-3'
      ]
    },

    // Shard Allocation
    shardAllocation: {
      awarenessAttributes: ['zone'],
      clusterConcurrentRebalance: 2,
      nodeInitialPrimariesRecoveries: 4,
      nodeConcurrentRecoveries: 2
    }
  },

  // Connection Configuration
  connection: {
    host: process.env.ELASTICSEARCH_HOST || 'localhost',
    port: process.env.ELASTICSEARCH_PORT || 9200,
    protocol: 'https',
    
    // Authentication
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD,
      apiKey: process.env.ELASTICSEARCH_API_KEY
    },

    // SSL/TLS Configuration
    ssl: {
      enabled: true,
      rejectUnauthorized: true,
      ca: process.env.ELASTICSEARCH_SSL_CA,
      cert: process.env.ELASTICSEARCH_SSL_CERT,
      key: process.env.ELASTICSEARCH_SSL_KEY
    },

    // Connection Pool
    pool: {
      maxConnections: 20,
      deadTimeout: 60000,    // 60 seconds
      pingTimeout: 3000,     // 3 seconds
      requestTimeout: 30000, // 30 seconds
      sniffOnStart: true,
      sniffInterval: 300000, // 5 minutes
      sniffOnConnectionFault: true
    }
  },

  // Index Configuration
  indices: {
    // Product Search Index
    products: {
      name: 'products',
      description: 'Main product search index with Bengali and English support',
      
      settings: {
        numberOfShards: 3,
        numberOfReplicas: 1,
        refreshInterval: '1s',
        maxResultWindow: 100000,
        
        analysis: {
          analyzer: {
            bengali_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'bengali_stop',
                'bengali_stemmer',
                'bengali_synonym'
              ]
            },
            english_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'english_stop',
                'english_stemmer',
                'english_synonym'
              ]
            },
            autocomplete_analyzer: {
              type: 'custom',
              tokenizer: 'keyword',
              filter: [
                'lowercase',
                'autocomplete_filter'
              ]
            },
            search_analyzer: {
              type: 'custom',
              tokenizer: 'keyword',
              filter: [
                'lowercase'
              ]
            }
          },
          filter: {
            bengali_stop: {
              type: 'stop',
              stopwords: ['এবং', 'বা', 'কিন্তু', 'সাথে', 'জন্য']
            },
            english_stop: {
              type: 'stop',
              stopwords: '_english_'
            },
            bengali_stemmer: {
              type: 'stemmer',
              language: 'bengali'
            },
            english_stemmer: {
              type: 'stemmer',
              language: 'english'
            },
            bengali_synonym: {
              type: 'synonym',
              synonyms: [
                'মোবাইল,ফোন,স্মার্টফোন',
                'কম্পিউটার,ল্যাপটপ,পিসি',
                'জামা,শার্ট,পোশাক'
              ]
            },
            english_synonym: {
              type: 'synonym',
              synonyms: [
                'mobile,phone,smartphone',
                'computer,laptop,pc',
                'clothes,clothing,apparel'
              ]
            },
            autocomplete_filter: {
              type: 'edge_ngram',
              minGram: 1,
              maxGram: 20
            }
          }
        }
      },

      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: {
            type: 'text',
            analyzer: 'bengali_analyzer',
            fields: {
              english: {
                type: 'text',
                analyzer: 'english_analyzer'
              },
              autocomplete: {
                type: 'text',
                analyzer: 'autocomplete_analyzer',
                search_analyzer: 'search_analyzer'
              },
              keyword: { type: 'keyword' }
            }
          },
          description: {
            type: 'text',
            analyzer: 'bengali_analyzer',
            fields: {
              english: {
                type: 'text',
                analyzer: 'english_analyzer'
              }
            }
          },
          category: {
            type: 'nested',
            properties: {
              id: { type: 'keyword' },
              name: { type: 'keyword' },
              path: { type: 'keyword' },
              level: { type: 'integer' }
            }
          },
          vendor: {
            type: 'nested',
            properties: {
              id: { type: 'keyword' },
              name: { type: 'keyword' },
              rating: { type: 'float' },
              verified: { type: 'boolean' }
            }
          },
          price: {
            type: 'scaled_float',
            scaling_factor: 100
          },
          originalPrice: {
            type: 'scaled_float',
            scaling_factor: 100
          },
          discount: { type: 'float' },
          currency: { type: 'keyword' },
          availability: { type: 'keyword' },
          stock: { type: 'integer' },
          rating: { type: 'float' },
          reviewCount: { type: 'integer' },
          tags: { type: 'keyword' },
          brand: { type: 'keyword' },
          model: { type: 'keyword' },
          color: { type: 'keyword' },
          size: { type: 'keyword' },
          weight: { type: 'float' },
          dimensions: {
            type: 'object',
            properties: {
              length: { type: 'float' },
              width: { type: 'float' },
              height: { type: 'float' }
            }
          },
          images: {
            type: 'nested',
            properties: {
              url: { type: 'keyword' },
              alt: { type: 'text' }
            }
          },
          location: { type: 'geo_point' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
          publishedAt: { type: 'date' },
          isActive: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          searchBoost: { type: 'float' }
        }
      }
    },

    // User Search and Analytics
    users: {
      name: 'users',
      description: 'User profiles for personalized search',
      
      settings: {
        numberOfShards: 2,
        numberOfReplicas: 1,
        refreshInterval: '5s'
      },

      mappings: {
        properties: {
          id: { type: 'keyword' },
          username: { type: 'keyword' },
          email: { type: 'keyword' },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'text' },
              lastName: { type: 'text' },
              location: { type: 'geo_point' },
              preferences: {
                type: 'nested',
                properties: {
                  categories: { type: 'keyword' },
                  brands: { type: 'keyword' },
                  priceRange: {
                    type: 'object',
                    properties: {
                      min: { type: 'scaled_float', scaling_factor: 100 },
                      max: { type: 'scaled_float', scaling_factor: 100 }
                    }
                  }
                }
              }
            }
          },
          searchHistory: {
            type: 'nested',
            properties: {
              query: { type: 'text' },
              timestamp: { type: 'date' },
              resultCount: { type: 'integer' },
              clicked: { type: 'boolean' }
            }
          },
          purchaseHistory: {
            type: 'nested',
            properties: {
              productId: { type: 'keyword' },
              category: { type: 'keyword' },
              brand: { type: 'keyword' },
              price: { type: 'scaled_float', scaling_factor: 100 },
              timestamp: { type: 'date' }
            }
          },
          createdAt: { type: 'date' },
          lastActiveAt: { type: 'date' }
        }
      }
    },

    // Search Analytics
    searchAnalytics: {
      name: 'search_analytics',
      description: 'Search query analytics and insights',
      
      settings: {
        numberOfShards: 2,
        numberOfReplicas: 1,
        refreshInterval: '30s',
        indexLifecycle: {
          policy: 'search_analytics_policy',
          rolloverAlias: 'search_analytics'
        }
      },

      mappings: {
        properties: {
          sessionId: { type: 'keyword' },
          userId: { type: 'keyword' },
          query: {
            type: 'text',
            analyzer: 'bengali_analyzer',
            fields: {
              keyword: { type: 'keyword' },
              english: { type: 'text', analyzer: 'english_analyzer' }
            }
          },
          normalizedQuery: { type: 'keyword' },
          filters: {
            type: 'nested',
            properties: {
              type: { type: 'keyword' },
              value: { type: 'keyword' }
            }
          },
          resultCount: { type: 'integer' },
          clickedResults: {
            type: 'nested',
            properties: {
              productId: { type: 'keyword' },
              position: { type: 'integer' },
              timestamp: { type: 'date' }
            }
          },
          timestamp: { type: 'date' },
          responseTime: { type: 'integer' },
          userAgent: { type: 'text' },
          ipAddress: { type: 'ip' },
          location: { type: 'geo_point' },
          converted: { type: 'boolean' },
          conversionValue: { type: 'scaled_float', scaling_factor: 100 }
        }
      }
    },

    // Vendor Analytics
    vendorAnalytics: {
      name: 'vendor_analytics',
      description: 'Vendor performance and search analytics',
      
      settings: {
        numberOfShards: 1,
        numberOfReplicas: 1,
        refreshInterval: '60s'
      },

      mappings: {
        properties: {
          vendorId: { type: 'keyword' },
          vendorName: { type: 'keyword' },
          productCount: { type: 'integer' },
          searchImpressions: { type: 'long' },
          searchClicks: { type: 'long' },
          searchCTR: { type: 'float' },
          conversionRate: { type: 'float' },
          averageRating: { type: 'float' },
          totalReviews: { type: 'integer' },
          totalSales: { type: 'scaled_float', scaling_factor: 100 },
          topCategories: {
            type: 'nested',
            properties: {
              category: { type: 'keyword' },
              sales: { type: 'scaled_float', scaling_factor: 100 },
              impressions: { type: 'long' }
            }
          },
          topKeywords: {
            type: 'nested',
            properties: {
              keyword: { type: 'keyword' },
              searches: { type: 'long' },
              conversions: { type: 'long' }
            }
          },
          date: { type: 'date' },
          updatedAt: { type: 'date' }
        }
      }
    },

    // Content Search
    content: {
      name: 'content',
      description: 'CMS content and blog articles search',
      
      settings: {
        numberOfShards: 1,
        numberOfReplicas: 1,
        refreshInterval: '10s'
      },

      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          title: {
            type: 'text',
            analyzer: 'bengali_analyzer',
            fields: {
              english: { type: 'text', analyzer: 'english_analyzer' },
              keyword: { type: 'keyword' }
            }
          },
          content: {
            type: 'text',
            analyzer: 'bengali_analyzer',
            fields: {
              english: { type: 'text', analyzer: 'english_analyzer' }
            }
          },
          excerpt: {
            type: 'text',
            analyzer: 'bengali_analyzer'
          },
          author: { type: 'keyword' },
          category: { type: 'keyword' },
          tags: { type: 'keyword' },
          status: { type: 'keyword' },
          publishedAt: { type: 'date' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
          featured: { type: 'boolean' },
          views: { type: 'integer' },
          slug: { type: 'keyword' }
        }
      }
    }
  },

  // Search Configuration
  search: {
    // Query Configuration
    queries: {
      productSearch: {
        multiMatch: {
          type: 'best_fields',
          fields: [
            'name^3',
            'name.english^2',
            'description^1',
            'description.english^1',
            'tags^2',
            'brand^2',
            'model^2'
          ],
          fuzziness: 'AUTO',
          prefixLength: 2,
          maxExpansions: 50
        },
        
        filters: {
          category: { type: 'terms' },
          vendor: { type: 'terms' },
          brand: { type: 'terms' },
          priceRange: { type: 'range' },
          rating: { type: 'range' },
          availability: { type: 'terms' },
          location: { type: 'geo_distance' }
        },
        
        sorting: {
          relevance: { _score: { order: 'desc' } },
          price_low: { price: { order: 'asc' } },
          price_high: { price: { order: 'desc' } },
          newest: { createdAt: { order: 'desc' } },
          rating: { rating: { order: 'desc' } },
          popularity: { reviewCount: { order: 'desc' } }
        },
        
        aggregations: {
          categories: {
            terms: { field: 'category.name', size: 20 }
          },
          brands: {
            terms: { field: 'brand', size: 20 }
          },
          priceRanges: {
            range: {
              field: 'price',
              ranges: [
                { to: 1000 },
                { from: 1000, to: 5000 },
                { from: 5000, to: 10000 },
                { from: 10000, to: 25000 },
                { from: 25000 }
              ]
            }
          },
          ratings: {
            range: {
              field: 'rating',
              ranges: [
                { from: 4.5 },
                { from: 4.0, to: 4.5 },
                { from: 3.5, to: 4.0 },
                { from: 3.0, to: 3.5 },
                { to: 3.0 }
              ]
            }
          }
        }
      },
      
      autocomplete: {
        completion: {
          field: 'name.autocomplete',
          size: 10,
          skipDuplicates: true
        },
        
        suggest: {
          type: 'phrase',
          field: 'name',
          size: 5,
          gramSize: 3,
          confidence: 0.1,
          maxErrors: 2
        }
      },
      
      recommendations: {
        moreLikeThis: {
          fields: ['name', 'description', 'tags', 'category.name'],
          minTermFreq: 1,
          maxQueryTerms: 12,
          minDocFreq: 1,
          analyzer: 'bengali_analyzer'
        }
      }
    },

    // Performance Settings
    performance: {
      timeout: '30s',
      maxConcurrentShardRequests: 5,
      batchedReduceSize: 512,
      searchIdleAfter: '30s',
      defaultOperatorAnd: false,
      analyzeWildcard: true,
      allowExplicitIndex: false,
      maxClauseCount: 1024
    },

    // Highlighting
    highlighting: {
      enabled: true,
      fields: ['name', 'description'],
      fragmentSize: 150,
      numberOfFragments: 3,
      preTags: ['<mark>'],
      postTags: ['</mark>'],
      encoder: 'html'
    }
  },

  // Machine Learning Configuration
  machineLearning: {
    enabled: true,
    
    // Learning to Rank
    learningToRank: {
      enabled: true,
      model: 'xgboost',
      features: [
        'product_popularity',
        'vendor_rating',
        'price_competitiveness',
        'user_preference_match',
        'category_relevance',
        'search_query_match',
        'seasonal_trends',
        'geographic_relevance'
      ],
      
      training: {
        schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
        sampleSize: 100000,
        testSplit: 0.2,
        validationSplit: 0.1
      }
    },

    // Anomaly Detection
    anomalyDetection: {
      enabled: true,
      jobs: [
        {
          name: 'search_volume_anomaly',
          index: 'search_analytics',
          function: 'count',
          bucketSpan: '15m',
          detectors: [
            { function: 'count', by_field_name: 'query.keyword' }
          ]
        },
        {
          name: 'vendor_performance_anomaly',
          index: 'vendor_analytics',
          function: 'mean',
          fieldName: 'searchCTR',
          bucketSpan: '1h'
        }
      ]
    },

    // Data Frame Analytics
    dataFrameAnalytics: {
      enabled: true,
      jobs: [
        {
          name: 'customer_segmentation',
          sourceIndex: 'users',
          destIndex: 'user_segments',
          analysis: {
            type: 'clustering',
            nClusters: 5
          }
        },
        {
          name: 'product_recommendation',
          sourceIndex: 'products',
          destIndex: 'product_recommendations',
          analysis: {
            type: 'regression',
            dependentVariable: 'rating'
          }
        }
      ]
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    
    // Cluster Monitoring
    cluster: {
      enabled: true,
      interval: '30s',
      
      metrics: [
        'cluster_health',
        'cluster_stats',
        'node_stats',
        'indices_stats',
        'search_stats',
        'indexing_stats'
      ],
      
      alerts: [
        {
          name: 'cluster_health_yellow',
          condition: 'cluster.status == "yellow"',
          duration: '2m',
          severity: 'warning'
        },
        {
          name: 'cluster_health_red',
          condition: 'cluster.status == "red"',
          duration: '30s',
          severity: 'critical'
        },
        {
          name: 'high_search_latency',
          condition: 'search.query_time_in_millis > 1000',
          duration: '5m',
          severity: 'warning'
        },
        {
          name: 'high_indexing_rate',
          condition: 'indexing.index_rate > 1000',
          duration: '10m',
          severity: 'info'
        },
        {
          name: 'low_disk_space',
          condition: 'node.fs.available_in_bytes < 10737418240', // 10GB
          duration: '1m',
          severity: 'critical'
        }
      ]
    },

    // Performance Monitoring
    performance: {
      enabled: true,
      slowLogThreshold: '1s',
      indexSlowLogThreshold: '10s',
      
      searchAnalytics: {
        enabled: true,
        sampleRate: 0.1, // 10% sampling
        includeFailed: true,
        includeAggregations: true
      }
    },

    // Index Lifecycle Management
    ilm: {
      enabled: true,
      policies: [
        {
          name: 'search_analytics_policy',
          phases: {
            hot: {
              actions: {
                rollover: {
                  maxSize: '5GB',
                  maxAge: '7d'
                }
              }
            },
            warm: {
              minAge: '7d',
              actions: {
                allocate: {
                  numberOfReplicas: 0
                },
                forcemerge: {
                  maxNumSegments: 1
                }
              }
            },
            cold: {
              minAge: '30d',
              actions: {
                allocate: {
                  numberOfReplicas: 0
                }
              }
            },
            delete: {
              minAge: '90d'
            }
          }
        }
      ]
    }
  },

  // Security Configuration
  security: {
    enabled: true,
    
    // Authentication
    authentication: {
      enabled: true,
      anonymousAccess: false,
      
      realms: [
        {
          name: 'native',
          type: 'native',
          order: 0
        },
        {
          name: 'ldap',
          type: 'ldap',
          order: 1,
          enabled: false
        }
      ],
      
      users: [
        {
          username: 'search_app',
          password: process.env.ELASTICSEARCH_SEARCH_APP_PASSWORD,
          roles: ['search_user', 'kibana_user']
        },
        {
          username: 'analytics_app',
          password: process.env.ELASTICSEARCH_ANALYTICS_APP_PASSWORD,
          roles: ['analytics_user', 'kibana_user']
        },
        {
          username: 'admin_user',
          password: process.env.ELASTICSEARCH_ADMIN_PASSWORD,
          roles: ['superuser']
        }
      ]
    },

    // Authorization
    authorization: {
      enabled: true,
      
      roles: [
        {
          name: 'search_user',
          indices: [
            {
              names: ['products', 'content'],
              privileges: ['read', 'view_index_metadata']
            }
          ]
        },
        {
          name: 'analytics_user',
          indices: [
            {
              names: ['search_analytics', 'vendor_analytics'],
              privileges: ['read', 'write', 'create_index', 'view_index_metadata']
            }
          ]
        },
        {
          name: 'indexing_user',
          indices: [
            {
              names: ['products', 'users', 'content'],
              privileges: ['write', 'create_index', 'manage']
            }
          ]
        }
      ]
    },

    // Encryption
    encryption: {
      enabled: true,
      
      transportSsl: {
        enabled: true,
        verification_mode: 'certificate',
        keystore: {
          path: process.env.ELASTICSEARCH_TRANSPORT_KEYSTORE,
          password: process.env.ELASTICSEARCH_TRANSPORT_KEYSTORE_PASSWORD
        },
        truststore: {
          path: process.env.ELASTICSEARCH_TRANSPORT_TRUSTSTORE,
          password: process.env.ELASTICSEARCH_TRANSPORT_TRUSTSTORE_PASSWORD
        }
      },
      
      httpSsl: {
        enabled: true,
        keystore: {
          path: process.env.ELASTICSEARCH_HTTP_KEYSTORE,
          password: process.env.ELASTICSEARCH_HTTP_KEYSTORE_PASSWORD
        }
      }
    },

    // Audit Logging
    auditing: {
      enabled: true,
      outputs: ['file', 'logfile'],
      events: {
        include: [
          'access_granted',
          'access_denied',
          'authentication_success',
          'authentication_failed',
          'connection_granted',
          'connection_denied'
        ]
      }
    }
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    timezone: 'Asia/Dhaka',
    locale: 'bn_BD',
    currency: 'BDT',
    
    // Language Support
    languages: {
      primary: 'bengali',
      secondary: 'english',
      
      bengaliSupport: {
        enabled: true,
        unicodeNormalization: true,
        transliteration: true,
        phonetic: true
      }
    },
    
    // Local Search Features
    localFeatures: {
      geographicSearch: {
        enabled: true,
        divisions: [
          'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
          'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
        ],
        radiusSearch: true,
        deliveryZones: true
      },
      
      culturalSearch: {
        enabled: true,
        festivals: ['Eid', 'Durga Puja', 'Pohela Boishakh'],
        seasonalProducts: true,
        religiousProducts: true
      },
      
      localBrands: {
        enabled: true,
        prioritizeLocal: true,
        madInBangladesh: true
      }
    }
  },

  // Environment Configuration
  environment: {
    production: true,
    logLevel: 'info',
    gcInterval: '1m',
    indices: {
      memory: {
        indexBufferSize: '10%',
        minIndexBufferSize: '48mb',
        maxIndexBufferSize: 'unlimited'
      }
    },
    
    jvm: {
      heapSize: '8g',
      gcOptions: [
        '-XX:+UseG1GC',
        '-XX:MaxGCPauseMillis=200',
        '-XX:+UseStringDeduplication'
      ]
    }
  }
};