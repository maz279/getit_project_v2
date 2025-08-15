/**
 * Quality Controller - Product Quality Control Management
 * Amazon.com/Shopee.sg-level quality management with Bangladesh compliance
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  qualityControlRecords,
  inventory,
  products,
  vendors,
  users
} from '@shared/schema';
import { eq, and, desc, sql, lte, gte, count, sum, avg, isNull } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService.js';
import { LoggingService } from '../../../../services/LoggingService.js';

export class QualityController {
  private redisService: RedisService;
  private loggingService: LoggingService;

  constructor() {
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create quality inspection record
   */
  async createQualityInspection(req: Request, res: Response): Promise<void> {
    try {
      const {
        productId,
        batchNumber,
        inspectionType,
        qualityScore,
        qualityGrade,
        passed,
        defectTypes,
        defectCount = 0,
        defectSeverity,
        actionTaken,
        correctionRequired = false,
        reworkRequired = false,
        returnToSupplier = false,
        bangladeshStandardsChecked = false,
        certificationRequired = false,
        certificateNumber,
        notes,
        images,
        testResults
      } = req.body;
      const userId = req.user?.userId;

      // Get product and vendor information
      const [productInfo] = await db
        .select({
          vendorId: products.vendorId,
          name: products.name,
          sku: products.sku
        })
        .from(products)
        .where(eq(products.id, productId));

      if (!productInfo) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      // Create quality inspection record
      const [inspection] = await db
        .insert(qualityControlRecords)
        .values({
          productId,
          batchNumber,
          vendorId: productInfo.vendorId,
          inspectionType,
          inspectorId: userId,
          qualityScore,
          qualityGrade,
          passed,
          defectTypes,
          defectCount,
          defectSeverity,
          actionTaken,
          correctionRequired,
          reworkRequired,
          returnToSupplier,
          bangladeshStandardsChecked,
          certificationRequired,
          certificateNumber,
          notes,
          images,
          testResults
        })
        .returning();

      // Update inventory quality grade if this is final inspection
      if (inspectionType === 'final' && qualityGrade) {
        await db
          .update(inventory)
          .set({
            qualityGrade,
            bangladeshStandardsCompliant: bangladeshStandardsChecked && passed,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(inventory.productId, productId),
              batchNumber ? eq(inventory.batchNumber, batchNumber) : sql`1=1`
            )
          );
      }

      this.loggingService.logInfo('Quality inspection created', {
        inspectionId: inspection.id,
        productId,
        batchNumber,
        qualityGrade,
        passed,
        inspectorId: userId
      });

      res.json({
        success: true,
        message: 'Quality inspection record created successfully',
        data: {
          inspection,
          productInfo: {
            name: productInfo.name,
            sku: productInfo.sku
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create quality inspection', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quality inspection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quality inspection details
   */
  async getQualityInspection(req: Request, res: Response): Promise<void> {
    try {
      const { inspectionId } = req.params;

      const [inspection] = await db
        .select({
          id: qualityControlRecords.id,
          productId: qualityControlRecords.productId,
          batchNumber: qualityControlRecords.batchNumber,
          vendorId: qualityControlRecords.vendorId,
          inspectionType: qualityControlRecords.inspectionType,
          inspectionDate: qualityControlRecords.inspectionDate,
          qualityScore: qualityControlRecords.qualityScore,
          qualityGrade: qualityControlRecords.qualityGrade,
          passed: qualityControlRecords.passed,
          defectTypes: qualityControlRecords.defectTypes,
          defectCount: qualityControlRecords.defectCount,
          defectSeverity: qualityControlRecords.defectSeverity,
          actionTaken: qualityControlRecords.actionTaken,
          correctionRequired: qualityControlRecords.correctionRequired,
          reworkRequired: qualityControlRecords.reworkRequired,
          returnToSupplier: qualityControlRecords.returnToSupplier,
          bangladeshStandardsChecked: qualityControlRecords.bangladeshStandardsChecked,
          certificationRequired: qualityControlRecords.certificationRequired,
          certificateNumber: qualityControlRecords.certificateNumber,
          notes: qualityControlRecords.notes,
          images: qualityControlRecords.images,
          testResults: qualityControlRecords.testResults,
          createdAt: qualityControlRecords.createdAt,
          // Related data
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName,
          inspectorName: users.fullName
        })
        .from(qualityControlRecords)
        .leftJoin(products, eq(qualityControlRecords.productId, products.id))
        .leftJoin(vendors, eq(qualityControlRecords.vendorId, vendors.id))
        .leftJoin(users, eq(qualityControlRecords.inspectorId, users.id))
        .where(eq(qualityControlRecords.id, inspectionId));

      if (!inspection) {
        res.status(404).json({
          success: false,
          message: 'Quality inspection not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { inspection },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get quality inspection', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality inspection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update quality inspection
   */
  async updateQualityInspection(req: Request, res: Response): Promise<void> {
    try {
      const { inspectionId } = req.params;
      const updates = req.body;
      const userId = req.user?.userId;

      const allowedFields = [
        'qualityScore',
        'qualityGrade',
        'passed',
        'defectTypes',
        'defectCount',
        'defectSeverity',
        'actionTaken',
        'correctionRequired',
        'reworkRequired',
        'returnToSupplier',
        'bangladeshStandardsChecked',
        'certificationRequired',
        'certificateNumber',
        'notes',
        'images',
        'testResults'
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

      const [updatedInspection] = await db
        .update(qualityControlRecords)
        .set({
          ...validUpdates,
          updatedAt: new Date()
        })
        .where(eq(qualityControlRecords.id, inspectionId))
        .returning();

      if (!updatedInspection) {
        res.status(404).json({
          success: false,
          message: 'Quality inspection not found'
        });
        return;
      }

      this.loggingService.logInfo('Quality inspection updated', {
        inspectionId,
        userId,
        updatedFields: Object.keys(validUpdates)
      });

      res.json({
        success: true,
        message: 'Quality inspection updated successfully',
        data: updatedInspection,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update quality inspection', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quality inspection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get product quality report
   */
  async getProductQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { startDate, endDate, limit = 50 } = req.query;

      let query = db
        .select({
          id: qualityControlRecords.id,
          inspectionType: qualityControlRecords.inspectionType,
          inspectionDate: qualityControlRecords.inspectionDate,
          qualityScore: qualityControlRecords.qualityScore,
          qualityGrade: qualityControlRecords.qualityGrade,
          passed: qualityControlRecords.passed,
          defectCount: qualityControlRecords.defectCount,
          defectSeverity: qualityControlRecords.defectSeverity,
          batchNumber: qualityControlRecords.batchNumber,
          bangladeshStandardsChecked: qualityControlRecords.bangladeshStandardsChecked,
          inspectorName: users.fullName
        })
        .from(qualityControlRecords)
        .leftJoin(users, eq(qualityControlRecords.inspectorId, users.id))
        .where(eq(qualityControlRecords.productId, productId));

      if (startDate) {
        query = query.where(gte(qualityControlRecords.inspectionDate, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(qualityControlRecords.inspectionDate, new Date(endDate as string)));
      }

      const inspections = await query
        .orderBy(desc(qualityControlRecords.inspectionDate))
        .limit(parseInt(limit as string));

      // Calculate quality metrics
      const [qualityMetrics] = await db
        .select({
          totalInspections: count(),
          passedInspections: count(sql`CASE WHEN ${qualityControlRecords.passed} = true THEN 1 END`),
          averageQualityScore: avg(qualityControlRecords.qualityScore),
          gradeACount: count(sql`CASE WHEN ${qualityControlRecords.qualityGrade} = 'A' THEN 1 END`),
          gradeBCount: count(sql`CASE WHEN ${qualityControlRecords.qualityGrade} = 'B' THEN 1 END`),
          gradeCCount: count(sql`CASE WHEN ${qualityControlRecords.qualityGrade} = 'C' THEN 1 END`),
          rejectedCount: count(sql`CASE WHEN ${qualityControlRecords.qualityGrade} = 'Rejected' THEN 1 END`),
          bangladeshCompliantCount: count(sql`CASE WHEN ${qualityControlRecords.bangladeshStandardsChecked} = true THEN 1 END`)
        })
        .from(qualityControlRecords)
        .where(eq(qualityControlRecords.productId, productId));

      const passRate = qualityMetrics.totalInspections > 0 
        ? (qualityMetrics.passedInspections / qualityMetrics.totalInspections) * 100 
        : 0;

      res.json({
        success: true,
        data: {
          inspections,
          metrics: {
            ...qualityMetrics,
            passRate: Math.round(passRate * 100) / 100,
            complianceRate: qualityMetrics.totalInspections > 0 
              ? Math.round((qualityMetrics.bangladeshCompliantCount / qualityMetrics.totalInspections) * 100 * 100) / 100
              : 0
          },
          productId
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get product quality report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product quality report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get vendor quality report
   */
  async getVendorQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { startDate, endDate, page = 1, limit = 20 } = req.query;
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
          productId: qualityControlRecords.productId,
          productName: products.name,
          productSku: products.sku,
          totalInspections: count(),
          passedInspections: count(sql`CASE WHEN ${qualityControlRecords.passed} = true THEN 1 END`),
          averageQualityScore: avg(qualityControlRecords.qualityScore),
          latestInspection: max(qualityControlRecords.inspectionDate),
          bangladeshCompliantCount: count(sql`CASE WHEN ${qualityControlRecords.bangladeshStandardsChecked} = true THEN 1 END`)
        })
        .from(qualityControlRecords)
        .leftJoin(products, eq(qualityControlRecords.productId, products.id))
        .where(eq(qualityControlRecords.vendorId, vendorId))
        .groupBy(qualityControlRecords.productId, products.name, products.sku);

      if (startDate) {
        query = query.where(gte(qualityControlRecords.inspectionDate, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(qualityControlRecords.inspectionDate, new Date(endDate as string)));
      }

      const productQualityData = await query
        .orderBy(desc(max(qualityControlRecords.inspectionDate)))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get overall vendor metrics
      const [vendorMetrics] = await db
        .select({
          totalInspections: count(),
          totalProducts: count(sql`DISTINCT ${qualityControlRecords.productId}`),
          passedInspections: count(sql`CASE WHEN ${qualityControlRecords.passed} = true THEN 1 END`),
          averageQualityScore: avg(qualityControlRecords.qualityScore),
          bangladeshCompliantCount: count(sql`CASE WHEN ${qualityControlRecords.bangladeshStandardsChecked} = true THEN 1 END`),
          defectiveProductsCount: count(sql`CASE WHEN ${qualityControlRecords.defectCount} > 0 THEN 1 END`)
        })
        .from(qualityControlRecords)
        .where(eq(qualityControlRecords.vendorId, vendorId));

      res.json({
        success: true,
        data: {
          productQualityData,
          vendorMetrics: {
            ...vendorMetrics,
            overallPassRate: vendorMetrics.totalInspections > 0 
              ? Math.round((vendorMetrics.passedInspections / vendorMetrics.totalInspections) * 100 * 100) / 100
              : 0,
            complianceRate: vendorMetrics.totalInspections > 0 
              ? Math.round((vendorMetrics.bangladeshCompliantCount / vendorMetrics.totalInspections) * 100 * 100) / 100
              : 0
          },
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: productQualityData.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get vendor quality report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve vendor quality report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get batch quality report
   */
  async getBatchQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const { batchNumber } = req.params;

      const inspections = await db
        .select({
          id: qualityControlRecords.id,
          productId: qualityControlRecords.productId,
          inspectionType: qualityControlRecords.inspectionType,
          inspectionDate: qualityControlRecords.inspectionDate,
          qualityScore: qualityControlRecords.qualityScore,
          qualityGrade: qualityControlRecords.qualityGrade,
          passed: qualityControlRecords.passed,
          defectTypes: qualityControlRecords.defectTypes,
          defectCount: qualityControlRecords.defectCount,
          actionTaken: qualityControlRecords.actionTaken,
          productName: products.name,
          productSku: products.sku,
          vendorName: vendors.businessName,
          inspectorName: users.fullName
        })
        .from(qualityControlRecords)
        .leftJoin(products, eq(qualityControlRecords.productId, products.id))
        .leftJoin(vendors, eq(qualityControlRecords.vendorId, vendors.id))
        .leftJoin(users, eq(qualityControlRecords.inspectorId, users.id))
        .where(eq(qualityControlRecords.batchNumber, batchNumber))
        .orderBy(desc(qualityControlRecords.inspectionDate));

      // Calculate batch metrics
      const [batchMetrics] = await db
        .select({
          totalInspections: count(),
          passedInspections: count(sql`CASE WHEN ${qualityControlRecords.passed} = true THEN 1 END`),
          averageQualityScore: avg(qualityControlRecords.qualityScore),
          totalDefects: sum(qualityControlRecords.defectCount),
          uniqueProducts: count(sql`DISTINCT ${qualityControlRecords.productId}`)
        })
        .from(qualityControlRecords)
        .where(eq(qualityControlRecords.batchNumber, batchNumber));

      res.json({
        success: true,
        data: {
          batchNumber,
          inspections,
          metrics: {
            ...batchMetrics,
            passRate: batchMetrics.totalInspections > 0 
              ? Math.round((batchMetrics.passedInspections / batchMetrics.totalInspections) * 100 * 100) / 100
              : 0,
            defectRate: batchMetrics.totalInspections > 0 
              ? Math.round((batchMetrics.totalDefects / batchMetrics.totalInspections) * 100) / 100
              : 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get batch quality report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve batch quality report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Bangladesh compliance report
   */
  async getBangladeshComplianceReport(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, startDate, endDate } = req.query;

      let query = db
        .select({
          productId: qualityControlRecords.productId,
          productName: products.name,
          vendorId: qualityControlRecords.vendorId,
          vendorName: vendors.businessName,
          bangladeshStandardsChecked: qualityControlRecords.bangladeshStandardsChecked,
          passed: qualityControlRecords.passed,
          certificationRequired: qualityControlRecords.certificationRequired,
          certificateNumber: qualityControlRecords.certificateNumber,
          inspectionDate: qualityControlRecords.inspectionDate,
          qualityGrade: qualityControlRecords.qualityGrade
        })
        .from(qualityControlRecords)
        .leftJoin(products, eq(qualityControlRecords.productId, products.id))
        .leftJoin(vendors, eq(qualityControlRecords.vendorId, vendors.id));

      if (vendorId) {
        query = query.where(eq(qualityControlRecords.vendorId, vendorId as string));
      }

      if (startDate) {
        query = query.where(gte(qualityControlRecords.inspectionDate, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(qualityControlRecords.inspectionDate, new Date(endDate as string)));
      }

      const complianceData = await query
        .orderBy(desc(qualityControlRecords.inspectionDate))
        .limit(100);

      // Calculate compliance statistics
      const [complianceStats] = await db
        .select({
          totalProducts: count(sql`DISTINCT ${qualityControlRecords.productId}`),
          standardsCheckedCount: count(sql`CASE WHEN ${qualityControlRecords.bangladeshStandardsChecked} = true THEN 1 END`),
          compliantCount: count(sql`CASE WHEN ${qualityControlRecords.bangladeshStandardsChecked} = true AND ${qualityControlRecords.passed} = true THEN 1 END`),
          certificationRequiredCount: count(sql`CASE WHEN ${qualityControlRecords.certificationRequired} = true THEN 1 END`),
          certifiedCount: count(sql`CASE WHEN ${qualityControlRecords.certificateNumber} IS NOT NULL THEN 1 END`)
        })
        .from(qualityControlRecords)
        .where(vendorId ? eq(qualityControlRecords.vendorId, vendorId as string) : sql`1=1`);

      const complianceMetrics = {
        ...complianceStats,
        complianceRate: complianceStats.totalProducts > 0 
          ? Math.round((complianceStats.compliantCount / complianceStats.totalProducts) * 100 * 100) / 100
          : 0,
        certificationRate: complianceStats.certificationRequiredCount > 0 
          ? Math.round((complianceStats.certifiedCount / complianceStats.certificationRequiredCount) * 100 * 100) / 100
          : 0
      };

      res.json({
        success: true,
        data: {
          complianceData,
          metrics: complianceMetrics,
          bangladeshStandards: {
            categories: [
              'Food Safety Standards',
              'Electronic Product Standards',
              'Textile and Garment Standards',
              'Pharmaceutical Standards',
              'Construction Material Standards'
            ],
            certificationBodies: [
              'BSTI (Bangladesh Standards and Testing Institution)',
              'DGDA (Directorate General of Drug Administration)',
              'Department of Environment'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get Bangladesh compliance report', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve Bangladesh compliance report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Upload compliance certificate
   */
  async uploadComplianceCertificate(req: Request, res: Response): Promise<void> {
    try {
      const {
        inspectionId,
        certificateNumber,
        issuingAuthority,
        validFrom,
        validUntil,
        certificateType,
        documentUrl
      } = req.body;
      const userId = req.user?.userId;

      // Update inspection record with certificate information
      const [updatedInspection] = await db
        .update(qualityControlRecords)
        .set({
          certificateNumber,
          notes: sql`COALESCE(${qualityControlRecords.notes}, '') || ${`\nCertificate uploaded: ${certificateNumber} by ${issuingAuthority}`}`,
          updatedAt: new Date()
        })
        .where(eq(qualityControlRecords.id, inspectionId))
        .returning();

      if (!updatedInspection) {
        res.status(404).json({
          success: false,
          message: 'Quality inspection not found'
        });
        return;
      }

      this.loggingService.logInfo('Compliance certificate uploaded', {
        inspectionId,
        certificateNumber,
        issuingAuthority,
        userId
      });

      res.json({
        success: true,
        message: 'Compliance certificate uploaded successfully',
        data: {
          inspectionId,
          certificateNumber,
          issuingAuthority,
          validFrom,
          validUntil,
          certificateType,
          documentUrl
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to upload compliance certificate', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload compliance certificate',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quality trends analysis
   */
  async getQualityTrends(req: Request, res: Response): Promise<void> {
    try {
      const { 
        period = 'monthly',
        vendorId,
        startDate,
        endDate 
      } = req.query;

      const dateFormat = period === 'daily' ? 'YYYY-MM-DD' : 
                        period === 'weekly' ? 'YYYY-"W"WW' : 'YYYY-MM';

      let query = db
        .select({
          period: sql`TO_CHAR(${qualityControlRecords.inspectionDate}, ${dateFormat})`,
          totalInspections: count(),
          passedInspections: count(sql`CASE WHEN ${qualityControlRecords.passed} = true THEN 1 END`),
          averageQualityScore: avg(qualityControlRecords.qualityScore),
          totalDefects: sum(qualityControlRecords.defectCount),
          bangladeshCompliantCount: count(sql`CASE WHEN ${qualityControlRecords.bangladeshStandardsChecked} = true AND ${qualityControlRecords.passed} = true THEN 1 END`)
        })
        .from(qualityControlRecords)
        .groupBy(sql`TO_CHAR(${qualityControlRecords.inspectionDate}, ${dateFormat})`);

      if (vendorId) {
        query = query.where(eq(qualityControlRecords.vendorId, vendorId as string));
      }

      if (startDate) {
        query = query.where(gte(qualityControlRecords.inspectionDate, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(qualityControlRecords.inspectionDate, new Date(endDate as string)));
      }

      const trends = await query
        .orderBy(sql`TO_CHAR(${qualityControlRecords.inspectionDate}, ${dateFormat})`);

      // Calculate trend metrics
      const trendMetrics = trends.map(trend => ({
        ...trend,
        passRate: trend.totalInspections > 0 
          ? Math.round((trend.passedInspections / trend.totalInspections) * 100 * 100) / 100
          : 0,
        complianceRate: trend.totalInspections > 0 
          ? Math.round((trend.bangladeshCompliantCount / trend.totalInspections) * 100 * 100) / 100
          : 0,
        defectRate: trend.totalInspections > 0 
          ? Math.round((trend.totalDefects / trend.totalInspections) * 100) / 100
          : 0
      }));

      res.json({
        success: true,
        data: {
          trends: trendMetrics,
          period,
          filters: { vendorId, startDate, endDate }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get quality trends', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality trends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get defect patterns analysis
   */
  async getDefectPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, startDate, endDate, limit = 20 } = req.query;

      let query = db
        .select({
          defectType: sql`jsonb_array_elements_text(${qualityControlRecords.defectTypes})`,
          defectCount: count(),
          averageSeverity: sql`AVG(CASE 
            WHEN ${qualityControlRecords.defectSeverity} = 'minor' THEN 1
            WHEN ${qualityControlRecords.defectSeverity} = 'major' THEN 2
            WHEN ${qualityControlRecords.defectSeverity} = 'critical' THEN 3
            ELSE 0 END)`,
          affectedProducts: count(sql`DISTINCT ${qualityControlRecords.productId}`),
          correctionRequiredCount: count(sql`CASE WHEN ${qualityControlRecords.correctionRequired} = true THEN 1 END`)
        })
        .from(qualityControlRecords)
        .where(sql`${qualityControlRecords.defectTypes} IS NOT NULL`)
        .groupBy(sql`jsonb_array_elements_text(${qualityControlRecords.defectTypes})`);

      if (vendorId) {
        query = query.where(eq(qualityControlRecords.vendorId, vendorId as string));
      }

      if (startDate) {
        query = query.where(gte(qualityControlRecords.inspectionDate, new Date(startDate as string)));
      }

      if (endDate) {
        query = query.where(lte(qualityControlRecords.inspectionDate, new Date(endDate as string)));
      }

      const defectPatterns = await query
        .orderBy(desc(count()))
        .limit(parseInt(limit as string));

      // Get top defective products
      const topDefectiveProducts = await db
        .select({
          productId: qualityControlRecords.productId,
          productName: products.name,
          totalDefects: sum(qualityControlRecords.defectCount),
          failedInspections: count(sql`CASE WHEN ${qualityControlRecords.passed} = false THEN 1 END`),
          totalInspections: count()
        })
        .from(qualityControlRecords)
        .leftJoin(products, eq(qualityControlRecords.productId, products.id))
        .where(
          and(
            sql`${qualityControlRecords.defectCount} > 0`,
            vendorId ? eq(qualityControlRecords.vendorId, vendorId as string) : sql`1=1`
          )
        )
        .groupBy(qualityControlRecords.productId, products.name)
        .orderBy(desc(sum(qualityControlRecords.defectCount)))
        .limit(10);

      res.json({
        success: true,
        data: {
          defectPatterns,
          topDefectiveProducts: topDefectiveProducts.map(product => ({
            ...product,
            failureRate: product.totalInspections > 0 
              ? Math.round((product.failedInspections / product.totalInspections) * 100 * 100) / 100
              : 0
          })),
          insights: {
            commonDefectTypes: [
              'Packaging damage',
              'Color variation',
              'Size discrepancy',
              'Functionality issues',
              'Documentation incomplete'
            ],
            improvementAreas: [
              'Supplier quality training',
              'Enhanced incoming inspection',
              'Process standardization',
              'Equipment calibration'
            ]
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get defect patterns', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve defect patterns',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}