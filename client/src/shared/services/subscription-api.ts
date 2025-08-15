/**
 * Subscription API Service - Amazon.com/Shopee.sg-Level API Integration
 * Complete API service for subscription management with Bangladesh features
 * 
 * @fileoverview Enterprise-grade subscription API service with cultural integration
 * @author GetIt Platform Team
 * @version 3.0.0
 */

import { apiRequest } from '@/lib/queryClient';

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: string;
  trialDays: number;
  isActive: boolean;
  features: string[];
  bangladeshFeatures: {
    culturalGreeting: string;
    ramadanSupport: boolean;
    festivalOffers: boolean;
    bengaliCalendar: boolean;
    mobileBankingSupport: string[];
    prayerTimeAwareness: boolean;
  };
  subscriberCount: number;
  items?: SubscriptionPlanItem[];
}

export interface SubscriptionPlanItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  isOptional: boolean;
  canModifyQuantity: boolean;
  deliveryFrequency: string;
  productName: string;
  productNameBn: string;
  productImage: string[];
  productPrice: number;
}

export interface UserSubscription {
  id: string;
  userId: number;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  isTrialActive: boolean;
  trialEndDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  subscriptionItems: SubscriptionItem[];
  planName: string;
  planNameBn: string;
  planPrice: number;
  planCurrency: string;
  planBillingCycle: string;
  totalAmount: number;
  nextDeliveryDate: string;
  deliveryAddress: string;
  culturalFeatures: {
    ramadanPause: boolean;
    festivalDiscounts: boolean;
    bengaliInterface: boolean;
    prayerTimeDelivery: boolean;
  };
}

export interface SubscriptionItem {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryFrequency: string;
  nextDeliveryDate: string;
  isOptional: boolean;
  canModifyQuantity: boolean;
  productImage: string[];
  productCategory: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethod: string;
  autoRenew: boolean;
  deliveryInstructions?: string;
  culturalPreferences?: {
    ramadanPause: boolean;
    festivalDiscounts: boolean;
    bengaliInterface: boolean;
    prayerTimeDelivery: boolean;
  };
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  avgOrderValue: number;
  popularPlans: Array<{
    planName: string;
    subscribers: number;
    revenue: number;
  }>;
  bangladeshMetrics: {
    festivalSubscriptions: number;
    ramadanPauses: number;
    mobileBankingUsage: {
      bkash: number;
      nagad: number;
      rocket: number;
    };
    culturalEngagement: number;
  };
}

export interface SubscriptionCoupon {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  discountType: string;
  discountValue: number;
  minimumAmount: number;
  maximumDiscount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  culturalRelevance: {
    festival: string;
    festivalName: string;
    festivalNameBn: string;
    culturalBonus: number;
  };
}

export interface SubscriptionDelivery {
  id: string;
  subscriptionId: string;
  deliveryNumber: string;
  scheduledDate: string;
  status: string;
  items: SubscriptionDeliveryItem[];
  totalAmount: number;
  shippingMethod: string;
  trackingNumber: string;
  deliveredAt: string;
  rating: number;
  feedback: string;
  courierPartner: string;
  estimatedDeliveryTime: string;
  deliveryInstructions: string;
  culturalConsiderations: {
    prayerTimeAvoidance: boolean;
    ramadanDelivery: boolean;
    festivalDelivery: boolean;
  };
}

export interface SubscriptionDeliveryItem {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string[];
  deliveryStatus: string;
  trackingDetails: string;
}

export interface SubscriptionBilling {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference: string;
  paymentDate: string;
  dueDate: string;
  attemptCount: number;
  lastAttemptAt: string;
  failureReason: string;
  bangladeshPaymentDetails: {
    mobileNumber: string;
    transactionId: string;
    bankName: string;
    accountNumber: string;
  };
}

export interface SubscriptionModification {
  id: string;
  subscriptionId: string;
  modificationType: string;
  oldValues: any;
  newValues: any;
  effectiveDate: string;
  appliedAt: string;
  requestedBy: string;
  reason: string;
  status: string;
  approvalRequired: boolean;
  approvedBy: string;
  approvedAt: string;
  pricingChanges: {
    oldPrice: number;
    newPrice: number;
    priceDifference: number;
    prorationAmount: number;
  };
}

export interface SubscriptionPauseHistory {
  id: string;
  subscriptionId: string;
  pauseReason: string;
  pausedAt: string;
  pausedUntil: string;
  resumedAt: string;
  culturalEvent: string;
  culturalEventName: string;
  culturalEventNameBn: string;
  autoResumeScheduled: boolean;
  pauseDuration: string;
  pauseImpact: {
    deliveriesSkipped: number;
    amountSaved: number;
    nextDeliveryDate: string;
  };
}

export class SubscriptionApiService {
  private static baseUrl = '/api/v1/subscriptions';

  // Subscription Plans
  static async getPlans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priceRange?: string;
    billingCycle?: string;
    isActive?: string;
    includeProducts?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/plans${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getPlanById(id: string) {
    return apiRequest(`${this.baseUrl}/plans/${id}`);
  }

  static async createPlan(planData: Partial<SubscriptionPlan>) {
    return apiRequest(`${this.baseUrl}/plans`, {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  static async updatePlan(id: string, planData: Partial<SubscriptionPlan>) {
    return apiRequest(`${this.baseUrl}/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  static async deletePlan(id: string) {
    return apiRequest(`${this.baseUrl}/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // User Subscriptions
  static async getUserSubscriptions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    planId?: string;
    includeItems?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/subscriptions${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getUserSubscription(id: string) {
    return apiRequest(`${this.baseUrl}/subscriptions/${id}`);
  }

  static async createSubscription(subscriptionData: CreateSubscriptionRequest) {
    return apiRequest(`${this.baseUrl}/subscriptions/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  static async cancelSubscription(id: string, reason?: string) {
    return apiRequest(`${this.baseUrl}/subscriptions/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  static async renewSubscription(id: string) {
    return apiRequest(`${this.baseUrl}/subscriptions/${id}/renew`, {
      method: 'PUT',
    });
  }

  static async upgradeSubscription(id: string, newPlanId: string) {
    return apiRequest(`${this.baseUrl}/subscriptions/${id}/upgrade`, {
      method: 'PUT',
      body: JSON.stringify({ newPlanId }),
    });
  }

  static async downgradeSubscription(id: string, newPlanId: string) {
    return apiRequest(`${this.baseUrl}/subscriptions/${id}/downgrade`, {
      method: 'PUT',
      body: JSON.stringify({ newPlanId }),
    });
  }

  static async pauseSubscription(id: string, reason: string, pauseUntil?: string) {
    return apiRequest(`${this.baseUrl}/subscriptions/${id}/pause`, {
      method: 'POST',
      body: JSON.stringify({ reason, pauseUntil }),
    });
  }

  static async resumeSubscription(pauseId: string) {
    return apiRequest(`${this.baseUrl}/pauses/${pauseId}/resume`, {
      method: 'POST',
    });
  }

  // Billing
  static async getBillingHistory(params?: {
    page?: number;
    limit?: number;
    subscriptionId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    dateRange?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/billing/history${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getBillingById(id: string) {
    return apiRequest(`${this.baseUrl}/billing/${id}`);
  }

  static async createBilling(billingData: Partial<SubscriptionBilling>) {
    return apiRequest(`${this.baseUrl}/billing`, {
      method: 'POST',
      body: JSON.stringify(billingData),
    });
  }

  static async processPayment(id: string, paymentData: any) {
    return apiRequest(`${this.baseUrl}/billing/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  static async retryPayment(id: string) {
    return apiRequest(`${this.baseUrl}/billing/${id}/retry`, {
      method: 'POST',
    });
  }

  static async generateInvoice(id: string) {
    return apiRequest(`${this.baseUrl}/billing/${id}/invoice`);
  }

  static async getBillingAnalytics(params?: {
    period?: string;
    groupBy?: string;
    paymentMethod?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/billing/analytics${queryParams ? `?${queryParams}` : ''}`);
  }

  // Deliveries
  static async getDeliveries(params?: {
    page?: number;
    limit?: number;
    subscriptionId?: string;
    status?: string;
    dateRange?: string;
    courierPartner?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/deliveries${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getDeliveryById(id: string) {
    return apiRequest(`${this.baseUrl}/deliveries/${id}`);
  }

  static async scheduleDelivery(deliveryData: Partial<SubscriptionDelivery>) {
    return apiRequest(`${this.baseUrl}/deliveries`, {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  }

  static async updateDeliveryStatus(id: string, status: string, notes?: string) {
    return apiRequest(`${this.baseUrl}/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  static async rescheduleDelivery(id: string, newDate: string, reason?: string) {
    return apiRequest(`${this.baseUrl}/deliveries/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newDate, reason }),
    });
  }

  static async skipDelivery(id: string, reason?: string) {
    return apiRequest(`${this.baseUrl}/deliveries/${id}/skip`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async getDeliveryAnalytics(params?: {
    period?: string;
    groupBy?: string;
    courierPartner?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/deliveries/analytics${queryParams ? `?${queryParams}` : ''}`);
  }

  // Coupons
  static async getCoupons(params?: {
    page?: number;
    limit?: number;
    search?: string;
    discountType?: string;
    isActive?: string;
    festival?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/coupons${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getCouponByCode(code: string) {
    return apiRequest(`${this.baseUrl}/coupons/${code}`);
  }

  static async createCoupon(couponData: Partial<SubscriptionCoupon>) {
    return apiRequest(`${this.baseUrl}/coupons`, {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  static async applyCoupon(code: string, subscriptionId: string) {
    return apiRequest(`${this.baseUrl}/coupons/${code}/apply`, {
      method: 'POST',
      body: JSON.stringify({ subscriptionId }),
    });
  }

  static async getFestivalCoupons(festival: string) {
    return apiRequest(`${this.baseUrl}/coupons/festivals/${festival}`);
  }

  static async getCouponAnalytics(params?: {
    period?: string;
    groupBy?: string;
    festival?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/coupons/analytics${queryParams ? `?${queryParams}` : ''}`);
  }

  // Modifications
  static async getModifications(params?: {
    page?: number;
    limit?: number;
    subscriptionId?: string;
    modificationType?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/modifications${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getModificationById(id: string) {
    return apiRequest(`${this.baseUrl}/modifications/${id}`);
  }

  static async requestModification(modificationData: Partial<SubscriptionModification>) {
    return apiRequest(`${this.baseUrl}/modifications`, {
      method: 'POST',
      body: JSON.stringify(modificationData),
    });
  }

  static async approveModification(id: string) {
    return apiRequest(`${this.baseUrl}/modifications/${id}/approve`, {
      method: 'POST',
    });
  }

  static async getModificationAnalytics(params?: {
    period?: string;
    groupBy?: string;
    modificationType?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/modifications/analytics${queryParams ? `?${queryParams}` : ''}`);
  }

  // Pause History
  static async getPauseHistory(params?: {
    page?: number;
    limit?: number;
    subscriptionId?: string;
    pauseReason?: string;
    culturalEvent?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/pauses${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getPauseById(id: string) {
    return apiRequest(`${this.baseUrl}/pauses/${id}`);
  }

  static async scheduleRamadanPause(subscriptionIds: string[], pauseDate: string) {
    return apiRequest(`${this.baseUrl}/pauses/ramadan/schedule`, {
      method: 'POST',
      body: JSON.stringify({ subscriptionIds, pauseDate }),
    });
  }

  static async getPauseAnalytics(params?: {
    period?: string;
    groupBy?: string;
    culturalEvent?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/pauses/analytics${queryParams ? `?${queryParams}` : ''}`);
  }

  // Analytics
  static async getStats() {
    return apiRequest(`${this.baseUrl}/stats`);
  }

  static async getRevenueAnalytics(params?: {
    period?: string;
    groupBy?: string;
    planId?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/analytics/revenue${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getChurnAnalytics(params?: {
    period?: string;
    groupBy?: string;
    reason?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/analytics/churn${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getPlanAnalytics(params?: {
    period?: string;
    groupBy?: string;
    planId?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/analytics/plans${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getConversionAnalytics(params?: {
    period?: string;
    groupBy?: string;
    source?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/analytics/conversion${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getBangladeshAnalytics(params?: {
    period?: string;
    groupBy?: string;
    culturalEvent?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/analytics/bangladesh${queryParams ? `?${queryParams}` : ''}`);
  }

  // Admin
  static async getAllSubscribers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    planId?: string;
    paymentMethod?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/admin/subscribers${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getSubscriptionMetrics(params?: {
    period?: string;
    groupBy?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`${this.baseUrl}/admin/metrics${queryParams ? `?${queryParams}` : ''}`);
  }

  static async getAdminDashboard() {
    return apiRequest(`${this.baseUrl}/admin/dashboard`);
  }

  static async extendSubscription(id: string, extensionData: {
    extendBy: number;
    extendType: string;
    reason?: string;
  }) {
    return apiRequest(`${this.baseUrl}/admin/subscriptions/${id}/extend`, {
      method: 'PUT',
      body: JSON.stringify(extensionData),
    });
  }

  // Service Info
  static async getServiceInfo() {
    return apiRequest(`${this.baseUrl}/info`);
  }

  static async getServiceHealth() {
    return apiRequest(`${this.baseUrl}/health`);
  }

  // Cultural Events
  static async getCulturalEvents() {
    return apiRequest(`${this.baseUrl}/cultural/events`);
  }

  static async getFestivalOffers() {
    return apiRequest(`${this.baseUrl}/cultural/offers`);
  }
}

export default SubscriptionApiService;