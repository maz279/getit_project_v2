import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  uuid, 
  jsonb, 
  decimal, 
  integer, 
  boolean,
  index 
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// KYC Applications table
export const kycApplications = pgTable('kyc_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  applicationType: varchar('application_type', { length: 50 }).notNull().default('vendor'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  applicationData: jsonb('application_data'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: integer('reviewed_by'),
  reviewNotes: text('review_notes'),
  riskLevel: varchar('risk_level', { length: 20 }),
  autoVerificationScore: varchar('auto_verification_score', { length: 10 }),
  manualReviewRequired: boolean('manual_review_required').default(false),
  complianceStatus: varchar('compliance_status', { length: 20 }),
  governmentVerificationStatus: varchar('government_verification_status', { length: 20 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  deviceFingerprint: text('device_fingerprint'),
  applicationSource: varchar('application_source', { length: 20 }),
  locationData: jsonb('location_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('kyc_applications_user_id_idx').on(table.userId),
  statusIdx: index('kyc_applications_status_idx').on(table.status),
  submittedAtIdx: index('kyc_applications_submitted_at_idx').on(table.submittedAt)
}));

// Document Submissions table
export const documentSubmissions = pgTable('document_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  kycApplicationId: uuid('kyc_application_id').notNull().references(() => kycApplications.id),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  ocrExtractedData: jsonb('ocr_extracted_data'),
  ocrConfidence: decimal('ocr_confidence', { precision: 5, scale: 4 }),
  authenticityScore: decimal('authenticity_score', { precision: 5, scale: 4 }),
  qualityScore: decimal('quality_score', { precision: 5, scale: 4 }),
  tamperingDetected: boolean('tampering_detected').default(false),
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'),
  verificationDetails: jsonb('verification_details'),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  applicationIdIdx: index('document_submissions_application_id_idx').on(table.kycApplicationId),
  documentTypeIdx: index('document_submissions_document_type_idx').on(table.documentType)
}));

// Identity Verification table
export const identityVerifications = pgTable('identity_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  kycApplicationId: uuid('kyc_application_id').notNull().references(() => kycApplications.id),
  verificationType: varchar('verification_type', { length: 50 }).notNull(),
  verificationData: jsonb('verification_data'),
  faceMatchScore: decimal('face_match_score', { precision: 5, scale: 4 }),
  livenessScore: decimal('liveness_score', { precision: 5, scale: 4 }),
  biometricData: jsonb('biometric_data'),
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'),
  verificationDetails: jsonb('verification_details'),
  attemptCount: integer('attempt_count').default(1),
  maxAttempts: integer('max_attempts').default(3),
  lastAttemptAt: timestamp('last_attempt_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  applicationIdIdx: index('identity_verifications_application_id_idx').on(table.kycApplicationId),
  verificationTypeIdx: index('identity_verifications_verification_type_idx').on(table.verificationType)
}));

// Risk Assessments table
export const kycRiskAssessments = pgTable('kyc_risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  kycApplicationId: uuid('kyc_application_id').notNull().references(() => kycApplications.id),
  riskFactors: jsonb('risk_factors'),
  riskScore: varchar('risk_score', { length: 10 }),
  riskLevel: varchar('risk_level', { length: 20 }),
  assessmentDetails: jsonb('assessment_details'),
  modelVersion: varchar('model_version', { length: 20 }),
  algorithmUsed: varchar('algorithm_used', { length: 50 }),
  inputFeatures: jsonb('input_features'),
  confidenceInterval: jsonb('confidence_interval'),
  documentRisk: varchar('document_risk', { length: 10 }),
  identityRisk: varchar('identity_risk', { length: 10 }),
  behavioralRisk: varchar('behavioral_risk', { length: 10 }),
  geographicalRisk: varchar('geographical_risk', { length: 10 }),
  transactionRisk: varchar('transaction_risk', { length: 10 }),
  assessedBy: varchar('assessed_by', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  applicationIdIdx: index('kyc_risk_assessments_application_id_idx').on(table.kycApplicationId),
  riskLevelIdx: index('kyc_risk_assessments_risk_level_idx').on(table.riskLevel)
}));

// Verification Workflows table
export const kycVerificationWorkflows = pgTable('kyc_verification_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  kycApplicationId: uuid('kyc_application_id').notNull().references(() => kycApplications.id),
  workflowStep: varchar('workflow_step', { length: 50 }).notNull(),
  stepOrder: integer('step_order').notNull(),
  stepType: varchar('step_type', { length: 20 }).notNull(),
  stepStatus: varchar('step_status', { length: 20 }).notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  estimatedDuration: integer('estimated_duration'),
  actualDuration: integer('actual_duration'),
  requiredActions: jsonb('required_actions'),
  completionCriteria: jsonb('completion_criteria'),
  reviewNotes: text('review_notes'),
  actionRequired: boolean('action_required').default(false),
  assignedTo: integer('assigned_to'),
  priority: varchar('priority', { length: 20 }).default('normal'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  applicationIdIdx: index('kyc_verification_workflows_application_id_idx').on(table.kycApplicationId),
  stepStatusIdx: index('kyc_verification_workflows_step_status_idx').on(table.stepStatus),
  stepOrderIdx: index('kyc_verification_workflows_step_order_idx').on(table.stepOrder)
}));

// Compliance Checks table
export const complianceChecks = pgTable('compliance_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  kycApplicationId: uuid('kyc_application_id').notNull().references(() => kycApplications.id),
  checkType: varchar('check_type', { length: 50 }).notNull(),
  checkStatus: varchar('check_status', { length: 20 }).default('pending'),
  checkResult: jsonb('check_result'),
  complianceScore: decimal('compliance_score', { precision: 5, scale: 4 }),
  regulatoryFramework: varchar('regulatory_framework', { length: 100 }),
  sanctionListChecked: boolean('sanction_list_checked').default(false),
  pepCheck: boolean('pep_check').default(false),
  adverseMediaCheck: boolean('adverse_media_check').default(false),
  governmentDatabaseCheck: boolean('government_database_check').default(false),
  checkDetails: jsonb('check_details'),
  lastCheckedAt: timestamp('last_checked_at'),
  nextCheckDue: timestamp('next_check_due'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  applicationIdIdx: index('compliance_checks_application_id_idx').on(table.kycApplicationId),
  checkTypeIdx: index('compliance_checks_check_type_idx').on(table.checkType),
  checkStatusIdx: index('compliance_checks_check_status_idx').on(table.checkStatus)
}));

// Create schemas
export const insertKycApplicationSchema = createInsertSchema(kycApplications);
export const selectKycApplicationSchema = createSelectSchema(kycApplications);

export const insertDocumentSubmissionSchema = createInsertSchema(documentSubmissions);
export const selectDocumentSubmissionSchema = createSelectSchema(documentSubmissions);

export const insertIdentityVerificationSchema = createInsertSchema(identityVerifications);
export const selectIdentityVerificationSchema = createSelectSchema(identityVerifications);

export const insertKycRiskAssessmentSchema = createInsertSchema(kycRiskAssessments);
export const selectKycRiskAssessmentSchema = createSelectSchema(kycRiskAssessments);

export const insertKycVerificationWorkflowSchema = createInsertSchema(kycVerificationWorkflows);
export const selectKycVerificationWorkflowSchema = createSelectSchema(kycVerificationWorkflows);

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks);
export const selectComplianceCheckSchema = createSelectSchema(complianceChecks);

// Type exports
export type KycApplication = typeof kycApplications.$inferSelect;
export type InsertKycApplication = typeof kycApplications.$inferInsert;

export type DocumentSubmission = typeof documentSubmissions.$inferSelect;
export type InsertDocumentSubmission = typeof documentSubmissions.$inferInsert;

export type IdentityVerification = typeof identityVerifications.$inferSelect;
export type InsertIdentityVerification = typeof identityVerifications.$inferInsert;

export type KycRiskAssessment = typeof kycRiskAssessments.$inferSelect;
export type InsertKycRiskAssessment = typeof kycRiskAssessments.$inferInsert;

export type KycVerificationWorkflow = typeof kycVerificationWorkflows.$inferSelect;
export type InsertKycVerificationWorkflow = typeof kycVerificationWorkflows.$inferInsert;

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = typeof complianceChecks.$inferInsert;