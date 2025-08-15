import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle, AlertCircle, Phone, CreditCard, MapPin, Shield } from 'lucide-react';
import EnhancedUserApiService from '@/shared/services/users/EnhancedUserApiService';
import { useToast } from '@/shared/hooks/use-toast';

/**
 * Bangladesh Profile Form Component
 * Amazon.com/Shopee.sg-level Bangladesh-specific user profile management
 */
const BangladeshProfileForm = ({ userId, userProfile, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nid_number: '',
    phone: '',
    address: {
      address_line_1: '',
      address_line_2: '',
      district: '',
      upazila: '',
      union_ward: '',
      postal_code: '',
      type: 'home'
    },
    mobile_banking: {
      provider: '',
      account_number: '',
      account_name: ''
    }
  });
  const [verificationStatus, setVerificationStatus] = useState({
    nid: false,
    phone: false,
    address: false
  });
  const { toast } = useToast();

  const bangladeshDistricts = EnhancedUserApiService.getBangladeshDistricts();
  const mobileBankingProviders = EnhancedUserApiService.getMobileBankingProviders();

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nid_number: userProfile.nidNumber || '',
        phone: userProfile.phone || '',
        address: userProfile.address || formData.address,
        mobile_banking: userProfile.mobileBankingAccounts || formData.mobile_banking
      });
      
      setVerificationStatus({
        nid: userProfile.nidVerified || false,
        phone: userProfile.isPhoneVerified || false,
        address: !!userProfile.address
      });
    }
  }, [userProfile]);

  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateNID = async () => {
    if (!formData.nid_number) {
      toast({
        variant: "destructive",
        title: "NID Required",
        description: "Please enter your National ID number"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.validateNID(userId, formData.nid_number);
      
      if (response.success) {
        setVerificationStatus(prev => ({ ...prev, nid: true }));
        toast({
          title: "NID Verified Successfully",
          description: "Your National ID has been verified and updated"
        });
        onUpdate?.();
      } else {
        toast({
          variant: "destructive",
          title: "NID Verification Failed",
          description: response.error || "Failed to verify NID"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "NID verification failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = async () => {
    if (!formData.phone) {
      toast({
        variant: "destructive",
        title: "Phone Required",
        description: "Please enter your Bangladesh mobile number"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.validateBangladeshPhone(userId, formData.phone);
      
      if (response.success) {
        setVerificationStatus(prev => ({ ...prev, phone: true }));
        toast({
          title: "Phone Verified Successfully",
          description: `Phone number verified: ${response.formatted}`
        });
        onUpdate?.();
      } else {
        toast({
          variant: "destructive",
          title: "Phone Verification Failed",
          description: response.error || "Failed to verify phone number"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Phone verification failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const linkMobileBanking = async () => {
    const { provider, account_number, account_name } = formData.mobile_banking;
    
    if (!provider || !account_number || !account_name) {
      toast({
        variant: "destructive",
        title: "Mobile Banking Details Required",
        description: "Please fill in all mobile banking information"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.linkMobileBankingAccount(
        userId, 
        provider, 
        account_number, 
        account_name
      );
      
      if (response.success) {
        toast({
          title: "Mobile Banking Linked",
          description: `${response.provider} account linked successfully`
        });
        onUpdate?.();
      } else {
        toast({
          variant: "destructive",
          title: "Mobile Banking Link Failed",
          description: response.error || "Failed to link mobile banking account"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mobile banking linking failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async () => {
    const { address_line_1, district } = formData.address;
    
    if (!address_line_1 || !district) {
      toast({
        variant: "destructive",
        title: "Address Details Required",
        description: "Please fill in address line 1 and district"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.createBangladeshAddress(userId, formData.address);
      
      if (response.success) {
        setVerificationStatus(prev => ({ ...prev, address: true }));
        toast({
          title: "Address Created Successfully",
          description: "Your Bangladesh address has been added"
        });
        onUpdate?.();
      } else {
        toast({
          variant: "destructive",
          title: "Address Creation Failed",
          description: response.error || "Failed to create address"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Address creation failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (verified, label) => (
    <Badge variant={verified ? "default" : "secondary"} className="ml-2">
      {verified ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3 mr-1" />
          Not Verified
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bangladesh Profile</h2>
          <p className="text-muted-foreground">
            Complete your Bangladesh-specific profile information
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          Enhanced Verification
        </Badge>
      </div>

      {/* NID Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            National ID Verification
            {getVerificationBadge(verificationStatus.nid, "NID")}
          </CardTitle>
          <CardDescription>
            Verify your Bangladesh National ID for enhanced security and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nid">National ID Number</Label>
              <Input
                id="nid"
                placeholder="Enter 10, 13, or 17 digit NID"
                value={formData.nid_number}
                onChange={(e) => handleInputChange('nid_number', e.target.value)}
                disabled={verificationStatus.nid}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={validateNID}
                disabled={loading || verificationStatus.nid}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify NID'}
              </Button>
            </div>
          </div>
          
          {verificationStatus.nid && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your National ID has been successfully verified. This enhances your account security and enables additional features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Bangladesh Phone Verification
            {getVerificationBadge(verificationStatus.phone, "Phone")}
          </CardTitle>
          <CardDescription>
            Verify your Bangladesh mobile number for SMS notifications and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={verificationStatus.phone}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={validatePhone}
                disabled={loading || verificationStatus.phone}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Phone'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Banking Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Mobile Banking Integration
          </CardTitle>
          <CardDescription>
            Link your mobile banking accounts for faster payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={formData.mobile_banking.provider}
                onValueChange={(value) => handleInputChange('provider', value, 'mobile_banking')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {mobileBankingProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: provider.color }}
                        />
                        {provider.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                placeholder="01XXXXXXXXX"
                value={formData.mobile_banking.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value, 'mobile_banking')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                placeholder="Full name as registered"
                value={formData.mobile_banking.account_name}
                onChange={(e) => handleInputChange('account_name', e.target.value, 'mobile_banking')}
              />
            </div>
          </div>
          <Button 
            onClick={linkMobileBanking}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Linking...' : 'Link Mobile Banking Account'}
          </Button>
        </CardContent>
      </Card>

      {/* Bangladesh Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Bangladesh Address
            {getVerificationBadge(verificationStatus.address, "Address")}
          </CardTitle>
          <CardDescription>
            Add your complete Bangladesh address with district and upazila
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_line_1">Address Line 1</Label>
              <Input
                id="address_line_1"
                placeholder="House/building, road"
                value={formData.address.address_line_1}
                onChange={(e) => handleInputChange('address_line_1', e.target.value, 'address')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
              <Input
                id="address_line_2"
                placeholder="Area, sector"
                value={formData.address.address_line_2}
                onChange={(e) => handleInputChange('address_line_2', e.target.value, 'address')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={formData.address.district}
                onValueChange={(value) => handleInputChange('district', value, 'address')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {bangladeshDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upazila">Upazila/Thana</Label>
              <Input
                id="upazila"
                placeholder="Enter upazila"
                value={formData.address.upazila}
                onChange={(e) => handleInputChange('upazila', e.target.value, 'address')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="union_ward">Union/Ward</Label>
              <Input
                id="union_ward"
                placeholder="Enter union or ward"
                value={formData.address.union_ward}
                onChange={(e) => handleInputChange('union_ward', e.target.value, 'address')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="Enter postal code"
                value={formData.address.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value, 'address')}
              />
            </div>
          </div>
          <Button 
            onClick={createAddress}
            disabled={loading || verificationStatus.address}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Save Bangladesh Address'}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Summary</CardTitle>
          <CardDescription>
            Your Bangladesh profile completion status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${verificationStatus.nid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">NID Verification</span>
                {verificationStatus.nid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${verificationStatus.phone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Phone Verification</span>
                {verificationStatus.phone ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${verificationStatus.address ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Address Added</span>
                {verificationStatus.address ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BangladeshProfileForm;