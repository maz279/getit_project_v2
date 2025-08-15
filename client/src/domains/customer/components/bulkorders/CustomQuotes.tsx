import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Phone, 
  Mail,
  Building,
  Calculator,
  Truck,
  Shield
} from 'lucide-react';

interface QuoteFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productCategory: string;
  productDescription: string;
  quantity: string;
  budgetRange: string;
  timeframe: string;
  additionalRequirements: string;
}

export const CustomQuotes: React.FC = () => {
  const [formData, setFormData] = useState<QuoteFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    productCategory: '',
    productDescription: '',
    quantity: '',
    budgetRange: '',
    timeframe: '',
    additionalRequirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const features = [
    {
      icon: <Calculator className="w-5 h-5" />,
      title: 'Competitive Pricing',
      description: 'Get the best wholesale prices tailored to your volume'
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: 'Flexible Delivery',
      description: 'Custom delivery schedules to meet your business needs'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Quality Assurance',
      description: 'Guaranteed quality with our comprehensive QA process'
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Dedicated Support',
      description: '24/7 support from our business solutions team'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quote Request Submitted Successfully!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your interest in our bulk ordering solutions. Our team will review your request and get back to you within 24 hours.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• Our sales team will review your requirements</li>
                <li>• We'll prepare a customized quote within 24 hours</li>
                <li>• You'll receive a detailed proposal via email</li>
                <li>• We'll schedule a call to discuss your needs</li>
              </ul>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)} 
              variant="outline"
              className="mr-4"
            >
              Submit Another Quote
            </Button>
            <Button>
              <Phone className="w-4 h-4 mr-2" />
              Contact Sales Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Request Custom Quote
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized pricing for your bulk orders. Our experts will create a custom solution that fits your business needs and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Quote Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Quote Request Form
              </CardTitle>
              <CardDescription>
                Fill out the form below to get a custom quote for your bulk order requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Your company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="productCategory">Product Category *</Label>
                  <Select onValueChange={(value) => handleInputChange('productCategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics & Tech</SelectItem>
                      <SelectItem value="clothing">Clothing & Apparel</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="construction">Construction & Tools</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="packaging">Packaging & Shipping</SelectItem>
                      <SelectItem value="automotive">Automotive & Transport</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="productDescription">Product Description *</Label>
                  <Textarea
                    id="productDescription"
                    value={formData.productDescription}
                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
                    placeholder="Describe the products you need in detail..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity Needed *</Label>
                    <Input
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="e.g., 1000 pieces"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetRange">Budget Range</Label>
                    <Select onValueChange={(value) => handleInputChange('budgetRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-50k">Under ৳50,000</SelectItem>
                        <SelectItem value="50k-100k">৳50,000 - ৳100,000</SelectItem>
                        <SelectItem value="100k-500k">৳100,000 - ৳500,000</SelectItem>
                        <SelectItem value="500k-1m">৳500,000 - ৳1,000,000</SelectItem>
                        <SelectItem value="over-1m">Over ৳1,000,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="timeframe">Required Timeframe</Label>
                  <Select onValueChange={(value) => handleInputChange('timeframe', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (1-2 weeks)</SelectItem>
                      <SelectItem value="standard">Standard (2-4 weeks)</SelectItem>
                      <SelectItem value="flexible">Flexible (1-2 months)</SelectItem>
                      <SelectItem value="long-term">Long-term (3+ months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                  <Textarea
                    id="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                    placeholder="Any specific requirements, customizations, or special requests..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Quote Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quote Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-6 h-6 mr-2 text-blue-600" />
                  Why Choose Custom Quotes?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-blue-600 mt-1">{feature.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Process Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">1</Badge>
                    <div>
                      <p className="font-medium">Submit Request</p>
                      <p className="text-sm text-gray-600">Complete the quote form</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">2</Badge>
                    <div>
                      <p className="font-medium">Review & Analysis</p>
                      <p className="text-sm text-gray-600">Our team reviews your requirements</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">3</Badge>
                    <div>
                      <p className="font-medium">Custom Quote</p>
                      <p className="text-sm text-gray-600">Receive detailed proposal within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">4</Badge>
                    <div>
                      <p className="font-medium">Finalize & Order</p>
                      <p className="text-sm text-gray-600">Discuss terms and place your order</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Our business solutions team is here to help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-sm text-gray-600">+880 1XXX-XXXXXX</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-sm text-gray-600">bulk@getit-bangladesh.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};