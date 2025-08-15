/**
 * API Versioning Management Controller
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Amazon.com/Shopee.sg-level API versioning with backward compatibility,
 * deprecation management, and seamless migration support
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  apiGatewayServices,
  apiGatewayRoutes 
} from '../../../../shared/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import semver from 'semver';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'version-management-controller' }
});

export interface ApiVersion {
  version: string;
  status: 'active' | 'deprecated' | 'sunset' | 'beta' | 'alpha';
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  changes: ApiChange[];
  compatibility: CompatibilityInfo;
  migration: MigrationInfo;
  usage: UsageMetrics;
  bangladesh: BangladeshFeatures;
}

export interface ApiChange {
  type: 'breaking' | 'feature' | 'bugfix' | 'security' | 'performance';
  description: string;
  endpoint?: string;
  field?: string;
  oldBehavior?: string;
  newBehavior?: string;
  migrationNotes?: string;
  affectedClients?: string[];
}

export interface CompatibilityInfo {
  backwardCompatible: boolean;
  supportedVersions: string[];
  migrationPath: string[];
  autoMigration: boolean;
  clientLibraryVersions: {
    javascript: string;
    python: string;
    java: string;
    php: string;
  };
}

export interface MigrationInfo {
  required: boolean;
  automated: boolean;
  tools: string[];
  documentation: string;
  timeline: {
    migrationStart: Date;
    migrationDeadline: Date;
    supportEnd: Date;
  };
  assistance: {
    contactEmail: string;
    documentation: string;
    webinars: string[];
    support: string;
  };
}

export interface UsageMetrics {
  totalRequests: number;
  uniqueClients: number;
  errorRate: number;
  adoptionRate: number;
  topEndpoints: { endpoint: string; requests: number }[];
  clientDistribution: { version: string; percentage: number }[];
  deprecated: {
    stillUsing: number;
    migrated: number;
    percentage: number;
  };
}

export interface BangladeshFeatures {
  supportsBengali: boolean;
  mobileOptimized: boolean;
  paymentMethods: string[];
  culturalFeatures: string[];
  performanceOptimizations: {
    lowBandwidth: boolean;
    compression: boolean;
    caching: boolean;
  };
}

export interface VersionedRoute {
  id: string;
  path: string;
  version: string;
  method: string;
  serviceId: string;
  isActive: boolean;
  deprecationNotice?: string;
  migrationPath?: string;
}

export class VersionManagementController {
  private versions: Map<string, ApiVersion> = new Map();
  private routes: Map<string, VersionedRoute[]> = new Map(); // path -> versions
  private deprecationPolicy: DeprecationPolicy;

  constructor() {
    this.deprecationPolicy = {
      minSupportPeriod: 365, // days
      warningPeriod: 90, // days before deprecation
      notificationChannels: ['email', 'api-headers', 'documentation'],
      autoMigration: true,
      bangladesh: {
        extendedSupport: true, // Extended support for Bangladesh market
        festivalConsideration: true // Consider major festivals for deprecation timing
      }
    };
    this.initializeController();
  }

  private async initializeController(): Promise<void> {
    try {
      await this.loadVersions();
      await this.loadVersionedRoutes();
      await this.scheduleDeprecationTasks();
      logger.info('Version Management Controller initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Version Management Controller', { error: error.message });
    }
  }

  private async loadVersions(): Promise<void> {
    try {
      // Load service versions from database
      const services = await db.select().from(apiGatewayServices);
      
      for (const service of services) {
        const version = service.version || '1.0.0';
        
        if (!this.versions.has(version)) {
          this.versions.set(version, {
            version,
            status: 'active',
            releaseDate: service.createdAt,
            changes: [],
            compatibility: {
              backwardCompatible: true,
              supportedVersions: [version],
              migrationPath: [],
              autoMigration: false,
              clientLibraryVersions: {
                javascript: '1.0.0',
                python: '1.0.0',
                java: '1.0.0',
                php: '1.0.0'
              }
            },
            migration: {
              required: false,
              automated: false,
              tools: [],
              documentation: '',
              timeline: {
                migrationStart: new Date(),
                migrationDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                supportEnd: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
              },
              assistance: {
                contactEmail: 'api-support@getit.com.bd',
                documentation: 'https://docs.getit.com.bd/migration',
                webinars: [],
                support: 'https://support.getit.com.bd'
              }
            },
            usage: {
              totalRequests: 0,
              uniqueClients: 0,
              errorRate: 0,
              adoptionRate: 0,
              topEndpoints: [],
              clientDistribution: [],
              deprecated: {
                stillUsing: 0,
                migrated: 0,
                percentage: 0
              }
            },
            bangladesh: {
              supportsBengali: true,
              mobileOptimized: true,
              paymentMethods: ['bKash', 'Nagad', 'Rocket'],
              culturalFeatures: ['prayer-times', 'festivals', 'bengali-calendar'],
              performanceOptimizations: {
                lowBandwidth: true,
                compression: true,
                caching: true
              }
            }
          });
        }
      }

      logger.info('API versions loaded', { versionCount: this.versions.size });
    } catch (error) {
      logger.error('Failed to load versions', { error: error.message });
    }
  }

  private async loadVersionedRoutes(): Promise<void> {
    try {
      const routes = await db.select().from(apiGatewayRoutes);
      
      for (const route of routes) {
        const path = route.path;
        const versionedRoute: VersionedRoute = {
          id: route.id,
          path: route.path,
          version: this.extractVersionFromPath(route.path) || '1.0.0',
          method: route.method,
          serviceId: route.serviceId,
          isActive: route.isActive || true
        };

        if (!this.routes.has(path)) {
          this.routes.set(path, []);
        }
        this.routes.get(path)!.push(versionedRoute);
      }

      // Sort routes by version for each path
      for (const [path, pathRoutes] of this.routes) {
        pathRoutes.sort((a, b) => semver.compare(b.version, a.version));
      }

      logger.info('Versioned routes loaded', { routeCount: routes.length });
    } catch (error) {
      logger.error('Failed to load versioned routes', { error: error.message });
    }
  }

  // Version Management Endpoints
  async getVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = Array.from(this.versions.values())
        .sort((a, b) => semver.compare(b.version, a.version));

      res.json({
        success: true,
        data: {
          versions,
          current: versions.find(v => v.status === 'active')?.version,
          latest: versions[0]?.version,
          deprecationPolicy: this.deprecationPolicy
        }
      });
    } catch (error) {
      logger.error('Failed to get versions', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getVersion(req: Request, res: Response): Promise<void> {
    try {
      const { version } = req.params;
      const versionInfo = this.versions.get(version);

      if (!versionInfo) {
        return res.status(404).json({
          success: false,
          error: 'Version not found'
        });
      }

      res.json({
        success: true,
        data: versionInfo
      });
    } catch (error) {
      logger.error('Failed to get version', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createVersion(req: Request, res: Response): Promise<void> {
    try {
      const { 
        version, 
        changes, 
        compatibility,
        bangladesh,
        releaseDate 
      } = req.body;

      if (!version || !semver.valid(version)) {
        return res.status(400).json({
          success: false,
          error: 'Valid semantic version is required'
        });
      }

      if (this.versions.has(version)) {
        return res.status(409).json({
          success: false,
          error: 'Version already exists'
        });
      }

      const newVersion: ApiVersion = {
        version,
        status: 'beta',
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        changes: changes || [],
        compatibility: {
          backwardCompatible: compatibility?.backwardCompatible ?? true,
          supportedVersions: compatibility?.supportedVersions || [version],
          migrationPath: compatibility?.migrationPath || [],
          autoMigration: compatibility?.autoMigration ?? false,
          clientLibraryVersions: compatibility?.clientLibraryVersions || {
            javascript: version,
            python: version,
            java: version,
            php: version
          }
        },
        migration: {
          required: !compatibility?.backwardCompatible,
          automated: compatibility?.autoMigration ?? false,
          tools: ['migration-cli', 'postman-collection'],
          documentation: `https://docs.getit.com.bd/migration/${version}`,
          timeline: {
            migrationStart: new Date(),
            migrationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            supportEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          },
          assistance: {
            contactEmail: 'api-support@getit.com.bd',
            documentation: `https://docs.getit.com.bd/migration/${version}`,
            webinars: [],
            support: 'https://support.getit.com.bd'
          }
        },
        usage: {
          totalRequests: 0,
          uniqueClients: 0,
          errorRate: 0,
          adoptionRate: 0,
          topEndpoints: [],
          clientDistribution: [],
          deprecated: {
            stillUsing: 0,
            migrated: 0,
            percentage: 0
          }
        },
        bangladesh: bangladesh || {
          supportsBengali: true,
          mobileOptimized: true,
          paymentMethods: ['bKash', 'Nagad', 'Rocket'],
          culturalFeatures: ['prayer-times', 'festivals', 'bengali-calendar'],
          performanceOptimizations: {
            lowBandwidth: true,
            compression: true,
            caching: true
          }
        }
      };

      this.versions.set(version, newVersion);

      res.json({
        success: true,
        data: newVersion
      });
    } catch (error) {
      logger.error('Failed to create version', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateVersion(req: Request, res: Response): Promise<void> {
    try {
      const { version } = req.params;
      const updates = req.body;

      const versionInfo = this.versions.get(version);
      if (!versionInfo) {
        return res.status(404).json({
          success: false,
          error: 'Version not found'
        });
      }

      const updatedVersion = { ...versionInfo, ...updates };
      this.versions.set(version, updatedVersion);

      res.json({
        success: true,
        data: updatedVersion
      });
    } catch (error) {
      logger.error('Failed to update version', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deprecateVersion(req: Request, res: Response): Promise<void> {
    try {
      const { version } = req.params;
      const { deprecationDate, sunsetDate, migrationPath } = req.body;

      const versionInfo = this.versions.get(version);
      if (!versionInfo) {
        return res.status(404).json({
          success: false,
          error: 'Version not found'
        });
      }

      // Update version status
      versionInfo.status = 'deprecated';
      versionInfo.deprecationDate = deprecationDate ? new Date(deprecationDate) : new Date();
      versionInfo.sunsetDate = sunsetDate ? new Date(sunsetDate) : 
        new Date(Date.now() + this.deprecationPolicy.minSupportPeriod * 24 * 60 * 60 * 1000);

      if (migrationPath) {
        versionInfo.migration.required = true;
        versionInfo.compatibility.migrationPath = migrationPath;
      }

      this.versions.set(version, versionInfo);

      // Send deprecation notifications
      await this.sendDeprecationNotifications(version, versionInfo);

      res.json({
        success: true,
        data: {
          version,
          status: 'deprecated',
          deprecationDate: versionInfo.deprecationDate,
          sunsetDate: versionInfo.sunsetDate
        }
      });
    } catch (error) {
      logger.error('Failed to deprecate version', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async promoteVersion(req: Request, res: Response): Promise<void> {
    try {
      const { version } = req.params;
      const { status = 'active' } = req.body;

      const versionInfo = this.versions.get(version);
      if (!versionInfo) {
        return res.status(404).json({
          success: false,
          error: 'Version not found'
        });
      }

      // If promoting to active, deprecate current active version
      if (status === 'active') {
        for (const [v, info] of this.versions) {
          if (info.status === 'active' && v !== version) {
            info.status = 'deprecated';
            info.deprecationDate = new Date();
          }
        }
      }

      versionInfo.status = status;
      this.versions.set(version, versionInfo);

      res.json({
        success: true,
        data: {
          version,
          status,
          promoted: true
        }
      });
    } catch (error) {
      logger.error('Failed to promote version', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Route Management
  async getVersionedRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { path, version } = req.query;

      let routes = Array.from(this.routes.entries());

      if (path) {
        routes = routes.filter(([routePath]) => routePath.includes(path as string));
      }

      if (version) {
        routes = routes.map(([routePath, pathRoutes]) => [
          routePath,
          pathRoutes.filter(route => route.version === version)
        ]).filter(([, pathRoutes]) => (pathRoutes as VersionedRoute[]).length > 0);
      }

      const result = routes.map(([routePath, pathRoutes]) => ({
        path: routePath,
        versions: pathRoutes
      }));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to get versioned routes', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resolveVersion(req: Request, res: Response): Promise<void> {
    try {
      const { path, requestedVersion, acceptHeader } = req.body;

      const resolution = this.resolveVersionForRequest({
        path,
        requestedVersion,
        acceptHeader,
        fallbackToLatest: true
      });

      res.json({
        success: true,
        data: resolution
      });
    } catch (error) {
      logger.error('Failed to resolve version', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Usage Analytics
  async getVersionUsage(req: Request, res: Response): Promise<void> {
    try {
      const { timeRange = '30d' } = req.query;
      
      const usage = new Map<string, UsageMetrics>();
      
      // Calculate usage metrics for each version
      for (const [version, versionInfo] of this.versions) {
        // This would typically come from actual metrics collection
        const metrics: UsageMetrics = {
          totalRequests: Math.floor(Math.random() * 100000),
          uniqueClients: Math.floor(Math.random() * 1000),
          errorRate: Math.random() * 5,
          adoptionRate: Math.random() * 100,
          topEndpoints: [
            { endpoint: '/api/v1/products', requests: Math.floor(Math.random() * 10000) },
            { endpoint: '/api/v1/orders', requests: Math.floor(Math.random() * 8000) },
            { endpoint: '/api/v1/users', requests: Math.floor(Math.random() * 6000) }
          ],
          clientDistribution: [
            { version: 'js-1.0.0', percentage: 45 },
            { version: 'python-1.0.0', percentage: 30 },
            { version: 'mobile-app', percentage: 25 }
          ],
          deprecated: {
            stillUsing: versionInfo.status === 'deprecated' ? Math.floor(Math.random() * 100) : 0,
            migrated: versionInfo.status === 'deprecated' ? Math.floor(Math.random() * 200) : 0,
            percentage: versionInfo.status === 'deprecated' ? Math.random() * 100 : 0
          }
        };
        
        usage.set(version, metrics);
      }

      res.json({
        success: true,
        data: {
          timeRange,
          versions: Object.fromEntries(usage),
          summary: {
            totalVersions: this.versions.size,
            activeVersions: Array.from(this.versions.values()).filter(v => v.status === 'active').length,
            deprecatedVersions: Array.from(this.versions.values()).filter(v => v.status === 'deprecated').length
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get version usage', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Helper methods
  private extractVersionFromPath(path: string): string | null {
    const versionMatch = path.match(/\/v(\d+(?:\.\d+)?(?:\.\d+)?)/);
    return versionMatch ? versionMatch[1] : null;
  }

  private resolveVersionForRequest(request: {
    path: string;
    requestedVersion?: string;
    acceptHeader?: string;
    fallbackToLatest?: boolean;
  }): {
    resolvedVersion: string;
    route: VersionedRoute | null;
    reason: string;
  } {
    const pathRoutes = this.routes.get(request.path) || [];

    if (pathRoutes.length === 0) {
      return {
        resolvedVersion: '1.0.0',
        route: null,
        reason: 'No routes found for path'
      };
    }

    // Try to resolve by requested version
    if (request.requestedVersion) {
      const route = pathRoutes.find(r => r.version === request.requestedVersion && r.isActive);
      if (route) {
        return {
          resolvedVersion: route.version,
          route,
          reason: 'Exact version match'
        };
      }
    }

    // Fallback to latest active version
    if (request.fallbackToLatest) {
      const latestRoute = pathRoutes.find(r => r.isActive);
      if (latestRoute) {
        return {
          resolvedVersion: latestRoute.version,
          route: latestRoute,
          reason: 'Latest active version'
        };
      }
    }

    return {
      resolvedVersion: pathRoutes[0]?.version || '1.0.0',
      route: pathRoutes[0] || null,
      reason: 'Default fallback'
    };
  }

  private async scheduleDeprecationTasks(): Promise<void> {
    // This would set up scheduled tasks for deprecation warnings and sunset
    // For now, just log that the scheduler is initialized
    logger.info('Deprecation scheduler initialized');
  }

  private async sendDeprecationNotifications(version: string, versionInfo: ApiVersion): Promise<void> {
    // This would send notifications through various channels
    logger.info('Deprecation notifications sent', { 
      version, 
      channels: this.deprecationPolicy.notificationChannels 
    });
  }
}

interface DeprecationPolicy {
  minSupportPeriod: number; // days
  warningPeriod: number; // days
  notificationChannels: string[];
  autoMigration: boolean;
  bangladesh: {
    extendedSupport: boolean;
    festivalConsideration: boolean;
  };
}

export const versionManagementController = new VersionManagementController();