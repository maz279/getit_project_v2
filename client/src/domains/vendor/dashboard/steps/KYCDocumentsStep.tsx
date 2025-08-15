import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { ArrowLeft, ArrowRight, FileText, CheckCircle, AlertTriangle, Clock, Shield, Zap } from 'lucide-react';
import { DocumentVerificationDashboard } from '@/domains/vendor/components/DocumentVerificationDashboard';
import { DocumentStatus } from '@/domains/vendor/services/documentVerificationService';

interface KYCDocumentsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const KYCDocumentsStep: React.FC<KYCDocumentsStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, DocumentStatus>>({});
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);

  const handleDocumentUpdate = (documentType: string, status: DocumentStatus) => {
    setDocumentStatuses(prev => ({
      ...prev,
      [documentType]: status
    }));
    
    // Update parent component data
    updateData({
      [`${documentType}_status`]: status,
      [`${documentType}_data`]: status.extractedData
    });
  };

  const handleVerificationComplete = () => {
    setIsVerificationComplete(true);
    // Auto-fill form data from extracted document data
    const extractedData: any = {};
    Object.entries(documentStatuses).forEach(([docType, status]) => {
      if (status.extractedData) {
        extractedData[`${docType}_extracted`] = status.extractedData;
      }
    });
    updateData(extractedData);
  };

  const getVerificationSummary = () => {
    const statusCounts = Object.values(documentStatuses).reduce((acc, status) => {
      acc[status.status] = (acc[status.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: Object.keys(documentStatuses).length,
      completed: statusCounts.success || 0,
      failed: statusCounts.failed || 0,
      pending: statusCounts.pending || 0,
      processing: (statusCounts.uploading || 0) + (statusCounts.processing || 0) + (statusCounts.extracting || 0) + (statusCounts.validating || 0)
    };
  };

  const summary = getVerificationSummary();
  const canProceed = isVerificationComplete && summary.failed === 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold">Enhanced Document Verification</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Amazon.com/Shopee.sg Standards
          </Badge>
        </div>
        <p className="text-gray-600">
          Upload your documents for AI-powered verification with OCR data extraction
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Multi-Document Support</h4>
            <p className="text-sm text-gray-600">
              Upload government ID, business licenses, tax certificates, and bank statements
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">OCR Integration</h4>
            <p className="text-sm text-gray-600">
              Automatic data extraction with real-time validation and quality assessment
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">AI Verification</h4>
            <p className="text-sm text-gray-600">
              Document authenticity detection with cross-reference validation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Summary */}
      {summary.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{summary.processing}</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{summary.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Verification Dashboard */}
      <DocumentVerificationDashboard
        vendorData={data}
        onDocumentUpdate={handleDocumentUpdate}
        onComplete={handleVerificationComplete}
      />

      {/* Success Message */}
      {isVerificationComplete && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Document verification completed successfully!</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Amazon.com/Shopee.sg Compliant
              </Badge>
            </div>
            <p className="mt-1 text-sm">
              All documents have been verified and meet international e-commerce standards.
              Extracted data has been automatically populated in your profile.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {summary.failed > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <span className="font-semibold">
              {summary.failed} document(s) failed verification.
            </span>
            <p className="mt-1 text-sm">
              Please review the failed documents and re-upload with better quality images.
              Ensure documents are clear, recent, and unaltered.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Alert */}
      {summary.processing > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-semibold">
              {summary.processing} document(s) are being processed.
            </span>
            <p className="mt-1 text-sm">
              Please wait while our AI system extracts and validates your document data.
              This typically takes 30-60 seconds per document.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Previous Step
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          {canProceed ? (
            <>
              Continue to Store Setup
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Complete Verification First
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Document Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">✅ Document Quality Standards:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Clear, high-resolution images (min 300 DPI)</li>
                <li>• Original documents (no photocopies)</li>
                <li>• Recent documents (within 3 months)</li>
                <li>• Unaltered and authentic documents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📋 Required Documents:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• National ID (both sides)</li>
                <li>• Trade License (if business)</li>
                <li>• TIN Certificate</li>
                <li>• Bank Statement (last 3 months)</li>
                <li>• Address Proof (utility bill)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};