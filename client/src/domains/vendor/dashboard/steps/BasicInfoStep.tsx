
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Checkbox } from '@/shared/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { User, Mail, Phone, Store, MapPin, ArrowLeft, ArrowRight, FileText, HelpCircle, Shield, CheckCircle, AlertCircle, Building, CreditCard, DollarSign, Briefcase, Globe, Target } from 'lucide-react';
import { HelpTooltip } from '@/domains/vendor/components/HelpTooltip';
import { helpTooltips } from '@/domains/vendor/data/helpTooltips';
import { OTPVerificationModal } from '@/domains/vendor/components/OTPVerificationModal';
import { CountryCodeSelector } from '@/domains/vendor/components/CountryCodeSelector';
import { otpService } from '@/domains/vendor/services/otpService';

interface BasicInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface VerificationStatus {
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneVerificationLoading: boolean;
  emailVerificationLoading: boolean;
  phoneError: string;
  emailError: string;
}

const businessTypes = [
  'Sole Proprietorship',
  'Partnership',
  'Private Limited Company',
  'Public Limited Company',
  'Others'
];

const businessCategories = [
  'Electronics & Gadgets',
  'Fashion & Clothing',
  'Home & Living',
  'Health & Beauty',
  'Food & Groceries',
  'Books & Stationery',
  'Sports & Outdoor',
  'Handicrafts',
  'Automotive',
  'Others'
];

// Default country for Bangladesh users
const defaultCountry = { code: 'BD', country: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' };

const countries = [
  'Bangladesh', 'India', 'Pakistan', 'Nepal', 'Bhutan', 'Sri Lanka', 'Myanmar', 'Thailand',
  'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Vietnam', 'Cambodia', 'Laos',
  'China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau', 'Mongolia',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
  'Australia', 'New Zealand', 'South Africa', 'Egypt', 'Turkey', 'Russia', 'Brazil',
  'Others'
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpType, setOtpType] = useState<'phone' | 'email'>('phone');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [verification, setVerification] = useState<VerificationStatus>({
    phoneVerified: data.phoneVerified || false,
    emailVerified: data.emailVerified || false,
    phoneVerificationLoading: false,
    emailVerificationLoading: false,
    phoneError: '',
    emailError: ''
  });

  const handleChange = (field: string, value: string | boolean) => {
    updateData({ [field]: value });
    
    // Reset verification status when contact info changes
    if (field === 'phone' && verification.phoneVerified) {
      setVerification(prev => ({ ...prev, phoneVerified: false }));
      updateData({ phoneVerified: false });
    }
    if (field === 'email' && verification.emailVerified) {
      setVerification(prev => ({ ...prev, emailVerified: false }));
      updateData({ emailVerified: false });
    }
  };

  const formatNID = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 10) {
      // 10-digit format: 123 456 789 0
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, '$1 $2 $3 $4');
    } else if (digits.length <= 13) {
      // 13-digit format: 1234 5678 9012 3
      return digits.replace(/(\d{4})(\d{4})(\d{4})(\d{1})/, '$1 $2 $3 $4');
    } else {
      // 17-digit format: 12345 67890 12345 67
      return digits.replace(/(\d{5})(\d{5})(\d{5})(\d{2})/, '$1 $2 $3 $4');
    }
  };

  const handleNIDChange = (value: string) => {
    const formatted = formatNID(value);
    handleChange('nidNumber', formatted);
  };

  const validateNID = (nid: string) => {
    const digits = nid.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 13 || digits.length === 17;
  };

  const handleSendOTP = async (type: 'phone' | 'email') => {
    const contact = type === 'phone' ? data.phone : data.email;
    
    if (!contact) {
      setVerification(prev => ({ 
        ...prev, 
        [`${type}Error`]: `Please enter your ${type === 'phone' ? 'phone number' : 'email address'} first` 
      }));
      return;
    }

    if (type === 'phone' && !otpService.isValidInternationalPhone(contact)) {
      setVerification(prev => ({ 
        ...prev, 
        phoneError: 'Please enter a valid international phone number (e.g., +880123456789)' 
      }));
      return;
    }

    if (type === 'email' && !otpService.isValidEmail(contact)) {
      setVerification(prev => ({ 
        ...prev, 
        emailError: 'Please enter a valid email address' 
      }));
      return;
    }

    setVerification(prev => ({ 
      ...prev, 
      [`${type}VerificationLoading`]: true, 
      [`${type}Error`]: '' 
    }));

    try {
      const response = type === 'phone' 
        ? await otpService.sendPhoneOTP(otpService.formatInternationalPhone(contact))
        : await otpService.sendEmailOTP(contact);

      if (response.success) {
        setOtpType(type);
        setShowOTPModal(true);
        setOtpError('');
        setOtpSuccess(false);
      } else {
        setVerification(prev => ({ 
          ...prev, 
          [`${type}Error`]: response.message || 'Failed to send OTP' 
        }));
      }
    } catch (error: any) {
      setVerification(prev => ({ 
        ...prev, 
        [`${type}Error`]: error.message || 'Failed to send OTP' 
      }));
    } finally {
      setVerification(prev => ({ 
        ...prev, 
        [`${type}VerificationLoading`]: false 
      }));
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setOtpLoading(true);
    setOtpError('');

    try {
      const contact = otpType === 'phone' ? data.phone : data.email;
      const response = otpType === 'phone' 
        ? await otpService.verifyPhoneOTP(otpService.formatInternationalPhone(contact), otp)
        : await otpService.verifyEmailOTP(contact, otp);

      if (response.success) {
        setOtpSuccess(true);
        setVerification(prev => ({ 
          ...prev, 
          [`${otpType}Verified`]: true,
          [`${otpType}Error`]: ''
        }));
        updateData({ [`${otpType}Verified`]: true });
        
        setTimeout(() => {
          setShowOTPModal(false);
          setOtpSuccess(false);
        }, 1500);
      } else {
        setOtpError(response.message || 'Invalid OTP code');
      }
    } catch (error: any) {
      setOtpError(error.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = () => {
    handleSendOTP(otpType);
  };

  const isValid = data.fullName && data.email && data.phone && data.country && data.city &&
                 data.businessName && data.businessType && data.businessCategory &&
                 verification.phoneVerified && verification.emailVerified;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Step 2 of 9: Basic Information</h2>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '22%' }}></div>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            👤 Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-purple-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center">
                Full Name (as per NID) *
                <HelpTooltip content="Enter your full name exactly as it appears on your National ID card. This will be used for verification purposes." />
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={data.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="pl-10 border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center">
                Date of Birth *
                <HelpTooltip content="Enter your date of birth as it appears on your official documents." />
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth || ''}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center">
                Gender *
                <HelpTooltip content="Select your gender as per official documents." />
              </Label>
              <Select
                value={data.gender || ''}
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality" className="flex items-center">
                Nationality *
                <HelpTooltip content="Select your nationality as per your passport." />
              </Label>
              <Select
                value={data.nationality || ''}
                onValueChange={(value) => handleChange('nationality', value)}
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="bangladeshi">Bangladeshi</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="british">British</SelectItem>
                  <SelectItem value="pakistani">Pakistani</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="korean">Korean</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                Email Address *
                <HelpTooltip content={helpTooltips.businessEmail.content} type={helpTooltips.businessEmail.type} />
                {verification.emailVerified && (
                  <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="abdul.rahman@email.com"
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10 border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-md"
                  required
                />
                <Button
                  type="button"
                  variant={verification.emailVerified ? "default" : "outline"}
                  size="sm"
                  className={`absolute right-2 top-2 ${verification.emailVerified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0'}`}
                  onClick={() => handleSendOTP('email')}
                  disabled={!data.email || verification.emailVerificationLoading || verification.emailVerified}
                >
                  {verification.emailVerificationLoading ? (
                    <>
                      <Shield className="w-4 h-4 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : verification.emailVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-1" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
              {verification.emailError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{verification.emailError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center">
                Mobile Number *
                <HelpTooltip content={helpTooltips.businessPhone.content} type={helpTooltips.businessPhone.type} />
                {verification.phoneVerified && (
                  <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </Label>
              <div className="flex gap-2">
                <CountryCodeSelector
                  selectedCountry={selectedCountry}
                  onCountryChange={(country) => {
                    setSelectedCountry(country);
                    // Update phone number with new country code
                    const phoneWithoutCountryCode = data.phone?.replace(/^\+\d+/, '') || '';
                    handleChange('phone', `${country.dialCode}${phoneWithoutCountryCode}`);
                  }}
                  className="w-52"
                />
                <Input
                  id="phone"
                  placeholder="1234567890 (mobile number)"
                  value={data.phone?.replace(/^\+\d+/, '') || ''}
                  onChange={(e) => {
                    const phoneNumber = e.target.value.replace(/\D/g, '');
                    handleChange('phone', `${selectedCountry.dialCode}${phoneNumber}`);
                  }}
                  className="flex-1 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-green-50 transition-all duration-300 hover:shadow-md"
                  maxLength={15}
                  required
                />
                <Button
                  type="button"
                  variant={verification.phoneVerified ? "default" : "outline"}
                  size="sm"
                  className={verification.phoneVerified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 border-0'}
                  onClick={() => handleSendOTP('phone')}
                  disabled={!data.phone || verification.phoneVerificationLoading || verification.phoneVerified}
                >
                  {verification.phoneVerificationLoading ? (
                    <>
                      <Shield className="w-4 h-4 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : verification.phoneVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-1" />
                      Verify OTP
                    </>
                  )}
                </Button>
              </div>
              {verification.phoneError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{verification.phoneError}</AlertDescription>
                </Alert>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span>Selected: {selectedCountry.flag} {selectedCountry.country} ({selectedCountry.dialCode})</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="governmentId" className="flex items-center">
                Government ID Number (Optional)
                <HelpTooltip content="Enter your government-issued ID number (National ID, Passport, etc.) for KYC verification. This is optional for international vendors." />
                {data.governmentId && data.governmentId.length > 5 && (
                  <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Provided
                  </Badge>
                )}
              </Label>
              <Input
                id="governmentId"
                placeholder="Enter ID number (National ID, Passport, etc.)"
                value={data.governmentId}
                onChange={(e) => handleChange('governmentId', e.target.value)}
                className="border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 transition-all duration-300 hover:shadow-md"
                maxLength={30}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">ℹ️ Optional for international vendors</p>
                {data.governmentId && data.governmentId.length > 0 && data.governmentId.length < 5 && (
                  <p className="text-xs text-red-500">ID number seems too short</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            🏢 Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-blue-50 p-6 rounded-b-lg">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="flex items-center">
              Business Name *
              <HelpTooltip content={helpTooltips.businessName.content} type={helpTooltips.businessName.type} />
            </Label>
            <div className="relative">
              <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="businessName"
                placeholder="Rahman Electronics & Mobile Shop"
                value={data.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="pl-10 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-green-50 transition-all duration-300 hover:shadow-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Business Type *
                <HelpTooltip content={helpTooltips.businessType.content} type={helpTooltips.businessType.type} />
              </Label>
              <Select value={data.businessType} onValueChange={(value) => handleChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Business Category (Primary) *
                <HelpTooltip content={helpTooltips.businessCategory.content} type={helpTooltips.businessCategory.type} />
              </Label>
              <Select value={data.businessCategory} onValueChange={(value) => handleChange('businessCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary category" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Years in Business</Label>
            <RadioGroup 
              value={data.yearsInBusiness} 
              onValueChange={(value) => handleChange('yearsInBusiness', value)}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">New Business</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-2" id="1-2" />
                <Label htmlFor="1-2">1-2 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-5" id="3-5" />
                <Label htmlFor="3-5">3-5 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5+" id="5+" />
                <Label htmlFor="5+">5+ years</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              placeholder="Tell us about your business, products, and target customers. This helps us provide better support. (Max 500 characters)"
              value={data.businessDescription}
              onChange={(e) => handleChange('businessDescription', e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-gray-500">{data.businessDescription?.length || 0}/500 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Business Registration Information */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-orange-600" />
            </div>
            🏛️ Business Registration Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-orange-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessLicense" className="flex items-center text-orange-800 font-medium">
                Business License/Registration Number (Optional)
                <HelpTooltip content="Enter your business license number or trade license number issued by your local government. This is optional for international vendors." />
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="businessLicense"
                  placeholder="Enter your business license number"
                  value={data.businessLicense}
                  onChange={(e) => handleChange('businessLicense', e.target.value)}
                  className="pl-10 border-2 border-orange-200 focus:border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="flex items-center text-orange-800 font-medium">
                Tax Identification Number (TIN)
                <HelpTooltip content="Enter your Tax Identification Number (TIN) for tax compliance. This is required for businesses with annual revenue above certain thresholds." />
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="taxId"
                  placeholder="12345678901"
                  value={data.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  className="pl-10 border-2 border-orange-200 focus:border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber" className="flex items-center text-orange-800 font-medium">
                VAT Registration Number (if applicable)
                <HelpTooltip content="Enter your VAT registration number if your business is registered for Value Added Tax (VAT). This is required for businesses with annual turnover above 3 million BDT." />
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="vatNumber"
                  placeholder="BIN-123456789"
                  value={data.vatNumber}
                  onChange={(e) => handleChange('vatNumber', e.target.value)}
                  className="pl-10 border-2 border-orange-200 focus:border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-orange-800 font-medium">
                Annual Revenue Range
                <HelpTooltip content="Select your expected annual revenue range. This helps us provide appropriate tax compliance guidance and support." />
              </Label>
              <Select value={data.annualRevenue} onValueChange={(value) => handleChange('annualRevenue', value)}>
                <SelectTrigger className="border-2 border-orange-200 focus:border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-500k">0 - 5 Lakh BDT</SelectItem>
                  <SelectItem value="500k-1m">5 Lakh - 10 Lakh BDT</SelectItem>
                  <SelectItem value="1m-3m">10 Lakh - 30 Lakh BDT</SelectItem>
                  <SelectItem value="3m-10m">30 Lakh - 1 Crore BDT</SelectItem>
                  <SelectItem value="10m+">1 Crore+ BDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
            <Label className="flex items-center text-orange-800 font-medium">
              Business Tax Status
              <HelpTooltip content="Select your business tax status to help us provide relevant tax compliance information." />
            </Label>
            <RadioGroup 
              value={data.taxStatus} 
              onValueChange={(value) => handleChange('taxStatus', value)}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200 hover:shadow-md transition-all duration-300">
                <RadioGroupItem value="registered" id="registered" />
                <Label htmlFor="registered" className="text-orange-800 font-medium">VAT Registered</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200 hover:shadow-md transition-all duration-300">
                <RadioGroupItem value="not-registered" id="not-registered" />
                <Label htmlFor="not-registered" className="text-orange-800 font-medium">Not VAT Registered</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200 hover:shadow-md transition-all duration-300">
                <RadioGroupItem value="applying" id="applying" />
                <Label htmlFor="applying" className="text-orange-800 font-medium">Applying for Registration</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Financial Information with International Support */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            💳 Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-blue-50 p-6 rounded-b-lg">
          {/* Business Currency Selection */}
          <div className="space-y-2">
            <Label className="flex items-center text-blue-800 font-medium">
              Business Currency *
              <HelpTooltip content="Select your primary business currency for transactions and reporting." />
            </Label>
            <Select value={data.businessCurrency} onValueChange={(value) => handleChange('businessCurrency', value)}>
              <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                <SelectItem value="THB">THB - Thai Baht</SelectItem>
                <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tax Information */}
          <div className="space-y-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <h4 className="text-blue-800 font-medium">Tax Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId" className="flex items-center text-blue-800 font-medium">
                  Tax ID / Business Number *
                  <HelpTooltip content="Enter your tax identification number or business registration number. This varies by country (e.g., EIN for US, VAT for EU, TIN for other countries)." />
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="taxId"
                    placeholder={data.country === 'Bangladesh' ? '12345678901' : data.country === 'United States' ? 'EIN: 12-3456789' : 'Enter tax ID'}
                    value={data.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    className="pl-10 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatNumber" className="flex items-center text-blue-800 font-medium">
                  VAT/GST Number
                  <HelpTooltip content="Enter your VAT, GST, or sales tax registration number if applicable. Required for businesses in many countries." />
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="vatNumber"
                    placeholder={data.country === 'Bangladesh' ? 'BIN-123456789' : data.country === 'United Kingdom' ? 'GB123456789' : 'Enter VAT/GST number'}
                    value={data.vatNumber}
                    onChange={(e) => handleChange('vatNumber', e.target.value)}
                    className="pl-10 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-blue-800 font-medium">
                Tax Residency Status
                <HelpTooltip content="Select your tax residency status for compliance and reporting purposes." />
              </Label>
              <Select value={data.taxResidency} onValueChange={(value) => handleChange('taxResidency', value)}>
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select tax residency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Tax Resident</SelectItem>
                  <SelectItem value="non-resident">Non-Resident</SelectItem>
                  <SelectItem value="dual-resident">Dual Resident</SelectItem>
                  <SelectItem value="exempt">Tax Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <h4 className="text-blue-800 font-medium">Banking Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.country === 'Bangladesh' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="flex items-center text-blue-800 font-medium">
                      Primary Bank Name *
                      <HelpTooltip content="Select your primary business bank in Bangladesh." />
                    </Label>
                    <Select value={data.bankName} onValueChange={(value) => handleChange('bankName', value)}>
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dutch-bangla">Dutch-Bangla Bank</SelectItem>
                        <SelectItem value="brac">BRAC Bank</SelectItem>
                        <SelectItem value="city">City Bank</SelectItem>
                        <SelectItem value="eastern">Eastern Bank</SelectItem>
                        <SelectItem value="islami">Islami Bank</SelectItem>
                        <SelectItem value="sonali">Sonali Bank</SelectItem>
                        <SelectItem value="agrani">Agrani Bank</SelectItem>
                        <SelectItem value="janata">Janata Bank</SelectItem>
                        <SelectItem value="other">Other Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="flex items-center text-blue-800 font-medium">
                      Bank Name *
                      <HelpTooltip content="Enter your business bank name." />
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="bankName"
                        placeholder="Enter bank name"
                        value={data.bankName}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                        className="pl-10 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swiftCode" className="flex items-center text-blue-800 font-medium">
                      SWIFT/BIC Code *
                      <HelpTooltip content="Enter your bank's SWIFT code for international wire transfers." />
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="swiftCode"
                        placeholder="e.g., ABCDUS33XXX"
                        value={data.swiftCode}
                        onChange={(e) => handleChange('swiftCode', e.target.value)}
                        className="pl-10 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iban" className="flex items-center text-blue-800 font-medium">
                      IBAN (if applicable)
                      <HelpTooltip content="Enter your International Bank Account Number if your country uses IBAN." />
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="iban"
                        placeholder="e.g., GB82WEST12345698765432"
                        value={data.iban}
                        onChange={(e) => handleChange('iban', e.target.value)}
                        className="pl-10 border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="accountType" className="flex items-center text-blue-800 font-medium">
                  Account Type *
                  <HelpTooltip content="Select your business account type." />
                </Label>
                <Select value={data.accountType} onValueChange={(value) => handleChange('accountType', value)}>
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business-checking">Business Checking</SelectItem>
                    <SelectItem value="business-savings">Business Savings</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                    <SelectItem value="multi-currency">Multi-Currency Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
            <h4 className="text-blue-800 font-medium">Payment Methods</h4>
            
            {data.country === 'Bangladesh' ? (
              <div className="space-y-3">
                <Label className="flex items-center text-blue-800 font-medium">
                  Mobile Banking Services
                  <HelpTooltip content="Select the mobile banking services you use for business transactions." />
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['bkash', 'nagad', 'rocket'].map((service) => (
                    <div key={service} className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                      <Checkbox 
                        id={service}
                        checked={data.mobileBanking?.includes(service)}
                        onCheckedChange={(checked) => {
                          const current = data.mobileBanking || [];
                          if (checked) {
                            handleChange('mobileBanking', [...current, service]);
                          } else {
                            handleChange('mobileBanking', current.filter(item => item !== service));
                          }
                        }}
                      />
                      <Label htmlFor={service} className="text-blue-800 font-medium">
                        {service === 'bkash' ? 'bKash' : service === 'nagad' ? 'Nagad' : 'Rocket'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="flex items-center text-blue-800 font-medium">
                  International Payment Methods
                  <HelpTooltip content="Select the payment methods you can accept for international transactions." />
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['paypal', 'stripe', 'wise', 'payoneer', 'worldpay', 'alipay'].map((service) => (
                    <div key={service} className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                      <Checkbox 
                        id={service}
                        checked={data.internationalPayments?.includes(service)}
                        onCheckedChange={(checked) => {
                          const current = data.internationalPayments || [];
                          if (checked) {
                            handleChange('internationalPayments', [...current, service]);
                          } else {
                            handleChange('internationalPayments', current.filter(item => item !== service));
                          }
                        }}
                      />
                      <Label htmlFor={service} className="text-blue-800 font-medium">
                        {service === 'paypal' ? 'PayPal' : 
                         service === 'stripe' ? 'Stripe' : 
                         service === 'wise' ? 'Wise' : 
                         service === 'payoneer' ? 'Payoneer' : 
                         service === 'worldpay' ? 'WorldPay' : 
                         service === 'alipay' ? 'Alipay' : service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center text-blue-800 font-medium">
                Preferred Payment Method *
                <HelpTooltip content="Select your preferred payment method for receiving payments from customers." />
              </Label>
              <Select value={data.preferredPayment} onValueChange={(value) => handleChange('preferredPayment', value)}>
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {data.country === 'Bangladesh' ? (
                    <>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile-banking">Mobile Banking</SelectItem>
                      <SelectItem value="cash-on-delivery">Cash on Delivery</SelectItem>
                      <SelectItem value="all">All Methods</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="wire-transfer">Wire Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="wise">Wise</SelectItem>
                      <SelectItem value="payoneer">Payoneer</SelectItem>
                      <SelectItem value="all">All Available Methods</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Annual Revenue */}
          <div className="space-y-2">
            <Label className="flex items-center text-blue-800 font-medium">
              Annual Revenue Range *
              <HelpTooltip content="Select your expected annual revenue range in your business currency." />
            </Label>
            <Select value={data.annualRevenue} onValueChange={(value) => handleChange('annualRevenue', value)}>
              <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 transition-all duration-300 hover:shadow-md">
                <SelectValue placeholder="Select revenue range" />
              </SelectTrigger>
              <SelectContent>
                {data.businessCurrency === 'BDT' ? (
                  <>
                    <SelectItem value="0-500k">0 - 5 Lakh BDT</SelectItem>
                    <SelectItem value="500k-1m">5 Lakh - 10 Lakh BDT</SelectItem>
                    <SelectItem value="1m-3m">10 Lakh - 30 Lakh BDT</SelectItem>
                    <SelectItem value="3m-10m">30 Lakh - 1 Crore BDT</SelectItem>
                    <SelectItem value="10m+">1 Crore+ BDT</SelectItem>
                  </>
                ) : data.businessCurrency === 'USD' ? (
                  <>
                    <SelectItem value="0-10k">$0 - $10,000</SelectItem>
                    <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                    <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                    <SelectItem value="1m+">$1,000,000+</SelectItem>
                  </>
                ) : data.businessCurrency === 'EUR' ? (
                  <>
                    <SelectItem value="0-10k">€0 - €10,000</SelectItem>
                    <SelectItem value="10k-50k">€10,000 - €50,000</SelectItem>
                    <SelectItem value="50k-100k">€50,000 - €100,000</SelectItem>
                    <SelectItem value="100k-500k">€100,000 - €500,000</SelectItem>
                    <SelectItem value="500k-1m">€500,000 - €1,000,000</SelectItem>
                    <SelectItem value="1m+">€1,000,000+</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="0-10k">Less than 10,000</SelectItem>
                    <SelectItem value="10k-50k">10,000 - 50,000</SelectItem>
                    <SelectItem value="50k-100k">50,000 - 100,000</SelectItem>
                    <SelectItem value="100k-500k">100,000 - 500,000</SelectItem>
                    <SelectItem value="500k-1m">500,000 - 1,000,000</SelectItem>
                    <SelectItem value="1m+">1,000,000+</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Business Address */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            📍 Business Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-green-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center text-green-800 font-medium">
                Country *
                <HelpTooltip content="Select your business country. This is required for location verification and shipping calculations." />
              </Label>
              <Select value={data.country} onValueChange={(value) => handleChange('country', value)}>
                <SelectTrigger className="border-2 border-green-200 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-green-800 font-medium">
                State/Province
                <HelpTooltip content="Enter your state or province for accurate location identification." />
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter state/province"
                  value={data.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="pl-10 border-2 border-green-200 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-green-800 font-medium">
                City *
                <HelpTooltip content="Enter your business city. This is required for location verification and customer service." />
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter city"
                  value={data.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="pl-10 border-2 border-green-200 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-green-800 font-medium">
                Area/District
                <HelpTooltip content="Enter your area or district for more precise location identification." />
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter area or district"
                  value={data.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className="pl-10 border-2 border-green-200 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="streetAddress" className="flex items-center text-green-800 font-medium">
              Street Address
              <HelpTooltip content="Enter your complete street address including house number, road name, and area." />
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="streetAddress"
                placeholder="House 12, Road 8, Dhanmondi R/A"
                value={data.streetAddress}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                className="pl-10 border-2 border-green-200 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="flex items-center text-green-800 font-medium">
                Postal Code
                <HelpTooltip content="Enter your postal code for accurate delivery and shipping calculations." />
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="postalCode"
                  placeholder="1205"
                  value={data.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="pl-10 border-2 border-green-200 focus:border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200">
            <Label className="text-green-800 font-medium">Address Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
                <Checkbox 
                  id="sameAsPickup"
                  checked={data.sameAsPickup}
                  onCheckedChange={(checked) => handleChange('sameAsPickup', checked)}
                />
                <Label htmlFor="sameAsPickup" className="text-green-800 font-medium">Same as pickup address</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
                <Checkbox 
                  id="multipleLocations"
                  checked={data.multipleLocations}
                  onCheckedChange={(checked) => handleChange('multipleLocations', checked)}
                />
                <Label htmlFor="multipleLocations" className="text-green-800 font-medium">I have multiple pickup locations</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Language Preference */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            🌐 Language Preference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-purple-50 p-6 rounded-b-lg">
          <div className="space-y-4">
            <Label className="text-purple-800 font-medium">Select your preferred language for vendor dashboard</Label>
            <RadioGroup 
              value={data.languagePreference} 
              onValueChange={(value) => handleChange('languagePreference', value)}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-300">
                <RadioGroupItem value="english" id="english" />
                <Label htmlFor="english" className="text-purple-800 font-medium">English</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-300">
                <RadioGroupItem value="bangla" id="bangla" />
                <Label htmlFor="bangla" className="text-purple-800 font-medium">বাংলা</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-300">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="text-purple-800 font-medium">Both</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Shop Setup Preferences */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-pink-600" />
            </div>
            🎯 Shop Setup Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-gradient-to-br from-white to-pink-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shopName" className="flex items-center text-pink-800 font-medium">
                Shop Display Name
                <HelpTooltip content="This is the name that will be displayed to customers on the marketplace. Make it catchy and memorable." />
              </Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="shopName"
                  placeholder="Rahman's Electronics Hub"
                  value={data.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  className="pl-10 border-2 border-pink-200 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopSlogan" className="flex items-center text-pink-800 font-medium">
                Shop Slogan/Tagline
                <HelpTooltip content="A short and catchy slogan that describes your shop's unique value proposition." />
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="shopSlogan"
                  placeholder="Quality Electronics at Best Price"
                  value={data.shopSlogan}
                  onChange={(e) => handleChange('shopSlogan', e.target.value)}
                  className="pl-10 border-2 border-pink-200 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-300 hover:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-pink-800 font-medium">
                Primary Sales Channel
                <HelpTooltip content="Select your primary sales channel to help us provide targeted features and support." />
              </Label>
              <Select value={data.primaryChannel} onValueChange={(value) => handleChange('primaryChannel', value)}>
                <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select primary channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online-only">Online Only</SelectItem>
                  <SelectItem value="physical-store">Physical Store</SelectItem>
                  <SelectItem value="both">Both Online & Physical</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-pink-800 font-medium">
                Target Customer Base
                <HelpTooltip content="Select your target customer base to help us customize features and marketing support." />
              </Label>
              <Select value={data.targetCustomer} onValueChange={(value) => handleChange('targetCustomer', value)}>
                <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Select target customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Community</SelectItem>
                  <SelectItem value="nationwide">Nationwide</SelectItem>
                  <SelectItem value="young-adults">Young Adults</SelectItem>
                  <SelectItem value="families">Families</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center text-pink-800 font-medium">
              Online Presence
              <HelpTooltip content="Select the online platforms where you currently sell or plan to sell your products." />
            </Label>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-pink-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                    <Checkbox 
                      id="facebook"
                      checked={data.onlinePresence?.includes('facebook')}
                      onCheckedChange={(checked) => {
                        const current = data.onlinePresence || [];
                        if (checked) {
                          handleChange('onlinePresence', [...current, 'facebook']);
                        } else {
                          handleChange('onlinePresence', current.filter(item => item !== 'facebook'));
                        }
                      }}
                    />
                    <Label htmlFor="facebook" className="text-pink-800 font-medium">Facebook Shop</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                    <Checkbox 
                      id="instagram"
                      checked={data.onlinePresence?.includes('instagram')}
                      onCheckedChange={(checked) => {
                        const current = data.onlinePresence || [];
                        if (checked) {
                          handleChange('onlinePresence', [...current, 'instagram']);
                        } else {
                          handleChange('onlinePresence', current.filter(item => item !== 'instagram'));
                        }
                      }}
                    />
                    <Label htmlFor="instagram" className="text-pink-800 font-medium">Instagram</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                    <Checkbox 
                      id="website"
                      checked={data.onlinePresence?.includes('website')}
                      onCheckedChange={(checked) => {
                        const current = data.onlinePresence || [];
                        if (checked) {
                          handleChange('onlinePresence', [...current, 'website']);
                        } else {
                          handleChange('onlinePresence', current.filter(item => item !== 'website'));
                        }
                      }}
                    />
                    <Label htmlFor="website" className="text-pink-800 font-medium">Own Website</Label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                    <Checkbox 
                      id="whatsapp"
                      checked={data.onlinePresence?.includes('whatsapp')}
                      onCheckedChange={(checked) => {
                        const current = data.onlinePresence || [];
                        if (checked) {
                          handleChange('onlinePresence', [...current, 'whatsapp']);
                        } else {
                          handleChange('onlinePresence', current.filter(item => item !== 'whatsapp'));
                        }
                      }}
                    />
                    <Label htmlFor="whatsapp" className="text-pink-800 font-medium">WhatsApp Business</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                    <Checkbox 
                      id="youtube"
                      checked={data.onlinePresence?.includes('youtube')}
                      onCheckedChange={(checked) => {
                        const current = data.onlinePresence || [];
                        if (checked) {
                          handleChange('onlinePresence', [...current, 'youtube']);
                        } else {
                          handleChange('onlinePresence', current.filter(item => item !== 'youtube'));
                        }
                      }}
                    />
                    <Label htmlFor="youtube" className="text-pink-800 font-medium">YouTube Channel</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                    <Checkbox 
                      id="none"
                      checked={data.onlinePresence?.includes('none')}
                      onCheckedChange={(checked) => {
                        const current = data.onlinePresence || [];
                        if (checked) {
                          handleChange('onlinePresence', [...current, 'none']);
                        } else {
                          handleChange('onlinePresence', current.filter(item => item !== 'none'));
                        }
                      }}
                    />
                    <Label htmlFor="none" className="text-pink-800 font-medium">None (New to Online)</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessGoals" className="flex items-center text-pink-800 font-medium">
              Business Goals & Expectations
              <HelpTooltip content="Tell us about your business goals and what you expect from joining our platform. This helps us provide better support and features." />
            </Label>
            <Textarea
              id="businessGoals"
              placeholder="e.g., I want to reach more customers online, increase sales by 50%, expand to new markets, etc."
              value={data.businessGoals}
              onChange={(e) => handleChange('businessGoals', e.target.value)}
              rows={3}
              maxLength={300}
              className="border-2 border-pink-200 focus:border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 transition-all duration-300 hover:shadow-md"
            />
            <p className="text-xs text-pink-600 font-medium">{data.businessGoals?.length || 0}/300 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Validation Messages */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-teal-600" />
            </div>
            ⚠️ Real-time Validation Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-gradient-to-br from-white to-teal-50 p-6 rounded-b-lg">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-700 font-medium">✅ Valid Bangladesh mobile number</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-lg border border-red-200 hover:shadow-md transition-all duration-300">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 font-medium">❌ NID format should be XXX XXX XXX XXX</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-200 hover:shadow-md transition-all duration-300">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-yellow-700 font-medium">⏳ Checking business name availability...</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
              <Shield className="w-4 h-4 text-blue-600" />
              <p className="text-blue-700 font-medium">💡 Tip: Use your legal business name for faster approval</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Help Section */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
            </div>
            📞 Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-gradient-to-br from-white to-emerald-50 p-6 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200 hover:shadow-md transition-all duration-300">
                <Phone className="w-4 h-4 text-emerald-600" />
                <p className="text-emerald-700 font-medium">📱 WhatsApp: +880-1600-GetIt</p>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200 hover:shadow-md transition-all duration-300">
                <Mail className="w-4 h-4 text-emerald-600" />
                <p className="text-emerald-700 font-medium">📧 Email: vendor-support@getit.com.bd</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200 hover:shadow-md transition-all duration-300">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-emerald-700 font-medium">💬 Live Chat: Available 8 AM - 10 PM</p>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200 hover:shadow-md transition-all duration-300">
                <FileText className="w-4 h-4 text-emerald-600" />
                <p className="text-emerald-700 font-medium">📹 Video Guide: "How to fill basic information"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status Alert */}
      {(!verification.phoneVerified || !verification.emailVerified) && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please verify both your mobile number and email address before proceeding to the next step.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ← Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="min-w-[120px]">
          Save & Continue →
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        type={otpType}
        contact={otpType === 'phone' ? data.phone : data.email}
        onResend={handleResendOTP}
        loading={otpLoading}
        error={otpError}
        success={otpSuccess}
      />
    </div>
  );
};
