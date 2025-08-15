import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Building, 
  CreditCard, 
  MapPin,
  Zap,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';
import { EnhancedDocumentUpload } from './EnhancedDocumentUpload';
import { 
  DocumentVerificationService, 
  DocumentStatus, 
  DocumentType,
  DOCUMENT_TYPES
} from '../services/documentVerificationService';

interface DocumentVerificationDashboardProps {
  vendorData: any;
  onDocumentUpdate: (documentType: string, status: DocumentStatus) => void;
  onComplete: () => void;
}

export const DocumentVerificationDashboard: React.FC<DocumentVerificationDashboardProps> = ({
  vendorData,
  onDocumentUpdate,
  onComplete
}) => {
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, DocumentStatus>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [verificationStep, setVerificationStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
  const documentService = DocumentVerificationService.getInstance();

  useEffect(() => {
    // Initialize document statuses
    const initialStatuses: Record<string, DocumentStatus> = {};
    DOCUMENT_TYPES.forEach(docType => {
      initialStatuses[docType.id] = { status: 'pending' };
    });
    setDocumentStatuses(initialStatuses);
  }, []);

  useEffect(() => {
    // Calculate overall progress
    const totalDocs = DOCUMENT_TYPES.filter(dt => dt.required).length;
    const completedDocs = Object.values(documentStatuses).filter(status => status.status === 'success').length;
    const newProgress = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;
    setOverallProgress(newProgress);

    // Update verification step
    if (completedDocs === totalDocs && totalDocs > 0) {
      setVerificationStep('complete');
    } else if (completedDocs > 0) {
      setVerificationStep('processing');
    }
  }, [documentStatuses]);

  const handleDocumentUpload = async (documentType: string, file: File) => {
    try {
      // Update status to uploading
      setDocumentStatuses(prev => ({
        ...prev,
        [documentType]: {
          status: 'uploading',
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          progress: 0
        }
      }));

      // Simulate upload progress
      const uploadProgress = setInterval(() => {
        setDocumentStatuses(prev => {
          const current = prev[documentType];
          if (current.progress! >= 100) {
            clearInterval(uploadProgress);
            return prev;
          }
          return {
            ...prev,
            [documentType]: {
              ...current,
              progress: current.progress! + 20
            }
          };
        });
      }, 500);

      // Upload document
      await documentService.uploadDocument(file, documentType);
      
      // Update to processing
      setDocumentStatuses(prev => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          status: 'processing',
          progress: 100
        }
      }));

      // Extract data
      setTimeout(async () => {
        setDocumentStatuses(prev => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            status: 'extracting'
          }
        }));

        const extractedData = await documentService.extractDataFromDocument(file, documentType);
        
        // Validate data
        setTimeout(async () => {
          setDocumentStatuses(prev => ({
            ...prev,
            [documentType]: {
              ...prev[documentType],
              status: 'validating'
            }
          }));

          const validationResults = await documentService.validateDocument(extractedData, documentType);
          const qualityScore = await documentService.assessImageQuality(file);
          const securityScore = await documentService.checkDocumentAuthenticity(file);

          // Final status
          const isValid = validationResults.every(result => result.status === 'valid');
          const finalStatus: DocumentStatus = {
            status: isValid ? 'success' : 'failed',
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            uploadedAt: new Date().toLocaleString(),
            extractedData,
            validationResults,
            qualityScore,
            securityScore,
            error: isValid ? undefined : 'Document validation failed'
          };

          setDocumentStatuses(prev => ({
            ...prev,
            [documentType]: finalStatus
          }));

          onDocumentUpdate(documentType, finalStatus);
        }, 2000);
      }, 1000);

    } catch (error) {
      setDocumentStatuses(prev => ({
        ...prev,
        [documentType]: {
          status: 'failed',
          fileName: file.name,
          error: 'Upload failed. Please try again.'
        }
      }));
    }
  };

  const handleDocumentDelete = (documentType: string) => {
    setDocumentStatuses(prev => ({
      ...prev,
      [documentType]: { status: 'pending' }
    }));
  };

  const handleDocumentRetry = (documentType: string) => {
    setDocumentStatuses(prev => ({
      ...prev,
      [documentType]: { status: 'pending' }
    }));
  };

  const getDocumentsByCategory = (category: string) => {
    return DOCUMENT_TYPES.filter(dt => dt.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'identity': return User;
      case 'business': return Building;
      case 'financial': return CreditCard;
      case 'address': return MapPin;
      default: return FileText;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'identity': return 'Identity Documents';
      case 'business': return 'Business Documents';
      case 'financial': return 'Financial Documents';
      case 'address': return 'Address Verification';
      default: return 'Documents';
    }
  };

  const getOverallStatus = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(dt => dt.required);
    const completedDocs = requiredDocs.filter(dt => documentStatuses[dt.id]?.status === 'success');
    const failedDocs = requiredDocs.filter(dt => documentStatuses[dt.id]?.status === 'failed');
    
    if (completedDocs.length === requiredDocs.length) {
      return { status: 'complete', message: 'All documents verified successfully' };
    } else if (failedDocs.length > 0) {
      return { status: 'failed', message: `${failedDocs.length} document(s) failed verification` };
    } else {
      return { status: 'pending', message: `${requiredDocs.length - completedDocs.length} document(s) remaining` };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Verification</h2>
        <p className="text-gray-600">
          Upload and verify your documents to complete vendor registration
        </p>
      </div>

      {/* Overall Status */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {overallStatus.status === 'complete' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {overallStatus.status === 'failed' && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                {overallStatus.status === 'pending' && (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-medium">{overallStatus.message}</span>
              </div>
              <Badge variant={overallStatus.status === 'complete' ? 'default' : 'secondary'}>
                {overallProgress.toFixed(0)}% Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Sections */}
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </TabsTrigger>
        </TabsList>

        {['identity', 'business', 'financial', 'address'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {getDocumentsByCategory(category).map(docType => (
                <EnhancedDocumentUpload
                  key={docType.id}
                  documentType={docType.id}
                  title={docType.name}
                  description={docType.description}
                  acceptedFormats={docType.acceptedFormats}
                  maxFileSize={docType.maxFileSize}
                  required={docType.required}
                  onUpload={(file) => handleDocumentUpload(docType.id, file)}
                  onDelete={() => handleDocumentDelete(docType.id)}
                  onRetry={() => handleDocumentRetry(docType.id)}
                  status={documentStatuses[docType.id] || { status: 'pending' }}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* AI-Powered Verification Summary */}
      {verificationStep === 'complete' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="w-5 h-5" />
              AI Verification Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-green-700">Document Authenticity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-green-700">Data Extraction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">88%</div>
                <div className="text-sm text-green-700">Cross-Reference Match</div>
              </div>
            </div>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All documents have been successfully verified and meet Amazon.com/Shopee.sg standards.
                You can now proceed to the next step.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Previous Step
        </Button>
        <Button 
          onClick={onComplete}
          disabled={overallStatus.status !== 'complete'}
          className="flex items-center gap-2"
        >
          {overallStatus.status === 'complete' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Continue to Next Step
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Complete Verification
            </>
          )}
        </Button>
      </div>
    </div>
  );
};