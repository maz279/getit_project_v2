import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  vendorApplications, 
  vendorDocuments, 
  vendorApplicationStatusHistory,
  vendorProfiles,
  insertVendorApplicationSchema,
  insertVendorDocumentSchema,
  insertVendorApplicationStatusHistorySchema,
  insertVendorProfileSchema,
  type VendorApplication,
  type VendorDocument,
  type VendorApplicationStatusHistory,
  type VendorProfile
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vendor-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Validation schemas
const vendorApplicationValidation = insertVendorApplicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  applicationNumber: true,
  status: true,
  currentStep: true,
  submittedAt: true,
  reviewedAt: true,
  approvedAt: true,
  rejectedAt: true,
  reviewedBy: true,
  rejectionReason: true,
  adminNotes: true
});

const updateApplicationValidation = vendorApplicationValidation.partial();

// Generate application number
function generateApplicationNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VND-${timestamp}-${random}`.toUpperCase();
}

// Create new vendor application
router.post('/applications', async (req, res) => {
  try {
    const validatedData = vendorApplicationValidation.parse(req.body);
    
    const applicationNumber = generateApplicationNumber();
    
    const [application] = await db
      .insert(vendorApplications)
      .values({
        ...validatedData,
        applicationNumber,
        status: 'pending',
        currentStep: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create status history entry
    await db.insert(vendorApplicationStatusHistory).values({
      applicationId: application.id,
      newStatus: 'pending',
      reason: 'Application created',
      notes: 'Initial application submission',
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Vendor application created successfully'
    });
  } catch (error) {
    console.error('Error creating vendor application:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid application data'
    });
  }
});

// Get application by ID
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [application] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, id));

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Get application documents
    const documents = await db
      .select()
      .from(vendorDocuments)
      .where(eq(vendorDocuments.applicationId, id));

    // Get status history
    const statusHistory = await db
      .select()
      .from(vendorApplicationStatusHistory)
      .where(eq(vendorApplicationStatusHistory.applicationId, id))
      .orderBy(desc(vendorApplicationStatusHistory.createdAt));

    res.json({
      success: true,
      data: {
        application,
        documents,
        statusHistory
      }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application'
    });
  }
});

// Update application
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateApplicationValidation.parse(req.body);
    
    const [application] = await db
      .update(vendorApplications)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(vendorApplications.id, id))
      .returning();

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : 'Invalid application data'
    });
  }
});

// Update application step
router.put('/applications/:id/step', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStep } = req.body;
    
    if (!currentStep || currentStep < 1 || currentStep > 9) {
      return res.status(400).json({
        success: false,
        error: 'Invalid step number. Must be between 1 and 9'
      });
    }

    const [application] = await db
      .update(vendorApplications)
      .set({
        currentStep,
        updatedAt: new Date()
      })
      .where(eq(vendorApplications.id, id))
      .returning();

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application,
      message: 'Application step updated successfully'
    });
  } catch (error) {
    console.error('Error updating application step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application step'
    });
  }
});

// Upload document
router.post('/applications/:id/documents', upload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        error: 'Document type is required'
      });
    }

    const validDocumentTypes = [
      'nid_front', 'nid_back', 'trade_license', 
      'tin_certificate', 'bank_statement', 'address_proof'
    ];

    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document type'
      });
    }

    // Check if application exists
    const [application] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, id));

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Delete existing document of the same type if exists
    await db
      .delete(vendorDocuments)
      .where(and(
        eq(vendorDocuments.applicationId, id),
        eq(vendorDocuments.documentType, documentType)
      ));

    // Insert new document
    const [document] = await db
      .insert(vendorDocuments)
      .values({
        applicationId: id,
        documentType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileUrl: `/uploads/vendor-documents/${req.file.filename}`,
        uploadedAt: new Date(),
        verificationStatus: 'pending'
      })
      .returning();

    res.json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
});

// Submit application for review
router.post('/applications/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if application exists
    const [application] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, id));

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Application can only be submitted if it is in pending status'
      });
    }

    // Update application status
    const [updatedApplication] = await db
      .update(vendorApplications)
      .set({
        status: 'under_review',
        submittedAt: new Date(),
        currentStep: 9,
        updatedAt: new Date()
      })
      .where(eq(vendorApplications.id, id))
      .returning();

    // Create status history entry
    await db.insert(vendorApplicationStatusHistory).values({
      applicationId: id,
      previousStatus: 'pending',
      newStatus: 'under_review',
      reason: 'Application submitted for review',
      notes: 'Application completed and submitted by vendor',
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: updatedApplication,
      message: 'Application submitted for review successfully'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
});

// Get all applications (for admin)
router.get('/applications', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      businessCategory,
      search 
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = db.select().from(vendorApplications);

    // Apply filters
    if (status) {
      query = query.where(eq(vendorApplications.status, status as string));
    }

    if (businessCategory) {
      query = query.where(eq(vendorApplications.businessCategory, businessCategory as string));
    }

    if (search) {
      // Note: This is a simplified search. In production, you'd want full-text search
      const searchTerm = `%${search}%`;
      query = query.where(
        sql`${vendorApplications.businessName} ILIKE ${searchTerm} OR 
            ${vendorApplications.email} ILIKE ${searchTerm} OR 
            ${vendorApplications.applicationNumber} ILIKE ${searchTerm}`
      );
    }

    const applications = await query
      .orderBy(desc(vendorApplications.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(vendorApplications);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: count,
          pages: Math.ceil(count / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// Admin approve/reject application
router.put('/applications/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNotes, rejectionReason } = req.body;
    const { reviewedBy } = req.body; // In production, get from auth middleware

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    const [application] = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, id));

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        error: 'Application must be under review to be processed'
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const statusDate = action === 'approve' ? 'approvedAt' : 'rejectedAt';

    // Update application
    const [updatedApplication] = await db
      .update(vendorApplications)
      .set({
        status: newStatus,
        [statusDate]: new Date(),
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || null,
        adminNotes,
        ...(action === 'reject' && { rejectionReason }),
        updatedAt: new Date()
      })
      .where(eq(vendorApplications.id, id))
      .returning();

    // Create status history entry
    await db.insert(vendorApplicationStatusHistory).values({
      applicationId: id,
      previousStatus: 'under_review',
      newStatus,
      changedBy: reviewedBy || null,
      reason: action === 'approve' ? 'Application approved' : 'Application rejected',
      notes: adminNotes || rejectionReason,
      createdAt: new Date()
    });

    // If approved, create vendor profile
    if (action === 'approve') {
      await db.insert(vendorProfiles).values({
        applicationId: id,
        userId: application.userId,
        profileComplete: false,
        isActive: true,
        isVerified: true,
        subscriptionPlan: 'basic',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: updatedApplication,
      message: `Application ${action}d successfully`
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review application'
    });
  }
});

export default router;