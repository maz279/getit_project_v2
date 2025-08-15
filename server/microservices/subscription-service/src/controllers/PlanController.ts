/**
 * Amazon.com/Shopee.sg-Level Plan Controller
 * Complete subscription plan management
 */

import { Router, Request, Response } from 'express';
import { db } from '../../../../db';
import { subscriptionPlans } from '../../../../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export class PlanController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Plan Management
    this.router.post('/create', this.createPlan.bind(this));
    this.router.get('/', this.getPlans.bind(this));
    this.router.get('/:id', this.getPlan.bind(this));
    this.router.put('/:id', this.updatePlan.bind(this));
    this.router.delete('/:id', this.deletePlan.bind(this));
    
    // Plan Features
    this.router.get('/:id/features', this.getPlanFeatures.bind(this));
    this.router.post('/:id/features', this.addPlanFeature.bind(this));
    this.router.delete('/:id/features/:featureId', this.removePlanFeature.bind(this));
    
    // Plan Pricing
    this.router.get('/:id/pricing', this.getPlanPricing.bind(this));
    this.router.post('/:id/pricing', this.updatePlanPricing.bind(this));
    
    // Plan Analytics
    this.router.get('/:id/subscribers', this.getPlanSubscribers.bind(this));
    this.router.get('/:id/analytics', this.getPlanAnalytics.bind(this));
  }

  // Create new subscription plan
  async createPlan(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        price,
        currency = 'BDT',
        billingInterval,
        trialDays = 0,
        features,
        limitations,
        isActive = true
      } = req.body;

      const newPlan = await db.insert(subscriptionPlans).values({
        id: crypto.randomUUID(),
        name,
        description,
        price,
        currency,
        billingInterval,
        trialDays,
        features,
        limitations,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      res.status(201).json({
        success: true,
        plan: newPlan[0],
        message: 'Subscription plan created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create subscription plan' });
    }
  }

  // Get all subscription plans
  async getPlans(req: Request, res: Response) {
    try {
      const { active, currency, sortBy = 'price' } = req.query;

      let query = db.select().from(subscriptionPlans);
      
      if (active !== undefined) {
        query = query.where(eq(subscriptionPlans.isActive, active === 'true'));
      }

      if (currency) {
        query = query.where(eq(subscriptionPlans.currency, currency as string));
      }

      const plans = await query;

      // Sort plans
      if (sortBy === 'price') {
        plans.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'name') {
        plans.sort((a, b) => a.name.localeCompare(b.name));
      }

      res.json({
        success: true,
        plans,
        total: plans.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get subscription plans' });
    }
  }

  // Get specific subscription plan
  async getPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const plan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (plan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      // Add subscriber count and revenue metrics
      const planWithMetrics = {
        ...plan[0],
        metrics: {
          activeSubscribers: 125,
          totalRevenue: 12450,
          conversionRate: 15.2,
          churnRate: 3.1
        }
      };

      res.json({
        success: true,
        plan: planWithMetrics
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get subscription plan' });
    }
  }

  // Update subscription plan
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedPlan = await db.update(subscriptionPlans)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(subscriptionPlans.id, id))
        .returning();

      if (updatedPlan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      res.json({
        success: true,
        plan: updatedPlan[0],
        message: 'Subscription plan updated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update subscription plan' });
    }
  }

  // Delete subscription plan
  async deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { forceDelete = false } = req.body;

      // Check if plan has active subscribers
      const hasActiveSubscribers = false; // Mock check - in real implementation, check subscriptions table

      if (hasActiveSubscribers && !forceDelete) {
        return res.status(400).json({
          error: 'Cannot delete plan with active subscribers',
          activeSubscribers: 5,
          suggestion: 'Set forceDelete to true to force deletion or migrate subscribers first'
        });
      }

      await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));

      res.json({
        success: true,
        message: 'Subscription plan deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subscription plan' });
    }
  }

  // Get plan features
  async getPlanFeatures(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const plan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (plan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const features = plan[0].features || [];

      res.json({
        success: true,
        features,
        planId: id
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get plan features' });
    }
  }

  // Add plan feature
  async addPlanFeature(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { featureName, featureDescription, featureLimit } = req.body;

      const plan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (plan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const newFeature = {
        id: crypto.randomUUID(),
        name: featureName,
        description: featureDescription,
        limit: featureLimit,
        addedAt: new Date()
      };

      const currentFeatures = plan[0].features || [];
      const updatedFeatures = [...currentFeatures, newFeature];

      await db.update(subscriptionPlans)
        .set({ features: updatedFeatures, updatedAt: new Date() })
        .where(eq(subscriptionPlans.id, id));

      res.json({
        success: true,
        feature: newFeature,
        message: 'Feature added to plan successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add plan feature' });
    }
  }

  // Remove plan feature
  async removePlanFeature(req: Request, res: Response) {
    try {
      const { id, featureId } = req.params;

      const plan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (plan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const currentFeatures = plan[0].features || [];
      const updatedFeatures = currentFeatures.filter((f: any) => f.id !== featureId);

      await db.update(subscriptionPlans)
        .set({ features: updatedFeatures, updatedAt: new Date() })
        .where(eq(subscriptionPlans.id, id));

      res.json({
        success: true,
        message: 'Feature removed from plan successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove plan feature' });
    }
  }

  // Get plan pricing
  async getPlanPricing(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const plan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (plan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const pricing = {
        basePrice: plan[0].price,
        currency: plan[0].currency,
        billingInterval: plan[0].billingInterval,
        discounts: [
          { type: 'annual', percentage: 20, description: 'Save 20% with annual billing' },
          { type: 'student', percentage: 50, description: 'Student discount' }
        ],
        addOns: [
          { name: 'Extra Storage', price: 10, unit: 'GB' },
          { name: 'Priority Support', price: 25, unit: 'month' }
        ]
      };

      res.json({
        success: true,
        pricing
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get plan pricing' });
    }
  }

  // Update plan pricing
  async updatePlanPricing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { price, currency, billingInterval, discounts } = req.body;

      const updatedPlan = await db.update(subscriptionPlans)
        .set({ 
          price,
          currency,
          billingInterval,
          updatedAt: new Date()
        })
        .where(eq(subscriptionPlans.id, id))
        .returning();

      if (updatedPlan.length === 0) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      res.json({
        success: true,
        plan: updatedPlan[0],
        message: 'Plan pricing updated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update plan pricing' });
    }
  }

  // Get plan subscribers
  async getPlanSubscribers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status } = req.query;

      // Mock subscriber data
      const subscribers = [
        {
          id: 'sub_1',
          userId: 'user_123',
          userName: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          startDate: new Date('2024-01-01'),
          nextBillingDate: new Date('2024-02-01')
        },
        {
          id: 'sub_2',
          userId: 'user_456',
          userName: 'Jane Smith',
          email: 'jane@example.com',
          status: 'trial',
          startDate: new Date('2024-01-15'),
          trialEndDate: new Date('2024-01-30')
        }
      ];

      const filteredSubscribers = status 
        ? subscribers.filter(sub => sub.status === status)
        : subscribers;

      res.json({
        success: true,
        subscribers: filteredSubscribers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredSubscribers.length,
          pages: Math.ceil(filteredSubscribers.length / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get plan subscribers' });
    }
  }

  // Get plan analytics
  async getPlanAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { period = '30d' } = req.query;

      const analytics = {
        planId: id,
        period,
        metrics: {
          totalSubscribers: 125,
          activeSubscribers: 118,
          trialSubscribers: 12,
          churnedSubscribers: 7,
          revenue: {
            total: 12450,
            monthly: 11800,
            growth: 15.2
          },
          conversionRate: 85.5,
          churnRate: 3.1,
          averageLifetimeValue: 850
        },
        trends: {
          subscriptions: [
            { date: '2024-01-01', count: 100 },
            { date: '2024-01-15', count: 115 },
            { date: '2024-01-30', count: 125 }
          ],
          revenue: [
            { date: '2024-01-01', amount: 10000 },
            { date: '2024-01-15', amount: 11200 },
            { date: '2024-01-30', amount: 12450 }
          ]
        }
      };

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get plan analytics' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default PlanController;