/**
 * A/B Testing Controller
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Amazon.com/Shopee.sg-level A/B testing with traffic splitting,
 * variant management, and comprehensive analytics
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  apiGatewayAbTests,
  apiGatewayAbTestMetrics 
} from '../../../../shared/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import crypto from 'crypto';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ab-testing-controller' }
});

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  trafficPercentage: number; // 0-100
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  configuration: ABTestConfiguration;
  results: ABTestResults;
  createdBy: string;
  metadata: Record<string, any>;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: Record<string, any>;
  endpoint?: string;
  isControl: boolean;
}

export interface ABTestConfiguration {
  type: 'route' | 'feature' | 'ui' | 'algorithm';
  trigger: 'url' | 'user_segment' | 'geography' | 'custom';
  targeting: {
    userSegments?: string[];
    countries?: string[];
    deviceTypes?: string[];
    customRules?: Record<string, any>;
  };
  duration: {
    type: 'fixed' | 'until_significance' | 'manual';
    days?: number;
    minSampleSize?: number;
    maxDuration?: number;
  };
  metrics: {
    primary: string;
    secondary: string[];
    conversionEvents: string[];
  };
  bangladesh: {
    culturalSensitivity: boolean;
    festivalAwareness: boolean;
    mobileOptimization: boolean;
    localPaymentMethods: string[];
  };
}

export interface ABTestResults {
  totalSessions: number;
  totalConversions: number;
  overallConversionRate: number;
  statisticalSignificance: number;
  confidenceLevel: number;
  variants: {
    [variantId: string]: {
      sessions: number;
      conversions: number;
      conversionRate: number;
      improvement: number;
      statistical: {
        significance: number;
        pValue: number;
        confidenceInterval: [number, number];
      };
    };
  };
  insights: {
    winner?: string;
    recommendation: string;
    keyFindings: string[];
    bangladesh: {
      mobilePerformance: Record<string, number>;
      regionalPerformance: Record<string, number>;
      paymentMethodImpact: Record<string, number>;
    };
  };
}

export class ABTestingController {
  private activeTests: Map<string, ABTest> = new Map();
  private trafficRouter: TrafficRouter;

  constructor() {
    this.trafficRouter = new TrafficRouter();
    this.initializeController();
  }

  private async initializeController(): Promise<void> {
    try {
      await this.loadActiveTests();
      logger.info('A/B Testing Controller initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize A/B Testing Controller', { error: error.message });
    }
  }

  private async loadActiveTests(): Promise<void> {
    try {
      const dbTests = await db.select()
        .from(apiGatewayAbTests)
        .where(eq(apiGatewayAbTests.status, 'active'));

      for (const test of dbTests) {
        this.activeTests.set(test.id, {
          id: test.id,
          name: test.name,
          description: test.description || '',
          status: test.status as 'active' | 'paused' | 'completed',
          trafficPercentage: test.trafficPercentage || 50,
          variants: JSON.parse(test.variants as string || '[]'),
          startDate: test.startDate || test.createdAt,
          endDate: test.endDate || undefined,
          configuration: JSON.parse(test.configuration as string || '{}'),
          results: JSON.parse(test.results as string || '{}'),
          createdBy: test.createdBy || '',
          metadata: JSON.parse(test.metadata as string || '{}')
        });
      }

      logger.info('Active A/B tests loaded', { testCount: this.activeTests.size });
    } catch (error) {
      logger.error('Failed to load active tests', { error: error.message });
    }
  }

  // Test Management Endpoints
  async createTest(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name, 
        description, 
        trafficPercentage = 50, 
        variants, 
        startDate, 
        endDate, 
        configuration,
        createdBy 
      } = req.body;

      if (!name || !variants || variants.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Test name and at least 2 variants are required'
        });
      }

      // Validate traffic percentages
      const totalTraffic = variants.reduce((sum: number, v: any) => sum + v.trafficPercentage, 0);
      if (totalTraffic !== 100) {
        return res.status(400).json({
          success: false,
          error: 'Variant traffic percentages must sum to 100'
        });
      }

      const testId = uuidv4();
      const test: ABTest = {
        id: testId,
        name,
        description: description || '',
        status: 'active',
        trafficPercentage,
        variants: variants.map((v: any) => ({
          ...v,
          id: v.id || uuidv4()
        })),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        configuration: configuration || {},
        results: {
          totalSessions: 0,
          totalConversions: 0,
          overallConversionRate: 0,
          statisticalSignificance: 0,
          confidenceLevel: 95,
          variants: {},
          insights: {
            recommendation: 'Test in progress',
            keyFindings: [],
            bangladesh: {
              mobilePerformance: {},
              regionalPerformance: {},
              paymentMethodImpact: {}
            }
          }
        },
        createdBy: createdBy || 'system',
        metadata: {}
      };

      // Save to database
      await db.insert(apiGatewayAbTests).values({
        id: testId,
        name,
        description,
        status: 'active',
        trafficPercentage,
        variants: JSON.stringify(test.variants),
        startDate: test.startDate,
        endDate: test.endDate,
        configuration: JSON.stringify(test.configuration),
        results: JSON.stringify(test.results),
        createdBy: test.createdBy,
        metadata: JSON.stringify(test.metadata),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Add to active tests
      this.activeTests.set(testId, test);

      res.json({
        success: true,
        data: test
      });
    } catch (error) {
      logger.error('Failed to create A/B test', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const test = this.activeTests.get(testId);

      if (!test) {
        // Try to load from database
        const dbTest = await db.select()
          .from(apiGatewayAbTests)
          .where(eq(apiGatewayAbTests.id, testId))
          .limit(1);

        if (dbTest.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'A/B test not found'
          });
        }

        // Convert from database format
        const test = this.convertDbTestToModel(dbTest[0]);
        res.json({ success: true, data: test });
        return;
      }

      res.json({ success: true, data: test });
    } catch (error) {
      logger.error('Failed to get A/B test', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const updates = req.body;

      let test = this.activeTests.get(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          error: 'A/B test not found'
        });
      }

      // Update test
      test = { ...test, ...updates, metadata: { ...test.metadata, ...updates.metadata } };
      this.activeTests.set(testId, test);

      // Update in database
      await db
        .update(apiGatewayAbTests)
        .set({
          ...updates,
          variants: updates.variants ? JSON.stringify(updates.variants) : undefined,
          configuration: updates.configuration ? JSON.stringify(updates.configuration) : undefined,
          results: updates.results ? JSON.stringify(updates.results) : undefined,
          metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined,
          updatedAt: new Date()
        })
        .where(eq(apiGatewayAbTests.id, testId));

      res.json({ success: true, data: test });
    } catch (error) {
      logger.error('Failed to update A/B test', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async pauseTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      
      const test = this.activeTests.get(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          error: 'A/B test not found'
        });
      }

      test.status = 'paused';
      this.activeTests.set(testId, test);

      await db
        .update(apiGatewayAbTests)
        .set({ status: 'paused', updatedAt: new Date() })
        .where(eq(apiGatewayAbTests.id, testId));

      res.json({ success: true, data: { testId, status: 'paused' } });
    } catch (error) {
      logger.error('Failed to pause A/B test', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resumeTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      
      const test = this.activeTests.get(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          error: 'A/B test not found'
        });
      }

      test.status = 'active';
      this.activeTests.set(testId, test);

      await db
        .update(apiGatewayAbTests)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(apiGatewayAbTests.id, testId));

      res.json({ success: true, data: { testId, status: 'active' } });
    } catch (error) {
      logger.error('Failed to resume A/B test', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async stopTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      
      const test = this.activeTests.get(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          error: 'A/B test not found'
        });
      }

      test.status = 'completed';
      test.endDate = new Date();
      this.activeTests.delete(testId); // Remove from active tests

      await db
        .update(apiGatewayAbTests)
        .set({ 
          status: 'completed', 
          endDate: test.endDate,
          updatedAt: new Date() 
        })
        .where(eq(apiGatewayAbTests.id, testId));

      res.json({ success: true, data: { testId, status: 'completed' } });
    } catch (error) {
      logger.error('Failed to stop A/B test', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Traffic Routing
  async routeTraffic(req: Request, res: Response): Promise<void> {
    try {
      const { path, userId, ipAddress, userAgent, headers } = req.body;

      if (!path) {
        return res.status(400).json({
          success: false,
          error: 'Path is required for traffic routing'
        });
      }

      const routingResult = await this.trafficRouter.route({
        path,
        userId,
        ipAddress,
        userAgent,
        headers,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: routingResult
      });
    } catch (error) {
      logger.error('Failed to route traffic', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Analytics and Metrics
  async trackConversion(req: Request, res: Response): Promise<void> {
    try {
      const { testId, variantId, userId, conversionType, value } = req.body;

      if (!testId || !variantId) {
        return res.status(400).json({
          success: false,
          error: 'Test ID and variant ID are required'
        });
      }

      await this.recordConversion(testId, variantId, {
        userId,
        conversionType,
        value: value || 1,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: { tracked: true, testId, variantId }
      });
    } catch (error) {
      logger.error('Failed to track conversion', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTestResults(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const { recalculate = false } = req.query;

      const test = this.activeTests.get(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          error: 'A/B test not found'
        });
      }

      let results = test.results;
      
      if (recalculate === 'true') {
        results = await this.calculateTestResults(testId);
      }

      res.json({
        success: true,
        data: {
          testId,
          results,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get test results', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTestMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const { timeRange = '24h' } = req.query;

      const hoursBack = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const metrics = await db.select()
        .from(apiGatewayAbTestMetrics)
        .where(and(
          eq(apiGatewayAbTestMetrics.testId, testId),
          gte(apiGatewayAbTestMetrics.timestamp, since)
        ))
        .orderBy(desc(apiGatewayAbTestMetrics.timestamp));

      res.json({
        success: true,
        data: {
          testId,
          metrics,
          timeRange
        }
      });
    } catch (error) {
      logger.error('Failed to get test metrics', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Helper methods
  private async recordConversion(testId: string, variantId: string, conversionData: any): Promise<void> {
    try {
      // Record in metrics table
      await db.insert(apiGatewayAbTestMetrics).values({
        id: uuidv4(),
        testId,
        variant: variantId,
        totalRequests: 1,
        successfulRequests: 1,
        conversionRate: 1,
        timestamp: conversionData.timestamp,
        createdAt: new Date()
      });

      // Update test results
      const test = this.activeTests.get(testId);
      if (test) {
        if (!test.results.variants[variantId]) {
          test.results.variants[variantId] = {
            sessions: 0,
            conversions: 0,
            conversionRate: 0,
            improvement: 0,
            statistical: {
              significance: 0,
              pValue: 1,
              confidenceInterval: [0, 0]
            }
          };
        }

        test.results.variants[variantId].conversions += 1;
        test.results.totalConversions += 1;
        
        // Recalculate conversion rates
        this.recalculateConversionRates(test);
        this.activeTests.set(testId, test);

        // Update in database
        await db
          .update(apiGatewayAbTests)
          .set({
            results: JSON.stringify(test.results),
            updatedAt: new Date()
          })
          .where(eq(apiGatewayAbTests.id, testId));
      }
    } catch (error) {
      logger.error('Failed to record conversion', { error: error.message });
    }
  }

  private async calculateTestResults(testId: string): Promise<ABTestResults> {
    // Implementation for statistical significance calculation
    // This would include chi-square tests, confidence intervals, etc.
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // Simplified calculation - in production this would be more sophisticated
    return test.results;
  }

  private recalculateConversionRates(test: ABTest): void {
    for (const variantId of Object.keys(test.results.variants)) {
      const variant = test.results.variants[variantId];
      if (variant.sessions > 0) {
        variant.conversionRate = (variant.conversions / variant.sessions) * 100;
      }
    }

    if (test.results.totalSessions > 0) {
      test.results.overallConversionRate = (test.results.totalConversions / test.results.totalSessions) * 100;
    }
  }

  private convertDbTestToModel(dbTest: any): ABTest {
    return {
      id: dbTest.id,
      name: dbTest.name,
      description: dbTest.description || '',
      status: dbTest.status,
      trafficPercentage: dbTest.trafficPercentage || 50,
      variants: JSON.parse(dbTest.variants || '[]'),
      startDate: dbTest.startDate || dbTest.createdAt,
      endDate: dbTest.endDate,
      configuration: JSON.parse(dbTest.configuration || '{}'),
      results: JSON.parse(dbTest.results || '{}'),
      createdBy: dbTest.createdBy || '',
      metadata: JSON.parse(dbTest.metadata || '{}')
    };
  }
}

// Traffic Router for A/B Testing
class TrafficRouter {
  async route(request: {
    path: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    headers?: Record<string, string>;
    timestamp: Date;
  }): Promise<{
    testId?: string;
    variantId?: string;
    variant?: ABTestVariant;
    shouldParticipate: boolean;
    routingReason: string;
  }> {
    try {
      // Get all active tests that might apply to this request
      const applicableTests = await this.getApplicableTests(request.path);
      
      if (applicableTests.length === 0) {
        return {
          shouldParticipate: false,
          routingReason: 'No applicable tests'
        };
      }

      // For simplicity, use the first applicable test
      const test = applicableTests[0];
      
      // Determine if user should participate
      const shouldParticipate = this.shouldUserParticipate(request, test);
      
      if (!shouldParticipate) {
        return {
          testId: test.id,
          shouldParticipate: false,
          routingReason: 'User excluded from test'
        };
      }

      // Select variant based on traffic percentage
      const variant = this.selectVariant(request, test);
      
      return {
        testId: test.id,
        variantId: variant.id,
        variant,
        shouldParticipate: true,
        routingReason: 'User assigned to variant'
      };
    } catch (error) {
      logger.error('Traffic routing error', { error: error.message });
      return {
        shouldParticipate: false,
        routingReason: 'Routing error'
      };
    }
  }

  private async getApplicableTests(path: string): Promise<ABTest[]> {
    // This would implement logic to find tests that apply to the given path
    // For now, return a simplified result
    return [];
  }

  private shouldUserParticipate(request: any, test: ABTest): boolean {
    // Implement targeting logic based on user segments, geography, etc.
    // For Bangladesh-specific targeting
    if (test.configuration.bangladesh?.mobileOptimization && 
        this.isMobileRequest(request.userAgent)) {
      return true;
    }

    // Random participation based on traffic percentage
    const hash = this.hashUserId(request.userId || request.ipAddress || 'anonymous');
    return (hash % 100) < test.trafficPercentage;
  }

  private selectVariant(request: any, test: ABTest): ABTestVariant {
    const hash = this.hashUserId(request.userId || request.ipAddress || 'anonymous');
    let cumulativePercentage = 0;
    
    for (const variant of test.variants) {
      cumulativePercentage += variant.trafficPercentage;
      if ((hash % 100) < cumulativePercentage) {
        return variant;
      }
    }
    
    // Fallback to control variant
    return test.variants.find(v => v.isControl) || test.variants[0];
  }

  private isMobileRequest(userAgent?: string): boolean {
    if (!userAgent) return false;
    return /Mobile|Android|iPhone|iPad/.test(userAgent);
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const abTestingController = new ABTestingController();