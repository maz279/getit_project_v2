/**
 * GraphQL Gateway Controller
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Amazon.com/Shopee.sg-level GraphQL federation with schema stitching,
 * intelligent query optimization, and comprehensive service integration
 */

import { Request, Response } from 'express';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLFloat, GraphQLBoolean } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema, introspectionFromSchema, buildClientSchema } from 'graphql';
import { stitchSchemas } from '@graphql-tools/stitch';
import { wrapSchema, introspectSchema } from '@graphql-tools/wrap';
import { fetch } from 'cross-fetch';
import { print } from 'graphql';
import { db } from '../../../db';
import { 
  apiGatewayGraphQLSchemas,
  apiGatewayGraphQLQueries,
  apiGatewayGraphQLMetrics 
} from '../../../../shared/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'graphql-controller' }
});

export interface GraphQLServiceSchema {
  id: string;
  serviceName: string;
  endpoint: string;
  schema: string;
  version: string;
  isActive: boolean;
  metadata: Record<string, any>;
  lastUpdated: Date;
}

export interface GraphQLQueryMetrics {
  id: string;
  query: string;
  operationName?: string;
  variables: Record<string, any>;
  executionTime: number;
  responseSize: number;
  status: 'success' | 'error';
  errorMessage?: string;
  userId?: string;
  ipAddress: string;
  timestamp: Date;
}

export interface GraphQLConfiguration {
  federation: {
    enabled: boolean;
    gatewayVersion: string;
    services: string[];
  };
  introspection: {
    enabled: boolean;
    allowedInProduction: boolean;
  };
  playground: {
    enabled: boolean;
    endpoint: string;
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  security: {
    maxQueryDepth: number;
    maxQueryComplexity: number;
    timeout: number;
    rateLimiting: {
      enabled: boolean;
      maxQueries: number;
      window: number;
    };
  };
  bangladesh: {
    enableBengaliSupport: boolean;
    currencyHandling: boolean;
    culturalOptimization: boolean;
  };
}

export class GraphQLController {
  private federatedSchema: GraphQLSchema | null = null;
  private serviceSchemas: Map<string, GraphQLServiceSchema> = new Map();
  private queryCache: Map<string, any> = new Map();
  private configuration: GraphQLConfiguration;

  constructor() {
    this.configuration = this.getDefaultConfiguration();
    this.initializeController();
  }

  private getDefaultConfiguration(): GraphQLConfiguration {
    return {
      federation: {
        enabled: true,
        gatewayVersion: '1.0.0',
        services: ['user-service', 'product-service', 'order-service', 'payment-service']
      },
      introspection: {
        enabled: process.env.NODE_ENV !== 'production',
        allowedInProduction: false
      },
      playground: {
        enabled: process.env.NODE_ENV !== 'production',
        endpoint: '/graphql'
      },
      caching: {
        enabled: true,
        ttl: 300, // 5 minutes
        maxSize: 1000
      },
      security: {
        maxQueryDepth: 10,
        maxQueryComplexity: 1000,
        timeout: 30000, // 30 seconds
        rateLimiting: {
          enabled: true,
          maxQueries: 100,
          window: 60000 // 1 minute
        }
      },
      bangladesh: {
        enableBengaliSupport: true,
        currencyHandling: true,
        culturalOptimization: true
      }
    };
  }

  private async initializeController(): Promise<void> {
    try {
      await this.loadServiceSchemas();
      await this.buildFederatedSchema();
      logger.info('GraphQL Controller initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize GraphQL Controller', { error: error.message });
    }
  }

  private async loadServiceSchemas(): Promise<void> {
    try {
      const dbSchemas = await db.select().from(apiGatewayGraphQLSchemas)
        .where(eq(apiGatewayGraphQLSchemas.isActive, true));

      for (const schema of dbSchemas) {
        this.serviceSchemas.set(schema.serviceName, {
          id: schema.id,
          serviceName: schema.serviceName,
          endpoint: schema.endpoint,
          schema: schema.schema,
          version: schema.version,
          isActive: schema.isActive,
          metadata: JSON.parse(schema.metadata as string || '{}'),
          lastUpdated: schema.updatedAt || schema.createdAt
        });
      }

      logger.info('Service schemas loaded', { 
        schemaCount: this.serviceSchemas.size 
      });
    } catch (error) {
      logger.error('Failed to load service schemas', { error: error.message });
    }
  }

  private async buildFederatedSchema(): Promise<void> {
    try {
      if (this.serviceSchemas.size === 0) {
        await this.createDefaultSchemas();
      }

      const subschemas = [];

      // Build subschemas from service endpoints
      for (const [serviceName, schemaInfo] of this.serviceSchemas) {
        try {
          if (schemaInfo.schema) {
            // Use stored schema
            const schema = buildSchema(schemaInfo.schema);
            subschemas.push({
              schema,
              executor: this.createExecutor(schemaInfo.endpoint)
            });
          } else {
            // Try to introspect from endpoint
            const schema = await this.introspectServiceSchema(schemaInfo.endpoint);
            if (schema) {
              subschemas.push({
                schema,
                executor: this.createExecutor(schemaInfo.endpoint)
              });
            }
          }
        } catch (error) {
          logger.warn('Failed to load schema for service', {
            serviceName,
            error: error.message
          });
        }
      }

      if (subschemas.length > 0) {
        this.federatedSchema = stitchSchemas({
          subschemas,
          typeDefs: this.getBangladeshExtensions()
        });
      } else {
        // Create basic schema if no services available
        this.federatedSchema = this.createBasicSchema();
      }

      logger.info('Federated GraphQL schema built successfully', {
        subschemaCount: subschemas.length
      });
    } catch (error) {
      logger.error('Failed to build federated schema', { error: error.message });
      this.federatedSchema = this.createBasicSchema();
    }
  }

  private createExecutor(endpoint: string) {
    return async ({ document, variables, context }: any) => {
      try {
        const query = print(document);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': context?.authorization || '',
            'X-User-ID': context?.userId || '',
            'X-Bangladesh-Market': 'true'
          },
          body: JSON.stringify({
            query,
            variables,
            operationName: context?.operationName
          })
        });

        return await response.json();
      } catch (error) {
        logger.error('GraphQL executor error', {
          endpoint,
          error: error.message
        });
        throw error;
      }
    };
  }

  private async introspectServiceSchema(endpoint: string): Promise<GraphQLSchema | null> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query IntrospectionQuery {
              __schema {
                queryType { name }
                mutationType { name }
                subscriptionType { name }
                types {
                  ...FullType
                }
                directives {
                  name
                  description
                  locations
                  args {
                    ...InputValue
                  }
                }
              }
            }

            fragment FullType on __Type {
              kind
              name
              description
              fields(includeDeprecated: true) {
                name
                description
                args {
                  ...InputValue
                }
                type {
                  ...TypeRef
                }
                isDeprecated
                deprecationReason
              }
              inputFields {
                ...InputValue
              }
              interfaces {
                ...TypeRef
              }
              enumValues(includeDeprecated: true) {
                name
                description
                isDeprecated
                deprecationReason
              }
              possibleTypes {
                ...TypeRef
              }
            }

            fragment InputValue on __InputValue {
              name
              description
              type { ...TypeRef }
              defaultValue
            }

            fragment TypeRef on __Type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                        ofType {
                          kind
                          name
                          ofType {
                            kind
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `
        })
      });

      const result = await response.json();
      if (result.data) {
        return buildClientSchema(result.data);
      }
      return null;
    } catch (error) {
      logger.warn('Failed to introspect service schema', {
        endpoint,
        error: error.message
      });
      return null;
    }
  }

  private getBangladeshExtensions(): string {
    return `
      type BangladeshMarketInfo {
        currency: String!
        timezone: String!
        language: String!
        paymentMethods: [String!]!
        festivals: [Festival!]!
        prayerTimes: [PrayerTime!]!
      }

      type Festival {
        name: String!
        nameInBengali: String!
        date: String!
        isPublicHoliday: Boolean!
        commercialImpact: String!
      }

      type PrayerTime {
        name: String!
        time: String!
        adjustedTime: String!
      }

      type BangladeshUser {
        id: ID!
        nidNumber: String
        mobileWallet: String
        preferredLanguage: String!
        region: String!
        networkProvider: String
      }

      extend type Query {
        bangladeshMarketInfo: BangladeshMarketInfo!
        userBangladeshProfile(userId: ID!): BangladeshUser
        festivalCalendar(year: Int!): [Festival!]!
        currentPrayerTimes(city: String!): [PrayerTime!]!
      }

      extend type Mutation {
        updateBangladeshProfile(userId: ID!, profile: BangladeshUserInput!): BangladeshUser!
      }

      input BangladeshUserInput {
        nidNumber: String
        mobileWallet: String
        preferredLanguage: String
        region: String
        networkProvider: String
      }
    `;
  }

  private createBasicSchema(): GraphQLSchema {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          hello: {
            type: GraphQLString,
            resolve: () => 'Hello from GetIt Bangladesh GraphQL Gateway!'
          },
          health: {
            type: GraphQLString,
            resolve: () => 'GraphQL Gateway is healthy'
          },
          services: {
            type: new GraphQLList(GraphQLString),
            resolve: () => Array.from(this.serviceSchemas.keys())
          },
          bangladeshMarketInfo: {
            type: new GraphQLObjectType({
              name: 'BangladeshMarketInfo',
              fields: {
                currency: { type: GraphQLString },
                timezone: { type: GraphQLString },
                language: { type: GraphQLString },
                paymentMethods: { type: new GraphQLList(GraphQLString) }
              }
            }),
            resolve: () => ({
              currency: 'BDT',
              timezone: 'Asia/Dhaka',
              language: 'bn',
              paymentMethods: ['bKash', 'Nagad', 'Rocket', 'Credit Card']
            })
          }
        }
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          ping: {
            type: GraphQLString,
            resolve: () => 'pong'
          }
        }
      })
    });
  }

  private async createDefaultSchemas(): Promise<void> {
    const defaultSchemas = [
      {
        serviceName: 'user-service',
        endpoint: `http://localhost:5001/graphql`,
        schema: `
          type User {
            id: ID!
            email: String!
            name: String!
            role: String!
            isActive: Boolean!
            createdAt: String!
          }

          type Query {
            user(id: ID!): User
            users(limit: Int, offset: Int): [User!]!
          }

          type Mutation {
            createUser(input: CreateUserInput!): User!
            updateUser(id: ID!, input: UpdateUserInput!): User!
          }

          input CreateUserInput {
            email: String!
            name: String!
            password: String!
            role: String
          }

          input UpdateUserInput {
            email: String
            name: String
            role: String
            isActive: Boolean
          }
        `
      },
      {
        serviceName: 'product-service',
        endpoint: `http://localhost:5002/graphql`,
        schema: `
          type Product {
            id: ID!
            name: String!
            description: String!
            price: Float!
            comparePrice: Float
            inventory: Int!
            category: String!
            vendor: String!
            isActive: Boolean!
            createdAt: String!
          }

          type Query {
            product(id: ID!): Product
            products(limit: Int, offset: Int, category: String): [Product!]!
            searchProducts(query: String!, limit: Int): [Product!]!
          }

          type Mutation {
            createProduct(input: CreateProductInput!): Product!
            updateProduct(id: ID!, input: UpdateProductInput!): Product!
          }

          input CreateProductInput {
            name: String!
            description: String!
            price: Float!
            comparePrice: Float
            inventory: Int!
            category: String!
            vendor: String!
          }

          input UpdateProductInput {
            name: String
            description: String
            price: Float
            comparePrice: Float
            inventory: Int
            category: String
            isActive: Boolean
          }
        `
      }
    ];

    for (const schemaData of defaultSchemas) {
      try {
        const existing = await db.select()
          .from(apiGatewayGraphQLSchemas)
          .where(eq(apiGatewayGraphQLSchemas.serviceName, schemaData.serviceName))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(apiGatewayGraphQLSchemas).values({
            id: uuidv4(),
            serviceName: schemaData.serviceName,
            endpoint: schemaData.endpoint,
            schema: schemaData.schema,
            version: '1.0.0',
            isActive: true,
            metadata: JSON.stringify({}),
            createdAt: new Date(),
            updatedAt: new Date()
          });

          this.serviceSchemas.set(schemaData.serviceName, {
            id: uuidv4(),
            serviceName: schemaData.serviceName,
            endpoint: schemaData.endpoint,
            schema: schemaData.schema,
            version: '1.0.0',
            isActive: true,
            metadata: {},
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        logger.warn('Failed to create default schema', {
          serviceName: schemaData.serviceName,
          error: error.message
        });
      }
    }
  }

  // REST API Endpoints
  async getGraphQLHandler(): Promise<any> {
    return createHandler({
      schema: this.federatedSchema || this.createBasicSchema(),
      graphiql: this.configuration.playground.enabled,
      context: (req: any) => ({
        userId: req.user?.id,
        authorization: req.headers.authorization,
        operationName: req.body?.operationName,
        ipAddress: req.ip
      }),
      formatError: (error: any) => {
        logger.error('GraphQL execution error', {
          error: error.message,
          stack: error.stack,
          path: error.path
        });
        return {
          message: error.message,
          locations: error.locations,
          path: error.path
        };
      }
    });
  }

  async getSchema(req: Request, res: Response): Promise<void> {
    try {
      if (!this.configuration.introspection.enabled) {
        return res.status(403).json({
          success: false,
          error: 'Schema introspection is disabled'
        });
      }

      const schema = this.federatedSchema;
      if (!schema) {
        return res.status(500).json({
          success: false,
          error: 'GraphQL schema not available'
        });
      }

      const introspection = introspectionFromSchema(schema);
      
      res.json({
        success: true,
        data: {
          schema: introspection,
          version: this.configuration.federation.gatewayVersion,
          services: Array.from(this.serviceSchemas.keys()),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get GraphQL schema', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeRange = '24h' } = req.query;
      const hoursBack = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const metrics = await db.select()
        .from(apiGatewayGraphQLMetrics)
        .where(gte(apiGatewayGraphQLMetrics.timestamp, since))
        .orderBy(desc(apiGatewayGraphQLMetrics.timestamp));

      const totalQueries = metrics.length;
      const successfulQueries = metrics.filter(m => m.status === 'success').length;
      const avgExecutionTime = metrics.reduce((acc, m) => acc + m.executionTime, 0) / totalQueries || 0;
      const avgResponseSize = metrics.reduce((acc, m) => acc + m.responseSize, 0) / totalQueries || 0;

      // Query frequency by hour
      const queryFrequency = new Map<string, number>();
      metrics.forEach(metric => {
        const hour = metric.timestamp.toISOString().substring(0, 13);
        queryFrequency.set(hour, (queryFrequency.get(hour) || 0) + 1);
      });

      // Top operations
      const operationCounts = new Map<string, number>();
      metrics.forEach(metric => {
        const op = metric.operationName || 'anonymous';
        operationCounts.set(op, (operationCounts.get(op) || 0) + 1);
      });

      const topOperations = Array.from(operationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      res.json({
        success: true,
        data: {
          summary: {
            totalQueries,
            successfulQueries,
            errorRate: (totalQueries - successfulQueries) / totalQueries * 100,
            avgExecutionTime: Math.round(avgExecutionTime),
            avgResponseSize: Math.round(avgResponseSize)
          },
          queryFrequency: Object.fromEntries(queryFrequency),
          topOperations,
          timeRange,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get GraphQL metrics', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async registerService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceName, endpoint, schema, version = '1.0.0' } = req.body;

      if (!serviceName || !endpoint) {
        return res.status(400).json({
          success: false,
          error: 'Service name and endpoint are required'
        });
      }

      // Validate schema if provided
      if (schema) {
        try {
          buildSchema(schema);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid GraphQL schema: ' + error.message
          });
        }
      }

      // Check if service already exists
      const existing = await db.select()
        .from(apiGatewayGraphQLSchemas)
        .where(eq(apiGatewayGraphQLSchemas.serviceName, serviceName))
        .limit(1);

      if (existing.length > 0) {
        // Update existing service
        await db
          .update(apiGatewayGraphQLSchemas)
          .set({
            endpoint,
            schema: schema || null,
            version,
            updatedAt: new Date()
          })
          .where(eq(apiGatewayGraphQLSchemas.serviceName, serviceName));
      } else {
        // Create new service
        await db.insert(apiGatewayGraphQLSchemas).values({
          id: uuidv4(),
          serviceName,
          endpoint,
          schema: schema || null,
          version,
          isActive: true,
          metadata: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Update in-memory service schemas
      this.serviceSchemas.set(serviceName, {
        id: existing[0]?.id || uuidv4(),
        serviceName,
        endpoint,
        schema: schema || '',
        version,
        isActive: true,
        metadata: {},
        lastUpdated: new Date()
      });

      // Rebuild federated schema
      await this.buildFederatedSchema();

      res.json({
        success: true,
        data: {
          serviceName,
          endpoint,
          version,
          registered: true
        }
      });
    } catch (error) {
      logger.error('Failed to register GraphQL service', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async unregisterService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceName } = req.params;

      await db
        .update(apiGatewayGraphQLSchemas)
        .set({ isActive: false })
        .where(eq(apiGatewayGraphQLSchemas.serviceName, serviceName));

      this.serviceSchemas.delete(serviceName);
      await this.buildFederatedSchema();

      res.json({
        success: true,
        data: { serviceName, unregistered: true }
      });
    } catch (error) {
      logger.error('Failed to unregister GraphQL service', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = Array.from(this.serviceSchemas.values());
      
      res.json({
        success: true,
        data: {
          services,
          federationEnabled: this.configuration.federation.enabled,
          gatewayVersion: this.configuration.federation.gatewayVersion
        }
      });
    } catch (error) {
      logger.error('Failed to get GraphQL services', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const updates = req.body;
      
      this.configuration = {
        ...this.configuration,
        ...updates
      };

      // Rebuild schema if federation settings changed
      if (updates.federation) {
        await this.buildFederatedSchema();
      }

      res.json({
        success: true,
        data: {
          configuration: this.configuration,
          updated: true
        }
      });
    } catch (error) {
      logger.error('Failed to update GraphQL configuration', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      this.queryCache.clear();
      
      res.json({
        success: true,
        data: { cleared: true, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      logger.error('Failed to clear GraphQL cache', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Helper method to log query metrics
  async logQuery(query: string, variables: any, executionTime: number, responseSize: number, status: 'success' | 'error', errorMessage?: string, userId?: string, ipAddress?: string): Promise<void> {
    try {
      await db.insert(apiGatewayGraphQLMetrics).values({
        id: uuidv4(),
        query,
        operationName: this.extractOperationName(query),
        variables: JSON.stringify(variables || {}),
        executionTime,
        responseSize,
        status,
        errorMessage: errorMessage || null,
        userId: userId || null,
        ipAddress: ipAddress || '',
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log GraphQL query metrics', { error: error.message });
    }
  }

  private extractOperationName(query: string): string | null {
    const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
    return match ? match[1] : null;
  }
}

export const graphQLController = new GraphQLController();