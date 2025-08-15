import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../../../../shared/db';
import { 
  documentSubmissions, 
  insertDocumentSubmissionSchema,
  type InsertDocumentSubmission 
} from '../../../../shared/kyc-schema';
import { eq, and, desc } from 'drizzle-orm';
import { DocumentService } from '../services/DocumentService';
import { OCRService } from '../services/OCRService';
import { DocumentValidationService } from '../services/DocumentValidationService';
import { StorageService } from '../services/StorageService';
import { kycValidation } from '../middleware/validation';
import { auditLogger } from '../middleware/auditLogger';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.KYC_UPLOAD_PATH || 'uploads/kyc');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'));
    }
  }
});

export class DocumentController {
  public router: Router;
  private documentService: DocumentService;
  private ocrService: OCRService;
  private validationService: DocumentValidationService;
  private storageService: StorageService;

  constructor() {
    this.router = Router();
    this.documentService = new DocumentService();
    this.ocrService = new OCRService();
    this.validationService = new DocumentValidationService();
    this.storageService = new StorageService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Upload document
    this.router.post(
      '/upload',
      upload.single('document'),
      kycValidation.validateDocumentUpload,
      this.uploadDocument.bind(this)
    );

    // Upload multiple documents
    this.router.post(
      '/upload-multiple',
      upload.array('documents', 10),
      this.uploadMultipleDocuments.bind(this)
    );

    // Get documents for application
    this.router.get(
      '/application/:applicationId',
      this.getDocumentsByApplication.bind(this)
    );

    // Get specific document
    this.router.get(
      '/:documentId',
      this.getDocument.bind(this)
    );

    // Download document
    this.router.get(
      '/:documentId/download',
      this.downloadDocument.bind(this)
    );

    // Get document verification status
    this.router.get(
      '/:documentId/status',
      this.getDocumentStatus.bind(this)
    );

    // Reprocess document (re-run OCR and validation)
    this.router.post(
      '/:documentId/reprocess',
      this.reprocessDocument.bind(this)
    );

    // Delete document
    this.router.delete(
      '/:documentId',
      this.deleteDocument.bind(this)
    );

    // Get OCR results
    this.router.get(
      '/:documentId/ocr',
      this.getOCRResults.bind(this)
    );

    // Manual verification (admin only)
    this.router.post(
      '/:documentId/verify',
      this.manualVerification.bind(this)
    );

    // Get document templates
    this.router.get(
      '/templates/:documentType',
      this.getDocumentTemplate.bind(this)
    );
  }

  /**
   * Upload single document
   */
  private async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { kycApplicationId, documentType, documentNumber } = req.body;

      // Store file in cloud storage
      const fileUrl = await this.storageService.uploadFile(req.file);

      // Create document submission record
      const documentData: InsertDocumentSubmission = {
        kycApplicationId,
        documentType,
        documentNumber,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileFormat: path.extname(req.file.originalname).toLowerCase().slice(1)
      };

      const [document] = await db
        .insert(documentSubmissions)
        .values(documentData)
        .returning();

      // Process document asynchronously
      this.processDocumentAsync(document.id, fileUrl, documentType);

      // Log audit trail
      await auditLogger.logAction({
        kycApplicationId,
        action: 'document_uploaded',
        performedBy: req.body.userId,
        details: { 
          documentType, 
          fileName: req.file.originalname,
          documentId: document.id 
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          type: document.documentType,
          fileName: document.fileName,
          uploadedAt: document.uploadedAt,
          verificationStatus: document.verificationStatus
        }
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }

  /**
   * Upload multiple documents
   */
  private async uploadMultipleDocuments(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const { kycApplicationId } = req.body;
      const uploadedDocuments = [];

      for (const file of files) {
        try {
          // Store file in cloud storage
          const fileUrl = await this.storageService.uploadFile(file);

          // Determine document type from filename or request
          const documentType = this.determineDocumentType(file.originalname);

          // Create document submission record
          const documentData: InsertDocumentSubmission = {
            kycApplicationId,
            documentType,
            fileUrl,
            fileName: file.originalname,
            fileSize: file.size,
            fileFormat: path.extname(file.originalname).toLowerCase().slice(1)
          };

          const [document] = await db
            .insert(documentSubmissions)
            .values(documentData)
            .returning();

          uploadedDocuments.push(document);

          // Process document asynchronously
          this.processDocumentAsync(document.id, fileUrl, documentType);
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
        }
      }

      res.status(201).json({
        message: 'Documents uploaded successfully',
        documents: uploadedDocuments.map(doc => ({
          id: doc.id,
          type: doc.documentType,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt
        }))
      });
    } catch (error) {
      console.error('Error uploading multiple documents:', error);
      res.status(500).json({ error: 'Failed to upload documents' });
    }
  }

  /**
   * Get documents for application
   */
  private async getDocumentsByApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;

      const documents = await db
        .select()
        .from(documentSubmissions)
        .where(eq(documentSubmissions.kycApplicationId, applicationId))
        .orderBy(desc(documentSubmissions.uploadedAt));

      res.json({
        documents: documents.map(doc => ({
          id: doc.id,
          type: doc.documentType,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          uploadedAt: doc.uploadedAt,
          verificationStatus: doc.verificationStatus,
          ocrConfidence: doc.ocrConfidence,
          authenticityScore: doc.authenticityScore,
          qualityScore: doc.qualityScore
        }))
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }

  /**
   * Get specific document
   */
  private async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      const [document] = await db
        .select()
        .from(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId))
        .limit(1);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json({ document });
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  }

  /**
   * Download document
   */
  private async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      const [document] = await db
        .select()
        .from(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId))
        .limit(1);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Generate signed URL for secure download
      const downloadUrl = await this.storageService.getSignedDownloadUrl(document.fileUrl);

      res.json({ downloadUrl });
    } catch (error) {
      console.error('Error generating download URL:', error);
      res.status(500).json({ error: 'Failed to generate download URL' });
    }
  }

  /**
   * Get document verification status
   */
  private async getDocumentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      const [document] = await db
        .select({
          id: documentSubmissions.id,
          verificationStatus: documentSubmissions.verificationStatus,
          ocrConfidence: documentSubmissions.ocrConfidence,
          authenticityScore: documentSubmissions.authenticityScore,
          qualityScore: documentSubmissions.qualityScore,
          tamperingDetected: documentSubmissions.tamperingDetected,
          verificationDetails: documentSubmissions.verificationDetails,
          verificationNotes: documentSubmissions.verificationNotes
        })
        .from(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId))
        .limit(1);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json({ status: document });
    } catch (error) {
      console.error('Error fetching document status:', error);
      res.status(500).json({ error: 'Failed to fetch document status' });
    }
  }

  /**
   * Reprocess document
   */
  private async reprocessDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      const [document] = await db
        .select()
        .from(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId))
        .limit(1);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Reset verification status
      await db
        .update(documentSubmissions)
        .set({
          verificationStatus: 'pending',
          verificationDetails: null,
          verificationNotes: null
        })
        .where(eq(documentSubmissions.id, documentId));

      // Reprocess document
      await this.processDocumentAsync(documentId, document.fileUrl, document.documentType);

      res.json({
        message: 'Document reprocessing initiated',
        documentId
      });
    } catch (error) {
      console.error('Error reprocessing document:', error);
      res.status(500).json({ error: 'Failed to reprocess document' });
    }
  }

  /**
   * Delete document
   */
  private async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      const [document] = await db
        .select()
        .from(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId))
        .limit(1);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Delete from storage
      await this.storageService.deleteFile(document.fileUrl);

      // Delete from database
      await db
        .delete(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId));

      res.json({
        message: 'Document deleted successfully',
        documentId
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  /**
   * Get OCR results
   */
  private async getOCRResults(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;

      const [document] = await db
        .select({
          extractedData: documentSubmissions.extractedData,
          ocrConfidence: documentSubmissions.ocrConfidence
        })
        .from(documentSubmissions)
        .where(eq(documentSubmissions.id, documentId))
        .limit(1);

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json({
        extractedData: document.extractedData,
        confidence: document.ocrConfidence
      });
    } catch (error) {
      console.error('Error fetching OCR results:', error);
      res.status(500).json({ error: 'Failed to fetch OCR results' });
    }
  }

  /**
   * Manual verification (admin only)
   */
  private async manualVerification(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const { status, notes } = req.body;

      await db
        .update(documentSubmissions)
        .set({
          verificationStatus: status,
          verificationNotes: notes,
          verifiedAt: new Date()
        })
        .where(eq(documentSubmissions.id, documentId));

      res.json({
        message: 'Document verification updated',
        documentId,
        status
      });
    } catch (error) {
      console.error('Error updating document verification:', error);
      res.status(500).json({ error: 'Failed to update document verification' });
    }
  }

  /**
   * Get document template
   */
  private async getDocumentTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { documentType } = req.params;
      
      const template = await this.documentService.getDocumentTemplate(documentType);
      
      res.json({ template });
    } catch (error) {
      console.error('Error fetching document template:', error);
      res.status(500).json({ error: 'Failed to fetch document template' });
    }
  }

  /**
   * Process document asynchronously
   */
  private async processDocumentAsync(documentId: string, fileUrl: string, documentType: string): Promise<void> {
    try {
      // Perform OCR extraction
      const ocrResults = await this.ocrService.extractData(fileUrl, documentType);

      // Validate document authenticity
      const validation = await this.validationService.validateDocument(fileUrl, documentType, ocrResults);

      // Update document with results
      await db
        .update(documentSubmissions)
        .set({
          extractedData: ocrResults.data,
          ocrConfidence: ocrResults.confidence,
          authenticityScore: validation.authenticityScore,
          qualityScore: validation.qualityScore,
          tamperingDetected: validation.tamperingDetected,
          verificationStatus: validation.isValid ? 'verified' : 'failed',
          verificationDetails: validation.details
        })
        .where(eq(documentSubmissions.id, documentId));

    } catch (error) {
      console.error('Error processing document:', error);
      
      // Update document with error status
      await db
        .update(documentSubmissions)
        .set({
          verificationStatus: 'failed',
          verificationNotes: 'Processing failed: ' + error.message
        })
        .where(eq(documentSubmissions.id, documentId));
    }
  }

  /**
   * Determine document type from filename
   */
  private determineDocumentType(fileName: string): string {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('nid') || lowerName.includes('national')) return 'nid';
    if (lowerName.includes('passport')) return 'passport';
    if (lowerName.includes('license')) return 'driving_license';
    if (lowerName.includes('trade')) return 'trade_license';
    if (lowerName.includes('tin')) return 'tin_certificate';
    if (lowerName.includes('bank')) return 'bank_statement';
    if (lowerName.includes('utility') || lowerName.includes('bill')) return 'utility_bill';
    if (lowerName.includes('photo') || lowerName.includes('selfie')) return 'photo';
    
    return 'photo'; // Default fallback
  }
}

export default DocumentController;