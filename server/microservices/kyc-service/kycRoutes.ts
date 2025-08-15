import { Router, Request, Response } from 'express';
import { storage } from '../../storage';

const router = Router();

// Bangladesh-specific validation functions
class BangladeshValidationService {
  // National ID (NID) validation
  static validateNID(nidNumber: string): { valid: boolean; error?: string } {
    // Remove any spaces or dashes
    const cleanNID = nidNumber.replace(/[-\s]/g, '');
    
    // Check if it's either 10 or 13/17 digits (old or new format)
    if (!/^\d{10}$|^\d{13}$|^\d{17}$/.test(cleanNID)) {
      return { valid: false, error: 'Invalid NID format. Must be 10, 13, or 17 digits.' };
    }
    
    // Basic checksum validation for new format (13/17 digits)
    if (cleanNID.length >= 13) {
      // Implement actual NID checksum algorithm here
      // This is a simplified validation
      const firstDigit = parseInt(cleanNID[0]);
      if (firstDigit < 1 || firstDigit > 9) {
        return { valid: false, error: 'Invalid NID number format' };
      }
    }
    
    return { valid: true };
  }

  // Trade License validation
  static validateTradeLicense(licenseNumber: string): { valid: boolean; error?: string } {
    // Bangladesh Trade License format: City/District code + Year + Sequential number
    const tradeLicensePattern = /^[A-Z]{2,3}-\d{4}-\d{4,6}$/i;
    
    if (!tradeLicensePattern.test(licenseNumber)) {
      return { 
        valid: false, 
        error: 'Invalid trade license format. Expected format: DHK-2024-001234' 
      };
    }
    
    return { valid: true };
  }

  // TIN validation
  static validateTIN(tinNumber: string): { valid: boolean; error?: string } {
    // Bangladesh TIN format: 12 digits
    const cleanTIN = tinNumber.replace(/[-\s]/g, '');
    
    if (!/^\d{12}$/.test(cleanTIN)) {
      return { valid: false, error: 'Invalid TIN format. Must be 12 digits.' };
    }
    
    return { valid: true };
  }

  // Bangladesh mobile number validation
  static validateMobileNumber(phoneNumber: string): { valid: boolean; error?: string } {
    // Remove country code and formatting
    const cleanPhone = phoneNumber.replace(/[\+\-\s\(\)]/g, '');
    
    // Bangladesh mobile format: 880 + 1 + operator code + 8 digits
    const bdMobilePattern = /^880?1[3-9]\d{8}$/;
    
    if (!bdMobilePattern.test(cleanPhone)) {
      return { 
        valid: false, 
        error: 'Invalid Bangladesh mobile number format. Expected: +8801XXXXXXXXX' 
      };
    }
    
    return { valid: true };
  }

  // Bank account validation for major Bangladesh banks
  static validateBankAccount(accountNumber: string, bankCode: string): { valid: boolean; error?: string } {
    const cleanAccount = accountNumber.replace(/[-\s]/g, '');
    
    const bankValidation: Record<string, { minLength: number; maxLength: number; pattern?: RegExp }> = {
      'DBBL': { minLength: 13, maxLength: 16 }, // Dutch Bangla Bank
      'BRAC': { minLength: 13, maxLength: 15 }, // BRAC Bank
      'EBL': { minLength: 13, maxLength: 15 },  // Eastern Bank
      'IBL': { minLength: 13, maxLength: 15 },  // IFIC Bank
      'CBL': { minLength: 13, maxLength: 15 },  // City Bank
      'AB': { minLength: 13, maxLength: 15 },   // AB Bank
      'MTBL': { minLength: 13, maxLength: 15 }, // Mutual Trust Bank
      'NCCBL': { minLength: 13, maxLength: 15 }, // NCC Bank
    };
    
    const validation = bankValidation[bankCode];
    if (!validation) {
      return { valid: false, error: 'Unsupported bank code' };
    }
    
    if (cleanAccount.length < validation.minLength || cleanAccount.length > validation.maxLength) {
      return { 
        valid: false, 
        error: `Account number must be between ${validation.minLength} and ${validation.maxLength} digits for ${bankCode}` 
      };
    }
    
    return { valid: true };
  }
}

// KYC verification scoring system
class KYCScoringService {
  static calculateVerificationScore(kycData: any): number {
    let score = 0;
    let maxScore = 100;
    
    // Identity verification (30 points)
    if (kycData.nationalId?.verified) score += 30;
    
    // Business verification (40 points)
    if (kycData.tradeLicense?.verified) score += 20;
    if (kycData.tin?.verified) score += 20;
    
    // Financial verification (20 points)
    if (kycData.bankAccount?.verified) score += 20;
    
    // Address verification (10 points)
    if (kycData.businessAddressVerified) score += 10;
    
    return Math.min(score, maxScore);
  }
  
  static assessRiskLevel(score: number, kycData: any): 'low' | 'medium' | 'high' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  }
}

// GET /api/v1/kyc/applications - Get all KYC applications with filtering
router.get('/applications', async (req: Request, res: Response) => {
  try {
    const { status, riskLevel, limit = 20, offset = 0, search } = req.query;
    
    logger.info('Fetching KYC applications', {
      status: status as string,
      riskLevel: riskLevel as string,
      limit: Number(limit),
      offset: Number(offset)
    });
    
    // Mock implementation - replace with actual database query
    const mockApplications = [
      {
        id: 'kyc-001',
        vendorId: 'vendor-001',
        status: 'pending',
        verificationScore: 75,
        riskLevel: 'medium',
        submissionDate: new Date(),
        businessDetails: {
          businessName: 'Rahman Electronics Ltd.',
          businessType: 'Electronics Retail',
          tradeLicenseNumber: 'DHK-2024-001'
        }
      }
    ];
    
    res.json({
      success: true,
      data: {
        applications: mockApplications,
        total: mockApplications.length,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          hasMore: false
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching KYC applications', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC applications',
      details: error.message
    });
  }
});

// GET /api/v1/kyc/applications/:id - Get specific KYC application
router.get('/applications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    logger.info('Fetching KYC application details', { applicationId: id });
    
    // Mock implementation
    const mockApplication = {
      id,
      vendorId: 'vendor-001',
      status: 'pending',
      businessAddress: {
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        area: 'Dhanmondi 27',
        postalCode: '1205',
        fullAddress: 'House 15, Road 27, Dhanmondi, Dhaka-1205'
      },
      nationalId: {
        nidNumber: '1234567890123',
        name: 'Mohammad Rahman',
        verified: true,
        verificationDate: new Date()
      },
      tradeLicense: {
        licenseNumber: 'DHK-2024-001',
        businessName: 'Rahman Electronics Ltd.',
        verified: true,
        verificationDate: new Date()
      },
      verificationScore: 75,
      riskLevel: 'medium'
    };
    
    res.json({
      success: true,
      data: mockApplication
    });
  } catch (error) {
    logger.error('Error fetching KYC application', { 
      applicationId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC application'
    });
  }
});

// POST /api/v1/kyc/applications - Submit new KYC application
router.post('/applications', async (req: Request, res: Response) => {
  try {
    const kycData = req.body;
    
    logger.info('Processing new KYC application', { 
      vendorId: kycData.vendorId,
      businessName: kycData.businessName 
    });
    
    // Validate required fields
    const requiredFields = ['vendorId', 'businessAddress', 'contactNumber', 'email'];
    const missingFields = requiredFields.filter(field => !kycData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: { missingFields }
      });
    }
    
    // Validate Bangladesh-specific data
    const validationResults = [];
    
    if (kycData.nationalId?.nidNumber) {
      const nidValidation = BangladeshValidationService.validateNID(kycData.nationalId.nidNumber);
      if (!nidValidation.valid) {
        validationResults.push({ field: 'nationalId', error: nidValidation.error });
      }
    }
    
    if (kycData.tradeLicense?.licenseNumber) {
      const licenseValidation = BangladeshValidationService.validateTradeLicense(kycData.tradeLicense.licenseNumber);
      if (!licenseValidation.valid) {
        validationResults.push({ field: 'tradeLicense', error: licenseValidation.error });
      }
    }
    
    if (kycData.tin?.tinNumber) {
      const tinValidation = BangladeshValidationService.validateTIN(kycData.tin.tinNumber);
      if (!tinValidation.valid) {
        validationResults.push({ field: 'tin', error: tinValidation.error });
      }
    }
    
    if (kycData.contactNumber) {
      const phoneValidation = BangladeshValidationService.validateMobileNumber(kycData.contactNumber);
      if (!phoneValidation.valid) {
        validationResults.push({ field: 'contactNumber', error: phoneValidation.error });
      }
    }
    
    if (validationResults.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResults
      });
    }
    
    // Calculate verification score
    const verificationScore = KYCScoringService.calculateVerificationScore(kycData);
    const riskLevel = KYCScoringService.assessRiskLevel(verificationScore, kycData);
    
    // Create KYC application
    const applicationId = `kyc-${Date.now()}`;
    const application = {
      id: applicationId,
      ...kycData,
      status: 'pending',
      verificationScore,
      riskLevel,
      submissionDate: new Date(),
      complianceStatus: {
        bangladeshBankCompliant: false,
        ecommerceRegulationCompliant: false,
        taxCompliant: false,
        dataProtectionCompliant: false
      }
    };
    
    // Save to database (implement actual storage)
    // await storage.createKYCApplication(application);
    
    logger.info('KYC application created successfully', {
      applicationId,
      vendorId: kycData.vendorId,
      verificationScore,
      riskLevel
    });
    
    res.status(201).json({
      success: true,
      data: {
        applicationId,
        status: 'pending',
        verificationScore,
        riskLevel,
        message: 'KYC application submitted successfully'
      }
    });
  } catch (error) {
    logger.error('Error creating KYC application', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to create KYC application',
      details: error.message
    });
  }
});

// PUT /api/v1/kyc/applications/:id/status - Update KYC application status
router.put('/applications/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, approvedBy } = req.body;
    
    logger.info('Updating KYC application status', {
      applicationId: id,
      newStatus: status,
      approvedBy
    });
    
    const validStatuses = ['pending', 'in_review', 'approved', 'rejected', 'incomplete'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        details: { validStatuses }
      });
    }
    
    // Update application status (implement actual update)
    const updatedApplication = {
      id,
      status,
      reviewDate: new Date(),
      ...(status === 'approved' && { approvalDate: new Date(), approvedBy }),
      ...(status === 'rejected' && { rejectionReason })
    };
    
    logger.info('KYC application status updated', {
      applicationId: id,
      status,
      updatedBy: approvedBy
    });
    
    res.json({
      success: true,
      data: updatedApplication,
      message: `KYC application ${status} successfully`
    });
  } catch (error) {
    logger.error('Error updating KYC application status', {
      applicationId: req.params.id,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update KYC application status'
    });
  }
});

// POST /api/v1/kyc/verify/nid - Verify National ID with government database
router.post('/verify/nid', async (req: Request, res: Response) => {
  try {
    const { nidNumber, dateOfBirth } = req.body;
    
    logger.info('Verifying National ID', { nidNumber: nidNumber.slice(-4) });
    
    // Validate NID format
    const validation = BangladeshValidationService.validateNID(nidNumber);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // Mock NID verification with government database
    // In production, integrate with Bangladesh Election Commission API
    const verificationResult = {
      verified: true,
      name: 'Mohammad Rahman',
      fatherName: 'Abdul Rahman',
      motherName: 'Fatima Begum',
      dateOfBirth: '1985-05-15',
      address: {
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        fullAddress: 'House 15, Road 27, Dhanmondi, Dhaka-1205'
      },
      verificationDate: new Date()
    };
    
    logger.info('NID verification completed', {
      nidNumber: nidNumber.slice(-4),
      verified: verificationResult.verified
    });
    
    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    logger.error('Error verifying NID', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to verify National ID'
    });
  }
});

// POST /api/v1/kyc/verify/trade-license - Verify Trade License
router.post('/verify/trade-license', async (req: Request, res: Response) => {
  try {
    const { licenseNumber, businessName } = req.body;
    
    logger.info('Verifying Trade License', { licenseNumber });
    
    // Validate trade license format
    const validation = BangladeshValidationService.validateTradeLicense(licenseNumber);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // Mock trade license verification
    // In production, integrate with relevant authority APIs
    const verificationResult = {
      verified: true,
      businessName: businessName,
      businessType: 'Electronics Retail',
      ownerName: 'Mohammad Rahman',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-12-31'),
      issuingAuthority: 'Dhaka City Corporation',
      verificationDate: new Date()
    };
    
    logger.info('Trade License verification completed', {
      licenseNumber,
      verified: verificationResult.verified
    });
    
    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    logger.error('Error verifying Trade License', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to verify Trade License'
    });
  }
});

// POST /api/v1/kyc/verify/bank-account - Verify Bank Account
router.post('/verify/bank-account', async (req: Request, res: Response) => {
  try {
    const { accountNumber, bankCode, accountHolderName } = req.body;
    
    logger.info('Verifying Bank Account', { 
      accountNumber: accountNumber.slice(-4),
      bankCode 
    });
    
    // Validate bank account
    const validation = BangladeshValidationService.validateBankAccount(accountNumber, bankCode);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // Mock bank account verification
    // In production, integrate with Bangladesh Bank API
    const verificationResult = {
      verified: true,
      accountHolderName: accountHolderName,
      bankName: 'Dutch Bangla Bank Limited',
      branchName: 'Dhanmondi Branch',
      accountType: 'business',
      verificationDate: new Date()
    };
    
    logger.info('Bank Account verification completed', {
      accountNumber: accountNumber.slice(-4),
      verified: verificationResult.verified
    });
    
    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    logger.error('Error verifying Bank Account', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to verify Bank Account'
    });
  }
});

// GET /api/v1/kyc/statistics - Get KYC statistics
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching KYC statistics');
    
    // Mock statistics
    const stats = {
      totalApplications: 247,
      pendingReview: 23,
      approved: 198,
      rejected: 26,
      averageProcessingTime: 2.5, // days
      successRate: 88.3,
      monthlyGrowth: 15.2
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching KYC statistics', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC statistics'
    });
  }
});

// GET /api/v1/kyc/compliance-check/:vendorId - Check vendor compliance status
router.get('/compliance-check/:vendorId', async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    
    logger.info('Checking vendor compliance', { vendorId });
    
    // Mock compliance check
    const complianceStatus = {
      vendorId,
      overallCompliance: true,
      checks: {
        bangladeshBankCompliant: true,
        ecommerceRegulationCompliant: true,
        taxCompliant: true,
        dataProtectionCompliant: true,
        kycVerified: true,
        tradeLicenseValid: true,
        tinValid: true
      },
      lastChecked: new Date(),
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };
    
    res.json({
      success: true,
      data: complianceStatus
    });
  } catch (error) {
    logger.error('Error checking vendor compliance', {
      vendorId: req.params.vendorId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to check vendor compliance'
    });
  }
});

export { router as kycRoutes };