/**
 * Inventory Controller - Core Inventory Management Operations
 * Amazon.com/Shopee.sg-level inventory management with Bangladesh optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  inventory,
  inventoryMovements,
  products,
  vendors,
  productVariants,
  users
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, max, min, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class InventoryController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get product inventory details
   */
  async getProductInventory(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { includeMovements = false, movementsLimit = 10 } = req.query;

      // Check cache first
      const cacheKey = `inventory:${productId}:details`;
      let inventoryData = await this.redisService.get(cacheKey);

      if (!inventoryData) {
        // Get inventory details
        const [productInventory] = await db
          .select({
            id: inventory.id,
            productId: inventory.productId,
            variantId: inventory.variantId,
            vendorId: inventory.vendorId,
            sku: inventory.sku,
            quantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity,
            availableQuantity: inventory.availableQuantity,
            committedQuantity: inventory.committedQuantity,
            reorderLevel: inventory.reorderLevel,
            reorderQuantity: inventory.reorderQuantity,
            maxStockLevel: inventory.maxStockLevel,
            minStockLevel: inventory.minStockLevel,
            warehouseLocation: inventory.warehouseLocation,
            binLocation: inventory.binLocation,
            zone: inventory.zone,
            unitCost: inventory.unitCost,
            averageCost: inventory.averageCost,
            lastPurchasePrice: inventory.lastPurchasePrice,
            totalValue: inventory.totalValue,
            batchNumber: inventory.batchNumber,
            expiryDate: inventory.expiryDate,
            manufacturingDate: inventory.manufacturingDate,
            qualityGrade: inventory.qualityGrade,
            lastStockCheck: inventory.lastStockCheck,
            lastRestocked: inventory.lastRestocked,
            lastSold: inventory.lastSold,
            stockTurnoverRate: inventory.stockTurnoverRate,
            status: inventory.status,
            isPerishable: inventory.isPerishable,
            requiresRefrigeration: inventory.requiresRefrigeration,
            isFragile: inventory.isFragile,
            isHazardous: inventory.isHazardous,
            autoReorderEnabled: inventory.autoReorderEnabled,
            supplierLeadTime: inventory.supplierLeadTime,
            demandForecastAccuracy: inventory.demandForecastAccuracy,
            // Bangladesh-specific fields
            importDutyPaid: inventory.importDutyPaid,
            localProductCertificate: inventory.localProductCertificate,
            bangladeshStandardsCompliant: inventory.bangladeshStandardsCompliant,
            createdAt: inventory.createdAt,
            updatedAt: inventory.updatedAt,
            // Product details
            productName: products.name,
            productSku: products.sku,
            productCategory: products.categoryId,
            // Vendor details
            vendorName: vendors.businessName,
            vendorEmail: vendors.email
          })
          .from(inventory)
          .leftJoin(products, eq(inventory.productId, products.id))
          .leftJoin(vendors, eq(inventory.vendorId, vendors.id))
          .where(eq(inventory.productId, productId));

        if (!productInventory) {
          res.status(404).json({
            success: false,
            message: 'Product inventory not found'
          });
          return;
        }

        inventoryData = productInventory;

        // Cache for 5 minutes
        await this.redisService.setex(cacheKey, 300, JSON.stringify(inventoryData));
      } else {
        inventoryData = JSON.parse(inventoryData);
      }

      let movementsData = [];
      if (includeMovements) {
        movementsData = await this.getRecentMovements(productId, parseInt(movementsLimit as string));
      }

      // Calculate additional metrics
      const metrics = {
        stockStatus: this.calculateStockStatus(inventoryData),
        stockVelocity: await this.calculateStockVelocity(productId),
        inventoryAge: this.calculateInventoryAge(inventoryData),
        bangladeshCompliance: this.getBangladeshComplianceStatus(inventoryData)
      };

      res.json({
        success: true,
        data: {
          inventory: inventoryData,
          movements: movementsData,
          metrics,
          lastUpdated: inventoryData.updatedAt
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get product inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update product inventory
   */
  async updateProductInventory(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;

      // Validate update fields
      const allowedFields = [
        'quantity',
        'reorderLevel',
        'reorderQuantity',
        'maxStockLevel',
        'minStockLevel',
        'warehouseLocation',
        'binLocation',
        'zone',
        'unitCost',
        'averageCost',
        'lastPurchasePrice',
        'batchNumber',
        'expiryDate',
        'manufacturingDate',
        'qualityGrade',
        'status',
        'autoReorderEnabled',
        'supplierLeadTime',
        'localProductCertificate',
        'bangladeshStandardsCompliant'
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

      // Get current inventory
      const [currentInventory] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, productId));

      if (!currentInventory) {
        res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
        return;
      }

      // Calculate new available quantity if quantity is being updated
      if (validUpdates.quantity !== undefined) {
        validUpdates.availableQuantity = validUpdates.quantity - currentInventory.reservedQuantity;
        validUpdates.totalValue = validUpdates.quantity * (validUpdates.unitCost || currentInventory.unitCost || 0);
      }

      // Update inventory
      const [updatedInventory] = await db
        .update(inventory)
        .set({
          ...validUpdates,
          updatedAt: new Date()
        })
        .where(eq(inventory.productId, productId))
        .returning();

      // Record inventory movement if quantity changed
      if (validUpdates.quantity !== undefined && validUpdates.quantity !== currentInventory.quantity) {
        const quantityChange = validUpdates.quantity - currentInventory.quantity;
        
        await db.insert(inventoryMovements).values({
          productId,
          variantId: currentInventory.variantId,
          type: quantityChange > 0 ? 'in' : 'out',
          quantity: Math.abs(quantityChange),
          previousQuantity: currentInventory.quantity,
          newQuantity: validUpdates.quantity,
          reason: 'manual_adjustment',
          notes: 'Manual inventory update via API',
          userId
        });
      }

      // Clear cache
      await this.clearInventoryCache(productId);

      this.loggingService.logInfo('Inventory updated', {
        productId,
        userId,
        updatedFields: Object.keys(validUpdates),
        quantityChange: validUpdates.quantity ? validUpdates.quantity - currentInventory.quantity : 0
      });

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: updatedInventory,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Adjust inventory (add/remove stock)
   */
  async adjustInventory(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { 
        adjustment, 
        reason, 
        notes, 
        batchNumber,
        cost,
        referenceId 
      } = req.body;
      const userId = req.user?.userId;

      if (!adjustment || adjustment === 0) {
        res.status(400).json({
          success: false,
          message: 'Adjustment amount is required and cannot be zero'
        });
        return;
      }

      // Get current inventory
      const [currentInventory] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, productId));

      if (!currentInventory) {
        res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
        return;
      }

      const newQuantity = currentInventory.quantity + adjustment;

      if (newQuantity < 0) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory. Current: ${currentInventory.quantity}, Adjustment: ${adjustment}`
        });
        return;
      }

      // Calculate new values
      const availableQuantity = newQuantity - currentInventory.reservedQuantity;
      const newTotalValue = newQuantity * (cost || currentInventory.unitCost || 0);

      // Update inventory
      const updateData: any = {
        quantity: newQuantity,
        availableQuantity,
        totalValue: newTotalValue,
        lastStockCheck: new Date(),
        updatedAt: new Date()
      };

      if (adjustment > 0) {
        updateData.lastRestocked = new Date();
        if (cost) {
          updateData.lastPurchasePrice = cost;
          // Recalculate average cost
          updateData.averageCost = ((currentInventory.averageCost || 0) * currentInventory.quantity + cost * adjustment) / newQuantity;
        }
      }

      if (batchNumber) {
        updateData.batchNumber = batchNumber;
      }

      const [updatedInventory] = await db
        .update(inventory)
        .set(updateData)
        .where(eq(inventory.productId, productId))
        .returning();

      // Record inventory movement
      await db.insert(inventoryMovements).values({
        productId,
        variantId: currentInventory.variantId,
        type: adjustment > 0 ? 'in' : 'out',
        quantity: Math.abs(adjustment),
        previousQuantity: currentInventory.quantity,
        newQuantity,
        reason: reason || 'adjustment',
        referenceId,
        notes,
        userId
      });

      // Clear cache
      await this.clearInventoryCache(productId);

      this.loggingService.logInfo('Inventory adjusted', {
        productId,
        userId,
        adjustment,
        reason,
        newQuantity
      });

      res.json({
        success: true,
        message: 'Inventory adjusted successfully',
        data: {
          inventory: updatedInventory,
          adjustment: {
            amount: adjustment,
            previousQuantity: currentInventory.quantity,
            newQuantity,
            reason,
            notes
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to adjust inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to adjust inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Batch update inventory
   */
  async batchUpdateInventory(req: Request, res: Response): Promise<void> {
    try {
      const { updates } = req.body;
      const userId = req.user?.userId;

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
        return;
      }

      const results = [];
      
      for (const update of updates) {
        try {
          const { productId, ...updateData } = update;
          
          const [updatedInventory] = await db
            .update(inventory)
            .set({
              ...updateData,
              updatedAt: new Date()
            })
            .where(eq(inventory.productId, productId))
            .returning();

          if (updatedInventory) {
            results.push({
              productId,
              status: 'success',
              inventory: updatedInventory
            });

            // Clear cache
            await this.clearInventoryCache(productId);
          } else {
            results.push({
              productId,
              status: 'not_found'
            });
          }
        } catch (error) {
          results.push({
            productId: update.productId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.loggingService.logInfo('Batch inventory update completed', {
        userId,
        totalUpdates: updates.length,
        successCount: results.filter(r => r.status === 'success').length
      });

      res.json({
        success: true,
        message: 'Batch update completed',
        data: {
          results,
          summary: {
            total: updates.length,
            successful: results.filter(r => r.status === 'success').length,
            notFound: results.filter(r => r.status === 'not_found').length,
            errors: results.filter(r => r.status === 'error').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to batch update inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to batch update inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Batch transfer inventory between locations
   */
  async batchTransferInventory(req: Request, res: Response): Promise<void> {
    try {
      const { transfers } = req.body;
      const userId = req.user?.userId;

      if (!Array.isArray(transfers) || transfers.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Transfers array is required'
        });
        return;
      }

      const results = [];
      
      for (const transfer of transfers) {
        try {
          const { 
            productId, 
            fromLocation, 
            toLocation, 
            quantity, 
            notes 
          } = transfer;

          // Get current inventory
          const [currentInventory] = await db
            .select()
            .from(inventory)
            .where(
              and(
                eq(inventory.productId, productId),
                eq(inventory.warehouseLocation, fromLocation)
              )
            );

          if (!currentInventory || currentInventory.quantity < quantity) {
            results.push({
              productId,
              status: 'insufficient_stock',
              availableQuantity: currentInventory?.quantity || 0
            });
            continue;
          }

          // Update source location
          await db
            .update(inventory)
            .set({
              quantity: currentInventory.quantity - quantity,
              availableQuantity: currentInventory.availableQuantity - quantity,
              updatedAt: new Date()
            })
            .where(eq(inventory.id, currentInventory.id));

          // Update or create destination location inventory
          const [destinationInventory] = await db
            .select()
            .from(inventory)
            .where(
              and(
                eq(inventory.productId, productId),
                eq(inventory.warehouseLocation, toLocation)
              )
            );

          if (destinationInventory) {
            // Update existing
            await db
              .update(inventory)
              .set({
                quantity: destinationInventory.quantity + quantity,
                availableQuantity: destinationInventory.availableQuantity + quantity,
                updatedAt: new Date()
              })
              .where(eq(inventory.id, destinationInventory.id));
          } else {
            // Create new inventory record for destination
            await db.insert(inventory).values({
              productId,
              vendorId: currentInventory.vendorId,
              sku: currentInventory.sku,
              quantity,
              availableQuantity: quantity,
              warehouseLocation: toLocation,
              // Copy other relevant fields
              reorderLevel: currentInventory.reorderLevel,
              reorderQuantity: currentInventory.reorderQuantity,
              unitCost: currentInventory.unitCost,
              averageCost: currentInventory.averageCost
            });
          }

          // Record movements
          await db.insert(inventoryMovements).values([
            {
              productId,
              type: 'transfer_out',
              quantity,
              previousQuantity: currentInventory.quantity,
              newQuantity: currentInventory.quantity - quantity,
              reason: 'transfer',
              notes: `Transfer to ${toLocation}: ${notes}`,
              userId
            },
            {
              productId,
              type: 'transfer_in',
              quantity,
              previousQuantity: destinationInventory?.quantity || 0,
              newQuantity: (destinationInventory?.quantity || 0) + quantity,
              reason: 'transfer',
              notes: `Transfer from ${fromLocation}: ${notes}`,
              userId
            }
          ]);

          results.push({
            productId,
            status: 'success',
            transfer: {
              fromLocation,
              toLocation,
              quantity,
              notes
            }
          });

          // Clear cache
          await this.clearInventoryCache(productId);

        } catch (error) {
          results.push({
            productId: transfer.productId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.loggingService.logInfo('Batch inventory transfer completed', {
        userId,
        totalTransfers: transfers.length,
        successCount: results.filter(r => r.status === 'success').length
      });

      res.json({
        success: true,
        message: 'Batch transfer completed',
        data: {
          results,
          summary: {
            total: transfers.length,
            successful: results.filter(r => r.status === 'success').length,
            insufficientStock: results.filter(r => r.status === 'insufficient_stock').length,
            errors: results.filter(r => r.status === 'error').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to batch transfer inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to batch transfer inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get inventory movements for a product
   */
  async getInventoryMovements(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { 
        type, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 20 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: inventoryMovements.id,
          type: inventoryMovements.type,
          quantity: inventoryMovements.quantity,
          previousQuantity: inventoryMovements.previousQuantity,
          newQuantity: inventoryMovements.newQuantity,
          reason: inventoryMovements.reason,
          referenceId: inventoryMovements.referenceId,
          notes: inventoryMovements.notes,
          createdAt: inventoryMovements.createdAt,
          userName: users.fullName
        })
        .from(inventoryMovements)
        .leftJoin(users, eq(inventoryMovements.userId, users.id))
        .where(eq(inventoryMovements.productId, productId));

      if (type) {
        query = query.where(eq(inventoryMovements.type, type as string));
      }

      if (startDate) {
        query = query.where(gte(inventoryMovements.createdAt, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(inventoryMovements.createdAt, new Date(endDate as string)));
      }

      const movements = await query
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json({
        success: true,
        data: {
          movements,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: movements.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get inventory movements', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory movements',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Record inventory movement
   */
  async recordInventoryMovement(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        variantId,
        type,
        quantity,
        reason,
        referenceId,
        notes
      } = req.body;
      const userId = req.user?.userId;

      // Get current inventory
      const [currentInventory] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.productId, productId));

      if (!currentInventory) {
        res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
        return;
      }

      // Calculate new quantity based on movement type
      let newQuantity = currentInventory.quantity;
      if (type === 'in') {
        newQuantity += quantity;
      } else if (type === 'out') {
        newQuantity -= quantity;
        if (newQuantity < 0) {
          res.status(400).json({
            success: false,
            message: 'Insufficient inventory for this movement'
          });
          return;
        }
      }

      // Record movement
      const [movement] = await db
        .insert(inventoryMovements)
        .values({
          productId,
          variantId,
          type,
          quantity,
          previousQuantity: currentInventory.quantity,
          newQuantity,
          reason,
          referenceId,
          notes,
          userId
        })
        .returning();

      // Update inventory if this is a direct adjustment
      if (reason === 'adjustment' || reason === 'manual_update') {
        await db
          .update(inventory)
          .set({
            quantity: newQuantity,
            availableQuantity: newQuantity - currentInventory.reservedQuantity,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, productId));

        // Clear cache
        await this.clearInventoryCache(productId);
      }

      this.loggingService.logInfo('Inventory movement recorded', {
        productId,
        type,
        quantity,
        reason,
        userId
      });

      res.json({
        success: true,
        message: 'Inventory movement recorded successfully',
        data: movement,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to record inventory movement', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record inventory movement',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get bulk availability for multiple products
   */
  async getBulkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { productIds } = req.query;

      if (!productIds) {
        res.status(400).json({
          success: false,
          message: 'Product IDs are required'
        });
        return;
      }

      const productIdArray = Array.isArray(productIds) ? productIds : [productIds];

      const availability = await db
        .select({
          productId: inventory.productId,
          sku: inventory.sku,
          quantity: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          availableQuantity: inventory.availableQuantity,
          status: inventory.status,
          reorderLevel: inventory.reorderLevel,
          warehouseLocation: inventory.warehouseLocation,
          productName: products.name,
          vendorName: vendors.businessName
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .leftJoin(vendors, eq(inventory.vendorId, vendors.id))
        .where(inArray(inventory.productId, productIdArray));

      res.json({
        success: true,
        data: {
          availability,
          requestedProducts: productIdArray.length,
          foundProducts: availability.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get bulk availability', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bulk availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get stock levels summary
   */
  async getStockLevelsSummary(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      let baseQuery = db.select().from(inventory);

      if (userRole === 'vendor') {
        baseQuery = baseQuery.where(eq(inventory.vendorId, userId?.toString()));
      } else if (vendorId) {
        baseQuery = baseQuery.where(eq(inventory.vendorId, vendorId as string));
      }

      const [summary] = await db
        .select({
          totalProducts: count(),
          totalQuantity: sum(inventory.quantity),
          totalValue: sum(inventory.totalValue),
          lowStockItems: count(sql`CASE WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 1 END`),
          outOfStockItems: count(sql`CASE WHEN ${inventory.quantity} = 0 THEN 1 END`),
          overstockItems: count(sql`CASE WHEN ${inventory.quantity} > ${inventory.maxStockLevel} THEN 1 END`),
          expiredItems: count(sql`CASE WHEN ${inventory.expiryDate} < NOW() THEN 1 END`),
          averageTurnoverRate: avg(inventory.stockTurnoverRate)
        })
        .from(inventory)
        .where(
          userRole === 'vendor' 
            ? eq(inventory.vendorId, userId?.toString())
            : vendorId 
              ? eq(inventory.vendorId, vendorId as string)
              : sql`1=1`
        );

      res.json({
        success: true,
        data: {
          summary,
          filters: {
            vendorId: userRole === 'vendor' ? userId?.toString() : vendorId,
            userRole
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get stock levels summary', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock levels summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods

  private async getRecentMovements(productId: string, limit: number = 10) {
    return await db
      .select({
        id: inventoryMovements.id,
        type: inventoryMovements.type,
        quantity: inventoryMovements.quantity,
        reason: inventoryMovements.reason,
        createdAt: inventoryMovements.createdAt,
        userName: users.fullName
      })
      .from(inventoryMovements)
      .leftJoin(users, eq(inventoryMovements.userId, users.id))
      .where(eq(inventoryMovements.productId, productId))
      .orderBy(desc(inventoryMovements.createdAt))
      .limit(limit);
  }

  private calculateStockStatus(inventoryData: any): string {
    if (inventoryData.quantity === 0) return 'out_of_stock';
    if (inventoryData.quantity <= inventoryData.reorderLevel) return 'low_stock';
    if (inventoryData.quantity > inventoryData.maxStockLevel) return 'overstock';
    return 'in_stock';
  }

  private async calculateStockVelocity(productId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [result] = await db
      .select({
        totalOut: sum(sql`CASE WHEN ${inventoryMovements.type} = 'out' THEN ${inventoryMovements.quantity} ELSE 0 END`)
      })
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.productId, productId),
          gte(inventoryMovements.createdAt, thirtyDaysAgo)
        )
      );

    return (result.totalOut || 0) / 30; // Daily average
  }

  private calculateInventoryAge(inventoryData: any): number {
    if (!inventoryData.lastRestocked) return 0;
    const ageInMs = Date.now() - new Date(inventoryData.lastRestocked).getTime();
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24)); // Days
  }

  private getBangladeshComplianceStatus(inventoryData: any): any {
    return {
      standardsCompliant: inventoryData.bangladeshStandardsCompliant,
      importDutyPaid: inventoryData.importDutyPaid,
      hasCertificate: !!inventoryData.localProductCertificate,
      complianceScore: this.calculateComplianceScore(inventoryData)
    };
  }

  private calculateComplianceScore(inventoryData: any): number {
    let score = 0;
    if (inventoryData.bangladeshStandardsCompliant) score += 40;
    if (inventoryData.importDutyPaid) score += 30;
    if (inventoryData.localProductCertificate) score += 30;
    return score;
  }

  /**
   * Reserve inventory for orders
   */
  async reserveInventory(req: Request, res: Response): Promise<void> {
    try {
      const { items, orderId, expiresAt } = req.body;
      const userId = req.user?.userId;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Items array is required and cannot be empty'
        });
        return;
      }

      // Check availability for all items first
      const availabilityChecks = [];
      for (const item of items) {
        const [currentInventory] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        if (!currentInventory) {
          availabilityChecks.push({
            productId: item.productId,
            available: false,
            reason: 'Product not found'
          });
          continue;
        }

        const availableQuantity = currentInventory.quantity - currentInventory.reservedQuantity;
        availabilityChecks.push({
          productId: item.productId,
          available: availableQuantity >= item.quantity,
          availableQuantity,
          requestedQuantity: item.quantity,
          reason: availableQuantity < item.quantity ? 'Insufficient stock' : null
        });
      }

      // Check if all items are available
      const unavailableItems = availabilityChecks.filter(check => !check.available);
      if (unavailableItems.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Some items are not available for reservation',
          unavailableItems
        });
        return;
      }

      // Reserve inventory for all items
      const reservationResults = [];
      for (const item of items) {
        const [currentInventory] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, item.productId));

        // Update reserved quantity
        const [updatedInventory] = await db
          .update(inventory)
          .set({
            reservedQuantity: currentInventory.reservedQuantity + item.quantity,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, item.productId))
          .returning();

        // Record inventory movement
        await db.insert(inventoryMovements).values({
          productId: item.productId,
          variantId: currentInventory.variantId,
          type: 'out',
          quantity: item.quantity,
          previousQuantity: currentInventory.quantity,
          newQuantity: currentInventory.quantity,
          reason: 'Order reservation',
          notes: `Reserved for order: ${orderId}`,
          userId: userId || 1
        });

        reservationResults.push({
          productId: item.productId,
          reservedQuantity: item.quantity,
          remainingAvailable: updatedInventory.quantity - updatedInventory.reservedQuantity
        });

        // Clear cache
        await this.clearInventoryCache(item.productId);
      }

      this.loggingService.logInfo('Inventory reserved successfully', {
        orderId,
        itemCount: items.length,
        userId
      });

      res.json({
        success: true,
        message: 'Inventory reserved successfully',
        data: {
          orderId,
          reservations: reservationResults,
          expiresAt: expiresAt || new Date(Date.now() + 30 * 60 * 1000) // 30 minutes default
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to reserve inventory', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reserve inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        threshold, 
        page = 1, 
        limit = 20,
        includeOutOfStock = true 
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let baseQuery = db.select({
        productId: inventory.productId,
        productName: products.name,
        sku: inventory.sku,
        currentStock: inventory.quantity,
        reservedStock: inventory.reservedQuantity,
        availableStock: sql<number>`${inventory.quantity} - ${inventory.reservedQuantity}`,
        reorderLevel: inventory.reorderLevel,
        vendorId: inventory.vendorId,
        vendorName: vendors.businessName,
        status: inventory.status,
        warehouseLocation: inventory.warehouseLocation,
        lastRestocked: inventory.lastRestocked,
        stockTurnoverRate: inventory.stockTurnoverRate
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))
      .leftJoin(vendors, eq(inventory.vendorId, vendors.id));

      // Apply filters
      const conditions = [];

      if (userRole === 'vendor') {
        conditions.push(eq(inventory.vendorId, userId?.toString()));
      } else if (vendorId) {
        conditions.push(eq(inventory.vendorId, vendorId as string));
      }

      if (threshold) {
        conditions.push(lte(inventory.quantity, parseInt(threshold as string)));
      } else {
        conditions.push(sql`${inventory.quantity} <= ${inventory.reorderLevel}`);
      }

      if (includeOutOfStock === 'false') {
        conditions.push(sql`${inventory.quantity} > 0`);
      }

      conditions.push(eq(inventory.status, 'active'));

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      const alerts = await baseQuery
        .orderBy(inventory.quantity)
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      this.loggingService.logInfo('Low stock alerts retrieved', {
        userId,
        vendorId,
        alertCount: alerts.length,
        totalCount
      });

      res.json({
        success: true,
        data: {
          alerts,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit as string))
          },
          summary: {
            totalLowStockItems: totalCount,
            outOfStockItems: alerts.filter(item => item.currentStock === 0).length,
            criticalItems: alerts.filter(item => item.currentStock <= Math.floor(item.reorderLevel * 0.5)).length
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
   * Get inventory analytics
   */
  async getInventoryAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        dateRange = '30d',
        includeMovements = false 
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Base condition for user/vendor filtering
      const vendorCondition = userRole === 'vendor' 
        ? eq(inventory.vendorId, userId?.toString())
        : vendorId 
          ? eq(inventory.vendorId, vendorId as string)
          : sql`1=1`;

      // Get inventory summary
      const [inventorySummary] = await db
        .select({
          totalProducts: count(),
          totalQuantity: sum(inventory.quantity),
          totalValue: sum(inventory.totalValue),
          reservedQuantity: sum(inventory.reservedQuantity),
          availableQuantity: sum(sql<number>`${inventory.quantity} - ${inventory.reservedQuantity}`),
          lowStockItems: count(sql`CASE WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 1 END`),
          outOfStockItems: count(sql`CASE WHEN ${inventory.quantity} = 0 THEN 1 END`),
          overstockItems: count(sql`CASE WHEN ${inventory.quantity} > ${inventory.maxStockLevel} THEN 1 END`),
          averageTurnoverRate: avg(inventory.stockTurnoverRate),
          totalWarehouseLocations: count(sql`DISTINCT ${inventory.warehouseLocation}`)
        })
        .from(inventory)
        .where(vendorCondition);

      // Get movement analytics
      const movementAnalytics = await db
        .select({
          movementType: inventoryMovements.type,
          totalQuantity: sum(inventoryMovements.quantity),
          movementCount: count(),
          averageQuantity: avg(inventoryMovements.quantity)
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .where(and(
          vendorCondition,
          gte(inventoryMovements.createdAt, startDate),
          lte(inventoryMovements.createdAt, endDate)
        ))
        .groupBy(inventoryMovements.type);

      // Get top products by movement
      const topMovingProducts = await db
        .select({
          productId: inventoryMovements.productId,
          productName: products.name,
          totalMovements: count(),
          totalQuantityOut: sum(sql`CASE WHEN ${inventoryMovements.type} = 'out' THEN ${inventoryMovements.quantity} ELSE 0 END`),
          totalQuantityIn: sum(sql`CASE WHEN ${inventoryMovements.type} = 'in' THEN ${inventoryMovements.quantity} ELSE 0 END`)
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(and(
          vendorCondition,
          gte(inventoryMovements.createdAt, startDate),
          lte(inventoryMovements.createdAt, endDate)
        ))
        .groupBy(inventoryMovements.productId, products.name)
        .orderBy(desc(count()))
        .limit(10);

      // Get recent movements if requested
      let recentMovements = [];
      if (includeMovements === 'true') {
        recentMovements = await db
          .select({
            id: inventoryMovements.id,
            productId: inventoryMovements.productId,
            productName: products.name,
            type: inventoryMovements.type,
            quantity: inventoryMovements.quantity,
            reason: inventoryMovements.reason,
            notes: inventoryMovements.notes,
            createdAt: inventoryMovements.createdAt,
            userName: users.fullName
          })
          .from(inventoryMovements)
          .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
          .leftJoin(products, eq(inventory.productId, products.id))
          .leftJoin(users, eq(inventoryMovements.userId, users.id))
          .where(and(
            vendorCondition,
            gte(inventoryMovements.createdAt, startDate),
            lte(inventoryMovements.createdAt, endDate)
          ))
          .orderBy(desc(inventoryMovements.createdAt))
          .limit(50);
      }

      this.loggingService.logInfo('Inventory analytics retrieved', {
        userId,
        vendorId,
        dateRange,
        includeMovements
      });

      res.json({
        success: true,
        data: {
          summary: inventorySummary,
          movements: {
            analytics: movementAnalytics,
            topProducts: topMovingProducts,
            recent: recentMovements
          },
          dateRange: {
            start: startDate,
            end: endDate,
            range: dateRange
          },
          insights: {
            stockHealthScore: this.calculateStockHealthScore(inventorySummary),
            recommendations: this.generateInventoryRecommendations(inventorySummary, movementAnalytics)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get inventory analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private calculateStockHealthScore(summary: any): number {
    let score = 100;
    
    // Penalize for out of stock items
    if (summary.outOfStockItems > 0) {
      score -= (summary.outOfStockItems / summary.totalProducts) * 30;
    }
    
    // Penalize for low stock items
    if (summary.lowStockItems > 0) {
      score -= (summary.lowStockItems / summary.totalProducts) * 20;
    }
    
    // Penalize for overstock items
    if (summary.overstockItems > 0) {
      score -= (summary.overstockItems / summary.totalProducts) * 10;
    }
    
    return Math.max(0, Math.round(score));
  }

  private generateInventoryRecommendations(summary: any, movements: any[]): string[] {
    const recommendations = [];
    
    if (summary.outOfStockItems > 0) {
      recommendations.push(`Restock ${summary.outOfStockItems} out-of-stock items immediately`);
    }
    
    if (summary.lowStockItems > 0) {
      recommendations.push(`Monitor ${summary.lowStockItems} low-stock items for reordering`);
    }
    
    if (summary.overstockItems > 0) {
      recommendations.push(`Consider promotions for ${summary.overstockItems} overstocked items`);
    }
    
    const totalInbound = movements.find(m => m.movementType === 'in')?.totalQuantity || 0;
    const totalOutbound = movements.find(m => m.movementType === 'out')?.totalQuantity || 0;
    
    if (totalOutbound > totalInbound * 1.2) {
      recommendations.push('Consider increasing reorder frequencies due to high demand');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Inventory levels are healthy - maintain current stock management practices');
    }
    
    return recommendations;
  }

  private async clearInventoryCache(productId: string): Promise<void> {
    try {
      const patterns = [
        `inventory:${productId}*`,
        `availability:*`,
        `stock_summary:*`
      ];

      for (const pattern of patterns) {
        await this.redisService.del(pattern);
      }
    } catch (error) {
      this.loggingService.logError('Failed to clear inventory cache', error);
    }
  }
}