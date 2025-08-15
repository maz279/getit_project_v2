
export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface GoalSetting {
  id: string;
  kpiId: string;
  target: number;
  timeframe: string;
  description: string;
  responsible: string;
}
