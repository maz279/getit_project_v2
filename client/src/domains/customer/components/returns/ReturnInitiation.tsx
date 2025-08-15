import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Upload, Camera, Package, ArrowRight, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface ReturnInitiationProps {
  orderId?: string;
  onInitiationComplete?: (returnId: string) => void;
}

interface ReturnItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  returnQuantity: number;
  returnReason: string;
}

export const ReturnInitiation: React.FC<ReturnInitiationProps> = ({
  orderId,
  onInitiationComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<ReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [preferredResolution, setPreferredResolution] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock order items
  const orderItems: ReturnItem[] = [
    {
      id: '1',
      name: 'Samsung Galaxy S24 Ultra',
      quantity: 1,
      price: 145000,
      image: '/api/placeholder/100/100',
      returnQuantity: 1,
      returnReason: ''
    },
    {
      id: '2',
      name: 'Wireless Earbuds Pro',
      quantity: 2,
      price: 8500,
      image: '/api/placeholder/100/100',
      returnQuantity: 0,
      returnReason: ''
    }
  ];

  const returnReasons = [
    { value: 'defective', label: 'Defective/Damaged Product' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'size_issue', label: 'Size/Fit Issue' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'changed_mind', label: 'Changed Mind' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other' }
  ];

  const resolutionOptions = [
    { value: 'refund', label: 'Full Refund' },
    { value: 'exchange', label: 'Exchange for Same Item' },
    { value: 'store_credit', label: 'Store Credit' },
    { value: 'repair', label: 'Repair/Replace' }
  ];

  const handleItemSelect = (itemId: string, quantity: number, reason: string) => {
    const updatedItems = selectedItems.map(item =>
      item.id === itemId
        ? { ...item, returnQuantity: quantity, returnReason: reason }
        : item
    );
    
    if (!selectedItems.find(item => item.id === itemId)) {
      const orderItem = orderItems.find(item => item.id === itemId);
      if (orderItem) {
        updatedItems.push({ ...orderItem, returnQuantity: quantity, returnReason: reason });
      }
    }
    
    setSelectedItems(updatedItems.filter(item => item.returnQuantity > 0));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const returnId = `RTN-${Date.now()}`;
      onInitiationComplete?.(returnId);
      setStep(4);
    } catch (error) {
      console.error('Return initiation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Select Items to Return</h2>
        <p className="text-gray-600">Choose which items from your order you'd like to return</p>
      </div>

      <div className="space-y-4">
        {orderItems.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start space-x-4">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} | Price: ৳{item.price.toLocaleString()}
                </p>
                
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Return Quantity</Label>
                    <Select onValueChange={(value) => 
                      handleItemSelect(item.id, parseInt(value), item.returnReason)
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: item.quantity + 1}, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Return Reason</Label>
                    <Select onValueChange={(value) => 
                      handleItemSelect(item.id, item.returnQuantity, value)
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {returnReasons.map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" disabled>
          Previous
        </Button>
        <Button 
          onClick={() => setStep(2)}
          disabled={selectedItems.length === 0}
        >
          Next: Add Photos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Upload Photos</h2>
        <p className="text-gray-600">Help us process your return faster by uploading photos</p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Clear photos help us process your return faster. Include packaging, labels, and any defects.
        </AlertDescription>
      </Alert>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Click to upload photos</p>
          <p className="text-sm text-gray-600">PNG, JPG up to 5MB each</p>
        </label>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {uploadedImages.map((file, index) => (
            <div key={index} className="relative">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Previous
        </Button>
        <Button onClick={() => setStep(3)}>
          Next: Review & Submit
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-600">Review your return details before submitting</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedItems.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.returnQuantity} | Reason: {returnReasons.find(r => r.value === item.returnReason)?.label}
                </p>
              </div>
              <p className="font-semibold">৳{(item.price * item.returnQuantity).toLocaleString()}</p>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Return Amount:</span>
              <span>৳{selectedItems.reduce((sum, item) => sum + (item.price * item.returnQuantity), 0).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Preferred Resolution</Label>
          <Select onValueChange={setPreferredResolution}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select preferred resolution" />
            </SelectTrigger>
            <SelectContent>
              {resolutionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Additional Comments</Label>
          <Textarea
            placeholder="Any additional details about your return..."
            value={returnDescription}
            onChange={(e) => setReturnDescription(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Previous
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!preferredResolution || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Return Request Submitted!</h2>
        <p className="text-gray-600">Your return request has been successfully submitted</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Return ID:</span>
              <span className="font-semibold">RTN-{Date.now()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Time:</span>
              <span className="font-semibold">3-5 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-blue-600">Processing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          We'll send you a return shipping label within 24 hours. You can track your return progress in your account.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.location.href = '/account/orders'}>
          View All Orders
        </Button>
        <Button onClick={() => window.location.href = '/account/returns'}>
          Track Return Status
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`
                w-12 h-0.5 mx-2
                ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default ReturnInitiation;