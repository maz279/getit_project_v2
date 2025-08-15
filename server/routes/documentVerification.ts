import { Router } from 'express';
import multer from 'multer';
import { Request, Response } from 'express';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

// Document upload endpoint
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    // Simulate document processing
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Return initial status
    res.json({
      documentId,
      status: 'uploading',
      fileName: req.file.originalname,
      fileSize: (req.file.size / (1024 * 1024)).toFixed(1) + ' MB',
      progress: 100
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Document processing endpoint
router.post('/process/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock processing result
    const processedData = {
      status: 'success',
      extractedData: {
        nid_number: '1234567890123',
        name: 'Mohammad Rahman',
        date_of_birth: '15-01-1990',
        father_name: 'Abdul Rahman'
      },
      validationResults: [
        {
          field: 'nid_number',
          value: '1234567890123',
          confidence: 0.95,
          status: 'valid'
        },
        {
          field: 'name',
          value: 'Mohammad Rahman',
          confidence: 0.98,
          status: 'valid'
        }
      ],
      qualityScore: 92,
      securityScore: 89,
      uploadedAt: new Date().toISOString()
    };

    res.json(processedData);
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Document validation endpoint
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { documentType, extractedData } = req.body;
    
    if (!documentType || !extractedData) {
      return res.status(400).json({ error: 'Document type and extracted data are required' });
    }

    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validationResults = [
      {
        field: 'nid_number',
        value: extractedData.nid_number || '',
        confidence: 0.95,
        status: 'valid',
        message: 'NID format is valid'
      },
      {
        field: 'name',
        value: extractedData.name || '',
        confidence: 0.98,
        status: 'valid',
        message: 'Name format is valid'
      }
    ];

    res.json({
      validationResults,
      overallScore: 93.5,
      isValid: true
    });
  } catch (error) {
    console.error('Document validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// OCR extraction endpoint
router.post('/extract', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType } = req.body;
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock OCR results based on document type
    const mockOCRResults = {
      nid_front: {
        nid_number: '1234567890123',
        name: 'Mohammad Rahman',
        date_of_birth: '15-01-1990',
        father_name: 'Abdul Rahman',
        confidence: 0.95
      },
      trade_license: {
        license_number: 'TL-DHK-2024-001234',
        business_name: 'Rahman Trading Company',
        issue_date: '01-01-2024',
        expiry_date: '31-12-2024',
        issuing_authority: 'Dhaka City Corporation',
        confidence: 0.92
      },
      tin_certificate: {
        tin_number: '123456789-123',
        holder_name: 'Mohammad Rahman',
        issue_date: '01-01-2024',
        issuing_circle: 'Dhaka Tax Circle-1',
        confidence: 0.89
      },
      bank_statement: {
        account_number: '1234567890',
        account_holder_name: 'Mohammad Rahman',
        bank_name: 'Dutch Bangla Bank',
        branch_name: 'Dhanmondi Branch',
        statement_period: 'Jan 2024 - Mar 2024',
        confidence: 0.87
      }
    };

    const extractedData = mockOCRResults[documentType] || {};
    
    res.json({
      extractedData,
      processingTime: 2.5,
      qualityScore: 88,
      confidence: extractedData.confidence || 0.9
    });
  } catch (error) {
    console.error('OCR extraction error:', error);
    res.status(500).json({ error: 'OCR extraction failed' });
  }
});

// Document authenticity check endpoint
router.post('/authenticity', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Simulate AI authenticity check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const authenticityScore = Math.random() * 20 + 80; // Score between 80-100
    const isAuthentic = authenticityScore >= 85;
    
    res.json({
      authenticityScore: Math.round(authenticityScore),
      isAuthentic,
      confidence: 0.92,
      detectedIssues: isAuthentic ? [] : ['Possible digital alteration detected'],
      processingTime: 1.8
    });
  } catch (error) {
    console.error('Authenticity check error:', error);
    res.status(500).json({ error: 'Authenticity check failed' });
  }
});

// Image quality assessment endpoint
router.post('/quality', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Simulate image quality assessment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const qualityScore = Math.random() * 20 + 80; // Score between 80-100
    const qualityIssues = [];
    
    if (qualityScore < 85) {
      qualityIssues.push('Image resolution could be improved');
    }
    if (qualityScore < 90) {
      qualityIssues.push('Minor blur detected');
    }
    
    res.json({
      qualityScore: Math.round(qualityScore),
      issues: qualityIssues,
      recommendations: qualityIssues.length > 0 ? ['Ensure good lighting', 'Use higher resolution camera'] : [],
      processingTime: 0.8
    });
  } catch (error) {
    console.error('Quality assessment error:', error);
    res.status(500).json({ error: 'Quality assessment failed' });
  }
});

// Cross-reference validation endpoint
router.post('/cross-reference', async (req: Request, res: Response) => {
  try {
    const { documents } = req.body;
    
    if (!documents || typeof documents !== 'object') {
      return res.status(400).json({ error: 'Documents data is required' });
    }

    // Simulate cross-reference validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const matchScore = Math.random() * 20 + 80; // Score between 80-100
    const inconsistencies = [];
    
    if (matchScore < 85) {
      inconsistencies.push('Name variations detected across documents');
    }
    if (matchScore < 90) {
      inconsistencies.push('Minor address discrepancies found');
    }
    
    res.json({
      matchScore: Math.round(matchScore),
      isConsistent: matchScore >= 85,
      inconsistencies,
      validatedFields: ['name', 'address', 'date_of_birth', 'business_name'],
      processingTime: 1.5
    });
  } catch (error) {
    console.error('Cross-reference validation error:', error);
    res.status(500).json({ error: 'Cross-reference validation failed' });
  }
});

// Get document types endpoint
router.get('/types', (req: Request, res: Response) => {
  const documentTypes = [
    {
      id: 'nid_front',
      name: 'National ID (Front)',
      description: 'Front side of Bangladesh National ID card',
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSize: 5 * 1024 * 1024,
      required: true,
      region: 'bangladesh',
      category: 'identity'
    },
    {
      id: 'nid_back',
      name: 'National ID (Back)',
      description: 'Back side of Bangladesh National ID card',
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSize: 5 * 1024 * 1024,
      required: true,
      region: 'bangladesh',
      category: 'identity'
    },
    {
      id: 'trade_license',
      name: 'Trade License',
      description: 'Valid Bangladesh trade license certificate',
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFileSize: 10 * 1024 * 1024,
      required: true,
      region: 'bangladesh',
      category: 'business'
    },
    {
      id: 'tin_certificate',
      name: 'TIN Certificate',
      description: 'Tax identification number certificate',
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFileSize: 10 * 1024 * 1024,
      required: true,
      region: 'bangladesh',
      category: 'business'
    },
    {
      id: 'bank_statement',
      name: 'Bank Statement',
      description: 'Last 3 months bank statement',
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFileSize: 15 * 1024 * 1024,
      required: true,
      region: 'bangladesh',
      category: 'financial'
    }
  ];

  res.json(documentTypes);
});

export default router;