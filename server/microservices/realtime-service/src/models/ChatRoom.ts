/**
 * Chat Room Model
 * Amazon.com/Shopee.sg-Level chat functionality
 */

import { Schema, model, Document } from 'mongoose';

export interface IChatRoom extends Document {
  room_id: string;
  type: 'customer_support' | 'vendor_chat' | 'group_chat' | 'order_discussion' | 'product_inquiry';
  participants: Array<{
    user_id: string;
    role: 'customer' | 'vendor' | 'support_agent' | 'admin' | 'moderator';
    joined_at: Date;
    last_read_at?: Date;
    last_activity: Date;
    permissions: {
      can_send_messages: boolean;
      can_send_files: boolean;
      can_add_participants: boolean;
      can_remove_participants: boolean;
    };
  }>;
  created_by: string;
  created_at: Date;
  last_activity: Date;
  status: 'active' | 'archived' | 'closed' | 'suspended';
  metadata: {
    order_id?: string;
    product_id?: string;
    vendor_id?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    tags?: string[];
    language?: string;
  };
  settings: {
    auto_close_after: number; // hours
    max_participants: number;
    file_sharing_enabled: boolean;
    moderation_enabled: boolean;
    translation_enabled: boolean;
  };
  statistics: {
    total_messages: number;
    total_participants: number;
    average_response_time: number; // seconds
    satisfaction_rating?: number; // 1-5
    resolution_status?: 'resolved' | 'pending' | 'escalated';
  };
}

export interface IChatMessage extends Document {
  message_id: string;
  room_id: string;
  sender_id: string;
  sender_role: 'customer' | 'vendor' | 'support_agent' | 'admin' | 'system';
  message: string;
  message_bn?: string; // Bengali translation
  type: 'text' | 'image' | 'file' | 'system' | 'order_reference' | 'product_reference';
  timestamp: Date;
  edited_at?: Date;
  deleted_at?: Date;
  reply_to?: string; // message_id
  attachments?: Array<{
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
  }>;
  reactions?: Array<{
    user_id: string;
    emoji: string;
    timestamp: Date;
  }>;
  read_by: Array<{
    user_id: string;
    read_at: Date;
  }>;
  delivery_status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    auto_translated?: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

const ChatRoomSchema = new Schema<IChatRoom>({
  room_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['customer_support', 'vendor_chat', 'group_chat', 'order_discussion', 'product_inquiry'],
    required: true,
    index: true
  },
  participants: [{
    user_id: { type: String, required: true, index: true },
    role: { 
      type: String, 
      enum: ['customer', 'vendor', 'support_agent', 'admin', 'moderator'],
      required: true 
    },
    joined_at: { type: Date, default: Date.now },
    last_read_at: Date,
    last_activity: { type: Date, default: Date.now },
    permissions: {
      can_send_messages: { type: Boolean, default: true },
      can_send_files: { type: Boolean, default: true },
      can_add_participants: { type: Boolean, default: false },
      can_remove_participants: { type: Boolean, default: false }
    }
  }],
  created_by: {
    type: String,
    required: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  last_activity: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed', 'suspended'],
    default: 'active',
    index: true
  },
  metadata: {
    order_id: { type: String, index: true },
    product_id: { type: String, index: true },
    vendor_id: { type: String, index: true },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    category: String,
    tags: [String],
    language: { type: String, default: 'en' }
  },
  settings: {
    auto_close_after: { type: Number, default: 24 }, // hours
    max_participants: { type: Number, default: 10 },
    file_sharing_enabled: { type: Boolean, default: true },
    moderation_enabled: { type: Boolean, default: false },
    translation_enabled: { type: Boolean, default: true }
  },
  statistics: {
    total_messages: { type: Number, default: 0 },
    total_participants: { type: Number, default: 0 },
    average_response_time: { type: Number, default: 0 },
    satisfaction_rating: { type: Number, min: 1, max: 5 },
    resolution_status: { 
      type: String, 
      enum: ['resolved', 'pending', 'escalated']
    }
  }
}, {
  timestamps: true,
  collection: 'chat_rooms'
});

const ChatMessageSchema = new Schema<IChatMessage>({
  message_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  room_id: {
    type: String,
    required: true,
    index: true
  },
  sender_id: {
    type: String,
    required: true,
    index: true
  },
  sender_role: {
    type: String,
    enum: ['customer', 'vendor', 'support_agent', 'admin', 'system'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  message_bn: String, // Bengali translation
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'order_reference', 'product_reference'],
    default: 'text',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  edited_at: Date,
  deleted_at: Date,
  reply_to: String, // message_id
  attachments: [{
    file_id: String,
    file_name: String,
    file_type: String,
    file_size: Number,
    file_url: String
  }],
  reactions: [{
    user_id: String,
    emoji: String,
    timestamp: { type: Date, default: Date.now }
  }],
  read_by: [{
    user_id: String,
    read_at: { type: Date, default: Date.now }
  }],
  delivery_status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent',
    index: true
  },
  metadata: {
    ip_address: String,
    user_agent: String,
    auto_translated: { type: Boolean, default: false },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] }
  }
}, {
  timestamps: true,
  collection: 'chat_messages'
});

// Indexes for performance
ChatRoomSchema.index({ type: 1, status: 1, last_activity: -1 });
ChatRoomSchema.index({ 'participants.user_id': 1, status: 1 });
ChatRoomSchema.index({ 'metadata.priority': 1, status: 1 });

ChatMessageSchema.index({ room_id: 1, timestamp: -1 });
ChatMessageSchema.index({ sender_id: 1, timestamp: -1 });
ChatMessageSchema.index({ type: 1, timestamp: -1 });

export const ChatRoom = model<IChatRoom>('ChatRoom', ChatRoomSchema);
export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);