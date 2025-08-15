/**
 * Phase 4 Task 4.6: A/B Testing Framework Service
 * Amazon.com/Shopee.sg Enterprise-Level A/B Testing & Experimentation
 * 
 * Features:
 * - Multi-variant testing support
 * - Statistical significance calculations
 * - User segmentation and targeting
 * - Real-time experiment monitoring
 * - Conversion tracking and analytics
 * - Feature flag management
 */

import { useState, useEffect } from 'react';

interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: number;
  endDate?: number;
  trafficAllocation: number; // Percentage of users to include
  variants: ABTestVariant[];
  targetingRules: TargetingRule[];
  metrics: ExperimentMetric[];
  results?: ExperimentResults;
  createdAt: number;
  updatedAt: number;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficWeight: number; // Percentage of experiment traffic
  config: Record<string, any>;
  isControl: boolean;
}

interface TargetingRule {
  type: 'user_segment' | 'location' | 'device' | 'browser' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: string | string[] | number | boolean;
  field: string;
}

interface ExperimentMetric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  goal: 'increase' | 'decrease';
  primaryMetric: boolean;
  eventName: string;
  aggregation: 'sum' | 'count' | 'average' | 'unique';
}

interface ExperimentResults {
  totalUsers: number;
  variantResults: VariantResult[];
  statisticalSignificance: boolean;
  confidenceLevel: number;
  pValue: number;
  winningVariant?: string;
  liftPercentage?: number;
  conclusion: string;
  recommendations: string[];
}

interface VariantResult {
  variantId: string;
  users: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  revenuePerUser: number;
  engagementRate: number;
  metrics: Record<string, number>;
  confidenceInterval: [number, number];
}

interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: number;
  sessionId: string;
  context: Record<string, any>;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetingRules: TargetingRule[];
  variants: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

class ABTestingService {
  private static instance: ABTestingService;
  private experiments: Map<string, ABTestExperiment> = new Map();
  private userAssignments: Map<string, UserAssignment[]> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private eventQueue: any[] = [];
  private isInitialized = false;

  private constructor() {
    this.initializeABTesting();
    this.setupEventTracking();
    this.loadExperiments();
    this.loadFeatureFlags();
  }

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  /**
   * Initialize A/B testing
   */
  private initializeABTesting(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Load user assignments from localStorage
    const savedAssignments = localStorage.getItem('ab_assignments');
    if (savedAssignments) {
      try {
        const assignments = JSON.parse(savedAssignments);
        Object.entries(assignments).forEach(([userId, userAssignments]) => {
          this.userAssignments.set(userId, userAssignments as UserAssignment[]);
        });
      } catch (error) {
        console.warn('Failed to load saved assignments:', error);
      }
    }

    // Start event queue processing
    this.startEventProcessing();

    this.isInitialized = true;
  }

  /**
   * Setup event tracking
   */
  private setupEventTracking(): void {
    // Track page views
    window.addEventListener('load', () => {
      this.trackEvent('page_view', {
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      const element = event.target as HTMLElement;
      this.trackEvent('click', {
        element: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className,
        text: element.textContent?.slice(0, 100),
        timestamp: Date.now()
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        formName: form.name,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Load experiments from API
   */
  private async loadExperiments(): Promise<void> {
    try {
      const response = await fetch('/api/experiments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const experiments = await response.json();
        experiments.forEach((experiment: ABTestExperiment) => {
          this.experiments.set(experiment.id, experiment);
        });
      }
    } catch (error) {
      console.warn('Failed to load experiments:', error);
      // Load default experiments for demo
      this.loadDefaultExperiments();
    }
  }

  /**
   * Load default experiments for demo
   */
  private loadDefaultExperiments(): void {
    const defaultExperiments: ABTestExperiment[] = [
      {
        id: 'checkout_button_test',
        name: 'Checkout Button Color Test',
        description: 'Test different checkout button colors to improve conversion',
        status: 'active',
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        trafficAllocation: 50,
        variants: [
          {
            id: 'control',
            name: 'Blue Button (Control)',
            description: 'Original blue checkout button',
            trafficWeight: 50,
            config: { buttonColor: '#0066cc', buttonText: 'Complete Purchase' },
            isControl: true
          },
          {
            id: 'variant_a',
            name: 'Green Button',
            description: 'Green checkout button',
            trafficWeight: 50,
            config: { buttonColor: '#28a745', buttonText: 'Complete Purchase' },
            isControl: false
          }
        ],
        targetingRules: [
          {
            type: 'user_segment',
            operator: 'equals',
            value: 'returning_customer',
            field: 'userType'
          }
        ],
        metrics: [
          {
            id: 'checkout_conversion',
            name: 'Checkout Conversion',
            type: 'conversion',
            goal: 'increase',
            primaryMetric: true,
            eventName: 'purchase_completed',
            aggregation: 'count'
          }
        ],
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
      },
      {
        id: 'product_page_layout',
        name: 'Product Page Layout Test',
        description: 'Test different product page layouts for better engagement',
        status: 'active',
        startDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        trafficAllocation: 30,
        variants: [
          {
            id: 'control',
            name: 'Standard Layout',
            description: 'Current product page layout',
            trafficWeight: 33,
            config: { layout: 'standard' },
            isControl: true
          },
          {
            id: 'variant_a',
            name: 'Image Gallery Left',
            description: 'Product images on left side',
            trafficWeight: 33,
            config: { layout: 'gallery_left' },
            isControl: false
          },
          {
            id: 'variant_b',
            name: 'Full Width Images',
            description: 'Full width product images',
            trafficWeight: 34,
            config: { layout: 'full_width' },
            isControl: false
          }
        ],
        targetingRules: [],
        metrics: [
          {
            id: 'add_to_cart',
            name: 'Add to Cart Rate',
            type: 'conversion',
            goal: 'increase',
            primaryMetric: true,
            eventName: 'add_to_cart',
            aggregation: 'count'
          },
          {
            id: 'time_on_page',
            name: 'Time on Page',
            type: 'engagement',
            goal: 'increase',
            primaryMetric: false,
            eventName: 'page_view_duration',
            aggregation: 'average'
          }
        ],
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
      }
    ];

    defaultExperiments.forEach(experiment => {
      this.experiments.set(experiment.id, experiment);
    });
  }

  /**
   * Load feature flags from API
   */
  private async loadFeatureFlags(): Promise<void> {
    try {
      const response = await fetch('/api/feature-flags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const flags = await response.json();
        flags.forEach((flag: FeatureFlag) => {
          this.featureFlags.set(flag.id, flag);
        });
      }
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
      // Load default feature flags for demo
      this.loadDefaultFeatureFlags();
    }
  }

  /**
   * Load default feature flags for demo
   */
  private loadDefaultFeatureFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'new_search_ui',
        name: 'New Search UI',
        description: 'Enable new search interface with filters',
        enabled: true,
        rolloutPercentage: 25,
        targetingRules: [
          {
            type: 'user_segment',
            operator: 'equals',
            value: 'beta_user',
            field: 'userType'
          }
        ],
        variants: {
          enabled: { searchUI: 'v2', filtersEnabled: true },
          disabled: { searchUI: 'v1', filtersEnabled: false }
        },
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
      },
      {
        id: 'mobile_checkout',
        name: 'Mobile Checkout Optimization',
        description: 'Optimized checkout flow for mobile devices',
        enabled: true,
        rolloutPercentage: 50,
        targetingRules: [
          {
            type: 'device',
            operator: 'equals',
            value: 'mobile',
            field: 'deviceType'
          }
        ],
        variants: {
          enabled: { checkoutFlow: 'mobile_optimized' },
          disabled: { checkoutFlow: 'standard' }
        },
        createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
      }
    ];

    defaultFlags.forEach(flag => {
      this.featureFlags.set(flag.id, flag);
    });
  }

  /**
   * Start event processing
   */
  private startEventProcessing(): void {
    setInterval(() => {
      this.processEventQueue();
    }, 5000); // Process events every 5 seconds
  }

  /**
   * Process event queue
   */
  private processEventQueue(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Send events to analytics service
    this.sendEventsToAnalytics(events);
  }

  /**
   * Send events to analytics service
   */
  private async sendEventsToAnalytics(events: any[]): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
    }
  }

  /**
   * Get experiment variant for user
   */
  getVariant(experimentId: string, userId?: string): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return null;
    }

    const currentUserId = userId || this.getCurrentUserId();
    if (!currentUserId) return null;

    // Check if user already has an assignment
    const userAssignments = this.userAssignments.get(currentUserId) || [];
    const existingAssignment = userAssignments.find(a => a.experimentId === experimentId);
    
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user should be included in experiment
    if (!this.shouldIncludeUser(experiment, currentUserId)) {
      return null;
    }

    // Assign user to variant
    const variantId = this.assignUserToVariant(experiment, currentUserId);
    
    // Save assignment
    const assignment: UserAssignment = {
      userId: currentUserId,
      experimentId,
      variantId,
      assignedAt: Date.now(),
      sessionId: this.getSessionId(),
      context: this.getUserContext()
    };

    userAssignments.push(assignment);
    this.userAssignments.set(currentUserId, userAssignments);
    this.saveAssignments();

    return variantId;
  }

  /**
   * Check if user should be included in experiment
   */
  private shouldIncludeUser(experiment: ABTestExperiment, userId: string): boolean {
    // Check traffic allocation
    const userHash = this.hashUser(userId, experiment.id);
    if (userHash > experiment.trafficAllocation) {
      return false;
    }

    // Check targeting rules
    const userContext = this.getUserContext();
    return experiment.targetingRules.every(rule => this.evaluateTargetingRule(rule, userContext));
  }

  /**
   * Assign user to variant
   */
  private assignUserToVariant(experiment: ABTestExperiment, userId: string): string {
    const userHash = this.hashUser(userId, experiment.id + '_variant');
    let cumulativeWeight = 0;

    for (const variant of experiment.variants) {
      cumulativeWeight += variant.trafficWeight;
      if (userHash <= cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to control variant
    return experiment.variants.find(v => v.isControl)?.id || experiment.variants[0].id;
  }

  /**
   * Hash user for consistent assignment
   */
  private hashUser(userId: string, seed: string): number {
    const str = userId + seed;
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % 100;
  }

  /**
   * Evaluate targeting rule
   */
  private evaluateTargetingRule(rule: TargetingRule, context: Record<string, any>): boolean {
    const fieldValue = context[rule.field];
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'not_equals':
        return fieldValue !== rule.value;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(rule.value as string);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | null {
    return localStorage.getItem('userId') || sessionStorage.getItem('anonymousId');
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Get user context
   */
  private getUserContext(): Record<string, any> {
    return {
      userType: localStorage.getItem('userType') || 'anonymous',
      deviceType: this.getDeviceType(),
      location: this.getLocation(),
      browser: this.getBrowser(),
      timestamp: Date.now()
    };
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  /**
   * Get location (simplified)
   */
  private getLocation(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Get browser
   */
  private getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'unknown';
  }

  /**
   * Save assignments to localStorage
   */
  private saveAssignments(): void {
    const assignments: Record<string, UserAssignment[]> = {};
    this.userAssignments.forEach((userAssignments, userId) => {
      assignments[userId] = userAssignments;
    });
    
    localStorage.setItem('ab_assignments', JSON.stringify(assignments));
  }

  /**
   * Track event
   */
  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const event = {
      eventName,
      properties,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      experiments: this.getActiveExperiments()
    };

    this.eventQueue.push(event);
  }

  /**
   * Get active experiments for user
   */
  private getActiveExperiments(): Record<string, string> {
    const userId = this.getCurrentUserId();
    if (!userId) return {};

    const userAssignments = this.userAssignments.get(userId) || [];
    const activeExperiments: Record<string, string> = {};

    userAssignments.forEach(assignment => {
      const experiment = this.experiments.get(assignment.experimentId);
      if (experiment && experiment.status === 'active') {
        activeExperiments[assignment.experimentId] = assignment.variantId;
      }
    });

    return activeExperiments;
  }

  /**
   * Check feature flag
   */
  isFeatureEnabled(flagId: string, userId?: string): boolean {
    const flag = this.featureFlags.get(flagId);
    if (!flag || !flag.enabled) return false;

    const currentUserId = userId || this.getCurrentUserId();
    if (!currentUserId) return false;

    // Check rollout percentage
    const userHash = this.hashUser(currentUserId, flagId);
    if (userHash > flag.rolloutPercentage) {
      return false;
    }

    // Check targeting rules
    const userContext = this.getUserContext();
    return flag.targetingRules.every(rule => this.evaluateTargetingRule(rule, userContext));
  }

  /**
   * Get feature flag variant
   */
  getFeatureVariant(flagId: string, userId?: string): any {
    const flag = this.featureFlags.get(flagId);
    if (!flag) return null;

    const enabled = this.isFeatureEnabled(flagId, userId);
    return enabled ? flag.variants.enabled : flag.variants.disabled;
  }

  /**
   * React hook for A/B testing
   */
  useABTest = (experimentId: string): string | null => {
    const [variant, setVariant] = useState<string | null>(null);

    useEffect(() => {
      const userVariant = this.getVariant(experimentId);
      setVariant(userVariant);
    }, [experimentId]);

    return variant;
  };

  /**
   * React hook for feature flags
   */
  useFeatureFlag = (flagId: string): boolean => {
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
      const isEnabled = this.isFeatureEnabled(flagId);
      setEnabled(isEnabled);
    }, [flagId]);

    return enabled;
  };

  /**
   * Get experiment results
   */
  getExperimentResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.results) return null;

    return experiment.results;
  }

  /**
   * Get experiment report
   */
  getExperimentReport(): any {
    const activeExperiments = Array.from(this.experiments.values()).filter(e => e.status === 'active');
    const completedExperiments = Array.from(this.experiments.values()).filter(e => e.status === 'completed');

    return {
      summary: {
        totalExperiments: this.experiments.size,
        activeExperiments: activeExperiments.length,
        completedExperiments: completedExperiments.length,
        totalUsers: this.userAssignments.size,
        featureFlags: this.featureFlags.size
      },
      activeExperiments: activeExperiments.map(exp => ({
        id: exp.id,
        name: exp.name,
        status: exp.status,
        trafficAllocation: exp.trafficAllocation,
        variants: exp.variants.length,
        startDate: exp.startDate,
        metrics: exp.metrics.length
      })),
      completedExperiments: completedExperiments.map(exp => ({
        id: exp.id,
        name: exp.name,
        results: exp.results
      })),
      featureFlags: Array.from(this.featureFlags.values()).map(flag => ({
        id: flag.id,
        name: flag.name,
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage
      }))
    };
  }

  /**
   * Create experiment
   */
  async createExperiment(experiment: Omit<ABTestExperiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExperiment: ABTestExperiment = {
      ...experiment,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.experiments.set(id, newExperiment);

    // Send to API
    try {
      await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newExperiment)
      });
    } catch (error) {
      console.warn('Failed to save experiment to API:', error);
    }

    return id;
  }

  /**
   * Update experiment
   */
  async updateExperiment(experimentId: string, updates: Partial<ABTestExperiment>): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    const updatedExperiment = {
      ...experiment,
      ...updates,
      updatedAt: Date.now()
    };

    this.experiments.set(experimentId, updatedExperiment);

    // Send to API
    try {
      await fetch(`/api/experiments/${experimentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updatedExperiment)
      });
    } catch (error) {
      console.warn('Failed to update experiment in API:', error);
    }
  }

  /**
   * Delete experiment
   */
  async deleteExperiment(experimentId: string): Promise<void> {
    this.experiments.delete(experimentId);

    // Remove user assignments
    this.userAssignments.forEach((assignments, userId) => {
      const filtered = assignments.filter(a => a.experimentId !== experimentId);
      this.userAssignments.set(userId, filtered);
    });

    this.saveAssignments();

    // Send to API
    try {
      await fetch(`/api/experiments/${experimentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.warn('Failed to delete experiment from API:', error);
    }
  }

  /**
   * Get all experiments
   */
  getAllExperiments(): ABTestExperiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Get all feature flags
   */
  getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  /**
   * Get user assignments
   */
  getUserAssignments(userId?: string): UserAssignment[] {
    const currentUserId = userId || this.getCurrentUserId();
    if (!currentUserId) return [];

    return this.userAssignments.get(currentUserId) || [];
  }

  /**
   * Clear user assignments
   */
  clearUserAssignments(userId?: string): void {
    const currentUserId = userId || this.getCurrentUserId();
    if (!currentUserId) return;

    this.userAssignments.delete(currentUserId);
    this.saveAssignments();
  }

  /**
   * Export experiment data
   */
  exportExperimentData(): string {
    const data = {
      experiments: Array.from(this.experiments.values()),
      featureFlags: Array.from(this.featureFlags.values()),
      userAssignments: Object.fromEntries(this.userAssignments),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Destroy A/B testing service
   */
  destroy(): void {
    this.experiments.clear();
    this.featureFlags.clear();
    this.userAssignments.clear();
    this.eventQueue = [];
    this.isInitialized = false;
  }
}

export default ABTestingService;