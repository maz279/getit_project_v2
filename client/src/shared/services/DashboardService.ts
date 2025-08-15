/**
 * Dashboard Service - Amazon.com/Shopee.sg Level Dashboard Management
 * Complete dashboard and quick actions management for admin platform
 */

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action_type: 'create' | 'update' | 'delete' | 'view' | 'export' | 'process';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  category: 'product' | 'order' | 'customer' | 'vendor' | 'finance' | 'marketing' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requires_confirmation: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuickActionLog {
  id: string;
  action_id: string;
  user_id: string;
  user_name: string;
  action_title: string;
  status: 'success' | 'failed' | 'pending';
  result_message?: string;
  execution_time_ms: number;
  created_at: Date;
}

export interface DashboardMetrics {
  total_users: number;
  total_vendors: number;
  total_orders: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
  new_users_today: number;
  active_sessions: number;
  pending_approvals: number;
  system_alerts: number;
  performance_score: number;
  uptime_percentage: number;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  requires_action: boolean;
  action_url?: string;
  created_at: Date;
}

export class DashboardService {
  private static baseURL = '/api/v1/dashboard';

  // Quick Actions
  static async getQuickActions(category?: string): Promise<QuickAction[]> {
    const queryParams = category ? `?category=${category}` : '';
    const response = await fetch(`${this.baseURL}/quick-actions${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quick actions');
    }
    
    return response.json();
  }

  static async executeQuickAction(actionId: string, payload?: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/quick-actions/${actionId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload || {}),
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute quick action');
    }
    
    return response.json();
  }

  static async getQuickActionLogs(limit: number = 10, filters?: any): Promise<QuickActionLog[]> {
    const queryParams = new URLSearchParams({ limit: limit.toString(), ...filters });
    const response = await fetch(`${this.baseURL}/quick-actions/logs?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quick action logs');
    }
    
    return response.json();
  }

  // Dashboard Metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${this.baseURL}/metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard metrics');
    }
    
    return response.json();
  }

  static async getMetricHistory(metric: string, period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/metrics/${metric}/history?period=${period}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metric history');
    }
    
    return response.json();
  }

  // System Alerts
  static async getSystemAlerts(filters?: any): Promise<SystemAlert[]> {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/alerts?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch system alerts');
    }
    
    return response.json();
  }

  static async markAlertAsRead(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/read`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark alert as read');
    }
  }

  static async dismissAlert(alertId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/dismiss`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to dismiss alert');
    }
  }

  // Dashboard Configuration
  static async getDashboardConfig(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/config?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard configuration');
    }
    
    return response.json();
  }

  static async updateDashboardConfig(userId: string, config: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, ...config }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update dashboard configuration');
    }
    
    return response.json();
  }

  // Real-time Updates
  static async getRealtimeUpdates(): Promise<any> {
    const response = await fetch(`${this.baseURL}/realtime`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch realtime updates');
    }
    
    return response.json();
  }

  // Dashboard Analytics
  static async getDashboardAnalytics(period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any> {
    const response = await fetch(`${this.baseURL}/analytics?period=${period}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard analytics');
    }
    
    return response.json();
  }

  static async getUserActivityLogs(limit: number = 50): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/activity-logs?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user activity logs');
    }
    
    return response.json();
  }
}

export default DashboardService;