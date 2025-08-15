/**
 * Core Web Vitals Service
 * Amazon.com/Shopee.sg-Level Core Web Vitals Monitoring
 * Real-time tracking of all Google Core Web Vitals metrics
 */

interface CoreWebVitalsData {
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  TTI: number | null; // Time to Interactive
  TTFB: number | null; // Time to First Byte
}

interface VitalsThresholds {
  good: number;
  needsImprovement: number;
  poor: number;
}

interface VitalsReport {
  metrics: CoreWebVitalsData;
  scores: Record<string, number>;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: number;
  url: string;
  userAgent: string;
}

interface VitalsHistory {
  timestamp: number;
  metrics: CoreWebVitalsData;
  score: number;
}

class CoreWebVitalsService {
  private static instance: CoreWebVitalsService;
  private vitals: CoreWebVitalsData;
  private thresholds: Record<string, VitalsThresholds>;
  private history: VitalsHistory[];
  private observers: Map<string, PerformanceObserver>;
  private monitoring: boolean = false;
  private clsValue: number = 0;
  private clsEntries: any[] = [];

  private constructor() {
    this.vitals = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTI: null,
      TTFB: null
    };

    // Google Core Web Vitals thresholds
    this.thresholds = {
      FCP: { good: 1800, needsImprovement: 3000, poor: 3000 },
      LCP: { good: 2500, needsImprovement: 4000, poor: 4000 },
      FID: { good: 100, needsImprovement: 300, poor: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25, poor: 0.25 },
      TTI: { good: 3800, needsImprovement: 7300, poor: 7300 },
      TTFB: { good: 800, needsImprovement: 1800, poor: 1800 }
    };

    this.history = [];
    this.observers = new Map();
  }

  static getInstance(): CoreWebVitalsService {
    if (!CoreWebVitalsService.instance) {
      CoreWebVitalsService.instance = new CoreWebVitalsService();
    }
    return CoreWebVitalsService.instance;
  }

  /**
   * Start Core Web Vitals monitoring
   */
  public startMonitoring(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.setupObservers();
    this.measureInitialMetrics();
  }

  /**
   * Stop Core Web Vitals monitoring
   */
  public stopMonitoring(): void {
    if (!this.monitoring) return;
    
    this.monitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Setup performance observers for all Core Web Vitals
   */
  private setupObservers(): void {
    if (!window.PerformanceObserver) return;

    // First Contentful Paint (FCP)
    this.setupFCPObserver();
    
    // Largest Contentful Paint (LCP)
    this.setupLCPObserver();
    
    // First Input Delay (FID)
    this.setupFIDObserver();
    
    // Cumulative Layout Shift (CLS)
    this.setupCLSObserver();
    
    // Navigation timing for TTFB
    this.setupNavigationObserver();
  }

  /**
   * Setup First Contentful Paint observer
   */
  private setupFCPObserver(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.vitals.FCP = entry.startTime;
            this.onMetricUpdate('FCP', entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FCP', observer);
    } catch (error) {
      console.warn('FCP observer setup failed:', error);
    }
  }

  /**
   * Setup Largest Contentful Paint observer
   */
  private setupLCPObserver(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          this.vitals.LCP = lastEntry.startTime;
          this.onMetricUpdate('LCP', lastEntry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (error) {
      console.warn('LCP observer setup failed:', error);
    }
  }

  /**
   * Setup First Input Delay observer
   */
  private setupFIDObserver(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any;
          const fidValue = fidEntry.processingStart - fidEntry.startTime;
          
          this.vitals.FID = fidValue;
          this.onMetricUpdate('FID', fidValue);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    } catch (error) {
      console.warn('FID observer setup failed:', error);
    }
  }

  /**
   * Setup Cumulative Layout Shift observer
   */
  private setupCLSObserver(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach(entry => {
          const clsEntry = entry as any;
          
          // Only count layout shifts that don't have recent user input
          if (!clsEntry.hadRecentInput) {
            this.clsValue += clsEntry.value;
            this.clsEntries.push(clsEntry);
          }
        });
        
        this.vitals.CLS = this.clsValue;
        this.onMetricUpdate('CLS', this.clsValue);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (error) {
      console.warn('CLS observer setup failed:', error);
    }
  }

  /**
   * Setup navigation timing observer
   */
  private setupNavigationObserver(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach(entry => {
          const navigationEntry = entry as PerformanceNavigationTiming;
          
          // Time to First Byte (TTFB)
          const ttfb = navigationEntry.responseStart - navigationEntry.fetchStart;
          this.vitals.TTFB = ttfb;
          this.onMetricUpdate('TTFB', ttfb);
          
          // Time to Interactive (TTI) estimation
          const tti = navigationEntry.domComplete - navigationEntry.fetchStart;
          this.vitals.TTI = tti;
          this.onMetricUpdate('TTI', tti);
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('Navigation observer setup failed:', error);
    }
  }

  /**
   * Measure initial metrics on page load
   */
  private measureInitialMetrics(): void {
    // Measure TTFB from navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measureNavigationTiming();
      }, 100);
    });
  }

  /**
   * Measure navigation timing metrics
   */
  private measureNavigationTiming(): void {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      // TTFB
      if (this.vitals.TTFB === null) {
        const ttfb = navigationEntry.responseStart - navigationEntry.fetchStart;
        this.vitals.TTFB = ttfb;
        this.onMetricUpdate('TTFB', ttfb);
      }
      
      // TTI estimation
      if (this.vitals.TTI === null) {
        const tti = navigationEntry.domComplete - navigationEntry.fetchStart;
        this.vitals.TTI = tti;
        this.onMetricUpdate('TTI', tti);
      }
    }
  }

  /**
   * Handle metric updates
   */
  private onMetricUpdate(metric: string, value: number): void {
    const score = this.calculateMetricScore(metric, value);
    
    // Log metric update
    console.log(`Core Web Vitals: ${metric} = ${value.toFixed(2)}${this.getMetricUnit(metric)} (Score: ${score.toFixed(1)})`);
    
    // Update history
    this.updateHistory();
  }

  /**
   * Calculate score for a metric (0-100)
   */
  private calculateMetricScore(metric: string, value: number): number {
    const threshold = this.thresholds[metric];
    if (!threshold) return 0;
    
    if (value <= threshold.good) {
      return 100;
    } else if (value <= threshold.needsImprovement) {
      const range = threshold.needsImprovement - threshold.good;
      const position = value - threshold.good;
      return 75 - (position / range) * 25;
    } else {
      const range = threshold.poor - threshold.needsImprovement;
      const position = Math.min(value - threshold.needsImprovement, range);
      return 50 - (position / range) * 50;
    }
  }

  /**
   * Get metric unit
   */
  private getMetricUnit(metric: string): string {
    switch (metric) {
      case 'CLS':
        return '';
      default:
        return 'ms';
    }
  }

  /**
   * Update history with current metrics
   */
  private updateHistory(): void {
    const score = this.getOverallScore();
    
    this.history.push({
      timestamp: Date.now(),
      metrics: { ...this.vitals },
      score
    });
    
    // Keep only last 50 entries
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
    }
  }

  /**
   * Get current Core Web Vitals
   */
  public getVitals(): CoreWebVitalsData {
    return { ...this.vitals };
  }

  /**
   * Get individual metric scores
   */
  public getScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    
    Object.entries(this.vitals).forEach(([metric, value]) => {
      if (value !== null) {
        scores[metric] = this.calculateMetricScore(metric, value);
      }
    });
    
    return scores;
  }

  /**
   * Get overall Core Web Vitals score
   */
  public getOverallScore(): number {
    const scores = this.getScores();
    const validScores = Object.values(scores).filter(score => score > 0);
    
    return validScores.length > 0 ? 
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
  }

  /**
   * Get performance grade
   */
  public getGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = this.getOverallScore();
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get Core Web Vitals report
   */
  public getReport(): VitalsReport {
    return {
      metrics: this.getVitals(),
      scores: this.getScores(),
      overallScore: this.getOverallScore(),
      grade: this.getGrade(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  /**
   * Get history
   */
  public getHistory(): VitalsHistory[] {
    return [...this.history];
  }

  /**
   * Check if metric is good
   */
  public isMetricGood(metric: string, value: number): boolean {
    const threshold = this.thresholds[metric];
    return threshold ? value <= threshold.good : false;
  }

  /**
   * Check if metric needs improvement
   */
  public isMetricNeedsImprovement(metric: string, value: number): boolean {
    const threshold = this.thresholds[metric];
    return threshold ? value > threshold.good && value <= threshold.needsImprovement : false;
  }

  /**
   * Check if metric is poor
   */
  public isMetricPoor(metric: string, value: number): boolean {
    const threshold = this.thresholds[metric];
    return threshold ? value > threshold.needsImprovement : false;
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.vitals = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTI: null,
      TTFB: null
    };
    
    this.clsValue = 0;
    this.clsEntries = [];
    this.history = [];
  }
}

export default CoreWebVitalsService;