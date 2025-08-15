/**
 * Enhanced KYC Controller - Amazon.com/Shopee.sg-Level Bangladesh Vendor Verification
 * 
 * Complete Bangladesh KYC verification system:
 * - National ID (NID) verification with government database integration
 * - Trade License verification with RJSC (Registrar of Joint Stock Companies)
 * - TIN Certificate verification with NBR (National Board of Revenue)
 * - Bank Account verification with Bangladesh banking system
 * - Business address verification with postal service
 * - Document processing with OCR and AI validation
 * - Automated compliance checking and regulatory reporting
 */

import { Request, Response } from 'express';
import { EnhancedKYCService } from '../services/EnhancedKYCService';
import { BangladeshDocumentValidator } from '../utils/bangladeshDocumentValidator';
import { DocumentProcessingService } from '../services/DocumentProcessingService';
import { ComplianceService } from '../services/ComplianceService';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../../../utils/logger';

export class EnhancedKYCController {
  private kycService: EnhancedKYCService;
  private documentValidator: BangladeshDocumentValidator;
  private documentProcessor: DocumentProcessingService;
  private complianceService: ComplianceService;
  private notificationService: NotificationService;

  constructor() {
    this.kycService = new EnhancedKYCService();
    this.documentValidator = new BangladeshDocumentValidator();
    this.documentProcessor = new DocumentProcessingService();
    this.complianceService = new ComplianceService();
    this.notificationService = new NotificationService();
  }

  /**
   * Get KYC verification status and progress
   */
  async getKYCStatus(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;

      if (!vendorId) {
        res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        });
        return;
      }

      const kycStatus = await this.kycService.getKYCStatus(vendorId);
      
      if (!kycStatus) {
        res.status(404).json({
          success: false,
          message: 'KYC record not found'
        });
        return;
      }

      // Get verification progress for each document type
      const verificationProgress = await this.kycService.getVerificationProgress(vendorId);
      
      // Get compliance status
      const complianceStatus = await this.complianceService.getVendorComplianceStatus(vendorId);

      res.json({
        success: true,
        kyc: {
          ...kycStatus,
          verificationProgress,
          complianceStatus
        }
      });

    } catch (error: any) {
      logger.error('Error getting KYC status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get KYC status',
        error: error.message
      });
    }
  }

  /**
   * Submit National ID (NID) for verification
   */
  async submitNIDVerification(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { nidNumber, dateOfBirth, fullName } = req.body;
      const nidFile = req.file;

      if (!nidFile) {
        res.status(400).json({
          success: false,
          message: 'NID document file is required'
        });
        return;
      }

      // Validate NID format
      const nidValidation = await this.documentValidator.validateNID({
        nidNumber,
        dateOfBirth,
        fullName
      });

      if (!nidValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'NID validation failed',
          errors: nidValidation.errors
        });
        return;
      }

      // Process document with OCR
      const ocrResult = await this.documentProcessor.processNIDDocument(nidFile);
      
      // Cross-validate OCR data with provided data
      const crossValidation = await this.documentValidator.crossValidateNIDData(
        { nidNumber, dateOfBirth, fullName },
        ocrResult
      );

      if (!crossValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Document data mismatch',
          errors: crossValidation.errors
        });
        return;
      }

      // Submit for government verification (Bangladesh NID database)
      const govVerification = await this.kycService.submitNIDToGovernmentVerification({
        vendorId,
        nidNumber,
        dateOfBirth,
        fullName,
        documentFile: nidFile,
        ocrData: ocrResult
      });

      res.json({
        success: true,
        message: 'NID submitted for verification successfully',
        verification: govVerification
      });

    } catch (error: any) {
      logger.error('Error submitting NID verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit NID verification',
        error: error.message
      });
    }
  }

  /**
   * Submit Trade License for verification
   */
  async submitTradeLicenseVerification(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        licenseNumber, 
        businessName, 
        businessType, 
        issueDate, 
        expiryDate,
        issuingAuthority 
      } = req.body;
      const licenseFile = req.file;

      if (!licenseFile) {
        res.status(400).json({
          success: false,
          message: 'Trade License document file is required'
        });
        return;
      }

      // Validate Trade License data
      const licenseValidation = await this.documentValidator.validateTradeLicense({
        licenseNumber,
        businessName,
        businessType,
        issueDate,
        expiryDate,
        issuingAuthority
      });

      if (!licenseValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Trade License validation failed',
          errors: licenseValidation.errors
        });
        return;
      }

      // Process document with OCR
      const ocrResult = await this.documentProcessor.processTradeLicenseDocument(licenseFile);

      // Submit for RJSC verification
      const rjscVerification = await this.kycService.submitTradeLicenseToRJSC({
        vendorId,
        licenseNumber,
        businessName,
        businessType,
        issueDate,
        expiryDate,
        issuingAuthority,
        documentFile: licenseFile,
        ocrData: ocrResult
      });

      res.json({
        success: true,
        message: 'Trade License submitted for verification successfully',
        verification: rjscVerification
      });

    } catch (error: any) {
      logger.error('Error submitting Trade License verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit Trade License verification',
        error: error.message
      });
    }
  }

  /**
   * Submit TIN Certificate for verification
   */
  async submitTINVerification(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        tinNumber, 
        businessName, 
        registrationDate,
        taxCircle,
        zone 
      } = req.body;
      const tinFile = req.file;

      if (!tinFile) {
        res.status(400).json({
          success: false,
          message: 'TIN Certificate document file is required'
        });
        return;
      }

      // Validate TIN data
      const tinValidation = await this.documentValidator.validateTIN({
        tinNumber,
        businessName,
        registrationDate,
        taxCircle,
        zone
      });

      if (!tinValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'TIN validation failed',
          errors: tinValidation.errors
        });
        return;
      }

      // Process document with OCR
      const ocrResult = await this.documentProcessor.processTINDocument(tinFile);

      // Submit for NBR verification
      const nbrVerification = await this.kycService.submitTINToNBR({
        vendorId,
        tinNumber,
        businessName,
        registrationDate,
        taxCircle,
        zone,
        documentFile: tinFile,
        ocrData: ocrResult
      });

      res.json({
        success: true,
        message: 'TIN Certificate submitted for verification successfully',
        verification: nbrVerification
      });

    } catch (error: any) {
      logger.error('Error submitting TIN verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit TIN verification',
        error: error.message
      });
    }
  }

  /**
   * Submit Bank Account for verification
   */
  async submitBankVerification(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        bankName,
        branchName,
        accountNumber,
        accountHolderName,
        accountType,
        routingNumber 
      } = req.body;
      const bankStatementFile = req.file;

      if (!bankStatementFile) {
        res.status(400).json({
          success: false,
          message: 'Bank statement file is required'
        });
        return;
      }

      // Validate bank account data
      const bankValidation = await this.documentValidator.validateBankAccount({
        bankName,
        branchName,
        accountNumber,
        accountHolderName,
        accountType,
        routingNumber
      });

      if (!bankValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Bank account validation failed',
          errors: bankValidation.errors
        });
        return;
      }

      // Process bank statement with OCR
      const ocrResult = await this.documentProcessor.processBankStatement(bankStatementFile);

      // Submit for bank verification
      const bankVerification = await this.kycService.submitBankAccountVerification({
        vendorId,
        bankName,
        branchName,
        accountNumber,
        accountHolderName,
        accountType,
        routingNumber,
        statementFile: bankStatementFile,
        ocrData: ocrResult
      });

      res.json({
        success: true,
        message: 'Bank account submitted for verification successfully',
        verification: bankVerification
      });

    } catch (error: any) {
      logger.error('Error submitting bank verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit bank verification',
        error: error.message
      });
    }
  }

  /**
   * Submit business address verification
   */
  async submitAddressVerification(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { 
        division,
        district,
        upazila,
        address,
        postalCode,
        coordinates 
      } = req.body;
      const addressProofFile = req.file;

      if (!addressProofFile) {
        res.status(400).json({
          success: false,
          message: 'Address proof document is required'
        });
        return;
      }

      // Validate Bangladesh address
      const addressValidation = await this.documentValidator.validateBangladeshAddress({
        division,
        district,
        upazila,
        address,
        postalCode,
        coordinates
      });

      if (!addressValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Address validation failed',
          errors: addressValidation.errors
        });
        return;
      }

      // Submit for postal service verification
      const addressVerification = await this.kycService.submitAddressVerification({
        vendorId,
        division,
        district,
        upazila,
        address,
        postalCode,
        coordinates,
        proofFile: addressProofFile
      });

      res.json({
        success: true,
        message: 'Address submitted for verification successfully',
        verification: addressVerification
      });

    } catch (error: any) {
      logger.error('Error submitting address verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit address verification',
        error: error.message
      });
    }
  }

  /**
   * Get verification requirements for Bangladesh
   */
  async getVerificationRequirements(req: Request, res: Response): Promise<void> {
    try {
      const { businessType } = req.query;

      const requirements = await this.kycService.getBangladeshKYCRequirements(
        businessType as string
      );

      res.json({
        success: true,
        requirements
      });

    } catch (error: any) {
      logger.error('Error getting verification requirements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get verification requirements',
        error: error.message
      });
    }
  }

  /**
   * Resubmit rejected document
   */
  async resubmitDocument(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, documentType } = req.params;
      const updatedData = req.body;
      const newFile = req.file;

      // Get rejection reason and feedback
      const rejectionInfo = await this.kycService.getDocumentRejectionInfo(
        vendorId,
        documentType
      );

      if (!rejectionInfo) {
        res.status(404).json({
          success: false,
          message: 'No rejection record found for this document'
        });
        return;
      }

      // Process resubmission based on document type
      let resubmissionResult;
      
      switch (documentType) {
        case 'nid':
          resubmissionResult = await this.submitNIDVerification(req, res);
          break;
        case 'trade_license':
          resubmissionResult = await this.submitTradeLicenseVerification(req, res);
          break;
        case 'tin':
          resubmissionResult = await this.submitTINVerification(req, res);
          break;
        case 'bank_account':
          resubmissionResult = await this.submitBankVerification(req, res);
          break;
        case 'address':
          resubmissionResult = await this.submitAddressVerification(req, res);
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Invalid document type'
          });
          return;
      }

      // Send notification about resubmission
      await this.notificationService.sendKYCResubmissionNotification(
        vendorId,
        documentType
      );

    } catch (error: any) {
      logger.error('Error resubmitting document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resubmit document',
        error: error.message
      });
    }
  }

  /**
   * Get KYC compliance report
   */
  async getComplianceReport(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;

      const complianceReport = await this.complianceService.generateVendorComplianceReport(
        vendorId
      );

      res.json({
        success: true,
        complianceReport
      });

    } catch (error: any) {
      logger.error('Error getting compliance report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get compliance report',
        error: error.message
      });
    }
  }

  /**
   * Check document expiry and send renewal alerts
   */
  async checkDocumentExpiry(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;

      const expiryCheck = await this.kycService.checkDocumentExpiry(vendorId);
      
      // Send renewal notifications if needed
      if (expiryCheck.hasExpiringDocuments) {
        await this.notificationService.sendDocumentRenewalAlerts(
          vendorId,
          expiryCheck.expiringDocuments
        );
      }

      res.json({
        success: true,
        expiryCheck
      });

    } catch (error: any) {
      logger.error('Error checking document expiry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check document expiry',
        error: error.message
      });
    }
  }

  /**
   * Get supported Bangladesh divisions and districts
   */
  async getBangladeshLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.documentValidator.getBangladeshLocationHierarchy();

      res.json({
        success: true,
        locations
      });

    } catch (error: any) {
      logger.error('Error getting Bangladesh locations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Bangladesh locations',
        error: error.message
      });
    }
  }
}