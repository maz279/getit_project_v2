/**
 * Connection Model - WebSocket Connection Data Model
 * MongoDB schema for real-time connections
 */

export interface Connection {
  _id?: string;
  user_id?: string;
  socket_id: string;
  session_id: string;
  device_info: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    app_version: string;
  };
  connection_time: Date;
  last_activity: Date;
  channels: string[];
  location: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  connection_quality: {
    latency: number;
    packet_loss: number;
    bandwidth: '2g' | '3g' | '4g' | 'wifi';
  };
  status: 'active' | 'idle' | 'disconnected';
  ip_address: string;
  user_agent: string;
  authentication_status: boolean;
  permissions: string[];
}

export interface RealtimeEvent {
  _id?: string;
  event_type: string;
  channel: string;
  data: any;
  timestamp: Date;
  sender_id?: string;
  recipients: string[];
  delivery_status: {
    total_recipients: number;
    delivered: number;
    failed: number;
  };
  ttl?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserPresence {
  _id?: string;
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: Date;
  current_page: string;
  shopping_activity: {
    viewing_product?: string;
    cart_items: number;
    in_checkout: boolean;
    wishlist_items: number;
  };
  device_count: number;
  location: string;
  session_info: {
    browser: string;
    os: string;
    country: string;
    city: string;
  };
}

export interface ChatRoom {
  _id?: string;
  room_id: string;
  type: 'customer_support' | 'vendor_chat' | 'group_chat';
  participants: Array<{
    user_id: string;
    role: 'customer' | 'vendor' | 'support_agent';
    joined_at: Date;
    last_read_at: Date;
  }>;
  created_by: string;
  created_at: Date;
  last_activity: Date;
  status: 'active' | 'archived' | 'closed';
  metadata: {
    order_id?: string;
    product_id?: string;
    priority: 'low' | 'medium' | 'high';
  };
}

export interface RealtimeNotification {
  _id?: string;
  user_id: string;
  notification_type: string;
  title: string;
  title_bn: string;
  message: string;
  message_bn: string;
  data: any;
  sent_at: Date;
  read_at?: Date;
  delivered_at?: Date;
  clicked_at?: Date;
  status: 'sent' | 'delivered' | 'read' | 'clicked';
  channel: 'realtime' | 'push' | 'email' | 'sms';
}