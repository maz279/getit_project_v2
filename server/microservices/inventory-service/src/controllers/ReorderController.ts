/**
 * Reorder Controller - Automated Inventory Reordering System
 * Amazon.com/Shopee.sg-level automated reordering with Bangladesh supply chain optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  reorderRules,
  inventory,
  products,
  vendors,
  users,
  demandForecasts,
  reorderHistory
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, max, min, isNull } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class ReorderController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get reorder rules for vendor
   */
  async getReorderRules(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        ruleType,
        isActive,
        page = 1,
        limit = 20 
      } = req.query;
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

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: reorderRules.id,
          productId: reorderRules.productId,
          ruleName: reorderRules.ruleName,
          ruleType: reorderRules.ruleType,
          reorderPoint: reorderRules.reorderPoint,
          reorderQuantity: reorderRules.reorderQuantity,
          maxOrderQuantity: reorderRules.maxOrderQuantity,
          minOrderQuantity: reorderRules.minOrderQuantity,
          supplierId: reorderRules.supplierId,
          supplierLeadTime: reorderRules.supplierLeadTime,
          supplierReliability: reorderRules.supplierReliability,
          preferredSupplier: reorderRules.preferredSupplier,
          orderingCost: reorderRules.orderingCost,
          holdingCost: reorderRules.holdingCost,
          stockoutCost: reorderRules.stockoutCost,
          seasonalAdjustments: reorderRules.seasonalAdjustments,
          festivalMultipliers: reorderRules.festivalMultipliers,
          demandVariability: reorderRules.demandVariability,
          isActive: reorderRules.isActive,
          autoExecute: reorderRules.autoExecute,
          requiresApproval: reorderRules.requiresApproval,
          lastTriggered: reorderRules.lastTriggered,
          nextEvaluation: reorderRules.nextEvaluation,
          createdAt: reorderRules.createdAt,
          // Product details
          productName: products.name,
          productSku: products.sku,
          // Current inventory
          currentStock: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          availableQuantity: inventory.availableQuantity
        })
        .from(reorderRules)
        .leftJoin(products, eq(reorderRules.productId, products.id))
        .leftJoin(inventory, eq(reorderRules.productId, inventory.productId))
        .where(eq(reorderRules.vendorId, vendorId));

      if (ruleType) {
        query = query.where(eq(reorderRules.ruleType, ruleType as string));
      }

      if (isActive !== undefined) {
        query = query.where(eq(reorderRules.isActive, isActive === 'true'));
      }

      const rules = await query
        .orderBy(desc(reorderRules.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Calculate rule effectiveness
      const rulesWithStatus = rules.map(rule => ({
        ...rule,
        shouldReorder: rule.currentStock <= rule.reorderPoint,
        stockoutRisk: this.calculateStockoutRisk(rule),
        nextReorderEstimate: this.estimateNextReorder(rule),
        economicOrderQuantity: this.calculateEOQ(rule)
      }));

      // Get summary statistics
      const [summary] = await db
        .select({
          totalRules: count(),
          activeRules: count(sql`CASE WHEN ${reorderRules.isActive} = true THEN 1 END`),
          autoExecuteRules: count(sql`CASE WHEN ${reorderRules.autoExecute} = true THEN 1 END`),
          triggeredThisMonth: count(sql`CASE WHEN ${reorderRules.lastTriggered} >= NOW() - INTERVAL '30 days' THEN 1 END`)
        })
        .from(reorderRules)
        .where(eq(reorderRules.vendorId, vendorId));

      res.json({
        success: true,
        data: {
          rules: rulesWithStatus,
          summary,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: summary.totalRules,
            totalPages: Math.ceil(summary.totalRules / parseInt(limit as string))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get reorder rules', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve reorder rules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new reorder rule
   */
  async createReorderRule(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        vendorId,
        ruleName,
        ruleType = 'fixed_quantity',
        reorderPoint,
        reorderQuantity,
        maxOrderQuantity,
        minOrderQuantity,
        supplierId,
        supplierLeadTime = 7,
        supplierReliability = 1.0,
        preferredSupplier = false,
        orderingCost,
        holdingCost,
        stockoutCost,
        seasonalAdjustments,
        festivalMultipliers,
        demandVariability,
        autoExecute = false,
        requiresApproval = true
      } = req.body;
      const userId = req.user?.userId;

      // Validate product exists
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      // Check if rule already exists for this product
      const [existingRule] = await db
        .select()
        .from(reorderRules)
        .where(
          and(
            eq(reorderRules.productId, productId),
            eq(reorderRules.vendorId, vendorId)
          )
        );

      if (existingRule) {
        res.status(400).json({
          success: false,
          message: 'Reorder rule already exists for this product'
        });
        return;
      }

      // Calculate optimal reorder parameters if not provided
      const optimizedParams = await this.calculateOptimalReorderParams(
        productId,
        ruleType,
        supplierLeadTime,
        demandVariability
      );

      // Calculate next evaluation time
      const nextEvaluation = new Date();
      nextEvaluation.setDate(nextEvaluation.getDate() + 1); // Daily evaluation by default

      const [newRule] = await db
        .insert(reorderRules)
        .values({
          productId,
          vendorId,
          ruleName: ruleName || `${ruleType} rule for ${product.name}`,
          ruleType,
          reorderPoint: reorderPoint || optimizedParams.reorderPoint,
          reorderQuantity: reorderQuantity || optimizedParams.reorderQuantity,
          maxOrderQuantity,
          minOrderQuantity,
          supplierId,
          supplierLeadTime,
          supplierReliability,
          preferredSupplier,
          orderingCost,
          holdingCost,
          stockoutCost,
          seasonalAdjustments: seasonalAdjustments || this.getDefaultSeasonalAdjustments(),
          festivalMultipliers: festivalMultipliers || this.getDefaultFestivalMultipliers(),
          demandVariability: demandVariability || optimizedParams.demandVariability,
          isActive: true,
          autoExecute,
          requiresApproval,
          nextEvaluation
        })
        .returning();

      this.loggingService.logInfo('Reorder rule created', {
        ruleId: newRule.id,
        productId,
        vendorId,
        ruleType,
        autoExecute,
        createdBy: userId
      });

      res.json({
        success: true,
        message: 'Reorder rule created successfully',
        data: {
          rule: newRule,
          optimizedParams
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create reorder rule', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reorder rule',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update reorder rule
   */
  async updateReorderRule(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;

      const allowedFields = [
        'ruleName',
        'ruleType',
        'reorderPoint',
        'reorderQuantity',
        'maxOrderQuantity',
        'minOrderQuantity',
        'supplierId',
        'supplierLeadTime',
        'supplierReliability',
        'preferredSupplier',
        'orderingCost',
        'holdingCost',
        'stockoutCost',
        'seasonalAdjustments',
        'festivalMultipliers',
        'demandVariability',
        'isActive',
        'autoExecute',
        'requiresApproval'
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

      // Update next evaluation if rule parameters changed
      if (validUpdates.reorderPoint || validUpdates.reorderQuantity || validUpdates.ruleType) {
        validUpdates.nextEvaluation = new Date();
      }

      const [updatedRule] = await db
        .update(reorderRules)
        .set({
          ...validUpdates,
          updatedAt: new Date()
        })
        .where(eq(reorderRules.id, ruleId))
        .returning();

      if (!updatedRule) {
        res.status(404).json({
          success: false,
          message: 'Reorder rule not found'
        });
        return;
      }

      this.loggingService.logInfo('Reorder rule updated', {
        ruleId,
        userId,
        updatedFields: Object.keys(validUpdates)
      });

      res.json({
        success: true,
        message: 'Reorder rule updated successfully',
        data: updatedRule,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update reorder rule', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reorder rule',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete reorder rule
   */
  async deleteReorderRule(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;
      const userId = req.user?.userId;

      const [deletedRule] = await db
        .delete(reorderRules)
        .where(eq(reorderRules.id, ruleId))
        .returning();

      if (!deletedRule) {
        res.status(404).json({
          success: false,
          message: 'Reorder rule not found'
        });
        return;
      }

      this.loggingService.logInfo('Reorder rule deleted', {
        ruleId,
        productId: deletedRule.productId,
        vendorId: deletedRule.vendorId,
        deletedBy: userId
      });

      res.json({
        success: true,
        message: 'Reorder rule deleted successfully',
        data: {
          deletedRule: {
            id: deletedRule.id,
            ruleName: deletedRule.ruleName,
            productId: deletedRule.productId
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to delete reorder rule', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reorder rule',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Trigger reorder for specific product
   */
  async triggerReorder(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { 
        overrideQuantity,
        urgency = 'normal',
        notes,
        supplierId
      } = req.body;
      const userId = req.user?.userId;

      // Get reorder rule
      const [reorderRule] = await db
        .select()
        .from(reorderRules)
        .where(
          and(
            eq(reorderRules.productId, productId),
            eq(reorderRules.isActive, true)
          )
        );

      if (!reorderRule) {
        res.status(404).json({
          success: false,
          message: 'No active reorder rule found for this product'
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

      // Calculate reorder quantity with seasonal adjustments
      const baseQuantity = overrideQuantity || reorderRule.reorderQuantity;
      const adjustedQuantity = this.applySeasonalAdjustments(
        baseQuantity,
        reorderRule.seasonalAdjustments,
        reorderRule.festivalMultipliers
      );

      // Create reorder request
      const reorderRequest = {
        id: `RO-${Date.now()}`,
        productId,
        vendorId: reorderRule.vendorId,
        ruleId: reorderRule.id,
        supplierId: supplierId || reorderRule.supplierId,
        requestedQuantity: adjustedQuantity,
        currentStock: currentInventory.quantity,
        reorderPoint: reorderRule.reorderPoint,
        urgency,
        estimatedCost: adjustedQuantity * (currentInventory.unitCost || 0),
        expectedDelivery: this.calculateExpectedDelivery(reorderRule.supplierLeadTime),
        notes: notes || `Automated reorder triggered - stock below reorder point`,
        status: reorderRule.requiresApproval ? 'pending_approval' : 'approved',
        requestedBy: userId,
        createdAt: new Date()
      };

      // Store in cache for tracking (in production, this would be a proper database table)
      await this.redisService.setex(
        `reorder_request:${reorderRequest.id}`,
        86400 * 7, // 7 days
        JSON.stringify(reorderRequest)
      );

      // Update rule last triggered time
      await db
        .update(reorderRules)
        .set({
          lastTriggered: new Date(),
          nextEvaluation: this.calculateNextEvaluation(reorderRule.ruleType),
          updatedAt: new Date()
        })
        .where(eq(reorderRules.id, reorderRule.id));

      this.loggingService.logInfo('Reorder triggered', {
        reorderRequestId: reorderRequest.id,
        productId,
        vendorId: reorderRule.vendorId,
        quantity: adjustedQuantity,
        urgency,
        triggeredBy: userId
      });

      res.json({
        success: true,
        message: 'Reorder triggered successfully',
        data: {
          reorderRequest,
          recommendation: {
            shouldProceed: true,
            urgencyLevel: urgency,
            expectedBenefit: 'Prevent stockout and maintain service level',
            riskFactors: this.assessReorderRisks(reorderRule, currentInventory)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to trigger reorder', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger reorder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get pending reorders
   */
  async getPendingReorders(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId,
        status = 'pending_approval',
        urgency,
        page = 1,
        limit = 20 
      } = req.query;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // Get all reorder request keys from cache
      const pattern = 'reorder_request:*';
      const keys = await this.redisService.keys(pattern);
      
      let pendingReorders = [];
      for (const key of keys) {
        const reorderData = await this.redisService.get(key);
        if (reorderData) {
          const reorder = JSON.parse(reorderData);
          
          // Apply filters
          if (status && reorder.status !== status) continue;
          if (vendorId && reorder.vendorId !== vendorId) continue;
          if (urgency && reorder.urgency !== urgency) continue;
          if (userRole === 'vendor' && reorder.vendorId !== userId?.toString()) continue;
          
          pendingReorders.push(reorder);
        }
      }

      // Sort by creation date (newest first)
      pendingReorders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Paginate results
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const paginatedReorders = pendingReorders.slice(offset, offset + parseInt(limit as string));

      // Enrich with additional product information
      const enrichedReorders = await Promise.all(
        paginatedReorders.map(async (reorder) => {
          const [productInfo] = await db
            .select({
              name: products.name,
              sku: products.sku
            })
            .from(products)
            .where(eq(products.id, reorder.productId));
          
          return {
            ...reorder,
            productName: productInfo?.name,
            productSku: productInfo?.sku
          };
        })
      );

      res.json({
        success: true,
        data: {
          reorders: enrichedReorders,
          summary: {
            total: pendingReorders.length,
            byStatus: this.groupBy(pendingReorders, 'status'),
            byUrgency: this.groupBy(pendingReorders, 'urgency'),
            totalValue: pendingReorders.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
          },
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: pendingReorders.length,
            totalPages: Math.ceil(pendingReorders.length / parseInt(limit as string))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get pending reorders', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending reorders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Approve reorder
   */
  async approveReorder(req: Request, res: Response): Promise<void> {
    try {
      const { reorderId } = req.params;
      const { 
        approvalNotes,
        adjustedQuantity,
        adjustedSupplierId 
      } = req.body;
      const userId = req.user?.userId;

      // Get reorder request
      const reorderData = await this.redisService.get(`reorder_request:${reorderId}`);
      if (!reorderData) {
        res.status(404).json({
          success: false,
          message: 'Reorder request not found'
        });
        return;
      }

      const reorderRequest = JSON.parse(reorderData);

      if (reorderRequest.status !== 'pending_approval') {
        res.status(400).json({
          success: false,
          message: `Cannot approve reorder with status: ${reorderRequest.status}`
        });
        return;
      }

      // Update reorder request
      const updatedReorder = {
        ...reorderRequest,
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
        approvalNotes,
        finalQuantity: adjustedQuantity || reorderRequest.requestedQuantity,
        finalSupplierId: adjustedSupplierId || reorderRequest.supplierId,
        finalCost: (adjustedQuantity || reorderRequest.requestedQuantity) * 
                  (reorderRequest.estimatedCost / reorderRequest.requestedQuantity)
      };

      // Save updated request
      await this.redisService.setex(
        `reorder_request:${reorderId}`,
        86400 * 30, // Extend to 30 days for approved orders
        JSON.stringify(updatedReorder)
      );

      // Here you would typically integrate with a procurement system
      // For now, we'll simulate the process

      this.loggingService.logInfo('Reorder approved', {
        reorderId,
        productId: reorderRequest.productId,
        vendorId: reorderRequest.vendorId,
        quantity: updatedReorder.finalQuantity,
        approvedBy: userId
      });

      res.json({
        success: true,
        message: 'Reorder approved successfully',
        data: {
          reorderRequest: updatedReorder,
          nextSteps: [
            'Purchase order will be generated',
            'Supplier will be notified',
            'Delivery tracking will be initiated',
            'Inventory will be updated upon receipt'
          ]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to approve reorder', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve reorder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get product suppliers
   */
  async getProductSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      // Get suppliers from reorder rules (simplified approach)
      const suppliers = await db
        .select({
          supplierId: reorderRules.supplierId,
          supplierLeadTime: reorderRules.supplierLeadTime,
          supplierReliability: reorderRules.supplierReliability,
          preferredSupplier: reorderRules.preferredSupplier,
          orderingCost: reorderRules.orderingCost,
          lastTriggered: reorderRules.lastTriggered
        })
        .from(reorderRules)
        .where(
          and(
            eq(reorderRules.productId, productId),
            sql`${reorderRules.supplierId} IS NOT NULL`
          )
        )
        .groupBy(
          reorderRules.supplierId,
          reorderRules.supplierLeadTime,
          reorderRules.supplierReliability,
          reorderRules.preferredSupplier,
          reorderRules.orderingCost,
          reorderRules.lastTriggered
        )
        .orderBy(desc(reorderRules.preferredSupplier), desc(reorderRules.supplierReliability));

      // Add supplier performance metrics (mock data for demonstration)
      const suppliersWithMetrics = suppliers.map(supplier => ({
        ...supplier,
        supplierName: `Supplier ${supplier.supplierId}`,
        performanceScore: Math.round((supplier.supplierReliability || 0) * 100),
        avgDeliveryTime: supplier.supplierLeadTime,
        totalOrders: Math.floor(Math.random() * 50) + 10,
        onTimeDeliveryRate: Math.round(((supplier.supplierReliability || 0) * 0.9 + 0.1) * 100),
        qualityRating: Math.round(((supplier.supplierReliability || 0) * 0.8 + 0.2) * 5 * 100) / 100
      }));

      res.json({
        success: true,
        data: {
          productId,
          suppliers: suppliersWithMetrics,
          recommendations: {
            preferredSupplier: suppliersWithMetrics.find(s => s.preferredSupplier),
            fastestDelivery: suppliersWithMetrics.reduce((min, s) => 
              s.supplierLeadTime < min.supplierLeadTime ? s : min, suppliersWithMetrics[0]
            ),
            mostReliable: suppliersWithMetrics.reduce((max, s) => 
              s.supplierReliability > max.supplierReliability ? s : max, suppliersWithMetrics[0]
            )
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get product suppliers', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product suppliers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add new supplier
   */
  async addSupplier(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        vendorId,
        supplierId,
        supplierName,
        supplierLeadTime = 7,
        supplierReliability = 1.0,
        orderingCost,
        minimumOrderQuantity,
        preferredSupplier = false
      } = req.body;
      const userId = req.user?.userId;

      // Create supplier entry by updating or creating reorder rule
      const [existingRule] = await db
        .select()
        .from(reorderRules)
        .where(
          and(
            eq(reorderRules.productId, productId),
            eq(reorderRules.vendorId, vendorId)
          )
        );

      if (existingRule && !existingRule.supplierId) {
        // Update existing rule with supplier information
        const [updatedRule] = await db
          .update(reorderRules)
          .set({
            supplierId,
            supplierLeadTime,
            supplierReliability,
            orderingCost,
            minOrderQuantity: minimumOrderQuantity,
            preferredSupplier,
            updatedAt: new Date()
          })
          .where(eq(reorderRules.id, existingRule.id))
          .returning();

        this.loggingService.logInfo('Supplier added to existing reorder rule', {
          ruleId: existingRule.id,
          productId,
          vendorId,
          supplierId,
          addedBy: userId
        });

        res.json({
          success: true,
          message: 'Supplier added successfully',
          data: updatedRule,
          timestamp: new Date().toISOString()
        });
      } else {
        // Create new reorder rule with supplier
        const [newRule] = await db
          .insert(reorderRules)
          .values({
            productId,
            vendorId,
            ruleName: `Supplier rule for ${supplierName}`,
            ruleType: 'fixed_quantity',
            reorderPoint: 10, // Default values
            reorderQuantity: 50,
            supplierId,
            supplierLeadTime,
            supplierReliability,
            orderingCost,
            minOrderQuantity: minimumOrderQuantity,
            preferredSupplier,
            isActive: true,
            requiresApproval: true
          })
          .returning();

        this.loggingService.logInfo('New supplier reorder rule created', {
          ruleId: newRule.id,
          productId,
          vendorId,
          supplierId,
          addedBy: userId
        });

        res.json({
          success: true,
          message: 'Supplier added successfully',
          data: newRule,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.loggingService.logError('Failed to add supplier', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add supplier',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get local suppliers for Bangladesh market
   */
  async getLocalSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const { 
        district,
        category,
        certified = false,
        minReliability = 0.8 
      } = req.query;

      // Get suppliers from active reorder rules with Bangladesh context
      const localSuppliers = await db
        .select({
          supplierId: reorderRules.supplierId,
          supplierReliability: reorderRules.supplierReliability,
          supplierLeadTime: reorderRules.supplierLeadTime,
          preferredSupplier: reorderRules.preferredSupplier,
          productCount: count(reorderRules.productId),
          avgOrderingCost: avg(reorderRules.orderingCost),
          productCategories: sql`array_agg(DISTINCT ${products.categoryId})`,
          vendorCount: count(sql`DISTINCT ${reorderRules.vendorId}`)
        })
        .from(reorderRules)
        .leftJoin(products, eq(reorderRules.productId, products.id))
        .where(
          and(
            sql`${reorderRules.supplierId} IS NOT NULL`,
            gte(reorderRules.supplierReliability, parseFloat(minReliability as string))
          )
        )
        .groupBy(
          reorderRules.supplierId,
          reorderRules.supplierReliability,
          reorderRules.supplierLeadTime,
          reorderRules.preferredSupplier
        )
        .orderBy(desc(reorderRules.supplierReliability))
        .limit(50);

      // Enrich with Bangladesh-specific information
      const enrichedSuppliers = localSuppliers.map(supplier => ({
        ...supplier,
        supplierName: `BD-Supplier-${supplier.supplierId}`,
        location: district || 'Dhaka',
        certifications: certified ? ['BSTI Certified', 'ISO 9001', 'Local Business License'] : [],
        bangladeshFeatures: {
          localCurrency: 'BDT',
          paymentMethods: ['Bank Transfer', 'bKash', 'Nagad'],
          shippingOptions: ['Pathao', 'Paperfly', 'Own Transport'],
          compliance: 'Bangladesh Standards'
        },
        performanceMetrics: {
          reliability: Math.round((supplier.supplierReliability || 0) * 100),
          avgDeliveryDays: supplier.supplierLeadTime,
          productRange: supplier.productCount,
          vendorPartnerships: supplier.vendorCount
        }
      }));

      res.json({
        success: true,
        data: {
          suppliers: enrichedSuppliers,
          bangladeshContext: {
            totalLocalSuppliers: enrichedSuppliers.length,
            averageReliability: Math.round(
              enrichedSuppliers.reduce((sum, s) => sum + s.supplierReliability, 0) / 
              enrichedSuppliers.length * 100
            ) / 100,
            averageLeadTime: Math.round(
              enrichedSuppliers.reduce((sum, s) => sum + s.supplierLeadTime, 0) / 
              enrichedSuppliers.length
            ),
            supportedDistricts: [
              'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 
              'Rajshahi', 'Barisal', 'Rangpur', 'Mymensingh'
            ]
          },
          filters: { district, category, certified, minReliability }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get local suppliers', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve local suppliers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get import optimization recommendations
   */
  async getImportOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId,
        productCategory,
        targetSavings = 10 
      } = req.query;

      // Analyze current import patterns
      const importAnalysis = await db
        .select({
          productId: reorderRules.productId,
          avgOrderingCost: avg(reorderRules.orderingCost),
          avgLeadTime: avg(reorderRules.supplierLeadTime),
          totalOrders: count(),
          productName: products.name,
          categoryId: products.categoryId
        })
        .from(reorderRules)
        .leftJoin(products, eq(reorderRules.productId, products.id))
        .where(
          and(
            vendorId ? eq(reorderRules.vendorId, vendorId as string) : sql`1=1`,
            productCategory ? eq(products.categoryId, productCategory as string) : sql`1=1`,
            gte(reorderRules.supplierLeadTime, 14) // International suppliers (≥14 days)
          )
        )
        .groupBy(
          reorderRules.productId,
          products.name,
          products.categoryId
        )
        .having(gte(count(), 3)) // Products with multiple orders
        .orderBy(desc(avg(reorderRules.orderingCost)));

      // Generate optimization recommendations
      const optimizations = importAnalysis.map(item => {
        const potentialSavings = (item.avgOrderingCost || 0) * (parseFloat(targetSavings as string) / 100);
        const consolidationOpportunity = item.totalOrders > 5;
        
        return {
          productId: item.productId,
          productName: item.productName,
          currentCost: item.avgOrderingCost,
          currentLeadTime: item.avgLeadTime,
          totalOrders: item.totalOrders,
          optimizations: {
            bulkOrderSavings: potentialSavings,
            consolidationOpportunity,
            localAlternative: item.avgLeadTime > 21,
            seasonalOptimization: true
          },
          recommendations: [
            consolidationOpportunity ? 'Consolidate multiple small orders' : null,
            item.avgLeadTime > 21 ? 'Consider local supplier alternatives' : null,
            'Implement seasonal ordering strategy',
            'Negotiate volume discounts'
          ].filter(Boolean),
          estimatedBenefits: {
            costSavings: potentialSavings,
            leadTimeReduction: item.avgLeadTime > 21 ? '50-70%' : '20-30%',
            riskReduction: 'Lower supply chain disruption risk'
          }
        };
      });

      // Calculate overall optimization potential
      const totalCurrentCost = importAnalysis.reduce((sum, item) => sum + (item.avgOrderingCost || 0), 0);
      const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.optimizations.bulkOrderSavings, 0);
      const savingsPercentage = totalCurrentCost > 0 ? Math.round((totalPotentialSavings / totalCurrentCost) * 100 * 100) / 100 : 0;

      res.json({
        success: true,
        data: {
          optimizations,
          summary: {
            totalProducts: importAnalysis.length,
            totalCurrentCost,
            totalPotentialSavings,
            savingsPercentage,
            averageLeadTimeReduction: 15 // days
          },
          bangladeshStrategy: {
            localSourcingOpportunities: optimizations.filter(o => o.optimizations.localAlternative).length,
            portOptimization: {
              preferredPorts: ['Chittagong', 'Mongla'],
              customsClearance: 'Automated system available',
              documentationSupport: 'Local agent recommended'
            },
            seasonalConsiderations: {
              avoidMonths: ['July', 'August', 'September'], // Monsoon
              optimalMonths: ['October', 'November', 'December', 'January']
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get import optimization', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve import optimization',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods

  private calculateStockoutRisk(rule: any): string {
    const stockRatio = rule.currentStock / rule.reorderPoint;
    if (stockRatio <= 0.5) return 'high';
    if (stockRatio <= 0.8) return 'medium';
    return 'low';
  }

  private estimateNextReorder(rule: any): Date {
    const dailyDemand = rule.reorderQuantity / (rule.supplierLeadTime || 7);
    const daysUntilReorder = Math.max(0, (rule.currentStock - rule.reorderPoint) / dailyDemand);
    
    const nextReorder = new Date();
    nextReorder.setDate(nextReorder.getDate() + Math.round(daysUntilReorder));
    return nextReorder;
  }

  private calculateEOQ(rule: any): number {
    if (!rule.orderingCost || !rule.holdingCost || !rule.demandVariability) {
      return rule.reorderQuantity; // Fallback to rule quantity
    }
    
    // Economic Order Quantity formula: sqrt(2 * D * S / H)
    const annualDemand = rule.demandVariability * 365;
    const eoq = Math.sqrt((2 * annualDemand * rule.orderingCost) / rule.holdingCost);
    return Math.round(eoq);
  }

  private async calculateOptimalReorderParams(
    productId: string,
    ruleType: string,
    leadTime: number,
    demandVariability?: number
  ): Promise<any> {
    // Simplified calculation - in production, this would use historical data and ML
    const estimatedDemand = demandVariability || 10; // Daily demand estimate
    const safetyStock = Math.round(estimatedDemand * leadTime * 0.2); // 20% safety buffer
    const reorderPoint = estimatedDemand * leadTime + safetyStock;
    const reorderQuantity = Math.round(estimatedDemand * leadTime * 2); // 2x lead time demand
    
    return {
      reorderPoint,
      reorderQuantity,
      demandVariability: estimatedDemand,
      safetyStock
    };
  }

  private getDefaultSeasonalAdjustments(): any {
    return {
      winter: 1.2, // Higher demand in winter (wedding season)
      summer: 0.9,
      monsoon: 0.8, // Lower demand during monsoon
      postMonsoon: 1.1
    };
  }

  private getDefaultFestivalMultipliers(): any {
    return {
      eid: 2.5,
      durga_puja: 1.8,
      pohela_boishakh: 1.5,
      christmas: 1.3,
      victory_day: 1.2
    };
  }

  private applySeasonalAdjustments(
    baseQuantity: number,
    seasonalAdjustments: any,
    festivalMultipliers: any
  ): number {
    // Simplified seasonal adjustment
    const currentMonth = new Date().getMonth();
    let multiplier = 1.0;
    
    // Apply seasonal factors
    if (currentMonth >= 5 && currentMonth <= 8) { // Monsoon season
      multiplier *= seasonalAdjustments?.monsoon || 0.8;
    } else if (currentMonth >= 11 || currentMonth <= 1) { // Winter
      multiplier *= seasonalAdjustments?.winter || 1.2;
    }
    
    // Check for upcoming festivals (simplified)
    // In production, this would check against a festival calendar
    const isEidMonth = [3, 4, 10, 11].includes(currentMonth);
    if (isEidMonth) {
      multiplier *= festivalMultipliers?.eid || 2.5;
    }
    
    return Math.round(baseQuantity * multiplier);
  }

  private calculateExpectedDelivery(leadTimeDays: number): Date {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + leadTimeDays);
    return delivery;
  }

  private calculateNextEvaluation(ruleType: string): Date {
    const nextEval = new Date();
    
    switch (ruleType) {
      case 'just_in_time':
        nextEval.setHours(nextEval.getHours() + 6); // Every 6 hours
        break;
      case 'seasonal':
        nextEval.setDate(nextEval.getDate() + 7); // Weekly
        break;
      default:
        nextEval.setDate(nextEval.getDate() + 1); // Daily
    }
    
    return nextEval;
  }

  private assessReorderRisks(rule: any, inventory: any): string[] {
    const risks = [];
    
    if (rule.supplierReliability < 0.8) {
      risks.push('Supplier reliability below 80%');
    }
    
    if (rule.supplierLeadTime > 14) {
      risks.push('Long lead time may affect availability');
    }
    
    if (inventory.quantity <= rule.reorderPoint * 0.5) {
      risks.push('Critical stock level - expedite if possible');
    }
    
    // Check for monsoon season risk
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 8) {
      risks.push('Monsoon season may affect delivery');
    }
    
    return risks.length > 0 ? risks : ['No significant risks identified'];
  }

  private groupBy(array: any[], key: string): any {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}