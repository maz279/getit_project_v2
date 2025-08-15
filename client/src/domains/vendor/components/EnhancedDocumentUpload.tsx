import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Eye, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Zap
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface DocumentUploadProps {
  documentType: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  required?: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onRetry: () => void;
  status: DocumentStatus;
}

interface DocumentStatus {
  status: 'pending' | 'uploading' | 'processing' | 'extracting' | 'validating' | 'success' | 'failed';
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  error?: string;
  progress?: number;
  extractedData?: any;
  validationResults?: ValidationResult[];
  qualityScore?: number;
}

interface ValidationResult {
  field: string;
  value: string;
  confidence: number;
  status: 'valid' | 'invalid' | 'warning';
  message?: string;
}

export const EnhancedDocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  title,
  description,
  acceptedFormats,
  maxFileSize,
  required = false,
  onUpload,
  onDelete,
  onRetry,
  status
}) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.some(format => format.includes(fileExtension!))) {
      toast({
        title: "Invalid file type",
        description: `Please upload a file in one of these formats: ${acceptedFormats.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `Please upload a file smaller than ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive",
      });
      return;
    }

    onUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const getStatusColor = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'uploading': 
      case 'processing': 
      case 'extracting': 
      case 'validating': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Processing...';
      case 'extracting': return 'Extracting data...';
      case 'validating': return 'Validating...';
      case 'success': return 'Verified';
      case 'failed': return 'Failed';
      default: return 'Upload required';
    }
  };

  const getStatusIcon = (status: DocumentStatus['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploading': 
      case 'processing': 
      case 'extracting': 
      case 'validating': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Upload className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderProcessingSteps = () => {
    if (!['uploading', 'processing', 'extracting', 'validating'].includes(status.status)) {
      return null;
    }

    const steps = [
      { key: 'uploading', label: 'Uploading file', icon: Upload },
      { key: 'processing', label: 'Processing image', icon: Zap },
      { key: 'extracting', label: 'Extracting data', icon: FileText },
      { key: 'validating', label: 'Validating information', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === status.status);

    return (
      <div className="mt-4 space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500 text-white' : 
                isActive ? 'bg-blue-500 text-white' : 
                'bg-gray-200 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-sm ${
                isCompleted ? 'text-green-600' : 
                isActive ? 'text-blue-600' : 
                'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderValidationResults = () => {
    if (!status.validationResults || status.validationResults.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-sm text-gray-700">Extracted Information:</h4>
        {status.validationResults.map((result, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{result.field}:</span>
              <span className="text-sm text-gray-800">{result.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={result.status === 'valid' ? 'default' : 'destructive'}>
                {result.confidence}% confidence
              </Badge>
              {result.status === 'valid' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (status.status === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {title}
            {required && <Badge variant="destructive">Required</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{status.fileName}</p>
              <p className="text-xs text-gray-500">
                {status.fileSize} • Uploaded {status.uploadedAt}
              </p>
              {status.qualityScore && (
                <p className="text-xs text-green-600 mt-1">
                  Quality Score: {status.qualityScore}%
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
          {renderValidationResults()}
        </CardContent>
      </Card>
    );
  }

  if (status.status === 'failed') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            {title}
            {required && <Badge variant="destructive">Required</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" />
              Upload New
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getStatusIcon(status.status)}
          {title}
          {required && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        {status.status === 'pending' ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse your files
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Choose File
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-1" />
                Take Photo
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Supported formats: {acceptedFormats.join(', ')} • Max size: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.status)}
                <span className="font-medium text-gray-700">{getStatusText(status.status)}</span>
              </div>
              <Badge variant="outline">{status.progress || 0}%</Badge>
            </div>
            <Progress value={status.progress || 0} className="mb-2" />
            <p className="text-sm text-gray-600">{status.fileName}</p>
            {renderProcessingSteps()}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};