/**
 * Alerts Controller - Intelligent Stock Alert Management
 * Amazon.com/Shopee.sg-level alert system with Bangladesh market optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  lowStockAlerts,
  inventory,
  products,
  vendors,
  users
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, isNull, or } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class AlertsController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        severity, 
        status = 'active',
        page = 1, 
        limit = 20 
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          alertType: lowStockAlerts.alertType,
          currentStock: lowStockAlerts.currentStock,
          threshold: lowStockAlerts.threshold,
          severity: lowStockAlerts.severity,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          actionRequired: lowStockAlerts.actionRequired,
          estimatedDaysUntilStockout: lowStockAlerts.estimatedDaysUntilStockout,
          status: lowStockAlerts.status,
          regionalImpact: lowStockAlerts.regionalImpact,
          festivalSeason: lowStockAlerts.festivalSeason,
          monsoonSeason: lowStockAlerts.monsoonSeason,
          autoReorderTriggered: lowStockAlerts.autoReorderTriggered,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName,
          currentInventory: inventory.quantity,
          reorderLevel: inventory.reorderLevel
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(vendors, eq(lowStockAlerts.vendorId, vendors.id))
        .leftJoin(inventory, eq(lowStockAlerts.productId, inventory.productId))
        .where(eq(lowStockAlerts.alertType, 'low_stock'));

      // Apply user role filters
      if (userRole === 'vendor') {
        query = query.where(eq(lowStockAlerts.vendorId, userId?.toString()));
      } else if (vendorId) {
        query = query.where(eq(lowStockAlerts.vendorId, vendorId as string));
      }

      // Apply additional filters
      if (severity) {
        query = query.where(eq(lowStockAlerts.severity, severity as string));
      }

      if (status) {
        query = query.where(eq(lowStockAlerts.status, status as string));
      }

      const alerts = await query
        .orderBy(desc(lowStockAlerts.severity), desc(lowStockAlerts.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get summary statistics
      const [summaryStats] = await db
        .select({
          total: count(),
          critical: count(sql`CASE WHEN ${lowStockAlerts.severity} = 'critical' THEN 1 END`),
          high: count(sql`CASE WHEN ${lowStockAlerts.severity} = 'high' THEN 1 END`),
          medium: count(sql`CASE WHEN ${lowStockAlerts.severity} = 'medium' THEN 1 END`),
          low: count(sql`CASE WHEN ${lowStockAlerts.severity} = 'low' THEN 1 END`)
        })
        .from(lowStockAlerts)
        .where(
          and(
            eq(lowStockAlerts.alertType, 'low_stock'),
            eq(lowStockAlerts.status, 'active')
          )
        );

      res.json({
        success: true,
        data: {
          alerts,
          summary: summaryStats,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: summaryStats.total,
            totalPages: Math.ceil(summaryStats.total / parseInt(limit as string))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get low stock alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get out of stock alerts
   */
  async getOutOfStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, page = 1, limit = 20 } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          actionRequired: lowStockAlerts.actionRequired,
          severity: lowStockAlerts.severity,
          status: lowStockAlerts.status,
          estimatedDaysUntilStockout: lowStockAlerts.estimatedDaysUntilStockout,
          autoReorderTriggered: lowStockAlerts.autoReorderTriggered,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(vendors, eq(lowStockAlerts.vendorId, vendors.id))
        .where(eq(lowStockAlerts.alertType, 'out_of_stock'));

      // Apply user role filters
      if (userRole === 'vendor') {
        query = query.where(eq(lowStockAlerts.vendorId, userId?.toString()));
      } else if (vendorId) {
        query = query.where(eq(lowStockAlerts.vendorId, vendorId as string));
      }

      const alerts = await query
        .orderBy(desc(lowStockAlerts.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json({
        success: true,
        data: {
          alerts,
          count: alerts.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get out of stock alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve out of stock alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get expired items alerts
   */
  async getExpiredItemsAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, daysAhead = 30, page = 1, limit = 20 } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + parseInt(daysAhead as string));

      let query = db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          severity: lowStockAlerts.severity,
          status: lowStockAlerts.status,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName,
          expiryDate: inventory.expiryDate,
          daysUntilExpiry: sql<number>`DATE_PART('day', ${inventory.expiryDate} - NOW())`
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(vendors, eq(lowStockAlerts.vendorId, vendors.id))
        .leftJoin(inventory, eq(lowStockAlerts.productId, inventory.productId))
        .where(
          and(
            or(
              eq(lowStockAlerts.alertType, 'expired'),
              eq(lowStockAlerts.alertType, 'near_expiry')
            ),
            lte(inventory.expiryDate, alertDate)
          )
        );

      // Apply user role filters
      if (userRole === 'vendor') {
        query = query.where(eq(lowStockAlerts.vendorId, userId?.toString()));
      } else if (vendorId) {
        query = query.where(eq(lowStockAlerts.vendorId, vendorId as string));
      }

      const alerts = await query
        .orderBy(inventory.expiryDate)
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json({
        success: true,
        data: {
          alerts,
          searchParams: {
            daysAhead: parseInt(daysAhead as string),
            alertDate
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get expired items alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve expired items alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get overstock alerts
   */
  async getOverstockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, page = 1, limit = 20 } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          severity: lowStockAlerts.severity,
          status: lowStockAlerts.status,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName,
          currentStock: lowStockAlerts.currentStock,
          maxStockLevel: inventory.maxStockLevel,
          overstockAmount: sql<number>`${lowStockAlerts.currentStock} - ${inventory.maxStockLevel}`
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(vendors, eq(lowStockAlerts.vendorId, vendors.id))
        .leftJoin(inventory, eq(lowStockAlerts.productId, inventory.productId))
        .where(eq(lowStockAlerts.alertType, 'overstock'));

      // Apply user role filters
      if (userRole === 'vendor') {
        query = query.where(eq(lowStockAlerts.vendorId, userId?.toString()));
      } else if (vendorId) {
        query = query.where(eq(lowStockAlerts.vendorId, vendorId as string));
      }

      const alerts = await query
        .orderBy(desc(sql`${lowStockAlerts.currentStock} - ${inventory.maxStockLevel}`))
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json({
        success: true,
        data: {
          alerts,
          count: alerts.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get overstock alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve overstock alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { notes } = req.body;
      const userId = req.user?.userId;

      const [updatedAlert] = await db
        .update(lowStockAlerts)
        .set({
          status: 'acknowledged',
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(lowStockAlerts.id, alertId))
        .returning();

      if (!updatedAlert) {
        res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
        return;
      }

      this.loggingService.logInfo('Alert acknowledged', {
        alertId,
        userId,
        notes
      });

      res.json({
        success: true,
        message: 'Alert acknowledged successfully',
        data: updatedAlert,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to acknowledge alert', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { resolution, notes } = req.body;
      const userId = req.user?.userId;

      const [updatedAlert] = await db
        .update(lowStockAlerts)
        .set({
          status: 'resolved',
          resolution,
          resolvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(lowStockAlerts.id, alertId))
        .returning();

      if (!updatedAlert) {
        res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
        return;
      }

      this.loggingService.logInfo('Alert resolved', {
        alertId,
        userId,
        resolution,
        notes
      });

      res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: updatedAlert,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to resolve alert', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Dismiss alert
   */
  async dismissAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;

      const [updatedAlert] = await db
        .update(lowStockAlerts)
        .set({
          status: 'dismissed',
          resolution: `Dismissed: ${reason}`,
          resolvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(lowStockAlerts.id, alertId))
        .returning();

      if (!updatedAlert) {
        res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
        return;
      }

      this.loggingService.logInfo('Alert dismissed', {
        alertId,
        userId,
        reason
      });

      res.json({
        success: true,
        message: 'Alert dismissed successfully',
        data: updatedAlert,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to dismiss alert', error);
      res.status(500).json({
        success: false,
        message: 'Failed to dismiss alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get alert settings for vendor
   */
  async getAlertSettings(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Check permissions
      if (userRole === 'vendor' && userId?.toString() !== vendorId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Get alert settings from cache or default settings
      const cacheKey = `alert_settings:${vendorId}`;
      let settings = await this.redisService.get(cacheKey);
      
      if (!settings) {
        // Default alert settings
        settings = {
          lowStockThreshold: 10,
          criticalStockThreshold: 5,
          expiryAlertDays: 30,
          enableEmailAlerts: true,
          enableSmsAlerts: true,
          enablePushNotifications: true,
          alertFrequency: 'immediate', // immediate, hourly, daily
          businessHoursOnly: false,
          bangladeshSpecific: {
            festivalAlerts: true,
            monsoonAlerts: true,
            regionalImpactAlerts: true
          }
        };
        
        // Cache for 1 hour
        await this.redisService.setex(cacheKey, 3600, JSON.stringify(settings));
      } else {
        settings = JSON.parse(settings);
      }

      res.json({
        success: true,
        data: {
          vendorId,
          settings
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get alert settings', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve alert settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update alert settings for vendor
   */
  async updateAlertSettings(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const settings = req.body;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Check permissions
      if (userRole === 'vendor' && userId?.toString() !== vendorId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Validate settings
      const allowedKeys = [
        'lowStockThreshold',
        'criticalStockThreshold',
        'expiryAlertDays',
        'enableEmailAlerts',
        'enableSmsAlerts',
        'enablePushNotifications',
        'alertFrequency',
        'businessHoursOnly',
        'bangladeshSpecific'
      ];

      const validatedSettings = Object.keys(settings)
        .filter(key => allowedKeys.includes(key))
        .reduce((obj, key) => {
          obj[key] = settings[key];
          return obj;
        }, {});

      // Save to cache
      const cacheKey = `alert_settings:${vendorId}`;
      await this.redisService.setex(cacheKey, 3600, JSON.stringify(validatedSettings));

      this.loggingService.logInfo('Alert settings updated', {
        vendorId,
        userId,
        updatedKeys: Object.keys(validatedSettings)
      });

      res.json({
        success: true,
        message: 'Alert settings updated successfully',
        data: {
          vendorId,
          settings: validatedSettings
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update alert settings', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update alert settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get festival impact alerts (Bangladesh-specific)
   */
  async getFestivalImpactAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { upcomingDays = 30, page = 1, limit = 20 } = req.query;
      
      const alerts = await db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          severity: lowStockAlerts.severity,
          status: lowStockAlerts.status,
          festivalSeason: lowStockAlerts.festivalSeason,
          regionalImpact: lowStockAlerts.regionalImpact,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          vendorName: vendors.businessName
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(vendors, eq(lowStockAlerts.vendorId, vendors.id))
        .where(
          and(
            eq(lowStockAlerts.festivalSeason, true),
            eq(lowStockAlerts.status, 'active')
          )
        )
        .orderBy(desc(lowStockAlerts.severity), desc(lowStockAlerts.createdAt))
        .limit(parseInt(limit as string));

      res.json({
        success: true,
        data: {
          alerts,
          context: {
            upcomingDays: parseInt(upcomingDays as string),
            bangladeshFestivals: [
              'Eid ul-Fitr',
              'Eid ul-Adha',
              'Pohela Boishakh',
              'Durga Puja',
              'Victory Day',
              'Independence Day'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get festival impact alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve festival impact alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get monsoon season alerts (Bangladesh-specific)
   */
  async getMonsoonSeasonAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          severity: lowStockAlerts.severity,
          status: lowStockAlerts.status,
          monsoonSeason: lowStockAlerts.monsoonSeason,
          regionalImpact: lowStockAlerts.regionalImpact,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          vendorName: vendors.businessName
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(vendors, eq(lowStockAlerts.vendorId, vendors.id))
        .where(
          and(
            eq(lowStockAlerts.monsoonSeason, true),
            eq(lowStockAlerts.status, 'active')
          )
        )
        .orderBy(desc(lowStockAlerts.severity), desc(lowStockAlerts.createdAt));

      res.json({
        success: true,
        data: {
          alerts,
          context: {
            monsoonSeasonMonths: ['June', 'July', 'August', 'September'],
            riskFactors: [
              'Transportation delays',
              'Warehouse flooding risk',
              'Supply chain disruption',
              'Increased demand for monsoon products'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get monsoon season alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve monsoon season alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}