
export class UserBehaviorManager {
  private userBehaviorData: Map<string, any> = new Map();

  getUserBehaviorData(userId: string): any {
    if (!this.userBehaviorData.has(userId)) {
      this.userBehaviorData.set(userId, this.generateMockBehaviorData(userId));
    }
    return this.userBehaviorData.get(userId);
  }

  private generateMockBehaviorData(userId: string): any {
    const daysSinceRegistration = Math.floor(Math.random() * 365) + 1;
    const daysSinceLastLogin = Math.floor(Math.random() * 30);
    
    return {
      daysSinceRegistration,
      daysSinceLastLogin,
      totalSessions: Math.floor(Math.random() * 50) + 1,
      averageSessionDuration: Math.floor(Math.random() * 30) + 5,
      totalPurchases: Math.floor(Math.random() * 10),
      totalSpent: Math.floor(Math.random() * 50000),
      supportTickets: Math.floor(Math.random() * 5),
      featureUsage: {
        search: Math.random(),
        wishlist: Math.random(),
        reviews: Math.random(),
        social: Math.random(),
        chat: Math.random()
      },
      deviceTypes: ['mobile', 'desktop'][Math.floor(Math.random() * 2)],
      communicationPreferences: {
        email: Math.random() > 0.3,
        sms: Math.random() > 0.7,
        push: Math.random() > 0.5
      }
    };
  }
}
