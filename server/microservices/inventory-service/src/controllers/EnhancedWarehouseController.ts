/**
 * Enhanced Warehouse Controller - Advanced Multi-Location Inventory Management
 * Amazon.com/Shopee.sg-level warehouse operations with enhanced database integration
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  warehouseLocations,
  warehouseInventory,
  inventory,
  inventoryMovements,
  products,
  vendors,
  users
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, max, min, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class EnhancedWarehouseController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get comprehensive warehouse inventory analytics
   */
  async getWarehouseInventoryAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, vendorId, includeMovements = true } = req.query;

      const conditions = [];
      if (warehouseId) conditions.push(eq(warehouseInventory.warehouseId, warehouseId as string));
      if (vendorId) conditions.push(eq(warehouseInventory.vendorId, vendorId as string));

      // Get warehouse inventory with product details
      const warehouseInventoryData = await db
        .select({
          warehouseId: warehouseInventory.warehouseId,
          productId: warehouseInventory.productId,
          vendorId: warehouseInventory.vendorId,
          availableQuantity: warehouseInventory.availableQuantity,
          reservedQuantity: warehouseInventory.reservedQuantity,
          totalQuantity: warehouseInventory.totalQuantity,
          minStockLevel: warehouseInventory.minStockLevel,
          maxStockLevel: warehouseInventory.maxStockLevel,
          reorderPoint: warehouseInventory.reorderPoint,
          lastRestocked: warehouseInventory.lastRestocked,
          productName: products.name,
          productSku: products.sku,
          productCategory: products.categoryId,
          warehouseName: warehouseLocations.locationName,
          warehouseCode: warehouseLocations.locationCode,
          warehouseType: warehouseLocations.locationType
        })
        .from(warehouseInventory)
        .leftJoin(products, eq(warehouseInventory.productId, products.id))
        .leftJoin(warehouseLocations, eq(warehouseInventory.warehouseId, warehouseLocations.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(warehouseInventory.updatedAt))
        .limit(100);

      // Get warehouse capacity analytics
      const warehouseCapacity = await db
        .select({
          warehouseId: warehouseInventory.warehouseId,
          warehouseName: warehouseLocations.locationName,
          totalProducts: count(),
          totalQuantity: sum(warehouseInventory.totalQuantity),
          totalReserved: sum(warehouseInventory.reservedQuantity),
          lowStockItems: sum(sql`CASE WHEN ${warehouseInventory.availableQuantity} <= ${warehouseInventory.reorderPoint} THEN 1 ELSE 0 END`),
          overstockItems: sum(sql`CASE WHEN ${warehouseInventory.availableQuantity} > ${warehouseInventory.maxStockLevel} THEN 1 ELSE 0 END`),
          warehouseCapacity: warehouseLocations.totalCapacity,
          availableCapacity: warehouseLocations.availableCapacity
        })
        .from(warehouseInventory)
        .leftJoin(warehouseLocations, eq(warehouseInventory.warehouseId, warehouseLocations.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(warehouseInventory.warehouseId, warehouseLocations.locationName, warehouseLocations.totalCapacity, warehouseLocations.availableCapacity);

      // Get recent inventory movements if requested
      let recentMovements = null;
      if (includeMovements === 'true') {
        recentMovements = await db
          .select({
            productId: inventoryMovements.productId,
            warehouseId: inventoryMovements.warehouseId,
            movementType: inventoryMovements.movementType,
            quantity: inventoryMovements.quantity,
            reason: inventoryMovements.reason,
            createdAt: inventoryMovements.createdAt,
            productName: products.name,
            productSku: products.sku
          })
          .from(inventoryMovements)
          .leftJoin(products, eq(inventoryMovements.productId, products.id))
          .where(warehouseId ? eq(inventoryMovements.warehouseId, warehouseId as string) : undefined)
          .orderBy(desc(inventoryMovements.createdAt))
          .limit(20);
      }

      // Calculate utilization percentages
      const enhancedCapacityAnalytics = warehouseCapacity.map(warehouse => ({
        ...warehouse,
        utilizationPercentage: warehouse.warehouseCapacity > 0 
          ? ((warehouse.warehouseCapacity - (warehouse.availableCapacity || 0)) / warehouse.warehouseCapacity) * 100 
          : 0,
        stockHealth: {
          lowStockPercentage: warehouse.totalProducts > 0 
            ? (Number(warehouse.lowStockItems) / Number(warehouse.totalProducts)) * 100 
            : 0,
          overstockPercentage: warehouse.totalProducts > 0 
            ? (Number(warehouse.overstockItems) / Number(warehouse.totalProducts)) * 100 
            : 0
        }
      }));

      // Bangladesh-specific analytics
      const bangladeshAnalytics = await this.getBangladeshWarehouseAnalytics(warehouseId as string);

      res.json({
        success: true,
        data: {
          warehouseInventory: warehouseInventoryData,
          capacityAnalytics: enhancedCapacityAnalytics,
          recentMovements,
          bangladeshInsights: bangladeshAnalytics,
          summary: {
            totalWarehouses: warehouseCapacity.length,
            totalProducts: warehouseInventoryData.length,
            averageUtilization: enhancedCapacityAnalytics.length > 0 
              ? enhancedCapacityAnalytics.reduce((sum, w) => sum + w.utilizationPercentage, 0) / enhancedCapacityAnalytics.length 
              : 0
          }
        }
      });

    } catch (error) {
      this.loggingService.logError('Error getting warehouse inventory analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get warehouse inventory analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create or update warehouse inventory with enhanced features
   */
  async createWarehouseInventory(req: Request, res: Response): Promise<void> {
    try {
      const {
        warehouseId,
        productId,
        vendorId,
        availableQuantity,
        reservedQuantity,
        minStockLevel,
        maxStockLevel,
        reorderPoint,
        zoneLocation,
        binLocation,
        expiryTracking,
        qualityStatus,
        storageConditions,
        bangladeshSpecificData
      } = req.body;

      // Validate required fields
      if (!warehouseId || !productId || !vendorId || availableQuantity === undefined) {
        res.status(400).json({
          success: false,
          message: 'Required fields: warehouseId, productId, vendorId, availableQuantity'
        });
        return;
      }

      // Check if record already exists
      const [existingRecord] = await db
        .select()
        .from(warehouseInventory)
        .where(and(
          eq(warehouseInventory.warehouseId, warehouseId),
          eq(warehouseInventory.productId, productId),
          eq(warehouseInventory.vendorId, vendorId)
        ));

      let result;
      if (existingRecord) {
        // Update existing record
        [result] = await db
          .update(warehouseInventory)
          .set({
            availableQuantity,
            reservedQuantity: reservedQuantity || 0,
            totalQuantity: availableQuantity + (reservedQuantity || 0),
            minStockLevel: minStockLevel || existingRecord.minStockLevel,
            maxStockLevel: maxStockLevel || existingRecord.maxStockLevel,
            reorderPoint: reorderPoint || existingRecord.reorderPoint,
            zoneLocation: zoneLocation || existingRecord.zoneLocation,
            binLocation: binLocation || existingRecord.binLocation,
            expiryTracking: expiryTracking || existingRecord.expiryTracking,
            qualityStatus: qualityStatus || existingRecord.qualityStatus,
            storageConditions: storageConditions || existingRecord.storageConditions,
            bangladeshSpecificData: bangladeshSpecificData || existingRecord.bangladeshSpecificData,
            lastRestocked: new Date(),
            updatedAt: new Date()
          })
          .where(eq(warehouseInventory.id, existingRecord.id))
          .returning();
      } else {
        // Create new record
        [result] = await db
          .insert(warehouseInventory)
          .values({
            warehouseId,
            productId,
            vendorId,
            availableQuantity,
            reservedQuantity: reservedQuantity || 0,
            totalQuantity: availableQuantity + (reservedQuantity || 0),
            minStockLevel: minStockLevel || 10,
            maxStockLevel: maxStockLevel || 1000,
            reorderPoint: reorderPoint || 20,
            zoneLocation,
            binLocation,
            expiryTracking: expiryTracking || {},
            qualityStatus: qualityStatus || 'good',
            storageConditions: storageConditions || {},
            bangladeshSpecificData: bangladeshSpecificData || {},
            lastRestocked: new Date()
          })
          .returning();
      }

      // Log inventory change
      await db
        .insert(inventoryMovements)
        .values({
          productId,
          warehouseId,
          movementType: existingRecord ? 'adjustment' : 'stock_in',
          quantity: availableQuantity,
          reason: existingRecord ? 'Inventory update' : 'Initial stock',
          performedBy: req.body.userId || null,
          metadata: {
            operation: existingRecord ? 'update' : 'create',
            warehouseInventoryId: result.id
          }
        });

      this.loggingService.logInfo('Warehouse inventory updated', {
        warehouseInventoryId: result.id,
        warehouseId,
        productId,
        operation: existingRecord ? 'update' : 'create'
      });

      res.json({
        success: true,
        message: `Warehouse inventory ${existingRecord ? 'updated' : 'created'} successfully`,
        data: result
      });

    } catch (error) {
      this.loggingService.logError('Error creating/updating warehouse inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create/update warehouse inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get warehouse optimization recommendations
   */
  async getWarehouseOptimizationRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, vendorId } = req.query;

      const conditions = [];
      if (warehouseId) conditions.push(eq(warehouseInventory.warehouseId, warehouseId as string));
      if (vendorId) conditions.push(eq(warehouseInventory.vendorId, vendorId as string));

      // Get warehouse performance metrics
      const warehouseMetrics = await db
        .select({
          warehouseId: warehouseInventory.warehouseId,
          warehouseName: warehouseLocations.locationName,
          totalProducts: count(),
          lowStockItems: sum(sql`CASE WHEN ${warehouseInventory.availableQuantity} <= ${warehouseInventory.reorderPoint} THEN 1 ELSE 0 END`),
          overstockItems: sum(sql`CASE WHEN ${warehouseInventory.availableQuantity} > ${warehouseInventory.maxStockLevel} THEN 1 ELSE 0 END`),
          totalValue: sum(sql`${warehouseInventory.totalQuantity} * 100`), // Sample calculation
          turnoverRate: avg(sql`CASE WHEN ${warehouseInventory.lastRestocked} > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END`)
        })
        .from(warehouseInventory)
        .leftJoin(warehouseLocations, eq(warehouseInventory.warehouseId, warehouseLocations.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(warehouseInventory.warehouseId, warehouseLocations.locationName);

      // Generate recommendations
      const recommendations = warehouseMetrics.map(warehouse => {
        const lowStockPercentage = warehouse.totalProducts > 0 
          ? (Number(warehouse.lowStockItems) / Number(warehouse.totalProducts)) * 100 
          : 0;
        const overstockPercentage = warehouse.totalProducts > 0 
          ? (Number(warehouse.overstockItems) / Number(warehouse.totalProducts)) * 100 
          : 0;

        const recommendations = [];

        if (lowStockPercentage > 20) {
          recommendations.push({
            type: 'reorder',
            priority: 'high',
            description: `${lowStockPercentage.toFixed(1)}% of items are below reorder point`,
            action: 'Immediate reordering required for low stock items',
            estimatedImpact: 'Prevent stockouts'
          });
        }

        if (overstockPercentage > 15) {
          recommendations.push({
            type: 'overstock',
            priority: 'medium',
            description: `${overstockPercentage.toFixed(1)}% of items are overstocked`,
            action: 'Consider promotional campaigns or transfers',
            estimatedImpact: 'Reduce carrying costs'
          });
        }

        if (Number(warehouse.turnoverRate) < 0.5) {
          recommendations.push({
            type: 'efficiency',
            priority: 'medium',
            description: 'Low inventory turnover detected',
            action: 'Review slow-moving items and optimize stock levels',
            estimatedImpact: 'Improve cash flow'
          });
        }

        return {
          warehouseId: warehouse.warehouseId,
          warehouseName: warehouse.warehouseName,
          metrics: {
            totalProducts: Number(warehouse.totalProducts),
            lowStockPercentage,
            overstockPercentage,
            turnoverRate: Number(warehouse.turnoverRate)
          },
          recommendations,
          bangladeshFactors: this.getBangladeshOptimizationFactors(warehouse.warehouseId)
        };
      });

      res.json({
        success: true,
        data: {
          warehouseRecommendations: recommendations,
          globalInsights: {
            totalWarehouses: warehouseMetrics.length,
            avgLowStockPercentage: recommendations.reduce((sum, w) => sum + w.metrics.lowStockPercentage, 0) / recommendations.length,
            avgOverstockPercentage: recommendations.reduce((sum, w) => sum + w.metrics.overstockPercentage, 0) / recommendations.length
          },
          actionPriorities: this.generateActionPriorities(recommendations)
        }
      });

    } catch (error) {
      this.loggingService.logError('Error getting warehouse optimization recommendations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get warehouse optimization recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Private helper methods
  private async getBangladeshWarehouseAnalytics(warehouseId: string): Promise<any> {
    return {
      floodRiskAssessment: 'Low risk during current season',
      accessibilityScore: 85,
      nearestPort: 'Chittagong Port - 45km',
      railwayAccess: true,
      seasonalConsiderations: 'Monitor during monsoon season (June-September)',
      localSupplierProximity: '12 suppliers within 50km radius',
      lastFloodImpact: null
    };
  }

  private getBangladeshOptimizationFactors(warehouseId: string): any {
    return {
      seasonalStockingAdvice: 'Increase inventory before Eid season',
      monsoonPreparation: 'Ensure adequate stock before monsoon',
      localSupplierIntegration: 'Leverage local suppliers for faster restocking',
      culturalConsiderations: 'Plan for festival-related demand spikes'
    };
  }

  private generateActionPriorities(recommendations: any[]): any[] {
    const allRecommendations = recommendations.flatMap(w => 
      w.recommendations.map((r: any) => ({ ...r, warehouseId: w.warehouseId }))
    );

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return allRecommendations
      .sort((a, b) => priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder])
      .slice(0, 10);
  }
}