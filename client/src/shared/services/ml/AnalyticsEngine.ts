
import { mlService } from './MLService';
import { insightGenerator } from './analytics/InsightGenerator';
import { customerAnalyzer } from './analytics/CustomerAnalyzer';

export interface MLInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'customer' | 'product' | 'sales' | 'marketing' | 'operations';
  recommendations: string[];
  data: any;
}

export interface CustomerInsight {
  userId: string;
  segment: string;
  segmentId: string;
  segmentName: string;
  size: number;
  clv: number;
  predictedLifetimeValue: number;
  churnRisk: number;
  preferences: string[];
  nextBestAction: string;
}

export interface CustomerSegment {
  segmentId: string;
  segmentName: string;
  size: number;
  predictedLifetimeValue: number;
  churnRisk: number;
  preferences: string[];
}

export class AnalyticsEngine {
  private insights: MLInsight[] = [];
  private realTimeEvents: Array<{
    type: string;
    userId?: string;
    timestamp: number;
    data: any;
  }> = [];

  async processRealTimeEvent(event: {
    type: string;
    userId?: string;
    timestamp: number;
    data: any;
  }): Promise<MLInsight[]> {
    console.log('ML Analytics: Processing real-time event:', event.type);
    
    this.realTimeEvents.push(event);
    
    // Generate insights using the focused insight generator
    const insights = await insightGenerator.generateInsightsFromEvent(event);
    
    // Store insights
    this.insights.push(...insights);
    
    // Update customer profiles if user event
    if (event.userId) {
      await this.updateCustomerProfile(event.userId, event);
    }
    
    return insights;
  }

  async generateBusinessInsights(): Promise<MLInsight[]> {
    return await insightGenerator.generateBusinessInsights();
  }

  async analyzeCustomerSegments(): Promise<CustomerSegment[]> {
    return await customerAnalyzer.analyzeCustomerSegments();
  }

  async analyzeCustomerBehavior(userId: string, data: any): Promise<CustomerInsight> {
    return await customerAnalyzer.analyzeCustomerBehavior(userId, data);
  }

  private async updateCustomerProfile(userId: string, event: any): Promise<void> {
    await customerAnalyzer.analyzeCustomerBehavior(userId, event.data);
  }

  public getInsights(filters?: {
    category?: string;
    priority?: string;
    limit?: number;
  }): MLInsight[] {
    let filtered = this.insights;
    
    if (filters?.category) {
      filtered = filtered.filter(i => i.category === filters.category);
    }
    
    if (filters?.priority) {
      filtered = filtered.filter(i => i.priority === filters.priority);
    }
    
    filtered = filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }
    
    return filtered;
  }

  public getCustomerProfile(userId: string): CustomerInsight | undefined {
    return customerAnalyzer.getCustomerProfile(userId);
  }

  public getPerformanceMetrics(): any {
    return {
      totalInsights: this.insights.length,
      customerProfiles: customerAnalyzer.getCustomerProfilesCount(),
      realtimeEvents: this.realTimeEvents.length,
      insightsByCategory: this.insights.reduce((acc, insight) => {
        acc[insight.category] = (acc[insight.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
