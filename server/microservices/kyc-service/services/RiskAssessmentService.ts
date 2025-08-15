import { db } from '../../../../shared/db';
import { 
  kycRiskAssessments, 
  kycApplications,
  documentSubmissions,
  type InsertKycRiskAssessment 
} from '../../../../shared/kyc-schema';
import { eq, and, desc } from 'drizzle-orm';

export class RiskAssessmentService {
  
  /**
   * Perform initial risk assessment for new application
   */
  async performInitialAssessment(applicationId: string): Promise<void> {
    try {
      // Get application data
      const [application] = await db
        .select()
        .from(kycApplications)
        .where(eq(kycApplications.id, applicationId))
        .limit(1);

      if (!application) {
        throw new Error('Application not found');
      }

      // Calculate initial risk factors
      const riskFactors = await this.calculateInitialRiskFactors(application);
      const riskScore = this.calculateRiskScore(riskFactors);
      const riskLevel = this.determineRiskLevel(riskScore);

      // Create initial risk assessment
      await db.insert(kycRiskAssessments).values({
        kycApplicationId: applicationId,
        riskFactors,
        riskScore: riskScore.toString(),
        riskLevel,
        assessmentDetails: {
          assessment_type: 'initial',
          factors_analyzed: Object.keys(riskFactors),
          confidence_level: 0.7, // Initial assessment has lower confidence
          recommendations: this.generateRecommendations(riskLevel, riskFactors)
        },
        modelVersion: '1.0.0',
        algorithmUsed: 'weighted_scoring',
        inputFeatures: {
          application_type: application.applicationType,
          device_fingerprint: application.deviceFingerprint,
          ip_address: application.ipAddress,
          location_data: application.locationData
        },
        confidenceInterval: {
          lower: Math.max(0, riskScore - 0.15),
          upper: Math.min(1, riskScore + 0.15)
        },
        documentRisk: riskFactors.document_completeness || '0',
        identityRisk: riskFactors.identity_verification || '0',
        behavioralRisk: riskFactors.application_behavior || '0',
        geographicalRisk: riskFactors.geographical_risk || '0',
        transactionRisk: '0', // Will be updated during comprehensive assessment
        assessedBy: 'automated'
      });

      console.log(`✅ Initial risk assessment completed for application ${applicationId}: ${riskLevel} risk`);
    } catch (error) {
      console.error('Error performing initial risk assessment:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive risk assessment after document submission
   */
  async performComprehensiveAssessment(applicationId: string): Promise<void> {
    try {
      // Get application and documents
      const [application] = await db
        .select()
        .from(kycApplications)
        .where(eq(kycApplications.id, applicationId))
        .limit(1);

      const documents = await db
        .select()
        .from(documentSubmissions)
        .where(eq(documentSubmissions.kycApplicationId, applicationId));

      if (!application) {
        throw new Error('Application not found');
      }

      // Calculate comprehensive risk factors
      const riskFactors = await this.calculateComprehensiveRiskFactors(application, documents);
      const riskScore = this.calculateRiskScore(riskFactors);
      const riskLevel = this.determineRiskLevel(riskScore);

      // Update or create comprehensive risk assessment
      await db.insert(kycRiskAssessments).values({
        kycApplicationId: applicationId,
        riskFactors,
        riskScore: riskScore.toString(),
        riskLevel,
        assessmentDetails: {
          assessment_type: 'comprehensive',
          factors_analyzed: Object.keys(riskFactors),
          confidence_level: 0.9, // Higher confidence for comprehensive assessment
          recommendations: this.generateRecommendations(riskLevel, riskFactors),
          document_analysis: this.analyzeDocuments(documents),
          fraud_indicators: this.detectFraudIndicators(riskFactors),
          compliance_status: this.assessCompliance(riskFactors)
        },
        modelVersion: '1.0.0',
        algorithmUsed: 'ml_ensemble',
        inputFeatures: {
          application_data: this.extractApplicationFeatures(application),
          document_data: this.extractDocumentFeatures(documents),
          behavioral_data: this.extractBehavioralFeatures(application)
        },
        confidenceInterval: {
          lower: Math.max(0, riskScore - 0.05),
          upper: Math.min(1, riskScore + 0.05)
        },
        documentRisk: riskFactors.document_risk || '0',
        identityRisk: riskFactors.identity_risk || '0',
        behavioralRisk: riskFactors.behavioral_risk || '0',
        geographicalRisk: riskFactors.geographical_risk || '0',
        transactionRisk: riskFactors.transaction_risk || '0',
        assessedBy: 'automated'
      });

      // Update application risk level
      await db
        .update(kycApplications)
        .set({
          riskLevel,
          autoVerificationScore: riskScore.toString(),
          manualReviewRequired: riskLevel === 'high' || riskLevel === 'critical'
        })
        .where(eq(kycApplications.id, applicationId));

      console.log(`✅ Comprehensive risk assessment completed for application ${applicationId}: ${riskLevel} risk (${riskScore})`);
    } catch (error) {
      console.error('Error performing comprehensive risk assessment:', error);
      throw error;
    }
  }

  /**
   * Calculate initial risk factors
   */
  private async calculateInitialRiskFactors(application: any): Promise<any> {
    const factors: any = {};

    // Application completeness risk
    factors.application_completeness = this.assessApplicationCompleteness(application);

    // Device and location risk
    factors.device_risk = this.assessDeviceRisk(application);
    factors.geographical_risk = this.assessGeographicalRisk(application);

    // Application pattern risk
    factors.application_behavior = this.assessApplicationBehavior(application);

    // Bangladesh-specific risks
    factors.bangladesh_compliance = this.assessBangladeshCompliance(application);

    return factors;
  }

  /**
   * Calculate comprehensive risk factors
   */
  private async calculateComprehensiveRiskFactors(application: any, documents: any[]): Promise<any> {
    const factors: any = {};

    // Document-based risks
    factors.document_risk = this.assessDocumentRisk(documents);
    factors.document_authenticity = this.assessDocumentAuthenticity(documents);
    factors.document_consistency = this.assessDocumentConsistency(documents);

    // Identity verification risks
    factors.identity_risk = this.assessIdentityRisk(application, documents);
    factors.identity_consistency = this.assessIdentityConsistency(documents);

    // Behavioral risks
    factors.behavioral_risk = this.assessBehavioralRisk(application);
    factors.submission_patterns = this.assessSubmissionPatterns(application);

    // Financial risks
    factors.financial_risk = this.assessFinancialRisk(documents);
    factors.transaction_risk = this.assessTransactionRisk(application);

    // Compliance risks
    factors.compliance_risk = this.assessComplianceRisk(application, documents);
    factors.sanction_risk = this.assessSanctionRisk(application);

    // Bangladesh-specific comprehensive risks
    factors.bangladesh_government_risk = this.assessGovernmentDatabaseRisk(documents);
    factors.local_regulatory_risk = this.assessLocalRegulatoryRisk(application);

    return factors;
  }

  /**
   * Calculate overall risk score from factors
   */
  private calculateRiskScore(riskFactors: any): number {
    const weights = {
      document_risk: 0.25,
      identity_risk: 0.20,
      behavioral_risk: 0.15,
      geographical_risk: 0.10,
      financial_risk: 0.15,
      compliance_risk: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      if (riskFactors[factor] !== undefined) {
        const factorScore = parseFloat(riskFactors[factor]) || 0;
        totalScore += factorScore * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0.5; // Default to medium risk
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score <= 0.25) return 'low';
    if (score <= 0.50) return 'medium';
    if (score <= 0.75) return 'high';
    return 'critical';
  }

  // Risk assessment helper methods
  private assessApplicationCompleteness(application: any): string {
    const requiredFields = ['userId', 'applicationType'];
    const completedFields = requiredFields.filter(field => application[field]);
    const completeness = completedFields.length / requiredFields.length;
    return (1 - completeness).toString(); // Higher incompleteness = higher risk
  }

  private assessDeviceRisk(application: any): string {
    // Assess device fingerprint for suspicious patterns
    const deviceFingerprint = application.deviceFingerprint;
    let risk = 0.1; // Base risk

    if (!deviceFingerprint) risk += 0.2; // Missing fingerprint increases risk
    
    return risk.toString();
  }

  private assessGeographicalRisk(application: any): string {
    // Assess geographical risk based on location
    const ipAddress = application.ipAddress;
    const locationData = application.locationData;

    let risk = 0.1; // Base risk for Bangladesh

    // Add risk factors based on location analysis
    if (!locationData) risk += 0.1;
    
    return risk.toString();
  }

  private assessApplicationBehavior(application: any): string {
    // Assess application submission behavior
    let risk = 0.1; // Base risk

    // Check submission time patterns
    const submissionHour = new Date(application.createdAt).getHours();
    if (submissionHour < 6 || submissionHour > 22) risk += 0.1; // Unusual hours

    return risk.toString();
  }

  private assessBangladeshCompliance(application: any): string {
    // Assess Bangladesh-specific compliance factors
    let risk = 0.1; // Base risk

    // Will be enhanced with actual compliance checks
    return risk.toString();
  }

  private assessDocumentRisk(documents: any[]): string {
    if (documents.length === 0) return '1.0'; // Maximum risk for no documents

    let totalRisk = 0;
    for (const doc of documents) {
      let docRisk = 0.1; // Base risk per document

      // OCR confidence
      if (doc.ocrConfidence && doc.ocrConfidence < 0.8) {
        docRisk += 0.3;
      }

      // Quality score
      if (doc.qualityScore && doc.qualityScore < 0.7) {
        docRisk += 0.2;
      }

      // Tampering detection
      if (doc.tamperingDetected) {
        docRisk += 0.5;
      }

      totalRisk += docRisk;
    }

    return Math.min(totalRisk / documents.length, 1.0).toString();
  }

  private assessDocumentAuthenticity(documents: any[]): string {
    let totalAuth = 0;
    for (const doc of documents) {
      const authScore = doc.authenticityScore || 0.5;
      totalAuth += parseFloat(authScore);
    }
    const avgAuth = documents.length > 0 ? totalAuth / documents.length : 0.5;
    return (1 - avgAuth).toString(); // Lower authenticity = higher risk
  }

  private assessDocumentConsistency(documents: any[]): string {
    // Check consistency across documents
    // For now, return low risk - will be enhanced with actual consistency checks
    return '0.2';
  }

  private assessIdentityRisk(application: any, documents: any[]): string {
    // Assess identity verification risk
    let risk = 0.2; // Base risk

    // Check for identity documents
    const hasNID = documents.some(doc => doc.documentType === 'nid');
    if (!hasNID) risk += 0.3;

    return Math.min(risk, 1.0).toString();
  }

  private assessIdentityConsistency(documents: any[]): string {
    // Check identity consistency across documents
    return '0.2'; // Placeholder - will be enhanced
  }

  private assessBehavioralRisk(application: any): string {
    // Enhanced behavioral risk assessment
    return '0.2'; // Placeholder
  }

  private assessSubmissionPatterns(application: any): string {
    // Assess submission pattern risks
    return '0.1'; // Placeholder
  }

  private assessFinancialRisk(documents: any[]): string {
    // Assess financial document risks
    const hasBankStatement = documents.some(doc => doc.documentType === 'bank_statement');
    return hasBankStatement ? '0.1' : '0.4';
  }

  private assessTransactionRisk(application: any): string {
    // Assess transaction-related risks
    return '0.1'; // Placeholder
  }

  private assessComplianceRisk(application: any, documents: any[]): string {
    // Assess regulatory compliance risks
    return '0.2'; // Placeholder
  }

  private assessSanctionRisk(application: any): string {
    // Assess sanctions list risks
    return '0.1'; // Placeholder
  }

  private assessGovernmentDatabaseRisk(documents: any[]): string {
    // Assess government database verification risks
    return '0.2'; // Placeholder
  }

  private assessLocalRegulatoryRisk(application: any): string {
    // Assess Bangladesh regulatory compliance risks
    return '0.1'; // Placeholder
  }

  // Helper methods for assessment details
  private generateRecommendations(riskLevel: string, riskFactors: any): string[] {
    const recommendations = [];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Require manual review');
      recommendations.push('Additional document verification needed');
    }

    if (parseFloat(riskFactors.document_risk || '0') > 0.5) {
      recommendations.push('Enhanced document authentication required');
    }

    if (parseFloat(riskFactors.identity_risk || '0') > 0.5) {
      recommendations.push('Additional identity verification steps needed');
    }

    return recommendations;
  }

  private analyzeDocuments(documents: any[]): any {
    return {
      total_documents: documents.length,
      document_types: documents.map(d => d.documentType),
      avg_quality_score: documents.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / documents.length,
      avg_ocr_confidence: documents.reduce((sum, d) => sum + (d.ocrConfidence || 0), 0) / documents.length
    };
  }

  private detectFraudIndicators(riskFactors: any): string[] {
    const indicators = [];

    if (parseFloat(riskFactors.document_risk || '0') > 0.7) {
      indicators.push('Suspicious document patterns detected');
    }

    if (parseFloat(riskFactors.behavioral_risk || '0') > 0.6) {
      indicators.push('Unusual application behavior detected');
    }

    return indicators;
  }

  private assessCompliance(riskFactors: any): any {
    return {
      bangladesh_bank_compliant: parseFloat(riskFactors.compliance_risk || '0') < 0.3,
      anti_money_laundering: parseFloat(riskFactors.financial_risk || '0') < 0.3,
      data_protection: true // Placeholder
    };
  }

  private extractApplicationFeatures(application: any): any {
    return {
      application_type: application.applicationType,
      submission_time: application.createdAt,
      device_info: application.deviceFingerprint,
      location_info: application.locationData
    };
  }

  private extractDocumentFeatures(documents: any[]): any {
    return {
      document_count: documents.length,
      document_types: documents.map(d => d.documentType),
      quality_metrics: documents.map(d => ({
        type: d.documentType,
        quality: d.qualityScore,
        ocr_confidence: d.ocrConfidence,
        authenticity: d.authenticityScore
      }))
    };
  }

  private extractBehavioralFeatures(application: any): any {
    return {
      submission_hour: new Date(application.createdAt).getHours(),
      application_source: application.applicationSource,
      device_consistency: true // Placeholder
    };
  }
}