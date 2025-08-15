import axios from 'axios';

export interface OCRResult {
  data: Record<string, any>;
  confidence: number;
  qualityScore: number;
  suggestions: string[];
}

export interface OCROptions {
  language?: string;
  enhanceImage?: boolean;
  validateFields?: boolean;
  extractBanglaText?: boolean;
}

export class OCRService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OCR_API_KEY || '';
    this.baseUrl = process.env.OCR_API_URL || 'https://api.ocr.space/parse/image';
  }

  /**
   * Extract data from document image using OCR
   */
  async extractData(imageUrl: string, documentType: string, options: OCROptions = {}): Promise<OCRResult> {
    try {
      const { language = 'en', enhanceImage = true, validateFields = true, extractBanglaText = false } = options;

      // Prepare OCR request
      const ocrParams = {
        url: imageUrl,
        language: this.getOCRLanguageCode(language),
        isOverlayRequired: true,
        detectOrientation: true,
        scale: true,
        isTable: documentType === 'bank_statement',
        OCREngine: 2 // Use latest engine
      };

      // Call OCR API
      const ocrResponse = await this.callOCRAPI(ocrParams);
      
      // Parse results based on document type
      const parsedData = await this.parseDocumentData(ocrResponse, documentType, extractBanglaText);
      
      // Calculate confidence and quality scores
      const confidence = this.calculateConfidence(ocrResponse);
      const qualityScore = this.assessImageQuality(ocrResponse);
      
      // Generate suggestions for improvement
      const suggestions = this.generateSuggestions(ocrResponse, qualityScore);

      // Validate extracted fields if requested
      if (validateFields) {
        await this.validateExtractedFields(parsedData, documentType);
      }

      return {
        data: parsedData,
        confidence,
        qualityScore,
        suggestions
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  /**
   * Call external OCR API
   */
  private async callOCRAPI(params: any): Promise<any> {
    try {
      const response = await axios.post(this.baseUrl, params, {
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.IsErroredOnProcessing) {
        throw new Error(response.data.ErrorMessage?.[0] || 'OCR processing failed');
      }

      return response.data;
    } catch (error) {
      console.error('OCR API call failed:', error);
      throw error;
    }
  }

  /**
   * Parse document data based on document type
   */
  private async parseDocumentData(ocrResponse: any, documentType: string, extractBanglaText: boolean): Promise<Record<string, any>> {
    const text = ocrResponse.ParsedResults?.[0]?.ParsedText || '';
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    switch (documentType) {
      case 'nid':
        return this.parseNIDData(lines, extractBanglaText);
      case 'passport':
        return this.parsePassportData(lines);
      case 'driving_license':
        return this.parseDrivingLicenseData(lines);
      case 'trade_license':
        return this.parseTradeLicenseData(lines, extractBanglaText);
      case 'tin_certificate':
        return this.parseTINData(lines, extractBanglaText);
      case 'bank_statement':
        return this.parseBankStatementData(lines);
      case 'utility_bill':
        return this.parseUtilityBillData(lines);
      default:
        return this.parseGenericData(lines);
    }
  }

  /**
   * Parse Bangladesh NID data
   */
  private parseNIDData(lines: string[], extractBanglaText: boolean): Record<string, any> {
    const data: Record<string, any> = {};

    for (const line of lines) {
      // NID Number
      const nidMatch = line.match(/(\d{10,17})/);
      if (nidMatch && !data.nidNumber) {
        data.nidNumber = nidMatch[1];
      }

      // Name (English)
      const nameMatch = line.match(/^([A-Z][A-Z\s]+)$/);
      if (nameMatch && !data.name && !line.includes('BANGLADESH')) {
        data.name = nameMatch[1].trim();
      }

      // Date of Birth
      const dobMatch = line.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/);
      if (dobMatch && !data.dateOfBirth) {
        data.dateOfBirth = dobMatch[1];
      }

      // Blood Group
      const bloodMatch = line.match(/(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)/);
      if (bloodMatch && !data.bloodGroup) {
        data.bloodGroup = bloodMatch[1];
      }

      // Address detection
      if (line.includes('Village') || line.includes('Ward') || line.includes('Upazila') || line.includes('District')) {
        if (!data.address) data.address = [];
        data.address.push(line);
      }
    }

    // Extract Bangla text if requested
    if (extractBanglaText) {
      data.banglaName = this.extractBanglaText(lines);
    }

    return data;
  }

  /**
   * Parse passport data
   */
  private parsePassportData(lines: string[]): Record<string, any> {
    const data: Record<string, any> = {};

    for (const line of lines) {
      // Passport number
      const passportMatch = line.match(/([A-Z]{2}\d{7})/);
      if (passportMatch && !data.passportNumber) {
        data.passportNumber = passportMatch[1];
      }

      // Date of birth
      const dobMatch = line.match(/(\d{2}[A-Z]{3}\d{2})/);
      if (dobMatch && !data.dateOfBirth) {
        data.dateOfBirth = dobMatch[1];
      }

      // Date of issue
      const issueMatch = line.match(/Date of Issue[:\s]*(\d{2}[A-Z]{3}\d{2})/i);
      if (issueMatch && !data.dateOfIssue) {
        data.dateOfIssue = issueMatch[1];
      }

      // Date of expiry
      const expiryMatch = line.match(/Date of Expiry[:\s]*(\d{2}[A-Z]{3}\d{2})/i);
      if (expiryMatch && !data.dateOfExpiry) {
        data.dateOfExpiry = expiryMatch[1];
      }

      // Name
      const nameMatch = line.match(/^([A-Z][A-Z\s]+)$/);
      if (nameMatch && !data.name && !line.includes('PASSPORT') && !line.includes('BANGLADESH')) {
        data.name = nameMatch[1].trim();
      }
    }

    return data;
  }

  /**
   * Parse trade license data
   */
  private parseTradeLicenseData(lines: string[], extractBanglaText: boolean): Record<string, any> {
    const data: Record<string, any> = {};

    for (const line of lines) {
      // License number
      const licenseMatch = line.match(/(\d{6,12})/);
      if (licenseMatch && !data.licenseNumber) {
        data.licenseNumber = licenseMatch[1];
      }

      // Business name detection
      if (line.includes('Trade Name') || line.includes('Business Name')) {
        const nameMatch = line.match(/(?:Trade Name|Business Name)[:\s]*(.+)/i);
        if (nameMatch && !data.businessName) {
          data.businessName = nameMatch[1].trim();
        }
      }

      // Issue date
      const issueMatch = line.match(/Issue Date[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
      if (issueMatch && !data.issueDate) {
        data.issueDate = issueMatch[1];
      }

      // Expiry date
      const expiryMatch = line.match(/Expiry Date[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
      if (expiryMatch && !data.expiryDate) {
        data.expiryDate = expiryMatch[1];
      }
    }

    if (extractBanglaText) {
      data.banglaBusinessName = this.extractBanglaText(lines);
    }

    return data;
  }

  /**
   * Parse TIN certificate data
   */
  private parseTINData(lines: string[], extractBanglaText: boolean): Record<string, any> {
    const data: Record<string, any> = {};

    for (const line of lines) {
      // TIN number
      const tinMatch = line.match(/(\d{9,12})/);
      if (tinMatch && !data.tinNumber) {
        data.tinNumber = tinMatch[1];
      }

      // Name detection
      const nameMatch = line.match(/Name[:\s]*(.+)/i);
      if (nameMatch && !data.name) {
        data.name = nameMatch[1].trim();
      }

      // Circle detection
      const circleMatch = line.match(/Circle[:\s]*(.+)/i);
      if (circleMatch && !data.circle) {
        data.circle = circleMatch[1].trim();
      }
    }

    return data;
  }

  /**
   * Parse bank statement data
   */
  private parseBankStatementData(lines: string[]): Record<string, any> {
    const data: Record<string, any> = {
      transactions: []
    };

    for (const line of lines) {
      // Account number
      const accountMatch = line.match(/Account No[:\s]*(\d+)/i);
      if (accountMatch && !data.accountNumber) {
        data.accountNumber = accountMatch[1];
      }

      // Account holder name
      const nameMatch = line.match(/Account Holder[:\s]*(.+)/i);
      if (nameMatch && !data.accountHolder) {
        data.accountHolder = nameMatch[1].trim();
      }

      // Balance
      const balanceMatch = line.match(/Balance[:\s]*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
      if (balanceMatch && !data.balance) {
        data.balance = balanceMatch[1];
      }

      // Transaction detection (simplified)
      const transactionMatch = line.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\s+(.+?)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      if (transactionMatch) {
        data.transactions.push({
          date: transactionMatch[1],
          description: transactionMatch[2].trim(),
          amount: transactionMatch[3]
        });
      }
    }

    return data;
  }

  /**
   * Parse utility bill data
   */
  private parseUtilityBillData(lines: string[]): Record<string, any> {
    const data: Record<string, any> = {};

    for (const line of lines) {
      // Bill number
      const billMatch = line.match(/Bill No[:\s]*(\w+)/i);
      if (billMatch && !data.billNumber) {
        data.billNumber = billMatch[1];
      }

      // Customer name
      const nameMatch = line.match(/Customer Name[:\s]*(.+)/i);
      if (nameMatch && !data.customerName) {
        data.customerName = nameMatch[1].trim();
      }

      // Address
      if (line.includes('Address') || line.includes('Service Address')) {
        const addressMatch = line.match(/(?:Address|Service Address)[:\s]*(.+)/i);
        if (addressMatch && !data.address) {
          data.address = addressMatch[1].trim();
        }
      }

      // Due date
      const dueMatch = line.match(/Due Date[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
      if (dueMatch && !data.dueDate) {
        data.dueDate = dueMatch[1];
      }
    }

    return data;
  }

  /**
   * Parse driving license data
   */
  private parseDrivingLicenseData(lines: string[]): Record<string, any> {
    const data: Record<string, any> = {};

    for (const line of lines) {
      // License number
      const licenseMatch = line.match(/(\d{8,15})/);
      if (licenseMatch && !data.licenseNumber) {
        data.licenseNumber = licenseMatch[1];
      }

      // Date of birth
      const dobMatch = line.match(/DOB[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
      if (dobMatch && !data.dateOfBirth) {
        data.dateOfBirth = dobMatch[1];
      }

      // Issue date
      const issueMatch = line.match(/Issue[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
      if (issueMatch && !data.issueDate) {
        data.issueDate = issueMatch[1];
      }

      // Expiry date
      const expiryMatch = line.match(/Expiry[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
      if (expiryMatch && !data.expiryDate) {
        data.expiryDate = expiryMatch[1];
      }
    }

    return data;
  }

  /**
   * Parse generic document data
   */
  private parseGenericData(lines: string[]): Record<string, any> {
    const data: Record<string, any> = {
      extractedText: lines.join('\n'),
      lines: lines
    };

    // Extract common patterns
    const numbers = lines.flatMap(line => line.match(/\d+/g) || []);
    const dates = lines.flatMap(line => line.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/g) || []);
    const emails = lines.flatMap(line => line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []);

    if (numbers.length > 0) data.numbers = numbers;
    if (dates.length > 0) data.dates = dates;
    if (emails.length > 0) data.emails = emails;

    return data;
  }

  /**
   * Extract Bangla text from lines
   */
  private extractBanglaText(lines: string[]): string {
    // Filter lines that contain Bangla characters
    const banglaLines = lines.filter(line => 
      /[\u0980-\u09FF]/.test(line) // Unicode range for Bangla
    );
    
    return banglaLines.join(' ').trim();
  }

  /**
   * Calculate confidence score from OCR response
   */
  private calculateConfidence(ocrResponse: any): number {
    try {
      const parsedResult = ocrResponse.ParsedResults?.[0];
      if (!parsedResult) return 0;

      // Calculate confidence based on various factors
      const textLength = parsedResult.ParsedText?.length || 0;
      const hasStructuredData = parsedResult.TextOverlay?.Lines?.length > 0;
      const processingTime = ocrResponse.ProcessingTimeInMilliseconds || 0;

      let confidence = 0.5; // Base confidence

      // Text length factor
      if (textLength > 100) confidence += 0.2;
      else if (textLength > 50) confidence += 0.1;

      // Structured data factor
      if (hasStructuredData) confidence += 0.2;

      // Processing time factor (faster usually means clearer image)
      if (processingTime < 5000) confidence += 0.1;

      return Math.min(confidence, 1.0);
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 0.5;
    }
  }

  /**
   * Assess image quality from OCR response
   */
  private assessImageQuality(ocrResponse: any): number {
    try {
      const parsedResult = ocrResponse.ParsedResults?.[0];
      if (!parsedResult) return 0;

      let qualityScore = 0.5;

      // Check for common quality indicators
      const text = parsedResult.ParsedText || '';
      
      // Text clarity (fewer garbled characters = better quality)
      const garbledChars = (text.match(/[^\w\s\u0980-\u09FF]/g) || []).length;
      const totalChars = text.length;
      if (totalChars > 0) {
        const clarityRatio = 1 - (garbledChars / totalChars);
        qualityScore += clarityRatio * 0.3;
      }

      // Text density
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 5) qualityScore += 0.2;

      return Math.min(qualityScore, 1.0);
    } catch (error) {
      console.error('Error assessing image quality:', error);
      return 0.5;
    }
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(ocrResponse: any, qualityScore: number): string[] {
    const suggestions: string[] = [];

    if (qualityScore < 0.6) {
      suggestions.push('Consider retaking the photo with better lighting');
      suggestions.push('Ensure the document is flat and fully visible');
      suggestions.push('Use a higher resolution camera');
    }

    if (qualityScore < 0.4) {
      suggestions.push('Clean the camera lens');
      suggestions.push('Hold the camera steady');
      suggestions.push('Avoid shadows on the document');
    }

    return suggestions;
  }

  /**
   * Validate extracted fields
   */
  private async validateExtractedFields(data: Record<string, any>, documentType: string): Promise<void> {
    // Implement field validation logic based on document type
    switch (documentType) {
      case 'nid':
        this.validateNIDFields(data);
        break;
      case 'passport':
        this.validatePassportFields(data);
        break;
      case 'trade_license':
        this.validateTradeLicenseFields(data);
        break;
    }
  }

  /**
   * Validate NID fields
   */
  private validateNIDFields(data: Record<string, any>): void {
    if (data.nidNumber && !/^\d{10}$|^\d{13}$|^\d{17}$/.test(data.nidNumber)) {
      throw new Error('Invalid NID number format');
    }

    if (data.dateOfBirth && !/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(data.dateOfBirth)) {
      throw new Error('Invalid date of birth format');
    }
  }

  /**
   * Validate passport fields
   */
  private validatePassportFields(data: Record<string, any>): void {
    if (data.passportNumber && !/^[A-Z]{2}\d{7}$/.test(data.passportNumber)) {
      throw new Error('Invalid passport number format');
    }
  }

  /**
   * Validate trade license fields
   */
  private validateTradeLicenseFields(data: Record<string, any>): void {
    if (data.licenseNumber && !/^\d{6,12}$/.test(data.licenseNumber)) {
      throw new Error('Invalid trade license number format');
    }
  }

  /**
   * Get OCR language code
   */
  private getOCRLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'eng',
      'bn': 'ben',
      'hi': 'hin',
      'ur': 'urd',
      'ar': 'ara'
    };

    return languageMap[language] || 'eng';
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    try {
      const startTime = Date.now();
      
      // Test with a simple image URL or perform a health check
      const testResponse = await axios.get(this.baseUrl.replace('/parse/image', '/health'), {
        headers: { 'apikey': this.apiKey },
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      return {
        healthy: testResponse.status === 200,
        responseTime
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<any> {
    // Return mock metrics - in production, this would come from monitoring
    return {
      totalRequests: 1250,
      accuracy: 0.94,
      avgResponseTime: 3200,
      errorRate: 0.03,
      supportedLanguages: ['en', 'bn', 'hi', 'ur', 'ar'],
      supportedDocuments: ['nid', 'passport', 'trade_license', 'tin_certificate', 'bank_statement', 'utility_bill']
    };
  }
}

export default OCRService;