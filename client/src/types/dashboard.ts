
export interface DashboardKPIMetric {
  id: string;
  metric_name: string;
  metric_category: string;
  metric_value: number;
  comparison_value?: number;
  percentage_change?: number;
  trend_direction: 'up' | 'down' | 'stable';
  metric_unit?: string;
  time_period: string;
  recorded_date: string;
  metadata?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemHealthLog {
  id: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  response_time_ms?: number;
  cpu_usage_percent?: number;
  memory_usage_percent?: number;
  disk_usage_percent?: number;
  error_message?: string;
  metadata?: any;
  recorded_at: string;
  created_at: string;
  // Additional properties expected by components
  health_status?: 'healthy' | 'warning' | 'critical' | 'down';
  service_type?: string;
  success_rate?: number;
  cpu_usage?: number;
  memory_usage?: number;
  last_check?: string;
  uptime_seconds?: number;
  error_count?: number;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip?: string;
  user_id?: string;
  event_description: string;
  metadata?: any;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ExecutiveReport {
  id: string;
  report_title: string;
  report_type: string;
  executive_summary: string;
  report_period_start: string;
  report_period_end: string;
  status: 'draft' | 'published' | 'archived';
  key_metrics: any;
  charts_data?: any;
  recommendations?: any[];
  created_by: string;
  reviewed_by?: string;
  approved_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickAction {
  id: string;
  action_name: string;
  action_type: string;
  description?: string;
  icon_name?: string;
  color_class?: string;
  is_active: boolean;
  sort_order: number;
  permissions_required?: string[];
  metadata?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuickActionLog {
  id: string;
  action_type: string;
  action_name: string;
  execution_status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: any;
  executed_by: string;
  progress_percentage: number;
  started_at: string;
  completed_at?: string;
  execution_time_ms?: number;
  result_data?: any;
  error_message?: string;
  created_at: string;
}
