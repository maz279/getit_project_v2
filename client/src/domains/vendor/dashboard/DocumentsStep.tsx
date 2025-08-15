
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Upload, FileText, CheckCircle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface DocumentsStepProps {
  data: {
    tradeLicense: File | null;
    nidCopy: File | null;
    bankStatement: File | null;
  };
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const documentTypes = [
  {
    key: 'tradeLicense',
    title: 'Trade License',
    description: 'Valid trade license from city corporation',
    required: true,
  },
  {
    key: 'nidCopy',
    title: 'National ID Copy',
    description: 'Clear copy of your National ID card',
    required: true,
  },
  {
    key: 'bankStatement',
    title: 'Bank Statement',
    description: 'Recent bank statement (last 3 months)',
    required: false,
  },
];

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const handleFileUpload = (key: string, file: File | null) => {
    updateData({ [key]: file });
  };

  const requiredDocsUploaded = data.tradeLicense && data.nidCopy;

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Upload clear, readable copies of your documents. All documents will be verified within 24-48 hours.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {documentTypes.map((doc) => {
          const file = data[doc.key as keyof typeof data] as File | null;
          
          return (
            <Card key={doc.key} className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {doc.title}
                      {doc.required && <span className="text-red-500 text-sm">*</span>}
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </div>
                  {file && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {file ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">{file.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUpload(doc.key, null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor={doc.key} className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center p-6 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-600">
                            Click to upload {doc.title.toLowerCase()}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG (Max 5MB)
                          </span>
                        </div>
                      </Label>
                      <input
                        id={doc.key}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && file.size > 5 * 1024 * 1024) {
                            alert('File size should be less than 5MB');
                            return;
                          }
                          handleFileUpload(doc.key, file);
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Document Verification Process</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Documents are verified within 24-48 hours</li>
          <li>• You'll receive an email notification once verified</li>
          <li>• Can start listing products immediately after approval</li>
          <li>• Contact support if you need help with documents</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!requiredDocsUploaded} className="min-w-[120px]">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
