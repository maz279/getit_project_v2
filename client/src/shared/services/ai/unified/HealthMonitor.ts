
export class HealthMonitor {
  calculateOverallHealth(performanceMetrics: any, activeAlerts: any[], serviceStatus: any): 'excellent' | 'good' | 'warning' | 'critical' {
    let healthScore = 100;

    // Check service statuses
    const downServices = Object.values(serviceStatus).filter(status => status === 'down').length;
    healthScore -= downServices * 25;

    // Check active alerts
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'high').length;
    healthScore -= criticalAlerts * 15;

    // Check performance metrics
    if (performanceMetrics.averageResponseTime > 1000) {
      healthScore -= 10;
    }

    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 70) return 'good';
    if (healthScore >= 50) return 'warning';
    return 'critical';
  }

  generateHealthRecommendations(performanceMetrics: any, activeAlerts: any[]): string[] {
    const recommendations = [];

    if (performanceMetrics.averageResponseTime > 1000) {
      recommendations.push('Optimize response times');
    }

    if (performanceMetrics.cacheHitRate < 0.8) {
      recommendations.push('Improve cache performance');
    }

    if (activeAlerts.length > 5) {
      recommendations.push('Address system alerts');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well');
    }

    return recommendations;
  }
}

export const healthMonitor = new HealthMonitor();
