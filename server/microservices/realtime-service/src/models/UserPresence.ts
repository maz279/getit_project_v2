/**
 * User Presence Model
 * Amazon.com/Shopee.sg-Level user activity tracking
 */

import { Schema, model, Document } from 'mongoose';

export interface IUserPresence extends Document {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: Date;
  current_page: string;
  shopping_activity: {
    viewing_product?: string;
    cart_items: number;
    in_checkout: boolean;
    browsing_category?: string;
    search_query?: string;
    wish_list_items?: number;
  };
  device_count: number;
  devices: Array<{
    device_id: string;
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    app_version?: string;
    last_activity: Date;
  }>;
  location: 'home' | 'product_page' | 'cart' | 'checkout' | 'profile' | 'orders' | 'search';
  geographic_location?: {
    country: string;
    city: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  preferences: {
    language: string;
    timezone: string;
    notifications_enabled: boolean;
    real_time_updates: boolean;
  };
  session_data: {
    session_start: Date;
    total_time: number; // seconds
    pages_visited: number;
    interactions: number;
  };
}

const UserPresenceSchema = new Schema<IUserPresence>({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline',
    index: true
  },
  last_seen: {
    type: Date,
    default: Date.now,
    index: true
  },
  current_page: {
    type: String,
    default: '/'
  },
  shopping_activity: {
    viewing_product: String,
    cart_items: { type: Number, default: 0 },
    in_checkout: { type: Boolean, default: false },
    browsing_category: String,
    search_query: String,
    wish_list_items: { type: Number, default: 0 }
  },
  device_count: {
    type: Number,
    default: 0
  },
  devices: [{
    device_id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['mobile', 'desktop', 'tablet'],
      required: true 
    },
    os: String,
    browser: String,
    app_version: String,
    last_activity: { type: Date, default: Date.now }
  }],
  location: {
    type: String,
    enum: ['home', 'product_page', 'cart', 'checkout', 'profile', 'orders', 'search'],
    default: 'home',
    index: true
  },
  geographic_location: {
    country: { type: String, default: 'BD' },
    city: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Dhaka' },
    notifications_enabled: { type: Boolean, default: true },
    real_time_updates: { type: Boolean, default: true }
  },
  session_data: {
    session_start: { type: Date, default: Date.now },
    total_time: { type: Number, default: 0 },
    pages_visited: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'user_presence'
});

// Indexes for performance
UserPresenceSchema.index({ status: 1, last_seen: -1 });
UserPresenceSchema.index({ location: 1, status: 1 });
UserPresenceSchema.index({ 'geographic_location.city': 1, status: 1 });
UserPresenceSchema.index({ 'shopping_activity.viewing_product': 1 });

export const UserPresence = model<IUserPresence>('UserPresence', UserPresenceSchema);