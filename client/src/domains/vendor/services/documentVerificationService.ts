import { toast } from '@/shared/hooks/use-toast';

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  required: boolean;
  region: 'bangladesh' | 'global' | 'business';
  category: 'identity' | 'business' | 'financial' | 'address';
  ocrFields: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  pattern?: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  customValidator?: (value: string) => boolean;
}

export interface DocumentStatus {
  status: 'pending' | 'uploading' | 'processing' | 'extracting' | 'validating' | 'success' | 'failed';
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  error?: string;
  progress?: number;
  extractedData?: any;
  validationResults?: ValidationResult[];
  qualityScore?: number;
  securityScore?: number;
}

export interface ValidationResult {
  field: string;
  value: string;
  confidence: number;
  status: 'valid' | 'invalid' | 'warning';
  message?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Document type definitions based on Amazon.com/Shopee.sg standards
export const DOCUMENT_TYPES: DocumentType[] = [
  // Bangladesh Identity Documents
  {
    id: 'nid_front',
    name: 'National ID (Front)',
    description: 'Front side of Bangladesh National ID card',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    required: true,
    region: 'bangladesh',
    category: 'identity',
    ocrFields: ['nid_number', 'name', 'date_of_birth', 'father_name'],
    validationRules: [
      { field: 'nid_number', pattern: '^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$', required: true },
      { field: 'name', required: true, minLength: 2, maxLength: 100 },
      { field: 'date_of_birth', pattern: '^[0-9]{2}-[0-9]{2}-[0-9]{4}$', required: true },
    ]
  },
  {
    id: 'nid_back',
    name: 'National ID (Back)',
    description: 'Back side of Bangladesh National ID card',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFileSize: 5 * 1024 * 1024,
    required: true,
    region: 'bangladesh',
    category: 'identity',
    ocrFields: ['address', 'issue_date'],
    validationRules: [
      { field: 'address', required: true, minLength: 10, maxLength: 500 },
      { field: 'issue_date', pattern: '^[0-9]{2}-[0-9]{2}-[0-9]{4}$', required: true },
    ]
  },
  // Business Documents
  {
    id: 'trade_license',
    name: 'Trade License',
    description: 'Valid Bangladesh trade license certificate',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 10 * 1024 * 1024,
    required: true,
    region: 'bangladesh',
    category: 'business',
    ocrFields: ['license_number', 'business_name', 'issue_date', 'expiry_date', 'issuing_authority'],
    validationRules: [
      { field: 'license_number', required: true, minLength: 5, maxLength: 50 },
      { field: 'business_name', required: true, minLength: 2, maxLength: 200 },
      { field: 'issue_date', pattern: '^[0-9]{2}-[0-9]{2}-[0-9]{4}$', required: true },
      { field: 'expiry_date', pattern: '^[0-9]{2}-[0-9]{2}-[0-9]{4}$', required: true },
    ]
  },
  {
    id: 'tin_certificate',
    name: 'TIN Certificate',
    description: 'Tax identification number certificate',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 10 * 1024 * 1024,
    required: true,
    region: 'bangladesh',
    category: 'business',
    ocrFields: ['tin_number', 'holder_name', 'issue_date', 'issuing_circle'],
    validationRules: [
      { field: 'tin_number', pattern: '^[0-9]{9}-[0-9]{3}$', required: true },
      { field: 'holder_name', required: true, minLength: 2, maxLength: 100 },
      { field: 'issuing_circle', required: true, minLength: 2, maxLength: 100 },
    ]
  },
  // Financial Documents
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    description: 'Last 3 months bank statement',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 15 * 1024 * 1024,
    required: true,
    region: 'bangladesh',
    category: 'financial',
    ocrFields: ['account_number', 'account_holder_name', 'bank_name', 'branch_name', 'statement_period'],
    validationRules: [
      { field: 'account_number', required: true, minLength: 10, maxLength: 25 },
      { field: 'account_holder_name', required: true, minLength: 2, maxLength: 100 },
      { field: 'bank_name', required: true, minLength: 2, maxLength: 100 },
    ]
  },
  // Address Proof
  {
    id: 'address_proof',
    name: 'Address Proof',
    description: 'Utility bill or rental agreement (last 3 months)',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 10 * 1024 * 1024,
    required: true,
    region: 'bangladesh',
    category: 'address',
    ocrFields: ['address', 'holder_name', 'issue_date', 'service_provider'],
    validationRules: [
      { field: 'address', required: true, minLength: 10, maxLength: 500 },
      { field: 'holder_name', required: true, minLength: 2, maxLength: 100 },
      { field: 'issue_date', pattern: '^[0-9]{2}-[0-9]{2}-[0-9]{4}$', required: true },
    ]
  },
  // Global Documents
  {
    id: 'passport',
    name: 'Passport',
    description: 'Valid international passport',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFileSize: 10 * 1024 * 1024,
    required: false,
    region: 'global',
    category: 'identity',
    ocrFields: ['passport_number', 'name', 'nationality', 'date_of_birth', 'expiry_date'],
    validationRules: [
      { field: 'passport_number', required: true, minLength: 6, maxLength: 12 },
      { field: 'name', required: true, minLength: 2, maxLength: 100 },
      { field: 'nationality', required: true, minLength: 2, maxLength: 50 },
    ]
  },
  {
    id: 'drivers_license',
    name: "Driver's License",
    description: 'Valid government-issued driving license',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFileSize: 10 * 1024 * 1024,
    required: false,
    region: 'global',
    category: 'identity',
    ocrFields: ['license_number', 'name', 'date_of_birth', 'expiry_date', 'issuing_authority'],
    validationRules: [
      { field: 'license_number', required: true, minLength: 5, maxLength: 20 },
      { field: 'name', required: true, minLength: 2, maxLength: 100 },
    ]
  }
];

export class DocumentVerificationService {
  private static instance: DocumentVerificationService;
  private baseUrl = '/api/documents';

  public static getInstance(): DocumentVerificationService {
    if (!DocumentVerificationService.instance) {
      DocumentVerificationService.instance = new DocumentVerificationService();
    }
    return DocumentVerificationService.instance;
  }

  async uploadDocument(file: File, documentType: string): Promise<DocumentStatus> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  async processDocument(documentId: string): Promise<DocumentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/process/${documentId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Document processing error:', error);
      throw error;
    }
  }

  async extractDataFromDocument(file: File, documentType: string): Promise<any> {
    // Simulate OCR extraction based on document type
    const docType = DOCUMENT_TYPES.find(dt => dt.id === documentType);
    if (!docType) {
      throw new Error('Unknown document type');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock extracted data based on document type
    const mockData = this.generateMockExtractedData(documentType);
    
    return mockData;
  }

  private generateMockExtractedData(documentType: string): any {
    switch (documentType) {
      case 'nid_front':
        return {
          nid_number: '1234567890123',
          name: 'Mohammad Rahman',
          date_of_birth: '15-01-1990',
          father_name: 'Abdul Rahman',
          confidence: 0.95
        };
      case 'trade_license':
        return {
          license_number: 'TL-DHK-2024-001234',
          business_name: 'Rahman Trading Company',
          issue_date: '01-01-2024',
          expiry_date: '31-12-2024',
          issuing_authority: 'Dhaka City Corporation',
          confidence: 0.92
        };
      case 'tin_certificate':
        return {
          tin_number: '123456789-123',
          holder_name: 'Mohammad Rahman',
          issue_date: '01-01-2024',
          issuing_circle: 'Dhaka Tax Circle-1',
          confidence: 0.89
        };
      case 'bank_statement':
        return {
          account_number: '1234567890',
          account_holder_name: 'Mohammad Rahman',
          bank_name: 'Dutch Bangla Bank',
          branch_name: 'Dhanmondi Branch',
          statement_period: 'Jan 2024 - Mar 2024',
          confidence: 0.87
        };
      case 'address_proof':
        return {
          address: '123 Main Street, Dhanmondi, Dhaka-1205',
          holder_name: 'Mohammad Rahman',
          issue_date: '01-03-2024',
          service_provider: 'Dhaka WASA',
          confidence: 0.91
        };
      default:
        return {};
    }
  }

  async validateDocument(extractedData: any, documentType: string): Promise<ValidationResult[]> {
    const docType = DOCUMENT_TYPES.find(dt => dt.id === documentType);
    if (!docType) {
      throw new Error('Unknown document type');
    }

    const results: ValidationResult[] = [];

    for (const rule of docType.validationRules) {
      const value = extractedData[rule.field];
      let isValid = true;
      let message = '';

      if (rule.required && !value) {
        isValid = false;
        message = `${rule.field} is required`;
      } else if (value) {
        if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
          isValid = false;
          message = `${rule.field} format is invalid`;
        }
        if (rule.minLength && value.length < rule.minLength) {
          isValid = false;
          message = `${rule.field} is too short`;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          isValid = false;
          message = `${rule.field} is too long`;
        }
        if (rule.customValidator && !rule.customValidator(value)) {
          isValid = false;
          message = `${rule.field} validation failed`;
        }
      }

      results.push({
        field: rule.field,
        value: value || '',
        confidence: Math.random() * 0.1 + 0.9, // Mock confidence between 0.9-1.0
        status: isValid ? 'valid' : 'invalid',
        message: message
      });
    }

    return results;
  }

  async checkDocumentAuthenticity(file: File): Promise<number> {
    // Simulate AI-powered authenticity check
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock security score (0-100)
    return Math.random() * 20 + 80; // Score between 80-100
  }

  async assessImageQuality(file: File): Promise<number> {
    // Simulate image quality assessment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock quality score (0-100)
    return Math.random() * 20 + 80; // Score between 80-100
  }

  async crossReferenceValidation(documents: Record<string, any>): Promise<boolean> {
    // Simulate cross-reference validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation result
    return Math.random() > 0.1; // 90% success rate
  }

  getDocumentTypeConfig(documentType: string): DocumentType | undefined {
    return DOCUMENT_TYPES.find(dt => dt.id === documentType);
  }

  getDocumentTypesByRegion(region: 'bangladesh' | 'global' | 'business'): DocumentType[] {
    return DOCUMENT_TYPES.filter(dt => dt.region === region);
  }

  getRequiredDocuments(): DocumentType[] {
    return DOCUMENT_TYPES.filter(dt => dt.required);
  }
}

export const documentVerificationService = DocumentVerificationService.getInstance();