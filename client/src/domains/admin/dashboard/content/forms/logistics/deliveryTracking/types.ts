
export interface DeliveryItem {
  id: string;
  trackingNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'failed';
  courierPartner: string;
  courierDriver: string;
  driverPhone: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  priority: 'normal' | 'express' | 'same_day';
  packageValue: number;
  deliveryInstructions?: string;
  currentLocation: string;
  lastUpdated: string;
  timeline: DeliveryTimelineItem[];
}

export interface DeliveryTimelineItem {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface DeliveryStats {
  total: number;
  delivered: number;
  outForDelivery: number;
  delayed: number;
  inTransit: number;
}
