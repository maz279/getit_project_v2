
export interface VIPCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  tier: string;
  lifetimeValue: number;
  totalOrders: number;
  joinDate: string;
  lastOrder: string;
  personalShopper: string;
  preferredCategories: string[];
  status: 'Active' | 'Inactive';
}

export interface NewCustomer {
  name: string;
  email: string;
  phone: string;
  tier: string;
  personalShopper: string;
}

export interface SpendingTrendData {
  month: string;
  amount: number;
}

export interface TierDistributionData {
  name: string;
  value: number;
  color: string;
}
