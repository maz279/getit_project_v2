/**
 * KYC Service - Amazon.com/Shopee.sg Level KYC Management
 * Enterprise-grade KYC verification and compliance
 */

import { db } from '../../../db';
import { vendorKyc } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { KYCSubmissionRequest, KYCStatus } from '../types/vendor.types';

export class KYCService {
  /**
   * Submit KYC documents for vendor
   */
  async submitKYC(vendorId: string, kycData: KYCSubmissionRequest): Promise<KYCStatus> {
    try {
      // Validate required documents
      this.validateKYCSubmission(kycData);

      const [kyc] = await db.insert(vendorKyc)
        .values({
          vendorId,
          personalInfo: kycData.personalInfo,
          businessInfo: kycData.businessInfo,
          bankDetails: kycData.bankDetails,
          documents: kycData.documents,
          declarations: kycData.declarations,
          status: 'submitted',
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return kyc;
    } catch (error) {
      throw new Error(`Failed to submit KYC: ${error.message}`);
    }
  }

  /**
   * Get KYC status for vendor
   */
  async getKYCStatus(vendorId: string): Promise<KYCStatus | null> {
    try {
      const [kyc] = await db.select()
        .from(vendorKyc)
        .where(eq(vendorKyc.vendorId, vendorId))
        .orderBy(desc(vendorKyc.createdAt))
        .limit(1);

      return kyc || null;
    } catch (error) {
      throw new Error(`Failed to fetch KYC status: ${error.message}`);
    }
  }

  /**
   * Update KYC status (Admin function)
   */
  async updateKYCStatus(
    kycId: string, 
    status: 'approved' | 'rejected' | 'expired',
    verifiedBy: number,
    reviewNotes?: string
  ): Promise<KYCStatus> {
    try {
      const [kyc] = await db.update(vendorKyc)
        .set({
          status,
          verifiedBy,
          reviewNotes,
          verifiedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(vendorKyc.id, kycId))
        .returning();

      if (!kyc) {
        throw new Error('KYC record not found');
      }

      return kyc;
    } catch (error) {
      throw new Error(`Failed to update KYC status: ${error.message}`);
    }
  }

  /**
   * Get all pending KYC submissions (Admin function)
   */
  async getPendingKYCSubmissions(): Promise<KYCStatus[]> {
    try {
      return await db.select()
        .from(vendorKyc)
        .where(eq(vendorKyc.status, 'submitted'))
        .orderBy(desc(vendorKyc.submittedAt));
    } catch (error) {
      throw new Error(`Failed to fetch pending KYC submissions: ${error.message}`);
    }
  }

  /**
   * Validate KYC submission data
   */
  private validateKYCSubmission(kycData: KYCSubmissionRequest): void {
    const { personalInfo, businessInfo, bankDetails, documents, declarations } = kycData;

    // Validate personal info
    if (!personalInfo.fullName || !personalInfo.dateOfBirth || !personalInfo.idNumber) {
      throw new Error('Missing required personal information');
    }

    // Validate business info
    if (!businessInfo.registrationNumber || !businessInfo.tradeLicense || !businessInfo.tinNumber) {
      throw new Error('Missing required business information');
    }

    // Validate bank details
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      throw new Error('Missing required bank details');
    }

    // Validate documents
    if (!documents.idDocument || !documents.businessRegistration || !documents.bankStatement) {
      throw new Error('Missing required documents');
    }

    // Validate declarations
    if (!declarations.termsAccepted || !declarations.privacyAccepted || !declarations.complianceDeclaration) {
      throw new Error('All declarations must be accepted');
    }
  }

  /**
   * Verify NID (National ID) - Bangladesh specific
   */
  async verifyNID(nidNumber: string): Promise<{ valid: boolean; details?: any }> {
    try {
      // This would integrate with Bangladesh government NID verification API
      // For now, we'll return a placeholder response
      
      // Basic NID format validation for Bangladesh
      const nidPattern = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/;
      const isValidFormat = nidPattern.test(nidNumber);

      return {
        valid: isValidFormat,
        details: isValidFormat ? { 
          message: 'NID format is valid',
          type: nidNumber.length === 10 ? 'old_format' : 'new_format'
        } : {
          message: 'Invalid NID format'
        }
      };
    } catch (error) {
      throw new Error(`Failed to verify NID: ${error.message}`);
    }
  }

  /**
   * Verify Trade License - Bangladesh specific
   */
  async verifyTradeLicense(licenseNumber: string, businessName: string): Promise<{ valid: boolean; details?: any }> {
    try {
      // This would integrate with Bangladesh trade license verification API
      // For now, we'll return a placeholder response
      
      return {
        valid: true,
        details: {
          message: 'Trade license verification initiated',
          licenseNumber,
          businessName,
          status: 'pending_verification'
        }
      };
    } catch (error) {
      throw new Error(`Failed to verify trade license: ${error.message}`);
    }
  }

  /**
   * Verify Bank Account - Bangladesh specific
   */
  async verifyBankAccount(accountNumber: string, bankName: string): Promise<{ valid: boolean; details?: any }> {
    try {
      // This would integrate with Bangladesh bank verification APIs
      // For now, we'll return a placeholder response
      
      const supportedBanks = [
        'DBBL', 'BRAC Bank', 'Eastern Bank', 'IFIC Bank', 
        'Dutch-Bangla Bank', 'Mutual Trust Bank', 'Prime Bank',
        'City Bank', 'Southeast Bank', 'Standard Bank'
      ];

      const isSupportedBank = supportedBanks.some(bank => 
        bankName.toLowerCase().includes(bank.toLowerCase())
      );

      return {
        valid: isSupportedBank,
        details: {
          message: isSupportedBank ? 'Bank verification initiated' : 'Unsupported bank',
          accountNumber,
          bankName,
          status: isSupportedBank ? 'pending_verification' : 'unsupported'
        }
      };
    } catch (error) {
      throw new Error(`Failed to verify bank account: ${error.message}`);
    }
  }

  /**
   * Calculate KYC risk score
   */
  async calculateRiskScore(vendorId: string, kycData: KYCSubmissionRequest): Promise<number> {
    try {
      let riskScore = 0;

      // Check document completeness (40% of score)
      const documentsScore = this.calculateDocumentScore(kycData.documents);
      riskScore += documentsScore * 0.4;

      // Check business information (30% of score)
      const businessScore = this.calculateBusinessScore(kycData.businessInfo);
      riskScore += businessScore * 0.3;

      // Check bank verification (20% of score)
      const bankScore = this.calculateBankScore(kycData.bankDetails);
      riskScore += bankScore * 0.2;

      // Check personal information (10% of score)
      const personalScore = this.calculatePersonalScore(kycData.personalInfo);
      riskScore += personalScore * 0.1;

      return Math.round(riskScore);
    } catch (error) {
      throw new Error(`Failed to calculate risk score: ${error.message}`);
    }
  }

  private calculateDocumentScore(documents: any): number {
    let score = 0;
    const requiredDocs = ['idDocument', 'businessRegistration', 'bankStatement', 'addressProof', 'tradeLicense'];
    
    requiredDocs.forEach(doc => {
      if (documents[doc]) score += 20;
    });

    return score;
  }

  private calculateBusinessScore(businessInfo: any): number {
    let score = 0;
    
    if (businessInfo.registrationNumber) score += 25;
    if (businessInfo.tradeLicense) score += 25;
    if (businessInfo.tinNumber) score += 25;
    if (businessInfo.registrationDate) score += 25;

    return score;
  }

  private calculateBankScore(bankDetails: any): number {
    let score = 0;
    
    if (bankDetails.accountName) score += 25;
    if (bankDetails.accountNumber) score += 25;
    if (bankDetails.bankName) score += 25;
    if (bankDetails.branchCode) score += 25;

    return score;
  }

  private calculatePersonalScore(personalInfo: any): number {
    let score = 0;
    
    if (personalInfo.fullName) score += 25;
    if (personalInfo.dateOfBirth) score += 25;
    if (personalInfo.idNumber) score += 25;
    if (personalInfo.nationality) score += 25;

    return score;
  }
}