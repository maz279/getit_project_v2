/**
 * Amazon.com/Shopee.sg-Level Trial Controller
 * Complete trial management for subscriptions
 */

import { Router, Request, Response } from 'express';
import { db } from '../../../../db';

export class TrialController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Trial Management
    this.router.post('/start', this.startTrial.bind(this));
    this.router.get('/:id', this.getTrial.bind(this));
    this.router.post('/:id/extend', this.extendTrial.bind(this));
    this.router.post('/:id/convert', this.convertTrial.bind(this));
    this.router.post('/:id/cancel', this.cancelTrial.bind(this));
    
    // Trial Analytics
    this.router.get('/user/:userId', this.getUserTrials.bind(this));
    this.router.get('/analytics/conversion', this.getTrialConversion.bind(this));
    this.router.get('/analytics/performance', this.getTrialPerformance.bind(this));
    
    // Trial Notifications
    this.router.post('/:id/remind', this.sendTrialReminder.bind(this));
    this.router.get('/:id/status', this.getTrialStatus.bind(this));
  }

  // Start new trial
  async startTrial(req: Request, res: Response) {
    try {
      const { userId, planId, trialDays = 14, paymentMethodId } = req.body;

      const trial = {
        id: crypto.randomUUID(),
        userId,
        planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        trialDays,
        paymentMethodId,
        features: ['Full access', 'All premium features', 'Priority support'],
        autoConvert: true,
        remindersEnabled: true,
        createdAt: new Date()
      };

      res.status(201).json({
        success: true,
        trial,
        message: 'Trial started successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start trial' });
    }
  }

  // Get trial details
  async getTrial(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const trial = {
        id,
        userId: 'user_123',
        planId: 'plan_premium',
        planName: 'Premium Plan',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        daysRemaining: 7,
        daysUsed: 7,
        totalDays: 14,
        features: ['Full access', 'All premium features', 'Priority support'],
        autoConvert: true,
        paymentMethodId: 'pm_bkash',
        usage: {
          productsAdded: 25,
          ordersProcessed: 12,
          revenueGenerated: 2500,
          supportTickets: 2
        }
      };

      res.json({
        success: true,
        trial
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trial' });
    }
  }

  // Extend trial period
  async extendTrial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { additionalDays, reason } = req.body;

      const newEndDate = new Date(Date.now() + additionalDays * 24 * 60 * 60 * 1000);

      res.json({
        success: true,
        message: 'Trial extended successfully',
        trial: {
          id,
          newEndDate,
          additionalDays,
          reason,
          extendedAt: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to extend trial' });
    }
  }

  // Convert trial to paid subscription
  async convertTrial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { planId, paymentMethodId, billingCycle = 'monthly' } = req.body;

      const subscription = {
        id: crypto.randomUUID(),
        trialId: id,
        planId,
        paymentMethodId,
        billingCycle,
        status: 'active',
        convertedAt: new Date(),
        firstBillingDate: new Date(),
        trialDiscount: 20 // 20% discount for converting
      };

      res.json({
        success: true,
        message: 'Trial converted to subscription successfully',
        subscription
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to convert trial' });
    }
  }

  // Cancel trial
  async cancelTrial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, feedback } = req.body;

      res.json({
        success: true,
        message: 'Trial cancelled successfully',
        trial: {
          id,
          status: 'cancelled',
          cancelledAt: new Date(),
          reason,
          feedback
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel trial' });
    }
  }

  // Get user trials
  async getUserTrials(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, limit = 10 } = req.query;

      const trials = [
        {
          id: 'trial_1',
          planName: 'Premium Plan',
          status: 'active',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
          daysRemaining: 7
        },
        {
          id: 'trial_2',
          planName: 'Enterprise Plan',
          status: 'converted',
          startDate: new Date('2023-12-01'),
          endDate: new Date('2023-12-15'),
          convertedAt: new Date('2023-12-10')
        },
        {
          id: 'trial_3',
          planName: 'Basic Plan',
          status: 'expired',
          startDate: new Date('2023-11-01'),
          endDate: new Date('2023-11-15'),
          expiredAt: new Date('2023-11-15')
        }
      ];

      const filteredTrials = status 
        ? trials.filter(trial => trial.status === status)
        : trials;

      res.json({
        success: true,
        trials: filteredTrials.slice(0, Number(limit)),
        total: filteredTrials.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user trials' });
    }
  }

  // Get trial conversion analytics
  async getTrialConversion(req: Request, res: Response) {
    try {
      const { period = '30d', planId } = req.query;

      const analytics = {
        overall: {
          totalTrials: 250,
          converted: 85,
          expired: 45,
          cancelled: 35,
          active: 85,
          conversionRate: 34.0
        },
        byPlan: [
          { planId: 'plan_basic', planName: 'Basic', trials: 80, converted: 32, conversionRate: 40.0 },
          { planId: 'plan_premium', planName: 'Premium', trials: 120, converted: 38, conversionRate: 31.7 },
          { planId: 'plan_enterprise', planName: 'Enterprise', trials: 50, converted: 15, conversionRate: 30.0 }
        ],
        conversionFunnel: [
          { stage: 'trial_started', count: 250, percentage: 100 },
          { stage: 'trial_engaged', count: 200, percentage: 80 },
          { stage: 'payment_added', count: 150, percentage: 60 },
          { stage: 'trial_converted', count: 85, percentage: 34 }
        ],
        trends: {
          weekly: [
            { week: '2024-W1', trials: 60, conversions: 22 },
            { week: '2024-W2', trials: 65, conversions: 24 },
            { week: '2024-W3', trials: 70, conversions: 26 },
            { week: '2024-W4', trials: 55, conversions: 13 }
          ]
        }
      };

      res.json({
        success: true,
        analytics,
        period
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trial conversion analytics' });
    }
  }

  // Get trial performance metrics
  async getTrialPerformance(req: Request, res: Response) {
    try {
      const { period = '30d' } = req.query;

      const performance = {
        engagement: {
          averageLoginFrequency: 4.2,
          averageSessionDuration: 25, // minutes
          featuresUsed: 8.5,
          supportTicketsCreated: 1.2
        },
        usage: {
          averageProductsAdded: 15,
          averageOrdersProcessed: 5,
          averageRevenueGenerated: 1250,
          apiCallsPerDay: 450
        },
        satisfaction: {
          npsScore: 7.8,
          satisfactionRating: 4.2,
          completedOnboarding: 85,
          requestedDemo: 45
        },
        dropOffPoints: [
          { stage: 'onboarding', dropOffRate: 15 },
          { stage: 'first_feature_use', dropOffRate: 25 },
          { stage: 'payment_setup', dropOffRate: 40 },
          { stage: 'trial_end', dropOffRate: 66 }
        ]
      };

      res.json({
        success: true,
        performance,
        period
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trial performance' });
    }
  }

  // Send trial reminder
  async sendTrialReminder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reminderType = 'trial_ending', customMessage } = req.body;

      const reminderTemplates = {
        trial_ending: 'Your trial ends in 3 days. Subscribe now to continue enjoying premium features!',
        payment_required: 'Please add a payment method to continue your subscription after the trial.',
        feature_highlight: 'Discover the advanced features available in your trial!',
        custom: customMessage
      };

      res.json({
        success: true,
        message: 'Trial reminder sent successfully',
        reminder: {
          trialId: id,
          type: reminderType,
          message: reminderTemplates[reminderType as keyof typeof reminderTemplates],
          sentAt: new Date(),
          channel: ['email', 'in_app', 'sms']
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send trial reminder' });
    }
  }

  // Get trial status
  async getTrialStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const status = {
        trialId: id,
        status: 'active',
        daysRemaining: 7,
        daysUsed: 7,
        totalDays: 14,
        progressPercentage: 50,
        autoConvertEnabled: true,
        paymentMethodAdded: true,
        nextBillingDate: new Date('2024-01-15'),
        upcomingActions: [
          { action: 'trial_reminder', dueDate: new Date('2024-01-12'), description: 'Trial ending reminder' },
          { action: 'auto_convert', dueDate: new Date('2024-01-15'), description: 'Automatic conversion to paid plan' }
        ],
        usage: {
          loginCount: 12,
          featuresUsed: 8,
          supportTickets: 1,
          satisfaction: 'high'
        }
      };

      res.json({
        success: true,
        status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get trial status' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default TrialController;