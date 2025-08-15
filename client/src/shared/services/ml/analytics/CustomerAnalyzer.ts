
import { CustomerInsight, CustomerSegment } from '../AnalyticsEngine';

export class CustomerAnalyzer {
  private customerProfiles: Map<string, CustomerInsight> = new Map();

  async analyzeCustomerBehavior(userId: string, data: any): Promise<CustomerInsight> {
    console.log('ML Analytics: Analyzing customer behavior for:', userId);
    
    // Calculate CLV (simplified)
    const totalSpent = data?.totalSpent || 0;
    const clv = totalSpent * 1.5; // Simple multiplier
    
    // Calculate churn risk
    const daysSinceLastActivity = data?.daysSinceLastActivity || 0;
    const churnRisk = Math.min(daysSinceLastActivity / 30, 1);
    
    // Determine segment
    let segment = 'new';
    let segmentName = 'New Customer';
    const purchaseCount = data?.purchaseCount || 0;
    
    if (purchaseCount >= 5) {
      segment = 'loyal';
      segmentName = 'Loyal Customer';
    } else if (totalSpent > 50000) {
      segment = 'high_value';
      segmentName = 'High Value Customer';
    } else if (purchaseCount >= 2) {
      segment = 'regular';
      segmentName = 'Regular Customer';
    }
    
    // Extract preferences
    const preferences = data?.preferences || ['Electronics', 'Fashion'];
    
    // Determine next best action
    let nextBestAction = 'send_welcome_offer';
    if (churnRisk > 0.7) nextBestAction = 'retention_campaign';
    else if (segment === 'high_value') nextBestAction = 'vip_treatment';
    
    const insight: CustomerInsight = {
      userId,
      segment,
      segmentId: `seg-${segment}`,
      segmentName,
      size: 1,
      clv,
      predictedLifetimeValue: clv,
      churnRisk,
      preferences,
      nextBestAction
    };
    
    this.customerProfiles.set(userId, insight);
    return insight;
  }

  async analyzeCustomerSegments(): Promise<CustomerSegment[]> {
    console.log('ML Analytics: Analyzing customer segments');
    
    return [
      {
        segmentId: 'premium-001',
        segmentName: 'Premium Customers',
        size: 1250,
        predictedLifetimeValue: 45000,
        churnRisk: 0.15,
        preferences: ['Electronics', 'Premium Brands', 'Fast Delivery']
      },
      {
        segmentId: 'regular-002',
        segmentName: 'Regular Shoppers',
        size: 8500,
        predictedLifetimeValue: 15000,
        churnRisk: 0.35,
        preferences: ['Fashion', 'Deals', 'Free Shipping']
      },
      {
        segmentId: 'occasional-003',
        segmentName: 'Occasional Buyers',
        size: 12000,
        predictedLifetimeValue: 5000,
        churnRisk: 0.65,
        preferences: ['Sale Items', 'Basic Products', 'Price Comparison']
      }
    ];
  }

  getCustomerProfile(userId: string): CustomerInsight | undefined {
    return this.customerProfiles.get(userId);
  }

  getCustomerProfilesCount(): number {
    return this.customerProfiles.size;
  }
}

export const customerAnalyzer = new CustomerAnalyzer();
