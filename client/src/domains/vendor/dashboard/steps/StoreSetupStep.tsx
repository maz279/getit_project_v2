
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Upload, Store, Image, ArrowLeft, ArrowRight, Eye } from 'lucide-react';

interface StoreSetupStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const storeCategories = [
  'Electronics & Technology',
  'Fashion & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Fitness',
  'Books & Education',
  'Food & Beverages',
  'Automotive',
  'Baby & Kids',
  'Jewelry & Accessories',
  'Handicrafts & Art',
  'Agriculture & Farming'
];

export const StoreSetupStep: React.FC<StoreSetupStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  const handleChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleFileUpload = (field: string, file: File | null) => {
    updateData({ [field]: file });
  };

  const isValid = data.storeName && data.storeDescription && data.storeCategory;

  return (
    <div className="space-y-8 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 rounded-2xl p-8 shadow-xl border border-green-200">
      {/* Enhanced Store Preview */}
      <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            Store Preview
          </CardTitle>
          <CardDescription className="text-green-100">
            This is how your store will appear to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-md">
                {data.storeLogo ? (
                  <img 
                    src={URL.createObjectURL(data.storeLogo)} 
                    alt="Store Logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Store className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {data.storeName || 'Your Store Name'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {data.storeCategory || 'Store Category'} • {data.businessName || 'Business Name'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {data.storeDescription || 'Your store description will appear here...'}
                </p>
              </div>
            </div>
            {data.storeBanner && (
              <div className="mt-4 w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={URL.createObjectURL(data.storeBanner)} 
                  alt="Store Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Store Information */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-800">
          <Store className="w-5 h-5" />
          🏪 Store Information
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                placeholder="Rahman Electronics Store"
                value={data.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                This is the public name customers will see
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeCategory">Store Category *</Label>
              <Select value={data.storeCategory} onValueChange={(value) => handleChange('storeCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store category" />
                </SelectTrigger>
                <SelectContent>
                  {storeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">Store Description *</Label>
            <Textarea
              id="storeDescription"
              placeholder="Tell customers about your store, what you sell, and what makes you special. This will help customers find and trust your business."
              value={data.storeDescription}
              onChange={(e) => handleChange('storeDescription', e.target.value)}
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500">{data.storeDescription.length}/1000 characters</p>
          </div>
        </div>
      </div>

      {/* Enhanced Store Branding */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">
          <Image className="w-5 h-5" />
          🎨 Store Branding
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enhanced Store Logo */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-base">Store Logo</CardTitle>
              <CardDescription className="text-blue-100">
                Upload your store logo (recommended: 200x200px)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.storeLogo ? (
                <div className="space-y-3">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(data.storeLogo)} 
                      alt="Store Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">{data.storeLogo.name}</p>
                    <div className="flex gap-2 justify-center">
                      <Label htmlFor="storeLogo" className="cursor-pointer">
                        <Button variant="outline" size="sm">Change</Button>
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileUpload('storeLogo', null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Label htmlFor="storeLogo" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload logo</p>
                    <p className="text-xs text-gray-500">PNG, JPG (Max 2MB)</p>
                  </div>
                </Label>
              )}
              <input
                id="storeLogo"
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 2 * 1024 * 1024) {
                    alert('File size should be less than 2MB');
                    return;
                  }
                  handleFileUpload('storeLogo', file);
                }}
              />
            </CardContent>
          </Card>

          {/* Enhanced Store Banner */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="text-base">Store Banner</CardTitle>
              <CardDescription className="text-purple-100">
                Upload a banner for your store (recommended: 1200x400px)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.storeBanner ? (
                <div className="space-y-3">
                  <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(data.storeBanner)} 
                      alt="Store Banner" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">{data.storeBanner.name}</p>
                    <div className="flex gap-2 justify-center">
                      <Label htmlFor="storeBanner" className="cursor-pointer">
                        <Button variant="outline" size="sm">Change</Button>
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFileUpload('storeBanner', null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Label htmlFor="storeBanner" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload banner</p>
                    <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
                  </div>
                </Label>
              )}
              <input
                id="storeBanner"
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert('File size should be less than 5MB');
                    return;
                  }
                  handleFileUpload('storeBanner', file);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Store Guidelines */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📋</span>
            </div>
            Store Setup Guidelines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-green-700 mb-2">Store Logo:</h5>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Square format (200x200px recommended)</li>
                <li>• Clear, professional appearance</li>
                <li>• Represents your brand identity</li>
                <li>• PNG format for transparency</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-green-700 mb-2">Store Banner:</h5>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Landscape format (1200x400px recommended)</li>
                <li>• Showcases your products or brand</li>
                <li>• High quality, attractive design</li>
                <li>• Avoid too much text</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="font-medium text-green-700 mb-2">Store Description Tips:</h5>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Clearly describe what you sell</li>
              <li>• Mention your unique selling points</li>
              <li>• Include quality assurance information</li>
              <li>• Keep it customer-focused and engaging</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px] bg-white/70 backdrop-blur-sm hover:bg-white/90 border-green-300 text-green-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="min-w-[120px] bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
