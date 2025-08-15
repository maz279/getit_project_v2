import { z } from 'zod';

// User schema for the user service database
export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password_hash: z.string(),
  phone: z.string().optional(),
  phone_country_code: z.string().default('+880'),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
  
  // Bangladesh-specific fields
  nid_number: z.string().optional(),
  nid_verified: z.boolean().default(false),
  preferred_language: z.string().default('bn'),
  preferred_currency: z.string().default('BDT'),
  
  // Metadata
  created_at: z.date(),
  updated_at: z.date(),
  last_login_at: z.date().optional(),
  login_count: z.number().int().default(0),
  failed_login_attempts: z.number().int().default(0),
  account_locked_until: z.date().optional()
});

// Schema for creating a new user
export const insertUserSchema = userSchema.omit({
  id: true,
  password_hash: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
  login_count: true,
  failed_login_attempts: true,
  account_locked_until: true
}).extend({
  password: z.string().min(8)
});

// User profile schema
export const userProfileSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  date_of_birth: z.date().optional(),
  gender: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
  
  // Bangladesh cultural fields
  religion: z.string().optional(),
  marital_status: z.string().optional(),
  occupation: z.string().optional(),
  monthly_income_range: z.string().optional(),
  
  // Preferences
  notification_preferences: z.record(z.any()).default({}),
  privacy_settings: z.record(z.any()).default({}),
  
  updated_at: z.date()
});

// User address schema
export const userAddressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['shipping', 'billing', 'pickup']).default('shipping'),
  is_default: z.boolean().default(false),
  
  // Address fields
  label: z.string().optional(),
  recipient_name: z.string(),
  phone: z.string(),
  address_line1: z.string(),
  address_line2: z.string().optional(),
  
  // Bangladesh-specific addressing
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  union_name: z.string().optional(),
  village: z.string().optional(),
  postal_code: z.string().optional(),
  
  // Geolocation
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  created_at: z.date(),
  updated_at: z.date()
});

// Schema for creating a new address
export const insertUserAddressSchema = userAddressSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserAddress = z.infer<typeof userAddressSchema>;
export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;