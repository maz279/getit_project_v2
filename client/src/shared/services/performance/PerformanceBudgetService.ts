/**
 * Performance Budget Service
 * Amazon.com/Shopee.sg-Level Performance Budget Management
 * Enforces performance budgets and tracks violations
 */

interface PerformanceBudget {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  warning: number;
  unit: string;
  enabled: boolean;
  category: 'timing' | 'size' | 'count';
}

interface BudgetViolation {
  budgetId: string;
  budgetName: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error';
  timestamp: number;
  url: string;
  userAgent: string;
}

interface BudgetReport {
  budgets: PerformanceBudget[];
  violations: BudgetViolation[];
  score: number;
  timestamp: number;
  complianceRate: number;
}

class PerformanceBudgetService {
  private static instance: PerformanceBudgetService;
  private budgets: Map<string, PerformanceBudget>;
  private violations: BudgetViolation[];
  private monitoring: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.budgets = new Map();
    this.violations = [];
    this.initializeDefaultBudgets();
  }

  static getInstance(): PerformanceBudgetService {
    if (!PerformanceBudgetService.instance) {
      PerformanceBudgetService.instance = new PerformanceBudgetService();
    }
    return PerformanceBudgetService.instance;
  }

  /**
   * Initialize Amazon.com/Shopee.sg performance budgets
   */
  private initializeDefaultBudgets(): void {
    const defaultBudgets: PerformanceBudget[] = [
      {
        id: 'fcp',
        name: 'First Contentful Paint',
        metric: 'FCP',
        threshold: 1000,
        warning: 800,
        unit: 'ms',
        enabled: true,
        category: 'timing'
      },
      {
        id: 'lcp',
        name: 'Largest Contentful Paint',
        metric: 'LCP',
        threshold: 2500,
        warning: 2000,
        unit: 'ms',
        enabled: true,
        category: 'timing'
      },
      {
        id: 'tti',
        name: 'Time to Interactive',
        metric: 'TTI',
        threshold: 3000,
        warning: 2500,
        unit: 'ms',
        enabled: true,
        category: 'timing'
      },
      {
        id: 'cls',
        name: 'Cumulative Layout Shift',
        metric: 'CLS',
        threshold: 0.1,
        warning: 0.05,
        unit: 'score',
        enabled: true,
        category: 'timing'
      },
      {
        id: 'fid',
        name: 'First Input Delay',
        metric: 'FID',
        threshold: 100,
        warning: 50,
        unit: 'ms',
        enabled: true,
        category: 'timing'
      },
      {
        id: 'ttfb',
        name: 'Time to First Byte',
        metric: 'TTFB',
        threshold: 200,
        warning: 150,
        unit: 'ms',
        enabled: true,
        category: 'timing'
      },
      {
        id: 'bundle_size',
        name: 'Bundle Size',
        metric: 'BUNDLE_SIZE',
        threshold: 500,
        warning: 400,
        unit: 'KB',
        enabled: true,
        category: 'size'
      },
      {
        id: 'image_count',
        name: 'Image Count',
        metric: 'IMAGE_COUNT',
        threshold: 50,
        warning: 40,
        unit: 'count',
        enabled: true,
        category: 'count'
      },
      {
        id: 'dom_nodes',
        name: 'DOM Nodes',
        metric: 'DOM_NODES',
        threshold: 1500,
        warning: 1200,
        unit: 'count',
        enabled: true,
        category: 'count'
      }
    ];

    defaultBudgets.forEach(budget => {
      this.budgets.set(budget.id, budget);
    });
  }

  /**
   * Start performance budget monitoring
   */
  public startMonitoring(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.checkInterval = setInterval(() => {
      this.checkBudgets();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop performance budget monitoring
   */
  public stopMonitoring(): void {
    if (!this.monitoring) return;
    
    this.monitoring = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check all budgets for violations
   */
  private checkBudgets(): void {
    this.budgets.forEach(budget => {
      if (!budget.enabled) return;
      
      const value = this.getMetricValue(budget.metric);
      if (value !== null) {
        this.checkBudgetViolation(budget, value);
      }
    });
  }

  /**
   * Get current value for a metric
   */
  private getMetricValue(metric: string): number | null {
    switch (metric) {
      case 'FCP':
        return this.getPerformanceEntryValue('paint', 'first-contentful-paint');
      case 'LCP':
        return this.getPerformanceEntryValue('largest-contentful-paint');
      case 'TTI':
        return this.estimateTTI();
      case 'CLS':
        return this.calculateCLS();
      case 'FID':
        return this.getPerformanceEntryValue('first-input');
      case 'TTFB':
        return this.getTTFB();
      case 'BUNDLE_SIZE':
        return this.estimateBundleSize();
      case 'IMAGE_COUNT':
        return this.countImages();
      case 'DOM_NODES':
        return this.countDOMNodes();
      default:
        return null;
    }
  }

  /**
   * Get performance entry value
   */
  private getPerformanceEntryValue(entryType: string, name?: string): number | null {
    const entries = performance.getEntriesByType(entryType);
    
    if (name) {
      const entry = entries.find(e => e.name === name);
      return entry ? entry.startTime : null;
    }
    
    return entries.length > 0 ? entries[entries.length - 1].startTime : null;
  }

  /**
   * Estimate Time to Interactive (TTI)
   */
  private estimateTTI(): number | null {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      return navigationEntry.domComplete - navigationEntry.fetchStart;
    }
    
    return null;
  }

  /**
   * Calculate Cumulative Layout Shift (CLS)
   */
  private calculateCLS(): number | null {
    // This would need to be tracked over time
    // For now, return a placeholder
    return 0;
  }

  /**
   * Get Time to First Byte (TTFB)
   */
  private getTTFB(): number | null {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      return navigationEntry.responseStart - navigationEntry.fetchStart;
    }
    
    return null;
  }

  /**
   * Estimate bundle size
   */
  private estimateBundleSize(): number | null {
    // Get all resource entries
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    
    resources.forEach(resource => {
      const resourceTiming = resource as PerformanceResourceTiming;
      if (resourceTiming.transferSize) {
        totalSize += resourceTiming.transferSize;
      }
    });
    
    return totalSize / 1024; // Convert to KB
  }

  /**
   * Count images
   */
  private countImages(): number {
    return document.querySelectorAll('img').length;
  }

  /**
   * Count DOM nodes
   */
  private countDOMNodes(): number {
    return document.querySelectorAll('*').length;
  }

  /**
   * Check for budget violation
   */
  private checkBudgetViolation(budget: PerformanceBudget, value: number): void {
    let severity: 'warning' | 'error' | null = null;
    
    if (value > budget.threshold) {
      severity = 'error';
    } else if (value > budget.warning) {
      severity = 'warning';
    }
    
    if (severity) {
      this.logViolation(budget, value, severity);
    }
  }

  /**
   * Log budget violation
   */
  private logViolation(budget: PerformanceBudget, value: number, severity: 'warning' | 'error'): void {
    const violation: BudgetViolation = {
      budgetId: budget.id,
      budgetName: budget.name,
      metric: budget.metric,
      value,
      threshold: severity === 'error' ? budget.threshold : budget.warning,
      severity,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Check if this violation already exists recently
    const recentViolation = this.violations.find(v => 
      v.budgetId === budget.id && 
      v.severity === severity &&
      Date.now() - v.timestamp < 10000 // Within 10 seconds
    );

    if (!recentViolation) {
      this.violations.push(violation);
      
      // Limit violations array size
      if (this.violations.length > 200) {
        this.violations = this.violations.slice(-100);
      }

      // Log to console
      const message = `Performance Budget ${severity}: ${budget.name} = ${value.toFixed(2)}${budget.unit} (threshold: ${violation.threshold}${budget.unit})`;
      if (severity === 'error') {
        console.error(message);
      } else {
        console.warn(message);
      }
    }
  }

  /**
   * Add custom budget
   */
  public addBudget(budget: PerformanceBudget): void {
    this.budgets.set(budget.id, budget);
  }

  /**
   * Remove budget
   */
  public removeBudget(budgetId: string): void {
    this.budgets.delete(budgetId);
  }

  /**
   * Update budget
   */
  public updateBudget(budgetId: string, updates: Partial<PerformanceBudget>): void {
    const budget = this.budgets.get(budgetId);
    if (budget) {
      this.budgets.set(budgetId, { ...budget, ...updates });
    }
  }

  /**
   * Get all budgets
   */
  public getBudgets(): PerformanceBudget[] {
    return Array.from(this.budgets.values());
  }

  /**
   * Get budget by ID
   */
  public getBudget(budgetId: string): PerformanceBudget | undefined {
    return this.budgets.get(budgetId);
  }

  /**
   * Get violations
   */
  public getViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  /**
   * Get compliance rate
   */
  public getComplianceRate(): number {
    const enabledBudgets = this.getBudgets().filter(b => b.enabled);
    const violatedBudgets = new Set(this.violations.map(v => v.budgetId));
    
    if (enabledBudgets.length === 0) return 100;
    
    const compliantBudgets = enabledBudgets.filter(b => !violatedBudgets.has(b.id));
    return (compliantBudgets.length / enabledBudgets.length) * 100;
  }

  /**
   * Get budget report
   */
  public getBudgetReport(): BudgetReport {
    const budgets = this.getBudgets();
    const violations = this.getViolations();
    const complianceRate = this.getComplianceRate();
    
    return {
      budgets,
      violations,
      score: complianceRate,
      timestamp: Date.now(),
      complianceRate
    };
  }

  /**
   * Clear violations
   */
  public clearViolations(): void {
    this.violations = [];
  }

  /**
   * Enable/disable budget
   */
  public toggleBudget(budgetId: string, enabled: boolean): void {
    const budget = this.budgets.get(budgetId);
    if (budget) {
      budget.enabled = enabled;
    }
  }
}

export default PerformanceBudgetService;