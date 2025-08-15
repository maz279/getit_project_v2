/**
 * Real-time Notification Model
 * Amazon.com/Shopee.sg-Level notification system
 */

import { Schema, model, Document } from 'mongoose';

export interface IRealtimeNotification extends Document {
  notification_id: string;
  user_id: string;
  notification_type: 'price_drop' | 'restock' | 'order_update' | 'payment_update' | 'promotion' | 'chat_message' | 'system' | 'bangladesh_payment';
  title: string;
  title_bn?: string; // Bengali title
  message: string;
  message_bn?: string; // Bengali message
  data: {
    product_id?: string;
    order_id?: string;
    vendor_id?: string;
    old_price?: number;
    new_price?: number;
    discount_percentage?: number;
    action_url?: string;
    action_text?: string;
    action_text_bn?: string;
    image_url?: string;
    category?: string;
    payment_method?: 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod';
  };
  channels: Array<{
    type: 'realtime' | 'push' | 'email' | 'sms';
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';
    sent_at?: Date;
    delivered_at?: Date;
    read_at?: Date;
    clicked_at?: Date;
    error?: string;
  }>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduled_for?: Date;
  expires_at?: Date;
  user_preferences: {
    language: string;
    timezone: string;
    notification_settings: {
      realtime_enabled: boolean;
      push_enabled: boolean;
      email_enabled: boolean;
      sms_enabled: boolean;
    };
  };
  tracking: {
    created_at: Date;
    sent_at?: Date;
    delivered_at?: Date;
    read_at?: Date;
    clicked_at?: Date;
    response_time?: number; // seconds from sent to read
  };
  metadata: {
    source_service?: string;
    correlation_id?: string;
    campaign_id?: string;
    segment?: string;
    ab_test_variant?: string;
    user_agent?: string;
    ip_address?: string;
  };
}

const RealtimeNotificationSchema = new Schema<IRealtimeNotification>({
  notification_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  notification_type: {
    type: String,
    enum: ['price_drop', 'restock', 'order_update', 'payment_update', 'promotion', 'chat_message', 'system', 'bangladesh_payment'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  title_bn: String, // Bengali title
  message: {
    type: String,
    required: true
  },
  message_bn: String, // Bengali message
  data: {
    product_id: { type: String, index: true },
    order_id: { type: String, index: true },
    vendor_id: { type: String, index: true },
    old_price: Number,
    new_price: Number,
    discount_percentage: Number,
    action_url: String,
    action_text: String,
    action_text_bn: String,
    image_url: String,
    category: String,
    payment_method: {
      type: String,
      enum: ['bkash', 'nagad', 'rocket', 'card', 'cod']
    }
  },
  channels: [{
    type: {
      type: String,
      enum: ['realtime', 'push', 'email', 'sms'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'clicked', 'failed'],
      default: 'pending'
    },
    sent_at: Date,
    delivered_at: Date,
    read_at: Date,
    clicked_at: Date,
    error: String
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  scheduled_for: {
    type: Date,
    index: true
  },
  expires_at: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  user_preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Dhaka' },
    notification_settings: {
      realtime_enabled: { type: Boolean, default: true },
      push_enabled: { type: Boolean, default: true },
      email_enabled: { type: Boolean, default: true },
      sms_enabled: { type: Boolean, default: false }
    }
  },
  tracking: {
    created_at: { type: Date, default: Date.now },
    sent_at: Date,
    delivered_at: Date,
    read_at: Date,
    clicked_at: Date,
    response_time: Number
  },
  metadata: {
    source_service: String,
    correlation_id: String,
    campaign_id: String,
    segment: String,
    ab_test_variant: String,
    user_agent: String,
    ip_address: String
  }
}, {
  timestamps: true,
  collection: 'realtime_notifications'
});

// Indexes for performance
RealtimeNotificationSchema.index({ user_id: 1, 'tracking.created_at': -1 });
RealtimeNotificationSchema.index({ notification_type: 1, 'tracking.created_at': -1 });
RealtimeNotificationSchema.index({ priority: 1, 'channels.status': 1 });
RealtimeNotificationSchema.index({ scheduled_for: 1, 'channels.status': 1 });
RealtimeNotificationSchema.index({ 'data.product_id': 1, notification_type: 1 });
RealtimeNotificationSchema.index({ 'data.order_id': 1, notification_type: 1 });

export const RealtimeNotification = model<IRealtimeNotification>('RealtimeNotification', RealtimeNotificationSchema);