/**
 * Analytics Controller - Comprehensive Inventory Analytics and Reporting
 * Amazon.com/Shopee.sg-level analytics with Bangladesh market intelligence
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  inventory,
  inventoryMovements,
  products,
  vendors,
  demandForecasts,
  qualityControlRecords,
  lowStockAlerts,
  warehouseLocations
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, max, min } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class AnalyticsController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Get comprehensive inventory dashboard
   */
  async getInventoryDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { timeframe = '30' } = req.query;
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

      const daysAgo = parseInt(timeframe as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get inventory overview
      const [inventoryOverview] = await db
        .select({
          totalProducts: count(),
          totalQuantity: sum(inventory.quantity),
          totalValue: sum(inventory.totalValue),
          lowStockItems: count(sql`CASE WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 1 END`),
          outOfStockItems: count(sql`CASE WHEN ${inventory.quantity} = 0 THEN 1 END`),
          overstockItems: count(sql`CASE WHEN ${inventory.quantity} > ${inventory.maxStockLevel} THEN 1 END`),
          averageTurnover: avg(inventory.stockTurnoverRate)
        })
        .from(inventory)
        .where(eq(inventory.vendorId, vendorId));

      // Get movement trends
      const movementTrends = await db
        .select({
          date: sql`DATE(${inventoryMovements.createdAt})`,
          totalMovements: count(),
          inboundMovements: count(sql`CASE WHEN ${inventoryMovements.type} = 'in' THEN 1 END`),
          outboundMovements: count(sql`CASE WHEN ${inventoryMovements.type} = 'out' THEN 1 END`),
          transferMovements: count(sql`CASE WHEN ${inventoryMovements.type} LIKE 'transfer%' THEN 1 END`),
          totalQuantityMoved: sum(inventoryMovements.quantity)
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .where(
          and(
            eq(inventory.vendorId, vendorId),
            gte(inventoryMovements.createdAt, startDate)
          )
        )
        .groupBy(sql`DATE(${inventoryMovements.createdAt})`)
        .orderBy(sql`DATE(${inventoryMovements.createdAt})`);

      // Get top products by value
      const topProducts = await db
        .select({
          productId: inventory.productId,
          productName: products.name,
          productSku: products.sku,
          quantity: inventory.quantity,
          totalValue: inventory.totalValue,
          turnoverRate: inventory.stockTurnoverRate,
          qualityGrade: inventory.qualityGrade
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(eq(inventory.vendorId, vendorId))
        .orderBy(desc(inventory.totalValue))
        .limit(10);

      // Get alerts summary
      const [alertsSummary] = await db
        .select({
          totalAlerts: count(),
          criticalAlerts: count(sql`CASE WHEN ${lowStockAlerts.severity} = 'critical' THEN 1 END`),
          highAlerts: count(sql`CASE WHEN ${lowStockAlerts.severity} = 'high' THEN 1 END`),
          activeAlerts: count(sql`CASE WHEN ${lowStockAlerts.status} = 'active' THEN 1 END`)
        })
        .from(lowStockAlerts)
        .where(eq(lowStockAlerts.vendorId, vendorId));

      res.json({
        success: true,
        data: {
          overview: inventoryOverview,
          trends: {
            movements: movementTrends,
            timeframe: `${daysAgo} days`
          },
          topProducts,
          alerts: alertsSummary,
          dashboardMetrics: {
            healthScore: this.calculateInventoryHealthScore(inventoryOverview),
            lastUpdated: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get inventory dashboard', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get inventory KPIs
   */
  async getInventoryKPIs(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId,
        period = 'monthly',
        months = 6 
      } = req.query;

      const monthsAgo = parseInt(months as string);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsAgo);

      // Calculate key performance indicators
      const [kpis] = await db
        .select({
          // Inventory turnover ratio
          avgInventoryValue: avg(inventory.totalValue),
          // Stock accuracy
          totalProducts: count(),
          accurateStockItems: count(sql`CASE WHEN ${inventory.lastStockCheck} > NOW() - INTERVAL '30 days' THEN 1 END`),
          // Service level
          totalDemand: sum(sql`COALESCE(${demandForecasts.actualDemand}, 0)`),
          stockouts: count(sql`CASE WHEN ${inventory.quantity} = 0 THEN 1 END`),
          // Carrying cost efficiency
          totalCarryingValue: sum(inventory.totalValue),
          deadStock: count(sql`CASE WHEN ${inventory.lastSold} < NOW() - INTERVAL '90 days' THEN 1 END`)
        })
        .from(inventory)
        .leftJoin(demandForecasts, eq(inventory.productId, demandForecasts.productId))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            gte(inventory.createdAt, startDate)
          )
        );

      // Calculate derived KPIs
      const stockAccuracy = kpis.totalProducts > 0 
        ? Math.round((kpis.accurateStockItems / kpis.totalProducts) * 100 * 100) / 100
        : 0;

      const serviceLevel = kpis.totalProducts > 0 
        ? Math.round(((kpis.totalProducts - kpis.stockouts) / kpis.totalProducts) * 100 * 100) / 100
        : 0;

      const deadStockRatio = kpis.totalProducts > 0 
        ? Math.round((kpis.deadStock / kpis.totalProducts) * 100 * 100) / 100
        : 0;

      // Get benchmark comparisons
      const benchmarks = {
        stockAccuracy: { target: 95, industry: 88 },
        serviceLevel: { target: 98, industry: 85 },
        turnoverRatio: { target: 6, industry: 4.2 },
        deadStockRatio: { target: 5, industry: 12 }
      };

      res.json({
        success: true,
        data: {
          kpis: {
            stockAccuracy: {
              value: stockAccuracy,
              status: stockAccuracy >= benchmarks.stockAccuracy.target ? 'excellent' : 
                     stockAccuracy >= benchmarks.stockAccuracy.industry ? 'good' : 'needs_improvement'
            },
            serviceLevel: {
              value: serviceLevel,
              status: serviceLevel >= benchmarks.serviceLevel.target ? 'excellent' : 
                     serviceLevel >= benchmarks.serviceLevel.industry ? 'good' : 'needs_improvement'
            },
            deadStockRatio: {
              value: deadStockRatio,
              status: deadStockRatio <= benchmarks.deadStockRatio.target ? 'excellent' : 
                     deadStockRatio <= benchmarks.deadStockRatio.industry ? 'good' : 'needs_improvement'
            },
            averageInventoryValue: kpis.avgInventoryValue || 0
          },
          benchmarks,
          period: `${monthsAgo} months`,
          recommendations: this.generateKPIRecommendations(stockAccuracy, serviceLevel, deadStockRatio)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get inventory KPIs', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory KPIs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get inventory turnover analysis
   */
  async getInventoryTurnoverAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId,
        category,
        period = '12' 
      } = req.query;

      const monthsAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsAgo);

      // Calculate turnover by product
      const turnoverAnalysis = await db
        .select({
          productId: inventory.productId,
          productName: products.name,
          productSku: products.sku,
          categoryId: products.categoryId,
          averageInventory: avg(inventory.quantity),
          totalSold: sum(sql`CASE WHEN ${inventoryMovements.type} = 'out' AND ${inventoryMovements.reason} = 'sale' THEN ${inventoryMovements.quantity} ELSE 0 END`),
          turnoverRate: inventory.stockTurnoverRate,
          currentStock: inventory.quantity,
          stockValue: inventory.totalValue,
          lastSold: inventory.lastSold
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .leftJoin(inventoryMovements, eq(inventory.productId, inventoryMovements.productId))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            category ? eq(products.categoryId, category as string) : sql`1=1`,
            gte(inventoryMovements.createdAt, startDate)
          )
        )
        .groupBy(
          inventory.productId,
          products.name,
          products.sku,
          products.categoryId,
          inventory.stockTurnoverRate,
          inventory.quantity,
          inventory.totalValue,
          inventory.lastSold
        )
        .orderBy(desc(inventory.stockTurnoverRate));

      // Categorize products by turnover performance
      const fastMoving = turnoverAnalysis.filter(p => (p.turnoverRate || 0) > 8);
      const mediumMoving = turnoverAnalysis.filter(p => (p.turnoverRate || 0) > 4 && (p.turnoverRate || 0) <= 8);
      const slowMoving = turnoverAnalysis.filter(p => (p.turnoverRate || 0) > 1 && (p.turnoverRate || 0) <= 4);
      const deadStock = turnoverAnalysis.filter(p => (p.turnoverRate || 0) <= 1);

      // Calculate category-wise turnover
      const categoryTurnover = await db
        .select({
          categoryId: products.categoryId,
          categoryName: products.categoryId, // Would be joined with categories table in production
          avgTurnover: avg(inventory.stockTurnoverRate),
          totalValue: sum(inventory.totalValue),
          productCount: count()
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`)
        .groupBy(products.categoryId)
        .orderBy(desc(avg(inventory.stockTurnoverRate)));

      res.json({
        success: true,
        data: {
          turnoverAnalysis,
          categorization: {
            fastMoving: {
              count: fastMoving.length,
              products: fastMoving.slice(0, 10), // Top 10
              totalValue: fastMoving.reduce((sum, p) => sum + (p.stockValue || 0), 0)
            },
            mediumMoving: {
              count: mediumMoving.length,
              totalValue: mediumMoving.reduce((sum, p) => sum + (p.stockValue || 0), 0)
            },
            slowMoving: {
              count: slowMoving.length,
              totalValue: slowMoving.reduce((sum, p) => sum + (p.stockValue || 0), 0)
            },
            deadStock: {
              count: deadStock.length,
              products: deadStock.slice(0, 10), // Top 10 by value
              totalValue: deadStock.reduce((sum, p) => sum + (p.stockValue || 0), 0)
            }
          },
          categoryPerformance: categoryTurnover,
          insights: {
            totalAnalyzedProducts: turnoverAnalysis.length,
            period: `${monthsAgo} months`,
            recommendations: this.generateTurnoverRecommendations(fastMoving, slowMoving, deadStock)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get turnover analysis', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve turnover analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, period = '6' } = req.query;
      
      const monthsAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsAgo);

      // Cost breakdown analysis
      const [costBreakdown] = await db
        .select({
          totalInventoryValue: sum(inventory.totalValue),
          totalCarryingCost: sum(sql`${inventory.totalValue} * 0.25`), // 25% annual carrying cost
          averageUnitCost: avg(inventory.unitCost),
          highestValueProduct: max(inventory.totalValue),
          lowestValueProduct: min(inventory.totalValue),
          totalProducts: count()
        })
        .from(inventory)
        .where(vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`);

      // Cost trends over time
      const costTrends = await db
        .select({
          month: sql`DATE_TRUNC('month', ${inventory.updatedAt})`,
          totalValue: sum(inventory.totalValue),
          avgUnitCost: avg(inventory.unitCost),
          productCount: count()
        })
        .from(inventory)
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            gte(inventory.updatedAt, startDate)
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${inventory.updatedAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${inventory.updatedAt})`);

      // Identify cost optimization opportunities
      const expensiveSlowMovers = await db
        .select({
          productId: inventory.productId,
          productName: products.name,
          unitCost: inventory.unitCost,
          totalValue: inventory.totalValue,
          turnoverRate: inventory.stockTurnoverRate,
          quantity: inventory.quantity,
          lastSold: inventory.lastSold
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            sql`${inventory.totalValue} > 1000`, // High value
            sql`${inventory.stockTurnoverRate} < 2` // Slow moving
          )
        )
        .orderBy(desc(inventory.totalValue))
        .limit(20);

      res.json({
        success: true,
        data: {
          costBreakdown,
          trends: costTrends,
          optimizationOpportunities: {
            expensiveSlowMovers,
            potentialSavings: expensiveSlowMovers.reduce((sum, p) => sum + (p.totalValue || 0), 0) * 0.3, // 30% potential savings
            recommendedActions: [
              'Consider liquidation sales for slow-moving expensive items',
              'Negotiate better supplier terms for high-cost products',
              'Implement just-in-time ordering for expensive items',
              'Review pricing strategy for low-turnover products'
            ]
          },
          benchmarks: {
            carryingCostRatio: 25, // 25% of inventory value
            targetTurnoverRate: 6,
            maxSlowMovingValue: 20 // % of total inventory
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cost analysis', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cost analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cost optimization recommendations
   */
  async getCostOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, targetSavings = 15 } = req.query;
      
      const targetSavingsPercent = parseFloat(targetSavings as string);

      // Analyze current cost structure
      const costAnalysis = await db
        .select({
          productId: inventory.productId,
          productName: products.name,
          currentStock: inventory.quantity,
          unitCost: inventory.unitCost,
          totalValue: inventory.totalValue,
          turnoverRate: inventory.stockTurnoverRate,
          lastRestocked: inventory.lastRestocked,
          supplierLeadTime: inventory.supplierLeadTime,
          autoReorderEnabled: inventory.autoReorderEnabled
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`)
        .orderBy(desc(inventory.totalValue));

      // Generate optimization strategies
      const optimizations = costAnalysis.map(item => {
        const strategies = [];
        const savings = {
          inventory: 0,
          ordering: 0,
          carrying: 0,
          total: 0
        };

        // Inventory level optimization
        if ((item.turnoverRate || 0) < 4) {
          const optimalStock = Math.ceil(item.currentStock * 0.7);
          const inventorySavings = (item.currentStock - optimalStock) * (item.unitCost || 0);
          strategies.push({
            type: 'reduce_inventory',
            description: `Reduce stock level from ${item.currentStock} to ${optimalStock}`,
            savings: inventorySavings,
            risk: 'low'
          });
          savings.inventory = inventorySavings;
        }

        // Supplier optimization
        if (item.supplierLeadTime > 14) {
          const orderingSavings = (item.totalValue || 0) * 0.05; // 5% savings from local sourcing
          strategies.push({
            type: 'local_sourcing',
            description: 'Consider local suppliers to reduce lead time and costs',
            savings: orderingSavings,
            risk: 'medium'
          });
          savings.ordering = orderingSavings;
        }

        // Carrying cost optimization
        const carryingSavings = (item.totalValue || 0) * 0.25 * 0.2; // 20% reduction in carrying costs
        if ((item.turnoverRate || 0) < 2) {
          strategies.push({
            type: 'reduce_carrying_cost',
            description: 'Implement just-in-time ordering',
            savings: carryingSavings,
            risk: 'medium'
          });
          savings.carrying = carryingSavings;
        }

        savings.total = savings.inventory + savings.ordering + savings.carrying;

        return {
          productId: item.productId,
          productName: item.productName,
          currentValue: item.totalValue || 0,
          strategies,
          potentialSavings: savings,
          savingsPercentage: item.totalValue > 0 ? Math.round((savings.total / item.totalValue) * 100 * 100) / 100 : 0
        };
      }).filter(opt => opt.potentialSavings.total > 0);

      // Calculate total optimization potential
      const totalCurrentValue = costAnalysis.reduce((sum, item) => sum + (item.totalValue || 0), 0);
      const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings.total, 0);
      const totalSavingsPercentage = totalCurrentValue > 0 ? Math.round((totalPotentialSavings / totalCurrentValue) * 100 * 100) / 100 : 0;

      // Filter top opportunities
      const topOpportunities = optimizations
        .sort((a, b) => b.potentialSavings.total - a.potentialSavings.total)
        .slice(0, 20);

      res.json({
        success: true,
        data: {
          optimizations: topOpportunities,
          summary: {
            totalProducts: costAnalysis.length,
            totalCurrentValue,
            totalPotentialSavings,
            totalSavingsPercentage,
            targetSavingsPercent,
            targetMet: totalSavingsPercentage >= targetSavingsPercent
          },
          strategySummary: {
            inventoryReduction: optimizations.filter(o => o.strategies.some(s => s.type === 'reduce_inventory')).length,
            supplierOptimization: optimizations.filter(o => o.strategies.some(s => s.type === 'local_sourcing')).length,
            carryingCostReduction: optimizations.filter(o => o.strategies.some(s => s.type === 'reduce_carrying_cost')).length
          },
          implementationPlan: {
            phase1: 'Reduce inventory levels for slow-moving items',
            phase2: 'Negotiate with local suppliers',
            phase3: 'Implement automated reordering',
            timeline: '3-6 months for full implementation'
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cost optimization', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cost optimization',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get demand patterns analysis
   */
  async getDemandPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, period = '12' } = req.query;
      
      const monthsAgo = parseInt(period as string);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsAgo);

      // Analyze demand patterns from forecasts and actual sales
      const demandPatterns = await db
        .select({
          productId: demandForecasts.productId,
          productName: products.name,
          forecastPeriod: demandForecasts.forecastPeriod,
          avgPredictedDemand: avg(demandForecasts.predictedDemand),
          avgActualDemand: avg(demandForecasts.actualDemand),
          forecastAccuracy: avg(demandForecasts.accuracy),
          trendDirection: demandForecasts.trendDirection,
          seasonality: demandForecasts.seasonality,
          totalForecasts: count()
        })
        .from(demandForecasts)
        .leftJoin(products, eq(demandForecasts.productId, products.id))
        .where(
          and(
            vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`,
            gte(demandForecasts.createdAt, startDate)
          )
        )
        .groupBy(
          demandForecasts.productId,
          products.name,
          demandForecasts.forecastPeriod,
          demandForecasts.trendDirection,
          demandForecasts.seasonality
        )
        .orderBy(desc(avg(demandForecasts.predictedDemand)));

      // Seasonal pattern analysis
      const seasonalPatterns = await db
        .select({
          month: sql`EXTRACT(MONTH FROM ${demandForecasts.forecastDate})`,
          avgDemand: avg(demandForecasts.predictedDemand),
          peakProducts: count(sql`CASE WHEN ${demandForecasts.predictedDemand} > (SELECT AVG(predicted_demand) FROM demand_forecasts) THEN 1 END`)
        })
        .from(demandForecasts)
        .where(
          and(
            vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`,
            gte(demandForecasts.forecastDate, startDate)
          )
        )
        .groupBy(sql`EXTRACT(MONTH FROM ${demandForecasts.forecastDate})`)
        .orderBy(sql`EXTRACT(MONTH FROM ${demandForecasts.forecastDate})`);

      // Bangladesh-specific patterns
      const bangladeshPatterns = await db
        .select({
          festivalImpact: avg(sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`),
          seasonalImpact: avg(sql`(${demandForecasts.bangladeshFactors}->>'seasonalMultiplier')::numeric`),
          regionalVariation: demandForecasts.regionalDemandVariation
        })
        .from(demandForecasts)
        .where(
          and(
            vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`,
            sql`${demandForecasts.bangladeshFactors} IS NOT NULL`
          )
        );

      res.json({
        success: true,
        data: {
          demandPatterns,
          seasonalAnalysis: {
            monthlyPatterns: seasonalPatterns,
            peakSeasons: seasonalPatterns
              .sort((a, b) => (b.avgDemand || 0) - (a.avgDemand || 0))
              .slice(0, 3)
              .map(p => ({
                month: p.month,
                monthName: new Date(2024, (p.month || 1) - 1).toLocaleString('default', { month: 'long' }),
                avgDemand: p.avgDemand
              }))
          },
          bangladeshInsights: {
            patterns: bangladeshPatterns,
            culturalFactors: {
              eidImpact: 'High demand spike (200-300% increase)',
              monsoonImpact: 'Reduced demand for non-essential items',
              weddingSeasonImpact: 'Increased demand for fashion and electronics',
              newYearImpact: 'Mixed patterns depending on category'
            }
          },
          insights: {
            totalAnalyzedProducts: demandPatterns.length,
            period: `${monthsAgo} months`,
            highAccuracyForecasts: demandPatterns.filter(p => (p.forecastAccuracy || 0) > 0.8).length,
            trendingSeason: this.identifyTrendingSeason(seasonalPatterns)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get demand patterns', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve demand patterns',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get demand volatility analysis
   */
  async getDemandVolatility(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, riskThreshold = 0.3 } = req.query;
      
      // Analyze demand volatility and risk
      const volatilityAnalysis = await db
        .select({
          productId: demandForecasts.productId,
          productName: products.name,
          avgDemand: avg(demandForecasts.predictedDemand),
          demandStdDev: sql`STDDEV(${demandForecasts.predictedDemand})`,
          volatilityRatio: sql`STDDEV(${demandForecasts.predictedDemand}) / AVG(${demandForecasts.predictedDemand})`,
          forecastCount: count(),
          maxDemand: max(demandForecasts.predictedDemand),
          minDemand: min(demandForecasts.predictedDemand),
          currentStock: inventory.quantity,
          reorderLevel: inventory.reorderLevel
        })
        .from(demandForecasts)
        .leftJoin(products, eq(demandForecasts.productId, products.id))
        .leftJoin(inventory, eq(demandForecasts.productId, inventory.productId))
        .where(vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`)
        .groupBy(
          demandForecasts.productId,
          products.name,
          inventory.quantity,
          inventory.reorderLevel
        )
        .having(gte(count(), 5)) // At least 5 data points
        .orderBy(desc(sql`STDDEV(${demandForecasts.predictedDemand}) / AVG(${demandForecasts.predictedDemand})`));

      // Categorize by volatility risk
      const riskThresholdNum = parseFloat(riskThreshold as string);
      const highRisk = volatilityAnalysis.filter(p => (p.volatilityRatio || 0) > riskThresholdNum);
      const mediumRisk = volatilityAnalysis.filter(p => (p.volatilityRatio || 0) > riskThresholdNum * 0.6 && (p.volatilityRatio || 0) <= riskThresholdNum);
      const lowRisk = volatilityAnalysis.filter(p => (p.volatilityRatio || 0) <= riskThresholdNum * 0.6);

      // Generate risk mitigation strategies
      const riskMitigationStrategies = highRisk.map(product => ({
        productId: product.productId,
        productName: product.productName,
        volatilityRatio: product.volatilityRatio,
        riskLevel: 'high',
        strategies: [
          'Increase safety stock levels',
          'Implement more frequent reorder reviews',
          'Consider multiple suppliers',
          'Monitor demand signals closely'
        ],
        recommendedSafetyStock: Math.ceil((product.currentStock || 0) * 0.5),
        recommendedReorderLevel: Math.ceil((product.reorderLevel || 0) * 1.3)
      }));

      res.json({
        success: true,
        data: {
          volatilityAnalysis,
          riskCategorization: {
            highRisk: {
              count: highRisk.length,
              products: highRisk.slice(0, 10)
            },
            mediumRisk: {
              count: mediumRisk.length,
              avgVolatility: mediumRisk.reduce((sum, p) => sum + (p.volatilityRatio || 0), 0) / mediumRisk.length
            },
            lowRisk: {
              count: lowRisk.length,
              avgVolatility: lowRisk.reduce((sum, p) => sum + (p.volatilityRatio || 0), 0) / lowRisk.length
            }
          },
          riskMitigation: {
            strategies: riskMitigationStrategies,
            overallRiskScore: volatilityAnalysis.reduce((sum, p) => sum + (p.volatilityRatio || 0), 0) / volatilityAnalysis.length,
            recommendations: [
              'Focus on high-volatility products for closer monitoring',
              'Implement dynamic safety stock calculations',
              'Consider demand smoothing strategies',
              'Develop supplier flexibility agreements'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get demand volatility', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve demand volatility',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Bangladesh market insights
   */
  async getBangladeshMarketInsights(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.query;

      // Get Bangladesh-specific inventory insights
      const [bangladeshInventory] = await db
        .select({
          totalProducts: count(),
          locallySourced: count(sql`CASE WHEN ${inventory.localProductCertificate} IS NOT NULL THEN 1 END`),
          bangladeshCompliant: count(sql`CASE WHEN ${inventory.bangladeshStandardsCompliant} = true THEN 1 END`),
          importedProducts: count(sql`CASE WHEN ${inventory.importDutyPaid} = true THEN 1 END`),
          totalValue: sum(inventory.totalValue)
        })
        .from(inventory)
        .where(vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`);

      // Get regional distribution insights
      const regionalDistribution = await db
        .select({
          region: warehouseLocations.bangladeshRegion,
          division: warehouseLocations.division,
          productCount: count(inventory.id),
          totalValue: sum(inventory.totalValue),
          warehouseCount: count(sql`DISTINCT ${warehouseLocations.id}`)
        })
        .from(inventory)
        .leftJoin(warehouseLocations, eq(inventory.warehouseLocation, warehouseLocations.locationCode))
        .where(vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`)
        .groupBy(warehouseLocations.bangladeshRegion, warehouseLocations.division)
        .orderBy(desc(sum(inventory.totalValue)));

      // Analyze cultural and seasonal factors
      const culturalFactors = await db
        .select({
          festivalPreparation: count(sql`CASE WHEN ${demandForecasts.bangladeshFactors}->>'festival' IS NOT NULL THEN 1 END`),
          monsoonImpact: count(sql`CASE WHEN ${demandForecasts.bangladeshFactors}->>'monsoonSeason' = 'true' THEN 1 END`),
          avgFestivalMultiplier: avg(sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`)
        })
        .from(demandForecasts)
        .where(vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`);

      // Bangladesh market recommendations
      const marketRecommendations = {
        localization: {
          complianceRate: bangladeshInventory.totalProducts > 0 
            ? Math.round((bangladeshInventory.bangladeshCompliant / bangladeshInventory.totalProducts) * 100)
            : 0,
          localSourcingRate: bangladeshInventory.totalProducts > 0 
            ? Math.round((bangladeshInventory.locallySourced / bangladeshInventory.totalProducts) * 100)
            : 0,
          recommendations: [
            'Increase local sourcing to reduce import dependencies',
            'Ensure all products meet Bangladesh standards',
            'Obtain necessary local certifications',
            'Consider cultural preferences in product selection'
          ]
        },
        regionalStrategy: {
          strongestRegions: regionalDistribution.slice(0, 3),
          expansionOpportunities: regionalDistribution.length < 8 
            ? ['Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'].filter(region => 
                !regionalDistribution.some(r => r.division === region)
              )
            : [],
          distributionBalance: regionalDistribution.length >= 6 ? 'good' : 'needs_improvement'
        },
        seasonalStrategy: {
          festivalPreparedness: culturalFactors[0]?.festivalPreparation || 0,
          monsoonAdaptation: culturalFactors[0]?.monsoonImpact || 0,
          culturalIntegration: 'Implement festival-specific inventory planning'
        }
      };

      res.json({
        success: true,
        data: {
          inventorySummary: bangladeshInventory,
          regionalInsights: {
            distribution: regionalDistribution,
            coverage: {
              divisionsServed: regionalDistribution.length,
              totalDivisions: 8,
              coveragePercentage: Math.round((regionalDistribution.length / 8) * 100)
            }
          },
          culturalFactors: culturalFactors[0],
          marketRecommendations,
          bangladeshContext: {
            keyFestivals: ['Eid ul-Fitr', 'Eid ul-Adha', 'Pohela Boishakh', 'Durga Puja'],
            businessSeasons: {
              peak: 'October - February (Wedding season, Festivals)',
              moderate: 'March - May (Spring season)',
              challenging: 'June - September (Monsoon season)'
            },
            supplierEcosystem: {
              localSuppliers: 'Strong in textiles, food products, handicrafts',
              importNeeded: 'Electronics, machinery, specialized products',
              paymentMethods: ['Bank transfer', 'bKash', 'Nagad', 'Rocket']
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get Bangladesh market insights', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Bangladesh market insights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get seasonal trends analysis
   */
  async getSeasonalTrends(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, years = 2 } = req.query;
      
      const yearsAgo = parseInt(years as string);
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - yearsAgo);

      // Analyze seasonal inventory patterns
      const seasonalTrends = await db
        .select({
          month: sql`EXTRACT(MONTH FROM ${inventoryMovements.createdAt})`,
          monthName: sql`TO_CHAR(${inventoryMovements.createdAt}, 'Month')`,
          totalMovements: count(),
          inboundVolume: sum(sql`CASE WHEN ${inventoryMovements.type} = 'in' THEN ${inventoryMovements.quantity} ELSE 0 END`),
          outboundVolume: sum(sql`CASE WHEN ${inventoryMovements.type} = 'out' THEN ${inventoryMovements.quantity} ELSE 0 END`),
          netMovement: sum(sql`CASE WHEN ${inventoryMovements.type} = 'in' THEN ${inventoryMovements.quantity} WHEN ${inventoryMovements.type} = 'out' THEN -${inventoryMovements.quantity} ELSE 0 END`)
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            gte(inventoryMovements.createdAt, startDate)
          )
        )
        .groupBy(sql`EXTRACT(MONTH FROM ${inventoryMovements.createdAt})`, sql`TO_CHAR(${inventoryMovements.createdAt}, 'Month')`)
        .orderBy(sql`EXTRACT(MONTH FROM ${inventoryMovements.createdAt})`);

      // Identify Bangladesh seasonal patterns
      const bangladeshSeasons = {
        winter: { months: [12, 1, 2], name: 'Winter (Wedding Season)' },
        summer: { months: [3, 4, 5], name: 'Summer (Pre-Monsoon)' },
        monsoon: { months: [6, 7, 8, 9], name: 'Monsoon Season' },
        postMonsoon: { months: [10, 11], name: 'Post-Monsoon (Festival Season)' }
      };

      const seasonalSummary = Object.entries(bangladeshSeasons).map(([season, data]) => {
        const seasonData = seasonalTrends.filter(trend => 
          data.months.includes(trend.month || 0)
        );
        
        const totalInbound = seasonData.reduce((sum, month) => sum + (month.inboundVolume || 0), 0);
        const totalOutbound = seasonData.reduce((sum, month) => sum + (month.outboundVolume || 0), 0);
        
        return {
          season,
          name: data.name,
          months: data.months,
          totalInbound,
          totalOutbound,
          netMovement: totalInbound - totalOutbound,
          avgMonthlyMovements: seasonData.reduce((sum, month) => sum + (month.totalMovements || 0), 0) / seasonData.length
        };
      });

      // Festival impact analysis
      const festivalImpacts = await db
        .select({
          festival: sql`${demandForecasts.bangladeshFactors}->>'festival'`,
          avgMultiplier: avg(sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`),
          productCount: count(),
          totalImpact: sum(demandForecasts.predictedDemand)
        })
        .from(demandForecasts)
        .where(
          and(
            vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`,
            sql`${demandForecasts.bangladeshFactors}->>'festival' IS NOT NULL`
          )
        )
        .groupBy(sql`${demandForecasts.bangladeshFactors}->>'festival'`)
        .orderBy(desc(avg(sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`)));

      res.json({
        success: true,
        data: {
          monthlyTrends: seasonalTrends,
          seasonalSummary,
          festivalImpacts,
          insights: {
            peakSeason: seasonalSummary.reduce((max, season) => 
              season.totalOutbound > max.totalOutbound ? season : max, seasonalSummary[0]
            ),
            slowSeason: seasonalSummary.reduce((min, season) => 
              season.totalOutbound < min.totalOutbound ? season : min, seasonalSummary[0]
            ),
            mostImpactfulFestival: festivalImpacts[0],
            seasonalityStrength: this.calculateSeasonalityStrength(seasonalTrends)
          },
          recommendations: {
            stockBuilding: 'Increase inventory before festival seasons',
            monsoonStrategy: 'Reduce non-essential stock during monsoon',
            supplierPlanning: 'Coordinate with suppliers for seasonal demand',
            culturalAlignment: 'Align inventory with Bangladesh cultural calendar'
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get seasonal trends', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve seasonal trends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cultural impact analysis
   */
  async getCulturalImpactAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.query;

      // Analyze cultural factors impact on inventory
      const culturalAnalysis = await db
        .select({
          productId: demandForecasts.productId,
          productName: products.name,
          festival: sql`${demandForecasts.bangladeshFactors}->>'festival'`,
          festivalMultiplier: sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`,
          culturalRelevance: sql`${demandForecasts.bangladeshFactors}->>'culturalRelevance'`,
          regionPreference: sql`${demandForecasts.bangladeshFactors}->>'regionPreference'`,
          avgPredictedDemand: avg(demandForecasts.predictedDemand),
          currentStock: inventory.quantity
        })
        .from(demandForecasts)
        .leftJoin(products, eq(demandForecasts.productId, products.id))
        .leftJoin(inventory, eq(demandForecasts.productId, inventory.productId))
        .where(
          and(
            vendorId ? eq(demandForecasts.vendorId, vendorId as string) : sql`1=1`,
            sql`${demandForecasts.bangladeshFactors} IS NOT NULL`
          )
        )
        .groupBy(
          demandForecasts.productId,
          products.name,
          sql`${demandForecasts.bangladeshFactors}->>'festival'`,
          sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`,
          sql`${demandForecasts.bangladeshFactors}->>'culturalRelevance'`,
          sql`${demandForecasts.bangladeshFactors}->>'regionPreference'`,
          inventory.quantity
        )
        .orderBy(desc(sql`(${demandForecasts.bangladeshFactors}->>'festivalMultiplier')::numeric`));

      // Cultural event calendar impact
      const culturalEvents = {
        'eid-ul-fitr': {
          name: 'Eid ul-Fitr',
          impact: 'Very High',
          categories: ['Clothing', 'Food', 'Electronics', 'Home Decor'],
          multiplier: 3.5,
          preparation: '2-3 weeks advance stock building'
        },
        'eid-ul-adha': {
          name: 'Eid ul-Adha',
          impact: 'High',
          categories: ['Clothing', 'Food', 'Kitchen Items'],
          multiplier: 2.8,
          preparation: '2-3 weeks advance stock building'
        },
        'pohela-boishakh': {
          name: 'Pohela Boishakh (Bengali New Year)',
          impact: 'High',
          categories: ['Traditional Clothing', 'Cultural Items', 'Books'],
          multiplier: 2.5,
          preparation: '2 weeks advance preparation'
        },
        'durga-puja': {
          name: 'Durga Puja',
          impact: 'High',
          categories: ['Clothing', 'Jewelry', 'Decorations'],
          multiplier: 2.3,
          preparation: '3 weeks advance preparation'
        },
        'victory-day': {
          name: 'Victory Day',
          impact: 'Medium',
          categories: ['Flags', 'Books', 'Cultural Items'],
          multiplier: 1.5,
          preparation: '1 week advance preparation'
        }
      };

      // Regional cultural preferences
      const regionalPreferences = {
        dhaka: {
          division: 'Dhaka',
          characteristics: ['Urban preferences', 'Fashion-conscious', 'Technology adoption'],
          strongCategories: ['Electronics', 'Fashion', 'Home Appliances']
        },
        chittagong: {
          division: 'Chittagong',
          characteristics: ['Business hub', 'Import gateway', 'Diverse population'],
          strongCategories: ['Business items', 'Import goods', 'Automotive']
        },
        sylhet: {
          division: 'Sylhet',
          characteristics: ['Remittance economy', 'Traditional values', 'Tea culture'],
          strongCategories: ['Traditional items', 'Food products', 'Household goods']
        }
      };

      // Generate cultural optimization recommendations
      const optimizationRecommendations = culturalAnalysis.map(item => {
        const recommendations = [];
        
        if ((item.festivalMultiplier || 0) > 2) {
          recommendations.push({
            type: 'festival_preparation',
            action: `Increase stock by ${Math.round(((item.festivalMultiplier || 0) - 1) * 100)}% before ${item.festival}`,
            timeline: '2-3 weeks before festival'
          });
        }

        if (item.culturalRelevance === 'high') {
          recommendations.push({
            type: 'cultural_marketing',
            action: 'Highlight cultural significance in marketing',
            timeline: 'Ongoing'
          });
        }

        return {
          productId: item.productId,
          productName: item.productName,
          culturalScore: (item.festivalMultiplier || 1) * (item.culturalRelevance === 'high' ? 1.5 : 1),
          recommendations
        };
      });

      res.json({
        success: true,
        data: {
          culturalAnalysis,
          culturalEvents,
          regionalPreferences,
          optimizations: optimizationRecommendations.filter(opt => opt.recommendations.length > 0),
          insights: {
            highImpactProducts: culturalAnalysis.filter(p => (p.festivalMultiplier || 0) > 2).length,
            culturallyRelevantProducts: culturalAnalysis.filter(p => p.culturalRelevance === 'high').length,
            avgFestivalMultiplier: culturalAnalysis.reduce((sum, p) => sum + (p.festivalMultiplier || 0), 0) / culturalAnalysis.length
          },
          strategicRecommendations: {
            inventoryPlanning: 'Align inventory cycles with Bangladesh cultural calendar',
            supplierCoordination: 'Brief suppliers on cultural event timelines',
            customerEngagement: 'Create festival-specific product bundles',
            regionalStrategy: 'Customize inventory mix based on regional preferences'
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get cultural impact analysis', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cultural impact analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time stock levels
   */
  async getRealTimeStockLevels(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, critical = false } = req.query;

      // Get current stock levels with real-time status
      const stockLevels = await db
        .select({
          productId: inventory.productId,
          productName: products.name,
          productSku: products.sku,
          currentStock: inventory.quantity,
          reservedQuantity: inventory.reservedQuantity,
          availableQuantity: inventory.availableQuantity,
          reorderLevel: inventory.reorderLevel,
          maxStockLevel: inventory.maxStockLevel,
          warehouseLocation: inventory.warehouseLocation,
          lastUpdated: inventory.updatedAt,
          stockStatus: sql`CASE 
            WHEN ${inventory.quantity} = 0 THEN 'out_of_stock'
            WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 'low_stock'
            WHEN ${inventory.quantity} > ${inventory.maxStockLevel} THEN 'overstock'
            ELSE 'in_stock'
          END`,
          stockHealth: sql`CASE 
            WHEN ${inventory.quantity} = 0 THEN 'critical'
            WHEN ${inventory.quantity} <= ${inventory.reorderLevel} * 0.5 THEN 'poor'
            WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 'warning'
            WHEN ${inventory.quantity} > ${inventory.maxStockLevel} THEN 'excess'
            ELSE 'good'
          END`
        })
        .from(inventory)
        .leftJoin(products, eq(inventory.productId, products.id))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            critical === 'true' 
              ? sql`${inventory.quantity} <= ${inventory.reorderLevel}`
              : sql`1=1`
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${inventory.quantity} = 0 THEN 1
            WHEN ${inventory.quantity} <= ${inventory.reorderLevel} * 0.5 THEN 2
            WHEN ${inventory.quantity} <= ${inventory.reorderLevel} THEN 3
            ELSE 4
          END`,
          desc(inventory.totalValue)
        );

      // Group by status for summary
      const statusSummary = stockLevels.reduce((acc, item) => {
        const status = item.stockStatus as string;
        if (!acc[status]) {
          acc[status] = { count: 0, products: [] };
        }
        acc[status].count++;
        acc[status].products.push(item);
        return acc;
      }, {} as Record<string, { count: number; products: any[] }>);

      // Get recent movements for context
      const recentMovements = await db
        .select({
          productId: inventoryMovements.productId,
          type: inventoryMovements.type,
          quantity: inventoryMovements.quantity,
          reason: inventoryMovements.reason,
          createdAt: inventoryMovements.createdAt,
          productName: products.name
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .leftJoin(products, eq(inventoryMovements.productId, products.id))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            gte(inventoryMovements.createdAt, sql`NOW() - INTERVAL '1 hour'`)
          )
        )
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(20);

      res.json({
        success: true,
        data: {
          stockLevels,
          summary: {
            total: stockLevels.length,
            byStatus: statusSummary,
            healthDistribution: {
              critical: stockLevels.filter(s => s.stockHealth === 'critical').length,
              poor: stockLevels.filter(s => s.stockHealth === 'poor').length,
              warning: stockLevels.filter(s => s.stockHealth === 'warning').length,
              good: stockLevels.filter(s => s.stockHealth === 'good').length,
              excess: stockLevels.filter(s => s.stockHealth === 'excess').length
            }
          },
          recentActivity: {
            movements: recentMovements,
            lastHourMovements: recentMovements.length
          },
          alerts: {
            urgentAction: stockLevels.filter(s => s.stockHealth === 'critical').length,
            needsAttention: stockLevels.filter(s => s.stockHealth === 'poor').length,
            monitoring: stockLevels.filter(s => s.stockHealth === 'warning').length
          }
        },
        realTime: {
          timestamp: new Date().toISOString(),
          updateFrequency: 'Real-time',
          dataFreshness: 'Live'
        }
      });

    } catch (error) {
      this.loggingService.logError('Failed to get real-time stock levels', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve real-time stock levels',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time movement alerts
   */
  async getRealTimeMovementAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, alertType, severity } = req.query;

      // Get active alerts that require immediate attention
      const movementAlerts = await db
        .select({
          id: lowStockAlerts.id,
          productId: lowStockAlerts.productId,
          alertType: lowStockAlerts.alertType,
          severity: lowStockAlerts.severity,
          title: lowStockAlerts.title,
          message: lowStockAlerts.message,
          currentStock: lowStockAlerts.currentStock,
          threshold: lowStockAlerts.threshold,
          actionRequired: lowStockAlerts.actionRequired,
          estimatedDaysUntilStockout: lowStockAlerts.estimatedDaysUntilStockout,
          autoReorderTriggered: lowStockAlerts.autoReorderTriggered,
          regionalImpact: lowStockAlerts.regionalImpact,
          festivalSeason: lowStockAlerts.festivalSeason,
          monsoonSeason: lowStockAlerts.monsoonSeason,
          createdAt: lowStockAlerts.createdAt,
          productName: products.name,
          productSku: products.sku,
          currentInventory: inventory.quantity,
          warehouseLocation: inventory.warehouseLocation
        })
        .from(lowStockAlerts)
        .leftJoin(products, eq(lowStockAlerts.productId, products.id))
        .leftJoin(inventory, eq(lowStockAlerts.productId, inventory.productId))
        .where(
          and(
            eq(lowStockAlerts.status, 'active'),
            vendorId ? eq(lowStockAlerts.vendorId, vendorId as string) : sql`1=1`,
            alertType ? eq(lowStockAlerts.alertType, alertType as string) : sql`1=1`,
            severity ? eq(lowStockAlerts.severity, severity as string) : sql`1=1`
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${lowStockAlerts.severity} = 'critical' THEN 1
            WHEN ${lowStockAlerts.severity} = 'high' THEN 2
            WHEN ${lowStockAlerts.severity} = 'medium' THEN 3
            ELSE 4
          END`,
          desc(lowStockAlerts.createdAt)
        );

      // Get recent critical movements that might trigger alerts
      const criticalMovements = await db
        .select({
          productId: inventoryMovements.productId,
          type: inventoryMovements.type,
          quantity: inventoryMovements.quantity,
          newQuantity: inventoryMovements.newQuantity,
          reason: inventoryMovements.reason,
          createdAt: inventoryMovements.createdAt,
          productName: products.name,
          reorderLevel: inventory.reorderLevel
        })
        .from(inventoryMovements)
        .leftJoin(inventory, eq(inventoryMovements.productId, inventory.productId))
        .leftJoin(products, eq(inventoryMovements.productId, products.id))
        .where(
          and(
            vendorId ? eq(inventory.vendorId, vendorId as string) : sql`1=1`,
            gte(inventoryMovements.createdAt, sql`NOW() - INTERVAL '30 minutes'`),
            sql`${inventoryMovements.newQuantity} <= ${inventory.reorderLevel}`
          )
        )
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(10);

      // Calculate alert metrics
      const alertMetrics = {
        total: movementAlerts.length,
        critical: movementAlerts.filter(a => a.severity === 'critical').length,
        high: movementAlerts.filter(a => a.severity === 'high').length,
        medium: movementAlerts.filter(a => a.severity === 'medium').length,
        low: movementAlerts.filter(a => a.severity === 'low').length,
        withAutoReorder: movementAlerts.filter(a => a.autoReorderTriggered).length,
        festivalRelated: movementAlerts.filter(a => a.festivalSeason).length,
        monsoonRelated: movementAlerts.filter(a => a.monsoonSeason).length
      };

      // Generate immediate action recommendations
      const actionRecommendations = movementAlerts
        .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
        .map(alert => ({
          alertId: alert.id,
          productId: alert.productId,
          productName: alert.productName,
          urgency: alert.severity === 'critical' ? 'immediate' : 'urgent',
          recommendedActions: [
            alert.autoReorderTriggered ? 'Review auto-reorder status' : 'Trigger immediate reorder',
            'Check supplier availability',
            'Consider emergency sourcing',
            'Update customer communication'
          ],
          estimatedImpact: alert.estimatedDaysUntilStockout 
            ? `Stockout in ${alert.estimatedDaysUntilStockout} days`
            : 'Immediate stockout risk',
          businessImpact: alert.regionalImpact || 'Standard business impact'
        }));

      res.json({
        success: true,
        data: {
          alerts: movementAlerts,
          criticalMovements,
          metrics: alertMetrics,
          actionRecommendations,
          realTimeStatus: {
            timestamp: new Date().toISOString(),
            activeMonitoring: true,
            alertFrequency: 'Every 5 minutes',
            coverageScope: vendorId ? 'Vendor-specific' : 'Platform-wide'
          },
          bangladeshContext: {
            festivalAlerts: alertMetrics.festivalRelated,
            monsoonAlerts: alertMetrics.monsoonRelated,
            regionalConsiderations: movementAlerts
              .filter(a => a.regionalImpact)
              .map(a => a.regionalImpact)
              .filter((value, index, self) => self.indexOf(value) === index)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get real-time movement alerts', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve real-time movement alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods

  private calculateInventoryHealthScore(overview: any): number {
    const totalProducts = overview.totalProducts || 1;
    const lowStockRatio = (overview.lowStockItems || 0) / totalProducts;
    const outOfStockRatio = (overview.outOfStockItems || 0) / totalProducts;
    const overstockRatio = (overview.overstockItems || 0) / totalProducts;
    
    let score = 100;
    score -= lowStockRatio * 30; // Low stock impact
    score -= outOfStockRatio * 50; // Out of stock impact
    score -= overstockRatio * 20; // Overstock impact
    
    return Math.max(0, Math.round(score));
  }

  private generateKPIRecommendations(stockAccuracy: number, serviceLevel: number, deadStockRatio: number): string[] {
    const recommendations = [];
    
    if (stockAccuracy < 90) {
      recommendations.push('Implement more frequent cycle counting');
    }
    
    if (serviceLevel < 95) {
      recommendations.push('Review safety stock levels and reorder points');
    }
    
    if (deadStockRatio > 10) {
      recommendations.push('Implement dead stock liquidation strategies');
    }
    
    return recommendations;
  }

  private generateTurnoverRecommendations(fastMoving: any[], slowMoving: any[], deadStock: any[]): string[] {
    const recommendations = [];
    
    if (fastMoving.length > 0) {
      recommendations.push(`Monitor ${fastMoving.length} fast-moving items for potential stockouts`);
    }
    
    if (slowMoving.length > 0) {
      recommendations.push(`Review pricing and promotion strategies for ${slowMoving.length} slow-moving items`);
    }
    
    if (deadStock.length > 0) {
      recommendations.push(`Consider liquidation or return for ${deadStock.length} dead stock items`);
    }
    
    return recommendations;
  }

  private identifyTrendingSeason(seasonalPatterns: any[]): string {
    const currentMonth = new Date().getMonth() + 1;
    const currentPattern = seasonalPatterns.find(p => p.month === currentMonth);
    
    if (!currentPattern) return 'Unknown';
    
    const avgDemand = seasonalPatterns.reduce((sum, p) => sum + (p.avgDemand || 0), 0) / seasonalPatterns.length;
    
    if ((currentPattern.avgDemand || 0) > avgDemand * 1.2) return 'Peak Season';
    if ((currentPattern.avgDemand || 0) < avgDemand * 0.8) return 'Low Season';
    return 'Normal Season';
  }

  private calculateSeasonalityStrength(trends: any[]): string {
    if (trends.length < 12) return 'Insufficient data';
    
    const demands = trends.map(t => t.avgDemand || 0);
    const max = Math.max(...demands);
    const min = Math.min(...demands);
    const avg = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    
    const variation = ((max - min) / avg) * 100;
    
    if (variation > 50) return 'Strong';
    if (variation > 25) return 'Moderate';
    return 'Weak';
  }
}