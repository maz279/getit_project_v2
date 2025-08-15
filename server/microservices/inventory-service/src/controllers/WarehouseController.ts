/**
 * Warehouse Controller - Multi-Location Inventory Management
 * Amazon.com/Shopee.sg-level warehouse operations with Bangladesh regional optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  warehouseLocations,
  inventory,
  inventoryMovements,
  products,
  vendors,
  users,
  warehouseInventory
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, max, min } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class WarehouseController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get all warehouse locations
   */
  async getWarehouseLocations(req: Request, res: Response): Promise<void> {
    try {
      const { 
        status = 'active',
        locationType,
        district,
        includeCapacity = false 
      } = req.query;

      let query = db
        .select({
          id: warehouseLocations.id,
          locationCode: warehouseLocations.locationCode,
          locationName: warehouseLocations.locationName,
          locationType: warehouseLocations.locationType,
          address: warehouseLocations.address,
          district: warehouseLocations.district,
          division: warehouseLocations.division,
          postalCode: warehouseLocations.postalCode,
          coordinates: warehouseLocations.coordinates,
          totalCapacity: warehouseLocations.totalCapacity,
          availableCapacity: warehouseLocations.availableCapacity,
          operatingHours: warehouseLocations.operatingHours,
          timezone: warehouseLocations.timezone,
          status: warehouseLocations.status,
          isDefault: warehouseLocations.isDefault,
          priority: warehouseLocations.priority,
          bangladeshRegion: warehouseLocations.bangladeshRegion,
          nearestPort: warehouseLocations.nearestPort,
          accessToRailway: warehouseLocations.accessToRailway,
          floodRisk: warehouseLocations.floodRisk,
          contactPhone: warehouseLocations.contactPhone,
          contactEmail: warehouseLocations.contactEmail,
          managerName: users.fullName,
          createdAt: warehouseLocations.createdAt
        })
        .from(warehouseLocations)
        .leftJoin(users, eq(warehouseLocations.managerId, users.id));

      if (status) {
        query = query.where(eq(warehouseLocations.status, status as string));
      }

      if (locationType) {
        query = query.where(eq(warehouseLocations.locationType, locationType as string));
      }

      if (district) {
        query = query.where(eq(warehouseLocations.district, district as string));
      }

      const locations = await query
        .orderBy(warehouseLocations.priority, warehouseLocations.locationName);

      // Add capacity utilization if requested
      let locationsWithUtilization = locations;
      if (includeCapacity) {
        locationsWithUtilization = await Promise.all(
          locations.map(async (location) => {
            const utilization = await this.calculateLocationUtilization(location.locationCode);
            return {
              ...location,
              utilization
            };
          })
        );
      }

      res.json({
        success: true,
        data: {
          locations: locationsWithUtilization,
          summary: {
            total: locations.length,
            active: locations.filter(l => l.status === 'active').length,
            byType: this.groupBy(locations, 'locationType'),
            byRegion: this.groupBy(locations, 'bangladeshRegion')
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get warehouse locations', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve warehouse locations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new warehouse location
   */
  async createWarehouseLocation(req: Request, res: Response): Promise<void> {
    try {
      const {
        locationCode,
        locationName,
        locationType,
        address,
        district,
        division,
        postalCode,
        coordinates,
        totalCapacity,
        operatingHours,
        managerId,
        contactPhone,
        contactEmail,
        bangladeshRegion,
        nearestPort,
        accessToRailway = false,
        floodRisk = 'none',
        isDefault = false,
        priority = 0
      } = req.body;
      const userId = req.user?.userId;

      // Check if location code already exists
      const [existingLocation] = await db
        .select()
        .from(warehouseLocations)
        .where(eq(warehouseLocations.locationCode, locationCode));

      if (existingLocation) {
        res.status(400).json({
          success: false,
          message: `Location code '${locationCode}' already exists`
        });
        return;
      }

      // Create warehouse location
      const [newLocation] = await db
        .insert(warehouseLocations)
        .values({
          locationCode,
          locationName,
          locationType,
          address,
          district,
          division,
          postalCode,
          coordinates,
          totalCapacity,
          availableCapacity: totalCapacity, // Initially all capacity is available
          operatingHours,
          managerId,
          contactPhone,
          contactEmail,
          bangladeshRegion,
          nearestPort,
          accessToRailway,
          floodRisk,
          isDefault,
          priority,
          status: 'active'
        })
        .returning();

      this.loggingService.logInfo('Warehouse location created', {
        locationId: newLocation.id,
        locationCode,
        locationName,
        locationType,
        district,
        createdBy: userId
      });

      res.json({
        success: true,
        message: 'Warehouse location created successfully',
        data: newLocation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create warehouse location', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create warehouse location',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update warehouse location
   */
  async updateWarehouseLocation(req: Request, res: Response): Promise<void> {
    try {
      const { locationId } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;

      const allowedFields = [
        'locationName',
        'locationType',
        'address',
        'district',
        'division',
        'postalCode',
        'coordinates',
        'totalCapacity',
        'operatingHours',
        'managerId',
        'contactPhone',
        'contactEmail',
        'bangladeshRegion',
        'nearestPort',
        'accessToRailway',
        'floodRisk',
        'status',
        'priority'
      ];

      const validUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      if (Object.keys(validUpdates).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
        return;
      }

      // If total capacity is being updated, recalculate available capacity
      if (validUpdates.totalCapacity !== undefined) {
        const [currentLocation] = await db
          .select({ availableCapacity: warehouseLocations.availableCapacity })
          .from(warehouseLocations)
          .where(eq(warehouseLocations.id, locationId));

        if (currentLocation) {
          const usedCapacity = (currentLocation.availableCapacity || 0);
          validUpdates.availableCapacity = validUpdates.totalCapacity - usedCapacity;
        }
      }

      const [updatedLocation] = await db
        .update(warehouseLocations)
        .set({
          ...validUpdates,
          updatedAt: new Date()
        })
        .where(eq(warehouseLocations.id, locationId))
        .returning();

      if (!updatedLocation) {
        res.status(404).json({
          success: false,
          message: 'Warehouse location not found'
        });
        return;
      }

      this.loggingService.logInfo('Warehouse location updated', {
        locationId,
        userId,
        updatedFields: Object.keys(validUpdates)
      });

      res.json({
        success: true,
        message: 'Warehouse location updated successfully',
        data: updatedLocation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update warehouse location', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update warehouse location',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get inventory for specific location
   */
  async getLocationInventory(req: Request, res: Response): Promise<void> {
    try {
      const { locationId } = req.params;
      const { 
        status,
        lowStock = false,
        page = 1,
        limit = 50
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Get location details
      const [location] = await db
        .select()
        .from(warehouseLocations)
        .where(eq(warehouseLocations.id, locationId));

      if (!location) {
        res.status(404).json({
          success: false,
          message: 'Warehouse location not found'
        });
        return;
      }

      let query = db
        .select({
          id: inventory.id,
          productId: inventory.productId,
          sku: inventory.sku,
          quantity: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          availableQuantity: inventory.availableQuantity,
          reorderLevel: inventory.reorderLevel,
          maxStockLevel: inventory.maxStockLevel,
          warehouseLocation: inventory.warehouseLocation,
          binLocation: inventory.binLocation,
          zone: inventory.zone,
          unitCost: inventory.unitCost,
          totalValue: inventory.totalValue,
          status: inventory.status,
          lastStockCheck: inventory.lastStockCheck,
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .leftJoin(vendors, eq(inventory.vendorId, vendors.id))
        .where(eq(inventory.warehouseLocation, location.locationCode));

      if (status) {
        query = query.where(eq(inventory.status, status as string));
      }

      if (lowStock === 'true') {
        query = query.where(sql`${inventory.quantity} <= ${inventory.reorderLevel}`);
      }

      const inventoryItems = await query
        .orderBy(desc(inventory.totalValue))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get location summary
      const [locationSummary] = await db
        .select({
          totalItems: count(),
          totalValue: sum(inventory.totalValue),
          lowStockItems: count(sql`CASE WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 1 END`),
          outOfStockItems: count(sql`CASE WHEN ${inventory.quantity} = 0 THEN 1 END`),
          averageValue: avg(inventory.totalValue)
        })
        .from(inventory)
        .where(eq(inventory.warehouseLocation, location.locationCode));

      res.json({
        success: true,
        data: {
          location: {
            id: location.id,
            locationCode: location.locationCode,
            locationName: location.locationName,
            district: location.district,
            totalCapacity: location.totalCapacity,
            availableCapacity: location.availableCapacity
          },
          inventory: inventoryItems,
          summary: locationSummary,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: locationSummary.totalItems
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get location inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve location inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        fromLocationCode,
        toLocationCode,
        quantity,
        notes,
        transferReason = 'rebalancing'
      } = req.body;
      const userId = req.user?.userId;

      // Validate locations exist
      const [fromLocation] = await db
        .select()
        .from(warehouseLocations)
        .where(eq(warehouseLocations.locationCode, fromLocationCode));

      const [toLocation] = await db
        .select()
        .from(warehouseLocations)
        .where(eq(warehouseLocations.locationCode, toLocationCode));

      if (!fromLocation || !toLocation) {
        res.status(404).json({
          success: false,
          message: 'One or both warehouse locations not found'
        });
        return;
      }

      // Get source inventory
      const [sourceInventory] = await db
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.productId, productId),
            eq(inventory.warehouseLocation, fromLocationCode)
          )
        );

      if (!sourceInventory) {
        res.status(404).json({
          success: false,
          message: 'Product not found in source location'
        });
        return;
      }

      if (sourceInventory.availableQuantity < quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory in source location. Available: ${sourceInventory.availableQuantity}, Requested: ${quantity}`
        });
        return;
      }

      // Update source location inventory
      await db
        .update(inventory)
        .set({
          quantity: sourceInventory.quantity - quantity,
          availableQuantity: sourceInventory.availableQuantity - quantity,
          totalValue: (sourceInventory.quantity - quantity) * (sourceInventory.unitCost || 0),
          updatedAt: new Date()
        })
        .where(eq(inventory.id, sourceInventory.id));

      // Check if destination inventory exists
      const [destinationInventory] = await db
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.productId, productId),
            eq(inventory.warehouseLocation, toLocationCode)
          )
        );

      if (destinationInventory) {
        // Update existing destination inventory
        await db
          .update(inventory)
          .set({
            quantity: destinationInventory.quantity + quantity,
            availableQuantity: destinationInventory.availableQuantity + quantity,
            totalValue: (destinationInventory.quantity + quantity) * (destinationInventory.unitCost || 0),
            updatedAt: new Date()
          })
          .where(eq(inventory.id, destinationInventory.id));
      } else {
        // Create new inventory record for destination
        await db.insert(inventory).values({
          productId,
          vendorId: sourceInventory.vendorId,
          sku: sourceInventory.sku,
          quantity,
          availableQuantity: quantity,
          warehouseLocation: toLocationCode,
          binLocation: sourceInventory.binLocation,
          zone: sourceInventory.zone,
          unitCost: sourceInventory.unitCost,
          averageCost: sourceInventory.averageCost,
          totalValue: quantity * (sourceInventory.unitCost || 0),
          reorderLevel: sourceInventory.reorderLevel,
          reorderQuantity: sourceInventory.reorderQuantity,
          maxStockLevel: sourceInventory.maxStockLevel,
          minStockLevel: sourceInventory.minStockLevel,
          status: sourceInventory.status
        });
      }

      // Record inventory movements
      await db.insert(inventoryMovements).values([
        {
          productId,
          type: 'transfer_out',
          quantity,
          previousQuantity: sourceInventory.quantity,
          newQuantity: sourceInventory.quantity - quantity,
          reason: transferReason,
          notes: `Transfer to ${toLocationCode}: ${notes}`,
          userId
        },
        {
          productId,
          type: 'transfer_in',
          quantity,
          previousQuantity: destinationInventory?.quantity || 0,
          newQuantity: (destinationInventory?.quantity || 0) + quantity,
          reason: transferReason,
          notes: `Transfer from ${fromLocationCode}: ${notes}`,
          userId
        }
      ]);

      this.loggingService.logInfo('Inventory transferred between locations', {
        productId,
        fromLocationCode,
        toLocationCode,
        quantity,
        transferReason,
        userId
      });

      res.json({
        success: true,
        message: 'Inventory transferred successfully',
        data: {
          transfer: {
            productId,
            fromLocation: fromLocation.locationName,
            toLocation: toLocation.locationName,
            quantity,
            transferReason,
            notes
          },
          sourceInventory: {
            previousQuantity: sourceInventory.quantity,
            newQuantity: sourceInventory.quantity - quantity
          },
          destinationInventory: {
            previousQuantity: destinationInventory?.quantity || 0,
            newQuantity: (destinationInventory?.quantity || 0) + quantity
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to transfer inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get capacity overview across all locations
   */
  async getCapacityOverview(req: Request, res: Response): Promise<void> {
    try {
      const { bangladeshRegion, locationType } = req.query;

      let query = db
        .select({
          id: warehouseLocations.id,
          locationCode: warehouseLocations.locationCode,
          locationName: warehouseLocations.locationName,
          locationType: warehouseLocations.locationType,
          district: warehouseLocations.district,
          bangladeshRegion: warehouseLocations.bangladeshRegion,
          totalCapacity: warehouseLocations.totalCapacity,
          availableCapacity: warehouseLocations.availableCapacity,
          status: warehouseLocations.status
        })
        .from(warehouseLocations)
        .where(eq(warehouseLocations.status, 'active'));

      if (bangladeshRegion) {
        query = query.where(eq(warehouseLocations.bangladeshRegion, bangladeshRegion as string));
      }

      if (locationType) {
        query = query.where(eq(warehouseLocations.locationType, locationType as string));
      }

      const locations = await query;

      // Calculate capacity metrics for each location
      const capacityData = locations.map(location => {
        const usedCapacity = (location.totalCapacity || 0) - (location.availableCapacity || 0);
        const utilizationRate = location.totalCapacity > 0 
          ? Math.round((usedCapacity / location.totalCapacity) * 100 * 100) / 100
          : 0;

        return {
          ...location,
          usedCapacity,
          utilizationRate,
          status: utilizationRate > 90 ? 'critical' : 
                 utilizationRate > 75 ? 'warning' : 'ok'
        };
      });

      // Calculate overall metrics
      const totalCapacity = locations.reduce((sum, loc) => sum + (loc.totalCapacity || 0), 0);
      const totalAvailable = locations.reduce((sum, loc) => sum + (loc.availableCapacity || 0), 0);
      const totalUsed = totalCapacity - totalAvailable;
      const overallUtilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100 * 100) / 100 : 0;

      res.json({
        success: true,
        data: {
          locations: capacityData,
          overview: {
            totalLocations: locations.length,
            totalCapacity,
            totalUsed,
            totalAvailable,
            overallUtilization,
            criticalLocations: capacityData.filter(l => l.status === 'critical').length,
            warningLocations: capacityData.filter(l => l.status === 'warning').length
          },
          filters: { bangladeshRegion, locationType }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get capacity overview', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve capacity overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get capacity utilization trends
   */
  async getCapacityUtilization(req: Request, res: Response): Promise<void> {
    try {
      const { 
        locationCode,
        period = 'daily',
        days = 30 
      } = req.query;

      const daysAgo = parseInt(days as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // This would typically require historical capacity tracking
      // For now, we'll provide current utilization and mock trend data
      let locations = [];
      
      if (locationCode) {
        const [location] = await db
          .select({
            locationCode: warehouseLocations.locationCode,
            locationName: warehouseLocations.locationName,
            totalCapacity: warehouseLocations.totalCapacity,
            availableCapacity: warehouseLocations.availableCapacity
          })
          .from(warehouseLocations)
          .where(eq(warehouseLocations.locationCode, locationCode as string));
        
        if (location) {
          locations = [location];
        }
      } else {
        locations = await db
          .select({
            locationCode: warehouseLocations.locationCode,
            locationName: warehouseLocations.locationName,
            totalCapacity: warehouseLocations.totalCapacity,
            availableCapacity: warehouseLocations.availableCapacity
          })
          .from(warehouseLocations)
          .where(eq(warehouseLocations.status, 'active'));
      }

      const utilizationData = locations.map(location => {
        const usedCapacity = (location.totalCapacity || 0) - (location.availableCapacity || 0);
        const utilizationRate = location.totalCapacity > 0 
          ? Math.round((usedCapacity / location.totalCapacity) * 100 * 100) / 100
          : 0;

        // Generate mock trend data (in real implementation, this would come from historical data)
        const trend = this.generateMockUtilizationTrend(utilizationRate, daysAgo);

        return {
          locationCode: location.locationCode,
          locationName: location.locationName,
          currentUtilization: utilizationRate,
          totalCapacity: location.totalCapacity,
          usedCapacity,
          availableCapacity: location.availableCapacity,
          trend
        };
      });

      res.json({
        success: true,
        data: {
          utilizationData,
          period,
          daysAnalyzed: daysAgo,
          insights: {
            peakUtilizationLocation: utilizationData.reduce((max, loc) => 
              loc.currentUtilization > max.currentUtilization ? loc : max, utilizationData[0]
            ),
            averageUtilization: utilizationData.length > 0 
              ? Math.round((utilizationData.reduce((sum, loc) => sum + loc.currentUtilization, 0) / utilizationData.length) * 100) / 100
              : 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get capacity utilization', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve capacity utilization',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get regional distribution analysis for Bangladesh
   */
  async getRegionalDistribution(req: Request, res: Response): Promise<void> {
    try {
      const regionalData = await db
        .select({
          division: warehouseLocations.division,
          bangladeshRegion: warehouseLocations.bangladeshRegion,
          locationCount: count(),
          totalCapacity: sum(warehouseLocations.totalCapacity),
          averageCapacity: avg(warehouseLocations.totalCapacity),
          mainWarehouses: count(sql`CASE WHEN ${warehouseLocations.locationType} = 'main_warehouse' THEN 1 END`),
          distributionCenters: count(sql`CASE WHEN ${warehouseLocations.locationType} = 'distribution_center' THEN 1 END`),
          stores: count(sql`CASE WHEN ${warehouseLocations.locationType} = 'store' THEN 1 END`)
        })
        .from(warehouseLocations)
        .where(eq(warehouseLocations.status, 'active'))
        .groupBy(warehouseLocations.division, warehouseLocations.bangladeshRegion)
        .orderBy(warehouseLocations.division);

      // Calculate inventory value by region
      const regionalInventoryValue = await db
        .select({
          region: sql`COALESCE(${warehouseLocations.bangladeshRegion}, 'Unknown')`,
          totalValue: sum(inventory.totalValue),
          totalItems: count(inventory.id),
          uniqueProducts: count(sql`DISTINCT ${inventory.productId}`)
        })
        .from(inventory)
        .leftJoin(warehouseLocations, eq(inventory.warehouseLocation, warehouseLocations.locationCode))
        .groupBy(sql`COALESCE(${warehouseLocations.bangladeshRegion}, 'Unknown')`);

      // Get Bangladesh divisions coverage
      const bangladeshDivisions = [
        'Dhaka', 'Chittagong', 'Sylhet', 'Barisal', 
        'Khulna', 'Rajshahi', 'Rangpur', 'Mymensingh'
      ];

      const coverage = bangladeshDivisions.map(division => {
        const divisionData = regionalData.find(r => r.division === division);
        return {
          division,
          covered: !!divisionData,
          locationCount: divisionData?.locationCount || 0,
          totalCapacity: divisionData?.totalCapacity || 0
        };
      });

      res.json({
        success: true,
        data: {
          regionalData,
          inventoryByRegion: regionalInventoryValue,
          bangladeshCoverage: coverage,
          summary: {
            totalDivisionsCovered: coverage.filter(c => c.covered).length,
            totalDivisions: bangladeshDivisions.length,
            coveragePercentage: Math.round((coverage.filter(c => c.covered).length / bangladeshDivisions.length) * 100),
            recommendedExpansions: coverage
              .filter(c => !c.covered)
              .map(c => c.division)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get regional distribution', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve regional distribution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get flood risk assessment for Bangladesh warehouses
   */
  async getFloodRiskAssessment(req: Request, res: Response): Promise<void> {
    try {
      const floodRiskData = await db
        .select({
          floodRisk: warehouseLocations.floodRisk,
          locationCount: count(),
          totalCapacity: sum(warehouseLocations.totalCapacity),
          totalValue: sum(inventory.totalValue),
          locations: sql`array_agg(${warehouseLocations.locationName})`
        })
        .from(warehouseLocations)
        .leftJoin(inventory, eq(warehouseLocations.locationCode, inventory.warehouseLocation))
        .where(eq(warehouseLocations.status, 'active'))
        .groupBy(warehouseLocations.floodRisk)
        .orderBy(sql`CASE 
          WHEN ${warehouseLocations.floodRisk} = 'critical' THEN 1
          WHEN ${warehouseLocations.floodRisk} = 'high' THEN 2
          WHEN ${warehouseLocations.floodRisk} = 'medium' THEN 3
          WHEN ${warehouseLocations.floodRisk} = 'low' THEN 4
          ELSE 5 END`);

      // Get high-risk locations with detailed information
      const highRiskLocations = await db
        .select({
          id: warehouseLocations.id,
          locationCode: warehouseLocations.locationCode,
          locationName: warehouseLocations.locationName,
          district: warehouseLocations.district,
          division: warehouseLocations.division,
          floodRisk: warehouseLocations.floodRisk,
          totalCapacity: warehouseLocations.totalCapacity,
          nearestPort: warehouseLocations.nearestPort,
          accessToRailway: warehouseLocations.accessToRailway,
          inventoryValue: sum(inventory.totalValue),
          inventoryItems: count(inventory.id)
        })
        .from(warehouseLocations)
        .leftJoin(inventory, eq(warehouseLocations.locationCode, inventory.warehouseLocation))
        .where(
          and(
            eq(warehouseLocations.status, 'active'),
            sql`${warehouseLocations.floodRisk} IN ('high', 'critical')`
          )
        )
        .groupBy(
          warehouseLocations.id,
          warehouseLocations.locationCode,
          warehouseLocations.locationName,
          warehouseLocations.district,
          warehouseLocations.division,
          warehouseLocations.floodRisk,
          warehouseLocations.totalCapacity,
          warehouseLocations.nearestPort,
          warehouseLocations.accessToRailway
        )
        .orderBy(desc(sum(inventory.totalValue)));

      // Calculate total value at risk
      const totalValueAtRisk = floodRiskData
        .filter(risk => risk.floodRisk === 'high' || risk.floodRisk === 'critical')
        .reduce((sum, risk) => sum + (risk.totalValue || 0), 0);

      const totalInventoryValue = floodRiskData
        .reduce((sum, risk) => sum + (risk.totalValue || 0), 0);

      const riskPercentage = totalInventoryValue > 0 
        ? Math.round((totalValueAtRisk / totalInventoryValue) * 100 * 100) / 100
        : 0;

      res.json({
        success: true,
        data: {
          floodRiskSummary: floodRiskData,
          highRiskLocations,
          riskAssessment: {
            totalValueAtRisk,
            totalInventoryValue,
            riskPercentage,
            recommendations: this.getFloodRiskRecommendations(floodRiskData)
          },
          bangladeshContext: {
            monsoonSeason: 'June to September',
            highRiskMonths: ['July', 'August', 'September'],
            mitigationStrategies: [
              'Diversify inventory across multiple locations',
              'Increase safety stock in low-risk areas',
              'Implement early warning systems',
              'Establish emergency relocation procedures'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get flood risk assessment', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve flood risk assessment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods

  private async calculateLocationUtilization(locationCode: string): Promise<any> {
    const [result] = await db
      .select({
        totalItems: count(),
        totalValue: sum(inventory.totalValue),
        lowStockItems: count(sql`CASE WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 1 END`)
      })
      .from(inventory)
      .where(eq(inventory.warehouseLocation, locationCode));

    return result;
  }

  private groupBy(array: any[], key: string): any {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private generateMockUtilizationTrend(currentUtilization: number, days: number): any[] {
    // Generate mock trend data for demonstration
    const trend = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate slight variations around current utilization
      const variation = (Math.random() - 0.5) * 20; // ±10% variation
      const utilization = Math.max(0, Math.min(100, currentUtilization + variation));
      
      trend.push({
        date: date.toISOString().split('T')[0],
        utilization: Math.round(utilization * 100) / 100
      });
    }
    return trend;
  }

  private getFloodRiskRecommendations(floodRiskData: any[]): string[] {
    const recommendations = [];
    
    const highRiskCount = floodRiskData.find(r => r.floodRisk === 'high')?.locationCount || 0;
    const criticalRiskCount = floodRiskData.find(r => r.floodRisk === 'critical')?.locationCount || 0;
    
    if (criticalRiskCount > 0) {
      recommendations.push(`Consider relocating ${criticalRiskCount} critical risk warehouse(s)`);
    }
    
    if (highRiskCount > 0) {
      recommendations.push(`Implement enhanced flood protection for ${highRiskCount} high-risk location(s)`);
    }
    
    recommendations.push('Diversify inventory distribution across low-risk areas');
    recommendations.push('Establish emergency inventory transfer procedures');
    recommendations.push('Consider flood insurance for high-value inventory');
    
    return recommendations;
  }
}