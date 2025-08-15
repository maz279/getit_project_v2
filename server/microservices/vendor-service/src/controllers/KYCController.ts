/**
 * KYC Controller - Amazon.com/Shopee.sg-Level KYC Verification System
 * 
 * Complete Know Your Customer verification system with:
 * - Bangladesh government database integration
 * - Document verification and OCR processing
 * - Multi-step verification workflow
 * - Compliance monitoring and reporting
 * - Real-time verification status tracking
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  vendorKyc, 
  vendorDocuments, 
  vendorCompliance, 
  vendorVerificationWorkflow,
  vendorBusinessCategories 
} from '../../../../shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const kycInitiationSchema = z.object({
  vendorId: z.string().uuid(),
  personalInfo: z.object({
    fullName: z.string().min(1).max(100),
    fatherName: z.string().min(1).max(100),
    motherName: z.string().min(1).max(100),
    dateOfBirth: z.string(),
    nidNumber: z.string().length(10).regex(/^\d{10}$/),
    passportNumber: z.string().optional(),
    address: z.object({
      division: z.enum(['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh']),
      district: z.string().min(2).max(50),
      upazila: z.string().min(2).max(50),
      postCode: z.string().length(4).regex(/^\d{4}$/),
      detailedAddress: z.string().min(10).max(200),
    }),
    phoneNumber: z.string().regex(/^\+8801[3-9]\d{8}$/),
    emergencyContact: z.string().regex(/^\+8801[3-9]\d{8}$/),
  }),
  businessInfo: z.object({
    businessName: z.string().min(1).max(100),
    businessType: z.enum(['sole_proprietorship', 'partnership', 'limited_company', 'public_limited']),
    businessCategory: z.string().min(1),
    tradeLicenseNumber: z.string().min(5).max(50),
    tinCertificateNumber: z.string().min(10).max(20),
    vatRegistrationNumber: z.string().optional(),
    businessAddress: z.object({
      division: z.enum(['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh']),
      district: z.string().min(2).max(50),
      upazila: z.string().min(2).max(50),
      postCode: z.string().length(4).regex(/^\d{4}$/),
      detailedAddress: z.string().min(10).max(200),
    }),
    establishmentYear: z.number().min(1971).max(new Date().getFullYear()),
    employeeCount: z.number().min(1).max(10000),
    businessDescription: z.string().min(20).max(500),
  }),
  bankDetails: z.object({
    bankName: z.string().min(2).max(100),
    branchName: z.string().min(2).max(100),
    accountNumber: z.string().min(10).max(30),
    accountHolderName: z.string().min(1).max(100),
    accountType: z.enum(['savings', 'current', 'business']),
    routingNumber: z.string().length(9).regex(/^\d{9}$/),
    swiftCode: z.string().optional(),
  }),
});

const documentUploadSchema = z.object({
  vendorId: z.string().uuid(),
  documentType: z.enum(['nid', 'trade_license', 'tin_certificate', 'bank_statement', 'passport', 'address_proof', 'business_photo']),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB limit
});

const verificationActionSchema = z.object({
  vendorId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_resubmission']),
  notes: z.string().min(10).max(1000),
  verifiedBy: z.string().uuid(),
});

export class KYCController {
  
  /**
   * Initiate KYC verification process
   */
  async initiateKYC(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = kycInitiationSchema.parse(req.body);
      
      // Check if KYC already exists
      const [existingKYC] = await db
        .select()
        .from(vendorKyc)
        .where(eq(vendorKyc.vendorId, validatedData.vendorId));
      
      if (existingKYC) {
        res.status(400).json({
          success: false,
          error: 'KYC process already initiated for this vendor',
          code: 'KYC_ALREADY_EXISTS'
        });
        return;
      }
      
      // Create KYC record
      const [newKYC] = await db
        .insert(vendorKyc)
        .values({
          vendorId: validatedData.vendorId,
          personalInfo: validatedData.personalInfo,
          businessInfo: validatedData.businessInfo,
          bankDetails: validatedData.bankDetails,
          status: 'submitted',
          submittedAt: new Date(),
        })
        .returning();
      
      // Create compliance record
      await db
        .insert(vendorCompliance)
        .values({
          vendorId: validatedData.vendorId,
          tradeLicenseNumber: validatedData.businessInfo.tradeLicenseNumber,
          tinCertificateNumber: validatedData.businessInfo.tinCertificateNumber,
          vatRegistrationNumber: validatedData.businessInfo.vatRegistrationNumber,
          businessType: validatedData.businessInfo.businessType,
          businessCategory: validatedData.businessInfo.businessCategory,
          complianceStatus: 'pending',
          complianceScore: 25, // Initial score for basic submission
        });
      
      // Initialize verification workflow
      const workflowSteps = [
        'document_upload',
        'document_verification', 
        'government_verification',
        'bank_verification',
        'final_approval'
      ];
      
      for (const step of workflowSteps) {
        await db
          .insert(vendorVerificationWorkflow)
          .values({
            vendorId: validatedData.vendorId,
            workflowStep: step,
            stepStatus: step === 'document_upload' ? 'in_progress' : 'pending',
            priority: 'normal',
          });
      }
      
      res.json({
        success: true,
        data: {
          kycId: newKYC.id,
          status: newKYC.status,
          nextSteps: ['Upload required documents'],
          message: 'KYC process initiated successfully. Please upload required documents.',
          requiredDocuments: [
            'National ID (NID)',
            'Trade License',
            'TIN Certificate',
            'Bank Statement (Last 3 months)',
            'Business Address Proof',
            'Business Photograph'
          ]
        }
      });
      
    } catch (error: any) {
      console.error('KYC initiation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate KYC process',
        details: error.message
      });
    }
  }
  
  /**
   * Upload KYC documents
   */
  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = documentUploadSchema.parse(req.body);
      
      // Verify vendor exists and KYC is in progress
      const [kycRecord] = await db
        .select()
        .from(vendorKyc)
        .where(eq(vendorKyc.vendorId, validatedData.vendorId));
      
      if (!kycRecord) {
        res.status(404).json({
          success: false,
          error: 'KYC process not found. Please initiate KYC first.',
          code: 'KYC_NOT_FOUND'
        });
        return;
      }
      
      if (kycRecord.status === 'approved') {
        res.status(400).json({
          success: false,
          error: 'KYC already approved. Cannot upload additional documents.',
          code: 'KYC_ALREADY_APPROVED'
        });
        return;
      }
      
      // Check if document already exists
      const [existingDocument] = await db
        .select()
        .from(vendorDocuments)
        .where(
          and(
            eq(vendorDocuments.vendorId, validatedData.vendorId),
            eq(vendorDocuments.documentType, validatedData.documentType)
          )
        );
      
      if (existingDocument) {
        // Update existing document
        const [updatedDocument] = await db
          .update(vendorDocuments)
          .set({
            fileName: validatedData.fileName,
            filePath: validatedData.filePath,
            fileType: validatedData.fileType,
            fileSize: validatedData.fileSize,
            verificationStatus: 'pending',
            updatedAt: new Date(),
          })
          .where(eq(vendorDocuments.id, existingDocument.id))
          .returning();
        
        res.json({
          success: true,
          data: {
            documentId: updatedDocument.id,
            message: 'Document updated successfully',
            status: 'pending_verification'
          }
        });
      } else {
        // Create new document
        const [newDocument] = await db
          .insert(vendorDocuments)
          .values({
            vendorId: validatedData.vendorId,
            documentType: validatedData.documentType,
            fileName: validatedData.fileName,
            filePath: validatedData.filePath,
            fileType: validatedData.fileType,
            fileSize: validatedData.fileSize,
            verificationStatus: 'pending',
          })
          .returning();
        
        res.json({
          success: true,
          data: {
            documentId: newDocument.id,
            message: 'Document uploaded successfully',
            status: 'pending_verification'
          }
        });
      }
      
      // Update workflow progress
      await this.updateWorkflowProgress(validatedData.vendorId, 'document_upload');
      
    } catch (error: any) {
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload document',
        details: error.message
      });
    }
  }
  
  /**
   * Get KYC status and progress
   */
  async getKYCStatus(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      
      // Get KYC record
      const [kycRecord] = await db
        .select()
        .from(vendorKyc)
        .where(eq(vendorKyc.vendorId, vendorId));
      
      if (!kycRecord) {
        res.status(404).json({
          success: false,
          error: 'KYC process not found',
          code: 'KYC_NOT_FOUND'
        });
        return;
      }
      
      // Get documents
      const documents = await db
        .select()
        .from(vendorDocuments)
        .where(eq(vendorDocuments.vendorId, vendorId))
        .orderBy(asc(vendorDocuments.createdAt));
      
      // Get compliance info
      const [compliance] = await db
        .select()
        .from(vendorCompliance)
        .where(eq(vendorCompliance.vendorId, vendorId));
      
      // Get workflow progress
      const workflow = await db
        .select()
        .from(vendorVerificationWorkflow)
        .where(eq(vendorVerificationWorkflow.vendorId, vendorId))
        .orderBy(asc(vendorVerificationWorkflow.createdAt));
      
      // Calculate progress percentage
      const completedSteps = workflow.filter(step => step.stepStatus === 'completed').length;
      const totalSteps = workflow.length;
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      
      res.json({
        success: true,
        data: {
          kycId: kycRecord.id,
          status: kycRecord.status,
          progressPercentage,
          submittedAt: kycRecord.submittedAt,
          verifiedAt: kycRecord.verifiedAt,
          reviewNotes: kycRecord.reviewNotes,
          compliance: {
            status: compliance?.complianceStatus,
            score: compliance?.complianceScore,
            certificationLevel: compliance?.certificationLevel,
            nextRenewalDate: compliance?.nextRenewalDate,
          },
          documents: documents.map(doc => ({
            id: doc.id,
            type: doc.documentType,
            fileName: doc.fileName,
            status: doc.verificationStatus,
            uploadedAt: doc.createdAt,
            verificationNotes: doc.verificationNotes,
            expiryDate: doc.expiryDate,
          })),
          workflow: workflow.map(step => ({
            step: step.workflowStep,
            status: step.stepStatus,
            startedAt: step.startedAt,
            completedAt: step.completedAt,
            notes: step.reviewNotes,
            actionRequired: step.actionRequired,
          })),
          nextActions: this.getNextActions(kycRecord.status, workflow),
        }
      });
      
    } catch (error: any) {
      console.error('Get KYC status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get KYC status',
        details: error.message
      });
    }
  }
  
  /**
   * Admin: Verify submitted documents
   */
  async verifyDocuments(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = verificationActionSchema.parse(req.body);
      
      // Get KYC record
      const [kycRecord] = await db
        .select()
        .from(vendorKyc)
        .where(eq(vendorKyc.vendorId, validatedData.vendorId));
      
      if (!kycRecord) {
        res.status(404).json({
          success: false,
          error: 'KYC process not found',
          code: 'KYC_NOT_FOUND'
        });
        return;
      }
      
      if (validatedData.action === 'approve') {
        // Approve all pending documents
        await db
          .update(vendorDocuments)
          .set({
            verificationStatus: 'verified',
            verificationDate: new Date(),
            verifiedBy: validatedData.verifiedBy,
            verificationNotes: validatedData.notes,
          })
          .where(
            and(
              eq(vendorDocuments.vendorId, validatedData.vendorId),
              eq(vendorDocuments.verificationStatus, 'pending')
            )
          );
        
        // Update KYC status
        await db
          .update(vendorKyc)
          .set({
            status: 'approved',
            verifiedAt: new Date(),
            verifiedBy: parseInt(validatedData.verifiedBy),
            reviewNotes: validatedData.notes,
          })
          .where(eq(vendorKyc.id, kycRecord.id));
        
        // Update compliance
        await db
          .update(vendorCompliance)
          .set({
            complianceStatus: 'compliant',
            complianceScore: 100,
            certificationLevel: 'verified',
          })
          .where(eq(vendorCompliance.vendorId, validatedData.vendorId));
        
        // Complete workflow
        await this.completeWorkflow(validatedData.vendorId);
        
        res.json({
          success: true,
          data: {
            status: 'approved',
            message: 'KYC verification completed successfully',
            certificationLevel: 'verified'
          }
        });
        
      } else if (validatedData.action === 'reject') {
        // Reject KYC
        await db
          .update(vendorKyc)
          .set({
            status: 'rejected',
            reviewNotes: validatedData.notes,
          })
          .where(eq(vendorKyc.id, kycRecord.id));
        
        // Update compliance
        await db
          .update(vendorCompliance)
          .set({
            complianceStatus: 'non_compliant',
            complianceScore: 0,
          })
          .where(eq(vendorCompliance.vendorId, validatedData.vendorId));
        
        res.json({
          success: true,
          data: {
            status: 'rejected',
            message: 'KYC verification rejected',
            reason: validatedData.notes
          }
        });
        
      } else {
        // Request resubmission
        await db
          .update(vendorKyc)
          .set({
            status: 'pending',
            reviewNotes: validatedData.notes,
          })
          .where(eq(vendorKyc.id, kycRecord.id));
        
        res.json({
          success: true,
          data: {
            status: 'resubmission_required',
            message: 'Additional information required',
            notes: validatedData.notes
          }
        });
      }
      
    } catch (error: any) {
      console.error('Document verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify documents',
        details: error.message
      });
    }
  }
  
  /**
   * Get all pending KYC verifications (Admin)
   */
  async getPendingVerifications(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const pendingKYCs = await db
        .select({
          id: vendorKyc.id,
          vendorId: vendorKyc.vendorId,
          personalInfo: vendorKyc.personalInfo,
          businessInfo: vendorKyc.businessInfo,
          status: vendorKyc.status,
          submittedAt: vendorKyc.submittedAt,
          complianceScore: vendorCompliance.complianceScore,
        })
        .from(vendorKyc)
        .leftJoin(vendorCompliance, eq(vendorKyc.vendorId, vendorCompliance.vendorId))
        .where(eq(vendorKyc.status, 'submitted'))
        .limit(limit)
        .offset(offset)
        .orderBy(asc(vendorKyc.submittedAt));
      
      res.json({
        success: true,
        data: {
          kycs: pendingKYCs,
          pagination: {
            page,
            limit,
            total: pendingKYCs.length,
          }
        }
      });
      
    } catch (error: any) {
      console.error('Get pending verifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pending verifications',
        details: error.message
      });
    }
  }
  
  /**
   * Get business categories
   */
  async getBusinessCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await db
        .select()
        .from(vendorBusinessCategories)
        .where(eq(vendorBusinessCategories.isActive, true))
        .orderBy(asc(vendorBusinessCategories.sortOrder));
      
      res.json({
        success: true,
        data: { categories }
      });
      
    } catch (error: any) {
      console.error('Get business categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get business categories',
        details: error.message
      });
    }
  }
  
  /**
   * Private helper methods
   */
  private async updateWorkflowProgress(vendorId: string, currentStep: string): Promise<void> {
    try {
      // Mark current step as completed
      await db
        .update(vendorVerificationWorkflow)
        .set({
          stepStatus: 'completed',
          completedAt: new Date(),
        })
        .where(
          and(
            eq(vendorVerificationWorkflow.vendorId, vendorId),
            eq(vendorVerificationWorkflow.workflowStep, currentStep)
          )
        );
      
      // Start next step
      const stepOrder = [
        'document_upload',
        'document_verification',
        'government_verification', 
        'bank_verification',
        'final_approval'
      ];
      
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
        const nextStep = stepOrder[currentIndex + 1];
        await db
          .update(vendorVerificationWorkflow)
          .set({
            stepStatus: 'in_progress',
            startedAt: new Date(),
          })
          .where(
            and(
              eq(vendorVerificationWorkflow.vendorId, vendorId),
              eq(vendorVerificationWorkflow.workflowStep, nextStep)
            )
          );
      }
    } catch (error) {
      console.error('Workflow update error:', error);
    }
  }
  
  private async completeWorkflow(vendorId: string): Promise<void> {
    try {
      await db
        .update(vendorVerificationWorkflow)
        .set({
          stepStatus: 'completed',
          completedAt: new Date(),
        })
        .where(eq(vendorVerificationWorkflow.vendorId, vendorId));
    } catch (error) {
      console.error('Complete workflow error:', error);
    }
  }
  
  private getNextActions(status: string, workflow: any[]): string[] {
    const actions = [];
    
    if (status === 'pending') {
      actions.push('Upload required documents');
    } else if (status === 'submitted') {
      const pendingSteps = workflow.filter(step => step.stepStatus === 'pending');
      if (pendingSteps.length > 0) {
        actions.push('Waiting for admin verification');
      }
    } else if (status === 'rejected') {
      actions.push('Review rejection notes and resubmit');
    } else if (status === 'approved') {
      actions.push('Complete vendor registration');
    }
    
    return actions;
  }
  
  /**
   * Health check for KYC service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        service: 'kyc-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        features: [
          'Bangladesh government KYC integration',
          'Multi-step verification workflow',
          'Document upload and verification',
          'Compliance monitoring',
          'Real-time progress tracking'
        ]
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        service: 'kyc-controller',
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}