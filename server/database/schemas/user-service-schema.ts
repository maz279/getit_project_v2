/**
 * User Service Database Schema - Phase 1 Week 2
 * Isolated database schema for user management microservice
 * 
 * @fileoverview User service database schema with full isolation
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  uuid,
  jsonb,
  date,
  index,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ================================
// USER SERVICE CORE TABLES
// ================================

// Users table for authentication and core user data
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  phone: text("phone"),
  fullName: text("full_name"),
  avatar: text("avatar"),
  role: text("role", { enum: ["customer", "vendor", "admin", "moderator", "support", "super_admin"] }).default("customer").notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  preferredLanguage: text("preferred_language").default("en"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  
  // Bangladesh-specific fields
  nidNumber: text("nid_number").unique(),
  nidVerified: boolean("nid_verified").default(false),
  nidVerifiedAt: timestamp("nid_verified_at"),
  
  // Security fields
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  mfaEnabledAt: timestamp("mfa_enabled_at"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  passwordChangedAt: timestamp("password_changed_at"),
  
  // GDPR compliance
  dataProcessingConsent: boolean("data_processing_consent").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  consentGivenAt: timestamp("consent_given_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    usernameIdx: index('users_username_idx').on(table.username),
    emailIdx: index('users_email_idx').on(table.email),
    phoneIdx: index('users_phone_idx').on(table.phone),
    nidIdx: index('users_nid_idx').on(table.nidNumber),
    roleIdx: index('users_role_idx').on(table.role),
    activeIdx: index('users_active_idx').on(table.isActive),
  };
});

// User profiles for extended information
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  address: jsonb("address"),
  preferences: jsonb("preferences"),
  phoneVerificationCode: text("phone_verification_code"),
  emailVerificationCode: text("email_verification_code"),
  twoFactorSecret: text("two_factor_secret"),
  emergencyContacts: jsonb("emergency_contacts"),
  bio: text("bio"),
  website: text("website"),
  socialLinks: jsonb("social_links"),
  notificationSettings: jsonb("notification_settings"),
  privacySettings: jsonb("privacy_settings"),
  marketingConsent: boolean("marketing_consent").default(false),
  
  // Bangladesh-specific profile fields
  mobileBankingAccounts: jsonb("mobile_banking_accounts"), // bKash, Nagad, Rocket
  preferredCurrency: text("preferred_currency").default("BDT"),
  timezone: text("timezone").default("Asia/Dhaka"),
  culturalPreferences: jsonb("cultural_preferences"), // Festival notifications, prayer times
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('profiles_user_id_idx').on(table.userId),
    firstNameIdx: index('profiles_first_name_idx').on(table.firstName),
    lastNameIdx: index('profiles_last_name_idx').on(table.lastName),
  };
});

// User roles for advanced role management
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(),
  isSystemRole: boolean("is_system_role").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    nameIdx: index('user_roles_name_idx').on(table.name),
    systemRoleIdx: index('user_roles_system_idx').on(table.isSystemRole),
    activeIdx: index('user_roles_active_idx').on(table.isActive),
  };
});

// User sessions for session management
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  deviceInfo: jsonb("device_info"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
    sessionTokenIdx: index('user_sessions_token_idx').on(table.sessionToken),
    activeIdx: index('user_sessions_active_idx').on(table.isActive),
    expiresIdx: index('user_sessions_expires_idx').on(table.expiresAt),
  };
});

// User permissions for granular access control
export const userPermissions = pgTable("user_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: uuid("role_id").references(() => userRoles.id).notNull(),
  grantedBy: integer("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('user_permissions_user_id_idx').on(table.userId),
    roleIdIdx: index('user_permissions_role_id_idx').on(table.roleId),
    grantedByIdx: index('user_permissions_granted_by_idx').on(table.grantedBy),
    activeIdx: index('user_permissions_active_idx').on(table.isActive),
    uniqueUserRole: unique('unique_user_role').on(table.userId, table.roleId),
  };
});

// ================================
// USER SERVICE RELATIONS
// ================================

export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sessions: many(userSessions),
  permissions: many(userPermissions),
}));

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const userRoleRelations = relations(userRoles, ({ many }) => ({
  permissions: many(userPermissions),
}));

export const userSessionRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userPermissionRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  role: one(userRoles, {
    fields: [userPermissions.roleId],
    references: [userRoles.id],
  }),
  grantedByUser: one(users, {
    fields: [userPermissions.grantedBy],
    references: [users.id],
  }),
}));

// ================================
// USER SERVICE TYPES
// ================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;

// ================================
// USER SERVICE ZOD SCHEMAS
// ================================

export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertUserSessionSchema = createInsertSchema(userSessions);
export const insertUserPermissionSchema = createInsertSchema(userPermissions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;