/**
 * Real-time Event Model
 * Amazon.com/Shopee.sg-Level event tracking and delivery
 */

import { Schema, model, Document } from 'mongoose';

export interface IRealtimeEvent extends Document {
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
    pending: number;
  };
  ttl: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  attempts: number;
  last_attempt: Date;
  error_log: Array<{
    timestamp: Date;
    error: string;
    recipient_id?: string;
  }>;
  metadata?: {
    source_service?: string;
    correlation_id?: string;
    user_agent?: string;
    location?: string;
  };
}

const RealtimeEventSchema = new Schema<IRealtimeEvent>({
  event_type: {
    type: String,
    required: true,
    index: true,
    enum: [
      'product_price_change',
      'product_stock_update', 
      'new_product_added',
      'order_status_update',
      'payment_status_update',
      'shipping_update',
      'notification',
      'chat_message',
      'presence_update',
      'system_announcement',
      'bangladesh_payment_update',
      'price_drop_alert',
      'restock_notification',
      'promotion_alert'
    ]
  },
  channel: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sender_id: {
    type: String,
    index: true
  },
  recipients: [{
    type: String,
    index: true
  }],
  delivery_status: {
    total_recipients: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  ttl: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  last_attempt: {
    type: Date
  },
  error_log: [{
    timestamp: { type: Date, default: Date.now },
    error: String,
    recipient_id: String
  }],
  metadata: {
    source_service: String,
    correlation_id: String,
    user_agent: String,
    location: String
  }
}, {
  timestamps: true,
  collection: 'realtime_events'
});

// Indexes for performance
RealtimeEventSchema.index({ event_type: 1, timestamp: -1 });
RealtimeEventSchema.index({ channel: 1, timestamp: -1 });
RealtimeEventSchema.index({ priority: 1, timestamp: -1 });
RealtimeEventSchema.index({ sender_id: 1, timestamp: -1 });
RealtimeEventSchema.index({ 'recipients': 1, timestamp: -1 });

export const RealtimeEvent = model<IRealtimeEvent>('RealtimeEvent', RealtimeEventSchema);