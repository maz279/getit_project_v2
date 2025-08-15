
import { KPIMetric } from './types';

export const generateKPIData = (): KPIMetric[] => {
  return [
    // Revenue KPIs
    { id: 'revenue', name: 'Monthly Revenue', value: 2850000, target: 3000000, unit: 'BDT', trend: 8.5, category: 'Revenue', priority: 'high', status: 'on-track' },
    { id: 'aov', name: 'Average Order Value', value: 1850, target: 2000, unit: 'BDT', trend: 5.2, category: 'Revenue', priority: 'high', status: 'at-risk' },
    { id: 'ltv', name: 'Customer Lifetime Value', value: 8500, target: 10000, unit: 'BDT', trend: 12.3, category: 'Revenue', priority: 'medium', status: 'on-track' },
    
    // Customer KPIs
    { id: 'cac', name: 'Customer Acquisition Cost', value: 450, target: 400, unit: 'BDT', trend: -8.2, category: 'Customer', priority: 'high', status: 'behind' },
    { id: 'retention', name: 'Customer Retention Rate', value: 78, target: 85, unit: '%', trend: 3.1, category: 'Customer', priority: 'high', status: 'at-risk' },
    { id: 'churn', name: 'Churn Rate', value: 5.8, target: 5.0, unit: '%', trend: -12.5, category: 'Customer', priority: 'medium', status: 'behind' },
    
    // Operations KPIs
    { id: 'inventory_turnover', name: 'Inventory Turnover', value: 6.2, target: 8.0, unit: 'x', trend: 15.8, category: 'Operations', priority: 'medium', status: 'at-risk' },
    { id: 'fulfillment_time', name: 'Order Fulfillment Time', value: 1.8, target: 1.5, unit: 'days', trend: -5.3, category: 'Operations', priority: 'high', status: 'behind' },
    { id: 'return_rate', name: 'Return Rate', value: 3.2, target: 2.5, unit: '%', trend: -18.7, category: 'Operations', priority: 'medium', status: 'behind' },
    
    // Marketing KPIs
    { id: 'conversion_rate', name: 'Conversion Rate', value: 3.8, target: 4.5, unit: '%', trend: 8.9, category: 'Marketing', priority: 'high', status: 'at-risk' },
    { id: 'roas', name: 'Return on Ad Spend', value: 4.2, target: 5.0, unit: 'x', trend: 15.6, category: 'Marketing', priority: 'high', status: 'on-track' },
    { id: 'ctr', name: 'Click-Through Rate', value: 2.1, target: 2.5, unit: '%', trend: 6.3, category: 'Marketing', priority: 'medium', status: 'at-risk' },
  ];
};
