import { businessInsightsGenerator } from './insights/BusinessInsightsGenerator';
import { eventProcessor } from './insights/EventProcessor';

export class RealTimeInsights {
  private static instance: RealTimeInsights;
  private insights: Map<string, any> = new Map();
  private alerts: any[] = [];

  private constructor() {
    this.startRealTimeProcessing();
  }

  public static getInstance(): RealTimeInsights {
    if (!RealTimeInsights.instance) {
      RealTimeInsights.instance = new RealTimeInsights();
    }
    return RealTimeInsights.instance;
  }

  async generateBusinessInsights(): Promise<{
    customerInsights: any;
    productInsights: any;
    marketInsights: any;
    operationalInsights: any;
    predictiveInsights: any;
  }> {
    return businessInsightsGenerator.generateBusinessInsights();
  }

  async processRealTimeEvent(event: {
    type: string;
    userId?: string;
    data: any;
    timestamp: number;
  }): Promise<{
    insights: any[];
    recommendations: any[];
    alerts: any[];
    patterns: any[];
  }> {
    return eventProcessor.processRealTimeEvent(event);
  }

  private startRealTimeProcessing(): void {
    setInterval(() => {
      this.processBackgroundInsights();
    }, 30000);
  }

  private async processBackgroundInsights(): Promise<void> {
    console.log('Real-time Insights: Processing background insights');
    
    const insights = await this.generateBusinessInsights();
    this.insights.set('latest', { ...insights, timestamp: Date.now() });

    this.detectAnomalies();
  }

  private detectAnomalies(): void {
    this.alerts = this.alerts.filter(alert => Date.now() - alert.timestamp < 24 * 60 * 60 * 1000);
  }

  public getLatestInsights(): any {
    return this.insights.get('latest') || {};
  }

  public getActiveAlerts(): any[] {
    return this.alerts.filter(alert => Date.now() - alert.timestamp < 60 * 60 * 1000);
  }

  public getPatternSummary(): any {
    return eventProcessor.getPatternSummary();
  }
}

export const realTimeInsights = RealTimeInsights.getInstance();
