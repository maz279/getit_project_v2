/**
 * Quality Inspection Controller - Advanced Quality Management System
 * Amazon.com/Shopee.sg-level quality inspection with Bangladesh compliance standards
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  qualityInspectionChecklist,
  inventory,
  products,
  vendors,
  users,
  qualityControlRecords
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, max, min, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class QualityInspectionController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create quality inspection checklist
   */
  async createInspectionChecklist(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        vendorId,
        inspectionType,
        checklistItems,
        inspectionStandards,
        bangladeshCompliance,
        priorityLevel,
        inspectionFrequency,
        autoApprovalThreshold,
        requiresDocumentation,
        batchInspection
      } = req.body;

      // Validate required fields
      if (!productId || !vendorId || !inspectionType || !checklistItems) {
        res.status(400).json({
          success: false,
          message: 'Required fields: productId, vendorId, inspectionType, checklistItems'
        });
        return;
      }

      // Create inspection checklist
      const [newChecklist] = await db
        .insert(qualityInspectionChecklist)
        .values({
          productId,
          vendorId,
          inspectionType,
          checklistItems,
          inspectionStandards: inspectionStandards || {},
          bangladeshCompliance: bangladeshCompliance || false,
          priorityLevel: priorityLevel || 'medium',
          inspectionFrequency: inspectionFrequency || 'per_batch',
          autoApprovalThreshold: autoApprovalThreshold || 90,
          requiresDocumentation: requiresDocumentation || true,
          batchInspection: batchInspection || false,
          isActive: true
        })
        .returning();

      // Log checklist creation
      this.loggingService.logInfo('Quality inspection checklist created', {
        checklistId: newChecklist.id,
        productId,
        vendorId,
        inspectionType
      });

      res.json({
        success: true,
        message: 'Quality inspection checklist created successfully',
        data: newChecklist
      });

    } catch (error) {
      this.loggingService.logError('Error creating quality inspection checklist', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quality inspection checklist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quality inspection checklists
   */
  async getInspectionChecklists(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        productId,
        inspectionType,
        priorityLevel,
        isActive,
        page = 1,
        limit = 20 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let query = db
        .select({
          id: qualityInspectionChecklist.id,
          productId: qualityInspectionChecklist.productId,
          vendorId: qualityInspectionChecklist.vendorId,
          inspectionType: qualityInspectionChecklist.inspectionType,
          checklistItems: qualityInspectionChecklist.checklistItems,
          inspectionStandards: qualityInspectionChecklist.inspectionStandards,
          bangladeshCompliance: qualityInspectionChecklist.bangladeshCompliance,
          priorityLevel: qualityInspectionChecklist.priorityLevel,
          inspectionFrequency: qualityInspectionChecklist.inspectionFrequency,
          autoApprovalThreshold: qualityInspectionChecklist.autoApprovalThreshold,
          requiresDocumentation: qualityInspectionChecklist.requiresDocumentation,
          batchInspection: qualityInspectionChecklist.batchInspection,
          isActive: qualityInspectionChecklist.isActive,
          createdAt: qualityInspectionChecklist.createdAt,
          updatedAt: qualityInspectionChecklist.updatedAt,
          // Product details
          productName: products.name,
          productSku: products.sku,
          productCategory: products.categoryId,
          // Vendor details
          vendorName: vendors.businessName,
          vendorEmail: vendors.email
        })
        .from(qualityInspectionChecklist)
        .leftJoin(products, eq(qualityInspectionChecklist.productId, products.id))
        .leftJoin(vendors, eq(qualityInspectionChecklist.vendorId, vendors.id));

      // Apply filters
      const conditions = [];
      if (vendorId) conditions.push(eq(qualityInspectionChecklist.vendorId, vendorId as string));
      if (productId) conditions.push(eq(qualityInspectionChecklist.productId, productId as string));
      if (inspectionType) conditions.push(eq(qualityInspectionChecklist.inspectionType, inspectionType as string));
      if (priorityLevel) conditions.push(eq(qualityInspectionChecklist.priorityLevel, priorityLevel as string));
      if (isActive !== undefined) conditions.push(eq(qualityInspectionChecklist.isActive, isActive === 'true'));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const checklists = await query
        .orderBy(desc(qualityInspectionChecklist.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get total count
      const totalCount = await db
        .select({ count: count() })
        .from(qualityInspectionChecklist)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json({
        success: true,
        data: checklists,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0].count,
          pages: Math.ceil(totalCount[0].count / parseInt(limit as string))
        }
      });

    } catch (error) {
      this.loggingService.logError('Error fetching quality inspection checklists', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quality inspection checklists',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute quality inspection
   */
  async executeInspection(req: Request, res: Response): Promise<void> {
    try {
      const { checklistId } = req.params;
      const {
        batchNumber,
        inspectionResults,
        inspectorId,
        notes,
        images,
        testResults,
        overallScore,
        passed,
        defects,
        correctionRequired
      } = req.body;

      // Get checklist details
      const [checklist] = await db
        .select()
        .from(qualityInspectionChecklist)
        .where(eq(qualityInspectionChecklist.id, checklistId));

      if (!checklist) {
        res.status(404).json({
          success: false,
          message: 'Quality inspection checklist not found'
        });
        return;
      }

      // Create quality control record
      const [qualityRecord] = await db
        .insert(qualityControlRecords)
        .values({
          productId: checklist.productId,
          vendorId: checklist.vendorId,
          batchNumber,
          inspectionType: checklist.inspectionType,
          inspectionDate: new Date(),
          inspectorId,
          qualityScore: overallScore || 0,
          qualityGrade: this.calculateQualityGrade(overallScore || 0),
          passed: passed || false,
          defectTypes: defects || {},
          defectCount: defects ? Object.keys(defects).length : 0,
          defectSeverity: this.calculateDefectSeverity(defects || {}),
          actionTaken: correctionRequired ? 'correction_required' : 'none',
          correctionRequired: correctionRequired || false,
          bangladeshStandardsChecked: checklist.bangladeshCompliance,
          notes,
          images: images || {},
          testResults: testResults || {}
        })
        .returning();

      // Update checklist statistics
      await this.updateChecklistStatistics(checklistId, passed || false, overallScore || 0);

      // Log inspection execution
      this.loggingService.logInfo('Quality inspection executed', {
        checklistId,
        qualityRecordId: qualityRecord.id,
        productId: checklist.productId,
        passed: passed || false,
        overallScore: overallScore || 0
      });

      res.json({
        success: true,
        message: 'Quality inspection executed successfully',
        data: {
          qualityRecord,
          checklist: {
            id: checklist.id,
            productId: checklist.productId,
            inspectionType: checklist.inspectionType
          }
        }
      });

    } catch (error) {
      this.loggingService.logError('Error executing quality inspection', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute quality inspection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quality inspection analytics
   */
  async getInspectionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        vendorId, 
        productId,
        dateFrom,
        dateTo,
        inspectionType 
      } = req.query;

      const fromDate = dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = dateTo ? new Date(dateTo as string) : new Date();

      // Build base query conditions
      const conditions = [];
      if (vendorId) conditions.push(eq(qualityControlRecords.vendorId, vendorId as string));
      if (productId) conditions.push(eq(qualityControlRecords.productId, productId as string));
      if (inspectionType) conditions.push(eq(qualityControlRecords.inspectionType, inspectionType as string));
      conditions.push(gte(qualityControlRecords.inspectionDate, fromDate));
      conditions.push(lte(qualityControlRecords.inspectionDate, toDate));

      // Get overall statistics
      const [overallStats] = await db
        .select({
          totalInspections: count(),
          passedInspections: sum(sql`CASE WHEN ${qualityControlRecords.passed} THEN 1 ELSE 0 END`),
          averageScore: avg(qualityControlRecords.qualityScore),
          averageDefectCount: avg(qualityControlRecords.defectCount)
        })
        .from(qualityControlRecords)
        .where(and(...conditions));

      // Get quality grades distribution
      const gradeDistribution = await db
        .select({
          grade: qualityControlRecords.qualityGrade,
          count: count()
        })
        .from(qualityControlRecords)
        .where(and(...conditions))
        .groupBy(qualityControlRecords.qualityGrade);

      // Get defect analysis
      const defectAnalysis = await db
        .select({
          defectSeverity: qualityControlRecords.defectSeverity,
          count: count(),
          averageDefectCount: avg(qualityControlRecords.defectCount)
        })
        .from(qualityControlRecords)
        .where(and(...conditions))
        .groupBy(qualityControlRecords.defectSeverity);

      // Get inspection trends (daily)
      const inspectionTrends = await db
        .select({
          date: sql`DATE(${qualityControlRecords.inspectionDate})`,
          totalInspections: count(),
          passedInspections: sum(sql`CASE WHEN ${qualityControlRecords.passed} THEN 1 ELSE 0 END`),
          averageScore: avg(qualityControlRecords.qualityScore)
        })
        .from(qualityControlRecords)
        .where(and(...conditions))
        .groupBy(sql`DATE(${qualityControlRecords.inspectionDate})`)
        .orderBy(sql`DATE(${qualityControlRecords.inspectionDate})`);

      const passRate = overallStats.totalInspections > 0 
        ? (Number(overallStats.passedInspections) / Number(overallStats.totalInspections)) * 100 
        : 0;

      res.json({
        success: true,
        data: {
          summary: {
            totalInspections: Number(overallStats.totalInspections),
            passedInspections: Number(overallStats.passedInspections),
            failedInspections: Number(overallStats.totalInspections) - Number(overallStats.passedInspections),
            passRate: Math.round(passRate * 100) / 100,
            averageScore: Math.round(Number(overallStats.averageScore) * 100) / 100,
            averageDefectCount: Math.round(Number(overallStats.averageDefectCount) * 100) / 100
          },
          gradeDistribution,
          defectAnalysis,
          inspectionTrends,
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          }
        }
      });

    } catch (error) {
      this.loggingService.logError('Error fetching quality inspection analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quality inspection analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update checklist statistics
   */
  private async updateChecklistStatistics(checklistId: string, passed: boolean, score: number): Promise<void> {
    try {
      // This would typically update statistics in the checklist table
      // For now, we'll just log the update
      this.loggingService.logInfo('Checklist statistics updated', {
        checklistId,
        passed,
        score
      });
    } catch (error) {
      this.loggingService.logError('Error updating checklist statistics', error);
    }
  }

  /**
   * Calculate quality grade based on score
   */
  private calculateQualityGrade(score: number): 'A' | 'B' | 'C' | 'Rejected' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'Rejected';
  }

  /**
   * Calculate defect severity
   */
  private calculateDefectSeverity(defects: any): 'minor' | 'major' | 'critical' {
    if (!defects || Object.keys(defects).length === 0) return 'minor';
    
    // This would contain logic to analyze defect types and determine severity
    // For now, return a default based on defect count
    const defectCount = Object.keys(defects).length;
    if (defectCount >= 5) return 'critical';
    if (defectCount >= 3) return 'major';
    return 'minor';
  }
}