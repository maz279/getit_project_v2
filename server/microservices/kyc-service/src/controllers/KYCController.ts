/**
 * KYCController - Bangladesh KYC Verification Controller
 * Amazon.com/Shopee.sg Level KYC Management Backend
 */

import { Request, Response } from 'express';
import { KYCService } from '../services/KYCService';
import { BangladeshKYCValidator } from '../services/BangladeshKYCValidator';
import { NIDVerificationService } from '../services/NIDVerificationService';
import { TradeLicenseService } from '../services/TradeLicenseService';
import { TINVerificationService } from '../services/TINVerificationService';
import { BankAccountVerificationService } from '../services/BankAccountVerificationService';

export class KYCController {
  private kycService: KYCService;
  private bangladeshValidator: BangladeshKYCValidator;
  private nidService: NIDVerificationService;
  private tradeLicenseService: TradeLicenseService;
  private tinService: TINVerificationService;
  private bankAccountService: BankAccountVerificationService;

  constructor() {
    this.kycService = new KYCService();
    this.bangladeshValidator = new BangladeshKYCValidator();
    this.nidService = new NIDVerificationService();
    this.tradeLicenseService = new TradeLicenseService();
    this.tinService = new TINVerificationService();
    this.bankAccountService = new BankAccountVerificationService();
  }

  /**
   * Get all vendors pending KYC verification
   */
  public async getPendingKYCVendors(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      const vendors = await this.kycService.getPendingKYCVendors({
        status: status as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: vendors,
        message: 'Pending KYC vendors retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching pending KYC vendors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending KYC vendors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get KYC details for a specific vendor
   */
  public async getVendorKYC(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      
      const kycDetails = await this.kycService.getVendorKYC(vendorId);
      
      if (!kycDetails) {
        res.status(404).json({
          success: false,
          message: 'Vendor KYC details not found'
        });
        return;
      }

      res.json({
        success: true,
        data: kycDetails,
        message: 'Vendor KYC details retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching vendor KYC:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor KYC details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify National ID (NID)
   */
  public async verifyNID(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, nidNumber, documentUrl } = req.body;
      
      // Validate NID format for Bangladesh
      const isValidFormat = this.bangladeshValidator.validateNIDFormat(nidNumber);
      if (!isValidFormat) {
        res.status(400).json({
          success: false,
          message: 'Invalid NID format. Bangladesh NID must be 10, 13, or 17 digits'
        });
        return;
      }

      // Verify NID with government database (simulation)
      const verificationResult = await this.nidService.verifyNIDWithGovernmentDB(nidNumber);
      
      // Update KYC document status
      const updateResult = await this.kycService.updateDocumentVerificationStatus(
        vendorId,
        'nid',
        verificationResult.isValid ? 'verified' : 'rejected',
        {
          verificationDetails: verificationResult,
          verifiedBy: req.user?.id,
          verifiedAt: new Date()
        }
      );

      res.json({
        success: true,
        data: {
          verificationResult,
          documentStatus: updateResult
        },
        message: verificationResult.isValid 
          ? 'NID verified successfully' 
          : 'NID verification failed'
      });
    } catch (error) {
      console.error('Error verifying NID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify NID',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify Trade License
   */
  public async verifyTradeLicense(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, tradeLicenseNumber, issuingAuthority, documentUrl } = req.body;
      
      // Validate trade license format
      const isValidFormat = this.bangladeshValidator.validateTradeLicenseFormat(tradeLicenseNumber);
      if (!isValidFormat) {
        res.status(400).json({
          success: false,
          message: 'Invalid trade license format'
        });
        return;
      }

      // Verify with RJSC (Registrar of Joint Stock Companies and Firms)
      const verificationResult = await this.tradeLicenseService.verifyWithRJSC(
        tradeLicenseNumber,
        issuingAuthority
      );
      
      const updateResult = await this.kycService.updateDocumentVerificationStatus(
        vendorId,
        'trade_license',
        verificationResult.isValid ? 'verified' : 'rejected',
        {
          verificationDetails: verificationResult,
          verifiedBy: req.user?.id,
          verifiedAt: new Date()
        }
      );

      res.json({
        success: true,
        data: {
          verificationResult,
          documentStatus: updateResult
        },
        message: verificationResult.isValid 
          ? 'Trade license verified successfully' 
          : 'Trade license verification failed'
      });
    } catch (error) {
      console.error('Error verifying trade license:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify trade license',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify Tax Identification Number (TIN)
   */
  public async verifyTIN(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, tinNumber, documentUrl } = req.body;
      
      // Validate TIN format for Bangladesh
      const isValidFormat = this.bangladeshValidator.validateTINFormat(tinNumber);
      if (!isValidFormat) {
        res.status(400).json({
          success: false,
          message: 'Invalid TIN format. Bangladesh TIN must be 12 digits'
        });
        return;
      }

      // Verify with NBR (National Board of Revenue)
      const verificationResult = await this.tinService.verifyWithNBR(tinNumber);
      
      const updateResult = await this.kycService.updateDocumentVerificationStatus(
        vendorId,
        'tin',
        verificationResult.isValid ? 'verified' : 'rejected',
        {
          verificationDetails: verificationResult,
          verifiedBy: req.user?.id,
          verifiedAt: new Date()
        }
      );

      res.json({
        success: true,
        data: {
          verificationResult,
          documentStatus: updateResult
        },
        message: verificationResult.isValid 
          ? 'TIN verified successfully' 
          : 'TIN verification failed'
      });
    } catch (error) {
      console.error('Error verifying TIN:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify TIN',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify Bank Account
   */
  public async verifyBankAccount(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, accountNumber, bankName, branchCode, accountHolderName } = req.body;
      
      // Validate bank account details
      const isValidFormat = this.bangladeshValidator.validateBankAccountFormat(
        accountNumber,
        bankName
      );
      if (!isValidFormat) {
        res.status(400).json({
          success: false,
          message: 'Invalid bank account format'
        });
        return;
      }

      // Verify with Bangladesh Bank
      const verificationResult = await this.bankAccountService.verifyWithBangladeshBank({
        accountNumber,
        bankName,
        branchCode,
        accountHolderName
      });
      
      const updateResult = await this.kycService.updateDocumentVerificationStatus(
        vendorId,
        'bank_account',
        verificationResult.isValid ? 'verified' : 'rejected',
        {
          verificationDetails: verificationResult,
          verifiedBy: req.user?.id,
          verifiedAt: new Date()
        }
      );

      res.json({
        success: true,
        data: {
          verificationResult,
          documentStatus: updateResult
        },
        message: verificationResult.isValid 
          ? 'Bank account verified successfully' 
          : 'Bank account verification failed'
      });
    } catch (error) {
      console.error('Error verifying bank account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify bank account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Approve vendor after successful KYC verification
   */
  public async approveVendor(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { notes } = req.body;
      
      // Check if all KYC documents are verified
      const kycStatus = await this.kycService.checkKYCCompleteness(vendorId);
      
      if (!kycStatus.isComplete) {
        res.status(400).json({
          success: false,
          message: 'KYC verification incomplete',
          data: {
            missingDocuments: kycStatus.missingDocuments,
            pendingDocuments: kycStatus.pendingDocuments
          }
        });
        return;
      }

      // Approve vendor
      const approvalResult = await this.kycService.approveVendor(vendorId, {
        approvedBy: req.user?.id,
        approvedAt: new Date(),
        notes
      });

      res.json({
        success: true,
        data: approvalResult,
        message: 'Vendor approved successfully'
      });
    } catch (error) {
      console.error('Error approving vendor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve vendor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reject vendor KYC
   */
  public async rejectVendor(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { reason, notes } = req.body;
      
      const rejectionResult = await this.kycService.rejectVendor(vendorId, {
        rejectedBy: req.user?.id,
        rejectedAt: new Date(),
        reason,
        notes
      });

      res.json({
        success: true,
        data: rejectionResult,
        message: 'Vendor KYC rejected'
      });
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject vendor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get KYC compliance statistics
   */
  public async getKYCStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.kycService.getKYCStatistics();
      
      res.json({
        success: true,
        data: statistics,
        message: 'KYC statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching KYC statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch KYC statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Upload KYC document
   */
  public async uploadKYCDocument(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { documentType, documentNumber } = req.body;
      const documentFile = req.file;
      
      if (!documentFile) {
        res.status(400).json({
          success: false,
          message: 'Document file is required'
        });
        return;
      }

      const uploadResult = await this.kycService.uploadKYCDocument(vendorId, {
        documentType,
        documentNumber,
        documentFile,
        uploadedBy: req.user?.id
      });

      res.json({
        success: true,
        data: uploadResult,
        message: 'KYC document uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload KYC document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Bangladesh division and district list for address verification
   */
  public async getBangladeshLocationData(req: Request, res: Response): Promise<void> {
    try {
      const locationData = await this.kycService.getBangladeshLocationData();
      
      res.json({
        success: true,
        data: locationData,
        message: 'Bangladesh location data retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching Bangladesh location data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch location data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default KYCController;